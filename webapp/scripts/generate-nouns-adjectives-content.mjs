import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { format } from "prettier";
import { loadNounsAdjectivesCorpus } from "./nouns-adjectives-content-model.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webappRoot = path.resolve(__dirname, "..");
const defaultSourceDir = path.join(webappRoot, "content-source", "nouns-adjectives");
const defaultOutputDir = path.join(
  webappRoot,
  "public",
  "content",
  "practice",
  "single_choice",
  "nouns-adjectives"
);

const genders = ["masculine", "feminine", "neuter"];
const numbers = ["singular", "plural"];
const articles = {
  masculine: { singular: "ο", plural: "οι" },
  feminine: { singular: "η", plural: "οι" },
  neuter: { singular: "το", plural: "τα" },
};

function formatAnswer(adjective, gender, number) {
  const form = adjective.forms[gender][number];
  const article = articles[gender][number];

  if (adjective.construction === "article-adjective") {
    return `${article} ${form}`;
  }
  if (adjective.construction === "determiner-article") {
    return `${form} ${article}`;
  }

  return form;
}

function getDistractorSlots(correctGender, correctNumber) {
  const otherNumber = correctNumber === "singular" ? "plural" : "singular";

  return [
    ...genders
      .filter((gender) => gender !== correctGender)
      .map((gender) => ({ gender, number: correctNumber })),
    { gender: correctGender, number: otherNumber },
    ...genders
      .filter((gender) => gender !== correctGender)
      .map((gender) => ({ gender, number: otherNumber })),
  ];
}

function buildWrongAnswers(adjective, correctGender, correctNumber, correctAnswer) {
  const wrongAnswers = [];

  for (const slot of getDistractorSlots(correctGender, correctNumber)) {
    const answer = formatAnswer(adjective, slot.gender, slot.number);
    if (answer !== correctAnswer && !wrongAnswers.includes(answer)) {
      wrongAnswers.push(answer);
    }
    if (wrongAnswers.length === 3) {
      return wrongAnswers;
    }
  }

  throw new Error(
    `Adjective "${adjective.id}" does not provide three unique distractors for ${correctGender} ${correctNumber}`
  );
}

function splitIntoBalancedParts(items, targetPartSize = 40) {
  if (items.length === 0) {
    return [];
  }
  if (items.length < 10) {
    throw new Error(`A theme must contain at least 10 questions, received ${items.length}`);
  }

  let partCount = Math.ceil(items.length / targetPartSize);
  while (partCount > 1 && Math.floor(items.length / partCount) < 10) {
    partCount -= 1;
  }

  if (Math.ceil(items.length / partCount) > 70) {
    throw new Error(`Cannot split ${items.length} questions into parts of at most 70`);
  }

  const basePartSize = Math.floor(items.length / partCount);
  const extraItemCount = items.length % partCount;
  const parts = [];
  let offset = 0;

  for (let index = 0; index < partCount; index += 1) {
    const partSize = basePartSize + (index < extraItemCount ? 1 : 0);
    parts.push(items.slice(offset, offset + partSize));
    offset += partSize;
  }

  return parts;
}

export function buildNounsAdjectivesContent(corpus, targetPartSize = 40) {
  const themesById = new Map(corpus.themes.map((theme) => [theme.id, theme]));
  const nounsById = new Map(corpus.nouns.map((noun) => [noun.id, noun]));
  const adjectivesById = new Map(corpus.adjectives.map((adjective) => [adjective.id, adjective]));
  const questionsByThemeId = new Map();

  for (const pairing of corpus.pairings) {
    const noun = nounsById.get(pairing.nounId);
    const adjective = adjectivesById.get(pairing.adjectiveId);
    if (!noun || !adjective) {
      throw new Error(`Pairing "${pairing.id}" has unresolved references`);
    }

    const themeQuestions = questionsByThemeId.get(noun.themeId) ?? [];

    for (const number of numbers) {
      const translation = pairing.translations[number];
      const nounForm = noun.forms[number];
      if (translation === null || nounForm === null) {
        continue;
      }

      const correctAnswer = formatAnswer(adjective, noun.gender, number);
      themeQuestions.push({
        id: `nouns-adjectives-${pairing.id}-${number}`,
        type: "single-choice",
        prompt: nounForm,
        promptLanguage: "el",
        correctAnswer,
        wrongAnswers: buildWrongAnswers(adjective, noun.gender, number, correctAnswer),
        translation,
      });
    }

    questionsByThemeId.set(noun.themeId, themeQuestions);
  }

  const index = [];
  const collections = [];
  const populatedThemes = corpus.themes
    .filter((theme) => questionsByThemeId.has(theme.id))
    .sort((left, right) => left.order - right.order);

  for (const theme of populatedThemes) {
    const questions = questionsByThemeId.get(theme.id) ?? [];
    const parts = splitIntoBalancedParts(questions, targetPartSize);

    parts.forEach((items, partIndex) => {
      const partNumber = partIndex + 1;
      const paddedPartNumber = String(partNumber).padStart(2, "0");
      const id = `nouns-adjectives-${theme.id}-${paddedPartNumber}`;
      const title = `${theme.title} — ${partNumber}`;
      const fileName = `${theme.id}-${paddedPartNumber}.json`;

      index.push({
        id,
        title,
        subtitle: "Выберите правильную форму прилагательного",
        fileName,
      });
      collections.push({
        fileName,
        content: {
          title,
          subtitle: "Согласуйте прилагательное с существительным",
          settings: { showTranslationHint: true },
          items,
        },
      });
    });
  }

  for (const themeId of questionsByThemeId.keys()) {
    if (!themesById.has(themeId)) {
      throw new Error(`Questions reference unknown theme "${themeId}"`);
    }
  }

  return { index, collections };
}

async function writeJson(filePath, content) {
  const formatted = await format(JSON.stringify(content), { parser: "json" });
  await writeFile(filePath, formatted);
}

export async function generateNounsAdjectivesContent({
  sourceDir = defaultSourceDir,
  outputDir = defaultOutputDir,
  targetPartSize = 40,
} = {}) {
  const corpus = await loadNounsAdjectivesCorpus(sourceDir);
  const generated = buildNounsAdjectivesContent(corpus, targetPartSize);
  await mkdir(outputDir, { recursive: true });

  const indexPath = path.join(outputDir, "index.json");
  let previousFileNames = [];
  try {
    const previousIndex = JSON.parse(await readFile(indexPath, "utf8"));
    if (Array.isArray(previousIndex)) {
      previousFileNames = previousIndex
        .map((entry) => entry?.fileName)
        .filter((fileName) => typeof fileName === "string");
    }
  } catch {
    previousFileNames = [];
  }

  await Promise.all(
    generated.collections.map(({ fileName, content }) =>
      writeJson(path.join(outputDir, fileName), content)
    )
  );
  await writeJson(indexPath, generated.index);

  const generatedFileNames = new Set(generated.collections.map(({ fileName }) => fileName));
  await Promise.all(
    previousFileNames
      .filter((fileName) => !generatedFileNames.has(fileName))
      .map((fileName) => rm(path.join(outputDir, fileName), { force: true }))
  );

  return generated;
}

const isMainModule =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
  generateNounsAdjectivesContent()
    .then(({ index, collections }) => {
      const questionCount = collections.reduce(
        (total, collection) => total + collection.content.items.length,
        0
      );
      console.log(`Generated ${questionCount} questions in ${index.length} part(s).`);
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
}

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";
import { fileURLToPath } from "node:url";
import { buildNounsAdjectivesContent } from "./generate-nouns-adjectives-content.mjs";
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

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function addCorpusCoverageErrors(corpus, sourceDir, errors) {
  const nounsById = new Map(corpus.nouns.map((noun) => [noun.id, noun]));
  const nounCoverage = new Set();
  const adjectiveCoverage = new Set();

  for (const pairing of corpus.pairings) {
    const noun = nounsById.get(pairing.nounId);
    if (!noun) {
      continue;
    }

    for (const number of numbers) {
      if (noun.forms[number] !== null && pairing.translations[number] !== null) {
        nounCoverage.add(`${noun.id}:${number}`);
        adjectiveCoverage.add(`${pairing.adjectiveId}:${noun.gender}:${number}`);
      }
    }
  }

  for (const noun of corpus.nouns) {
    for (const number of numbers) {
      if (noun.forms[number] !== null && !nounCoverage.has(`${noun.id}:${number}`)) {
        errors.push({
          filePath: path.join(sourceDir, "nouns.json"),
          message: `noun "${noun.id}" is not covered in ${number}`,
        });
      }
    }
  }

  for (const adjective of corpus.adjectives) {
    for (const gender of genders) {
      for (const number of numbers) {
        if (!adjectiveCoverage.has(`${adjective.id}:${gender}:${number}`)) {
          errors.push({
            filePath: path.join(sourceDir, "adjectives.json"),
            message: `adjective "${adjective.id}" is not covered in ${gender} ${number}`,
          });
        }
      }
    }
  }
}

function addGeneratedQuestionErrors(generated, outputDir, errors) {
  const questionIds = new Set();

  for (const collection of generated.collections) {
    const items = collection.content.items;
    if (items.length < 10 || items.length > 70) {
      errors.push({
        filePath: path.join(outputDir, collection.fileName),
        message: `part must contain 10–70 questions, received ${items.length}`,
      });
    }

    for (const question of items) {
      if (questionIds.has(question.id)) {
        errors.push({
          filePath: path.join(outputDir, collection.fileName),
          message: `duplicate generated question id "${question.id}"`,
        });
      }
      questionIds.add(question.id);

      const options = [question.correctAnswer, ...question.wrongAnswers];
      if (options.length !== 4 || new Set(options).size !== 4) {
        errors.push({
          filePath: path.join(outputDir, collection.fileName),
          message: `question "${question.id}" must have exactly four unique options`,
        });
      }
      if (typeof question.translation !== "string" || question.translation.trim() === "") {
        errors.push({
          filePath: path.join(outputDir, collection.fileName),
          message: `question "${question.id}" must translate the complete phrase`,
        });
      }
      if ("explanation" in question) {
        errors.push({
          filePath: path.join(outputDir, collection.fileName),
          message: `question "${question.id}" must not contain an explanation`,
        });
      }
    }
  }
}

async function addGeneratedFileErrors(generated, outputDir, errors) {
  const indexPath = path.join(outputDir, "index.json");

  try {
    const actualIndex = await readJson(indexPath);
    if (!isDeepStrictEqual(actualIndex, generated.index)) {
      errors.push({
        filePath: indexPath,
        message: "generated index is outdated; run npm run generate:nouns-adjectives",
      });
    }
  } catch (error) {
    errors.push({
      filePath: indexPath,
      message: error instanceof Error ? error.message : "Unable to read generated index",
    });
  }

  for (const collection of generated.collections) {
    const filePath = path.join(outputDir, collection.fileName);
    try {
      const actualContent = await readJson(filePath);
      if (!isDeepStrictEqual(actualContent, collection.content)) {
        errors.push({
          filePath,
          message: "generated content is outdated; run npm run generate:nouns-adjectives",
        });
      }
    } catch (error) {
      errors.push({
        filePath,
        message: error instanceof Error ? error.message : "Unable to read generated content",
      });
    }
  }

  try {
    const expectedFileNames = new Set([
      "index.json",
      ...generated.collections.map((collection) => collection.fileName),
    ]);
    const actualJsonFileNames = (await readdir(outputDir)).filter((fileName) =>
      fileName.endsWith(".json")
    );

    for (const fileName of actualJsonFileNames) {
      if (!expectedFileNames.has(fileName)) {
        errors.push({
          filePath: path.join(outputDir, fileName),
          message: "stale generated file is not referenced by the corpus",
        });
      }
    }
  } catch (error) {
    errors.push({
      filePath: outputDir,
      message: error instanceof Error ? error.message : "Unable to inspect generated directory",
    });
  }
}

export async function validateNounsAdjectivesCoverage({
  sourceDir = defaultSourceDir,
  outputDir = defaultOutputDir,
  targetPartSize = 40,
} = {}) {
  const errors = [];
  let corpus;
  let generated;

  try {
    corpus = await loadNounsAdjectivesCorpus(sourceDir);
    generated = buildNounsAdjectivesContent(corpus, targetPartSize);
  } catch (error) {
    return [
      {
        filePath: sourceDir,
        message: error instanceof Error ? error.message : "Unable to build corpus",
      },
    ];
  }

  addCorpusCoverageErrors(corpus, sourceDir, errors);
  addGeneratedQuestionErrors(generated, outputDir, errors);
  await addGeneratedFileErrors(generated, outputDir, errors);

  return errors;
}

const isMainModule =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
  validateNounsAdjectivesCoverage()
    .then((errors) => {
      if (errors.length === 0) {
        console.log("Nouns and adjectives coverage validation passed.");
        return;
      }

      console.error(
        `Nouns and adjectives coverage validation failed with ${errors.length} error(s):`
      );
      for (const error of errors) {
        console.error(`- ${path.relative(webappRoot, error.filePath)}: ${error.message}`);
      }
      process.exitCode = 1;
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
}

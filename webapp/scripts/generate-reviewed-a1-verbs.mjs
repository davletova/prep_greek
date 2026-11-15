import { readFile, readdir, writeFile, unlink } from "node:fs/promises";
import { format, resolveConfig } from "prettier";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "content-source/verbs");
const output = resolve(root, "public/content/practice/single_choice/verbs-a1");
const subjects = ["Εγώ", "Εσύ", "Αυτή", "Εμείς", "Εσείς", "Αυτοί"];
const russianSubjects = ["Я", "Ты", "Она", "Мы", "Вы", "Они"];
const words = new Map();
// The archived exercises remain unchanged; use their reviewed word glosses.
for (const file of await readdir(resolve(source, "practice"))) {
  if (file === "index.json") continue;
  const collection = JSON.parse(await readFile(resolve(source, "practice", file), "utf8"));
  for (const item of collection.items) {
    for (const match of (item.hint ?? "").matchAll(/^- \*\*([^*]+)\*\* — (.+)\.$/gmu)) {
      if (!words.has(match[1])) words.set(match[1], match[2]);
    }
  }
}
const overrides = JSON.parse(await readFile(resolve(source, "a1-reviewed-glosses.json"), "utf8"));
for (const [word, gloss] of Object.entries(overrides)) words.set(word, gloss);
subjects.forEach((word, index) => words.set(word, `«${russianSubjects[index].toLowerCase()}»`));

const topics = [];
let current;
const unknown = new Set();
const usedContexts = new Set();
const lines = (await readFile(resolve(source, "a1-reviewed.txt"), "utf8")).split(/\r?\n/u);
for (const line of lines) {
  if (!line || line.startsWith("#")) continue;
  if (line.startsWith("@")) {
    const [id, title] = line.slice(1).split("|");
    current = { id, title, verbs: [] };
    topics.push(current);
    continue;
  }
  const [greek, russian, contexts] = line.split("|");
  const forms = greek.split(" ");
  const translations = russian.split("/");
  if (forms.length !== translations.length || ![2, 6].includes(forms.length)) {
    throw new Error(`Invalid paradigm: ${greek}`);
  }
  const individualContexts = contexts.split(";").map((value) => value.split("~"));
  if (individualContexts.length !== forms.length) {
    throw new Error(`Provide one individual context per form: ${greek}`);
  }
  for (const context of individualContexts) {
    if (context.length !== 2 || context.some((value) => !value.trim())) {
      throw new Error(`Invalid context for ${greek}`);
    }
    const normalized = context[0].trim().toLocaleLowerCase("el").replace(/\s+/gu, " ");
    if (usedContexts.has(normalized)) throw new Error(`Repeated lexical context: ${context[0]}`);
    usedContexts.add(normalized);
  }
  current.verbs.push({ forms, translations, contexts: individualContexts });
}
const distractorLemmas = JSON.parse(
  await readFile(resolve(source, "a1-distractor-verbs.json"), "utf8")
);
const verbsByLemma = new Map(
  topics.flatMap((topic) => topic.verbs.map((verb) => [verb.forms[0], verb]))
);
const index = [];
const collections = [];
for (const topic of topics) {
  const items = [];
  for (const [verbIndex, verb] of topic.verbs.entries()) {
    const { forms, translations, contexts } = verb;
    forms.forEach((correctAnswer, person) => {
      const [complement, russianComplement] = contexts[person];
      const special = forms.length === 2;
      const prompt = special ? complement : `${subjects[person]} _______ ${complement}`;
      let translation = special
        ? russianComplement
        : `${russianSubjects[person]} ${translations[person]} ${russianComplement}`;
      if (forms[0] === "έχω") {
        translation = `${["У меня", "У тебя", "У неё", "У нас", "У вас", "У них"][person]} есть ${russianComplement}`;
      }
      if (forms[0] === "λείπω") {
        translation = `${["Меня", "Тебя", "Её", "Нас", "Вас", "Их"][person]} нет ${russianComplement}`;
      }
      const contrast = distractorLemmas[forms[0]];
      if (!contrast?.context?.trim()) throw new Error(`Missing semantic context for ${forms[0]}`);
      const distractor = verbsByLemma.get(contrast.verb);
      if (!distractor || distractor === verb || distractor.forms.length !== 6) {
        throw new Error(`Invalid distractor verb for ${forms[0]}`);
      }
      // Two lemmas × the same two persons/numbers. Special constructions use
      // only third-person singular/plural, never artificial first-person forms.
      const distractorPerson = special ? [2, 5][person] : person;
      const otherPerson = special
        ? 1 - person
        : Array.from({ length: 5 }, (_, offset) => (person + offset + 1) % 6).find(
            (candidate) =>
              forms[candidate] !== correctAnswer &&
              distractor.forms[candidate] !== distractor.forms[person]
          );
      if (otherPerson === undefined) throw new Error(`No distinct form for ${forms[0]}`);
      const otherDistractorPerson = special ? [2, 5][otherPerson] : otherPerson;
      const wrongAnswers = [
        forms[otherPerson],
        distractor.forms[distractorPerson],
        distractor.forms[otherDistractorPerson],
      ];
      const answerGlosses = new Map([
        [correctAnswer, translations[person]],
        [forms[otherPerson], translations[otherPerson]],
        [distractor.forms[distractorPerson], distractor.translations[distractorPerson]],
        [distractor.forms[otherDistractorPerson], distractor.translations[otherDistractorPerson]],
      ]);
      if (answerGlosses.size !== 4) throw new Error(`Overlapping answers for ${forms[0]}`);
      const gloss = (form) => answerGlosses.get(form);
      const sentence = prompt.replace("_______", correctAnswer);
      const wordLines = sentence.split(" ").map((word) => {
        let meaning = word === correctAnswer ? `«${gloss(word)}»` : words.get(word);
        if (!meaning) {
          unknown.add(word);
          meaning = "MISSING";
        }
        return `- **${word}** — ${meaning}.`;
      });
      const hint = `**${sentence}** — «${translation}».\n\n**Перевод каждого слова:**\n${wordLines.join("\n")}\n\n**Глаголы в неверных ответах:**\n${wrongAnswers.map((form) => `- **${form}** — «${gloss(form)}».`).join("\n")}`;
      items.push({
        id: `a1-reviewed-${topic.id}-${String(verbIndex + 1).padStart(2, "0")}-${person + 1}`,
        type: "single-choice",
        prompt,
        translation,
        speechTarget: "correctAnswer",
        hint,
        correctAnswer,
        wrongAnswers,
      });
    });
  }
  index.push({
    id: `verbs-a1-${topic.id}`,
    title: topic.title,
    subtitle: "Выберите правильную форму глагола",
    fileName: `${topic.id}.json`,
  });
  collections.push({
    file: `${topic.id}.json`,
    value: {
      title: topic.title,
      subtitle: "Выберите правильную форму глагола",
      items,
      settings: { showTranslationHint: true },
    },
  });
}
if (unknown.size) throw new Error(`Missing word glosses: ${[...unknown].sort().join(", ")}`);
for (const file of await readdir(output)) {
  if (
    file.endsWith(".json") &&
    file !== "index.json" &&
    !collections.some((entry) => entry.file === file)
  )
    await unlink(resolve(output, file));
}
const formatting = await resolveConfig(resolve(root, "package.json"));
for (const { file, value } of [...collections, { file: "index.json", value: index }]) {
  await writeFile(
    resolve(output, file),
    await format(JSON.stringify(value), { ...formatting, parser: "json" })
  );
}
console.log(
  `Generated ${collections.reduce((sum, entry) => sum + entry.value.items.length, 0)} questions in ${topics.length} A1 topics.`
);

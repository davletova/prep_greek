import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { exerciseCollectionSchema } from "./exercises.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const themes = [
  "food-shopping",
  "communication-information",
  "study-work",
  "thinking-decisions",
  "feelings-relationships",
  "health-rest-activity",
  "nature-environment",
  "misc",
];
const persons = [
  "1-е лицо, ед. число",
  "2-е лицо, ед. число",
  "3-е лицо, ед. число",
  "1-е лицо, мн. число",
  "2-е лицо, мн. число",
  "3-е лицо, мн. число",
];
const greekSubjects = ["Εγώ", "Εσύ", "Η Μαρία", "Εμείς", "Εσείς", "Οι άνθρωποι"];

type Attested = { lemma: string; person: number; form: string };

async function sourceForms() {
  const lines = (await readFile(resolve(root, "content-source/verbs/a1-a2-verbs.tmp.txt"), "utf8"))
    .trim()
    .split(/\r?\n/u);
  const forms = new Map<string, Attested[]>();
  for (let i = 0; i < lines.length; ) {
    const lemma = lines[i];
    if (!lemma) throw new Error(`Missing lemma at line ${i}`);
    const count = ["πρέπει", "χιονίζει"].includes(lemma) ? 1 : 6;
    for (let person = 0; person < count; person++) {
      const form = lines[i + person];
      if (!form) throw new Error(`Missing form for ${lemma}`);
      const attested = forms.get(form) ?? [];
      attested.push({ lemma, person, form });
      forms.set(form, attested);
    }
    i += count;
  }
  return forms;
}

describe("remaining verb practice topics", () => {
  it("covers each source line with translated, non-clueing choices", async () => {
    const forms = await sourceForms();
    let total = 0;
    for (const theme of themes) {
      const source = (
        await readFile(resolve(root, `content-source/verbs/${theme}.tmp.txt`), "utf8")
      )
        .trim()
        .split(/\r?\n/u);
      const content: unknown = JSON.parse(
        await readFile(
          resolve(root, `public/content/practice/single_choice/verbs/${theme}.json`),
          "utf8"
        )
      );
      const collection = exerciseCollectionSchema.parse(content);
      expect(collection.items).toHaveLength(source.length);
      total += collection.items.length;
      // This removed exercise remains only as an intentionally incorrect distractor.
      const predicates = new Set<string>(
        theme === "nature-environment" ? ["διαρκώ περισσότερο από τους άλλους"] : []
      );
      const exercises = [];
      for (const [index, item] of collection.items.entries()) {
        if (item.type !== "single-choice") throw new Error(`Wrong type: ${item.id}`);
        const [form, label] = source[index]?.split(" — ") ?? [];
        if (!form) throw new Error(`Missing source row ${index}`);
        const person = persons.indexOf(label ?? "");
        const matching =
          forms.get(form)?.filter((entry) => entry.person === (person < 0 ? 0 : person)) ?? [];
        expect(matching).toHaveLength(1);
        const lemma = matching[0]?.lemma;
        if (!lemma) throw new Error(`Missing lemma for ${item.id}`);
        const subject =
          lemma === "χιονίζει"
            ? "Σήμερα"
            : lemma === "πρέπει"
              ? "Εμείς"
              : lemma === "γεννάω" && person === 5
                ? "Οι γυναίκες"
                : greekSubjects[person];
        if (!subject) throw new Error(`Missing subject: ${item.id}`);
        expect(item.correctAnswer).toContain(`${subject} `);
        expect(item.correctAnswer.split(" ")).toContain(form);
        expect(item.speechTarget).toBe("correctAnswer");
        const predicate = item.correctAnswer.slice(subject.length + 1);
        predicates.add(predicate);
        exercises.push({ item, person, lemma, subject, predicate });
      }
      for (const { item, person, lemma, subject } of exercises) {
        expect(item.wrongAnswers).toHaveLength(3);
        expect(new Set([item.correctAnswer, ...item.wrongAnswers]).size).toBe(4);
        const lemmas = new Set([lemma]);
        const usedPersons = new Set(person < 0 ? [] : [person]);
        const verbSection = item.hint
          ?.split("**Глаголы в неверных ответах:**\n")[1]
          ?.split("\n\n")[0];
        const verbLines = verbSection?.split("\n") ?? [];
        expect(verbLines).toHaveLength(3);
        for (const [index, wrong] of item.wrongAnswers.entries()) {
          expect(wrong.startsWith(`${subject} `)).toBe(true);
          const predicate = wrong.slice(subject.length + 1);
          expect(predicates.has(predicate)).toBe(true);
          const words = predicate.split(" ");
          const form = words[0] === "τα" ? words[1] : words[0];
          if (!form) throw new Error(`No wrong verb in ${item.id}`);
          const candidates = forms.get(form) ?? [];
          expect(candidates).not.toHaveLength(0);
          const candidate = candidates[0];
          if (!candidate) throw new Error(`Unknown verb in ${item.id}`);
          expect(lemmas.has(candidate.lemma)).toBe(false);
          expect(usedPersons.has(candidate.person)).toBe(false);
          expect(verbLines[index]).toMatch(new RegExp(`^- \\*\\*${form}\\*\\* — «[^»]+»\\.$`, "u"));
          lemmas.add(candidate.lemma);
          usedPersons.add(candidate.person);
        }
        expect(lemmas.size).toBe(4);
        if (person >= 0) expect(usedPersons.size).toBe(4);
        expect(item.hint).not.toContain("отдельно не переводится");
        expect(item.hint).not.toContain("Во всех вариантах подлежащее одинаковое");
        expect(item.hint).not.toMatch(/[123]-е лицо/u);
        const wordSection = item.hint?.split("**Перевод каждого слова:**\n")[1]?.split("\n\n")[0];
        const wordLines = wordSection?.split("\n") ?? [];
        const greekWords = item.correctAnswer.split(" ");
        expect(wordLines).toHaveLength(greekWords.length);
        for (const [index, word] of greekWords.entries()) {
          expect(wordLines[index]).toMatch(new RegExp(`^- \\*\\*${word}\\*\\* — .+\\.$`, "u"));
        }
      }
    }
    expect(total).toBe(1196);
  });
});

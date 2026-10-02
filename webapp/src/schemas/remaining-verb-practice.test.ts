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
        await readFile(resolve(root, `content-source/verbs/practice/${theme}.json`), "utf8")
      );
      const collection = exerciseCollectionSchema.parse(content);
      expect(collection.items).toHaveLength(source.length);
      total += collection.items.length;
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
        expect(item.translation ? item.prompt : item.correctAnswer).toContain(`${subject} `);
        expect(item.correctAnswer.split(" ")).toContain(form);
        expect(item.speechTarget).toBe("correctAnswer");
        exercises.push({
          item,
          person,
          lemma,
          subject,
          verbIndex: item.correctAnswer.split(" ").indexOf(form),
        });
      }
      for (const { item, person, lemma, subject, verbIndex } of exercises) {
        expect(item.wrongAnswers).toHaveLength(3);
        expect(new Set([item.correctAnswer, ...item.wrongAnswers]).size).toBe(4);
        const correctWords = item.correctAnswer.split(" ");
        const lemmaCounts = new Map<string, number>();
        const verbSection = item.hint
          ?.split("**Глаголы в неверных ответах:**\n")[1]
          ?.split("\n\n")[0];
        const verbLines = verbSection?.split("\n") ?? [];
        expect(verbLines).toHaveLength(3);
        for (const [index, wrong] of item.wrongAnswers.entries()) {
          if (!item.translation) expect(wrong.startsWith(`${subject} `)).toBe(true);
          const words = wrong.split(" ");
          expect(words).toHaveLength(correctWords.length);
          expect(
            words.flatMap((word, position) => (word !== correctWords[position] ? [position] : []))
          ).toEqual([verbIndex]);
          const form = words[verbIndex];
          if (!form) throw new Error(`No wrong verb in ${item.id}`);
          const candidates = forms.get(form) ?? [];
          expect(candidates).not.toHaveLength(0);
          const candidate = candidates[0];
          if (!candidate) throw new Error(`Unknown verb in ${item.id}`);
          if (candidate.lemma === lemma) {
            expect(candidates.some((entry) => entry.person === person)).toBe(false);
          }
          const count = (lemmaCounts.get(candidate.lemma) ?? 0) + 1;
          lemmaCounts.set(candidate.lemma, count);
          // At most two forms of an alternative verb; all three may instead
          // test agreement of the original verb in hard-to-replace expressions.
          if (candidate.lemma !== lemma) expect(count).toBeLessThanOrEqual(2);
          expect(verbLines[index]).toMatch(new RegExp(`^- \\*\\*${form}\\*\\* — «[^»]+»\\.$`, "u"));
        }
        expect(item.hint).not.toContain("отдельно не переводится");
        expect(item.hint).not.toContain("Во всех вариантах подлежащее одинаковое");
        expect(item.hint).not.toMatch(/[123]-е лицо/u);
        const wordSection = item.hint?.split("**Перевод каждого слова:**\n")[1]?.split("\n\n")[0];
        const wordLines = wordSection?.split("\n") ?? [];
        const greekWords = (
          item.translation ? item.prompt.replace("_______", item.correctAnswer) : item.correctAnswer
        ).split(" ");
        expect(wordLines).toHaveLength(greekWords.length);
        for (const [index, word] of greekWords.entries()) {
          expect(wordLines[index]).toMatch(new RegExp(`^- \\*\\*${word}\\*\\* — .+\\.$`, "u"));
        }
      }
    }
    expect(total).toBe(1196);
  });
});

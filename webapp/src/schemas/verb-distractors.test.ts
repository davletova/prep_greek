import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { exerciseCollectionSchema } from "./exercises.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const topics = ["changes-actions-with-objects", "movement-travel", "home-daily-life"];
const persons = [
  "1-е лицо, ед. число",
  "2-е лицо, ед. число",
  "3-е лицо, ед. число",
  "1-е лицо, мн. число",
  "2-е лицо, мн. число",
  "3-е лицо, мн. число",
];

async function paradigms(): Promise<Map<string, string[]>> {
  const forms = (await readFile(resolve(root, "content-source/verbs/a1-a2-verbs.tmp.txt"), "utf8"))
    .trim()
    .split(/\r?\n/u);
  const result = new Map<string, string[]>();
  for (let i = 0; i < forms.length; ) {
    const lemma = forms[i];
    if (!lemma) throw new Error(`Missing lemma at line ${i}`);
    const size = lemma === "πρέπει" || lemma === "χιονίζει" ? 1 : 6;
    if (size === 6) result.set(lemma, forms.slice(i, i + size));
    i += size;
  }
  return result;
}

describe("verb exercise distractors", () => {
  it("uses one subject with four different verbs and persons in every exercise", async () => {
    const conjugations = await paradigms();
    const exercises = [];
    const attested = new Map<string, Array<{ lemma: string; person: number; prompt: string }>>();

    for (const topic of topics) {
      const source = (
        await readFile(resolve(root, `content-source/verbs/${topic}.tmp.txt`), "utf8")
      )
        .trim()
        .split(/\r?\n/u);
      const content: unknown = JSON.parse(
        await readFile(
          resolve(root, `public/content/practice/single_choice/verbs/${topic}.json`),
          "utf8"
        )
      );
      const collection = exerciseCollectionSchema.parse(content);
      expect(collection.items).toHaveLength(source.length);

      for (const [index, item] of collection.items.entries()) {
        if (item.type !== "single-choice") throw new Error(`Unexpected type at ${index}`);
        const row = source[index];
        if (!row) throw new Error(`Missing source at line ${index}`);
        const [form, personLabel] = row.split(" — ");
        const person = persons.indexOf(personLabel ?? "");
        const lemma = item.hint?.match(/форма глагола \*\*(.*?)\*\*/u)?.[1];
        if (!form || !lemma || person < 0) throw new Error(`Invalid source or hint: ${item.id}`);
        expect(conjugations.get(lemma)?.[person]).toBe(form);
        expect(item.correctAnswer.split(" ")).toContain(form);
        const answer = item.correctAnswer.split(" ");
        const verbIndex = answer.indexOf(form);
        expect(verbIndex).toBeGreaterThan(0);
        const predicate = answer.slice(verbIndex).join(" ");
        const group = attested.get(predicate) ?? [];
        group.push({ lemma, person, prompt: item.prompt });
        attested.set(predicate, group);
        exercises.push({ item, lemma, person, subject: answer.slice(0, verbIndex) });
      }
    }

    for (const { item, lemma, person, subject } of exercises) {
      expect(item.wrongAnswers).toHaveLength(3);
      const answers = [item.correctAnswer, ...item.wrongAnswers];
      expect(new Set(answers).size).toBe(4);
      const lemmas = [lemma];
      const people = [person];
      for (const wrong of item.wrongAnswers) {
        const words = wrong.split(" ");
        expect(words.slice(0, subject.length)).toEqual(subject);
        const predicate = words.slice(subject.length).join(" ");
        // The predicate comes from a real Greek example in a different person;
        // only its subject is replaced to make agreement incorrect.
        const candidates = attested.get(predicate) ?? [];
        expect(candidates).toHaveLength(1);
        const candidate = candidates[0];
        if (!candidate) throw new Error(`Unattested predicate: ${predicate}`);
        expect(words[subject.length]).toBe(conjugations.get(candidate.lemma)?.[candidate.person]);
        expect(candidate.person).not.toBe(person);
        expect(candidate.prompt).not.toBe(item.prompt);
        lemmas.push(candidate.lemma);
        people.push(candidate.person);
      }
      expect(new Set(lemmas).size).toBe(4);
      expect(new Set(people).size).toBe(4);
      expect(item.hint).toContain("не согласуются с этим подлежащим");
    }
    expect(exercises).toHaveLength(569);
  });
});

import { readFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { exerciseCollectionSchema } from "./exercises.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const contentDir = resolve(root, "public/content/practice/single_choice/verbs-a1");

describe("reviewed A1 verbs", () => {
  it("covers exactly the requested 79 verbs in six ordered themes", async () => {
    const lines = (await readFile(resolve(root, "content-source/verbs/a1-reviewed.txt"), "utf8"))
      .split(/\r?\n/u)
      .filter((line) => line && !line.startsWith("#"));
    const topics: { id: string; title: string; forms: string[][] }[] = [];
    for (const line of lines) {
      if (line.startsWith("@")) {
        const [id, title] = line.slice(1).split("|");
        topics.push({ id: id!, title: title!, forms: [] });
      } else {
        topics[topics.length - 1]!.forms.push(line.split("|")[0]!.split(" "));
      }
    }
    expect(topics.map((topic) => topic.forms.length)).toEqual([11, 16, 13, 13, 16, 10]);
    const index = JSON.parse(await readFile(resolve(contentDir, "index.json"), "utf8"));
    expect(index.map((topic: { title: string }) => topic.title)).toEqual(
      topics.map((topic) => topic.title)
    );
    expect((await readdir(contentDir)).sort()).toEqual(
      ["index.json", ...topics.map((topic) => `${topic.id}.json`)].sort()
    );
    const distractorLemmas: Record<string, string> = JSON.parse(
      await readFile(resolve(root, "content-source/verbs/a1-distractor-verbs.json"), "utf8")
    );
    const paradigms = new Map(
      topics.flatMap((topic) => topic.forms.map((forms) => [forms[0]!, forms] as const))
    );
    expect(Object.keys(distractorLemmas).sort()).toEqual([...paradigms.keys()].sort());
    const ids = new Set<string>();
    for (const topic of topics) {
      const collection = exerciseCollectionSchema.parse(
        JSON.parse(await readFile(resolve(contentDir, `${topic.id}.json`), "utf8"))
      );
      expect(collection.settings?.showTranslationHint).toBe(true);
      expect(
        collection.items.map((item) => {
          if (item.type !== "single-choice") throw new Error(item.id);
          return item.correctAnswer;
        })
      ).toEqual(topic.forms.flat());
      for (const item of collection.items) {
        if (item.type !== "single-choice") throw new Error(item.id);
        expect(ids.has(item.id)).toBe(false);
        ids.add(item.id);
        expect(item.prompt.split("_______")).toHaveLength(2);
        expect(item.speechTarget).toBe("correctAnswer");
        expect(item.translation).toBeTruthy();
        expect(item.wrongAnswers).toHaveLength(3);
        expect(new Set([item.correctAnswer, ...item.wrongAnswers]).size).toBe(4);
        const identity = /-(\d+)-(\d+)$/u.exec(item.id)!;
        const target = topic.forms[Number(identity[1]) - 1]!;
        const person = Number(identity[2]) - 1;
        const distractor = paradigms.get(distractorLemmas[target[0]!]!)!;
        expect(distractor).toBeDefined();
        expect(distractor).not.toEqual(target);
        // Each lemma occurs exactly twice, in matching grammatical forms.
        const answers = [item.correctAnswer, ...item.wrongAnswers];
        const targetAnswers = answers.filter((answer) => target.includes(answer));
        const distractorAnswers = answers.filter((answer) => distractor.includes(answer));
        expect(targetAnswers, item.id).toHaveLength(2);
        expect(distractorAnswers, item.id).toHaveLength(2);
        const otherForm = targetAnswers.find((answer) => answer !== item.correctAnswer)!;
        const actualPerson = target.length === 2 ? [2, 5][person]! : person;
        const matchingOtherPersons = target.flatMap((form, position) =>
          form === otherForm ? [target.length === 2 ? [2, 5][position]! : position] : []
        );
        expect(distractorAnswers, item.id).toContain(distractor[actualPerson]);
        expect(
          matchingOtherPersons.some((position) =>
            distractorAnswers.includes(distractor[position]!)
          ),
          item.id
        ).toBe(true);
        const sentence = item.prompt.replace("_______", item.correctAnswer);
        expect(item.hint?.startsWith(`**${sentence}** — «${item.translation}».`)).toBe(true);
        const wordHints = item.hint
          ?.split("**Перевод каждого слова:**\n")[1]
          ?.split("\n\n")[0]
          ?.split("\n");
        expect(wordHints).toHaveLength(sentence.split(" ").length);
        sentence.split(" ").forEach((word, position) => {
          expect(wordHints?.[position]?.startsWith(`- **${word}** — `)).toBe(true);
        });
        expect(item.hint).not.toContain("MISSING");
        item.wrongAnswers.forEach((answer) => {
          expect(item.hint).toContain(`- **${answer}** — `);
        });
      }
    }
    expect(ids.size).toBe(466);
  });
});

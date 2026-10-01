import { readFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { exerciseCollectionSchema } from "./exercises.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const source = resolve(root, "content-source/verbs");
const content = resolve(root, "public/content/practice/single_choice");
type Topic = { id: string; title: string; fileName: string; indexFileName?: string };
const json = async (path: string): Promise<unknown> => JSON.parse(await readFile(path, "utf8"));
const persons = [
  "1-е лицо, ед. число",
  "2-е лицо, ед. число",
  "3-е лицо, ед. число",
  "1-е лицо, мн. число",
  "2-е лицо, мн. число",
  "3-е лицо, мн. число",
];

describe("verb levels", () => {
  it("replaces the old group with two navigable groups and partitions all items without edits", async () => {
    const levels = (await json(resolve(source, "levels.json"))) as Record<string, string>;
    const master = (await readFile(resolve(source, "a1-a2-verbs.tmp.txt"), "utf8"))
      .trim()
      .split(/\r?\n/u);
    const forms = new Map<string, string>();
    const lemmas = [];
    for (let index = 0; index < master.length; ) {
      const lemma = master[index];
      if (!lemma) throw new Error("Missing lemma");
      lemmas.push(lemma);
      expect(["A1", "A2"]).toContain(levels[lemma]);
      const count = ["πρέπει", "χιονίζει"].includes(lemma) ? 1 : 6;
      master
        .slice(index, index + count)
        .forEach((form, person) => forms.set(`${person}|${form}`, lemma));
      index += count;
    }
    expect(Object.keys(levels).sort()).toEqual(lemmas.sort());
    expect(levels["παραγγέλλω"]).toBe(levels["παραγγέλνω"]);
    const topics = (await json(resolve(source, "practice/index.json"))) as Topic[];
    const expected = new Map();
    for (const topic of topics) {
      const collection = exerciseCollectionSchema.parse(
        await json(resolve(source, "practice", topic.fileName))
      );
      const rows = (
        await readFile(resolve(source, topic.fileName.replace(".json", ".tmp.txt")), "utf8")
      )
        .trim()
        .split(/\r?\n/u);
      expect(collection.items).toHaveLength(rows.length);
      collection.items.forEach((item, index) => {
        const [form, label] = rows[index]?.split(" — ") ?? [];
        const person = label === "безличная форма" ? 0 : persons.indexOf(label ?? "");
        const lemma = forms.get(`${person}|${form}`);
        if (!lemma || item.type !== "single-choice") throw new Error(`Invalid source: ${item.id}`);
        expect(item.correctAnswer.split(" ")).toContain(form);
        expect(expected.has(item.id)).toBe(false);
        expected.set(item.id, { item, level: levels[lemma], file: topic.fileName });
      });
    }
    const rootIndex = (await json(resolve(content, "index.json"))) as Topic[];
    expect(rootIndex.some((entry) => entry.id === "verbs")).toBe(false);
    const seen = new Set();
    const topicIds = new Set();
    for (const level of ["A1", "A2"]) {
      const group = rootIndex.find((entry) => entry.id === `verbs-${level.toLowerCase()}`);
      expect(group?.title).toBe(`Глаголы ${level}`);
      if (!group?.indexFileName) throw new Error(`Missing group: ${level}`);
      const indexPath = resolve(content, group.indexFileName);
      const index = (await json(indexPath)) as Topic[];
      expect(index.length).toBeGreaterThan(0);
      // No stale, unreachable topic files in either level directory.
      expect((await readdir(dirname(indexPath))).sort()).toEqual(
        ["index.json", ...index.map((topic) => topic.fileName)].sort()
      );
      for (const topic of index) {
        expect(topicIds.has(topic.id)).toBe(false);
        topicIds.add(topic.id);
        const collection = exerciseCollectionSchema.parse(
          await json(resolve(dirname(indexPath), topic.fileName))
        );
        expect(collection.items.length).toBeGreaterThan(0);
        for (const item of collection.items) {
          expect(seen.has(item.id)).toBe(false);
          seen.add(item.id);
          expect(expected.get(item.id)).toEqual({ item, level, file: topic.fileName });
        }
      }
    }
    expect(seen.size).toBe(1764);
    expect([...seen].sort()).toEqual([...expected.keys()].sort());
  });
});

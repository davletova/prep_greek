import { readFile, readdir, mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { dirname, resolve, relative } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  buildNounsAdjectivesLevels,
  getNounAdjectiveComponents,
  getNounAdjectiveLevel,
  splitNounsAdjectivesLevels,
} from "../../scripts/split-nouns-adjectives-levels.mjs";
import { exerciseCollectionSchema } from "./exercises.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const sourceDir = resolve(root, "content-source/nouns-adjectives");
const contentDir = resolve(root, "public/content/practice/single_choice");
const json = async (file: string): Promise<unknown> => JSON.parse(await readFile(file, "utf8"));

async function files(directory: string): Promise<string[]> {
  const result: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = resolve(directory, entry.name);
    if (entry.isDirectory()) result.push(...(await files(file)));
    else if (entry.name.endsWith(".json")) result.push(file);
  }
  return result;
}

describe("noun/adjective level partition", () => {
  it.each([
    ["ο καλός φίλος", "καλός", "φίλος"],
    ["οι καλές φίλες", "καλές", "φίλες"],
    ["κάποιο παιδί", "κάποιο", "παιδί"],
    ["αυτές οι φίλες", "αυτές", "φίλες"],
    ["το καινούριο κινητό τηλέφωνο", "καινούριο", "κινητό τηλέφωνο"],
    ["το δικό μου σπίτι", "δικό μου", "σπίτι"],
    ["η μαθήτρια η οποία διαβάζει", "οποία", "μαθήτρια"],
    ["τα παιδιά τα οποία διαβάζουν", "οποία", "παιδιά"],
    ["όποιος φίλος θέλει", "όποιος", "φίλος"],
    ["καθεμία από τις μαθήτριες", "καθεμία", "μαθήτριες"],
    ["το μετρό", null, "μετρό"],
    ["τα ισλανδικά", null, "ισλανδικά"],
  ])("extracts reviewed components of %s", (answer, adjective, noun) => {
    expect(getNounAdjectiveComponents(answer as string)).toEqual({ adjective, noun });
  });

  it.each([
    ["A1", "A1", "A1"],
    ["A1", "A2", "A2"],
    ["A2", "A1", "A2"],
    ["A2", "A2", "A2"],
  ])("combines noun %s and adjective %s into %s", (noun, adjective, level) => {
    expect(
      getNounAdjectiveLevel("ο καλός φίλος", {
        nouns: { φίλος: noun },
        adjectives: { καλός: adjective },
      })
    ).toBe(level);
  });

  it("does not silently assign unreviewed vocabulary to A2", () => {
    expect(() => getNounAdjectiveLevel("ο καλός φίλος", { nouns: {}, adjectives: {} })).toThrow(
      "Unclassified phrase"
    );
  });

  it("preserves all 2894 items and themes without duplicating or editing exercises", async () => {
    const generated = await buildNounsAdjectivesLevels();
    const levels = (await json(resolve(sourceDir, "practice-levels.json"))) as {
      nouns: Record<string, string>;
      adjectives: Record<string, string>;
    };
    const sourceItems = new Map();
    const sourceTopics = new Map<string, Record<string, unknown>>();
    for (const file of await files(resolve(sourceDir, "practice"))) {
      const data = await json(file);
      if (Array.isArray(data)) {
        for (const topic of data) sourceTopics.set(topic.id, topic);
        continue;
      }
      for (const item of exerciseCollectionSchema.parse(data).items) {
        expect(sourceItems.has(item.id)).toBe(false);
        sourceItems.set(item.id, item);
      }
    }
    const menu = (await json(resolve(contentDir, "index.json"))) as Array<{
      id: string;
      title: string;
      indexFileName: string;
    }>;
    expect(menu.some((entry) => entry.id === "nouns-adjectives")).toBe(false);
    expect((await readdir(contentDir)).includes("adjectives-nouns")).toBe(false);
    const seen = new Set();
    const topicIds = new Set();
    const totals = { A1: 0, A2: 0 };
    for (const level of ["A1", "A2"] as const) {
      const group = menu.find((entry) => entry.id === `nouns-adjectives-${level.toLowerCase()}`);
      expect(group?.title).toBe(`Существительные и прилагательные ${level}`);
      expect(group?.indexFileName).toBe(`adjectives-nouns-${level.toLowerCase()}/index.json`);
      const directory = resolve(contentDir, `adjectives-nouns-${level.toLowerCase()}`);
      expect((await files(directory)).map((file) => relative(directory, file)).sort()).toEqual(
        [...generated.files[level].keys()].sort()
      );
      for (const [file, expected] of generated.files[level]) {
        const actual = await json(resolve(directory, file));
        expect(actual).toEqual(expected);
        if (Array.isArray(actual)) {
          expect(actual.length).toBeGreaterThan(0);
          for (const topic of actual) {
            expect(topicIds.has(topic.id)).toBe(false);
            topicIds.add(topic.id);
            const originalId = topic.id.replace(
              `nouns-adjectives-${level.toLowerCase()}-`,
              "nouns-adjectives-"
            );
            expect({ ...topic, id: originalId }).toEqual(sourceTopics.get(originalId));
          }
          continue;
        }
        const collection = exerciseCollectionSchema.parse(actual);
        expect(collection.items.length).toBeGreaterThan(0);
        for (const item of collection.items) {
          if (item.type !== "single-choice") throw new Error(`Unexpected type: ${item.id}`);
          expect(seen.has(item.id)).toBe(false);
          seen.add(item.id);
          expect(item).toEqual(sourceItems.get(item.id));
          expect(getNounAdjectiveLevel(item.correctAnswer, levels)).toBe(level);
          totals[level]++;
        }
      }
    }
    expect(sourceItems.size).toBe(2894);
    expect([...seen].sort()).toEqual([...sourceItems.keys()].sort());
    expect(totals).toEqual(generated.totals);
    expect(totals.A1).toBeGreaterThan(0);
    expect(totals.A2).toBeGreaterThan(0);
  });

  it("omits empty branches, removes stale files, and regenerates deterministically", async () => {
    const temp = await mkdtemp(resolve(tmpdir(), "noun-adjective-levels-"));
    try {
      const source = resolve(temp, "source");
      const output = resolve(temp, "output");
      await mkdir(resolve(source, "practice/people"), { recursive: true });
      const writeJson = async (file: string, value: unknown) =>
        writeFile(resolve(source, file), JSON.stringify(value));
      await writeJson("practice/index.json", [
        { id: "nouns-adjectives-people", indexFileName: "people/index.json" },
      ]);
      await writeJson("practice/people/index.json", [
        { id: "nouns-adjectives-friends", fileName: "friends.json" },
      ]);
      await writeJson("practice/people/friends.json", {
        items: [{ id: "one", correctAnswer: "ο καλός φίλος" }],
      });
      await writeJson("practice-levels.json", {
        nouns: { φίλος: "A1" },
        adjectives: { καλός: "A1" },
      });
      await splitNounsAdjectivesLevels({ sourceDir: source, outputDir: output });
      expect(await files(resolve(output, "adjectives-nouns-a2"))).toEqual([]);
      const before = await readFile(
        resolve(output, "adjectives-nouns-a1/people/friends.json"),
        "utf8"
      );
      await splitNounsAdjectivesLevels({ sourceDir: source, outputDir: output });
      expect(
        await readFile(resolve(output, "adjectives-nouns-a1/people/friends.json"), "utf8")
      ).toBe(before);
      await writeJson("practice-levels.json", {
        nouns: { φίλος: "A2" },
        adjectives: { καλός: "A1" },
      });
      await splitNounsAdjectivesLevels({ sourceDir: source, outputDir: output });
      expect(await files(resolve(output, "adjectives-nouns-a1"))).toEqual([]);
      expect(
        await readFile(resolve(output, "adjectives-nouns-a2/people/friends.json"), "utf8")
      ).toBe(before);
    } finally {
      await rm(temp, { recursive: true, force: true });
    }
  });
});

import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { importA1A2Lexicon } from "./import-a1-a2-lexicon.mjs";

const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true }))
  );
});

describe("A1+A2 lexicon import", () => {
  it("selects glossary lemmas and enriches their nominative forms", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "a1-a2-lexicon-"));
    temporaryDirectories.push(directory);
    const a1Path = path.join(directory, "a1.txt");
    const a2Path = path.join(directory, "a2.txt");
    const kaikkiPath = path.join(directory, "kaikki.jsonl");
    const outputPath = path.join(directory, "output.json");

    await writeFile(a1Path, "φίλος, ο = friend\nκαλός, -ή, -ό = good\n");
    await writeFile(a2Path, "φίλος, ο = friend\n");
    await writeFile(
      kaikkiPath,
      `${JSON.stringify({
        lang_code: "el",
        word: "φίλος",
        pos: "noun",
        head_templates: [{ name: "el-noun", args: { 1: "m" } }],
        forms: [{ form: "φίλοι", tags: ["nominative", "plural"] }],
      })}\n${JSON.stringify({
        lang_code: "el",
        word: "καλός",
        pos: "adj",
        forms: [
          { form: "καλός", tags: ["masculine", "nominative", "singular"] },
          { form: "καλοί", tags: ["masculine", "nominative", "plural"] },
          { form: "καλή", tags: ["feminine", "nominative", "singular"] },
          { form: "καλές", tags: ["feminine", "nominative", "plural"] },
          { form: "καλό", tags: ["neuter", "nominative", "singular"] },
          { form: "καλά", tags: ["neuter", "nominative", "plural"] },
        ],
      })}\n`
    );

    const content = await importA1A2Lexicon({
      a1TextPath: a1Path,
      a2TextPath: a2Path,
      kaikkiPath,
      outputPath,
    });

    expect(content.nouns).toEqual([
      expect.objectContaining({
        lemma: "φίλος",
        gender: "masculine",
        levels: ["A1", "A2"],
        forms: { singular: "φίλος", plural: "φίλοι" },
        reviewStatus: "imported",
      }),
    ]);
    expect(content.adjectives[0]).toEqual(
      expect.objectContaining({
        lemma: "καλός",
        forms: expect.objectContaining({ feminine: { singular: "καλή", plural: "καλές" } }),
        reviewStatus: "imported",
      })
    );
    expect(JSON.parse(await readFile(outputPath, "utf8"))).toEqual(content);
  });
});

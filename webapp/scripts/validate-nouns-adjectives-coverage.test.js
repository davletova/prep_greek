import { afterEach, describe, expect, it } from "vitest";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateNounsAdjectivesContent } from "./generate-nouns-adjectives-content.mjs";
import { validateNounsAdjectivesCoverage } from "./validate-nouns-adjectives-coverage.mjs";

const webappRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(webappRoot, "content-source", "nouns-adjectives");
const outputDir = path.join(
  webappRoot,
  "public",
  "content",
  "practice",
  "single_choice",
  "nouns-adjectives"
);
const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true }))
  );
});

describe("nouns and adjectives coverage", () => {
  it("validates complete source and generated content", async () => {
    await expect(validateNounsAdjectivesCoverage({ sourceDir, outputDir })).resolves.toEqual([]);
  });

  it("reports an adjective form missing from natural pairings", async () => {
    const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "nouns-adjectives-coverage-"));
    temporaryDirectories.push(temporaryRoot);
    const temporarySourceDir = path.join(temporaryRoot, "source");
    const temporaryOutputDir = path.join(temporaryRoot, "output");
    await cp(sourceDir, temporarySourceDir, { recursive: true });

    const pairingsPath = path.join(temporarySourceDir, "pairings.json");
    const pairings = JSON.parse(await readFile(pairingsPath, "utf8"));
    await writeFile(
      pairingsPath,
      `${JSON.stringify(
        pairings.filter((pairing) => pairing.adjectiveId !== "this"),
        null,
        2
      )}\n`
    );
    await generateNounsAdjectivesContent({
      sourceDir: temporarySourceDir,
      outputDir: temporaryOutputDir,
    });

    const errors = await validateNounsAdjectivesCoverage({
      sourceDir: temporarySourceDir,
      outputDir: temporaryOutputDir,
    });
    expect(
      errors.some((error) =>
        error.message.includes('adjective "this" is not covered in feminine singular')
      )
    ).toBe(true);
  });
});

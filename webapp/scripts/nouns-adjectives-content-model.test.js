import { afterEach, describe, expect, it } from "vitest";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateNounsAdjectivesCorpus } from "./nouns-adjectives-content-model.mjs";

const webappRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(webappRoot, "content-source", "nouns-adjectives");
const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true }))
  );
});

describe("nouns and adjectives content model", () => {
  it("validates the source corpus", async () => {
    await expect(validateNounsAdjectivesCorpus(sourceDir)).resolves.toEqual([]);
  });

  it("rejects pairings with unknown references", async () => {
    const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "nouns-adjectives-"));
    temporaryDirectories.push(temporaryRoot);
    const temporarySourceDir = path.join(temporaryRoot, "corpus");
    await cp(sourceDir, temporarySourceDir, { recursive: true });

    const pairingsPath = path.join(temporarySourceDir, "pairings.json");
    const pairings = JSON.parse(await readFile(pairingsPath, "utf8"));
    pairings[0].nounId = "unknown-noun";
    await writeFile(pairingsPath, `${JSON.stringify(pairings, null, 2)}\n`);

    const errors = await validateNounsAdjectivesCorpus(temporarySourceDir);
    expect(errors.some((error) => error.message.includes('unknown noun "unknown-noun"'))).toBe(
      true
    );
  });
});

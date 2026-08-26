import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { alphabetContentSchema, diphthongsContentSchema } from "./content.ts";
import {
  exerciseCollectionSchema,
  inputExerciseArraySchema,
  inputExerciseCollectionSchema,
} from "./exercises.ts";

const webappRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const contentRoot = resolve(webappRoot, "public/content");

async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, "utf8")) as unknown;
}

describe("content files", () => {
  it("validates theory content files", async () => {
    expect(
      alphabetContentSchema.safeParse(await readJson(resolve(contentRoot, "theory/alphabet.json")))
        .success
    ).toBe(true);
    expect(
      diphthongsContentSchema.safeParse(
        await readJson(resolve(contentRoot, "theory/diphthongs.json"))
      ).success
    ).toBe(true);
  });

  it("validates every single-choice topic referenced by nested indexes", async () => {
    const singleChoiceRoot = resolve(contentRoot, "practice/single_choice");

    async function validateIndex(indexPath: string): Promise<number> {
      const indexContent = await readJson(indexPath);
      expect(Array.isArray(indexContent)).toBe(true);

      const entries = indexContent as Array<{ fileName?: string; indexFileName?: string }>;
      let topicCount = 0;

      for (const entry of entries) {
        if (entry.indexFileName) {
          topicCount += await validateIndex(resolve(dirname(indexPath), entry.indexFileName));
          continue;
        }

        expect(entry.fileName?.endsWith(".json")).toBe(true);
        const topicContent = await readJson(resolve(dirname(indexPath), entry.fileName ?? ""));
        expect(exerciseCollectionSchema.safeParse(topicContent).success).toBe(true);
        topicCount += 1;
      }

      return topicCount;
    }

    expect(await validateIndex(resolve(singleChoiceRoot, "index.json"))).toBeGreaterThan(0);
  });

  it("validates input practice content files", async () => {
    const inputContent = await readJson(
      resolve(contentRoot, "practice/input/alpha_type_verb_conjugation_input.json")
    );

    const isValid =
      inputExerciseArraySchema.safeParse(inputContent).success ||
      inputExerciseCollectionSchema.safeParse(inputContent).success;

    expect(isValid).toBe(true);
  });
});

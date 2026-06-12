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

  it("validates every single-choice topic referenced by index.json", async () => {
    const singleChoiceRoot = resolve(contentRoot, "practice/single_choice");
    const indexContent = await readJson(resolve(singleChoiceRoot, "index.json"));
    expect(Array.isArray(indexContent)).toBe(true);

    const topics = indexContent as Array<{ fileName: string }>;
    expect(topics.length).toBeGreaterThan(0);

    for (const topic of topics) {
      expect(topic.fileName.endsWith(".json")).toBe(true);
      const topicContent = await readJson(resolve(singleChoiceRoot, topic.fileName));
      expect(exerciseCollectionSchema.safeParse(topicContent).success).toBe(true);
    }
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

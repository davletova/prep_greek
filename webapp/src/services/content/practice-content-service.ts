import { inputPracticeTopics, singleChoicePracticeContent } from "../../config/practice-topics.ts";
import type { InputPracticeTopicDefinition } from "../../types/practice-topic.ts";
import { loadJsonContent } from "../../lib/content-loader.ts";
import { loadSingleChoiceTopic } from "../../lib/exercises/load-single-choice-topic.ts";
import {
  inputExerciseArraySchema,
  inputExerciseCollectionSchema
} from "../../schemas/exercises.ts";
import type { InputExercise } from "../../types/exercises.ts";
import type { SingleChoicePracticeTopic } from "../../types/practice-topic.ts";

export type SingleChoiceTopic = SingleChoicePracticeTopic;

function normalizeInputExercises(content: unknown): InputExercise[] {
  const arrayResult = inputExerciseArraySchema.safeParse(content);
  if (arrayResult.success) {
    return arrayResult.data;
  }

  const collectionResult = inputExerciseCollectionSchema.safeParse(content);
  if (collectionResult.success) {
    return collectionResult.data.items;
  }

  throw new Error("Invalid input practice content format");
}

function createTopicId(fileName: string): string {
  return fileName.replace(/\.json$/i, "");
}

export function loadSingleChoiceTopics(): Promise<SingleChoiceTopic[]> {
  return loadJsonContent<string[]>(singleChoicePracticeContent.indexUrl).then((files) =>
    Promise.all(
      files.map(async (fileName) => {
        const collection = await loadSingleChoiceTopic(
          `${singleChoicePracticeContent.baseUrl}${fileName}`,
          ""
        );

        return {
          id: createTopicId(fileName),
          kind: "single-choice" as const,
          fileName,
          title: collection.title,
          subtitle: collection.subtitle || "",
          collection
        };
      })
    )
  );
}

export function loadInputPracticeTopic(
  topic: InputPracticeTopicDefinition
): Promise<InputExercise[]> {
  return loadJsonContent<unknown>(topic.url).then(normalizeInputExercises);
}

export function loadAlphaTypeVerbConjugationInput(): Promise<InputExercise[]> {
  return loadInputPracticeTopic(inputPracticeTopics.alphaTypeVerbConjugation);
}

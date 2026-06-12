import { inputPracticeTopics, singleChoicePracticeContent } from "../../config/practice-topics.ts";
import type {
  InputPracticeTopicDefinition,
  SingleChoicePracticeTopicDefinition,
} from "../../types/practice-topic.ts";
import { loadJsonContent } from "../../lib/content-loader.ts";
import { loadSingleChoiceTopic } from "../../lib/exercises/load-single-choice-topic.ts";
import {
  inputExerciseArraySchema,
  inputExerciseCollectionSchema,
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

function isSingleChoicePracticeTopicDefinition(
  value: unknown
): value is SingleChoicePracticeTopicDefinition {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const topic = value as Record<string, unknown>;
  return (
    typeof topic.id === "string" &&
    typeof topic.title === "string" &&
    typeof topic.subtitle === "string" &&
    typeof topic.fileName === "string"
  );
}

function normalizeSingleChoiceTopicIndex(content: unknown): SingleChoicePracticeTopicDefinition[] {
  if (Array.isArray(content) && content.every(isSingleChoicePracticeTopicDefinition)) {
    return content;
  }

  throw new Error("Invalid single-choice practice index format");
}

export function loadSingleChoiceTopicDefinitions(): Promise<SingleChoicePracticeTopicDefinition[]> {
  return loadJsonContent<unknown>(singleChoicePracticeContent.indexUrl).then(
    normalizeSingleChoiceTopicIndex
  );
}

export async function loadSingleChoicePracticeTopic(
  topic: SingleChoicePracticeTopicDefinition
): Promise<SingleChoiceTopic> {
  const collection = await loadSingleChoiceTopic(
    `${singleChoicePracticeContent.baseUrl}${topic.fileName}`,
    topic.title
  );

  return {
    id: topic.id,
    kind: "single-choice" as const,
    fileName: topic.fileName,
    title: topic.title,
    subtitle: topic.subtitle,
    collection,
  };
}

export function loadInputPracticeTopic(
  topic: InputPracticeTopicDefinition
): Promise<InputExercise[]> {
  return loadJsonContent<unknown>(topic.url).then(normalizeInputExercises);
}

export function loadAlphaTypeVerbConjugationInput(): Promise<InputExercise[]> {
  return loadInputPracticeTopic(inputPracticeTopics.alphaTypeVerbConjugation);
}

import {
  inputPracticeTopics,
  listeningPracticeContent,
  singleChoicePracticeContent,
} from "../../config/practice-topics.ts";
import type {
  InputPracticeTopicDefinition,
  ListeningPracticeTopicDefinition,
  SingleChoicePracticeGroupDefinition,
  SingleChoicePracticeIndexEntry,
  SingleChoicePracticeTopicDefinition,
} from "../../types/practice-topic.ts";
import { loadJsonContent } from "../../lib/content-loader.ts";
import { loadSingleChoiceTopic } from "../../lib/exercises/load-single-choice-topic.ts";
import {
  inputExerciseArraySchema,
  inputExerciseCollectionSchema,
} from "../../schemas/exercises.ts";
import type { InputExercise } from "../../types/exercises.ts";
import type {
  ListeningPracticeTopic,
  SingleChoicePracticeTopic,
} from "../../types/practice-topic.ts";

export type SingleChoiceTopic = SingleChoicePracticeTopic;
export type ListeningTopic = ListeningPracticeTopic;

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

function isIndexEntryBase(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === "string" &&
    typeof entry.title === "string" &&
    typeof entry.subtitle === "string"
  );
}

function isSingleChoicePracticeTopicDefinition(
  value: unknown
): value is SingleChoicePracticeTopicDefinition {
  return isIndexEntryBase(value) && typeof value.fileName === "string";
}

function isSingleChoicePracticeGroupDefinition(
  value: unknown
): value is SingleChoicePracticeGroupDefinition {
  return isIndexEntryBase(value) && typeof value.indexFileName === "string";
}

function normalizeSingleChoiceTopicIndex(
  content: unknown,
  baseUrl: string
): SingleChoicePracticeTopicDefinition[] {
  if (!Array.isArray(content) || !content.every(isSingleChoicePracticeTopicDefinition)) {
    throw new Error("Invalid single-choice practice index format");
  }

  return content.map((topic) => ({ ...topic, baseUrl }));
}

function normalizeSingleChoiceRootIndex(
  content: unknown,
  baseUrl: string
): SingleChoicePracticeIndexEntry[] {
  if (
    !Array.isArray(content) ||
    !content.every(
      (entry) =>
        isSingleChoicePracticeTopicDefinition(entry) || isSingleChoicePracticeGroupDefinition(entry)
    )
  ) {
    throw new Error("Invalid single-choice practice index format");
  }

  return content.map((entry) => ({ ...entry, baseUrl }));
}

function getGroupBaseUrl(group: SingleChoicePracticeGroupDefinition): string {
  const parentBaseUrl = group.baseUrl ?? singleChoicePracticeContent.baseUrl;
  const lastSlashIndex = group.indexFileName.lastIndexOf("/");
  const relativeDirectory =
    lastSlashIndex === -1 ? "" : group.indexFileName.slice(0, lastSlashIndex + 1);

  return `${parentBaseUrl}${relativeDirectory}`;
}

export function loadSingleChoiceTopicDefinitions(): Promise<SingleChoicePracticeIndexEntry[]> {
  return loadJsonContent<unknown>(singleChoicePracticeContent.indexUrl).then((content) =>
    normalizeSingleChoiceRootIndex(content, singleChoicePracticeContent.baseUrl)
  );
}

export function loadSingleChoiceGroupTopicDefinitions(
  group: SingleChoicePracticeGroupDefinition
): Promise<SingleChoicePracticeTopicDefinition[]> {
  const parentBaseUrl = group.baseUrl ?? singleChoicePracticeContent.baseUrl;

  return loadJsonContent<unknown>(`${parentBaseUrl}${group.indexFileName}`).then((content) =>
    normalizeSingleChoiceTopicIndex(content, getGroupBaseUrl(group))
  );
}

export function loadListeningTopicDefinitions(): Promise<ListeningPracticeTopicDefinition[]> {
  return loadJsonContent<unknown>(listeningPracticeContent.indexUrl).then((content) =>
    normalizeSingleChoiceTopicIndex(content, listeningPracticeContent.baseUrl)
  );
}

export async function loadSingleChoicePracticeTopic(
  topic: SingleChoicePracticeTopicDefinition
): Promise<SingleChoiceTopic> {
  const collection = await loadSingleChoiceTopic(
    `${topic.baseUrl ?? singleChoicePracticeContent.baseUrl}${topic.fileName}`,
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

export async function loadListeningPracticeTopic(
  topic: ListeningPracticeTopicDefinition
): Promise<ListeningTopic> {
  const collection = await loadSingleChoiceTopic(
    `${listeningPracticeContent.baseUrl}${topic.fileName}`,
    topic.title
  );

  return {
    id: topic.id,
    kind: "listening" as const,
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

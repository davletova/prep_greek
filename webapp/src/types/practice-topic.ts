import type { ExerciseCollection } from "./exercises.ts";

export type PracticeTopicKind = "single-choice" | "input" | "listening";

export interface PracticeTopicDefinition {
  id: string;
  kind: PracticeTopicKind;
  title: string;
  subtitle: string;
  url: string;
}

export type InputPracticeTopicDefinition = PracticeTopicDefinition & {
  kind: "input";
};

export interface SingleChoicePracticeTopicDefinition {
  id: string;
  title: string;
  subtitle: string;
  fileName: string;
  baseUrl?: string | undefined;
}

export interface SingleChoicePracticeGroupDefinition {
  id: string;
  title: string;
  subtitle: string;
  indexFileName: string;
  baseUrl?: string | undefined;
}

export type SingleChoicePracticeIndexEntry =
  | SingleChoicePracticeTopicDefinition
  | SingleChoicePracticeGroupDefinition;

export type ListeningPracticeTopicDefinition = SingleChoicePracticeTopicDefinition;

export function isSingleChoicePracticeGroupDefinition(
  entry: SingleChoicePracticeIndexEntry
): entry is SingleChoicePracticeGroupDefinition {
  return "indexFileName" in entry;
}

export interface SingleChoicePracticeTopic {
  id: string;
  kind: "single-choice";
  fileName: string;
  title: string;
  subtitle: string;
  collection: ExerciseCollection;
}

export interface ListeningPracticeTopic {
  id: string;
  kind: "listening";
  fileName: string;
  title: string;
  subtitle: string;
  collection: ExerciseCollection;
}

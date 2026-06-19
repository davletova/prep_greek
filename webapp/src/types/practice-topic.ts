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
}

export type ListeningPracticeTopicDefinition = SingleChoicePracticeTopicDefinition;

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

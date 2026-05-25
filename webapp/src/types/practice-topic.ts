import type { ExerciseCollection } from "./exercises.ts";

export type PracticeTopicKind = "single-choice" | "input";

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

export interface SingleChoicePracticeTopic {
  id: string;
  kind: "single-choice";
  fileName: string;
  title: string;
  subtitle: string;
  collection: ExerciseCollection;
}

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

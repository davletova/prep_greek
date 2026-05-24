export type PracticeTopicKind = "single-choice" | "input";

export interface PracticeTopicDefinition {
  id: string;
  kind: PracticeTopicKind;
  title: string;
  subtitle: string;
  url: string;
}

export const singleChoicePracticeContent = {
  indexUrl: `${import.meta.env.BASE_URL}content/practice/single_choice/index.json`,
  baseUrl: `${import.meta.env.BASE_URL}content/practice/single_choice/`
} as const;

export const inputPracticeTopics = {
  alphaTypeVerbConjugation: {
    id: "alpha-type-verb-conjugation",
    kind: "input",
    title: "Спряжение глаголов",
    subtitle: "Введите правильную форму слова",
    url: `${import.meta.env.BASE_URL}content/practice/input/alpha_type_verb_conjugation_input.json`
  }
} as const satisfies Record<string, PracticeTopicDefinition>;

export const inputPracticeTopicList = [
  inputPracticeTopics.alphaTypeVerbConjugation
] as const;

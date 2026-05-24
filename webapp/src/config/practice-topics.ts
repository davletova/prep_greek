export const singleChoicePracticeContent = {
  indexUrl: `${import.meta.env.BASE_URL}content/practice/single_choice/index.json`,
  baseUrl: `${import.meta.env.BASE_URL}content/practice/single_choice/`
} as const;

export const inputPracticeTopics = {
  alphaTypeVerbConjugation: {
    id: "alpha-type-verb-conjugation",
    title: "Спряжение глаголов",
    subtitle: "Введите правильную форму слова",
    url: `${import.meta.env.BASE_URL}content/practice/input/alpha_type_verb_conjugation_input.json`
  }
} as const;

export const inputPracticeTopicList = [
  inputPracticeTopics.alphaTypeVerbConjugation
] as const;

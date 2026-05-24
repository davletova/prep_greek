export const singleChoicePracticeContent = {
  indexUrl: `${import.meta.env.BASE_URL}content/practice/single_choice/index.json`,
  baseUrl: `${import.meta.env.BASE_URL}content/practice/single_choice/`
} as const;

export const inputPracticeTopics = {
  alphaTypeVerbConjugation: {
    title: "Спряжение глаголов",
    url: `${import.meta.env.BASE_URL}content/practice/input/alpha_type_verb_conjugation_input.json`
  }
} as const;

import type { InputPracticeTopicDefinition } from "../types/practice-topic.ts";

export const singleChoicePracticeContent = {
  indexUrl: `${import.meta.env.BASE_URL}content/practice/single_choice/index.json`,
  baseUrl: `${import.meta.env.BASE_URL}content/practice/single_choice/`,
} as const;

export const listeningPracticeContent = {
  indexUrl: `${import.meta.env.BASE_URL}content/practice/listening/index.json`,
  baseUrl: `${import.meta.env.BASE_URL}content/practice/listening/`,
} as const;

export const inputPracticeTopics = {
  alphaTypeVerbConjugation: {
    id: "alpha-type-verb-conjugation",
    kind: "input",
    title: "Спряжение глаголов",
    subtitle: "Введите правильную форму слова",
    url: `${import.meta.env.BASE_URL}content/practice/input/alpha_type_verb_conjugation_input.json`,
  },
  aboutMyself: {
    id: "about-myself",
    kind: "input",
    title: "О себе",
    subtitle: "Введите фразу на греческом",
    url: `${import.meta.env.BASE_URL}content/practice/input/about-myself.json`,
  },
  familyFriends: {
    id: "family-friends",
    kind: "input",
    title: "Семья и друзья",
    subtitle: "Введите перевод фразы",
    url: `${import.meta.env.BASE_URL}content/practice/input/family-friends.json`,
  },
  basicVerbsAndMovement: {
    id: "basic-verbs-and-movement",
    kind: "input",
    title: "Глаголы είμαι, έχω, κάνω и глаголы движения",
    subtitle: "Введите перевод фразы",
    url: `${import.meta.env.BASE_URL}content/practice/input/basic-verbs-and-movement.json`,
  },
} as const satisfies Record<string, InputPracticeTopicDefinition>;

export const inputPracticeTopicList = [
  inputPracticeTopics.alphaTypeVerbConjugation,
  inputPracticeTopics.aboutMyself,
  inputPracticeTopics.familyFriends,
  inputPracticeTopics.basicVerbsAndMovement,
] as const;

import { describe, expect, it } from "vitest";
import {
  exerciseCollectionSchema,
  listeningExerciseSchema,
  singleChoiceExerciseSchema,
} from "./exercises.ts";

const validSingleChoiceExercise = {
  id: "choice-1",
  type: "single-choice",
  prompt: "Γεια",
  promptLanguage: "el",
  correctAnswer: "Привет",
  wrongAnswers: ["Пока", "Спасибо", "Извините"],
};

const validListeningExercise = {
  id: "listening-1",
  type: "listening",
  prompt: "Прослушайте фразу и выберите перевод",
  answerMode: "audio-to-russian",
  audio: {
    kind: "tts",
    text: "Καλημέρα",
    lang: "el-GR",
    rate: 0.85,
  },
  transcript: "Καλημέρα",
  correctAnswer: "Доброе утро",
  wrongAnswers: ["Добрый вечер", "Спасибо", "Пока"],
};

describe("exercise schemas", () => {
  it("accepts supported prompt languages", () => {
    expect(singleChoiceExerciseSchema.safeParse(validSingleChoiceExercise).success).toBe(true);
    expect(
      singleChoiceExerciseSchema.safeParse({
        ...validSingleChoiceExercise,
        promptLanguage: "ru",
      }).success
    ).toBe(true);
  });

  it("rejects unsupported prompt languages", () => {
    expect(
      singleChoiceExerciseSchema.safeParse({
        ...validSingleChoiceExercise,
        promptLanguage: "en",
      }).success
    ).toBe(false);
  });

  it("accepts single-choice exercises with at least one wrong answer", () => {
    expect(
      singleChoiceExerciseSchema.safeParse({
        ...validSingleChoiceExercise,
        wrongAnswers: ["Пока"],
      }).success
    ).toBe(true);
  });

  it("rejects single-choice exercises without wrong answers", () => {
    expect(
      singleChoiceExerciseSchema.safeParse({
        ...validSingleChoiceExercise,
        wrongAnswers: [],
      }).success
    ).toBe(false);
  });

  it("accepts collection settings", () => {
    expect(
      exerciseCollectionSchema.safeParse({
        title: "Practice",
        settings: {
          showTranslationHint: true,
        },
        items: [validSingleChoiceExercise],
      }).success
    ).toBe(true);
  });

  it("accepts listening exercises with TTS audio", () => {
    expect(listeningExerciseSchema.safeParse(validListeningExercise).success).toBe(true);
  });

  it("accepts listening exercises with file audio", () => {
    expect(
      listeningExerciseSchema.safeParse({
        ...validListeningExercise,
        audio: {
          kind: "file",
          src: "/content/audio/greetings/kalimera.mp3",
        },
      }).success
    ).toBe(true);
  });

  it("rejects listening exercises with unsupported modes", () => {
    expect(
      listeningExerciseSchema.safeParse({
        ...validListeningExercise,
        answerMode: "audio-to-picture",
      }).success
    ).toBe(false);
  });
});

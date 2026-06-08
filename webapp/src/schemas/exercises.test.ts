import { describe, expect, it } from "vitest";
import { singleChoiceExerciseSchema } from "./exercises.ts";

const validSingleChoiceExercise = {
  id: "choice-1",
  type: "single-choice",
  prompt: "Γεια",
  promptLanguage: "el",
  correctAnswer: "Привет",
  wrongAnswers: ["Пока", "Спасибо", "Извините"]
};

describe("exercise schemas", () => {
  it("accepts supported prompt languages", () => {
    expect(singleChoiceExerciseSchema.safeParse(validSingleChoiceExercise).success).toBe(true);
    expect(
      singleChoiceExerciseSchema.safeParse({
        ...validSingleChoiceExercise,
        promptLanguage: "ru"
      }).success
    ).toBe(true);
  });

  it("rejects unsupported prompt languages", () => {
    expect(
      singleChoiceExerciseSchema.safeParse({
        ...validSingleChoiceExercise,
        promptLanguage: "en"
      }).success
    ).toBe(false);
  });

  it("accepts single-choice exercises with at least one wrong answer", () => {
    expect(
      singleChoiceExerciseSchema.safeParse({
        ...validSingleChoiceExercise,
        wrongAnswers: ["Пока"]
      }).success
    ).toBe(true);
  });

  it("rejects single-choice exercises without wrong answers", () => {
    expect(
      singleChoiceExerciseSchema.safeParse({
        ...validSingleChoiceExercise,
        wrongAnswers: []
      }).success
    ).toBe(false);
  });
});

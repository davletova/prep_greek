import { describe, expect, it } from "vitest";
import { buildSingleChoiceRuntimeQuestion } from "./build-single-choice-runtime-question.ts";
import type { SingleChoiceExercise } from "../../types/exercises.ts";

const exercise: SingleChoiceExercise = {
  id: "choice-1",
  type: "single-choice",
  prompt: "Γεια",
  promptLanguage: "el",
  correctAnswer: "Привет",
  wrongAnswers: ["Пока", "Спасибо", "Извините"]
};

describe("buildSingleChoiceRuntimeQuestion", () => {
  it("creates a runtime question with all options and correct index", () => {
    const question = buildSingleChoiceRuntimeQuestion(exercise);

    expect(question.options).toHaveLength(1 + exercise.wrongAnswers.length);
    expect(question.options).toContain(exercise.correctAnswer);
    expect(question.correctIndex).toBeGreaterThanOrEqual(0);
    expect(question.options[question.correctIndex]).toBe(exercise.correctAnswer);
  });
});

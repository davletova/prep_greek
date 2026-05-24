import { describe, expect, it } from "vitest";
import { buildSingleChoiceRuntimeQuestion } from "./build-single-choice-runtime-question.ts";
import type { SingleChoiceExercise } from "../../types/exercises";

describe("buildSingleChoiceRuntimeQuestion", () => {
  const exercise: SingleChoiceExercise = {
    id: "choice-1",
    type: "single-choice",
    prompt: "Γεια",
    promptLanguage: "el",
    correctAnswer: "Привет",
    wrongAnswers: ["Пока", "Спасибо", "Извините"],
    translation: "Привет",
    explanation: "Common greeting"
  };

  it("builds a runtime question with four options", () => {
    const question = buildSingleChoiceRuntimeQuestion(exercise);

    expect(question).toMatchObject({
      id: exercise.id,
      prompt: exercise.prompt,
      promptLanguage: exercise.promptLanguage,
      translation: exercise.translation,
      explanation: exercise.explanation
    });
    expect(question.options).toHaveLength(4);
    expect(question.options).toEqual(
      expect.arrayContaining([
        exercise.correctAnswer,
        ...exercise.wrongAnswers
      ])
    );
  });

  it("points correctIndex to the correct answer", () => {
    const question = buildSingleChoiceRuntimeQuestion(exercise);

    expect(question.options[question.correctIndex]).toBe(exercise.correctAnswer);
  });
});

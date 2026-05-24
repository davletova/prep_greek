import { describe, expect, it } from "vitest";
import { checkExerciseAnswer } from "./check.ts";
import type { SingleChoiceExercise, TextInputExercise } from "../../types/exercises";

describe("checkExerciseAnswer", () => {
  const singleChoiceExercise: SingleChoiceExercise = {
    id: "choice-1",
    type: "single-choice",
    prompt: "Γεια",
    correctAnswer: "Привет",
    wrongAnswers: ["Пока", "Спасибо", "Извините"]
  };

  const textInputExercise: TextInputExercise = {
    id: "input-1",
    type: "text-input",
    prompt: "Translate: Γεια",
    correctAnswers: ["Привет", "Здравствуйте"]
  };

  it("checks correct single-choice answer", () => {
    expect(
      checkExerciseAnswer(singleChoiceExercise, {
        type: "single-choice",
        selectedIndex: 0
      })
    ).toEqual({ correct: true });
  });

  it("checks wrong single-choice answer", () => {
    expect(
      checkExerciseAnswer(singleChoiceExercise, {
        type: "single-choice",
        selectedIndex: 1
      })
    ).toEqual({ correct: false });
  });

  it("normalizes text-input answers", () => {
    expect(
      checkExerciseAnswer(textInputExercise, {
        type: "text-input",
        value: "  привет  "
      })
    ).toEqual({ correct: true });
  });

  it("rejects mismatched answer type", () => {
    expect(
      checkExerciseAnswer(textInputExercise, {
        type: "single-choice",
        selectedIndex: 0
      })
    ).toEqual({ correct: false });
  });
});

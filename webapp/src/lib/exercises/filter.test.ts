import { describe, expect, it } from "vitest";
import { getInputExercises, getSingleChoiceExercises } from "./filter.ts";
import type { ExerciseCollection, InputExercise, SingleChoiceExercise } from "../../types/exercises.ts";

const singleChoiceExercise: SingleChoiceExercise = {
  id: "single-choice-1",
  type: "single-choice",
  prompt: "Γεια",
  correctAnswer: "Привет",
  wrongAnswers: ["Пока", "Спасибо", "Извините"]
};

const inputExercise: InputExercise = {
  id: "input-1",
  type: "input",
  prompt: "знаю",
  correctAnswer: "ξέρω"
};

describe("exercise filters", () => {
  it("returns only single-choice exercises from a collection", () => {
    const collection: ExerciseCollection = {
      title: "Mixed topic",
      items: [singleChoiceExercise, inputExercise]
    };

    expect(getSingleChoiceExercises(collection)).toEqual([singleChoiceExercise]);
  });

  it("returns an empty single-choice list for missing collection", () => {
    expect(getSingleChoiceExercises(null)).toEqual([]);
  });

  it("returns only input exercises", () => {
    expect(getInputExercises([inputExercise])).toEqual([inputExercise]);
  });

  it("returns an empty input list for missing exercises", () => {
    expect(getInputExercises(null)).toEqual([]);
  });
});

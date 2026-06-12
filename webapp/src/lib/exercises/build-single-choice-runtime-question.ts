import { shuffleArray } from "../random.ts";
import type {
  NonEmptyArray,
  SingleChoiceExercise,
  SingleChoiceRuntimeQuestion,
} from "../../types/exercises";

export function buildSingleChoiceRuntimeQuestion(
  exercise: SingleChoiceExercise
): SingleChoiceRuntimeQuestion {
  const options = shuffleArray([exercise.correctAnswer, ...exercise.wrongAnswers]);

  return {
    id: exercise.id,
    prompt: exercise.prompt,
    promptLanguage: exercise.promptLanguage,
    options: options as NonEmptyArray<string>,
    correctIndex: options.findIndex((option) => option === exercise.correctAnswer),
    translation: exercise.translation,
    explanation: exercise.explanation,
  };
}

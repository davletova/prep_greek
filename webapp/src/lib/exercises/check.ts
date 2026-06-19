import { normalizeExerciseText } from "./normalize.ts";
import type {
  Exercise,
  ExerciseAnswer,
  ExerciseCheckResult,
  InputExercise,
  SingleChoiceExercise,
  TextInputExercise,
} from "../../types/exercises";

function checkSingleChoiceAnswer(
  exercise: SingleChoiceExercise,
  answer: Extract<ExerciseAnswer, { type: "single-choice" }>
): ExerciseCheckResult {
  const options = [exercise.correctAnswer, ...exercise.wrongAnswers];

  return {
    correct: options[answer.selectedIndex] === exercise.correctAnswer,
  };
}

function checkTextInputAnswer(
  exercise: TextInputExercise,
  answer: Extract<ExerciseAnswer, { type: "text-input" }>
): ExerciseCheckResult {
  const normalizedAnswer = normalizeExerciseText(answer.value);
  const correct = exercise.correctAnswers.some(
    (item) => normalizeExerciseText(item) === normalizedAnswer
  );

  return { correct };
}

export function checkInputExerciseAnswer(
  exercise: InputExercise,
  answer: Extract<ExerciseAnswer, { type: "input" }>
): ExerciseCheckResult {
  return {
    correct: normalizeExerciseText(answer.value) === normalizeExerciseText(exercise.correctAnswer),
  };
}

export function checkExerciseAnswer(
  exercise: Exercise,
  answer: ExerciseAnswer
): ExerciseCheckResult {
  if (exercise.type !== answer.type) {
    return { correct: false };
  }

  if (exercise.type === "single-choice" && answer.type === "single-choice") {
    return checkSingleChoiceAnswer(exercise, answer);
  }

  if (exercise.type === "text-input" && answer.type === "text-input") {
    return checkTextInputAnswer(exercise, answer);
  }

  if (exercise.type === "input" && answer.type === "input") {
    return checkInputExerciseAnswer(exercise, answer);
  }

  if (exercise.type === "listening" && answer.type === "listening") {
    const options = [exercise.correctAnswer, ...exercise.wrongAnswers];
    return {
      correct: options[answer.selectedIndex] === exercise.correctAnswer,
    };
  }

  return { correct: false };
}

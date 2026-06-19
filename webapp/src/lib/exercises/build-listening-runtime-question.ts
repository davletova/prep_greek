import { shuffleArray } from "../random.ts";
import type {
  ListeningExercise,
  ListeningRuntimeQuestion,
  NonEmptyArray,
} from "../../types/exercises";

export function buildListeningRuntimeQuestion(
  exercise: ListeningExercise
): ListeningRuntimeQuestion {
  const options = shuffleArray([exercise.correctAnswer, ...exercise.wrongAnswers]);

  return {
    id: exercise.id,
    prompt: exercise.prompt,
    answerMode: exercise.answerMode,
    audio: exercise.audio,
    transcript: exercise.transcript,
    options: options as NonEmptyArray<string>,
    correctIndex: options.findIndex((option) => option === exercise.correctAnswer),
    explanation: exercise.explanation,
  };
}

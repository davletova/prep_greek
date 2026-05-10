import type {
  SingleChoiceExercise,
  SingleChoiceRuntimeQuestion
} from "../../types/exercises";

function shuffleArray<T>(items: T[]): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = shuffled[index];
    shuffled[index] = shuffled[swapIndex];
    shuffled[swapIndex] = current;
  }

  return shuffled;
}

export function buildSingleChoiceRuntimeQuestion(
  exercise: SingleChoiceExercise
): SingleChoiceRuntimeQuestion {
  const options = shuffleArray([
    exercise.correctAnswer,
    ...exercise.wrongAnswers
  ]);

  return {
    id: exercise.id,
    prompt: exercise.prompt,
    options: options as [string, string, string, string],
    correctIndex: options.findIndex((option) => option === exercise.correctAnswer),
    translation: exercise.translation,
    explanation: exercise.explanation
  };
}

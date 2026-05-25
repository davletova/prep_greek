import type { ExerciseCollection, InputExercise, SingleChoiceExercise } from "../../types/exercises.ts";

export function getSingleChoiceExercises(
  collection: ExerciseCollection | null
): SingleChoiceExercise[] {
  return (
    collection?.items.filter(
      (exercise): exercise is SingleChoiceExercise => exercise.type === "single-choice"
    ) ?? []
  );
}

export function getInputExercises(exercises: InputExercise[] | null): InputExercise[] {
  return exercises?.filter((exercise) => exercise.type === "input") ?? [];
}

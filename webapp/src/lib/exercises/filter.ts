import type {
  ExerciseCollection,
  InputExercise,
  ListeningExercise,
  SingleChoiceExercise,
} from "../../types/exercises.ts";

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

export function getListeningExercises(collection: ExerciseCollection | null): ListeningExercise[] {
  return (
    collection?.items.filter(
      (exercise): exercise is ListeningExercise => exercise.type === "listening"
    ) ?? []
  );
}

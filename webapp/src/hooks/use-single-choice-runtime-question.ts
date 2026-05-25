import { useEffect, useState } from "react";
import { buildSingleChoiceRuntimeQuestion } from "../lib/exercises/build-single-choice-runtime-question.ts";
import type {
  SingleChoiceExercise,
  SingleChoiceRuntimeQuestion
} from "../types/exercises.ts";

export function useSingleChoiceRuntimeQuestion(
  exercise: SingleChoiceExercise | null
): SingleChoiceRuntimeQuestion | null {
  const [question, setQuestion] = useState<SingleChoiceRuntimeQuestion | null>(null);

  useEffect(() => {
    setQuestion(exercise ? buildSingleChoiceRuntimeQuestion(exercise) : null);
  }, [exercise]);

  return question;
}

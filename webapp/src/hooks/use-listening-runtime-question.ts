import { useEffect, useState } from "react";
import { buildListeningRuntimeQuestion } from "../lib/exercises/build-listening-runtime-question.ts";
import type { ListeningExercise, ListeningRuntimeQuestion } from "../types/exercises.ts";

export function useListeningRuntimeQuestion(
  exercise: ListeningExercise | null
): ListeningRuntimeQuestion | null {
  const [question, setQuestion] = useState<ListeningRuntimeQuestion | null>(null);

  useEffect(() => {
    setQuestion(exercise ? buildListeningRuntimeQuestion(exercise) : null);
  }, [exercise]);

  return question;
}

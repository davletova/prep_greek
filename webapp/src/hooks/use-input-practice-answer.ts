import { useEffect, useState } from "react";
import { checkInputExerciseAnswer } from "../lib/exercises/check.ts";
import { recordPracticeAnswer } from "../lib/practice-stats-storage.ts";
import type { InputExercise } from "../types/exercises.ts";

interface InputPracticeAnswerState {
  answerValue: string;
  setAnswerValue: (value: string) => void;
  hasChecked: boolean;
  canCheck: boolean;
  isCorrect: boolean;
  checkAnswer: () => void;
}

export function useInputPracticeAnswer(
  exercise: InputExercise | null,
  onReset?: () => void
): InputPracticeAnswerState {
  const [answerValue, setAnswerValue] = useState("");
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    setAnswerValue("");
    setHasChecked(false);
    onReset?.();
  }, [exercise?.id, onReset]);

  const trimmedAnswerValue = answerValue.trim();
  const canCheck = trimmedAnswerValue.length > 0 && !hasChecked;
  const isCorrect =
    hasChecked && exercise
      ? checkInputExerciseAnswer(exercise, {
          type: "input",
          value: trimmedAnswerValue,
        }).correct
      : false;

  const checkAnswer = () => {
    if (!exercise || !canCheck) {
      return;
    }

    const result = checkInputExerciseAnswer(exercise, {
      type: "input",
      value: trimmedAnswerValue,
    });

    setAnswerValue(trimmedAnswerValue);
    setHasChecked(true);
    void recordPracticeAnswer(result.correct).catch((error) => {
      console.warn("Failed to save practice stats", error);
    });
  };

  return {
    answerValue,
    setAnswerValue,
    hasChecked,
    canCheck,
    isCorrect,
    checkAnswer
  };
}

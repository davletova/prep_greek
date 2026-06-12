import { useEffect, useState } from "react";
import { recordPracticeAnswer } from "../lib/practice-stats-storage.ts";
import type { SingleChoiceRuntimeQuestion } from "../types/exercises.ts";

interface SingleChoicePracticeAnswerState {
  selectedIndex: number | null;
  hasAnswered: boolean;
  selectAnswer: (index: number) => void;
  resetAnswer: () => void;
  getAnswerClassName: (index: number) => string;
}

const DEFAULT_ANSWER_CLASS_NAME = "practice-card__answer";

export function useSingleChoicePracticeAnswer(
  question: SingleChoiceRuntimeQuestion | null,
  onReset?: () => void
): SingleChoicePracticeAnswerState {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const hasAnswered = selectedIndex !== null;

  const resetAnswer = () => {
    setSelectedIndex(null);
  };

  useEffect(() => {
    resetAnswer();
    onReset?.();
  }, [question?.id, onReset]);

  const selectAnswer = (index: number) => {
    if (!question || hasAnswered) {
      return;
    }

    setSelectedIndex(index);
    void recordPracticeAnswer(index === question.correctIndex).catch((error) => {
      console.warn("Failed to save practice stats", error);
    });
  };

  const getAnswerClassName = (index: number) => {
    if (!question || selectedIndex === null) {
      return DEFAULT_ANSWER_CLASS_NAME;
    }

    if (index === question.correctIndex) {
      return `${DEFAULT_ANSWER_CLASS_NAME} practice-card__answer--correct`;
    }

    if (index === selectedIndex) {
      return `${DEFAULT_ANSWER_CLASS_NAME} practice-card__answer--wrong`;
    }

    return DEFAULT_ANSWER_CLASS_NAME;
  };

  return {
    selectedIndex,
    hasAnswered,
    selectAnswer,
    resetAnswer,
    getAnswerClassName,
  };
}

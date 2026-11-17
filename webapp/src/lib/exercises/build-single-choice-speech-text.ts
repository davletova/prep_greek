import type { SingleChoiceRuntimeQuestion } from "../../types/exercises.ts";

export function buildSingleChoiceSpeechText(
  question: SingleChoiceRuntimeQuestion,
  target: "prompt" | "correctAnswer"
): string {
  const correctAnswer = question.options[question.correctIndex] ?? "";
  if (/_{2,}/u.test(question.prompt) && correctAnswer) {
    return question.prompt.replace(/_{2,}/gu, () => correctAnswer);
  }
  return target === "prompt" ? question.prompt : correctAnswer;
}

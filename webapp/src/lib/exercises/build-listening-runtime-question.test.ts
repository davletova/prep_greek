import { describe, expect, it } from "vitest";
import { buildListeningRuntimeQuestion } from "./build-listening-runtime-question.ts";
import type { ListeningExercise } from "../../types/exercises";

describe("buildListeningRuntimeQuestion", () => {
  const exercise: ListeningExercise = {
    id: "listening-1",
    type: "listening",
    prompt: "Прослушайте фразу и выберите перевод",
    answerMode: "audio-to-russian",
    audio: {
      kind: "tts",
      text: "Καλημέρα",
      lang: "el-GR",
      rate: 0.85,
    },
    transcript: "Καλημέρα",
    correctAnswer: "Доброе утро",
    wrongAnswers: ["Добрый вечер", "Спасибо", "Пока"],
    explanation: "Common greeting",
  };

  it("builds a runtime question with all options", () => {
    const question = buildListeningRuntimeQuestion(exercise);

    expect(question).toMatchObject({
      id: exercise.id,
      prompt: exercise.prompt,
      answerMode: exercise.answerMode,
      audio: exercise.audio,
      transcript: exercise.transcript,
      explanation: exercise.explanation,
    });
    expect(question.options).toHaveLength(1 + exercise.wrongAnswers.length);
    expect(question.options).toEqual(
      expect.arrayContaining([exercise.correctAnswer, ...exercise.wrongAnswers])
    );
  });

  it("points correctIndex to the correct answer", () => {
    const question = buildListeningRuntimeQuestion(exercise);

    expect(question.options[question.correctIndex]).toBe(exercise.correctAnswer);
  });
});

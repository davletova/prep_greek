import { describe, expect, it } from "vitest";
import type { SingleChoiceRuntimeQuestion } from "../../types/exercises.ts";
import { buildSingleChoiceSpeechText } from "./build-single-choice-speech-text.ts";

const question: SingleChoiceRuntimeQuestion = {
  id: "water",
  prompt: "Εμείς _______ νερό.",
  speechTarget: "correctAnswer",
  options: ["τρώμε", "πίνετε", "πίνουμε", "τρώτε"],
  correctIndex: 2,
};

describe("buildSingleChoiceSpeechText", () => {
  it.each(["prompt", "correctAnswer"] as const)(
    "reads the completed sentence for the %s playback target",
    (target) => {
      expect(buildSingleChoiceSpeechText(question, target)).toBe("Εμείς πίνουμε νερό.");
    }
  );

  it("uses the correct answer after options have been shuffled", () => {
    expect(
      buildSingleChoiceSpeechText(
        { ...question, options: ["πίνουμε", "τρώτε"], correctIndex: 0 },
        "correctAnswer"
      )
    ).toBe("Εμείς πίνουμε νερό.");
  });

  it.each(["____", "_______", "__________"])("supports the blank %s", (blank) => {
    expect(
      buildSingleChoiceSpeechText({ ...question, prompt: `Εμείς ${blank} νερό.` }, "correctAnswer")
    ).toBe("Εμείς πίνουμε νερό.");
  });

  it("inserts answers literally and preserves surrounding punctuation", () => {
    expect(
      buildSingleChoiceSpeechText(
        { ...question, prompt: "«_______»!", options: ["$&"], correctIndex: 0 },
        "correctAnswer"
      )
    ).toBe("«$&»!");
  });

  it("preserves prompt playback for exercises without a blank", () => {
    expect(buildSingleChoiceSpeechText({ ...question, prompt: "Καλημέρα!" }, "prompt")).toBe(
      "Καλημέρα!"
    );
  });

  it("preserves correct-answer playback for exercises without a blank", () => {
    expect(buildSingleChoiceSpeechText({ ...question, prompt: "Пить" }, "correctAnswer")).toBe(
      "πίνουμε"
    );
  });
});

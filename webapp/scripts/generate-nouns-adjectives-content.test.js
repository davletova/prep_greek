import { describe, expect, it } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildNounsAdjectivesContent } from "./generate-nouns-adjectives-content.mjs";
import { loadNounsAdjectivesCorpus } from "./nouns-adjectives-content-model.mjs";

const webappRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(webappRoot, "content-source", "nouns-adjectives");

describe("nouns and adjectives generator", () => {
  it("builds four-option questions for every approved pairing number", async () => {
    const corpus = await loadNounsAdjectivesCorpus(sourceDir);
    const generated = buildNounsAdjectivesContent(corpus);

    const expectedQuestionCount = corpus.pairings.reduce(
      (total, pairing) =>
        total +
        Number(pairing.translations.singular !== null) +
        Number(pairing.translations.plural !== null),
      0
    );

    const questions = generated.collections.flatMap((collection) => collection.content.items);

    expect(generated.index).toHaveLength(generated.collections.length);
    expect(questions).toHaveLength(expectedQuestionCount);

    for (const question of questions) {
      expect(question.promptLanguage).toBe("el");
      expect(question.translation.length).toBeGreaterThan(0);
      expect(question).not.toHaveProperty("explanation");
      expect(new Set([question.correctAnswer, ...question.wrongAnswers]).size).toBe(4);
    }
  });

  it("formats standard and exceptional adjective constructions", async () => {
    const corpus = await loadNounsAdjectivesCorpus(sourceDir);
    const generated = buildNounsAdjectivesContent(corpus);
    const questions = generated.collections.flatMap((collection) => collection.content.items);

    expect(
      questions.find((question) => question.id === "nouns-adjectives-good-friend-singular")
        ?.correctAnswer
    ).toBe("ο καλός");
    expect(
      questions.find((question) => question.id === "nouns-adjectives-this-friend-singular")
        ?.correctAnswer
    ).toBe("αυτός ο");
    expect(
      questions.find((question) => question.id === "nouns-adjectives-some-friend-singular")
        ?.correctAnswer
    ).toBe("κάποιος");
  });
});

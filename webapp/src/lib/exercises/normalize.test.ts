import { describe, expect, it } from "vitest";
import { normalizeExerciseText } from "./normalize.ts";

describe("normalizeExerciseText", () => {
  it("trims surrounding whitespace", () => {
    expect(normalizeExerciseText("  Γεια  ")).toBe("γεια");
  });

  it("lowercases text", () => {
    expect(normalizeExerciseText("ΑΒΓ")).toBe("αβγ");
  });
});

import { describe, expect, it } from "vitest";
import {
  homeTabForScreen,
  normalizeScreenHash,
  screenFromHash,
  screenToHash,
} from "./screen-hash-router.ts";
import type { Screen } from "../types/ui.ts";

describe("screen hash router", () => {
  it.each<[Screen, string]>([
    ["home", "#/"],
    ["alphabet", "#/alphabet"],
    ["diphthongs", "#/diphthongs"],
    ["practice-single-choice-topics", "#/practice/single-choice"],
    ["practice-input-topics", "#/practice/input"],
    ["practice-listening-topics", "#/practice/listening"],
  ])("maps %s screen to %s", (screen, hash) => {
    expect(screenToHash(screen)).toBe(hash);
  });

  it.each<[string, Screen]>([
    ["#/", "home"],
    ["#/alphabet", "alphabet"],
    ["#/diphthongs", "diphthongs"],
    ["#/practice/single-choice", "practice-single-choice-topics"],
    ["#/practice/input", "practice-input-topics"],
    ["#/practice/listening", "practice-listening-topics"],
  ])("maps %s hash to %s screen", (hash, screen) => {
    expect(screenFromHash(hash)).toBe(screen);
  });

  it("falls back to home for unknown hash", () => {
    expect(screenFromHash("#/unknown")).toBe("home");
  });

  it.each([
    ["", "#/"],
    ["#", "#/"],
    ["/alphabet", "#/alphabet"],
    ["#/alphabet/", "#/alphabet"],
  ])("normalizes %s to %s", (input, expected) => {
    expect(normalizeScreenHash(input)).toBe(expected);
  });

  it("maps topic detail screens to their parent topic list hashes", () => {
    expect(screenToHash("practice-input-topic")).toBe("#/practice/input");
    expect(screenToHash("practice-single-choice-topic")).toBe("#/practice/single-choice");
    expect(screenToHash("practice-listening-topic")).toBe("#/practice/listening");
  });

  it.each<[Screen, string]>([
    ["alphabet", "theory"],
    ["diphthongs", "theory"],
    ["home", "practice"],
    ["practice-input-topics", "practice"],
    ["practice-single-choice-topics", "practice"],
    ["practice-listening-topics", "practice"],
  ])("maps %s screen to %s home tab", (screen, tab) => {
    expect(homeTabForScreen(screen)).toBe(tab);
  });
});

import type { Screen, TabKey } from "../types/ui.ts";

const HOME_HASH = "#/";

const SCREEN_TO_HASH: Record<Screen, string> = {
  home: HOME_HASH,
  alphabet: "#/alphabet",
  diphthongs: "#/diphthongs",
  "practice-single-choice-topics": "#/practice/single-choice",
  "practice-input-topics": "#/practice/input",
  "practice-input-topic": "#/practice/input",
  "practice-single-choice-topic": "#/practice/single-choice",
};

const HASH_TO_SCREEN: Record<string, Screen> = {
  [HOME_HASH]: "home",
  "#/alphabet": "alphabet",
  "#/diphthongs": "diphthongs",
  "#/practice/single-choice": "practice-single-choice-topics",
  "#/practice/input": "practice-input-topics",
};

export function normalizeScreenHash(hash: string): string {
  if (!hash || hash === "#") {
    return HOME_HASH;
  }

  const prefixedHash = hash.startsWith("#") ? hash : `#${hash}`;
  const withoutTrailingSlash = prefixedHash.length > 2 ? prefixedHash.replace(/\/+$/, "") : prefixedHash;

  return withoutTrailingSlash || HOME_HASH;
}

export function screenToHash(screen: Screen): string {
  return SCREEN_TO_HASH[screen];
}

export function screenFromHash(hash: string): Screen {
  return HASH_TO_SCREEN[normalizeScreenHash(hash)] ?? "home";
}

export function homeTabForScreen(screen: Screen): TabKey {
  if (screen === "alphabet" || screen === "diphthongs") {
    return "theory";
  }

  return "practice";
}

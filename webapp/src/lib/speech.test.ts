import { describe, expect, it } from "vitest";
import { getSpeechPlaybackTimeoutMs, normalizeSpeechOptions, selectGreekVoice } from "./speech.ts";

function voice(lang: string, name = lang): SpeechSynthesisVoice {
  return {
    default: false,
    lang,
    localService: true,
    name,
    voiceURI: name,
  };
}

describe("selectGreekVoice", () => {
  it("prefers exact Greek locale", () => {
    const exactGreek = voice("el-GR", "Greek exact");

    expect(selectGreekVoice([voice("el-CY"), voice("en-US"), exactGreek])).toBe(exactGreek);
  });

  it("falls back to any Greek locale", () => {
    const greek = voice("el-CY", "Greek Cyprus");

    expect(selectGreekVoice([voice("en-US"), greek])).toBe(greek);
  });

  it("returns undefined when Greek voice is absent", () => {
    expect(selectGreekVoice([voice("en-US"), voice("ru-RU")])).toBeUndefined();
  });
});

describe("normalizeSpeechOptions", () => {
  it("uses browser defaults when options are absent", () => {
    expect(normalizeSpeechOptions()).toEqual({
      rate: 1,
      pitch: 1,
      volume: 1,
    });
  });

  it("clamps speech option values to supported ranges", () => {
    expect(normalizeSpeechOptions({ rate: 20, pitch: -1, volume: 2 })).toEqual({
      rate: 10,
      pitch: 0,
      volume: 1,
    });
  });
});

describe("getSpeechPlaybackTimeoutMs", () => {
  it("uses a minimum timeout for short text", () => {
    expect(getSpeechPlaybackTimeoutMs("γειά")).toBe(4000);
  });

  it("caps timeout for long text", () => {
    expect(getSpeechPlaybackTimeoutMs("α".repeat(200))).toBe(30000);
  });
});

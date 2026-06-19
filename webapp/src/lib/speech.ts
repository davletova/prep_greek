import type { SpeechOptions } from "../types/ui";

const GREEK_LANG = "el-GR";
const VOICES_LOAD_TIMEOUT_MS = 800;
const MIN_PLAYBACK_TIMEOUT_MS = 4000;
const MAX_PLAYBACK_TIMEOUT_MS = 30000;
const PLAYBACK_TIMEOUT_PER_CHARACTER_MS = 300;

interface NormalizedSpeechOptions {
  rate: number;
  pitch: number;
  volume: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getSpeechSynthesis(): SpeechSynthesis | undefined {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return undefined;
  }

  return window.speechSynthesis;
}

export function selectGreekVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  return (
    voices.find((voice) => voice.lang?.toLowerCase() === GREEK_LANG.toLowerCase()) ??
    voices.find((voice) => voice.lang?.toLowerCase().startsWith("el-")) ??
    voices.find((voice) => voice.lang?.toLowerCase().startsWith("el"))
  );
}

export function loadSpeechVoices(
  speechSynthesis: SpeechSynthesis
): Promise<SpeechSynthesisVoice[]> {
  const voices = speechSynthesis.getVoices();

  if (voices.length > 0) {
    return Promise.resolve(voices);
  }

  return new Promise((resolve) => {
    const previousHandler = speechSynthesis.onvoiceschanged;

    const finish = () => {
      window.clearTimeout(timeoutId);
      speechSynthesis.onvoiceschanged = previousHandler;
      resolve(speechSynthesis.getVoices());
    };

    const timeoutId = window.setTimeout(finish, VOICES_LOAD_TIMEOUT_MS);

    speechSynthesis.onvoiceschanged = (event) => {
      previousHandler?.call(speechSynthesis, event);
      finish();
    };
  });
}

export function normalizeSpeechOptions(options: SpeechOptions = {}): NormalizedSpeechOptions {
  return {
    rate: clamp(options.rate ?? 1, 0.1, 10),
    pitch: clamp(options.pitch ?? 1, 0, 2),
    volume: clamp(options.volume ?? 1, 0, 1),
  };
}

export function getSpeechPlaybackTimeoutMs(text: string): number {
  return Math.min(
    MAX_PLAYBACK_TIMEOUT_MS,
    Math.max(MIN_PLAYBACK_TIMEOUT_MS, text.length * PLAYBACK_TIMEOUT_PER_CHARACTER_MS)
  );
}

export function cancelGreekSpeech(): void {
  getSpeechSynthesis()?.cancel();
}

export async function speakGreekText(text: string, options: SpeechOptions = {}): Promise<void> {
  const speechSynthesis = getSpeechSynthesis();

  if (!speechSynthesis) {
    console.warn("Speech synthesis is not supported in this browser.");
    return;
  }

  if (!text) {
    return;
  }

  const normalizedOptions = normalizeSpeechOptions(options);
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = GREEK_LANG;
  utterance.rate = normalizedOptions.rate;
  utterance.pitch = normalizedOptions.pitch;
  utterance.volume = normalizedOptions.volume;

  const voices = await loadSpeechVoices(speechSynthesis);
  const greekVoice = selectGreekVoice(voices);

  if (greekVoice) {
    utterance.voice = greekVoice;
  }

  return new Promise((resolve) => {
    let isSettled = false;

    const timeoutId = window.setTimeout(() => {
      console.warn("Speech synthesis timed out.");
      finish();
      speechSynthesis.cancel();
    }, getSpeechPlaybackTimeoutMs(text));

    function finish() {
      if (isSettled) {
        return;
      }

      isSettled = true;
      window.clearTimeout(timeoutId);
      utterance.onend = null;
      utterance.onerror = null;
      resolve();
    }

    utterance.onend = () => finish();
    utterance.onerror = (event) => {
      console.warn("Speech synthesis failed.", event.error);
      finish();
    };

    cancelGreekSpeech();
    speechSynthesis.speak(utterance);
  });
}

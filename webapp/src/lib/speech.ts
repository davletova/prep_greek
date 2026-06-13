import type { SpeechOptions } from "../types/ui";

const GREEK_LANG = "el-GR";
const VOICES_LOAD_TIMEOUT_MS = 800;

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

export function loadSpeechVoices(speechSynthesis: SpeechSynthesis): Promise<SpeechSynthesisVoice[]> {
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

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = GREEK_LANG;
  utterance.rate = options.rate ?? 1;

  const voices = await loadSpeechVoices(speechSynthesis);
  const greekVoice = selectGreekVoice(voices);

  if (greekVoice) {
    utterance.voice = greekVoice;
  }

  return new Promise((resolve) => {
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    cancelGreekSpeech();
    speechSynthesis.speak(utterance);
  });
}

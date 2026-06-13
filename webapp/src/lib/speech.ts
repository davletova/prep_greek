import type { SpeechOptions } from "../types/ui";

export function cancelGreekSpeech(): void {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function speakGreekText(text: string, options: SpeechOptions = {}): Promise<void> {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) {
      console.warn("Speech synthesis is not supported in this browser.");
      resolve();
      return;
    }

    if (!text) {
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "el-GR";
    utterance.rate = options.rate ?? 1;

    const voices = window.speechSynthesis.getVoices();
    const greekVoice = voices.find((voice) => voice.lang?.toLowerCase().startsWith("el"));

    if (greekVoice) {
      utterance.voice = greekVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    cancelGreekSpeech();
    window.speechSynthesis.speak(utterance);
  });
}

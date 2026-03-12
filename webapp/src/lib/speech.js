export function speakGreekText(text) {
  if (!("speechSynthesis" in window)) {
    alert("Озвучка не поддерживается в этом браузере.");
    return;
  }

  if (!text) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "el-GR";

  const voices = window.speechSynthesis.getVoices();
  const greekVoice = voices.find((voice) =>
    voice.lang?.toLowerCase().startsWith("el")
  );

  if (greekVoice) {
    utterance.voice = greekVoice;
  }

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

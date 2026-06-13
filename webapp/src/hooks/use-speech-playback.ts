import { useCallback, useRef, useState } from "react";
import { cancelGreekSpeech } from "../lib/speech.ts";
import type { SpeakHandler, SpeechOptions } from "../types/ui";

export function useSpeechPlayback<Key extends string | number>(
  onSpeak: SpeakHandler
): {
  activeKey: Key | null;
  isSpeaking: (key: Key) => boolean;
  play: (key: Key, text: string, options?: SpeechOptions) => Promise<void>;
  clear: () => void;
  stop: () => void;
} {
  const [activeKey, setActiveKey] = useState<Key | null>(null);
  const playbackIdRef = useRef(0);

  const clear = useCallback(() => {
    playbackIdRef.current += 1;
    setActiveKey(null);
  }, []);

  const stop = useCallback(() => {
    cancelGreekSpeech();
    clear();
  }, [clear]);

  const isSpeaking = useCallback((key: Key) => activeKey === key, [activeKey]);

  const play = useCallback(
    async (key: Key, text: string, options?: SpeechOptions) => {
      if (activeKey === key) {
        return;
      }

      playbackIdRef.current += 1;
      const playbackId = playbackIdRef.current;
      setActiveKey(key);

      try {
        await onSpeak(text, options);
      } finally {
        if (playbackIdRef.current === playbackId) {
          setActiveKey(null);
        }
      }
    },
    [activeKey, onSpeak]
  );

  return {
    activeKey,
    isSpeaking,
    play,
    clear,
    stop,
  };
}

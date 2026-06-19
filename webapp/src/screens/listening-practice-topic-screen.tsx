import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ListeningExerciseCard from "../components/listening-exercise-card.tsx";
import PracticeEmptyState from "../components/practice-empty-state.tsx";
import PracticeLoadingState from "../components/practice-loading-state.tsx";
import PracticeScreenShell from "../components/practice-screen-shell.tsx";
import { useDelayedLoading } from "../hooks/use-delayed-loading.ts";
import { useExerciseSession } from "../hooks/use-exercise-session.ts";
import { useListeningPracticeAnswer } from "../hooks/use-listening-practice-answer.ts";
import { useListeningRuntimeQuestion } from "../hooks/use-listening-runtime-question.ts";
import { useSpeechPlayback } from "../hooks/use-speech-playback.ts";
import { getListeningExercises } from "../lib/exercises/filter.ts";
import type { ExerciseCollection, ListeningAudioSource } from "../types/exercises";
import type { LoadableState, SpeakHandler, VoidHandler } from "../types/ui";

interface ListeningPracticeTopicScreenProps {
  title: string;
  topicState: LoadableState<ExerciseCollection>;
  onClose: VoidHandler;
  onRetry: VoidHandler;
  onSpeak: SpeakHandler;
}

export default function ListeningPracticeTopicScreen({
  title,
  topicState,
  onClose,
  onRetry,
  onSpeak,
}: ListeningPracticeTopicScreenProps) {
  const showLoading = useDelayedLoading(topicState.status === "loading");
  const exercises = useMemo(() => getListeningExercises(topicState.data), [topicState.data]);
  const { currentItem: exercise, hasItems, next } = useExerciseSession(exercises);
  const speech = useSpeechPlayback<string>(onSpeak);
  const {
    clear: clearSpeech,
    stop: stopSpeech,
    isSpeaking: isSpeechSpeaking,
    play: playSpeech,
  } = speech;
  const question = useListeningRuntimeQuestion(exercise);
  const [isFileAudioPlaying, setIsFileAudioPlaying] = useState(false);
  const [playbackError, setPlaybackError] = useState("");
  const fileAudioRef = useRef<HTMLAudioElement | null>(null);
  const filePlaybackIdRef = useRef(0);
  const finishFilePlaybackRef = useRef<(() => void) | null>(null);

  const stopFilePlayback = useCallback(() => {
    filePlaybackIdRef.current += 1;
    finishFilePlaybackRef.current?.();
    finishFilePlaybackRef.current = null;

    const player = fileAudioRef.current;
    if (player) {
      player.pause();
      player.removeAttribute("src");
      player.load();
    }

    fileAudioRef.current = null;
    setIsFileAudioPlaying(false);
  }, []);

  const stopAllPlayback = useCallback(() => {
    stopSpeech();
    stopFilePlayback();
  }, [stopSpeech, stopFilePlayback]);

  const clearAllPlayback = useCallback(() => {
    clearSpeech();
    stopFilePlayback();
    setPlaybackError("");
  }, [clearSpeech, stopFilePlayback]);

  const { hasAnswered, selectAnswer, resetAnswer, getAnswerClassName } = useListeningPracticeAnswer(
    question,
    clearAllPlayback
  );

  useEffect(() => {
    setPlaybackError("");
  }, [question?.id]);

  useEffect(() => stopAllPlayback, [stopAllPlayback]);

  const playFileAudio = useCallback(
    async (audio: Extract<ListeningAudioSource, { kind: "file" }>) => {
      stopAllPlayback();
      setPlaybackError("");

      const player = new Audio(audio.src);
      const playbackId = filePlaybackIdRef.current + 1;
      filePlaybackIdRef.current = playbackId;
      fileAudioRef.current = player;
      setIsFileAudioPlaying(true);

      try {
        await new Promise<void>((resolve, reject) => {
          let settled = false;

          const cleanup = () => {
            player.onended = null;
            player.onerror = null;
            if (finishFilePlaybackRef.current === finish) {
              finishFilePlaybackRef.current = null;
            }
          };

          const finish = (error?: Error) => {
            if (settled) {
              return;
            }

            settled = true;
            cleanup();

            if (error) {
              reject(error);
              return;
            }

            resolve();
          };

          finishFilePlaybackRef.current = () => finish();
          player.onended = () => finish();
          player.onerror = () => finish(new Error("Не удалось загрузить или воспроизвести аудио."));

          const playPromise = player.play();
          if (playPromise) {
            playPromise.catch(() => {
              finish(new Error("Браузер не разрешил воспроизвести аудио."));
            });
          }
        });
      } catch (error) {
        if (filePlaybackIdRef.current === playbackId) {
          setPlaybackError(
            error instanceof Error ? error.message : "Не удалось воспроизвести аудио."
          );
        }
      } finally {
        if (filePlaybackIdRef.current === playbackId) {
          fileAudioRef.current = null;
          setIsFileAudioPlaying(false);
        }
      }
    },
    [stopAllPlayback]
  );

  const handlePlayAudio = async () => {
    if (!question || isSpeechSpeaking("audio") || isFileAudioPlaying) {
      return;
    }

    if (question.audio.kind === "file") {
      await playFileAudio(question.audio);
      return;
    }

    stopFilePlayback();
    setPlaybackError("");

    try {
      await playSpeech("audio", question.audio.text, {
        ...(question.audio.rate === undefined ? {} : { rate: question.audio.rate }),
        ...(question.audio.pitch === undefined ? {} : { pitch: question.audio.pitch }),
        ...(question.audio.volume === undefined ? {} : { volume: question.audio.volume }),
      });
    } catch (error) {
      setPlaybackError(error instanceof Error ? error.message : "Не удалось воспроизвести аудио.");
    }
  };

  const handleNextQuestion = () => {
    if (!hasAnswered || !hasItems) {
      return;
    }

    stopAllPlayback();
    next();
    resetAnswer();
  };

  const handleClose = () => {
    stopAllPlayback();
    onClose();
  };

  const isAudioPlaying = isSpeechSpeaking("audio") || isFileAudioPlaying;

  return (
    <PracticeScreenShell title={title} mainClassName="practice-flow" onClose={handleClose}>
      {topicState.status === "loading" ? (
        showLoading ? (
          <PracticeLoadingState
            status={topicState.status}
            error={topicState.error}
            loadingText="Подготавливаем упражнения на слух."
            onRetry={onRetry}
          />
        ) : null
      ) : topicState.status === "error" ? (
        <PracticeLoadingState
          status={topicState.status}
          error={topicState.error}
          loadingText="Подготавливаем упражнения на слух."
          onRetry={onRetry}
        />
      ) : exercises.length === 0 || !question ? (
        <PracticeEmptyState
          title="Нет упражнений для аудирования"
          text="Не удалось найти listening упражнение в файле."
        />
      ) : (
        <>
          <div className="practice-flow__body">
            <ListeningExerciseCard
              question={question}
              hasAnswered={hasAnswered}
              isAudioPlaying={isAudioPlaying}
              playbackError={playbackError}
              getAnswerClassName={getAnswerClassName}
              onPlayAudio={handlePlayAudio}
              onSelectAnswer={selectAnswer}
            />
          </div>

          <button
            className="nav-button nav-button--primary practice-flow__next"
            type="button"
            onClick={handleNextQuestion}
            disabled={!hasAnswered}
          >
            Далее
          </button>
        </>
      )}
    </PracticeScreenShell>
  );
}

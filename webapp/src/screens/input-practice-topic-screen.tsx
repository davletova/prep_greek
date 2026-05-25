import { useMemo } from "react";
import PlaybackIcon from "../components/playback-icon.tsx";
import PracticeEmptyState from "../components/practice-empty-state.tsx";
import PracticeLoadingState from "../components/practice-loading-state.tsx";
import PracticeScreenShell from "../components/practice-screen-shell.tsx";
import { useExerciseSession } from "../hooks/use-exercise-session.ts";
import { useInputPracticeAnswer } from "../hooks/use-input-practice-answer.ts";
import { useSpeechPlayback } from "../hooks/use-speech-playback.ts";
import { getInputExercises } from "../lib/exercises/filter.ts";
import type { InputExercise } from "../types/exercises";
import type { LoadableState, SpeakHandler, VoidHandler } from "../types/ui";

interface InputPracticeTopicScreenProps {
  title: string;
  topicState: LoadableState<InputExercise[]>;
  onClose: VoidHandler;
  onRetry: VoidHandler;
  onSpeak: SpeakHandler;
}

export default function InputPracticeTopicScreen({
  title,
  topicState,
  onClose,
  onRetry,
  onSpeak,
}: InputPracticeTopicScreenProps) {
  const exercises = useMemo(() => getInputExercises(topicState.data), [topicState.data]);
  const { currentItem: exercise, hasItems, next } = useExerciseSession(exercises);
  const speech = useSpeechPlayback<"prompt">(onSpeak);
  const { clear: clearSpeech, stop: stopSpeech } = speech;
  const {
    answerValue,
    setAnswerValue,
    hasChecked,
    canCheck,
    isCorrect,
    checkAnswer
  } = useInputPracticeAnswer(exercise, clearSpeech);

  const handlePlayPrompt = async () => {
    if (!exercise || !hasChecked || speech.isSpeaking("prompt")) {
      return;
    }

    await speech.play("prompt", exercise.correctAnswer);
  };

  const handleNextQuestion = () => {
    if (!hasChecked || !hasItems) {
      return;
    }

    stopSpeech();
    next();
  };

  const handleClose = () => {
    stopSpeech();
    onClose();
  };

  return (
    <PracticeScreenShell
      title={title}
      mainClassName="input-practice-flow"
      onClose={handleClose}
    >
        {topicState.status === "loading" || topicState.status === "error" ? (
          <PracticeLoadingState
            status={topicState.status}
            error={topicState.error}
            loadingText="Подготавливаем задание для ввода ответа."
            onRetry={onRetry}
          />
        ) : exercises.length === 0 || !exercise ? (
          <PracticeEmptyState
            title="Нет данных для предпросмотра"
            text="Не удалось найти упражнение input в файле."
          />
        ) : (
          <>
            <div className="input-practice-flow__body">
              <section className="practice-card input-practice-card">
                <div className="input-practice-card__prompt-block">
                  <p className="practice-card__question">{exercise.prompt}</p>
                  {exercise.context ? (
                    <p className="input-practice-card__context">{exercise.context}</p>
                  ) : null}
                </div>

                <button
                  className={`alphabet-card__play practice-card__play input-practice-card__play ${
                    speech.isSpeaking("prompt") ? "practice-card__play--active" : ""
                  }`}
                  type="button"
                  aria-label={`Озвучить ${exercise.correctAnswer}`}
                  onClick={handlePlayPrompt}
                  disabled={!hasChecked || speech.isSpeaking("prompt")}
                >
                  <PlaybackIcon isPlaying={speech.isSpeaking("prompt")} />
                </button>

                <div className="input-practice-card__input-wrap">
                  <p
                    className={`input-practice-card__correct-answer ${
                      hasChecked ? "" : "input-practice-card__correct-answer--hidden"
                    }`}
                  >
                    {exercise.correctAnswer}
                  </p>
                  <input
                    className={`input-practice-card__input-line ${
                      hasChecked
                        ? isCorrect
                          ? "input-practice-card__input-line--correct"
                          : "input-practice-card__input-line--wrong"
                        : ""
                    }`}
                    type="text"
                    value={answerValue}
                    onChange={(event) => setAnswerValue(event.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                    aria-label="Введите ответ"
                    disabled={hasChecked}
                  />
                </div>
              </section>
            </div>

            <div className="input-practice-flow__actions">
              <button
                className="nav-button"
                type="button"
                onClick={checkAnswer}
                disabled={!canCheck}
              >
                Проверить
              </button>
              <button
                className="nav-button nav-button--primary"
                type="button"
                onClick={handleNextQuestion}
                disabled={!hasChecked}
              >
                Далее
              </button>
            </div>
          </>
        )}
    </PracticeScreenShell>
  );
}

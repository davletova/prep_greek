import { useEffect, useMemo, useState } from "react";
import ContentState from "../components/content-state.tsx";
import PlaybackIcon from "../components/playback-icon.tsx";
import { useShuffledExerciseFlow } from "../hooks/use-shuffled-exercise-flow.ts";
import { useSpeechPlayback } from "../hooks/use-speech-playback.ts";
import { checkInputExerciseAnswer } from "../lib/exercises/check.ts";
import type { InputExercise } from "../types/exercises";
import type { LoadableState, SpeakHandler, VoidHandler } from "../types/ui";

interface InputPracticeTopicScreenProps {
  title: string;
  topicState: LoadableState<InputExercise[]>;
  onClose: VoidHandler;
  onRetry: VoidHandler;
  onSpeak: SpeakHandler;
}

function getInputExercises(exercises: InputExercise[] | null): InputExercise[] {
  return exercises?.filter((exercise) => exercise.type === "input") ?? [];
}

export default function InputPracticeTopicScreen({
  title,
  topicState,
  onClose,
  onRetry,
  onSpeak
}: InputPracticeTopicScreenProps) {
  const exercises = useMemo(() => getInputExercises(topicState.data), [topicState.data]);
  const { currentItem: exercise, hasItems, next } =
    useShuffledExerciseFlow(exercises);
  const [answerValue, setAnswerValue] = useState("");
  const [hasChecked, setHasChecked] = useState(false);
  const speech = useSpeechPlayback<"prompt">(onSpeak);
  const { clear: clearSpeech, stop: stopSpeech } = speech;

  useEffect(() => {
    setAnswerValue("");
    setHasChecked(false);
    clearSpeech();
  }, [exercise?.id, clearSpeech]);

  const trimmedAnswerValue = answerValue.trim();
  const canCheck = trimmedAnswerValue.length > 0 && !hasChecked;
  const isCorrect = hasChecked && exercise
    ? checkInputExerciseAnswer(exercise, {
        type: "input",
        value: trimmedAnswerValue
      }).correct
    : false;

  const handlePlayPrompt = async () => {
    if (!exercise || !hasChecked || speech.isSpeaking("prompt")) {
      return;
    }

    await speech.play("prompt", exercise.correctAnswer);
  };

  const handleCheck = () => {
    if (!exercise || !canCheck) {
      return;
    }

    setAnswerValue(trimmedAnswerValue);
    setHasChecked(true);
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
    <>
      <header className="app__header app__header--compact">
        <div>
          <h1 className="app__title app__title--small">{title}</h1>
        </div>
        <button
          className="close-button"
          type="button"
          onClick={handleClose}
          aria-label="Закрыть"
        >
          ×
        </button>
      </header>

      <main className="input-practice-flow">
        {topicState.status === "loading" ? (
          <ContentState
            title="Загружаем упражнения…"
            text="Подготавливаем задание для ввода ответа."
          />
        ) : topicState.status === "error" ? (
          <ContentState
            title="Не удалось загрузить упражнения"
            text={topicState.error}
            actionLabel="Попробовать снова"
            onAction={onRetry}
            tone="error"
          />
        ) : exercises.length === 0 || !exercise ? (
          <ContentState
            title="Нет данных для предпросмотра"
            text="Не удалось найти упражнение input в файле."
            tone="error"
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
                onClick={handleCheck}
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
      </main>
    </>
  );
}

import { useState } from "react";
import ContentState from "../components/content-state.tsx";
import { cancelGreekSpeech } from "../lib/speech.ts";
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
  onSpeak
}: InputPracticeTopicScreenProps) {
  const exercise = topicState.data?.[0] ?? null;
  const [answerValue, setAnswerValue] = useState("");
  const [isPromptSpeaking, setIsPromptSpeaking] = useState(false);

  const handlePlayPrompt = async () => {
    if (!exercise || isPromptSpeaking) {
      return;
    }

    setIsPromptSpeaking(true);

    try {
      await onSpeak(exercise.correctAnswer);
    } finally {
      setIsPromptSpeaking(false);
    }
  };

  const handleClose = () => {
    cancelGreekSpeech();
    setIsPromptSpeaking(false);
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
        ) : !exercise ? (
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
                    isPromptSpeaking ? "practice-card__play--active" : ""
                  }`}
                  type="button"
                  aria-label={`Озвучить ${exercise.correctAnswer}`}
                  onClick={handlePlayPrompt}
                  disabled={isPromptSpeaking}
                >
                  {isPromptSpeaking ? "◼" : "▶"}
                </button>

                <div className="input-practice-card__input-wrap">
                  <p className="input-practice-card__correct-answer">
                    {exercise.correctAnswer}
                  </p>
                  <input
                    className="input-practice-card__input-line"
                    type="text"
                    value={answerValue}
                    onChange={(event) => setAnswerValue(event.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                    aria-label="Введите ответ"
                  />
                </div>
              </section>
            </div>

            <div className="input-practice-flow__actions">
              <button className="nav-button" type="button" disabled>
                Проверить
              </button>
              <button className="nav-button nav-button--primary" type="button" disabled>
                Далее
              </button>
            </div>
          </>
        )}
      </main>
    </>
  );
}

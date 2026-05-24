import { useEffect, useMemo, useState } from "react";
import ContentState from "../components/content-state.tsx";
import PlaybackIcon from "../components/playback-icon.tsx";
import { useShuffledExerciseFlow } from "../hooks/use-shuffled-exercise-flow.ts";
import { buildSingleChoiceRuntimeQuestion } from "../lib/exercises/build-single-choice-runtime-question.ts";
import { cancelGreekSpeech } from "../lib/speech.ts";
import type {
  ExerciseCollection,
  SingleChoiceExercise
} from "../types/exercises";
import type { LoadableState, SpeakHandler, VoidHandler } from "../types/ui";

interface PracticeTopicScreenProps {
  title: string;
  topicState: LoadableState<ExerciseCollection>;
  onClose: VoidHandler;
  onRetry: VoidHandler;
  onSpeak: SpeakHandler;
}

function getSingleChoiceExercises(
  collection: ExerciseCollection | null
): SingleChoiceExercise[] {
  return (
    collection?.items.filter(
      (exercise): exercise is SingleChoiceExercise =>
        exercise.type === "single-choice"
    ) ?? []
  );
}

export default function PracticeTopicScreen({
  title,
  topicState,
  onClose,
  onRetry,
  onSpeak
}: PracticeTopicScreenProps) {
  const exercises = useMemo(
    () => getSingleChoiceExercises(topicState.data),
    [topicState.data]
  );
  const { currentItem: exercise, hasItems, next } =
    useShuffledExerciseFlow(exercises);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isPromptSpeaking, setIsPromptSpeaking] = useState(false);
  const [speakingOptionIndex, setSpeakingOptionIndex] = useState<number | null>(null);

  useEffect(() => {
    setSelectedIndex(null);
    setIsPromptSpeaking(false);
    setSpeakingOptionIndex(null);
  }, [exercise?.id]);
  const question = useMemo(
    () => (exercise ? buildSingleChoiceRuntimeQuestion(exercise) : null),
    [exercise]
  );
  const hasAnswered = selectedIndex !== null;
  const isPromptInRussian = question?.promptLanguage === "ru";
  const isPromptInGreek = question?.promptLanguage === "el";

  const getAnswerClassName = (index: number) => {
    if (!question || selectedIndex === null) {
      return "practice-card__answer";
    }

    if (index === question.correctIndex) {
      return "practice-card__answer practice-card__answer--correct";
    }

    if (index === selectedIndex) {
      return "practice-card__answer practice-card__answer--wrong";
    }

    return "practice-card__answer";
  };

  const handlePlayPrompt = async () => {
    if (!question || isPromptSpeaking) {
      return;
    }

    setIsPromptSpeaking(true);

    try {
      await onSpeak(question.prompt);
    } finally {
      setIsPromptSpeaking(false);
    }
  };

  const handlePlayOption = async (option: string, optionIndex: number) => {
    if (speakingOptionIndex !== null) {
      return;
    }

    setIsPromptSpeaking(false);
    setSpeakingOptionIndex(optionIndex);

    try {
      await onSpeak(option);
    } finally {
      setSpeakingOptionIndex(null);
    }
  };

  const handleNextQuestion = () => {
    if (!hasAnswered || !hasItems) {
      return;
    }

    cancelGreekSpeech();
    setIsPromptSpeaking(false);
    setSpeakingOptionIndex(null);
    next();
    setSelectedIndex(null);
  };

  const handleClose = () => {
    cancelGreekSpeech();
    setIsPromptSpeaking(false);
    setSpeakingOptionIndex(null);
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

      <main className="practice-flow">
        {topicState.status === "loading" ? (
          <ContentState
            title="Загружаем упражнения…"
            text="Подготавливаем вопросы для тренировки."
          />
        ) : topicState.status === "error" ? (
          <ContentState
            title="Не удалось загрузить упражнения"
            text={topicState.error}
            actionLabel="Попробовать снова"
            onAction={onRetry}
            tone="error"
          />
        ) : exercises.length === 0 || !question ? (
          <ContentState
            title="Нет вопросов для предпросмотра"
            text="Не удалось найти single-choice упражнение в файле."
            tone="error"
          />
        ) : (
          <>
            <div className="practice-flow__body">
              <section className="practice-card">
                <p className="practice-card__question">{question?.prompt}</p>

                {!isPromptInRussian ? (
                  <div className="practice-card__play-wrap">
                    <button
                      className={`alphabet-card__play practice-card__play ${
                        isPromptInGreek ? "practice-card__play--el" : ""
                      } ${isPromptSpeaking ? "practice-card__play--active" : ""}`}
                      type="button"
                      aria-label={`Озвучить ${question.prompt}`}
                      onClick={handlePlayPrompt}
                      disabled={isPromptSpeaking}
                    >
                      <PlaybackIcon isPlaying={isPromptSpeaking} />
                    </button>
                  </div>
                ) : null}

                <div className="practice-card__answers">
                  {question?.options.map((option, index) =>
                    isPromptInRussian ? (
                      <div
                        key={`${question.id}-${index}`}
                        className="practice-card__answer-row"
                      >
                        <button
                          className={getAnswerClassName(index)}
                          type="button"
                          onClick={() => setSelectedIndex(index)}
                          disabled={hasAnswered}
                        >
                          {option}
                        </button>
                        <button
                          className={`alphabet-card__play practice-card__answer-play ${
                            speakingOptionIndex === index
                              ? "practice-card__play--active"
                              : ""
                          }`}
                          type="button"
                          aria-label={`Озвучить вариант ${option}`}
                          onClick={() => handlePlayOption(option, index)}
                          disabled={speakingOptionIndex !== null}
                        >
                          <PlaybackIcon isPlaying={speakingOptionIndex === index} />
                        </button>
                      </div>
                    ) : (
                      <button
                        key={`${question.id}-${option}`}
                        className={getAnswerClassName(index)}
                        type="button"
                        onClick={() => setSelectedIndex(index)}
                        disabled={hasAnswered}
                      >
                        {option}
                      </button>
                    )
                  )}
                </div>
              </section>
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
      </main>
    </>
  );
}

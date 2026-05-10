import { useEffect, useMemo, useState } from "react";
import ContentState from "../components/content-state.tsx";
import { buildSingleChoiceRuntimeQuestion } from "../lib/exercises/build-single-choice-runtime-question.ts";
import type {
  ExerciseCollection,
  SingleChoiceExercise
} from "../types/exercises";
import type { LoadableState, VoidHandler } from "../types/ui";

interface PracticeTopicScreenProps {
  title: string;
  topicState: LoadableState<ExerciseCollection>;
  onClose: VoidHandler;
  onRetry: VoidHandler;
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

function createShuffledIndices(size: number): number[] {
  const indices = Array.from({ length: size }, (_, index) => index);

  for (let index = indices.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = indices[index];
    indices[index] = indices[swapIndex];
    indices[swapIndex] = current;
  }

  return indices;
}

export default function PracticeTopicScreen({
  title,
  topicState,
  onClose,
  onRetry
}: PracticeTopicScreenProps) {
  const exercises = useMemo(
    () => getSingleChoiceExercises(topicState.data),
    [topicState.data]
  );
  const shuffledIndices = useMemo(
    () => createShuffledIndices(exercises.length),
    [exercises]
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    setCurrentQuestionIndex(0);
    setSelectedIndex(null);
  }, [shuffledIndices]);

  const exercise =
    shuffledIndices.length > 0
      ? exercises[shuffledIndices[currentQuestionIndex]]
      : null;
  const question = useMemo(
    () => (exercise ? buildSingleChoiceRuntimeQuestion(exercise) : null),
    [exercise]
  );
  const hasAnswered = selectedIndex !== null;

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

  const handleNextQuestion = () => {
    if (!hasAnswered || shuffledIndices.length === 0) {
      return;
    }

    setCurrentQuestionIndex((prev) => (prev + 1) % shuffledIndices.length);
    setSelectedIndex(null);
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
          onClick={onClose}
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

                <div className="practice-card__answers">
                  {question?.options.map((option, index) => (
                    <button
                      key={`${question.id}-${option}`}
                      className={getAnswerClassName(index)}
                      type="button"
                      onClick={() => setSelectedIndex(index)}
                      disabled={hasAnswered}
                    >
                      {option}
                    </button>
                  ))}
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

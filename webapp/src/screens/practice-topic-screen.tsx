import { useMemo } from "react";
import ContentState from "../components/content-state.tsx";
import DetailScreenHeader from "../components/detail-screen-header.tsx";
import PlaybackIcon from "../components/playback-icon.tsx";
import { useExerciseSession } from "../hooks/use-exercise-session.ts";
import { useSingleChoicePracticeAnswer } from "../hooks/use-single-choice-practice-answer.ts";
import { useSingleChoiceRuntimeQuestion } from "../hooks/use-single-choice-runtime-question.ts";
import { useSpeechPlayback } from "../hooks/use-speech-playback.ts";
import { getSingleChoiceExercises } from "../lib/exercises/filter.ts";
import type { ExerciseCollection } from "../types/exercises";
import type { LoadableState, SpeakHandler, VoidHandler } from "../types/ui";

interface PracticeTopicScreenProps {
  title: string;
  topicState: LoadableState<ExerciseCollection>;
  onClose: VoidHandler;
  onRetry: VoidHandler;
  onSpeak: SpeakHandler;
}

export default function PracticeTopicScreen({
  title,
  topicState,
  onClose,
  onRetry,
  onSpeak,
}: PracticeTopicScreenProps) {
  const exercises = useMemo(() => getSingleChoiceExercises(topicState.data), [topicState.data]);
  const { currentItem: exercise, hasItems, next } = useExerciseSession(exercises);
  const speech = useSpeechPlayback<string>(onSpeak);
  const { clear: clearSpeech, stop: stopSpeech } = speech;
  const question = useSingleChoiceRuntimeQuestion(exercise);
  const { hasAnswered, selectAnswer, resetAnswer, getAnswerClassName } =
    useSingleChoicePracticeAnswer(question, clearSpeech);
  const isPromptInRussian = question?.promptLanguage === "ru";
  const isPromptInGreek = question?.promptLanguage === "el";

  const handlePlayPrompt = async () => {
    if (!question || speech.isSpeaking("prompt")) {
      return;
    }

    await speech.play("prompt", question.prompt);
  };

  const handlePlayOption = async (option: string, optionIndex: number) => {
    const optionKey = `option-${optionIndex}`;

    if (speech.isSpeaking(optionKey)) {
      return;
    }

    await speech.play(optionKey, option);
  };

  const handleNextQuestion = () => {
    if (!hasAnswered || !hasItems) {
      return;
    }

    stopSpeech();
    next();
    resetAnswer();
  };

  const handleClose = () => {
    stopSpeech();
    onClose();
  };

  return (
    <>
      <DetailScreenHeader title={title} onClose={handleClose} />

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
                      } ${speech.isSpeaking("prompt") ? "practice-card__play--active" : ""}`}
                      type="button"
                      aria-label={`Озвучить ${question.prompt}`}
                      onClick={handlePlayPrompt}
                      disabled={speech.isSpeaking("prompt")}
                    >
                      <PlaybackIcon isPlaying={speech.isSpeaking("prompt")} />
                    </button>
                  </div>
                ) : null}

                <div className="practice-card__answers">
                  {question?.options.map((option, index) =>
                    isPromptInRussian ? (
                      <div key={`${question.id}-${index}`} className="practice-card__answer-row">
                        <button
                          className={getAnswerClassName(index)}
                          type="button"
                          onClick={() => selectAnswer(index)}
                          disabled={hasAnswered}
                        >
                          {option}
                        </button>
                        <button
                          className={`alphabet-card__play practice-card__answer-play ${
                            speech.isSpeaking(`option-${index}`)
                              ? "practice-card__play--active"
                              : ""
                          }`}
                          type="button"
                          aria-label={`Озвучить вариант ${option}`}
                          onClick={() => handlePlayOption(option, index)}
                          disabled={speech.isSpeaking(`option-${index}`)}
                        >
                          <PlaybackIcon isPlaying={speech.isSpeaking(`option-${index}`)} />
                        </button>
                      </div>
                    ) : (
                      <button
                        key={`${question.id}-${option}`}
                        className={getAnswerClassName(index)}
                        type="button"
                        onClick={() => selectAnswer(index)}
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

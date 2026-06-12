import { useMemo } from "react";
import SingleChoiceExerciseCard from "../components/single-choice-exercise-card.tsx";
import PracticeEmptyState from "../components/practice-empty-state.tsx";
import PracticeLoadingState from "../components/practice-loading-state.tsx";
import PracticeScreenShell from "../components/practice-screen-shell.tsx";
import { useDelayedLoading } from "../hooks/use-delayed-loading.ts";
import { useExerciseSession } from "../hooks/use-exercise-session.ts";
import { useSingleChoicePracticeAnswer } from "../hooks/use-single-choice-practice-answer.ts";
import { useSingleChoiceRuntimeQuestion } from "../hooks/use-single-choice-runtime-question.ts";
import { useSpeechPlayback } from "../hooks/use-speech-playback.ts";
import { getSingleChoiceExercises } from "../lib/exercises/filter.ts";
import type { ExerciseCollection } from "../types/exercises";
import type { LoadableState, SpeakHandler, VoidHandler } from "../types/ui";

interface SingleChoicePracticeTopicScreenProps {
  title: string;
  topicState: LoadableState<ExerciseCollection>;
  onClose: VoidHandler;
  onRetry: VoidHandler;
  onSpeak: SpeakHandler;
}

export default function SingleChoicePracticeTopicScreen({
  title,
  topicState,
  onClose,
  onRetry,
  onSpeak,
}: SingleChoicePracticeTopicScreenProps) {
  const showLoading = useDelayedLoading(topicState.status === "loading");
  const exercises = useMemo(() => getSingleChoiceExercises(topicState.data), [topicState.data]);
  const showTranslationHint = topicState.data?.settings?.showTranslationHint === true;
  const { currentItem: exercise, hasItems, next } = useExerciseSession(exercises);
  const speech = useSpeechPlayback<string>(onSpeak);
  const { clear: clearSpeech, stop: stopSpeech } = speech;
  const question = useSingleChoiceRuntimeQuestion(exercise);
  const { hasAnswered, selectAnswer, resetAnswer, getAnswerClassName } =
    useSingleChoicePracticeAnswer(question, clearSpeech);
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
    <PracticeScreenShell title={title} mainClassName="practice-flow" onClose={handleClose}>
        {topicState.status === "loading" ? (
          showLoading ? (
            <PracticeLoadingState
              status={topicState.status}
              error={topicState.error}
              loadingText="Подготавливаем вопросы для тренировки."
              onRetry={onRetry}
            />
          ) : null
        ) : topicState.status === "error" ? (
          <PracticeLoadingState
            status={topicState.status}
            error={topicState.error}
            loadingText="Подготавливаем вопросы для тренировки."
            onRetry={onRetry}
          />
        ) : exercises.length === 0 || !question ? (
          <PracticeEmptyState
            title="Нет вопросов для предпросмотра"
            text="Не удалось найти single-choice упражнение в файле."
          />
        ) : (
          <>
            <div className="practice-flow__body">
              <SingleChoiceExerciseCard
                question={question}
                hasAnswered={hasAnswered}
                showTranslationHint={showTranslationHint}
                isPromptSpeaking={speech.isSpeaking("prompt")}
                isOptionSpeaking={(optionIndex) => speech.isSpeaking(`option-${optionIndex}`)}
                getAnswerClassName={getAnswerClassName}
                onPlayPrompt={handlePlayPrompt}
                onPlayOption={handlePlayOption}
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

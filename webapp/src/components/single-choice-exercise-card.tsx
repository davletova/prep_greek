import { useEffect, useState } from "react";
import ExerciseHintDialog from "./exercise-hint-dialog.tsx";
import PlaybackIcon from "./playback-icon.tsx";
import type { SingleChoiceRuntimeQuestion } from "../types/exercises.ts";

interface SingleChoiceExerciseCardProps {
  question: SingleChoiceRuntimeQuestion;
  currentPosition: number;
  totalQuestions: number;
  hasAnswered: boolean;
  showTranslationHint: boolean;
  isPromptSpeaking: boolean;
  isOptionSpeaking: (optionIndex: number) => boolean;
  getAnswerClassName: (index: number) => string;
  onPlayPrompt: () => void;
  onPlayOption: (option: string, optionIndex: number) => void;
  onSelectAnswer: (index: number) => void;
}

export default function SingleChoiceExerciseCard({
  question,
  currentPosition,
  totalQuestions,
  hasAnswered,
  showTranslationHint,
  isPromptSpeaking,
  isOptionSpeaking,
  getAnswerClassName,
  onPlayPrompt,
  onPlayOption,
  onSelectAnswer,
}: SingleChoiceExerciseCardProps) {
  const [isHintOpen, setIsHintOpen] = useState(false);
  const isPromptInRussian = question.promptLanguage === "ru";
  const isPromptInGreek = question.promptLanguage === "el";
  const translationHint = showTranslationHint ? question.translation : undefined;
  const hint = question.hint?.trim();

  useEffect(() => {
    setIsHintOpen(false);
  }, [question.id]);

  return (
    <section className="practice-card">
      <span
        className="practice-card__progress"
        aria-label={`Вопрос ${currentPosition} из ${totalQuestions}`}
      >
        {currentPosition} / {totalQuestions}
      </span>

      {hint ? (
        <button
          className="practice-card__hint-button"
          type="button"
          aria-label="Открыть подсказку"
          onClick={() => setIsHintOpen(true)}
        >
          i
        </button>
      ) : null}

      <div className="practice-card__prompt-block">
        <p className="practice-card__question">{question.prompt}</p>
        {translationHint ? (
          <p className="practice-card__translation-hint" aria-label={`Перевод: ${translationHint}`}>
            {translationHint}
          </p>
        ) : null}
      </div>

      {!isPromptInRussian ? (
        <div className="practice-card__play-wrap">
          <button
            className={`alphabet-card__play practice-card__play ${
              isPromptInGreek ? "practice-card__play--el" : ""
            } ${isPromptSpeaking ? "practice-card__play--active" : ""}`}
            type="button"
            aria-label={`Озвучить ${question.prompt}`}
            onClick={onPlayPrompt}
            disabled={isPromptSpeaking}
          >
            <PlaybackIcon isPlaying={isPromptSpeaking} />
          </button>
        </div>
      ) : null}

      <div className="practice-card__answers">
        {question.options.map((option, index) =>
          isPromptInRussian ? (
            <div key={`${question.id}-${index}`} className="practice-card__answer-row">
              <button
                className={getAnswerClassName(index)}
                type="button"
                onClick={() => onSelectAnswer(index)}
                disabled={hasAnswered}
              >
                {option}
              </button>
              <button
                className={`alphabet-card__play practice-card__answer-play ${
                  isOptionSpeaking(index) ? "practice-card__play--active" : ""
                }`}
                type="button"
                aria-label={`Озвучить вариант ${option}`}
                onClick={() => onPlayOption(option, index)}
                disabled={isOptionSpeaking(index)}
              >
                <PlaybackIcon isPlaying={isOptionSpeaking(index)} />
              </button>
            </div>
          ) : (
            <button
              key={`${question.id}-${option}`}
              className={getAnswerClassName(index)}
              type="button"
              onClick={() => onSelectAnswer(index)}
              disabled={hasAnswered}
            >
              {option}
            </button>
          )
        )}
      </div>

      {hint && isHintOpen ? (
        <ExerciseHintDialog hint={hint} onClose={() => setIsHintOpen(false)} />
      ) : null}
    </section>
  );
}

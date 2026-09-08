import { useEffect, useLayoutEffect, useRef, useState } from "react";
import ExerciseHintDialog from "./exercise-hint-dialog.tsx";
import PlaybackIcon from "./playback-icon.tsx";
import type { InputExercise } from "../types/exercises.ts";

interface InputExerciseCardProps {
  exercise: InputExercise;
  answerValue: string;
  hasChecked: boolean;
  isCorrect: boolean;
  isSpeakingPrompt: boolean;
  onAnswerChange: (value: string) => void;
  onPlayPrompt: () => void;
}

export default function InputExerciseCard({
  exercise,
  answerValue,
  hasChecked,
  isCorrect,
  isSpeakingPrompt,
  onAnswerChange,
  onPlayPrompt,
}: InputExerciseCardProps) {
  const [isHintOpen, setIsHintOpen] = useState(false);
  const answerInputRef = useRef<HTMLTextAreaElement>(null);
  const context = exercise.context?.trim();
  const hint = exercise.hint?.trim();

  useEffect(() => {
    setIsHintOpen(false);
  }, [exercise.id]);

  useLayoutEffect(() => {
    const answerInput = answerInputRef.current;

    if (!answerInput) {
      return;
    }

    answerInput.style.height = "auto";
    answerInput.style.height = `${answerInput.scrollHeight}px`;
  }, [answerValue, exercise.id]);

  return (
    <section className="practice-card input-practice-card">
      <div className="input-practice-card__prompt-block">
        <p className="practice-card__question">{exercise.prompt}</p>
        {context ? <p className="input-practice-card__context">{context}</p> : null}
        {hint ? (
          <button
            className="input-practice-card__hint-button"
            type="button"
            onClick={() => setIsHintOpen(true)}
          >
            Подсказка
          </button>
        ) : null}
      </div>

      <button
        className={`alphabet-card__play practice-card__play input-practice-card__play ${
          isSpeakingPrompt ? "practice-card__play--active" : ""
        }`}
        type="button"
        aria-label={`Озвучить ${exercise.correctAnswer}`}
        onClick={onPlayPrompt}
        disabled={isSpeakingPrompt}
      >
        <PlaybackIcon isPlaying={isSpeakingPrompt} />
      </button>

      <div className="input-practice-card__input-wrap">
        <p
          className={`input-practice-card__correct-answer ${
            hasChecked ? "" : "input-practice-card__correct-answer--hidden"
          }`}
        >
          {exercise.correctAnswer}
        </p>
        <textarea
          ref={answerInputRef}
          className={`input-practice-card__input-line ${
            hasChecked
              ? isCorrect
                ? "input-practice-card__input-line--correct"
                : "input-practice-card__input-line--wrong"
              : ""
          }`}
          rows={1}
          value={answerValue}
          onChange={(event) => onAnswerChange(event.target.value)}
          autoComplete="off"
          spellCheck={false}
          aria-label="Введите ответ"
          disabled={hasChecked}
        />
      </div>

      {hint && isHintOpen ? (
        <ExerciseHintDialog hint={hint} variant="sheet" onClose={() => setIsHintOpen(false)} />
      ) : null}
    </section>
  );
}

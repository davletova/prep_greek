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
  return (
    <section className="practice-card input-practice-card">
      <div className="input-practice-card__prompt-block">
        <p className="practice-card__question">{exercise.prompt}</p>
        {exercise.context ? (
          <p className="input-practice-card__context">{exercise.context}</p>
        ) : null}
      </div>

      <button
        className={`alphabet-card__play practice-card__play input-practice-card__play ${
          isSpeakingPrompt ? "practice-card__play--active" : ""
        }`}
        type="button"
        aria-label={`Озвучить ${exercise.correctAnswer}`}
        onClick={onPlayPrompt}
        disabled={!hasChecked || isSpeakingPrompt}
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
          onChange={(event) => onAnswerChange(event.target.value)}
          autoComplete="off"
          spellCheck={false}
          aria-label="Введите ответ"
          disabled={hasChecked}
        />
      </div>
    </section>
  );
}

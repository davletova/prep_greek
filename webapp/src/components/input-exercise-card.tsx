import { useEffect, useState } from "react";
import PlaybackIcon from "./playback-icon.tsx";
import type { ReactNode } from "react";
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

function renderInlineMarkdown(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    return part;
  });
}

function renderHintMarkdown(markdown: string) {
  const blocks = markdown.split(/\n{2,}/).filter(Boolean);

  return blocks.map((block, blockIndex) => {
    const lines = block.split("\n").filter(Boolean);
    const isList = lines.every((line) => line.trimStart().startsWith("- "));

    if (isList) {
      return (
        <ul key={blockIndex} className="input-practice-card__hint-list">
          {lines.map((line, lineIndex) => (
            <li key={lineIndex}>{renderInlineMarkdown(line.trimStart().slice(2))}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={blockIndex} className="input-practice-card__hint-paragraph">
        {lines.map((line, lineIndex) => (
          <span key={lineIndex}>
            {lineIndex > 0 ? <br /> : null}
            {renderInlineMarkdown(line)}
          </span>
        ))}
      </p>
    );
  });
}

function splitHintTitle(markdown: string) {
  const lines = markdown.split("\n");
  const titleIndex = lines.findIndex((line) => line.trim());

  if (titleIndex === -1) {
    return { title: "", body: "" };
  }

  const title = lines[titleIndex] ?? "";

  return {
    title: title.trim(),
    body: lines
      .slice(titleIndex + 1)
      .join("\n")
      .trim(),
  };
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
  const context = exercise.context?.trim();
  const hint = exercise.hint?.trim();
  const hintParts = hint ? splitHintTitle(hint) : null;

  useEffect(() => {
    setIsHintOpen(false);
  }, [exercise.id]);

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

      {hint && isHintOpen ? (
        <div className="modal-overlay input-practice-card__hint-overlay" role="presentation">
          <section
            className="input-practice-card__hint-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Подсказка"
          >
            <div className="input-practice-card__hint-header">
              {hintParts?.title ? (
                <div className="input-practice-card__hint-heading">
                  {renderInlineMarkdown(hintParts.title)}
                </div>
              ) : null}
              <button
                className="input-practice-card__hint-close"
                type="button"
                aria-label="Закрыть подсказку"
                onClick={() => setIsHintOpen(false)}
              >
                ×
              </button>
            </div>
            {hintParts?.body ? (
              <div className="input-practice-card__hint-text">
                {renderHintMarkdown(hintParts.body)}
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </section>
  );
}

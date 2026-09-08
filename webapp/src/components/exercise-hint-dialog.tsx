import type { MouseEvent, ReactNode } from "react";

interface ExerciseHintDialogProps {
  hint: string;
  onClose: () => void;
  variant?: "centered" | "sheet";
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
        <ul key={blockIndex} className="exercise-hint-dialog__list">
          {lines.map((line, lineIndex) => (
            <li key={lineIndex}>{renderInlineMarkdown(line.trimStart().slice(2))}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={blockIndex} className="exercise-hint-dialog__paragraph">
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

  return {
    title: lines[titleIndex]?.trim() ?? "",
    body: lines
      .slice(titleIndex + 1)
      .join("\n")
      .trim(),
  };
}

export default function ExerciseHintDialog({
  hint,
  onClose,
  variant = "centered",
}: ExerciseHintDialogProps) {
  const { title, body } = splitHintTitle(hint);
  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={`modal-overlay exercise-hint-dialog__overlay exercise-hint-dialog__overlay--${variant}`}
      role="presentation"
      onClick={handleOverlayClick}
    >
      <section
        className={`exercise-hint-dialog exercise-hint-dialog--${variant}`}
        role="dialog"
        aria-modal="true"
        aria-label="Подсказка"
      >
        <div className="exercise-hint-dialog__header">
          {title ? (
            <div className="exercise-hint-dialog__heading">{renderInlineMarkdown(title)}</div>
          ) : null}
          <button
            className="exercise-hint-dialog__close"
            type="button"
            aria-label="Закрыть подсказку"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        {body ? <div className="exercise-hint-dialog__text">{renderHintMarkdown(body)}</div> : null}
      </section>
    </div>
  );
}

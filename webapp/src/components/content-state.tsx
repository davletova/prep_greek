import type { ContentStateTone, VoidHandler } from "../types/ui";

interface ContentStateProps {
  title: string;
  text?: string;
  actionLabel?: string;
  onAction?: VoidHandler;
  tone?: ContentStateTone;
}

export default function ContentState({
  title,
  text,
  actionLabel,
  onAction,
  tone = "default"
}: ContentStateProps) {
  return (
    <div
      className={`content-state ${
        tone === "error" ? "content-state--error" : ""
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="content-state__title">{title}</div>
      {text ? <div className="content-state__text">{text}</div> : null}
      {actionLabel && onAction ? (
        <button
          className="nav-button nav-button--primary content-state__action"
          type="button"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

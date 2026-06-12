interface ConfirmSheetProps {
  title: string;
  text: string;
  error?: string;
  cancelLabel?: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmSheet({
  title,
  text,
  error = "",
  cancelLabel = "Отмена",
  confirmLabel,
  onCancel,
  onConfirm,
}: ConfirmSheetProps) {
  return (
    <div className="modal-overlay" role="presentation">
      <section
        className="confirm-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-sheet-title"
      >
        <h2 className="confirm-sheet__title" id="confirm-sheet-title">
          {title}
        </h2>
        <p className="confirm-sheet__text">{text}</p>
        {error ? <p className="confirm-sheet__error">{error}</p> : null}
        <div className="confirm-sheet__actions">
          <button
            className="confirm-sheet__button confirm-sheet__button--secondary"
            type="button"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className="confirm-sheet__button confirm-sheet__button--danger"
            type="button"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

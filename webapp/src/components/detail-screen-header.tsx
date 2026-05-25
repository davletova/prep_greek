import type { VoidHandler } from "../types/ui.ts";

interface DetailScreenHeaderProps {
  title: string;
  onClose: VoidHandler;
  closeLabel?: string;
}

export default function DetailScreenHeader({
  title,
  onClose,
  closeLabel = "Закрыть"
}: DetailScreenHeaderProps) {
  return (
    <header className="app__header app__header--compact">
      <div>
        <h1 className="app__title app__title--small">{title}</h1>
      </div>
      <button className="close-button" type="button" onClick={onClose} aria-label={closeLabel}>
        ×
      </button>
    </header>
  );
}

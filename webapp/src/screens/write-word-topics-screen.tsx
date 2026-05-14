import type { VoidHandler } from "../types/ui";

interface WriteWordTopicsScreenProps {
  onClose: VoidHandler;
  onOpenVerbConjugation: VoidHandler;
}

export default function WriteWordTopicsScreen({
  onClose,
  onOpenVerbConjugation
}: WriteWordTopicsScreenProps) {
  return (
    <>
      <header className="app__header app__header--centered">
        <button
          className="back-button"
          type="button"
          onClick={onClose}
          aria-label="Назад"
        >
          ‹
        </button>
        <h1 className="app__title app__title--small app__title--centered">
          Выбор темы
        </h1>
        <div className="app__header-spacer" aria-hidden="true" />
      </header>

      <main className="app__content app__content--profile">
        <button className="card-button" type="button" onClick={onOpenVerbConjugation}>
          <div className="card-button__text">
            <span className="card-button__title">Спряжение глаголов</span>
            <span className="card-button__subtitle">Введите правильную форму слова</span>
          </div>
          <span className="card-button__chevron">›</span>
        </button>
      </main>
    </>
  );
}

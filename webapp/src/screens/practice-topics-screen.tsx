import type { VoidHandler } from "../types/ui";

interface PracticeTopicsScreenProps {
  onClose: VoidHandler;
  onOpenBasicPhrases: VoidHandler;
  onOpenAlphaTypeVerbs: VoidHandler;
  onOpenAlphaTypeVerbEndings: VoidHandler;
}

export default function PracticeTopicsScreen({
  onClose,
  onOpenBasicPhrases,
  onOpenAlphaTypeVerbs,
  onOpenAlphaTypeVerbEndings
}: PracticeTopicsScreenProps) {
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
        <button
          className="card-button"
          type="button"
          onClick={onOpenBasicPhrases}
        >
          <div className="card-button__text">
            <span className="card-button__title">Базовые фразы</span>
            <span className="card-button__subtitle">
              Выберите правильный перевод из 4 вариантов
            </span>
          </div>
          <span className="card-button__chevron">›</span>
        </button>

        <button
          className="card-button"
          type="button"
          onClick={onOpenAlphaTypeVerbs}
        >
          <div className="card-button__text">
            <span className="card-button__title">Глаголы на -ω (альфа-группа)</span>
            <span className="card-button__subtitle">
              Выберите правильный перевод из 4 вариантов
            </span>
          </div>
          <span className="card-button__chevron">›</span>
        </button>

        <button
          className="card-button"
          type="button"
          onClick={onOpenAlphaTypeVerbEndings}
        >
          <div className="card-button__text">
            <span className="card-button__title">Окончания глаголов α-типа</span>
            <span className="card-button__subtitle">
              Выберите правильный перевод из 4 вариантов
            </span>
          </div>
          <span className="card-button__chevron">›</span>
        </button>
      </main>
    </>
  );
}

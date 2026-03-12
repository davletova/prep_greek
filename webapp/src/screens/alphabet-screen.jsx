import { useMemo } from "react";
import ContentState from "../components/content-state.jsx";

const PAGE_SIZE = 5;

export default function AlphabetScreen({
  alphabet,
  status,
  error,
  pageIndex,
  onClose,
  onPrev,
  onNext,
  onRetry,
  onSpeak
}) {
  const letters = alphabet?.letters ?? [];

  const pages = useMemo(() => {
    if (!letters.length) {
      return [];
    }

    const sigmaIndex = letters.findIndex((item) => item.upper === "Σ");
    if (sigmaIndex === -1) {
      const chunks = [];
      for (let index = 0; index < letters.length; index += PAGE_SIZE) {
        chunks.push(letters.slice(index, index + PAGE_SIZE));
      }
      return chunks;
    }

    const first = letters.slice(0, 15);
    const sigmaPage = letters.slice(15, 19);
    const last = letters.slice(19);

    return [
      first.slice(0, 5),
      first.slice(5, 10),
      first.slice(10, 15),
      sigmaPage,
      last
    ].filter((page) => page.length > 0);
  }, [letters]);

  const totalPages = Math.max(1, pages.length || 1);
  const pageLetters = pages[pageIndex] ?? [];

  return (
    <>
      <header className="app__header app__header--compact">
        <div>
          <h1 className="app__title app__title--small">
            {alphabet?.title || "Греческий алфавит"}
          </h1>
        </div>
        <button
          className="close-button"
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
        >
          ×
        </button>
      </header>

      <main className="alphabet">
        <div className="alphabet__lead">
          <p>Изучите буквы и их базовые звуки.</p>
          <span className="alphabet__progress">
            {letters.length ? `${pageIndex + 1}/${totalPages}` : "—"}
          </span>
        </div>

        {status === "loading" ? (
          <ContentState
            title="Загружаем алфавит…"
            text="Подготавливаем карточки с буквами и произношением."
          />
        ) : status === "error" ? (
          <ContentState
            title="Не удалось загрузить алфавит"
            text={error}
            actionLabel="Попробовать снова"
            onAction={onRetry}
            tone="error"
          />
        ) : (
          <div className="alphabet__cards">
            {pageLetters.map((letter) => (
              <article className="alphabet-card" key={letter.upper}>
                <div className="alphabet-card__row">
                  <div className="alphabet-card__letters">
                    <span>{letter.upper}</span>
                    <span>{letter.lower}</span>
                  </div>
                  <div className="alphabet-card__meta">
                    <span className="alphabet-card__name">{letter.name}</span>
                    <span className="alphabet-card__sound">{letter.sound_ru}</span>
                  </div>
                  <button
                    className="alphabet-card__play"
                    type="button"
                    aria-label={`Озвучить ${letter.name}`}
                    onClick={() => onSpeak(letter.name)}
                  >
                    ▶
                  </button>
                </div>
                {letter.note ? (
                  <div className="alphabet-card__note">
                    <span>{letter.note}</span>
                    {letter.example ? (
                      <span className="alphabet-card__example">{letter.example}</span>
                    ) : null}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}

        <div className="alphabet__nav">
          <button
            className="nav-button"
            type="button"
            onClick={onPrev}
            disabled={pageIndex === 0}
          >
            Назад
          </button>
          <button
            className="nav-button nav-button--primary"
            type="button"
            onClick={() => onNext(totalPages)}
            disabled={pageIndex >= totalPages - 1}
          >
            Вперед
          </button>
        </div>
      </main>
    </>
  );
}

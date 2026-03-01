import React, { useEffect, useMemo, useState } from "react";

const ALPHABET_URL = `${import.meta.env.BASE_URL}content/theory/alphabet.json`;
const PAGE_SIZE = 6;

export default function App() {
  const [screen, setScreen] = useState("home");
  const [alphabet, setAlphabet] = useState(null);
  const [alphabetError, setAlphabetError] = useState("");
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    if (window.Telegram?.WebApp?.ready) {
      window.Telegram.WebApp.ready();
    }
  }, []);

  useEffect(() => {
    if (screen !== "alphabet" || alphabet || alphabetError) {
      return;
    }

    fetch(ALPHABET_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setAlphabet(data);
      })
      .catch((err) => {
        setAlphabetError(err.message);
      });
  }, [screen, alphabet, alphabetError]);

  const letters = alphabet?.letters ?? [];
  const totalPages = Math.max(1, Math.ceil(letters.length / PAGE_SIZE));
  const pageLetters = useMemo(() => {
    const start = pageIndex * PAGE_SIZE;
    return letters.slice(start, start + PAGE_SIZE);
  }, [letters, pageIndex]);

  const handleOpenAlphabet = () => {
    setScreen("alphabet");
    setPageIndex(0);
  };

  const handleExit = () => {
    setScreen("home");
  };

  const handlePrev = () => {
    setPageIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setPageIndex((prev) => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <div className="app">
      {screen === "home" ? (
        <>
          <header className="app__header">
            <h1 className="app__title">Справочник</h1>
            <p className="app__subtitle">Буквы и базовые звуки</p>
          </header>

          <main className="app__content">
            <button
              className="card-button"
              type="button"
              onClick={handleOpenAlphabet}
            >
              <div className="card-button__text">
                <span className="card-button__title">Греческий алфавит</span>
                <span className="card-button__subtitle">
                  Основа чтения по-гречески
                </span>
              </div>
              <span className="card-button__chevron">›</span>
            </button>
          </main>
        </>
      ) : (
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
              onClick={handleExit}
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

            {alphabetError ? (
              <div className="alphabet__error">
                Не удалось загрузить алфавит: {alphabetError}
              </div>
            ) : (
              <div className="alphabet__cards">
                {pageLetters.map((letter) => (
                  <article className="alphabet-card" key={letter.upper}>
                    <div className="alphabet-card__letters">
                      <span>{letter.upper}</span>
                      <span>{letter.lower}</span>
                    </div>
                    <div className="alphabet-card__meta">
                      <span className="alphabet-card__name">
                        {letter.name}
                      </span>
                      <span className="alphabet-card__sound">
                        {letter.sound_ru}
                      </span>
                    </div>
                    <button
                      className="alphabet-card__play"
                      type="button"
                      aria-label={`Озвучить ${letter.name}`}
                    >
                      ▶
                    </button>
                  </article>
                ))}
              </div>
            )}

            <div className="alphabet__nav">
              <button
                className="nav-button"
                type="button"
                onClick={handlePrev}
                disabled={pageIndex === 0}
              >
                Назад
              </button>
              <button
                className="nav-button nav-button--primary"
                type="button"
                onClick={handleNext}
                disabled={pageIndex >= totalPages - 1}
              >
                Вперед
              </button>
            </div>
          </main>
        </>
      )}
    </div>
  );
}

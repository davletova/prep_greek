import React, { useEffect, useMemo, useState } from "react";

const ALPHABET_URL = `${import.meta.env.BASE_URL}content/theory/alphabet.json`;
const DIPHTHONGS_URL = `${import.meta.env.BASE_URL}content/theory/diphthongs.json`;
const PAGE_SIZE = 5;

export default function App() {
  const [screen, setScreen] = useState("home");
  const [alphabet, setAlphabet] = useState(null);
  const [alphabetError, setAlphabetError] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [diphthongs, setDiphthongs] = useState(null);
  const [diphthongsError, setDiphthongsError] = useState("");
  const [diphthongIndex, setDiphthongIndex] = useState(0);

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

  useEffect(() => {
    if (screen !== "diphthongs" || diphthongs || diphthongsError) {
      return;
    }

    fetch(DIPHTHONGS_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setDiphthongs(data);
      })
      .catch((err) => {
        setDiphthongsError(err.message);
      });
  }, [screen, diphthongs, diphthongsError]);

  const letters = alphabet?.letters ?? [];
  const pages = useMemo(() => {
    if (!letters.length) {
      return [];
    }

    const sigmaIndex = letters.findIndex((item) => item.upper === "Σ");
    if (sigmaIndex === -1) {
      const chunks = [];
      for (let i = 0; i < letters.length; i += PAGE_SIZE) {
        chunks.push(letters.slice(i, i + PAGE_SIZE));
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

  const handleOpenAlphabet = () => {
    setScreen("alphabet");
    setPageIndex(0);
  };

  const handleOpenDiphthongs = () => {
    setScreen("diphthongs");
    setDiphthongIndex(0);
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

  const handlePrevDiphthong = () => {
    setDiphthongIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextDiphthong = (max) => {
    setDiphthongIndex((prev) => Math.min(max - 1, prev + 1));
  };

  const handleSpeak = (letter) => {
    if (!("speechSynthesis" in window)) {
      alert("Озвучка не поддерживается в этом браузере.");
      return;
    }

    if (!letter?.name) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(letter.name);
    utterance.lang = "el-GR";

    const voices = window.speechSynthesis.getVoices();
    const greekVoice = voices.find((voice) =>
      voice.lang?.toLowerCase().startsWith("el")
    );
    if (greekVoice) {
      utterance.voice = greekVoice;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleSpeakText = (text) => {
    if (!("speechSynthesis" in window)) {
      alert("Озвучка не поддерживается в этом браузере.");
      return;
    }

    if (!text) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "el-GR";

    const voices = window.speechSynthesis.getVoices();
    const greekVoice = voices.find((voice) =>
      voice.lang?.toLowerCase().startsWith("el")
    );
    if (greekVoice) {
      utterance.voice = greekVoice;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
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

            <button
              className="card-button"
              type="button"
              onClick={handleOpenDiphthongs}
            >
              <div className="card-button__text">
                <span className="card-button__title">
                  Контекстные правила чтения
                </span>
                <span className="card-button__subtitle">
                  Дифтонги и сочетания букв
                </span>
              </div>
              <span className="card-button__chevron">›</span>
            </button>
          </main>
        </>
      ) : screen === "alphabet" ? (
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
                    <div className="alphabet-card__row">
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
                        onClick={() => handleSpeak(letter)}
                      >
                        ▶
                      </button>
                    </div>
                    {letter.note ? (
                      <div className="alphabet-card__note">
                        <span>{letter.note}</span>
                        {letter.example ? (
                          <span className="alphabet-card__example">
                            {letter.example}
                          </span>
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
      ) : (
        <>
          <header className="app__header app__header--compact">
            <div>
              <h1 className="app__title app__title--small">
                Контекстные правила чтения
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

          <main className="diphthong">
            {diphthongsError ? (
              <div className="alphabet__error">
                Не удалось загрузить дифтонги: {diphthongsError}
              </div>
            ) : (
              (() => {
                const item = diphthongs?.items?.[diphthongIndex];
                const diphthongCount = diphthongs?.items?.length ?? 0;
                if (!item) {
                  return (
                    <div className="alphabet__error">
                      Нет данных для отображения.
                    </div>
                  );
                }

                return (
                  <>
                    <section className="diphthong__hero">
                      <h2 className="diphthong__title">{item.diphthong}</h2>
                      <p className="diphthong__subtitle">{item.sound_ru}</p>
                    </section>

                    <section className="diphthong__examples">
                      <h3 className="diphthong__label">Примеры</h3>
                      <div className="diphthong__list">
                        {item.examples?.map((example, index) => (
                          <div className="example-card" key={index}>
                            <div className="example-card__text">
                              <span className="example-card__word">
                                {example.word}
                              </span>
                              <span className="example-card__translation">
                                {example.ru}
                              </span>
                            </div>
                            <button
                              className="alphabet-card__play"
                              type="button"
                              aria-label={`Озвучить ${example.word}`}
                              onClick={() => handleSpeakText(example.word)}
                            >
                              ▶
                            </button>
                          </div>
                        ))}
                      </div>
                    </section>

                    <div className="diphthong__nav">
                      <button
                        className="nav-button"
                        type="button"
                        onClick={handlePrevDiphthong}
                        disabled={diphthongIndex === 0}
                      >
                        Назад
                      </button>
                      <button
                        className="nav-button nav-button--primary"
                        type="button"
                        onClick={() => handleNextDiphthong(diphthongCount)}
                        disabled={diphthongIndex >= diphthongCount - 1}
                      >
                        Вперед
                      </button>
                    </div>
                  </>
                );
              })()
            )}
          </main>
        </>
      )}
      <nav className="tabbar" aria-label="Основная навигация">
        <div className="tabbar__item" aria-hidden="true">
          <svg className="tabbar__icon" viewBox="0 0 24 24">
            <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19a2 2 0 0 1 2 2v13.5a1.5 1.5 0 0 1-1.5 1.5H7.5A2.5 2.5 0 0 0 5 22V5.5Z" />
            <path d="M5 6h10.5a1 1 0 0 1 1 1v12.5" />
            <path d="M9 7.5h6.5" />
          </svg>
        </div>
        <div className="tabbar__item" aria-hidden="true">
          <svg className="tabbar__icon" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path d="m8.5 12 2.5 2.5 4.5-5" />
          </svg>
        </div>
        <div className="tabbar__item" aria-hidden="true">
          <svg className="tabbar__icon" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="9" r="3" />
            <path d="M7.5 19a4.5 4.5 0 0 1 9 0" />
          </svg>
        </div>
      </nav>
    </div>
  );
}

import React, { useEffect } from "react";

export default function App() {
  useEffect(() => {
    if (window.Telegram?.WebApp?.ready) {
      window.Telegram.WebApp.ready();
    }
  }, []);

  return (
    <div className="app">
      <header className="app__header">
        <p className="app__eyebrow">Мини‑приложение</p>
        <h1 className="app__title">Греческий алфавит</h1>
        <p className="app__subtitle">
          Начните с базовых букв и их произношения.
        </p>
      </header>

      <main className="app__content">
        <button className="card-button" type="button">
          <div className="card-button__text">
            <span className="card-button__title">Изучить алфавит</span>
            <span className="card-button__subtitle">
              Переход к карточкам букв
            </span>
          </div>
          <span className="card-button__chevron">›</span>
        </button>
      </main>
    </div>
  );
}

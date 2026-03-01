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
        <h1 className="app__title">Справочник</h1>
        <p className="app__subtitle">Буквы и базовые звуки</p>
      </header>

      <main className="app__content">
        <button className="card-button" type="button">
          <div className="card-button__text">
            <span className="card-button__title">Греческий алфавит</span>
            <span className="card-button__subtitle">
              Основа чтения по-гречески
            </span>
          </div>
          <span className="card-button__chevron">›</span>
        </button>
      </main>
    </div>
  );
}

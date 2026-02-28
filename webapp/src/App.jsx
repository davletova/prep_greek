import React, { useEffect, useState } from "react";

const CONTENT_URL = `${import.meta.env.BASE_URL}content/hello.json`;

export default function App() {
  const [message, setMessage] = useState("Загрузка...");
  const [error, setError] = useState("");

  useEffect(() => {
    let canceled = false;

    if (window.Telegram?.WebApp?.ready) {
      window.Telegram.WebApp.ready();
    }

    fetch(CONTENT_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!canceled) {
          setMessage(data.message || "(пусто)");
        }
      })
      .catch((err) => {
        if (!canceled) {
          setError(`Ошибка: ${err.message}`);
        }
      });

    return () => {
      canceled = true;
    };
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24 }}>
      {error ? <div>{error}</div> : <div>{message}</div>}
    </div>
  );
}

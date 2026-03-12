function TheoryHome({ onOpenAlphabet, onOpenDiphthongs }) {
  return (
    <>
      <header className="app__header">
        <h1 className="app__title">Теория</h1>
      </header>

      <main className="app__content app__content--profile">
        <button className="card-button" type="button" onClick={onOpenAlphabet}>
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
          onClick={onOpenDiphthongs}
        >
          <div className="card-button__text">
            <span className="card-button__title">Контекстные правила чтения</span>
            <span className="card-button__subtitle">Дифтонги и сочетания букв</span>
          </div>
          <span className="card-button__chevron">›</span>
        </button>
      </main>
    </>
  );
}

function PracticeHome() {
  return (
    <>
      <header className="app__header">
        <h1 className="app__title">Практика</h1>
      </header>

      <main className="app__content app__content--profile">
        <button className="card-button" type="button">
          <div className="card-button__text">
            <span className="card-button__title">Словарь</span>
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

function ProfileHome() {
  return (
    <>
      <header className="app__header">
        <h1 className="app__title">Профиль</h1>
      </header>

      <main className="app__content app__content--profile">
        <div className="settings">
          <div className="settings__label">Уровень языка</div>
          <button className="dropdown" type="button">
            A1
            <span className="dropdown__chevron">▾</span>
          </button>
        </div>
      </main>
    </>
  );
}

export default function HomeScreen({
  tab,
  onOpenAlphabet,
  onOpenDiphthongs
}) {
  if (tab === "practice") {
    return <PracticeHome />;
  }

  if (tab === "profile") {
    return <ProfileHome />;
  }

  return (
    <TheoryHome
      onOpenAlphabet={onOpenAlphabet}
      onOpenDiphthongs={onOpenDiphthongs}
    />
  );
}

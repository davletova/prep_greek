import type { VoidHandler } from "../types/ui";

interface TheoryHomeScreenProps {
  onOpenAlphabet: VoidHandler;
  onOpenDiphthongs: VoidHandler;
}

export default function TheoryHomeScreen({
  onOpenAlphabet,
  onOpenDiphthongs,
}: TheoryHomeScreenProps) {
  return (
    <>
      <header className="app__header">
        <h1 className="app__title">Теория</h1>
      </header>

      <main className="app__content app__content--profile">
        <button className="card-button" type="button" onClick={onOpenAlphabet}>
          <div className="card-button__text">
            <span className="card-button__title">Греческий алфавит</span>
            <span className="card-button__subtitle">Основа чтения по-гречески</span>
          </div>
          <span className="card-button__chevron">›</span>
        </button>

        <button className="card-button" type="button" onClick={onOpenDiphthongs}>
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

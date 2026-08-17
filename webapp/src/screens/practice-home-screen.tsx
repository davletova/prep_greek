import type { VoidHandler } from "../types/ui";

interface PracticeHomeScreenProps {
  onOpenSingleChoiceTopics: VoidHandler;
  onOpenInputTopics: VoidHandler;
  onOpenListeningTopics: VoidHandler;
}

export default function PracticeHomeScreen({
  onOpenSingleChoiceTopics,
  onOpenInputTopics,
  onOpenListeningTopics,
}: PracticeHomeScreenProps) {
  return (
    <>
      <header className="app__header">
        <h1 className="app__title">Практика</h1>
      </header>

      <main className="app__content app__content--profile">
        <button className="card-button" type="button" onClick={onOpenSingleChoiceTopics}>
          <div className="card-button__text">
            <span className="card-button__title">Тесты</span>
            <span className="card-button__subtitle">Выберите правильный ответ</span>
          </div>
          <span className="card-button__chevron">›</span>
        </button>

        <button className="card-button" type="button" onClick={onOpenInputTopics}>
          <div className="card-button__text">
            <span className="card-button__title">Напиши на греческом</span>
            <span className="card-button__subtitle">Введите ответ самостоятельно</span>
          </div>
          <span className="card-button__chevron">›</span>
        </button>

        <button className="card-button" type="button" onClick={onOpenListeningTopics}>
          <div className="card-button__text">
            <span className="card-button__title">Аудирование</span>
            <span className="card-button__subtitle">Слушайте греческую речь и выбирайте ответ</span>
          </div>
          <span className="card-button__chevron">›</span>
        </button>
      </main>
    </>
  );
}

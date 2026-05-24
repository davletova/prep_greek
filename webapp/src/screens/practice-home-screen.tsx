import type { VoidHandler } from "../types/ui";

interface PracticeHomeScreenProps {
  onOpenDictionaryTopics: VoidHandler;
  onOpenWriteWordTopics: VoidHandler;
}

export default function PracticeHomeScreen({
  onOpenDictionaryTopics,
  onOpenWriteWordTopics,
}: PracticeHomeScreenProps) {
  return (
    <>
      <header className="app__header">
        <h1 className="app__title">Практика</h1>
      </header>

      <main className="app__content app__content--profile">
        <button className="card-button" type="button" onClick={onOpenDictionaryTopics}>
          <div className="card-button__text">
            <span className="card-button__title">Выбор из 4 вариантов</span>
            <span className="card-button__subtitle">
              Выберите правильный перевод из 4 вариантов
            </span>
          </div>
          <span className="card-button__chevron">›</span>
        </button>

        <button className="card-button" type="button" onClick={onOpenWriteWordTopics}>
          <div className="card-button__text">
            <span className="card-button__title">Напиши слово</span>
            <span className="card-button__subtitle">Введите ответ самостоятельно</span>
          </div>
          <span className="card-button__chevron">›</span>
        </button>
      </main>
    </>
  );
}

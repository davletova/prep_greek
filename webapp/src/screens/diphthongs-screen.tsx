import ContentState from "../components/content-state.tsx";
import type { DiphthongsContent } from "../types/content";
import type {
  IndexedNextHandler,
  LoadableState,
  SpeakHandler,
  VoidHandler
} from "../types/ui";

interface DiphthongsScreenProps {
  diphthongsState: LoadableState<DiphthongsContent>;
  diphthongIndex: number;
  onClose: VoidHandler;
  onPrev: VoidHandler;
  onNext: IndexedNextHandler;
  onRetry: VoidHandler;
  onSpeak: SpeakHandler;
}

export default function DiphthongsScreen({
  diphthongsState,
  diphthongIndex,
  onClose,
  onPrev,
  onNext,
  onRetry,
  onSpeak
}: DiphthongsScreenProps) {
  const { data: diphthongs, status, error } = diphthongsState;
  const item = diphthongs?.items?.[diphthongIndex];
  const diphthongCount = diphthongs?.items?.length ?? 0;

  return (
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
          onClick={onClose}
          aria-label="Закрыть"
        >
          ×
        </button>
      </header>

      <main className="diphthong">
        {status === "loading" ? (
          <ContentState
            title="Загружаем правила чтения…"
            text="Подготавливаем дифтонги, сочетания букв и примеры."
          />
        ) : status === "error" ? (
          <ContentState
            title="Не удалось загрузить дифтонги"
            text={error}
            actionLabel="Попробовать снова"
            onAction={onRetry}
            tone="error"
          />
        ) : !item ? (
          <ContentState
            title="Нет данных для отображения"
            actionLabel="Перезагрузить"
            onAction={onRetry}
            tone="error"
          />
        ) : (
          <>
            <section className="diphthong__hero">
              <h2 className="diphthong__title">{item.diphthong}</h2>
              <p className="diphthong__subtitle">{item.sound_ru}</p>
            </section>

            <section className="diphthong__examples">
              <h3 className="diphthong__label">Примеры</h3>
              <div className="diphthong__list">
                {item.examples.map((example, index) => (
                  <div className="example-card" key={index}>
                    <div className="example-card__text">
                      <span className="example-card__word">{example.word}</span>
                      <span className="example-card__translation">{example.ru}</span>
                    </div>
                    <button
                      className="alphabet-card__play"
                      type="button"
                      aria-label={`Озвучить ${example.word}`}
                      onClick={() => onSpeak(example.word)}
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
                onClick={onPrev}
                disabled={diphthongIndex === 0}
              >
                Назад
              </button>
              <button
                className="nav-button nav-button--primary"
                type="button"
                onClick={() => onNext(diphthongCount)}
                disabled={diphthongIndex >= diphthongCount - 1}
              >
                Вперед
              </button>
            </div>
          </>
        )}
      </main>
    </>
  );
}

import PlaybackIcon from "./playback-icon.tsx";
import type { ListeningRuntimeQuestion } from "../types/exercises.ts";

interface ListeningExerciseCardProps {
  question: ListeningRuntimeQuestion;
  hasAnswered: boolean;
  isAudioPlaying: boolean;
  playbackError: string;
  getAnswerClassName: (index: number) => string;
  onPlayAudio: () => void;
  onSelectAnswer: (index: number) => void;
}

export default function ListeningExerciseCard({
  question,
  hasAnswered,
  isAudioPlaying,
  playbackError,
  getAnswerClassName,
  onPlayAudio,
  onSelectAnswer,
}: ListeningExerciseCardProps) {
  return (
    <section className="practice-card practice-card--listening">
      <div className="practice-card__prompt-block">
        <p className="practice-card__question">{question.prompt}</p>
      </div>

      <div className="practice-card__play-wrap">
        <button
          className={`alphabet-card__play practice-card__play practice-card__play--el ${
            isAudioPlaying ? "practice-card__play--active" : ""
          }`}
          type="button"
          aria-label="Прослушать фразу"
          onClick={onPlayAudio}
          disabled={isAudioPlaying}
        >
          <PlaybackIcon isPlaying={isAudioPlaying} />
        </button>
      </div>

      {playbackError ? <p className="practice-card__error">{playbackError}</p> : null}

      <div className="practice-card__answers">
        {question.options.map((option, index) => (
          <button
            key={`${question.id}-${option}`}
            className={getAnswerClassName(index)}
            type="button"
            onClick={() => onSelectAnswer(index)}
            disabled={hasAnswered}
          >
            {option}
          </button>
        ))}
      </div>

      {hasAnswered ? (
        <div className="practice-card__feedback">
          <p
            className="practice-card__translation-hint"
            aria-label={`Вы услышали: ${question.transcript}`}
          >
            Вы услышали: <span lang="el">{question.transcript}</span>
          </p>
          {question.explanation ? (
            <p className="practice-card__explanation">{question.explanation}</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

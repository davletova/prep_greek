export type ExerciseType = "single-choice" | "text-input" | "input" | "listening";
export type PromptLanguage = "el" | "ru";
export type NonEmptyArray<T> = [T, ...T[]];
export type ListeningAnswerMode = "audio-to-russian" | "audio-to-greek";

export type ListeningAudioSource =
  | {
      kind: "tts";
      text: string;
      lang: "el-GR";
      rate?: number | undefined;
      pitch?: number | undefined;
      volume?: number | undefined;
    }
  | {
      kind: "file";
      src: string;
    };

export interface BaseExercise {
  id: string;
  type: ExerciseType;
  prompt: string;
  promptLanguage?: PromptLanguage | undefined;
  translation?: string | undefined;
  explanation?: string | undefined;
}

export interface SingleChoiceExercise extends BaseExercise {
  type: "single-choice";
  correctAnswer: string;
  wrongAnswers: NonEmptyArray<string>;
}

export interface SingleChoiceRuntimeQuestion {
  id: string;
  prompt: string;
  promptLanguage?: PromptLanguage | undefined;
  options: NonEmptyArray<string>;
  correctIndex: number;
  translation?: string | undefined;
  explanation?: string | undefined;
}

export interface InputExercise extends BaseExercise {
  type: "input";
  correctAnswer: string;
  context?: string | undefined;
}

export interface TextInputExercise extends BaseExercise {
  type: "text-input";
  correctAnswers: string[];
}

export interface ListeningExercise extends BaseExercise {
  type: "listening";
  answerMode: ListeningAnswerMode;
  audio: ListeningAudioSource;
  transcript: string;
  correctAnswer: string;
  wrongAnswers: NonEmptyArray<string>;
}

export interface ListeningRuntimeQuestion {
  id: string;
  prompt: string;
  answerMode: ListeningAnswerMode;
  audio: ListeningAudioSource;
  transcript: string;
  options: NonEmptyArray<string>;
  correctIndex: number;
  explanation?: string | undefined;
}

export type Exercise = SingleChoiceExercise | TextInputExercise | InputExercise | ListeningExercise;

export interface ExerciseCollectionSettings {
  showTranslationHint?: boolean | undefined;
}

export interface ExerciseCollection {
  title: string;
  subtitle?: string | undefined;
  settings?: ExerciseCollectionSettings | undefined;
  items: Exercise[];
}

export type ExerciseAnswer =
  | {
      type: "single-choice";
      selectedIndex: number;
    }
  | {
      type: "text-input";
      value: string;
    }
  | {
      type: "input";
      value: string;
    }
  | {
      type: "listening";
      selectedIndex: number;
    };

export interface ExerciseCheckResult {
  correct: boolean;
}

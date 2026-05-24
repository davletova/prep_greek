export type ExerciseType = "single-choice" | "text-input";

export interface BaseExercise {
  id: string;
  type: ExerciseType;
  prompt: string;
  promptLanguage?: string;
  translation?: string;
  explanation?: string;
}

export interface SingleChoiceExercise extends BaseExercise {
  type: "single-choice";
  correctAnswer: string;
  wrongAnswers: [string, string, string];
}

export interface SingleChoiceRuntimeQuestion {
  id: string;
  prompt: string;
  promptLanguage?: string;
  options: [string, string, string, string];
  correctIndex: number;
  translation?: string;
  explanation?: string;
}

export interface InputExercise {
  id: string;
  type: "input";
  prompt: string;
  correctAnswer: string;
  context?: string;
}

export interface TextInputExercise extends BaseExercise {
  type: "text-input";
  correctAnswers: string[];
}

export type Exercise = SingleChoiceExercise | TextInputExercise;

export interface ExerciseCollection {
  title: string;
  subtitle?: string;
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
    };

export interface ExerciseCheckResult {
  correct: boolean;
}

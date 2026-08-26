export type TabKey = "theory" | "practice" | "profile";

export type ContentStateTone = "default" | "error";

export type LoadStatus = "idle" | "loading" | "success" | "error";

export interface LoadableState<T> {
  data: T | null;
  status: LoadStatus;
  error: string;
}

export type Screen =
  | "home"
  | "alphabet"
  | "diphthongs"
  | "practice-single-choice-topics"
  | "practice-single-choice-group"
  | "practice-input-topics"
  | "practice-listening-topics"
  | "practice-input-topic"
  | "practice-single-choice-topic"
  | "practice-listening-topic";

export type VoidHandler = () => void;

export interface ScreenNavigationOptions {
  history?: "push" | "replace";
}

export type ScreenNavigationHandler = (screen: Screen, options?: ScreenNavigationOptions) => void;

export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
}

export type SpeakHandler = (text: string, options?: SpeechOptions) => Promise<void>;
export type IndexedNextHandler = (max: number) => void;

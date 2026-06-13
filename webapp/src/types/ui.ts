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
  | "practice-input-topics"
  | "practice-input-topic"
  | "practice-single-choice-topic";

export type VoidHandler = () => void;

export interface SpeechOptions {
  rate?: number;
}

export type SpeakHandler = (text: string, options?: SpeechOptions) => Promise<void>;
export type IndexedNextHandler = (max: number) => void;

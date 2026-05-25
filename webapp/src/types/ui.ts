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
  | "practice-write-word-topics"
  | "practice-input-topic"
  | "practice-single-choice-topic";

export type VoidHandler = () => void;
export type SpeakHandler = (text: string) => Promise<void>;
export type IndexedNextHandler = (max: number) => void;

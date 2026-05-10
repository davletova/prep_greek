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
  | "practice-dictionary-topics"
  | "practice-base-greek"
  | "practice-alpha-type-verbs"
  | "practice-alpha-type-verb-endings";

export type VoidHandler = () => void;
export type SpeakHandler = (text: string) => Promise<void>;
export type IndexedNextHandler = (max: number) => void;

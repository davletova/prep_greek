export type TabKey = "theory" | "practice" | "profile";

export type ContentStateTone = "default" | "error";

export type LoadStatus = "idle" | "loading" | "success" | "error";

export interface LoadableState<T> {
  data: T | null;
  status: LoadStatus;
  error: string;
}

export type Screen = "home" | "alphabet" | "diphthongs";

export type VoidHandler = () => void;
export type SpeakHandler = (text: string) => void;
export type IndexedNextHandler = (max: number) => void;

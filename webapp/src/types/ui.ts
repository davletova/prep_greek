export type TabKey = "theory" | "practice" | "profile";

export type ContentStateTone = "default" | "error";

export type LoadStatus = "idle" | "loading" | "success" | "error";

export type Screen = "home" | "alphabet" | "diphthongs";

export type VoidHandler = () => void;
export type SpeakHandler = (text: string) => void;
export type IndexedNextHandler = (max: number) => void;

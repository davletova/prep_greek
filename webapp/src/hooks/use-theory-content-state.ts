import { useState } from "react";
import {
  loadAlphabetContent,
  loadDiphthongsContent
} from "../services/content/theory-content-service.ts";
import type { AlphabetContent, DiphthongsContent } from "../types/content.ts";
import type { LoadableState, Screen } from "../types/ui.ts";
import { useLoadableContent } from "./use-loadable-content.ts";

interface TheoryContentState {
  alphabetState: LoadableState<AlphabetContent>;
  pageIndex: number;
  diphthongsState: LoadableState<DiphthongsContent>;
  diphthongIndex: number;
  openAlphabet: () => void;
  openDiphthongs: () => void;
  prevAlphabetPage: () => void;
  nextAlphabetPage: () => void;
  retryAlphabet: () => void;
  prevDiphthong: () => void;
  nextDiphthong: (max: number) => void;
  retryDiphthongs: () => void;
}

export function useTheoryContentState(
  screen: Screen,
  setScreen: (screen: Screen) => void
): TheoryContentState {
  const { state: alphabetState, retry: retryAlphabetContent } = useLoadableContent(
    screen === "alphabet",
    loadAlphabetContent
  );
  const [pageIndex, setPageIndex] = useState(0);

  const { state: diphthongsState, retry: retryDiphthongsContent } = useLoadableContent(
    screen === "diphthongs",
    loadDiphthongsContent
  );
  const [diphthongIndex, setDiphthongIndex] = useState(0);

  const openAlphabet = () => {
    setScreen("alphabet");
    setPageIndex(0);
  };

  const openDiphthongs = () => {
    setScreen("diphthongs");
    setDiphthongIndex(0);
  };

  const prevAlphabetPage = () => {
    setPageIndex((prev) => Math.max(0, prev - 1));
  };

  const nextAlphabetPage = () => {
    setPageIndex((prev) => prev + 1);
  };

  const retryAlphabet = () => {
    retryAlphabetContent();
    setPageIndex(0);
  };

  const prevDiphthong = () => {
    setDiphthongIndex((prev) => Math.max(0, prev - 1));
  };

  const nextDiphthong = (max: number) => {
    setDiphthongIndex((prev) => Math.min(max - 1, prev + 1));
  };

  const retryDiphthongs = () => {
    retryDiphthongsContent();
    setDiphthongIndex(0);
  };

  return {
    alphabetState,
    pageIndex,
    diphthongsState,
    diphthongIndex,
    openAlphabet,
    openDiphthongs,
    prevAlphabetPage,
    nextAlphabetPage,
    retryAlphabet,
    prevDiphthong,
    nextDiphthong,
    retryDiphthongs
  };
}

import { useEffect, useState } from "react";
import TabBar from "./components/tab-bar.tsx";
import AlphabetScreen from "./screens/alphabet-screen.tsx";
import DiphthongsScreen from "./screens/diphthongs-screen.tsx";
import HomeScreen from "./screens/home-screen.tsx";
import { loadJsonContent } from "./lib/content-loader.ts";
import { createInitialLoadableState } from "./lib/loadable-state.ts";
import { speakGreekText } from "./lib/speech.ts";
import type { AlphabetContent, DiphthongsContent } from "./types/content";
import type { LoadableState, Screen, TabKey } from "./types/ui";

const ALPHABET_URL = `${import.meta.env.BASE_URL}content/theory/alphabet.json`;
const DIPHTHONGS_URL = `${import.meta.env.BASE_URL}content/theory/diphthongs.json`;

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [tab, setTab] = useState<TabKey>("theory");

  const [alphabetState, setAlphabetState] = useState<LoadableState<AlphabetContent>>(
    createInitialLoadableState<AlphabetContent>()
  );
  const [pageIndex, setPageIndex] = useState(0);

  const [diphthongsState, setDiphthongsState] = useState<
    LoadableState<DiphthongsContent>
  >(createInitialLoadableState<DiphthongsContent>());
  const [diphthongIndex, setDiphthongIndex] = useState(0);

  useEffect(() => {
    if (window.Telegram?.WebApp?.ready) {
      window.Telegram.WebApp.ready();
    }
  }, []);

  useEffect(() => {
    if (screen !== "alphabet" || alphabetState.status !== "idle") {
      return;
    }

    setAlphabetState((prev) => ({
      ...prev,
      status: "loading",
      error: ""
    }));

    loadJsonContent<AlphabetContent>(ALPHABET_URL)
      .then((data) => {
        setAlphabetState({
          data,
          status: "success",
          error: ""
        });
      })
      .catch((err: unknown) => {
        setAlphabetState({
          data: null,
          status: "error",
          error: err instanceof Error ? err.message : "Unknown error"
        });
      });
  }, [screen, alphabetState.status]);

  useEffect(() => {
    if (screen !== "diphthongs" || diphthongsState.status !== "idle") {
      return;
    }

    setDiphthongsState((prev) => ({
      ...prev,
      status: "loading",
      error: ""
    }));

    loadJsonContent<DiphthongsContent>(DIPHTHONGS_URL)
      .then((data) => {
        setDiphthongsState({
          data,
          status: "success",
          error: ""
        });
      })
      .catch((err: unknown) => {
        setDiphthongsState({
          data: null,
          status: "error",
          error: err instanceof Error ? err.message : "Unknown error"
        });
      });
  }, [screen, diphthongsState.status]);

  const handleOpenAlphabet = () => {
    setScreen("alphabet");
    setPageIndex(0);
  };

  const handleOpenDiphthongs = () => {
    setScreen("diphthongs");
    setDiphthongIndex(0);
  };

  const handleExit = () => {
    setScreen("home");
  };

  const handlePrevAlphabetPage = () => {
    setPageIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextAlphabetPage = () => {
    setPageIndex((prev) => prev + 1);
  };

  const handleRetryAlphabet = () => {
    setAlphabetState(createInitialLoadableState<AlphabetContent>());
    setPageIndex(0);
  };

  const handlePrevDiphthong = () => {
    setDiphthongIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextDiphthong = (max: number) => {
    setDiphthongIndex((prev) => Math.min(max - 1, prev + 1));
  };

  const handleRetryDiphthongs = () => {
    setDiphthongsState(createInitialLoadableState<DiphthongsContent>());
    setDiphthongIndex(0);
  };

  const isHomeScreen = screen === "home";

  return (
    <div className="app">
      {isHomeScreen ? (
        <HomeScreen
          tab={tab}
          onOpenAlphabet={handleOpenAlphabet}
          onOpenDiphthongs={handleOpenDiphthongs}
        />
      ) : screen === "alphabet" ? (
        <AlphabetScreen
          alphabetState={alphabetState}
          pageIndex={pageIndex}
          onClose={handleExit}
          onPrev={handlePrevAlphabetPage}
          onNext={handleNextAlphabetPage}
          onRetry={handleRetryAlphabet}
          onSpeak={speakGreekText}
        />
      ) : (
        <DiphthongsScreen
          diphthongsState={diphthongsState}
          diphthongIndex={diphthongIndex}
          onClose={handleExit}
          onPrev={handlePrevDiphthong}
          onNext={handleNextDiphthong}
          onRetry={handleRetryDiphthongs}
          onSpeak={speakGreekText}
        />
      )}

      {isHomeScreen ? <TabBar tab={tab} onChange={setTab} /> : null}
    </div>
  );
}

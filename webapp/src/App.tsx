import { useEffect, useState } from "react";
import TabBar from "./components/tab-bar.tsx";
import AlphabetScreen from "./screens/alphabet-screen.tsx";
import DiphthongsScreen from "./screens/diphthongs-screen.tsx";
import HomeScreen from "./screens/home-screen.tsx";
import { loadJsonContent } from "./lib/content-loader.ts";
import { speakGreekText } from "./lib/speech.ts";
import type { AlphabetContent, DiphthongsContent } from "./types/content";
import type { LoadStatus, Screen, TabKey } from "./types/ui";

const ALPHABET_URL = `${import.meta.env.BASE_URL}content/theory/alphabet.json`;
const DIPHTHONGS_URL = `${import.meta.env.BASE_URL}content/theory/diphthongs.json`;

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [tab, setTab] = useState<TabKey>("theory");

  const [alphabet, setAlphabet] = useState<AlphabetContent | null>(null);
  const [alphabetStatus, setAlphabetStatus] = useState<LoadStatus>("idle");
  const [alphabetError, setAlphabetError] = useState("");
  const [pageIndex, setPageIndex] = useState(0);

  const [diphthongs, setDiphthongs] = useState<DiphthongsContent | null>(null);
  const [diphthongsStatus, setDiphthongsStatus] = useState<LoadStatus>("idle");
  const [diphthongsError, setDiphthongsError] = useState("");
  const [diphthongIndex, setDiphthongIndex] = useState(0);

  useEffect(() => {
    if (window.Telegram?.WebApp?.ready) {
      window.Telegram.WebApp.ready();
    }
  }, []);

  useEffect(() => {
    if (screen !== "alphabet" || alphabetStatus !== "idle") {
      return;
    }

    setAlphabetStatus("loading");
    setAlphabetError("");

    loadJsonContent<AlphabetContent>(ALPHABET_URL)
      .then((data) => {
        setAlphabet(data);
        setAlphabetStatus("success");
      })
      .catch((err: unknown) => {
        setAlphabetError(err instanceof Error ? err.message : "Unknown error");
        setAlphabetStatus("error");
      });
  }, [screen, alphabetStatus]);

  useEffect(() => {
    if (screen !== "diphthongs" || diphthongsStatus !== "idle") {
      return;
    }

    setDiphthongsStatus("loading");
    setDiphthongsError("");

    loadJsonContent<DiphthongsContent>(DIPHTHONGS_URL)
      .then((data) => {
        setDiphthongs(data);
        setDiphthongsStatus("success");
      })
      .catch((err: unknown) => {
        setDiphthongsError(err instanceof Error ? err.message : "Unknown error");
        setDiphthongsStatus("error");
      });
  }, [screen, diphthongsStatus]);

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
    setAlphabet(null);
    setAlphabetError("");
    setAlphabetStatus("idle");
    setPageIndex(0);
  };

  const handlePrevDiphthong = () => {
    setDiphthongIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextDiphthong = (max: number) => {
    setDiphthongIndex((prev) => Math.min(max - 1, prev + 1));
  };

  const handleRetryDiphthongs = () => {
    setDiphthongs(null);
    setDiphthongsError("");
    setDiphthongsStatus("idle");
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
          alphabet={alphabet}
          status={alphabetStatus}
          error={alphabetError}
          pageIndex={pageIndex}
          onClose={handleExit}
          onPrev={handlePrevAlphabetPage}
          onNext={handleNextAlphabetPage}
          onRetry={handleRetryAlphabet}
          onSpeak={speakGreekText}
        />
      ) : (
        <DiphthongsScreen
          diphthongs={diphthongs}
          status={diphthongsStatus}
          error={diphthongsError}
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

import { useEffect, useState } from "react";
import TabBar from "./components/tab-bar.tsx";
import AlphabetScreen from "./screens/alphabet-screen.tsx";
import DiphthongsScreen from "./screens/diphthongs-screen.tsx";
import HomeScreen from "./screens/home-screen.tsx";
import InputPracticeTopicScreen from "./screens/input-practice-topic-screen.tsx";
import PracticeTopicScreen from "./screens/practice-topic-screen.tsx";
import PracticeTopicsScreen from "./screens/practice-topics-screen.tsx";
import WriteWordTopicsScreen from "./screens/write-word-topics-screen.tsx";
import { loadJsonContent } from "./lib/content-loader.ts";
import { loadSingleChoiceTopic } from "./lib/exercises/load-single-choice-topic.ts";
import { createInitialLoadableState } from "./lib/loadable-state.ts";
import { speakGreekText } from "./lib/speech.ts";
import type { AlphabetContent, DiphthongsContent } from "./types/content";
import type { ExerciseCollection, InputExercise } from "./types/exercises";
import type { LoadableState, Screen, TabKey } from "./types/ui";

const ALPHABET_URL = `${import.meta.env.BASE_URL}content/theory/alphabet.json`;
const DIPHTHONGS_URL = `${import.meta.env.BASE_URL}content/theory/diphthongs.json`;
const BASE_GREEK_URL = `${import.meta.env.BASE_URL}content/practice/single_choice/base-greek.json`;
const ALPHA_TYPE_VERBS_URL = `${import.meta.env.BASE_URL}content/practice/single_choice/alpha-type-verbs.json`;
const ALPHA_TYPE_VERB_ENDINGS_URL = `${import.meta.env.BASE_URL}content/practice/single_choice/alpha-type-verb-endings.json`;
const ALPHA_TYPE_VERB_CONJUGATION_INPUT_URL = `${import.meta.env.BASE_URL}content/practice/input/alpha_type_verb_conjugation_input.json`;

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

  const [baseGreekState, setBaseGreekState] = useState<LoadableState<ExerciseCollection>>(
    createInitialLoadableState<ExerciseCollection>()
  );
  const [alphaTypeVerbsState, setAlphaTypeVerbsState] = useState<
    LoadableState<ExerciseCollection>
  >(createInitialLoadableState<ExerciseCollection>());
  const [alphaTypeVerbEndingsState, setAlphaTypeVerbEndingsState] = useState<
    LoadableState<ExerciseCollection>
  >(createInitialLoadableState<ExerciseCollection>());
  const [alphaTypeVerbConjugationInputState, setAlphaTypeVerbConjugationInputState] =
    useState<LoadableState<InputExercise[]>>(createInitialLoadableState<InputExercise[]>());

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

  useEffect(() => {
    if (screen !== "practice-base-greek" || baseGreekState.status !== "idle") {
      return;
    }

    setBaseGreekState((prev) => ({
      ...prev,
      status: "loading",
      error: ""
    }));

    loadSingleChoiceTopic(BASE_GREEK_URL, "Базовые фразы")
      .then((data) => {
        setBaseGreekState({
          data,
          status: "success",
          error: ""
        });
      })
      .catch((err: unknown) => {
        setBaseGreekState({
          data: null,
          status: "error",
          error: err instanceof Error ? err.message : "Unknown error"
        });
      });
  }, [screen, baseGreekState.status]);

  useEffect(() => {
    if (
      screen !== "practice-alpha-type-verbs" ||
      alphaTypeVerbsState.status !== "idle"
    ) {
      return;
    }

    setAlphaTypeVerbsState((prev) => ({
      ...prev,
      status: "loading",
      error: ""
    }));

    loadSingleChoiceTopic(ALPHA_TYPE_VERBS_URL, "Глаголы на -ω (альфа-группа)")
      .then((data) => {
        setAlphaTypeVerbsState({
          data,
          status: "success",
          error: ""
        });
      })
      .catch((err: unknown) => {
        setAlphaTypeVerbsState({
          data: null,
          status: "error",
          error: err instanceof Error ? err.message : "Unknown error"
        });
      });
  }, [screen, alphaTypeVerbsState.status]);

  useEffect(() => {
    if (
      screen !== "practice-alpha-type-verb-endings" ||
      alphaTypeVerbEndingsState.status !== "idle"
    ) {
      return;
    }

    setAlphaTypeVerbEndingsState((prev) => ({
      ...prev,
      status: "loading",
      error: ""
    }));

    loadSingleChoiceTopic(
      ALPHA_TYPE_VERB_ENDINGS_URL,
      "Окончания глаголов α-типа"
    )
      .then((data) => {
        setAlphaTypeVerbEndingsState({
          data,
          status: "success",
          error: ""
        });
      })
      .catch((err: unknown) => {
        setAlphaTypeVerbEndingsState({
          data: null,
          status: "error",
          error: err instanceof Error ? err.message : "Unknown error"
        });
      });
  }, [screen, alphaTypeVerbEndingsState.status]);

  useEffect(() => {
    if (
      screen !== "practice-alpha-type-verb-conjugation" ||
      alphaTypeVerbConjugationInputState.status !== "idle"
    ) {
      return;
    }

    setAlphaTypeVerbConjugationInputState((prev) => ({
      ...prev,
      status: "loading",
      error: ""
    }));

    loadJsonContent<InputExercise[]>(ALPHA_TYPE_VERB_CONJUGATION_INPUT_URL)
      .then((data) => {
        setAlphaTypeVerbConjugationInputState({
          data,
          status: "success",
          error: ""
        });
      })
      .catch((err: unknown) => {
        setAlphaTypeVerbConjugationInputState({
          data: null,
          status: "error",
          error: err instanceof Error ? err.message : "Unknown error"
        });
      });
  }, [screen, alphaTypeVerbConjugationInputState.status]);

  const handleOpenAlphabet = () => {
    setScreen("alphabet");
    setPageIndex(0);
  };

  const handleOpenDiphthongs = () => {
    setScreen("diphthongs");
    setDiphthongIndex(0);
  };

  const handleOpenDictionaryTopics = () => {
    setScreen("practice-dictionary-topics");
  };

  const handleOpenWriteWordTopics = () => {
    setScreen("practice-write-word-topics");
  };

  const handleExit = () => {
    setScreen("home");
  };

  const handleClosePracticeTopic = () => {
    setScreen("practice-dictionary-topics");
  };

  const handleOpenBasicPhrases = () => {
    setScreen("practice-base-greek");
  };

  const handleOpenAlphaTypeVerbs = () => {
    setScreen("practice-alpha-type-verbs");
  };

  const handleOpenAlphaTypeVerbEndings = () => {
    setScreen("practice-alpha-type-verb-endings");
  };

  const handleOpenAlphaTypeVerbConjugation = () => {
    setScreen("practice-alpha-type-verb-conjugation");
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

  const handleRetryBaseGreek = () => {
    setBaseGreekState(createInitialLoadableState<ExerciseCollection>());
  };

  const handleRetryAlphaTypeVerbs = () => {
    setAlphaTypeVerbsState(createInitialLoadableState<ExerciseCollection>());
  };

  const handleRetryAlphaTypeVerbEndings = () => {
    setAlphaTypeVerbEndingsState(createInitialLoadableState<ExerciseCollection>());
  };

  const handleRetryAlphaTypeVerbConjugation = () => {
    setAlphaTypeVerbConjugationInputState(
      createInitialLoadableState<InputExercise[]>()
    );
  };

  const isHomeScreen = screen === "home";

  return (
    <div className={`app ${isHomeScreen ? "" : "app--detail"}`}>
      {isHomeScreen ? (
        <HomeScreen
          tab={tab}
          onOpenAlphabet={handleOpenAlphabet}
          onOpenDiphthongs={handleOpenDiphthongs}
          onOpenDictionaryTopics={handleOpenDictionaryTopics}
          onOpenWriteWordTopics={handleOpenWriteWordTopics}
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
      ) : screen === "diphthongs" ? (
        <DiphthongsScreen
          diphthongsState={diphthongsState}
          diphthongIndex={diphthongIndex}
          onClose={handleExit}
          onPrev={handlePrevDiphthong}
          onNext={handleNextDiphthong}
          onRetry={handleRetryDiphthongs}
          onSpeak={speakGreekText}
        />
      ) : screen === "practice-write-word-topics" ? (
        <WriteWordTopicsScreen
          onClose={handleExit}
          onOpenVerbConjugation={handleOpenAlphaTypeVerbConjugation}
        />
      ) : screen === "practice-alpha-type-verb-conjugation" ? (
        <InputPracticeTopicScreen
          title="Спряжение глаголов"
          topicState={alphaTypeVerbConjugationInputState}
          onClose={handleOpenWriteWordTopics}
          onRetry={handleRetryAlphaTypeVerbConjugation}
          onSpeak={speakGreekText}
        />
      ) : screen === "practice-base-greek" ? (
        <PracticeTopicScreen
          title="Базовые фразы"
          topicState={baseGreekState}
          onClose={handleClosePracticeTopic}
          onRetry={handleRetryBaseGreek}
          onSpeak={speakGreekText}
        />
      ) : screen === "practice-alpha-type-verbs" ? (
        <PracticeTopicScreen
          title="Глаголы на -ω (альфа-группа)"
          topicState={alphaTypeVerbsState}
          onClose={handleClosePracticeTopic}
          onRetry={handleRetryAlphaTypeVerbs}
          onSpeak={speakGreekText}
        />
      ) : screen === "practice-alpha-type-verb-endings" ? (
        <PracticeTopicScreen
          title="Окончания глаголов α-типа"
          topicState={alphaTypeVerbEndingsState}
          onClose={handleClosePracticeTopic}
          onRetry={handleRetryAlphaTypeVerbEndings}
          onSpeak={speakGreekText}
        />
      ) : (
        <PracticeTopicsScreen
          onClose={handleExit}
          onOpenBasicPhrases={handleOpenBasicPhrases}
          onOpenAlphaTypeVerbs={handleOpenAlphaTypeVerbs}
          onOpenAlphaTypeVerbEndings={handleOpenAlphaTypeVerbEndings}
        />
      )}

      {isHomeScreen ? <TabBar tab={tab} onChange={setTab} /> : null}
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import TabBar from "./components/tab-bar.tsx";
import AlphabetScreen from "./screens/alphabet-screen.tsx";
import DiphthongsScreen from "./screens/diphthongs-screen.tsx";
import HomeScreen from "./screens/home-screen.tsx";
import InputPracticeTopicScreen from "./screens/input-practice-topic-screen.tsx";
import PracticeTopicScreen from "./screens/practice-topic-screen.tsx";
import PracticeTopicsScreen from "./screens/practice-topics-screen.tsx";
import type { SingleChoiceTopicListItem } from "./screens/practice-topics-screen.tsx";
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
const SINGLE_CHOICE_INDEX_URL = `${import.meta.env.BASE_URL}content/practice/single_choice/index.json`;
const SINGLE_CHOICE_BASE_URL = `${import.meta.env.BASE_URL}content/practice/single_choice/`;
const ALPHA_TYPE_VERB_CONJUGATION_INPUT_URL = `${import.meta.env.BASE_URL}content/practice/input/alpha_type_verb_conjugation_input.json`;

interface SingleChoiceTopic extends SingleChoiceTopicListItem {
  fileName: string;
  collection: ExerciseCollection;
}

function normalizeInputExercises(content: unknown): InputExercise[] {
  if (Array.isArray(content)) {
    return content as InputExercise[];
  }

  if (
    typeof content === "object" &&
    content !== null &&
    "items" in content &&
    Array.isArray((content as { items?: unknown }).items)
  ) {
    return (content as { items: InputExercise[] }).items;
  }

  throw new Error("Invalid input practice content format");
}

function createTopicId(fileName: string): string {
  return fileName.replace(/\.json$/i, "");
}

function createTopicState(
  topicsState: LoadableState<SingleChoiceTopic[]>,
  selectedTopic: SingleChoiceTopic | undefined
): LoadableState<ExerciseCollection> {
  if (topicsState.status === "loading" || topicsState.status === "idle") {
    return {
      data: null,
      status: "loading",
      error: ""
    };
  }

  if (topicsState.status === "error") {
    return {
      data: null,
      status: "error",
      error: topicsState.error
    };
  }

  if (!selectedTopic) {
    return {
      data: null,
      status: "error",
      error: "Не удалось найти выбранную тему"
    };
  }

  return {
    data: selectedTopic.collection,
    status: "success",
    error: ""
  };
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [tab, setTab] = useState<TabKey>("practice");
  const [selectedSingleChoiceTopicId, setSelectedSingleChoiceTopicId] =
    useState<string | null>(null);

  const [alphabetState, setAlphabetState] = useState<LoadableState<AlphabetContent>>(
    createInitialLoadableState<AlphabetContent>()
  );
  const [pageIndex, setPageIndex] = useState(0);

  const [diphthongsState, setDiphthongsState] = useState<
    LoadableState<DiphthongsContent>
  >(createInitialLoadableState<DiphthongsContent>());
  const [diphthongIndex, setDiphthongIndex] = useState(0);

  const [singleChoiceTopicsState, setSingleChoiceTopicsState] = useState<
    LoadableState<SingleChoiceTopic[]>
  >(createInitialLoadableState<SingleChoiceTopic[]>());

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
    if (
      (screen !== "practice-dictionary-topics" &&
        screen !== "practice-single-choice-topic") ||
      singleChoiceTopicsState.status !== "idle"
    ) {
      return;
    }

    setSingleChoiceTopicsState((prev) => ({
      ...prev,
      status: "loading",
      error: ""
    }));

    loadJsonContent<string[]>(SINGLE_CHOICE_INDEX_URL)
      .then((files) =>
        Promise.all(
          files.map(async (fileName) => {
            const collection = await loadSingleChoiceTopic(
              `${SINGLE_CHOICE_BASE_URL}${fileName}`,
              ""
            );

            return {
              id: createTopicId(fileName),
              fileName,
              title: collection.title,
              subtitle: collection.subtitle || "",
              collection
            };
          })
        )
      )
      .then((topics) => {
        setSingleChoiceTopicsState({
          data: topics,
          status: "success",
          error: ""
        });
      })
      .catch((err: unknown) => {
        setSingleChoiceTopicsState({
          data: null,
          status: "error",
          error: err instanceof Error ? err.message : "Unknown error"
        });
      });
  }, [screen, singleChoiceTopicsState.status]);

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

    loadJsonContent<unknown>(ALPHA_TYPE_VERB_CONJUGATION_INPUT_URL)
      .then((content) => normalizeInputExercises(content))
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

  const selectedSingleChoiceTopic = useMemo(
    () =>
      singleChoiceTopicsState.data?.find(
        (topic) => topic.id === selectedSingleChoiceTopicId
      ),
    [singleChoiceTopicsState.data, selectedSingleChoiceTopicId]
  );
  const selectedSingleChoiceTopicState = useMemo(
    () => createTopicState(singleChoiceTopicsState, selectedSingleChoiceTopic),
    [singleChoiceTopicsState, selectedSingleChoiceTopic]
  );
  const singleChoiceTopicListState = useMemo<
    LoadableState<SingleChoiceTopicListItem[]>
  >(
    () => ({
      ...singleChoiceTopicsState,
      data:
        singleChoiceTopicsState.data?.map(({ id, title, subtitle }) => ({
          id,
          title,
          subtitle
        })) ?? null
    }),
    [singleChoiceTopicsState]
  );

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

  const handleOpenSingleChoiceTopic = (topicId: string) => {
    setSelectedSingleChoiceTopicId(topicId);
    setScreen("practice-single-choice-topic");
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

  const handleRetrySingleChoiceTopics = () => {
    setSingleChoiceTopicsState(createInitialLoadableState<SingleChoiceTopic[]>());
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
      ) : screen === "practice-single-choice-topic" ? (
        <PracticeTopicScreen
          title={selectedSingleChoiceTopic?.title || "Тренировка"}
          topicState={selectedSingleChoiceTopicState}
          onClose={handleClosePracticeTopic}
          onRetry={handleRetrySingleChoiceTopics}
          onSpeak={speakGreekText}
        />
      ) : (
        <PracticeTopicsScreen
          topicsState={singleChoiceTopicListState}
          onClose={handleExit}
          onRetry={handleRetrySingleChoiceTopics}
          onOpenTopic={handleOpenSingleChoiceTopic}
        />
      )}

      {isHomeScreen ? <TabBar tab={tab} onChange={setTab} /> : null}
    </div>
  );
}

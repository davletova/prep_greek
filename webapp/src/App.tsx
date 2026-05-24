import { useCallback, useMemo, useState } from "react";
import { useTelegramWebAppReady } from "./app/use-telegram-web-app-ready.ts";
import TabBar from "./components/tab-bar.tsx";
import AlphabetScreen from "./screens/alphabet-screen.tsx";
import DiphthongsScreen from "./screens/diphthongs-screen.tsx";
import HomeScreen from "./screens/home-screen.tsx";
import InputPracticeTopicScreen from "./screens/input-practice-topic-screen.tsx";
import PracticeTopicScreen from "./screens/practice-topic-screen.tsx";
import PracticeTopicsScreen from "./screens/practice-topics-screen.tsx";
import type { SingleChoiceTopicListItem } from "./screens/practice-topics-screen.tsx";
import WriteWordTopicsScreen from "./screens/write-word-topics-screen.tsx";
import { inputPracticeTopics, singleChoicePracticeContent } from "./config/practice-topics.ts";
import { theoryContent } from "./config/theory.ts";
import { useLoadableContent } from "./hooks/use-loadable-content.ts";
import { loadJsonContent } from "./lib/content-loader.ts";
import { loadSingleChoiceTopic } from "./lib/exercises/load-single-choice-topic.ts";
import { speakGreekText } from "./lib/speech.ts";
import { alphabetContentSchema, diphthongsContentSchema } from "./schemas/content.ts";
import {
  inputExerciseArraySchema,
  inputExerciseCollectionSchema
} from "./schemas/exercises.ts";
import type { ExerciseCollection, InputExercise } from "./types/exercises";
import type { LoadableState, Screen, TabKey } from "./types/ui";

interface SingleChoiceTopic extends SingleChoiceTopicListItem {
  fileName: string;
  collection: ExerciseCollection;
}

function normalizeInputExercises(content: unknown): InputExercise[] {
  const arrayResult = inputExerciseArraySchema.safeParse(content);
  if (arrayResult.success) {
    return arrayResult.data;
  }

  const collectionResult = inputExerciseCollectionSchema.safeParse(content);
  if (collectionResult.success) {
    return collectionResult.data.items;
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

  const loadAlphabetContent = useCallback(
    () =>
      loadJsonContent<unknown>(theoryContent.alphabet.url).then((content) =>
        alphabetContentSchema.parse(content)
      ),
    []
  );
  const { state: alphabetState, retry: retryAlphabet } = useLoadableContent(
    screen === "alphabet",
    loadAlphabetContent
  );
  const [pageIndex, setPageIndex] = useState(0);

  const loadDiphthongsContent = useCallback(
    () =>
      loadJsonContent<unknown>(theoryContent.diphthongs.url).then((content) =>
        diphthongsContentSchema.parse(content)
      ),
    []
  );
  const { state: diphthongsState, retry: retryDiphthongs } = useLoadableContent(
    screen === "diphthongs",
    loadDiphthongsContent
  );
  const [diphthongIndex, setDiphthongIndex] = useState(0);

  const loadSingleChoiceTopics = useCallback(
    () =>
      loadJsonContent<string[]>(singleChoicePracticeContent.indexUrl).then((files) =>
        Promise.all(
          files.map(async (fileName) => {
            const collection = await loadSingleChoiceTopic(
              `${singleChoicePracticeContent.baseUrl}${fileName}`,
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
      ),
    []
  );
  const {
    state: singleChoiceTopicsState,
    retry: retrySingleChoiceTopics
  } = useLoadableContent(
    screen === "practice-dictionary-topics" ||
      screen === "practice-single-choice-topic",
    loadSingleChoiceTopics
  );

  const loadAlphaTypeVerbConjugationInput = useCallback(
    () =>
      loadJsonContent<unknown>(
        inputPracticeTopics.alphaTypeVerbConjugation.url
      ).then(normalizeInputExercises),
    []
  );
  const {
    state: alphaTypeVerbConjugationInputState,
    retry: retryAlphaTypeVerbConjugationInput
  } = useLoadableContent(
    screen === "practice-alpha-type-verb-conjugation",
    loadAlphaTypeVerbConjugationInput
  );

  useTelegramWebAppReady();

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
    retryAlphabet();
    setPageIndex(0);
  };

  const handlePrevDiphthong = () => {
    setDiphthongIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextDiphthong = (max: number) => {
    setDiphthongIndex((prev) => Math.min(max - 1, prev + 1));
  };

  const handleRetryDiphthongs = () => {
    retryDiphthongs();
    setDiphthongIndex(0);
  };

  const handleRetrySingleChoiceTopics = () => {
    retrySingleChoiceTopics();
  };

  const handleRetryAlphaTypeVerbConjugation = () => {
    retryAlphaTypeVerbConjugationInput();
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
          title={inputPracticeTopics.alphaTypeVerbConjugation.title}
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

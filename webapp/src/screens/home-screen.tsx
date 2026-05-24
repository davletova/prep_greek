import PracticeHomeScreen from "./practice-home-screen.tsx";
import ProfileScreen from "./profile-screen.tsx";
import TheoryHomeScreen from "./theory-home-screen.tsx";
import type { TabKey, VoidHandler } from "../types/ui";

interface HomeScreenProps {
  tab: TabKey;
  onOpenAlphabet: VoidHandler;
  onOpenDiphthongs: VoidHandler;
  onOpenDictionaryTopics: VoidHandler;
  onOpenWriteWordTopics: VoidHandler;
}

export default function HomeScreen({
  tab,
  onOpenAlphabet,
  onOpenDiphthongs,
  onOpenDictionaryTopics,
  onOpenWriteWordTopics,
}: HomeScreenProps) {
  if (tab === "practice") {
    return (
      <PracticeHomeScreen
        onOpenDictionaryTopics={onOpenDictionaryTopics}
        onOpenWriteWordTopics={onOpenWriteWordTopics}
      />
    );
  }

  if (tab === "profile") {
    return <ProfileScreen />;
  }

  return <TheoryHomeScreen onOpenAlphabet={onOpenAlphabet} onOpenDiphthongs={onOpenDiphthongs} />;
}

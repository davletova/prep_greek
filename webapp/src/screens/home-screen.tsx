import PracticeHomeScreen from "./practice-home-screen.tsx";
import ProfileScreen from "./profile-screen.tsx";
import TheoryHomeScreen from "./theory-home-screen.tsx";
import type { TabKey, VoidHandler } from "../types/ui";

interface HomeScreenProps {
  tab: TabKey;
  onOpenAlphabet: VoidHandler;
  onOpenDiphthongs: VoidHandler;
  onOpenSingleChoiceTopics: VoidHandler;
  onOpenInputTopics: VoidHandler;
  onOpenListeningTopics: VoidHandler;
}

export default function HomeScreen({
  tab,
  onOpenAlphabet,
  onOpenDiphthongs,
  onOpenSingleChoiceTopics,
  onOpenInputTopics,
  onOpenListeningTopics,
}: HomeScreenProps) {
  if (tab === "practice") {
    return (
      <PracticeHomeScreen
        onOpenSingleChoiceTopics={onOpenSingleChoiceTopics}
        onOpenInputTopics={onOpenInputTopics}
        onOpenListeningTopics={onOpenListeningTopics}
      />
    );
  }

  if (tab === "profile") {
    return <ProfileScreen />;
  }

  return <TheoryHomeScreen onOpenAlphabet={onOpenAlphabet} onOpenDiphthongs={onOpenDiphthongs} />;
}

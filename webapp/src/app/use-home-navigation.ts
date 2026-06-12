import { useState } from "react";
import type { TabKey } from "../types/ui.ts";

interface HomeNavigationState {
  tab: TabKey;
  setTab: (tab: TabKey) => void;
}

export function useHomeNavigation(): HomeNavigationState {
  const [tab, setTab] = useState<TabKey>("practice");

  return {
    tab,
    setTab,
  };
}

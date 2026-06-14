import { useEffect, useState } from "react";
import { screenFromHash, screenToHash } from "./screen-hash-router.ts";
import type { Screen, ScreenNavigationHandler, ScreenNavigationOptions } from "../types/ui.ts";

interface ScreenNavigationState {
  screen: Screen;
  setScreen: ScreenNavigationHandler;
  isHomeScreen: boolean;
  exitToHome: () => void;
}

function getInitialScreen(): Screen {
  if (typeof window === "undefined") {
    return "home";
  }

  return screenFromHash(window.location.hash);
}

export function useScreenNavigation(): ScreenNavigationState {
  const [screen, setScreenState] = useState<Screen>(getInitialScreen);
  const isHomeScreen = screen === "home";

  const setScreen = (nextScreen: Screen, options: ScreenNavigationOptions = {}) => {
    if (typeof window !== "undefined") {
      const nextHash = screenToHash(nextScreen);

      if (window.location.hash !== nextHash) {
        if (options.history === "replace") {
          window.history.replaceState(null, "", nextHash);
        } else {
          window.location.hash = nextHash;
        }
      }
    }

    setScreenState(nextScreen);
  };

  useEffect(() => {
    const handleHashChange = () => {
      setScreenState(screenFromHash(window.location.hash));
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const exitToHome = () => {
    setScreen("home", { history: "replace" });
  };

  return {
    screen,
    setScreen,
    isHomeScreen,
    exitToHome,
  };
}

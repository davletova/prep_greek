import { useEffect } from "react";

export function useTelegramWebAppReady(): void {
  useEffect(() => {
    if (window.Telegram?.WebApp?.ready) {
      window.Telegram.WebApp.ready();
    }
  }, []);
}

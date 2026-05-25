import { useEffect, useState } from "react";

export function useDelayedLoading(isLoading: boolean, delayMs = 350): boolean {
  const [shouldShowLoading, setShouldShowLoading] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShouldShowLoading(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShouldShowLoading(true);
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [delayMs, isLoading]);

  return shouldShowLoading;
}

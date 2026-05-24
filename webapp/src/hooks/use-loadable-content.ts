import { useCallback, useEffect, useState } from "react";
import { createInitialLoadableState } from "../lib/loadable-state.ts";
import type { LoadableState } from "../types/ui";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

export function useLoadableContent<T>(
  isActive: boolean,
  load: () => Promise<T>
): {
  state: LoadableState<T>;
  retry: () => void;
} {
  const [state, setState] = useState<LoadableState<T>>(
    createInitialLoadableState<T>()
  );

  useEffect(() => {
    if (!isActive || state.status !== "idle") {
      return;
    }

    let isCancelled = false;

    setState((prev) => ({
      ...prev,
      status: "loading",
      error: ""
    }));

    load()
      .then((data) => {
        if (isCancelled) {
          return;
        }

        setState({
          data,
          status: "success",
          error: ""
        });
      })
      .catch((error: unknown) => {
        if (isCancelled) {
          return;
        }

        setState({
          data: null,
          status: "error",
          error: getErrorMessage(error)
        });
      });

    return () => {
      isCancelled = true;
    };
  }, [isActive, load, state.status]);

  const retry = useCallback(() => {
    setState(createInitialLoadableState<T>());
  }, []);

  return { state, retry };
}

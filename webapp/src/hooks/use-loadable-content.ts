import { useCallback, useEffect, useRef, useState } from "react";
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
  const statusRef = useRef(state.status);

  const updateState = useCallback((nextState: LoadableState<T>) => {
    statusRef.current = nextState.status;
    setState(nextState);
  }, []);

  useEffect(() => {
    if (!isActive || statusRef.current !== "idle") {
      return;
    }

    let isCancelled = false;

    updateState({
      data: null,
      status: "loading",
      error: ""
    });

    load()
      .then((data) => {
        if (isCancelled) {
          return;
        }

        updateState({
          data,
          status: "success",
          error: ""
        });
      })
      .catch((error: unknown) => {
        if (isCancelled) {
          return;
        }

        updateState({
          data: null,
          status: "error",
          error: getErrorMessage(error)
        });
      });

    return () => {
      isCancelled = true;
    };
  }, [isActive, load, updateState]);

  const retry = useCallback(() => {
    updateState(createInitialLoadableState<T>());
  }, [updateState]);

  return { state, retry };
}

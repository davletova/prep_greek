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
  const hasStartedRef = useRef(false);
  const requestIdRef = useRef(0);

  const startLoading = useCallback(() => {
    hasStartedRef.current = true;
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;

    setState({
      data: null,
      status: "loading",
      error: ""
    });

    load()
      .then((data) => {
        if (requestIdRef.current !== requestId) {
          return;
        }

        setState({
          data,
          status: "success",
          error: ""
        });
      })
      .catch((error: unknown) => {
        if (requestIdRef.current !== requestId) {
          return;
        }

        setState({
          data: null,
          status: "error",
          error: getErrorMessage(error)
        });
      });
  }, [load]);

  useEffect(() => {
    if (isActive && !hasStartedRef.current) {
      startLoading();
    }
  }, [isActive, startLoading]);

  useEffect(
    () => () => {
      requestIdRef.current += 1;
    },
    []
  );

  const retry = useCallback(() => {
    hasStartedRef.current = false;
    requestIdRef.current += 1;
    setState(createInitialLoadableState<T>());

    if (isActive) {
      startLoading();
    }
  }, [isActive, startLoading]);

  return { state, retry };
}

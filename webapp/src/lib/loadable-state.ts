import type { LoadableState } from "../types/ui";

export function createInitialLoadableState<T>(): LoadableState<T> {
  return {
    data: null,
    status: "idle",
    error: ""
  };
}

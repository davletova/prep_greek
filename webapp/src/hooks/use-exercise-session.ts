import { useEffect, useMemo, useState } from "react";
import { createShuffledIndices } from "../lib/random.ts";

interface ExerciseSession<T> {
  currentItem: T | null;
  currentIndex: number;
  hasItems: boolean;
  shuffledIndices: number[];
  next: () => void;
}

export function useExerciseSession<T>(items: readonly T[]): ExerciseSession<T> {
  const shuffledIndices = useMemo(
    () => createShuffledIndices(items.length),
    [items]
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [shuffledIndices]);

  const currentShuffledIndex = shuffledIndices[currentIndex];
  const currentItem =
    currentShuffledIndex === undefined ? null : items[currentShuffledIndex] ?? null;

  const next = () => {
    if (shuffledIndices.length === 0) {
      return;
    }

    setCurrentIndex((prev) => (prev + 1) % shuffledIndices.length);
  };

  return {
    currentItem,
    currentIndex,
    hasItems: shuffledIndices.length > 0,
    shuffledIndices,
    next
  };
}

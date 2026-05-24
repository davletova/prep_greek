export function shuffleArray<T>(items: readonly T[]): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = shuffled[index];
    const swapped = shuffled[swapIndex];

    if (current === undefined || swapped === undefined) {
      continue;
    }

    shuffled[index] = swapped;
    shuffled[swapIndex] = current;
  }

  return shuffled;
}

export function createShuffledIndices(size: number): number[] {
  return shuffleArray(Array.from({ length: size }, (_, index) => index));
}

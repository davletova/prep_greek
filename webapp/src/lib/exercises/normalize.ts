export function normalizeExerciseText(value: string): string {
  return value.normalize("NFC").trim().toLocaleLowerCase();
}

export function normalizeInputExerciseText(value: string): string {
  return normalizeExerciseText(value)
    .replace(/\p{P}+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

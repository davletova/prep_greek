import { theoryContent } from "../../config/theory.ts";
import { loadJsonContent } from "../../lib/content-loader.ts";
import { alphabetContentSchema, diphthongsContentSchema } from "../../schemas/content.ts";
import type { AlphabetContent, DiphthongsContent } from "../../types/content.ts";

export function loadAlphabetContent(): Promise<AlphabetContent> {
  return loadJsonContent<unknown>(theoryContent.alphabet.url).then((content) =>
    alphabetContentSchema.parse(content)
  );
}

export function loadDiphthongsContent(): Promise<DiphthongsContent> {
  return loadJsonContent<unknown>(theoryContent.diphthongs.url).then((content) =>
    diphthongsContentSchema.parse(content)
  );
}

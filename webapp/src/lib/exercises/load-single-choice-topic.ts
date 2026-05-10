import { loadJsonContent } from "../content-loader.ts";
import type {
  ExerciseCollection,
  SingleChoiceExercise
} from "../../types/exercises";

interface LegacySingleChoiceTopic {
  title?: string;
  items?: SingleChoiceExercise[];
}

function isSingleChoiceExerciseArray(
  value: unknown
): value is SingleChoiceExercise[] {
  return Array.isArray(value);
}

function isExerciseCollection(value: unknown): value is ExerciseCollection {
  return (
    typeof value === "object" &&
    value !== null &&
    "items" in value &&
    Array.isArray((value as ExerciseCollection).items)
  );
}

export async function loadSingleChoiceTopic(
  url: string,
  fallbackTitle: string
): Promise<ExerciseCollection> {
  const content = await loadJsonContent<unknown>(url);

  if (isSingleChoiceExerciseArray(content)) {
    return {
      title: fallbackTitle,
      items: content
    };
  }

  if (isExerciseCollection(content)) {
    return {
      title: content.title || fallbackTitle,
      items: content.items
    };
  }

  const legacyContent = content as LegacySingleChoiceTopic;
  if (Array.isArray(legacyContent?.items)) {
    return {
      title: legacyContent.title || fallbackTitle,
      items: legacyContent.items
    };
  }

  throw new Error("Invalid practice content format");
}

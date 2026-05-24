import { loadJsonContent } from "../content-loader.ts";
import {
  exerciseCollectionSchema,
  singleChoiceExerciseArraySchema
} from "../../schemas/exercises.ts";
import type { ExerciseCollection } from "../../types/exercises";

export async function loadSingleChoiceTopic(
  url: string,
  fallbackTitle: string
): Promise<ExerciseCollection> {
  const content = await loadJsonContent<unknown>(url);

  const exerciseArrayResult = singleChoiceExerciseArraySchema.safeParse(content);
  if (exerciseArrayResult.success) {
    return {
      title: fallbackTitle,
      subtitle: "",
      items: exerciseArrayResult.data
    };
  }

  const collectionResult = exerciseCollectionSchema.safeParse(content);
  if (collectionResult.success) {
    return {
      title: collectionResult.data.title || fallbackTitle,
      subtitle: collectionResult.data.subtitle || "",
      items: collectionResult.data.items
    };
  }

  throw new Error("Invalid practice content format");
}

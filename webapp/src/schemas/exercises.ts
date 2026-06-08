import { z } from "zod";
import type {
  Exercise,
  ExerciseCollection,
  InputExercise,
  NonEmptyArray,
  SingleChoiceExercise,
  TextInputExercise
} from "../types/exercises";

const promptLanguageSchema = z.enum(["el", "ru"]);

const baseExerciseSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  promptLanguage: promptLanguageSchema.optional(),
  translation: z.string().optional(),
  explanation: z.string().optional()
});

const wrongAnswersSchema = z
  .array(z.string())
  .min(1)
  .transform((answers) => answers as NonEmptyArray<string>);

export const singleChoiceExerciseSchema: z.ZodType<SingleChoiceExercise> =
  baseExerciseSchema.extend({
    type: z.literal("single-choice"),
    correctAnswer: z.string(),
    wrongAnswers: wrongAnswersSchema
  });

export const textInputExerciseSchema: z.ZodType<TextInputExercise> =
  baseExerciseSchema.extend({
    type: z.literal("text-input"),
    correctAnswers: z.array(z.string()).min(1)
  });

export const inputExerciseSchema: z.ZodType<InputExercise> = baseExerciseSchema.extend({
  type: z.literal("input"),
  correctAnswer: z.string(),
  context: z.string().optional()
});

export const exerciseSchema: z.ZodType<Exercise> = z.union([
  singleChoiceExerciseSchema,
  textInputExerciseSchema,
  inputExerciseSchema
]);

export const exerciseCollectionSchema: z.ZodType<ExerciseCollection> = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  items: z.array(exerciseSchema)
});

export const singleChoiceExerciseArraySchema = z.array(singleChoiceExerciseSchema);
export const inputExerciseArraySchema = z.array(inputExerciseSchema);
export const inputExerciseCollectionSchema: z.ZodType<{ items: InputExercise[] }> =
  z.object({
    items: inputExerciseArraySchema
  });

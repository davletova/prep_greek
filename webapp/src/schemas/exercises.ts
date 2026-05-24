import { z } from "zod";

const baseExerciseSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  promptLanguage: z.string().optional(),
  translation: z.string().optional(),
  explanation: z.string().optional()
});

const wrongAnswersSchema = z
  .array(z.string())
  .length(3)
  .transform((answers) => answers as [string, string, string]);

export const singleChoiceExerciseSchema = baseExerciseSchema.extend({
  type: z.literal("single-choice"),
  correctAnswer: z.string(),
  wrongAnswers: wrongAnswersSchema
});

export const textInputExerciseSchema = baseExerciseSchema.extend({
  type: z.literal("text-input"),
  correctAnswers: z.array(z.string()).min(1)
});

export const inputExerciseSchema = baseExerciseSchema.extend({
  type: z.literal("input"),
  correctAnswer: z.string(),
  context: z.string().optional()
});

export const exerciseSchema = z.discriminatedUnion("type", [
  singleChoiceExerciseSchema,
  textInputExerciseSchema,
  inputExerciseSchema
]);

export const exerciseCollectionSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  items: z.array(exerciseSchema)
});

export const singleChoiceExerciseArraySchema = z.array(singleChoiceExerciseSchema);
export const inputExerciseArraySchema = z.array(inputExerciseSchema);
export const inputExerciseCollectionSchema = z.object({
  items: inputExerciseArraySchema
});

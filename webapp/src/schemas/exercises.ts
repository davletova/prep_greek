import { z } from "zod";
import type {
  Exercise,
  ExerciseCollection,
  InputExercise,
  ListeningExercise,
  NonEmptyArray,
  SingleChoiceExercise,
  TextInputExercise,
} from "../types/exercises";

const promptLanguageSchema = z.enum(["el", "ru"]);

const baseExerciseSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  promptLanguage: promptLanguageSchema.optional(),
  translation: z.string().optional(),
  explanation: z.string().optional(),
});

const wrongAnswersSchema = z
  .array(z.string())
  .min(1)
  .transform((answers) => answers as NonEmptyArray<string>);

export const singleChoiceExerciseSchema: z.ZodType<SingleChoiceExercise> =
  baseExerciseSchema.extend({
    type: z.literal("single-choice"),
    correctAnswer: z.string(),
    wrongAnswers: wrongAnswersSchema,
  });

export const textInputExerciseSchema: z.ZodType<TextInputExercise> = baseExerciseSchema.extend({
  type: z.literal("text-input"),
  correctAnswers: z.array(z.string()).min(1),
});

export const inputExerciseSchema: z.ZodType<InputExercise> = baseExerciseSchema.extend({
  type: z.literal("input"),
  correctAnswer: z.string(),
  context: z.string().optional(),
});

const listeningAudioSourceSchema = z.union([
  z.object({
    kind: z.literal("tts"),
    text: z.string(),
    lang: z.literal("el-GR"),
    rate: z.number().optional(),
    pitch: z.number().optional(),
    volume: z.number().optional(),
  }),
  z.object({
    kind: z.literal("file"),
    src: z.string(),
  }),
]);

export const listeningExerciseSchema: z.ZodType<ListeningExercise> = baseExerciseSchema.extend({
  type: z.literal("listening"),
  answerMode: z.enum(["audio-to-russian", "audio-to-greek"]),
  audio: listeningAudioSourceSchema,
  transcript: z.string(),
  correctAnswer: z.string(),
  wrongAnswers: wrongAnswersSchema,
});

export const exerciseSchema: z.ZodType<Exercise> = z.union([
  singleChoiceExerciseSchema,
  textInputExerciseSchema,
  inputExerciseSchema,
  listeningExerciseSchema,
]);

const exerciseCollectionSettingsSchema = z.object({
  showTranslationHint: z.boolean().optional(),
});

export const exerciseCollectionSchema: z.ZodType<ExerciseCollection> = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  settings: exerciseCollectionSettingsSchema.optional(),
  items: z.array(exerciseSchema),
});

export const singleChoiceExerciseArraySchema = z.array(singleChoiceExerciseSchema);
export const inputExerciseArraySchema = z.array(inputExerciseSchema);
export const listeningExerciseArraySchema = z.array(listeningExerciseSchema);
export const inputExerciseCollectionSchema: z.ZodType<{ items: InputExercise[] }> = z.object({
  items: inputExerciseArraySchema,
});
export const listeningExerciseCollectionSchema: z.ZodType<{ items: ListeningExercise[] }> =
  z.object({
    items: listeningExerciseArraySchema,
  });

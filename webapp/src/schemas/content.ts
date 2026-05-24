import { z } from "zod";

export const alphabetContentSchema = z.object({
  title: z.string(),
  letters: z.array(
    z.object({
      upper: z.string(),
      lower: z.string(),
      name: z.string(),
      sound_ru: z.string(),
      note: z.string().optional(),
      example: z.string().optional()
    })
  )
});

export const diphthongsContentSchema = z.object({
  title: z.string(),
  items: z.array(
    z.object({
      diphthong: z.string(),
      sound_ru: z.string(),
      examples: z.array(
        z.object({
          word: z.string(),
          ru: z.string()
        })
      )
    })
  )
});

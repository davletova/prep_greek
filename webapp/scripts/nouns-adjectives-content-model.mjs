import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const idSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const nonEmptyStringSchema = z.string().trim().min(1);
const genderSchema = z.enum(["masculine", "feminine", "neuter"]);
const nullableTranslationSchema = nonEmptyStringSchema.nullable();

const themesSchema = z.array(
  z.object({
    id: idSchema,
    title: nonEmptyStringSchema,
    order: z.number().int().nonnegative(),
  })
);

const nounsSchema = z.array(
  z
    .object({
      id: idSchema,
      lemma: nonEmptyStringSchema,
      gender: genderSchema,
      themeId: idSchema,
      forms: z.object({
        singular: nonEmptyStringSchema,
        plural: nonEmptyStringSchema.nullable(),
      }),
      translations: z.object({
        singular: nonEmptyStringSchema,
        plural: nullableTranslationSchema,
      }),
    })
    .superRefine((noun, context) => {
      if ((noun.forms.plural === null) !== (noun.translations.plural === null)) {
        context.addIssue({
          code: "custom",
          path: ["translations", "plural"],
          message: "plural form and plural translation must either both exist or both be null",
        });
      }
    })
);

const adjectiveNumberFormsSchema = z.object({
  singular: nonEmptyStringSchema,
  plural: nonEmptyStringSchema,
});

const adjectivesSchema = z.array(
  z.object({
    id: idSchema,
    lemma: nonEmptyStringSchema,
    construction: z.enum(["article-adjective", "determiner-article", "articleless-determiner"]),
    forms: z.object({
      masculine: adjectiveNumberFormsSchema,
      feminine: adjectiveNumberFormsSchema,
      neuter: adjectiveNumberFormsSchema,
    }),
  })
);

const pairingsSchema = z.array(
  z
    .object({
      id: idSchema,
      nounId: idSchema,
      adjectiveId: idSchema,
      translations: z.object({
        singular: nullableTranslationSchema,
        plural: nullableTranslationSchema,
      }),
    })
    .refine(
      (pairing) => pairing.translations.singular !== null || pairing.translations.plural !== null,
      {
        path: ["translations"],
        message: "at least one natural singular or plural phrase must be provided",
      }
    )
);

const candidateAdjectiveFormsSchema = z.object({
  masculine: adjectiveNumberFormsSchema,
  feminine: adjectiveNumberFormsSchema,
  neuter: adjectiveNumberFormsSchema,
});

const lexiconCandidatesSchema = z
  .object({
    schemaVersion: z.literal(1),
    sources: z.object({
      scope: z.array(z.url()).min(1),
      forms: z.url(),
      formsLicense: z.literal("CC BY-SA 4.0"),
    }),
    nouns: z.array(
      z.object({
        id: z.string().regex(/^noun-\d{4}$/),
        lemma: nonEmptyStringSchema,
        gender: genderSchema,
        levels: z.array(z.enum(["A1", "A2"])).min(1),
        forms: z.object({
          singular: nonEmptyStringSchema,
          plural: nonEmptyStringSchema.nullable(),
        }),
        reviewStatus: z.enum(["imported", "needs-form-review"]),
      })
    ),
    adjectives: z.array(
      z.object({
        id: z.string().regex(/^adjective-\d{4}$/),
        lemma: nonEmptyStringSchema,
        levels: z.array(z.enum(["A1", "A2"])).min(1),
        forms: candidateAdjectiveFormsSchema.nullable(),
        reviewStatus: z.enum(["imported", "needs-form-review"]),
      })
    ),
  })
  .superRefine((content, context) => {
    for (const [field, entries] of [
      ["nouns", content.nouns],
      ["adjectives", content.adjectives],
    ]) {
      for (const duplicateId of findDuplicateIds(entries)) {
        context.addIssue({
          code: "custom",
          path: [field],
          message: `duplicate id "${duplicateId}"`,
        });
      }
    }

    content.adjectives.forEach((adjective, index) => {
      if ((adjective.forms === null) !== (adjective.reviewStatus === "needs-form-review")) {
        context.addIssue({
          code: "custom",
          path: ["adjectives", index, "reviewStatus"],
          message: "review status must reflect whether complete forms are available",
        });
      }
    });
  });

const corpusFiles = [
  ["themes.json", themesSchema],
  ["nouns.json", nounsSchema],
  ["adjectives.json", adjectivesSchema],
  ["pairings.json", pairingsSchema],
  ["lexicon-candidates.json", lexiconCandidatesSchema],
];

async function parseCorpusFile(sourceDir, fileName, schema) {
  const filePath = path.join(sourceDir, fileName);
  let content;

  try {
    content = JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    return {
      filePath,
      data: null,
      errors: [error instanceof Error ? error.message : "Invalid JSON"],
    };
  }

  const result = schema.safeParse(content);
  if (!result.success) {
    return {
      filePath,
      data: null,
      errors: result.error.issues.map((issue) => {
        const location = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
        return `${location}${issue.message}`;
      }),
    };
  }

  return { filePath, data: result.data, errors: [] };
}

function findDuplicateIds(items) {
  const seen = new Set();
  const duplicates = new Set();

  for (const item of items) {
    if (seen.has(item.id)) {
      duplicates.add(item.id);
    }
    seen.add(item.id);
  }

  return [...duplicates];
}

async function parseCorpus(sourceDir) {
  const results = await Promise.all(
    corpusFiles.map(([fileName, schema]) => parseCorpusFile(sourceDir, fileName, schema))
  );

  return results;
}

export async function validateNounsAdjectivesCorpus(sourceDir) {
  const results = await parseCorpus(sourceDir);
  const errors = results.flatMap((result) =>
    result.errors.map((message) => ({ filePath: result.filePath, message }))
  );

  if (errors.length > 0) {
    return errors;
  }

  const [themesResult, nounsResult, adjectivesResult, pairingsResult] = results;
  const themes = themesResult.data;
  const nouns = nounsResult.data;
  const adjectives = adjectivesResult.data;
  const pairings = pairingsResult.data;

  for (const [result, items] of [
    [themesResult, themes],
    [nounsResult, nouns],
    [adjectivesResult, adjectives],
    [pairingsResult, pairings],
  ]) {
    for (const duplicateId of findDuplicateIds(items)) {
      errors.push({ filePath: result.filePath, message: `duplicate id "${duplicateId}"` });
    }
  }

  const themeIds = new Set(themes.map((theme) => theme.id));
  const nounsById = new Map(nouns.map((noun) => [noun.id, noun]));
  const adjectiveIds = new Set(adjectives.map((adjective) => adjective.id));

  nouns.forEach((noun, index) => {
    if (!themeIds.has(noun.themeId)) {
      errors.push({
        filePath: nounsResult.filePath,
        message: `${index}.themeId references unknown theme "${noun.themeId}"`,
      });
    }
  });

  pairings.forEach((pairing, index) => {
    const noun = nounsById.get(pairing.nounId);
    if (!noun) {
      errors.push({
        filePath: pairingsResult.filePath,
        message: `${index}.nounId references unknown noun "${pairing.nounId}"`,
      });
    }
    if (!adjectiveIds.has(pairing.adjectiveId)) {
      errors.push({
        filePath: pairingsResult.filePath,
        message: `${index}.adjectiveId references unknown adjective "${pairing.adjectiveId}"`,
      });
    }
    if (noun?.forms.plural === null && pairing.translations.plural !== null) {
      errors.push({
        filePath: pairingsResult.filePath,
        message: `${index}.translations.plural is not allowed because noun "${pairing.nounId}" has no plural form`,
      });
    }
  });

  return errors;
}

export async function loadNounsAdjectivesCorpus(sourceDir) {
  const errors = await validateNounsAdjectivesCorpus(sourceDir);
  if (errors.length > 0) {
    throw new Error(
      errors
        .map((error) => `${path.relative(sourceDir, error.filePath)}: ${error.message}`)
        .join("\n")
    );
  }

  const results = await parseCorpus(sourceDir);
  const [themesResult, nounsResult, adjectivesResult, pairingsResult] = results;

  return {
    themes: themesResult.data,
    nouns: nounsResult.data,
    adjectives: adjectivesResult.data,
    pairings: pairingsResult.data,
  };
}

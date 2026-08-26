import { createReadStream } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";

const greekWordPattern = /^[α-ωάέήίόύώϊΐϋΰς]+$/u;
const nounPattern = /^([α-ωάέήίόύώϊΐϋΰς]+),\s*(ο|η|το|o)(?:\s|$|\[|\(|\/)/u;
const adjectivePattern = /^[^,]+,\s*-[^,\s/]{1,8}(?:\s*\([^)]*\))?\s*,\s*-[^,\s/]{1,8}/u;
const genderByArticle = { ο: "masculine", o: "masculine", η: "feminine", το: "neuter" };
const genders = ["masculine", "feminine", "neuter"];
const numbers = ["singular", "plural"];

function parseGlossaryText(text, level, targets) {
  for (const sourceLine of text.split(/\r?\n/u)) {
    if (!sourceLine.includes("=")) {
      continue;
    }

    const head = sourceLine.split("=", 1)[0].trim();
    const nounMatch = head.match(nounPattern);
    if (nounMatch) {
      const lemma = nounMatch[1].toLowerCase();
      const target = targets.nouns.get(lemma) ?? {
        lemma,
        gender: genderByArticle[nounMatch[2]],
        levels: new Set(),
      };
      target.levels.add(level);
      targets.nouns.set(lemma, target);
    }

    if (head[0]?.toLowerCase() !== head[0] || !adjectivePattern.test(head)) {
      continue;
    }

    const lemma = head.split(",", 1)[0].replaceAll("-", "").trim().toLowerCase();
    if (!greekWordPattern.test(lemma)) {
      continue;
    }

    const target = targets.adjectives.get(lemma) ?? { lemma, levels: new Set() };
    target.levels.add(level);
    targets.adjectives.set(lemma, target);
  }
}

function getNounGender(entry) {
  for (const template of entry.head_templates ?? []) {
    const gender = template.args?.g ?? (template.name === "el-noun" ? template.args?.["1"] : null);
    if (gender === "m") return "masculine";
    if (gender === "f") return "feminine";
    if (gender === "n") return "neuter";
  }
  return null;
}

function findTaggedForm(entry, requiredTags) {
  for (const form of entry.forms ?? []) {
    const tags = new Set(form.tags ?? []);
    if (requiredTags.every((tag) => tags.has(tag)) && typeof form.form === "string") {
      return form.form;
    }
  }
  return null;
}

function extractAdjectiveForms(entry) {
  const forms = {};

  for (const gender of genders) {
    forms[gender] = {};
    for (const number of numbers) {
      const form = findTaggedForm(entry, [gender, "nominative", number]);
      if (!form) {
        return null;
      }
      forms[gender][number] = form;
    }
  }

  return forms;
}

async function enrichFromKaikki(kaikkiPath, targets) {
  const nounEntries = new Map();
  const adjectiveEntries = new Map();
  const lines = createInterface({
    input: createReadStream(kaikkiPath, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });

  for await (const line of lines) {
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }

    if (entry.lang_code !== "el" || typeof entry.word !== "string") {
      continue;
    }

    if (entry.pos === "noun" && targets.nouns.has(entry.word)) {
      const targetGender = targets.nouns.get(entry.word).gender;
      if (getNounGender(entry) !== targetGender) {
        continue;
      }
      const plural = findTaggedForm(entry, ["nominative", "plural"]);
      const current = nounEntries.get(entry.word);
      if (!current || (!current.plural && plural)) {
        nounEntries.set(entry.word, { plural });
      }
    }

    if (entry.pos === "adj" && targets.adjectives.has(entry.word)) {
      const forms = extractAdjectiveForms(entry);
      if (forms) {
        adjectiveEntries.set(entry.word, forms);
      }
    }
  }

  return { nounEntries, adjectiveEntries };
}

function parseArguments(args) {
  const values = {};
  for (let index = 0; index < args.length; index += 2) {
    const name = args[index];
    const value = args[index + 1];
    if (!name?.startsWith("--") || !value) {
      throw new Error("Expected --a1-text, --a2-text, --kaikki-jsonl and --output arguments");
    }
    values[name.slice(2)] = value;
  }

  for (const required of ["a1-text", "a2-text", "kaikki-jsonl", "output"]) {
    if (!values[required]) {
      throw new Error(`Missing required argument --${required}`);
    }
  }

  return values;
}

export async function importA1A2Lexicon({ a1TextPath, a2TextPath, kaikkiPath, outputPath }) {
  const targets = { nouns: new Map(), adjectives: new Map() };
  parseGlossaryText(await readFile(a1TextPath, "utf8"), "A1", targets);
  parseGlossaryText(await readFile(a2TextPath, "utf8"), "A2", targets);
  const { nounEntries, adjectiveEntries } = await enrichFromKaikki(kaikkiPath, targets);

  const nouns = [...targets.nouns.values()]
    .sort((left, right) => left.lemma.localeCompare(right.lemma, "el"))
    .map((target, index) => {
      const dictionaryEntry = nounEntries.get(target.lemma);
      return {
        id: `noun-${String(index + 1).padStart(4, "0")}`,
        lemma: target.lemma,
        gender: target.gender,
        levels: [...target.levels].sort(),
        forms: {
          singular: target.lemma,
          plural: dictionaryEntry?.plural ?? null,
        },
        reviewStatus: dictionaryEntry ? "imported" : "needs-form-review",
      };
    });

  const adjectives = [...targets.adjectives.values()]
    .sort((left, right) => left.lemma.localeCompare(right.lemma, "el"))
    .map((target, index) => {
      const forms = adjectiveEntries.get(target.lemma) ?? null;
      return {
        id: `adjective-${String(index + 1).padStart(4, "0")}`,
        lemma: target.lemma,
        levels: [...target.levels].sort(),
        forms,
        reviewStatus: forms ? "imported" : "needs-form-review",
      };
    });

  const content = {
    schemaVersion: 1,
    sources: {
      scope: [
        "https://www.greek-language.gr/certification/sites/greeklanguage.gr.certification/files/KLIK_A1_Ef_Glossary.pdf",
        "https://www.greek-language.gr/certification/sites/greeklanguage.gr.certification/files/KLIK_A2_Ef_Glossary.pdf",
      ],
      forms: "https://kaikki.org/dictionary/Greek/kaikki.org-dictionary-Greek.jsonl",
      formsLicense: "CC BY-SA 4.0",
    },
    nouns,
    adjectives,
  };

  await writeFile(outputPath, `${JSON.stringify(content, null, 2)}\n`);
  return content;
}

const isMainModule =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
  try {
    const args = parseArguments(process.argv.slice(2));
    const content = await importA1A2Lexicon({
      a1TextPath: args["a1-text"],
      a2TextPath: args["a2-text"],
      kaikkiPath: args["kaikki-jsonl"],
      outputPath: args.output,
    });
    const nounForms = content.nouns.filter((noun) => noun.reviewStatus === "imported").length;
    const adjectiveForms = content.adjectives.filter(
      (adjective) => adjective.reviewStatus === "imported"
    ).length;
    console.log(
      `Imported ${content.nouns.length} nouns (${nounForms} matched) and ${content.adjectives.length} adjectives (${adjectiveForms} matched).`
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

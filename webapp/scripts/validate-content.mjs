import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateNounsAdjectivesCorpus } from "./nouns-adjectives-content-model.mjs";
import { validateNounsAdjectivesCoverage } from "./validate-nouns-adjectives-coverage.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const contentDir = path.join(rootDir, "public", "content");

const errors = [];

function addError(filePath, message) {
  errors.push(`${path.relative(rootDir, filePath)}: ${message}`);
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value) {
  return typeof value === "string" && value.length > 0;
}

async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    addError(filePath, error instanceof Error ? error.message : "Invalid JSON");
    return null;
  }
}

function validateOptionalString(filePath, value, field) {
  if (value !== undefined && typeof value !== "string") {
    addError(filePath, `${field} must be a string when provided`);
  }
}

function validateExerciseCollectionSettings(filePath, value) {
  if (value === undefined) {
    return;
  }

  if (!isRecord(value)) {
    addError(filePath, "settings must be an object when provided");
    return;
  }

  if (value.showTranslationHint !== undefined && typeof value.showTranslationHint !== "boolean") {
    addError(filePath, "settings.showTranslationHint must be a boolean when provided");
  }
}

function validatePromptLanguage(filePath, value, field) {
  if (value !== undefined && value !== "el" && value !== "ru") {
    addError(filePath, `${field} must be either "el" or "ru" when provided`);
  }
}

function validateUniqueExerciseIds(filePath, items) {
  const ids = new Set();

  for (const item of items) {
    if (!isRecord(item) || typeof item.id !== "string") {
      continue;
    }

    if (ids.has(item.id)) {
      addError(filePath, `duplicate exercise id "${item.id}"`);
    }

    ids.add(item.id);
  }
}

function validateSingleChoiceExercise(filePath, item, index) {
  const location = `items[${index}]`;

  if (!isString(item.id)) {
    addError(filePath, `${location}.id must be a non-empty string`);
  }

  if (!isString(item.prompt)) {
    addError(filePath, `${location}.prompt must be a non-empty string`);
  }

  validatePromptLanguage(filePath, item.promptLanguage, `${location}.promptLanguage`);
  validateOptionalString(filePath, item.translation, `${location}.translation`);
  validateOptionalString(filePath, item.explanation, `${location}.explanation`);

  if (!isString(item.correctAnswer)) {
    addError(filePath, `${location}.correctAnswer must be a non-empty string`);
  }

  if (!Array.isArray(item.wrongAnswers) || item.wrongAnswers.length < 1) {
    addError(filePath, `${location}.wrongAnswers must contain at least 1 item`);
    return;
  }

  item.wrongAnswers.forEach((answer, answerIndex) => {
    if (!isString(answer)) {
      addError(filePath, `${location}.wrongAnswers[${answerIndex}] must be a non-empty string`);
    }
  });

  const options = [item.correctAnswer, ...item.wrongAnswers].filter(
    (option) => typeof option === "string"
  );
  if (new Set(options).size !== options.length) {
    addError(filePath, `${location} answer options must be unique`);
  }
}

function validateInputExercise(filePath, item, index) {
  const location = `items[${index}]`;

  if (!isString(item.id)) {
    addError(filePath, `${location}.id must be a non-empty string`);
  }

  if (!isString(item.prompt)) {
    addError(filePath, `${location}.prompt must be a non-empty string`);
  }

  validatePromptLanguage(filePath, item.promptLanguage, `${location}.promptLanguage`);
  validateOptionalString(filePath, item.translation, `${location}.translation`);
  validateOptionalString(filePath, item.explanation, `${location}.explanation`);
  validateOptionalString(filePath, item.context, `${location}.context`);

  if (!isString(item.correctAnswer)) {
    addError(filePath, `${location}.correctAnswer must be a non-empty string`);
  }
}

function validateListeningAudioSource(filePath, audio, location) {
  if (!isRecord(audio)) {
    addError(filePath, `${location} must be an object`);
    return;
  }

  if (audio.kind === "tts") {
    if (!isString(audio.text)) {
      addError(filePath, `${location}.text must be a non-empty string`);
    }

    if (audio.lang !== "el-GR") {
      addError(filePath, `${location}.lang must be "el-GR"`);
    }

    for (const field of ["rate", "pitch", "volume"]) {
      if (audio[field] !== undefined && typeof audio[field] !== "number") {
        addError(filePath, `${location}.${field} must be a number when provided`);
      }
    }

    return;
  }

  if (audio.kind === "file") {
    if (!isString(audio.src)) {
      addError(filePath, `${location}.src must be a non-empty string`);
    }

    return;
  }

  addError(filePath, `${location}.kind must be either "tts" or "file"`);
}

function validateListeningExercise(filePath, item, index) {
  const location = `items[${index}]`;

  if (!isString(item.id)) {
    addError(filePath, `${location}.id must be a non-empty string`);
  }

  if (!isString(item.prompt)) {
    addError(filePath, `${location}.prompt must be a non-empty string`);
  }

  validateOptionalString(filePath, item.explanation, `${location}.explanation`);

  if (item.answerMode !== "audio-to-russian" && item.answerMode !== "audio-to-greek") {
    addError(filePath, `${location}.answerMode must be a supported listening mode`);
  }

  validateListeningAudioSource(filePath, item.audio, `${location}.audio`);

  if (!isString(item.transcript)) {
    addError(filePath, `${location}.transcript must be a non-empty string`);
  }

  validateSingleChoiceExercise(filePath, item, index);
}

function validateExerciseCollection(filePath, content, expectedType) {
  if (!isRecord(content)) {
    addError(filePath, "content must be an object");
    return;
  }

  if (!isString(content.title)) {
    addError(filePath, "title must be a non-empty string");
  }

  validateOptionalString(filePath, content.subtitle, "subtitle");
  validateExerciseCollectionSettings(filePath, content.settings);

  if (!Array.isArray(content.items)) {
    addError(filePath, "items must be an array");
    return;
  }

  validateUniqueExerciseIds(filePath, content.items);

  content.items.forEach((item, index) => {
    if (!isRecord(item)) {
      addError(filePath, `items[${index}] must be an object`);
      return;
    }

    if (item.type !== expectedType) {
      addError(filePath, `items[${index}].type must be "${expectedType}"`);
      return;
    }

    if (expectedType === "single-choice") {
      validateSingleChoiceExercise(filePath, item, index);
    } else if (expectedType === "input") {
      validateInputExercise(filePath, item, index);
    } else if (expectedType === "listening") {
      validateListeningExercise(filePath, item, index);
    }
  });
}

function validateAlphabetContent(filePath, content) {
  if (!isRecord(content)) {
    addError(filePath, "content must be an object");
    return;
  }

  if (!isString(content.title)) {
    addError(filePath, "title must be a non-empty string");
  }

  if (!Array.isArray(content.letters)) {
    addError(filePath, "letters must be an array");
    return;
  }

  content.letters.forEach((letter, index) => {
    const location = `letters[${index}]`;
    if (!isRecord(letter)) {
      addError(filePath, `${location} must be an object`);
      return;
    }

    for (const field of ["upper", "lower", "name", "sound_ru"]) {
      if (!isString(letter[field])) {
        addError(filePath, `${location}.${field} must be a non-empty string`);
      }
    }

    validateOptionalString(filePath, letter.note, `${location}.note`);
    validateOptionalString(filePath, letter.example, `${location}.example`);
  });
}

function validateDiphthongsContent(filePath, content) {
  if (!isRecord(content)) {
    addError(filePath, "content must be an object");
    return;
  }

  if (!isString(content.title)) {
    addError(filePath, "title must be a non-empty string");
  }

  if (!Array.isArray(content.items)) {
    addError(filePath, "items must be an array");
    return;
  }

  content.items.forEach((item, index) => {
    const location = `items[${index}]`;
    if (!isRecord(item)) {
      addError(filePath, `${location} must be an object`);
      return;
    }

    for (const field of ["diphthong", "sound_ru"]) {
      if (!isString(item[field])) {
        addError(filePath, `${location}.${field} must be a non-empty string`);
      }
    }

    if (!Array.isArray(item.examples)) {
      addError(filePath, `${location}.examples must be an array`);
      return;
    }

    item.examples.forEach((example, exampleIndex) => {
      const exampleLocation = `${location}.examples[${exampleIndex}]`;
      if (!isRecord(example)) {
        addError(filePath, `${exampleLocation} must be an object`);
        return;
      }

      for (const field of ["word", "ru"]) {
        if (!isString(example[field])) {
          addError(filePath, `${exampleLocation}.${field} must be a non-empty string`);
        }
      }
    });
  });
}

function validatePracticeIndexItem(indexPath, item, index, allowGroups) {
  const location = `items[${index}]`;

  if (!isRecord(item)) {
    addError(indexPath, `${location} must be an object`);
    return null;
  }

  for (const field of ["id", "title", "subtitle"]) {
    if (!isString(item[field])) {
      addError(indexPath, `${location}.${field} must be a non-empty string`);
    }
  }

  const hasFileName = isString(item.fileName);
  const hasIndexFileName = isString(item.indexFileName);

  if (hasFileName === hasIndexFileName) {
    addError(indexPath, `${location} must define exactly one of fileName or indexFileName`);
    return null;
  }

  if (hasIndexFileName && !allowGroups) {
    addError(indexPath, `${location}.indexFileName is not supported in this section`);
    return null;
  }

  const referenceField = hasFileName ? "fileName" : "indexFileName";
  const reference = item[referenceField];
  if (typeof reference === "string" && !reference.endsWith(".json")) {
    addError(indexPath, `${location}.${referenceField} must reference a JSON file`);
  }

  return typeof reference === "string"
    ? { kind: hasFileName ? "topic" : "group", reference }
    : null;
}

async function validatePracticeIndex(indexPath, expectedType, allowGroups, visitedIndexes) {
  const resolvedIndexPath = path.resolve(indexPath);
  if (visitedIndexes.has(resolvedIndexPath)) {
    addError(indexPath, "index must not reference itself recursively");
    return;
  }
  visitedIndexes.add(resolvedIndexPath);

  const index = await readJson(indexPath);
  if (!Array.isArray(index)) {
    addError(indexPath, "index must be an array of topic metadata objects");
    return;
  }

  const ids = new Set();
  const references = [];

  index.forEach((item, indexPosition) => {
    const reference = validatePracticeIndexItem(indexPath, item, indexPosition, allowGroups);

    if (isRecord(item) && typeof item.id === "string") {
      if (ids.has(item.id)) {
        addError(indexPath, `duplicate topic id "${item.id}"`);
      }
      ids.add(item.id);
    }

    if (reference) {
      references.push(reference);
    }
  });

  const duplicateReferences = references.filter(
    (entry, indexPosition) =>
      references.findIndex(
        (candidate) => candidate.kind === entry.kind && candidate.reference === entry.reference
      ) !== indexPosition
  );
  for (const entry of duplicateReferences) {
    addError(indexPath, `duplicate file name "${entry.reference}"`);
  }

  const indexDir = path.dirname(indexPath);
  for (const entry of references) {
    const referencedPath = path.resolve(indexDir, entry.reference);
    if (!existsSync(referencedPath)) {
      addError(indexPath, `referenced file "${entry.reference}" does not exist`);
      continue;
    }

    if (entry.kind === "group") {
      await validatePracticeIndex(referencedPath, expectedType, allowGroups, visitedIndexes);
    } else {
      validateExerciseCollection(referencedPath, await readJson(referencedPath), expectedType);
    }
  }
}

async function validateIndexedPracticeContent(sectionDir, expectedType, allowGroups = false) {
  const indexPath = path.join(contentDir, "practice", sectionDir, "index.json");
  await validatePracticeIndex(indexPath, expectedType, allowGroups, new Set());
}

async function validateSingleChoiceContent() {
  await validateIndexedPracticeContent("single_choice", "single-choice", true);
}

async function validateListeningContent() {
  await validateIndexedPracticeContent("listening", "listening");
}

async function validateInputContent() {
  const dir = path.join(contentDir, "practice", "input");
  const fileNames = (await readdir(dir)).filter((fileName) => fileName.endsWith(".json"));

  for (const fileName of fileNames) {
    const filePath = path.join(dir, fileName);
    validateExerciseCollection(filePath, await readJson(filePath), "input");
  }
}

async function validateNounsAdjectivesSourceContent() {
  const sourceDir = path.join(rootDir, "content-source", "nouns-adjectives");
  const corpusErrors = await validateNounsAdjectivesCorpus(sourceDir);

  for (const error of corpusErrors) {
    addError(error.filePath, error.message);
  }
}

async function validateNounsAdjectivesGeneratedContent() {
  const coverageErrors = await validateNounsAdjectivesCoverage();

  for (const error of coverageErrors) {
    addError(error.filePath, error.message);
  }
}

async function validateTheoryContent() {
  validateAlphabetContent(
    path.join(contentDir, "theory", "alphabet.json"),
    await readJson(path.join(contentDir, "theory", "alphabet.json"))
  );
  validateDiphthongsContent(
    path.join(contentDir, "theory", "diphthongs.json"),
    await readJson(path.join(contentDir, "theory", "diphthongs.json"))
  );
}

await validateTheoryContent();
await validateNounsAdjectivesSourceContent();
await validateNounsAdjectivesGeneratedContent();
await validateSingleChoiceContent();
await validateListeningContent();
await validateInputContent();

if (errors.length > 0) {
  console.error(`Content validation failed with ${errors.length} error(s):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Content validation passed.");

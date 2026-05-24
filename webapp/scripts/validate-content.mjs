import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

  validateOptionalString(filePath, item.promptLanguage, `${location}.promptLanguage`);
  validateOptionalString(filePath, item.translation, `${location}.translation`);
  validateOptionalString(filePath, item.explanation, `${location}.explanation`);

  if (!isString(item.correctAnswer)) {
    addError(filePath, `${location}.correctAnswer must be a non-empty string`);
  }

  if (!Array.isArray(item.wrongAnswers) || item.wrongAnswers.length !== 3) {
    addError(filePath, `${location}.wrongAnswers must contain exactly 3 items`);
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

  validateOptionalString(filePath, item.promptLanguage, `${location}.promptLanguage`);
  validateOptionalString(filePath, item.translation, `${location}.translation`);
  validateOptionalString(filePath, item.explanation, `${location}.explanation`);
  validateOptionalString(filePath, item.context, `${location}.context`);

  if (!isString(item.correctAnswer)) {
    addError(filePath, `${location}.correctAnswer must be a non-empty string`);
  }
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

async function validateSingleChoiceContent() {
  const dir = path.join(contentDir, "practice", "single_choice");
  const indexPath = path.join(dir, "index.json");
  const index = await readJson(indexPath);

  if (!Array.isArray(index) || !index.every((item) => typeof item === "string")) {
    addError(indexPath, "index must be an array of file names");
    return;
  }

  const duplicateFiles = index.filter((fileName, indexPosition) => index.indexOf(fileName) !== indexPosition);
  for (const fileName of duplicateFiles) {
    addError(indexPath, `duplicate file name "${fileName}"`);
  }

  for (const fileName of index) {
    const filePath = path.join(dir, fileName);
    if (!existsSync(filePath)) {
      addError(indexPath, `referenced file "${fileName}" does not exist`);
      continue;
    }

    validateExerciseCollection(filePath, await readJson(filePath), "single-choice");
  }
}

async function validateInputContent() {
  const dir = path.join(contentDir, "practice", "input");
  const fileNames = (await readdir(dir)).filter((fileName) => fileName.endsWith(".json"));

  for (const fileName of fileNames) {
    const filePath = path.join(dir, fileName);
    validateExerciseCollection(filePath, await readJson(filePath), "input");
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
await validateSingleChoiceContent();
await validateInputContent();

if (errors.length > 0) {
  console.error(`Content validation failed with ${errors.length} error(s):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Content validation passed.");

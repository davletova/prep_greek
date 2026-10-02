import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { dirname, resolve, relative, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { format } from "prettier";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const defaultSourceDir = resolve(root, "content-source/nouns-adjectives");
const defaultOutputDir = resolve(root, "public/content/practice/single_choice");
const articles = new Set(["ο", "η", "το", "οι", "τα"]);
const relativePronouns = new Set(["οποίος", "οποία", "οποίο", "οποίοι", "οποίες"]);
const indefiniteRelatives = new Set(["όποιος", "όποια", "όποιο", "όποιοι", "όποιες"]);
const possessives = new Set(["δικός", "δική", "δικό", "δικοί", "δικές", "δικά"]);
const readJson = async (file) => JSON.parse(await readFile(file, "utf8"));

// This is a parser for the reviewed constructions in this corpus, not a
// general-purpose Greek lemmatizer. Compound nouns keep their full lexical
// expression (e.g. κινητό τηλέφωνο), rather than just the final word.
export function getNounAdjectiveComponents(answer) {
  let words = answer.split(" ");
  if (words.length < 2 || words.some((word) => !word))
    throw new Error(`Unsupported phrase: ${answer}`);
  if (
    words.length === 5 &&
    articles.has(words[0]) &&
    articles.has(words[2]) &&
    relativePronouns.has(words[3])
  ) {
    return { adjective: words[3], noun: words[1] };
  }
  if (indefiniteRelatives.has(words[0]) && words.length === 3) {
    return { adjective: words[0], noun: words[1] };
  }
  if (["καθένας", "καθεμία"].includes(words[0]) && words[1] === "από" && words.length === 4) {
    return { adjective: words[0], noun: words[3] };
  }
  if (articles.has(words[0])) words = words.slice(1);
  // A few existing items are bare nouns (το μετρό / τα ισλανδικά).
  if (words.length === 1) return { adjective: null, noun: words[0] };
  if (articles.has(words[1])) words = [words[0], ...words.slice(2)];
  if (possessives.has(words[0]) && words[1] === "μου" && words.length >= 3) {
    return { adjective: words.slice(0, 2).join(" "), noun: words.slice(2).join(" ") };
  }
  return { adjective: words[0], noun: words.slice(1).join(" ") };
}

export function getNounAdjectiveLevel(answer, levels) {
  const { adjective, noun } = getNounAdjectiveComponents(answer);
  const nounLevel = levels.nouns[noun];
  const adjectiveLevel = adjective === null ? "A1" : levels.adjectives[adjective];
  if (!["A1", "A2"].includes(nounLevel) || !["A1", "A2"].includes(adjectiveLevel))
    throw new Error(`Unclassified phrase: ${answer} (adjective: ${adjective}, noun: ${noun})`);
  return nounLevel === "A1" && adjectiveLevel === "A1" ? "A1" : "A2";
}

function childPath(directory, file) {
  if (typeof file !== "string" || isAbsolute(file))
    throw new Error(`Invalid content path: ${file}`);
  const result = resolve(directory, file);
  if (relative(directory, result).startsWith(".."))
    throw new Error(`Invalid content path: ${file}`);
  return result;
}

export async function buildNounsAdjectivesLevels(sourceDir = defaultSourceDir) {
  const levels = await readJson(resolve(sourceDir, "practice-levels.json"));
  const used = { nouns: new Set(), adjectives: new Set() };
  const files = { A1: new Map(), A2: new Map() };
  const totals = { A1: 0, A2: 0 };
  const itemIds = new Set();
  const topicIds = new Set();
  const visited = new Set();
  const sourceRoot = resolve(sourceDir, "practice");

  async function visit(indexFile) {
    if (visited.has(indexFile)) throw new Error(`Repeated index: ${indexFile}`);
    visited.add(indexFile);
    const index = await readJson(indexFile);
    const indexes = { A1: [], A2: [] };
    for (const entry of index) {
      if (topicIds.has(entry.id)) throw new Error(`Duplicate topic ID: ${entry.id}`);
      topicIds.add(entry.id);
      let collections;
      let children;
      let file;
      if (entry.indexFileName && !entry.fileName) {
        children = await visit(childPath(dirname(indexFile), entry.indexFileName));
      } else if (entry.fileName && !entry.indexFileName) {
        file = childPath(dirname(indexFile), entry.fileName);
        const collection = await readJson(file);
        const byLevel = { A1: [], A2: [] };
        for (const item of collection.items) {
          if (itemIds.has(item.id)) throw new Error(`Duplicate exercise: ${item.id}`);
          itemIds.add(item.id);
          const { adjective, noun } = getNounAdjectiveComponents(item.correctAnswer);
          used.nouns.add(noun);
          if (adjective !== null) used.adjectives.add(adjective);
          const level = getNounAdjectiveLevel(item.correctAnswer, levels);
          byLevel[level].push(item);
          totals[level]++;
        }
        collections = Object.fromEntries(
          ["A1", "A2"].map((level) => [level, { ...collection, items: byLevel[level] }])
        );
      } else {
        throw new Error(`Invalid index entry: ${entry.id}`);
      }
      for (const level of ["A1", "A2"]) {
        if (children ? !children[level].length : !collections[level].items.length) continue;
        indexes[level].push({
          ...entry,
          id: entry.id.replace(/^nouns-adjectives-/u, `nouns-adjectives-${level.toLowerCase()}-`),
        });
        if (collections) files[level].set(relative(sourceRoot, file), collections[level]);
      }
    }
    for (const level of ["A1", "A2"]) {
      if (indexes[level].length) files[level].set(relative(sourceRoot, indexFile), indexes[level]);
    }
    return indexes;
  }
  await visit(resolve(sourceRoot, "index.json"));
  for (const kind of ["nouns", "adjectives"]) {
    for (const [form, level] of Object.entries(levels[kind])) {
      if (!used[kind].has(form) || !["A1", "A2"].includes(level))
        throw new Error(`Unused or invalid classification: ${kind}.${form}`);
    }
  }
  return { files, totals };
}

async function jsonFiles(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = resolve(directory, entry.name);
    if (entry.isDirectory()) result.push(...(await jsonFiles(file)));
    else if (entry.name.endsWith(".json")) result.push(file);
  }
  return result;
}

export async function splitNounsAdjectivesLevels({
  sourceDir = defaultSourceDir,
  outputDir = defaultOutputDir,
} = {}) {
  // Build and validate the full partition before changing public files.
  const generated = await buildNounsAdjectivesLevels(sourceDir);
  for (const level of ["A1", "A2"]) {
    const directory = resolve(outputDir, `adjectives-nouns-${level.toLowerCase()}`);
    await mkdir(directory, { recursive: true });
    const expectedFiles = new Set();
    for (const [file, content] of generated.files[level]) {
      const destination = childPath(directory, file);
      expectedFiles.add(destination);
      await mkdir(dirname(destination), { recursive: true });
      await writeFile(destination, await format(JSON.stringify(content), { parser: "json" }));
    }
    for (const file of await jsonFiles(directory)) {
      if (!expectedFiles.has(file)) await unlink(file);
    }
  }
  return generated.totals;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(await splitNounsAdjectivesLevels());
}

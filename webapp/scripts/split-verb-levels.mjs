import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "content-source/verbs");
const destination = resolve(root, "public/content/practice/single_choice");
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const writeJson = async (path, value) => writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
const persons = [
  "1-е лицо, ед. число",
  "2-е лицо, ед. число",
  "3-е лицо, ед. число",
  "1-е лицо, мн. число",
  "2-е лицо, мн. число",
  "3-е лицо, мн. число",
];

export async function splitVerbLevels() {
  const levels = await readJson(resolve(source, "levels.json"));
  const master = (await readFile(resolve(source, "a1-a2-verbs.tmp.txt"), "utf8"))
    .trim()
    .split(/\r?\n/u);
  const forms = new Map();
  const lemmas = new Set();
  for (let index = 0; index < master.length; ) {
    const lemma = master[index];
    if (!["A1", "A2"].includes(levels[lemma])) throw new Error(`Missing level: ${lemma}`);
    lemmas.add(lemma);
    const count = ["πρέπει", "χιονίζει"].includes(lemma) ? 1 : 6;
    master.slice(index, index + count).forEach((form, person) => {
      const key = `${person}|${form}`;
      if (forms.has(key)) throw new Error(`Ambiguous form: ${key}`);
      forms.set(key, lemma);
    });
    index += count;
  }
  if (Object.keys(levels).some((lemma) => !lemmas.has(lemma)))
    throw new Error("Unknown lemma in levels.json");

  const topics = await readJson(resolve(source, "practice/index.json"));
  const indexes = { A1: [], A2: [] };
  const totals = { A1: 0, A2: 0 };
  const output = [];
  const ids = new Set();
  for (const topic of topics) {
    const collection = await readJson(resolve(source, "practice", topic.fileName));
    const rows = (
      await readFile(resolve(source, topic.fileName.replace(".json", ".tmp.txt")), "utf8")
    )
      .trim()
      .split(/\r?\n/u);
    if (rows.length !== collection.items.length) throw new Error(`Count mismatch: ${topic.id}`);
    const itemsByLevel = { A1: [], A2: [] };
    collection.items.forEach((item, index) => {
      const [form, label] = rows[index].split(" — ");
      const person = label === "безличная форма" ? 0 : persons.indexOf(label);
      const lemma = forms.get(`${person}|${form}`);
      if (!lemma || !item.correctAnswer.split(" ").includes(form))
        throw new Error(`Source does not match correctAnswer: ${item.id}`);
      if (ids.has(item.id)) throw new Error(`Duplicate exercise: ${item.id}`);
      ids.add(item.id);
      itemsByLevel[levels[lemma]].push(item);
    });
    for (const level of ["A1", "A2"]) {
      const items = itemsByLevel[level];
      if (!items.length) continue;
      indexes[level].push({
        ...topic,
        id: topic.id.replace("verbs-", `verbs-${level.toLowerCase()}-`),
      });
      output.push({ level, file: topic.fileName, content: { ...collection, items } });
      totals[level] += items.length;
    }
  }
  // Validate the entire input before writing any public content.
  for (const level of ["A1", "A2"]) {
    const directory = resolve(destination, `verbs-${level.toLowerCase()}`);
    await mkdir(directory, { recursive: true });
    for (const { file, content } of output.filter((entry) => entry.level === level))
      await writeJson(resolve(directory, file), content);
    const activeFiles = new Set(indexes[level].map((topic) => topic.fileName));
    const sourceFiles = new Set(topics.map((topic) => topic.fileName));
    for (const file of await readdir(directory)) {
      if (sourceFiles.has(file) && !activeFiles.has(file)) await unlink(resolve(directory, file));
    }
    await writeJson(resolve(directory, "index.json"), indexes[level]);
  }
  return totals;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(await splitVerbLevels());
}

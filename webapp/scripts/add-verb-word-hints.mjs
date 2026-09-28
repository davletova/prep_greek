import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const webappRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const themes = ["changes-actions-with-objects", "movement-travel", "home-daily-life"];
const contentDir = resolve(webappRoot, "public/content/practice/single_choice/verbs");
const sourceDir = resolve(webappRoot, "content-source/verbs");

const glossary = new Map();
for (const line of (await readFile(resolve(sourceDir, "word-glosses.tmp.txt"), "utf8"))
  .trim()
  .split(/\r?\n/u)) {
  const separator = line.indexOf("|");
  if (separator < 1 || glossary.has(line.slice(0, separator))) {
    throw new Error(`Invalid or duplicate word gloss: ${line}`);
  }
  glossary.set(line.slice(0, separator), line.slice(separator + 1));
}

const master = (await readFile(resolve(sourceDir, "a1-a2-verbs.tmp.txt"), "utf8"))
  .trim()
  .split(/\r?\n/u);
const forms = new Map();
for (let i = 0; i < master.length; ) {
  const lemma = master[i];
  const length = lemma === "πρέπει" || lemma === "χιονίζει" ? 1 : 6;
  if (length === 6) forms.set(lemma, master.slice(i, i + length));
  i += length;
}

// The Russian prompt supplies the translation of each *specific* verb form in
// context (e.g. βγάζω can mean «выношу», «снимаю» or «достаю»).
const finiteVerb =
  /(?:юсь|усь|аешься|яешься|ёшься|ешься|ишься|ается|яется|ётся|ется|ится|аемся|яемся|ёмся|емся|имся|аетесь|яетесь|ётесь|етесь|итесь|аются|яются|ются|утся|ятся|атся|ишь|ешь|ёшь|ает|яет|ёт|ет|ит|аем|яем|ём|ем|им|аете|яете|ёте|ете|ите|ают|яют|ют|ут|ат|ят|ую|аю|яю|ю|у)$/iu;
const absence = [
  "отсутствую",
  "отсутствуешь",
  "отсутствует",
  "отсутствуем",
  "отсутствуете",
  "отсутствуют",
];

function translatedVerb(prompt, lemma, person) {
  if (lemma === "λείπω") return absence[person];
  const words = prompt.split(/\s+/u);
  let translation = words
    .slice(1)
    .find((word) => finiteVerb.test(word) && word.toLowerCase() !== "полностью");
  if (!translation) throw new Error(`Missing translated verb in Russian prompt: ${prompt}`);
  if (lemma.startsWith("ξανα")) translation = `снова ${translation}`;
  if (lemma === "οδηγώ") translation += " за рулём";
  if (lemma === "περπατάω") translation += " пешком";
  if (lemma === "ψωνίζω") translation += " покупки";
  if (lemma === "σφουγγαρίζω") translation += " шваброй";
  if (lemma === "παντρεύομαι" && words.includes("замуж")) translation += " замуж";
  if (lemma === "τρακάρω" && words.includes("аварию")) translation += " в аварию";
  if (lemma === "κοιμάμαι" && translation.includes("ложишься")) translation += " спать";
  if (lemma === "κρατάω" && words.includes("записи")) translation += " записи";
  return translation.toLowerCase();
}

function translatedWord(word, words, position) {
  // These written forms are either articles or possessive pronouns depending
  // on position; make the distinction explicit rather than giving both labels.
  if (word === "της" && ["σύντροφό", "γονείς"].includes(words[position - 1])) {
    return "«её» (притяжательное местоимение)";
  }
  if (word === "τους" && words[position - 1] === "μητέρα") {
    return "«их» (притяжательное местоимение)";
  }
  if (word === "μία") return "«один» (числительное женского рода)";
  if (word === "από" && words[position - 1] === "πριν") {
    return "часть сочетания **πριν από** — «перед, до»";
  }
  if (word === "από" && words[position - 1] === "μετά") {
    return "часть сочетания **μετά από** — «через, после»";
  }
  const compoundFrom = {
    πίσω: "за, позади",
    μπροστά: "перед",
    απέναντι: "напротив",
    κάτω: "под",
    πάνω: "над",
    γύρω: "вокруг",
    έξω: "вне, за пределами",
    μέσα: "через",
  };
  if (word === "από" && compoundFrom[words[position - 1]]) {
    return `часть сочетания **${words[position - 1]} από** — «${compoundFrom[words[position - 1]]}»`;
  }
  if (word === "σε" && words[position - 1] === "ανάμεσα") {
    return "часть сочетания **ανάμεσα σε** — «между»";
  }
  if (word === "για" && words[position + 1] === "δύο") {
    return "«на» (период времени, **για δύο εβδομάδες** — «на две недели»)";
  }
  const meaning = glossary.get(word);
  if (!meaning) throw new Error(`Missing gloss for ${word}`);
  if (meaning.includes("артикль")) return meaning;
  return `«${meaning}»`;
}

const collections = [];
const attested = new Map();
for (const theme of themes) {
  const collection = JSON.parse(await readFile(resolve(contentDir, `${theme}.json`), "utf8"));
  const lines = (await readFile(resolve(sourceDir, `${theme}.tmp.txt`), "utf8"))
    .trim()
    .split(/\r?\n/u);
  if (lines.length !== collection.items.length) throw new Error(`Count mismatch: ${theme}`);
  for (const [i, item] of collection.items.entries()) {
    const [form, label] = lines[i].split(" — ");
    const person = [
      "1-е лицо, ед. число",
      "2-е лицо, ед. число",
      "3-е лицо, ед. число",
      "1-е лицо, мн. число",
      "2-е лицо, мн. число",
      "3-е лицо, мн. число",
    ].indexOf(label);
    const matchingLemmas = [...forms].filter(([, paradigm]) => paradigm[person] === form);
    if (person < 0 || matchingLemmas.length !== 1) throw new Error(`Source mismatch: ${item.id}`);
    const lemma = matchingLemmas[0][0];
    const words = item.correctAnswer.split(" ");
    const index = words.indexOf(form);
    if (index < 1 || index > 2) throw new Error(`Verb position: ${item.id}`);
    const predicate = words.slice(index).join(" ");
    if (attested.has(predicate)) throw new Error(`Repeated predicate: ${predicate}`);
    attested.set(predicate, { form, translation: translatedVerb(item.prompt, lemma, person) });
    const linesInHint = item.hint.split("\n").filter((line) => line.startsWith("- "));
    if (linesInHint.length === 3) item._grammar = linesInHint[2];
    else if (item.hint.includes("**Грамматика:**"))
      item._grammar = item.hint.split("**Грамматика:**\n")[1]?.split("\n\n")[0];
    else throw new Error(`Missing grammar explanation: ${item.id}`);
    if (!item._grammar) throw new Error(`Missing original hint: ${item.id}`);
    collections.push({ theme, item, form, words, index });
  }
}

for (const { item, form, words, index } of collections) {
  const subject = words.slice(0, index);
  const wordGlosses = words.map((word, position) => {
    const translation =
      position === index
        ? `«${attested.get(words.slice(index).join(" ")).translation}»`
        : translatedWord(word, words, position);
    return `- **${word}** — ${translation}.`;
  });
  const otherVerbs = item.wrongAnswers.map((answer) => {
    const tokens = answer.split(" ");
    if (tokens.slice(0, index).join(" ") !== subject.join(" ")) {
      throw new Error(`Different subject: ${item.id}`);
    }
    const other = attested.get(tokens.slice(index).join(" "));
    if (!other || other.form === form) throw new Error(`Unattested wrong verb: ${item.id}`);
    return `- **${other.form}** — «${other.translation}».`;
  });
  item.hint = [
    `**${item.correctAnswer}** — «${item.prompt}».`,
    `**Перевод каждого слова:**\n${wordGlosses.join("\n")}`,
    `**Глаголы в неверных ответах:**\n${otherVerbs.join("\n")}`,
    `**Грамматика:**\n${item._grammar}`,
  ].join("\n\n");
  delete item._grammar;
}

for (const theme of themes) {
  const collection = JSON.parse(await readFile(resolve(contentDir, `${theme}.json`), "utf8"));
  const updated = collections.filter((row) => row.theme === theme).map((row) => row.item);
  if (collection.items.length !== updated.length) throw new Error(`Mismatch: ${theme}`);
  collection.items = updated;
  await writeFile(resolve(contentDir, `${theme}.json`), `${JSON.stringify(collection, null, 2)}\n`);
  console.log(`${theme}: ${updated.length} annotated`);
}

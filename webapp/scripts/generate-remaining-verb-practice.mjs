import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = resolve(root, "content-source/verbs");
const contentDir = resolve(root, "public/content/practice/single_choice/verbs");
const themes = [
  "food-shopping",
  "communication-information",
  "study-work",
  "thinking-decisions",
  "feelings-relationships",
  "health-rest-activity",
  "nature-environment",
  "misc",
];
const labels = [
  "1-е лицо, ед. число",
  "2-е лицо, ед. число",
  "3-е лицо, ед. число",
  "1-е лицо, мн. число",
  "2-е лицо, мн. число",
  "3-е лицо, мн. число",
];
const subjects = ["Εγώ", "Εσύ", "Η Μαρία", "Εμείς", "Εσείς", "Οι άνθρωποι"];
const russianSubjects = ["Я", "Ты", "Мария", "Мы", "Вы", "Люди"];
const possessives = ["μου", "σου", "της", "μας", "σας", "τους"];
const sameMeaning = [
  ["παραγγέλλω", "παραγγέλνω"],
  ["σπουδάζω", "φοιτώ"],
  ["διαλέγω", "επιλέγω"],
  ["γνωρίζω", "ξέρω"],
  ["νιώθω", "αισθάνομαι"],
  ["καλώ", "προσκαλώ"],
  ["συμπαθώ", "αγαπάω"],
];

const master = (await readFile(resolve(sourceDir, "a1-a2-verbs.tmp.txt"), "utf8"))
  .trim()
  .split(/\r?\n/u);
const paradigms = new Map();
const lookup = new Map();
for (let i = 0; i < master.length; ) {
  const lemma = master[i];
  const count = ["πρέπει", "χιονίζει"].includes(lemma) ? 1 : 6;
  const paradigm = master.slice(i, i + count);
  paradigms.set(lemma, paradigm);
  for (const [person, form] of paradigm.entries()) {
    const key = `${person}|${form}`;
    if (lookup.has(key)) throw new Error(`Ambiguous source form ${key}`);
    lookup.set(key, lemma);
  }
  i += count;
}

const glossary = new Map();
for (const row of (await readFile(resolve(sourceDir, "word-glosses.tmp.txt"), "utf8"))
  .trim()
  .split(/\r?\n/u)) {
  const separator = row.indexOf("|");
  glossary.set(row.slice(0, separator), row.slice(separator + 1));
}
for (const row of (
  await readFile(resolve(sourceDir, "remaining-practice/word-glosses.tmp.txt"), "utf8")
)
  .trim()
  .split(/\r?\n/u)) {
  const separator = row.indexOf("|");
  const word = row.slice(0, separator);
  if (glossary.has(word)) throw new Error(`Duplicate gloss for ${word}`);
  glossary.set(word, row.slice(separator + 1));
}

const templates = new Map();
const rowsByTheme = new Map();
for (const theme of themes) {
  const templateLines = (
    await readFile(resolve(sourceDir, `remaining-practice/${theme}.tmp.txt`), "utf8")
  )
    .trim()
    .split(/\r?\n/u);
  const local = new Map();
  for (const line of templateLines) {
    const [lemma, tail, forms, russianTail] = line.split("|");
    const ru = forms?.split(",");
    if (
      !paradigms.has(lemma) ||
      !tail ||
      !russianTail ||
      ru?.length !== (lemma === "χιονίζει" ? 1 : 6) ||
      local.has(lemma)
    ) {
      throw new Error(`Invalid ${theme} template: ${line}`);
    }
    local.set(lemma, { lemma, tail, ru, russianTail });
    templates.set(lemma, { lemma, tail, ru, russianTail });
  }
  const source = (await readFile(resolve(sourceDir, `${theme}.tmp.txt`), "utf8"))
    .trim()
    .split(/\r?\n/u);
  const entries = source.map((line, index) => {
    const [form, label] = line.split(" — ");
    const person = label === "безличная форма" ? -1 : labels.indexOf(label);
    const lemma = lookup.get(`${person < 0 ? 0 : person}|${form}`);
    if (!lemma || (person < 0 && !["πρέπει", "χιονίζει"].includes(lemma)))
      throw new Error(`Unknown form: ${line}`);
    const template = local.get(lemma);
    if (!template) throw new Error(`Missing ${theme} template for ${lemma}`);
    return { index, form, person, lemma, template };
  });
  for (const lemma of local.keys())
    if (!entries.some((entry) => entry.lemma === lemma))
      throw new Error(`Unused ${theme} template for ${lemma}`);
  rowsByTheme.set(theme, entries);
}

function personData(row) {
  const { lemma, form, template } = row;
  const person = row.person < 0 ? (lemma === "πρέπει" ? 3 : 2) : row.person;
  if (lemma === "χιονίζει") {
    return {
      subject: "Σήμερα",
      russianSubject: "Сегодня",
      greek: "Σήμερα χιονίζει στο βουνό",
      prompt: "Сегодня в горах идёт снег",
      prefix: "",
      tail: "στο βουνό",
    };
  }
  const subject = lemma === "γεννάω" && person === 5 ? "Οι γυναίκες" : subjects[person];
  const russianSubject = lemma === "γεννάω" && person === 5 ? "Женщины" : russianSubjects[person];
  let tail = template.tail.replaceAll(/(?<!\p{L})μου(?!\p{L})/gu, possessives[person]);
  if (lemma === "γίνομαι" && person >= 3) tail = tail.replace("μέλος", "μέλη");
  if (lemma === "γεννάω" && person >= 3) tail = tail.replace("ένα μωρό", "μωρά");
  // The fixed expression is τα καταφέρνω: its pronoun precedes the target verb.
  let prefix = "";
  if (lemma === "καταφέρνω") {
    if (tail !== "τα~στην εξέταση") throw new Error("Unexpected καταφέρνω template");
    prefix = "τα ";
    tail = "στην εξέταση";
  }
  tail = tail.replaceAll(/\{([^}]+)\}/gu, (_, otherLemma) => {
    const other = paradigms.get(otherLemma)?.[person];
    if (!other) throw new Error(`Missing embedded verb ${otherLemma}`);
    return other;
  });
  const greek = `${subject} ${prefix}${form} ${tail}`;
  const ru = template.ru[person];
  const russianTail =
    lemma === "γίνομαι" && person >= 3
      ? "членами команды"
      : lemma === "γεννάω" && person >= 3
        ? "детей в больнице"
        : template.russianTail;
  const prompt = ru.startsWith("@")
    ? `${ru.slice(1)} ${russianTail}`
    : lemma === "νομίζω"
      ? `${russianSubject} ${ru}, ${russianTail}`
      : `${russianSubject} ${ru} ${russianTail}`;
  return { subject, russianSubject, greek, prompt, prefix, tail };
}

function gloss(word, words, position, row, verbTranslations) {
  if (position === words.indexOf(row.form)) return `«${row.russianVerb}»`;
  const prev = words[position - 1];
  if (word === "τα" && row.lemma === "καταφέρνω" && words[position + 1] === row.form) {
    return "«это» (местоимение в выражении **τα καταφέρνω** — «справляться»)";
  }
  if (
    word === "της" &&
    [
      "φίλη",
      "φίλης",
      "γονείς",
      "σύντροφό",
      "μητέρα",
      "οικογένεια",
      "αδελφό",
      "παππού",
      "πόδι",
      "χέρια",
    ].includes(prev)
  )
    return "«её» (притяжательное местоимение)";
  if (
    word === "τους" &&
    [
      "φίλο",
      "φίλης",
      "φίλοι",
      "μητέρα",
      "γονείς",
      "οικογένεια",
      "αδελφό",
      "παππού",
      "πόδι",
      "χέρια",
      "σύντροφό",
    ].includes(prev)
  )
    return "«их» (притяжательное местоимение)";
  const possessiveGlosses = { μου: "мой", σου: "твой", μας: "наш", σας: "ваш" };
  if (possessiveGlosses[word]) return `«${possessiveGlosses[word]}» (притяжательное местоимение)`;
  if (word === "είναι" && row.form !== "είναι") return "«является» (связка)";
  if (word === "λογαριασμό" && ["ζητάω", "πληρώνω"].includes(row.lemma)) return "«счёт»";
  if (["της", "του", "τους"].includes(word))
    return glossary.get(word).split("; после существительного")[0];
  if (word === "από" && prev === "πριν") return "часть сочетания **πριν από** — «до, перед»";
  if (word === "από" && prev === "μετά") return "часть сочетания **μετά από** — «после, через»";
  if (word === "από" && prev === "πάνω") return "часть сочетания **πάνω από** — «над»";
  if (word === "για" && prev === "αντί") return "часть сочетания **αντί για** — «вместо»";
  const inflected = verbTranslations.get(word);
  if (inflected) return `«${inflected}»`;
  const meaning = glossary.get(word);
  if (!meaning) throw new Error(`Missing word gloss: ${word} in ${row.lemma}`);
  return meaning.includes("артикль") ? meaning : `«${meaning}»`;
}

const verbTranslations = new Map();
for (const { lemma, ru } of templates.values()) {
  if (lemma === "πρέπει") continue;
  for (const [person, form] of paradigms.get(lemma).entries()) {
    if (!verbTranslations.has(form)) verbTranslations.set(form, ru[person]);
  }
}
for (const [person, form] of paradigms.get("περπατάω").entries()) {
  verbTranslations.set(
    form,
    ["иду пешком", "идёшь пешком", "идёт пешком", "идём пешком", "идёте пешком", "идут пешком"][
      person
    ]
  );
}

for (const theme of themes) {
  const rows = rowsByTheme.get(theme);
  const prepared = rows.map((row) => ({
    ...row,
    ...personData(row),
    russianVerb:
      row.lemma === "πρέπει"
        ? "нужно"
        : row.lemma === "αρκώ"
          ? "хватает"
          : row.lemma === "έχω"
            ? ["имею", "имеешь", "имеет", "имеем", "имеете", "имеют"][row.person]
            : row.template.ru[row.person < 0 ? 0 : row.person],
  }));
  const items = prepared.map((row) => {
    const used = new Set([row.lemma]);
    const selectedPersons = new Set(row.person < 0 ? [] : [row.person]);
    const wrong = [];
    // Rotate the candidate pool so drills on the same lemma do not always use
    // the same three distractors. Require three different lemmas and forms.
    const start = (row.index * 13 + 17) % prepared.length;
    for (let offset = 0; offset < prepared.length && wrong.length < 3; offset++) {
      const candidate = prepared[(start + offset * 7) % prepared.length];
      if (
        used.has(candidate.lemma) ||
        candidate.person < 0 ||
        selectedPersons.has(candidate.person)
      )
        continue;
      if (["μπορώ", "προσπαθώ", "νομίζω", "είμαι"].includes(candidate.lemma)) continue;
      if (sameMeaning.some((group) => group.includes(row.lemma) && group.includes(candidate.lemma)))
        continue;
      if (row.template.ru[0] === candidate.template.ru[0]) continue;
      if (
        candidate.template.ru[candidate.person] ===
        row.template.ru[row.person < 0 ? (row.lemma === "πρέπει" ? 3 : 0) : row.person]
      )
        continue;
      const answer = `${row.subject} ${candidate.prefix}${candidate.form} ${candidate.tail}`;
      if (answer === row.greek || wrong.some((entry) => entry.answer === answer)) continue;
      wrong.push({ answer, candidate });
      used.add(candidate.lemma);
      selectedPersons.add(candidate.person);
    }
    if (wrong.length !== 3)
      throw new Error(`Not enough distractors for ${theme} row ${row.index + 1}`);
    const words = row.greek.split(" ");
    const wordLines = words.map(
      (word, position) => `- **${word}** — ${gloss(word, words, position, row, verbTranslations)}.`
    );
    const verbs = wrong.map(
      ({ candidate }) => `- **${candidate.form}** — «${candidate.russianVerb}».`
    );
    return {
      id: `verbs-${theme}-${String(row.index + 1).padStart(3, "0")}`,
      type: "single-choice",
      prompt: row.prompt,
      speechTarget: "correctAnswer",
      hint: [
        `**${row.greek}** — «${row.prompt}».`,
        `**Перевод каждого слова:**\n${wordLines.join("\n")}`,
        `**Глаголы в неверных ответах:**\n${verbs.join("\n")}`,
      ].join("\n\n"),
      correctAnswer: row.greek,
      wrongAnswers: wrong.map(({ answer }) => answer),
    };
  });
  const title = await readFile(resolve(contentDir, "index.json"), "utf8");
  const entry = JSON.parse(title).find((section) => section.id === `verbs-${theme}`);
  if (!entry) throw new Error(`Missing topic index for ${theme}`);
  await writeFile(
    resolve(contentDir, `${theme}.json`),
    `${JSON.stringify({ title: entry.title, subtitle: "Выберите правильную форму глагола", items }, null, 2)}\n`
  );
  console.log(`${theme}: ${items.length} exercises`);
}

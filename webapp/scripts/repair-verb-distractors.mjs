import { readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = resolve(root, "content-source/verbs");
const contentDir = resolve(sourceDir, "practice");
const labels = [
  "1-е лицо, ед. число",
  "2-е лицо, ед. число",
  "3-е лицо, ед. число",
  "1-е лицо, мн. число",
  "2-е лицо, мн. число",
  "3-е лицо, мн. число",
];

// Related actions, not interchangeable translations. A pair supplies a
// same-person distractor and a second distractor in another person. For
// expressions without a suitable replacement, use wrong-person forms only.
const pairs = `
αγαπάω φοβάμαι
αγοράζω πουλάω
αδειάζω γεμίζω
αδυνατίζω αρρωσταίνω
αισθάνομαι φαίνομαι
ακολουθώ περιμένω
ακούω τραγουδάω
αλλάζω κρατάω
ανάβω σβήνω
αναγνωρίζω ξεχνάω
ανακατεύω προσθέτω
αναπνέω βήχω
αναφέρω κρύβω
ανεβαίνω κατεβαίνω
ανοίγω κλείνω
αντικαθιστώ διαγράφω
αντιστοιχίζω συγκρίνω
απαντάω διαφωνώ
απευθύνομαι τηλεφωνώ
απλώνω μαζεύω
αποκτώ χάνω
αποφασίζω συζητάω
αποφεύγω προσέχω
αργώ σταματάω
αρέσω μοιάζω
αρνούμαι προσφέρω
αρχίζω τελειώνω
αστράφτω φαίνομαι
αφήνω παίρνω
βάζω βγάζω
βάφω πλένω
βγαίνω μπαίνω
βεβαιώνω ρωτάω
βλέπω ζωγραφίζω
βοηθάω συναντάω
βράζω πίνω
βρέχομαι κρυώνω
βρέχω καίω
βρίσκομαι ταξιδεύω
βρίσκω ψάχνω
γελάω μαλώνω
γεννάω φροντίζω
γιορτάζω θυμάμαι
γνωρίζω χαιρετάω
γράφω διαβάζω
γυρίζω φεύγω
δείχνω περιγράφω
δηλητηριάζω καθαρίζω
δηλώνω ξεχνάω
δημιουργώ χρησιμοποιώ
διακρίνω σημειώνω
διαλέγω φοράω
διασκεδάζω χορεύω
διαφημίζω νοικιάζω
διδάσκω μαθαίνω
δίνω στέλνω
διορθώνω μετράω
διψάω πεινάω
δοκιμάζω σερβίρω
δουλεύω ξεκουράζομαι
είμαι λείπω
ελπίζω διαφωνώ
ενδιαφέρομαι λυπάμαι
ενημερώνω συμβουλεύω
ενθουσιάζω κουράζω
ενώνω κόβω
εξηγώ περιγράφω
εξυπηρετώ χαιρετάω
επαναλαμβάνω διαγράφω
επιθυμώ αρνούμαι
επικοινωνώ μαλώνω
επιλέγω διαγράφω
επισκέπτομαι περιγράφω
επιστρέφω φεύγω
επιτρέπω αρνούμαι
έρχομαι φεύγω
ετοιμάζομαι ξεκουράζομαι
ετοιμάζω σερβίρω
ευχαριστώ ρωτάω
έχω χάνω
ζητάω πληρώνω
ζω δουλεύω
ζωγραφίζω περιγράφω
θέλω φοβάμαι
θυμίζω εξηγώ
κάθομαι κοιμάμαι
καλύπτω καθαρίζω
καλώ συναντάω
καλωσορίζω περιμένω
κάνω συνεχίζω
καταλαβαίνω μαντεύω
κερδίζω ξοδεύω
κλειδώνω ανοίγω
κοιτάζω δείχνω
κολλάω κόβω
κολυμπάω ψαρεύω
κρατάω αφήνω
κρίνω περιγράφω
κυκλώνω υπογραμμίζω
λειτουργώ σταματάω
λέω κρύβω
λήγω αρχίζω
λιώνω ανακατεύω
λύνω μελετάω
μαγειρεύω τρώω
μεγαλώνω φροντίζω
μελετάω μεταφράζω
μένω μετακομίζω
μεταφέρω αφήνω
μεταφράζω γράφω
μιλάω τραγουδάω
μοιράζω μαζεύω
μπερδεύω διακρίνω
μπορώ προσπαθώ
μυρίζω δοκιμάζω
νευριάζω γελάω
νιώθω φαίνομαι
νομίζω ξέρω
ντύνομαι ετοιμάζομαι
νυστάζω ξυπνάω
ξαναβλέπω ξεχνάω
ξαναγυρίζω φεύγω
ξαναδιαβάζω μεταφράζω
ξαναδίνω προετοιμάζω
ξαναλέω γράφω
ξαναμιλάω διαφωνώ
ξαναπερνάω σταματάω
ξεκινάω σταματάω
ξενυχτάω κοιμάμαι
ξεπερνάω φοβάμαι
ξεπλένω σκουπίζω
ξέρω μαντεύω
ξεφεύγω φεύγω
ξοδεύω κερδίζω
οδηγώ τρέχω
ονειρεύομαι σχεδιάζω
παίζω διασκεδάζω
παντρεύομαι χωρίζω
παντρεύω φιλοξενώ
παραγγέλλω σερβίρω
παραγγέλνω μαγειρεύω
παρακαλώ ευχαριστώ
παρακολουθώ χάνω
παρατηρώ κρίνω
παρουσιάζομαι απευθύνομαι
παρουσιάζω περιγράφω
πάω σταματάω
πεθαίνω κρυώνω
πείθω συμβουλεύω
περιλαμβάνω διαγράφω
περνάω σταματάω
περπατάω τρέχω
πετάω ταξιδεύω
πέφτω κατεβαίνω
πηγαίνω σταματάω
πιάνω αφήνω
πιστεύω ελπίζω
πλησιάζω βλέπω
πνίγομαι βήχω
πονάω κρυώνω
ποτίζω φυτεύω
προετοιμάζω παρουσιάζω
προλαβαίνω χάνω
προσθέτω μετράω
προσκαλώ περιμένω
προσπαθώ μπορώ
προτείνω εξηγώ
προτιμάω αγοράζω
προφέρω γράφω
ρίχνω κρατάω
σημαίνω προσφέρω
σκέφτομαι ξεχνάω
σκορπίζω μαζεύω
σπάζω πλένω
σπουδάζω δουλεύω
στολίζω καθαρίζω
στρώνω σκουπίζω
συλλέγω μοιράζω
συμμετέχω χορεύω
συμπαθώ φοβάμαι
συμπληρώνω διαγράφω
συμφωνώ διαφωνώ
συνδέω συγκρίνω
συνεργάζομαι επικοινωνώ
συνεχίζω τελειώνω
συστήνω περιγράφω
σφουγγαρίζω στολίζω
σχεδιάζω αλλάζω
ταιριάζω συγκρίνω
τηγανίζω βράζω
τονίζω διαγράφω
τρακάρω σταματάω
τρελαίνομαι νευριάζω
τρίβω πλένω
τριγυρνάω τρέχω
υπάρχω λείπω
υπογράφω διαβάζω
υπόσχομαι προσφέρω
φέρνω παίρνω
φιλάω χαιρετάω
φιλοξενώ περιμένω
φοιτώ δουλεύω
φτάνω σταματάω
φτιάχνω χαλάω
φυσάω σβήνω
φωνάζω τραγουδάω
φωτίζω βλέπω
χαίρομαι λυπάμαι
χαλαρώνω χορεύω
χαρακτηρίζω παρουσιάζω
χαρίζω πουλάω
χρειάζομαι προσφέρω
χτυπάω τρίβω
ψωνίζω πουλάω
`;
const related = new Map();
const alternatives = new Map();
for (const line of pairs.trim().split("\n")) {
  const [a, b] = line.split(" ");
  related.set(a, b);
  if (!related.has(b)) related.set(b, a);
  for (const [lemma, other] of [
    [a, b],
    [b, a],
  ]) {
    alternatives.set(lemma, [...(alternatives.get(lemma) ?? []), other]);
  }
}
// These phrases have no reliable single-word semantic distractor in the
// source vocabulary. In particular, preserve the idiom τα καταφέρνω.
const formsOnly = new Set(["αρκώ", "δίνομαι", "διαρκώ", "καταφέρνω", "κοστίζω", "παθαίνω"]);
// Replacements must come from the existing, translated source vocabulary.
related.set("γίνομαι", "είμαι");
related.set("πρέπει", "μπορώ");

const master = (await readFile(resolve(sourceDir, "a1-a2-verbs.tmp.txt"), "utf8"))
  .trim()
  .split(/\r?\n/u);
const paradigms = new Map();
const lookup = new Map();
for (let i = 0; i < master.length; ) {
  const lemma = master[i];
  const count = ["πρέπει", "χιονίζει"].includes(lemma) ? 1 : 6;
  const forms = master.slice(i, i + count);
  paradigms.set(lemma, forms);
  forms.forEach((form, person) => lookup.set(`${person}|${form}`, lemma));
  i += count;
}

const collections = [];
const translations = new Map([
  // These two first-person forms are in the master paradigm, but not in items.
  ["λήγω", "«завершаю»."],
  ["διαρκώ", "«служу (продолжаю существовать)»."],
]);
for (const file of (await readdir(contentDir)).filter((name) => name !== "index.json")) {
  const collection = JSON.parse(await readFile(resolve(contentDir, file), "utf8"));
  const rows = (await readFile(resolve(sourceDir, file.replace(".json", ".tmp.txt")), "utf8"))
    .trim()
    .split(/\r?\n/u);
  if (rows.length !== collection.items.length) throw new Error(`Count mismatch: ${file}`);
  const entries = collection.items.map((item, index) => {
    const [form, label] = rows[index].split(" — ");
    const person = labels.indexOf(label);
    const lemma = lookup.get(`${person < 0 ? 0 : person}|${form}`);
    if (!lemma) throw new Error(`Unknown source form: ${rows[index]}`);
    const prefix = `- **${form}** — `;
    const gloss = item.hint
      .split("\n")
      .find((line) => line.startsWith(prefix))
      ?.slice(prefix.length);
    if (!gloss) throw new Error(`Missing translation: ${item.id}`);
    if (!translations.has(form)) translations.set(form, gloss);
    return { item, form, person, lemma, gloss };
  });
  collections.push({ file, collection, entries });
}

// Some verbs have different senses in the original sentence templates.
// Distractor glosses must describe the verb, not an unrelated source sentence.
const polysemous = {
  παίρνω: ["беру", "берёшь", "берёт", "берём", "берёте", "берут"],
  πιάνω: [
    "беру; ловлю",
    "берёшь; ловишь",
    "берёт; ловит",
    "берём; ловим",
    "берёте; ловите",
    "берут; ловят",
  ],
  ρίχνω: [
    "бросаю; лью",
    "бросаешь; льёшь",
    "бросает; льёт",
    "бросаем; льём",
    "бросаете; льёте",
    "бросают; льют",
  ],
  απλώνω: [
    "развешиваю; намазываю",
    "развешиваешь; намазываешь",
    "развешивает; намазывает",
    "развешиваем; намазываем",
    "развешиваете; намазываете",
    "развешивают; намазывают",
  ],
  βγάζω: [
    "вынимаю; снимаю",
    "вынимаешь; снимаешь",
    "вынимает; снимает",
    "вынимаем; снимаем",
    "вынимаете; снимаете",
    "вынимают; снимают",
  ],
  σβήνω: [
    "выключаю; тушу; стираю",
    "выключаешь; тушишь; стираешь",
    "выключает; тушит; стирает",
    "выключаем; тушим; стираем",
    "выключаете; тушите; стираете",
    "выключают; тушат; стирают",
  ],
};
for (const [lemma, glosses] of Object.entries(polysemous)) {
  paradigms.get(lemma).forEach((form, person) => translations.set(form, `«${glosses[person]}».`));
}

for (const { file, collection, entries } of collections) {
  for (const { item, form, person, lemma } of entries) {
    const words = item.correctAnswer.split(" ");
    const position = words.indexOf(form);
    if (position < 0) throw new Error(`Missing target verb: ${item.id}`);
    let choices;
    if (lemma === "χιονίζει") {
      choices = [
        ["βρέχει", "«идёт дождь»."],
        ["αστράφτει", "«сверкает молния»."],
        ["φυσάει", "«дует ветер»."],
      ];
    } else {
      const own = paradigms.get(lemma);
      const otherLemma = related.get(lemma);
      if (!otherLemma && !formsOnly.has(lemma)) throw new Error(`Unreviewed lemma: ${lemma}`);
      const other = paradigms.get(otherLemma);
      const actualPerson = person < 0 ? 3 : person;
      if (formsOnly.has(lemma)) {
        choices = [1, 3, 4].map((offset) => own[(actualPerson + offset) % 6]);
      } else if (lemma === "πρέπει") {
        choices = [
          other[actualPerson],
          other[(actualPerson + 1) % 6],
          paradigms.get("προσπαθώ")[actualPerson],
        ];
      } else {
        if (!other || other.length !== 6) throw new Error(`Invalid alternative: ${otherLemma}`);
        const wrongPerson = [3, 1, 4, 2, 5]
          .map((offset) => own[(actualPerson + offset) % 6])
          .find((candidate) => candidate !== form);
        const secondLemma = alternatives.get(lemma)?.find((candidate) => candidate !== otherLemma);
        const third = secondLemma ? paradigms.get(secondLemma)[actualPerson] : wrongPerson;
        choices = [other[actualPerson], other[(actualPerson + 1) % 6], third];
      }
      choices = choices.map((choice) => {
        const gloss = translations.get(choice);
        if (!gloss) throw new Error(`Missing distractor gloss: ${choice}`);
        return [choice, gloss];
      });
    }
    item.wrongAnswers = choices.map(([choice]) => {
      const answer = [...words];
      answer[position] = choice;
      return answer.join(" ");
    });
    if (new Set([item.correctAnswer, ...item.wrongAnswers]).size !== 4)
      throw new Error(`Duplicate answers: ${item.id}`);
    const heading = "**Глаголы в неверных ответах:**";
    if (!item.hint.includes(heading)) throw new Error(`Missing hint section: ${item.id}`);
    item.hint = `${item.hint.split(heading)[0]}${heading}\n${choices
      .map(([choice, gloss]) => `- **${choice}** — ${gloss}`)
      .join("\n")}`;
  }
  await writeFile(resolve(contentDir, file), `${JSON.stringify(collection, null, 2)}\n`);
  console.log(`${file}: ${entries.length} exercises repaired`);
}

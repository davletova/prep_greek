import { readFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { exerciseCollectionSchema } from "./exercises.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const sourceDir = resolve(root, "content-source/verbs");
const contentDir = resolve(root, "public/content/practice/single_choice/verbs-a1");

// Reviewed non-target vocabulary replaced with simpler A1 words. This is a
// regression guard for this editorial pass, not a universal CEFR classifier.
const replacedVocabulary = new Set([
  "εργαζόμενοι",
  "ταξιδιώτες",
  "γνώμη",
  "ελεγκτή",
  "έγγραφα",
  "σημειώσεις",
  "αγκαλιά",
  "δέμα",
  "λόγο",
  "ησυχία",
  "καταιγίδα",
  "επιτυχία",
  "ηλικιωμένο",
  "ξεκούραση",
  "εξέταση",
  "διάδρομο",
  "τζάκι",
  "ξύλα",
  "θέρμανση",
  "ταχυδρόμο",
  "παντζούρια",
  "ανατολή",
  "νεροχύτη",
  "αποθήκη",
  "λόγω",
  "κίνησης",
  "υδραυλικό",
  "οικογενειακό",
  "δείπνο",
  "καλεσμένους",
  "εργαλεία",
  "βιασύνη",
  "καλάθι",
  "πέρυσι",
  "θόρυβο",
  "σκιά",
  "σύντροφό",
  "δημαρχείο",
  "αρραβώνα",
  "ποδιά",
  "καθάρισμα",
  "μέσω",
  "διαδικτύου",
  "κορυφή",
  "λόφο",
  "προσεκτικά",
  "υπόγειο",
  "ισόγειο",
  "εξωτερικό",
  "εξήγηση",
  "μήκος",
  "ακτής",
  "προσοχή",
  "φορτηγό",
  "σήραγγα",
  "γέφυρα",
  "ποταμού",
  "αποσκευές",
  "βιαστικά",
  "στάδιο",
  "πεζούς",
  "μεσάνυχτα",
  "σύνορα",
  "μέλος",
  "μέλη",
  "στοιχεία",
]);

async function collection(file: string) {
  return exerciseCollectionSchema.parse(JSON.parse(await readFile(file, "utf8")));
}

describe("A1 verb sentence vocabulary", () => {
  it("keeps every original target form and synchronizes prompts, hints and distractors", async () => {
    let count = 0;
    for (const file of await readdir(contentDir)) {
      if (file === "index.json") continue;
      const source = await collection(resolve(sourceDir, "practice", file));
      const rows = (await readFile(resolve(sourceDir, file.replace(".json", ".tmp.txt")), "utf8"))
        .trim()
        .split(/\r?\n/u);
      expect(source.items).toHaveLength(rows.length);
      const targetById = new Map(
        source.items.map((item, index) => [item.id, rows[index]?.split(" — ")[0]])
      );
      for (const item of (await collection(resolve(contentDir, file))).items) {
        if (item.type !== "single-choice") throw new Error(`Unexpected type: ${item.id}`);
        const target = targetById.get(item.id);
        if (!target) throw new Error(`Missing original verb: ${item.id}`);
        expect(item.correctAnswer, item.id).toBe(target);
        expect(
          item.prompt.split(" ").filter((word) => word === "_______"),
          item.id
        ).toHaveLength(1);
        const sentence = item.prompt.replace("_______", item.correctAnswer);
        const words = sentence.split(" ");
        expect(
          words.filter((word) => word === target),
          item.id
        ).toHaveLength(1);
        const position = words.indexOf(target);
        const otherWords = words.filter((_, index) => index !== position);
        expect(
          otherWords.filter((word) => replacedVocabulary.has(word)),
          item.id
        ).toEqual([]);
        expect(item.translation, item.id).toBeTruthy();
        expect(item.hint?.startsWith(`**${sentence}** — «${item.translation}».`), item.id).toBe(
          true
        );
        const wordHints = item.hint
          ?.split("**Перевод каждого слова:**\n")[1]
          ?.split("\n\n")[0]
          ?.split("\n");
        expect(wordHints, item.id).toHaveLength(words.length);
        words.forEach((word, index) =>
          expect(wordHints?.[index], item.id).toMatch(
            new RegExp(`^- \\*\\*${word}\\*\\* — .+\\.$`, "u")
          )
        );
        const verbHints = item.hint?.split("**Глаголы в неверных ответах:**\n")[1]?.split("\n");
        expect(verbHints, item.id).toHaveLength(3);
        expect(new Set([item.correctAnswer, ...item.wrongAnswers]).size, item.id).toBe(4);
        item.wrongAnswers.forEach((answer, index) => {
          expect(answer, item.id).toMatch(/^\S+$/u);
          expect(verbHints?.[index]?.startsWith(`- **${answer}** — `), item.id).toBe(true);
        });
        count++;
      }
    }
    expect(count).toBe(824);
  });
});

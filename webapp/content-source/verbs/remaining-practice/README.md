# Verb practice templates

Each theme's `.tmp.txt` file has one line per verb lemma:

`lemma|Greek phrase after the verb|six comma-separated Russian predicates|Russian phrase after the predicate`

The entries are matched against the corresponding person-labelled rows in `../<theme>.tmp.txt`. The templates use the same object or circumstance across persons while inflecting the Greek verb and the Russian prompt. A standalone `μου` in the Greek phrase is replaced with the subject's possessive pronoun; `{lemma}` inserts that verb conjugated to match the subject. A Russian predicate prefixed with `@` supplies its own subject (e.g. `У меня есть`).

`πρέπει` and `χιονίζει` are impersonal exceptions. Identically spelled singular and plural forms of `είναι` retain their separate source rows. Word-by-word hint translations come from `../word-glosses.tmp.txt` and the additional vocabulary in `word-glosses.tmp.txt` here.

After changing a template or vocabulary, run `node webapp/scripts/generate-remaining-verb-practice.mjs` from the repository root, then `npm run validate:content --prefix webapp` and `npm run test --prefix webapp`.

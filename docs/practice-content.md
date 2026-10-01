# Practice content structure

Practice content is stored in JSON files under:

- `webapp/public/content/practice/`

One file contains a collection of exercises for one topic or set.

## Single-choice topic index

`webapp/public/content/practice/single_choice/index.json` stores topic metadata:

```json
[
  {
    "id": "base-greek",
    "title": "Базовые фразы",
    "subtitle": "Выберите правильный перевод",
    "fileName": "base-greek.json"
  }
]
```

Notes:

- `id` must be unique within the index.
- `fileName` must point to an existing JSON file in the same folder.
- Topic files still contain full exercise collections.

## Verb levels (A1 / A2)

The single-choice menu exposes **Глаголы A1** and **Глаголы A2** instead of the
old **Глаголы** group. Each level retains the non-empty thematic subgroups.

- `webapp/content-source/verbs/levels.json` is the explicit lemma-to-level map.
- `webapp/content-source/verbs/practice/` holds the complete, editable exercise
  collections and their thematic index (formerly the public `verbs/` directory).
- `webapp/public/content/practice/single_choice/verbs-a1/` and `verbs-a2/` are
  generated public collections; do not edit these copies directly.

The classification is an editorial teaching estimate, not an official CEFR
word list. A1 prioritizes basic needs, personal information, everyday routines,
shopping, travel and elementary classroom language. A2 contains the extended
vocabulary of actions, communication, emotions and abstract reasoning. Some
less frequent verbs are retained in the extended A2 set rather than discarded.
Only the target verb in `correctAnswer` determines the level: every person,
number and sense of a lemma stays in one level. The alternative spellings
`παραγγέλλω` / `παραγγέλνω` share the same level. Sentence vocabulary, grammar and
wrong-answer verbs have **not** yet been normalized to these levels.

After editing source exercises or the level map, run:

```bash
npm run generate:verb-levels --prefix webapp
npm run validate:content --prefix webapp
npm run test --prefix webapp
```

The splitter preserves every item and its ID, prompt, correct answer,
distractors and hint. Source rows (`<theme>.tmp.txt`) identify the target verb
and person; do not reorder the source collections independently of these rows.
Empty thematic subgroups are omitted. Topic/group IDs include the level to
avoid navigation collisions; exercise IDs remain unchanged.

Legacy generation/hint tools now write to `content-source/verbs/practice/`.
When regenerating the original templates, run
`node webapp/scripts/repair-verb-distractors.mjs` before splitting by level to
restore the verb-only distractor rule.

## File shape

```json
{
  "title": "Topic title",
  "items": []
}
```

## Supported exercise types

### `single-choice`

```json
{
  "id": "exercise-id",
  "type": "single-choice",
  "prompt": "Question text",
  "correctAnswer": "Correct option",
  "wrongAnswers": ["Wrong 1", "Wrong 2", "Wrong 3"],
  "translation": "Optional translation",
  "explanation": "Optional explanation"
}
```

### `input`

```json
{
  "id": "alpha-type-verb-conjugation-input-001",
  "type": "input",
  "prompt": "уходят",
  "correctAnswer": "φεύγουν",
  "context": "уезжают, покидают"
}
```

## Notes

- `id` must be unique within the file.
- `single-choice` must always have exactly 3 wrong answers.
- `input` stores one expected answer in `correctAnswer`.
- `context` is optional and helps disambiguate the meaning of the target Greek word.
- `translation` and `explanation` are optional.

## Runtime model for `single-choice`

Before rendering in UI, `single-choice` content should be converted into a runtime question shape:

```ts
{
  id: string;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: number;
  translation?: string;
  explanation?: string;
}
```

Where:
- `options` is a shuffled array built from `correctAnswer` and `wrongAnswers`
- `correctIndex` points to the correct answer inside shuffled `options`

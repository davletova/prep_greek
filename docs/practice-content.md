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
`παραγγέλλω` / `παραγγέλνω` share the same level.

A separate editorial pass reviewed all 824 A1 sentences and simplified clearly
advanced non-target vocabulary in 146 exercises (for example, `υδραυλικό` →
`γιατρό`, `αποσκευές` → `βαλίτσες`). The original target verb and its exact form
are preserved, including when its surrounding sentence is rewritten. Russian
prompts, word-by-word hints and distractor sentence frames are updated together.
The A2 collections are unchanged. This is a vocabulary pass, not a grammar or
verb-sense normalization; secondary verbs and the distractor verbs are not
reclassified. `verbs-a1-vocabulary.test.ts` guards the reviewed replacements and
the source verb forms.

The editable `practice/` files contain these revisions. Legacy template
regeneration can overwrite them and is not part of the normal level-splitting
workflow.

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

## Noun/adjective levels (A1 / A2)

The former `adjectives-nouns/` menu is replaced with
**Существительные и прилагательные A1** and
**Существительные и прилагательные A2**, retaining thematic groups and subtopics.
The editable collections now live in
`webapp/content-source/nouns-adjectives/practice/`; the explicit form-level map is
`webapp/content-source/nouns-adjectives/practice-levels.json`.

Only the noun and adjective/determiner in `correctAnswer` determine the level:
both must be A1 for an A1 exercise. Otherwise the exercise is A2. Existing item
content and IDs are unchanged; wrong answers do not influence classification.
This is an editorial estimate, not an official CEFR certification.

Regenerate with `npm run generate:nouns-adjectives-levels --prefix webapp`.
See [the source README](../webapp/content-source/nouns-adjectives/README.md) for
compound expressions, pronouns, noun-only answers and maintenance instructions.

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

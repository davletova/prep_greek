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

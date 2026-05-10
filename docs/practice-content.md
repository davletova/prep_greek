# Practice content structure

Practice content is stored in JSON files under:

- `webapp/public/content/practice/`

One file contains a collection of exercises for one topic or set.

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

### `text-input`

```json
{
  "id": "exercise-id",
  "type": "text-input",
  "prompt": "Question text or sentence with gap",
  "correctAnswers": ["Accepted answer 1", "Accepted answer 2"],
  "translation": "Optional translation",
  "explanation": "Optional explanation"
}
```

## Notes

- `id` must be unique within the file.
- `single-choice` must always have exactly 3 wrong answers.
- `text-input` may have one or more accepted answers.
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

# Data Model (JSON)

This document defines initial JSON structures for exercises and results. These will feed the OpenAPI spec and backend DTOs.

## Common Fields

- `id` (string): unique identifier for an item within a training session.
- `type` (string): exercise type key.
- `level` (string): `A2` or `B1`.
- `skill` (string): `reading`, `listening`, `writing`.
- `prompt` (string): instruction shown to the user.
- `metadata` (object): optional context (topic, difficulty, source).

## Exercise Types

### Reading: True/False

```json
{
  "id": "ex-1",
  "type": "reading_true_false",
  "level": "A2",
  "skill": "reading",
  "prompt": "Read the text and mark each statement True or False.",
  "passage": "Short Greek text...",
  "statements": [
    { "id": "s1", "text": "Statement 1", "answer": true },
    { "id": "s2", "text": "Statement 2", "answer": false }
  ]
}
```

### Reading: Matching (phrase start/end)

```json
{
  "id": "ex-2",
  "type": "reading_matching",
  "level": "A2",
  "skill": "reading",
  "prompt": "Match the beginning and the end of the phrases.",
  "left": [
    { "id": "l1", "text": "Beginning 1" },
    { "id": "l2", "text": "Beginning 2" }
  ],
  "right": [
    { "id": "r1", "text": "Ending 1" },
    { "id": "r2", "text": "Ending 2" }
  ],
  "answer_key": [
    { "left_id": "l1", "right_id": "r2" },
    { "left_id": "l2", "right_id": "r1" }
  ]
}
```

### Reading: Multiple Choice (short texts)

```json
{
  "id": "ex-3",
  "type": "reading_mcq",
  "level": "B1",
  "skill": "reading",
  "prompt": "Read each short text and choose the correct statement.",
  "items": [
    {
      "id": "t1",
      "passage": "Short text 1...",
      "options": [
        { "id": "o1", "text": "Option 1" },
        { "id": "o2", "text": "Option 2" }
      ],
      "answer_id": "o2"
    }
  ]
}
```

### Reading: Cloze (word bank)

```json
{
  "id": "ex-4",
  "type": "reading_cloze",
  "level": "A2",
  "skill": "reading",
  "prompt": "Fill in the gaps using the word bank.",
  "passage": "Text with ____ gaps.",
  "gaps": [
    { "id": "g1", "index": 1, "answer": "word1" },
    { "id": "g2", "index": 2, "answer": "word2" }
  ],
  "word_bank": ["word1", "word2", "word3"]
}
```

### Listening: Match to statement/phrase

```json
{
  "id": "ex-5",
  "type": "listening_matching",
  "level": "A2",
  "skill": "listening",
  "prompt": "Listen and match the audio to the correct statement.",
  "audio": { "url": "https://...", "duration_sec": 45 },
  "options": [
    { "id": "o1", "text": "Statement 1" },
    { "id": "o2", "text": "Statement 2" }
  ],
  "answer_id": "o1"
}
```

### Listening: Multiple Choice (dialogue)

```json
{
  "id": "ex-6",
  "type": "listening_mcq",
  "level": "B1",
  "skill": "listening",
  "prompt": "Listen to the dialogue and choose the correct answer.",
  "audio": { "url": "https://...", "duration_sec": 60 },
  "question": "Question text...",
  "options": [
    { "id": "o1", "text": "Option 1" },
    { "id": "o2", "text": "Option 2" }
  ],
  "answer_id": "o2"
}
```

### Listening: True/False

```json
{
  "id": "ex-7",
  "type": "listening_true_false",
  "level": "A2",
  "skill": "listening",
  "prompt": "Listen and mark each statement True or False.",
  "audio": { "url": "https://...", "duration_sec": 50 },
  "statements": [
    { "id": "s1", "text": "Statement 1", "answer": true },
    { "id": "s2", "text": "Statement 2", "answer": false }
  ]
}
```

### Listening: Note-taking (form fill)

```json
{
  "id": "ex-8",
  "type": "listening_note_taking",
  "level": "B1",
  "skill": "listening",
  "prompt": "Listen and complete the form.",
  "audio": { "url": "https://...", "duration_sec": 70 },
  "fields": [
    { "id": "f1", "label": "Name", "answer": "..." },
    { "id": "f2", "label": "Date", "answer": "..." }
  ]
}
```

### Writing: Letter/Message

```json
{
  "id": "ex-9",
  "type": "writing_letter",
  "level": "A2",
  "skill": "writing",
  "prompt": "Write a message to a friend (80-100 words).",
  "scenario": "Scenario text...",
  "constraints": { "min_words": 80, "max_words": 100 }
}
```

### Writing: Announcement

```json
{
  "id": "ex-10",
  "type": "writing_announcement",
  "level": "B1",
  "skill": "writing",
  "prompt": "Write an announcement (80-100 words).",
  "scenario": "Scenario text...",
  "constraints": { "min_words": 80, "max_words": 100 }
}
```

## Training Session (request/response)

```json
{
  "session_id": "sess-123",
  "level": "A2",
  "skill": "reading",
  "type": "reading_true_false",
  "items": [ /* array of exercises of the chosen type */ ]
}
```

## Submission Result (response)

```json
{
  "session_id": "sess-123",
  "submitted_at": "2026-02-02T12:34:56Z",
  "result": {
    "correct": 7,
    "total": 10
  },
  "feedback": [
    { "item_id": "ex-1", "is_correct": true, "notes": "..." }
  ]
}
```

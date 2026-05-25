# Architecture TODO

This file tracks follow-up architecture work intentionally left out after the current refactoring passes. Each section below is a good candidate for a separate branch/PR so the app remains reviewable and deployable after every step.

## Current architecture baseline

Completed in recent refactoring:

- `App.tsx` is now a thin application shell.
- App-level orchestration lives under `webapp/src/app/`.
- Static content loading is isolated in `webapp/src/services/content/`.
- Single-choice topic index now stores metadata objects and selected topic collections are loaded on demand.
- Practice screens use shared shell/loading/empty components.
- Practice exercise UI is split into renderer cards:
  - `InputExerciseCard`
  - `SingleChoiceExerciseCard`
- Practice answer/session logic is split into hooks.
- Loading indicators are delayed to avoid flicker on fast requests.
- Content validation runs locally and in CI.

## 1. Introduce real routing

Current state:

- Navigation is still based on the internal `Screen` union in `webapp/src/types/ui.ts`.
- `AppScreenRenderer` switches screens manually.
- There is no browser URL/deep-link representation for the current screen/topic.

Future direction:

- Consider adding `react-router-dom` or a small internal route object model.
- Candidate routes:
  - `/`
  - `/theory/alphabet`
  - `/theory/diphthongs`
  - `/practice/single-choice`
  - `/practice/single-choice/:topicId`
  - `/practice/input`
  - `/practice/input/:topicId`
  - `/profile`
- Integrate Telegram Mini App start/deep-link params only after route shape is stable.

Why separate:

- Routing changes can affect navigation behavior broadly.
- It needs manual testing in both regular browser and Telegram Mini App context.

## 2. Create a generic `PracticeSessionScreen`

Current state:

- `InputPracticeTopicScreen` and `SingleChoicePracticeTopicScreen` are cleaner and similar.
- They both use:
  - `PracticeScreenShell`
  - delayed loading states
  - empty states
  - `useExerciseSession`
  - answer-specific hooks
  - exercise card renderers
- They are still separate screens with duplicated high-level flow.

Future direction:

- Introduce a generic session screen responsible for:
  - shell layout;
  - loading/error/empty states;
  - next button placement if applicable;
  - close handling;
  - common speech stop behavior.
- Keep exercise-type-specific UI and answer logic in dedicated renderer/components/hooks.

Possible shape:

```tsx
<PracticeSessionScreen
  title={title}
  topicState={topicState}
  items={items}
  emptyState={...}
  renderExercise={...}
/>
```

Why separate:

- It is a larger abstraction step.
- It should be done only after the current duplicated behavior is stable in production.

## 3. Add a practice renderer registry

Current state:

- Exercise cards are separate components:
  - `InputExerciseCard`
  - `SingleChoiceExerciseCard`
- Screens still choose renderers directly.

Future direction:

- Introduce a registry keyed by exercise type/kind:

```ts
const practiceRenderers = {
  input: InputExerciseRenderer,
  "single-choice": SingleChoiceExerciseRenderer
};
```

Benefits:

- Adding a new exercise type becomes more mechanical.
- Screen/session logic does not need to know every renderer explicitly.

Why separate:

- A registry is useful only when the generic session abstraction exists or when more exercise types are planned.
- Adding it too early can create unnecessary indirection.

## 4. Expand progress model beyond daily stats

Current state:

- Practice stats are aggregated by day.
- Storage key: `practice_stats`.
- The app cannot yet show per-topic progress, weak areas, or item-level history.

Future direction:

Add separate progress structures, for example:

```ts
interface TopicProgress {
  answered: number;
  correct: number;
  lastPracticedAt: string;
}

interface ExerciseProgress {
  attempts: number;
  correct: number;
  lastAnsweredAt: string;
}
```

Potential storage keys:

- `practice_stats_daily`
- `practice_topic_progress`
- `practice_topic_progress:{topicId}`

Benefits:

- Per-topic progress.
- Better profile screen.
- Error review.
- Future spaced repetition support.

Why separate:

- It changes persisted data shape.
- It needs versioning/migration decisions and Telegram CloudStorage size considerations.

## 5. Improve loading UX further

Current state:

- Loading indicators are delayed via `useDelayedLoading` to avoid flicker.
- During fast loads, no loading message is shown.

Future direction:

- Consider lightweight skeleton placeholders for long lists/cards.
- Consider preserving previous data during refresh/retry if that becomes useful.
- Consider making delay configurable per surface if real-device testing shows different needs.

Why separate:

- This is UX tuning and should be based on manual testing, especially inside Telegram.

## 6. Run Prettier across the project

Current state:

- `npm run format:check --prefix webapp` reports many formatting differences.
- This predates the current refactoring branch and includes content JSON files.

Future direction:

- Run `npm run format --prefix webapp` in a dedicated formatting-only PR.
- Alternatively restrict Prettier scope if formatting large JSON content is undesirable.

Why separate:

- Formatting-only changes create large diffs.
- Mixing them with architecture changes makes review much harder.

## 7. Strengthen content validation further

Current state:

- `validate-content.mjs` validates JSON structure and several important invariants.
- Single-choice topic metadata index is validated.

Possible improvements:

- Reject unknown fields.
- Enforce non-empty arrays for content collections.
- Validate duplicate topic ids across all topic registries.
- Validate topic id/file name consistency.
- Validate input topic registry URLs point to existing files.
- Add warning/error policy for suspicious text typos if content QA becomes important.

Why separate:

- Some checks may require content cleanup first.
- Strict validation can block deployment if existing content does not fully comply.

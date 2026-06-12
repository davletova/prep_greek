# Theme QA checklist

Use this checklist after theme-related changes and before release.

## Browser checks

### Light system theme

- App background uses the light blue gradient.
- Text is dark and readable on all cards.
- Bottom tab bar is light, blurred, and readable.
- Primary buttons are blue with white text.
- Correct/wrong answer states are readable.
- Inputs and disabled buttons look unchanged from the previous light UI.

### Dark system theme

- App background switches to the dark blue gradient.
- Cards, sheets, and buttons are visibly separated from the background.
- Text contrast is comfortable for headings, body text, subtitles, and hints.
- Bottom tab bar is dark, blurred, and readable.
- Correct/wrong answer states are readable and not overly bright.
- Modal overlay and confirm sheet are readable.
- Input underline, focused input, and answer borders are visible.

## Telegram Mini App checks

### Initial theme

- In Telegram light theme, the Mini App opens in light mode.
- In Telegram dark theme, the Mini App opens in dark mode.
- Telegram theme has priority over browser/system media query.

### Live theme switch

- Change Telegram theme while the Mini App is open.
- The app updates without reload.
- No stale `data-theme` value remains after switching.

## Screen checklist

### Home tabs

- Theory tab
- Practice tab
- Profile tab
- Bottom tab bar active/inactive states

### Theory

- Alphabet list
- Alphabet detail/navigation controls
- Diphthongs list/detail
- Loading state
- Error state, if reproducible

### Practice

- Practice home
- Single-choice topic list
- Single-choice exercise card
- Translation hint under prompt
- 3-option noun gender questions
- 4-option legacy translation questions
- Correct answer state
- Wrong answer state
- Next button disabled/enabled states
- Speech/playback buttons active/disabled states

### Input practice

- Input topic list
- Input exercise card
- Empty input
- Correct input state
- Wrong input state
- Reset/next actions

### Profile

- Empty stats
- Filled stats
- Reset button
- Confirm sheet
- Error message, if reproducible

## Technical checks

Run before final merge/release:

```bash
npm run validate:content --prefix webapp
npm run typecheck --prefix webapp
npm run test --prefix webapp -- --run
npm run lint --prefix webapp
npm run build --prefix webapp
```

`format:check` currently reports pre-existing formatting differences across the repository; do not run format-write as part of theme QA unless the formatting cleanup is handled in a separate commit.

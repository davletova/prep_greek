# Exercise checking

## Current rules

### `single-choice`
- user answer is an index
- answer is correct when the selected index points to the correct answer

### `text-input`
- user answer is a string
- comparison is case-insensitive
- leading and trailing spaces are ignored
- answer is correct if it matches at least one item from `correctAnswers`

## Note

Current `single-choice` checking assumes the option order used for validation matches the option order shown in UI.
If the UI starts shuffling answer options, keep that order in runtime state and validate against it.

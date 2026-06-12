# Theme support plan

This document records the current color audit and the target token model for adding a system-synced dark theme safely.

## Goals

- Keep the current light UI visually unchanged while introducing theme tokens.
- Support dark mode through `prefers-color-scheme` for regular browsers.
- In Telegram Mini App, prefer `Telegram.WebApp.colorScheme` and react to `themeChanged`.
- Keep theme selection out of React state unless UI logic later needs it.

## Current state

The app is light-only today:

- `:root` uses `color-scheme: light`.
- Most colors are hardcoded in component styles.
- Telegram typings currently cover `ready` and `CloudStorage`, but not theme APIs.

Style files with theme-relevant colors:

- `webapp/src/styles/base.css`
- `webapp/src/styles/layout.css`
- `webapp/src/styles/navigation.css`
- `webapp/src/styles/components.css`
- `webapp/src/styles/theory.css`
- `webapp/src/styles/practice.css`

## Color roles found in the current UI

### Page background

Current values:

- `#f2f5fa`
- `#f8fbff`
- `#eef3fb`
- `#e8eef8`

Planned tokens:

- `--color-page-bg`
- `--color-page-bg-start`
- `--color-page-bg-mid`
- `--color-page-bg-end`

### Surfaces

Current values:

- `#ffffff`
- `#fffdfc`
- `rgba(255, 255, 255, 0.9)`
- `rgba(248, 251, 255, 0.95)`
- `#edf2f7`
- `#eef2f7`
- `#e7eef7`

Planned tokens:

- `--color-surface`
- `--color-surface-warm`
- `--color-surface-translucent`
- `--color-surface-muted`
- `--color-surface-soft`

### Text

Current values:

- `#1d2a44`
- `#1f2f4a`
- `#2a3b59`
- `#3a4d6e`
- `#4a5c82`
- `#5b6b85`
- `#6b7b95`
- `#7c8aa0`
- `#9aa7bd`
- `rgba(60, 60, 67, 0.6)`

Planned tokens:

- `--color-text-primary`
- `--color-text-heading`
- `--color-text-secondary`
- `--color-text-muted`
- `--color-text-hint`
- `--color-text-disabled`

### Borders

Current values:

- `#d5d5d5`
- `#c9d4e5`
- `rgba(109, 124, 153, 0.2)`
- `rgba(208, 74, 88, 0.18)`

Planned tokens:

- `--color-border`
- `--color-border-strong`
- `--color-border-subtle`
- `--color-danger-border`

### Primary actions

Current values:

- `#4a6fff`
- `#2d5bff`
- `#ffffff`

Planned tokens:

- `--color-primary`
- `--color-primary-active`
- `--color-primary-text`

### Success states

Current values:

- `#dff3e8`
- `#2c7a58`
- `#256c4c`
- `#2d8f62`
- `#4ecb8f`

Planned tokens:

- `--color-success-bg`
- `--color-success-border`
- `--color-success-text`
- `--color-success-strong`
- `--color-success-accent`

### Danger/error states

Current values:

- `rgba(208, 74, 88, 0.08)`
- `#b43645`
- `#b94a48`
- `#d04a58`
- `#ffe9e7`
- `#fff4f2`
- `#f9e5e6`
- `#c95252`
- `#a33a3a`

Planned tokens:

- `--color-danger-bg`
- `--color-danger-bg-strong`
- `--color-danger-surface`
- `--color-danger-border`
- `--color-danger-text`
- `--color-danger-fill`
- `--color-danger-fill-text`

### Overlays and shadows

Current values:

- `rgba(20, 31, 49, 0.42)`
- `rgba(22, 35, 66, 0.05)`
- `rgba(22, 35, 66, 0.06)`
- `rgba(22, 35, 66, 0.08)`
- `rgba(22, 35, 66, 0.12)`
- `rgba(22, 35, 66, 0.22)`
- `rgba(0, 0, 0, 0.04)`

Planned tokens:

- `--color-overlay`
- `--shadow-card`
- `--shadow-card-subtle`
- `--shadow-card-hover`
- `--shadow-card-disabled`
- `--shadow-modal`
- `--shadow-control`

## Implementation sequence

1. Add light theme tokens in `base.css` without changing usage.
2. Replace hardcoded colors in app chrome: `base.css`, `layout.css`, `navigation.css`.
3. Replace hardcoded colors in shared components: `components.css`.
4. Replace hardcoded colors in theory styles: `theory.css`.
5. Replace hardcoded colors in practice styles: `practice.css`.
6. Add dark token values with `@media (prefers-color-scheme: dark)`.
7. Add Telegram theme sync using `Telegram.WebApp.colorScheme` and `themeChanged`.
8. Polish contrast and interaction states after manual QA.

## CSS source-of-truth strategy

Use light values as defaults. Dark values should apply only when no explicit theme attribute exists:

```css
:root {
  color-scheme: light dark;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    /* dark token overrides */
  }
}

:root[data-theme="light"] {
  /* Telegram-forced light token values */
}

:root[data-theme="dark"] {
  /* Telegram-forced dark token values */
}
```

This keeps browser system theme working by default, while allowing Telegram to take priority inside the Mini App.

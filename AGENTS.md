# Repository Guidelines

This repository contains a static Telegram Mini App for Greek language learning and exam preparation. The project is frontend-only: the app is built with Vite + React and deployed to GitHub Pages. Learning content is stored as static files in the repository, and user progress is persisted via Telegram Mini App CloudStorage (key-value storage).

## Project Structure & Module Organization

- `webapp/` — the Mini App frontend.
- `webapp/src/` — React application code.
- `webapp/src/app/` — app-level initialization and orchestration helpers.
- `webapp/src/services/content/` — static content loading services.
- `webapp/public/content/` — static learning content (theory, exercises, metadata).
- `webapp/scripts/` — local maintenance scripts such as content validation.
- `.github/workflows/` — CI/CD for checks, build, and GitHub Pages deployment.
- `docs/` — product notes, content structure decisions, and architecture notes if added later.
- `view_examples/` — design and UI references.

Keep the project simple: avoid introducing backend-specific folders unless the product direction changes.

## Build, Test, and Development Commands

Run commands from the repo root unless noted otherwise.

- `npm install --prefix webapp` — install frontend dependencies.
- `npm run dev --prefix webapp` — start the local Vite dev server.
- `npm run build --prefix webapp` — create a production build.
- `npm run preview --prefix webapp` — preview the production build locally.
- `npm run typecheck --prefix webapp` — run TypeScript type checking.
- `npm run test --prefix webapp` — run unit tests.
- `npm run validate:content --prefix webapp` — validate static JSON content.
- `npm run lint --prefix webapp` — run ESLint.
- `npm run format:check --prefix webapp` — check Prettier formatting.

Before committing code changes, run at least:

```bash
npm run validate:content --prefix webapp
npm run typecheck --prefix webapp
npm run test --prefix webapp
npm run lint --prefix webapp
npm run build --prefix webapp
```

## Architecture Notes

- The app is fully static and served from GitHub Pages.
- Do not design features around a server or database.
- Persist user progress in Telegram CloudStorage as key-value pairs.
- Treat CloudStorage as user convenience storage, not as a secure or authoritative backend.
- Structure content and UI so the app still degrades gracefully outside Telegram during local browser development.
- Keep `App.tsx` thin: prefer moving app initialization, content loading, and derived state into focused hooks/services.
- Keep static content loading behind `webapp/src/services/content/` functions rather than fetching/parsing directly in screens.
- Validate content changes with `npm run validate:content --prefix webapp` before build/deploy.

## Coding Style & Naming Conventions

- Current frontend stack: React + TypeScript modules.
- Use 2-space indentation in frontend code.
- Prefer small, focused components and keep screen-level logic separate from shared UI.
- File naming: `kebab-case` for components, screens, and utilities.
- Keep static content in clear, stable JSON shapes so new lessons and exercise types can be added without rewriting core UI.

Prefer incremental refactoring: each architectural step should preserve behavior, pass checks, and be independently commit-ready.

## Testing Guidelines

- At the current stage, prioritize manual testing in:
  - a regular local browser,
  - Telegram Mini App context when needed.
- Verify both content rendering and Telegram-specific integrations such as `Telegram.WebApp` availability and CloudStorage behavior.
- Prefer lightweight frontend tests around content rendering, navigation, scoring, and progress persistence.
- Static JSON content should pass `npm run validate:content --prefix webapp`.

## Commit & Pull Request Guidelines

- Use Conventional Commits for commit messages, e.g. `refactor: extract practice content service`, `test: add content validation script`, `ci: run checks before deployment`.
- Use conventional branch naming for larger work, e.g. `refactor/app-architecture-modernization`.
- Keep commits scoped to one concern: content, UI, storage, architecture, or build/deploy.
- Prefer small, safe commits that keep the app working after every step.
- PRs should include:
  - purpose,
  - scope,
  - screenshots or recordings for UI changes,
  - notes about Telegram-specific behavior if relevant.

## Security & Configuration Tips

- Never commit bot tokens, private links, or secret configuration.
- Do not store secrets in Telegram CloudStorage.
- Assume all frontend code and static content are public.
- Since there is no backend, do not rely on client-side checks for real security guarantees.
- Document any required Telegram environment assumptions in `docs/` or `README.md` if they appear later.

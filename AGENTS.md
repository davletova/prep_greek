# Repository Guidelines

This repository contains a static Telegram Mini App for Greek language learning and exam preparation. The project is frontend-only: the app is built with Vite + React and deployed to GitHub Pages. Learning content is stored as static files in the repository, and user progress is persisted via Telegram Mini App CloudStorage (key-value storage).

## Project Structure & Module Organization

- `webapp/` — the Mini App frontend.
- `webapp/src/` — React application code.
- `webapp/public/content/` — static learning content (theory, exercises, metadata).
- `.github/workflows/` — CI/CD for building and deploying to GitHub Pages.
- `docs/` — product notes, content structure decisions, and architecture notes if added later.
- `view_examples/` — design and UI references.

Keep the project simple: avoid introducing backend-specific folders unless the product direction changes.

## Build, Test, and Development Commands

Run commands from the repo root unless noted otherwise.

- `npm install --prefix webapp` — install frontend dependencies.
- `npm run dev --prefix webapp` — start the local Vite dev server.
- `npm run build --prefix webapp` — create a production build.
- `npm run preview --prefix webapp` — preview the production build locally.

If additional tooling is added later (linting, tests, formatting), document the exact commands here.

## Architecture Notes

- The app is fully static and served from GitHub Pages.
- Do not design features around a server or database.
- Persist user progress in Telegram CloudStorage as key-value pairs.
- Treat CloudStorage as user convenience storage, not as a secure or authoritative backend.
- Structure content and UI so the app still degrades gracefully outside Telegram during local browser development.

## Coding Style & Naming Conventions

- Current frontend stack: React + JavaScript modules.
- Use 2-space indentation in frontend code.
- Prefer small, focused components and keep screen-level logic separate from shared UI.
- File naming: `kebab-case` for components, screens, and utilities.
- Keep static content in clear, stable JSON shapes so new lessons and exercise types can be added without rewriting core UI.

If the project later migrates to TypeScript, update this document accordingly.

## Testing Guidelines

- At the current stage, prioritize manual testing in:
  - a regular local browser,
  - Telegram Mini App context when needed.
- Verify both content rendering and Telegram-specific integrations such as `Telegram.WebApp` availability and CloudStorage behavior.
- If automated tests are introduced, prefer lightweight frontend tests around content rendering, navigation, scoring, and progress persistence.

## Commit & Pull Request Guidelines

- Commit messages should be short, imperative, and focused (e.g. `Add diphthong loading state`).
- Keep commits scoped to one concern: content, UI, storage, or build/deploy.
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

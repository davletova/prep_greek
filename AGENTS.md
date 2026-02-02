# Repository Guidelines

This repository will host a monorepo for a Telegram Mini App that helps users prepare for Greek language learning. It contains a Go backend and a Vite + React + TypeScript webapp. Update this document as the structure evolves.

## Project Structure & Module Organization

- `backend/` — Go API server (Telegram WebApp auth, content, progress, tests).
- `webapp/` — Vite + React + TypeScript UI for the Mini App.
- `shared/` — optional shared assets/schemas (e.g., OpenAPI, DTOs).
- `scripts/` — local tooling, generators, or CI helpers.
- `docs/` — product notes and architecture decisions.

## Build, Test, and Development Commands

Run commands from the repo root.

- `go test ./...` — run all Go tests in `backend/`.
- `go vet ./...` — basic Go static checks.
- `go test -race ./...` — race detector for concurrency issues.
- `npm install --workspace webapp` — install webapp dependencies.
- `npm run dev --workspace webapp` — start Vite dev server.
- `npm run build --workspace webapp` — production build.
- `npm run test --workspace webapp` — run webapp tests.

Adjust commands if you choose a different package manager (pnpm/yarn) or toolchain.

## Coding Style & Naming Conventions

- Go: `gofmt` formatting, `golangci-lint` preferred for linting.
- TypeScript: 2 spaces, `eslint` + `prettier` (if configured).
- File naming: `kebab-case` for React components and routes, `snake_case` for Go files when helpful.
- Exported Go identifiers use `PascalCase`; unexported use `camelCase`.

## Testing Guidelines

- Go: standard library `testing`; table-driven tests preferred.
- Webapp: `vitest` + `@testing-library/react` (if adopted).
- Name tests `*_test.go` in Go and `*.test.tsx` for UI.
- Include unit tests for content generation, scoring, and progress tracking.

## Commit & Pull Request Guidelines

- Commit messages: use short, imperative summaries (e.g., `Add quiz scoring`).
- Keep commits focused by area (`backend:` / `webapp:` prefixes are welcome).
- PRs should include: purpose, scope, screenshots for UI changes, and linked issues.
- Note any Telegram WebApp constraints or API changes in the PR description.

## Security & Configuration Tips

- Never commit bot tokens; use `.env` files locally.
- Validate Telegram WebApp init data on the backend.
- Document required env vars in `docs/` or `README.md`.

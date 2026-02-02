# API Approach

We will use a REST API with an OpenAPI specification.

## Rationale

- Simple to integrate with the webapp and Telegram Mini App.
- OpenAPI provides a single source of truth for request/response schemas.
- Easy to generate typed clients and server stubs later if needed.

## Initial Conventions

- JSON over HTTPS.
- Versioned base path: `/api/v1`.
- Standard error shape: `{ "error": { "code": "...", "message": "...", "details": ... } }`.
- Request/response DTOs will be shared in `shared/` (or generated from OpenAPI).


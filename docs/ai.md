# AI Provider

We will use Google Gemini as the AI provider for content generation and evaluation.

## Integration Approach

- Backend calls Gemini over HTTPS using an API key stored in environment variables.
- Requests are made per training session (batch of items per exercise type).
- Responses are validated and normalized to the JSON schemas in `docs/data-model.md`.
- Errors or malformed responses trigger a retry or a safe fallback message.

## Configuration

- Env var: `GEMINI_API_KEY`
- Optional env var for model selection (to be decided later).

## Next Steps

1. Define prompt templates per exercise type.
2. Implement a provider interface with a Gemini implementation.
3. Add tests with mocked Gemini responses.

# LiveCode backend (mocked)

This is a minimal Express + TypeScript backend used by the frontend during development.

Available endpoints (mocked):

- GET /api/health → { status: 'ok', timestamp }
- POST /api/execute → accepts { language, code, input } and returns mocked execution result
- POST /api/ai → accepts { message, currentCode, language } and returns mocked assistant reply

Run locally:

1. copy `.env.example` to `.env` and adjust PORT if needed
2. npm install
3. npm run dev

The backend intentionally returns mocked responses so we can verify frontend wiring before adding real execution/LLM integrations.

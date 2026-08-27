# Lexia

A chat interface for document-oriented legal questions in Spain, scoped to a
jurisdiction — national, Catalonia, Madrid or EU — with the system prompt told to
prioritise that jurisdiction's sources. It is built for a non-lawyer asking about
their own situation, an eviction or a fine or a dismissal, where the question
itself carries the personal data.

## What actually reaches the model

Redaction runs in the browser, in `src/services/api.ts`, inside the request body
before `fetch` is called — so raw text never reaches Lexia's own server either.
`pseudonymizeUserContent` (`src/utils/pseudonymize.ts`) rewrites self-identifying
Spanish patterns: `me llamo X` and `nombre:` become `[Usuario]`, `mi correo es X`
becomes `[correo]`, `DNI/NIF/NIE` becomes `[documento]`. User turns are rewritten;
assistant turns are not.

Two limits, stated plainly. File attachments are forwarded untouched, and the
patterns only catch self-identification — a third party named in passing is not
redacted. The server (`api/chat.ts`) validates the body with Zod, rate-limits per
IP, then proxies to Google Gemini 2.5 Flash. It does not re-redact.

## Tests

`npm run test:run` covers 16 files under Vitest; `npm run test:e2e` runs 5
Playwright specs. The unit tests carry the weight — pseudonymization, validators,
token limits, markdown stripping. The integration and e2e files are render and
smoke tests: they assert that the login page, the attach button and the chat input
mount, not that those flows complete.

## Running it

```bash
echo "GEMINI_API_KEY=your_key" > .env
npm install
node api/dev-server.mjs   # :3000
npm run dev               # :5174, proxies /api
```

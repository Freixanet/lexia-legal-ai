# Lexia

A Spanish legal-information chat with streamed responses, document attachments and a jurisdiction-aware conversation interface. Built with React and TypeScript, with a server-side Gemini integration.

## Engineering decisions

- Redact selected identification patterns in the browser before sending user-message text.
- Validate API request bodies with Zod.
- Keep the model key on the server.
- Separate chat presentation, streaming transport and text transformations.

## Run locally

Create a local `.env` containing `GEMINI_API_KEY=your_key`, then:

```sh
npm ci
node api/dev-server.mjs
```

In another terminal, run `npm run dev`. The interface listens on port 5174 and proxies `/api` to the local server on port 3000.

## Verify

```sh
npm run test:run
npm run build
npm run test:e2e
```

Unit tests exercise pseudonymization, validation, token limits, text formatting and components. The current integration and browser tests mainly exercise rendering and controls; an account button appearing does not prove registration or deletion completes.

## Privacy boundary

`src/services/api.ts` transforms user-message text with `pseudonymizeUserContent` before sending the request. Its patterns cover explicit Spanish self-identification such as “me llamo”, “mi correo es” and labelled identity documents.

This reduces selected identifiers; it is not a general anonymization guarantee. Free-form third-party details, attachments and assistant turns are outside those transformations. The server does not re-redact. Review [the transformation](src/utils/pseudonymize.ts) and [the API](api/chat.ts) when changing that boundary.

## Deployment

The Pages workflow publishes the static interface. GitHub Pages does not run the API in `api/`; a full live chat needs a server deployment as well. The static site is an interface preview, not proof of a functioning end-to-end service.

Built by [Marcos Freixanet](https://github.com/Freixanet) · [Contact](mailto:mfreixanet@icloud.com).

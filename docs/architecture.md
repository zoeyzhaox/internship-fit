# Architecture and data flow

The client is a dependency-free ES-module application. A small optional Node HTTP server provides same-origin source requests and a model adapter. Static deployment contains only the `public/` assets.

| File | Responsibility |
| --- | --- |
| `public/app.mjs` | UI, forms, dialogs, workspace state, source sync, explicit AI review |
| `public/engine.mjs` | Validation, keyword matching, qualification checks, resume generation |
| `public/fixtures.mjs` | Clearly fictional examples and configuration presets |
| `public/style.css` | Responsive workspace and print layouts |
| `server.mjs` | Loopback HTTP service; public board adapters; optional AI calls |
| `tests/` | Qualification, data-boundary, adapter and server tests |
| `scripts/build.mjs` | Copy static assets to `dist/` |

## Data boundaries

- Initial state is memory-only. Enabling persistence stores the workspace under `internship-fit-v1` in localStorage. Disabling it deletes that saved copy.
- Config exports contain settings only. Workspace backups contain profile, jobs, records and saved resume HTML.
- Static hosting receives ordinary asset requests; the application does not upload profiles. Hosting providers may maintain operational access logs.
- Public source sync sends company-board requests, not the student's profile.
- Optional AI calls send the selected job, selected experience text and style preferences through the local server to the configured provider. Explicit in-app confirmation precedes the request.
- `.env` never sits under public assets and is ignored by Git.
- Imported markup is escaped on screen. Downloaded resume snapshots use an element/attribute allowlist.

## Trust and deployment

The server binds to loopback and rejects non-local API Host headers and cross-origin API requests. It is a single-user local service, not a ready-made multi-tenant backend. Public hosting of the backend requires authentication, authorization, rate/usage controls, TLS and a deliberate privacy design.

The default static experience does not include AI credentials. Source fetches may fail under external CORS policies. All failure states leave existing records intact.

The static asset paths assume root deployment. A GitHub Pages project path requires adjusting absolute asset paths; a root custom domain or a static host with `dist/` as root works directly.

## Extensibility

The site feature-detects `document.modelContext` and exposes one read-only `list_internship_matches` tool. It returns current assessments and does not modify state. Unsupported browsers run the normal UI. This optional capability is not required for any primary workflow.

# Customization guide

## For students and organizations

Open **定制工具**, change settings, and click **保存定制设置**. Export the configuration to JSON. Recipients import the same file to get the tool's settings while keeping their own private profile.

Presets are examples, not a certification of fit: `balanced`, `research`, and `community` change branding, filtering, preference keywords, weights and resume layout. Applying a preset retains profiles, jobs, source boards and your custom AI style instruction.

`examples/community-config.json` is a working organization preset. `examples/jobs.json` contains fictional jobs you can import. Do not present these as real openings.

| Field | Meaning |
| --- | --- |
| `name`, `target`, `accent` | Identity, intended audience and six-digit hex theme color |
| `weights.skills`, `.interests`, `.location` | Nonnegative weights from 0–100; at least one must be positive |
| `interests` | Comma-separated keywords matched against title and description |
| `preferredLocation` | Case-insensitive location substring |
| `paidOnly`, `remoteOnly` | Filter confirmed negative conditions |
| `strictUnknown` | Also hide unknown values for activated pay/remote filters |
| `hideBlocked` | Hide confirmed qualification conflicts and closed roles |
| `template` | `classic` or `compact` |
| `sections` | Unique permutation of `education`, `experience`, `skills` |
| `sources` | Up to 20 `{type, board, label}` entries; types: `greenhouse`, `lever` |
| `prompt` | AI style preferences; cannot override fixed factuality rules |

## Ranking

`public/engine.mjs` exports the pure `assess(job, profile, config)` function. It returns checks, conflicts, reasons, matched keywords and a preference score.

- Skill factor = matched explicitly listed profile skills / skills mentioned in job.
- Interest factor = matched configured interest keywords / configured interest keywords.
- Location factor = 1 or 0 for a location substring match.
- Unavailable dimensions are excluded from the denominator.
- Score = 100 × weighted factor sum / included weight sum, rounded.
- A zero denominator returns `null`, not a made-up score.
- Confirmed conflicts appear after other jobs regardless of score, or are hidden if requested.

This simple ranking is explainable but not semantically comprehensive. Extend it only with documented changes and regression cases. Do not use school prestige, protected characteristics or inferred demographic preferences to rank people.

## Add a source adapter

1. Extend the fixed source allowlist and URL construction in `server.mjs/sourceJobs`.
2. Map jobs into the schema accepted by `normalizeJob`.
3. Preserve raw description text, original URL, retrieval time and provider ID.
4. Leave qualification fields unknown and `verified=false` unless a human reviews them.
5. Add pagination tests and handle incomplete retrieval as a failure. Do not mark missing jobs closed after only a partial download.
6. Extend source configuration validation and UI choices.
7. For static-browser use, add a browser adapter only if the provider permits it and supports CORS. Never embed private provider credentials.

Existing board identifiers are user-supplied; the tool does not discover all employers. Retrieval and redistribution are separate questions; follow source terms when expanding integrations.

## Change models

The optional server adapter expects `POST {AI_BASE_URL}/chat/completions` with a compatible `messages` request and `choices[0].message.content` response. Change the environment values to select a compatible provider. For different protocols, replace that adapter and keep output validation plus explicit user review.

User-supplied prompts and job descriptions are untrusted data. Never let them control tools, network destinations or secret handling. Currently AI only drafts text and has no tools or submission authority.

## Change resume templates

`resumeHTML` contains the section structure; `.resume-sheet` in `style.css` controls layout. Keep all user content escaped. The printer uses Letter size and 0.55-inch margins. Print preview remains the final pagination check across browsers.

## Change the workflow

`public/app.mjs` owns navigation, event handlers and session/local state. `engine.mjs` contains portable domain functions. Preserve schema validation on JSON import and sanitization on downloaded saved HTML. No external submission happens when marking a job applied.

## Interface languages

The interface opens in English. Use the top-bar selector to choose Simplified Chinese; the browser remembers that choice separately from the optional saved workspace. Switching languages preserves the current page and unsaved form fields. Job descriptions, personal experience, custom settings, and resume content remain in the language in which they were entered.

Interface copy lives in `public/i18n.mjs`. Each message contains an English version and an independently written Chinese version. Render labels with `tr()` at render time so changing languages updates the whole interface. Do not translate user data through the message catalog.

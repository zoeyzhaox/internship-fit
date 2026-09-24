# Internship Fit

An open-source internship application workspace that students and student organizations can customize. Review eligibility with evidence, organize real experiences, choose relevant content for a one-page resume, and track applications.

**Status: v0.1 research prototype.** No hiring-outcome claims. The default jobs and profile are fictional examples. This is not an exhaustive job board and does not auto-submit applications.

[中文使用说明](README.zh-CN.md) · [Customization](docs/customization.md) · [Architecture](docs/architecture.md) · [Validation](docs/validation.md)

The interface defaults to English, with natural Simplified Chinese available from the top-bar language selector. Your browser remembers your choice.

## Run locally

Install Node.js 22.9+ (Node 24 recommended), download the repository, and open a terminal in its folder:

```sh
npm start
```

Open `http://localhost:3000`. There are **no runtime npm dependencies** and no mandatory model credentials. Do not double-click `index.html`: ES modules need an HTTP server.

```sh
npm test
npm run build
```

`npm run build` creates a static `dist/` folder. Host it at a domain root, not an unconfigured subdirectory. Local-only server routes are not part of the static build.

## What works

| Capability | Static workspace | Local Node server |
| --- | --- | --- |
| Profile and real experience editor | Yes | Yes |
| Pasted job descriptions / JSON import | Yes | Yes |
| Evidence-backed manual qualification review | Yes | Yes |
| Configurable preference ranking | Yes | Yes |
| Resume preview, browser print-to-PDF | Yes | Yes |
| Tracker and saved resume versions | Yes | Yes |
| Shareable configuration presets | Yes | Yes |
| Company-specific Greenhouse / Lever sources | Subject to CORS/network limits | Same-origin server adapter |
| Optional AI rewrite suggestions | No | Yes, with your provider settings |

The deterministic keyword matcher is deliberately conservative, **not an AI eligibility classifier**. Automatic keyword extraction does not infer must-have requirements. Users confirm structured eligibility and record the source wording. Missing information remains unknown. A known graduation-year conflict is never overridden by preference ranking. Skills absent from a profile are evidence gaps, not proof that the person lacks them.

## Start with a workflow

1. Use the fictional profile for a tour, or create your own real profile.
2. Add an actual job by pasting its full description. Confirm required versus preferred skills and capture the exact eligibility wording.
3. Review each check. Unknown work authorization and ambiguous requirements require clarification; a score does not resolve them.
4. Adjust preferences in **Customize**. Export the configuration to share your setup without personal data.
5. Select a job and experiences, choose a resume template, and print to PDF. Use Letter paper, 100% scale, and turn browser headers/footers off. Review pagination; long content is not silently truncated.
6. Save a resume version and update application status yourself. No applications are transmitted by this tool.

## Optional AI

Copy `.env.example` to `.env` and set:

```dotenv
AI_BASE_URL=https://your-provider.example/v1
AI_MODEL=your-model
AI_API_KEY=your-private-key
```

Use a compatible HTTPS Chat Completions provider that returns text JSON. The server reads credentials, binds to loopback only, and does not log application contents. The UI asks before sending selected job/experience text to the configured provider. Name, email, phone and the full profile are excluded from that payload, but free-text experience content may still contain personal information you entered. Check the provider's retention policy yourself.

AI output is a suggestion, not verified fact. The server validates cited experience IDs and rejects newly introduced numbers. This does **not** prevent every kind of unsupported statement. Review source and suggestion side by side, and explicitly accept each change. Accepted changes update your experience library. Export a backup first if you want to retain the previous text.

## Data and customization

The app starts with session-only state. Optional localStorage persistence stays in the current browser. Full backups contain private data; configuration exports do not. There is no cloud account, analytics, or application database. The app never sends your profile to employers. Company source requests contact those recruitment services. AI requests are sent only after the explicit in-app action.

You can change branding, filtering, ranking weights, keywords, templates, section order, source boards and AI style instructions without editing code. Developers can replace the matcher, add source adapters or change the workflow. See [customization](docs/customization.md).

## Known limits

- Only configured company boards are queried. Only titles containing `intern`, `internship`, or `实习` are surfaced by source sync, so some internships may be missed.
- Lever integration targets its global instance, not its EU instance.
- Employment authorization is recorded as source wording, never adjudicated. Company sponsorship history is not used to infer a particular role's eligibility.
- Major matching and location matching are literal keyword comparisons; no school-prestige, gender, demographic or inferred hiring-preference ranking.
- Grad-year comparison is year-based; it cannot resolve month-specific or school-defined class-standing requirements.
- Source status is an observation at retrieval time, not a guarantee the employer is still accepting applications.
- Updated job text resets manually confirmed qualifications to avoid preserving stale judgments.
- The Node service is for local use. Do not expose it publicly without adding authentication, per-user isolation, abuse controls and an appropriate secret management layer.
- No automatic cloud sync, resume PDF parsing, universal job scraping, email sending or mass application submission.

## Open source

MIT licensed. Public source does not grant rights to redistribute third-party job descriptions. Export your own configuration and use fictional cases for issues and contributions. Keep real resumes, private backups, contact details and `.env` out of the repository.

See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md).

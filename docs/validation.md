# Validation record · v0.1

The automated suite uses Node's built-in test runner. Run `npm test`.

Build-session results: all 16 core tests passed. An additional DOM integration walkthrough passed navigation, fictional-profile loading, changed ranking under a research preset, saving a job, saving a resume version, enabling/disabling persistence, experience creation and the import dialog. The optional read-only tool registered and returned results in a simulated DOM context, and rejected invalid input; a real supported WebMCP browser was not available for validation.

Covered behaviors:

- Unknown and unreviewed qualifications do not become confirmed matches.
- Confirmed graduation-year conflicts remain conflicts even with high preference scores.
- Unknown values survive default filters; strict filtering excludes them intentionally.
- Skill token boundaries avoid matching `R` inside unrelated words.
- Preference changes alter ranking while qualification rules stay independent.
- Missing dimensions do not produce a fabricated score.
- Resume output escapes untrusted strings and uses original experience text.
- Configuration, profile and job imports reject malformed structures.
- Company-source requests use fixed provider hosts and handle pagination.
- Model payloads exclude contact fields and reject invented numeric claims and unknown experience IDs.
- HTTP smoke tests verify asset serving, secret-file exclusion and cross-origin API rejection.
- A mock model endpoint exercises the optional AI request/response path.

Limits of these checks:

- Adapter and model tests use controlled fixtures. A separate live Greenhouse smoke check against the explicitly named `simplifyjobsintegrationsandbox` public test board returned three postings, including its non-real application test posting. This confirms that adapter's network path at the time of testing, not real internship coverage. No paid model or live Lever board was verified.
- No live applications have been submitted.
- No accuracy, learning benefit, interview-rate or hiring-result claims are made.
- Human review is required for eligibility, draft facts and print pagination.
- Browser layout, print output and optional WebMCP support depend on runtime/browser availability. Automated logic tests are not a substitute for end-user acceptance testing.

Suggested acceptance walkthrough:

1. Load the fictional profile, see a 2027-only example conflict with its 2028 graduation year.
2. Switch to the research preset and inspect changed ranking.
3. Create a real-profile draft, add a pasted job, and verify unknown fields stay unknown.
4. Export a configuration; verify it contains no personal fields.
5. Select experiences, print to PDF and inspect all text and page count.
6. Save a version, modify the experience, and inspect the previous saved version.
7. Enable local saving, reload, then disable saving and verify the persistent copy is removed.

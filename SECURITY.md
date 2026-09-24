# Security and privacy

Do not post secrets or personal applicant data in public issues. If private vulnerability reporting is enabled on the repository, use it. Otherwise privately contact the repository owner through a verified channel before disclosing sensitive reproduction details.

The current Node server is a local-only, single-user service. Do not expose it on a public interface without building authentication, isolation and usage controls. Keep `.env` private. A configuration export is shareable; a workspace backup is private.

Treat job descriptions, imported JSON and AI output as untrusted. Imported HTML is not executed. AI output must be reviewed; a factuality guard is not a guarantee of truth.

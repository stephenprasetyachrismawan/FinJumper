# AGENTS.md

## Working rules

- This repository is a production-minded Expo web + Firebase finance application.
- Use strict TypeScript.
- Prefer maintainable architecture over shortcuts.
- Keep code modular and feature-based.
- Do not place privileged business logic only on the client.
- Use the modular Firebase SDK only.
- Use Zod for request and form validation where appropriate.
- Write or update tests for meaningful changes.
- Run lint, typecheck, and relevant tests after each major phase.
- Review your own diff before concluding a phase.
- Avoid giant components and duplicated Firebase access logic.
- Keep security strong: user isolation, validation, and auditability are mandatory.
- If a tradeoff is needed, explain it briefly and choose the safer production option.
- Use clear file paths and real implementation code, not pseudo-code.
- Keep UI calm, premium, and easy to use.
## Operational enforcement

- Keep privileged business logic on trusted backends (Cloud Functions or equivalent server-side runtimes), not only in client code.
- Use Zod validation for all external input boundaries (forms, callable/function requests, API payloads); treat it as mandatory.
- Tests that touch auth/data access must assert user isolation boundaries and reject cross-user access.
- After each major phase: run lint, typecheck, and relevant tests, then perform a self-review of the diff before moving on.

# DEVELOPMENT.md

## 1. Working rules

1. Read `README.md`, `PRODUCT.md`, `ARCHITECTURE.md`, `DATA_SECURITY.md`, and `OPERATIONS.md` before making significant changes.
2. Inspect the existing repository before adding a framework, package, service, or abstraction.
3. Keep a single canonical application in this repository.
4. Use a feature branch and a focused pull request for changes after the bootstrap.
5. Update the relevant docs in the same change as product/architecture/security decisions.
6. Never commit secrets, production user data, or generated artifacts that should not be tracked.
7. Do not configure expensive or paid resources without checking current pricing and asking the owner where required.

## 2. Baseline implementation order

The repository is intentionally empty at bootstrap. Do not copy the former multi-repository architecture or restore old implementation details without review.

Suggested order:
1. Decide and document the minimum web framework compatible with Cloudflare Workers, based on current compatibility and testing needs.
2. Create the minimum app skeleton and health route.
3. Add CI for formatting/linting, type checking, unit tests, production build, and migration validation where applicable.
4. Add the Supabase server/client integration with safe environment-variable boundaries.
5. Implement auth/session validation and role-based onboarding.
6. Implement landing-page URL input, normalization, favicon behavior, and login redirect preservation.
7. Implement publisher domain verification.
8. Implement manual workflow setup and persistence.
9. Solve AI-assisted workflow discovery, behind its own tests and feature gate.
10. Add the smallest viable campaign/eligibility/ad-event vertical slice.
11. Add browser E2E and security regression tests before calling onboarding production-ready.

Do not let framework selection consume the project: prefer the simplest well-supported option, commit a lockfile, and build a working vertical slice.

## 3. Environment strategy

Use one Supabase project as explicitly requested. Separate safety through:
- local/test fixtures that do not contain production secrets or data
- test-only identities and data
- deterministic migrations
- explicit production approval for migrations or actions that can delete or irreversibly modify data
- preview builds that cannot accidentally mutate production unless explicitly configured and secured

Do not create extra Supabase projects solely to obtain a development environment. If future risk makes project separation necessary, present the concrete risk/cost tradeoff before changing this decision.

Keep development and production Worker settings explicit. All secrets are supplied through the runtime secret facility, not committed env files. A local `.env.example` may list names and safe placeholder values only.

## 4. Required CI gates

Before merging:
- format/lint passes
- type checks pass
- unit tests pass
- production build succeeds
- changed SQL/migrations pass validation
- RLS/authorization tests pass for affected tables/functions
- E2E tests pass for affected user journeys
- no new secret is introduced into tracked files
- review changes to schema, privileged routines, auth, domain verification, website fetching, campaign activation, and ad-event endpoints as security-sensitive.

CI should fail loudly if a required stage cannot run; don't silently skip missing credentials or treat no tests as success. Tests requiring secrets must be separated from safe credential-free CI and report their skipped status clearly.

## 5. AI discovery acceptance test suite

Do not mark AI-assisted website workflow discovery complete until tests exist for these cases:

1. **Static SaaS landing page:** extracts product purpose and at least one plausible workflow candidate.
2. **Feature/pricing pages:** combines public feature signals without duplicating all page text into the prompt.
3. **JavaScript-heavy site:** either uses a tested fallback or explains that the site could not be read and presents manual setup.
4. **Blocked/403 page:** returns a bounded, actionable failure—not a fabricated workflow.
5. **Timeout/DNS/TLS error:** terminates within the defined timeout and returns a stable error category.
6. **Redirect chain:** validates every destination and enforces a redirect cap.
7. **Invalid or unsafe URL:** rejects localhost/private/link-local/metadata targets and unsupported schemes.
8. **Oversized or unexpected content type:** stops safely.
9. **Prompt injection in page text:** produces only schema-valid candidate data; page content cannot change tool or system behavior.
10. **Malformed/empty model output:** validation fails safely, and the UI allows manual configuration.
11. **Evidence quality:** each candidate links to or describes a public page/source signal; unsupported claims are not presented as facts.
12. **User review:** no candidate becomes active without explicit user selection and save.
13. **Rate and cost controls:** per-user and per-host limits work.
14. **Observability:** failure stage and category are logged without secrets or unnecessary page contents.

Include a manual test script for several representative websites owned or approved for testing. Record site, date, stages passed/failed, and a short safe summary. Do not store scraped text in test reports.

## 6. Browser E2E minimum flow

1. Anonymous visitor enters a valid website URL.
2. URL validation succeeds and a favicon appears when available.
3. Anonymous visitor is sent to login without losing the URL.
4. Test identity completes login.
5. User lands on onboarding with the submitted URL preserved.
6. User chooses Publisher, Advertiser, or Both.
7. Publisher adds a workflow manually.
8. Publisher completes the DNS verification challenge; unverified users cannot perform verified-domain actions.
9. User saves setup and reaches the dashboard.
10. Reload shows persisted, owner-scoped state.
11. A second user cannot view or change the first user's domain/workflows.
12. AI discovery failure still leaves a usable manual path.

Add happy-path, expiry, unauthorized, duplicate, and server-error cases. Do not log tokens, cookies, or full auth headers. Use test accounts that contain no real personal data.

## 7. Migration process

- Store every schema change in a versioned migration file in the repository.
- Use explicit names and stable ordering.
- Do not make untracked dashboard-only changes.
- Review RLS, grants, views, and database functions as part of each migration.
- Test both a clean database apply and the intended upgrade path.
- Run Supabase advisors and database security tests after relevant changes.
- Do not store access tokens or use generated row identifiers hard-coded across environments.
- Before destructive production migrations, back up where supported and obtain explicit approval.

## 8. Pull request contents

Each PR should describe:
- user-visible behavior and why it changes
- scope and non-goals
- security/data impact
- database migration impact
- tests run and exact outcome
- configuration/secrets needed (names only)
- rollback strategy when production state changes

## 9. Definition of done

A feature is not done because code compiles. It is done when:
- intended behavior is implemented,
- relevant tests pass,
- authorization and failure cases are covered,
- logs do not reveal secrets,
- documentation is current,
- production deployment impact is understood,
- acceptance criteria can be reproduced.

# DEVELOPMENT.md

## 1. Phase 01 and implementation gate

Phase 01 is documentation only. Review and approve all six foundation documents before creating application code. Do not select a framework, create the app skeleton, connect deployments, add migrations, or start Step 02 as part of the specification review.

After approval, implement in dependency order. Browser automation and CI must be established early, not postponed until the app is almost finished.

## 2. Working rules

1. Read README.md, PRODUCT.md, ARCHITECTURE.md, DATA_SECURITY.md, and OPERATIONS.md before significant implementation.
2. Inspect repository state before adding packages or services.
3. Keep one canonical application in this repository.
4. Use focused branches/PRs for normal feature work after initial bootstrap.
5. Update the affected docs in the same change as a product/architecture/security decision.
6. Never commit secrets, production user data, provider credentials, or generated artifacts that should not be tracked.
7. Check current pricing/limits before enabling billable services; obtain owner agreement where required.
8. A test that could not run must be reported as not run/blocked, not silently counted as passing.

## 3. Implementation sequence after specification approval

### P0 — Foundation
1. Select one simple framework compatible with Cloudflare Workers and compatible with server-side Supabase Auth.
2. Create the minimum application root, safe environment configuration, a health route, and a committed lockfile.
3. Establish Playwright browser automation and GitHub Actions CI.
4. Establish unit/integration test structure, formatting/lint, typecheck, build, migration validation, and secret scanning.

### P1 — Onboarding and controls
5. Connect the single hosted Supabase project through safe environment configuration; create the initial migration set and ownership/RLS tests.
6. Configure and test Google/GitHub OAuth using Supabase Auth; implement callback/session and URL-state preservation.
7. Implement URL input, validation feedback, best-effort favicon display, CTA state, and onboarding role choice.
8. Implement workspace invitation/role controls, publisher workflow manual entry, DNS domain verification, and audit events.
9. Implement campaign APIs for draft, review, edit, approve/reject, activate, and pause.

### P2 — Ad-serving product
10. Troubleshoot and implement optional AI-assisted website/workflow discovery with stage-level diagnostics and manual fallback.
11. Implement the event contract, campaign matching, creatives, ad-serving response, impression/click event tracking, deduplication, rate controls, fraud checks, and explicit policy enforcement.

### P3 — Financial path
12. Implement a transaction ledger, reconciliation, pricing/attribution semantics, and only later payment-provider/payout integration.

### Release
13. Run end-to-end regression, security review, deployment smoke tests, and rollback verification before a production release.

## 4. Framework and structure

The exact framework is selected in Step 02 after a small compatibility comparison; this document deliberately does not preselect a framework. Keep one application root and these logical areas:
- app/routes and server handlers
- feature modules for auth, onboarding, publisher, advertiser, campaigns, and ad events
- server-only Supabase, authorization, validation, URL fetch/discovery, and audit modules
- shared workflow/event schemas and validators
- unit, integration, security, and E2E tests
- supabase/migrations
- .github/workflows
- six root documentation files

Do not create extra app repos, a monorepo, or a separate backend unless the owner approves a concrete need.

## 5. CI quality gates

For the applicable changes, the required gates are:
- format/lint
- type check
- unit tests
- integration/database and RLS tests
- production build
- migration validation
- Playwright E2E for affected critical journeys
- secret detection
- security review for auth, RLS, privileged functions, domain verification, URL fetching, campaign state, ad events, and financial mutations

CI must make skipped/blocked tests visible. A missing secret or unavailable provider may justify using a deterministic test double for the regular PR suite, but it must not be represented as a successful live-provider integration test. Maintain a clear separate status for tests that require real provider credentials.

## 6. Browser E2E acceptance: landing, login, and onboarding

Automated browser tests must cover:

1. Landing page renders a URL field and no marketing email-capture form.
2. Malformed URL displays validation feedback and does not start OAuth.
3. A hostname without a scheme is normalized to HTTPS and validated.
4. A well-formed URL shows a favicon when available; favicon failure does not make the URL invalid.
5. Site blocked/unreachable is distinguished from malformed URL and the manual path remains available.
6. An unauthenticated visitor submits a valid URL and sees Google and GitHub login options.
7. OAuth start is requested for the selected provider and uses an approved internal callback.
8. Callback success returns the user to onboarding with the original normalized URL preserved.
9. Callback errors, provider cancellation, and expired state show a recoverable error without an open redirect or lost onboarding intent.
10. The first onboarding role choice is Publisher, Advertiser, or Both and appears before “Your product setup”.
11. Advertiser-only onboarding does not silently create or verify a publisher domain.
12. After completing onboarding, a signed-in user's primary landing CTA says “Go to dashboard”.
13. Refresh/back navigation does not lose onboarding state or create duplicate records.

Use a controlled auth/session fixture in deterministic CI tests. Do not rely on automated navigation through third-party Google/GitHub pages for every PR, since that introduces provider-side interactivity and rate/automation variability. Separately maintain a real Google and real GitHub OAuth smoke test for the configured non-production/preview flow using dedicated test identities. Clearly report when the smoke test was last run and its outcome.

## 7. Publisher and workspace E2E acceptance

- Publisher can manually add, edit, save, and reload a workflow represented by object/action/output.
- AI discovery is an explicit optional action; it never auto-saves a result.
- Publisher can request a DNS TXT challenge and see clear setup guidance.
- A wrong, expired, reused, or different-host TXT challenge cannot verify the domain.
- Pending verification allows draft editing but blocks live publisher activation.
- An invited workspace member cannot accept an invite intended for a different identity.
- Expired/revoked invites cannot be accepted.
- Members cannot elevate themselves to admin or grant platform-admin privileges.
- A second test user cannot read or modify the first user's workspace, domains, workflows, or campaigns.

## 8. AI website/workflow discovery acceptance

Do not describe AI discovery as production-ready until these cases pass:

1. **Useful static public site:** suggestions are consistent with the visible product description and include object, action/event, and output/result.
2. **Feature/product pages:** relevant public signals can contribute when accessible; avoid copying entire pages unnecessarily.
3. **Blocked/403 or no useful content:** return an honest no-result/failure state and manual setup, not an invented workflow.
4. **JavaScript-heavy page:** either a tested supported fallback succeeds, or the system clearly explains the limitation and offers manual setup. Never promise that every site is readable.
5. **Timeout/DNS/TLS errors:** bounded termination and stable diagnostic category.
6. **Redirect chain:** each destination is revalidated and the redirect limit is enforced.
7. **Unsafe URL:** loopback/private/link-local/metadata destinations and unsupported schemes are rejected.
8. **Oversized/unexpected response:** fetching stops safely.
9. **Prompt injection:** page content cannot override app/model policy or cause unsafe actions.
10. **Malformed/empty model output:** rejected by schema validation; manual workflow remains available.
11. **Evidence quality:** do not describe a suggestion as fact when no accessible page/source supports it.
12. **Human confirmation:** no AI candidate becomes active until the user edits/selects/saves it.
13. **Privacy:** actual user object/document contents are not fetched, logged, or sent for ad context.
14. **Rate/cost controls:** per-account/hostname limits and request/token bounds are enforced.
15. **Observability:** safe failure stage and category can be distinguished without logging secrets or full website bodies.

Use deterministic HTML/model fixtures for fast unit tests. Run a separate controlled integration test against representative public sites and the actual AI provider before enabling the feature in production. If the live integration test has not run, report it as unverified—not passed.

## 9. Ad event and campaign tests

- Campaign draft/edit/review/approval/activation/pause permissions are enforced server-side.
- Unapproved, paused, or ineligible campaigns cannot serve.
- Only verified publishers can activate live placement.
- Workflow matching uses the declared event metadata, not object contents.
- Explicitly configured exclusions are enforced; a label alone does not trigger hidden content inspection.
- Impression/click duplicates, replay, rate abuse, and invalid event payloads are handled.
- Audit records capture privileged changes without tokens or sensitive content.

## 10. Database migrations and test environment

- Store all schema changes as ordered migration files in the repository.
- Do not make untracked dashboard-only schema changes.
- Test clean application and intended upgrade paths.
- Review grants, RLS, views, functions, and default execute permissions in every relevant migration.
- Run Supabase advisors after relevant schema/function/security changes.
- Default CI must use local/ephemeral test infrastructure, test doubles, or safe fixtures and must not mutate real production user data.
- Only one hosted Supabase project is permitted by this specification. Do not create a second hosted project for convenience. If a hosted end-to-end smoke test is required, use a dedicated test identity/data set, restrict it to safe operations, and clean up deliberately.
- Require explicit owner approval before destructive operations against the hosted project.

## 11. Pull request and definition of done

Each PR states behavior, scope/non-goals, security/data impact, migration impact, test outcomes, required secret names (not values), and rollback implications.

A feature is done only when intended behavior is reproducible, relevant tests pass, authorization/failure cases are covered, logs avoid secrets, documentation is current, and deployment impact is understood.

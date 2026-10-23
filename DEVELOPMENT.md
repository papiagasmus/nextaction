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

## 3. Step-by-step execution order after specification approval

Follow this sequence as the execution order. P0–P3 labels in the next section describe work priority/scope only; they do not override this sequence.

1. **Step 02 — Minimal app foundation:** select one framework compatible with Cloudflare Workers and server-side Supabase Auth; create the minimum application root, safe environment configuration, health route, and committed lockfile.
2. **Step 03 — Browser E2E and CI:** establish Playwright and GitHub Actions early, plus format/lint, typecheck, unit tests, build, migration validation, and secret detection.
3. **Step 04 — One Supabase project:** connect the hosted project through safe environment configuration; create initial versioned migrations and ownership/RLS tests. CI must use local/ephemeral test infrastructure or safe fixtures by default.
4. **Step 05 — Login and URL onboarding:** configure Google/GitHub OAuth through Supabase Auth; implement callback/session handling, URL-state preservation, favicon fallback, role choice, and the dashboard CTA behavior.
5. **Step 06 — Publisher onboarding and ownership:** implement workspace invitations/role controls, manual workflow setup, DNS domain verification, permission checks, and audit events.
6. **Step 07 — AI website/workflow discovery:** diagnose each stage of public website reading, add structured AI suggestions and evidence where feasible, and preserve manual fallback. This is intentionally tested before campaign APIs are built.
7. **Step 08 — Campaign management API:** implement campaign draft, review, edit, approval/rejection, activation, and pause.
8. **Step 09 — Ad path and publisher integration:** define and implement the Publisher SDK/beacon/API request/response contract and scoped integration credential, then add workflow matching, creatives, serving responses, event tracking, deduplication, rate controls, fraud checks, and explicit policy enforcement.
9. **Step 10 — Production deployment and verification:** deploy the approved main commit to the canonical Cloudflare Worker only after CI is green; run E2E, security checks, production smoke tests, and rollback verification.
10. **Step 11 — Ledger, payments, and payout:** after ad events and campaign behavior are reliable, implement transaction ledger, reconciliation, pricing/attribution semantics, and only then payment-provider/payout integration.

## Priority labels (grouping only; not a separate execution sequence)

- **P0 — Foundation:** specification, minimal application, browser E2E, and CI.
- **P1 — Onboarding and controls:** Supabase connection, login, URL/role onboarding, workspace permissions, publisher domain verification, and campaign management API.
- **P2 — Ad product:** AI workflow discovery, matching, creative, tracking, publisher integration, and fraud controls.
- **P3 — Finance:** ledger, payment, and payout.

The ordered steps above are authoritative for execution even when a capability's priority label groups it with a different workstream.
 
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
8. Callback success returns to onboarding with the original normalized URL preserved when a pending URL intent exists, including for a returning user.
9. When no pending URL intent exists, a new user enters onboarding and a returning user who completed onboarding goes to the dashboard.
10. Callback errors, provider cancellation, and expired state show a recoverable error without an open redirect or lost onboarding intent.
11. The first onboarding role choice is Publisher, Advertiser, or Both and appears before “Your product setup”.
12. Advertiser-only onboarding does not silently create or verify a publisher domain.
13. After completing onboarding, a signed-in user's primary landing CTA says “Go to dashboard”.
14. Refresh/back navigation does not lose onboarding state or create duplicate records.

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

## 10. Ad event and integration security tests

- A verified publisher can use only its own integration credential/workflow identifiers.
- Revoked credentials stop working; rotation does not accidentally grant another publisher access.
- A public/browser-visible key is not accepted as proof of a privileged server-side action.
- Unverified domains cannot activate live publisher integration.
- Invalid payloads, workflow IDs, event types, and oversized requests are rejected.
- Event replay, duplicate impressions/clicks, rate abuse, and cross-publisher spoofing are covered.
- The event flow sends only declared workflow metadata—not invoice/document/object contents.

## 11. Database migrations and test environment

- Store all schema changes as ordered migration files in the repository.
- Do not make untracked dashboard-only schema changes.
- Test clean application and intended upgrade paths.
- Review grants, RLS, views, functions, and default execute permissions in every relevant migration.
- Run Supabase advisors after relevant schema/function/security changes.
- Default CI must use local/ephemeral test infrastructure, test doubles, or safe fixtures and must not mutate real production user data.
- Only one hosted Supabase project is permitted by this specification. Do not create a second hosted project for convenience. If a hosted end-to-end smoke test is required, use a dedicated test identity/data set, restrict it to safe operations, and clean up deliberately.
- Require explicit owner approval before destructive operations against the hosted project.

## 12. Pull request and definition of done

Each PR states behavior, scope/non-goals, security/data impact, migration impact, test outcomes, required secret names (not values), and rollback implications.

A feature is done only when intended behavior is reproducible, relevant tests pass, authorization/failure cases are covered, logs avoid secrets, documentation is current, and deployment impact is understood.

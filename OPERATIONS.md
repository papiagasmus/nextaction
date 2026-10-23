# OPERATIONS.md

## 1. Verified platform inventory — 2026-10-23

This section records what was observed through the connected platform APIs. It is not a claim that every product, setting, secret, billing control, or permission has been audited.

### GitHub
- Repository: papiagasmus/nextaction
- Default branch: main
- Access: authenticated GitHub connector reported admin/maintain/push/pull/triage permissions.
- Contents at this check: six foundation documents plus the initial React/Vite/Hono Worker scaffold, lockfile, health endpoint, one Node unit test, and a GitHub Actions build/smoke-check workflow. Product routes, Supabase integration, application migrations, Playwright E2E, and deployment are not yet present.
- The repository is the only canonical application repository.

### Supabase
- Project name: nextaction
- Project ref: zrtosqxesdvcijatsito
- Region: us-west-2
- Status: ACTIVE_HEALTHY
- Project API URL: https://zrtosqxesdvcijatsito.supabase.co
- Public application tables: none found.
- Application migration records: none found.
- Edge Functions: none found.
- Security and performance advisors: no lint results returned during the initial inspection.
- Publishable keys exist. Keys are not substitutes for RLS or authorization.
- Google/GitHub provider credential state and redirect configuration have not been fully verified through this inventory and remain an implementation/setup checklist item.

### Cloudflare
- Account name: Nextaction.dev@gmail.com's Account
- Account ID: fcda7c36aebd76d5a8cf7f1a009795b6
- Workers scripts: none returned.
- Pages projects: none returned.
- KV namespaces: none returned.
- D1 databases: none returned.
- Workers Builds tokens: none returned.
- A workers.dev subdomain was not initialized during the check.
- R2 could not be checked: Cloudflare returned an API 403 indicating that R2 must be enabled/handled in the dashboard. Do not interpret this as proof that R2 contains no resources.
- These checks did not exhaustively audit zones, DNS records, all account/user API tokens, secret stores, billing settings, or every Cloudflare product.

## 2. Decisions and operating constraints

- Keep one canonical GitHub repository: papiagasmus/nextaction.
- Use one hosted Supabase project: zrtosqxesdvcijatsito.
- Use Cloudflare Workers for the production app runtime.
- Keep the platform within free-tier limits where practical, but verify current quotas and possible charges before activating services.
- Do not add a second hosted Supabase project, an extra backend, or other infrastructure without an explicit owner decision.
- Do not store secret values in Git. Document variable names only.

## 3. Configuration checklist before implementation and preview

- [x] Owner reviewed and approved all six foundation documents.
- [x] Selected React + Vite + TypeScript UI and Hono API on the Cloudflare Vite plugin; committed the dependency lockfile.
- [x] Added the minimum UI shell, Worker health route, environment placeholders, unit smoke test, and GitHub Actions build/smoke-check workflow. Verify the latest CI run before declaring this step build-verified.
- [ ] In Step 03, add Playwright browser tests and extend CI for critical browser journeys.
- [ ] Configure the two Supabase Auth providers: Google and GitHub.
- [ ] Create provider OAuth applications and configure the callback URL shown by Supabase in each provider console.
- [ ] Configure Supabase Auth Site URL and allowed application redirect URLs for the intended local and deployed app routes. Use exact, controlled routes and test URL preservation.
- [ ] Keep provider client secrets in provider/Supabase configuration, not in Git or browser variables.
- [ ] In Step 04, add Supabase client integration and initial versioned migrations; test a clean database apply.
- [ ] Set Cloudflare Worker runtime variables/secrets through the appropriate secure configuration only when required.
- [ ] Connect the main branch to a production Worker only after CI and basic smoke tests pass.
- [ ] Decide whether a workers.dev subdomain is needed; opening Workers & Pages in the dashboard may initialize one.
- [ ] Inspect/enable R2 only if a demonstrated application requirement needs object storage.
- [ ] Verify current free-tier quotas/pricing for every chosen service before enabling it.

## 4. OAuth setup and smoke-test checklist

The required login methods are Google and GitHub via Supabase Auth.

- Register the provider OAuth app and configure the callback URL given by the Supabase Auth provider settings.
- Add the app's own callback route to Supabase's allowed redirect URLs.
- Use the supported PKCE/session flow for the selected application framework.
- Test provider cancellation, callback error, stale state, and URL intent preservation.
- Test both provider buttons and verify that each starts the correct OAuth provider.
- Use deterministic mocked/controlled session tests for each pull request, and separately run an actual OAuth smoke test with dedicated test identities against the configured preview flow.
- Document the timestamp and outcome of the last real provider smoke tests. A mocked test is not evidence that provider credentials/callbacks are configured correctly.

Official references:
- Google OAuth: https://supabase.com/docs/guides/auth/social-login/auth-google
- GitHub OAuth: https://supabase.com/docs/guides/auth/social-login/auth-github
- Supabase redirect URLs: https://supabase.com/docs/guides/auth/redirect-urls
- Cloudflare full-stack Workers apps: https://developers.cloudflare.com/workers/static-assets/routing/full-stack-application/

## 5. Deployment policy

- The canonical production app is deployed to Cloudflare Workers from the approved main branch.
- Require passing CI gates before production deploy.
- Identify every deployment by its source commit SHA.
- Keep previews isolated from production credentials and real user data by default.
- Do not deploy from obsolete spike repositories or personal branches.
- Verify the actual deployment URL, health route, auth callback, and critical user flows after a deploy.
- Roll back to a known-good commit/release when a change breaks critical flows, after confirming the rollback is safe for the database schema.

## 6. Monitoring and troubleshooting

Capture the deployment commit, UTC time, affected route, broad symptom, request/correlation ID if available, and non-sensitive error category.

For workflow discovery, distinguish:
- URL validation failed
- unsafe destination/SSRF policy rejected
- public site fetch failed/blocked
- response type or size rejected
- no useful visible text extracted
- AI provider error
- structured output invalid
- result failed to render
- user cancelled or did not save suggestions

Do not log secrets, OAuth codes/state, access/refresh tokens, cookies, full Authorization headers, entire fetched website bodies, or private object/document contents.

## 7. Incident handling

1. Identify the affected route, release commit, and recent change.
2. Contain impact; if AI discovery is failing, disable that optional path while leaving manual workflow setup available.
3. Roll back the Worker release when appropriate and safe.
4. Rotate exposed credentials; deleting a source line is not enough.
5. For authorization/data-integrity concerns, disable the affected mutation path and review safe logs/audit records.
6. Re-run the exact failed flow and relevant security regression tests.
7. Add a regression test and record a short incident summary.

## 8. Backups and recovery

- Supabase is the authoritative store for persisted application data.
- Verify which backup/restore facilities are included and enabled under the actual plan; do not assume they are active.
- Make schema recovery reproducible through versioned migrations.
- Test export/restore procedures before critical production data exists.
- Never run destructive reset operations against the only hosted project without a verified recovery plan and explicit owner approval.

## 9. Cost guardrails

- Prefer free-tier-compatible services and minimal infrastructure.
- Check current limits and pricing before enabling extra Cloudflare products, hosted Supabase branches, queues, AI APIs, browser rendering, or longer log retention.
- Set request-size/time/rate/token limits to cap abuse and AI cost.
- Avoid repeated automatic AI retries; discovery is an explicit user action and must be bounded.
- Revisit architecture only when measured traffic, reliability, or product requirements justify it.

## 10. Production readiness checklist

- [ ] CI and browser E2E are green and skipped tests are visible.
- [ ] Google and GitHub OAuth real smoke tests pass in the intended deployed environment.
- [ ] Auth/session, URL-state preservation, and cross-user/workspace authorization tests pass.
- [ ] Publisher domain verification cannot be bypassed.
- [ ] AI discovery failure leaves the manual path usable.
- [ ] Publisher SDK/beacon/API integration enforces scoped, revocable credentials and verified-domain ownership.
- [ ] Ad matching works on declared workflow metadata without reading object contents.
- [ ] Campaign states and roles are enforced server-side.
- [ ] Impression/click endpoints have replay and rate controls.
- [ ] Secrets are configured outside Git and logs.
- [ ] Deployment and rollback have been tested.
- [ ] Support and incident logging avoids unnecessary personal data.

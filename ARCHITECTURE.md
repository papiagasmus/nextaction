# ARCHITECTURE.md

## 1. Locked architecture

Use the smallest architecture that can support the secure MVP.

- **GitHub:** single source of truth for application code, documentation, migrations, tests, and change history.
- **Cloudflare Workers:** the primary production runtime for the web application and server-side HTTP routes.
- **Supabase:** one hosted project for Postgres and Auth.
- **Google and GitHub OAuth:** both provided through Supabase Auth.
- **AI provider:** called only from server-side code for an explicit workflow-discovery request.
- **Browser:** UI only; never holds server secrets or decides authorization.

The exact full-stack framework is intentionally deferred to Phase 02. The choice must be Cloudflare Workers-compatible, actively supported, and simple to test. Do not start implementing a framework or application in Phase 01.

Do not add a second backend, a second hosted Supabase project, a long-lived spike repository, or extra Cloudflare data services without a concrete need, documented trade-off, and owner approval.

## 2. Canonical repository and intended structure

The canonical repository is papiagasmus/nextaction; its default branch is main. Production code must ultimately deploy from this repository, not from an abandoned spike repository.

Use one application root and clear logical boundaries. The framework-specific names will be finalized in Phase 02, but the repository should contain these responsibilities:

- Application entry/routes: pages and server-side request handlers.
- Feature modules: auth, onboarding, publisher, advertiser, campaigns, ad serving/events.
- Server-only modules: Supabase integration, URL fetching/workflow discovery, authorization, validation, rate limiting, and audit handling.
- Shared schemas/types: workflow/event contracts and input/output validation.
- Public assets: static assets including branding and fallback favicon UI.
- Tests: unit, integration/database, security regression, and browser E2E.
- supabase/migrations: versioned SQL migration files.
- .github/workflows: CI and later deployment workflows.
- Root documents: README.md, PRODUCT.md, ARCHITECTURE.md, DATA_SECURITY.md, DEVELOPMENT.md, OPERATIONS.md.

Do not create a monorepo or additional application package without a need. Avoid putting privileged server code in client-importable modules.

## 3. Current Supabase project

Use one hosted Supabase project:
- Name: nextaction
- Ref: zrtosqxesdvcijatsito
- Region reported on 2026-10-23: us-west-2
- Project URL reported on 2026-10-23: https://zrtosqxesdvcijatsito.supabase.co

It owns application Postgres data, Supabase Auth identities, schema constraints, RLS policies, and SQL functions. All application schema changes are version-controlled migrations; do not rely on undocumented dashboard-only modifications.

One hosted project is a product/operating constraint, not permission to test destructive operations on live data. Use deterministic fixtures, test identities, local or mocked tests, and explicit confirmation for destructive changes. Do not create a second hosted Supabase project just for convenience.

Supabase Edge Functions are not the default application runtime. Add one only when a clearly justified Supabase-native capability requires it and document the decision first.

## 4. Authentication and session flow

Required providers are Google and GitHub OAuth through Supabase Auth. Official implementation references:
- Google provider: https://supabase.com/docs/guides/auth/social-login/auth-google
- GitHub provider: https://supabase.com/docs/guides/auth/social-login/auth-github
- Redirect URL allow-list: https://supabase.com/docs/guides/auth/redirect-urls
- Supabase server-side auth package guidance: https://supabase.com/docs/guides/auth/server-side

Use a single session model appropriate for the selected framework, with the OAuth PKCE flow where the server-side auth model requires it. If the framework uses server-rendered pages/cookies, implement secure session cookies and correct cache behavior. If authentication is passed per request as a bearer token, validate that token server-side. Do not mix localStorage, cookies, and duplicated custom sessions without an explicit design.

Provider callback URLs and allowed post-login redirects must be configured explicitly. The post-login destination must be an internal allow-listed route; an arbitrary user-supplied website URL is data to preserve as onboarding intent, not a redirect target. Test cookie/code-verifier propagation if the chosen PKCE flow uses it. Never trust decoded-but-unverified claims for authorization; validate the session/user server-side.

## 5. Landing URL and onboarding request flow

1. Landing page accepts a SaaS website URL.
2. Validate scheme and syntax; normalize hostname; reject disallowed destination classes before any server-side fetch.
3. Show favicon on a best-effort basis. A favicon failure must not invalidate an otherwise well-formed URL.
4. A well-formed URL, public reachability, successful text extraction, and verified ownership are distinct states.
5. If unauthenticated, begin Google/GitHub OAuth and preserve the validated URL as onboarding intent. Use a safe internal callback and prevent open redirects.
6. After callback, exchange the OAuth code/session using the selected auth model. If a pending URL intent exists, resume onboarding with that URL prefilled—even for a returning user; that explicit connect action takes precedence over the default dashboard destination.
7. If there is no pending URL intent, send new users to onboarding and returning users with completed onboarding to the dashboard.
8. Ask Publisher, Advertiser, or Both before the role-specific product setup.
9. Once onboarding is complete, the primary landing CTA for an authenticated user says “Go to dashboard”. Additional websites are added from the dashboard.

If the site blocks automated fetching, manual setup remains available. The app must not require a successful AI scrape merely to authenticate or start onboarding.

## 6. Publisher workflow flow

### Manual workflow setup
Manual entry is the reliable baseline and must not depend on an AI provider. The schema represents:
- object: the kind of item/task being acted on
- action/event: the operation or event that occurred
- output/result: the resulting state or useful outcome

Persist only the declared workflow metadata and the minimum identifiers needed for later matching.

### Optional AI-assisted discovery
1. User explicitly asks for suggestions.
2. Server validates the public URL and checks the destination/redirects for SSRF risks.
3. Bounded fetch retrieves accessible public pages.
4. Extract useful visible public text/product signals.
5. Ask the AI provider for schema-constrained candidate workflows.
6. Validate shape, lengths, allowed values, and supporting source/evidence where available.
7. Return candidates for user review/edit.
8. Persist/enable only candidates the user explicitly selects and saves.

Keep each stage independently observable. A failed fetch, empty extraction, provider error, malformed model output, and UI render error must produce distinguishable internal categories. The AI may return no candidate if evidence is insufficient; do not fabricate success.

Do not inspect authenticated pages or the end user's actual document/object contents. The website reader is for public product/marketing information, not private workspaces.

## 7. Domain ownership and publisher activation

Publisher-domain ownership requires server-verified DNS TXT proof. A URL check, favicon, provider login, or workflow draft does not prove ownership.

A challenge must be random, bound to authenticated owner and normalized hostname, time-limited, one-time-use, and checked server-side. Publisher may save draft configuration while unverified; live placement/integration activation requires verified ownership. Verification state and owner changes must be enforced in every write/serve path.

## 8. Workspace and platform permissions

Keep separate fields/concepts for:
- Product modes: Publisher, Advertiser, Both.
- Workspace membership/permission: owner, admin, member.
- Platform administrator privilege: explicit elevated grant outside ordinary product role selection.

Workspace invites are bound to a recipient and workspace, expire, can be revoked before acceptance, and are accepted only by the intended authenticated identity. Role grants/revocations and privileged platform actions create audit records. The browser never supplies the final authority for identity, tenant, owner, or role.

## 9. Request/data flow

A standard request:
1. Browser calls a Cloudflare Worker route.
2. Worker validates input, session, resource permission, and rate limits.
3. Worker uses the least-privileged Supabase access path.
4. Database constraints and RLS enforce ownership and invariants.
5. Worker returns only the minimal client response.
6. Security-relevant mutations append an audit record.

Avoid server-role/service-role access for ordinary user flows. Where a trusted server operation genuinely needs elevated access, isolate it behind explicit authorization and narrow validated inputs.

## 10. Ad event context

NextAction matches declared workflow metadata; it does not need to receive or inspect the underlying document, invoice, form, message, or other object contents.

The event payload should contain the minimum needed to identify the publisher/workflow and event context. Do not send private object contents or personal data to advertisers. Do not create an automatic suppression rule solely from an object's label. Enforce any explicit workflow/publisher/platform exclusion that applies, without reading private content. This boundary must be part of the event schema and tests.

Campaign state changes and ad serving must check authorization, campaign approval/activation, publisher verification, workflow eligibility, policy restrictions, and rate/fraud controls on the server.

## 11. Publisher SDK/beacon and event contract

The planned event path needs a small Publisher SDK or beacon/API endpoint so an integrated SaaS can send a declared workflow event and receive an eligible-ad response. Step 09 defines the concrete request/response schema and integration package.

The event contract must:
- Identify the verified publisher, declared workflow, and event type.
- Carry only the minimum object/action/output metadata needed for matching.
- Never require or accept the underlying end-user document/object contents for ad targeting.
- Use a publisher-scoped, revocable integration credential or key model and enforce rate limits.
- Never treat a browser-visible identifier as a secret or authorization proof.
- Validate the publisher's verification state and workflow eligibility on the server.
- Handle malformed requests, replay, duplicate impressions/clicks, and invalid campaign state safely.

## 12. Initial infrastructure footprint

Initial intended footprint:
- one GitHub repository
- one full-stack application on Cloudflare Workers
- one hosted Supabase project
- CI and browser tests in GitHub Actions
- no required KV, D1, R2, queue, Durable Object, extra hosted database, or Supabase Edge Function

Use a synchronous design for the first vertical slice. Add services only when measured traffic or correctness needs justify them and the current cost/limits have been checked.

## 13. Framework and deployment selection

Phase 02 must choose one Workers-compatible framework and record the choice in the repository. Compare only a small shortlist on:
- Cloudflare-supported deployment/adapter path
- compatibility with OAuth and server-side Supabase Auth
- ease of local development and Playwright testing
- TypeScript support and build simplicity
- free-tier practicality and operational complexity

Cloudflare's current full-stack framework guide: https://developers.cloudflare.com/workers/static-assets/routing/full-stack-application/

Do not begin application implementation until Phase 01's six documents are approved.

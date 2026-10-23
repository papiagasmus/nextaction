# NextAction

NextAction is an event-triggered advertising network for micro-SaaS products, indie hackers, and solo founders. A publisher defines workflow events in its SaaS product; NextAction can match an eligible campaign to that declared context and return an ad.

The initial target market is the United States and global SaaS builders. Product-facing copy is English.

## Locked product and architecture decisions

- **One canonical code repository:** this repository, papiagasmus/nextaction. No separate long-lived spike repo or second backend by default.
- **One hosted Supabase project:** the project named nextaction, ref zrtosqxesdvcijatsito. Use Postgres and Supabase Auth; do not create another hosted Supabase project without an explicit decision.
- **Production runtime:** Cloudflare Workers. Keep the web app and its server-side routes in one application where practical. Supabase Edge Functions are not the default application backend.
- **Login providers:** Google and GitHub OAuth through Supabase Auth. The landing page is not an email-capture form.
- **Landing URL flow:** an unauthenticated user submits a SaaS URL, the URL is validated and its favicon is shown when available, and the URL intent is preserved through login. After OAuth callback, onboarding opens with the URL retained. Once signed in, the primary landing CTA says “Go to dashboard”.
- **Onboarding roles:** the user chooses Publisher, Advertiser, or Both before the role-specific product setup.
- **Publisher workflows:** manual entry is the dependable baseline. AI-assisted discovery is optional, explicitly requested, reviewable, and never silently activates a workflow.
- **Publisher integration:** the planned ad path includes a small SDK/beacon/API contract and a publisher-scoped, revocable integration credential; it must send workflow metadata, not the user's underlying object contents.
- **Workflow context:** represent the object, action/event, and output/result. Do not inspect or collect the end user's actual document or object contents to create ad context.
- **Ownership:** a URL that parses or has a favicon is not proof of domain ownership. Publisher domain ownership requires a server-verified DNS TXT challenge before live publisher serving is enabled.
- **Security and roles:** distinguish product modes (Publisher/Advertiser/Both) from workspace permissions (owner/admin/member) and any platform-admin grant. Sensitive grants and state changes are audited.
- **Keep infrastructure small:** no extra database, queue, KV, D1, Durable Object, or hosted Supabase project unless a measured requirement justifies it and cost is reviewed.
- **Pricing:** USD $1 CPC and a 75% publisher / 25% NextAction split is a working business assumption, not yet an implemented billing contract. Do not implement payouts before the event and ledger rules are settled.

## Required onboarding behavior

1. A visitor enters a website URL in the landing-page URL field. No marketing email capture is required.
2. The app validates and normalizes the URL, distinguishes a malformed URL from a site that cannot be reached, and tries to show a favicon.
3. If the visitor is not authenticated, route to login with Google and GitHub options while preserving the URL as onboarding state.
4. On successful OAuth callback, if a URL intent is pending, resume onboarding with the URL prefilled—even for a returning user. Without a pending URL intent, new users enter onboarding and users who have completed onboarding go to the dashboard.
5. Ask the user to choose Publisher, Advertiser, or Both before “Your product setup”.
6. Publisher/Both can configure workflows manually or explicitly request AI suggestions, then verify domain ownership via DNS.
7. A URL, favicon, or saved draft does not imply verified ownership. Live publisher activation requires verification.
8. When already signed in, the primary landing CTA is “Go to dashboard”. Additional sites are connected from the dashboard rather than accidentally restarting completed onboarding.

If a submitted URL is well-formed but the site blocks automated reading, the user can continue manually. AI discovery failure must not block onboarding.

## Documents

- [PRODUCT.md](./PRODUCT.md) — user journeys, workflow semantics, role behavior, and MVP boundaries.
- [ARCHITECTURE.md](./ARCHITECTURE.md) — system boundaries, request flows, and the intended repository structure.
- [DATA_SECURITY.md](./DATA_SECURITY.md) — OAuth, authorization, RLS, URL fetching, and data-minimization rules.
- [DEVELOPMENT.md](./DEVELOPMENT.md) — implementation sequence, CI, and acceptance tests.
- [OPERATIONS.md](./OPERATIONS.md) — current platform inventory, configuration checklist, deployment, and recovery.

## Current status — 2026-10-23

This is a **documentation-only foundation**; application code, migrations for application tables, CI workflows, and E2E tests have not yet been created.

- GitHub: papiagasmus/nextaction, default branch main; six foundation documents have been committed.
- Supabase: project nextaction, ref zrtosqxesdvcijatsito, active. No public application tables, application migration records, or Edge Functions were found in the initial inspection.
- Cloudflare: the API checks found no Workers scripts, Pages projects, KV namespaces, D1 databases, or Workers Builds tokens. The workers.dev subdomain was not initialized. R2 could not be checked because the API returned a dashboard/enablement error; do not assume R2 is empty.
- These are point-in-time checks, not a full audit of every Cloudflare product, DNS record, secret, account permission, or billing setting.

## Change control

These decisions are the Phase 01 specification baseline. Change them deliberately in a reviewed documentation/code change. Do not move to application implementation until the owner has reviewed and approved the six-document specification.

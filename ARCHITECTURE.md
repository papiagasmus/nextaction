# ARCHITECTURE.md

## 1. Architectural decision

Use the smallest architecture that supports a secure first release.

- **GitHub:** source code, pull requests, CI, migration files, and project documentation.
- **Cloudflare Workers:** primary application runtime, HTTP endpoints, and production deployment target.
- **Supabase:** one managed Postgres/Auth project for application persistence and identity.
- **External AI/provider APIs:** used only through server-side code and only for a defined feature.
- **Browser:** presents the product and calls authenticated APIs; it must never receive server secrets.

Do not introduce a second backend runtime or a second Supabase project merely to preserve historical experiments. Any change to this decision must explain the concrete need and ongoing cost.

## 2. Repository and deployment

The canonical application repository is `papiagasmus/nextaction`. It is the source of truth for the production app and its tests. Use feature branches and pull requests; the default branch is `main`.

Production must deploy from the canonical repository to the canonical Cloudflare Worker. Preview builds may be enabled later, but must not create unmanaged projects, hidden sources of truth, or extra billable resources. Avoid separate long-lived spike repositories unless a time-limited experiment genuinely cannot live behind a branch.

Infrastructure configuration must be declarative where practical. Secrets are configured in the platform secret store; no secret values are committed.

## 3. Single Supabase project

The selected Supabase project is `nextaction` (`zrtosqxesdvcijatsito`, region `us-west-2` as observed on 2026-10-23).

It is the one source for:
- PostgreSQL application data
- Supabase Auth identity/session integration, if the chosen auth flow needs it
- versioned SQL migrations
- RLS policies, database functions, and schema-level constraints

One Supabase project does not mean that developers may modify production schema casually. Keep schema changes in version-controlled migrations and apply them through a reviewed process. Use deterministic test data and tests; never rely on an undocumented manual dashboard change.

Do not use Supabase Edge Functions for application endpoints by default. The chosen application runtime is Cloudflare Workers. Add Supabase Edge Functions only for a clearly justified Supabase-native feature and document the reason.

## 4. Request/data flow

### Standard app request

1. Browser calls a Cloudflare Worker route.
2. Worker validates input, authentication context, authorization, and rate limits.
3. Worker uses the least-privileged Supabase access pattern available.
4. Postgres constraints and RLS enforce data ownership and invariants.
5. Worker returns a minimal response to the browser.
6. Security-relevant mutations generate an audit event.

Never trust a user-supplied owner ID without deriving or verifying it from the authenticated context. Never use frontend role metadata as the final authorization check.

### Website workflow discovery

1. Browser submits a URL to a protected or appropriately rate-limited Worker endpoint.
2. Worker validates URL scheme and destination and applies SSRF protections.
3. A bounded fetch/extraction routine reads only publicly accessible content.
4. Extraction and model interpretation produce schema-validated candidate workflow suggestions with evidence.
5. Results return to the publisher for review.
6. Only an explicit user action persists/enables selected workflow records.

Do not let arbitrary URLs target localhost, private IP ranges, cloud metadata addresses, or internal services. Revalidate redirects and resolved destinations, set timeouts and response-size limits, restrict content types, and consider DNS rebinding. Do not use a generic fetch proxy as a security boundary by itself.

## 5. Website reading: troubleshoot by stages

Keep discovery stages independently observable:
- URL validation and normalization
- DNS/SSRF validation
- HTTP fetch and redirect handling
- response type and body-size validation
- HTML extraction
- visible-text/product-signal extraction
- AI structured output
- schema validation
- response rendering and user review

Return stable internal error categories to logs, with safe client-facing messages. A blank or failed extraction must not be mistaken for a valid empty list of workflows.

For JavaScript-only sites, use one fallback strategy only if it can be used within the selected platform's supported limits and cost constraints. Always preserve manual configuration as the fallback. Do not promise browser rendering until the chosen implementation is tested on representative sites.

## 6. State ownership

- Database is authoritative for persisted users, roles, publisher domains, workflow choices, campaign state, and ad event records.
- Application runtime validates transitions and enforces access control.
- Browser state is ephemeral and never authoritative for ownership or permissions.
- AI output is a suggestion, not an authoritative configuration.
- Git history and migration files are the source of truth for intended schema state.

## 7. Authentication and authorization

Choose one documented authentication/session approach compatible with the Worker runtime and Supabase Auth. Do not mix unrelated cookie strategies or maintain duplicated session state. Validate sessions on the server for protected actions, set secure cookie flags when cookies are used, and test expiration and refresh paths.

Authorization must be resource-specific. A publisher may manage only verified domains and workflows they own. Campaign activation should be restricted to authorized advertisers/admin reviewers. Admin grants and sensitive changes need an audit trail. The exact authorization matrix must be tested before enabling production mutations.

## 8. Keep infrastructure small

Initial platform footprint should be:
- one GitHub repository
- one Cloudflare Worker application
- one Supabase project
- no extra database, KV, D1, queue, Durable Object, or Edge Function unless a documented requirement justifies it.

Use the simplest synchronous implementation that satisfies the requirement. Add queues, background workflows, or stateful services only when measured load, retries, or correctness requires them and their free-tier/pricing constraints are verified.

# OPERATIONS.md

## 1. Current platform inventory (checked 2026-10-23)

### GitHub
- Repository: `papiagasmus/nextaction`
- Default branch: `main`
- Repository currently has no committed files or code size, as reported by GitHub.
- Connector access reports admin, maintain, push, pull, triage permissions.

### Supabase
- Project name: `nextaction`
- Project ref: `zrtosqxesdvcijatsito`
- Region: `us-west-2`
- Status: `ACTIVE_HEALTHY`
- API URL: `https://zrtosqxesdvcijatsito.supabase.co`
- Public application tables: none found.
- Application migration records: none found.
- Edge Functions: none found.
- Security and performance advisors: no lints returned at inspection time.
- Publishable keys exist. Treat them as configuration identifiers, not proof of row-level authorization.

### Cloudflare
- Account: `Nextaction.dev@gmail.com's Account`
- Account ID: `fcda7c36aebd76d5a8cf7f1a009795b6`
- Workers scripts: none returned.
- Pages projects: none returned.
- KV namespaces: none returned.
- D1 databases: none returned.
- Workers Builds tokens: none returned.
- workers.dev subdomain: absent/not initialized at the time of inspection.
- R2: could not be checked successfully because Cloudflare returned an API 403 stating that R2 must be enabled in the dashboard. Do not interpret this as confirmation that no R2 resources exist.
- The available API checks did not audit every Cloudflare product, domain, DNS record, account permission, user API token, billing setting, or secret store.

## 2. Initial setup checklist

- [ ] Review and approve these five foundation documents.
- [ ] Select the minimum Cloudflare Workers-compatible app framework and pin its dependencies.
- [ ] Add app skeleton, health route, and CI workflows.
- [ ] Add required Supabase URL and publishable-key configuration using environment variables; never place privileged keys in client code.
- [ ] Create initial migrations and confirm a clean database can be provisioned from repository history.
- [ ] Connect GitHub deployment to the intended production Worker only after the first build and basic tests pass.
- [ ] Set Worker secrets in the dashboard/secure secret interface without committing their values.
- [ ] Decide whether a workers.dev subdomain is wanted; opening Workers & Pages in the Cloudflare dashboard may initialize it.
- [ ] Confirm the free-tier limits and costs for each selected service before enabling it.
- [ ] Enable/inspect R2 only if the product actually needs object storage.

## 3. Deployment policy

- The canonical production app runs on Cloudflare Workers.
- Deploy production from the approved `main` branch of `papiagasmus/nextaction`.
- Keep secrets and production settings in platform configuration.
- Require a green CI run before production deployment.
- A deployment should identify the commit SHA and be easy to correlate with logs.
- Do not deploy from abandoned spike repositories or personal branches.
- Preview deployments may be added after the basic pipeline is tested and should not gain production credentials by default.

## 4. Monitoring and troubleshooting

For any production issue, capture:
- UTC timestamp and deployment commit
- affected route and broad symptom
- error category and request/correlation ID if available
- whether the issue affects all users or one flow
- recent relevant changes

Do not put secrets, auth cookies, full authorization headers, full website response bodies, or sensitive user content in logs.

For workflow discovery, log the separate stages from ARCHITECTURE.md. Distinguish "site fetch failed", "no useful public content found", "AI provider failed", "AI output invalid", and "UI failed to render". These are different faults and should not share one generic catch-all diagnosis.

## 5. Incident handling

1. Identify the affected route, commit, and change.
2. Contain the impact—for example, disable AI discovery while leaving manual workflow setup available.
3. Roll back the Worker deployment if a recent release is responsible and rollback is safe.
4. If credentials may be exposed, rotate them; do not rely only on deleting their source line.
5. If data integrity or authorization is affected, disable the relevant mutation path and inspect audit/log evidence.
6. Verify recovery with the exact failed flow and relevant negative tests.
7. Record a brief incident summary and a regression test.

## 6. Backups and recovery

- Treat Supabase as the authoritative persistent store.
- Confirm which backup and point-in-time recovery facilities are included in the current plan before relying on them; do not assume a feature is enabled.
- Keep schema recovery reproducible from checked-in migrations.
- Use documented, tested export/restore procedures before handling valuable production data.
- Never experiment with destructive reset operations on the sole production project without a verified backup and explicit approval.

## 7. Cost guardrails

- Prefer free-tier-compatible services and minimal resource count.
- Check current provider pricing and limits before enabling new Cloudflare products, Supabase branches, queues, AI APIs, browser rendering, or monitoring retention.
- Set request-size, time, rate, and AI-token limits.
- Prevent repeated AI discovery retries from creating an unbounded bill.
- Revisit the architecture only when actual traffic, reliability, or product requirements justify more infrastructure.

## 8. Operational readiness criteria

Before public production launch:
- CI and browser E2E are green.
- Auth/session and cross-user authorization tests pass.
- Domain verification cannot be bypassed.
- Workflow discovery failure does not block manual onboarding.
- Sensitive ad contexts are suppressed according to documented policy.
- Click/impression endpoints have replay/rate controls.
- Secrets are configured outside Git.
- Deployment and rollback can be performed and verified.
- Support and incident logging avoids collecting unnecessary personal data.

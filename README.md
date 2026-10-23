# NextAction

NextAction is a lightweight, event-triggered advertising network for micro-SaaS products, indie hackers, and solo founders. It lets a SaaS publisher define meaningful workflow events and show contextually relevant ads in appropriate parts of the product.

This repository is the single source of truth for application code, product decisions, architecture, migrations, tests, and operational guidance.

## Project principles

- Keep the architecture intentionally simple.
- Use one Supabase project for the application; do not split it into separate dev and production Supabase projects without an explicit future decision.
- Use Cloudflare Workers as the primary application runtime and production deployment target.
- Use GitHub as the source of truth and change history.
- Prefer an explicit user-configured workflow over automatic website interpretation. AI may assist, but must not block onboarding or invent unsupported capabilities.
- Keep infrastructure on free tiers where practical; verify current limits and pricing before enabling paid resources.
- Never place secrets in source control or client-side bundles.

## Current status

This is a fresh foundation repository. Initial platform checks on 2026-10-23 found:
- GitHub repository: `papiagasmus/nextaction`, empty at the time of inspection.
- Supabase project: `nextaction`, ref `zrtosqxesdvcijatsito`, active, with no public application tables, app migration history, or Edge Functions.
- Cloudflare account: no Workers scripts, Pages projects, KV namespaces, D1 databases, or Workers Builds tokens returned by the available API checks.
- Cloudflare R2 was not verifiable because the API reports it must be enabled in the dashboard. A workers.dev subdomain has not yet been initialized.

These are point-in-time checks, not a claim that every setting or product in each account has been audited.

## Documents

- [PRODUCT.md](./PRODUCT.md) — product definition, scope, and user journeys.
- [ARCHITECTURE.md](./ARCHITECTURE.md) — system boundaries and data flow.
- [DATA_SECURITY.md](./DATA_SECURITY.md) — authentication, RLS, secrets, and safety boundaries.
- [DEVELOPMENT.md](./DEVELOPMENT.md) — repository workflow, migrations, testing, and quality gates.
- [OPERATIONS.md](./OPERATIONS.md) — environments, deployment, observability, and recovery.

## Start here

Read the five documents above before implementing features. Record significant product or architecture changes in the relevant document in the same pull request as the code change.

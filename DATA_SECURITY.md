# DATA_SECURITY.md

## 1. Security baseline

Security boundaries are enforced server-side and in the database. A hidden button or client-side check is not authorization.

- Use HTTPS for all production traffic.
- Validate and normalize all input.
- Apply explicit authorization for every protected resource and mutation.
- Enable Row Level Security on every exposed application table.
- Keep privileged keys, AI API keys, setup keys, and signing secrets out of the browser and Git history.
- Log the event and outcome, not credentials or raw sensitive content.

## 2. Secrets and credentials

Store secrets in Cloudflare Worker secrets or the appropriate platform secret manager. Names may be documented; values must not be.

Never place Supabase service-role/secret keys in browser code or any `NEXT_PUBLIC_*` variable. Use publishable/anon keys only for client-side operations that remain constrained by RLS. Do not assume possession of a publishable key implies authorization.

Rotate a credential if it was committed, pasted into an issue, or exposed in logs. Remove it from current source and history as required, but understand that history rewriting alone does not make an exposed credential safe.

## 3. Auth and roles

- Derive authenticated user identity from a verified session/token on the server.
- Treat user-editable profile metadata as display/preferences data, not authorization proof.
- A selected Publisher/Advertiser role is not proof of ownership.
- Do not authorize a user based only on a browser-supplied `user_id`, `owner_id`, hostname, or role.
- Validate session expiry and refresh behavior.
- After session revocation or sensitive identity changes, consider that already-issued access tokens may remain valid until expiry; design sensitive operations accordingly.

## 4. RLS and database routines

Every exposed public table must have RLS enabled and policies that enforce per-user/tenant ownership.

Policies for UPDATE need both appropriate `USING` and `WITH CHECK` conditions. Authentication alone is not resource authorization.

Prefer `SECURITY INVOKER`. If `SECURITY DEFINER` is necessary:
- Restrict execute grants explicitly; remember new Postgres functions may be executable by PUBLIC by default.
- Put privileged functions in a non-exposed schema where practical.
- Fix the search path explicitly and schema-qualify object references.
- Check caller identity and authorization inside the function.
- Add tests for unauthorized, cross-tenant, anonymous, and malformed calls.
- Review Supabase security advisors after schema/function changes.

Views in exposed schemas should use `security_invoker = true` when supported; otherwise restrict grants or move sensitive views out of exposed schemas.

## 5. Publisher domain verification

A submitted URL is not proof of ownership. Verification should use a cryptographically random one-time challenge placed in a DNS TXT record at a documented name under the verified domain.

- Challenge values must have adequate entropy.
- Store hashes rather than raw verification secrets when feasible.
- Bind a challenge to the authenticated owner, normalized hostname, requested domain, expiration, and one-time state.
- Check DNS from a trusted server environment.
- Prevent reuse, replay, hostname substitution, and cross-account claim races.
- Expire challenges and rate-limit attempts.
- Do not report success until server-side verification completes.
- Audit both successful and failed state transitions without logging the secret token.

## 6. Website fetching and SSRF

The workflow-discovery feature fetches URLs supplied by users and must be designed as an SSRF-sensitive feature.

- Permit only approved schemes, normally HTTP/HTTPS.
- Reject loopback, private, link-local, multicast, reserved, and cloud metadata destinations, including IPv4 and IPv6 forms.
- Resolve and check hostnames; re-check redirect destinations at every hop.
- Bound redirects, wall-clock time, response bytes, and parsing work.
- Restrict content types and do not execute downloaded page scripts on the Worker.
- Do not forward app credentials, cookies, or internal headers to target sites.
- Use safe DNS and redirect handling and account for DNS rebinding.
- Rate-limit discovery per identity and hostname.
- Keep any rendered-browser fallback isolated and similarly restricted.
- Do not fetch authenticated pages unless a future feature has an explicit consent/security design.

## 7. AI/data minimization

Only send public website text needed to infer product workflows to the AI provider. Do not send user documents, inboxes, private workspace data, authentication cookies, or hidden page content.

- Prompt injection embedded in web pages is untrusted content, not instructions to the system.
- The model must return a defined structured schema.
- Validate the output and reject malformed, overlong, or unsupported claims.
- Return evidence/snippets or the source page that led to each suggestion where feasible.
- Require publisher review before persisting or enabling suggestions.
- Set request/token limits and rate limits to control abuse and costs.
- Logs should capture stage, status, timing, and error category, not full submitted text by default.

## 8. Ad context and privacy

Pass the smallest object/action/workflow identifier necessary for matching. Do not transmit page body, entered form values, document content, or inferred sensitive attributes to advertisers.

Support an explicit suppression decision for sensitive contexts. The rendering path must honor the suppression rule. Campaign creatives and destinations are untrusted input and require review, output encoding, URL validation, and click protection.

## 9. Audit events

Record security-relevant actions such as:
- granting/revoking admin access
- changing account role/permissions
- claiming/verifying a domain
- adding or enabling publisher workflows
- creating, reviewing, activating, pausing, or rejecting a campaign
- changing billing or payout configuration when that functionality is introduced

Audit rows should include actor, action, affected resource, timestamp, and safe metadata. Avoid storing tokens, secrets, raw HTTP headers, or unnecessary personal data.

## 10. Required security tests

- Anonymous and unauthorized resource access.
- Cross-user/cross-tenant read and mutation attempts.
- Role changes cannot grant ownership implicitly.
- Domain verification challenge expiry, reuse, race, wrong hostname, and wrong owner.
- SSRF inputs including loopback, private addresses, redirects, IPv6, malformed URLs, and oversized responses.
- Prompt injection in page text does not override system behavior.
- Malformed AI output is rejected.
- Sensitive contexts suppress ads.
- Click/impression replay and rate abuse are handled.

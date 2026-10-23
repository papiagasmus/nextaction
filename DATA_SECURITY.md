# DATA_SECURITY.md

## 1. Security baseline

Security boundaries are enforced server-side and in the database. A hidden button or client-side check is not authorization.

- Use HTTPS for production traffic.
- Validate and normalize all input.
- Authorize every protected resource and mutation.
- Enable RLS on every exposed application table, with policies that enforce actual ownership.
- Keep privileged keys, OAuth client secrets, AI API keys, DNS challenges, and signing secrets out of the browser and Git history.
- Log event categories and outcomes, not credentials or raw sensitive content.

## 2. OAuth providers and callback safety

Google and GitHub OAuth through Supabase Auth are the required initial login methods.

- Configure provider credentials only in the appropriate secret/configuration interface.
- Register the exact provider callback URL supplied by Supabase and the correct app redirect URLs.
- Use the OAuth flow and PKCE behavior supported by the selected server/framework integration.
- Validate the OAuth callback state/code and exchange the code for a session using the supported Supabase flow.
- Allow-list internal application post-login routes. Never accept an arbitrary external return URL from query parameters.
- Preserve the website URL as validated onboarding state; do not treat it as a navigation redirect.
- Handle provider cancellation, callback failure, expired state, and refresh failure without creating a partially authenticated app session.
- Do not link provider identities merely because an unverified email string matches. Use the provider/Supabase supported identity behavior and test it.

References: https://supabase.com/docs/guides/auth/social-login/auth-google, https://supabase.com/docs/guides/auth/social-login/auth-github, https://supabase.com/docs/guides/auth/redirect-urls.

## 3. Secrets and API keys

Store secrets in Cloudflare Worker secrets or the appropriate secure provider configuration. Names may be documented; values must not be.

Never put the Supabase service-role/secret key in browser code or any public environment variable. Publishable/legacy anon keys are not secrets in the same sense, but must still be paired with RLS and least-privilege grants. Never assume a public key itself provides authorization.

Rotate a credential if it was committed, included in an issue, or exposed in logs. Removing the current source line or rewriting Git history alone does not make an exposed credential safe.

## 4. Sessions and authorization

- Derive user identity from a verified Supabase Auth session/token.
- Treat user-editable profile metadata as preferences/display data, not proof of authority.
- Product modes Publisher/Advertiser/Both do not confer domain ownership or campaign-review authority.
- Workspace owner/admin/member permissions are distinct from product modes.
- Platform-admin privileges require an explicit elevated grant and audit entry.
- Never authorize based solely on browser-supplied user_id, owner_id, hostname, workspace role, or workflow ID.
- Validate expiry and refresh behavior. If sessions use cookies, set appropriate Secure, HttpOnly, and SameSite attributes and avoid caching personalized responses across users.
- When a sensitive action requires immediate revocation, account for already-issued tokens and enforce server/database authorization at the action boundary.

## 5. RLS and database routines

Every exposed application table must have RLS enabled and policies that enforce per-user/workspace ownership.

- Authentication alone is not resource authorization.
- UPDATE policies need both correct USING and WITH CHECK conditions.
- Prefer SECURITY INVOKER.
- If SECURITY DEFINER is necessary, restrict execute grants, use a safe fixed search path, schema-qualify objects, check caller identity/authorization inside the function, and test unauthorized/anonymous/cross-workspace calls.
- Review grants on new functions: PostgreSQL may grant EXECUTE to PUBLIC by default.
- Views in exposed schemas should use security_invoker = true where supported, or be access-restricted appropriately.
- Run Supabase security/performance advisors after relevant schema, view, function, or RLS changes.

## 6. URL validation, favicon, and website fetching

A user-provided URL is untrusted input.

- Accept only HTTP/HTTPS website URLs; reject malformed URLs, embedded credentials, unsupported schemes, and prohibited destination classes.
- If a hostname has no scheme, normalize it to HTTPS before validation.
- Distinguish malformed URL from site unreachability, blocked automation, unavailable favicon, and unverified domain ownership.
- A favicon is best-effort display data, not proof that the website is valid or owned.
- Before server-side fetching, reject loopback, private, link-local, multicast, reserved, cloud-metadata and other internal destinations for both IPv4 and IPv6.
- Resolve and check hostnames, revalidate every redirect destination, limit redirects, response size, content type, wall-clock time, and parsing work.
- Account for DNS rebinding and avoid a generic fetch proxy as the only security boundary.
- Never forward application cookies, Authorization headers, or credentials to the target website.
- Rate-limit expensive fetches per account/hostname.
- Do not access private/authenticated website areas unless a future feature has an explicit consent and security design.

If a site blocks automated reading, explain the issue and let the user continue with manual workflow setup. Do not call a blocked website a malformed URL.

## 7. Workflow metadata and privacy boundary

NextAction needs the declared workflow's object, action/event, and output/result to match ads. It does not need to inspect the actual content of the end user's invoice, document, record, form, message, or other object.

- Store and transmit only the identifiers and workflow metadata needed for matching.
- Do not collect, scrape, log, or send private object/document contents to AI or advertisers for ad matching.
- Do not infer sensitive personal attributes from private content.
- Do not automatically block an ad solely because the workflow's object label appears sensitive; NextAction is not intended to inspect the underlying object content.
- Enforce explicit workflow, publisher, platform, and legal policy restrictions when configured. Such rules must be based on the declared context and explicit policy, not undisclosed scanning of private contents.
- Campaign creative and destination URLs are untrusted and require review, URL validation, safe rendering, and click protection.

## 8. AI-assisted workflow discovery

The AI feature only reads accessible public product/marketing pages to propose workflow candidates. The fetched page is untrusted data, never instructions to the model or application.

- Do not fetch authenticated/private product pages or end-user data.
- Bound input bytes, extracted characters, pages visited, redirects, time, and tokens/cost.
- Send only the minimum public text needed.
- Require structured output validated against a schema.
- Include source evidence/page references where feasible, and reject unsupported claims.
- AI output stays a suggestion until the user explicitly reviews, edits, selects, and saves it.
- Empty output or a model/fetch/parse error must result in an honest explanation and a manual fallback, not fabricated candidates.
- Logs capture stage, timings, status, and safe error category, not full page contents by default.

## 9. Domain ownership verification

Publisher verification uses a server-checked DNS TXT challenge.

- Challenge values have high entropy and are one-time-use.
- Bind each challenge to authenticated owner, normalized hostname, expiry, and a unique challenge record.
- Store hashes instead of raw challenge secrets when feasible.
- Verify DNS server-side; never trust a client claim that DNS exists.
- Prevent replay, wrong-hostname substitution, race conditions, and cross-account takeover.
- Expire challenges and rate-limit creation/verification attempts.
- Do not enable live publisher serving until server-side verification succeeds.
- Audit verification requested, succeeded, failed, expired, and owner-changed events without logging challenge secrets.

## 10. Workspace invites, roles, and audit

- Invitations are scoped to a workspace and intended recipient, use a one-time token, expire, and can be revoked before acceptance.
- Only the authenticated intended recipient can accept an invitation.
- Only authorized workspace owners/admins can invite or change permitted roles.
- Product-role selection does not grant ownership or platform administration.
- Platform-admin grant/revocation, invite changes, membership changes, domain verification, workflow activation, campaign review/activation, and financial configuration are audited.
- Audit records include actor, action, resource, timestamp, and safe metadata. They must not contain passwords, OAuth secrets, access/refresh tokens, challenge tokens, raw Authorization headers, or unnecessary personal data.

## 11. Security regression tests required

- Google and GitHub OAuth start/callback/error/expired-state paths.
- Invalid redirect targets and preservation of URL onboarding state.
- Anonymous access, cross-user and cross-workspace reads/writes, and unauthorized admin grants.
- Invitation expiry, revocation, recipient mismatch, and role escalation.
- DNS challenge expiry, reuse, race, wrong hostname, and wrong owner.
- Malformed URL, private/loopback IPv4/IPv6, unsafe redirect, oversized body, timeout, blocked page, and content-type mismatch.
- Prompt injection in page text, malformed model output, and unsupported AI claims.
- Ad matching does not require object contents; explicit configured restrictions still apply.
- Click/impression replay, rate abuse, and campaign permission bypass attempts.

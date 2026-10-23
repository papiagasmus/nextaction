# PRODUCT.md

## 1. Product summary

NextAction is an event-triggered ad network for micro-SaaS founders, indie hackers, and solo founders. A publisher declares meaningful workflow events in its SaaS; NextAction matches eligible advertiser campaigns to those declared events and returns an advertisement.

The initial market is the United States and global SaaS builders. Product-facing UI and copy must be in English.

### Brand and UI direction
- Use **Jakarta Sans** as the primary interface font.
- Preserve the chosen visual direction of a letter **N** mark with its existing background treatment, thin strokes/weight, straight lines, and deliberate padding. The actual source artwork must be present before visual implementation; this documentation-only repository does not currently contain the logo asset.
- Landing-page copy should present NextAction as the real product, not position it as a demo or prototype. At the same time, copy must not claim that a feature is live until it has actually been implemented and released.
- Keep product copy concise and natural for the US/global SaaS audience; use English throughout the product UI.

## 2. Core users and value

- **Publisher:** integrates a SaaS product, defines workflow contexts, verifies domain ownership, and may earn revenue from eligible ads.
- **Advertiser:** creates and manages campaigns to reach users in relevant declared workflow contexts.
- **Both:** uses publisher and advertiser capabilities in the same account/workspace.
- **NextAction administrator:** performs explicitly authorized platform-level review or support actions, with audit history.

## 3. Two kinds of roles

Do not conflate the selected product mode with the user's access permissions.

### Product mode selected in onboarding
- Publisher
- Advertiser
- Both

A user may start with one mode and add another later. Product-mode selection is not proof of domain ownership, campaign approval, workspace ownership, or administrative authority.

### Workspace permissions
The initial permission model must distinguish owner, admin, and member capabilities. Workspace owners/admins can invite members and assign only permitted workspace/product roles. Platform-admin access is separate, must be deliberately granted, and must be audited. Authorization is enforced on the server and in the database, not by hiding UI controls.

Workspace invitation behavior must include a unique invite, intended recipient, assigned workspace role, expiry, acceptance by the authenticated intended user, and the ability for an authorized owner/admin to revoke a pending invite. Role/grant changes must be auditable.

## 4. Landing page and website URL field

### Required UI behavior
The landing page must contain a website URL input as the primary connect path. It must not replace this with only a generic button or marketing email-capture form.

For an unauthenticated visitor, the primary action is **Connect my SaaS**. When a user is already authenticated, the primary landing CTA changes to **Go to dashboard**. An authenticated user can add another site from the dashboard.

### URL validation and display
1. Trim surrounding whitespace.
2. Accept only HTTP/HTTPS website URLs. If a user enters a hostname without a scheme, normalize it to HTTPS before validating.
3. Reject malformed URLs, unsupported schemes, embedded username/password, and destinations that violate the URL-fetching security policy.
4. Normalize the hostname for consistent lookup and storage. Preserve the intended website URL for display and onboarding.
5. Distinguish at least these conditions in the UI: invalid URL format; well-formed URL; public site could not be reached/read; favicon unavailable. A temporary failure or website access denial must not be mislabeled as malformed URL.
6. Show the site's favicon inside/next to the URL field when it can be retrieved. Favicon lookup is best-effort: failure to retrieve it does not invalidate an otherwise well-formed URL.
7. A valid URL or favicon is not domain-ownership verification. Website reachability, automated-readability, and ownership are separate states.

A well-formed site that blocks automation can still continue through manual workflow setup. Do not require successful scraping merely to create an account.

### Preserve URL across authentication
When an unauthenticated user submits a URL:
1. Validate the URL before starting login.
2. Preserve the normalized URL as onboarding intent through OAuth.
3. Return to the app's own allowed callback route after login.
4. If a pending website URL intent exists, resume onboarding with that URL prefilled—even if this is a returning user. This specific connect action takes precedence over the normal post-login dashboard destination.
5. If no pending URL intent exists, new users enter onboarding and returning users who have completed onboarding go to the dashboard.
6. Never use an arbitrary external URL as an OAuth return destination, and do not lose the onboarding intent on callback or refresh.

When an authenticated user has not completed onboarding, a valid submitted URL opens onboarding with the URL prefilled. For an already-onboarded user, the primary landing CTA leads to the dashboard; connecting an additional site is initiated from the dashboard.

## 5. Authentication providers

Google and GitHub OAuth through Supabase Auth are the required login methods for the initial product. The app must support both provider buttons and their configured callback flows.

- Do not add password login, phone OTP, or marketing-email capture to the MVP without an explicit product decision.
- The landing page does not collect an email address for marketing. The selected OAuth provider may return an account email as part of authentication.
- New users enter onboarding after the OAuth callback. Returning users with completed onboarding go to the dashboard.
- OAuth errors, cancellation, expired state, or callback failures show a recoverable error and must not lose a pending valid website URL.
- A session belongs to one Supabase Auth user; the app must not create a separate application account merely because a user clicked a different provider. Identity linking behavior must be tested and must not be inferred solely from an unverified matching email address.

Provider credentials and callback/redirect allow-lists must be configured in Supabase and the provider consoles before production launch. See the official [Google provider guide](https://supabase.com/docs/guides/auth/social-login/auth-google), [GitHub provider guide](https://supabase.com/docs/guides/auth/social-login/auth-github), and [redirect URL guide](https://supabase.com/docs/guides/auth/redirect-urls).

## 6. Onboarding wizard

The onboarding wizard is step-by-step. The landing URL is carried into it but does not automatically make the site a verified publisher domain.

1. **Preserve/confirm website:** prefill the URL submitted on the landing page. If no URL was submitted, request the relevant website when the selected role requires one.
2. **Choose product mode before “Your product setup”:** Publisher, Advertiser, or Both.
3. **Publisher path:** confirm the SaaS website to connect; select manual workflow setup or explicitly request AI-assisted suggestions; review and save workflows; complete DNS ownership verification.
4. **Advertiser path:** collect the advertiser's basic product/company reference and proceed to campaign setup when that module is available. An advertiser-only user is not forced to verify a publisher domain. A submitted website URL must not silently create a publisher integration.
5. **Both path:** retain both product modes. Publisher setup is the first vertical slice; advertiser setup remains accessible from the dashboard and must not require creating another account.
6. **Finish:** after required onboarding steps are complete, route to the dashboard. Returning signed-in users with completed onboarding see “Go to dashboard” as their primary landing CTA.

A publisher may save a draft workflow while DNS verification is pending, but live publisher serving/activation is blocked until the domain is verified. A failed AI reading attempt never blocks manual setup.

## 7. Publisher workflow setup

The publisher chooses how to configure workflow context:

### Manual path — reliable baseline
The publisher writes and edits the workflow description directly. This must work even if AI is unavailable, expensive, inaccurate, or blocked from reading the website.

### AI-assisted path — explicit optional action
AI may read public, accessible product/marketing pages from the submitted SaaS URL and suggest workflows. It must not silently run as a required onboarding step and must not automatically save or enable a suggestion.

A workflow is described in plain language and represented by three essential parts:
- **Object:** what the user's action is about (for example, an invoice).
- **Action/event:** what happened (for example, invoice sent).
- **Output/result:** what resulted or what state is useful (for example, awaiting payment).

Example: object = invoice; action/event = sent; output/result = awaiting payment. The publisher chooses which workflows to enable. Avoid requiring the publisher to provide the actual contents of the object.

AI candidates must be editable and reviewable. Where possible, show the public page/source signal behind a suggestion and an indicative confidence or evidence quality. Do not fabricate workflows when the website is blocked, empty, or unreadable.

## 8. Domain ownership verification

A publisher website must be verified by a server-checked DNS TXT challenge. The app generates a unique challenge and shows the record name/value and instructions in the dashboard. A successful URL check, favicon, OAuth login, or saved workflow is not verification.

- Verification is bound to the authenticated account and normalized hostname.
- Challenge tokens expire and cannot be replayed.
- Server-side code validates the TXT record.
- Workflow drafts can be edited while verification is pending, but live publisher integration/serving requires verified ownership.
- Reassignment, re-verification, and failed attempts must not allow one account to take over another account's hostname.

## 9. Advertising workflow and data boundaries

NextAction's job is to match declared workflow metadata to eligible campaigns. It does not need to read the actual content of the publisher user's invoice, document, form, record, or other object.

The event/context contract should carry only the minimum data needed for matching, such as a publisher/workflow identifier plus the declared object/action/output classification. Do not transmit object contents or personal data to advertisers.

Do not automatically suppress or block an ad solely because a workflow's object label sounds sensitive. NextAction is not intended to inspect object contents or classify the end user's private data. Any suppression should be based on explicit product policy, publisher configuration, and applicable platform rules—not hidden content inspection or guesses about the underlying data. No content-level inspection is required for ad matching.

Campaign creative/destination still requires review and safe output handling. Impression/click events need deduplication, rate limits, and abuse/fraud controls.

## 10. Publisher integration contract

A Publisher needs a documented way to send a declared workflow event from its SaaS to NextAction and receive an eligible-ad response. The planned MVP includes a small SDK or beacon/API integration and a publisher-scoped integration key or credential. The exact wire format and credential model are implementation decisions for the event-integration work in Step 09, not decisions to improvise while building the landing page.

The integration contract must:
- Identify the verified publisher and declared workflow without sending the underlying object contents.
- Accept only the minimal object/action/output metadata and identifiers needed for matching.
- Prevent an unverified publisher or unrelated publisher from using another publisher's integration.
- Support credential revocation/rotation and rate limits.
- Treat any browser-visible identifier as public, not as proof of authority; secret credentials must stay server-side.
- Reject invalid, replayed, or malformed events and avoid duplicate impression/click accounting.

## 11. Campaign lifecycle

Campaigns must support a controlled lifecycle:
- Create draft
- Edit draft/details
- Submit for review
- Approve or reject with reason
- Activate only when approved and valid
- Pause or deactivate
- Audit important transitions

Only authorized advertisers can manage their campaigns. Only authorized reviewers/admins can approve or reject. A Publisher role by itself does not grant campaign review rights. Any platform-admin grant must be explicit and audited.

## 12. Monetization direction

The working business assumption discussed is USD $1 CPC with a 75% publisher / 25% NextAction split. This is not yet a complete or active billing contract. Before implementation, explicitly settle pricing, eligible-click attribution, invalid-click handling, currency, refunds/chargebacks, balance semantics, payout timing, and terms.

Ledger, payment-provider integration, and automated payouts are later work and must not precede a trustworthy ad-event path.

## 13. MVP scope and exclusions

### Included in the planned MVP
- English landing page with URL input, validation states, favicon when available, and no marketing email-capture form.
- Google and GitHub OAuth via Supabase Auth.
- URL intent preserved across login and onboarding.
- Publisher / Advertiser / Both product-mode choice.
- Workspace invites, role management, audited privileged grants.
- Manual publisher workflow setup.
- Optional AI-assisted public-website discovery with review, evidence where feasible, and graceful fallback.
- DNS TXT publisher-domain verification.
- Campaign draft, edit, review, approval, activation, and pause controls.
- Publisher SDK/beacon/API event integration with a scoped, revocable integration credential.
- Workflow matching, ad creative, impression/click tracking, basic deduplication and fraud controls.
- Server-side authorization, RLS, and audit trail for sensitive actions.

### Explicitly excluded until justified by a later decision
- A second hosted Supabase project for development/staging.
- Separate app/backend repositories or an architecture split into multiple services.
- AI discovery that silently persists or enables suggestions.
- Reading private/authenticated product pages or end-user object/document contents to infer ad context.
- Automatically suppressing ads solely from the object label.
- Complex queues, additional databases, KV, D1, or Durable Objects without measured need.
- Fully automated financial settlement and payout before ledger/event semantics are proven.
- A claim that AI can understand every website.

## 14. Product acceptance criteria

The first complete Publisher vertical slice is successful when:
- A visitor can enter a well-formed URL and see a favicon when available.
- The login journey supports Google and GitHub, preserves URL intent, and returns to onboarding.
- The user chooses a product mode before product setup.
- A Publisher can add a workflow manually and see it persist after refresh.
- The publisher can complete the DNS challenge; unverified ownership cannot activate live publisher serving.
- A different user cannot read or mutate that publisher's workflow/domain.
- AI discovery is optional; failure produces a clear reason and a manual fallback.
- No ad-matching path requires reading the actual content of the user's object/document.

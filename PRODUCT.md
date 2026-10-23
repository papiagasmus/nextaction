# PRODUCT.md

## 1. Product summary

NextAction is a lightweight event-triggered ad network for micro-SaaS founders, indie hackers, and solo founders. Publishers expose appropriate in-product moments to NextAction; NextAction matches those moments with eligible campaigns and renders an advertisement.

The initial market is the United States and global SaaS builders. Product-facing copy should be written for that audience in English.

## 2. Core value

- **Publishers** can earn revenue from relevant in-product ad placements without building an advertising system themselves.
- **Advertisers** can reach users when a specific product workflow makes their offer relevant.
- **NextAction** provides campaign management, matching, impression/click tracking, fraud controls, and eventually billing and payouts.

## 3. Roles

During onboarding, a user selects one or more workspace roles:
- Publisher
- Advertiser
- Both

A user can start with one role and add the other later. Role selection is an onboarding preference, not proof of domain ownership or permission to manage a resource.

## 4. Publisher setup

### Landing-page URL entry

The landing page should have a URL input, not only a generic connect button or an email-capture form.

Expected behavior:
1. User enters a website URL.
2. Validate URL syntax and allowed protocols.
3. Normalize a valid URL and determine the hostname.
4. Show the website favicon where one can be retrieved.
5. When unauthenticated, preserve the validated website intent through login.
6. After successful login, route directly into onboarding with the URL prefilled.
7. After onboarding is complete, take the user to the dashboard.

Validation of the URL is not verification of ownership. The UI must not imply that domain ownership has been verified merely because a URL parses or a favicon is visible.

### Onboarding sequence

1. Accept or confirm the website URL.
2. Select Publisher, Advertiser, or Both.
3. For Publisher, describe the product/workflow context the owner wishes to make available.
4. Offer manual workflow entry as the reliable baseline.
5. Offer AI-assisted discovery only when the capability is operational and its results can be reviewed.
6. Verify domain ownership using a DNS challenge and confirm ownership server-side.
7. Let the owner review, edit, and explicitly save the workflows they want enabled.

### Workflow configuration

The product does not need to understand a website's whole business. It needs to capture a useful description of the object a user is working on, the action occurring, and the useful output/result.

A workflow record should be explainable as:
- **Object:** what the user is working on (for example, an invoice).
- **Action/event:** what happened (for example, invoice sent).
- **Outcome/context:** what state or result this represents (for example, waiting for payment).

The publisher decides which workflows exist and are enabled. AI suggestions must be editable, reviewable, and optional.

## 5. AI-assisted website/workflow discovery

### Known issue to solve first

In the previous preview, AI did not successfully read a supplied SaaS website and extract meaningful workflows. This is a known unresolved issue. Do not describe website discovery as production-ready until it passes the acceptance tests in DEVELOPMENT.md.

### Expected behavior

1. Receive and validate a public website URL.
2. Fetch and parse accessible public pages using a bounded, safe process.
3. Extract visible product description, feature names, and public workflow hints.
4. Generate a small set of candidate object/action/outcome records with evidence and confidence.
5. Return useful structured output even if some pages are blocked or JavaScript-rendered.
6. Show the extracted facts and suggestions for owner review.
7. Never save or enable AI-generated workflows without user confirmation.

### Failure behavior

If fetching or interpretation fails, show a clear explanation and allow manual setup. Do not leave the user in an endless loading state and do not silently invent workflows. Record non-sensitive diagnostics, such as stage and error category, without logging secrets or unnecessarily capturing page contents.

The implementation should separate fetch, extraction, structured interpretation, validation, and user review. This keeps the problem diagnosable and avoids coupling all discovery behavior to one opaque model call.

## 6. Advertising behavior and safety

NextAction matches campaign eligibility to explicitly configured workflow context. The matching process should use only the minimum context needed.

- Do not send page text, user content, document contents, or personal data to advertisers.
- Do not infer sensitive attributes from users or content.
- Do not display ads in sensitive contexts unless the publisher and a documented policy explicitly permit that context.
- A policy decision to suppress an ad must be enforceable by the runtime, not just a UI hint.
- Treat publisher configuration and AI-generated suggestions as untrusted input until validated.
- Click and impression endpoints require abuse controls and deduplication.

## 7. Monetization direction

An example model discussed is USD $1 CPC with a 75% publisher / 25% NextAction split. Treat this as a proposal, not a live billing contract, until campaign pricing, currency, attribution, invalid-click handling, balances, refunds, and payout terms are explicitly defined and reviewed.

Accounting and payout work is intentionally later than a secure, verifiable ad-serving path.

## 8. MVP boundaries

### Included first
- URL input, syntax validation, favicon display where available, and URL preservation through login.
- Authentication and onboarding role choice.
- Publisher domain verification.
- Manual workflow configuration.
- AI-assisted discovery behind an explicit optional action and only after passing acceptance tests.
- Basic campaign review/edit/activation flow.
- Eligibility matching and safe ad-serving behavior.
- Impression/click tracking with basic fraud protections.
- Audit trail for sensitive mutations.

### Excluded until the core path is proven
- Multiple Supabase projects for separate environments.
- Multiple app/backend repositories.
- Automatic discovery that silently changes publisher configuration.
- Complex microservice or queue infrastructure without demonstrated need.
- Full settlement, billing-provider integration, and automated payout before ad events and ledger semantics are tested.
- Any promise that AI understands every website or can inspect authenticated/private pages.

## 9. Product success criteria

The first vertical slice succeeds when a new publisher can submit a URL, sign in, choose a role, configure at least one workflow manually, verify their domain, and see the saved configuration in the dashboard—without requiring AI discovery to succeed.

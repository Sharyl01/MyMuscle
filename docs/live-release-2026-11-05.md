# Live app links — 5 November 2026

The owner confirmed that MyMuscle is live in both stores. Both public listings
responded successfully during verification:

- iPhone: https://apps.apple.com/nl/app/mymuscle-workout-tracker/id6815727446
- Android: https://play.google.com/store/apps/details?id=com.apphletes.mymuscle

The header and final section now announce the live release and link directly to
the appropriate stores. The former final waitlist action is replaced with both
download choices. Its section ID is retained for existing links. The device-based
download route uses the same verified defaults, including from shared workouts;
invalid configured overrides still fail closed. Existing pending-review copy and
countdown dates are no longer used to communicate availability on the homepage.

Validation: Next production build passes. Ten targeted browser checks pass for
release messaging, store links, phone redirects, mobile layout, public workout
sharing and automated accessibility. Screenshots at 360px and 430px were reviewed;
the email template was also checked at 320px, 390px and 700px. Existing unrelated
working-tree edits are retained.

The launch announcement uses the existing monochrome MyMuscle email design,
from `MyMuscle <noreply@mymuscle.app>`, with reply-to `support@mymuscle.app` and
the same two store URLs. The current waitlist query returned 11 distinct email
addresses. Recipient data, sending credentials and detailed receipts stay outside
Git. Per-recipient idempotency keys prevent duplicate sends on identical retries.
Production deployment `dpl_CTKdrb5hvQdudBXB7G7Nvy2FkXyJ` is READY and aliased to
`mymuscle.app` and `www.mymuscle.app`. The deployed homepage was checked for the
live announcement, both pairs of direct store links and the absence of old
pending-review badges. Live `/download` checks returned the correct 302 location
for both iPhone and Android user agents.

Resend accepted all 11 individual launch messages on 5 November 2026 at 10:05 CET,
with an individual message ID for every recipient and no failed/unknown responses.
Subject: `Good news: MyMuscle is live!`. Provider acceptance is confirmed; inbox
delivery and opens have not been independently verified. The protected one-off
sender used production credentials without exposing them locally and was removed
after sending. Its deployment had no public domain alias.

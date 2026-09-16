# Public website redesign

The public homepage presents MyMuscle with a live GLB muscle map, workout demo,
current app screenshots, recovery animation, badges and waitlist. This release
changes the website; the mobile app is used as a reference.

## Current behavior

- A full-width dark header contains the logo, countdown and store badges.
  Both Coming soon badges link to the waitlist section.
- The muscle demo keeps workouts in browser state. Its engine is a byte-for-byte
  snapshot of the app's pure training modules; see app-training-preview.md.
  The demo profile is Intermediate.
- The model supports mouse/touch picking and rotation, keyboard muscle selection,
  keyboard rotation, reset, reduced motion and a fallback without WebGL.
- Overview, progress, records and groups share the height of the longest section
  at the current viewport. Badges and the model section size independently.
- PR, groups, comparison and analysis use actual app captures with isolated example
  data. The recovery video loads on interaction and pauses offscreen.
- Badges reveal the app's male/female achievement requirements.
- The final waitlist section uses the badges' light background. The footer shows
  the business details supplied by the owner.
- Release is configured for 25 September 2026 at 18:00 UTC. Countdown boundaries
  and the completed state are tested. Store download URLs are not yet configured.

## Preserved services

Admin routes, proxy, authentication, database clients, analytics and confirmation
email implementation are unchanged. The private dashboard remains at /admin.
The waitlist calls the existing joinWaitlist server action with validation,
honeypot, duplicate handling and optional confirmation email. The dialog supports
initial focus, Tab trapping, Escape, scroll locking and focus restoration.

## Verification and release

Run npm ci, npm run lint, npm run build and npm run test:e2e.

Playwright starts a production build on port 3100 with a test-only Node preload.
It exercises the real server action with controlled database and email responses;
no real signups or confirmation emails are created. App parity tests additionally
require the sibling Fitnessapp28-11-2025 checkout. Tests are excluded from the
production TypeScript build so Vercel requires only the website repository.

Coverage includes model interactions, cumulative load, badges, screenshots,
recovery video contents, equal section heights, mobile layouts, countdown,
waitlist states and focus, metadata, legal routes, admin protection and WCAG A/AA.
Browser artifacts and local environment files are ignored by Git.

The existing Vercel project mymuscle is linked to Sharyl01/MyMuscle on GitHub.
Production deploys from main to https://mymuscle.app. Environment variables remain
managed by the existing Vercel project. Verify the public domain and store links
after publishing.

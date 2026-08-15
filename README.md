# MyMuscle Landing Page

Production-ready Next.js App Router landing page for the MyMuscle launch site.

## Requirements

- Node.js `>=22.0.0`
- npm

## Local Development

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Production Checks

```bash
npm run lint
npm run build
```

The project uses Next.js App Router under `src/app`, Tailwind CSS v4 through
`@tailwindcss/postcss`, and `next/font` for self-hosted font optimization.

## Private analytics dashboard

The private dashboard lives at `/admin` and reads aggregated product events
from the same Supabase project as the mobile app. The public landing page does
not link to it.

1. Copy `.env.example` to `.env.local` for local development.
2. In Supabase Authentication, create the two email/password users that may
   access the dashboard. Use strong, unique passwords and do not add a public
   signup flow.
   Enable **Leaked Password Protection** in the Supabase Auth password-security
   settings before using the dashboard in production.
3. Add those user IDs to the private allowlist from the Supabase SQL editor:

   ```sql
   insert into private.product_admins (user_id, username, display_name)
   values
     ('FIRST_AUTH_USER_UUID', 'admin1', 'Owner one'),
     ('SECOND_AUTH_USER_UUID', 'admin2', 'Owner two');
   ```

4. Set `ADMIN_LOGIN_ALIASES` locally and in Vercel. It is a server-only JSON
   object that maps the usernames to the two Supabase Auth email addresses:

   ```text
   {"admin1":"owner@example.com","admin2":"friend@example.com"}
   ```

5. Add `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `ADMIN_LOGIN_ALIASES` to all
   relevant Vercel environments before deploying.

Authorization is enforced twice: the Next.js server checks the authenticated
session, and Supabase only returns aggregate analytics when the user ID exists
in `private.product_admins`. Raw event rows are not readable through the public
Data API.

## Vercel

Vercel can auto-detect this as a Next.js project.

- Build command: `npm run build`
- Install command: `npm ci`
- Output directory: managed by Next.js
- Required Node version: `>=20.9.0`

# MyMuscle Landing Page

Production-ready Next.js App Router landing page for the MyMuscle launch site.

## Requirements

- Node.js `>=20.9.0`
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

## Vercel

Vercel can auto-detect this as a Next.js project.

- Build command: `npm run build`
- Install command: `npm ci`
- Output directory: managed by Next.js
- Required Node version: `>=20.9.0`

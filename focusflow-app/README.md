# FocusFlow

FocusFlow is a calm, private workspace for turning a long-term goal into milestones and finishable tasks. It includes notes, saved resources, progress tracking, journal reflections, search, and a peaceful full-screen mode.

## Product behavior

- Milestone progress is calculated from completed tasks.
- Workspace content is stored in Cloudflare D1 and shared across sessions without an app-level sign-in flow.
- Peaceful-mode preference stays local to the current browser.
- The deployed Site should remain private because the application intentionally uses one shared workspace record.

## Development

Requires Node.js 22.13 or newer.

```sh
npm run install:ci
npm run dev
```

Quality and release checks:

```sh
npm run db:generate
npm run lint
npm run build
```

Database schema changes belong in `db/schema.ts`. Generated migrations in `drizzle/` are applied by the Sites publishing workflow.
# Vercel deployment

Set the Vercel Root Directory to `focusflow-app`, Framework to Next.js, and
Build Command to `npm run build:vercel`. Connect Neon to supply `DATABASE_URL`
and run `npm run db:migrate:vercel` once before first use.

Next.js uses the Neon runtime adapter; Sites/vinext retains Cloudflare bindings.
The Vercel database starts empty: existing Sites accounts and data are not copied.
Custom scenes are stored privately in Neon with a 4 MB upload limit on Vercel.
Larger videos require a separate direct-upload storage integration.

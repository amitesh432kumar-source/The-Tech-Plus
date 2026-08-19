# The Tech Plus

> Learn Technology. Build Skills. Create Your Future.

The Tech Plus is a technology education platform: online courses, live webinars, workshops,
a full student learning-management system, Razorpay-powered payments, and an admin CMS —
built as a production-grade Next.js + Supabase application.

All 12 build phases are complete (see [`docs/PROGRESS.md`](docs/PROGRESS.md) for what shipped
in each one, including the security/correctness bugs found and fixed along the way). Two things
still need the site owner's action before the platform is fully live — see
[Before you go live](#before-you-go-live) below.

## Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui (Base UI), Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Row Level Security)
- **Payments**: Razorpay (order → Checkout.js → signature-verified confirmation → signed webhook backstop)
- **Deployment**: Vercel (app) + Supabase (backend)

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase/Razorpay/email values
npm run dev
```

## Project structure

```
src/
  app/                  Next.js routes (App Router) — public site, /dashboard, /admin, API routes
  components/           ui (shadcn primitives), layout, marketing, courses, webinars, workshops,
                         dashboard, admin, learning (course player), payments, auth, seo
  features/             Server actions by domain: auth, payments, progress, profile, notifications,
                         reviews, admin/*
  lib/                  Integration clients: supabase (browser/server/admin/middleware), razorpay, auth, validation
  services/             Server-side data-access/query layer — maps DB rows to view models in types/content.ts
  types/                Shared TypeScript types, incl. generated Supabase types (types/database.ts)
  config/                Site/brand configuration
supabase/
  migrations/            SQL migrations, applied in order — schema, RLS, seed content, and fixes
docs/
  PROGRESS.md             Phase-by-phase build log — what shipped, what was found and fixed, what's outstanding
  GOOGLE_SIGNIN_SETUP.md   Exact steps to enable Google OAuth
```

## Environment

See `.env.example` for the full list of required variables. Never commit real secrets —
`.env*` files (except `.env.example`) are gitignored. `SUPABASE_SERVICE_ROLE_KEY` and the
Razorpay secret keys must only ever be read on the server; they're already only referenced
from server-only modules (`lib/supabase/admin.ts`, `lib/razorpay/client.ts`, server actions).

## Before you go live

Two credentials only the account owner can safely provide (Claude does not enter API keys or
secrets on your behalf):

1. **`SUPABASE_SERVICE_ROLE_KEY`** — Supabase Dashboard → Project Settings → API → `service_role`
   secret → add to `.env.local` (local) and your Vercel project's environment variables
   (production). Required for: course-content editing/viewing in the admin CMS, webinar/event
   meeting links, order fulfillment, certificate issuance, and most of `/admin`.
2. **Razorpay keys** — `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`. Test-mode
   keys are enough to verify the full checkout flow before going live. Without them, "Enroll Now" /
   "Register Now" buttons on paid items correctly show "payments aren't configured" rather than
   failing silently.

Optional, needed for real emails: **`RESEND_API_KEY`** (or swap in another provider — the
notification system is provider-agnostic; email sending itself isn't wired to a provider yet).

See [`docs/GOOGLE_SIGNIN_SETUP.md`](docs/GOOGLE_SIGNIN_SETUP.md) for enabling Google Sign-In
(already configured and verified working as of this build).

## Database migrations

Migrations in `supabase/migrations/` are applied in numeric order and already reflect the live
Supabase project's current state (schema, RLS policies, seed catalog content, and the
security/performance fixes documented in `docs/PROGRESS.md`). If you provision a fresh Supabase
project, apply them in order via the Supabase MCP tools or `supabase db push`.

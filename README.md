# The Tech Plus

> Learn Technology. Build Skills. Create Your Future.

The Tech Plus is a premium technology education platform: online courses, live webinars, workshops, and a full student learning management system, built as a production-grade Next.js + Supabase application.

This repository is being built in phases (see `docs/PROGRESS.md`). Do not assume a phase is complete unless it is checked off there.

## Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Row Level Security)
- **Payments**: Razorpay (architected to allow additional providers later)
- **Deployment**: Vercel (app) + Supabase (backend)

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase/Razorpay values
npm run dev
```

## Project structure

```
src/
  app/                 Next.js routes (App Router)
  components/          Shared UI: ui, layout, marketing, courses, webinars, dashboard, admin
  features/            Feature domains: auth, courses, webinars, payments, certificates, reviews, notifications
  lib/                 Integration clients: supabase, razorpay, auth, validation
  hooks/                React hooks
  services/            Server-side data-access/business logic
  types/               Shared TypeScript types (incl. generated Supabase types)
  config/               Site/brand configuration
  utils/                 Generic utilities
supabase/
  migrations/           SQL migrations
```

## Environment

See `.env.example` for the full list of required variables. Never commit real secrets — `.env*` files (except `.env.example`) are gitignored, and the Supabase service-role key / Razorpay secret must only ever be read on the server.

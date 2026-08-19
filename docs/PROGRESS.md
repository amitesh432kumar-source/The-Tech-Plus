# Build Progress — The Tech Plus

Tracking phase completion per the master build spec. A phase is only checked off once it has been implemented, built, linted, and reported on.

- [x] **Phase 1** — Project foundation + architecture
- [x] **Phase 2** — Design system + branding + public UI
- [x] **Phase 3** — Supabase + authentication + database foundation
- [x] **Phase 4** — Public website + courses + webinars
- [ ] Phase 5 — Course learning system
- [ ] Phase 6 — Webinar/live class system
- [ ] Phase 7 — Razorpay payments + enrollment
- [ ] Phase 8 — Student dashboard
- [ ] Phase 9 — Admin dashboard + CMS
- [ ] Phase 10 — Certificates + reviews + notifications + SEO
- [ ] Phase 11 — Security + performance + accessibility
- [ ] Phase 12 — Final QA + deployment preparation

## Phase 1 notes

- Next.js 16 (App Router, TypeScript, Tailwind v4, Turbopack, `src/` dir, `@/*` alias) scaffolded via `create-next-app`.
- Supabase project **the-tech-plus** created (ref `nflewofhydexacvptgku`, region `ap-south-1`, free tier). No schema/tables yet — that's Phase 3.
- Feature-based `src/` architecture created per spec (components, features, lib, hooks, services, types, config, utils) plus `supabase/migrations/`.
- Razorpay: no account/keys provided yet. `.env.example` has placeholders; real wiring happens in Phase 7.

## Phase 2 notes

- Brand design tokens added to `globals.css`: blue/purple/cyan gradient ramp (`--brand-blue/purple/cyan`, `--brand-gradient`), full light/dark OKLCH palettes, and utility classes (`text-gradient-brand`, `bg-gradient-brand`, `.glass`, `.glow-brand`, `.card-hover`) plus a `prefers-reduced-motion` override.
- Dark/light mode via `next-themes` (`ThemeProvider`, `ThemeToggle`), class-based, system-aware.
- shadcn/ui components installed: button, card, badge, accordion, avatar, separator, sheet, dropdown-menu (Base UI/Nova preset). Base UI's `Button` uses a `render` prop, not Radix `asChild` — the shared `Button` wrapper auto-sets `nativeButton={false}` whenever `render` is passed (e.g. rendering as a `next/link`), otherwise Base UI logs an accessibility warning.
- Layout: sticky glassmorphic `Navbar` (desktop links + mobile `Sheet` drawer), `Footer`, brand `Logo`.
- Homepage sections built per spec: Hero, TrustBenefits, FeaturedCourses, UpcomingWebinars, Workshops, WhyTechPlus, HowItWorks, Instructors, Testimonials (marked as demo content), FAQ (accordion), FinalCta. Framer Motion used for entrance/scroll-reveal animations.
- Public pages added so nav links resolve: `/courses`, `/webinars`, `/workshops` (light previews using demo data — full search/filter/detail pages are Phase 4), `/about`, `/contact`, `/faq`, `/privacy`, `/terms`.
- All course/webinar/workshop/instructor/testimonial/FAQ content lives in `src/config/demo-data.ts`, explicitly flagged as placeholder — must be replaced by live Supabase data in Phase 4.
- `next-themes` required `suppressHydrationWarning` on `<html>` (expected/documented pattern, not a bug).
- Verified in-browser (desktop + mobile viewport, light + dark) via the preview browser: build clean, lint clean, zero console errors on a fresh tab, mobile drawer and theme toggle both functionally confirmed via DOM inspection (the tool's synthetic `computer` click occasionally times out on this Base UI modal — a tool quirk, not an app bug; direct `.click()` + `data-slot` inspection confirmed correct behavior).
- Login/Sign Up buttons in the navbar link to `/login` and `/register`, which don't exist yet — that's Phase 3 (auth).

## Phase 3 notes

- Full database schema applied via 3 migrations (`supabase/migrations/0001_init.sql`, `0002_rls.sql`, `0003_function_hardening.sql`): profiles, instructors, categories, courses, course_modules, course_lessons, course_resources, course_enrollments, course_progress, webinars, webinar_registrations, events/event_registrations (reusable workshop/bootcamp/live-class architecture), coupons, coupon_usage, orders, order_items, payments, certificates, reviews, testimonials, faqs, notifications, site_settings.
- RLS enabled on every table. Public read is scoped to published/approved rows; students can only read/write their own rows; all privileged writes (enrollments after payment, marking orders paid, publishing content) are intended to go through the service-role client (`lib/supabase/admin.ts`) in later phases, not client-side RLS.
- `handle_new_user` trigger auto-creates a `profiles` row (default role `student`) on signup. `is_admin()`/`current_user_role()` are SECURITY DEFINER helpers used throughout the RLS policies — verified via the Supabase security advisor and documented as an intentional exception (they're needed for anonymous-readable tables and only ever report on the caller's own row).
- `src/types/database.ts` regenerated from the live schema via the Supabase MCP `generate_typescript_types` tool — replace the Phase 1 placeholder.
- Auth implemented: email/password register (zod-validated, exact spec success copy, no "Welcome" text), login (honors a `?next=` redirect target, open-redirect-guarded), logout, forgot-password, reset-password, and a Google Sign-In button wired to `supabase.auth.signInWithOAuth` + `/auth/callback` route — **Google OAuth needs a provider enabled with real Client ID/Secret in the Supabase dashboard before it will actually work**; the code path is ready but untestable without those credentials.
- Route protection: `src/proxy.ts` → `lib/supabase/middleware.ts` redirects unauthenticated visitors away from `/dashboard` and `/admin`, and non-admins away from `/admin`; `lib/auth/session.ts` (`getCurrentUser`/`requireUser`/`requireRole`) enforces the same server-side on each page, so middleware isn't the only line of defense.
- Minimal protected `/dashboard` (any authenticated user) and `/admin` (role=admin only) stub pages added purely to prove the auth/authorization chain end-to-end — the real dashboard/admin CMS are Phases 8–9.
- Public `/verify/[certificateId]` page added (queries `certificates` by code) — works today but the table is empty until certificate issuance ships in Phase 10.
- Navbar now reflects real auth state (server-fetched in the root layout): shows Login/Sign Up when signed out, an avatar dropdown (Dashboard, Admin Dashboard if applicable, Logout) when signed in, both desktop and mobile.
- Verified end-to-end in-browser against the live Supabase project: register → profile row created by trigger → login → dashboard access → `/admin` blocked for a student → promoted to admin via SQL → `/admin` access granted → `?next=` correctly returns the user to the originally-requested protected page → logout. Test accounts were deleted afterward (cascade removed their profiles too).
- Supabase project has email confirmation ON by default (`email_confirmed_at` null until confirmed) — sign-up does not auto-log-in; this is the secure default and was left as-is.

## Phase 4 notes

- **All demo data is gone.** `src/config/demo-data.ts` was deleted; every public page now reads from Supabase. Seed catalog content (5 courses with 11 modules / 29 lessons, 4 instructors, 5 categories, 3 webinars, 3 events, 7 FAQs) lives in `supabase/migrations/0005_seed_content.sql` and is fully editable via the admin CMS in Phase 9.
- **Testimonials were deliberately removed** (`0006_remove_fabricated_testimonials.sql`). The seed originally invented quotes attributed to named people; that's fake social proof even when labeled "demo", so the rows were deleted and the section now simply doesn't render until real testimonials exist.
- Services layer (`src/services/`): `courses`, `webinars`, `events`, `instructors`, `testimonials`, `faqs`, `search`. Components consume view models from `types/content.ts` and never touch raw DB row shapes.
- Pages: `/courses` (debounced search + category/level filters + sort, empty state), `/courses/[slug]` (breadcrumb, outcomes, requirements, accordion curriculum, instructor, reviews, course FAQs, related courses, desktop sticky enroll card + mobile sticky CTA, dynamic SEO/OG metadata), `/webinars` + `/webinars/[slug]` (live countdown, seat availability), `/workshops` + `/workshops/[slug]`, `/search` + `/api/search` (navbar dropdown with debounced suggestions).
- **Real registration works** for free webinars/events via server actions (`features/webinars/actions.ts`, `features/events/actions.ts`) — server-side auth check, price check (paid items rejected until Phase 7), seat-limit check, and duplicate handling. Verified live: registering dropped seats 500→499 and persisted a row.
- **Security fix found during verification** (`0007_lesson_visibility.sql`): the original RLS policy hid entire non-preview lesson *rows* from visitors, which silently broke public lesson counts (a 9-lesson course displayed as "2 lessons"). Replaced with row-level access to any lesson of a *published* course plus **column-level** grants that withhold `content_url`/`content_text` from `anon`/`authenticated`. Confirmed against the live REST API: selecting `content_url` returns `42501 permission denied`, while `title` returns normally. Enrolled-student content access will go through the server in the course-player phase.
- Fixed a pre-existing lint error in `ThemeToggle` (setState-in-effect) by rendering both icons and letting CSS pick via the `dark` class — no mount flag, no hydration mismatch.
- `sitemap.ts` is now dynamic (includes every published course/webinar/event slug).
- Verified in-browser: course listing counts now match the DB exactly, detail pages render full curriculum, `?next=` redirect after login lands on the intended page, search returns correct results, workshops list correctly. Lint and build clean. Test account deleted afterward.
- **Still not possible:** buying anything. Enroll buttons say "Enrollment Opens Soon" and paid webinars/events are gated — Razorpay lands in Phase 7. Google Sign-In still returns 400 until an OAuth client is configured in Supabase.

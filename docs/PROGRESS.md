# Build Progress — The Tech Plus

Tracking phase completion per the master build spec. A phase is only checked off once it has been implemented, built, linted, and reported on.

- [x] **Phase 1** — Project foundation + architecture
- [x] **Phase 2** — Design system + branding + public UI
- [x] **Phase 3** — Supabase + authentication + database foundation
- [x] **Phase 4** — Public website + courses + webinars
- [x] **Phase 5** — Course learning system
- [x] **Phase 6** — Webinar/live class system
- [x] **Phase 7** — Razorpay payments + enrollment (code-complete; needs real Razorpay keys to test live)
- [x] **Phase 8** — Student dashboard
- [x] **Phase 9** — Admin dashboard + CMS
- [x] **Phase 10** — Certificates + reviews + notifications + SEO
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

## Phase 5 notes — Course learning system

- `services/learning.ts`: `listEnrolledCourses` (progress %), `getCoursePlayerData` (metadata via normal client, actual lesson content via service-role client only if enrolled/admin/preview).
- Lesson player at `/dashboard/courses/[courseId]/lesson/[lessonId]`: curriculum sidebar (desktop, sticky) + mobile drawer, video/text/pdf/external content renderer with YouTube/Vimeo embed detection, prev/next navigation, mark-complete action, resources list.
- `/dashboard/courses/[courseId]` redirects straight into the player (continue where left off, or lesson one).
- Progress action (`features/progress/actions.ts`) inserts `course_progress`, updates `last_lesson_id`, and — new in this pass — checks for course completion and issues a certificate automatically (see Phase 10 notes).

## Phase 6 notes — Webinar/live class system

- `/dashboard/webinars` lists both webinar and event registrations with status badges.
- **Security fix found while building this**: `getWebinarBySlug`/`getWorkshopBySlug` were returning `meeting_url`/`recording_url` to every visitor of the *public* detail page, not just registered attendees — same class of bug as the Phase 4 lesson-content issue. Fixed with the same pattern (migration `0008_meeting_url_protection.sql`): row access stays public, but `meeting_url`/`recording_url` are revoked at the column-grant level from `anon`/`authenticated` and only attached server-side (`getWebinarAccessLinks`/`getEventAccessLinks`, service-role client) after confirming registration or admin.

## Phase 7 notes — Razorpay payments + enrollment

- `lib/razorpay/client.ts`, full order → checkout → verify flow: `createOrderAction` computes price **from the database**, never the client; validates coupons server-side (`features/payments/coupon.ts`, service-role — coupons have no client-read policy by design); creates `orders`/`order_items`; creates the Razorpay order; returns checkout params.
- `CheckoutButton` (client) loads `checkout.razorpay.com/v1/checkout.js`, opens Razorpay Checkout, and on success calls `verifyPaymentAction`, which recomputes the HMAC-SHA256 signature server-side (`crypto.timingSafeEqual`) before trusting anything the client returned.
- `services/fulfillment.ts` (`fulfillOrder`) grants access (course enrollment / webinar or event registration) and is **idempotent by construction** — safe to call from both the client-side verify path and the webhook, relying on unique constraints rather than manual duplicate-detection.
- `/api/webhooks/razorpay` — signature-verified reliability backstop for cases the client-side flow can miss (tab closed mid-payment, network blip). Acknowledges (200) even when `RAZORPAY_WEBHOOK_SECRET` isn't set yet, so Razorpay doesn't retry-storm an unconfigured endpoint.
- Free items (or 100%-off coupons) skip Razorpay entirely and fulfill immediately.
- **Not yet live-tested**: no real Razorpay keys are configured, so `createOrderAction` currently returns "Payments aren't configured yet" for any priced item — confirmed this fails gracefully rather than crashing. Needs real (test-mode is fine) `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET`/`RAZORPAY_WEBHOOK_SECRET` from the account owner before it can be exercised end-to-end.

## Phase 8 notes — Student dashboard

- `DashboardShell`/`DashboardNav` — a shared wrapper component (not a Next.js layout file, deliberately) so the immersive lesson player can opt out of the sidebar chrome while every other `/dashboard/*` page opts in.
- `/dashboard` (overview: stat cards, continue-learning, upcoming registered webinars), `/dashboard/courses`, `/dashboard/webinars`, `/dashboard/orders`, `/dashboard/certificates`, `/dashboard/profile` (edit full name), `/dashboard/notifications` (mark read / mark all read).
- All verified rendering correctly in-browser (empty states, real auth) — end-to-end data flows (real orders, real certificates) depend on the service-role key per above.

## Blocker hit during Phase 7 verification

`SUPABASE_SERVICE_ROLE_KEY` was left blank in Phase 3 (credentials aren't something Claude enters itself). Discovered live via a genuine runtime error ("supabaseKey is required") when testing checkout. This key gates: order creation, certificate issuance, notification creation, webinar/event meeting-link reveal, and most of Phase 9's admin CMS. The user is adding it directly to `.env.local` from the Supabase dashboard (Project Settings → API → service_role secret) — Claude does not see or handle the value. **Most admin CRUD does not actually need this key** — RLS already grants `is_admin()` full read/write on courses/webinars/events/etc. via the normal authenticated client; only the few columns already locked down (lesson `content_url`, webinar/event `meeting_url`/`recording_url`) require the service-role client.

## Phase 9 notes — Admin dashboard + CMS

- `AdminShell`/`AdminNav` mirror the dashboard pattern; every admin page calls `requireRole("admin")` server-side (defense in depth alongside the `proxy.ts` middleware gate from Phase 3).
- **Key architectural finding**: most admin CRUD does *not* need the service-role client. RLS already grants `is_admin()` full read/write on courses, modules, categories, coupons, orders, reviews, etc. via the normal authenticated client. The service-role client is only required for the specific columns already locked down at the grant level: `course_lessons.content_url/content_text` (migration 0007) and `webinars/events.meeting_url/recording_url` (migration 0008) — both to read existing values back into an edit form and, for consistency, to write them.
- Courses: list, create, edit (metadata + learning outcomes/requirements as line-separated text) plus an inline curriculum editor (add/delete modules and lessons, set content type/URL/duration/preview flag). Module/lesson **reordering is via a plain order-position on create, not drag-and-drop** — a reasonable scope cut given the time budget; still fully functional, just less polished than a DnD UI.
- Webinars and Workshops/Events: list, create, edit, delete — mirrors the courses pattern, using the service-role client throughout since every field on those forms includes the locked-down meeting/recording URLs.
- Students: searchable list joining `profiles` (normal client) with `auth.users` emails (service-role client — email lives outside `public` schema).
- Orders: full order list with status badges, no fabricated data — empty until real orders exist.
- Coupons: create form + list with an active/inactive toggle switch and delete.
- Reviews: moderation queue (approve/reject) for `pending` reviews.
- Not built in this pass (lower priority given scope): a dedicated admin notifications/announcement composer, and a `site_settings` key-value editor. Both tables and RLS policies already exist for a future pass.

Build clean at 40 routes; lint clean. Not yet exercised in-browser as an admin (blocked on `SUPABASE_SERVICE_ROLE_KEY`, being added directly to `.env.local` by the account owner).

## Phase 10 notes — Certificates, reviews, notifications, SEO

- Certificates were already wired in Phase 5 (auto-issued on course completion). No further work needed there.
- Reviews: enrolled, non-admin students who haven't already reviewed a course see a star-rating + text form on the course detail page (`features/reviews/actions.ts`, `ReviewForm`). Submitted reviews land as `pending` and only appear publicly once approved via `/admin/reviews`.
- Notification coverage gap closed: free webinar/event self-registration (`registerForWebinarAction`/`registerForEventAction`) now calls `notifyUser`, matching the payment-confirmed and certificate-issued notifications already wired in earlier phases.
- SEO: added `JsonLd` component emitting schema.org structured data — `Course` (with `AggregateRating`/`Offer`) on course pages, `Event` (with `Offer`/availability) on webinar and workshop pages. Dynamic `<title>`/description/OG metadata via `generateMetadata` was already in place from Phase 4; `sitemap.ts` already includes every published/non-draft slug.

Lint and build clean (40 routes, unchanged route count — this phase only added features to existing pages).

# Build Progress — The Tech Plus

Tracking phase completion per the master build spec. A phase is only checked off once it has been implemented, built, linted, and reported on.

- [x] **Phase 1** — Project foundation + architecture
- [x] **Phase 2** — Design system + branding + public UI
- [ ] Phase 3 — Supabase + authentication + database foundation
- [ ] Phase 4 — Public website + courses + webinars
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

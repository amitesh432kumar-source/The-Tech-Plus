# Deployment Checklist

## 1. Supabase (backend)

- [x] Project created (`the-tech-plus`, ref `nflewofhydexacvptgku`, `ap-south-1`)
- [x] All migrations applied (`supabase/migrations/0001` through `0010`)
- [x] RLS enabled and verified on every table (Supabase security advisor: clean, one
      documented intentional exception — see `docs/PROGRESS.md` Phase 3/11)
- [ ] **Add `SUPABASE_SERVICE_ROLE_KEY`** to production environment (Vercel) — Project
      Settings → API → `service_role` secret. Required for admin CMS, order fulfillment,
      certificate issuance, webinar/event meeting links.
- [ ] **Enable Google OAuth provider** in production if not already global — see
      `docs/GOOGLE_SIGNIN_SETUP.md`. Add the production domain to Google Cloud's authorized
      JavaScript origins and to Supabase's redirect URL allowlist.
- [ ] Decide on email confirmation policy (currently ON by default — recommended to keep).
- [ ] Consider upgrading off the free tier before real traffic (pausing/cold-start limits).

## 2. PayPal (payments)

- [ ] Create a PayPal Developer account and a REST API app at developer.paypal.com (sandbox
      mode is enough to verify the flow end-to-end).
- [ ] Add `NEXT_PUBLIC_PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` to
      environment (local + Vercel). `NEXT_PUBLIC_PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_ID` are the
      same value — one is read by the browser bundle, the other server-side.
- [ ] Configure the webhook in the PayPal developer dashboard:
      `https://<your-domain>/api/webhooks/paypal`, event: `PAYMENT.CAPTURE.COMPLETED` (minimum).
- [ ] Add `PAYPAL_WEBHOOK_ID` (the webhook ID shown when creating the webhook).
- [ ] Set `PAYPAL_CURRENCY` (default `USD`) and leave `PAYPAL_MODE=sandbox` until ready to go live.
- [ ] Run a real sandbox-mode purchase end-to-end (course + a paid webinar) before switching to
      live keys. Confirm: order created → PayPal Buttons render → payment succeeds → enrollment/
      registration granted → confirmation notification appears in `/dashboard/notifications`.
- [ ] Switch to live keys (`PAYPAL_MODE=live`, live app credentials) only after the above is verified.

## 3. Email (optional but recommended)

- [ ] Add `RESEND_API_KEY` (or another provider) and wire it into `services/notifications.ts`
      if you want actual emails sent alongside in-app notifications — the notification system
      itself doesn't send email yet, only creates the in-app record.

## 4. Vercel (app hosting)

- [ ] Import the repository, framework preset: Next.js.
- [ ] Set all environment variables from `.env.example` in the Vercel project settings —
      `NEXT_PUBLIC_*` vars for both Production and Preview, secrets for Production (and
      Preview only if you want preview deploys to hit real Supabase/PayPal).
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the real production domain (used in metadata, sitemap,
      and OAuth/payment redirect URLs).
- [ ] Confirm the build succeeds on Vercel (`npm run build`) — verified clean locally as of
      this commit.
- [ ] After first deploy, re-check Google OAuth and PayPal webhook URLs point at the real
      domain, not `localhost`.

## 5. Post-deploy smoke test

- [ ] Register a real account, confirm email, log in.
- [ ] Browse courses/webinars/workshops, use search.
- [ ] Enroll in a free item (or a coupon-to-zero paid item) and confirm dashboard access.
- [ ] Complete a course's lessons and confirm certificate issuance + `/verify/[code]` works
      publicly.
- [ ] Promote the account to `admin` via SQL (`update profiles set role = 'admin' where id = ...`)
      and confirm `/admin` access + CRUD works.
- [ ] Submit a course review as a student, approve it as admin, confirm it appears publicly.
- [ ] Check `robots.txt` and `sitemap.xml` resolve correctly on the production domain.

## Known non-blocking gaps (see `docs/PROGRESS.md` for full detail)

- Admin notification composer and `site_settings` editor not built (tables/RLS exist).
- Curriculum reordering is via order-position, not drag-and-drop.
- No outbound email sending yet (notifications are in-app only).
- `multiple_permissive_policies` advisor warning (165 instances) is an accepted RLS-pattern
  tradeoff, not a bug.

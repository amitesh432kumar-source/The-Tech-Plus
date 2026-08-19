# Enabling Google Sign-In

The application code is already wired for Google Sign-In (button → `signInWithOAuth`
→ `/auth/callback` → session). The only thing missing is **credentials**, which have
to be created in your own Google account and pasted into your own Supabase dashboard.

> **Firebase is not required.** Supabase needs a Google Cloud OAuth 2.0 client.
> Creating a Firebase project would create a Google Cloud project underneath and
> could be made to work, but it adds a service this platform never uses. Use
> Google Cloud Console directly.

## Values you'll need

| Field | Value |
| --- | --- |
| Supabase project ref | `nflewofhydexacvptgku` |
| **Authorized redirect URI** (Google) | `https://nflewofhydexacvptgku.supabase.co/auth/v1/callback` |
| **Authorized JavaScript origin** (dev) | `http://localhost:3000` |
| **Authorized JavaScript origin** (prod) | your production domain, once deployed |

## Step 1 — Create the OAuth client (Google Cloud Console)

1. Go to <https://console.cloud.google.com/> and create a project (name it
   **The Tech Plus**).
2. Open **Google Auth Platform → Data Access (Scopes)** and make sure these are present:
   - `openid` (add manually)
   - `.../auth/userinfo.email` (default)
   - `.../auth/userinfo.profile` (default)

   Do **not** add sensitive/restricted scopes — they trigger a Google verification
   review that can take weeks.
3. Open **Google Auth Platform → Audience** and configure who may sign in. While
   testing, "External + Testing" is fine; add your own email as a test user.
   Switch to "In production" before real users sign up.
4. Go to **Google Auth Platform → Clients → Create client**:
   - Application type: **Web application**
   - Name: `The Tech Plus Web`
   - **Authorized JavaScript origins**: `http://localhost:3000`
     (add your production URL later)
   - **Authorized redirect URIs**:
     `https://nflewofhydexacvptgku.supabase.co/auth/v1/callback`
5. Click **Create**. Google shows a **Client ID** and **Client Secret** — keep this
   tab open for the next step.

## Step 2 — Enable the provider (Supabase Dashboard)

1. Go to <https://supabase.com/dashboard/project/nflewofhydexacvptgku/auth/providers>
2. Expand **Google**, toggle **Enable Sign in with Google**.
3. Paste the **Client ID** and **Client Secret** from Step 1.
4. **Save**.

## Step 3 — Allow the redirect URLs

Go to **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3000` for now; change to your production domain
  at deploy time.
- **Redirect URLs**: add
  - `http://localhost:3000/**`
  - your production equivalent later, e.g. `https://thetechplus.com/**`

Without this, Supabase rejects the post-login redirect back to the app.

## Step 4 — Test

Restart the dev server, open `/login`, click **Continue with Google**. You should
land on `/dashboard` with a `profiles` row auto-created by the `handle_new_user`
trigger (role `student`).

## Security notes

- The **Client Secret** belongs only in the Supabase dashboard. Never commit it,
  never put it in `.env.local`, never paste it into chat or a file in this repo.
- The Client ID is not secret, but there's no reason to hardcode it either — Supabase
  holds both.
- `?next=` is carried through the OAuth round trip and validated on the way back
  (`src/app/auth/callback/route.ts`) so it can only ever be a same-site path — this
  prevents the callback being used as an open redirect.

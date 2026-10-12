# Cloudflare Pages Deployment Guide — HisabBhai

This guide explains how to deploy the HisabBhai frontend to **Cloudflare Pages** for global distribution, sub-millisecond edge routing, and automated continuous deployment.

---

## 1. Prerequisites

- A [Cloudflare account](https://dash.cloudflare.com/).
- Git repository pushed to GitHub or GitLab.
- Supabase Project URL and Anon Key.

---

## 2. Deploying via Cloudflare Dashboard (Recommended)

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left navigation, select **Workers & Pages**.
3. Click **Create application** > **Pages** > **Connect to Git**.
4. Authorize Cloudflare and select your `splitwise` / `hisabbhai` repository.
5. Configure the build settings:
   - **Project name:** `hisabbhai`
   - **Production branch:** `main` (or `master`)
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
6. Expand **Environment variables (advanced)** and add:
   | Variable | Value |
   | :--- | :--- |
   | `VITE_SUPABASE_URL` | `https://<YOUR_PROJECT_ID>.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `<YOUR_SUPABASE_ANON_KEY>` |
   | `VITE_APP_URL` | `https://hisabbhai.pages.dev` (or custom domain) |
   | `VITE_DEMO_MODE` | `false` |
   | `NODE_VERSION` | `22` |
7. Click **Save and Deploy**.

Cloudflare Pages will clone your repo, run `npm run build`, and deploy your production app in ~45 seconds!

---

## 3. SPA Routing & Security Headers Verification

HisabBhai includes preconfigured Cloudflare configuration files in `public/`:
- **`public/_redirects`**:
  ```text
  /*    /index.html   200
  ```
  Guarantees that deep links like `https://hisabbhai.pages.dev/groups/b0000000...` and `/expenses/new` load correctly through React Router without 404 errors.

- **`public/_headers`**:
  Provides strict security headers including `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and long-lived caching headers for static assets in `/assets/*`.

---

## 4. Connecting a Custom Domain

1. In Cloudflare Pages, select your `hisabbhai` project.
2. Go to **Custom domains** > **Set up a custom domain**.
3. Enter your domain (e.g. `hisabbhai.in` or `app.hisabbhai.in`).
4. Follow the prompt to auto-configure Cloudflare DNS.
5. SSL/TLS will be automatically provisioned via Universal SSL with HTTP/3 and 0-RTT enabled.

---

## 5. Synchronizing Google OAuth and Supabase with Cloudflare Domain

After your Cloudflare domain is live:
1. In **Google Cloud Console** > **Credentials**:
   - Add `https://hisabbhai.pages.dev` (and your custom domain) to **Authorized JavaScript origins**.
2. In **Supabase Dashboard** > **Authentication** > **URL Configuration**:
   - Add `https://hisabbhai.pages.dev/**` and `https://<your-custom-domain>/**` to **Redirect URLs**.

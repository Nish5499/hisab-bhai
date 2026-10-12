# Google OAuth Setup Guide — HisabBhai

This guide walks you through setting up Google OAuth authentication with Supabase Auth for both local development and production.

---

## 1. Create a Google Cloud Project

1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown in the top bar and select **New Project**.
3. Name your project (e.g., `HisabBhai-App`) and click **Create**.

---

## 2. Configure OAuth Consent Screen

1. In the left navigation, go to **APIs & Services** > **OAuth consent screen**.
2. Select **External** as the User Type and click **Create**.
3. Fill in the required fields:
   - **App name:** `HisabBhai`
   - **User support email:** Select your email address.
   - **Developer contact information:** Your email address.
4. Click **Save and Continue**.
5. On the **Scopes** step, click **Add or Remove Scopes** and select:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
6. Click **Update** > **Save and Continue**.
7. If your app is in "Testing" mode, add your test Google account under **Test users**.

---

## 3. Create OAuth Client Credentials

1. Go to **APIs & Services** > **Credentials**.
2. Click **Create Credentials** > **OAuth client ID**.
3. Select **Application type:** `Web application`.
4. Name: `HisabBhai Web Client`.
5. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173` (for local development)
   - `https://<your-project>.pages.dev` (for Cloudflare Pages production)
6. Under **Authorized redirect URIs**, add the exact Supabase Callback URL:
   - `https://<YOUR_SUPABASE_PROJECT_ID>.supabase.co/auth/v1/callback`
   *(Obtain your Project ID from Supabase Dashboard > Project Settings > General)*.
7. Click **Create**.
8. Copy the **Client ID** and **Client Secret**.

---

## 4. Configure Supabase Auth Provider

1. Open your project on the [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **Authentication** > **Providers** > **Google**.
3. Toggle Google to **Enabled**.
4. Paste your **Client ID** and **Client Secret** obtained from Google Cloud.
5. Click **Save**.

---

## 5. Configure Redirect URL Allowlist in Supabase

1. In Supabase Dashboard, go to **Authentication** > **URL Configuration**.
2. Set **Site URL:**
   - Local: `http://localhost:5173`
   - Production: `https://<your-app>.pages.dev`
3. Under **Redirect URLs**, add:
   - `http://localhost:5173/**`
   - `https://<your-app>.pages.dev/**`
   - `https://<your-custom-domain>.com/**` (if using a custom domain)
4. Click **Save**.

---

## 6. Testing the Flow

1. Start your local dev server:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:5173/login`.
3. Click **Continue with Google**.
4. You will be redirected to Google's consent screen. After approving, you will land on `/dashboard` with your Google profile name and avatar automatically synced!

---

## 7. Troubleshooting Common OAuth Errors

| Error | Root Cause | Solution |
| :--- | :--- | :--- |
| `redirect_uri_mismatch` | The callback URL in Google Cloud does not match Supabase's callback URL. | Ensure `https://<PROJECT_REF>.supabase.co/auth/v1/callback` is added under **Authorized redirect URIs** in Google Cloud Console. |
| `access_denied` / App not verified | App is in Testing status and user is not in test users list. | Add user email under OAuth consent screen > **Test users**, or publish the app to Production status. |
| Redirects to blank page | Missing redirect wildcard in Supabase URL config. | Add `http://localhost:5173/**` to Supabase **Redirect URLs** allowlist. |

# Production Readiness Checklist — HisabBhai

Follow this checklist before promoting HisabBhai to production.

---

## 1. Security & Keys Verification
- [ ] **No Service Role Keys in Frontend:** Verify that only `VITE_SUPABASE_ANON_KEY` is present in the client build and `SUPABASE_SERVICE_ROLE_KEY` is never included or imported.
- [ ] **Row Level Security (RLS) Active:** Confirm RLS is enabled on all 10 tables (`profiles`, `groups`, `group_members`, `group_invitations`, `expenses`, `expense_payers`, `expense_participants`, `settlements`, `notifications`, `audit_logs`).
- [ ] **Security Definer Function Hardening:** Ensure all PostgreSQL security definer functions have an explicit `SET search_path = public` declaration to prevent search path hijacking.
- [ ] **Input Validation:** Ensure Zod schemas and PostgreSQL check constraints enforce positive currency amounts (`amount_paise > 0`).

---

## 2. Authentication & OAuth Configuration
- [ ] **Google OAuth Client Credentials:** Google Cloud OAuth consent screen published or user allowlist configured.
- [ ] **Redirect Allowlist:** Production domains (`https://<app>.pages.dev/**` and custom domain) added to Supabase **Redirect URLs**.
- [ ] **Email Confirmation:** Supabase Auth SMTP provider configured (e.g., SendGrid, Resend, or AWS SES) for reliable transactional emails.
- [ ] **Password Strength:** Enforce minimum 6-character passwords and rate-limiting on authentication endpoints.

---

## 3. Database & Financial Integrity
- [ ] **Integer Arithmetic:** All monetary fields are typed as `BIGINT` (paise) with zero floating-point storage.
- [ ] **Atomic RPC Settlement:** Ensure settlement recording uses `public.record_atomic_settlement` to prevent partial balance updates during network drops.
- [ ] **Indexes:** Verify foreign key indexes on `expenses(group_id)`, `expense_payers(expense_id)`, `expense_participants(expense_id)`, and `settlements(group_id)`.
- [ ] **Database Backups:** Daily automated backups enabled in Supabase project settings.

---

## 4. Hosting & CDN (Cloudflare Pages)
- [ ] **SPA Fallback:** Verify `public/_redirects` contains `/* /index.html 200` to prevent 404s on page reloads.
- [ ] **Security Headers:** Verify `public/_headers` includes `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `HSTS`.
- [ ] **Cache Configuration:** Asset hashes enabled in Vite (`/assets/*` with `immutable` cache header).
- [ ] **SSL / TLS:** Cloudflare Universal SSL configured with "Full (Strict)" mode.

---

## 5. Performance & Mobile Polish
- [ ] **Mobile Touch Targets:** All interactive buttons and inputs meet WCAG 2.2 touch target minimums (>= 44x44px).
- [ ] **Viewport Meta:** Meta viewport tag configured with `width=device-width, initial-scale=1.0` in `index.html`.
- [ ] **Reduced Motion Support:** Respect user prefers-reduced-motion in Framer Motion animations.

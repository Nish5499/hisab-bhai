# Supabase PostgreSQL Setup & Migration Guide — HisabBhai

This document details how to configure Supabase PostgreSQL, apply migrations, enforce Row Level Security (RLS), and run seed data for HisabBhai.

---

## 1. Create a Supabase Project

1. Log into [Supabase](https://supabase.com).
2. Click **New Project** and select your organization.
3. Choose a project name: `hisabbhai-prod` (or `hisabbhai-dev`).
4. Set a strong database password (store this safely).
5. Select the **AWS Mumbai (ap-south-1)** region for optimal latency for Indian users.
6. Click **Create new project** and wait ~2 minutes for provisioning.

---

## 2. Obtain API Credentials

1. Navigate to **Project Settings** > **API**.
2. Locate the following keys:
   - **Project URL:** `https://<project-ref>.supabase.co`
   - **anon / public key:** `eyJhbGciOi...`
3. Copy these values to your local `.env` file:
   ```env
   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   VITE_APP_URL=http://localhost:5173
   VITE_DEMO_MODE=false
   ```

---

## 3. Applying Database Migrations

You can apply the schema migrations using the Supabase Web SQL Editor or the Supabase CLI.

### Option A: Using the Supabase Web SQL Editor (Fastest)
1. Open your project on Supabase Dashboard.
2. Go to **SQL Editor** in the left sidebar.
3. Click **New query**.
4. Open the migration file: `supabase/migrations/20261013000001_initial_schema.sql`.
5. Copy the entire file contents and paste them into the SQL Editor.
6. Click **Run**.
7. Confirm that all tables (`profiles`, `groups`, `group_members`, `expenses`, `expense_payers`, `expense_participants`, `settlements`, `notifications`) and RLS policies are created successfully.

### Option B: Using the Supabase CLI
```bash
# Login to Supabase CLI
npx supabase login

# Link your local repo to the remote project
npx supabase link --project-ref <your-project-ref>

# Push the migration
npx supabase db push
```

---

## 4. Applying Test Seed Data (Optional for Development)

To populate your database with realistic Indian test scenarios (Flat 402 Roommates, Rent of ₹36,000, Behrouz Biryani with Neha excluded, and Tapri Chai):

1. Go to **SQL Editor** in the Supabase Dashboard.
2. Paste the contents of `supabase/seed.sql`.
3. Click **Run**.

---

## 5. Row Level Security (RLS) Verification

Every table in HisabBhai has strict Row Level Security enabled. Verify that the following policies are active in **Authentication** > **Policies**:

| Table | Policy Name | Access Permitted |
| :--- | :--- | :--- |
| `profiles` | `profiles_select_own_or_colleagues` | Users can only view their own profile and profiles of members sharing a group. |
| `groups` | `groups_select_member` | Users can only see groups where `public.is_group_member(id, auth.uid())` returns true. |
| `expenses` | `expenses_select` | Only group members can view expenses within that group. |
| `expense_participants`| `expense_participants_select` | Enforces group boundary isolation. |
| `settlements` | `settlements_insert` | Only authorized members can record settlements between themselves and peers. |

---

## 6. Realtime Subscriptions Configuration

To enable instant live updates when someone adds an expense or records a settlement:
1. In the Supabase Dashboard, go to **Database** > **Replication**.
2. Under **Source**, enable replication for:
   - `expenses`
   - `settlements`
   - `notifications`
3. Click **Save**.

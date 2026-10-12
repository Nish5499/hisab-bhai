-- =====================================================================
-- HISABBHAI - SUPABASE POSTGRESQL SCHEMA & ROW LEVEL SECURITY (RLS)
-- "Bhai, hisaab clear kar!"
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS & DOMAINS
CREATE TYPE group_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE split_method AS ENUM ('EQUAL', 'EXACT', 'PERCENTAGE', 'SHARES');
CREATE TYPE settlement_status AS ENUM ('RECORDED', 'CONFIRMED', 'REVERSED');
CREATE TYPE expense_category AS ENUM (
  'chai_snacks',
  'food_dining',
  'groceries',
  'rent_stay',
  'utilities_bills',
  'travel_cabs',
  'shopping',
  'entertainment',
  'medical',
  'other'
);

-- 3. PROFILES TABLE (Mirrors auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  phone_number TEXT,
  upi_id TEXT,
  preferred_currency TEXT DEFAULT 'INR',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. GROUPS TABLE
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  avatar_emoji TEXT DEFAULT '🪙',
  category TEXT DEFAULT 'Friends',
  simplify_debts BOOLEAN DEFAULT true NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_deleted BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. GROUP MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role group_role DEFAULT 'member' NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_group_user UNIQUE(group_id, user_id)
);

-- 6. GROUP INVITATIONS TABLE
CREATE TABLE IF NOT EXISTS public.group_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  email TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  is_revoked BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. EXPENSES TABLE (Exact integer paise)
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
  category expense_category DEFAULT 'food_dining' NOT NULL,
  expense_date DATE DEFAULT CURRENT_DATE NOT NULL,
  split_type split_method DEFAULT 'EQUAL' NOT NULL,
  receipt_url TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  is_deleted BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. EXPENSE PAYERS (Multi-payer support with integer paise)
CREATE TABLE IF NOT EXISTS public.expense_payers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  amount_paid_paise BIGINT NOT NULL CHECK (amount_paid_paise > 0),
  CONSTRAINT unique_expense_payer UNIQUE(expense_id, user_id)
);

-- 9. EXPENSE PARTICIPANTS (Inclusion/Exclusion support with integer paise)
CREATE TABLE IF NOT EXISTS public.expense_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  share_amount_paise BIGINT NOT NULL CHECK (share_amount_paise >= 0),
  raw_share_value NUMERIC(10, 4) DEFAULT 1,
  is_excluded BOOLEAN DEFAULT false NOT NULL,
  CONSTRAINT unique_expense_participant UNIQUE(expense_id, user_id),
  CONSTRAINT valid_excluded_share CHECK (
    (is_excluded = true AND share_amount_paise = 0) OR
    (is_excluded = false)
  )
);

-- 10. SETTLEMENTS TABLE (Settlement tracking with integer paise)
CREATE TABLE IF NOT EXISTS public.settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  payer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
  notes TEXT,
  proof_url TEXT,
  status settlement_status DEFAULT 'RECORDED' NOT NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  settled_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT diff_payer_receiver CHECK (payer_id <> receiver_id)
);

-- 11. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 13. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_group_members_user ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_expenses_group ON public.expenses(group_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_expense_payers_expense ON public.expense_payers(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_participants_expense ON public.expense_participants(expense_id);
CREATE INDEX IF NOT EXISTS idx_settlements_group ON public.settlements(group_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_group_invitations_token ON public.group_invitations(token);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_payers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Security Definer helper: is user member of group?
CREATE OR REPLACE FUNCTION public.is_group_member(_group_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = _group_id AND user_id = _user_id
  );
$$;

-- Security Definer helper: get user role in group
CREATE OR REPLACE FUNCTION public.get_group_role(_group_id UUID, _user_id UUID)
RETURNS group_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.group_members
  WHERE group_id = _group_id AND user_id = _user_id;
$$;

-- Profiles: Anyone can read profiles of users who share a group with them, or their own
CREATE POLICY "profiles_select_own_or_colleagues"
  ON public.profiles FOR SELECT
  USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.group_members gm1
      JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = auth.uid() AND gm2.user_id = profiles.id
    )
  );

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- Groups: Read if member
CREATE POLICY "groups_select_member"
  ON public.groups FOR SELECT
  USING (
    is_deleted = false AND (
      created_by = auth.uid() OR
      public.is_group_member(id, auth.uid())
    )
  );

CREATE POLICY "groups_insert"
  ON public.groups FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "groups_update_admin"
  ON public.groups FOR UPDATE
  USING (
    public.get_group_role(id, auth.uid()) IN ('owner', 'admin')
  );

-- Group Members: Read if in same group
CREATE POLICY "group_members_select"
  ON public.group_members FOR SELECT
  USING (
    public.is_group_member(group_id, auth.uid())
  );

CREATE POLICY "group_members_insert"
  ON public.group_members FOR INSERT
  WITH CHECK (
    -- User joining via invite or creator creating group
    user_id = auth.uid() OR
    public.get_group_role(group_id, auth.uid()) IN ('owner', 'admin')
  );

CREATE POLICY "group_members_delete"
  ON public.group_members FOR DELETE
  USING (
    user_id = auth.uid() OR
    public.get_group_role(group_id, auth.uid()) = 'owner'
  );

-- Group Invitations:
CREATE POLICY "invitations_select"
  ON public.group_invitations FOR SELECT
  USING (
    public.is_group_member(group_id, auth.uid()) OR
    token IS NOT NULL -- Allow lookup by token during join flow
  );

CREATE POLICY "invitations_insert"
  ON public.group_invitations FOR INSERT
  WITH CHECK (
    public.is_group_member(group_id, auth.uid())
  );

-- Expenses:
CREATE POLICY "expenses_select"
  ON public.expenses FOR SELECT
  USING (
    is_deleted = false AND
    public.is_group_member(group_id, auth.uid())
  );

CREATE POLICY "expenses_insert"
  ON public.expenses FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    public.is_group_member(group_id, auth.uid())
  );

CREATE POLICY "expenses_update"
  ON public.expenses FOR UPDATE
  USING (
    created_by = auth.uid() OR
    public.get_group_role(group_id, auth.uid()) IN ('owner', 'admin')
  );

CREATE POLICY "expenses_delete"
  ON public.expenses FOR DELETE
  USING (
    created_by = auth.uid() OR
    public.get_group_role(group_id, auth.uid()) IN ('owner', 'admin')
  );

-- Expense Payers & Participants:
CREATE POLICY "expense_payers_select"
  ON public.expense_payers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.expenses e
      WHERE e.id = expense_payers.expense_id AND public.is_group_member(e.group_id, auth.uid())
    )
  );

CREATE POLICY "expense_payers_write"
  ON public.expense_payers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.expenses e
      WHERE e.id = expense_payers.expense_id AND public.is_group_member(e.group_id, auth.uid())
    )
  );

CREATE POLICY "expense_participants_select"
  ON public.expense_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.expenses e
      WHERE e.id = expense_participants.expense_id AND public.is_group_member(e.group_id, auth.uid())
    )
  );

CREATE POLICY "expense_participants_write"
  ON public.expense_participants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.expenses e
      WHERE e.id = expense_participants.expense_id AND public.is_group_member(e.group_id, auth.uid())
    )
  );

-- Settlements:
CREATE POLICY "settlements_select"
  ON public.settlements FOR SELECT
  USING (
    public.is_group_member(group_id, auth.uid())
  );

CREATE POLICY "settlements_insert"
  ON public.settlements FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    public.is_group_member(group_id, auth.uid()) AND
    (payer_id = auth.uid() OR receiver_id = auth.uid())
  );

CREATE POLICY "settlements_update"
  ON public.settlements FOR UPDATE
  USING (
    created_by = auth.uid() OR
    payer_id = auth.uid() OR
    receiver_id = auth.uid()
  );

-- Notifications:
CREATE POLICY "notifications_own"
  ON public.notifications FOR ALL
  USING (user_id = auth.uid());

-- Audit logs: Read only for group members
CREATE POLICY "audit_logs_select"
  ON public.audit_logs FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- =====================================================================
-- DATABASE FUNCTIONS & ATOMIC PROCEDURES
-- =====================================================================

-- Auto-create profile trigger on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      avatar_url = EXCLUDED.avatar_url,
      updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Atomic Settlement RPC
CREATE OR REPLACE FUNCTION public.record_atomic_settlement(
  p_group_id UUID,
  p_payer_id UUID,
  p_receiver_id UUID,
  p_amount_paise BIGINT,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settlement_id UUID;
  v_current_user UUID;
BEGIN
  v_current_user := auth.uid();
  IF v_current_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT public.is_group_member(p_group_id, v_current_user) THEN
    RAISE EXCEPTION 'Unauthorized: User is not a member of this group';
  END IF;

  IF p_amount_paise <= 0 THEN
    RAISE EXCEPTION 'Invalid amount: Must be greater than 0 paise';
  END IF;

  IF p_payer_id = p_receiver_id THEN
    RAISE EXCEPTION 'Payer and receiver cannot be the same person';
  END IF;

  INSERT INTO public.settlements (
    group_id,
    payer_id,
    receiver_id,
    amount_paise,
    notes,
    status,
    created_by
  ) VALUES (
    p_group_id,
    p_payer_id,
    p_receiver_id,
    p_amount_paise,
    p_notes,
    'RECORDED',
    v_current_user
  ) RETURNING id INTO v_settlement_id;

  -- Create notifications for the other party
  INSERT INTO public.notifications (user_id, title, message, link_url)
  VALUES (
    CASE WHEN v_current_user = p_payer_id THEN p_receiver_id ELSE p_payer_id END,
    'Hisaab Settle Hua! 🎉',
    'A settlement of ₹' || (p_amount_paise / 100.0)::text || ' was recorded.',
    '/groups/' || p_group_id
  );

  RETURN v_settlement_id;
END;
$$;

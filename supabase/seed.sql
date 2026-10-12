-- =====================================================================
-- HISABBHAI - SUPABASE SEED DATA (LOCAL DEV & TESTING)
-- "Bhai, hisaab clear kar!"
-- =====================================================================

-- Insert sample profiles
INSERT INTO public.profiles (id, full_name, email, avatar_url, phone_number, upi_id)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Rahul Sharma', 'rahul@example.com', 'https://api.dicebear.com/7.x/bottts/svg?seed=Rahul', '+919876543210', 'rahul@okhdfcbank'),
  ('a0000000-0000-0000-0000-000000000002', 'Priya Patel', 'priya@example.com', 'https://api.dicebear.com/7.x/bottts/svg?seed=Priya', '+919876543211', 'priya@icici'),
  ('a0000000-0000-0000-0000-000000000003', 'Amit Verma', 'amit@example.com', 'https://api.dicebear.com/7.x/bottts/svg?seed=Amit', '+919876543212', 'amit@paytm'),
  ('a0000000-0000-0000-0000-000000000004', 'Neha Singh', 'neha@example.com', 'https://api.dicebear.com/7.x/bottts/svg?seed=Neha', '+919876543213', 'neha@oksbi')
ON CONFLICT (id) DO NOTHING;

-- Sample Group: Flat 402 Roommates
INSERT INTO public.groups (id, name, description, avatar_emoji, category, created_by)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Flat 402 Bantai', 'Rent, WiFi, Groceries aur Swiggy scenes', '🏠', 'Flatmates', 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000002', 'Goa Trip 2026 🌴', 'Dil Chahta Hai reloaded with scooty & shacks', '🏖️', 'Trip', 'a0000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- Group Members for Flat 402
INSERT INTO public.group_members (group_id, user_id, role)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'owner'),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'admin'),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'member'),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'member'),
  -- Goa Trip Members (Neha is member here too)
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'member'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'owner'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'member')
ON CONFLICT DO NOTHING;

-- Sample Expense 1: Flat Rent ₹36,000 (Equal split amongst 4 members)
-- Rahul paid ₹36,000 (3600000 paise). Rahul, Priya, Amit, Neha each owe ₹9,000 (900000 paise)
INSERT INTO public.expenses (id, group_id, title, description, amount_paise, category, expense_date, split_type, created_by)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'October Flat Rent', 'Paid to landlord Uncle', 3600000, 'rent_stay', CURRENT_DATE - 5, 'EQUAL', 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

INSERT INTO public.expense_payers (expense_id, user_id, amount_paid_paise)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 3600000)
ON CONFLICT DO NOTHING;

INSERT INTO public.expense_participants (expense_id, user_id, share_amount_paise, raw_share_value, is_excluded)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 900000, 1, false),
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 900000, 1, false),
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 900000, 1, false),
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 900000, 1, false)
ON CONFLICT DO NOTHING;

-- Sample Expense 2: Dinner Party ₹1,500 (CRITICAL REQUIREMENT: Neha is EXCLUDED!)
-- Rahul paid ₹1,500 (150000 paise). Rahul, Priya, Amit participated (₹500 each). Neha is excluded (₹0 liability).
INSERT INTO public.expenses (id, group_id, title, description, amount_paise, category, expense_date, split_type, created_by)
VALUES
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Briyani Night at Behrouz', 'Biryani + Gulab Jamun (Neha out of town)', 150000, 'food_dining', CURRENT_DATE - 2, 'EQUAL', 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

INSERT INTO public.expense_payers (expense_id, user_id, amount_paid_paise)
VALUES
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 150000)
ON CONFLICT DO NOTHING;

INSERT INTO public.expense_participants (expense_id, user_id, share_amount_paise, raw_share_value, is_excluded)
VALUES
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 50000, 1, false),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 50000, 1, false),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 50000, 1, false),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', 0, 0, true)
ON CONFLICT DO NOTHING;

-- Sample Expense 3: Chai & Samosa ₹120 (Amit paid, Priya & Rahul shared)
INSERT INTO public.expenses (id, group_id, title, description, amount_paise, category, expense_date, split_type, created_by)
VALUES
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'Tapri Chai & Bun Maska', 'Evening cutting chai break', 12000, 'chai_snacks', CURRENT_DATE - 1, 'EQUAL', 'a0000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

INSERT INTO public.expense_payers (expense_id, user_id, amount_paid_paise)
VALUES
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 12000)
ON CONFLICT DO NOTHING;

INSERT INTO public.expense_participants (expense_id, user_id, share_amount_paise, raw_share_value, is_excluded)
VALUES
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 4000, 1, false),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 4000, 1, false),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 4000, 1, false),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', 0, 0, true)
ON CONFLICT DO NOTHING;

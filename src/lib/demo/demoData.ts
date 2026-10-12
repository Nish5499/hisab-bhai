import { Group, UserProfile, Expense, Settlement, AppNotification } from '../../types';

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    full_name: 'Rahul Sharma',
    email: 'rahul@hisabbhai.in',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Rahul',
    phone_number: '+91 98765 43210',
    upi_id: 'rahul@okhdfcbank',
    preferred_currency: 'INR',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    full_name: 'Priya Patel',
    email: 'priya@hisabbhai.in',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Priya',
    phone_number: '+91 98765 43211',
    upi_id: 'priya@icici',
    preferred_currency: 'INR',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    full_name: 'Amit Verma',
    email: 'amit@hisabbhai.in',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Amit',
    phone_number: '+91 98765 43212',
    upi_id: 'amit@paytm',
    preferred_currency: 'INR',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000004',
    full_name: 'Neha Singh',
    email: 'neha@hisabbhai.in',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Neha',
    phone_number: '+91 98765 43213',
    upi_id: 'neha@oksbi',
    preferred_currency: 'INR',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_DEMO_GROUPS: Group[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    name: 'Flat 402 Bantai',
    description: 'Rent, WiFi, Groceries aur Swiggy scenes',
    avatar_emoji: '🏠',
    category: 'Flatmates',
    simplify_debts: true,
    created_by: 'a0000000-0000-0000-0000-000000000001',
    created_at: '2026-10-01T10:00:00Z',
    updated_at: '2026-10-01T10:00:00Z',
    members: [
      { id: 'm1', group_id: 'b0000000-0000-0000-0000-000000000001', user_id: 'a0000000-0000-0000-0000-000000000001', role: 'owner', joined_at: '2026-10-01T10:00:00Z', profile: DEMO_USERS[0] },
      { id: 'm2', group_id: 'b0000000-0000-0000-0000-000000000001', user_id: 'a0000000-0000-0000-0000-000000000002', role: 'admin', joined_at: '2026-10-01T10:00:00Z', profile: DEMO_USERS[1] },
      { id: 'm3', group_id: 'b0000000-0000-0000-0000-000000000001', user_id: 'a0000000-0000-0000-0000-000000000003', role: 'member', joined_at: '2026-10-01T10:00:00Z', profile: DEMO_USERS[2] },
      { id: 'm4', group_id: 'b0000000-0000-0000-0000-000000000001', user_id: 'a0000000-0000-0000-0000-000000000004', role: 'member', joined_at: '2026-10-01T10:00:00Z', profile: DEMO_USERS[3] },
    ],
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    name: 'Goa Trip 2026 🌴',
    description: 'Dil Chahta Hai reloaded with scooty & shacks',
    avatar_emoji: '🏖️',
    category: 'Trip',
    simplify_debts: true,
    created_by: 'a0000000-0000-0000-0000-000000000002',
    created_at: '2026-10-05T12:00:00Z',
    updated_at: '2026-10-05T12:00:00Z',
    members: [
      { id: 'm5', group_id: 'b0000000-0000-0000-0000-000000000002', user_id: 'a0000000-0000-0000-0000-000000000001', role: 'member', joined_at: '2026-10-05T12:00:00Z', profile: DEMO_USERS[0] },
      { id: 'm6', group_id: 'b0000000-0000-0000-0000-000000000002', user_id: 'a0000000-0000-0000-0000-000000000002', role: 'owner', joined_at: '2026-10-05T12:00:00Z', profile: DEMO_USERS[1] },
      { id: 'm7', group_id: 'b0000000-0000-0000-0000-000000000002', user_id: 'a0000000-0000-0000-0000-000000000003', role: 'member', joined_at: '2026-10-05T12:00:00Z', profile: DEMO_USERS[2] },
    ],
  },
];

export const INITIAL_DEMO_EXPENSES: Expense[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    group_id: 'b0000000-0000-0000-0000-000000000001',
    title: 'October Flat Rent',
    description: 'Paid to landlord Uncle',
    amount_paise: 3600000, // ₹36,000
    category: 'rent_stay',
    expense_date: '2026-10-05',
    split_type: 'EQUAL',
    created_by: 'a0000000-0000-0000-0000-000000000001',
    created_at: '2026-10-05T10:00:00Z',
    updated_at: '2026-10-05T10:00:00Z',
    payers: [
      { user_id: 'a0000000-0000-0000-0000-000000000001', amount_paid_paise: 3600000, profile: DEMO_USERS[0] },
    ],
    participants: [
      { user_id: 'a0000000-0000-0000-0000-000000000001', share_amount_paise: 900000, raw_share_value: 1, is_excluded: false, profile: DEMO_USERS[0] },
      { user_id: 'a0000000-0000-0000-0000-000000000002', share_amount_paise: 900000, raw_share_value: 1, is_excluded: false, profile: DEMO_USERS[1] },
      { user_id: 'a0000000-0000-0000-0000-000000000003', share_amount_paise: 900000, raw_share_value: 1, is_excluded: false, profile: DEMO_USERS[2] },
      { user_id: 'a0000000-0000-0000-0000-000000000004', share_amount_paise: 900000, raw_share_value: 1, is_excluded: false, profile: DEMO_USERS[3] },
    ],
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    group_id: 'b0000000-0000-0000-0000-000000000001',
    title: 'Biryani Night at Behrouz',
    description: 'Biryani + Gulab Jamun (Neha out of town)',
    amount_paise: 150000, // ₹1,500
    category: 'food_dining',
    expense_date: '2026-10-10',
    split_type: 'EQUAL',
    created_by: 'a0000000-0000-0000-0000-000000000001',
    created_at: '2026-10-10T21:00:00Z',
    updated_at: '2026-10-10T21:00:00Z',
    payers: [
      { user_id: 'a0000000-0000-0000-0000-000000000001', amount_paid_paise: 150000, profile: DEMO_USERS[0] },
    ],
    participants: [
      { user_id: 'a0000000-0000-0000-0000-000000000001', share_amount_paise: 50000, raw_share_value: 1, is_excluded: false, profile: DEMO_USERS[0] },
      { user_id: 'a0000000-0000-0000-0000-000000000002', share_amount_paise: 50000, raw_share_value: 1, is_excluded: false, profile: DEMO_USERS[1] },
      { user_id: 'a0000000-0000-0000-0000-000000000003', share_amount_paise: 50000, raw_share_value: 1, is_excluded: false, profile: DEMO_USERS[2] },
      { user_id: 'a0000000-0000-0000-0000-000000000004', share_amount_paise: 0, raw_share_value: 0, is_excluded: true, profile: DEMO_USERS[3] },
    ],
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    group_id: 'b0000000-0000-0000-0000-000000000001',
    title: 'Tapri Chai & Bun Maska',
    description: 'Evening cutting chai break',
    amount_paise: 12000, // ₹120
    category: 'chai_snacks',
    expense_date: '2026-10-11',
    split_type: 'EQUAL',
    created_by: 'a0000000-0000-0000-0000-000000000003',
    created_at: '2026-10-11T17:30:00Z',
    updated_at: '2026-10-11T17:30:00Z',
    payers: [
      { user_id: 'a0000000-0000-0000-0000-000000000003', amount_paid_paise: 12000, profile: DEMO_USERS[2] },
    ],
    participants: [
      { user_id: 'a0000000-0000-0000-0000-000000000001', share_amount_paise: 4000, raw_share_value: 1, is_excluded: false, profile: DEMO_USERS[0] },
      { user_id: 'a0000000-0000-0000-0000-000000000002', share_amount_paise: 4000, raw_share_value: 1, is_excluded: false, profile: DEMO_USERS[1] },
      { user_id: 'a0000000-0000-0000-0000-000000000003', share_amount_paise: 4000, raw_share_value: 1, is_excluded: false, profile: DEMO_USERS[2] },
      { user_id: 'a0000000-0000-0000-0000-000000000004', share_amount_paise: 0, raw_share_value: 0, is_excluded: true, profile: DEMO_USERS[3] },
    ],
  },
];

export const INITIAL_DEMO_SETTLEMENTS: Settlement[] = [];

export const INITIAL_DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    user_id: 'a0000000-0000-0000-0000-000000000001',
    title: 'Tapri Chai Added ☕',
    message: 'Amit added Tapri Chai & Bun Maska (₹120). Your share: ₹40',
    link_url: '/groups/b0000000-0000-0000-0000-000000000001',
    is_read: false,
    created_at: '2026-10-11T17:35:00Z',
  },
  {
    id: 'n2',
    user_id: 'a0000000-0000-0000-0000-000000000001',
    title: 'Bhai, Hisaab Clear Kar! 💸',
    message: 'Priya owes you ₹9,540 for October rent and biryani.',
    link_url: '/groups/b0000000-0000-0000-0000-000000000001',
    is_read: true,
    created_at: '2026-10-10T22:00:00Z',
  },
];

export type GroupRole = 'owner' | 'admin' | 'member';

export type SplitMethod = 'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARES';

export type SettlementStatus = 'RECORDED' | 'CONFIRMED' | 'REVERSED';

export type ExpenseCategory =
  | 'chai_snacks'
  | 'food_dining'
  | 'groceries'
  | 'rent_stay'
  | 'utilities_bills'
  | 'travel_cabs'
  | 'shopping'
  | 'entertainment'
  | 'medical'
  | 'other';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  phone_number?: string;
  upi_id?: string;
  preferred_currency: string;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  avatar_emoji: string;
  category: string;
  simplify_debts: boolean;
  created_by?: string;
  is_deleted?: boolean;
  created_at: string;
  updated_at: string;
  members?: GroupMember[];
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: GroupRole;
  joined_at: string;
  profile?: UserProfile;
}

export interface ExpensePayer {
  id?: string;
  expense_id?: string;
  user_id: string;
  amount_paid_paise: number; // Integer paise
  profile?: UserProfile;
}

export interface ExpenseParticipant {
  id?: string;
  expense_id?: string;
  user_id: string;
  share_amount_paise: number; // Integer paise
  raw_share_value: number; // e.g. percentage or number of shares or exact input
  is_excluded: boolean;
  profile?: UserProfile;
}

export interface Expense {
  id: string;
  group_id: string;
  title: string;
  description?: string;
  amount_paise: number; // Integer paise
  category: ExpenseCategory;
  expense_date: string; // YYYY-MM-DD
  split_type: SplitMethod;
  receipt_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  payers: ExpensePayer[];
  participants: ExpenseParticipant[];
  creator_profile?: UserProfile;
}

export interface Settlement {
  id: string;
  group_id: string;
  payer_id: string;
  receiver_id: string;
  amount_paise: number; // Integer paise
  notes?: string;
  proof_url?: string;
  status: SettlementStatus;
  created_by: string;
  settled_at: string;
  created_at: string;
  updated_at: string;
  payer_profile?: UserProfile;
  receiver_profile?: UserProfile;
}

export interface SuggestedTransfer {
  fromUserId: string; // Debtor
  toUserId: string;   // Creditor
  amount_paise: number;
  fromName: string;
  toName: string;
  fromAvatar?: string;
  toAvatar?: string;
  fromUpi?: string;
  toUpi?: string;
}

export interface GroupBalances {
  userId: string;
  userName: string;
  userAvatar?: string;
  userUpi?: string;
  totalPaidPaise: number;
  totalOwedPaise: number;
  netBalancePaise: number; // Positive = gets back money, Negative = owes money
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link_url?: string;
  is_read: boolean;
  created_at: string;
}

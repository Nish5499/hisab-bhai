import { describe, it, expect } from 'vitest';
import {
  formatInr,
  rupeesToPaise,
  paiseToRupees,
  calculateSplitShares,
  calculateGroupBalances,
  simplifyDebts,
} from './calculations';
import { Expense, Settlement } from '../../types';

describe('Indian Currency Formatting (formatInr)', () => {
  it('formats rupees with Indian numbering system correctly', () => {
    expect(formatInr(150000)).toBe('₹1,500.00');
    expect(formatInr(15000000)).toBe('₹1,50,000.00');
    expect(formatInr(0)).toBe('₹0.00');
    expect(formatInr(-50000)).toBe('-₹500.00');
  });

  it('handles optional sign flag', () => {
    expect(formatInr(250000, { showSign: true })).toBe('+₹2,500.00');
    expect(formatInr(-250000, { showSign: true })).toBe('-₹2,500.00');
  });

  it('converts decimal rupees to integer paise accurately', () => {
    expect(rupeesToPaise('1500.50')).toBe(150050);
    expect(rupeesToPaise(100)).toBe(10000);
    expect(paiseToRupees(150050)).toBe(1500.5);
  });
});

describe('Split Calculations with Zero Paise Leakage (calculateSplitShares)', () => {
  it('splits ₹100 (10,000 paise) equally among 3 people without losing a single paise', () => {
    const participants = [
      { userId: 'u1', isExcluded: false },
      { userId: 'u2', isExcluded: false },
      { userId: 'u3', isExcluded: false },
    ];
    const shares = calculateSplitShares(10000, participants, 'EQUAL');

    const totalCalculated = shares.reduce((sum, s) => sum + s.sharePaise, 0);
    expect(totalCalculated).toBe(10000);

    // 10000 / 3 = 3333 with remainder 1 -> u1 gets 3334, u2 gets 3333, u3 gets 3333
    expect(shares[0].sharePaise).toBe(3334);
    expect(shares[1].sharePaise).toBe(3333);
    expect(shares[2].sharePaise).toBe(3333);
  });

  it('guarantees EXCLUDED participants receive 0 paise liability', () => {
    const participants = [
      { userId: 'rahul', isExcluded: false },
      { userId: 'priya', isExcluded: false },
      { userId: 'amit', isExcluded: false },
      { userId: 'neha', isExcluded: true }, // Neha is excluded!
    ];

    // Dinner ₹1,500 = 150000 paise
    const shares = calculateSplitShares(150000, participants, 'EQUAL');

    const nehaShare = shares.find(s => s.userId === 'neha');
    expect(nehaShare?.sharePaise).toBe(0);
    expect(nehaShare?.isExcluded).toBe(true);

    const rahulShare = shares.find(s => s.userId === 'rahul');
    const priyaShare = shares.find(s => s.userId === 'priya');
    const amitShare = shares.find(s => s.userId === 'amit');

    expect(rahulShare?.sharePaise).toBe(50000); // ₹500
    expect(priyaShare?.sharePaise).toBe(50000); // ₹500
    expect(amitShare?.sharePaise).toBe(50000); // ₹500

    const totalAllocated = shares.reduce((sum, s) => sum + s.sharePaise, 0);
    expect(totalAllocated).toBe(150000);
  });

  it('splits by percentage with residual distribution', () => {
    const participants = [
      { userId: 'u1', isExcluded: false, rawValue: 50 },
      { userId: 'u2', isExcluded: false, rawValue: 25 },
      { userId: 'u3', isExcluded: false, rawValue: 25 },
    ];
    const shares = calculateSplitShares(10000, participants, 'PERCENTAGE');
    expect(shares.find(s => s.userId === 'u1')?.sharePaise).toBe(5000);
    expect(shares.find(s => s.userId === 'u2')?.sharePaise).toBe(2500);
    expect(shares.find(s => s.userId === 'u3')?.sharePaise).toBe(2500);
  });

  it('splits by shares / weighted ratio', () => {
    const participants = [
      { userId: 'u1', isExcluded: false, rawValue: 2 }, // 2 shares
      { userId: 'u2', isExcluded: false, rawValue: 1 }, // 1 share
    ];
    // ₹300 = 30000 paise
    const shares = calculateSplitShares(30000, participants, 'SHARES');
    expect(shares.find(s => s.userId === 'u1')?.sharePaise).toBe(20000);
    expect(shares.find(s => s.userId === 'u2')?.sharePaise).toBe(10000);
  });
});

describe('Group Balances & Debt Simplification', () => {
  const members = [
    { user_id: 'rahul', profile: { id: 'rahul', full_name: 'Rahul', email: 'rahul@test.com', preferred_currency: 'INR', created_at: '', updated_at: '' } },
    { user_id: 'priya', profile: { id: 'priya', full_name: 'Priya', email: 'priya@test.com', preferred_currency: 'INR', created_at: '', updated_at: '' } },
    { user_id: 'amit', profile: { id: 'amit', full_name: 'Amit', email: 'amit@test.com', preferred_currency: 'INR', created_at: '', updated_at: '' } },
  ];

  it('calculates group balances accurately when Rahul pays ₹1,500 for dinner for 3', () => {
    const expenses: Expense[] = [
      {
        id: 'e1',
        group_id: 'g1',
        title: 'Dinner',
        amount_paise: 150000,
        category: 'food_dining',
        expense_date: '2026-10-12',
        split_type: 'EQUAL',
        created_by: 'rahul',
        created_at: '',
        updated_at: '',
        payers: [{ user_id: 'rahul', amount_paid_paise: 150000 }],
        participants: [
          { user_id: 'rahul', share_amount_paise: 50000, raw_share_value: 1, is_excluded: false },
          { user_id: 'priya', share_amount_paise: 50000, raw_share_value: 1, is_excluded: false },
          { user_id: 'amit', share_amount_paise: 50000, raw_share_value: 1, is_excluded: false },
        ],
      },
    ];

    const balances = calculateGroupBalances(members, expenses, []);

    const rahulBal = balances.find(b => b.userId === 'rahul');
    const priyaBal = balances.find(b => b.userId === 'priya');
    const amitBal = balances.find(b => b.userId === 'amit');

    // Rahul paid 1500, owes 500 -> net +1000 (100000 paise)
    expect(rahulBal?.netBalancePaise).toBe(100000);
    // Priya paid 0, owes 500 -> net -500 (-50000 paise)
    expect(priyaBal?.netBalancePaise).toBe(-50000);
    // Amit paid 0, owes 500 -> net -500 (-50000 paise)
    expect(amitBal?.netBalancePaise).toBe(-50000);

    // Sum of net balances must be zero
    const sumNet = balances.reduce((sum, b) => sum + b.netBalancePaise, 0);
    expect(sumNet).toBe(0);

    // Simplify debts
    const transfers = simplifyDebts(balances);
    expect(transfers.length).toBe(2);

    // Transfers should be Priya -> Rahul: ₹500 and Amit -> Rahul: ₹500
    expect(transfers.some(t => t.fromUserId === 'priya' && t.toUserId === 'rahul' && t.amount_paise === 50000)).toBe(true);
    expect(transfers.some(t => t.fromUserId === 'amit' && t.toUserId === 'rahul' && t.amount_paise === 50000)).toBe(true);
  });

  it('updates net balances correctly when a partial settlement is recorded', () => {
    const expenses: Expense[] = [
      {
        id: 'e1',
        group_id: 'g1',
        title: 'Dinner',
        amount_paise: 150000,
        category: 'food_dining',
        expense_date: '2026-10-12',
        split_type: 'EQUAL',
        created_by: 'rahul',
        created_at: '',
        updated_at: '',
        payers: [{ user_id: 'rahul', amount_paid_paise: 150000 }],
        participants: [
          { user_id: 'rahul', share_amount_paise: 50000, raw_share_value: 1, is_excluded: false },
          { user_id: 'priya', share_amount_paise: 50000, raw_share_value: 1, is_excluded: false },
          { user_id: 'amit', share_amount_paise: 50000, raw_share_value: 1, is_excluded: false },
        ],
      },
    ];

    // Priya pays ₹300 (30000 paise) to Rahul
    const settlements: Settlement[] = [
      {
        id: 's1',
        group_id: 'g1',
        payer_id: 'priya',
        receiver_id: 'rahul',
        amount_paise: 30000,
        status: 'RECORDED',
        created_by: 'priya',
        settled_at: '2026-10-12',
        created_at: '',
        updated_at: '',
      },
    ];

    const balances = calculateGroupBalances(members, expenses, settlements);
    const priyaBal = balances.find(b => b.userId === 'priya');
    const rahulBal = balances.find(b => b.userId === 'rahul');

    // Priya now owes -200 (-20000 paise)
    expect(priyaBal?.netBalancePaise).toBe(-20000);
    // Rahul now gets back +700 (70000 paise)
    expect(rahulBal?.netBalancePaise).toBe(70000);
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MoneyFlowVisualizer } from './MoneyFlowVisualizer';
import { Expense } from '../../types';

describe('MoneyFlowVisualizer Component', () => {
  const sampleExpense: Expense = {
    id: 'exp-1',
    group_id: 'grp-1',
    title: 'Behrouz Biryani Feast',
    amount_paise: 150000, // ₹1,500
    category: 'food_dining',
    expense_date: '2026-10-12',
    split_type: 'EQUAL',
    created_by: 'u1',
    created_at: '',
    updated_at: '',
    payers: [
      {
        user_id: 'u1',
        amount_paid_paise: 150000,
        profile: { id: 'u1', full_name: 'Rahul Sharma', email: 'rahul@test.com', preferred_currency: 'INR', created_at: '', updated_at: '' },
      },
    ],
    participants: [
      {
        user_id: 'u1',
        share_amount_paise: 50000,
        raw_share_value: 1,
        is_excluded: false,
        profile: { id: 'u1', full_name: 'Rahul Sharma', email: 'rahul@test.com', preferred_currency: 'INR', created_at: '', updated_at: '' },
      },
      {
        user_id: 'u2',
        share_amount_paise: 50000,
        raw_share_value: 1,
        is_excluded: false,
        profile: { id: 'u2', full_name: 'Priya Patel', email: 'priya@test.com', preferred_currency: 'INR', created_at: '', updated_at: '' },
      },
      {
        user_id: 'u3',
        share_amount_paise: 50000,
        raw_share_value: 1,
        is_excluded: false,
        profile: { id: 'u3', full_name: 'Amit Verma', email: 'amit@test.com', preferred_currency: 'INR', created_at: '', updated_at: '' },
      },
      {
        user_id: 'u4',
        share_amount_paise: 0,
        raw_share_value: 0,
        is_excluded: true, // EXCLUDED MEMBER
        profile: { id: 'u4', full_name: 'Neha Singh', email: 'neha@test.com', preferred_currency: 'INR', created_at: '', updated_at: '' },
      },
    ],
  };

  it('renders payer name and total expense amount', () => {
    render(<MoneyFlowVisualizer expense={sampleExpense} />);
    const rahulElements = screen.getAllByText('Rahul Sharma');
    const amountElements = screen.getAllByText(/1,500/);
    expect(amountElements.length).toBeGreaterThanOrEqual(1);
  });

  it('clearly identifies and renders EXCLUDED participants with ₹0 liability', () => {
    render(<MoneyFlowVisualizer expense={sampleExpense} />);
    expect(screen.getByText(/Excluded from this Expense/i)).toBeInTheDocument();
    expect(screen.getByText('Neha Singh')).toBeInTheDocument();
    expect(screen.getByText(/₹0 \(Not Included\)/i)).toBeInTheDocument();
  });
});

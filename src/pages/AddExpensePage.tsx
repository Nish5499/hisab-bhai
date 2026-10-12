import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { useData } from '../features/data/DataContext';
import { SplitMethod, ExpenseCategory } from '../types';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { rupeesToPaise, formatInr, calculateSplitShares } from '../lib/money/calculations';
import { ArrowLeft, Check, UserX, AlertCircle, Plus, Trash2 } from 'lucide-react';

const CATEGORIES: { id: ExpenseCategory; label: string; emoji: string }[] = [
  { id: 'chai_snacks', label: 'Chai & Snacks', emoji: '☕' },
  { id: 'food_dining', label: 'Food & Zomato', emoji: '🍛' },
  { id: 'groceries', label: 'Blinkit / Groceries', emoji: '🛒' },
  { id: 'rent_stay', label: 'Rent & Stay', emoji: '🏠' },
  { id: 'utilities_bills', label: 'WiFi & Bills', emoji: '⚡' },
  { id: 'travel_cabs', label: 'Uber / Auto / Fuel', emoji: '🚖' },
  { id: 'entertainment', label: 'Movie & Parties', emoji: '🎉' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { id: 'medical', label: 'Medical & Health', emoji: '💊' },
  { id: 'other', label: 'Other', emoji: '🪙' },
];

export const AddExpensePage: React.FC = () => {
  const { profile, user } = useAuth();
  const { groups, addExpense } = useData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const currentUserId = profile?.id || user?.id || '';
  const initialGroupId = searchParams.get('groupId') || (groups[0]?.id ?? '');

  // Form states
  const [groupId, setGroupId] = useState<string>(initialGroupId);
  const [title, setTitle] = useState('');
  const [amountRupees, setAmountRupees] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food_dining');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('EQUAL');

  // Single or multiple payers
  const [payerMode, setPayerMode] = useState<'single' | 'multiple'>('single');
  const [singlePayerId, setSinglePayerId] = useState<string>(currentUserId);
  const [multiplePayers, setMultiplePayers] = useState<{ userId: string; amountRupees: string }[]>([]);

  // Participants (included / excluded and custom share inputs)
  const [participants, setParticipants] = useState<
    { userId: string; isExcluded: boolean; rawValue: string }[]
  >([]);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const selectedGroup = groups.find(g => g.id === groupId);

  // Initialize participants when group changes
  useEffect(() => {
    if (selectedGroup?.members) {
      setParticipants(
        selectedGroup.members.map(m => ({
          userId: m.user_id,
          isExcluded: false,
          rawValue: splitMethod === 'PERCENTAGE' ? (100 / selectedGroup.members!.length).toFixed(1) : '1',
        }))
      );
      setMultiplePayers(
        selectedGroup.members.map(m => ({
          userId: m.user_id,
          amountRupees: m.user_id === currentUserId ? amountRupees : '0',
        }))
      );
      if (!singlePayerId) {
        setSinglePayerId(currentUserId || selectedGroup.members[0].user_id);
      }
    }
  }, [groupId, selectedGroup]);

  // Handle participant exclusion toggle
  const toggleParticipantExcluded = (userId: string) => {
    setParticipants(prev =>
      prev.map(p => (p.userId === userId ? { ...p, isExcluded: !p.isExcluded } : p))
    );
  };

  const updateRawValue = (userId: string, val: string) => {
    setParticipants(prev =>
      prev.map(p => (p.userId === userId ? { ...p, rawValue: val } : p))
    );
  };

  // Calculate live preview of shares
  const totalPaise = rupeesToPaise(amountRupees || '0');
  let calculatedShares: { userId: string; sharePaise: number; isExcluded: boolean }[] = [];
  let calculationError: string | null = null;

  try {
    if (totalPaise > 0 && participants.length > 0) {
      const shareInputs = participants.map(p => ({
        userId: p.userId,
        isExcluded: p.isExcluded,
        rawValue:
          splitMethod === 'EXACT'
            ? rupeesToPaise(p.rawValue || '0')
            : parseFloat(p.rawValue || '0'),
      }));
      calculatedShares = calculateSplitShares(totalPaise, shareInputs, splitMethod);
    }
  } catch (err: any) {
    calculationError = err.message;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide an expense title.');
      return;
    }

    if (totalPaise <= 0) {
      setError('Please enter a valid expense amount greater than ₹0.');
      return;
    }

    if (calculationError) {
      setError(calculationError);
      return;
    }

    const activeParticipants = participants.filter(p => !p.isExcluded);
    if (activeParticipants.length === 0) {
      setError('At least one person must be included in the split.');
      return;
    }

    // Prepare payers
    let payersPayload: { userId: string; amountPaidPaise: number }[] = [];
    if (payerMode === 'single') {
      payersPayload = [{ userId: singlePayerId, amountPaidPaise: totalPaise }];
    } else {
      let sumPaid = 0;
      payersPayload = multiplePayers
        .map(p => {
          const paise = rupeesToPaise(p.amountRupees || '0');
          sumPaid += paise;
          return { userId: p.userId, amountPaidPaise: paise };
        })
        .filter(p => p.amountPaidPaise > 0);

      if (sumPaid !== totalPaise) {
        setError(`Total paid amounts (₹${sumPaid / 100}) must equal total expense (₹${totalPaise / 100}).`);
        return;
      }
    }

    // Prepare participants
    const participantsPayload = calculatedShares.map(s => {
      const original = participants.find(p => p.userId === s.userId);
      return {
        userId: s.userId,
        shareAmountPaise: s.sharePaise,
        rawShareValue: parseFloat(original?.rawValue || '1'),
        isExcluded: s.isExcluded,
      };
    });

    setIsLoading(true);
    try {
      await addExpense({
        groupId,
        title: title.trim(),
        amountPaise: totalPaise,
        category,
        expenseDate,
        splitType: splitMethod,
        payers: payersPayload,
        participants: participantsPayload,
      });

      navigate(`/groups/${groupId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to save expense');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-neutral-600 hover:text-black"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel
        </button>
        <span className="text-xs font-black uppercase text-neutral-500">
          New Transaction
        </span>
      </div>

      <div className="bg-white border-3 border-black rounded-3xl p-6 sm:p-8 shadow-neo-lg space-y-6">
        <div>
          <h2 className="text-2xl font-black font-display text-black flex items-center gap-2">
            <span>💸</span> Add an Expense
          </h2>
          <p className="text-xs font-bold text-neutral-600">
            Split rent, biryani, or chai with zero paise loss and excluded member support.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl border-2 border-black bg-red-100 text-red-900 text-xs font-bold flex items-center gap-2 shadow-neo-sm">
            <AlertCircle className="w-4 h-4 text-red-700 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Group */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
              1. Group
            </label>
            <select
              value={groupId}
              onChange={e => setGroupId(e.target.value)}
              className="neo-input text-sm font-bold"
            >
              {groups.map(g => (
                <option key={g.id} value={g.id}>
                  {g.avatar_emoji} {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title & Amount in INR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
                2. Title / Description
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Behrouz Biryani or October Rent"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="neo-input text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
                3. Total Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-lg font-black text-black">₹</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="1500"
                  value={amountRupees}
                  onChange={e => setAmountRupees(e.target.value)}
                  className="neo-input pl-9 text-lg font-black"
                />
              </div>
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
              4. Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-2 rounded-xl border-2 text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    category === cat.id
                      ? 'bg-[#FFE600] border-black shadow-neo-sm font-black'
                      : 'border-neutral-300 hover:border-black bg-white'
                  }`}
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="truncate w-full text-center text-[11px]">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
              5. Expense Date
            </label>
            <input
              type="date"
              value={expenseDate}
              onChange={e => setExpenseDate(e.target.value)}
              className="neo-input text-sm font-bold"
            />
          </div>

          {/* Who Paid (Single vs Multi-Payer) */}
          <div className="p-4 bg-[#FFFDF0] rounded-2xl border-2 border-black space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-black">
                6. Kisne Diya Paisa? (Who Paid)
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setPayerMode('single')}
                  className={`px-2.5 py-1 text-[11px] font-black rounded-lg border-2 ${
                    payerMode === 'single'
                      ? 'bg-[#FFE600] border-black shadow-neo-sm'
                      : 'border-transparent text-neutral-600'
                  }`}
                >
                  Single Payer
                </button>
                <button
                  type="button"
                  onClick={() => setPayerMode('multiple')}
                  className={`px-2.5 py-1 text-[11px] font-black rounded-lg border-2 ${
                    payerMode === 'multiple'
                      ? 'bg-[#FFE600] border-black shadow-neo-sm'
                      : 'border-transparent text-neutral-600'
                  }`}
                >
                  Multiple Payers
                </button>
              </div>
            </div>

            {payerMode === 'single' ? (
              <select
                value={singlePayerId}
                onChange={e => setSinglePayerId(e.target.value)}
                className="neo-input text-sm font-bold"
              >
                {selectedGroup?.members?.map(m => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.profile?.full_name} {m.user_id === currentUserId ? '(You)' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-2">
                {multiplePayers.map((mp, idx) => {
                  const mProf = selectedGroup?.members?.find(m => m.user_id === mp.userId)?.profile;
                  return (
                    <div key={mp.userId} className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold truncate">{mProf?.full_name}</span>
                      <div className="relative w-36">
                        <span className="absolute left-2.5 top-2 text-xs font-bold text-black">₹</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={mp.amountRupees}
                          onChange={e => {
                            const val = e.target.value;
                            setMultiplePayers(prev =>
                              prev.map((item, i) => (i === idx ? { ...item, amountRupees: val } : item))
                            );
                          }}
                          className="neo-input pl-6 py-1.5 text-xs font-bold"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Split Method Tabs */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
              7. Split Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'EQUAL', label: 'Equally (=)' },
                { id: 'EXACT', label: 'Exact Amounts (₹)' },
                { id: 'PERCENTAGE', label: 'Percentages (%)' },
                { id: 'SHARES', label: 'Shares / Ratio (x)' },
              ].map(sm => (
                <button
                  type="button"
                  key={sm.id}
                  onClick={() => setSplitMethod(sm.id as SplitMethod)}
                  className={`py-2 px-3 rounded-xl border-2 text-xs font-black transition-all ${
                    splitMethod === sm.id
                      ? 'bg-[#2B59FF] text-white border-black shadow-neo-sm'
                      : 'bg-white border-neutral-300 text-neutral-700 hover:border-black'
                  }`}
                >
                  {sm.label}
                </button>
              ))}
            </div>
          </div>

          {/* CRITICAL FEATURE: Participant Selector with Exclusion Toggle */}
          <div className="p-4 bg-white rounded-2xl border-2 border-black shadow-neo-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b-2 border-black">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-black block">
                  8. Who Participated? (Include / Exclude Members)
                </span>
                <span className="text-[11px] font-semibold text-neutral-500">
                  Tap "Exclude" for anyone who didn’t attend (they get ₹0 liability).
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              {participants.map(part => {
                const member = selectedGroup?.members?.find(m => m.user_id === part.userId);
                const shareCalc = calculatedShares.find(s => s.userId === part.userId);

                return (
                  <div
                    key={part.userId}
                    className={`p-3 rounded-xl border-2 flex items-center justify-between gap-3 transition-colors ${
                      part.isExcluded
                        ? 'bg-neutral-100 border-neutral-300 opacity-60'
                        : 'bg-white border-black'
                    }`}
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar
                        name={member?.profile?.full_name || 'User'}
                        url={member?.profile?.avatar_url}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-black truncate">
                          {member?.profile?.full_name}{' '}
                          {part.userId === currentUserId ? '(You)' : ''}
                        </p>
                        <p className="text-[10px] font-bold text-neutral-500">
                          {part.isExcluded ? 'Excluded from split' : 'Included in split'}
                        </p>
                      </div>
                    </div>

                    {/* Custom input if non-equal split */}
                    {!part.isExcluded && splitMethod !== 'EQUAL' && (
                      <div className="w-24">
                        <input
                          type="number"
                          placeholder={splitMethod === 'PERCENTAGE' ? '%' : splitMethod === 'EXACT' ? '₹' : 'shares'}
                          value={part.rawValue}
                          onChange={e => updateRawValue(part.userId, e.target.value)}
                          className="neo-input py-1 px-2 text-xs font-black text-center"
                        />
                      </div>
                    )}

                    {/* Calculated Share & Exclusion Toggle Button */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-black block">
                          {part.isExcluded
                            ? '₹0'
                            : formatInr(shareCalc?.sharePaise || 0)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleParticipantExcluded(part.userId)}
                        className={`px-2.5 py-1 text-[11px] font-black rounded-lg border-2 transition-all ${
                          part.isExcluded
                            ? 'bg-[#22C55E] text-black border-black hover:bg-[#16A34A]'
                            : 'bg-[#FF4D8D] text-white border-black hover:bg-[#FF337A]'
                        }`}
                      >
                        {part.isExcluded ? 'Include' : 'Exclude'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Save Expense ({formatInr(totalPaise)}) ⚡
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

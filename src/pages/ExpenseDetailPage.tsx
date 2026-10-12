import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { useData } from '../features/data/DataContext';
import { MoneyFlowVisualizer } from '../components/money/MoneyFlowVisualizer';
import { formatInr } from '../lib/money/calculations';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { ArrowLeft, Trash2, Calendar, UserX, Share2 } from 'lucide-react';

export const ExpenseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { expenses, groups, deleteExpense } = useData();
  const [isDeleting, setIsDeleting] = useState(false);

  const expense = expenses.find(e => e.id === id);
  if (!expense) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <h2 className="text-2xl font-black font-display">Expense Not Found</h2>
        <p className="text-sm font-bold text-neutral-600">
          This transaction might have been deleted or does not exist.
        </p>
        <Link to="/dashboard">
          <Button variant="primary">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const group = groups.find(g => g.id === expense.group_id);
  const currentUserId = profile?.id || user?.id || '';

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this expense? Balances will be recalculated.')) {
      setIsDeleting(true);
      try {
        await deleteExpense(expense.id);
        navigate(`/groups/${expense.group_id}`);
      } catch (err) {
        console.error('Delete error:', err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-neutral-600 hover:text-black"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Group
        </button>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-3 py-1.5 rounded-xl border-2 border-black bg-red-100 hover:bg-red-200 text-red-700 text-xs font-black inline-flex items-center gap-1.5 shadow-neo-sm active:translate-x-[1px] active:translate-y-[1px]"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete Expense
        </button>
      </div>

      {/* Main Expense Banner */}
      <div className="bg-white border-3 border-black rounded-3xl p-6 sm:p-8 shadow-neo-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-black">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#FFE600] border-2 border-black flex items-center justify-center text-3xl shadow-neo-sm">
              {expense.category === 'chai_snacks'
                ? '☕'
                : expense.category === 'food_dining'
                ? '🍛'
                : expense.category === 'rent_stay'
                ? '🏠'
                : expense.category === 'travel_cabs'
                ? '🚖'
                : '🧾'}
            </div>
            <div>
              <h1 className="text-2xl font-black font-display text-black">
                {expense.title}
              </h1>
              <p className="text-xs font-bold text-neutral-500 flex items-center gap-2 mt-0.5">
                <span>{group?.name || 'Group Expense'}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {expense.expense_date}
                </span>
              </p>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-3xl font-black font-display text-black block">
              {formatInr(expense.amount_paise)}
            </span>
            <Badge variant="yellow" size="sm">
              Split: {expense.split_type}
            </Badge>
          </div>
        </div>

        {expense.description && (
          <p className="text-xs font-semibold text-neutral-700 bg-[#FFFDF0] p-3 rounded-xl border border-neutral-300">
            {expense.description}
          </p>
        )}
      </div>

      {/* Signature Feature: Animated Money Flow Visualizer */}
      <MoneyFlowVisualizer
        expense={expense}
        title="Animated Paisa Flow Diagram"
      />

      {/* Payers & Participants Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Payers */}
        <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-neo space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-black pb-2 border-b-2 border-black">
            Paid by ({expense.payers.length})
          </h3>
          <div className="space-y-2">
            {expense.payers.map(p => (
              <div key={p.user_id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar name={p.profile?.full_name || 'User'} url={p.profile?.avatar_url} size="sm" />
                  <span className="text-xs font-black">{p.profile?.full_name}</span>
                </div>
                <span className="text-xs font-black text-[#22C55E]">
                  {formatInr(p.amount_paid_paise)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Participants */}
        <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-neo space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-black pb-2 border-b-2 border-black">
            Participants ({expense.participants.length})
          </h3>
          <div className="space-y-2">
            {expense.participants.map(part => (
              <div key={part.user_id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar name={part.profile?.full_name || 'User'} url={part.profile?.avatar_url} size="sm" />
                  <span className="text-xs font-bold">{part.profile?.full_name}</span>
                </div>
                <div>
                  {part.is_excluded ? (
                    <span className="text-[10px] font-black uppercase text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                      Excluded (₹0)
                    </span>
                  ) : (
                    <span className="text-xs font-black text-black">
                      {formatInr(part.share_amount_paise)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

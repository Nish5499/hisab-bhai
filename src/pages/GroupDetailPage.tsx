import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { useData } from '../features/data/DataContext';
import { formatInr } from '../lib/money/calculations';
import { MoneyFlowVisualizer } from '../components/money/MoneyFlowVisualizer';
import { SettlementModal } from '../components/settlement/SettlementModal';
import { SuggestedTransfer } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { ArrowLeft, PlusCircle, Share2, Users, Receipt, Sparkles, Check, CheckCircle2 } from 'lucide-react';

export const GroupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { groups, expenses, settlements, getGroupBalancesForGroup, getGroupTransfersForGroup } = useData();

  const [activeTab, setActiveTab] = useState<'expenses' | 'transfers' | 'members'>('expenses');
  const [selectedTransfer, setSelectedTransfer] = useState<SuggestedTransfer | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

  const group = groups.find(g => g.id === id);
  if (!group) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <h2 className="text-2xl font-black font-display">Group Not Found</h2>
        <p className="text-sm font-bold text-neutral-600">
          This group might have been removed or you are not a member.
        </p>
        <Link to="/groups">
          <Button variant="primary">Back to Groups</Button>
        </Link>
      </div>
    );
  }

  const currentUserId = profile?.id || user?.id || '';
  const groupExpenses = expenses.filter(e => e.group_id === group.id);
  const groupBalances = getGroupBalancesForGroup(group.id);
  const groupTransfers = getGroupTransfersForGroup(group.id);

  const myBal = groupBalances.find(b => b.userId === currentUserId);
  const netPaise = myBal?.netBalancePaise || 0;

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}/join/${group.id}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/groups')}
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-neutral-600 hover:text-black"
        >
          <ArrowLeft className="w-4 h-4" /> All Groups
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyInvite}
            className="px-3 py-1.5 rounded-xl border-2 border-black bg-white hover:bg-neutral-50 shadow-neo-sm text-xs font-black inline-flex items-center gap-1.5 active:translate-x-[1px] active:translate-y-[1px]"
          >
            {copiedInvite ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-600" /> Copied Link!
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" /> Invite Link
              </>
            )}
          </button>

          <Link to={`/expenses/new?groupId=${group.id}`}>
            <Button variant="pink" size="sm">
              <PlusCircle className="w-4 h-4" /> Add Expense
            </Button>
          </Link>
        </div>
      </div>

      {/* Group Hero Card */}
      <div className="bg-[#FFFDF0] border-3 border-black rounded-3xl p-6 sm:p-8 shadow-neo-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-black">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FFE600] border-3 border-black flex items-center justify-center text-4xl shadow-neo-sm">
              {group.avatar_emoji || '🪙'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black font-display text-black">
                  {group.name}
                </h1>
                <Badge variant="blue" size="sm">
                  {group.category}
                </Badge>
              </div>
              <p className="text-xs font-semibold text-neutral-600 mt-1">
                {group.description || 'No description provided'}
              </p>
            </div>
          </div>

          <div className="sm:text-right bg-white p-3.5 rounded-2xl border-2 border-black shadow-neo-sm">
            <span className="text-[11px] font-black uppercase text-neutral-500 block">
              Your Position in this group
            </span>
            <span
              className={`text-xl sm:text-2xl font-black ${
                netPaise > 0
                  ? 'text-[#22C55E]'
                  : netPaise < 0
                  ? 'text-[#FF4D8D]'
                  : 'text-neutral-600'
              }`}
            >
              {formatInr(netPaise, { showSign: true })}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'expenses'
                ? 'bg-[#FFE600] border-black shadow-neo-sm'
                : 'bg-white border-transparent text-neutral-600 hover:border-black'
            }`}
          >
            <Receipt className="w-4 h-4" /> Expenses ({groupExpenses.length})
          </button>
          <button
            onClick={() => setActiveTab('transfers')}
            className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'transfers'
                ? 'bg-[#FFE600] border-black shadow-neo-sm'
                : 'bg-white border-transparent text-neutral-600 hover:border-black'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Balances & Transfers ({groupTransfers.length})
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'members'
                ? 'bg-[#FFE600] border-black shadow-neo-sm'
                : 'bg-white border-transparent text-neutral-600 hover:border-black'
            }`}
          >
            <Users className="w-4 h-4" /> Members ({group.members?.length || 0})
          </button>
        </div>
      </div>

      {/* Tab 1: Expenses */}
      {activeTab === 'expenses' && (
        <div className="space-y-3">
          {groupExpenses.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-neutral-400 rounded-3xl p-10 text-center space-y-3">
              <span className="text-3xl">🧾</span>
              <p className="text-sm font-bold text-neutral-600">
                No expenses in this group yet.
              </p>
              <Link to={`/expenses/new?groupId=${group.id}`}>
                <Button variant="primary" size="sm">
                  Add First Expense
                </Button>
              </Link>
            </div>
          ) : (
            groupExpenses.map(exp => {
              const myParticipant = exp.participants.find(p => p.user_id === currentUserId);
              const isExcluded = myParticipant?.is_excluded;
              const payer = exp.payers[0];

              return (
                <Link
                  key={exp.id}
                  to={`/expenses/${exp.id}`}
                  className="block bg-white border-2 border-black rounded-2xl p-4 shadow-neo hover:-translate-y-0.5 hover:shadow-neo-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#FFFDF0] border-2 border-black flex items-center justify-center text-2xl shadow-neo-sm">
                        {exp.category === 'chai_snacks'
                          ? '☕'
                          : exp.category === 'food_dining'
                          ? '🍛'
                          : exp.category === 'rent_stay'
                          ? '🏠'
                          : exp.category === 'travel_cabs'
                          ? '🚖'
                          : '🧾'}
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-black">{exp.title}</h4>
                        <p className="text-[11px] font-bold text-neutral-500">
                          Paid by {payer?.profile?.full_name?.split(' ')[0] || 'Member'} · {exp.expense_date}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-black block">
                        {formatInr(exp.amount_paise)}
                      </span>
                      {isExcluded ? (
                        <span className="text-[10px] font-black uppercase text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                          You: Excluded (₹0)
                        </span>
                      ) : myParticipant ? (
                        <span className="text-[11px] font-bold text-neutral-600">
                          Your share: {formatInr(myParticipant.share_amount_paise)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Balances & Simplified Transfers */}
      {activeTab === 'transfers' && (
        <div className="space-y-6">
          {/* Greedy Simplified Transfers Visualization */}
          <MoneyFlowVisualizer
            transfers={groupTransfers}
            title="Greedy Debt Simplification"
            onSettleTransfer={t => setSelectedTransfer(t)}
          />

          {/* Individual Member Balances Ledger */}
          <div className="bg-white border-3 border-black rounded-3xl p-6 shadow-neo space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-black pb-2 border-b-2 border-black">
              Individual Balances Ledger
            </h3>
            <div className="space-y-3">
              {groupBalances.map(bal => (
                <div
                  key={bal.userId}
                  className="flex items-center justify-between p-3 rounded-xl border-2 border-black bg-neutral-50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={bal.userName} url={bal.userAvatar} size="sm" />
                    <div>
                      <p className="font-black text-xs">
                        {bal.userName} {bal.userId === currentUserId ? '(You)' : ''}
                      </p>
                      <p className="text-[10px] font-bold text-neutral-500">
                        Paid: {formatInr(bal.totalPaidPaise)} · Owed: {formatInr(bal.totalOwedPaise)}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-sm font-black ${
                      bal.netBalancePaise > 0
                        ? 'text-[#22C55E]'
                        : bal.netBalancePaise < 0
                        ? 'text-[#FF4D8D]'
                        : 'text-neutral-500'
                    }`}
                  >
                    {formatInr(bal.netBalancePaise, { showSign: true })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Members */}
      {activeTab === 'members' && (
        <div className="bg-white border-3 border-black rounded-3xl p-6 shadow-neo space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-black pb-2 border-b-2 border-black">
            Group Members ({group.members?.length || 0})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {group.members?.map(m => (
              <div
                key={m.user_id}
                className="p-3.5 rounded-2xl border-2 border-black bg-[#FFFDF0] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={m.profile?.full_name || 'User'} url={m.profile?.avatar_url} size="md" />
                  <div>
                    <p className="font-black text-sm">
                      {m.profile?.full_name} {m.user_id === currentUserId ? '(You)' : ''}
                    </p>
                    <p className="text-[11px] font-bold text-neutral-500">
                      {m.profile?.upi_id ? `UPI: ${m.profile.upi_id}` : m.profile?.email}
                    </p>
                  </div>
                </div>
                <Badge variant={m.role === 'owner' ? 'yellow' : 'gray'} size="sm">
                  {m.role}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settle Modal Trigger */}
      <SettlementModal
        isOpen={Boolean(selectedTransfer)}
        onClose={() => setSelectedTransfer(null)}
        transfer={selectedTransfer}
        groupId={group.id}
      />
    </div>
  );
};

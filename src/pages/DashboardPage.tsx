import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Users, ArrowUpRight, ArrowDownLeft, Sparkles, CheckCircle2, ChevronRight, QrCode } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { useData } from '../features/data/DataContext';
import { formatInr } from '../lib/money/calculations';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { SettlementModal } from '../components/settlement/SettlementModal';
import { SuggestedTransfer } from '../types';

export const DashboardPage: React.FC = () => {
  const { profile, user } = useAuth();
  const { groups, expenses, settlements, getPersonalBalanceSummary, getGroupBalancesForGroup, getGroupTransfersForGroup } = useData();
  const [selectedTransfer, setSelectedTransfer] = useState<SuggestedTransfer | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string>('');

  const currentUserId = profile?.id || user?.id || '';
  const summary = getPersonalBalanceSummary(currentUserId);

  // Get user's groups
  const userGroups = groups.filter(g => g.members?.some(m => m.user_id === currentUserId));

  // Get recent 5 expenses across user's groups
  const recentExpenses = expenses
    .filter(e => userGroups.some(g => g.id === e.group_id))
    .slice(0, 5);

  // Collect all suggested transfers involving current user across all their groups
  const myPendingTransfers: { transfer: SuggestedTransfer; groupId: string; groupName: string }[] = [];
  userGroups.forEach(g => {
    const transfers = getGroupTransfersForGroup(g.id);
    transfers.forEach(t => {
      if (t.fromUserId === currentUserId || t.toUserId === currentUserId) {
        myPendingTransfers.push({ transfer: t, groupId: g.id, groupName: g.name });
      }
    });
  });

  const getGreeting = () => {
    const name = profile?.full_name?.split(' ')[0] || 'Bhai';
    if (summary.netBalancePaise > 0) {
      return `Yo, ${name}! Log tera paisa daba ke baithe hain! 💰`;
    } else if (summary.netBalancePaise < 0) {
      return `Bhai ${name}, hisaab clear kar! Udhaar pending hai. 💸`;
    }
    return `Yo, ${name}! Scene sorted hai, chill maar! ☕`;
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Greeting Banner */}
      <div className="bg-[#FFE600] border-3 border-black rounded-3xl p-6 shadow-neo-lg relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <Badge variant="blue" size="sm" className="mb-2">
            Hisaab Overview
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-black leading-tight">
            {getGreeting()}
          </h2>
          <p className="text-xs sm:text-sm font-bold text-black/80 mt-1">
            Indian style expense tracking with integer paise accuracy.
          </p>
        </div>
        <div className="absolute -right-4 -bottom-6 text-7xl opacity-20 pointer-events-none select-none">
          🪙
        </div>
      </div>

      {/* Balance Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Net Balance Card */}
        <div
          className={`border-3 border-black rounded-2xl p-5 shadow-neo ${
            summary.netBalancePaise > 0
              ? 'bg-[#F4FFE0]'
              : summary.netBalancePaise < 0
              ? 'bg-[#FFF0F5]'
              : 'bg-white'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-black uppercase text-neutral-600 mb-1">
            <span>Net Balance</span>
            <span className="text-base">
              {summary.netBalancePaise > 0 ? '🟢' : summary.netBalancePaise < 0 ? '🔴' : '⚪'}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-display text-black mb-1">
            {formatInr(summary.netBalancePaise, { showSign: true })}
          </div>
          <p className="text-[11px] font-bold text-neutral-600">
            {summary.netBalancePaise > 0
              ? 'Total amount you are owed overall'
              : summary.netBalancePaise < 0
              ? 'Total amount you owe others overall'
              : 'All settled up! Zero balance.'}
          </p>
        </div>

        {/* You Are Owed (Creditor) */}
        <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-neo">
          <div className="flex items-center justify-between text-xs font-black uppercase text-[#22C55E] mb-1">
            <span className="flex items-center gap-1">
              <ArrowDownLeft className="w-4 h-4" /> You Are Owed
            </span>
            <Badge variant="green" size="sm">Gets Back</Badge>
          </div>
          <div className="text-2xl font-black text-black mb-1">
            {formatInr(summary.totalYouAreOwedPaise)}
          </div>
          <p className="text-[11px] font-bold text-neutral-500">
            Others need to return this to you
          </p>
        </div>

        {/* You Owe (Debtor) */}
        <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-neo">
          <div className="flex items-center justify-between text-xs font-black uppercase text-[#FF4D8D] mb-1">
            <span className="flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" /> You Owe
            </span>
            <Badge variant="pink" size="sm">Udhaar</Badge>
          </div>
          <div className="text-2xl font-black text-black mb-1">
            {formatInr(summary.totalYouOwePaise)}
          </div>
          <p className="text-[11px] font-bold text-neutral-500">
            You need to pay back to friends
          </p>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/expenses/new"
          className="p-3.5 rounded-2xl border-2 border-black bg-[#FFE600] hover:bg-[#FFED4A] shadow-neo font-black text-xs flex items-center justify-center gap-2 active:translate-x-[1px] active:translate-y-[1px] transition-all"
        >
          <PlusCircle className="w-4 h-4" /> Add Expense
        </Link>
        <Link
          to="/groups/new"
          className="p-3.5 rounded-2xl border-2 border-black bg-white hover:bg-neutral-50 shadow-neo font-black text-xs flex items-center justify-center gap-2 active:translate-x-[1px] active:translate-y-[1px] transition-all"
        >
          <Users className="w-4 h-4" /> Create Group
        </Link>
        <Link
          to="/balances"
          className="p-3.5 rounded-2xl border-2 border-black bg-[#2B59FF] text-white hover:bg-[#1E4BEA] shadow-neo font-black text-xs flex items-center justify-center gap-2 active:translate-x-[1px] active:translate-y-[1px] transition-all"
        >
          <Sparkles className="w-4 h-4" /> Settle Debts
        </Link>
        <Link
          to="/activity"
          className="p-3.5 rounded-2xl border-2 border-black bg-white hover:bg-neutral-50 shadow-neo font-black text-xs flex items-center justify-center gap-2 active:translate-x-[1px] active:translate-y-[1px] transition-all"
        >
          <span>📜</span> History
        </Link>
      </div>

      {/* Suggested Urgent Settlements (if user owes or is owed) */}
      {myPendingTransfers.length > 0 && (
        <div className="bg-[#FFFDF0] border-3 border-black rounded-3xl p-5 shadow-neo space-y-3">
          <div className="flex items-center justify-between pb-2 border-b-2 border-black">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <h3 className="text-base font-black font-display text-black">
                Direct Settlements Involving You
              </h3>
            </div>
            <Link to="/balances" className="text-xs font-black underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myPendingTransfers.slice(0, 4).map(({ transfer, groupId, groupName }, idx) => {
              const isDebtor = transfer.fromUserId === currentUserId;
              return (
                <div
                  key={`${transfer.fromUserId}_${transfer.toUserId}_${idx}`}
                  className="bg-white border-2 border-black rounded-xl p-3.5 shadow-neo-sm flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar
                      name={isDebtor ? transfer.toName : transfer.fromName}
                      url={isDebtor ? transfer.toAvatar : transfer.fromAvatar}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-black truncate">
                        {isDebtor
                          ? `Pay ${transfer.toName}`
                          : `${transfer.fromName} owes you`}
                      </p>
                      <p className="text-[10px] font-bold text-neutral-500 truncate">
                        {groupName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-sm font-black ${
                        isDebtor ? 'text-[#FF4D8D]' : 'text-[#22C55E]'
                      }`}
                    >
                      {formatInr(transfer.amount_paise)}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedTransfer(transfer);
                        setActiveGroupId(groupId);
                      }}
                      className="px-2.5 py-1 text-[11px] font-black rounded-lg border-2 border-black bg-[#FFE600] hover:bg-[#FFED4A] shadow-neo-sm active:translate-x-[1px] active:translate-y-[1px]"
                    >
                      Settle
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Two Column Section: Groups & Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Your Groups List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black font-display text-black flex items-center gap-2">
              <span>🏠</span> Your Groups ({userGroups.length})
            </h3>
            <Link to="/groups" className="text-xs font-bold text-neutral-600 hover:text-black underline">
              See All Groups
            </Link>
          </div>

          {userGroups.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-neutral-400 rounded-2xl p-8 text-center space-y-3">
              <span className="text-3xl">👥</span>
              <p className="text-sm font-bold text-neutral-600">
                You haven't joined or created any groups yet!
              </p>
              <Link to="/groups/new">
                <Button variant="primary" size="sm">
                  Create First Group
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {userGroups.map(grp => {
                const balances = getGroupBalancesForGroup(grp.id);
                const myGroupBal = balances.find(b => b.userId === currentUserId);
                const netPaise = myGroupBal?.netBalancePaise || 0;

                return (
                  <Link
                    key={grp.id}
                    to={`/groups/${grp.id}`}
                    className="block bg-white border-2 border-black rounded-2xl p-4 shadow-neo hover:-translate-y-0.5 hover:shadow-neo-lg transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#FFFDF0] border-2 border-black flex items-center justify-center text-2xl shadow-neo-sm">
                          {grp.avatar_emoji || '🪙'}
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-black">{grp.name}</h4>
                          <p className="text-[11px] font-bold text-neutral-500">
                            {grp.members?.length || 0} members · {grp.category}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-sm font-black block ${
                            netPaise > 0
                              ? 'text-[#22C55E]'
                              : netPaise < 0
                              ? 'text-[#FF4D8D]'
                              : 'text-neutral-500'
                          }`}
                        >
                          {formatInr(netPaise, { showSign: true })}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          {netPaise > 0 ? 'You are owed' : netPaise < 0 ? 'You owe' : 'Settled'}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity / Expenses */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black font-display text-black flex items-center gap-2">
              <span>⚡</span> Recent Expenses
            </h3>
            <Link to="/expenses/new" className="text-xs font-bold text-neutral-600 hover:text-black underline">
              + New
            </Link>
          </div>

          {recentExpenses.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-neutral-400 rounded-2xl p-8 text-center space-y-3">
              <span className="text-3xl">☕</span>
              <p className="text-sm font-bold text-neutral-600">
                No expenses recorded yet. Tapri chai or rent?
              </p>
              <Link to="/expenses/new">
                <Button variant="pink" size="sm">
                  Add an Expense
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentExpenses.map(exp => {
                const myParticipant = exp.participants.find(p => p.user_id === currentUserId);
                const isExcluded = myParticipant?.is_excluded;
                const payer = exp.payers[0];

                return (
                  <Link
                    key={exp.id}
                    to={`/expenses/${exp.id}`}
                    className="block bg-white border-2 border-black rounded-xl p-3.5 shadow-neo-sm hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {exp.category === 'chai_snacks'
                            ? '☕'
                            : exp.category === 'food_dining'
                            ? '🍛'
                            : exp.category === 'rent_stay'
                            ? '🏠'
                            : '🧾'}
                        </span>
                        <span className="font-extrabold text-xs text-black truncate max-w-[150px]">
                          {exp.title}
                        </span>
                      </div>
                      <span className="font-black text-xs text-black">
                        {formatInr(exp.amount_paise)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-bold text-neutral-500 pt-1 border-t border-neutral-200">
                      <span>Paid by {payer?.profile?.full_name?.split(' ')[0] || 'someone'}</span>
                      <div>
                        {isExcluded ? (
                          <span className="text-neutral-500 font-extrabold bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-300">
                            Excluded (₹0)
                          </span>
                        ) : myParticipant ? (
                          <span className="text-black font-extrabold">
                            Your share: {formatInr(myParticipant.share_amount_paise)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Settle Modal Trigger */}
      <SettlementModal
        isOpen={Boolean(selectedTransfer)}
        onClose={() => setSelectedTransfer(null)}
        transfer={selectedTransfer}
        groupId={activeGroupId}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { useData } from '../features/data/DataContext';
import { formatInr } from '../lib/money/calculations';
import { MoneyFlowVisualizer } from '../components/money/MoneyFlowVisualizer';
import { SettlementModal } from '../components/settlement/SettlementModal';
import { SuggestedTransfer } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const BalancesPage: React.FC = () => {
  const { profile, user } = useAuth();
  const { groups, getGroupBalancesForGroup, getGroupTransfersForGroup } = useData();

  const currentUserId = profile?.id || user?.id || '';
  const userGroups = groups.filter(g => g.members?.some(m => m.user_id === currentUserId));

  const [selectedTransfer, setSelectedTransfer] = useState<SuggestedTransfer | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black font-display text-black flex items-center gap-2">
          <span>⚖️</span> Balances & Debt Settlement
        </h2>
        <p className="text-xs font-bold text-neutral-600 mt-1">
          Smart greedy algorithm reduces complex debts to minimum UPI transfers.
        </p>
      </div>

      {userGroups.length === 0 ? (
        <div className="bg-white border-3 border-black rounded-3xl p-10 text-center shadow-neo">
          <p className="text-sm font-bold text-neutral-600">
            Join or create a group to view debt simplification.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {userGroups.map(grp => {
            const transfers = getGroupTransfersForGroup(grp.id);
            const balances = getGroupBalancesForGroup(grp.id);
            const myBal = balances.find(b => b.userId === currentUserId);
            const myNet = myBal?.netBalancePaise || 0;

            return (
              <div key={grp.id} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{grp.avatar_emoji}</span>
                    <h3 className="text-lg font-black font-display text-black">
                      {grp.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={myNet > 0 ? 'green' : myNet < 0 ? 'pink' : 'gray'}
                      size="sm"
                    >
                      Your Net: {formatInr(myNet, { showSign: true })}
                    </Badge>
                  </div>
                </div>

                <MoneyFlowVisualizer
                  transfers={transfers}
                  title={`${grp.name} — Simplified Transfers`}
                  onSettleTransfer={t => {
                    setSelectedTransfer(t);
                    setSelectedGroupId(grp.id);
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Settle Modal Trigger */}
      <SettlementModal
        isOpen={Boolean(selectedTransfer)}
        onClose={() => setSelectedTransfer(null)}
        transfer={selectedTransfer}
        groupId={selectedGroupId}
      />
    </div>
  );
};

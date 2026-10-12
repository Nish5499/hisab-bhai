import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { useData } from '../features/data/DataContext';
import { formatInr } from '../lib/money/calculations';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const ActivityPage: React.FC = () => {
  const { profile, user } = useAuth();
  const { expenses, settlements, groups } = useData();

  const currentUserId = profile?.id || user?.id || '';

  // Merge expenses and settlements chronologically
  const timelineItems: Array<{
    id: string;
    type: 'expense' | 'settlement';
    date: string;
    title: string;
    amountPaise: number;
    groupName: string;
    details: string;
    linkUrl: string;
  }> = [];

  expenses.forEach(exp => {
    const grp = groups.find(g => g.id === exp.group_id);
    const myShare = exp.participants.find(p => p.user_id === currentUserId);
    const payer = exp.payers[0];

    timelineItems.push({
      id: exp.id,
      type: 'expense',
      date: exp.expense_date,
      title: exp.title,
      amountPaise: exp.amount_paise,
      groupName: grp?.name || 'Group',
      details: myShare?.is_excluded
        ? 'Excluded from this expense (₹0)'
        : myShare
        ? `Your share: ${formatInr(myShare.share_amount_paise)}`
        : `Paid by ${payer?.profile?.full_name?.split(' ')[0] || 'someone'}`,
      linkUrl: `/expenses/${exp.id}`,
    });
  });

  settlements.forEach(stl => {
    const grp = groups.find(g => g.id === stl.group_id);
    timelineItems.push({
      id: stl.id,
      type: 'settlement',
      date: stl.settled_at.split('T')[0],
      title: 'Settlement Recorded 🎉',
      amountPaise: stl.amount_paise,
      groupName: grp?.name || 'Group',
      details: `${stl.payer_profile?.full_name || 'Member'} paid ${stl.receiver_profile?.full_name || 'Member'}`,
      linkUrl: `/groups/${stl.group_id}`,
    });
  });

  timelineItems.sort((a, b) => (b.date > a.date ? 1 : -1));

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div>
        <h2 className="text-2xl font-black font-display text-black flex items-center gap-2">
          <span>📜</span> Activity Feed
        </h2>
        <p className="text-xs font-bold text-neutral-600 mt-1">
          Chronological timeline of all your transactions and settlements.
        </p>
      </div>

      <div className="space-y-3">
        {timelineItems.length === 0 ? (
          <div className="bg-white border-3 border-black rounded-3xl p-10 text-center shadow-neo">
            <p className="text-sm font-bold text-neutral-600">
              No activity recorded yet!
            </p>
          </div>
        ) : (
          timelineItems.map(item => (
            <Link
              key={item.id}
              to={item.linkUrl}
              className="block bg-white border-2 border-black rounded-2xl p-4 shadow-neo hover:-translate-y-0.5 hover:shadow-neo-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl border-2 border-black flex items-center justify-center text-xl shadow-neo-sm ${
                      item.type === 'settlement' ? 'bg-[#22C55E]' : 'bg-[#FFE600]'
                    }`}
                  >
                    {item.type === 'settlement' ? '🤝' : '🧾'}
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-black">{item.title}</h4>
                    <p className="text-[11px] font-bold text-neutral-500">
                      {item.groupName} · {item.date}
                    </p>
                    <p className="text-xs font-semibold text-neutral-700 mt-0.5">
                      {item.details}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-base font-black ${
                      item.type === 'settlement' ? 'text-[#22C55E]' : 'text-black'
                    }`}
                  >
                    {formatInr(item.amountPaise)}
                  </span>
                  <Badge
                    variant={item.type === 'settlement' ? 'green' : 'yellow'}
                    size="sm"
                    className="mt-1"
                  >
                    {item.type}
                  </Badge>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

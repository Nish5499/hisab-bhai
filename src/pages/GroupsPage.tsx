import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { useData } from '../features/data/DataContext';
import { formatInr } from '../lib/money/calculations';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { PlusCircle, Users, ArrowRight } from 'lucide-react';

export const GroupsPage: React.FC = () => {
  const { profile, user } = useAuth();
  const { groups, getGroupBalancesForGroup } = useData();

  const currentUserId = profile?.id || user?.id || '';
  const userGroups = groups.filter(g => g.members?.some(m => m.user_id === currentUserId));

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-display text-black flex items-center gap-2">
            <span>👥</span> Your Groups
          </h2>
          <p className="text-xs font-bold text-neutral-600 mt-0.5">
            Flatmates, travel gangs, and office lunch circles.
          </p>
        </div>
        <Link to="/groups/new">
          <Button variant="primary" size="sm">
            <PlusCircle className="w-4 h-4" /> Create New Group
          </Button>
        </Link>
      </div>

      {/* Groups Grid */}
      {userGroups.length === 0 ? (
        <div className="bg-white border-3 border-black rounded-3xl p-12 text-center shadow-neo space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FFE600] border-2 border-black flex items-center justify-center text-3xl shadow-neo-sm">
            🏠
          </div>
          <h3 className="text-xl font-black font-display">No Groups Yet</h3>
          <p className="text-xs font-bold text-neutral-600 max-w-sm mx-auto">
            Create your first group for roommates, a road trip, or office lunch and start tracking.
          </p>
          <Link to="/groups/new" className="inline-block pt-2">
            <Button variant="pink">Create Group Now</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userGroups.map(grp => {
            const balances = getGroupBalancesForGroup(grp.id);
            const myBal = balances.find(b => b.userId === currentUserId);
            const netPaise = myBal?.netBalancePaise || 0;

            return (
              <Link
                key={grp.id}
                to={`/groups/${grp.id}`}
                className="bg-white border-3 border-black rounded-3xl p-5 shadow-neo hover:-translate-y-1 hover:shadow-neo-lg transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#FFFDF0] border-2 border-black flex items-center justify-center text-3xl shadow-neo-sm">
                      {grp.avatar_emoji || '🪙'}
                    </div>
                    <div>
                      <h3 className="text-lg font-black font-display text-black">
                        {grp.name}
                      </h3>
                      <p className="text-xs font-semibold text-neutral-500 line-clamp-1">
                        {grp.description || grp.category}
                      </p>
                    </div>
                  </div>
                  <Badge variant="yellow" size="sm">
                    {grp.category}
                  </Badge>
                </div>

                {/* Member avatars */}
                <div className="flex items-center justify-between pt-3 border-t-2 border-neutral-200">
                  <div className="flex -space-x-2 overflow-hidden">
                    {grp.members?.slice(0, 4).map(m => (
                      <Avatar
                        key={m.user_id}
                        name={m.profile?.full_name || 'User'}
                        url={m.profile?.avatar_url}
                        size="sm"
                        className="border-2 border-white"
                      />
                    ))}
                    {(grp.members?.length || 0) > 4 && (
                      <div className="w-8 h-8 rounded-xl bg-neutral-200 border-2 border-black flex items-center justify-center text-[10px] font-black">
                        +{(grp.members?.length || 0) - 4}
                      </div>
                    )}
                  </div>

                  {/* Net status */}
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
                    <span className="text-[10px] font-bold uppercase text-neutral-400">
                      {netPaise > 0 ? 'You are owed' : netPaise < 0 ? 'You owe' : 'Settled up'}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

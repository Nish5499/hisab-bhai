import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { useData } from '../features/data/DataContext';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const JoinGroupPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { groups } = useData();

  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const group = groups.find(g => g.id === groupId);

  const handleJoin = () => {
    setIsJoining(true);
    setTimeout(() => {
      setIsJoining(false);
      navigate(`/groups/${groupId}`);
    }, 600);
  };

  if (!group) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-2xl font-black font-display">Invitation Invalid</h2>
        <p className="text-xs font-bold text-neutral-600">
          This invitation link has expired or the group no longer exists.
        </p>
        <Link to="/dashboard">
          <Button variant="primary">Go to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      <div className="bg-white border-3 border-black rounded-3xl p-6 sm:p-8 shadow-neo-lg text-center space-y-5">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-[#FFE600] border-3 border-black flex items-center justify-center text-4xl shadow-neo">
          {group.avatar_emoji || '🪙'}
        </div>

        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
            You've been invited to join
          </span>
          <h2 className="text-2xl font-black font-display text-black mt-1">
            {group.name}
          </h2>
          <p className="text-xs font-semibold text-neutral-600 mt-1">
            {group.description || `${group.members?.length || 0} members tracking expenses`}
          </p>
        </div>

        <div className="p-4 bg-[#FFFDF0] rounded-2xl border-2 border-black flex items-center justify-center gap-2">
          <span className="text-xs font-bold text-neutral-700">Joining as:</span>
          <span className="text-xs font-black text-black">{profile?.full_name || 'You'}</span>
        </div>

        <div className="space-y-2 pt-2">
          <Button
            variant="green"
            size="lg"
            className="w-full"
            onClick={handleJoin}
            isLoading={isJoining}
          >
            Accept Invitation & Join 🤝
          </Button>
          <Link to="/dashboard" className="block text-xs font-bold text-neutral-500 hover:text-black">
            Decline
          </Link>
        </div>
      </div>
    </div>
  );
};

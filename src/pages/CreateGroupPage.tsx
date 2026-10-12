import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { useData } from '../features/data/DataContext';
import { DEMO_USERS } from '../lib/demo/demoData';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { ArrowLeft, Plus, Check, AlertCircle } from 'lucide-react';

const EMOJIS = ['🏠', '🏖️', '🍛', '☕', '🚖', '🎉', '💼', '🪙', '🍕', '⚽'];
const CATEGORIES = ['Flatmates', 'Trip', 'Friends', 'Foodies', 'Office', 'Couple', 'Other'];

export const CreateGroupPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, user, isDemoMode } = useAuth();
  const { createGroup } = useData();

  const currentUserId = profile?.id || user?.id || '';
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('🏠');
  const [category, setCategory] = useState('Flatmates');

  // Selectable members
  const availableUsers = DEMO_USERS.filter(u => u.id !== currentUserId);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    availableUsers.slice(0, 2).map(u => u.id)
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleMember = (userId: string) => {
    setSelectedMemberIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a group name.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newGroup = await createGroup(
        name.trim(),
        description.trim(),
        emoji,
        category,
        selectedMemberIds
      );
      navigate(`/groups/${newGroup.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create group');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20 md:pb-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-neutral-600 hover:text-black"
      >
        <ArrowLeft className="w-4 h-4" /> Cancel
      </button>

      <div className="bg-white border-3 border-black rounded-3xl p-6 sm:p-8 shadow-neo-lg space-y-6">
        <div>
          <h2 className="text-2xl font-black font-display text-black flex items-center gap-2">
            <span>👥</span> Create New Group
          </h2>
          <p className="text-xs font-bold text-neutral-600 mt-1">
            Group your flatmates, office friends, or vacation gang.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl border-2 border-black bg-red-100 text-red-900 text-xs font-bold flex items-center gap-2 shadow-neo-sm">
            <AlertCircle className="w-4 h-4 text-red-700 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Group Icon Selector */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
              1. Choose Group Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(em => (
                <button
                  type="button"
                  key={em}
                  onClick={() => setEmoji(em)}
                  className={`w-12 h-12 rounded-xl border-2 text-2xl flex items-center justify-center transition-all ${
                    emoji === em
                      ? 'bg-[#FFE600] border-black shadow-neo-sm scale-110'
                      : 'border-neutral-300 hover:border-black bg-white'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Group Name */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
              2. Group Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Flat 301 Gang or Manali Roadtrip"
              value={name}
              onChange={e => setName(e.target.value)}
              className="neo-input text-sm font-bold"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
              3. Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl border-2 text-xs font-black transition-all ${
                    category === cat
                      ? 'bg-[#2B59FF] text-white border-black shadow-neo-sm'
                      : 'bg-white border-neutral-300 text-neutral-700 hover:border-black'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">
              4. Description (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Bills, groceries aur trip ka hisaab"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="neo-input text-sm font-medium"
            />
          </div>

          {/* Initial Members Selection */}
          <div className="p-4 bg-[#FFFDF0] rounded-2xl border-2 border-black space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-black">
              5. Add Initial Members
            </label>
            <div className="space-y-2">
              {availableUsers.map(u => {
                const isSelected = selectedMemberIds.includes(u.id);
                return (
                  <div
                    key={u.id}
                    onClick={() => toggleMember(u.id)}
                    className={`p-3 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-white border-black shadow-neo-sm'
                        : 'bg-white/60 border-neutral-300 hover:border-black opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.full_name} url={u.avatar_url} size="sm" />
                      <div>
                        <p className="text-xs font-black">{u.full_name}</p>
                        <p className="text-[10px] font-bold text-neutral-500">{u.email}</p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-lg border-2 border-black flex items-center justify-center ${
                        isSelected ? 'bg-[#FFE600]' : 'bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 text-black" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            Create Group 🚀
          </Button>
        </form>
      </div>
    </div>
  );
};

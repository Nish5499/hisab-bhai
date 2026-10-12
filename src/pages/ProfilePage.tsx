import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { DEMO_USERS } from '../lib/demo/demoData';
import { isSupabaseConfigured } from '../lib/supabase/client';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { LogOut, CheckCircle2, Shield, QrCode, Sparkles, AlertCircle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { profile, isDemoMode, setDemoMode, switchDemoUser, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [upiId, setUpiId] = useState(profile?.upi_id || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || '');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateProfile({
      full_name: fullName,
      upi_id: upiId,
      phone_number: phoneNumber,
    });
    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black font-display text-black flex items-center gap-2">
          <span>👤</span> Profile & Account
        </h2>
        <p className="text-xs font-bold text-neutral-600 mt-1">
          Manage your personal details, UPI handle for payouts, and mode.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white border-3 border-black rounded-3xl p-6 sm:p-8 shadow-neo-lg space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b-2 border-black">
          <Avatar
            name={profile?.full_name || 'User'}
            url={profile?.avatar_url}
            size="lg"
            className="border-3 border-black shadow-neo"
          />
          <div>
            <h3 className="text-xl font-black font-display text-black">
              {profile?.full_name}
            </h3>
            <p className="text-xs font-bold text-neutral-500">{profile?.email}</p>
            <Badge variant={isDemoMode ? 'yellow' : 'green'} size="sm" className="mt-1.5">
              {isDemoMode ? 'Demo Mode Active' : 'Supabase Auth User'}
            </Badge>
          </div>
        </div>

        {/* Demo Persona Switcher */}
        {isDemoMode && (
          <div className="p-4 bg-[#FFFDF0] rounded-2xl border-2 border-black space-y-2">
            <span className="text-xs font-black uppercase text-black block">
              Active Indian Persona
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DEMO_USERS.map(u => (
                <button
                  key={u.id}
                  onClick={() => {
                    switchDemoUser(u.id);
                    setFullName(u.full_name);
                    setUpiId(u.upi_id || '');
                    setPhoneNumber(u.phone_number || '');
                  }}
                  className={`p-2 rounded-xl border-2 text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    profile?.id === u.id
                      ? 'bg-[#FFE600] border-black shadow-neo-sm font-black'
                      : 'bg-white border-neutral-300 hover:border-black'
                  }`}
                >
                  <Avatar name={u.full_name} url={u.avatar_url} size="sm" />
                  <span className="truncate w-full text-center">{u.full_name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="neo-input text-sm font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">
              UPI ID (for receiving settlement money)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-xs font-black text-neutral-400">@</span>
              <input
                type="text"
                placeholder="yourname@okhdfcbank"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                className="neo-input pl-8 text-sm font-bold font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="+91 98765 43210"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              className="neo-input text-sm font-bold"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
            >
              {isSaved ? 'Saved! ✓' : 'Save Changes'}
            </Button>

            <button
              type="button"
              onClick={handleSignOut}
              className="px-4 py-2.5 rounded-xl border-2 border-black bg-red-100 hover:bg-red-200 text-red-700 text-xs font-black inline-flex items-center gap-1.5 shadow-neo-sm active:translate-x-[1px] active:translate-y-[1px]"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

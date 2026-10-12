import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Bell, User as UserIcon, LogOut, ChevronDown, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { useData } from '../../features/data/DataContext';
import { DEMO_USERS } from '../../lib/demo/demoData';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { isSupabaseConfigured } from '../../lib/supabase/client';

export const Navbar: React.FC = () => {
  const { profile, isDemoMode, setDemoMode, switchDemoUser, signOut } = useAuth();
  const { notifications, markNotificationRead } = useData();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="sticky top-0 z-40 bg-[#FFE600] border-b-3 border-black shadow-neo px-4 py-3 select-none">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-black text-[#FFE600] border-2 border-black flex items-center justify-center font-black text-2xl group-hover:rotate-6 transition-transform shadow-neo-sm">
            🪙
          </div>
          <div>
            <h1 className="text-xl font-black font-display tracking-tight text-black leading-none">
              HisabBhai
            </h1>
            <p className="text-[10px] font-bold text-black/80 uppercase tracking-wider mt-0.5">
              Bhai, hisaab clear kar!
            </p>
          </div>
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Demo User Switcher / Status Pill */}
          {isDemoMode ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="px-3 py-1.5 rounded-xl border-2 border-black bg-white hover:bg-neutral-50 shadow-neo-sm text-xs font-bold inline-flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Actor: {profile?.full_name?.split(' ')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border-3 border-black rounded-2xl shadow-neo-lg p-2 z-50">
                  <p className="text-[10px] font-black uppercase text-neutral-500 px-3 py-1.5 border-b border-neutral-200">
                    Switch Indian Persona
                  </p>
                  <div className="space-y-1 mt-1">
                    {DEMO_USERS.map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchDemoUser(u.id);
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                          profile?.id === u.id ? 'bg-[#FFE600] border-2 border-black' : 'hover:bg-neutral-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar name={u.full_name} url={u.avatar_url} size="sm" />
                          <span>{u.full_name}</span>
                        </div>
                        {profile?.id === u.id && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                  <div className="pt-2 mt-2 border-t border-neutral-200">
                    <button
                      onClick={() => {
                        setDemoMode(false);
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-neutral-600 hover:text-black"
                    >
                      Switch to Supabase Live Mode
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Badge variant="green" size="sm" className="hidden sm:inline-flex">
              Supabase Live
            </Badge>
          )}

          {/* Add Expense Button */}
          <Link
            to="/expenses/new"
            className="px-3.5 py-1.5 rounded-xl border-2 border-black bg-[#FF4D8D] text-white hover:bg-[#FF337A] font-extrabold text-xs shadow-neo-sm inline-flex items-center gap-1.5 active:translate-x-[1px] active:translate-y-[1px] transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Add Expense</span>
            <span className="sm:hidden">Add</span>
          </Link>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl border-2 border-black bg-white hover:bg-neutral-100 shadow-neo-sm relative active:translate-x-[1px] active:translate-y-[1px]"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-black" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#FF4D8D] text-white font-black text-[10px] border-2 border-black flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white border-3 border-black rounded-2xl shadow-neo-lg p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b-2 border-black mb-2">
                  <span className="text-xs font-black uppercase tracking-wider">
                    Updates & Alerts
                  </span>
                  <span className="text-[11px] font-bold text-neutral-500">
                    {unreadCount} unread
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-neutral-500 text-center py-4 font-semibold">
                      No notifications yet!
                    </p>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationRead(notif.id);
                          if (notif.link_url) {
                            navigate(notif.link_url);
                            setShowNotifications(false);
                          }
                        }}
                        className={`p-2.5 rounded-xl border border-neutral-300 cursor-pointer transition-colors text-xs ${
                          notif.is_read ? 'bg-neutral-50 opacity-70' : 'bg-[#FFFDF0] border-black font-semibold'
                        }`}
                      >
                        <p className="font-extrabold text-black mb-0.5">{notif.title}</p>
                        <p className="text-neutral-700 text-[11px]">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Menu */}
          <Link
            to="/profile"
            className="flex items-center gap-2 p-1 rounded-xl border-2 border-black bg-white shadow-neo-sm hover:bg-neutral-50"
            title="Profile"
          >
            <Avatar name={profile?.full_name || 'User'} url={profile?.avatar_url} size="sm" />
          </Link>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, History, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/dashboard', label: 'Hisaab', icon: LayoutDashboard },
    { to: '/groups', label: 'Groups', icon: Users },
    { to: '/activity', label: 'Activity', icon: History },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-3 border-black p-2 md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-xl border-2 transition-all ${
                  isActive
                    ? 'bg-[#FFE600] border-black shadow-neo-sm font-black'
                    : 'border-transparent text-neutral-600 font-bold hover:text-black'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] uppercase tracking-wider">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

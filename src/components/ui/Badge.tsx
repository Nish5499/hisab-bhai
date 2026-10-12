import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'yellow' | 'pink' | 'blue' | 'green' | 'gray' | 'red';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'yellow',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    yellow: 'bg-[#FFE600] text-black',
    pink: 'bg-[#FF4D8D] text-white',
    blue: 'bg-[#2B59FF] text-white',
    green: 'bg-[#22C55E] text-black',
    gray: 'bg-neutral-200 text-neutral-800',
    red: 'bg-[#EF4444] text-white',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold uppercase tracking-wider rounded-lg border-2 border-black shadow-neo-sm ${
        variantStyles[variant]
      } ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'white' | 'yellow' | 'pink' | 'blue' | 'lime';
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'white',
  interactive = false,
  className = '',
  ...props
}) => {
  const variantStyles = {
    white: 'bg-white',
    yellow: 'bg-[#FFFDF0]',
    pink: 'bg-[#FFF0F5]',
    blue: 'bg-[#F0F5FF]',
    lime: 'bg-[#F4FFE0]',
  };

  return (
    <div
      className={`border-2 border-black rounded-2xl p-5 shadow-neo transition-all ${
        variantStyles[variant]
      } ${
        interactive
          ? 'cursor-pointer hover:-translate-y-1 hover:shadow-neo-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-sm'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

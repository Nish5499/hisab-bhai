import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'pink' | 'blue' | 'green' | 'outline' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'font-bold border-2 border-black rounded-xl transition-all duration-150 inline-flex items-center justify-center gap-2 select-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs shadow-neo-sm',
    md: 'px-4 py-2.5 text-sm shadow-neo',
    lg: 'px-6 py-3.5 text-base shadow-neo-lg',
  };

  const variantStyles = {
    primary: 'bg-[#FFE600] text-black hover:bg-[#FFF04D]',
    pink: 'bg-[#FF4D8D] text-white hover:bg-[#FF337A]',
    blue: 'bg-[#2B59FF] text-white hover:bg-[#1E4BEA]',
    green: 'bg-[#22C55E] text-black hover:bg-[#16A34A]',
    outline: 'bg-white text-black hover:bg-neutral-100',
    dark: 'bg-black text-white hover:bg-neutral-800',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${
        disabled || isLoading ? 'opacity-50 cursor-not-allowed transform-none' : ''
      } ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

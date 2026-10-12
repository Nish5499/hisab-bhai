import React from 'react';

interface AvatarProps {
  name: string;
  url?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  url,
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  const getInitials = (str: string) => {
    return str
      .split(' ')
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const colors = [
    'bg-[#FFE600] text-black',
    'bg-[#FF4D8D] text-white',
    'bg-[#2B59FF] text-white',
    'bg-[#22C55E] text-black',
    'bg-[#A855F7] text-white',
    'bg-[#FF8800] text-white',
  ];

  // Pick deterministic color based on name
  const colorIndex = (name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % colors.length;
  const pickedColor = colors[colorIndex];

  return (
    <div
      className={`relative inline-flex items-center justify-center font-bold rounded-xl border-2 border-black shadow-neo-sm overflow-hidden flex-shrink-0 ${sizeStyles[size]} ${pickedColor} ${className}`}
      title={name}
    >
      {url ? (
        <img
          src={url}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // fallback if avatar image fails
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};

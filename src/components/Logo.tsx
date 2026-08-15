import React from 'react';

interface LogoProps {
  color?: 'purple' | 'white';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  color = 'purple',
  size = 'md',
  className = '',
  onClick,
}) => {
  const isWhite = color === 'white';
  const textColor = isWhite ? 'text-white' : 'text-[#4A2270]';
  const strokeColor = isWhite ? '#FFFFFF' : '#4A2270';

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }[size];

  const textSizes = {
    sm: 'text-base font-semibold',
    md: 'text-lg font-semibold tracking-tight',
    lg: 'text-2xl font-bold tracking-tight',
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <svg
        className={`${iconSizes} flex-shrink-0`}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Continuous neurodiversity ribbon loop */}
        <path
          d="M7 16C7 11.5 10.5 8 15 12L17 14L19 16C21.5 18.5 25 18.5 27 16C29 13.5 28.5 9.5 25 8C21.5 6.5 17.5 10.5 15 13L13 15L11 17C8.5 19.5 5 19.5 3 17C1 14.5 2.5 10.5 6 9"
          stroke={strokeColor}
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="16" r="2" fill={strokeColor} />
      </svg>
      <span className={`${textSizes} ${textColor} font-fraunces`}>
        PAN
      </span>
    </div>
  );
};

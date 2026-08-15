import React from 'react';
import { AvatarId } from '../types';

interface AvatarProps {
  id: AvatarId;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  selected?: boolean;
  onClick?: () => void;
}

export const AVATAR_LIST: { id: AvatarId; name: string; bg: string; border: string }[] = [
  { id: 'cat', name: 'Gatito', bg: '#E9DFF5', border: '#D0BDE6' },
  { id: 'fox', name: 'Zorrito', bg: '#FDE4D2', border: '#F8CCA8' },
  { id: 'bear', name: 'Osito', bg: '#D8F3E5', border: '#B6E6CE' },
  { id: 'owl', name: 'Búho', bg: '#DDEBFC', border: '#BBD8FA' },
  { id: 'bunny', name: 'Conejito', bg: '#FCE0ED', border: '#F8BDDE' },
  { id: 'turtle', name: 'Tortuguita', bg: '#E4F0D4', border: '#CBE4AF' },
];

export const AvatarIcon: React.FC<AvatarProps> = ({
  id,
  size = 'md',
  className = '',
  selected = false,
  onClick,
}) => {
  const sizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  }[size];

  const current = AVATAR_LIST.find((a) => a.id === id) || AVATAR_LIST[0];

  const renderGraphic = () => {
    switch (id) {
      case 'cat':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full p-1.5" stroke="#3D2952" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            {/* Cat ears */}
            <path d="M12 18 L16 8 L24 14" fill="white" />
            <path d="M36 18 L32 8 L24 14" fill="white" />
            {/* Head */}
            <circle cx="24" cy="27" r="14" fill="white" />
            {/* Eyes */}
            <circle cx="19" cy="25" r="1.5" fill="#3D2952" />
            <circle cx="29" cy="25" r="1.5" fill="#3D2952" />
            {/* Nose & Smile */}
            <path d="M22.5 29 Q24 30.5 25.5 29" />
            <path d="M24 29 V31" />
            <path d="M22 32 Q24 33.5 26 32" />
          </svg>
        );
      case 'fox':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full p-1.5" stroke="#4A2818" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            {/* Fox face shield */}
            <path d="M14 12 L24 20 L34 12 L31 30 L24 38 L17 30 Z" fill="white" />
            {/* Eyes */}
            <circle cx="20" cy="25" r="1.5" fill="#4A2818" />
            <circle cx="28" cy="25" r="1.5" fill="#4A2818" />
            {/* Nose */}
            <polygon points="22.5,31 25.5,31 24,33" fill="#4A2818" />
          </svg>
        );
      case 'bear':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full p-1.5" stroke="#254232" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            {/* Ears */}
            <circle cx="14" cy="16" r="4.5" fill="white" />
            <circle cx="34" cy="16" r="4.5" fill="white" />
            {/* Head */}
            <circle cx="24" cy="27" r="13" fill="white" />
            {/* Eyes */}
            <circle cx="19" cy="25" r="1.5" fill="#254232" />
            <circle cx="29" cy="25" r="1.5" fill="#254232" />
            {/* Snout */}
            <ellipse cx="24" cy="30" rx="4" ry="3" />
            <circle cx="24" cy="29" r="1.2" fill="#254232" />
            <path d="M23 31 Q24 32 25 31" />
          </svg>
        );
      case 'owl':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full p-1.5" stroke="#1D3557" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            {/* Owl body */}
            <circle cx="24" cy="25" r="14" fill="white" />
            {/* Big eyes */}
            <circle cx="18" cy="23" r="5" fill="white" />
            <circle cx="30" cy="23" r="5" fill="white" />
            <circle cx="18" cy="23" r="2" fill="#1D3557" />
            <circle cx="30" cy="23" r="2" fill="#1D3557" />
            {/* Beak */}
            <polygon points="22,26 26,26 24,30" fill="#1D3557" />
            {/* Chest feathers */}
            <path d="M21 33 Q24 35 27 33" />
          </svg>
        );
      case 'bunny':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full p-1.5" stroke="#4A1E35" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            {/* Long ears */}
            <ellipse cx="18" cy="14" rx="3.5" ry="9" fill="white" />
            <ellipse cx="30" cy="14" rx="3.5" ry="9" fill="white" />
            {/* Head */}
            <circle cx="24" cy="28" r="12" fill="white" />
            {/* Eyes */}
            <circle cx="19" cy="27" r="1.5" fill="#4A1E35" />
            <circle cx="29" cy="27" r="1.5" fill="#4A1E35" />
            {/* Nose & smile */}
            <polygon points="23,30 25,30 24,31.5" fill="#4A1E35" />
            <path d="M22 32 Q24 33.5 26 32" />
          </svg>
        );
      case 'turtle':
        return (
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full p-1.5" stroke="#2B441F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            {/* Turtle Shell dome */}
            <path d="M12 28 C12 18 36 18 36 28 Z" fill="white" />
            <line x1="12" y1="28" x2="36" y2="28" />
            {/* Shell grid */}
            <line x1="24" y1="18" x2="24" y2="28" />
            <line x1="18" y1="23" x2="30" y2="23" />
            {/* Head */}
            <circle cx="38" cy="26" r="4.5" fill="white" />
            <circle cx="39" cy="25" r="1" fill="#2B441F" />
            {/* Tiny feet */}
            <ellipse cx="16" cy="30" rx="3" ry="1.5" fill="white" />
            <ellipse cx="32" cy="30" rx="3" ry="1.5" fill="white" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      aria-label={current.name}
      style={{ backgroundColor: current.bg }}
      className={`relative inline-flex items-center justify-center rounded-full aspect-square shrink-0 transition-all duration-200 ${sizeClasses} ${
        selected
          ? 'ring-4 ring-[#4A2270] ring-offset-2 scale-110 shadow-md'
          : onClick
          ? 'hover:scale-105 hover:shadow-sm opacity-90 hover:opacity-100'
          : ''
      } ${className}`}
    >
      {renderGraphic()}
    </button>
  );
};

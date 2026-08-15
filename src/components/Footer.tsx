import React from 'react';

interface FooterProps {
  className?: string;
  onOpenProfesional?: (code?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ className = '', onOpenProfesional }) => {
  return (
    <footer className={`py-4 px-4 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-6xl w-full mx-auto shrink-0 text-center ${className}`}>
      <p className="text-xs text-[#6E6A75]">
        PAN no realiza diagnósticos clínicos. Orientación basada en NTS N° 238-MINSA.
      </p>
      {onOpenProfesional && (
        <button
          type="button"
          onClick={() => onOpenProfesional()}
          className="text-xs text-[#4A2270] hover:text-[#3B195C] font-semibold underline underline-offset-2 cursor-pointer transition-colors"
        >
          Vista para profesionales de salud
        </button>
      )}
    </footer>
  );
};

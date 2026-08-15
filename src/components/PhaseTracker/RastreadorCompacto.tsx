import React from 'react';
import { UserProfile } from '../../types';
import { ArrowRight, Compass } from 'lucide-react';

interface RastreadorCompactoProps {
  user: UserProfile;
  onClick: () => void;
}

export const RastreadorCompacto: React.FC<RastreadorCompactoProps> = ({ user, onClick }) => {
  const currentPhase = user.fase || (user.diagnosis ? 5 : user.screeningResult ? 4 : 3);

  const phaseNames = [
    'Observación',
    'Información',
    'Buscar atención',
    'Evaluación',
    'Entender la condición',
    'Seguimiento',
  ];

  const phaseTitle = phaseNames[currentPhase - 1] || 'Entender la condición';

  return (
    <div
      onClick={onClick}
      className="w-full bg-white border border-[#E5E1EC] hover:border-[#6B3FA0]/50 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer group text-left"
    >
      <div className="flex items-center gap-3.5 sm:gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#E9DFF5] text-[#4A2270] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <Compass className="w-5 h-5" />
        </div>

        <div className="space-y-1">
          {/* Row of 6 small dots */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((p) => {
              const isCompleted = p < currentPhase && p !== 6;
              const isCurrent = p === currentPhase;

              return (
                <div
                  key={p}
                  className={`w-2 h-2 rounded-full transition-all ${
                    isCompleted
                      ? 'bg-[#4A2270]'
                      : isCurrent
                      ? 'bg-[#4A2270] ring-2 ring-[#E9DFF5] scale-110'
                      : 'bg-[#C9C4D2]'
                  }`}
                  title={`Fase ${p}`}
                />
              );
            })}
          </div>

          <p className="text-xs sm:text-sm font-bold text-[#2E2A33] group-hover:text-[#4A2270] transition-colors">
            Fase {currentPhase} de 6 · {phaseTitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs font-bold text-[#4A2270] group-hover:translate-x-1 transition-transform">
        <span className="hidden sm:inline">Ver mi ruta</span>
        <ArrowRight className="w-4 h-4 text-[#4A2270]" />
      </div>
    </div>
  );
};

import React from 'react';
import { Establecimiento } from '../../types';
import { formatDistancia } from '../../utils/distancia';
import { Building2, MapPin, ChevronRight, Stethoscope, Sparkles } from 'lucide-react';

interface EstablishmentCardProps {
  item: Establecimiento;
  isSelected?: boolean;
  isHovered?: boolean;
  onHover?: (codigo: string | null) => void;
  onClick?: (item: Establecimiento) => void;
  onViewFicha: (item: Establecimiento) => void;
  isMarkedAsUserChoice?: boolean;
}

export const EstablishmentCard: React.FC<EstablishmentCardProps> = ({
  item,
  isSelected = false,
  isHovered = false,
  onHover,
  onClick,
  onViewFicha,
  isMarkedAsUserChoice = false,
}) => {
  const distanceLabel = item.distanciaKm !== undefined ? formatDistancia(item.distanciaKm) : '';

  // Get coverage badge styling
  const getCoverageBadge = (cobertura: string) => {
    switch (cobertura) {
      case 'SIS':
        return 'bg-[#E6F2EC] text-[#2E7D5B] border-[#C3E5D4]';
      case 'EsSalud':
        return 'bg-[#EBF2FA] text-[#1E5D9B] border-[#C7DCF3]';
      case 'Privado':
        return 'bg-[#F4EBF9] text-[#6B3FA0] border-[#E2CEF1]';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Get category level badge styling
  const getCategoryColor = (cat: string) => {
    if (cat.startsWith('I-')) return 'bg-[#F0EBF8] text-[#6B3FA0]';
    if (cat.startsWith('II-')) return 'bg-[#E9DFF5] text-[#4A2270]';
    return 'bg-[#2E1A47] text-white';
  };

  return (
    <div
      onMouseEnter={() => onHover && onHover(item.codigo)}
      onMouseLeave={() => onHover && onHover(null)}
      onClick={() => onClick && onClick(item)}
      className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left ${
        isSelected || isHovered
          ? 'border-[#4A2270] bg-white ring-2 ring-[#4A2270]/20 shadow-md translate-y-[-2px]'
          : 'border-[#E5E1EC] bg-white hover:border-[#4A2270]/50 hover:bg-[#FAF8FD] shadow-xs'
      }`}
    >
      {/* Pinned as User Chosen Establishment */}
      {isMarkedAsUserChoice && (
        <div className="mb-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E9DFF5] text-[11px] font-bold text-[#4A2270] border border-[#D5C6EB]">
          <Sparkles className="w-3 h-3 text-[#4A2270]" />
          <span>Tu establecimiento seleccionado</span>
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${getCategoryColor(
                item.categoria
              )}`}
            >
              {item.categoria}
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getCoverageBadge(
                item.cobertura
              )}`}
            >
              {item.cobertura}
            </span>
          </div>

          <h4 className="text-[15px] font-bold text-[#2E2A33] group-hover:text-[#4A2270] transition-colors line-clamp-1">
            {item.nombre}
          </h4>
        </div>

        {distanceLabel && (
          <div className="shrink-0 text-right">
            <span className="inline-block px-2.5 py-1 rounded-lg bg-[#FAF8FD] border border-[#E5E1EC] text-[12px] font-bold text-[#4A2270]">
              {distanceLabel}
            </span>
          </div>
        )}
      </div>

      {/* Details line */}
      <p className="text-[12.5px] text-[#6E6A75] mt-1.5 flex items-center gap-1.5 flex-wrap">
        <span>{item.clasificacion}</span>
        <span>•</span>
        <span className="flex items-center gap-0.5">
          <MapPin className="w-3 h-3 text-[#6E6A75]" />
          {item.distrito}
        </span>
      </p>

      {/* Services preview chips */}
      {item.servicios && item.servicios.length > 0 && (
        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
          {item.servicios.slice(0, 2).map((serv, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F7F5FA] text-[#55505E] text-[11.5px] font-medium truncate max-w-[190px]"
            >
              <Stethoscope className="w-2.5 h-2.5 text-[#6B3FA0]" />
              <span className="truncate">{serv}</span>
            </span>
          ))}
          {item.servicios.length > 2 && (
            <span className="text-[11px] text-[#8A8594] font-medium">
              +{item.servicios.length - 2} más
            </span>
          )}
        </div>
      )}

      {/* Footer with demo chip and CTA button */}
      <div className="mt-3.5 pt-3 border-t border-[#F0EDF5] flex items-center justify-between gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FAF8FD] border border-[#E5E1EC] text-[10.5px] font-medium text-[#8A8594]">
          Información de demostración
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewFicha(item);
          }}
          className="inline-flex items-center gap-1 text-[12.5px] font-bold text-[#4A2270] hover:text-[#381559] group-hover:translate-x-0.5 transition-all cursor-pointer py-1 px-2 rounded-lg hover:bg-[#F0EBF8]"
        >
          <span>Ver ficha</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

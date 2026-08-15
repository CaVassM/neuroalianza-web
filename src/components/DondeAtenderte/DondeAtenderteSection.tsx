import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, Establecimiento, InsuranceType } from '../../types';
import rawEstablecimientos from '../../data/establecimientos.json';
import { haversineKm, getDistrictCoordinates } from '../../utils/distancia';
import { MapComponent } from './MapComponent';
import { EstablishmentCard } from './EstablishmentCard';
import { FichaServicioPanel } from './FichaServicioPanel';
import { 
  Compass, 
  MapPin, 
  Filter, 
  RotateCcw, 
  Locate, 
  ShieldCheck, 
  Sparkles,
  Building2,
  AlertTriangle,
  PhoneCall,
  ExternalLink,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';

interface DondeAtenderteSectionProps {
  user: UserProfile;
  onUpdateUser?: (updated: UserProfile) => void;
  activeBarrierFilter?: 'sin_cupos' | 'muy_lejos' | 'costo' | 'no_atendieron' | null;
  onClearBarrierFilter?: () => void;
}

type CoberturaFilter = 'TODOS' | 'SIS' | 'EsSalud' | 'Privado';
type NivelFilter = 'TODOS' | 'PRIMER_NIVEL' | 'HOSPITAL';
type MobileSheetPosition = 'collapsed' | 'medium' | 'expanded';

export const DondeAtenderteSection: React.FC<DondeAtenderteSectionProps> = ({
  user,
  onUpdateUser,
  activeBarrierFilter,
  onClearBarrierFilter,
}) => {
  // Sin distrito registrado el mapa necesita igualmente un centro desde el que
  // partir; se usa Lima Cercado, y la interfaz avisa de que falta el dato en
  // vez de presentar los establecimientos como si fueran los del barrio.
  const district = user.location.district || 'Lima (Cercado)';
  const defaultDistrictCoords = getDistrictCoordinates(district);

  // User location state
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    isBrowserLocation: boolean;
    district: string;
  }>({
    lat: defaultDistrictCoords.lat,
    lng: defaultDistrictCoords.lng,
    isBrowserLocation: false,
    district,
  });

  const [isLocating, setIsLocating] = useState(false);

  // Selected establishment code
  const [chosenEstablecimientoCodigo, setChosenEstablecimientoCodigo] = useState<string>(
    user.selectedEstablecimientoCodigo || '00003421'
  );

  const mapInsuranceToCobertura = (ins: InsuranceType): CoberturaFilter => {
    switch (ins) {
      case 'sis':
        return 'SIS';
      case 'essalud':
        return 'EsSalud';
      case 'eps':
        return 'Privado';
      default:
        return 'TODOS';
    }
  };

  const [coberturaFilter, setCoberturaFilter] = useState<CoberturaFilter>(
    mapInsuranceToCobertura(user.insurance)
  );
  const [nivelFilter, setNivelFilter] = useState<NivelFilter>('TODOS');
  const [mobileSheetPos, setMobileSheetPos] = useState<MobileSheetPosition>('medium');

  const [hoveredCodigo, setHoveredCodigo] = useState<string | null>(null);
  const [selectedCardCodigo, setSelectedCardCodigo] = useState<string | null>(null);
  const [fichaItem, setFichaItem] = useState<Establecimiento | null>(null);
  const [isFichaOpen, setIsFichaOpen] = useState(false);

  // Attempt browser geolocation on mount with 5-second timeout as required by Section D
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      const timer = setTimeout(() => {
        // Fallback if timeout reaches 5s
        setUserLocation((prev) =>
          prev.isBrowserLocation
            ? prev
            : {
                lat: defaultDistrictCoords.lat,
                lng: defaultDistrictCoords.lng,
                isBrowserLocation: false,
                district,
              }
        );
      }, 5000);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timer);
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            isBrowserLocation: true,
            district,
          });
        },
        () => {
          clearTimeout(timer);
          setUserLocation({
            lat: defaultDistrictCoords.lat,
            lng: defaultDistrictCoords.lng,
            isBrowserLocation: false,
            district,
          });
        },
        { timeout: 5000 }
      );

      return () => clearTimeout(timer);
    }
  }, [district, defaultDistrictCoords.lat, defaultDistrictCoords.lng]);

  const handleRequestGeolocation = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            isBrowserLocation: true,
            district,
          });
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
        },
        { timeout: 5000 }
      );
    }
  };

  // Filter & validate raw dataset + log discarded count to console (never on screen)
  const processedEstablecimientos = useMemo(() => {
    const validData: Establecimiento[] = [];
    let discardedCount = 0;

    (rawEstablecimientos as Establecimiento[]).forEach((item) => {
      // Discard: estado !== ACTIVO, lat/lng null/invalid, or out of Peru bounding box [-18, 0], [-81, -68]
      if (
        item.estado !== 'ACTIVO' ||
        item.lat == null ||
        item.lng == null ||
        item.lat < -18 ||
        item.lat > 0 ||
        item.lng < -81 ||
        item.lng > -68
      ) {
        discardedCount++;
        return;
      }

      const dist = haversineKm(userLocation.lat, userLocation.lng, item.lat, item.lng);

      validData.push({
        ...item,
        distanciaKm: dist,
      });
    });

    if (discardedCount > 0) {
      console.warn(`[Establecimientos] Se descartaron ${discardedCount} registros inválidos o fuera del rango geográfico de Perú.`);
    }

    return validData.sort((a, b) => (a.distanciaKm || 0) - (b.distanciaKm || 0));
  }, [userLocation.lat, userLocation.lng]);

  // Apply UI filters
  const filteredEstablecimientos = useMemo(() => {
    return processedEstablecimientos.filter((item) => {
      if (activeBarrierFilter === 'sin_cupos') {
        if (chosenEstablecimientoCodigo && item.codigo === chosenEstablecimientoCodigo) {
          return false;
        }
        if ((item.distanciaKm || 0) > 10) {
          return false;
        }
      } else if (activeBarrierFilter === 'muy_lejos') {
        if ((item.distanciaKm || 0) > 2) {
          return false;
        }
      } else if (activeBarrierFilter === 'costo') {
        if (item.institucion !== 'MINSA' && item.institucion !== 'GOBIERNO REGIONAL') {
          return false;
        }
      } else if (activeBarrierFilter === 'no_atendieron') {
        if (chosenEstablecimientoCodigo && item.codigo === chosenEstablecimientoCodigo) {
          return false;
        }
      }

      if (coberturaFilter !== 'TODOS' && item.cobertura !== coberturaFilter) {
        return false;
      }

      if (nivelFilter === 'PRIMER_NIVEL') {
        if (!item.categoria.startsWith('I-')) return false;
      } else if (nivelFilter === 'HOSPITAL') {
        if (item.categoria.startsWith('I-')) return false;
      }

      return true;
    });
  }, [processedEstablecimientos, coberturaFilter, nivelFilter, activeBarrierFilter, chosenEstablecimientoCodigo]);

  const handleOpenFicha = (item: Establecimiento) => {
    setFichaItem(item);
    setIsFichaOpen(true);
  };

  const handleSelectAsPrimary = (item: Establecimiento) => {
    setChosenEstablecimientoCodigo(item.codigo);
    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        selectedEstablecimientoCodigo: item.codigo,
      });
    }
  };

  const handleClearFilters = () => {
    setCoberturaFilter('TODOS');
    setNivelFilter('TODOS');
  };

  const chosenEstablecimiento = useMemo(() => {
    return (
      processedEstablecimientos.find((i) => i.codigo === chosenEstablecimientoCodigo) || null
    );
  }, [processedEstablecimientos, chosenEstablecimientoCodigo]);

  // Check if chosen establishment level mismatches phase expectation (Fase 3 expects Primer Nivel I-1 to I-4)
  const isLevelMismatch =
    user.fase === 3 &&
    chosenEstablecimiento &&
    !chosenEstablecimiento.categoria.startsWith('I-');

  const coverageDisplayLabel =
    coberturaFilter === 'TODOS'
      ? 'Todos los seguros'
      : coberturaFilter === 'SIS'
      ? 'SIS'
      : coberturaFilter === 'EsSalud'
      ? 'EsSalud'
      : 'Seguro Privado';

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9DFF5] text-xs font-semibold text-[#4A2270] mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Mapeo georreferenciado</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-fraunces font-bold text-[#2E2A33]">
            Dónde atenderte en {district}
          </h2>
          <p className="text-sm text-[#6E6A75] mt-1 max-w-2xl">
            Explora los puestos de salud, policlínicos y hospitales cercanos con capacidad para evaluación infantil y tamizajes.
          </p>
        </div>

        {/* Distance origin indicator banner */}
        <div className="bg-white border border-[#E5E1EC] rounded-xl px-3.5 py-2 flex items-center justify-between sm:justify-start gap-2.5 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2E7D5B] animate-pulse" />
            <span className="text-xs font-medium text-[#4A4652]">
              {userLocation.isBrowserLocation
                ? 'Distancias desde tu ubicación actual'
                : `Distancias desde el centro de ${district}`}
            </span>
          </div>
          {!userLocation.isBrowserLocation && (
            <button
              type="button"
              onClick={handleRequestGeolocation}
              disabled={isLocating}
              className="text-[11.5px] font-bold text-[#4A2270] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Locate className="w-3 h-3" />
              <span>{isLocating ? 'Ubicando...' : 'Usar mi GPS'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Chosen Establishment Banner */}
      {chosenEstablecimiento && (
        <div className="space-y-2">
          <div className="bg-[#E9DFF5]/60 border border-[#D5C6EB] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#4A2270] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold tracking-wider text-[#4A2270] uppercase">
                  Establecimiento elegido para tu ruta
                </span>
                <h3 className="text-[16px] font-bold text-[#2E2A33]">
                  {chosenEstablecimiento.nombre}
                </h3>
                <p className="text-xs text-[#6E6A75] mt-0.5">
                  {chosenEstablecimiento.clasificacion} ({chosenEstablecimiento.categoria}) · {chosenEstablecimiento.direccion}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenFicha(chosenEstablecimiento)}
              className="shrink-0 px-4 py-2 bg-white hover:bg-[#FAF8FD] border border-[#D5C6EB] text-[#4A2270] text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Ver ficha y requisitos
            </button>
          </div>

          {/* Level mismatch non-blocking amber warning */}
          {isLevelMismatch && (
            <div className="bg-[#FDF1DF] border border-[#F6DCB6] rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-[#C77700] font-medium">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                Tu ruta sugiere empezar por un establecimiento de primer nivel (puesto o centro de salud I-1 a I-4). Puedes mantener tu elección si ya cuentas con una referencia previa.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Active Barrier Filter Banner */}
      {activeBarrierFilter && (
        <div className="bg-[#FDF1DF] border border-[#F6DCB6] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C77700] text-white flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C77700] block">
                Filtro activo por barrera reportada
              </span>
              <p className="text-xs sm:text-sm font-bold text-[#2E2A33] mt-0.5">
                {activeBarrierFilter === 'sin_cupos' &&
                  'Excluimos tu establecimiento actual y ampliamos la búsqueda (hasta 10 km).'}
                {activeBarrierFilter === 'muy_lejos' &&
                  'Filtrando establecimientos a 2 km o menos.'}
                {activeBarrierFilter === 'costo' &&
                  'Mostrando solo establecimientos públicos (MINSA y Gobierno Regional).'}
                {activeBarrierFilter === 'no_atendieron' &&
                  'Excluimos tu establecimiento actual y mantenemos el nivel de atención.'}
              </p>
            </div>
          </div>

          {onClearBarrierFilter && (
            <button
              type="button"
              onClick={onClearBarrierFilter}
              className="shrink-0 px-4 py-2 bg-white hover:bg-[#FAF8FD] border border-[#F6DCB6] text-[#C77700] hover:text-[#9A5C00] text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Quitar filtro</span>
            </button>
          )}
        </div>
      )}

      {/* Filter Chips Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E1EC] p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-[#6E6A75] uppercase tracking-wider flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3 text-[#4A2270]" />
            <span>Seguro:</span>
          </span>

          {(['TODOS', 'SIS', 'EsSalud', 'Privado'] as CoberturaFilter[]).map((cov) => {
            const isSelected = coberturaFilter === cov;
            const label = cov === 'TODOS' ? 'Todos' : cov;
            return (
              <button
                key={cov}
                type="button"
                onClick={() => setCoberturaFilter(cov)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#4A2270] text-white shadow-xs'
                    : 'bg-[#F7F5FA] text-[#6E6A75] hover:bg-[#E9DFF5]/60 hover:text-[#2E2A33]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 flex-wrap border-t md:border-t-0 pt-2 md:pt-0 border-[#F0EDF5]">
          <span className="text-xs font-bold text-[#6E6A75] uppercase tracking-wider mr-1">
            Nivel:
          </span>

          {[
            { id: 'TODOS', label: 'Todos' },
            { id: 'PRIMER_NIVEL', label: 'Primer nivel (I-1 a I-4)' },
            { id: 'HOSPITAL', label: 'Hospitales (II y III)' },
          ].map((lvl) => {
            const isSelected = nivelFilter === lvl.id;
            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setNivelFilter(lvl.id as NivelFilter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#6B3FA0] text-white shadow-xs'
                    : 'bg-[#F7F5FA] text-[#6E6A75] hover:bg-[#E9DFF5]/60 hover:text-[#2E2A33]'
                }`}
              >
                {lvl.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6 items-start">
        {/* Map Container */}
        <div className="w-full space-y-2">
          <MapComponent
            items={filteredEstablecimientos}
            userLocation={userLocation}
            hoveredId={hoveredCodigo}
            selectedId={selectedCardCodigo}
            onSelectEstablecimiento={(item) => {
              setSelectedCardCodigo(item.codigo);
            }}
            onOpenFicha={handleOpenFicha}
            // El radio dibujado tiene que coincidir con el que se está
            // filtrando: con "sin cupos" la búsqueda se amplía a 10 km.
            radioKm={activeBarrierFilter === 'sin_cupos' ? 10 : 2}
          />

          <div className="bg-white rounded-xl border border-[#E5E1EC] px-4 py-2.5 flex items-center justify-between text-[11.5px] text-[#6E6A75] flex-wrap gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#6B3FA0]" />
                <span>Primer nivel (I-1 a I-4 · CRED)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#4A2270]" />
                <span>Nivel II (Policlínicos/Hospitales)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#2E1A47]" />
                <span>Nivel III (Alta especialidad)</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[#4A2270] font-semibold">
              <MapPin className="w-3 h-3" />
              <span>Tu referencia</span>
            </div>
          </div>
        </div>

        {/* Desktop List */}
        <div className="hidden lg:block w-full space-y-3">
          <div className="px-1">
            <h3 className="text-lg font-bold text-[#2E2A33]">
              Opciones cercanas a ti ({filteredEstablecimientos.length})
            </h3>
            <p className="text-xs text-[#6E6A75] mt-0.5">
              {district} · {coverageDisplayLabel} · ordenadas por cercanía
            </p>
          </div>

          {activeBarrierFilter === 'costo' && (
            <div className="p-4 rounded-2xl bg-[#E6F2EC] border border-[#C3E5D4] space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-[#2E7D5B]">
                <ShieldCheck className="w-4.5 h-4.5 shrink-0" />
                <h4 className="font-bold text-xs sm:text-sm">La afiliación al SIS no tiene costo</h4>
              </div>
              <p className="text-xs text-[#2E2A33] leading-relaxed">
                Puedes afiliarte gratuitamente en cualquier centro de salud MINSA con el DNI de tu niño/a o solicitar el SIS Gratuito en línea.
              </p>
              <a
                href="https://www.gob.pe/sis"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#2E7D5B] hover:underline pt-0.5"
              >
                <span>Consultar afiliación al SIS en gob.pe</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1.5 custom-scrollbar">
            {filteredEstablecimientos.length > 0 ? (
              filteredEstablecimientos.map((item) => (
                <EstablishmentCard
                  key={item.codigo}
                  item={item}
                  isSelected={selectedCardCodigo === item.codigo}
                  isHovered={hoveredCodigo === item.codigo}
                  isMarkedAsUserChoice={chosenEstablecimientoCodigo === item.codigo}
                  onHover={(id) => setHoveredCodigo(id)}
                  onClick={(it) => {
                    setSelectedCardCodigo(it.codigo);
                  }}
                  onViewFicha={handleOpenFicha}
                />
              ))
            ) : activeBarrierFilter === 'muy_lejos' ? (
              <div className="p-6 rounded-2xl bg-white border border-[#E5E1EC] space-y-4 text-center shadow-xs">
                <div className="w-12 h-12 rounded-full bg-[#E9DFF5] text-[#4A2270] flex items-center justify-center mx-auto">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-[15px] text-[#2E2A33]">
                    No encontramos centros a menos de 2 km
                  </h4>
                  <p className="text-xs text-[#6E6A75] leading-relaxed max-w-xs mx-auto">
                    Algunos establecimientos ofrecen atención a distancia. Consúltalo al llamar.
                  </p>
                </div>
                {onClearBarrierFilter && (
                  <button
                    type="button"
                    onClick={onClearBarrierFilter}
                    className="px-4 py-2 bg-[#4A2270] hover:bg-[#381559] text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ver opciones a mayor distancia</span>
                  </button>
                )}
              </div>
            ) : (
              /* Filter Empty State with 'Quitar filtros' button */
              <div className="p-8 rounded-2xl bg-white border border-[#E5E1EC] text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#F7F5FA] text-[#6E6A75] flex items-center justify-center mx-auto">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-[15px] text-[#2E2A33]">
                    No encontramos opciones con esos filtros
                  </h4>
                  <p className="text-xs text-[#6E6A75] leading-relaxed max-w-xs mx-auto">
                    Prueba cambiando o quitando los filtros de seguro o nivel de atención.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-[#4A2270] hover:bg-[#381559] text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Quitar filtros</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Draggable Sheet */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40">
        <motion.div
          animate={{
            height:
              mobileSheetPos === 'collapsed'
                ? '76px'
                : mobileSheetPos === 'medium'
                ? '48vh'
                : '86vh',
          }}
          transition={{ type: 'spring', damping: 26, stiffness: 260 }}
          className="bg-white border-t border-[#E5E1EC] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
        >
          <div
            onClick={() => {
              if (mobileSheetPos === 'collapsed') setMobileSheetPos('medium');
              else if (mobileSheetPos === 'medium') setMobileSheetPos('expanded');
              else setMobileSheetPos('collapsed');
            }}
            className="px-4 pt-3 pb-2.5 cursor-pointer bg-white border-b border-[#F0EDF5] shrink-0"
          >
            <div className="w-10 h-1 rounded-full bg-[#D5C6EB] mx-auto mb-2" />

            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-[#4A2270]">
                  {filteredEstablecimientos.length} establecimientos en {district}
                </span>
                <p className="text-[11px] text-[#6E6A75]">
                  {mobileSheetPos === 'collapsed' ? 'Toca para ver lista' : 'Ordenados por distancia'}
                </p>
              </div>

              <div className="flex items-center gap-1 bg-[#F7F5FA] p-1 rounded-xl border border-[#E5E1EC]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMobileSheetPos('collapsed');
                  }}
                  className={`px-2 py-1 rounded-lg text-[10.5px] font-bold transition-colors ${
                    mobileSheetPos === 'collapsed'
                      ? 'bg-[#4A2270] text-white'
                      : 'text-[#6E6A75] hover:text-[#2E2A33]'
                  }`}
                >
                  Ocultar
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMobileSheetPos('medium');
                  }}
                  className={`px-2 py-1 rounded-lg text-[10.5px] font-bold transition-colors ${
                    mobileSheetPos === 'medium'
                      ? 'bg-[#4A2270] text-white'
                      : 'text-[#6E6A75] hover:text-[#2E2A33]'
                  }`}
                >
                  Mitad
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMobileSheetPos('expanded');
                  }}
                  className={`px-2 py-1 rounded-lg text-[10.5px] font-bold transition-colors ${
                    mobileSheetPos === 'expanded'
                      ? 'bg-[#4A2270] text-white'
                      : 'text-[#6E6A75] hover:text-[#2E2A33]'
                  }`}
                >
                  Expandir
                </button>
              </div>
            </div>
          </div>

          {mobileSheetPos !== 'collapsed' && (
            <div className="p-4 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
              {filteredEstablecimientos.length > 0 ? (
                filteredEstablecimientos.map((item) => (
                  <EstablishmentCard
                    key={item.codigo}
                    item={item}
                    isSelected={selectedCardCodigo === item.codigo}
                    isHovered={hoveredCodigo === item.codigo}
                    isMarkedAsUserChoice={chosenEstablecimientoCodigo === item.codigo}
                    onHover={(id) => setHoveredCodigo(id)}
                    onClick={(it) => {
                      setSelectedCardCodigo(it.codigo);
                    }}
                    onViewFicha={handleOpenFicha}
                  />
                ))
              ) : (
                <div className="p-6 rounded-2xl bg-[#FAF8FD] border border-[#E5E1EC] text-center space-y-3">
                  <p className="text-xs text-[#6E6A75]">
                    No encontramos opciones con los filtros seleccionados.
                  </p>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-3.5 py-1.5 bg-[#4A2270] text-white text-xs font-bold rounded-xl"
                  >
                    Quitar filtros
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      <FichaServicioPanel
        item={fichaItem}
        isOpen={isFichaOpen}
        onClose={() => setIsFichaOpen(false)}
        onSelectAsPrimary={handleSelectAsPrimary}
        isPrimary={fichaItem?.codigo === chosenEstablecimientoCodigo}
      />
    </section>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, Establecimiento, InsuranceType } from '../../types';
import { ESTABLECIMIENTOS } from '../../data/establecimientos';
import {
  haversineKm,
  getDistrictCoordinates,
  formatDistancia,
  centroCobertura,
} from '../../utils/distancia';
import {
  calcularTerritorio,
  establecimientoDeZona,
  esPrimerNivel,
  RADIO_MAX_KM,
} from '../../utils/territorios';
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
  MessageCircle,
  Info,
  Layers,
  ChevronDown
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

/**
 * Tope técnico de marcadores en el mapa.
 *
 * Quien decide cuántas opciones hay es el radio, no un recorte: a cinco
 * kilómetros el distrito más denso de Lima llega a 131, así que este tope no
 * llega a activarse en el uso normal. Está por si se amplía la búsqueda en una
 * zona muy poblada, porque montar cientos de marcadores con su ficha flotante
 * deja el mapa pesado al arrastrarlo.
 *
 * La LISTA no lleva tope: recortarla a veinticinco mientras el encabezado
 * anunciaba cuarenta y seis hacía que el número y lo que se veía no cuadraran.
 */
const MAXIMO_EN_MAPA = 150;

/**
 * Hasta dónde llega "cerca de ti".
 *
 * Sin este tope, "opciones cercanas" listaba los 448 establecimientos SIS de
 * Lima y Callao: la mitad a veinte kilómetros y en otro distrito. Cinco
 * kilómetros es lo que una familia recorre para un control, en transporte
 * público y con un niño pequeño.
 */
const RADIO_CERCANIA_KM = 5;

/** Cuando a esa distancia no hay nada, la familia puede pedir mirar más lejos. */
const RADIO_AMPLIADO_KM = 15;

export const DondeAtenderteSection: React.FC<DondeAtenderteSectionProps> = ({
  user,
  onUpdateUser,
  activeBarrierFilter,
  onClearBarrierFilter,
}) => {
  // El distrito registrado manda. Si no se reconoce —una familia de provincia,
  // o sin distrito— el mapa se sitúa en el centro de la zona cubierta y se
  // avisa, en vez de enseñar un barrio ajeno como si fuera el suyo.
  const district = user.location.district || '';
  const coordsDistrito = getDistrictCoordinates(district);
  const distritoReconocido = coordsDistrito !== null;
  const defaultDistrictCoords = coordsDistrito ?? centroCobertura();
  const etiquetaOrigen = distritoReconocido ? district : 'Lima y Callao';

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

  // Establecimiento que la familia eligió. Empieza vacío: antes caía a un
  // código fijo del Centro de Salud Santa Cruz, así que una familia recién
  // registrada aparecía con un establecimiento "suyo" que nunca escogió.
  const [chosenEstablecimientoCodigo, setChosenEstablecimientoCodigo] = useState<string>(
    user.selectedEstablecimientoCodigo || ''
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

  const [radioAmpliado, setRadioAmpliado] = useState(false);
  const [mostrarTerritorios, setMostrarTerritorios] = useState(true);
  // La explicación del mapa arranca plegada: es de una sola lectura y ocupaba
  // más alto que el propio mapa.
  const [detalleMapaAbierto, setDetalleMapaAbierto] = useState(false);

  const [hoveredCodigo, setHoveredCodigo] = useState<string | null>(null);
  const [selectedCardCodigo, setSelectedCardCodigo] = useState<string | null>(null);
  const [fichaItem, setFichaItem] = useState<Establecimiento | null>(null);
  const [isFichaOpen, setIsFichaOpen] = useState(false);

  // La búsqueda arranca SIEMPRE desde el distrito que la familia registró.
  //
  // Antes se pedía el GPS solo al abrir la sección: además de disparar el aviso
  // del navegador sin que nadie lo pidiera, centraba la búsqueda donde la
  // persona está EN ESE MOMENTO, que no tiene por qué ser donde le corresponde
  // atenderse. Muchas familias solo pueden ir al establecimiento asignado a su
  // domicilio, así que el distrito es el punto de partida correcto. El GPS
  // sigue disponible en el botón "Usar mi ubicación".
  useEffect(() => {
    setUserLocation((prev) =>
      prev.isBrowserLocation
        ? prev // ya pulsó el botón: respetamos su elección
        : {
            lat: defaultDistrictCoords.lat,
            lng: defaultDistrictCoords.lng,
            isBrowserLocation: false,
            district,
          }
    );
  }, [district, defaultDistrictCoords.lat, defaultDistrictCoords.lng]);

  /**
   * Soltar el GPS y volver al distrito registrado.
   *
   * El permiso del navegador no se puede retirar desde aquí, y una vez pulsado
   * "usar mi ubicación" no había forma de deshacerlo: si alguien consultaba la
   * ruta desde el trabajo o desde casa de un familiar, se quedaba con las
   * distancias medidas desde allí hasta recargar la página.
   */
  const handleVolverAlDistrito = () => {
    setUserLocation({
      lat: defaultDistrictCoords.lat,
      lng: defaultDistrictCoords.lng,
      isBrowserLocation: false,
      district,
    });
  };

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

    (ESTABLECIMIENTOS).forEach((item) => {
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

  /**
   * Hasta dónde buscar.
   *
   * Por defecto el radio de cercanía. Las barreras lo mueven: "no había cupos"
   * obliga a mirar más lejos, y "queda muy lejos" a mirar más cerca.
   */
  const radioBusquedaKm =
    activeBarrierFilter === 'sin_cupos'
      ? 10
      : activeBarrierFilter === 'muy_lejos'
      ? 2
      : radioAmpliado
      ? RADIO_AMPLIADO_KM
      : RADIO_CERCANIA_KM;

  // Apply UI filters
  const filteredEstablecimientos = useMemo(() => {
    return processedEstablecimientos.filter((item) => {
      if ((item.distanciaKm ?? Infinity) > radioBusquedaKm) return false;

      if (activeBarrierFilter === 'sin_cupos') {
        if (chosenEstablecimientoCodigo && item.codigo === chosenEstablecimientoCodigo) {
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
  }, [
    processedEstablecimientos,
    coberturaFilter,
    nivelFilter,
    activeBarrierFilter,
    chosenEstablecimientoCodigo,
    radioBusquedaKm,
  ]);

  /**
   * Zonas de atención aproximadas.
   *
   * Se calculan sobre el conjunto COMPLETO, no sobre el filtrado: el reparto
   * del territorio no cambia porque la familia marque un filtro de seguro, y
   * unas fronteras que se movieran solas no significarían nada.
   *
   * Solo se dibujan dos: la que cubre a la familia, siempre, y la del
   * establecimiento que tenga el cursor encima, mientras dure el hover. Con 650
   * establecimientos cargados, pintarlas todas dejaba el mapa ilegible.
   */
  /**
   * Sobre qué establecimientos se reparte el territorio.
   *
   * No sobre todos: cada sistema sectoriza el suyo. A una familia con SIS no le
   * sirve saber que el policlínico de EsSalud de su esquina es el más cercano,
   * porque no la va a atender, y en Breña ese policlínico era justo el primer
   * nivel más próximo. El reparto sigue al seguro de la familia, no al filtro
   * que esté mirando en ese momento.
   *
   * Las clínicas privadas no tienen sector asignado: se va a la que uno elija.
   */
  const poolZonas = useMemo(() => {
    const cobertura = mapInsuranceToCobertura(user.insurance);
    if (cobertura === 'Privado') return [];
    // Sin seguro declarado, la referencia es el sistema público: la afiliación
    // al SIS es gratuita y es la puerta de entrada que propone la ruta.
    const objetivo = cobertura === 'TODOS' ? 'SIS' : cobertura;
    return processedEstablecimientos.filter((e) => e.cobertura === objetivo);
  }, [processedEstablecimientos, user.insurance]);

  const establecimientoPropio = useMemo(
    () => establecimientoDeZona([userLocation.lat, userLocation.lng], poolZonas),
    [userLocation.lat, userLocation.lng, poolZonas]
  );

  const zonaPropia = useMemo(
    () => (establecimientoPropio ? calcularTerritorio(establecimientoPropio, poolZonas) : null),
    [establecimientoPropio, poolZonas]
  );

  const zonaResaltada = useMemo(() => {
    if (!hoveredCodigo) return null;
    const item = poolZonas.find((e) => e.codigo === hoveredCodigo);
    // Los hospitales no tienen sector: se llega por referencia, no por dirección.
    if (!item || !esPrimerNivel(item)) return null;
    return calcularTerritorio(item, poolZonas);
  }, [hoveredCodigo, poolZonas]);

  const resaltadaEsAjena =
    !!zonaResaltada && zonaResaltada.codigo !== establecimientoPropio?.codigo;

  /**
   * Orden de las opciones: primero el que te toca, luego por distancia.
   *
   * Que un establecimiento cubra tu dirección pesa más que estar cien metros
   * más cerca: es el que te va a atender sin discutir la referencia. Solo sube
   * si sobrevive a los filtros que la familia haya marcado.
   */
  const opcionesOrdenadas = useMemo(() => {
    if (!establecimientoPropio) return filteredEstablecimientos;
    const propio = filteredEstablecimientos.find(
      (e) => e.codigo === establecimientoPropio.codigo
    );
    if (!propio) return filteredEstablecimientos;
    return [propio, ...filteredEstablecimientos.filter((e) => e.codigo !== propio.codigo)];
  }, [filteredEstablecimientos, establecimientoPropio]);

  /** El que se propone mientras la familia no haya elegido. */
  const sugeridoPorCercania = opcionesOrdenadas[0] ?? null;
  const sugeridoEsDeTuZona = sugeridoPorCercania?.codigo === establecimientoPropio?.codigo;

  // La lista muestra todo lo que hay dentro del radio, para que el número del
  // encabezado sea exactamente lo que se puede recorrer.
  const establecimientosEnMapa = useMemo(
    () => opcionesOrdenadas.slice(0, MAXIMO_EN_MAPA),
    [opcionesOrdenadas]
  );
  const establecimientosEnLista = opcionesOrdenadas;

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

    // Al elegir se cierra el panel lateral y la vista queda donde estaba: en
    // mitad del listado, sin señal de que la elección se guardó. Subimos al
    // resumen del establecimiento, que es donde aparece qué hacer ahora.
    setTimeout(() => {
      document
        .getElementById('resumen-establecimiento-elegido')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 320);
  };

  const hayFiltrosActivos = coberturaFilter !== 'TODOS' || nivelFilter !== 'TODOS';

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
    // El colchón de abajo es para la hoja móvil, que va fija al borde inferior:
    // sin él tapaba los últimos ochenta píxeles de la sección para siempre.
    <section className="space-y-6 pb-24 lg:pb-0">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9DFF5] text-xs font-semibold text-[#4A2270] mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Mapeo georreferenciado</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-fraunces font-bold text-[#2E2A33]">
            Dónde atenderte en {etiquetaOrigen}
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
                : `Distancias desde el centro de ${etiquetaOrigen}`}
            </span>
          </div>
          {userLocation.isBrowserLocation ? (
            <button
              type="button"
              onClick={handleVolverAlDistrito}
              className="text-[11.5px] font-bold text-[#4A2270] hover:underline flex items-center gap-1 cursor-pointer"
              title={
                distritoReconocido
                  ? `Volver a medir desde ${district}`
                  : 'Dejar de usar tu ubicación actual'
              }
            >
              <RotateCcw className="w-3 h-3" />
              <span>
                {distritoReconocido ? `Volver a ${district}` : 'Quitar mi ubicación'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRequestGeolocation}
              disabled={isLocating}
              className="text-[11.5px] font-bold text-[#4A2270] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Locate className="w-3 h-3" />
              <span>{isLocating ? 'Ubicando…' : 'Usar mi ubicación actual'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Distrito que no está en el padrón cargado.
          Antes esto no se avisaba: se caía a Miraflores en silencio y la
          familia veía un mapa perfectamente creíble de un barrio ajeno. */}
      {!distritoReconocido && (
        <div className="bg-[#FDF1DF] border border-[#F6DCB6] rounded-2xl p-4 flex items-start gap-3 text-xs text-[#C77700]">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {district ? (
              <>
                No tenemos establecimientos cargados en{' '}
                <strong className="text-[#2E2A33]">{district}</strong>. Este prototipo cubre
                Lima Metropolitana y Callao.
              </>
            ) : (
              <>Aún no registraste tu distrito, así que no podemos medir distancias desde tu barrio.</>
            )}{' '}
            Puedes usar tu ubicación actual para ordenar lo que sí tenemos.
          </p>
        </div>
      )}

      {/* Sugerencia mientras la familia no haya elegido.
          Sin esto la sección abre con una lista y ninguna respuesta a la
          pregunta que trae: "¿y a cuál voy?". */}
      {!chosenEstablecimiento && sugeridoPorCercania && (
        <div className="bg-[#FAF8FD] border border-[#D5C6EB] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E9DFF5] text-[#4A2270] flex items-center justify-center shrink-0 mt-0.5">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider text-[#4A2270] uppercase">
                {sugeridoEsDeTuZona ? 'El que te correspondería' : 'El más cercano a ti'}
              </span>
              <h3 className="text-[16px] font-bold text-[#2E2A33]">
                {sugeridoPorCercania.nombre}
              </h3>
              <p className="text-xs text-[#6E6A75] mt-0.5">
                {sugeridoPorCercania.clasificacion} ({sugeridoPorCercania.categoria})
                {sugeridoPorCercania.distanciaKm !== undefined && (
                  <> · a {formatDistancia(sugeridoPorCercania.distanciaKm)}</>
                )}
                {' '}· {userLocation.isBrowserLocation
                  ? 'desde tu ubicación actual'
                  : `desde ${etiquetaOrigen}`}
              </p>
              {sugeridoEsDeTuZona && (
                <p className="text-[11.5px] text-[#2E7D5B] mt-1">
                  Tu ubicación cae dentro de su zona de atención estimada.
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleOpenFicha(sugeridoPorCercania)}
            className="shrink-0 px-4 py-2.5 bg-[#4A2270] hover:bg-[#381559] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Ver este primero
          </button>
        </div>
      )}

      {/* Primary Chosen Establishment Banner */}
      {chosenEstablecimiento && (
        <div className="space-y-2" id="resumen-establecimiento-elegido">
          <div className="bg-[#E9DFF5]/60 border border-[#D5C6EB] rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4A2270] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-[#4A2270] uppercase">
                    Lugar sugerido para tu ruta
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

            {/* Qué hacer ahora.
                Elegir el establecimiento dejaba a la familia sin saber cuál era
                el siguiente movimiento; estos son los tres pasos concretos. */}
            <div className="bg-white/70 border border-[#D5C6EB] rounded-xl p-4 space-y-2.5">
              <h4 className="text-[13px] font-bold text-[#4A2270]">
                ¿Y ahora qué hago?
              </h4>
              <ol className="space-y-1.5 text-[12.5px] text-[#2E2A33]">
                {[
                  'Llama o acércate y pide una cita. En la ficha tienes el teléfono, el horario y por qué servicio entrar.',
                  'Lleva el resultado de tu tamizaje y los documentos de la lista.',
                  'Cuando vuelvas de la cita, márcala en tu ruta con "Ya fui a mi cita" para saber qué sigue.',
                ].map((paso, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#E9DFF5] text-[#4A2270] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{paso}</span>
                  </li>
                ))}
              </ol>
              <p className="text-[11.5px] text-[#6E6A75] leading-relaxed pt-1.5 border-t border-[#E9DFF5] flex items-start gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-[#4A2270] shrink-0 mt-px" />
                <span>
                  Puedes llevarte tu ruta al celular: más abajo, en{' '}
                  <strong className="text-[#2E2A33]">Lleva tu ruta en el celular</strong>,
                  te enviamos el enlace por WhatsApp para retomarla y contarnos cómo te fue.
                </span>
              </p>
            </div>
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
            items={establecimientosEnMapa}
            userLocation={userLocation}
            hoveredId={hoveredCodigo}
            selectedId={selectedCardCodigo}
            onSelectEstablecimiento={(item) => {
              setSelectedCardCodigo(item.codigo);
            }}
            onOpenFicha={handleOpenFicha}
            onHoverEstablecimiento={setHoveredCodigo}
            zonaPropia={zonaPropia}
            zonaResaltada={zonaResaltada}
            resaltadaEsAjena={resaltadaEsAjena}
            mostrarTerritorios={mostrarTerritorios}
            // El radio solo se dibuja cuando hay un filtro que recorta por
            // distancia. Sin filtro no hay ningún alcance que representar.
            radioKm={
              activeBarrierFilter === 'sin_cupos'
                ? 10
                : activeBarrierFilter === 'muy_lejos'
                ? 2
                : null
            }
          />

          {/* Zonas de atención.
              A la vista queda solo lo accionable: qué zona te toca y el botón
              para verla. La explicación —de dónde sale la estimación, la
              leyenda de colores, el aviso de confirmar por teléfono— vive
              detrás de la flecha, porque es información de una sola lectura y
              ocupaba más que el propio mapa.

              El aviso de que es una estimación NO se pliega: va en la línea
              verde, siempre visible. Si una familia ve su zona, va al centro
              que le toca según el mapa y resulta que no le correspondía, la
              mandan de vuelta. Esa frase es lo que hace aceptable dibujarlo. */}
          <div className="bg-white rounded-xl border border-[#E5E1EC] px-4 py-3 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Layers className="w-3.5 h-3.5 text-[#4A2270] shrink-0" />
                <span className="text-[12px] font-bold text-[#2E2A33] truncate">
                  Zonas de atención
                </span>
                <span className="text-[11px] text-[#8A8594] shrink-0">aproximadas</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setMostrarTerritorios((v) => !v)}
                  aria-pressed={mostrarTerritorios}
                  className={`px-3 py-1.5 rounded-xl text-[11.5px] font-bold transition-all cursor-pointer border ${
                    mostrarTerritorios
                      ? 'bg-[#4A2270] border-[#4A2270] text-white shadow-xs'
                      : 'bg-[#F7F5FA] border-[#E5E1EC] text-[#6E6A75] hover:text-[#2E2A33]'
                  }`}
                >
                  {mostrarTerritorios ? 'Ocultar zonas' : 'Ver zonas'}
                </button>

                <button
                  type="button"
                  onClick={() => setDetalleMapaAbierto((v) => !v)}
                  aria-expanded={detalleMapaAbierto}
                  aria-controls="detalle-mapa"
                  className="p-1.5 rounded-lg text-[#6E6A75] hover:bg-[#F7F5FA] hover:text-[#2E2A33] transition-colors cursor-pointer"
                  title={detalleMapaAbierto ? 'Ocultar cómo leer el mapa' : 'Cómo leer este mapa'}
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      detalleMapaAbierto ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>
            </div>

            {mostrarTerritorios && (
              <p
                className={`text-[11.5px] rounded-lg px-3 py-2 leading-relaxed border ${
                  establecimientoPropio
                    ? 'text-[#2E7D5B] bg-[#E6F2EC] border-[#C3E5D4]'
                    : 'text-[#6E6A75] bg-[#F7F5FA] border-[#E5E1EC]'
                }`}
              >
                {establecimientoPropio ? (
                  <>
                    Te tocaría <strong>{establecimientoPropio.nombre}</strong> (zona verde).
                    Es una estimación: confírmalo antes de ir.
                  </>
                ) : (
                  <>
                    No hay ningún establecimiento de primer nivel a menos de {RADIO_MAX_KM} km
                    de {userLocation.isBrowserLocation ? 'tu ubicación' : `el centro de ${district}`},
                    así que no podemos estimar tu zona. Usa la lista de opciones cercanas.
                  </>
                )}
              </p>
            )}

            {detalleMapaAbierto && (
              <div
                id="detalle-mapa"
                className="space-y-3 pt-2.5 border-t border-[#F0EDF5] animate-in fade-in slide-in-from-top-1 duration-200"
              >
                <p className="text-[11.5px] text-[#6E6A75] leading-relaxed">
                  En el primer nivel cada centro de salud tiene un sector asignado y te
                  atiendes en el que cubre tu dirección.{' '}
                  <strong className="text-[#2E2A33]">
                    Pasa el cursor por un establecimiento del mapa
                  </strong>{' '}
                  para ver la suya. Lo que dibujamos es una estimación por cercanía: la
                  delimitación oficial la aprueba tu DIRIS y no está publicada como mapa
                  digital, así que{' '}
                  <strong className="text-[#2E2A33]">confírmalo llamando antes de ir</strong>.
                  Los hospitales no aparecen con zona: a ellos se llega por referencia, no
                  por dirección.
                </p>

                <div className="flex items-center justify-between text-[11.5px] text-[#6E6A75] flex-wrap gap-2">
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

                <p className="text-[11px] text-[#8A8594] leading-relaxed">
                  {opcionesOrdenadas.length > MAXIMO_EN_MAPA ? (
                    <>
                      El mapa dibuja los {MAXIMO_EN_MAPA} más cercanos de{' '}
                      {opcionesOrdenadas.length} que hay a menos de {radioBusquedaKm} km.
                    </>
                  ) : (
                    <>
                      El mapa muestra los establecimientos a menos de {radioBusquedaKm} km de{' '}
                      {userLocation.isBrowserLocation ? 'tu ubicación' : etiquetaOrigen}.
                    </>
                  )}{' '}
                  Cambia de distrito o usa tu ubicación para mirar otra zona.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop List */}
        <div className="hidden lg:block w-full space-y-3">
          <div className="px-1">
            <h3 className="text-lg font-bold text-[#2E2A33]">
              Opciones a menos de {radioBusquedaKm} km ({opcionesOrdenadas.length})
            </h3>
            <p className="text-xs text-[#6E6A75] mt-0.5">
              {etiquetaOrigen} · {coverageDisplayLabel} · ordenadas por cercanía
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
            {opcionesOrdenadas.length > 0 ? (
              establecimientosEnLista.map((item) => (
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
              /* Vacío: puede ser por el radio o por los filtros, y la salida
                 no es la misma. Se ofrecen las dos. */
              <div className="p-8 rounded-2xl bg-white border border-[#E5E1EC] text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#F7F5FA] text-[#6E6A75] flex items-center justify-center mx-auto">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-[15px] text-[#2E2A33]">
                    Nada a menos de {radioBusquedaKm} km
                  </h4>
                  <p className="text-xs text-[#6E6A75] leading-relaxed max-w-xs mx-auto">
                    {hayFiltrosActivos
                      ? 'Prueba ampliando la búsqueda o quitando los filtros de seguro y nivel.'
                      : 'Puedes ampliar la búsqueda para ver lo que hay más lejos.'}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {!radioAmpliado && (
                    <button
                      type="button"
                      onClick={() => setRadioAmpliado(true)}
                      className="px-4 py-2 bg-[#4A2270] hover:bg-[#381559] text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Buscar hasta {RADIO_AMPLIADO_KM} km</span>
                    </button>
                  )}
                  {hayFiltrosActivos && (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="px-4 py-2 bg-white hover:bg-[#FAF8FD] border border-[#E5E1EC] text-[#4A2270] text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Quitar filtros</span>
                    </button>
                  )}
                </div>
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
                  {opcionesOrdenadas.length} a menos de {radioBusquedaKm} km de{' '}
                  {userLocation.isBrowserLocation ? 'ti' : etiquetaOrigen}
                </span>
                <p className="text-[11px] text-[#6E6A75]">
                  {mobileSheetPos === 'collapsed'
                    ? 'Toca para ver lista'
                    : 'Ordenados por distancia'}
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
              {opcionesOrdenadas.length > 0 ? (
                establecimientosEnLista.map((item) => (
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
                    No hay establecimientos a menos de {radioBusquedaKm} km.
                  </p>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {!radioAmpliado && (
                      <button
                        type="button"
                        onClick={() => setRadioAmpliado(true)}
                        className="px-3.5 py-1.5 bg-[#4A2270] text-white text-xs font-bold rounded-xl"
                      >
                        Buscar hasta {RADIO_AMPLIADO_KM} km
                      </button>
                    )}
                    {hayFiltrosActivos && (
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="px-3.5 py-1.5 bg-white border border-[#E5E1EC] text-[#4A2270] text-xs font-bold rounded-xl"
                      >
                        Quitar filtros
                      </button>
                    )}
                  </div>
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

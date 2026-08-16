import React, { useEffect } from 'react';
import { Establecimiento } from '../../types';
import { formatDistancia } from '../../utils/distancia';
import { derivacionRecomendada } from '../../dominio/derivacion';
import { 
  X, 
  MapPin, 
  ExternalLink, 
  Clock, 
  Phone, 
  CheckCircle2, 
  FileText, 
  CalendarCheck, 
  Info, 
  Bookmark, 
  Check, 
  ShieldAlert, 
  Stethoscope, 
  Sparkles,
  HeartHandshake
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FichaServicioPanelProps {
  item: Establecimiento | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectAsPrimary: (item: Establecimiento) => void;
  isPrimary?: boolean;
}

export const FichaServicioPanel: React.FC<FichaServicioPanelProps> = ({
  item,
  isOpen,
  onClose,
  onSelectAsPrimary,
  isPrimary = false,
}) => {
  // Prevent body scroll when panel is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!item) return null;

  const distanceLabel = item.distanciaKm !== undefined ? formatDistancia(item.distanciaKm) : '';
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`;
  const derivacion = derivacionRecomendada(item);

  // Institutional coverage explanation
  const getSeguroText = () => {
    switch (item.institucion) {
      case 'MINSA':
      case 'GOBIERNO REGIONAL':
        return 'Atiende principalmente a personas afiliadas al SIS (Seguro Integral de Salud). También ofrece atención particular con tarifas sociales del Ministerio de Salud.';
      case 'ESSALUD':
        return 'Atiende a asegurados y derechohabientes de EsSalud adscritos a este centro o derivados mediante referencia.';
      case 'PRIVADO':
        return 'Atención particular y mediante convenios con Empresas Prestadoras de Salud (EPS) o pólizas de seguros privados de salud.';
      default:
        return `Atención regular bajo la red de ${item.institucion} y convenios autorizados.`;
    }
  };

  // Requirements according to coverage
  const getRequisitos = () => {
    // El resultado del tamizaje encabeza la lista en todos los casos: es lo que
    // la familia trae y lo que le da al profesional el motivo de consulta ya
    // documentado, en vez de tener que explicarlo de memoria en ventanilla.
    const resultadoTamizaje =
      'El resultado de tu tamizaje (puedes descargarlo en PDF desde Mi ruta).';

    if (item.cobertura === 'SIS' || item.institucion === 'MINSA') {
      return [
        resultadoTamizaje,
        'DNI vigente del menor (o comprobante de trámite) y DNI del padre, madre o apoderado.',
        'Carné de Control de Crecimiento y Desarrollo (CRED) y carné de vacunas físico.',
        'Hoja de Referencia (FUA) en caso de acudir por derivación médica.',
      ];
    }
    if (item.cobertura === 'EsSalud' || item.institucion === 'ESSALUD') {
      return [
        resultadoTamizaje,
        'DNI del menor y DNI del titular del seguro.',
        'Acreditación de seguro vigente (puedes verificarla en la web de EsSalud).',
        'Orden de interconsulta o referencia si vas a una especialidad.',
      ];
    }
    // Privado
    return [
      resultadoTamizaje,
      'DNI del menor y DNI del padre/madre.',
      'Tarjeta o carné de afiliación a tu seguro médico privado / EPS o póliza de salud.',
      'Documento de identidad del titular y medio de pago para deducible/copago.',
    ];
  };

  // Steps to request care
  const getPasosAtencion = () => {
    if (item.institucion === 'MINSA' || item.cobertura === 'SIS') {
      if (item.categoria.startsWith('I-')) {
        return [
          {
            num: 1,
            title: 'Solicitud de turno presencial o telefónica',
            desc: 'Acude temprano por ventanilla de admisión o llama para solicitar cita en CRED / Pediatría / Medicina General.',
          },
          {
            num: 2,
            title: 'Triaje y Consulta de Evaluación',
            desc: 'El personal pesará y medirá a tu hijo/a. Durante la consulta, explica las señales observadas en su desarrollo.',
          },
          {
            num: 3,
            title: 'Emisión de Hoja de Referencia',
            desc: 'Si se amerita, el médico emitirá la hoja REFCON hacia el Centro de Salud Mental Comunitario (CSMC) u hospital correspondiente.',
          },
        ];
      }
      return [
        {
          num: 1,
          title: 'Presentación de Hoja de Referencia',
          desc: 'Acude al área de Admisión / Referencias del hospital con tu formato de referencia aprobado por tu centro de origen.',
        },
        {
          num: 2,
          title: 'Programación de Especialidad',
          desc: 'Se asignará turno para Neuropediatría, Psiquiatría Infantil o Medicina de Rehabilitación según disponibilidad.',
        },
      ];
    }

    if (item.institucion === 'ESSALUD') {
      return [
        {
          num: 1,
          title: 'Reserva de Cita por EsSalud en Línea',
          desc: 'Llama al (01) 411-8000 o ingresa a la app EsSalud Mi Consulta para pedir cita en Pediatría o Medicina.',
        },
        {
          num: 2,
          title: 'Evaluación y Orden de Interconsulta',
          desc: 'En la consulta inicial se emitirá la solicitud de derivación a Neuropediatría o Psicopedagogía.',
        },
      ];
    }

    // Privado
    return [
      {
        num: 1,
        title: 'Reserva de Cita Médica',
        desc: 'Llama a la central telefónica de la clínica o reserva por su portal web con el servicio de Pediatría del Desarrollo o Neurología Pediátrica.',
      },
      {
        num: 2,
        title: 'Verificación de Cobertura y Atención',
        desc: 'Al llegar a admisión, presenta tu carné de seguro EPS para validar el copago correspondiente.',
      },
    ];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity cursor-pointer"
          />

          {/* Sliding Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full max-w-[560px] bg-white h-full shadow-2xl z-10 flex flex-col overflow-y-auto"
          >
            {/* Header Sticky Bar */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-[#E5E1EC] px-6 py-4 flex items-center justify-between z-20">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-[#E9DFF5] text-[11px] font-bold text-[#4A2270]">
                  Ficha de establecimiento
                </span>
                <span className="text-xs text-[#6E6A75]">IPRESS: {item.codigo}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FAF8FD] border border-[#E5E1EC] text-[10.5px] font-medium text-[#8A8594]">
                  Información de demostración
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-[#F7F5FA] hover:bg-[#E5E1EC] flex items-center justify-center text-[#2E2A33] transition-colors cursor-pointer"
                aria-label="Cerrar panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Panel Body Content in EXACT 10-point requested sequence */}
            <div className="p-6 sm:p-8 space-y-7 flex-1">
              
              {/* 1. Nombre y debajo "categoría · clasificación" */}
              <div>
                <h2 className="text-2xl sm:text-[26px] font-fraunces font-bold text-[#2E2A33] leading-snug">
                  {item.nombre}
                </h2>
                <p className="text-[14px] text-[#6E6A75] mt-1 font-medium">
                  Categoría {item.categoria} · {item.clasificacion} ({item.institucion})
                </p>
              </div>

              {/* 2. Chip de distancia y chip de cobertura */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {distanceLabel && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8FD] border border-[#D5C6EB] text-[13px] font-bold text-[#4A2270]">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{distanceLabel} de distancia</span>
                  </span>
                )}

                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E6F2EC] border border-[#C3E5D4] text-[13px] font-bold text-[#2E7D5B]">
                  <HeartHandshake className="w-3.5 h-3.5" />
                  <span>Cobertura {item.cobertura}</span>
                </span>

                {isPrimary && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#4A2270] text-white text-[12.5px] font-bold">
                    <Check className="w-3.5 h-3.5" />
                    <span>Lugar sugerido</span>
                  </span>
                )}
              </div>

              {/* 1. CONTACTO Y CITA — va primero a propósito.
                  Quien abre esta ficha ya decidió que le interesa el sitio; lo
                  siguiente que necesita es cómo llegar a una cita, no la lista
                  de servicios. */}
              <div className="bg-white border-2 border-[#D5CCE0] rounded-2xl p-5 space-y-4">
                <h3 className="text-[16px] font-bold text-[#2E2A33] flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#4A2270]" />
                  <span>Contacto y por dónde entrar</span>
                </h3>

                {/* Por qué servicio entrar: pediatría si la hay, CRED si no. */}
                <div className="bg-[#F4EFFB] border border-[#D5CCE0] rounded-xl p-4 space-y-1.5">
                  <p className="text-[13px] font-bold text-[#4A2270]">
                    {derivacion.etiqueta}
                  </p>
                  <p className="text-[12.5px] text-[#2E2A33] leading-relaxed">
                    {derivacion.instruccion}
                  </p>
                </div>

                {/* Teléfono y horario vienen escritos a mano en el registro y
                    no siempre están, o llegan cortados. Cuando falta el dato se
                    dice que falta: un teléfono a medias hace perder la llamada,
                    y un horario inventado, el viaje. */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {item.telefono ? (
                    <a
                      href={`tel:${item.telefono.replace(/[^\d+]/g, '')}`}
                      className="p-4 rounded-xl bg-[#FAF8FD] border border-[#E5E1EC] hover:border-[#4A2270] transition-all space-y-1.5 block"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#4A2270]">
                        <Phone className="w-3.5 h-3.5" />
                        <span>Llamar</span>
                      </div>
                      <span className="text-[13.5px] font-bold text-[#4A2270] block truncate">
                        {item.telefono}
                      </span>
                    </a>
                  ) : (
                    <div className="p-4 rounded-xl bg-[#F7F5FA] border border-[#E5E1EC] space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8A8594]">
                        <Phone className="w-3.5 h-3.5" />
                        <span>Llamar</span>
                      </div>
                      <span className="text-[12.5px] text-[#6E6A75] block leading-snug">
                        El registro público no trae teléfono de este establecimiento.
                      </span>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-[#FAF8FD] border border-[#E5E1EC] space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#4A2270]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Atención presencial</span>
                    </div>
                    {item.horario ? (
                      <p className="text-[13.5px] font-semibold text-[#2E2A33] leading-snug">
                        {item.horario}
                      </p>
                    ) : (
                      <p className="text-[12.5px] text-[#6E6A75] leading-snug">
                        Horario no registrado. Confírmalo antes de ir.
                      </p>
                    )}
                  </div>
                </div>

                {/* No inventamos un enlace de cita en línea ni un correo: el
                    registro público no los incluye. Decimos dónde preguntarlo. */}
                <p className="text-[11.5px] text-[#8A8594] italic leading-relaxed border-t border-[#F0EDF5] pt-3">
                  El registro público no incluye correo ni enlace de cita en línea. Si
                  prefieres agendar sin ir, pregunta por ese canal al llamar: varios
                  establecimientos de {item.institucion} lo tienen habilitado.
                </p>
              </div>

              {/* 3. "¿Dónde queda?" — dirección, distrito, y botón secundario "Abrir en Google Maps" */}
              <div className="bg-[#FAF8FD] border border-[#E5E1EC] rounded-2xl p-5 space-y-3">
                <h3 className="text-[15px] font-bold text-[#2E2A33] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#4A2270]" />
                  <span>¿Dónde queda?</span>
                </h3>
                <p className="text-[14px] text-[#2E2A33] leading-relaxed">
                  {item.direccion}
                </p>
                <p className="text-[13px] text-[#6E6A75]">
                  Distrito de <strong className="text-[#2E2A33]">{item.distrito}</strong> · Ubigeo: {item.ubigeo}
                </p>
                <div className="pt-1">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E5E1EC] hover:border-[#4A2270] hover:bg-[#F0EBF8] text-[13.5px] font-bold text-[#4A2270] transition-all shadow-xs cursor-pointer"
                  >
                    <span>Abrir en Google Maps</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* 4. "¿Qué ofrece?" — lista de servicios con iconos */}
              <div className="space-y-3">
                <h3 className="text-[16px] font-bold text-[#2E2A33] flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-[#4A2270]" />
                  <span>¿Qué ofrece?</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {item.servicios.map((serv, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-xl bg-white border border-[#E5E1EC] flex items-start gap-2.5"
                    >
                      <div className="w-6 h-6 rounded-lg bg-[#E9DFF5] flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#4A2270]" />
                      </div>
                      <span className="text-[13px] font-medium text-[#2E2A33] leading-snug">
                        {serv}
                      </span>
                    </div>
                  ))}
                </div>

                {/* RENIPRESS registra la categoría, no la cartera de servicios.
                    Lo que se lista arriba es lo que a esa categoría le toca
                    ofrecer según la norma, no lo que se comprobó aquí. Decirlo
                    evita que una familia viaje contando con algo que quizá no
                    esté ese día. */}
                {item.serviciosInferidos && (
                  <p className="text-[11.5px] text-[#8A8594] italic leading-relaxed">
                    Estimado a partir de su categoría ({item.categoria}): es lo que un
                    establecimiento de este nivel debe ofrecer. No está verificado uno por
                    uno, así que confirma al llamar que atienden lo que buscas.
                  </p>
                )}
              </div>

              {/* 5. "¿Qué seguro atiende?" con nota literal en gris pequeño */}
              <div className="bg-white border border-[#E5E1EC] rounded-2xl p-5 space-y-2.5">
                <h3 className="text-[15px] font-bold text-[#2E2A33]">
                  ¿Qué seguro atiende?
                </h3>
                <p className="text-[13.5px] text-[#2E2A33] leading-relaxed">
                  {getSeguroText()}
                </p>
                <p className="text-[11.5px] text-[#8A8594] italic pt-1 leading-relaxed border-t border-[#F0EDF5]">
                  Deducido del tipo de institución. El registro público no incluye un campo de seguros; confirma al llamar.
                </p>
              </div>

              {/* El horario y el teléfono subieron al bloque de contacto. */}

              {/* 7. "¿Qué necesitas llevar?" — lista de requisitos */}
              <div className="space-y-3">
                <h3 className="text-[16px] font-bold text-[#2E2A33] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#4A2270]" />
                  <span>¿Qué necesitas llevar?</span>
                </h3>
                <div className="bg-[#FAF8FD] border border-[#E5E1EC] rounded-2xl p-4 space-y-2.5">
                  {getRequisitos().map((req, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-[13px] text-[#2E2A33]">
                      <div className="w-4 h-4 rounded-full bg-[#E9DFF5] text-[#4A2270] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        •
                      </div>
                      <span className="leading-relaxed">{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 8. "¿Cómo solicitar atención?" — pasos numerados */}
              <div className="space-y-3">
                <h3 className="text-[16px] font-bold text-[#2E2A33] flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-[#4A2270]" />
                  <span>¿Cómo solicitar atención?</span>
                </h3>
                <div className="space-y-3">
                  {getPasosAtencion().map((paso) => (
                    <div
                      key={paso.num}
                      className="p-4 rounded-xl bg-white border border-[#E5E1EC] flex items-start gap-3.5"
                    >
                      <div className="w-7 h-7 rounded-full bg-[#4A2270] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {paso.num}
                      </div>
                      <div>
                        <h4 className="text-[13.5px] font-bold text-[#2E2A33]">
                          {paso.title}
                        </h4>
                        <p className="text-[12.5px] text-[#6E6A75] mt-0.5 leading-relaxed">
                          {paso.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 9. Caja gris obligatoria de fuente */}
              <div className="p-4 rounded-xl bg-[#FAF8FD] border border-[#E5E1EC] flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#6E6A75] shrink-0 mt-0.5" />
                <p className="text-[12px] text-[#6E6A75] leading-relaxed">
                  Fuente: RENIPRESS – SUSALUD · Verificado el {item.fechaVerificacion}. No confirmamos disponibilidad de citas en tiempo real.
                </p>
              </div>

            </div>

            {/* 10. Footer con Botón primario "Marcar como mi establecimiento" */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-[#E5E1EC] p-4 sm:p-6 z-20">
              <button
                type="button"
                onClick={() => {
                  onSelectAsPrimary(item);
                  onClose();
                }}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-[15px] transition-all duration-200 flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                  isPrimary
                    ? 'bg-[#E6F2EC] text-[#2E7D5B] border border-[#C3E5D4]'
                    : 'bg-[#4A2270] hover:bg-[#381559] text-white hover:shadow-md active:scale-[0.99]'
                }`}
              >
                {isPrimary ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Es el lugar sugerido en tu ruta</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>Elegir este lugar para mi ruta</span>
                  </>
                )}
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

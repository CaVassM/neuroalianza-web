import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowLeft, ArrowRight, Check, Lock } from 'lucide-react';
import {
  FLUJOS,
  ORDEN_SERVICIOS,
  serviciosDisponibles,
  type OpcionIndicacion,
  type OpcionSentimiento,
  type ServicioCita,
} from '../../data/flujoCita';

export interface ResultadoCita {
  servicio: ServicioCita;
  sentimiento: OpcionSentimiento;
  indicacion: OpcionIndicacion;
  /** Precisión elegida cuando la indicación tenía sub-opciones. */
  subopcion?: OpcionIndicacion;
}

interface Props {
  abierto: boolean;
  /** Servicios ya habilitados por derivaciones previas. */
  derivaciones?: ServicioCita[];
  childName: string;
  onCerrar: () => void;
  onConfirmar: (resultado: ResultadoCita) => void;
}

type Paso = 'servicio' | 'sentimiento' | 'indicacion' | 'subopcion' | 'cierre';

/**
 * Botón de una opción o sub-opción.
 *
 * Las inactivas se muestran deshabilitadas en vez de ocultarse: que la familia
 * vea que su caso está contemplado, aunque ese flujo todavía no exista, evita
 * la sensación de que la aplicación no la tuvo en cuenta.
 */
const BotonOpcion: React.FC<{
  opcion: OpcionIndicacion;
  onClick: () => void;
}> = ({ opcion, onClick }) => {
  if (opcion.inactiva) {
    return (
      <div className="w-full p-4 rounded-xl border border-[#F0EDF5] bg-[#FAFAFB] flex items-center justify-between gap-3 cursor-not-allowed">
        <span className="text-[14px] font-medium text-[#A9A4B0]">{opcion.etiqueta}</span>
        <span className="flex items-center gap-1 text-[10.5px] font-bold text-[#8A8594] bg-[#F0EDF5] px-2 py-1 rounded shrink-0">
          <Lock className="w-3 h-3" />
          Próximamente
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
        opcion.destacada
          ? 'border-[#4A2270] bg-[#FAF8FD] hover:bg-[#F4EFFB]'
          : 'border-[#E5E1EC] hover:border-[#4A2270] hover:bg-[#FAF8FD]'
      }`}
    >
      <span className="text-[14px] font-medium text-[#2E2A33]">{opcion.etiqueta}</span>
      {opcion.destacada && (
        <span className="text-[10.5px] font-bold text-[#4A2270] bg-[#E9DFF5] px-2 py-1 rounded shrink-0 whitespace-nowrap">
          Continúa tu ruta
        </span>
      )}
    </button>
  );
};

/**
 * Qué pasó en la cita: servicio → cómo te sentiste → qué te dijeron.
 *
 * Se pregunta primero cómo se sintió la familia y después el dato clínico, no
 * al revés. Quien vuelve de una consulta difícil necesita que primero le
 * respondan a eso.
 */
export const RegistroCitaModal: React.FC<Props> = ({
  abierto,
  derivaciones = [],
  childName,
  onCerrar,
  onConfirmar,
}) => {
  const [paso, setPaso] = useState<Paso>('servicio');
  const [servicio, setServicio] = useState<ServicioCita | null>(null);
  const [sentimiento, setSentimiento] = useState<OpcionSentimiento | null>(null);
  const [indicacion, setIndicacion] = useState<OpcionIndicacion | null>(null);
  const [subopcion, setSubopcion] = useState<OpcionIndicacion | null>(null);

  const disponibles = serviciosDisponibles(derivaciones);
  const flujo = servicio ? FLUJOS[servicio] : null;

  // Lo que decide el resultado es la sub-opción cuando existe: es la respuesta
  // más precisa que dio la familia.
  const eleccionFinal = subopcion || indicacion;

  const reiniciar = () => {
    setPaso('servicio');
    setServicio(null);
    setSentimiento(null);
    setIndicacion(null);
    setSubopcion(null);
  };

  const cerrar = () => {
    onCerrar();
    // Se limpia después de la animación de salida.
    setTimeout(reiniciar, 250);
  };

  const confirmar = () => {
    if (!servicio || !sentimiento || !indicacion) return;
    onConfirmar({ servicio, sentimiento, indicacion, subopcion: subopcion || undefined });
    cerrar();
  };

  const elegirIndicacion = (opcion: OpcionIndicacion) => {
    setIndicacion(opcion);
    setSubopcion(null);
    // Con sub-opciones la respuesta aún no está completa: falta precisar.
    setPaso(opcion.subopciones?.length ? 'subopcion' : 'cierre');
  };

  const titulos: Record<Paso, string> = {
    servicio: '¿A qué servicio fuiste?',
    sentimiento: '¿Cómo te sentiste después de tu atención?',
    indicacion: '¿Qué te dijeron?',
    subopcion: indicacion?.etiqueta ?? '¿Puedes precisar?',
    cierre: 'Registrado',
  };

  const indice = ['servicio', 'sentimiento', 'indicacion', 'subopcion'].indexOf(paso);
  const totalPasos = indicacion?.subopciones?.length ? 4 : 3;

  return (
    <AnimatePresence>
      {abierto && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-[520px] max-h-[92dvh] overflow-y-auto shadow-2xl border border-[#E5E1EC]"
          >
            {/* Cabecera */}
            <div className="sticky top-0 bg-white border-b border-[#F0EDF5] px-6 py-4 flex items-start justify-between gap-4 z-10">
              <div className="min-w-0">
                {paso !== 'cierre' && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {Array.from({ length: totalPasos }).map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 rounded-full transition-all ${
                          i <= indice ? 'w-6 bg-[#4A2270]' : 'w-3 bg-[#E5E1EC]'
                        }`}
                      />
                    ))}
                  </div>
                )}
                <h3 className="text-[19px] font-fraunces font-bold text-[#2E2A33] leading-tight">
                  {titulos[paso]}
                </h3>
                {flujo && paso !== 'servicio' && paso !== 'cierre' && (
                  <p className="text-[12.5px] text-[#6E6A75] mt-0.5">{flujo.nombre}</p>
                )}
              </div>
              <button
                type="button"
                onClick={cerrar}
                className="p-1.5 rounded-lg text-[#6E6A75] hover:bg-[#F7F5FA] transition-colors cursor-pointer shrink-0"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-3">
              {/* Paso 1 — servicio */}
              {paso === 'servicio' && (
                <>
                  <p className="text-[13.5px] text-[#6E6A75] leading-relaxed mb-2">
                    Cuéntanos dónde atendieron a {childName} para poder orientarte mejor.
                  </p>
                  {ORDEN_SERVICIOS.map((id) => {
                    const activo = disponibles.includes(id);
                    const f = FLUJOS[id];
                    return (
                      <button
                        key={id}
                        type="button"
                        disabled={!activo}
                        onClick={() => {
                          setServicio(id);
                          setPaso('sentimiento');
                        }}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          activo
                            ? 'border-[#E5E1EC] hover:border-[#4A2270] hover:bg-[#FAF8FD] cursor-pointer'
                            : 'border-[#F0EDF5] bg-[#FAFAFB] cursor-not-allowed'
                        }`}
                      >
                        <div className="min-w-0">
                          <p
                            className={`text-[14.5px] font-bold ${
                              activo ? 'text-[#2E2A33]' : 'text-[#A9A4B0]'
                            }`}
                          >
                            {f.nombre}
                          </p>
                          <p
                            className={`text-[12.5px] mt-0.5 ${
                              activo ? 'text-[#6E6A75]' : 'text-[#BDB8C4]'
                            }`}
                          >
                            {f.descripcion}
                          </p>
                        </div>
                        {activo ? (
                          <ArrowRight className="w-4 h-4 text-[#4A2270] shrink-0" />
                        ) : (
                          <span className="flex items-center gap-1 text-[10.5px] font-bold text-[#8A8594] bg-[#F0EDF5] px-2 py-1 rounded shrink-0">
                            <Lock className="w-3 h-3" />
                            Próximamente
                          </span>
                        )}
                      </button>
                    );
                  })}
                </>
              )}

              {/* Paso 2 — sentimiento */}
              {paso === 'sentimiento' && flujo && (
                <>
                  {flujo.sentimientos.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSentimiento(s);
                        setPaso('indicacion');
                      }}
                      className="w-full text-left p-4 rounded-xl border border-[#E5E1EC] hover:border-[#4A2270] hover:bg-[#FAF8FD] transition-all flex items-center gap-3.5 cursor-pointer"
                    >
                      <span className="text-2xl leading-none shrink-0">{s.emoji}</span>
                      <span className="text-[14.5px] font-bold text-[#2E2A33]">
                        {s.etiqueta}
                      </span>
                    </button>
                  ))}
                </>
              )}

              {/* Paso 3 — indicación. La respuesta emocional se muestra aquí,
                  antes de pedir el dato clínico. */}
              {paso === 'indicacion' && flujo && sentimiento && (
                <>
                  <div className="bg-[#F4EFFB] border border-[#D5CCE0] rounded-2xl p-4 mb-4">
                    <p className="text-[13.5px] text-[#2E2A33] leading-relaxed">
                      {sentimiento.respuesta}
                    </p>
                  </div>
                  {flujo.indicaciones.map((ind) => (
                    <BotonOpcion
                      key={ind.id}
                      opcion={ind}
                      onClick={() => elegirIndicacion(ind)}
                    />
                  ))}
                </>
              )}

              {/* Paso 4 — precisar la derivación */}
              {paso === 'subopcion' && indicacion?.subopciones && (
                <>
                  <p className="text-[13.5px] text-[#6E6A75] leading-relaxed mb-2">
                    ¿Puedes precisar un poco más?
                  </p>
                  {indicacion.subopciones.map((sub) => (
                    <BotonOpcion
                      key={sub.id}
                      opcion={sub}
                      onClick={() => {
                        setSubopcion(sub);
                        setPaso('cierre');
                      }}
                    />
                  ))}
                </>
              )}

              {/* Cierre */}
              {paso === 'cierre' && indicacion && eleccionFinal && (
                <div className="text-center space-y-4 py-2">
                  <div className="w-14 h-14 rounded-2xl bg-[#E6F2EC] text-[#2E7D5B] flex items-center justify-center mx-auto">
                    <Check className="w-7 h-7 stroke-[3]" />
                  </div>
                  <p className="text-[14px] text-[#2E2A33] font-semibold">
                    {indicacion.etiqueta}
                    {subopcion && (
                      <span className="block text-[13px] font-normal text-[#6E6A75] mt-0.5">
                        {subopcion.etiqueta}
                      </span>
                    )}
                  </p>
                  {eleccionFinal.siguientePaso && (
                    <div className="bg-[#FAF8FD] border border-[#E5E1EC] rounded-2xl p-4 text-left">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#4A2270] mb-1.5">
                        Tu siguiente paso
                      </p>
                      <p className="text-[13.5px] text-[#2E2A33] leading-relaxed">
                        {eleccionFinal.siguientePaso}
                      </p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={confirmar}
                    className="w-full py-3.5 bg-[#4A2270] hover:bg-[#381559] text-white text-[15px] font-bold rounded-xl transition-all cursor-pointer active:scale-[0.98]"
                  >
                    Guardar en mi ruta
                  </button>
                </div>
              )}
            </div>

            {/* Volver */}
            {paso !== 'servicio' && paso !== 'cierre' && (
              <div className="px-6 pb-5">
                <button
                  type="button"
                  onClick={() =>
                    setPaso(
                      paso === 'subopcion'
                        ? 'indicacion'
                        : paso === 'indicacion'
                        ? 'sentimiento'
                        : 'servicio'
                    )
                  }
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#6E6A75] hover:text-[#4A2270] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Atrás</span>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

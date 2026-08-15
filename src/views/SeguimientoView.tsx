import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Heart,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Smile,
  Meh,
  Frown,
  ArrowRight,
} from 'lucide-react';
import { Logo } from '../components/Logo';
import {
  responderSeguimiento,
  verSeguimiento,
  type EstadoRespuesta,
  type Seguimiento,
} from '../api/cliente';

interface SeguimientoViewProps {
  /** Código que viaja en la URL. Es la credencial: quien lo tiene, entra. */
  id: string;
  onIrAlInicio: () => void;
}

const FASES: Record<number, { titulo: string; texto: string }> = {
  1: { titulo: 'Registro', texto: 'Acabas de empezar tu ruta.' },
  2: { titulo: 'Orientación inicial', texto: 'Toca aplicar el tamizaje.' },
  3: { titulo: 'Primera atención', texto: 'Te toca acudir a tu centro de salud.' },
  4: { titulo: 'Evaluación especializada', texto: 'Estás en proceso de evaluación.' },
  5: { titulo: 'Diagnóstico', texto: 'Ya cuentas con un diagnóstico registrado.' },
  6: { titulo: 'Terapias', texto: 'Ya iniciaste las terapias de apoyo.' },
};

const OPCIONES: {
  estado: EstadoRespuesta;
  etiqueta: string;
  detalle: string;
  Icono: typeof Smile;
  clases: string;
}[] = [
  {
    estado: 'bien',
    etiqueta: 'Bien',
    detalle: 'Pude avanzar',
    Icono: Smile,
    clases: 'border-[#A8D5BE] bg-[#E6F2EC] text-[#2E7D5B]',
  },
  {
    estado: 'regular',
    etiqueta: 'Más o menos',
    detalle: 'Avancé a medias',
    Icono: Meh,
    clases: 'border-[#FBE0B8] bg-[#FDF1DF] text-[#C77700]',
  },
  {
    estado: 'mal',
    etiqueta: 'No pude',
    detalle: 'Se complicó',
    Icono: Frown,
    clases: 'border-[#D5CCE0] bg-[#F4EFFB] text-[#4A2270]',
  },
];

export const SeguimientoView: React.FC<SeguimientoViewProps> = ({ id, onIrAlInicio }) => {
  const [caso, setCaso] = useState<Seguimiento | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [seleccion, setSeleccion] = useState<EstadoRespuesta | null>(null);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensajeCierre, setMensajeCierre] = useState('');

  useEffect(() => {
    let vigente = true;
    verSeguimiento(id)
      .then((datos) => {
        if (vigente) setCaso(datos);
      })
      .catch(() => {
        if (vigente) setError('No pudimos abrir este enlace de seguimiento.');
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [id]);

  const enviar = async () => {
    if (!seleccion || enviando) return;
    setEnviando(true);
    try {
      const actualizado = await responderSeguimiento(id, seleccion, comentario.trim() || undefined);
      setCaso(actualizado);
      setMensajeCierre(actualizado.mensaje);
    } catch {
      setError('No pudimos guardar tu respuesta. Inténtalo de nuevo en un momento.');
    } finally {
      setEnviando(false);
    }
  };

  const nombre = caso?.nombre_nino || 'tu hijo/a';
  const fase = caso ? FASES[caso.fase] ?? FASES[1] : null;

  return (
    <div className="flex-1 bg-[#F7F5FA] flex flex-col items-center pt-8 pb-12 px-4 sm:px-6">
      <div className="w-full flex justify-center mb-6">
        <Logo onClick={onIrAlInicio} size="md" />
      </div>

      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-[560px] bg-white rounded-2xl border border-[#E5E1EC] p-7 sm:p-9 shadow-sm"
      >
        {cargando ? (
          <div className="py-14 flex flex-col items-center gap-3 text-[#6E6A75]">
            <Loader2 className="w-6 h-6 animate-spin text-[#4A2270]" />
            <p className="text-sm">Abriendo tu seguimiento…</p>
          </div>
        ) : error && !caso ? (
          <div className="py-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FDF1DF] text-[#C77700] flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-fraunces font-bold text-[#2E2A33]">
              Este enlace no funciona
            </h1>
            <p className="text-sm text-[#6E6A75] leading-relaxed max-w-sm mx-auto">
              Puede que esté incompleto. Revisa el mensaje de WhatsApp y ábrelo de nuevo
              desde ahí.
            </p>
            <button
              type="button"
              onClick={onIrAlInicio}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#4A2270] hover:bg-[#381559] text-white text-sm font-bold rounded-xl transition-all cursor-pointer"
            >
              <span>Ir al inicio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : mensajeCierre ? (
          /* Respuesta registrada: acompañamos, no damos tareas. */
          <div className="py-6 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-[#E6F2EC] text-[#2E7D5B] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-fraunces font-bold text-[#2E2A33]">
              Gracias por contarnos
            </h1>
            <p className="text-[15px] text-[#2E2A33] leading-relaxed whitespace-pre-line text-left bg-[#F4EFFB] border border-[#D5CCE0] rounded-2xl p-5">
              {mensajeCierre}
            </p>
            <button
              type="button"
              onClick={onIrAlInicio}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#4A2270] hover:bg-[#381559] text-white text-sm font-bold rounded-xl transition-all cursor-pointer"
            >
              <span>Ver mi ruta completa</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-1.5">
              <Heart className="w-4 h-4 text-[#4A2270]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#6E6A75]">
                Seguimiento
              </span>
            </div>

            <h1 className="text-[26px] sm:text-[30px] font-fraunces font-bold text-[#2E2A33] leading-tight mb-2">
              ¿Cómo les fue?
            </h1>
            <p className="text-sm text-[#6E6A75] leading-relaxed mb-6">
              Cuéntanos cómo avanzó la ruta de <strong className="text-[#2E2A33]">{nombre}</strong>.
              Solo toma un toque.
            </p>

            {fase && (
              <div className="mb-6 bg-[#F4EFFB] border border-[#D5CCE0] rounded-2xl px-4 py-3">
                <p className="text-xs font-bold text-[#4A2270] mb-0.5">
                  Fase {caso!.fase} · {fase.titulo}
                </p>
                <p className="text-[13px] text-[#2E2A33]">{fase.texto}</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2.5 mb-5">
              {OPCIONES.map(({ estado, etiqueta, detalle, Icono, clases }) => {
                const activo = seleccion === estado;
                return (
                  <button
                    key={estado}
                    type="button"
                    onClick={() => setSeleccion(estado)}
                    aria-pressed={activo}
                    className={`flex flex-col items-center gap-1.5 px-2 py-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      activo
                        ? `${clases} scale-[1.03] shadow-sm`
                        : 'border-[#E5E1EC] bg-white text-[#6E6A75] hover:border-[#C5BACD]'
                    }`}
                  >
                    <Icono className="w-7 h-7" />
                    <span className="text-[13px] font-bold leading-none">{etiqueta}</span>
                    <span className="text-[11px] opacity-80 leading-tight text-center">
                      {detalle}
                    </span>
                  </button>
                );
              })}
            </div>

            <label className="block text-[13px] font-semibold text-[#2E2A33] mb-2">
              ¿Quieres contarnos algo más? (opcional)
            </label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Por ejemplo: no había cupos, quedaba muy lejos, nos atendieron bien…"
              className="w-full px-4 py-3 rounded-xl border border-[#E5E1EC] bg-white text-[14px] text-[#2E2A33] placeholder-[#6E6A75]/50 focus:outline-none focus:border-[#4A2270] focus:ring-2 focus:ring-[#4A2270]/20 transition-all resize-none"
            />

            {error && (
              <p className="mt-3 text-[13px] font-semibold text-rose-600 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </p>
            )}

            <button
              type="button"
              onClick={enviar}
              disabled={!seleccion || enviando}
              className={`mt-5 w-full py-3.5 text-[15px] font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                seleccion && !enviando
                  ? 'bg-[#4A2270] hover:bg-[#381559] text-white cursor-pointer hover:shadow-md'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
              }`}
            >
              {enviando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando…</span>
                </>
              ) : (
                <span>Enviar</span>
              )}
            </button>
          </>
        )}
      </motion.div>

      <div className="text-center pt-8">
        <p className="text-[12px] text-[#6E6A75]">
          PAN orienta a familias y no reemplaza una consulta médica.
        </p>
      </div>
    </div>
  );
};

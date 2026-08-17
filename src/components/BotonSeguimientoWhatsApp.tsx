import React, { useState } from 'react';
import { Loader2, Check, Info, Copy, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import {
  crearSeguimiento,
  enviarEnlacePorWhatsApp,
  type ResultadoEnvio,
} from '../api/cliente';

interface Props {
  user: UserProfile;
  onUpdateUser?: (actualizado: UserProfile) => void;
}

/** Isotipo de WhatsApp. lucide-react no trae marcas comerciales. */
const IconoWhatsApp: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 016.988 2.896 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.892c0 2.096.549 4.142 1.595 5.945L0 24l6.335-1.652a12.06 12.06 0 005.71 1.447h.006c6.585 0 11.946-5.335 11.949-11.893a11.82 11.82 0 00-3.48-8.413" />
  </svg>
);

/**
 * Dispara el envío del enlace de seguimiento por WhatsApp.
 *
 * El envío es manual a propósito. Un proceso que escribe solo, cada X minutos,
 * a números que quizá no esperan el mensaje, es el patrón que Meta castiga
 * cerrando la cuenta. Aquí lo pide la familia.
 */
export const BotonSeguimientoWhatsApp: React.FC<Props> = ({ user, onUpdateUser }) => {
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoEnvio | null>(null);
  const [error, setError] = useState('');
  const [copiado, setCopiado] = useState(false);

  const telefono = user.phone;

  const enviar = async () => {
    if (enviando || !telefono) return;
    setEnviando(true);
    setError('');
    setResultado(null);

    try {
      // El caso se crea la primera vez y su id se guarda en el perfil, para
      // que los envíos siguientes reutilicen el mismo enlace.
      let id = user.seguimientoId;
      if (!id) {
        const creado = await crearSeguimiento({
          telefono,
          nombre_nino: user.child?.nickname || null,
          condicion: 'autismo',
          distrito: user.location?.district || null,
          seguro: user.insurance || null,
          fase: user.fase || 1,
          nivel_tamizaje: user.screeningResult?.nivel || null,
        });
        id = creado.id;
        onUpdateUser?.({ ...user, seguimientoId: id });
      }

      setResultado(await enviarEnlacePorWhatsApp(id));
    } catch {
      setError(
        'No pudimos conectar con el servidor, así que todavía no hay enlace que darte. Vuelve a intentarlo en un momento.'
      );
    } finally {
      setEnviando(false);
    }
  };

  const copiarEnlace = async () => {
    if (!resultado?.enlace) return;
    try {
      await navigator.clipboard.writeText(resultado.enlace);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin permiso de portapapeles el enlace sigue visible y seleccionable.
    }
  };

  if (!telefono) {
    return (
      <div className="bg-[#FAF8FD] border border-[#E5E1EC] rounded-2xl p-4 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#6E6A75] shrink-0 mt-0.5" />
        <p className="text-[13px] text-[#6E6A75] leading-relaxed">
          Registra tu celular para recibir el enlace de seguimiento por WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={enviar}
        disabled={enviando}
        className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-[15px] font-bold transition-all shadow-sm ${
          enviando
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-[#25D366] hover:bg-[#1EBE5A] text-white cursor-pointer hover:shadow-md active:scale-[0.98]'
        }`}
      >
        {enviando ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Enviando…</span>
          </>
        ) : (
          <>
            <IconoWhatsApp className="w-5 h-5" />
            <span>Enviar link de seguimiento por WhatsApp</span>
          </>
        )}
      </button>

      {/* El enlace se entrega SIEMPRE en pantalla, salga o no el mensaje.
          Antes solo existía dentro del WhatsApp: si el envío estaba apagado o
          una barrera anti-baneo lo frenaba, la familia se quedaba sin nada
          aunque su caso de seguimiento ya estuviera creado. */}
      <AnimatePresence>
        {resultado && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`rounded-xl border px-4 py-3.5 space-y-3 text-[13px] leading-relaxed ${
              resultado.enviado
                ? 'bg-[#E6F2EC] border-[#A8D5BE] text-[#2E7D5B]'
                : 'bg-[#FDF1DF] border-[#FBE0B8] text-[#9E5D00]'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {resultado.enviado ? (
                <>
                  <Check className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Te enviamos el enlace a tu WhatsApp{' '}
                    <strong className="font-semibold">···{telefono.slice(-4)}</strong>.
                  </span>
                </>
              ) : resultado.simulado ? (
                <>
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    <strong className="font-semibold">
                      El envío por WhatsApp está desactivado en esta demostración.
                    </strong>{' '}
                    Tu seguimiento quedó creado igual: entra por el enlace de aquí abajo.
                  </span>
                </>
              ) : (
                <>
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    {resultado.motivo} Tu seguimiento existe igual: entra por el enlace de
                    aquí abajo.
                  </span>
                </>
              )}
            </div>

            {resultado.enlace && (
              <div className="bg-white/70 border border-black/5 rounded-lg p-3 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E6A75]">
                  Tu enlace de seguimiento
                </span>
                <p className="font-mono text-[11.5px] text-[#2E2A33] break-all leading-relaxed">
                  {resultado.enlace}
                </p>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  <a
                    href={resultado.enlace}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#4A2270] hover:bg-[#381559] text-white text-[12px] font-bold rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir seguimiento</span>
                  </a>
                  <button
                    type="button"
                    onClick={copiarEnlace}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E1EC] text-[#4A2270] text-[12px] font-bold rounded-lg hover:bg-[#FAF8FD] transition-colors cursor-pointer"
                  >
                    {copiado ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-[13px] font-semibold text-rose-600">{error}</p>
      )}

      <p className="text-[11.5px] text-[#8A8594] leading-relaxed">
        Enviamos como máximo un mensaje cada 7 días al mismo número, y solo entre las
        8:00 y las 21:00.
      </p>
    </div>
  );
};

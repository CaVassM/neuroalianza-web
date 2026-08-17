import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipBack, SkipForward, X, FlaskConical, Check } from 'lucide-react';
import { GUION, type PasoDemo } from './guion';

interface Props {
  activo: boolean;
  enPausa: boolean;
  indice: number;
  paso: PasoDemo | null;
  onAlternarPausa: () => void;
  onAnterior: () => void;
  onSiguiente: () => void;
  onSalir: () => void;
}

/**
 * Control flotante del recorrido guiado.
 *
 * Va abajo y estrecho para no tapar la interfaz que está demostrando, y dice
 * en todo momento qué paso se está viendo: sin eso, quien mira no sabe si la
 * pantalla cambió sola o porque alguien la tocó.
 *
 * Las animaciones no son adorno. La barra segmentada dice cuánto queda del
 * recorrido y cuánto del paso actual, así que nadie se pregunta si la pantalla
 * va a cambiar sola; el texto entra desplazado para que se note que cambió de
 * paso y no que se corrigió una palabra; y el punto que late distingue de un
 * vistazo "esto avanza solo" de "esto está detenido esperándote".
 */
export const PanelDemo: React.FC<Props> = ({
  activo,
  enPausa,
  indice,
  paso,
  onAlternarPausa,
  onAnterior,
  onSiguiente,
  onSalir,
}) => {
  const total = GUION.length;
  const esUltimo = indice >= total - 1;
  const esPrimero = indice === 0;

  return (
    <AnimatePresence>
      {activo && paso && (
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.97 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-[660px]"
          role="region"
          aria-label="Recorrido guiado"
        >
          <div className="bg-[#241338] text-white rounded-2xl shadow-[0_18px_50px_-12px_rgba(0,0,0,0.55)] border border-[#4A2270] overflow-hidden backdrop-blur-sm">

            {/* Progreso segmentado: un tramo por paso.
                Los pasados van llenos, el actual se llena con el tiempo que
                dura, y los que faltan quedan apagados. */}
            <div className="flex gap-[3px] px-3 pt-3" aria-hidden="true">
              {GUION.map((p, i) => (
                <div
                  key={p.id}
                  className="h-[3px] flex-1 rounded-full bg-white/15 overflow-hidden"
                >
                  {i < indice && <div className="h-full w-full bg-[#A78BC7]" />}
                  {i === indice && !esUltimo && (
                    <div
                      key={`activo-${indice}`}
                      className="h-full w-full bg-[#C3A6E2] animate-demo-paso"
                      style={{
                        animationDuration: `${paso.duracion}ms`,
                        animationPlayState: enPausa ? 'paused' : 'running',
                      }}
                    />
                  )}
                  {i === indice && esUltimo && <div className="h-full w-full bg-[#C3A6E2]" />}
                </div>
              ))}
            </div>

            <div className="px-4 py-3.5 flex items-start gap-3.5">
              {/* Distintivo del recorrido. El punto verde late mientras avanza
                  solo y se queda quieto y ámbar en pausa. */}
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-xl bg-[#4A2270] flex items-center justify-center">
                  <FlaskConical className="w-4.5 h-4.5 text-[#E9DFF5]" />
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#241338] ${
                    esUltimo
                      ? 'bg-[#A78BC7]'
                      : enPausa
                      ? 'bg-[#E0A653]'
                      : 'bg-[#5FCF9B] animate-demo-latido'
                  }`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#A78BC7] tabular-nums">
                    Paso {indice + 1} de {total}
                  </span>
                  <AnimatePresence mode="wait">
                    {enPausa && !esUltimo && (
                      <motion.span
                        key="pausa"
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.15 }}
                        className="px-1.5 py-px rounded text-[9.5px] font-bold uppercase tracking-wider bg-[#E0A653]/20 text-[#E0A653]"
                      >
                        En pausa
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* El texto entra desde abajo al cambiar de paso: deja claro
                    que es contenido nuevo y no una corrección del anterior. */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={paso.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                  >
                    <p className="text-[14.5px] font-bold leading-tight">{paso.titulo}</p>
                    <p className="text-[12.5px] text-white/70 leading-snug mt-0.5">
                      {paso.detalle}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-0.5 shrink-0">
                <BotonPanel
                  onClick={onAnterior}
                  deshabilitado={esPrimero}
                  titulo="Paso anterior (←)"
                >
                  <SkipBack className="w-4 h-4" />
                </BotonPanel>

                {/* En el último paso ya no hay nada que pausar: el control se
                    convierte en la salida, que es lo único que queda por hacer. */}
                {esUltimo ? (
                  <button
                    type="button"
                    onClick={onSalir}
                    className="ml-1 px-3.5 py-2 rounded-lg bg-[#5FCF9B] hover:bg-[#4FBE8A] text-[#123B29] text-[12.5px] font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    title="Terminar el recorrido (Esc)"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Terminar</span>
                  </button>
                ) : (
                  <>
                    <BotonPanel
                      onClick={onAlternarPausa}
                      titulo={enPausa ? 'Reanudar (espacio)' : 'Pausar (espacio)'}
                      destacado
                    >
                      {enPausa ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    </BotonPanel>
                    <BotonPanel onClick={onSiguiente} titulo="Siguiente paso (→)">
                      <SkipForward className="w-4 h-4" />
                    </BotonPanel>
                    <BotonPanel onClick={onSalir} titulo="Salir del recorrido (Esc)">
                      <X className="w-4 h-4" />
                    </BotonPanel>
                  </>
                )}
              </div>
            </div>

            {/* Atajos. Solo en pantallas con teclado, que es donde sirven. */}
            <div className="hidden sm:flex items-center gap-3 px-4 pb-2.5 -mt-1 text-[10px] text-white/35">
              <Atajo tecla="espacio" que="pausar" />
              <Atajo tecla="← →" que="moverse" />
              <Atajo tecla="esc" que="salir" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const BotonPanel: React.FC<{
  onClick: () => void;
  titulo: string;
  deshabilitado?: boolean;
  destacado?: boolean;
  children: React.ReactNode;
}> = ({ onClick, titulo, deshabilitado, destacado, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={deshabilitado}
    title={titulo}
    aria-label={titulo}
    className={`p-2 rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A78BC7] ${
      deshabilitado
        ? 'opacity-25 cursor-not-allowed'
        : destacado
        ? 'bg-white/10 hover:bg-white/20 active:scale-95 cursor-pointer'
        : 'hover:bg-white/10 active:scale-95 cursor-pointer'
    }`}
  >
    {children}
  </button>
);

const Atajo: React.FC<{ tecla: string; que: string }> = ({ tecla, que }) => (
  <span className="flex items-center gap-1">
    <kbd className="px-1.5 py-px rounded bg-white/10 font-sans text-[9.5px] tracking-wide">
      {tecla}
    </kbd>
    <span>{que}</span>
  </span>
);

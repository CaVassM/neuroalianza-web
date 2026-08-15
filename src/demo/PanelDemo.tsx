import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipBack, SkipForward, X, FlaskConical } from 'lucide-react';
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
}) => (
  <AnimatePresence>
    {activo && paso && (
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-[620px]"
      >
        <div className="bg-[#2E1A47] text-white rounded-2xl shadow-2xl border border-[#4A2270] overflow-hidden">
          {/* Progreso del recorrido completo */}
          <div className="h-1 bg-white/15">
            <motion.div
              className="h-full bg-[#A78BC7]"
              animate={{ width: `${((indice + 1) / GUION.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          <div className="px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#4A2270] flex items-center justify-center shrink-0">
              <FlaskConical className="w-4 h-4 text-[#E9DFF5]" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#A78BC7]">
                Modo demostración · paso {indice + 1} de {GUION.length}
              </p>
              <p className="text-[14px] font-bold leading-tight truncate">{paso.titulo}</p>
              <p className="text-[12px] text-white/70 leading-snug line-clamp-2">
                {paso.detalle}
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={onAnterior}
                disabled={indice === 0}
                className={`p-2 rounded-lg transition-colors ${
                  indice === 0
                    ? 'opacity-30 cursor-not-allowed'
                    : 'hover:bg-white/10 cursor-pointer'
                }`}
                title="Paso anterior (←)"
                aria-label="Paso anterior"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onAlternarPausa}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title={enPausa ? 'Reanudar (espacio)' : 'Pausar (espacio)'}
                aria-label={enPausa ? 'Reanudar' : 'Pausar'}
              >
                {enPausa ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={onSiguiente}
                disabled={indice >= GUION.length - 1}
                className={`p-2 rounded-lg transition-colors ${
                  indice >= GUION.length - 1
                    ? 'opacity-30 cursor-not-allowed'
                    : 'hover:bg-white/10 cursor-pointer'
                }`}
                title="Siguiente paso (→)"
                aria-label="Siguiente paso"
              >
                <SkipForward className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onSalir}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Salir del recorrido (Esc)"
                aria-label="Salir del recorrido"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Info, Pill, X } from 'lucide-react';
import { UserProfile } from '../../types';

interface Props {
  user: UserProfile;
  onUpdateUser?: (actualizado: UserProfile) => void;
}

/** Motivos frecuentes por los que un tratamiento se interrumpe. */
const MOTIVOS: { id: string; etiqueta: string }[] = [
  { id: 'no_conseguimos', etiqueta: 'No lo conseguimos en la farmacia' },
  { id: 'costo', etiqueta: 'No podemos cubrir el costo' },
  { id: 'efectos', etiqueta: 'Le cayó mal o notamos efectos' },
  { id: 'no_entendimos', etiqueta: 'No entendimos bien la indicación' },
  { id: 'medico_suspendio', etiqueta: 'El médico lo suspendió' },
  { id: 'sin_receta', etiqueta: 'No le recetaron medicamentos' },
  { id: 'otro', etiqueta: 'Otro motivo' },
];

/**
 * Seguimiento del tratamiento indicado por el médico.
 *
 * PAN no receta ni sugiere medicación: eso lo define el médico tratante, y así
 * lo dice el asistente cuando le preguntan. Esto es otra cosa —adherencia—: si
 * la familia deja el tratamiento por falta de stock o por costo, esa es una
 * barrera del sistema que la ruta debería registrar, igual que registra que no
 * hubo cupos para una cita.
 *
 * Por eso las opciones preguntan QUÉ LO IMPIDIÓ, no si conviene tomarlo.
 */
export const SeguimientoTratamiento: React.FC<Props> = ({ user, onUpdateUser }) => {
  const seguimiento = user.tratamiento;
  const [motivoAbierto, setMotivoAbierto] = useState(false);
  const [motivoOtro, setMotivoOtro] = useState('');

  const childName = user.child.nickname || 'tu hijo/a';
  const hoy = () => new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });

  const registrar = (tomando: boolean, motivo?: string) => {
    if (!onUpdateUser) return;
    onUpdateUser({
      ...user,
      tratamiento: {
        tomando,
        motivo: tomando ? undefined : motivo,
        actualizadoEn: hoy(),
      },
      registros: [
        ...(user.registros || []),
        {
          fecha: hoy(),
          titulo: tomando
            ? 'Tratamiento en curso'
            : `Tratamiento interrumpido: ${motivo || 'sin motivo indicado'}`,
          detalle: tomando
            ? 'La familia confirmó que sigue el tratamiento indicado.'
            : 'La familia reportó que el tratamiento no se está siguiendo.',
          tipo: 'fase_update' as const,
          origen: 'familia' as const,
          faseNum: 6 as const,
        },
      ],
    });
    setMotivoAbierto(false);
    setMotivoOtro('');
  };

  return (
    <div className="bg-white border border-[#E5E1EC] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#E9DFF5] flex items-center justify-center shrink-0">
          <Pill className="w-4.5 h-4.5 text-[#4A2270]" />
        </div>
        <div className="space-y-1">
          <h3 className="text-[15px] font-bold text-[#2E2A33]">
            Seguimiento del tratamiento
          </h3>
          <p className="text-[13px] text-[#6E6A75] leading-relaxed">
            ¿{childName} está tomando el tratamiento que le indicó su médico?
          </p>
        </div>
      </div>

      {seguimiento && !motivoAbierto ? (
        <div
          className={`rounded-xl px-4 py-3 flex items-start gap-2.5 text-[13px] leading-relaxed ${
            seguimiento.tomando
              ? 'bg-[#E6F2EC] border border-[#A8D5BE] text-[#2E7D5B]'
              : 'bg-[#FDF1DF] border border-[#FBE0B8] text-[#9E5D00]'
          }`}
        >
          {seguimiento.tomando ? (
            <Check className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span className="flex-1">
            {seguimiento.tomando ? (
              <>Registrado: sigue el tratamiento. Actualizado el {seguimiento.actualizadoEn}.</>
            ) : (
              <>
                Registrado: <strong className="font-semibold">{seguimiento.motivo}</strong>.
                Coméntalo en el próximo control; el equipo puede ajustar la indicación o
                buscar alternativas.
              </>
            )}
          </span>
          <button
            type="button"
            onClick={() => {
              // Borra el registro para volver a mostrar las dos opciones. El
              // historial del caso conserva lo que se respondió antes.
              setMotivoAbierto(false);
              onUpdateUser?.({ ...user, tratamiento: undefined });
            }}
            className="text-[11.5px] font-bold underline shrink-0 cursor-pointer"
          >
            Cambiar
          </button>
        </div>
      ) : !motivoAbierto ? (
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={() => registrar(true)}
            className="flex-1 py-3 px-4 rounded-xl border-2 border-[#A8D5BE] bg-[#E6F2EC] text-[#2E7D5B] text-[14px] font-bold transition-all hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Sí, lo está tomando</span>
          </button>
          <button
            type="button"
            onClick={() => setMotivoAbierto(true)}
            className="flex-1 py-3 px-4 rounded-xl border-2 border-[#E5E1EC] bg-white text-[#6E6A75] text-[14px] font-bold transition-all hover:border-[#C5BACD] cursor-pointer flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            <span>No, todavía no</span>
          </button>
        </div>
      ) : null}

      <AnimatePresence>
        {motivoAbierto && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-2.5 pt-1">
              <p className="text-[13px] font-semibold text-[#2E2A33]">
                ¿Qué lo impidió? Saberlo nos ayuda a orientarte mejor.
              </p>
              {MOTIVOS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() =>
                    m.id === 'otro'
                      ? registrar(false, motivoOtro.trim() || 'Otro motivo')
                      : registrar(false, m.etiqueta)
                  }
                  className="w-full text-left px-4 py-2.5 rounded-xl border border-[#E5E1EC] bg-white hover:border-[#4A2270] hover:bg-[#FAF8FD] transition-all text-[13px] text-[#2E2A33] cursor-pointer"
                >
                  {m.etiqueta}
                </button>
              ))}
              <input
                type="text"
                value={motivoOtro}
                onChange={(e) => setMotivoOtro(e.target.value)}
                placeholder="Si marcaste “Otro motivo”, cuéntanos brevemente"
                maxLength={120}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E1EC] text-[13px] text-[#2E2A33] placeholder-[#6E6A75]/50 focus:outline-none focus:border-[#4A2270] focus:ring-2 focus:ring-[#4A2270]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setMotivoAbierto(false)}
                className="text-[12.5px] font-semibold text-[#6E6A75] hover:text-[#4A2270] cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-[11.5px] text-[#8A8594] leading-relaxed border-t border-[#F0EDF5] pt-3">
        PAN no indica ni recomienda medicamentos: eso lo define siempre el médico
        tratante. Aquí solo registramos cómo va lo que ya te indicaron.
      </p>
    </div>
  );
};

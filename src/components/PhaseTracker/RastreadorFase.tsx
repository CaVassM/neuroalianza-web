import React, { useState } from 'react';
import { UserProfile, CasePhase, CaseLogItem } from '../../types';
import { Check, ChevronDown, ChevronUp, Clock, FileText, Sparkles, AlertTriangle, ArrowRight, ShieldCheck, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RegistroCitaModal, type ResultadoCita } from './RegistroCitaModal';
import { FLUJOS } from '../../data/flujoCita';

interface RastreadorFaseProps {
  user: UserProfile;
  onUpdateUser?: (updated: UserProfile) => void;
}

export const RastreadorFase: React.FC<RastreadorFaseProps> = ({ user, onUpdateUser }) => {
  const childName = user.child.nickname || 'tu hijo/a';
  const currentPhase = (user.fase || (user.diagnosis ? 5 : user.screeningResult ? 4 : 3)) as CasePhase;

  const [expandedCompletedPhase, setExpandedCompletedPhase] = useState<number | null>(null);
  const [showConfirmAdvanceModal, setShowConfirmAdvanceModal] = useState(false);
  const [showRegistroCita, setShowRegistroCita] = useState(false);

  // La fase 3 es la de "ya fui a mi cita": ahí no basta confirmar, hay que
  // registrar a qué servicio fue, cómo se sintió y qué le dijeron.
  const esRegistroDeCita = currentPhase === 3;

  const registrarCita = ({ servicio, sentimiento, indicacion }: ResultadoCita) => {
    if (!onUpdateUser) return;

    const fecha = new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
    const flujo = FLUJOS[servicio];

    const registro: CaseLogItem = {
      fecha,
      titulo: `Cita en ${flujo.nombre}: ${indicacion.etiqueta}`,
      detalle: `La familia se sintió ${sentimiento.etiqueta.toLowerCase()}. ${indicacion.siguientePaso}`,
      tipo: 'fase_update',
      origen: 'familia',
      faseNum: (indicacion.avanzaA || currentPhase) as CasePhase,
    };

    // Una derivación habilita ese servicio para el próximo registro de cita.
    const derivaciones = indicacion.derivaA
      ? Array.from(new Set([...(user.derivaciones || []), indicacion.derivaA]))
      : user.derivaciones;

    onUpdateUser({
      ...user,
      fase: Math.max(user.fase || 3, indicacion.avanzaA || currentPhase) as CasePhase,
      derivaciones,
      registros: [...(user.registros || []), registro],
    });
  };

  const phases = [
    {
      number: 1,
      shortName: 'Observación',
      title: 'Observación',
      desc: `Notaste algo en el desarrollo de ${childName}.`,
    },
    {
      number: 2,
      shortName: 'Información',
      title: 'Información',
      desc: 'Buscaste entender qué podía significar.',
    },
    {
      number: 3,
      shortName: 'Buscar atención',
      title: 'Buscar atención',
      desc: 'Identificaste dónde acudir y con quién.',
      advanceBtnText: 'Ya fui a mi cita',
      advanceQuestion: 'fui a mi cita médica / evaluación inicial',
      nextPhase: 4 as CasePhase,
      logTitle: 'Asistencia a cita médica confirmada',
    },
    {
      number: 4,
      shortName: 'Evaluación',
      title: 'Evaluación',
      desc: `Un profesional evaluó a ${childName} y dio su orientación. Anota aquí el diagnóstico: qué profesional lo emitió y en qué mes, para tenerlo a mano en cada cita.`,
      advanceBtnText: 'Ya tengo un diagnóstico',
      advanceQuestion: 'tengo un diagnóstico médico formal',
      nextPhase: 5 as CasePhase,
      logTitle: 'Diagnóstico médico recibido',
    },
    {
      number: 5,
      shortName: 'Entender',
      title: 'Entender la condición',
      desc: 'Toca comprender qué midió el tamizaje que aplicaste, qué significa su resultado y qué NO significa. Entenderlo en familia ayuda a explicarlo a quienes acompañan.',
      advanceBtnText: 'Ya inicié terapias',
      advanceQuestion: 'inicié las terapias de apoyo recomendadas',
      nextPhase: 6 as CasePhase,
      logTitle: 'Inicio de terapias registrado',
    },
    {
      number: 6,
      shortName: 'Seguimiento',
      title: 'Seguimiento',
      desc: 'Sostener terapias, controles y avances.',
    },
  ];

  // Helper to get structured phase records
  const getPhaseRecords = (phaseNum: number): Array<{
    text: string;
    origen?: 'familia' | 'profesional';
    isBarrier?: boolean;
    establecimientoNombre?: string;
  }> => {
    const records: Array<{
      text: string;
      origen?: 'familia' | 'profesional';
      isBarrier?: boolean;
      establecimientoNombre?: string;
    }> = [];

    // Check user.registros for matching items
    if (user.registros && user.registros.length > 0) {
      user.registros.forEach((reg) => {
        if (reg.faseNum === phaseNum || (phaseNum === 3 && reg.tipo === 'establecimiento') || (phaseNum === 4 && reg.tipo === 'diagnostico')) {
          records.push({
            text: `${reg.titulo} — ${reg.fecha}`,
            origen: reg.origen || 'familia',
            isBarrier: reg.tipo === 'barrera',
            establecimientoNombre: reg.establecimientoNombre,
          });
        }
      });
    }

    if (records.length > 0) return records;

    // Fallbacks if no custom registros
    switch (phaseNum) {
      case 1:
        if (user.screeningResult) {
          const dateStr = user.screeningResult.fecha || '10 ago';
          return [{ text: `Completaste el cuestionario de señales tempranas — ${dateStr}`, origen: 'familia' }];
        }
        return [{ text: `Registraste las primeras observaciones de ${childName} — 10 ago`, origen: 'familia' }];
      case 2:
        return [{ text: `Consultaste la guía de desarrollo y señales de alerta — 11 ago`, origen: 'familia' }];
      case 3:
        if (user.selectedEstablecimientoCodigo) {
          return [{ text: `Elegiste tu establecimiento de referencia en ${user.location.district || 'tu distrito'} — 12 ago`, origen: 'familia' }];
        }
        return [{ text: `Elegiste el Centro de Salud Santa Cruz — 12 ago`, origen: 'familia' }];
      case 4:
        if (user.diagnosis) {
          const profLabel =
            user.diagnosis.profesional === 'neurologo'
              ? 'Neuropediatra'
              : user.diagnosis.profesional === 'pediatra'
              ? 'Pediatra'
              : user.diagnosis.profesional === 'psiquiatra_infantil'
              ? 'Psiquiatra infantil'
              : user.diagnosis.profesional === 'psicologo'
              ? 'Psicólogo'
              : user.diagnosis.profesionalOtroTexto || 'Especialista';
          return [
            { text: `Registraste el diagnóstico con ${profLabel} (${user.diagnosis.mes} ${user.diagnosis.ano}) — 14 ago`, origen: 'familia' },
          ];
        }
        return [{ text: 'Evaluación médica y orientación profesional completada — 14 ago', origen: 'familia' }];
      case 5:
        return [{ text: 'Priorizaste las terapias recomendadas y exploraste apoyos normativos — 15 ago', origen: 'familia' }];
      default:
        return [];
    }
  };

  const handleNodeClick = (phaseNum: number) => {
    if (phaseNum < currentPhase && phaseNum !== 6) {
      setExpandedCompletedPhase((prev) => (prev === phaseNum ? null : phaseNum));
    }
  };

  const activePhaseInfo = phases[currentPhase - 1] || phases[0];

  const handleConfirmAdvance = () => {
    if (!activePhaseInfo.nextPhase || !onUpdateUser) return;

    const formattedDate = new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
    const newLogItem: CaseLogItem = {
      fecha: formattedDate,
      titulo: activePhaseInfo.logTitle || 'Avance de fase registrado',
      detalle: `La familia confirmó su avance a la Fase ${activePhaseInfo.nextPhase}.`,
      tipo: 'fase_update',
      origen: 'familia',
      faseNum: activePhaseInfo.nextPhase,
    };

    onUpdateUser({
      ...user,
      fase: Math.max(user.fase || 3, activePhaseInfo.nextPhase) as CasePhase,
      registros: [...(user.registros || []), newLogItem],
    });

    setShowConfirmAdvanceModal(false);
  };

  return (
    <div className="w-full bg-white border border-[#E5E1EC] rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
      
      {/* 1. DESKTOP VIEW: HORIZONTAL TIMELINE */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between w-full relative">
          {phases.map((phase, idx) => {
            const isCompleted = phase.number < currentPhase && phase.number !== 6;
            const isCurrent = phase.number === currentPhase;
            const isPending = phase.number > currentPhase;
            const isLast = idx === phases.length - 1;

            return (
              <React.Fragment key={phase.number}>
                {/* Node with label */}
                <div className="flex flex-col items-center relative z-10">
                  <button
                    type="button"
                    onClick={() => handleNodeClick(phase.number)}
                    disabled={!isCompleted}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                      isCompleted
                        ? 'bg-[#4A2270] text-white cursor-pointer hover:scale-110 active:scale-95 shadow-xs'
                        : isCurrent
                        ? 'bg-[#4A2270] text-white ring-4 ring-[#E9DFF5] animate-pulse cursor-default shadow-xs'
                        : 'bg-[#C9C4D2] text-[#6E6A75] cursor-default'
                    }`}
                    title={
                      isCompleted
                        ? `Fase ${phase.number}: ${phase.shortName} (Clic para ver registros)`
                        : isCurrent
                        ? `Fase ${phase.number}: ${phase.shortName} (Fase actual)`
                        : `Fase ${phase.number}: ${phase.shortName} (Pendiente)`
                    }
                  >
                    {isCompleted ? (
                      <Check className="w-4.5 h-4.5 text-white stroke-[2.5]" />
                    ) : (
                      <span>{phase.number}</span>
                    )}
                  </button>

                  <span
                    className={`text-xs mt-2.5 text-center whitespace-nowrap transition-colors ${
                      isCurrent
                        ? 'font-bold text-[#4A2270]'
                        : isCompleted
                        ? 'text-[#6E6A75] font-medium cursor-pointer hover:text-[#4A2270]'
                        : 'text-[#8E8A95] font-normal'
                    }`}
                    onClick={() => isCompleted && handleNodeClick(phase.number)}
                  >
                    {phase.shortName}
                  </span>
                </div>

                {/* Connecting Line between nodes */}
                {!isLast && (
                  <div className="flex-1 h-[3px] mx-2 -mt-6 transition-colors duration-300">
                    <div
                      className={`h-full w-full rounded-full ${
                        isCompleted ? 'bg-[#4A2270]' : 'bg-[#E5E1EC]'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 2. MOBILE VIEW: VERTICAL TIMELINE */}
      <div className="block md:hidden space-y-4">
        {phases.map((phase, idx) => {
          const isCompleted = phase.number < currentPhase && phase.number !== 6;
          const isCurrent = phase.number === currentPhase;
          const isPending = phase.number > currentPhase;
          const isLast = idx === phases.length - 1;

          return (
            <div key={phase.number} className="flex items-start gap-3 relative">
              {/* Left column: Node and vertical line */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleNodeClick(phase.number)}
                  disabled={!isCompleted}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                    isCompleted
                      ? 'bg-[#4A2270] text-white cursor-pointer shadow-xs'
                      : isCurrent
                      ? 'bg-[#4A2270] text-white ring-4 ring-[#E9DFF5] animate-pulse cursor-default shadow-xs'
                      : 'bg-[#C9C4D2] text-[#6E6A75] cursor-default'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-white stroke-[2.5]" />
                  ) : (
                    <span>{phase.number}</span>
                  )}
                </button>

                {!isLast && (
                  <div
                    className={`w-[2px] h-8 my-1 rounded-full ${
                      isCompleted ? 'bg-[#4A2270]' : 'bg-[#E5E1EC]'
                    }`}
                  />
                )}
              </div>

              {/* Right column: Phase title & short description */}
              <div
                className={`flex-1 pt-0.5 text-left ${
                  isCompleted ? 'cursor-pointer' : ''
                }`}
                onClick={() => isCompleted && handleNodeClick(phase.number)}
              >
                <div className="flex items-center justify-between">
                  <p
                    className={`text-xs ${
                      isCurrent
                        ? 'font-bold text-[#4A2270]'
                        : isCompleted
                        ? 'font-bold text-[#2E2A33]'
                        : 'text-[#8E8A95]'
                    }`}
                  >
                    Fase {phase.number} · {phase.shortName}
                  </p>
                  {isCompleted && (
                    <span className="text-[11px] text-[#6B3FA0] font-semibold flex items-center gap-0.5">
                      Ver detalle
                      {expandedCompletedPhase === phase.number ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </span>
                  )}
                </div>
                <p className="text-[11.5px] text-[#6E6A75] mt-0.5 leading-tight">
                  {phase.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. EXPANDABLE LOGS FOR COMPLETED PHASES */}
      <AnimatePresence>
        {expandedCompletedPhase !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-[#FAF8FD] border border-[#E5E1EC] rounded-xl p-4 text-left space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4A2270] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>
                  Registro de la Fase {expandedCompletedPhase} (
                  {phases[expandedCompletedPhase - 1]?.shortName})
                </span>
              </span>
              <button
                type="button"
                onClick={() => setExpandedCompletedPhase(null)}
                className="text-[11px] font-semibold text-[#6E6A75] hover:text-[#2E2A33] cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            {getPhaseRecords(expandedCompletedPhase).length > 0 ? (
              <ul className="space-y-2 pt-1">
                {getPhaseRecords(expandedCompletedPhase).map((record, rIdx) => (
                  <li
                    key={rIdx}
                    className={`text-xs p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      record.isBarrier
                        ? 'bg-[#FDF1DF] border-[#F6DCB6] text-[#C77700]'
                        : 'bg-white border-[#F0EDF5] text-[#2E2A33]'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {record.isBarrier ? (
                        <AlertTriangle className="w-4 h-4 text-[#C77700] shrink-0 mt-0.5" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-[#2E7D5B] shrink-0 mt-0.5" />
                      )}
                      <span>{record.text}</span>
                    </div>

                    <div className="shrink-0">
                      {record.origen === 'profesional' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E6F2EC] text-[#2E7D5B] font-bold text-[10.5px]">
                          <CheckCircle2 className="w-3 h-3 text-[#2E7D5B]" />
                          Confirmado por profesional {record.establecimientoNombre ? `· ${record.establecimientoNombre}` : ''}
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-[#E5E1EC]/60 text-[#2E2A33] font-semibold text-[10.5px]">
                          Reportado por la familia
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#6E6A75] italic pt-1">Sin registros</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. CURRENT PHASE DETAILS FOOTER & ADVANCE ACTION BUTTON */}
      <div className="pt-4 border-t border-[#F0EDF5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="space-y-1">
          <span className="text-[10.5px] sm:text-[11px] font-bold tracking-widest text-[#6E6A75] uppercase block">
            FASE ACTUAL
          </span>
          <h3 className="text-lg sm:text-xl font-fraunces font-bold text-[#2E2A33]">
            Fase {currentPhase} · {activePhaseInfo.title}
          </h3>
          <p className="text-xs sm:text-sm text-[#6E6A75] leading-relaxed">
            {activePhaseInfo.desc}
          </p>

          {/* Active Phase barrier warning if logged */}
          {user.barrierReport && (
            <div className="mt-2 inline-flex items-center gap-2 p-2.5 rounded-xl bg-[#FDF1DF] border border-[#F6DCB6] text-xs font-semibold text-[#C77700]">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                ⚠ Reportaste una barrera: {user.barrierReport.tipo.replace('_', ' ')} — {user.barrierReport.fecha}
              </span>
            </div>
          )}
        </div>

        {/* Action Button to Advance Phase */}
        {activePhaseInfo.advanceBtnText && (
          <div className="shrink-0 self-start sm:self-center">
            <button
              type="button"
              onClick={() =>
                // "Ya fui a mi cita" abre el cuestionario de la cita; el resto
                // de fases siguen con la confirmación simple.
                esRegistroDeCita
                  ? setShowRegistroCita(true)
                  : setShowConfirmAdvanceModal(true)
              }
              className="px-5 py-2.5 bg-[#4A2270] hover:bg-[#381559] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-2"
            >
              <span>{activePhaseInfo.advanceBtnText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <RegistroCitaModal
        abierto={showRegistroCita}
        derivaciones={user.derivaciones}
        childName={childName}
        onCerrar={() => setShowRegistroCita(false)}
        onConfirmar={registrarCita}
      />

      {/* CONFIRMATION MODAL TO ADVANCE PHASE */}
      <AnimatePresence>
        {showConfirmAdvanceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl border border-[#E5E1EC] p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#E9DFF5] text-[#4A2270] flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-fraunces font-bold text-[#2E2A33]">
                    Confirmar avance en tu ruta
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfirmAdvanceModal(false)}
                  className="p-1 rounded-full text-[#6E6A75] hover:bg-[#F7F5FA] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs sm:text-sm text-[#2E2A33] leading-relaxed">
                ¿Confirmas que <strong>{activePhaseInfo.advanceQuestion}</strong>? Esto actualizará tu caso a la <strong>Fase {activePhaseInfo.nextPhase} ({phases[(activePhaseInfo.nextPhase || 1) - 1]?.title})</strong>.
              </p>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmAdvanceModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-[#E5E1EC] text-xs sm:text-sm font-semibold text-[#6E6A75] hover:bg-[#F7F5FA] cursor-pointer"
                >
                  Todavía no
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAdvance}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#4A2270] hover:bg-[#381559] text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
                >
                  Sí, confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

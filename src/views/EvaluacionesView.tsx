import React, { useState } from 'react';
import { ScreenType, UserProfile } from '../types';
import { Info, Clock, CheckCircle2, RotateCcw, ArrowRight, AlertTriangle } from 'lucide-react';
import { calcularEdadMeses, parseMesTextoANumero } from '../utils/age';

interface EvaluacionesViewProps {
  user: UserProfile;
  onNavigate: (screen: ScreenType) => void;
  onResetEvaluation?: () => void;
}

export const EvaluacionesView: React.FC<EvaluacionesViewProps> = ({
  user,
  onNavigate,
  onResetEvaluation,
}) => {
  const [showRepeatModal, setShowRepeatModal] = useState(false);

  const childName = user.child.nickname || 'Tu niño/a';
  const birthM = parseMesTextoANumero(user.child.birthMonth);
  const birthY = parseInt(user.child.birthYear, 10) || 2024;

  const ageInMonths = calcularEdadMeses(birthM, birthY);
  const mchatApplicable = ageInMonths >= 16 && ageInMonths <= 30;
  const hasExistingTamizaje = !!user.screeningResult;

  const handleStartOrView = () => {
    if (!mchatApplicable) return;
    if (hasExistingTamizaje) {
      onNavigate('mi-ruta');
    } else {
      onNavigate('cuestionario');
    }
  };

  const handleConfirmRepeat = () => {
    setShowRepeatModal(false);
    if (onResetEvaluation) {
      onResetEvaluation();
    }
    onNavigate('cuestionario');
  };

  const upcomingTools = [
    'TDAH',
    'Trastornos del lenguaje',
    'Retraso del desarrollo',
    'Hitos del desarrollo por edad',
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-fraunces font-bold text-[#2E2A33] mb-2 tracking-tight">
          Evaluaciones
        </h1>
        <p className="text-[#6E6A75] text-lg">
          Herramientas de orientación validadas. Ninguna de ellas entrega un diagnóstico.
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-[#E9DFF5] border border-[#D5CCE0] rounded-xl p-4 flex gap-3 items-start">
        <Info className="w-5 h-5 text-[#4A2270] shrink-0 mt-0.5" />
        <p className="text-[15px] text-[#4A2270] font-medium leading-relaxed">
          PAN está pensada para acompañar distintas condiciones del neurodesarrollo. Por ahora tenemos disponible la herramienta de autismo.
        </p>
      </div>

      {/* Available Now */}
      <section>
        <h2 className="text-[20px] font-bold text-[#2E2A33] mb-4">Disponible ahora</h2>
        <div className="bg-white border-2 border-[#4A2270] rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-[#E6F2EC] text-[#2E7D5B] text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Disponible
            </span>
          </div>

          <h3 className="text-2xl font-fraunces font-bold text-[#2E2A33] mb-1">M-CHAT-R/F</h3>
          <p className="text-[#6E6A75] font-medium mb-6">Tamizaje de autismo en niños pequeños</p>

          <div className="flex flex-wrap gap-4 sm:gap-6 mb-6">
            <div className="flex items-center gap-2 text-[#4A2270] bg-[#F7F5FA] px-3 py-1.5 rounded-lg border border-[#E5E1EC]">
              <span className="text-sm font-semibold">16 a 30 meses</span>
            </div>
            <div className="flex items-center gap-2 text-[#4A2270] bg-[#F7F5FA] px-3 py-1.5 rounded-lg border border-[#E5E1EC]">
              <span className="text-sm font-semibold">20 preguntas</span>
            </div>
            <div className="flex items-center gap-2 text-[#4A2270] bg-[#F7F5FA] px-3 py-1.5 rounded-lg border border-[#E5E1EC]">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-semibold">5 minutos</span>
            </div>
            <div className="flex items-center gap-2 text-[#4A2270] bg-[#F7F5FA] px-3 py-1.5 rounded-lg border border-[#E5E1EC]">
              <span className="text-sm font-semibold">Sí / No</span>
            </div>
          </div>

          <p className="text-[14px] text-[#6E6A75] mb-8 leading-relaxed">
            Versión peruana incluida en el Anexo 11 de la Norma Técnica de Salud NTS N° 238-MINSA/DGIESP-2025.
          </p>

          {!mchatApplicable ? (
            /* Age Out of Range Amber Box */
            <div className="bg-[#FDF1DF] border border-[#F3D5A5] rounded-xl p-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center shadow-xs">
              <p className="text-[14.5px] text-[#C77700] font-medium leading-relaxed max-w-lg">
                <span className="font-bold">{childName} tiene {ageInMonths} meses de edad.</span> Esta herramienta está validada científicamente únicamente para niños/as de 16 a 30 meses. Tu siguiente paso sugerido es acudir al control CRED de tu centro de salud.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('mi-ruta')}
                className="w-full sm:w-auto px-6 py-2.5 bg-white text-[#C77700] border border-[#F3D5A5] hover:bg-[#FDF1DF] font-bold text-sm rounded-lg transition-colors cursor-pointer shrink-0"
              >
                Ver mi ruta
              </button>
            </div>
          ) : hasExistingTamizaje ? (
            /* Already Evaluated State */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#F7F5FA] border border-[#E5E1EC] flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-[#6E6A75] uppercase tracking-wider block">
                    Resultado registrado
                  </span>
                  <p className="text-sm font-bold text-[#2E2A33]">
                    Puntaje: {user.screeningResult?.score} / 20 (Riesgo {user.screeningResult?.nivel})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleStartOrView}
                  className="px-5 py-2.5 bg-[#4A2270] hover:bg-[#381559] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>Ver mi resultado en Mi Ruta</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShowRepeatModal(true)}
                  className="px-4 py-2 bg-white border border-[#E5E1EC] hover:bg-[#FAF8FD] text-[#4A2270] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Repetir evaluación</span>
                </button>
              </div>
            </div>
          ) : (
            /* Normal Action */
            <button
              type="button"
              onClick={handleStartOrView}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#4A2270] hover:bg-[#32174D] text-white text-[15px] font-bold rounded-xl transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md cursor-pointer"
            >
              Comenzar evaluación
            </button>
          )}
        </div>
      </section>

      {/* Upcoming */}
      <section>
        <h2 className="text-[20px] font-bold text-[#2E2A33] mb-4">Próximamente</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {upcomingTools.map((tool, idx) => (
            <div key={idx} className="bg-[#F7F5FA] border border-[#E5E1EC] rounded-2xl p-6 opacity-75">
              <span className="inline-block bg-[#E5E1EC] text-[#6E6A75] text-[11px] font-bold px-2 py-1 rounded-md uppercase tracking-wider mb-3">
                Próximamente
              </span>
              <h3 className="font-bold text-[#2E2A33]">{tool}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Repeat Evaluation Confirmation Modal */}
      {showRepeatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full border border-[#E5E1EC] shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-full bg-[#FDF1DF] text-[#C77700] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-fraunces font-bold text-[#2E2A33]">
                ¿Deseas repetir la evaluación?
              </h3>
              <p className="text-xs text-[#6E6A75] leading-relaxed">
                Ya tienes un tamizaje guardado. Si vuelves a realizarlo, se actualizará tu puntaje y registro de respuestas en el sistema.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRepeatModal(false)}
                className="flex-1 py-2.5 bg-white border border-[#E5E1EC] text-xs font-bold text-[#6E6A75] rounded-xl hover:bg-[#F7F5FA] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRepeat}
                className="flex-1 py-2.5 bg-[#4A2270] hover:bg-[#381559] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
              >
                Sí, reevaluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

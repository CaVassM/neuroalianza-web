import React, { useState, useEffect } from 'react';
import { ScreenType, UserProfile } from '../types';
import { ChevronLeft, Info, Download, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import instrumento from '../data/instrumento.json';
import { generateAndDownloadScreeningPDF } from '../utils/pdfGenerator';
import { calcularEdadMeses, parseMesTextoANumero } from '../utils/age';
import { calcularPuntaje, clasificar } from '../dominio/tamizaje';
import { generarCodigoCaso } from '../data/perfiles';

interface CuestionarioViewProps {
  user: UserProfile;
  onNavigate: (screen: ScreenType) => void;
  onUpdateUser?: (updated: UserProfile) => void;
}

type WizardState = 'question' | 'review' | 'result';

const STORAGE_KEY_DRAFT = 'neuroalianza_questionnaire_draft';

// Animated Score Counter
const AnimatedScore: React.FC<{ target: number }> = ({ target }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || target === 0) {
      setCount(target);
      return;
    }

    const duration = 600;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [target]);

  return (
    <span className="font-fraunces font-bold text-[38px] leading-none select-none">
      {count}
    </span>
  );
};

export const CuestionarioView: React.FC<CuestionarioViewProps> = ({
  user,
  onNavigate,
  onUpdateUser,
}) => {
  const childName = user.child.nickname || 'Tu niño/a';

  // Check age applicability
  const birthM = parseMesTextoANumero(user.child.birthMonth);
  const birthY = parseInt(user.child.birthYear, 10) || 2024;
  const ageInMonths = calcularEdadMeses(birthM, birthY);
  const isApplicable = ageInMonths >= 16 && ageInMonths <= 30;

  // Restore draft from localStorage if present
  const [answers, setAnswers] = useState<Record<number, 'si' | 'no'>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DRAFT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.warn('Draft load failed', e);
    }
    return user.screeningAnswers || {};
  });

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [wizardState, setWizardState] = useState<WizardState>('question');
  const [showIntroModal, setShowIntroModal] = useState(true);
  const [isEditingFromReview, setIsEditingFromReview] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const totalQuestions = instrumento.items.length;

  // Save draft whenever answers change
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(answers));
      } catch (e) {
        console.warn('Draft save error', e);
      }
    }
  }, [answers]);

  // If age is out of range, show blocked state
  if (!isApplicable) {
    return (
      <div className="w-full min-h-[calc(100vh-64px)] bg-[#F7F5FA] flex flex-col items-center justify-center p-6">
        <div className="bg-white border-2 border-[#F3D5A5] rounded-2xl p-8 max-w-lg w-full text-center space-y-5 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#FDF1DF] text-[#C77700] flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-fraunces font-bold text-[#2E2A33]">
            Evaluación no aplicable por edad
          </h2>
          <p className="text-sm text-[#6E6A75] leading-relaxed">
            {childName} tiene <span className="font-bold text-[#2E2A33]">{ageInMonths} meses</span>. La herramienta M-CHAT-R/F se aplica exclusivamente a niños y niñas de <span className="font-bold text-[#2E2A33]">16 a 30 meses</span>.
          </p>
          <div className="bg-[#FDF1DF] text-[#C77700] text-xs font-semibold p-4 rounded-xl text-left border border-[#F3D5A5]">
            Tu siguiente paso es acudir al control de Crecimiento y Desarrollo (CRED) en tu centro de salud de referencia.
          </div>
          <button
            type="button"
            onClick={() => onNavigate('evaluaciones')}
            className="px-6 py-3 bg-[#4A2270] hover:bg-[#381559] text-white font-bold text-sm rounded-xl cursor-pointer shadow-xs"
          >
            Volver a evaluaciones
          </button>
        </div>
      </div>
    );
  }

  const handleStart = () => {
    setShowIntroModal(false);
  };

  const handleAnswer = (answer: 'si' | 'no') => {
    const questionNum = instrumento.items[currentQIndex].n;
    const updated = { ...answers, [questionNum]: answer };
    setAnswers(updated);

    if (isEditingFromReview) {
      setWizardState('review');
      setIsEditingFromReview(false);
    } else if (currentQIndex < totalQuestions - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      setWizardState('review');
    }
  };

  const handleEditQuestion = (index: number) => {
    setCurrentQIndex(index);
    setIsEditingFromReview(true);
    setWizardState('question');
  };

  // Ensure all 20 questions are answered
  const allAnswered = Array.from({ length: 20 }, (_, i) => i + 1).every(
    (n) => answers[n] === 'si' || answers[n] === 'no'
  );

  const handleShowResult = () => {
    if (!allAnswered) return;

    const finalScore = calcularPuntaje(answers);
    const finalNivel = clasificar(finalScore);

    // Clear draft storage upon completion
    try {
      localStorage.removeItem(STORAGE_KEY_DRAFT);
    } catch (e) {
      // ignore
    }

    if (onUpdateUser) {
      const nowIso = new Date().toISOString();
      const updatedRegistros = [...(user.registros || [])];

      updatedRegistros.push({
        fecha: new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }),
        titulo: 'Tamizaje M-CHAT-R/F completado',
        detalle: `Puntaje: ${finalScore}/20 (${finalNivel}). Autoreportado por la familia.`,
        tipo: 'tamizaje',
        origen: 'familia',
        faseNum: 3,
      });

      onUpdateUser({
        ...user,
        fase: user.fase && user.fase >= 3 ? user.fase : 3,
        screeningAnswers: answers,
        // Si aún no hay caso, se genera uno propio. Antes caía al código de la
        // demo (NA-7K3M9) y dos familias distintas compartían el mismo caso.
        caseCode: user.caseCode || generarCodigoCaso(),
        screeningResult: {
          score: finalScore,
          nivel: finalNivel,
          completedAt: nowIso,
        },
        registros: updatedRegistros,
      });
    }

    setWizardState('result');
  };

  const score = Object.keys(answers).length === 20 ? calcularPuntaje(answers) : 0;
  const nivel = Object.keys(answers).length === 20 ? clasificar(score) : 'baja';

  const titleText =
    nivel === 'baja'
      ? 'Por ahora no vemos señales de alerta'
      : nivel === 'moderada'
      ? 'Conviene que un profesional lo revise'
      : 'Es importante que agendes una consulta';

  const containmentText =
    nivel === 'baja'
      ? `Las respuestas indican que el desarrollo de ${childName} sigue el curso esperado. Mantener la observación cotidiana es la mejor forma de acompañar su crecimiento.`
      : nivel === 'moderada'
      ? `Algunas respuestas muestran conductas que merecen una mirada más detallada de un profesional. Esto permite acompañar a ${childName} a tiempo.`
      : `Varias respuestas sugieren que vale la pena que un profesional observe a ${childName} con más detalle. Esto es frecuente y tiene solución cuando se atiende a tiempo.`;

  // El semáforo define a dónde derivar, y la regla es distinta en cada color:
  //   verde    -> seguir con los controles CRED de rutina
  //   amarillo -> acudir a un control CRED
  //   rojo     -> sacar cita con pediatría; si el establecimiento no tiene, CRED
  const nextStepText =
    nivel === 'baja'
      ? `Continúa con los controles CRED habituales. Si ${childName} tiene menos de 2 años, repite esta evaluación a los 24 meses.`
      : nivel === 'moderada'
      ? 'Acude a un control CRED en tu centro de salud y muestra este resultado. Ahí el personal aplicará una entrevista de seguimiento que complementa estas 20 preguntas.'
      : 'Saca una cita con pediatría esta semana y muestra este resultado. Si tu establecimiento no cuenta con pediatría, pide un control CRED: desde ahí te derivan a la evaluación especializada.';

  const circleStyle =
    nivel === 'baja'
      ? 'bg-[#E6F2EC] text-[#2E7D5B]'
      : nivel === 'moderada'
      ? 'bg-[#FDF1DF] text-[#C77700]'
      : 'bg-[#F3EDF9] text-[#4A2270]';

  const handleDownloadPDF = async () => {
    try {
      setDownloadingPdf(true);
      await generateAndDownloadScreeningPDF({
        caseCode: user.caseCode || 'NA-7K3M9',
        childAgeMonths: ageInMonths,
        district: user.location.district || 'Miraflores',
        insurance: user.insurance || 'SIS',
        score,
        nivel: nivel as 'baja' | 'moderada' | 'alta',
        answers,
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#F7F5FA] flex flex-col items-center">
      {/* Progress Bar */}
      {(wizardState === 'question' || wizardState === 'review') && (
        <div className="w-full bg-white border-b border-[#E5E1EC] px-4 py-4 sticky top-[64px] z-30">
          <div className="max-w-3xl mx-auto px-2 relative">
            <div className="flex justify-between items-center mb-5">
              <span className="text-sm font-bold text-[#4A2270]">
                {wizardState === 'review'
                  ? 'Revisión final'
                  : `Pregunta ${currentQIndex + 1} de ${totalQuestions}`}
              </span>
            </div>

            <div className="relative flex justify-between items-center w-full mb-2">
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[2px] bg-[#E5E1EC] z-0" />
              <div
                className="h-[2px] bg-[#4A2270] transition-all duration-300 absolute top-1/2 -translate-y-1/2 left-0 z-0"
                style={{
                  width:
                    wizardState === 'review'
                      ? '100%'
                      : `${(currentQIndex / (totalQuestions - 1)) * 100}%`,
                }}
              />

              <div className="relative z-10 flex justify-between w-full">
                {Array.from({ length: totalQuestions }).map((_, i) => {
                  const qNum = i + 1;
                  const isAnswered = !!answers[qNum];
                  const isCurrent = wizardState === 'question' && currentQIndex === i;

                  return (
                    <div
                      key={i}
                      className={`rounded-full transition-all duration-300 ring-[3px] ring-white ${
                        isCurrent
                          ? 'w-3.5 h-3.5 bg-[#4A2270] shadow-sm scale-110 relative -top-[1px]'
                          : isAnswered
                          ? 'w-2.5 h-2.5 bg-[#4A2270] relative top-[1px]'
                          : 'w-2.5 h-2.5 bg-[#C5BACD] relative top-[1px]'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 flex flex-col justify-center animate-in fade-in duration-300">
        {/* Intro Modal Overlay */}
        {showIntroModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white rounded-t-3xl sm:rounded-2xl p-8 sm:p-12 w-full max-w-[560px] shadow-2xl flex flex-col items-center text-center"
            >
              <h2 className="text-2xl sm:text-3xl font-fraunces font-bold text-[#2E2A33] mb-6">
                Antes de empezar
              </h2>
              <p className="text-[#6E6A75] text-[17px] leading-relaxed mb-10 max-w-lg mx-auto">
                Responde pensando en cómo se comporta{' '}
                <span className="font-bold text-[#2E2A33]">{childName}</span> habitualmente. Si el comportamiento lo has visto solo una o dos veces, responde{' '}
                <span className="font-bold">No</span>.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 mt-2 w-full">
                <button
                  type="button"
                  onClick={handleStart}
                  className="w-full sm:w-auto px-10 py-3.5 bg-[#4A2270] hover:bg-[#32174D] text-white text-[16px] font-bold rounded-xl transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md cursor-pointer"
                >
                  Entendido, empezar
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('evaluaciones')}
                  className="text-sm text-[#6E6A75] hover:text-[#4A2270] font-medium transition-colors cursor-pointer px-4 py-2"
                >
                  Volver a evaluaciones
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Question View */}
        {wizardState === 'question' && (
          <motion.div
            key={currentQIndex}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-[640px] mx-auto"
          >
            <div className="bg-white rounded-2xl border border-[#E5E1EC] p-8 sm:p-12 shadow-sm text-center min-h-[340px] flex flex-col justify-center">
              <h3 className="text-2xl sm:text-[28px] font-fraunces font-bold text-[#2E2A33] leading-[1.3] mb-4">
                {instrumento.items[currentQIndex].texto}
              </h3>
              <p className="text-[15px] text-[#6E6A75] italic mb-10">
                ({instrumento.items[currentQIndex].ejemplo})
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleAnswer('si')}
                  className={`py-4 text-[18px] font-bold rounded-xl transition-all cursor-pointer border-2 ${
                    answers[instrumento.items[currentQIndex].n] === 'si'
                      ? 'bg-[#E9DFF5] border-[#4A2270] text-[#4A2270]'
                      : 'bg-[#F7F5FA] hover:bg-white text-[#2E2A33] border-[#E5E1EC] hover:border-[#4A2270]'
                  }`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => handleAnswer('no')}
                  className={`py-4 text-[18px] font-bold rounded-xl transition-all cursor-pointer border-2 ${
                    answers[instrumento.items[currentQIndex].n] === 'no'
                      ? 'bg-[#E9DFF5] border-[#4A2270] text-[#4A2270]'
                      : 'bg-[#F7F5FA] hover:bg-white text-[#2E2A33] border-[#E5E1EC] hover:border-[#4A2270]'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center w-full relative z-20">
              <button
                type="button"
                onClick={() => {
                  if (currentQIndex > 0) setCurrentQIndex(currentQIndex - 1);
                  else setShowIntroModal(true);
                }}
                className="flex items-center gap-1.5 text-sm font-medium text-[#6E6A75] hover:text-[#4A2270] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Atrás
              </button>

              {isEditingFromReview && (
                <button
                  type="button"
                  onClick={() => {
                    setWizardState('review');
                    setIsEditingFromReview(false);
                  }}
                  className="text-sm font-bold text-[#4A2270] hover:text-[#32174D] transition-colors cursor-pointer"
                >
                  Cancelar y volver a revisión
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Review View */}
        {wizardState === 'review' && (
          <div className="w-full bg-white rounded-2xl border border-[#E5E1EC] p-6 sm:p-10 shadow-sm animate-in fade-in duration-300">
            <h2 className="text-2xl font-fraunces font-bold text-[#2E2A33] mb-2">
              Revisión de respuestas
            </h2>
            <p className="text-[#6E6A75] text-[15px] mb-8">
              Verifica tus respuestas antes de generar el reporte de {childName}.
            </p>

            <div className="space-y-0 border-t border-b border-[#E5E1EC] max-h-[40vh] sm:max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {instrumento.items.map((item) => (
                <div
                  key={item.n}
                  className="py-4 border-b border-[#E5E1EC] last:border-b-0 flex gap-4 justify-between items-start"
                >
                  <div>
                    <p className="text-sm font-bold text-[#2E2A33] mb-1">
                      Pregunta {item.n}
                    </p>
                    <p className="text-[13px] text-[#6E6A75] pr-4">{item.texto}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 shrink-0">
                    <span
                      className={`text-[14px] font-bold px-3 py-1 rounded-lg uppercase ${
                        answers[item.n]
                          ? 'text-[#4A2270] bg-[#E9DFF5]'
                          : 'text-amber-800 bg-amber-100'
                      }`}
                    >
                      {answers[item.n] || 'Sin responder'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleEditQuestion(item.n - 1)}
                      className="text-[13px] font-semibold text-[#6E6A75] hover:text-[#4A2270] underline cursor-pointer"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
              {!allAnswered && (
                <p className="text-xs font-semibold text-rose-600">
                  Responde las 20 preguntas para habilitar los resultados.
                </p>
              )}

              <button
                type="button"
                disabled={!allAnswered}
                onClick={handleShowResult}
                className={`w-full sm:w-auto px-8 py-3.5 text-[15px] font-bold rounded-xl transition-all duration-200 shadow-sm ${
                  allAnswered
                    ? 'bg-[#4A2270] hover:bg-[#32174D] text-white cursor-pointer hover:shadow-md'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                }`}
              >
                Ver mi resultado
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Result Modal Overlay */}
      {wizardState === 'result' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            className="bg-white rounded-t-3xl sm:rounded-[24px] p-6 sm:p-9 max-w-[540px] w-full shadow-2xl flex flex-col items-center text-center my-auto border border-[#E5E1EC]"
          >
            <div
              className={`w-[88px] h-[88px] rounded-full flex items-center justify-center shadow-xs ${circleStyle}`}
            >
              <AnimatedScore target={score} />
            </div>

            <p className="text-[14.5px] text-[#6E6A75] mt-3.5 mb-1.5 font-normal">
              Probabilidad {nivel}
            </p>

            <h3 className="text-[22px] sm:text-[25px] font-fraunces font-bold text-[#2E2A33] mb-2.5 leading-snug">
              {titleText}
            </h3>

            <p className="text-[14px] sm:text-[14.5px] text-[#6E6A75] mb-5 leading-relaxed max-w-[460px] mx-auto">
              {containmentText}
            </p>

            <div className="w-full bg-[#E9DFF5] border border-[#D5C6EB] rounded-2xl p-4 sm:p-5 text-left mb-3.5">
              <span className="text-[11px] font-bold tracking-wider text-[#4A2270] uppercase block mb-1 font-sans">
                TU SIGUIENTE PASO
              </span>
              <p className="text-[13.5px] sm:text-[14px] text-[#2E2A33] leading-relaxed font-medium">
                {nextStepText}
              </p>
            </div>

            <div className="w-full bg-[#FAF8FD] border border-[#E5E1EC] rounded-xl p-3.5 flex items-start gap-2.5 text-left mb-6">
              <Info className="w-4 h-4 text-[#6E6A75] shrink-0 mt-0.5" />
              <p className="text-[12.5px] sm:text-[13px] text-[#6E6A75] leading-relaxed">
                Esto no es un diagnóstico. El M-CHAT-R/F es una herramienta de tamizaje; solo un profesional de salud puede diagnosticar.
              </p>
            </div>

            <div className="w-full flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => onNavigate('mi-ruta')}
                className="w-full py-3.5 bg-[#4A2270] hover:bg-[#381559] active:scale-[0.99] text-white text-[15px] font-bold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
              >
                Ver mi ruta de atención
              </button>

              <button
                type="button"
                disabled={downloadingPdf}
                onClick={handleDownloadPDF}
                className="w-full py-3 bg-white border border-[#E5E1EC] hover:bg-[#F7F5FA] hover:border-[#4A2270]/40 active:scale-[0.99] text-[#2E2A33] text-[14.5px] font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-[#4A2270]" />
                <span>{downloadingPdf ? 'Generando PDF...' : 'Descargar mis resultados (PDF)'}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="w-full py-2 text-center text-[14px] font-semibold text-[#6E6A75] hover:text-[#4A2270] transition-colors cursor-pointer mt-1"
              >
                Volver al inicio
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

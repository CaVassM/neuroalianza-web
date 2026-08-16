import React, { useState } from 'react';
import { Logo } from '../components/Logo';
import { StepProgress } from '../components/StepProgress';
import { InsuranceType } from '../types';
import { Heart, Building2, Shield, HelpCircle, Check, ArrowRight, Search, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RegisterStep3Props {
  initialInsurance: InsuranceType;
  onFinish: (insurance: InsuranceType) => void;
  onBack: () => void;
  onGoToLogin: () => void;
}

export const RegisterStep3: React.FC<RegisterStep3Props> = ({
  initialInsurance,
  onFinish,
  onBack,
  onGoToLogin,
}) => {
  const [selectedInsurance, setSelectedInsurance] = useState<InsuranceType>(initialInsurance || 'sis');
  const [showModal, setShowModal] = useState(false);

  const insuranceOptions: {
    id: InsuranceType;
    title: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'sis',
      title: 'SIS (Seguro Integral de Salud)',
      description: 'Atención en postas MINSA, centros de salud y hospitales públicos.',
      icon: <Heart className="w-5 h-5 text-[#4A2270]" />,
    },
    {
      id: 'essalud',
      title: 'EsSalud',
      description: 'Seguro social para trabajadores dependientes o independientes.',
      icon: <Building2 className="w-5 h-5 text-[#4A2270]" />,
    },
    {
      id: 'eps',
      title: 'Seguro privado o EPS',
      description: 'Cobertura en clínicas privadas o planes de salud de empresas.',
      icon: <Shield className="w-5 h-5 text-[#4A2270]" />,
    },
    {
      id: 'none',
      title: 'No estoy seguro',
      description: 'No pasa nada. Abajo puedes consultarlo, y te orientamos para afiliarte gratis al SIS.',
      icon: <HelpCircle className="w-5 h-5 text-[#4A2270]" />,
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(true);
  };

  return (
    <div className="flex-1 bg-[#F7F5FA] flex flex-col items-center pt-8 pb-12 px-4 sm:px-6">
      {/* Top Header with Logo */}
      <div className="w-full flex justify-center mb-6">
        <Logo onClick={onGoToLogin} size="md" />
      </div>

      {/* Main Card */}
      <motion.div 
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-[640px] bg-white rounded-2xl border border-[#E5E1EC] p-7 sm:p-11 shadow-sm"
      >
        <StepProgress currentStep={3} onStepClick={(s) => s <= 2 && onBack()} />

        <h2 className="text-[28px] sm:text-[32px] font-fraunces font-bold text-[#2E2A33] mb-8">
          ¿Qué seguro tienen?
        </h2>

        {/* Consultar el seguro antes de elegir.
            Mucha gente no sabe de qué seguro es, y obligarla a adivinar la
            manda por una ruta equivocada. Los dos enlaces son los consultores
            oficiales, así que se puede resolver sin salir del registro. */}
        <div className="mb-7 bg-[#FAF8FD] border border-[#E5E1EC] rounded-2xl p-5 space-y-3">
          <h3 className="text-[14px] font-bold text-[#2E2A33] flex items-center gap-2">
            <Search className="w-4 h-4 text-[#4A2270]" />
            <span>¿No sabes qué seguro tienes? Averígualo aquí</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="https://app.sis.gob.pe/SisConsultaEnLinea/ConsultaAfiliado"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-white border border-[#E5E1EC] hover:border-[#4A2270] transition-all cursor-pointer group"
            >
              <span className="min-w-0">
                <span className="block text-[13.5px] font-bold text-[#2E2A33]">
                  Consultar el SIS
                </span>
                <span className="block text-[11.5px] text-[#6E6A75]">
                  Con tu DNI, en sis.gob.pe
                </span>
              </span>
              <ExternalLink className="w-4 h-4 text-[#4A2270] shrink-0 group-hover:scale-110 transition-transform" />
            </a>

            <a
              href="https://www.essalud.gob.pe/acreditacion/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-white border border-[#E5E1EC] hover:border-[#4A2270] transition-all cursor-pointer group"
            >
              <span className="min-w-0">
                <span className="block text-[13.5px] font-bold text-[#2E2A33]">
                  Consultar EsSalud
                </span>
                <span className="block text-[11.5px] text-[#6E6A75]">
                  Acreditación en essalud.gob.pe
                </span>
              </span>
              <ExternalLink className="w-4 h-4 text-[#4A2270] shrink-0 group-hover:scale-110 transition-transform" />
            </a>
          </div>
          <p className="text-[12px] text-[#6E6A75] leading-relaxed">
            Se abren en otra pestaña. Puedes volver aquí y continuar sin perder lo que ya
            registraste.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {insuranceOptions.map((opt) => {
              const isSelected = selectedInsurance === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedInsurance(opt.id)}
                  className={`relative p-5 rounded-xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between min-h-[140px] ${
                    isSelected
                      ? 'border-[#4A2270] bg-[#FAF8FD] ring-2 ring-[#4A2270]/20 shadow-xs'
                      : 'border-[#E5E1EC] bg-white hover:border-[#4A2270]/40 hover:bg-[#FAF8FD]/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#E9DFF5] flex items-center justify-center shrink-0">
                      {opt.icon}
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#4A2270] text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <div className="mt-3.5">
                    <h4 className="text-[14.5px] font-bold text-[#2E2A33]">
                      {opt.title}
                    </h4>
                    <p className="text-[12.5px] text-[#6E6A75] mt-1 leading-snug">
                      {opt.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sin seguro no significa sin atención: el SIS es gratuito y la
              afiliación se hace en el mismo establecimiento. Es de lo más útil
              que le podemos decir a una familia en este punto. */}
          <AnimatePresence>
            {selectedInsurance === 'none' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="bg-[#F4EFFB] border border-[#D5CCE0] rounded-2xl p-5 flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#E9DFF5] flex items-center justify-center shrink-0">
                    <Heart className="w-4.5 h-4.5 text-[#4A2270]" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[14px] font-bold text-[#4A2270]">
                      Puedes afiliarte gratis al SIS
                    </h4>
                    <p className="text-[13px] text-[#2E2A33] leading-relaxed">
                      El <strong>Seguro Integral de Salud</strong> es gratuito y cubre
                      consultas, controles CRED y derivaciones a especialistas. No necesitas
                      estar afiliado antes de ir: puedes tramitarlo en el mismo centro de
                      salud.
                    </p>
                    <p className="text-[12.5px] text-[#6E6A75] leading-relaxed">
                      Lleva tu DNI y el del niño o niña. Si no tiene DNI, en el
                      establecimiento te orientan para obtenerlo.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3.5 bg-white border border-[#E5E1EC] text-[#2E2A33] text-[15px] font-semibold rounded-xl hover:bg-[#F7F5FA] active:scale-[0.98] transition-all cursor-pointer"
            >
              Atrás
            </button>

            <button
              type="submit"
              className="px-8 py-3.5 bg-[#4A2270] hover:bg-[#381559] active:scale-[0.98] text-white text-[15px] font-bold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer flex items-center gap-2"
            >
              <span>Comenzar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </motion.div>

      <div className="text-center pt-8 pb-4">
        <p className="text-[12px] text-[#6E6A75]">PAN no realiza diagnósticos ni comparte tus datos.</p>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
            <motion.div 
              initial={{ y: 20, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-3xl sm:rounded-2xl p-8 sm:p-10 max-w-[420px] w-full mx-0 sm:mx-4 shadow-2xl flex flex-col items-center text-center border border-[#E5E1EC]"
            >
              <div className="w-18 h-18 rounded-full bg-[#E8F8F0] border-2 border-[#A2E3BF] flex items-center justify-center mb-5 animate-check-pop shadow-xs">
                <Check className="w-9 h-9 text-[#1E7E51] stroke-[3] animate-check-draw" />
              </div>
              <h3 className="text-[26px] font-fraunces font-bold text-[#2E2A33] mb-2">
                ¡Todo listo!
              </h3>
              <p className="text-[14.5px] text-[#6E6A75] leading-relaxed mb-7">
                Hemos configurado tu perfil de orientación adaptado a tu distrito y seguro.
              </p>
              <button
                onClick={() => onFinish(selectedInsurance)}
                className="w-full py-3.5 bg-[#4A2270] hover:bg-[#381559] active:scale-[0.98] text-white text-[15px] font-bold rounded-xl transition-all duration-200 shadow-md cursor-pointer"
              >
                Ingresar a mi panel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

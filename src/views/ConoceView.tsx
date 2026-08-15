import React, { useState } from 'react';
import {
  Check,
  X,
  Play,
  FileText,
  ArrowRight,
  Sparkles,
  Info,
  ShieldCheck,
  HeartHandshake,
  MapPin,
  ClipboardList,
  Compass,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ConoceViewProps {
  onNavigateToEvaluaciones?: () => void;
}

export const ConoceView: React.FC<ConoceViewProps> = ({ onNavigateToEvaluaciones }) => {
  const [showVideoModal, setShowVideoModal] = useState(false);

  const yesCards = [
    {
      title: 'Te orientamos con rigor científico',
      desc: 'Cuestionario de tamizaje estandarizado y apropiado para la edad de tu hijo/a (16 a 30 meses).',
      icon: ClipboardList,
    },
    {
      title: 'Mapeamos tu ruta en el MINSA / EsSalud',
      desc: 'Te indicamos exactamente a qué posta, centro de salud o CSMC acudir según tu distrito y seguro.',
      icon: MapPin,
    },
    {
      title: 'Te respaldamos con un informe con QR',
      desc: 'Generamos un reporte digital descargable para presentar directamente al profesional de salud.',
      icon: FileText,
    },
    {
      title: 'Acompañamos si surge una barrera',
      desc: 'Si no encuentras cita o hay demoras, te brindamos un Plan B estructurado con alternativas.',
      icon: Compass,
    },
  ];

  const noCards = [
    {
      title: 'No emitimos diagnósticos médicos',
      desc: 'Un tamizaje detecta alertas preventivas. El diagnóstico es competencia exclusiva del médico especialista.',
      icon: ShieldCheck,
    },
    {
      title: 'No sustituimos la consulta profesional',
      desc: 'Nuestra orientación prepara e informa a la familia para enriquecer la consulta clínica CRED o de salud.',
      icon: HeartHandshake,
    },
    {
      title: 'No realizamos cobros ni trámites directos',
      desc: 'El servicio es 100% gratuito. Los trámites de cita se gestionan en tu establecimiento de salud.',
      icon: Award,
    },
  ];

  const stepsList = [
    {
      number: '01',
      title: 'Responde el cuestionario inicial',
      desc: '20 preguntas sencillas sobre cómo juega, se comunica y expresa emociones tu hijo o hija.',
      bg: 'bg-[#F4EFFB]',
      text: 'text-[#4A2270]',
    },
    {
      number: '02',
      title: 'Conoce tu nivel de riesgo',
      desc: 'Obtén de inmediato una interpretación clara y sin alarmismos de los resultados.',
      bg: 'bg-[#E6F2EC]',
      text: 'text-[#2E7D5B]',
    },
    {
      number: '03',
      title: 'Encuentra el centro más cercano',
      desc: 'Visualiza en el mapa interactivo la posta, hospital o CSMC más cercano en tu distrito.',
      bg: 'bg-[#FDF1DF]',
      text: 'text-[#C77700]',
    },
    {
      number: '04',
      title: 'Lleva tu reporte al médico',
      desc: 'Descarga tu informe con código QR y preséntalo para agilizar tu hoja de referencia.',
      bg: 'bg-[#E9DFF5]',
      text: 'text-[#4A2270]',
    },
  ];

  return (
    <div className="w-full max-w-[960px] mx-auto px-4 sm:px-6 py-8 sm:py-14 space-y-14 overflow-hidden">
      
      {/* 1. Animated Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center space-y-6 max-w-3xl mx-auto pt-2"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E9DFF5] text-[#4A2270] text-xs font-bold border border-[#D5C6EB] shadow-2xs"
        >
          <Sparkles className="w-4 h-4 text-[#6B3FA0]" />
          <span>Orientación en Neurodesarrollo Infantil en el Perú</span>
        </motion.div>

        <h1 className="text-3xl sm:text-5xl font-fraunces font-bold text-[#2E2A33] tracking-tight leading-[1.15]">
          Acompañamos a tu familia en el camino del desarrollo infantil
        </h1>

        <p className="text-base sm:text-lg text-[#6E6A75] leading-relaxed max-w-2xl mx-auto font-normal">
          Sin rodeos ni términos médicos confusos. Te ayudamos a entender lo que observas en tu hijo/a, conocer tu ruta en el sistema de salud (SIS/EsSalud) y saber exactamente a dónde acudir.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigateToEvaluaciones && onNavigateToEvaluaciones()}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#4A2270] hover:bg-[#381559] text-white text-sm sm:text-base font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Iniciar evaluación gratuita</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowVideoModal(true)}
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-[#FAF8FD] text-[#4A2270] border border-[#E5E1EC] text-sm sm:text-base font-bold rounded-2xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-[#4A2270]" />
            <span>Ver cómo funciona</span>
          </motion.button>
        </div>

        {/* Feature Highlights Strip */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="bg-white p-3.5 rounded-2xl border border-[#E5E1EC] shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E6F2EC] text-[#2E7D5B] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#2E2A33]">100% Gratuito y seguro</p>
              <p className="text-[11px] text-[#6E6A75]">Sin registros complejos</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#E5E1EC] shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E9DFF5] text-[#4A2270] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#2E2A33]">Alineado a NTS N° 238</p>
              <p className="text-[11px] text-[#6E6A75]">Norma oficial MINSA 2025</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#E5E1EC] shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FDF1DF] text-[#C77700] flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#2E2A33]">Red pública y privada</p>
              <p className="text-[11px] text-[#6E6A75]">Centros georreferenciados</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 2. Interactive How It Works Steps */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="text-center space-y-1 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4A2270]">
            Paso a paso
          </span>
          <h2 className="text-2xl sm:text-3xl font-fraunces font-bold text-[#2E2A33]">
            ¿Cómo funciona la plataforma?
          </h2>
          <p className="text-xs sm:text-sm text-[#6E6A75]">
            Cuatro etapas sencillas diseñadas para guiarte sin estrés
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stepsList.map((st, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl border border-[#E5E1EC] p-5 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden group"
            >
              <div className="flex items-center justify-between">
                <span className={`w-9 h-9 rounded-xl ${st.bg} ${st.text} font-mono font-bold text-sm flex items-center justify-center`}>
                  {st.number}
                </span>
                <span className="w-2 h-2 rounded-full bg-[#E9DFF5] group-hover:bg-[#4A2270] transition-colors" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-[#2E2A33] leading-snug">
                  {st.title}
                </h3>
                <p className="text-xs text-[#6E6A75] leading-relaxed">
                  {st.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 3. Qué sí hacemos (Green cards) */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#2E7D5B]" />
          <h2 className="text-xl sm:text-2xl font-bold text-[#2E2A33]">
            Qué sí hacemos en PAN
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {yesCards.map((card, idx) => {
            const IconComponent = card.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -2 }}
                className="bg-[#E6F2EC] border border-[#C2E3D4] rounded-2xl p-5 flex items-start gap-4 transition-all shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-[#2E7D5B] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#2E2A33] flex items-center gap-1.5">
                    <span>{card.title}</span>
                    <Check className="w-4 h-4 text-[#2E7D5B]" />
                  </h3>
                  <p className="text-xs text-[#2E2A33]/80 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* 4. Qué no hacemos (Amber cards) */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#C77700]" />
          <h2 className="text-xl sm:text-2xl font-bold text-[#2E2A33]">
            Qué no hacemos (Claridad e integridad)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {noCards.map((card, idx) => {
            const IconComponent = card.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -2 }}
                className="bg-[#FDF1DF] border border-[#F6DCB6] rounded-2xl p-5 flex flex-col justify-between space-y-3 transition-all shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-[#C77700] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <IconComponent className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2E2A33] leading-snug flex items-center justify-between">
                    <span>{card.title}</span>
                    <X className="w-4 h-4 text-[#C77700]" />
                  </h3>
                  <p className="text-xs text-[#2E2A33]/80 mt-1.5 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* 5. Tutorial Video Preview Banner */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#2E2A33]">Video explicativo</h2>
            <p className="text-xs text-[#6E6A75]">Resumen interactivo de 2 minutos</p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#E9DFF5] text-[#4A2270] text-[11px] font-bold">
            Guía rápida
          </span>
        </div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setShowVideoModal(true)}
          className="w-full aspect-video max-h-[360px] rounded-3xl bg-[#E9DFF5] border border-[#D5CCE0] flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group relative overflow-hidden shadow-sm"
        >
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#4A2270_1.5px,transparent_1.5px)] [background-size:20px_20px]" />

          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white text-[#4A2270] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-3 z-10">
            <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-[#4A2270] ml-1" />
          </div>

          <span className="text-sm sm:text-base font-bold text-[#4A2270] group-hover:underline z-10">
            Ver tutorial de orientación
          </span>
          <span className="text-xs text-[#6E6A75] mt-1 z-10">
            Haz clic para abrir el resumen interactivo
          </span>
        </motion.div>
      </motion.section>

      {/* 8. Call to Action Banner */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="bg-[#4A2270] text-white rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-md relative overflow-hidden"
      >
        <div className="relative z-10 max-w-lg mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-fraunces font-bold text-white tracking-tight">
            ¿Listo para conocer la ruta de tu hijo/a?
          </h2>
          <p className="text-sm text-white/80 leading-relaxed font-normal">
            Responde el cuestionario preventivo de 20 preguntas en solo 3 minutos. Obtendrás un informe detallado con QR para presentar en tu consulta.
          </p>

          <div className="pt-3">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigateToEvaluaciones && onNavigateToEvaluaciones()}
              className="px-8 py-4 bg-white hover:bg-[#F7F5FA] text-[#4A2270] text-sm sm:text-base font-bold rounded-2xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Comenzar evaluación</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* Video Modal Preview */}
      <AnimatePresence>
        {showVideoModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#E5E1EC] shadow-2xl"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E1EC]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#E9DFF5] flex items-center justify-center">
                    <Play className="w-4 h-4 fill-[#4A2270] text-[#4A2270]" />
                  </div>
                  <h3 className="text-base font-bold text-[#2E2A33]">Cómo funciona PAN</h3>
                </div>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="p-1 rounded-lg text-[#6E6A75] hover:bg-[#F7F5FA] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="aspect-video bg-[#E9DFF5]/60 rounded-2xl flex flex-col items-center justify-center p-6 text-center border border-[#D5CCE0]">
                <Info className="w-10 h-10 text-[#4A2270] mb-2" />
                <p className="text-sm font-bold text-[#2E2A33]">Resumen interactivo de la plataforma</p>
                <p className="text-xs text-[#6E6A75] mt-1.5 max-w-xs leading-relaxed">
                  1. Cuestionario de tamizaje para niños de 16 a 30 meses.<br/>
                  2. Mapeo georreferenciado de postas, hospitales y CSMC.<br/>
                  3. Informe digital con QR para la consulta CRED o de salud.
                </p>
              </div>

              <button
                onClick={() => setShowVideoModal(false)}
                className="w-full py-3 bg-[#4A2270] text-white text-xs font-bold rounded-xl hover:bg-[#381559] transition-colors cursor-pointer"
              >
                Entendido, cerrar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

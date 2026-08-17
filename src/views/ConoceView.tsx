import React, { useState } from 'react';
import {
  Check,
  X,
  Play,
  FileText,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  MapPin,
  ClipboardList,
  Compass,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';

interface ConoceViewProps {
  onNavigateToEvaluaciones?: () => void;
  /** Arranca el recorrido guiado, que sustituye al tutorial en video. */
  onIniciarDemo?: () => void;
  /** Abre la vista que usa el profesional de salud. */
  onAbrirVistaProfesional?: () => void;
}

export const ConoceView: React.FC<ConoceViewProps> = ({
  onNavigateToEvaluaciones,
  onIniciarDemo,
  onAbrirVistaProfesional,
}) => {

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
          Acompañamos a tu familia en el camino del neurodesarrollo
        </h1>

        <p className="text-base sm:text-lg text-[#6E6A75] leading-relaxed max-w-2xl mx-auto font-normal">
          Sin rodeos ni términos médicos confusos. Te ayudamos a entender lo que observas en tu hijo/a, conocer tu ruta en el sistema público de salud y saber exactamente a dónde acudir.
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

          {/* Antes abría el cuadro del "video". Ahora arranca el recorrido, que
              es enseñar la plataforma en vez de contarla. */}
          {onIniciarDemo && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onIniciarDemo}
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-[#FAF8FD] text-[#4A2270] border border-[#E5E1EC] text-sm sm:text-base font-bold rounded-2xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-[#4A2270]" />
              <span>Ver cómo funciona</span>
            </motion.button>
          )}
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
            Qué sí ofrecemos en PAN
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
            Qué no ofrecemos en PAN
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

      {/* Alcance del prototipo.
          La ruta está construida sobre el SIS: los pasos, los establecimientos
          y las referencias son los del sistema público. Decirlo evita que una
          familia con seguro privado siga indicaciones que no le corresponden. */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white border border-[#E5E1EC] rounded-2xl p-5 sm:p-6 flex items-start gap-4 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#E9DFF5] flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5 text-[#4A2270]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-[16px] sm:text-lg font-bold text-[#2E2A33]">
              Hasta dónde llega esta versión
            </h2>
            <p className="text-[13.5px] text-[#6E6A75] leading-relaxed">
              La ruta de atención está definida sobre el{' '}
              <strong className="text-[#2E2A33]">SIS</strong>: los pasos, los
              establecimientos y las hojas de referencia son los del sistema público de
              salud. La atención en <strong className="text-[#2E2A33]">clínicas privadas
              y EPS</strong> todavía no está contemplada en este prototipo.
            </p>
            <p className="text-[12.5px] text-[#8A8594] leading-relaxed">
              Si tienes seguro privado, la orientación general sobre el neurodesarrollo
              te sirve igual, pero los pasos concretos para conseguir una cita no
              corresponden a tu cobertura.
            </p>
          </div>
        </div>
      </motion.section>

      {/* 5. RECORRIDO GUIADO.
          Aquí había un "video explicativo" que en realidad abría un cuadro con
          tres viñetas. En vez de un video que contase la plataforma, la
          plataforma se recorre sola: son los mismos dos minutos y se ve
          funcionando de verdad. */}
      {onIniciarDemo && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xl font-bold text-[#2E2A33]">Míralo funcionando</h2>
              <p className="text-xs text-[#6E6A75]">Dos minutos, sin escribir nada</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E9DFF5] text-[#4A2270] text-[11px] font-bold">
              Recorrido guiado
            </span>
          </div>

          <div className="rounded-3xl bg-[#E9DFF5] border border-[#D5CCE0] p-7 sm:p-9 relative overflow-hidden shadow-sm">
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#4A2270_1.5px,transparent_1.5px)] [background-size:20px_20px]" />

            <div className="relative z-10 max-w-xl space-y-5">
              <p className="text-[15px] text-[#2E2A33] leading-relaxed">
                La plataforma se recorre sola con una familia de ejemplo. Verás cómo se
                crea la cuenta, cómo sale el tamizaje, dónde le toca atenderse, qué pasa
                al volver de la primera cita y cómo responde el asistente.
              </p>

              <ol className="space-y-2 text-[13.5px] text-[#4A2270]">
                {[
                  'Avanza solo, paso a paso. Puedes pausarlo y retroceder cuando quieras.',
                  'Usa una cuenta de ejemplo: no toca tus datos ni tu avance.',
                  'Al salir, todo vuelve a quedar como estaba.',
                ].map((linea, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-white text-[#4A2270] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{linea}</span>
                  </li>
                ))}
              </ol>

              <button
                type="button"
                onClick={onIniciarDemo}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#4A2270] hover:bg-[#381559] text-white text-[15px] font-bold rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                <Play className="w-4.5 h-4.5 fill-white" />
                <span>Empezar el recorrido</span>
              </button>
            </div>
          </div>
        </motion.section>
      )}

      {/* 6. LA VISTA DEL PROFESIONAL.
          Existía y no se anunciaba en ningún sitio: había que llegar por el pie
          de página o escaneando el QR del informe. Es la mitad de la propuesta
          —que la familia no tenga que volver a contarlo todo— así que se
          explica aquí, donde se cuenta qué es PAN. */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-xl font-bold text-[#2E2A33]">
              Lo que ve el profesional de salud
            </h2>
            <p className="text-xs text-[#6E6A75]">
              El otro lado de la ruta: la consulta empieza con lo que ya contaste
            </p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#E6F2EC] text-[#2E7D5B] text-[11px] font-bold">
            Para pediatría y CRED
          </span>
        </div>

        <div className="bg-white border border-[#E5E1EC] rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
          <p className="text-[15px] text-[#2E2A33] leading-relaxed max-w-2xl">
            Cada caso tiene un código y un QR. Cuando el profesional lo abre, ve la
            bitácora completa: el tamizaje con sus respuestas, dónde se está atendiendo la
            familia, a qué especialidad la derivaron, qué la frenó y si está siguiendo el
            tratamiento indicado.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                titulo: 'No repetir lo ya contado',
                desc: 'El tamizaje llega hecho, con la fecha y las respuestas una por una.',
              },
              {
                titulo: 'Ver qué detuvo el caso',
                desc: 'Si no hubo cupos, si quedaba lejos o si no la atendieron, y cuándo.',
              },
              {
                titulo: 'Saber si el tratamiento se cumple',
                desc: 'Y el motivo cuando no: falta de stock, costo o efectos.',
              },
            ].map((item) => (
              <div
                key={item.titulo}
                className="p-4 rounded-xl bg-[#FAF8FD] border border-[#E5E1EC] space-y-1"
              >
                <h4 className="text-[13.5px] font-bold text-[#2E2A33] leading-snug">
                  {item.titulo}
                </h4>
                <p className="text-[12.5px] text-[#6E6A75] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {onAbrirVistaProfesional && (
            <button
              type="button"
              onClick={onAbrirVistaProfesional}
              className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-[#D5C6EB] hover:bg-[#FAF8FD] text-[#4A2270] text-[14px] font-bold rounded-xl transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Ver la bitácora de un caso de ejemplo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <p className="text-[12px] text-[#8A8594] leading-relaxed border-t border-[#F0EDF5] pt-4">
            La familia decide cuándo enseñarlo: el código y el QR están en su informe, y
            sin ellos no se puede abrir el caso.
          </p>
        </div>
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

    </div>
  );
};

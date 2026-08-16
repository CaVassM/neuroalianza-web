import React, { useState } from 'react';
import { UserProfile, InsuranceType, ScreenType, BarrierReport } from '../types';
import { DondeAtenderteSection } from '../components/DondeAtenderte/DondeAtenderteSection';
import { RastreadorFase } from '../components/PhaseTracker/RastreadorFase';
import { BotonSeguimientoWhatsApp } from '../components/BotonSeguimientoWhatsApp';
import { SeguimientoTratamiento } from '../components/PhaseTracker/SeguimientoTratamiento';
import { MONTHS, YEARS } from '../constants/data';
import { generateAndDownloadScreeningPDF } from '../utils/pdfGenerator';
import alternativasData from '../data/alternativas.json';
import {
  ClipboardList,
  Sparkles,
  Navigation,
  FileCheck2, 
  ShieldCheck, 
  CheckCircle2,
  MapPin,
  ArrowRight,
  Stethoscope,
  X,
  Download,
  AlertCircle,
  AlertTriangle,
  CalendarX,
  MapPinOff,
  Wallet,
  HelpCircle,
  FileText,
  Clock,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MiRutaViewProps {
  user: UserProfile;
  onUpdateUser?: (updated: UserProfile) => void;
  onNavigate?: (screen: ScreenType) => void;
}

type BarrierKey = 'sin_cupos' | 'muy_lejos' | 'costo' | 'no_atendieron';

export const MiRutaView: React.FC<MiRutaViewProps> = ({ user, onUpdateUser, onNavigate }) => {
  const [activeInsuranceTab, setActiveInsuranceTab] = useState<InsuranceType>(user.insurance || 'sis');
  const [copiedScript, setCopiedScript] = useState(false);
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Barrier modal & active filter state
  const [showBarrierModal, setShowBarrierModal] = useState(false);
  const [selectedBarrier, setSelectedBarrier] = useState<BarrierKey | null>(null);
  const [activeBarrierFilter, setActiveBarrierFilter] = useState<BarrierKey | null>(user.activeBarrierFilter || null);

  // Diagnosis modal form state
  const [profesional, setProfesional] = useState<'pediatra' | 'neurologo' | 'psiquiatra_infantil' | 'psicologo' | 'otro'>('neurologo');
  const [profesionalOtroTexto, setProfesionalOtroTexto] = useState('');
  const [diagMes, setDiagMes] = useState('Enero');
  const [diagAno, setDiagAno] = useState('2025');

  // Sin caer a Miraflores: si la familia no eligió distrito, hay que pedírselo,
  // no enseñarle los establecimientos de otro sitio como si fueran los suyos.
  // Para los textos se usa un genérico en vez de nombrar un distrito ajeno.
  const distritoRegistrado = user.location.district;
  const district = distritoRegistrado || 'tu distrito';
  const childName = user.child.nickname || 'tu hijo/a';
  const faseActual = user.fase || 1;

  // El tamizaje es lo que lleva de la fase 2 a la 3. Mientras no esté hecho,
  // la ruta no puede sugerir dónde atenderse: no hay resultado que llevar.
  const faltaTamizaje = !user.screeningResult && !user.diagnosis;

  // Check if user has a starting point (screening result, diagnosis, or phase >= 2)
  const hasStartingPoint = Boolean(
    user.screeningResult || user.diagnosis || (user.fase && user.fase >= 2)
  );

  const handleSaveDiagnosis = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        fase: 5,
        diagnosis: {
          profesional,
          profesionalOtroTexto: profesional === 'otro' ? profesionalOtroTexto : undefined,
          mes: diagMes,
          ano: diagAno,
          registradoAt: new Date().toISOString(),
        },
      });
    }
    setShowDiagnosisModal(false);
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloadingPdf(true);
      await generateAndDownloadScreeningPDF({
        caseCode: user.caseCode || 'NA-7K3M9',
        childAgeMonths: 20,
        district: user.location.district || 'No registrado',
        insurance: user.insurance || 'SIS',
        score: user.screeningResult?.score ?? 5,
        nivel: user.screeningResult?.nivel ?? 'moderada',
        answers: user.screeningAnswers,
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleSelectBarrier = (key: BarrierKey) => {
    setSelectedBarrier(key);
    setActiveBarrierFilter(key);
    
    // Register the barrier report event into the user profile with origen: familia
    const barrierInfo = alternativasData[key];
    const formattedDate = new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });

    const barrierNameMap: Record<BarrierKey, string> = {
      sin_cupos: 'sin cupos',
      muy_lejos: 'distancia / traslado',
      costo: 'costos',
      no_atendieron: 'atención no recibida',
    };

    const barrierLabel = barrierNameMap[key] || 'dificultad';

    const barrierReport: BarrierReport = {
      tipo: key,
      fecha: formattedDate,
      titulo: `Reportaste una barrera: ${barrierLabel}`,
      detalle: barrierInfo.pasos[0] || 'Se consultaron alternativas de atención.',
    };

    const newLogItem = {
      fecha: formattedDate,
      titulo: `⚠ Reportaste una barrera: ${barrierLabel}`,
      detalle: barrierInfo.pasos[0] || 'Se registraron alternativas de orientación.',
      tipo: 'barrera' as const,
      origen: 'familia' as const,
    };

    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        barrierReport,
        activeBarrierFilter: key,
        registros: [...(user.registros || []), newLogItem],
      });
    }
  };

  const handleBarrierAction = (destino: string) => {
    setShowBarrierModal(false);
    if (selectedBarrier) {
      setActiveBarrierFilter(selectedBarrier);
    }

    const mapElem = document.getElementById('seccion-donde-atenderte');
    if (mapElem) {
      mapElem.scrollIntoView({ behavior: 'smooth' });
    }

    if (destino === 'evaluaciones' && onNavigate) {
      onNavigate('evaluaciones');
    } else if (destino === 'mi-ruta') {
      setActiveInsuranceTab('none');
    }
  };

  const barrierOptions: Array<{
    key: BarrierKey;
    icon: React.ReactNode;
    title: string;
    description: string;
  }> = [
    {
      key: 'sin_cupos',
      icon: <CalendarX className="w-5 h-5 text-[#C77700]" />,
      title: 'No había cupos ni citas disponibles',
      description: 'No encontré fechas de atención próximas en mi centro de salud asignado.',
    },
    {
      key: 'muy_lejos',
      icon: <MapPinOff className="w-5 h-5 text-[#C77700]" />,
      title: 'Me queda muy lejos o no puedo trasladarme',
      description: 'El establecimiento asignado está a mucha distancia o el transporte es complejo.',
    },
    {
      key: 'costo',
      icon: <Wallet className="w-5 h-5 text-[#C77700]" />,
      title: 'No puedo cubrir el costo',
      description: 'No cuento con cobertura de seguro activa o me preocupa el costo de consultas.',
    },
    {
      key: 'no_atendieron',
      icon: <HelpCircle className="w-5 h-5 text-[#C77700]" />,
      title: 'Fui pero no me atendieron o me derivaron a otro lado',
      description: 'Hubo inconvenientes en ventanilla, falta de personal o dudas con la referencia.',
    },
  ];

  const routeDetails = {
    sis: {
      name: 'SIS (Seguro Integral de Salud)',
      step1Title: 'Paso 1: Acude a tu Puesto o Centro de Salud (I-1 a I-4)',
      step1Desc: `Ve a la posta médica asignada a tu domicilio en ${district}. Solicita una cita de CRED (Control de Crecimiento y Desarrollo) o Pediatría.`,
      step2Title: 'Paso 2: Solicita el Tamizaje y la Hoja de Referencia',
      step2Desc: 'Explica con calma las conductas que has observado. Si el médico o enfermera identifica señales de alerta, te emitirá la hoja de referencia.',
      step3Title: 'Paso 3: Centro de Salud Mental Comunitario (CSMC) u Hospital de Nivel II/III',
      step3Desc: `Con la hoja de referencia, acude al CSMC de tu zona o a un hospital con neuropediatría (como el Instituto Nacional de Salud del Niño - Breña o San Borja).`,
      tips: [
        'Lleva el DNI de tu hijo/a y tu DNI.',
        'Lleva el carné de vacunación y CRED.',
        'La atención en los CSMC del MINSA está cubierta por el SIS. Confirma el alcance al momento de tu cita.',
      ]
    },
    essalud: {
      name: 'EsSalud (Seguro Social)',
      step1Title: 'Paso 1: Solicita cita de Medicina General o Pediatría en tu Policlínico',
      step1Desc: `Llama a EsSalud en Línea (01 411-8000) o acude al Policlínico / Centro Médico adscrito a tu DNI en ${district}.`,
      step2Title: 'Paso 2: Evaluación y Orden de Interconsulta',
      step2Desc: 'En la consulta, describe tus observaciones. Solicita al médico una orden de interconsulta a Neuropediatría, Psiquiatría Infantil o Medicina Física y Rehabilitación.',
      step3Title: 'Paso 3: Hospital Nivel III / Centro de Rehabilitación',
      step3Desc: 'Gestiona la cita en el hospital correspondiente (ej. Hospital Rebagliati, Almenara o Sabogal) para la evaluación multidisciplinaria.',
      tips: [
        'Verifica que tu seguro esté activo en EsSalud acreditación web.',
        'Si no hay citas próximas, pide que registren tu solicitud como preferente para desarrollo infantil.',
      ]
    },
    eps: {
      name: 'Seguro Privado o EPS',
      step1Title: 'Paso 1: Consulta con Pediatra de tu Red de Clínicas',
      step1Desc: `Agenda una cita con un Pediatra en la clínica de tu plan de salud más cercana en ${district}.`,
      step2Title: 'Paso 2: Derivación a Neurología Pediátrica',
      step2Desc: 'El pediatra evaluará los hitos del desarrollo y te dará una orden para Neuropediatría o Psicología Infantil con cobertura de tu póliza.',
      step3Title: 'Paso 3: Evaluación y Centro de Terapias',
      step3Desc: 'Consulta con tu aseguradora qué centros de estimulación temprana o terapia tienen convenio o reembolso.',
      tips: [
        'Revisa el deducible y copago de consultas especializadas.',
        'Solicita al médico un informe detallado para presentar a tu aseguradora.',
      ]
    },
    none: {
      name: 'Sin seguro / Asesoría de afiliación',
      step1Title: 'Paso 1: Afiliación gratuita al SIS Para Todos',
      step1Desc: 'En el Perú, toda persona que no cuenta con otro seguro tiene derecho a afiliarse al SIS gratuito con su DNI desde la app "SIS: Asegúrate e infórmate" o en cualquier posta.',
      step2Title: 'Paso 2: Consulta en Centro de Salud MINSA',
      step2Desc: `Una vez activo el SIS, acude al centro de salud de ${district} para tu evaluación inicial sin costo.`,
      step3Title: 'Paso 3: Acceso a la Red de Salud Mental Comunitaria',
      step3Desc: 'Los Centros de Salud Mental Comunitarios (CSMC) atienden a toda la comunidad sin costo para usuarios del SIS.',
      tips: [
        'Puedes consultar tu estado de afiliación en app.sis.gob.pe.',
        'La afiliación de recién nacidos y niños menores es inmediata.',
      ]
    }
  }[activeInsuranceTab];

  const scriptText = `Buenas tardes doctor/a. Vengo a la consulta porque he estado observando algunas conductas en el desarrollo y la comunicación de ${childName} que me gustaría que revisemos juntos. Completé una guía de tamizaje y quisiera su opinión profesional sobre si corresponde una evaluación más especializada o una referencia.`;

  const copyScript = () => {
    navigator.clipboard.writeText(scriptText);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  // 1. EMPTY STATE IF NO STARTING POINT
  if (!hasStartingPoint) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 animate-in fade-in duration-300 flex flex-col items-center justify-center">
        <div className="w-full max-w-[560px] bg-white rounded-3xl border border-[#E5E1EC] p-8 sm:p-12 text-center shadow-md space-y-6">
          <div className="w-20 h-20 rounded-full bg-[#E9DFF5] text-[#4A2270] flex items-center justify-center mx-auto shadow-xs">
            <MapPin className="w-10 h-10 stroke-[2.2]" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-[28px] font-fraunces font-bold text-[#2E2A33] leading-tight">
              Aún no tenemos tu punto de partida
            </h2>
            <p className="text-[15px] sm:text-[16px] text-[#6E6A75] leading-relaxed">
              Para armar tu ruta necesitamos saber en qué momento estás.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => onNavigate && onNavigate('cuestionario')}
              className="w-full py-4 px-6 bg-[#4A2270] hover:bg-[#381559] text-white text-base font-bold rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-3 cursor-pointer group"
            >
              <span>Aplicar tamizaje de desarrollo (M-CHAT-R/F)</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setShowDiagnosisModal(true)}
              className="w-full py-3.5 px-6 bg-white hover:bg-[#F7F5FA] text-[#4A2270] border border-[#E5E1EC] hover:border-[#4A2270] text-sm font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Stethoscope className="w-4 h-4 text-[#6B3FA0]" />
              <span>Ya tengo un diagnóstico médico</span>
            </button>
          </div>
        </div>

        {/* Diagnosis Modal */}
        <AnimatePresence>
          {showDiagnosisModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white rounded-3xl border border-[#E5E1EC] p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-fraunces font-bold text-[#2E2A33]">
                    Registrar diagnóstico médico
                  </h3>
                  <button
                    onClick={() => setShowDiagnosisModal(false)}
                    className="p-1 rounded-full text-[#6E6A75] hover:bg-[#F7F5FA] cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveDiagnosis} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2E2A33] mb-1.5">
                      ¿Qué profesional emitió el diagnóstico?
                    </label>
                    <select
                      value={profesional}
                      onChange={(e) => setProfesional(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E1EC] text-sm focus:outline-none focus:ring-2 focus:ring-[#4A2270]"
                    >
                      {/* Solo estas dos especialidades emiten el diagnóstico de
                          TEA en la ruta peruana. El pediatra y el psicólogo
                          participan en la evaluación, pero no lo confirman, y
                          ofrecerlos aquí llevaba a registrar como diagnóstico
                          algo que todavía no lo es. */}
                      <option value="neurologo">Neuropediatra</option>
                      <option value="psiquiatra_infantil">Psiquiatra pediátrico</option>
                      <option value="otro">Otro especialista</option>
                    </select>
                  </div>

                  {profesional === 'otro' && (
                    <div>
                      <label className="block text-xs font-semibold text-[#2E2A33] mb-1.5">
                        Especifica la especialidad
                      </label>
                      <input
                        type="text"
                        required
                        value={profesionalOtroTexto}
                        onChange={(e) => setProfesionalOtroTexto(e.target.value)}
                        placeholder="Ej. Genetista, Terapeuta de desarrollo"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E1EC] text-sm focus:outline-none focus:ring-2 focus:ring-[#4A2270]"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#2E2A33] mb-1.5">
                        Mes
                      </label>
                      <select
                        value={diagMes}
                        onChange={(e) => setDiagMes(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E1EC] text-sm focus:outline-none focus:ring-2 focus:ring-[#4A2270]"
                      >
                        {MONTHS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2E2A33] mb-1.5">
                        Año
                      </label>
                      <select
                        value={diagAno}
                        onChange={(e) => setDiagAno(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E1EC] text-sm focus:outline-none focus:ring-2 focus:ring-[#4A2270]"
                      >
                        {YEARS.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowDiagnosisModal(false)}
                      className="flex-1 py-3 px-4 rounded-xl border border-[#E5E1EC] text-sm font-semibold text-[#6E6A75] hover:bg-[#F7F5FA] cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 px-4 rounded-xl bg-[#4A2270] hover:bg-[#381559] text-white text-sm font-bold shadow-xs cursor-pointer"
                    >
                      Guardar y continuar
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // 2. FULL ROADMAP VIEW WHEN POINT OF DEPARTURE EXISTS
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 animate-in fade-in duration-300">
      
      {/* 0. RASTREADOR DE FASE (6 FASES) & PDF DOWNLOAD STRIP */}
      <div className="space-y-4">
        {/* PDF Download Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E1EC] shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E9DFF5] flex items-center justify-center text-[#4A2270] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#2E2A33]">Documento oficial para tu cita</h4>
              <p className="text-xs text-[#6E6A75]">Descarga tu reporte en PDF con código QR para que el profesional consulte el tamizaje</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={downloadingPdf}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#4A2270] hover:bg-[#381559] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{downloadingPdf ? 'Generando...' : 'Descargar PDF con QR'}</span>
            </button>
          </div>
        </div>

        {/* 6-Phase Tracker */}
        <RastreadorFase user={user} onUpdateUser={onUpdateUser} />
      </div>

      {/* Fase 5: el asistente acaba de desbloquearse y es lo que más ayuda
          ahora, así que el aviso va arriba del todo, no al final de la página
          donde había que bajar para encontrarlo. */}
      {faseActual >= 5 && (
        <div className="bg-[#F4EFFB] border border-[#D5CCE0] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E9DFF5] flex items-center justify-center shrink-0">
              <Sparkles className="w-4.5 h-4.5 text-[#4A2270]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-[15px] font-bold text-[#4A2270]">
                Ahora tus dudas las resuelve el asistente
              </h3>
              <p className="text-[13px] text-[#2E2A33] leading-relaxed max-w-xl">
                Con el diagnóstico registrado se habilitó{' '}
                <strong>Información para familias</strong>: una biblioteca de temas y un
                asistente que responde con documentos verificados y te muestra de dónde
                sacó cada respuesta. Es el mejor sitio para lo que viene ahora.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate?.('familias')}
            className="w-full sm:w-auto shrink-0 px-6 py-3 bg-[#4A2270] hover:bg-[#381559] text-white text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Ir a información para familias</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Fase 6: la ruta ya no avanza más, así que lo que toca es sostener. */}
      {faseActual === 6 && (
        <SeguimientoTratamiento user={user} onUpdateUser={onUpdateUser} />
      )}

      {/* Siguiente paso cuando la ruta aún no puede arrancar.
          En fase 2 la familia ya tiene su caso pero no un resultado que llevar
          a la consulta, así que mostrarle establecimientos sería adelantarse. */}
      {faltaTamizaje && (
        <div className="bg-[#FDF1DF] border border-[#FBE0B8] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FBE0B8] flex items-center justify-center shrink-0">
              <ClipboardList className="w-4.5 h-4.5 text-[#C77700]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-[15px] font-bold text-[#C77700]">
                Tu siguiente paso es el tamizaje
              </h3>
              <p className="text-[13px] text-[#9E5D00] leading-relaxed max-w-xl">
                Son 20 preguntas y toma unos 5 minutos. Su resultado es lo que llevarás a
                la consulta, y es lo que abre la <strong>fase 3</strong> para mostrarte
                dónde acudir según tu distrito y tu seguro.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate?.('evaluaciones')}
            className="w-full sm:w-auto shrink-0 px-6 py-3 bg-[#4A2270] hover:bg-[#381559] text-white text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Hacer el tamizaje</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sin distrito no se puede armar la ruta de atención. */}
      {!distritoRegistrado && (
        <div className="bg-white border border-[#E5E1EC] rounded-2xl p-5 flex items-start gap-3">
          <MapPin className="w-4.5 h-4.5 text-[#6E6A75] shrink-0 mt-0.5" />
          <p className="text-[13px] text-[#6E6A75] leading-relaxed">
            Aún no registraste tu distrito. Lo necesitamos para mostrarte los
            establecimientos de salud más cercanos.
          </p>
        </div>
      )}

      {/* 1. SECCIÓN DÓNDE ATENDERTE CON MAPA 65%, LISTADO LATERAL 35% Y FICHA DE SERVICIO */}
      <div id="seccion-donde-atenderte">
        <DondeAtenderteSection
          user={user}
          onUpdateUser={onUpdateUser}
          activeBarrierFilter={activeBarrierFilter}
          onClearBarrierFilter={() => {
            setActiveBarrierFilter(null);
            if (onUpdateUser) {
              onUpdateUser({
                ...user,
                activeBarrierFilter: null,
              });
            }
          }}
        />
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-[#E5E1EC]" />

      {/* 2. SECCIÓN PASO A PASO POR TIPO DE SEGURO */}
      <section className="space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9DFF5] text-xs font-semibold text-[#4A2270]">
            <Navigation className="w-3.5 h-3.5" />
            <span>Paso a paso según tu seguro</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-fraunces font-bold text-[#2E2A33]">
            Tu camino de atención médica en {district}
          </h2>
          <p className="text-sm text-[#6E6A75]">
            Conoce cómo tramitar citas, referencias e interconsultas según tu aseguradora en el Perú.
          </p>
        </div>

        {/* Insurance Selection Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-[#EFEAF5]/60 rounded-2xl border border-[#E5E1EC] overflow-x-auto">
          {[
            { id: 'sis', label: 'SIS (MINSA)' },
            { id: 'essalud', label: 'EsSalud' },
            { id: 'eps', label: 'Seguro Privado / EPS' },
            { id: 'none', label: 'Sin seguro' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveInsuranceTab(tab.id as InsuranceType)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeInsuranceTab === tab.id
                  ? 'bg-white text-[#4A2270] shadow-xs'
                  : 'text-[#6E6A75] hover:text-[#2E2A33]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Roadmap Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl border border-[#E5E1EC] p-6 space-y-3 shadow-2xs relative overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#E9DFF5] text-[#4A2270] text-xs font-bold flex items-center justify-center">
              1
            </div>
            <h3 className="text-base font-bold text-[#2E2A33]">{routeDetails.step1Title}</h3>
            <p className="text-xs sm:text-[13px] text-[#6E6A75] leading-relaxed">{routeDetails.step1Desc}</p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl border border-[#E5E1EC] p-6 space-y-3 shadow-2xs relative overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#E9DFF5] text-[#4A2270] text-xs font-bold flex items-center justify-center">
              2
            </div>
            <h3 className="text-base font-bold text-[#2E2A33]">{routeDetails.step2Title}</h3>
            <p className="text-xs sm:text-[13px] text-[#6E6A75] leading-relaxed">{routeDetails.step2Desc}</p>
          </div>

          {/* Paso 3: las recomendaciones.
              Antes este hueco lo ocupaba el destino final de la derivación
              (CSMC / hospital) y las recomendaciones iban sueltas debajo. Se
              invirtió: lo accionable para la familia es qué llevar y qué pedir
              en la cita, no el nombre del hospital al que quizá llegue meses
              después. */}
          <div className="bg-[#FAF8FD] rounded-2xl border border-[#D5CCE0] p-6 space-y-3 shadow-2xs relative overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#4A2270] text-white text-xs font-bold flex items-center justify-center">
              3
            </div>
            <h3 className="text-base font-bold text-[#2E2A33] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#4A2270] shrink-0" />
              <span>Recomendaciones para tu cita</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-[13px] text-[#2E2A33]">
              {routeDetails.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#6B3FA0] font-bold leading-none mt-0.5">•</span>
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SEGUIMIENTO POR WHATSAPP.
          Va después de la ruta: primero la familia ve qué sigue, y recién
          entonces tiene sentido ofrecerle llevarse el enlace al celular. */}
      <div className="bg-white rounded-2xl border border-[#E5E1EC] p-6 sm:p-8 space-y-4 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-[#2E2A33]">
            Lleva tu ruta en el celular
          </h3>
          <p className="text-xs sm:text-[13px] text-[#6E6A75] leading-relaxed mt-1">
            Te mandamos un enlace por WhatsApp para retomar tu ruta cuando quieras y
            contarnos cómo te fue.
          </p>
        </div>
        <BotonSeguimientoWhatsApp user={user} onUpdateUser={onUpdateUser} />
      </div>

      {/* 3. GUIÓN PARA HABLAR CON EL MÉDICO */}
      <div className="bg-white rounded-2xl border border-[#E5E1EC] p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E9DFF5] flex items-center justify-center">
              <FileCheck2 className="w-4.5 h-4.5 text-[#4A2270]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2E2A33]">Guión para hablar con el médico</h3>
              <p className="text-xs text-[#6E6A75]">Para que expreses con claridad tus observaciones en consulta</p>
            </div>
          </div>

          <button
            type="button"
            onClick={copyScript}
            className="text-xs font-semibold text-[#4A2270] hover:text-[#3B195C] px-3.5 py-2 rounded-xl bg-[#E9DFF5]/60 hover:bg-[#E9DFF5] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            {copiedScript ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D5B]" />
                <span className="text-[#2E7D5B] font-bold">¡Copiado!</span>
              </>
            ) : (
              <>
                <span>Copiar texto</span>
              </>
            )}
          </button>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-[#FAF8FD] border border-[#E5E1EC] text-xs sm:text-sm text-[#2E2A33] italic leading-relaxed">
          "{scriptText}"
        </div>
      </div>

      {/* 4. PLAN B ANTE UNA BARRERA */}
      <section className="bg-white rounded-2xl border-2 border-[#C77700]/30 hover:border-[#C77700]/60 p-6 sm:p-8 space-y-4 shadow-xs transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF1DF] text-xs font-bold text-[#C77700]">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Plan B de orientación</span>
            </div>
            <h3 className="text-xl font-fraunces font-bold text-[#2E2A33]">
              ¿No pudiste avanzar?
            </h3>
            <p className="text-xs sm:text-sm text-[#6E6A75] leading-relaxed">
              Cuéntanos qué pasó y buscamos otra opción contigo.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedBarrier(null);
              setShowBarrierModal(true);
            }}
            className="px-5 py-3 bg-[#FDF1DF] hover:bg-[#FCE7C8] text-[#C77700] border border-[#F6DCB6] hover:border-[#C77700] text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-2xs"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Reportar una barrera</span>
          </button>
        </div>

        {user.barrierReport && (
          <div className="mt-2 p-3.5 bg-[#FAF8FD] rounded-xl border border-[#E5E1EC] flex items-start gap-2.5 text-xs text-[#6E6A75]">
            <CheckCircle2 className="w-4 h-4 text-[#2E7D5B] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#2E2A33]">Último reporte registrado ({user.barrierReport.fecha}):</span> {user.barrierReport.titulo}.
            </div>
          </div>
        )}
      </section>

      {/* MODAL PLAN B ANTE UNA BARRERA */}
      <AnimatePresence>
        {showBarrierModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-[#E5E1EC] p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 my-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#FDF1DF] text-[#C77700] flex items-center justify-center">
                    <AlertTriangle className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-xl font-fraunces font-bold text-[#2E2A33]">
                    {selectedBarrier ? 'Alternativas de orientación' : '¿Qué dificultad tuviste para avanzar?'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBarrierModal(false)}
                  className="p-1 rounded-full text-[#6E6A75] hover:bg-[#F7F5FA] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step 1: Choose barrier */}
              {!selectedBarrier ? (
                <div className="space-y-3">
                  <p className="text-xs text-[#6E6A75]">
                    Selecciona el motivo que describe mejor la situación para darte alternativas concretas:
                  </p>

                  <div className="grid grid-cols-1 gap-2.5">
                    {barrierOptions.map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleSelectBarrier(opt.key)}
                        className="w-full p-4 rounded-2xl border border-[#E5E1EC] hover:border-[#C77700] bg-[#FAF8FD] hover:bg-[#FDF1DF]/40 text-left transition-all flex items-start gap-3.5 group cursor-pointer"
                      >
                        <div className="p-2 rounded-xl bg-white border border-[#E5E1EC] group-hover:border-[#C77700]/40 shrink-0">
                          {opt.icon}
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-bold text-[#2E2A33] group-hover:text-[#C77700] transition-colors">
                            {opt.title}
                          </h4>
                          <p className="text-xs text-[#6E6A75] leading-relaxed">
                            {opt.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Step 2: Show alternative steps from alternativas.json */
                <div className="space-y-5">
                  <div className="bg-[#FDF1DF] border border-[#F6DCB6] p-4 rounded-2xl space-y-1">
                    <span className="text-[11px] font-bold tracking-wider text-[#C77700] uppercase block">
                      Alternativa recomendada
                    </span>
                    <h4 className="text-base font-bold text-[#2E2A33]">
                      {alternativasData[selectedBarrier].titulo}
                    </h4>
                  </div>

                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6E6A75] block">
                      Pasos sugeridos:
                    </span>

                    <ul className="space-y-2.5">
                      {alternativasData[selectedBarrier].pasos.map((paso, idx) => (
                        <li 
                          key={idx} 
                          className="bg-[#FAF8FD] p-3.5 rounded-xl border border-[#E5E1EC] text-xs sm:text-[13px] text-[#2E2A33] flex items-start gap-3 leading-relaxed"
                        >
                          <span className="w-5 h-5 rounded-full bg-[#E9DFF5] text-[#4A2270] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{paso}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedBarrier(null)}
                      className="w-full sm:w-auto px-4 py-3 rounded-xl border border-[#E5E1EC] text-xs font-bold text-[#6E6A75] hover:bg-[#F7F5FA] cursor-pointer"
                    >
                      Ver otra dificultad
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBarrierAction(alternativasData[selectedBarrier].accion.destino)}
                      className="flex-1 py-3 px-5 rounded-xl bg-[#4A2270] hover:bg-[#381559] text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>{alternativasData[selectedBarrier].accion.texto}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

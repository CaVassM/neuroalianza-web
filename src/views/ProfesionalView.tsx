import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { CaseData, CasePhase, UserProfile } from '../types';
import { getCaseByCode } from '../data/casosDemo';
import { Logo } from '../components/Logo';
import { RastreadorCompacto } from '../components/PhaseTracker/RastreadorCompacto';
import { generateAndDownloadScreeningPDF } from '../utils/pdfGenerator';
import instrumento from '../data/instrumento.json';
import { 
  Download, 
  ArrowLeft, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Info, 
  QrCode, 
  Stethoscope, 
  ChevronDown,
  ChevronUp,
  Search,
  AlertCircle
} from 'lucide-react';

interface ProfesionalViewProps {
  code?: string;
  currentUserState?: UserProfile;
  onUpdateUser?: (updated: UserProfile) => void;
  onBackToApp?: () => void;
}

export const ProfesionalView: React.FC<ProfesionalViewProps> = ({
  code: initialCode = 'NA-7K3M9',
  currentUserState,
  onUpdateUser,
  onBackToApp,
}) => {
  const [currentCode, setCurrentCode] = useState(initialCode);
  const [inputCode, setInputCode] = useState(initialCode);
  const [filterRiskOnly, setFilterRiskOnly] = useState(false);
  const [showFullTable, setShowFullTable] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Professional action form state
  const [selectedAtencionType, setSelectedAtencionType] = useState<'tamizaje' | 'referencia' | 'diagnostico'>('referencia');
  const [establecimientoNombre, setEstablecimientoNombre] = useState('CS Miraflores');
  const [profesionalNotas, setProfesionalNotas] = useState('');
  const [registeredSuccessMsg, setRegisteredSuccessMsg] = useState<string | null>(null);

  // Fetch case data dynamically based on currentCode
  const caseData: CaseData | null = getCaseByCode(currentCode, currentUserState);

  // Sync currentCode if prop changes
  useEffect(() => {
    setCurrentCode(initialCode);
    setInputCode(initialCode);
  }, [initialCode]);

  // Generate QR Code URL
  useEffect(() => {
    if (!caseData) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://PAN.pe';
    const caseUrl = `${origin}/caso/${currentCode}`;
    QRCode.toDataURL(caseUrl, {
      margin: 1,
      width: 180,
      color: { dark: '#4A2270', light: '#FFFFFF' },
    })
      .then(setQrDataUrl)
      .catch((err) => console.error('Error generating QR:', err));
  }, [currentCode, caseData]);

  const handleSearchCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      setCurrentCode(inputCode.trim().toUpperCase());
    }
  };

  // Not Found State if Invalid Code with retry form
  if (!caseData) {
    return (
      <div className="min-h-screen w-full bg-[#F7F5FA] flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-[500px] bg-white rounded-3xl border border-[#E5E1EC] p-8 sm:p-10 text-center shadow-md space-y-6">
          <div className="flex justify-center">
            <Logo size="md" />
          </div>

          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
            <AlertCircle className="w-8 h-8 stroke-[1.8]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-fraunces font-bold text-[#2E2A33]">
              No encontramos un caso registrado con ese código
            </h2>
            <p className="text-sm text-[#6E6A75] leading-relaxed">
              El código ingresado (<span className="font-mono font-bold text-[#4A2270]">{currentCode}</span>) no existe o venció. Puedes probar con los códigos de demostración: <span className="font-mono font-bold">NA-7K3M9</span>, <span className="font-mono font-bold">NA-8P2Q4</span> o <span className="font-mono font-bold">NA-3X9Y1</span>.
            </p>
          </div>

          <form onSubmit={handleSearchCodeSubmit} className="space-y-3 pt-2">
            <div className="relative">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="Ingresa un código (ej. NA-7K3M9)"
                className="w-full px-4 py-3 bg-[#F7F5FA] border border-[#E5E1EC] rounded-xl font-mono text-sm uppercase text-[#2E2A33] placeholder-[#A09CA8] focus:ring-2 focus:ring-[#4A2270] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-6 bg-[#4A2270] hover:bg-[#381559] text-white text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Buscar caso</span>
            </button>
          </form>

          <div className="pt-2 border-t border-[#F0EDF5]">
            <button
              type="button"
              onClick={() => {
                if (onBackToApp) onBackToApp();
                else window.location.href = '/';
              }}
              className="text-xs font-bold text-[#6E6A75] hover:text-[#4A2270] transition-colors cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a la aplicación general</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { instrumento: inst, registros } = caseData;
  const score = inst.score;
  const rawNivel = inst.nivel;
  const nivel = rawNivel === 'bajo' ? 'baja' : rawNivel === 'medio' ? 'moderada' : rawNivel === 'alto' ? 'alta' : rawNivel;

  const circleStyle =
    nivel === 'baja'
      ? 'bg-[#E6F2EC] text-[#2E7D5B]'
      : nivel === 'moderada'
      ? 'bg-[#FDF1DF] text-[#C77700]'
      : 'bg-[#F3EDF9] text-[#4A2270]';

  const trackerUserProfile: UserProfile = {
    name: 'Familiar',
    email: '',
    child: {
      nickname: 'Menor evaluado/a',
      birthMonth: 'Diciembre',
      birthYear: '2024',
      avatarId: 'cat',
    },
    location: {
      department: 'Lima',
      province: 'Lima',
      district: caseData.district,
    },
    insurance: caseData.insurance,
    fase: caseData.fase,
    screeningResult: {
      score: caseData.instrumento.score,
      nivel: caseData.instrumento.nivel,
    },
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloadingPdf(true);
      await generateAndDownloadScreeningPDF({
        caseCode: caseData.codigo,
        childAgeMonths: caseData.childAgeMonths,
        district: caseData.district,
        insurance: caseData.insurance,
        score,
        nivel,
        answers: inst.respuestas,
      });
    } catch (err) {
      console.error('Error downloading PDF:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleRegisterAtencion = (e: React.FormEvent) => {
    e.preventDefault();

    let targetPhase: CasePhase = caseData?.fase || 1;
    let actionTitle = '';

    // Math.max devuelve number, y CasePhase es una unión de literales 1..6.
    // El cast es seguro porque ambos operandos ya son fases válidas.
    const avanzarHasta = (minima: CasePhase): CasePhase =>
      Math.max(targetPhase, minima) as CasePhase;

    if (selectedAtencionType === 'tamizaje') {
      targetPhase = avanzarHasta(2);
      actionTitle = 'Apliqué la entrevista o ficha de despistaje (Tamizaje)';
    } else if (selectedAtencionType === 'referencia') {
      targetPhase = avanzarHasta(4);
      actionTitle = 'Emití una hoja de referencia a servicio especializado';
    } else if (selectedAtencionType === 'diagnostico') {
      targetPhase = avanzarHasta(5);
      actionTitle = 'Se emitió un diagnóstico o informe definitivo';
    }

    const formattedDate = new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });

    const newLogItem = {
      fecha: formattedDate,
      titulo: `Atención registrada por profesional: ${actionTitle}`,
      detalle: `Establecimiento: ${establecimientoNombre}${profesionalNotas ? ` | Nota: ${profesionalNotas}` : ''}`,
      tipo: 'fase' as const,
      origen: 'profesional' as const,
      faseNum: targetPhase,
      establecimientoNombre,
    };

    if (onUpdateUser && currentUserState) {
      const updatedUser: UserProfile = {
        ...currentUserState,
        fase: Math.max(currentUserState.fase || 1, targetPhase),
        registros: [...(currentUserState.registros || []), newLogItem],
      };
      onUpdateUser(updatedUser);
    }

    setRegisteredSuccessMsg(`Atención registrada con éxito. El caso avanzó a la Fase ${targetPhase}.`);
    setProfesionalNotas('');
    setTimeout(() => {
      setRegisteredSuccessMsg(null);
    }, 5000);
  };

  const riskItems = instrumento.items.filter((item) => {
    const ans = inst.respuestas[item.n] || 'si';
    const isInverted = instrumento.invertidos.includes(item.n);
    return (isInverted && ans === 'si') || (!isInverted && ans === 'no');
  });

  const displayItems = filterRiskOnly ? riskItems : instrumento.items;

  return (
    <div className="min-h-screen w-full bg-[#F7F5FA] text-[#2E2A33] font-sans pb-16 pt-6 px-4 sm:px-6">
      <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
        
        {/* Top Header Bar */}
        <header className="bg-white rounded-2xl border border-[#E5E1EC] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div 
              onClick={() => onBackToApp && onBackToApp()} 
              className="cursor-pointer hover:opacity-80 transition-opacity"
              title="Volver a la aplicación"
            >
              <Logo size="sm" />
            </div>
            <div className="h-5 w-px bg-[#E5E1EC] hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D5B]" />
              <span className="text-xs font-bold text-[#4A2270]">
                Vista clínica oficial (Solo lectura)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {onBackToApp && (
              <button
                type="button"
                onClick={onBackToApp}
                className="flex-1 sm:flex-initial px-4 py-2 bg-[#F7F5FA] hover:bg-[#E9DFF5]/50 border border-[#E5E1EC] text-[#4A2270] text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a la app</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={downloadingPdf}
              className="flex-1 sm:flex-initial px-4 py-2 bg-[#4A2270] hover:bg-[#381559] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadingPdf ? 'Generando PDF...' : 'Descargar PDF con QR'}</span>
            </button>
          </div>
        </header>

        {/* Clinical Identification Card */}
        <section className="bg-white rounded-2xl border border-[#E5E1EC] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#F0EDF5] pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6E6A75]">
                  Informe de caso clínico de desarrollo
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#E9DFF5] text-[#4A2270] text-[11px] font-bold border border-[#D5C6EB]">
                  Verificado NTS N° 238-MINSA
                </span>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <h1 className="text-3xl sm:text-4xl font-mono font-bold text-[#4A2270] tracking-wider">
                  {caseData.codigo}
                </h1>
              </div>

              <p className="text-xs text-[#8E8A95] pt-1 leading-relaxed max-w-xl">
                Código anónimo que resguarda la identidad del menor. Corresponde la filiación presencial con el DNI o carné de vacunación CRED.
              </p>
            </div>

            {/* Quick Score Highlight Box */}
            <div className="flex items-center gap-4 bg-[#FAF8FD] border border-[#E5E1EC] p-4 rounded-2xl shrink-0">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-fraunces font-bold text-2xl ${circleStyle}`}>
                {score}
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E6A75] block">
                  Resultado M-CHAT-R/F
                </span>
                <span className="text-sm font-bold text-[#2E2A33] block">
                  Probabilidad {nivel} ({score}/20)
                </span>
                <span className="text-[11px] text-[#6E6A75] block">
                  {inst.fecha}
                </span>
              </div>
            </div>
          </div>

          {/* Structured Patient Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#FAF8FD] p-3.5 rounded-xl border border-[#E5E1EC] space-y-0.5">
              <span className="text-[10px] font-bold tracking-wider text-[#6E6A75] uppercase block">
                EDAD DEL MENOR
              </span>
              <span className="text-sm sm:text-base font-bold text-[#2E2A33]">
                {caseData.childAgeMonths} meses
              </span>
            </div>

            <div className="bg-[#FAF8FD] p-3.5 rounded-xl border border-[#E5E1EC] space-y-0.5">
              <span className="text-[10px] font-bold tracking-wider text-[#6E6A75] uppercase block">
                DISTRITO / RESIDENCIA
              </span>
              <span className="text-sm sm:text-base font-bold text-[#2E2A33] truncate block">
                {caseData.district}
              </span>
            </div>

            <div className="bg-[#FAF8FD] p-3.5 rounded-xl border border-[#E5E1EC] space-y-0.5">
              <span className="text-[10px] font-bold tracking-wider text-[#6E6A75] uppercase block">
                SEGURO DE SALUD
              </span>
              <span className="text-sm sm:text-base font-bold text-[#2E2A33] uppercase block">
                {caseData.insurance}
              </span>
            </div>

            <div className="bg-[#FAF8FD] p-3.5 rounded-xl border border-[#E5E1EC] space-y-0.5">
              <span className="text-[10px] font-bold tracking-wider text-[#6E6A75] uppercase block">
                FECHA DE REGISTRO
              </span>
              <span className="text-sm sm:text-base font-bold text-[#2E2A33] block">
                {inst.fecha}
              </span>
            </div>
          </div>
        </section>

        {/* 2-Column Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6 items-start">
          <div className="space-y-6">
            {/* Section 1: Tamizaje M-CHAT-R/F Details */}
            <section className="bg-white rounded-2xl border border-[#E5E1EC] p-6 sm:p-7 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0EDF5] pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E9DFF5] text-[11px] font-semibold text-[#4A2270] mb-1">
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Instrumento oficial MINSA</span>
                  </div>
                  <h2 className="text-xl font-fraunces font-bold text-[#2E2A33]">
                    {inst.nombre}
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-[#F7F5FA] rounded-xl border border-[#E5E1EC]">
                  <button
                    type="button"
                    onClick={() => setFilterRiskOnly(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      !filterRiskOnly ? 'bg-[#4A2270] text-white shadow-2xs' : 'text-[#6E6A75] hover:text-[#2E2A33]'
                    }`}
                  >
                    Todas (20)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterRiskOnly(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      filterRiskOnly ? 'bg-[#4A2270] text-white shadow-2xs' : 'text-[#6E6A75] hover:text-[#2E2A33]'
                    }`}
                  >
                    <span>En alerta ({riskItems.length})</span>
                  </button>
                </div>
              </div>

              <div className="bg-[#E9DFF5]/70 border border-[#D5C6EB] rounded-2xl p-4 text-xs sm:text-[13px] text-[#4A2270] leading-relaxed flex items-start gap-3">
                <Info className="w-4 h-4 text-[#4A2270] shrink-0 mt-0.5" />
                <div>
                  {score >= 3 && score <= 7 ? (
                    <p>
                      <strong>Siguiente paso normativo:</strong> Puntaje entre 3 y 7 puntos. Según la NTS N° 238-MINSA/DGIESP-2025, corresponde realizar la <strong>Entrevista de Seguimiento del M-CHAT-R/F</strong> (Anexo 11) en el establecimiento de salud para confirmar o descartar necesidad de referencia.
                    </p>
                  ) : score >= 8 ? (
                    <p>
                      <strong>Siguiente paso normativo:</strong> Puntaje de 8 o más puntos. Corresponde <strong>referencia prioritaria a evaluación especializada</strong> (Neuropediatría / Psiquiatría infantil o CSMC).
                    </p>
                  ) : (
                    <p>
                      <strong>Siguiente paso normativo:</strong> Puntaje entre 0 y 2 puntos (Riesgo bajo). Continuar con el control habitual de desarrollo en la consulta CRED.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#6E6A75] px-1">
                  <span>Desglose de respuestas ({displayItems.length})</span>
                  <button
                    type="button"
                    onClick={() => setShowFullTable(!showFullTable)}
                    className="text-[#4A2270] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showFullTable ? 'Plegar lista' : 'Desplegar lista'}</span>
                    {showFullTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {showFullTable && (
                  <div className="border border-[#E5E1EC] rounded-2xl divide-y divide-[#F0EDF5] overflow-hidden bg-white">
                    {displayItems.map((item) => {
                      const ans = inst.respuestas[item.n] || 'si';
                      const isInverted = instrumento.invertidos.includes(item.n);
                      const isRisk = (isInverted && ans === 'si') || (!isInverted && ans === 'no');

                      return (
                        <div
                          key={item.n}
                          className={`p-3.5 sm:p-4 flex items-start justify-between gap-3 text-xs transition-colors ${
                            isRisk ? 'bg-[#FAF6FF]' : 'hover:bg-[#FAF8FD]'
                          }`}
                        >
                          <div className="space-y-1 flex-1 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-[#E9DFF5] text-[#4A2270] font-bold text-[10.5px]">
                                Ítem #{item.n}
                              </span>
                              {isRisk && (
                                <span className="px-2 py-0.5 rounded bg-[#FDF1DF] text-[#C77700] font-bold text-[10.5px]">
                                  Señal de atención (+1 pto)
                                </span>
                              )}
                            </div>
                            <p className="text-[#2E2A33] font-medium leading-relaxed pt-0.5">
                              {item.texto}
                            </p>
                          </div>

                          <div className="shrink-0 pt-0.5">
                            <span
                              className={`inline-block px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider ${
                                isRisk
                                  ? 'bg-[#4A2270] text-white shadow-2xs'
                                  : 'bg-[#F0EDF5] text-[#6E6A75]'
                              }`}
                            >
                              {ans}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* Section 2: Bitácora de Registros y Eventos */}
            <section className="bg-white rounded-2xl border border-[#E5E1EC] p-6 sm:p-7 shadow-xs space-y-4">
              <div className="space-y-1 border-b border-[#F0EDF5] pb-3">
                <h3 className="text-lg font-fraunces font-bold text-[#2E2A33] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#4A2270]" />
                  <span>Bitácora cronológica del caso</span>
                </h3>
                <p className="text-xs text-[#6E6A75]">
                  Historial de registros y reportes realizados por la familia en la plataforma
                </p>
              </div>

              <div className="space-y-3 pt-1">
                {registros.map((reg, idx) => (
                  <div
                    key={idx}
                    className="bg-[#FAF8FD] p-4 rounded-xl border border-[#E5E1EC] text-xs space-y-1.5 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#4A2270]" />
                        <span className="font-bold text-[#2E2A33] text-[13px]">{reg.titulo}</span>
                      </div>
                      <span className="text-[11px] text-[#8E8A95] font-medium">{reg.fecha}</span>
                    </div>
                    <p className="text-[#6E6A75] leading-relaxed pl-4">{reg.detalle}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Clinical Sidebar */}
          <div className="space-y-6">
            <section className="bg-white rounded-2xl border border-[#E5E1EC] p-5 space-y-4 shadow-xs">
              <div className="space-y-0.5 border-b border-[#F0EDF5] pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E6A75]">
                  Progreso en la ruta
                </span>
                <h3 className="text-base font-bold text-[#2E2A33]">
                  Fase actual del menor
                </h3>
              </div>

              <div className="bg-[#FAF8FD] p-3 rounded-xl border border-[#E5E1EC]">
                <RastreadorCompacto user={trackerUserProfile} />
              </div>
            </section>

            {/* Registrar Atención Médica */}
            <section className="bg-white rounded-2xl border-2 border-[#4A2270] p-5 space-y-4 shadow-md">
              <div className="space-y-1 border-b border-[#F0EDF5] pb-3">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E9DFF5] text-[#4A2270] text-[10.5px] font-bold">
                  <Stethoscope className="w-3 h-3" />
                  <span>Acción del profesional</span>
                </div>
                <h3 className="text-base font-bold text-[#2E2A33]">
                  Registrar atención realizada
                </h3>
                <p className="text-xs text-[#6E6A75]">
                  Confirma la atención en el establecimiento para hacer avanzar la fase del caso.
                </p>
              </div>

              {registeredSuccessMsg && (
                <div className="p-3 bg-[#E6F2EC] border border-[#C3E5D4] text-[#2E7D5B] rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{registeredSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleRegisterAtencion} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#4A4652] mb-1">
                    Establecimiento de salud
                  </label>
                  <select
                    value={establecimientoNombre}
                    onChange={(e) => setEstablecimientoNombre(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F5FA] border border-[#E5E1EC] rounded-xl text-xs font-semibold text-[#2E2A33] focus:ring-2 focus:ring-[#4A2270] focus:outline-none"
                  >
                    <option value="CS Miraflores">C.S. Miraflores (I-3)</option>
                    <option value="CS Santa Cruz">C.S. Santa Cruz (I-3)</option>
                    <option value="CS Manuel Bonilla">C.S. Manuel Bonilla (I-2)</option>
                    <option value="Hospital Casimiro Ulloa">Hospital Casimiro Ulloa (II-2)</option>
                    <option value="INSN San Borja">INSN San Borja (III-2)</option>
                    <option value="CSMC Miraflores">CSMC Miraflores (I-4)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#4A4652]">
                    Tipo de atención efectuada:
                  </label>

                  <div className="space-y-2">
                    <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                      selectedAtencionType === 'tamizaje'
                        ? 'bg-[#FAF6FF] border-[#4A2270] shadow-2xs'
                        : 'bg-[#FAF8FD] border-[#E5E1EC] hover:bg-white'
                    }`}>
                      <input
                        type="radio"
                        name="atencionType"
                        checked={selectedAtencionType === 'tamizaje'}
                        onChange={() => setSelectedAtencionType('tamizaje')}
                        className="mt-0.5 text-[#4A2270] focus:ring-[#4A2270]"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-[#2E2A33] block">
                          Apliqué la entrevista o ficha de despistaje (Tamizaje)
                        </span>
                        <span className="text-[11px] text-[#6E6A75] block mt-0.5">
                          Avanza el caso a la Fase 2 (Despistaje)
                        </span>
                      </div>
                    </label>

                    <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                      selectedAtencionType === 'referencia'
                        ? 'bg-[#FAF6FF] border-[#4A2270] shadow-2xs'
                        : 'bg-[#FAF8FD] border-[#E5E1EC] hover:bg-white'
                    }`}>
                      <input
                        type="radio"
                        name="atencionType"
                        checked={selectedAtencionType === 'referencia'}
                        onChange={() => setSelectedAtencionType('referencia')}
                        className="mt-0.5 text-[#4A2270] focus:ring-[#4A2270]"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-[#2E2A33] block">
                          Emití una hoja de referencia a servicio especializado
                        </span>
                        <span className="text-[11px] text-[#6E6A75] block mt-0.5">
                          Avanza el caso a la Fase 4 (Evaluación Nivel II/III)
                        </span>
                      </div>
                    </label>

                    <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                      selectedAtencionType === 'diagnostico'
                        ? 'bg-[#FAF6FF] border-[#4A2270] shadow-2xs'
                        : 'bg-[#FAF8FD] border-[#E5E1EC] hover:bg-white'
                    }`}>
                      <input
                        type="radio"
                        name="atencionType"
                        checked={selectedAtencionType === 'diagnostico'}
                        onChange={() => setSelectedAtencionType('diagnostico')}
                        className="mt-0.5 text-[#4A2270] focus:ring-[#4A2270]"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-[#2E2A33] block">
                          Se emitió un diagnóstico o informe definitivo
                        </span>
                        <span className="text-[11px] text-[#6E6A75] block mt-0.5">
                          Avanza el caso a la Fase 5 (Diagnóstico confirmado)
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A4652] mb-1">
                    Observaciones o código CIE-10 (opcional)
                  </label>
                  <input
                    type="text"
                    value={profesionalNotas}
                    onChange={(e) => setProfesionalNotas(e.target.value)}
                    placeholder="Ej. CIE-10 F84.0 - Referido a Neuropediatría"
                    className="w-full px-3 py-2 bg-[#F7F5FA] border border-[#E5E1EC] rounded-xl text-xs text-[#2E2A33] placeholder-[#A09CA8] focus:ring-2 focus:ring-[#4A2270] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#4A2270] hover:bg-[#381559] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Registrar atención y actualizar caso</span>
                </button>
              </form>
            </section>

            {/* Checklist */}
            <section className="bg-white rounded-2xl border border-[#E5E1EC] p-5 space-y-4 shadow-xs">
              <div className="space-y-0.5 border-b border-[#F0EDF5] pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A2270]">
                  Criterios prestacionales
                </span>
                <h3 className="text-base font-bold text-[#2E2A33] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#4A2270]" />
                  <span>Acciones en la consulta</span>
                </h3>
              </div>

              <ul className="space-y-2.5 text-xs text-[#2E2A33]">
                <li className="flex items-start gap-2.5 bg-[#FAF8FD] p-3 rounded-xl border border-[#E5E1EC]">
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D5B] shrink-0 mt-0.5" />
                  <span>Verificar carné de salud infantil CRED y DNI del menor en ventanilla.</span>
                </li>

                <li className="flex items-start gap-2.5 bg-[#FAF8FD] p-3 rounded-xl border border-[#E5E1EC]">
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D5B] shrink-0 mt-0.5" />
                  <span>Aplicar la entrevista de seguimiento M-CHAT-R/F si el puntaje está entre 3 y 7.</span>
                </li>

                <li className="flex items-start gap-2.5 bg-[#FAF8FD] p-3 rounded-xl border border-[#E5E1EC]">
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D5B] shrink-0 mt-0.5" />
                  <span>Registrar la atención con el código CIE-10 correspondiente y coordinar la hoja de referencia.</span>
                </li>
              </ul>
            </section>

            {/* QR Code */}
            <section className="bg-white rounded-2xl border border-[#E5E1EC] p-5 space-y-4 text-center shadow-xs">
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A2270] flex items-center justify-center gap-1.5">
                  <QrCode className="w-4 h-4" />
                  <span>Verificación digital</span>
                </h4>
                <p className="text-[11.5px] text-[#6E6A75]">
                  Escanee este código con su dispositivo para abrir este caso en otra pantalla
                </p>
              </div>

              {qrDataUrl ? (
                <div className="p-3 bg-[#FAF8FD] rounded-2xl border border-[#E5E1EC] inline-block mx-auto shadow-2xs">
                  <img src={qrDataUrl} alt="QR del caso" className="w-36 h-36 mx-auto rounded-lg" />
                  <span className="font-mono text-xs font-bold text-[#4A2270] block mt-1">
                    {caseData.codigo}
                  </span>
                </div>
              ) : (
                <div className="w-36 h-36 bg-[#F7F5FA] rounded-2xl mx-auto flex items-center justify-center text-xs text-[#8E8A95]">
                  Generando QR...
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border border-[#E5E1EC] rounded-2xl p-5 text-center text-xs text-[#6E6A75] leading-relaxed space-y-1.5 shadow-2xs">
          <p className="font-semibold text-[#2E2A33]">
            PAN · Sistema de orientación e información del neurodesarrollo infantil
          </p>
          <p className="text-[11.5px] text-[#8E8A95] max-w-2xl mx-auto">
            Esta vista de solo lectura presenta la información registrada por el cuidador. La decisión diagnóstica y terapéutica corresponde exclusivamente al equipo médico y profesional de salud tratante en el Perú.
          </p>
        </footer>
      </div>
    </div>
  );
};

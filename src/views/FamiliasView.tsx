import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, ScreenType } from '../types';
import { 
  LIBRARY_DOCUMENTS, 
  CorpusDocument, 
  findLocalCorpusAnswer 
} from '../data/corpusFamilias';
import condicionesData from '../data/condiciones.json';
import {
  ChatMessageItem,
  type ChatMessageData,
  type ChatSourceItem,
} from '../components/Familias/ChatMessageItem';
import { ChatComposer } from '../components/Familias/ChatComposer';
import { DocumentDrawer } from '../components/Familias/DocumentDrawer';
import { consultar, type TurnoHistorial } from '../api/cliente';
import { 
  Puzzle, 
  Zap, 
  MessageSquare, 
  ChevronDown,
  BookOpen,
  Info,
  ExternalLink,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface FamiliasViewProps {
  user: UserProfile;
  onNavigateToConoce?: () => void;
  onNavigate?: (screen: ScreenType) => void;
  onUpdateUser?: (updated: UserProfile) => void;
}

export const FamiliasView: React.FC<FamiliasViewProps> = ({
  user,
  onNavigate,
  onUpdateUser,
}) => {
  const childName = user.child.nickname || 'tu hijo/a';
  const hasDiagnosis = Boolean(user.diagnosis || (user.fase && user.fase >= 5));

  // Condition context state
  const [activeCondicionKey, setActiveCondicionKey] = useState<string>('autismo');
  const [isConditionDropdownOpen, setIsConditionDropdownOpen] = useState(false);

  // Evaluated conditions list (single by default, expandable)
  const evaluadasList = ['autismo'];
  const activeCondicionConfig = (condicionesData as any)[activeCondicionKey] || (condicionesData as any).autismo;
  const currentSugerencias: string[] = activeCondicionConfig.sugerencias || [];

  // Calculate child age in months
  const calculateAgeInMonths = (child: UserProfile['child']) => {
    if (!child) return 20;
    if (child.birthYear) {
      const year = parseInt(child.birthYear, 10);
      const monthMap: Record<string, number> = {
        'Enero': 0, 'Febrero': 1, 'Marzo': 2, 'Abril': 3, 'Mayo': 4, 'Junio': 5,
        'Julio': 6, 'Agosto': 7, 'Setiembre': 8, 'Septiembre': 8, 'Octubre': 9, 'Noviembre': 10, 'Diciembre': 11,
        '01': 0, '02': 1, '03': 2, '04': 3, '05': 4, '06': 5, '07': 6, '08': 7, '09': 8, '10': 9, '11': 10, '12': 11,
        '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7, '9': 8,
      };
      const month = monthMap[child.birthMonth] !== undefined ? monthMap[child.birthMonth] : 0;
      if (!isNaN(year) && year > 1900) {
        const now = new Date();
        const months = (now.getFullYear() - year) * 12 + (now.getMonth() - month);
        if (months > 0 && months <= 120) return months;
      }
    }
    return 20;
  };

  const childAgeInMonths = calculateAgeInMonths(user.child);

  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isSendingRef = useRef(false);

  // Document Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<CorpusDocument | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll smoothly when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Handle opening document details in lateral Drawer
  const handleOpenSource = (sourceTitle: string) => {
    const matched = LIBRARY_DOCUMENTS.find(
      (doc) =>
        sourceTitle.toLowerCase().includes(doc.badge.toLowerCase()) ||
        sourceTitle.toLowerCase().includes(doc.legalCode?.toLowerCase() || '') ||
        doc.title.toLowerCase().includes(sourceTitle.toLowerCase()) ||
        sourceTitle.toLowerCase().includes(doc.title.toLowerCase())
    );

    if (matched) {
      setSelectedDoc(matched);
    } else {
      setSelectedDoc({
        id: 'ref-doc',
        title: sourceTitle,
        institution: sourceTitle.toLowerCase().includes('oms') ? 'Organización Mundial de la Salud' : 'Entidad oficial del Perú',
        description: 'Documento normativo de referencia oficial para la atención de personas con TEA.',
        url: 'https://www.gob.pe',
        badge: sourceTitle.toLowerCase().includes('oms') ? 'OMS' : 'MINSA',
      });
    }
    setIsDrawerOpen(true);
  };

  // Feedback handler
  const handleFeedback = (messageId: string, type: 'up' | 'down') => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          return {
            ...msg,
            feedback: msg.feedback === type ? null : type,
          };
        }
        return msg;
      })
    );
  };

  // Phase toggler for demo
  const handleTogglePhase = () => {
    if (!onUpdateUser) return;
    if (hasDiagnosis) {
      onUpdateUser({
        ...user,
        fase: 1,
        diagnosis: null,
      });
    } else {
      onUpdateUser({
        ...user,
        fase: 5,
        diagnosis: {
          profesional: 'neurologo',
          mes: 'Enero',
          ano: '2025',
          registradoAt: new Date().toISOString(),
        },
      });
    }
  };

  // Core Send Query Routine with mutex to prevent double dispatch
  const handleSend = async (queryOverride?: string) => {
    if (isSendingRef.current) return;

    const textToQuery = (queryOverride || inputText).trim();
    if (!textToQuery || !hasDiagnosis) return;

    isSendingRef.current = true;
    setInputText('');
    setIsLoading(true);

    const now = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 6);

    // 1. Add User Message
    const userMessage: ChatMessageData = {
      id: `user-${now}-${randomSuffix}`,
      role: 'user',
      text: textToQuery,
      timestamp: now,
    };

    // 2. Add placeholder Assistant Message with streaming indicator
    const assistantMessageId = `assistant-${now + 1}-${randomSuffix}`;
    const assistantMessage: ChatMessageData = {
      id: assistantMessageId,
      role: 'assistant',
      text: '',
      isStreaming: true,
      timestamp: now + 1,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);

    // El historial viaja con los roles del contrato ('usuario' / 'asistente'),
    // que no son los que usa la UI internamente ('user' / 'assistant').
    // Descartamos los mensajes vacíos: el placeholder del asistente aún no
    // tiene texto y el backend rechaza turnos en blanco.
    const historial: TurnoHistorial[] = messages
      .filter((m) => m.text.trim().length > 0)
      .map((m) => ({
        rol: m.role === 'user' ? 'usuario' : 'asistente',
        texto: m.text,
      }));

    let fullAnswer = '';
    let sourcesList: ChatSourceItem[] = [];
    let isFallback = false;
    let notFound = false;
    let fueraDeAlcance = false;
    let condicionDetectada = '';

    try {
      // condicion y edad_meses salen del caso, no de lo que escriba la familia.
      const data = await consultar({
        pregunta: textToQuery,
        condicion: activeCondicionKey,
        edad_meses: childAgeInMonths,
        idioma: 'es',
        historial,
      });

      if (data.fuera_de_alcance) {
        fueraDeAlcance = true;
        condicionDetectada = data.condicion_detectada || 'otra condición';
        if (condicionDetectada.toLowerCase() === 'tdah') condicionDetectada = 'TDAH';
        // El texto lo pinta la caja lavanda de ChatMessageItem.
        fullAnswer = '';
      } else {
        fullAnswer = data.respuesta;
        sourcesList = data.fuentes;
        notFound = fullAnswer
          .toLowerCase()
          .includes('no tengo esa información en mis fuentes');
      }
    } catch (err) {
      // El respaldo local evita dejar a la familia sin nada, pero NO debe
      // pasar desapercibido: si el backend falla queremos enterarnos, no ver
      // respuestas enlatadas creyendo que vienen del modelo.
      console.error(
        '[PAN] No se pudo consultar el backend; usando el corpus local de respaldo.',
        { url: import.meta.env.VITE_API_URL, error: err },
      );
      const localResult = findLocalCorpusAnswer(textToQuery, childName);
      fullAnswer = localResult.respuesta;
      // El corpus local solo trae el título; sin `ambito` el chip cae a su
      // heurística por nombre en vez de afirmar una procedencia que no sabemos.
      sourcesList = localResult.fuentes.map((f) => ({ titulo: f }));
      isFallback = true;
      notFound = Boolean(localResult.notFound);
      fueraDeAlcance = Boolean(localResult.fueraDeAlcance);
      condicionDetectada = localResult.condicionDetectada || '';
    }

    // Smooth streaming effect
    let currentIdx = 0;
    const streamSpeed = Math.max(8, Math.min(20, Math.floor(1000 / (fullAnswer.length || 1))));

    const streamInterval = setInterval(() => {
      currentIdx += 5;
      if (currentIdx >= fullAnswer.length) {
        clearInterval(streamInterval);
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === assistantMessageId) {
              return {
                ...msg,
                text: fullAnswer,
                fuentes: sourcesList,
                isFallback,
                notFound,
                fueraDeAlcance,
                condicionDetectada,
                isStreaming: false,
              };
            }
            return msg;
          })
        );
        setIsLoading(false);
        isSendingRef.current = false;
      } else {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === assistantMessageId) {
              return {
                ...msg,
                text: fullAnswer.slice(0, currentIdx),
                isStreaming: true,
              };
            }
            return msg;
          })
        );
      }
    }, streamSpeed);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-6 animate-in fade-in duration-300">
      
      {/* 1. PAGE HEADER (MATCHES EVALUACIONES / MI RUTA / DASHBOARD) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-fraunces font-bold text-[#2E2A33] mb-1.5 tracking-tight">
            Para familias
          </h1>
          <p className="text-[#6E6A75] text-base sm:text-lg">
            Orientación y respuestas con base en normas peruanas y guías oficiales verificadas.
          </p>
        </div>

        {/* Phase Pill and Demo Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-white px-3 py-1.5 rounded-xl border border-[#E5E1EC] shadow-2xs">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              hasDiagnosis
                ? 'bg-[#E6F2EC] text-[#2E7D5B]'
                : 'bg-[#FDF1DF] text-[#C77700]'
            }`}
          >
            {hasDiagnosis ? 'Fase 5 · Con Diagnóstico' : 'Fases 1–4 · Orientación'}
          </span>

          <button
            type="button"
            onClick={handleTogglePhase}
            className="text-xs font-semibold text-[#6B3FA0] hover:text-[#4A2270] hover:underline cursor-pointer px-1.5 py-0.5"
            title="Cambiar entre modo con diagnóstico y modo de orientación inicial"
          >
            Cambiar fase
          </button>
        </div>
      </div>

      {/* 2. CONTEXT BAR (LAVANDA CLARO INTEGRADO) */}
      <div className="bg-[#F4EFFB] border border-[#D5CCE0] rounded-2xl p-3.5 sm:px-5 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5 text-[#2E2A33] font-medium text-xs sm:text-sm">
          <div className="w-6 h-6 rounded-lg bg-[#E9DFF5] flex items-center justify-center text-[#4A2270] shrink-0 shadow-2xs">
            {activeCondicionConfig.icono === 'puzzle' ? (
              <Puzzle className="w-3.5 h-3.5" />
            ) : activeCondicionConfig.icono === 'zap' ? (
              <Zap className="w-3.5 h-3.5" />
            ) : (
              <MessageSquare className="w-3.5 h-3.5" />
            )}
          </div>

          {evaluadasList.length > 1 ? (
            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => setIsConditionDropdownOpen(!isConditionDropdownOpen)}
                className="font-bold text-[#4A2270] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{activeCondicionConfig.nombre}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#4A2270]" />
              </button>
              {isConditionDropdownOpen && (
                <div className="absolute left-0 top-full mt-1 bg-white border border-[#E5E1EC] rounded-xl shadow-lg py-1 z-30 min-w-[170px]">
                  {evaluadasList.map((key) => {
                    const cond = (condicionesData as any)[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setActiveCondicionKey(key);
                          setIsConditionDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-[#FAF8FD] ${
                          activeCondicionKey === key ? 'font-bold text-[#4A2270]' : 'text-[#2E2A33]'
                        }`}
                      >
                        <span>{cond.nombre}</span>
                        {!cond.disponible && (
                          <span className="text-[10px] bg-[#F0EDF5] text-[#6E6A75] px-1.5 py-0.5 rounded">Próximamente</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <span className="font-bold text-[#4A2270]">{activeCondicionConfig.nombre}</span>
          )}

          <span className="text-[#8E8A95]">·</span>
          <span className="text-[#2E2A33] font-semibold">{childAgeInMonths} meses</span>
          <span className="text-[#8E8A95]">·</span>
          <button
            type="button"
            onClick={() => {
              setSelectedDoc(null);
              setIsDrawerOpen(true);
            }}
            className="text-[#4A2270] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            title="Ver biblioteca de documentos"
          >
            <span>{LIBRARY_DOCUMENTS.length} documentos</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </button>
        </div>

        <div className="text-xs text-[#6E6A75] flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#6B3FA0] shrink-0" />
          <span>Contenido según el tamizaje que aplicaste</span>
        </div>
      </div>

      {/* 3. DISCREET DISCLAIMER STRIP */}
      <div className="bg-white border border-[#E5E1EC] rounded-xl px-4 py-2.5 flex items-start gap-2.5 text-xs text-[#6E6A75] shadow-2xs">
        <Info className="w-4 h-4 text-[#8E8A95] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Respondemos exclusivamente con documentos de nuestra biblioteca verificada: normas peruanas y guías internacionales. Puede haber errores: confirma siempre con el profesional de salud que atiende a <strong className="text-[#2E2A33]">{childName}</strong>.
        </p>
      </div>

      {/* 4. MAIN INTERACTIVE CARD */}
      {!hasDiagnosis ? (
        /* LOCKED STATE: Clean informative card */
        <div className="bg-white border border-[#E5E1EC] rounded-2xl p-8 sm:p-12 text-center space-y-5 shadow-xs animate-in fade-in duration-300">
          <div className="w-14 h-14 rounded-2xl bg-[#F4EFFB] text-[#4A2270] flex items-center justify-center mx-auto shadow-2xs">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-fraunces font-bold text-[#2E2A33]">
              Asistente de orientación para familias
            </h2>
            <p className="text-sm text-[#6E6A75] leading-relaxed">
              Aquí podrás hacer preguntas sobre el autismo cuando cuentes con una orientación profesional. Por ahora, completa tu orientación inicial para habilitar el asistente clínico.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigate?.('evaluaciones')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#4A2270] hover:bg-[#381559] text-white text-sm font-bold rounded-xl transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Hacer la orientación inicial</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* UNLOCKED STATE: Full conversation card */
        <div className="bg-white border border-[#E5E1EC] rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-[520px]">
          
          {/* Card Top Subheader */}
          <div className="px-5 py-3.5 border-b border-[#F0EDF5] bg-[#FAF8FD] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2E7D5B] animate-pulse"></span>
              <span className="text-xs font-semibold text-[#4A2270]">
                Asistente clínico PAN · Fuentes verificadas
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedDoc(null);
                setIsDrawerOpen(true);
              }}
              className="text-xs font-semibold text-[#6B3FA0] hover:text-[#4A2270] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Ver biblioteca ({LIBRARY_DOCUMENTS.length})</span>
            </button>
          </div>

          {/* Conversation Body */}
          <div className="flex-1 p-5 sm:p-6 space-y-6">
            {!hasMessages ? (
              /* Empty state inside the card */
              <div className="py-12 sm:py-16 text-center space-y-3 max-w-lg mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-[#F4EFFB] text-[#4A2270] flex items-center justify-center mx-auto shadow-2xs mb-2">
                  <Sparkles className="w-6 h-6 text-[#6B3FA0]" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-fraunces font-semibold text-[#2E2A33]">
                  {activeCondicionKey === 'autismo'
                    ? '¿Qué te gustaría entender sobre el autismo?'
                    : `¿Qué te gustaría entender sobre ${activeCondicionConfig.nombre}?`}
                </h2>
                <p className="text-xs sm:text-sm text-[#6E6A75] leading-relaxed max-w-md mx-auto">
                  Pregunta lo que necesites sobre terapias con evidencia, derechos escolares, apoyos del Estado o pautas de acompañamiento en el hogar.
                </p>

                {/* Initial suggestion chips grid */}
                <div className="pt-6">
                  <span className="text-xs font-semibold text-[#8E8A95] uppercase tracking-wider block mb-3">
                    Consultas frecuentes sugeridas
                  </span>
                  <div className="flex flex-wrap justify-center gap-2">
                    {currentSugerencias.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(chip)}
                        className="px-3.5 py-2 bg-[#F4EFFB] hover:bg-[#E9DFF5] text-[#4A2270] text-xs font-semibold rounded-xl transition-all shadow-2xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer border border-[#E5E1EC]"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Message list */
              <div className="space-y-6 max-w-3xl mx-auto w-full">
                {messages.map((msg, idx) => {
                  const isLastAssistant =
                    msg.role === 'assistant' &&
                    idx === messages.length - 1 &&
                    !msg.isStreaming;

                  return (
                    <ChatMessageItem
                      key={msg.id}
                      message={msg}
                      childName={childName}
                      onOpenSource={handleOpenSource}
                      onFeedback={handleFeedback}
                      showSuggestions={isLastAssistant}
                      suggestions={currentSugerencias}
                      onSelectSuggestion={(chip) => handleSend(chip)}
                    />
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Composer pinned to the bottom of the card */}
          <div className="p-4 sm:p-5 border-t border-[#F0EDF5] bg-[#FAF8FD]/50">
            <ChatComposer
              input={inputText}
              onChangeInput={setInputText}
              onSend={(text) => handleSend(text)}
              isLoading={isLoading}
              isLocked={false}
              showChips={hasMessages}
              chips={currentSugerencias}
              onSelectChip={(chip) => handleSend(chip)}
              onNavigateToEvaluaciones={() => onNavigate?.('evaluaciones')}
            />
          </div>
        </div>
      )}

      {/* 5. LATERAL DOCUMENT DRAWER (LIBRARY) */}
      <DocumentDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        selectedDoc={selectedDoc}
        allDocs={LIBRARY_DOCUMENTS}
        onSelectDoc={(doc) => setSelectedDoc(doc)}
      />

    </div>
  );
};



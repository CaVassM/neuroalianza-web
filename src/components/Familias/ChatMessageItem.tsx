import React, { useState } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  ThumbsUp, 
  ThumbsDown, 
  AlertCircle, 
  Sparkles,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';

export interface ChatSourceItem {
  titulo: string;
  institucion?: string;
  /** Lo envía el backend. Decide el distintivo "Perú" / "Internacional". */
  ambito?: 'peru' | 'internacional';
  url?: string | null;
  pagina?: number | null;
  norma?: string;
}

/**
 * Respaldo para fuentes que llegan sin `ambito` (el corpus local del modo sin
 * conexión, que solo guarda el título). Cuando el backend responde, `ambito`
 * viene de los metadatos del documento y esta heurística no se usa.
 */
const adivinarAmbito = (titulo: string): 'peru' | 'internacional' => {
  const t = titulo.toLowerCase();
  const señasInternacionales = ['oms', 'who', 'organización mundial', 'internacional', 'global', 'unicef', 'cdc', 'autism speaks'];
  return señasInternacionales.some((s) => t.includes(s)) ? 'internacional' : 'peru';
};

/** Convierte **negritas** en <strong>. */
const conNegritas = (texto: string): React.ReactNode[] =>
  texto.split(/(\*\*[^*]+\*\*)/g).map((parte, i) =>
    parte.startsWith('**') && parte.endsWith('**') && parte.length > 4 ? (
      <strong key={i} className="font-semibold text-[#2E2A33]">
        {parte.slice(2, -2)}
      </strong>
    ) : (
      <React.Fragment key={i}>{parte}</React.Fragment>
    )
  );

/**
 * El modelo responde en markdown ligero (negritas y viñetas). Sin esto la
 * burbuja mostraba los asteriscos y los guiones tal cual, en crudo.
 * Solo interpretamos negritas y listas: nada de HTML arbitrario.
 */
const TextoRespuesta: React.FC<{ texto: string }> = ({ texto }) => {
  const bloques: React.ReactNode[] = [];
  let viñetas: string[] = [];

  const cerrarLista = () => {
    if (viñetas.length === 0) return;
    bloques.push(
      <ul key={`lista-${bloques.length}`} className="list-disc pl-5 space-y-1">
        {viñetas.map((v, i) => (
          <li key={i}>{conNegritas(v)}</li>
        ))}
      </ul>
    );
    viñetas = [];
  };

  texto.split('\n').forEach((linea) => {
    const limpia = linea.trim();
    const esViñeta = /^([-*•]|\d+\.)\s+/.test(limpia);

    if (esViñeta) {
      viñetas.push(limpia.replace(/^([-*•]|\d+\.)\s+/, ''));
      return;
    }
    cerrarLista();
    if (limpia) {
      bloques.push(
        <p key={`p-${bloques.length}`}>{conNegritas(limpia)}</p>
      );
    }
  });
  cerrarLista();

  return <>{bloques}</>;
};

export interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  fuentes?: ChatSourceItem[];
  isFallback?: boolean;
  notFound?: boolean;
  fueraDeAlcance?: boolean;
  condicionDetectada?: string;
  isStreaming?: boolean;
  feedback?: 'up' | 'down' | null;
  timestamp: number;
}

interface ChatMessageItemProps {
  message: ChatMessageData;
  childName: string;
  onOpenSource: (sourceTitle: string) => void;
  onFeedback: (messageId: string, type: 'up' | 'down') => void;
  showSuggestions?: boolean;
  suggestions?: string[];
  onSelectSuggestion?: (suggestion: string) => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  childName,
  onOpenSource,
  onFeedback,
  showSuggestions,
  suggestions = [],
  onSelectSuggestion,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!message.text) return;
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // If user message
  if (message.role === 'user') {
    return (
      <div className="flex justify-end w-full animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="bg-[#E9DFF5] text-[#2E2A33] text-sm sm:text-[15px] font-medium leading-relaxed px-4.5 py-3 rounded-2xl rounded-br-xs max-w-[85%] sm:max-w-[70%] shadow-2xs">
          {message.text}
        </div>
      </div>
    );
  }

  // If assistant message
  const isAmberAlert =
    message.notFound ||
    message.text.trim().toLowerCase().includes('no tengo esa información en mis fuentes');

  return (
    <div className="flex flex-col items-start w-full max-w-[680px] space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200 text-left">
      <div className="flex items-start gap-3 w-full">
        {/* Small Purple Avatar with Isotype */}
        <div className="w-7 h-7 rounded-full bg-[#4A2270] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs mt-0.5">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>

        <div className="flex-1 space-y-3">
          {/* While waiting / loading */}
          {message.isStreaming && !message.text ? (
            <div className="flex items-center gap-1.5 py-2">
              <span className="w-2 h-2 rounded-full bg-[#6B3FA0] animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 rounded-full bg-[#6B3FA0] animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 rounded-full bg-[#6B3FA0] animate-bounce"></span>
            </div>
          ) : message.fueraDeAlcance ? (
            /* Lavender box for out of scope condition */
            <div className="p-4 sm:p-5 rounded-2xl bg-[#F4EFFB] border border-[#D5CCE0] text-[#2E2A33] space-y-3 shadow-2xs">
              <p className="text-xs sm:text-sm text-[#2E2A33] leading-relaxed">
                Esa pregunta parece ser sobre <span className="font-bold">{message.condicionDetectada || 'otra condición'}</span>. Por ahora PAN tiene contenido de autismo. Estamos trabajando en las demás condiciones del neurodesarrollo.
              </p>
              {suggestions && suggestions.length > 0 && (
                <div className="pt-2 border-t border-[#E9DFF5] space-y-2">
                  <span className="text-[11px] font-semibold text-[#6E6A75] block">
                    Puedes consultar sobre autismo:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.map((chip, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => onSelectSuggestion?.(chip)}
                        className="px-3 py-1.5 bg-[#E9DFF5] hover:bg-[#DED0F0] text-[#4A2270] text-xs font-semibold rounded-full transition-all cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : isAmberAlert ? (
            /* Amber box for not found */
            <div className="p-4 rounded-2xl bg-[#FDF1DF] border border-[#FBE0B8] text-[#C77700] space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>No tengo esa información en mis fuentes oficiales.</span>
              </div>
              <p className="text-xs text-[#9E5D00] leading-relaxed">
                Puedes preguntarle esto al profesional que atiende a {childName}.
              </p>
            </div>
          ) : (
            /* Standard text response */
            <div className="text-sm sm:text-[15px] text-[#2E2A33] leading-relaxed font-normal space-y-2">
              <TextoRespuesta texto={message.text} />
            </div>
          )}

          {/* El respaldo local tiene que verse: si no, una respuesta enlatada
              pasa por respuesta del modelo y el fallo del backend queda oculto. */}
          {message.isFallback && !message.isStreaming && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-[#FDF1DF] border border-[#FBE0B8] text-[11px] text-[#9E5D00]">
              <Info className="w-3.5 h-3.5 shrink-0 mt-px" />
              <span>
                <strong className="font-semibold">Sin conexión con el asistente.</strong>{' '}
                Esta respuesta viene de la información guardada en la app, no del
                servicio de orientación.
              </span>
            </div>
          )}

          {/* Citation chips row */}
          {message.fuentes && message.fuentes.length > 0 && !message.isStreaming && (
            <div className="pt-2 space-y-1.5">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#6E6A75] block">
                Fuentes consultadas
              </span>
              <div className="flex flex-wrap gap-1.5">
                {message.fuentes.map((source, idx) => {
                  const sourceTitle = typeof source === 'string' ? source : source.titulo;
                  const ambito =
                    (typeof source === 'string' ? undefined : source.ambito) ??
                    adivinarAmbito(sourceTitle);
                  const isInternational = ambito === 'internacional';

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onOpenSource(sourceTitle)}
                      className="px-2.5 py-1 bg-white hover:bg-[#FAF8FD] border border-[#E5E1EC] hover:border-[#6B3FA0]/60 rounded-xl text-xs text-[#4A2270] font-medium inline-flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer group"
                    >
                      <span
                        className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded leading-tight ${
                          isInternational
                            ? 'bg-[#F0EDF5] text-[#6E6A75]'
                            : 'bg-[#E9DFF5] text-[#4A2270]'
                        }`}
                      >
                        {isInternational ? 'Internacional' : 'Perú'}
                      </span>
                      <FileText className="w-3 h-3 text-[#6B3FA0] group-hover:scale-110 transition-transform" />
                      <span className="truncate max-w-[200px] sm:max-w-[280px]">
                        {sourceTitle}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action buttons (Copy & Feedback) */}
          {!message.isStreaming && message.text && (
            <div className="flex items-center gap-1 pt-1 text-[#6E6A75]">
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-lg hover:bg-white hover:text-[#4A2270] border border-transparent hover:border-[#E5E1EC] transition-all cursor-pointer text-xs flex items-center gap-1"
                title="Copiar respuesta"
                aria-label="Copiar respuesta"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#2E7D5B]" />
                    <span className="text-[11px] text-[#2E7D5B] font-semibold">Copiado</span>
                  </>
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => onFeedback(message.id, 'up')}
                className={`p-1.5 rounded-lg hover:bg-white transition-all cursor-pointer text-xs ${
                  message.feedback === 'up'
                    ? 'text-[#4A2270] bg-[#E9DFF5] border border-[#D5CCE0]'
                    : 'hover:text-[#4A2270] border border-transparent hover:border-[#E5E1EC]'
                }`}
                title="Esta respuesta fue útil"
                aria-label="Pulgar arriba"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onFeedback(message.id, 'down')}
                className={`p-1.5 rounded-lg hover:bg-white transition-all cursor-pointer text-xs ${
                  message.feedback === 'down'
                    ? 'text-[#4A2270] bg-[#E9DFF5] border border-[#D5CCE0]'
                    : 'hover:text-[#4A2270] border border-transparent hover:border-[#E5E1EC]'
                }`}
                title="Esta respuesta necesita mejorar"
                aria-label="Pulgar abajo"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Follow-up suggestions under the latest assistant response */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="pl-10 pt-2 w-full space-y-1.5">
          <span className="text-[11px] font-bold text-[#6E6A75]">
            Preguntas sugeridas:
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectSuggestion?.(chip)}
                className="px-3 py-1.5 bg-[#E9DFF5] hover:bg-[#DED0F0] text-[#4A2270] text-xs font-semibold rounded-full transition-all cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

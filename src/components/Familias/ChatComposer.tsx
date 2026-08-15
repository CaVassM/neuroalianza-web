import React, { useRef, useEffect } from 'react';
import { ArrowUp, Sparkles, ArrowRight } from 'lucide-react';

interface ChatComposerProps {
  input: string;
  onChangeInput: (val: string) => void;
  onSend: (textToSend?: string) => void;
  isLoading: boolean;
  isLocked: boolean;
  showChips: boolean;
  chips: string[];
  onSelectChip: (chip: string) => void;
  onNavigateToEvaluaciones?: () => void;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  input,
  onChangeInput,
  onSend,
  isLoading,
  isLocked,
  showChips,
  chips,
  onSelectChip,
  onNavigateToEvaluaciones,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea up to 4 lines
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading && !isLocked) {
        onSend();
      }
    }
  };

  // If locked (fases 1-4)
  if (isLocked) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 pb-4 sm:pb-6">
        <div className="bg-[#E9DFF5]/70 border border-[#D5CCE0] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-xs">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-semibold text-[#2E2A33]">
              Aquí podrás hacer preguntas sobre el autismo cuando cuentes con una orientación profesional.
            </p>
            <p className="text-[11px] text-[#6E6A75]">
              Por ahora, completa tu orientación inicial para habilitar el asistente clínico.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToEvaluaciones}
            className="px-5 py-2.5 bg-[#4A2270] hover:bg-[#381559] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
          >
            <span>Hacer la orientación inicial</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2.5">
      {/* Horizontal scrollable suggestion chips row right above the composer */}
      {showChips && chips.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-left">
          {chips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectChip(chip)}
              className="px-3.5 py-1.5 bg-[#E9DFF5] hover:bg-[#DED0F0] text-[#4A2270] text-xs font-semibold rounded-full whitespace-nowrap transition-all shadow-2xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input container */}
      <div className="relative flex items-end bg-white border border-[#E5E1EC] focus-within:border-[#4A2270] rounded-2xl shadow-xs transition-all p-2 gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => onChangeInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu pregunta…"
          rows={1}
          disabled={isLoading}
          className="w-full resize-none max-h-[120px] bg-transparent text-sm text-[#2E2A33] placeholder-[#A09BA8] px-2.5 py-1.5 focus:outline-none leading-relaxed"
        />

        <button
          type="button"
          onClick={() => onSend()}
          disabled={isLoading || !input.trim()}
          className="w-9 h-9 rounded-full bg-[#4A2270] hover:bg-[#381559] disabled:opacity-40 disabled:hover:bg-[#4A2270] text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-2xs"
          aria-label="Enviar pregunta"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

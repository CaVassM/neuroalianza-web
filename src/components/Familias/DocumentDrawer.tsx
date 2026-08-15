import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, FileText, ShieldCheck, BookOpen } from 'lucide-react';
import { CorpusDocument, LIBRARY_DOCUMENTS } from '../../data/corpusFamilias';

interface DocumentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDoc: CorpusDocument | null;
  allDocs?: CorpusDocument[];
  onSelectDoc?: (doc: CorpusDocument) => void;
}

export const DocumentDrawer: React.FC<DocumentDrawerProps> = ({
  isOpen,
  onClose,
  selectedDoc,
  allDocs = LIBRARY_DOCUMENTS,
  onSelectDoc,
}) => {
  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'MINSA':
        return 'bg-[#E6F2EC] text-[#2E7D5B] border-[#C8E6D9]';
      case 'CONADIS':
        return 'bg-[#E9DFF5] text-[#4A2270] border-[#D5C6EB]';
      case 'MINEDU':
        return 'bg-[#FDF1DF] text-[#C77700] border-[#FBE0B8]';
      case 'DEFENSORÍA':
        return 'bg-[#F3EDF9] text-[#6B3FA0] border-[#E1D4F0]';
      case 'OMS':
        return 'bg-[#EBF3FC] text-[#2563EB] border-[#BFDBFE]';
      // Distintivos del corpus real, por ámbito.
      case 'Perú':
        return 'bg-[#E9DFF5] text-[#4A2270] border-[#D5C6EB]';
      case 'Internacional':
        return 'bg-[#F0EDF5] text-[#6E6A75] border-[#E5E1EC]';
      default:
        return 'bg-[#F7F5FA] text-[#6E6A75] border-[#E5E1EC]';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          {/* Slide-over panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-screen max-w-md bg-white border-l border-[#E5E1EC] shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-6 border-b border-[#F0EDF5] flex items-center justify-between bg-[#FAF8FD]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#E9DFF5] text-[#4A2270] flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-fraunces font-bold text-base text-[#2E2A33]">
                      Fuente oficial
                    </h3>
                    <p className="text-[11px] text-[#6E6A75]">
                      Marco legal y clínico en el Perú
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white hover:bg-[#E5E1EC] border border-[#E5E1EC] flex items-center justify-center text-[#6E6A75] hover:text-[#2E2A33] transition-colors cursor-pointer"
                  aria-label="Cerrar panel de fuentes"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
                {selectedDoc ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${getBadgeStyle(
                          selectedDoc.badge
                        )}`}
                      >
                        {selectedDoc.badge}
                      </span>
                      {selectedDoc.legalCode && (
                        <span className="text-xs font-mono font-semibold text-[#4A2270]">
                          {selectedDoc.legalCode}
                        </span>
                      )}
                    </div>

                    <h4 className="text-lg font-fraunces font-bold text-[#2E2A33] leading-snug">
                      {selectedDoc.title}
                    </h4>

                    <div className="p-3.5 rounded-xl bg-[#FAF8FD] border border-[#E5E1EC] text-xs text-[#6E6A75] space-y-1">
                      <p className="font-semibold text-[#2E2A33]">
                        Entidad emisora:
                      </p>
                      <p>{selectedDoc.institution}</p>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-[#6E6A75]">
                        Resumen normativo
                      </h5>
                      <p className="text-xs sm:text-sm text-[#4A4652] leading-relaxed">
                        {selectedDoc.description}
                      </p>
                    </div>

                    <div className="pt-4">
                      <a
                        href={selectedDoc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-3 px-4 bg-[#4A2270] hover:bg-[#381559] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        <span>Abrir documento oficial</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-[#6E6A75] text-xs">
                    Selecciona una fuente para ver sus detalles normativos.
                  </div>
                )}

                {/* Other official documents in library */}
                <div className="pt-6 border-t border-[#F0EDF5] space-y-3">
                  <h5 className="text-xs font-bold text-[#2E2A33] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#4A2270]" />
                    <span>Otras normas de nuestra biblioteca</span>
                  </h5>

                  <div className="space-y-2">
                    {allDocs.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => onSelectDoc?.(doc)}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          selectedDoc?.id === doc.id
                            ? 'bg-[#E9DFF5]/50 border-[#6B3FA0] font-semibold text-[#4A2270]'
                            : 'bg-white hover:bg-[#FAF8FD] border-[#E5E1EC] text-[#6E6A75]'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <span className="font-bold block text-[#2E2A33] truncate">
                            {doc.title}
                          </span>
                          <span className="text-[11px] text-[#6E6A75]">
                            {doc.institution}
                          </span>
                        </div>
                        <span
                          className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold border ${getBadgeStyle(
                            doc.badge
                          )}`}
                        >
                          {doc.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[#F0EDF5] bg-[#FAF8FD] text-center">
                <p className="text-[11px] text-[#6E6A75]">
                  PAN · Biblioteca clínica y legal del Perú
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

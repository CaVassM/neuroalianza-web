import React, { useState } from 'react';
import { ChevronDown, Sparkles, Clock, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CasePhase } from '../../types';
import {
  CATEGORIAS,
  categoriasRecomendadas,
  totalPreguntasRespondibles,
  type CategoriaBiblioteca,
  type PreguntaBiblioteca,
} from '../../data/biblioteca';

/** Fuentes oficiales a las que derivar cuando el corpus no alcanza. */
const ENLACES_OFICIALES = [
  {
    titulo: 'CONADIS',
    detalle: 'Certificado de discapacidad y derechos',
    url: 'https://www.gob.pe/conadis',
  },
  {
    titulo: 'MINSA · Salud mental',
    detalle: 'Centros de Salud Mental Comunitaria',
    url: 'https://www.gob.pe/minsa',
  },
  {
    titulo: 'Aprenda los signos. Reaccione pronto.',
    detalle: 'Hitos del desarrollo, CDC en español',
    url: 'https://www.cdc.gov/act-early/es/',
  },
  {
    titulo: 'Autism Speaks en español',
    detalle: 'Guías y kits para familias',
    url: 'https://www.autismspeaks.org/recursos-autismo',
  },
];

interface Props {
  fase: CasePhase;
  /** Lanza la pregunta al asistente. */
  onPreguntar: (texto: string) => void;
  /** Bloquea la interacción mientras el asistente está respondiendo. */
  ocupado?: boolean;
}

const Pregunta: React.FC<{
  pregunta: PreguntaBiblioteca;
  onPreguntar: (texto: string) => void;
  ocupado?: boolean;
}> = ({ pregunta, onPreguntar, ocupado }) => {
  // Sin material que la respalde, el asistente contestaría "No tengo esa
  // información en mis fuentes" tras hacer esperar. Mejor decirlo antes.
  if (!pregunta.enCorpus) {
    return (
      <div className="w-full text-left px-3.5 py-2.5 rounded-xl border border-[#F0EDF5] bg-[#FAFAFB] flex items-center justify-between gap-2.5 cursor-not-allowed">
        <span className="text-[13px] text-[#A9A4B0] leading-snug">{pregunta.texto}</span>
        <span
          className="flex items-center gap-1 text-[10px] font-bold text-[#8A8594] bg-[#F0EDF5] px-1.5 py-0.5 rounded shrink-0"
          title="Todavía no tenemos documentos verificados que respalden esta respuesta"
        >
          <Clock className="w-2.5 h-2.5" />
          Pronto
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={ocupado}
      onClick={() => onPreguntar(pregunta.texto)}
      className={`w-full text-left px-3.5 py-2.5 rounded-xl border border-[#E5E1EC] bg-white transition-all flex items-center justify-between gap-2.5 group ${
        ocupado
          ? 'opacity-60 cursor-not-allowed'
          : 'hover:border-[#6B3FA0]/60 hover:bg-[#FAF8FD] cursor-pointer'
      }`}
    >
      <span className="text-[13px] text-[#2E2A33] font-medium leading-snug">
        {pregunta.texto}
      </span>
      <Sparkles className="w-3.5 h-3.5 text-[#6B3FA0] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};

const Categoria: React.FC<{
  categoria: CategoriaBiblioteca;
  abiertaPorDefecto?: boolean;
  onPreguntar: (texto: string) => void;
  ocupado?: boolean;
}> = ({ categoria, abiertaPorDefecto = false, onPreguntar, ocupado }) => {
  const [abierta, setAbierta] = useState(abiertaPorDefecto);
  const disponibles = categoria.preguntas.filter((p) => p.enCorpus).length;

  return (
    <div className="border border-[#E5E1EC] rounded-2xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setAbierta(!abierta)}
        className="w-full px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-[#FAF8FD] transition-colors cursor-pointer"
        aria-expanded={abierta}
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <span className="text-lg leading-none shrink-0">{categoria.emoji}</span>
          <span className="text-[14px] font-bold text-[#2E2A33] text-left leading-snug">
            {categoria.titulo}
          </span>
        </span>
        <span className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold text-[#6E6A75]">
            {disponibles}/{categoria.preguntas.length}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-[#6E6A75] transition-transform ${
              abierta ? 'rotate-180' : ''
            }`}
          />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {abierta && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 space-y-2">
              {categoria.preguntas.map((p) => (
                <Pregunta
                  key={p.id}
                  pregunta={p}
                  onPreguntar={onPreguntar}
                  ocupado={ocupado}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Biblioteca de preguntas frecuentes.
 *
 * Vive dentro de "Para familias" porque cada pregunta se responde aquí mismo,
 * con el asistente y sus fuentes. Separarla en otra pestaña obligaría a la
 * familia a saltar de sitio para obtener la respuesta.
 */
export const BibliotecaPreguntas: React.FC<Props> = ({ fase, onPreguntar, ocupado }) => {
  const recomendadas = categoriasRecomendadas(fase);
  const idsRecomendadas = new Set(recomendadas.map((c) => c.id));
  const resto = CATEGORIAS.filter((c) => !idsRecomendadas.has(c.id));

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-[17px] font-fraunces font-bold text-[#2E2A33]">
          Recomendado para ti
        </h3>
        <p className="text-[13px] text-[#6E6A75] mt-0.5 leading-relaxed">
          Recursos según el momento de tu ruta. Toca una pregunta y el asistente te
          responde con sus fuentes.
        </p>
      </div>

      <div className="space-y-2.5">
        {recomendadas.map((c) => (
          <Categoria
            key={c.id}
            categoria={c}
            abiertaPorDefecto
            onPreguntar={onPreguntar}
            ocupado={ocupado}
          />
        ))}
      </div>

      <div className="pt-1">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8E8A95] mb-2.5">
          Todos los temas
        </h4>
        <div className="space-y-2.5">
          {resto.map((c) => (
            <Categoria
              key={c.id}
              categoria={c}
              onPreguntar={onPreguntar}
              ocupado={ocupado}
            />
          ))}
        </div>
      </div>

      <p className="text-[11.5px] text-[#8A8594] leading-relaxed pt-1">
        {totalPreguntasRespondibles()} preguntas tienen respuesta con documentos
        verificados. Las marcadas como <strong className="font-semibold">Pronto</strong>{' '}
        esperan material de fuentes peruanas.
      </p>

      {/* Salidas hacia fuentes oficiales.
          El corpus no cubre lo peruano, y varias preguntas de la biblioteca
          salen como "Pronto". Dejar a la familia sin ninguna alternativa sería
          cerrarle la puerta; estos son los sitios donde sí puede resolverlo. */}
      <div className="pt-4 border-t border-[#F0EDF5] space-y-2.5">
        <h4 className="text-[13px] font-bold text-[#2E2A33]">
          ¿Necesitas más información?
        </h4>
        <p className="text-[12.5px] text-[#6E6A75] leading-relaxed">
          Estos enlaces oficiales complementan lo que encuentras aquí:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ENLACES_OFICIALES.map((enlace) => (
            <a
              key={enlace.url}
              href={enlace.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1EC] hover:border-[#4A2270] transition-all group"
            >
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold text-[#2E2A33] truncate">
                  {enlace.titulo}
                </span>
                <span className="block text-[11.5px] text-[#6E6A75] truncate">
                  {enlace.detalle}
                </span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-[#4A2270] shrink-0 group-hover:scale-110 transition-transform" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

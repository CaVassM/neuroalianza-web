import { CasePhase } from '../types';

/**
 * Biblioteca de preguntas frecuentes.
 *
 * Cada pregunta se lanza tal cual al asistente, que responde con el corpus
 * verificado y cita sus fuentes. Por eso `enCorpus` no es decorativo: marca si
 * hoy existe material que respalde la respuesta.
 *
 * Las que NO tienen respaldo se muestran igual, atenuadas. Ocultarlas daría a
 * entender que el tema no importa; mostrarlas activas llevaría a la familia a
 * un "No tengo esa información en mis fuentes" después de esperar. Verlas
 * marcadas dice la verdad: el tema está contemplado y el material está en
 * camino.
 *
 * ESTADO DEL CORPUS: 8 documentos, todos internacionales (Autism Speaks, CDC,
 * ECHO Autism, FIRST WORDS). De ahí que las categorías "Escuela" y "Mi ruta de
 * atención" estén casi enteras sin respaldo: dependen de normativa peruana que
 * todavía no está en /docs. Añadirla ahí activa estas preguntas sin tocar código.
 */

export interface PreguntaBiblioteca {
  id: string;
  texto: string;
  /** ¿Hay documentos en el corpus que respalden la respuesta? */
  enCorpus: boolean;
}

export interface CategoriaBiblioteca {
  id: string;
  emoji: string;
  titulo: string;
  /** Fases de la ruta para las que esta categoría es lo más pertinente. */
  fasesRecomendadas?: CasePhase[];
  preguntas: PreguntaBiblioteca[];
}

export const CATEGORIAS: CategoriaBiblioteca[] = [
  {
    id: 'esperando',
    emoji: '🩺',
    titulo: 'Mientras esperas tu evaluación',
    fasesRecomendadas: [1, 2, 3],
    preguntas: [
      { id: 'tamizaje-vs-dx', texto: 'Tamizaje y diagnóstico: ¿cuál es la diferencia?', enCorpus: true },
      { id: 'como-evalua', texto: '¿Cómo se evalúa el autismo?', enCorpus: true },
      { id: 'que-esperar', texto: '¿Qué esperar de una evaluación?', enCorpus: true },
      { id: 'preparar-consulta', texto: '¿Cómo prepararte para la consulta?', enCorpus: false },
      { id: 'mientras-esperas', texto: '¿Qué hacer mientras esperas?', enCorpus: true },
    ],
  },
  {
    id: 'post-diagnostico',
    emoji: '🧩',
    titulo: 'Primeros pasos después del diagnóstico',
    fasesRecomendadas: [4, 5],
    preguntas: [
      { id: 'entender-dx', texto: 'Entendiendo el diagnóstico', enCorpus: true },
      { id: 'despues-dx', texto: '¿Qué hacemos después del diagnóstico?', enCorpus: true },
      { id: 'profesionales', texto: '¿Qué profesionales pueden participar?', enCorpus: true },
      { id: 'organizar-recos', texto: '¿Cómo organizar las recomendaciones recibidas?', enCorpus: false },
      { id: 'siguientes-pasos', texto: '¿Cuáles son los siguientes pasos?', enCorpus: true },
    ],
  },
  {
    id: 'conociendo',
    emoji: '🧠',
    titulo: 'Conociendo el autismo',
    preguntas: [
      { id: 'que-es', texto: '¿Qué es el autismo?', enCorpus: true },
      { id: 'comunicacion-lenguaje', texto: 'Comunicación y lenguaje', enCorpus: true },
      { id: 'sensorial', texto: 'Procesamiento sensorial', enCorpus: true },
      { id: 'regulacion', texto: 'Regulación y comportamiento', enCorpus: true },
      { id: 'fortalezas', texto: 'Fortalezas y necesidades', enCorpus: true },
      { id: 'mitos', texto: 'Mitos y realidades', enCorpus: true },
    ],
  },
  {
    id: 'apoyando',
    emoji: '🌱',
    titulo: 'Apoyando a mi hijo/a',
    fasesRecomendadas: [5, 6],
    preguntas: [
      { id: 'apoyo-comunicacion', texto: 'Comunicación', enCorpus: true },
      { id: 'juego', texto: 'Juego y aprendizaje', enCorpus: true },
      { id: 'rutinas', texto: 'Rutinas y anticipación', enCorpus: true },
      { id: 'regulacion-emocional', texto: 'Regulación emocional', enCorpus: true },
      { id: 'apoyo-sensorial', texto: 'Procesamiento sensorial', enCorpus: true },
      { id: 'sueno', texto: 'Sueño', enCorpus: true },
      { id: 'alimentacion', texto: 'Alimentación', enCorpus: true },
      { id: 'seguridad', texto: 'Seguridad', enCorpus: true },
    ],
  },
  {
    id: 'cuidadores',
    emoji: '💜',
    titulo: 'Para familias y cuidadores',
    preguntas: [
      { id: 'abrumado', texto: 'Me siento abrumado/a, ¿por dónde empiezo?', enCorpus: true },
      { id: 'acompanar', texto: 'Cómo acompañar a mi hijo/a', enCorpus: true },
      { id: 'hablar-familia', texto: 'Cómo hablar del autismo con la familia', enCorpus: true },
      { id: 'red-apoyo', texto: 'Cómo construir una red de apoyo', enCorpus: true },
      { id: 'bienestar', texto: 'Bienestar del cuidador', enCorpus: true },
    ],
  },
  {
    id: 'escuela',
    emoji: '🎒',
    titulo: 'Escuela',
    // El manual describe el sistema educativo de EE. UU. (IEP). Responder desde
    // ahí sería darle a una familia peruana un trámite que no existe aquí.
    preguntas: [
      { id: 'hablar-colegio', texto: 'Cómo hablar con el colegio', enCorpus: false },
      { id: 'apoyos-aula', texto: 'Apoyos en el aula', enCorpus: false },
      { id: 'inclusion', texto: 'Inclusión educativa', enCorpus: false },
      { id: 'familia-escuela', texto: 'Comunicación familia–escuela', enCorpus: false },
      { id: 'convivencia', texto: 'Convivencia', enCorpus: false },
    ],
  },
  {
    id: 'ruta',
    emoji: '🧭',
    titulo: 'Mi ruta de atención',
    // Todas dependen de normativa peruana. El corpus todavía no la tiene.
    preguntas: [
      { id: 'que-es-cred', texto: '¿Qué es CRED?', enCorpus: false },
      { id: 'que-es-referencia', texto: '¿Qué es una referencia?', enCorpus: false },
      { id: 'sis', texto: '¿Cómo funciona el SIS?', enCorpus: false },
      { id: 'essalud', texto: '¿Cómo funciona EsSalud?', enCorpus: false },
      { id: 'sin-cita', texto: '¿Qué hago si no encuentro cita?', enCorpus: false },
      { id: 'referencia-observada', texto: '¿Qué hago si mi referencia fue observada?', enCorpus: false },
      { id: 'verificar', texto: '¿Cómo verificar un profesional o establecimiento?', enCorpus: false },
    ],
  },
];

/**
 * Categorías que se destacan como "Recomendado para ti".
 *
 * Se eligen por la fase de la ruta: a quien todavía espera su evaluación no le
 * sirve lo mismo que a quien ya tiene un diagnóstico en la mano.
 */
export function categoriasRecomendadas(fase: CasePhase = 1): CategoriaBiblioteca[] {
  const porFase = CATEGORIAS.filter((c) => c.fasesRecomendadas?.includes(fase));
  // Siempre acompañamos con algo que sirva en cualquier momento de la ruta.
  const general = CATEGORIAS.find((c) => c.id === 'conociendo')!;
  return porFase.length ? [...porFase, general] : [general];
}

export function totalPreguntasRespondibles(): number {
  return CATEGORIAS.reduce(
    (n, c) => n + c.preguntas.filter((p) => p.enCorpus).length,
    0
  );
}

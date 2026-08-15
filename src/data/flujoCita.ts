import { CasePhase, ServicioCita } from '../types';

export type { ServicioCita };

/**
 * Qué se le pregunta a la familia cuando vuelve de una cita.
 *
 * Está como DATOS y no como componentes a propósito: los textos los escribe el
 * equipo clínico, y añadir un servicio nuevo debe ser editar esta tabla, no
 * tocar la interfaz. Cada servicio tiene su propio juego de emociones e
 * indicaciones porque no se sale igual de un control CRED que de una consulta
 * de psiquiatría.
 */

export interface OpcionSentimiento {
  id: string;
  emoji: string;
  etiqueta: string;
  /** Lo que se le responde. Acompaña; nunca interpreta síntomas ni diagnostica. */
  respuesta: string;
}

export interface OpcionIndicacion {
  id: string;
  etiqueta: string;
  /** Servicio al que la cita derivó. Habilita ese flujo para la próxima vez. */
  derivaA?: ServicioCita;
  /** Fase mínima a la que llega el caso al elegir esta opción. */
  avanzaA?: CasePhase;
  /** Qué hacer ahora, en una línea. */
  siguientePaso: string;
}

export interface FlujoServicio {
  id: ServicioCita;
  nombre: string;
  descripcion: string;
  sentimientos: OpcionSentimiento[];
  indicaciones: OpcionIndicacion[];
}

export const FLUJOS: Record<ServicioCita, FlujoServicio> = {
  cred: {
    id: 'cred',
    nombre: 'Control CRED',
    descripcion: 'Control de Crecimiento y Desarrollo en tu centro de salud.',
    sentimientos: [
      {
        id: 'frustrado',
        emoji: '😣',
        etiqueta: 'Frustrado/a',
        respuesta:
          'Has estado buscando respuestas y puede ser frustrante sentir que el proceso continúa. Cada evaluación aporta información. Revisemos qué puedes hacer ahora.',
      },
      {
        id: 'dudas',
        emoji: '😕',
        etiqueta: 'Con dudas',
        respuesta:
          'Es normal que después de una cita queden preguntas. Registremos qué te indicaron para ayudarte a organizar lo que sigue.',
      },
      {
        id: 'acompanado',
        emoji: '😊',
        etiqueta: 'Acompañado/a',
        respuesta:
          'Qué bueno que te hayas sentido acompañado/a. Guarda este avance y continuemos juntos con el siguiente paso.',
      },
      {
        id: 'abrumado',
        emoji: '😵',
        etiqueta: 'Abrumado/a',
        respuesta:
          'No necesitas resolver toda la ruta de una sola vez. Vamos paso a paso: primero cuéntanos qué te indicaron en esta cita.',
      },
    ],
    indicaciones: [
      {
        id: 'sin-senales',
        etiqueta: 'No encontraron señales de alerta por ahora',
        siguientePaso:
          'Continúa con los controles CRED de rutina y vuelve a evaluar si notas algo nuevo.',
      },
      {
        id: 'regresar',
        etiqueta: 'Me pidieron regresar para volver a evaluar',
        siguientePaso:
          'Agenda esa segunda cita apenas puedas y anota la fecha en tu ruta.',
      },
      {
        id: 'deriva-pediatria',
        etiqueta: 'Me derivaron a pediatría',
        derivaA: 'pediatria',
        avanzaA: 4,
        siguientePaso:
          'Guarda la hoja de referencia y saca cita en pediatría. Es tu siguiente paso en la ruta.',
      },
      {
        id: 'no-entendi',
        etiqueta: 'No entendí bien qué debo hacer después',
        siguientePaso:
          'No pasa nada. Pregúntale al asistente de PAN o vuelve a admisión y pide que te lo expliquen otra vez.',
      },
    ],
  },

  pediatria: {
    id: 'pediatria',
    nombre: 'Pediatría',
    descripcion: 'Consulta con el pediatra.',
    sentimientos: [
      {
        id: 'tranquilo',
        emoji: '😊',
        etiqueta: 'Tranquilo/a',
        respuesta:
          'Qué bueno que esta consulta te haya dado tranquilidad. 💜 Ya completaste un paso más. Veamos qué sigue.',
      },
      {
        id: 'dudas',
        emoji: '😕',
        etiqueta: 'Con dudas',
        respuesta:
          'Es posible que hayan quedado algunas preguntas. 💜 Revisemos qué te indicaron para tener más claro tu siguiente paso.',
      },
      {
        id: 'frustrado',
        emoji: '😣',
        etiqueta: 'Frustrado/a',
        respuesta:
          'Sabemos que encontrar dificultades puede ser frustrante. 💜 Revisemos qué ocurrió y cómo puedes continuar.',
      },
    ],
    indicaciones: [
      {
        id: 'sin-senales',
        etiqueta: 'No encontraron señales de alerta por ahora',
        siguientePaso: 'Mantén los controles de rutina y observa el desarrollo día a día.',
      },
      {
        id: 'seguimiento',
        etiqueta: 'Me pidieron regresar para seguimiento',
        siguientePaso: 'Anota la fecha de control y llévala contigo en tu ruta.',
      },
      {
        id: 'deriva-neuro',
        etiqueta: 'Me derivaron a Neuropediatría',
        derivaA: 'neuropediatria',
        siguientePaso: 'Guarda la referencia y gestiona la cita con neuropediatría.',
      },
      {
        id: 'deriva-psiq',
        etiqueta: 'Me derivaron a Psiquiatría pediátrica',
        derivaA: 'psiquiatria',
        siguientePaso: 'Guarda la referencia y gestiona la cita con psiquiatría pediátrica.',
      },
      {
        id: 'otras-eval',
        etiqueta: 'Me solicitaron otras evaluaciones',
        siguientePaso: 'Anota qué evaluaciones te pidieron y dónde puedes hacerlas.',
      },
      {
        id: 'no-entendi',
        etiqueta: 'No entendí bien qué debo hacer después',
        siguientePaso:
          'Pregúntale al asistente de PAN o pide que te repitan las indicaciones antes de salir.',
      },
    ],
  },

  neuropediatria: {
    id: 'neuropediatria',
    nombre: 'Neuropediatría',
    descripcion: 'Evaluación con neuropediatra.',
    sentimientos: [
      {
        id: 'tranquilo',
        emoji: '😊',
        etiqueta: 'Tranquilo/a',
        respuesta:
          'Nos alegra que esta evaluación te haya dado tranquilidad. 💜 Ahora organicemos lo que sigue.',
      },
      {
        id: 'dudas',
        emoji: '😕',
        etiqueta: 'Con dudas',
        respuesta:
          'Después de una evaluación pueden quedar preguntas. 💜 Revisemos las indicaciones para ayudarte a entender tu siguiente paso.',
      },
      {
        id: 'preocupado',
        emoji: '😟',
        etiqueta: 'Preocupado/a',
        respuesta:
          'Entendemos que esta etapa puede generar preocupación. 💜 Vamos paso a paso; revisemos qué te indicaron y qué puedes hacer ahora.',
      },
    ],
    indicaciones: [
      {
        id: 'mas-eval',
        etiqueta: 'Necesitan evaluar un poco más',
        siguientePaso: 'Anota qué falta evaluar y cuándo te citaron de nuevo.',
      },
      {
        id: 'confirman-tea',
        etiqueta: 'Confirmaron el diagnóstico de TEA',
        avanzaA: 5,
        siguientePaso:
          'Registra el diagnóstico en tu ruta: qué profesional lo emitió y en qué mes.',
      },
      {
        id: 'no-confirman',
        etiqueta: 'Por ahora no pueden confirmar el diagnóstico',
        siguientePaso: 'Mantén el seguimiento. No confirmar hoy no cierra ninguna puerta.',
      },
      {
        id: 'iniciar-terapias',
        etiqueta: 'Me indicaron iniciar terapias o apoyos',
        siguientePaso: 'Anota qué terapias te indicaron y dónde puedes acceder a ellas.',
      },
      {
        id: 'otro-especialista',
        etiqueta: 'Me derivaron a otro especialista',
        siguientePaso: 'Guarda la referencia y gestiona esa nueva cita.',
      },
      {
        id: 'seguimiento',
        etiqueta: 'Me pidieron regresar para seguimiento',
        siguientePaso: 'Anota la fecha de control en tu ruta.',
      },
      {
        id: 'no-entendi',
        etiqueta: 'No entendí bien qué debo hacer después',
        siguientePaso: 'Pregúntale al asistente de PAN para ordenar lo que te dijeron.',
      },
    ],
  },

  psiquiatria: {
    id: 'psiquiatria',
    nombre: 'Psiquiatría pediátrica',
    descripcion: 'Consulta con psiquiatría pediátrica.',
    sentimientos: [
      {
        id: 'tranquilo',
        emoji: '😊',
        etiqueta: 'Tranquilo/a',
        respuesta:
          'Qué bueno que esta atención te haya dado tranquilidad. 💜 Has avanzado un paso más. Veamos qué sigue.',
      },
      {
        id: 'dudas',
        emoji: '😕',
        etiqueta: 'Con dudas',
        respuesta:
          'Puede quedar información por comprender después de esta consulta. 💜 Organicemos lo que te indicaron para que tengas más claro cómo continuar.',
      },
      {
        id: 'abrumado',
        emoji: '😵',
        etiqueta: 'Abrumado/a',
        respuesta:
          'Puede ser mucha información para procesar. 💜 No tienes que resolver todo ahora; avancemos un paso a la vez.',
      },
    ],
    indicaciones: [
      {
        id: 'confirman-tea',
        etiqueta: 'Confirmaron el diagnóstico de TEA',
        avanzaA: 5,
        siguientePaso:
          'Registra el diagnóstico en tu ruta: qué profesional lo emitió y en qué mes.',
      },
      {
        id: 'no-confirman',
        etiqueta: 'Por ahora no pueden confirmar el diagnóstico',
        siguientePaso: 'Mantén el seguimiento; te indicarán cuándo volver.',
      },
      {
        id: 'otras-eval',
        etiqueta: 'Necesitan realizar otras evaluaciones',
        siguientePaso: 'Anota qué evaluaciones faltan y dónde hacerlas.',
      },
      {
        id: 'tratamiento',
        etiqueta: 'Me indicaron iniciar tratamiento o apoyos',
        siguientePaso:
          'Anota las indicaciones tal como te las dieron. Cualquier duda sobre medicación la resuelve el médico tratante.',
      },
      {
        id: 'otro-profesional',
        etiqueta: 'Me derivaron a otro profesional',
        siguientePaso: 'Guarda la referencia y gestiona esa cita.',
      },
      {
        id: 'seguimiento',
        etiqueta: 'Me pidieron regresar para seguimiento',
        siguientePaso: 'Anota la fecha de control en tu ruta.',
      },
      {
        id: 'no-entendi',
        etiqueta: 'No entendí bien qué debo hacer después',
        siguientePaso: 'Pregúntale al asistente de PAN para ordenar lo que te dijeron.',
      },
    ],
  },

  especialista: {
    id: 'especialista',
    nombre: 'Médico especialista',
    descripcion: 'Otra especialidad.',
    sentimientos: [],
    indicaciones: [],
  },
};

/**
 * Servicios que se ofrecen al preguntar "¿a qué servicio fuiste?".
 *
 * Solo CRED está disponible de entrada: es la puerta de entrada del sistema
 * peruano. Pediatría se habilita cuando una cita anterior derivó ahí, y lo
 * mismo con neuropediatría y psiquiatría. Así la ruta se abre sola conforme
 * la familia avanza, en vez de ofrecer servicios a los que nadie la mandó.
 */
export const SERVICIOS_INICIALES: ServicioCita[] = ['cred'];

export const ORDEN_SERVICIOS: ServicioCita[] = [
  'cred',
  'pediatria',
  'neuropediatria',
  'psiquiatria',
  'especialista',
];

export function serviciosDisponibles(derivaciones: ServicioCita[] = []): ServicioCita[] {
  const activos = new Set<ServicioCita>([...SERVICIOS_INICIALES, ...derivaciones]);
  // "especialista" no tiene flujo escrito todavía: se muestra como próximamente.
  return ORDEN_SERVICIOS.filter((s) => activos.has(s) && FLUJOS[s].indicaciones.length > 0);
}

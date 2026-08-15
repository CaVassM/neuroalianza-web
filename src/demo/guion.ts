import { CasePhase, ScreenType, UserProfile } from '../types';
import { calcularPuntaje } from '../dominio/tamizaje';

/**
 * Guion del recorrido de demostración.
 *
 * Cada paso dice a qué pantalla ir, qué contar y en qué estado dejar el caso.
 * El recorrido NO teclea en los formularios ni pulsa los controles internos de
 * cada vista: navega y siembra el estado. Conducir cada widget por dentro
 * (el asistente del cuestionario, los filtros del mapa, el modal de la cita)
 * exigiría levantar el estado de cuatro componentes, y no compensa el riesgo
 * de tocarlos justo antes de una demostración.
 *
 * Lo que sí se conduce de verdad: la navegación, el caso completo, el scroll a
 * la sección del mapa, la pantalla de resultado del tamizaje y la consulta al
 * asistente.
 */

export interface PasoDemo {
  id: string;
  pantalla: ScreenType;
  titulo: string;
  detalle: string;
  /** Cuánto se queda en este paso, en milisegundos. */
  duracion: number;
  /** Deja el caso en el estado que ese paso necesita mostrar. */
  perfil?: (base: UserProfile) => UserProfile;
  /** Id del elemento al que hacer scroll una vez pintada la pantalla. */
  scrollA?: string;
  /** Pregunta que se lanza al asistente al llegar aquí. */
  pregunta?: string;
}

/**
 * Respuestas que dan 5 puntos: probabilidad MODERADA (semáforo ámbar).
 *
 * Se eligió el tramo intermedio a propósito. El bajo no enseña la derivación y
 * el alto sale alarmante en una demostración pública; el moderado muestra el
 * caso más habitual y su recomendación de acudir a control CRED.
 *
 * Los ítems 2, 5 y 12 puntúan invertidos (ver dominio/tamizaje.ts).
 */
export const RESPUESTAS_DEMO: Record<number, 'si' | 'no'> = (() => {
  const respuestas: Record<number, 'si' | 'no'> = {};
  for (let n = 1; n <= 20; n++) respuestas[n] = 'si';
  respuestas[2] = 'si';   // invertido → suma
  respuestas[5] = 'si';   // invertido → suma
  respuestas[12] = 'no';  // invertido → no suma
  respuestas[7] = 'no';
  respuestas[11] = 'no';
  respuestas[20] = 'no';
  return respuestas;
})();

export const PUNTAJE_DEMO = calcularPuntaje(RESPUESTAS_DEMO);

/**
 * Cuenta sintetizada. Miraflores no es decorativo: es el único distrito con
 * establecimientos cargados, así que en cualquier otro el mapa saldría vacío.
 * Y la fecha de nacimiento deja al niño en el rango de 16 a 30 meses en que el
 * M-CHAT-R/F es aplicable.
 */
export function cuentaSintetizada(): UserProfile {
  return {
    name: '',
    email: 'demo@pan.pe',
    phone: '987654321',
    child: {
      nickname: 'Luciana',
      birthMonth: 'Diciembre',
      birthYear: '2024',
      avatarId: 'cat',
    },
    location: { department: 'Lima', province: 'Lima', district: 'Miraflores' },
    insurance: 'sis',
    fase: 1 as CasePhase,
    screeningResult: null,
    diagnosis: null,
    registros: [],
    derivaciones: [],
  };
}

const registro = (titulo: string, detalle: string, fase: CasePhase) => ({
  fecha: new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }),
  titulo,
  detalle,
  tipo: 'fase_update' as const,
  origen: 'familia' as const,
  faseNum: fase,
});

export const GUION: PasoDemo[] = [
  {
    id: 'registro',
    pantalla: 'signup',
    titulo: 'Crear una cuenta',
    detalle: 'Solo correo y celular. No pedimos DNI ni el nombre del cuidador.',
    duracion: 4500,
    perfil: () => cuentaSintetizada(),
  },
  {
    id: 'inicio',
    pantalla: 'dashboard',
    titulo: 'Cuenta recién creada',
    detalle: 'El caso arranca en fase 1, sin tamizaje y sin historial inventado.',
    duracion: 5000,
    perfil: (u) => ({
      ...u,
      caseCode: 'NA-DEMO1',
      fase: 2,
      registros: [registro('Registro de caso completado', 'Caso NA-DEMO1 creado por la familia.', 2)],
    }),
  },
  {
    id: 'ruta-pendiente',
    pantalla: 'mi-ruta',
    titulo: 'Tu ruta de atención',
    detalle: 'En fase 2 la ruta propone lo único que corresponde: hacer el tamizaje.',
    duracion: 6000,
  },
  {
    id: 'evaluaciones',
    pantalla: 'evaluaciones',
    titulo: 'Evaluaciones',
    detalle: 'El M-CHAT-R/F está disponible. Aún no se ha realizado.',
    duracion: 5000,
  },
  {
    id: 'tamizaje',
    pantalla: 'cuestionario',
    titulo: 'Tamizaje completado',
    detalle: `20 preguntas respondidas. Puntaje ${PUNTAJE_DEMO}/20: probabilidad moderada.`,
    duracion: 8000,
    perfil: (u) => ({
      ...u,
      fase: 3,
      screeningAnswers: RESPUESTAS_DEMO,
      screeningResult: {
        score: PUNTAJE_DEMO,
        nivel: 'moderada',
        completedAt: new Date().toISOString(),
      },
      registros: [
        ...(u.registros || []),
        registro(
          'Tamizaje M-CHAT-R/F completado',
          `Puntaje: ${PUNTAJE_DEMO}/20 (moderada). Autoreportado por la familia.`,
          3
        ),
      ],
    }),
  },
  {
    id: 'ruta-activa',
    pantalla: 'mi-ruta',
    titulo: 'La ruta ya puede orientar',
    detalle: 'Con el resultado en mano, la ruta muestra los pasos según el seguro SIS.',
    duracion: 6000,
  },
  {
    id: 'mapa',
    pantalla: 'mi-ruta',
    titulo: 'Dónde atenderte',
    detalle: 'Establecimientos cercanos, con el radio de búsqueda y filtros por seguro y nivel.',
    duracion: 9000,
    scrollA: 'seccion-donde-atenderte',
  },
  {
    id: 'cita-pediatria',
    pantalla: 'mi-ruta',
    titulo: 'Primera cita registrada',
    detalle: 'Control CRED. La familia contó cómo le fue y la derivaron a pediatría.',
    duracion: 6000,
    perfil: (u) => ({
      ...u,
      fase: 4,
      derivaciones: ['pediatria'],
      registros: [
        ...(u.registros || []),
        registro(
          'Cita en Control CRED: Me derivaron a pediatría',
          'La familia se sintió con dudas. Guarda la hoja de referencia y saca cita en pediatría.',
          4
        ),
      ],
    }),
  },
  {
    id: 'diagnostico',
    pantalla: 'mi-ruta',
    titulo: 'Diagnóstico confirmado',
    detalle: 'Tras neuropediatría el caso llega a fase 5 y se abre el asistente.',
    duracion: 6000,
    perfil: (u) => ({
      ...u,
      fase: 5,
      derivaciones: ['pediatria', 'neuropediatria'],
      diagnosis: {
        profesional: 'neurologo',
        mes: 'Agosto',
        ano: '2026',
        registradoAt: new Date().toISOString(),
      },
      registros: [
        ...(u.registros || []),
        registro(
          'Cita en Neuropediatría: Confirmaron el diagnóstico de TEA',
          'La familia se sintió con dudas. Registra el diagnóstico en tu ruta.',
          5
        ),
      ],
    }),
  },
  {
    id: 'asistente',
    pantalla: 'familias',
    titulo: 'Asistente de orientación',
    detalle: 'Responde solo con el corpus verificado y cita sus fuentes.',
    duracion: 20000,
    pregunta: '¿Qué es el autismo?',
  },
];

export const DURACION_TOTAL = GUION.reduce((t, p) => t + p.duracion, 0);

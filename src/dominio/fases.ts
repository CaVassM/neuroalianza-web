import { Caso, Evento, Fase, Origen, TipoEvento, Tamizaje } from '../types/dominio';
import { validarInvariantesCaso } from './invariantes';

export interface TransicionDef {
  faseOrigen: Fase;
  faseDestino: Fase;
  tipoEvento: TipoEvento;
  autorizado: Origen;
  descripcion: string;
  guarda?: (caso: Caso, payload?: any) => { ok: boolean; motivo?: string };
}

export const TRANSICIONES: TransicionDef[] = [
  {
    faseOrigen: 1,
    faseDestino: 2,
    tipoEvento: 'registro',
    autorizado: 'sistema',
    descripcion: 'Registro de caso completado',
  },
  {
    faseOrigen: 2,
    faseDestino: 3,
    tipoEvento: 'tamizaje',
    autorizado: 'sistema',
    descripcion: 'Cuestionario de tamizaje completado',
    guarda: (_caso, payload) => {
      const tamizaje = payload?.tamizaje as Tamizaje | undefined;
      if (!tamizaje || Object.keys(tamizaje.respuestas || {}).length !== 20) {
        return { ok: false, motivo: 'Se requiere un tamizaje completo con las 20 respuestas.' };
      }
      return { ok: true };
    },
  },
  {
    faseOrigen: 2,
    faseDestino: 5,
    tipoEvento: 'diagnostico',
    autorizado: 'familia',
    descripcion: 'Diagnóstico previo declarado por la familia (Entrada B)',
  },
  {
    faseOrigen: 3,
    faseDestino: 4,
    tipoEvento: 'establecimiento',
    autorizado: 'familia',
    descripcion: 'Asistencia a cita médica en establecimiento seleccionado ("Ya fui a mi cita")',
    guarda: (caso) => {
      if (!caso.establecimientoId) {
        return { ok: false, motivo: 'Debes seleccionar un establecimiento de salud primero.' };
      }
      return { ok: true };
    },
  },
  {
    faseOrigen: 3,
    faseDestino: 4,
    tipoEvento: 'atencion',
    autorizado: 'profesional',
    descripcion: 'Atención médica registrada por profesional en establecimiento',
    guarda: (_caso, payload) => {
      if (!payload?.establecimiento) {
        return { ok: false, motivo: 'El profesional debe especificar el establecimiento de atención.' };
      }
      return { ok: true };
    },
  },
  {
    faseOrigen: 4,
    faseDestino: 5,
    tipoEvento: 'diagnostico',
    autorizado: 'familia',
    descripcion: 'Confirmación de diagnóstico formal ("Ya tengo diagnóstico")',
  },
  {
    faseOrigen: 4,
    faseDestino: 5,
    tipoEvento: 'diagnostico',
    autorizado: 'profesional',
    descripcion: 'Diagnóstico o informe definitivo registrado por especialista',
    guarda: (_caso, payload) => {
      if (!payload?.establecimiento) {
        return { ok: false, motivo: 'Se requiere indicar el establecimiento del especialista.' };
      }
      return { ok: true };
    },
  },
  {
    faseOrigen: 5,
    faseDestino: 6,
    tipoEvento: 'terapia',
    autorizado: 'familia',
    descripcion: 'Inicio de terapias de apoyo registrado ("Ya inicié terapias")',
  },
];

export function puedeTransicionar(
  caso: Caso,
  faseDestino: Fase,
  autorizado: Origen,
  tipoEvento: TipoEvento,
  payload?: any
): { ok: boolean; motivo?: string; transicion?: TransicionDef } {
  if (faseDestino <= caso.faseActual) {
    return {
      ok: false,
      motivo: `El caso ya se encuentra en o superó la Fase ${faseDestino}. Las fases no pueden retroceder.`,
    };
  }

  // Find valid transition definition
  const trans = TRANSICIONES.find(
    (t) =>
      t.faseOrigen === caso.faseActual &&
      t.faseDestino === faseDestino &&
      t.autorizado === autorizado &&
      t.tipoEvento === tipoEvento
  );

  if (!trans) {
    return {
      ok: false,
      motivo: `Transición no permitida directamente de Fase ${caso.faseActual} a Fase ${faseDestino} para el origen '${autorizado}'.`,
    };
  }

  if (trans.guarda) {
    const resGuarda = trans.guarda(caso, payload);
    if (!resGuarda.ok) {
      return { ok: false, motivo: resGuarda.motivo, transicion: trans };
    }
  }

  return { ok: true, transicion: trans };
}

export function ejecutarTransicion(
  caso: Caso,
  faseDestino: Fase,
  autorizado: Origen,
  tipoEvento: TipoEvento,
  descripcion: string,
  observaciones?: string,
  establecimientoNombre?: string,
  payload?: any
): { casoActualizado: Caso; eventoCreado: Evento; fueRechazadoPorRetroceso: boolean } {
  const nowIso = new Date().toISOString();
  const idEvento = `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Event is ALWAYS created
  const eventoCreado: Evento = {
    id: idEvento,
    casoCodigo: caso.codigo,
    fase: faseDestino,
    tipo: tipoEvento,
    descripcion,
    origen: autorizado,
    establecimiento: establecimientoNombre || null,
    observaciones: observaciones ? observaciones.substring(0, 200) : null,
    fecha: nowIso,
  };

  // Rule 1: If backward or same, phase does NOT change, but event is logged
  if (faseDestino <= caso.faseActual) {
    return {
      casoActualizado: { ...caso, actualizadoEn: nowIso },
      eventoCreado,
      fueRechazadoPorRetroceso: true,
    };
  }

  const evaluacion = puedeTransicionar(caso, faseDestino, autorizado, tipoEvento, payload);
  if (!evaluacion.ok) {
    throw new Error(`Error en la máquina de estados: ${evaluacion.motivo}`);
  }

  const nuevoCaso: Caso = {
    ...caso,
    faseActual: faseDestino,
    actualizadoEn: nowIso,
  };

  // Assert invariant
  validarInvariantesCaso(nuevoCaso, caso);

  return {
    casoActualizado: nuevoCaso,
    eventoCreado,
    fueRechazadoPorRetroceso: false,
  };
}

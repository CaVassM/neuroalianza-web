import { Establecimiento } from '../types';

export type ServicioDeEntrada = 'pediatria' | 'cred' | 'ninguno';

export interface Derivacion {
  servicio: ServicioDeEntrada;
  etiqueta: string;
  instruccion: string;
}

/**
 * Por qué servicio debe entrar la familia a un establecimiento.
 *
 * La regla es la del sistema peruano: si el establecimiento tiene pediatría,
 * se pide cita ahí directamente. Si no la tiene —que es lo normal en un puesto
 * o centro de salud I-1/I-2— la puerta de entrada es el control CRED, y desde
 * ahí se emite la referencia al especialista.
 *
 * Los nombres de servicio en RENIPRESS no son uniformes ("Pediatría",
 * "Pediatría Especializada", "Pediatría del Desarrollo", "Control CRED",
 * "Control de Crecimiento y Desarrollo (CRED)"), así que se busca por subcadena
 * en vez de comparar contra una lista cerrada.
 */
export function derivacionRecomendada(establecimiento: Establecimiento): Derivacion {
  const servicios = (establecimiento.servicios || []).map((s) => s.toLowerCase());

  const tienePediatria = servicios.some((s) => s.includes('pediatr'));
  const tieneCred = servicios.some(
    (s) => s.includes('cred') || s.includes('crecimiento y desarrollo')
  );

  if (tienePediatria) {
    return {
      servicio: 'pediatria',
      etiqueta: 'Pide cita en Pediatría',
      instruccion:
        'Este establecimiento cuenta con pediatría. Pide tu cita directamente en ese servicio y lleva el resultado del tamizaje.',
    };
  }

  if (tieneCred) {
    return {
      servicio: 'cred',
      etiqueta: 'Entra por Control CRED',
      instruccion:
        'Este establecimiento no tiene pediatría. Tu puerta de entrada es el control CRED: ahí evalúan el desarrollo y emiten la referencia al especialista si corresponde.',
    };
  }

  return {
    servicio: 'ninguno',
    etiqueta: 'Consulta en admisión',
    instruccion:
      'No tenemos registrado si este establecimiento atiende pediatría o CRED. Pregunta en admisión por el control de crecimiento y desarrollo.',
  };
}

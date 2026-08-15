import { Nivel } from '../types/dominio';

export const INVERTIDOS = [2, 5, 12];
export const EDAD_MIN = 16;
export const EDAD_MAX = 30;

export function calcularPuntaje(respuestas: Record<number, 'si' | 'no'>): number {
  if (!respuestas || typeof respuestas !== 'object') {
    throw new Error('Las respuestas deben ser un objeto válido.');
  }

  const keys = Object.keys(respuestas).map(Number);
  if (keys.length !== 20) {
    throw new Error(`Se requieren exactamente 20 respuestas. Recibidas: ${keys.length}`);
  }

  for (let i = 1; i <= 20; i++) {
    if (!(i in respuestas) || (respuestas[i] !== 'si' && respuestas[i] !== 'no')) {
      throw new Error(`Falta o es inválida la respuesta para el ítem ${i}.`);
    }
  }

  let puntaje = 0;
  for (let n = 1; n <= 20; n++) {
    const r = respuestas[n];
    const esInvertido = INVERTIDOS.includes(n);
    if (esInvertido ? r === 'si' : r === 'no') {
      puntaje += 1;
    }
  }

  return puntaje;
}

export function clasificar(puntaje: number): Nivel {
  if (typeof puntaje !== 'number' || isNaN(puntaje) || puntaje < 0 || puntaje > 20) {
    throw new Error(`Puntaje fuera de rango válido (0-20): ${puntaje}`);
  }

  if (puntaje <= 2) return 'baja';
  if (puntaje <= 7) return 'moderada';
  return 'alta';
}

export function esAplicable(edadMeses: number): boolean {
  return typeof edadMeses === 'number' && edadMeses >= EDAD_MIN && edadMeses <= EDAD_MAX;
}

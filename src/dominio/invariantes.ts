import { Caso, Tamizaje, Evento } from '../types/dominio';
import { calcularPuntaje } from './tamizaje';

export function validarInvariantesCaso(caso: Caso, prevCaso?: Caso): void {
  // 2. Sin DNI, ni nombre completo, ni día de nacimiento
  if ('dni' in caso || 'nombreCompleto' in caso || 'direccion' in caso || 'nacimientoDia' in caso) {
    throw new Error(`Invariante violado: El modelo Caso contiene campos prohibidos (DNI/Nombre/Dirección/Día).`);
  }

  // 4. faseActual nunca disminuye
  if (prevCaso && caso.faseActual < prevCaso.faseActual) {
    throw new Error(`Invariante violado: faseActual descendió de ${prevCaso.faseActual} a ${caso.faseActual}.`);
  }

  // 5. codigo es inmutable
  if (prevCaso && caso.codigo !== prevCaso.codigo) {
    throw new Error(`Invariante violado: el código del caso cambió de ${prevCaso.codigo} a ${caso.codigo}.`);
  }

  // Ubigeo debe empezar en 1501
  if (!caso.ubigeo.startsWith('1501')) {
    throw new Error(`Invariante violado: ubigeo debe ser de Lima Metropolitana (empieza en 1501). Recibido: ${caso.ubigeo}`);
  }
}

export function validarInvarianteTamizaje(tamizaje: Tamizaje): void {
  // 3. puntaje se calcula siempre con calcularPuntaje
  const puntajeCalculado = calcularPuntaje(tamizaje.respuestas);
  if (tamizaje.puntaje !== puntajeCalculado) {
    throw new Error(
      `Invariante violado: El puntaje registrado (${tamizaje.puntaje}) no coincide con el calculado (${puntajeCalculado}).`
    );
  }
}

export function assertInvarianteUnicoTamizaje(tamizajes: Tamizaje[]): void {
  // 6. Un caso tiene como máximo un Tamizaje por instrumento
  const porInstrumento = new Set<string>();
  for (const t of tamizajes) {
    const key = `${t.casoCodigo}:${t.instrumentoId}`;
    if (porInstrumento.has(key)) {
      throw new Error(`Invariante violado: Caso ${t.casoCodigo} tiene múltiples tamizajes para ${t.instrumentoId}.`);
    }
    porInstrumento.add(key);
  }
}

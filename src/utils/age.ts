/**
 /**
 * Invariante 1: La edad en meses se deriva de nacimientoMes (1-12) y nacimientoAnio (e.g. 2024).
 * En ningún lugar del modelo hay día de nacimiento.
 */

export function calcularEdadMeses(
  nacimientoMes: number,
  nacimientoAnio: number,
  refDate: Date = new Date()
): number {
  if (!nacimientoMes || !nacimientoAnio || nacimientoMes < 1 || nacimientoMes > 12) {
    return 0;
  }

  const currentYear = refDate.getFullYear();
  const currentMonth = refDate.getMonth() + 1; // 1-12

  let months = (currentYear - nacimientoAnio) * 12 + (currentMonth - nacimientoMes);
  return Math.max(0, months);
}

const NOMBRES_MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function parseMesTextoANumero(mesTexto: string): number {
  if (!mesTexto) return 0;
  const index = NOMBRES_MESES.findIndex(
    m => m.toLowerCase() === mesTexto.trim().toLowerCase()
  );
  return index !== -1 ? index + 1 : parseInt(mesTexto, 10) || 0;
}

export function getAgeInMonths(birthDay: string, birthMonth: string, birthYear: string): number {
  const mes = parseMesTextoANumero(birthMonth);
  const anio = parseInt(birthYear, 10) || 0;
  return calcularEdadMeses(mes, anio);
}

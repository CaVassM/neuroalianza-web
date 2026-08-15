import { CaseData, UserProfile } from '../types';
import { CASOS_DEMO_MAP, DEMO_CASO_1 } from '../datos/demo';
import { calcularEdadMeses } from '../utils/age';

/**
 * Builds or fetches a case based on case code and current user state
 */
export function getCaseByCode(codigo: string, currentUser?: UserProfile): CaseData | null {
  const rawCode = (codigo || '').trim().toUpperCase();
  if (!rawCode) return null;

  // Code validation: Must match NA-XXXXX or XXXXX format (5 alphanumeric chars)
  const codeMatch = rawCode.match(/^(NA-)?([A-Z0-9]{5})$/);
  if (!codeMatch) return null;

  const cleanCode = rawCode.startsWith('NA-') ? rawCode : `NA-${rawCode}`;

  // 1. Check if matches one of the synthetic demo cases
  const demoEntry = CASOS_DEMO_MAP[cleanCode];
  if (demoEntry) {
    const c = demoEntry.caso;
    const t = demoEntry.tamizaje;

    // Calculate exact age in months from pure birth month/year
    const ageMonths = calcularEdadMeses(c.nacimientoMes, c.nacimientoAnio);

    // If current user is active on this case, merge user edits
    if (currentUser && currentUser.caseCode === cleanCode) {
      const userFase = currentUser.fase || c.faseActual;
      const userScore = currentUser.screeningResult?.score ?? t?.puntaje ?? 0;
      const userNivel = currentUser.screeningResult?.nivel ?? t?.nivel ?? 'baja';
      const userAnswers = currentUser.screeningAnswers || t?.respuestas || {};

      const mappedRegistros = (currentUser.registros || []).map((r) => ({
        fecha: r.fecha,
        titulo: r.titulo,
        detalle: r.detalle,
        tipo: r.tipo,
        origen: r.origen,
        establecimientoNombre: r.establecimientoNombre,
        faseNum: r.faseNum,
      }));

      return {
        codigo: cleanCode,
        childAgeMonths: ageMonths,
        district: currentUser.location?.district || c.distrito,
        insurance: (currentUser.insurance?.toLowerCase() as any) || c.seguro.toLowerCase(),
        fase: userFase,
        instrumento: {
          nombre: 'M-CHAT-R/F (versión peruana, Anexo 11 NTS N° 238-MINSA/DGIESP-2025)',
          score: userScore,
          nivel: userNivel,
          fecha: t?.fecha || new Date().toLocaleDateString('es-PE'),
          respondidoPor: 'Respondido por el cuidador',
          respuestas: userAnswers,
        },
        registros: mappedRegistros.length > 0 ? mappedRegistros : demoEntry.eventos.map((e) => ({
          fecha: new Date(e.fecha).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }),
          titulo: e.descripcion,
          detalle: e.observaciones || '',
          tipo: e.tipo === 'tamizaje' ? 'tamizaje' : e.tipo === 'establecimiento' ? 'establecimiento' : 'fase_update',
          origen: e.origen === 'profesional' ? 'profesional' : 'familia',
        })),
      };
    }

    return {
      codigo: cleanCode,
      childAgeMonths: ageMonths,
      district: c.distrito,
      insurance: c.seguro.toLowerCase() as any,
      fase: c.faseActual,
      instrumento: {
        nombre: 'M-CHAT-R/F (versión peruana, Anexo 11 NTS N° 238-MINSA/DGIESP-2025)',
        score: t?.puntaje ?? 0,
        nivel: t?.nivel ?? 'baja',
        fecha: t?.fecha || new Date().toLocaleDateString('es-PE'),
        respondidoPor: 'Respondido por el cuidador',
        respuestas: t?.respuestas || {},
      },
      registros: demoEntry.eventos.map((e) => ({
        fecha: new Date(e.fecha).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }),
        titulo: e.descripcion,
        detalle: e.observaciones || '',
        tipo: e.tipo === 'tamizaje' ? 'tamizaje' : e.tipo === 'establecimiento' ? 'establecimiento' : 'fase_update',
        origen: e.origen === 'profesional' ? 'profesional' : 'familia',
      })),
    };
  }

  // 2. Check if matches currentUser custom code
  if (currentUser?.caseCode && cleanCode === currentUser.caseCode.toUpperCase()) {
    const birthM = parseInt(currentUser.child.birthMonth, 10) || 12;
    const birthY = parseInt(currentUser.child.birthYear, 10) || 2024;
    const ageMonths = calcularEdadMeses(birthM, birthY);

    return {
      codigo: cleanCode,
      childAgeMonths: ageMonths,
      district: currentUser.location?.district || 'Miraflores',
      insurance: (currentUser.insurance?.toLowerCase() as any) || 'sis',
      fase: currentUser.fase || 3,
      instrumento: {
        nombre: 'M-CHAT-R/F (versión peruana, Anexo 11 NTS N° 238-MINSA/DGIESP-2025)',
        score: currentUser.screeningResult?.score ?? 5,
        nivel: currentUser.screeningResult?.nivel ?? 'moderada',
        fecha: '14 de agosto de 2026',
        respondidoPor: 'Respondido por el cuidador',
        respuestas: currentUser.screeningAnswers || DEMO_CASO_1.tamizaje.respuestas,
      },
      registros: (currentUser.registros || []).map((r) => ({
        fecha: r.fecha,
        titulo: r.titulo,
        detalle: r.detalle,
        tipo: r.tipo,
        origen: r.origen,
      })),
    };
  }

  // Code not found
  return null;
}

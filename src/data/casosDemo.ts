import { CaseData, UserProfile } from '../types';
import { CASOS_DEMO_MAP, DEMO_CASO_1 } from '../datos/demo';
import { calcularEdadMeses, parseMesTextoANumero } from '../utils/age';
import { ESTABLECIMIENTOS } from './establecimientos';

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
      // Si ni la familia ni el caso tienen tamizaje, no hay puntaje: rellenar
      // con 0 y "riesgo bajo" era afirmar que respondieron y salió bien.
      const puntaje = currentUser.screeningResult ?? t;
      const userScore = currentUser.screeningResult?.score ?? t?.puntaje;
      const userNivel = currentUser.screeningResult?.nivel ?? t?.nivel;
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
        instrumento:
          puntaje && userScore !== undefined && userNivel !== undefined
            ? {
                nombre: 'M-CHAT-R/F · tamizaje exigido por la NTS N° 238-MINSA/DGIESP-2025',
                score: userScore,
                nivel: userNivel,
                fecha:
                  currentUser.screeningResult?.fecha ||
                  t?.fecha ||
                  new Date().toLocaleDateString('es-PE'),
                respondidoPor: 'Respondido por el cuidador',
                respuestas: userAnswers,
              }
            : null,
        registros: mappedRegistros.length > 0 ? mappedRegistros : demoEntry.eventos.map((e) => ({
          fecha: new Date(e.fecha).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }),
          titulo: e.descripcion,
          detalle: e.observaciones || '',
          tipo: e.tipo === 'tamizaje' ? 'tamizaje' : e.tipo === 'establecimiento' ? 'establecimiento' : 'fase_update',
          origen: e.origen === 'profesional' ? 'profesional' : 'familia',
        })),

        establecimiento: buscarEstablecimiento(currentUser.selectedEstablecimientoCodigo),
        derivaciones: currentUser.derivaciones || [],
        barrera: currentUser.barrierReport || null,
        tratamiento: currentUser.tratamiento || null,
        seguimientoId: currentUser.seguimientoId,
      };
    }

    return {
      codigo: cleanCode,
      childAgeMonths: ageMonths,
      district: c.distrito,
      insurance: c.seguro.toLowerCase() as any,
      fase: c.faseActual,
      // Sin tamizaje no hay instrumento. Poner puntaje 0 y "riesgo bajo" era
      // afirmar que la familia respondió y salió bien.
      instrumento: t
        ? {
            nombre: 'M-CHAT-R/F · tamizaje exigido por la NTS N° 238-MINSA/DGIESP-2025',
            score: t.puntaje,
            nivel: t.nivel,
            fecha: t.fecha,
            respondidoPor: 'Respondido por el cuidador',
            respuestas: t.respuestas,
          }
        : null,
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
    // El mes de nacimiento se guarda como nombre ("Diciembre"), así que
    // parseInt devolvía NaN y todos los casos salían nacidos en diciembre.
    const birthM = parseMesTextoANumero(currentUser.child.birthMonth);
    const birthY = parseInt(currentUser.child.birthYear, 10) || 2024;
    const ageMonths = calcularEdadMeses(birthM, birthY);
    const tamizaje = currentUser.screeningResult;

    return {
      codigo: cleanCode,
      childAgeMonths: ageMonths,
      district: currentUser.location?.district || 'No registrado',
      insurance: (currentUser.insurance?.toLowerCase() as any) || 'sis',
      fase: currentUser.fase || 3,
      instrumento: tamizaje
        ? {
            nombre: 'M-CHAT-R/F · tamizaje exigido por la NTS N° 238-MINSA/DGIESP-2025',
            score: tamizaje.score,
            nivel: tamizaje.nivel,
            fecha:
              tamizaje.fecha ||
              (tamizaje.completedAt
                ? new Date(tamizaje.completedAt).toLocaleDateString('es-PE', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Fecha no registrada'),
            respondidoPor: 'Respondido por el cuidador',
            respuestas: currentUser.screeningAnswers || {},
          }
        : null,
      registros: (currentUser.registros || []).map((r) => ({
        fecha: r.fecha,
        titulo: r.titulo,
        detalle: r.detalle,
        tipo: r.tipo,
        origen: r.origen,
      })),

      // Lo que la familia reportó y antes se quedaba en su propia pantalla.
      establecimiento: buscarEstablecimiento(currentUser.selectedEstablecimientoCodigo),
      derivaciones: currentUser.derivaciones || [],
      barrera: currentUser.barrierReport || null,
      tratamiento: currentUser.tratamiento || null,
      seguimientoId: currentUser.seguimientoId,
    };
  }

  // Code not found
  return null;
}

/** Nombre del establecimiento elegido, para no enseñar solo un código IPRESS. */
function buscarEstablecimiento(codigo?: string) {
  if (!codigo) return null;
  const item = ESTABLECIMIENTOS.find((e) => e.codigo === codigo);
  if (!item) return null;
  return { codigo: item.codigo, nombre: item.nombre, distrito: item.distrito };
}

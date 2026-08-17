import { describe, it, expect } from 'vitest';
import { getCaseByCode } from '../casosDemo';
import { CASOS_DEMO_MAP } from '../../datos/demo';
import { UserProfile } from '../../types';

const familia = (extra: Partial<UserProfile> = {}): UserProfile => ({
  name: 'Cuidadora',
  email: 'familia@ejemplo.pe',
  child: { nickname: 'Mateo', birthMonth: 'Marzo', birthYear: '2025', avatarId: 'cat' },
  location: { department: 'Lima', province: 'Lima', district: 'Breña' },
  insurance: 'sis',
  caseCode: 'NA-TEST1',
  fase: 2,
  screeningResult: null,
  ...extra,
});

describe('getCaseByCode', () => {
  it('los códigos que la pantalla sugiere existen de verdad', () => {
    // La pantalla de "código no encontrado" ofrecía NA-8P2Q4 y NA-3X9Y1, que no
    // estaban en ningún sitio: quien los escribía volvía a la misma pantalla.
    for (const codigo of ['NA-7K3M9', 'NA-4P2XB', 'NA-9Q6RT']) {
      expect(CASOS_DEMO_MAP[codigo], codigo).toBeDefined();
      expect(getCaseByCode(codigo), codigo).not.toBeNull();
    }
  });

  it('no inventa un tamizaje cuando la familia no lo ha hecho', () => {
    // Antes devolvía puntaje 5, "riesgo moderado", fecha fija y las respuestas
    // de otro caso: un profesional abría la ficha creyendo que ya respondieron.
    const caso = getCaseByCode('NA-TEST1', familia())!;
    expect(caso).not.toBeNull();
    expect(caso.instrumento).toBeNull();
  });

  it('un caso de demostración sin tamizaje tampoco lo inventa', () => {
    expect(CASOS_DEMO_MAP['NA-4P2XB'].tamizaje).toBeNull();
    expect(getCaseByCode('NA-4P2XB')!.instrumento).toBeNull();
  });

  it('traslada el tamizaje real cuando existe', () => {
    const caso = getCaseByCode(
      'NA-TEST1',
      familia({ screeningResult: { score: 3, nivel: 'baja', fecha: '2 de agosto de 2026' } })
    )!;
    expect(caso.instrumento?.score).toBe(3);
    expect(caso.instrumento?.nivel).toBe('baja');
    expect(caso.instrumento?.fecha).toBe('2 de agosto de 2026');
  });

  it('lee el mes de nacimiento aunque venga como nombre', () => {
    // parseInt('Marzo') es NaN, así que todos los casos salían de diciembre y
    // la edad que veía el profesional estaba desplazada hasta nueve meses.
    const marzo = getCaseByCode('NA-TEST1', familia())!;
    const diciembre = getCaseByCode(
      'NA-TEST1',
      familia({ child: { nickname: 'Mateo', birthMonth: 'Diciembre', birthYear: '2025', avatarId: 'cat' } })
    )!;
    expect(marzo.childAgeMonths).toBe(diciembre.childAgeMonths + 9);
  });

  it('no rellena el distrito con uno ajeno', () => {
    const caso = getCaseByCode(
      'NA-TEST1',
      familia({ location: { department: '', province: '', district: '' } })
    )!;
    expect(caso.district).not.toBe('Miraflores');
  });

  it('devuelve null para un código que no existe', () => {
    expect(getCaseByCode('NA-NOEXISTE')).toBeNull();
    expect(getCaseByCode('')).toBeNull();
  });
});

describe('lo que la familia reporta llega a la vista profesional', () => {
  // Todo esto se quedaba en la pantalla de la familia. El profesional veía el
  // tamizaje y una lista plana de eventos, y no la razón por la que el caso
  // estaba detenido ni si el tratamiento se estaba cumpliendo.

  it('traslada la barrera con su motivo', () => {
    const caso = getCaseByCode(
      'NA-TEST1',
      familia({
        barrierReport: {
          tipo: 'sin_cupos',
          fecha: '14 ago',
          titulo: 'Reportaste una barrera: sin cupos',
          detalle: 'No había fechas disponibles.',
        },
      })
    )!;
    expect(caso.barrera?.tipo).toBe('sin_cupos');
    expect(caso.barrera?.detalle).toBe('No había fechas disponibles.');
  });

  it('traslada la adherencia al tratamiento y por qué se interrumpió', () => {
    const caso = getCaseByCode(
      'NA-TEST1',
      familia({
        tratamiento: { tomando: false, motivo: 'No había stock', actualizadoEn: '15 ago' },
      })
    )!;
    expect(caso.tratamiento?.tomando).toBe(false);
    expect(caso.tratamiento?.motivo).toBe('No había stock');
  });

  it('resuelve el establecimiento elegido a su nombre real', () => {
    const caso = getCaseByCode(
      'NA-TEST1',
      familia({ selectedEstablecimientoCodigo: '00006200' })
    )!;
    expect(caso.establecimiento?.nombre).toContain('Santa Cruz');
    expect(caso.establecimiento?.distrito).toBe('Miraflores');
  });

  it('no inventa un establecimiento si el código no existe', () => {
    const caso = getCaseByCode(
      'NA-TEST1',
      familia({ selectedEstablecimientoCodigo: '99999999' })
    )!;
    expect(caso.establecimiento).toBeNull();
  });

  it('traslada las derivaciones y el identificador de seguimiento', () => {
    const caso = getCaseByCode(
      'NA-TEST1',
      familia({ derivaciones: ['pediatria', 'neuropediatria'], seguimientoId: 'abc123' })
    )!;
    expect(caso.derivaciones).toEqual(['pediatria', 'neuropediatria']);
    expect(caso.seguimientoId).toBe('abc123');
  });

  it('no cita un anexo que no se pudo verificar', () => {
    const caso = getCaseByCode(
      'NA-TEST1',
      familia({ screeningResult: { score: 3, nivel: 'baja' } })
    )!;
    expect(caso.instrumento?.nombre).not.toContain('Anexo');
    expect(caso.instrumento?.nombre).toContain('NTS N° 238-MINSA/DGIESP-2025');
  });
});

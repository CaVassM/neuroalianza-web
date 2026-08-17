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

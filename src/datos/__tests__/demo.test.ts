import { describe, it, expect } from 'vitest';
import { DEMO_CASO_1, DEMO_CASO_2, DEMO_CASO_3, DEMO_ESTABLECIMIENTOS } from '../demo';
import { validarInvariantesCaso, validarInvarianteTamizaje } from '../../dominio/invariantes';
import { calcularPuntaje } from '../../dominio/tamizaje';

describe('Synthetic Demo Dataset Invariants', () => {
  it('validates CASO 1 invariants and tamizaje score arithmetic', () => {
    validarInvariantesCaso(DEMO_CASO_1.caso);
    validarInvarianteTamizaje(DEMO_CASO_1.tamizaje);
    expect(DEMO_CASO_1.tamizaje.puntaje).toBe(5);
    expect(calcularPuntaje(DEMO_CASO_1.tamizaje.respuestas)).toBe(5);
  });

  it('validates CASO 2 invariants (38 months, no tamizaje)', () => {
    validarInvariantesCaso(DEMO_CASO_2.caso);
    expect(DEMO_CASO_2.tamizaje).toBeNull();
  });

  it('validates CASO 3 invariants (Entry B, phase 5)', () => {
    validarInvariantesCaso(DEMO_CASO_3.caso);
    expect(DEMO_CASO_3.caso.faseActual).toBe(5);
  });

  it('validates all 8 establishments have valid coordinates and esDemostracion: true', () => {
    expect(DEMO_ESTABLECIMIENTOS).toHaveLength(8);
    DEMO_ESTABLECIMIENTOS.forEach((est) => {
      expect(est.esDemostracion).toBe(true);
      expect(est.estado).toBe('ACTIVO');
      expect(est.lat).toBeGreaterThanOrEqual(-18);
      expect(est.lat).toBeLessThanOrEqual(0);
      expect(est.lng).toBeGreaterThanOrEqual(-81);
      expect(est.lng).toBeLessThanOrEqual(-68);
      expect(est.telefono).toMatch(/^01-000-\d{4}$/);
    });
  });
});

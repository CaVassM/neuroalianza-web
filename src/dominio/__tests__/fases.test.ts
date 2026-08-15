import { describe, it, expect } from 'vitest';
import { puedeTransicionar, ejecutarTransicion } from '../fases';
import { Caso } from '../../types/dominio';

describe('Máquina de Estados de Fase', () => {
  const baseCaso: Caso = {
    codigo: 'NA-7K3M9',
    apodo: 'L.',
    avatarId: 'avatar1',
    nacimientoMes: 12,
    nacimientoAnio: 2024,
    distrito: 'Miraflores',
    ubigeo: '150122',
    seguro: 'SIS',
    condicion: 'autismo',
    faseActual: 1,
    establecimientoId: null,
    creadoEn: new Date().toISOString(),
    actualizadoEn: new Date().toISOString(),
  };

  it('allows transition 1->2 when registration is complete', () => {
    const res = puedeTransicionar(baseCaso, 2, 'sistema', 'registro');
    expect(res.ok).toBe(true);
  });

  it('allows transition 2->3 when valid tamizaje payload is provided', () => {
    const casoF2 = { ...baseCaso, faseActual: 2 as const };
    const res = puedeTransicionar(casoF2, 3, 'sistema', 'tamizaje', {
      tamizaje: { respuestas: Object.fromEntries(Array.from({ length: 20 }, (_, i) => [i + 1, 'si'])) },
    });
    expect(res.ok).toBe(true);
  });

  it('allows direct entry B transition 2->5 for declared diagnosis by family', () => {
    const casoF2 = { ...baseCaso, faseActual: 2 as const };
    const res = puedeTransicionar(casoF2, 5, 'familia', 'diagnostico');
    expect(res.ok).toBe(true);
  });

  it('rejects 3->4 transition if no establishmentId is set in case', () => {
    const casoF3 = { ...baseCaso, faseActual: 3 as const, establecimientoId: null };
    const res = puedeTransicionar(casoF3, 4, 'familia', 'establecimiento');
    expect(res.ok).toBe(false);
    expect(res.motivo).toContain('seleccionar un establecimiento');
  });

  it('allows 3->4 transition if establishmentId is set in case', () => {
    const casoF3 = { ...baseCaso, faseActual: 3 as const, establecimientoId: '00003421' };
    const res = puedeTransicionar(casoF3, 4, 'familia', 'establecimiento');
    expect(res.ok).toBe(true);
  });

  it('rejects backward transitions, creating event without decreasing phase', () => {
    const casoF4 = { ...baseCaso, faseActual: 4 as const };
    const result = ejecutarTransicion(
      casoF4,
      2,
      'familia',
      'tamizaje',
      'Reintento de tamizaje'
    );

    expect(result.fueRechazadoPorRetroceso).toBe(true);
    expect(result.casoActualizado.faseActual).toBe(4); // Phase preserved
    expect(result.eventoCreado.tipo).toBe('tamizaje'); // Event still logged
  });
});

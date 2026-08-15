import { describe, it, expect } from 'vitest';
import { calcularPuntaje, clasificar, esAplicable, INVERTIDOS } from '../tamizaje';

describe('Tamizaje M-CHAT-R/F Scoring Logic', () => {
  // Helper to construct 20 answers
  const createRespuestas = (defaultVal: 'si' | 'no' = 'si'): Record<number, 'si' | 'no'> => {
    const res: Record<number, 'si' | 'no'> = {};
    for (let i = 1; i <= 20; i++) {
      res[i] = defaultVal;
    }
    return res;
  };

  it('calculates 3 points when all normal items are "si" and inverted items (2, 5, 12) are "si"', () => {
    // Normal items = "si" -> 0 points
    // Inverted items = "si" -> +1 point each => total 3
    const resp = createRespuestas('si');
    const score = calcularPuntaje(resp);
    expect(score).toBe(3);
    expect(clasificar(score)).toBe('moderada');
  });

  it('calculates 17 points when all items are "no"', () => {
    // Normal items = "no" -> 17 points
    // Inverted items = "no" -> 0 points
    const resp = createRespuestas('no');
    const score = calcularPuntaje(resp);
    expect(score).toBe(17);
    expect(clasificar(score)).toBe('alta');
  });

  it('calculates 0 points for ideal responses (normal="si", inverted="no")', () => {
    const resp = createRespuestas('si');
    INVERTIDOS.forEach((n) => {
      resp[n] = 'no';
    });
    const score = calcularPuntaje(resp);
    expect(score).toBe(0);
    expect(clasificar(score)).toBe('baja');
  });

  it('evaluates inverted items isolated (item 2 = "si")', () => {
    const resp = createRespuestas('si');
    INVERTIDOS.forEach((n) => {
      resp[n] = 'no';
    });
    resp[2] = 'si'; // inverted item 2 = "si" => +1
    const score = calcularPuntaje(resp);
    expect(score).toBe(1);
    expect(clasificar(score)).toBe('baja');
  });

  it('evaluates inverted items isolated (item 5 = "si")', () => {
    const resp = createRespuestas('si');
    INVERTIDOS.forEach((n) => {
      resp[n] = 'no';
    });
    resp[5] = 'si'; // +1
    expect(calcularPuntaje(resp)).toBe(1);
  });

  it('evaluates inverted items isolated (item 12 = "si")', () => {
    const resp = createRespuestas('si');
    INVERTIDOS.forEach((n) => {
      resp[n] = 'no';
    });
    resp[12] = 'si'; // +1
    expect(calcularPuntaje(resp)).toBe(1);
  });

  it('correctly classifies boundary values 2, 3, 7, 8', () => {
    expect(clasificar(0)).toBe('baja');
    expect(clasificar(2)).toBe('baja');
    expect(clasificar(3)).toBe('moderada');
    expect(clasificar(7)).toBe('moderada');
    expect(clasificar(8)).toBe('alta');
    expect(clasificar(20)).toBe('alta');
  });

  it('throws error for invalid scores outside 0..20 in clasificar', () => {
    expect(() => clasificar(-1)).toThrow();
    expect(() => clasificar(21)).toThrow();
    expect(() => clasificar(NaN)).toThrow();
  });

  it('throws error if items are missing or answers invalid', () => {
    const incomplete = createRespuestas('si');
    delete (incomplete as any)[20];
    expect(() => calcularPuntaje(incomplete)).toThrow();

    const invalidValue = createRespuestas('si');
    (invalidValue as any)[1] = 'maybe';
    expect(() => calcularPuntaje(invalidValue)).toThrow();
  });

  it('evaluates esAplicable for age range 16-30 inclusive', () => {
    expect(esAplicable(15)).toBe(false);
    expect(esAplicable(16)).toBe(true);
    expect(esAplicable(20)).toBe(true);
    expect(esAplicable(30)).toBe(true);
    expect(esAplicable(31)).toBe(false);
    expect(esAplicable(38)).toBe(false);
  });
});

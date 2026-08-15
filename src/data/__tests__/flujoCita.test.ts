import { describe, expect, it } from 'vitest';
import { FLUJOS, serviciosDisponibles, type ServicioCita } from '../flujoCita';

/**
 * El camino que se enseña en la demo:
 *   CRED → pediatría → neuropediatría → psiquiatría pediátrica
 *
 * Cada salto depende de que una opción concreta lleve `derivaA`. Es fácil
 * romperlo al reescribir textos, y el fallo no se ve hasta que alguien recorre
 * los cuatro pasos en vivo.
 */
describe('cadena de derivaciones de la demo', () => {
  const buscar = (servicio: ServicioCita, id: string) => {
    const flujo = FLUJOS[servicio];
    const directa = flujo.indicaciones.find((i) => i.id === id);
    if (directa) return directa;
    for (const ind of flujo.indicaciones) {
      const sub = ind.subopciones?.find((s) => s.id === id);
      if (sub) return sub;
    }
    return undefined;
  };

  it('solo CRED está disponible al empezar', () => {
    expect(serviciosDisponibles([])).toEqual(['cred']);
  });

  it('CRED deriva a pediatría y la habilita', () => {
    const opcion = buscar('cred', 'deriva-pediatria');
    expect(opcion?.derivaA).toBe('pediatria');
    expect(serviciosDisponibles(['pediatria'])).toContain('pediatria');
  });

  it('pediatría deriva a neuropediatría a través de una sub-opción', () => {
    const padre = FLUJOS.pediatria.indicaciones.find((i) => i.id === 'deriva-especialista');
    expect(padre?.subopciones?.length).toBeGreaterThan(0);

    const neuro = padre?.subopciones?.find((s) => s.id === 'deriva-neuro');
    expect(neuro?.derivaA).toBe('neuropediatria');
    expect(neuro?.destacada).toBe(true);

    // Las demás sub-opciones se muestran pero no operan todavía.
    const inactivas = padre?.subopciones?.filter((s) => s.inactiva).map((s) => s.id);
    expect(inactivas).toEqual(['deriva-cred', 'deriva-psiq', 'deriva-otro']);
  });

  it('neuropediatría confirma TEA y deriva a psiquiatría', () => {
    const tea = FLUJOS.neuropediatria.indicaciones.find((i) => i.id === 'confirman-tea');
    expect(tea?.destacada).toBe(true);
    expect(tea?.avanzaA).toBe(5);

    const psiq = tea?.subopciones?.find((s) => s.id === 'deriva-psiq');
    expect(psiq?.derivaA).toBe('psiquiatria');
    expect(psiq?.destacada).toBe(true);
  });

  it('psiquiatría cierra la cadena y no deriva a nadie', () => {
    const derivaciones = FLUJOS.psiquiatria.indicaciones
      .flatMap((i) => [i, ...(i.subopciones || [])])
      .map((i) => i.derivaA)
      .filter(Boolean);
    expect(derivaciones).toEqual([]);
  });

  it('cada opción elegible dice cuál es el siguiente paso', () => {
    for (const flujo of Object.values(FLUJOS)) {
      for (const ind of flujo.indicaciones) {
        // Las que tienen sub-opciones delegan el texto en ellas.
        if (ind.subopciones?.length) {
          for (const sub of ind.subopciones) {
            if (!sub.inactiva) expect(sub.siguientePaso, `${flujo.id}/${sub.id}`).toBeTruthy();
          }
          continue;
        }
        if (!ind.inactiva) expect(ind.siguientePaso, `${flujo.id}/${ind.id}`).toBeTruthy();
      }
    }
  });

  it('todo servicio con flujo escrito ofrece emociones e indicaciones', () => {
    for (const flujo of Object.values(FLUJOS)) {
      if (flujo.indicaciones.length === 0) continue; // "especialista", sin flujo aún
      expect(flujo.sentimientos.length, flujo.id).toBeGreaterThan(0);
      for (const s of flujo.sentimientos) {
        expect(s.respuesta, `${flujo.id}/${s.id}`).toBeTruthy();
      }
    }
  });
});

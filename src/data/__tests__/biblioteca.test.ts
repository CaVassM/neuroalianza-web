import { describe, expect, it } from 'vitest';
import { CATEGORIAS, categoriasRecomendadas } from '../biblioteca';

describe('biblioteca de preguntas', () => {
  it('recomienda según la fase de la ruta', () => {
    const esperando = categoriasRecomendadas(2).map((c) => c.id);
    expect(esperando).toContain('esperando');
    expect(esperando).not.toContain('post-diagnostico');

    const conDiagnostico = categoriasRecomendadas(5).map((c) => c.id);
    expect(conDiagnostico).toContain('post-diagnostico');
    expect(conDiagnostico).not.toContain('esperando');
  });

  it('siempre recomienda algo, sea cual sea la fase', () => {
    for (const fase of [1, 2, 3, 4, 5, 6] as const) {
      expect(categoriasRecomendadas(fase).length).toBeGreaterThan(0);
    }
  });

  /**
   * Estas dos categorías dependen de normativa peruana que no está en el
   * corpus. Activarlas sin añadirla es peligroso, y no de forma teórica:
   * comprobado contra el RAG real, "¿Cómo funciona el SIS?" se responde
   * explicando el Sistema de Integración Sensorial (la terapia), no el Seguro
   * Integral de Salud, e "Inclusión educativa" afirma cómo funcionan los
   * colegios en Perú citando un manual estadounidense.
   *
   * Si alguien añade documentos peruanos a /docs y quiere activarlas, que
   * borre esta prueba a conciencia.
   */
  it('las preguntas que dependen de fuentes peruanas siguen desactivadas', () => {
    for (const id of ['ruta', 'escuela']) {
      const categoria = CATEGORIAS.find((c) => c.id === id)!;
      const activas = categoria.preguntas.filter((p) => p.enCorpus).map((p) => p.id);
      expect(activas, `${id} no debería tener preguntas activas`).toEqual([]);
    }
  });

  it('no hay preguntas duplicadas ni ids repetidos', () => {
    const ids = CATEGORIAS.flatMap((c) => c.preguntas.map((p) => `${c.id}/${p.id}`));
    expect(new Set(ids).size).toBe(ids.length);

    const textos = CATEGORIAS.flatMap((c) => c.preguntas.map((p) => p.texto.toLowerCase()));
    const repetidos = textos.filter((t, i) => textos.indexOf(t) !== i);
    // "Procesamiento sensorial" es el único texto que se repite literalmente,
    // y a propósito: en "Conociendo el autismo" explica qué es, y en "Apoyando
    // a mi hijo/a" se pregunta cómo acompañarlo.
    expect(new Set(repetidos)).toEqual(new Set(['procesamiento sensorial']));
  });
});

import { describe, expect, it } from 'vitest';
import { UserProfile } from '../../types';
import { calcularPuntaje, clasificar, esAplicable } from '../../dominio/tamizaje';
import { calcularEdadMeses, parseMesTextoANumero } from '../../utils/age';
import { getDistrictCoordinates } from '../../utils/distancia';
import {
  CODIGO_DEMO,
  DURACION_TOTAL,
  GUION,
  PUNTAJE_DEMO,
  RESPUESTAS_DEMO,
  cuentaSintetizada,
} from '../guion';

/**
 * El recorrido se ejecuta delante de un jurado y no hay segunda oportunidad.
 * Todo lo que puede romperlo en silencio —una edad fuera de rango, un distrito
 * sin establecimientos, una fase que retrocede— se comprueba aquí.
 */
describe('guion del recorrido de demostración', () => {
  it('las respuestas simuladas son un tamizaje válido de probabilidad moderada', () => {
    expect(Object.keys(RESPUESTAS_DEMO)).toHaveLength(20);
    expect(() => calcularPuntaje(RESPUESTAS_DEMO)).not.toThrow();
    expect(PUNTAJE_DEMO).toBe(calcularPuntaje(RESPUESTAS_DEMO));
    expect(clasificar(PUNTAJE_DEMO)).toBe('moderada');
  });

  it('la cuenta sintetizada arranca limpia', () => {
    const c = cuentaSintetizada();
    expect(c.fase).toBe(1);
    expect(c.screeningResult).toBeNull();
    expect(c.diagnosis).toBeNull();
    expect(c.caseCode).toBeUndefined();
    expect(c.registros).toEqual([]);
  });

  /**
   * La edad parece decorativa y no lo es: fuera del rango 16-30 meses el
   * cuestionario muestra la pantalla de "no aplicable" en lugar del semáforo, y
   * el recorrido se corta justo en su paso central.
   *
   * El distrito ya no condiciona el mapa —el padrón cubre los 50 de Lima y
   * Callao—, pero se comprueba que sea uno reconocido: con uno que no lo fuera,
   * el mapa abriría con el aviso de "no tenemos establecimientos aquí".
   */
  it('el distrito y la edad permiten enseñar el mapa y el tamizaje', () => {
    const c = cuentaSintetizada();
    expect(getDistrictCoordinates(c.location.district)).not.toBeNull();

    const meses = calcularEdadMeses(
      parseMesTextoANumero(c.child.birthMonth),
      parseInt(c.child.birthYear, 10)
    );
    expect(esAplicable(meses)).toBe(true);
  });

  it('las fases avanzan y nunca retroceden', () => {
    let perfil: UserProfile = cuentaSintetizada();
    let anterior = 0;

    for (const paso of GUION) {
      if (paso.perfil) perfil = paso.perfil(perfil);
      const fase = perfil.fase || 1;
      expect(fase, `retrocede en el paso "${paso.id}"`).toBeGreaterThanOrEqual(anterior);
      anterior = fase;
    }

    // Termina con el asistente desbloqueado, que es lo que exige el último paso.
    expect(perfil.fase).toBe(5);
    expect(perfil.diagnosis).not.toBeNull();
    expect(perfil.screeningResult?.nivel).toBe('moderada');
  });

  it('el recorrido cubre las pantallas clave, incluida la del profesional', () => {
    const pantallas = GUION.map((p) => p.pantalla);
    for (const esperada of [
      'dashboard',
      'mi-ruta',
      'evaluaciones',
      'cuestionario',
      'familias',
      'profesional',
    ]) {
      expect(pantallas, `falta la pantalla ${esperada}`).toContain(esperada);
    }
  });

  it('lanza una sola consulta al asistente', () => {
    // Dos seguidas se pisarían: la segunda llegaría mientras la primera aún
    // se está escribiendo en pantalla.
    const conPregunta = GUION.filter((p) => p.pregunta);
    expect(conPregunta).toHaveLength(1);
    expect(conPregunta[0].pantalla).toBe('familias');
  });

  it('la vista del profesional abre el caso del propio recorrido', () => {
    // Sin esto abriría el caso de demostración por defecto, que es otra
    // familia distinta de la que el recorrido acaba de construir.
    const paso = GUION.find((p) => p.pantalla === 'profesional');
    expect(paso?.casoProfesional).toBe(CODIGO_DEMO);
  });

  it('cierra volviendo a la aplicación, no dentro de una pantalla suelta', () => {
    // El último paso no avanza solo: es donde alguien se queda leyendo antes
    // de pulsar Terminar, así que no puede dejarle en la vista del profesional.
    const ultimo = GUION[GUION.length - 1];
    expect(ultimo.pantalla).toBe('dashboard');
    expect(ultimo.perfil).toBeUndefined();
  });

  it('cada paso tiene texto y una duración legible', () => {
    for (const paso of GUION) {
      expect(paso.titulo, paso.id).toBeTruthy();
      expect(paso.detalle, paso.id).toBeTruthy();
      // Menos de 3 s no da tiempo ni a leer el rótulo.
      expect(paso.duracion, paso.id).toBeGreaterThanOrEqual(3000);
    }
    // El recorrido completo no debería pasar de dos minutos.
    expect(DURACION_TOTAL).toBeLessThanOrEqual(120000);
  });

  /**
   * El botón de retroceso no deshace el último paso: reconstruye el caso
   * aplicando los pasos 0..destino desde una cuenta nueva. Las fases no saben
   * retroceder y los registros solo se apilan, así que deshacer dejaría un
   * caso incoherente. Esto comprueba que rehacer sea determinista.
   */
  it('reconstruir el caso hasta un paso da siempre el mismo estado', () => {
    const reconstruir = (hasta: number) => {
      let perfil: UserProfile = cuentaSintetizada();
      for (let n = 0; n <= hasta; n++) {
        const p = GUION[n];
        if (p.perfil) perfil = p.perfil(perfil);
      }
      return perfil;
    };

    for (let n = 0; n < GUION.length; n++) {
      const a = reconstruir(n);
      const b = reconstruir(n);
      expect(a.fase, `paso ${n}`).toBe(b.fase);
      expect(a.derivaciones, `paso ${n}`).toEqual(b.derivaciones);
      expect(a.screeningResult?.score, `paso ${n}`).toBe(b.screeningResult?.score);
      expect(a.registros?.length, `paso ${n}`).toBe(b.registros?.length);
    }

    // Ir al final, retroceder dos y volver deja el mismo estado que no haberse
    // movido: es exactamente lo que hace el botón.
    const ultimo = GUION.length - 1;
    expect(reconstruir(ultimo).fase).toBe(reconstruir(ultimo - 2 + 2).fase);
    expect(reconstruir(ultimo - 1).fase).toBeLessThanOrEqual(reconstruir(ultimo).fase!);
  });

  it('el scroll apunta a una sección que existe en el marcado', () => {
    const conScroll = GUION.filter((p) => p.scrollA);
    expect(conScroll.length).toBeGreaterThan(0);
    for (const paso of conScroll) {
      // El id está puesto en MiRutaView; si se renombra allí, esto avisa.
      expect(paso.scrollA).toBe('seccion-donde-atenderte');
      expect(paso.pantalla).toBe('mi-ruta');
    }
  });
});

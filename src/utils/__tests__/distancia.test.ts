import { describe, it, expect } from 'vitest';
import rawEstablecimientos from '../../data/establecimientos.json';
import {
  getDistrictCoordinates,
  distritoConCobertura,
  centroCobertura,
  haversineKm,
} from '../distancia';

const datos = rawEstablecimientos as Array<{ distrito: string; lat: number; lng: number }>;
const distritos = [...new Set(datos.map((d) => d.distrito))];

const mediana = (valores: number[]) => {
  const orden = [...valores].sort((a, b) => a - b);
  const medio = orden.length >> 1;
  return orden.length % 2 ? orden[medio] : (orden[medio - 1] + orden[medio]) / 2;
};

describe('getDistrictCoordinates', () => {
  it('resuelve todos los distritos del padrón', () => {
    expect(distritos.length).toBeGreaterThan(40);
    for (const distrito of distritos) {
      expect(getDistrictCoordinates(distrito), distrito).not.toBeNull();
    }
  });

  it('sitúa cada distrito entre sus propios establecimientos', () => {
    // La regresión que motiva esta prueba: quien se registraba en Breña
    // acababa en Miraflores porque el distrito no estaba en una lista escrita
    // a mano de trece entradas, y el fallback era mudo.
    //
    // Lo que se comprueba es que el centro esté más cerca de los
    // establecimientos de SU distrito que del conjunto. No se exige que el más
    // próximo sea del propio distrito: en Miraflores el más cercano al centro
    // está al otro lado de la avenida, ya en Surquillo, y eso es correcto.
    for (const distrito of distritos) {
      const centro = getDistrictCoordinates(distrito)!;
      const alCentro = (d: (typeof datos)[number]) =>
        haversineKm(centro.lat, centro.lng, d.lat, d.lng);

      const propios = datos.filter((d) => d.distrito === distrito).map(alCentro);
      const ajenos = datos.filter((d) => d.distrito !== distrito).map(alCentro);

      const medianaPropios = mediana(propios);
      const medianaAjenos = mediana(ajenos);
      expect(medianaPropios, distrito).toBeLessThan(medianaAjenos);
    }
  });

  it('Breña no cae en Miraflores', () => {
    const brena = getDistrictCoordinates('Breña')!;
    const miraflores = getDistrictCoordinates('Miraflores')!;
    expect(haversineKm(brena.lat, brena.lng, miraflores.lat, miraflores.lng)).toBeGreaterThan(5);
  });

  it('ignora tildes y mayúsculas', () => {
    const referencia = getDistrictCoordinates('Breña');
    expect(getDistrictCoordinates('BREÑA')).toEqual(referencia);
    expect(getDistrictCoordinates('brena')).toEqual(referencia);
    expect(getDistrictCoordinates('  Breña  ')).toEqual(referencia);
  });

  it('devuelve null en vez de inventar un distrito', () => {
    expect(getDistrictCoordinates('Distrito Inexistente')).toBeNull();
    expect(getDistrictCoordinates('')).toBeNull();
    // "Lima (Cercado)" tampoco existe como tal: antes caía a Miraflores.
    expect(getDistrictCoordinates('Lima (Cercado)')).toBeNull();
  });

  it('conoce capitales de provincia, sin cobertura de establecimientos', () => {
    expect(getDistrictCoordinates('Arequipa')).not.toBeNull();
    expect(distritoConCobertura('Arequipa')).toBe(false);
    expect(distritoConCobertura('Breña')).toBe(true);
  });
});

describe('centroCobertura', () => {
  it('cae dentro de Lima Metropolitana', () => {
    const { lat, lng } = centroCobertura();
    expect(lat).toBeGreaterThan(-12.5);
    expect(lat).toBeLessThan(-11.6);
    expect(lng).toBeGreaterThan(-77.3);
    expect(lng).toBeLessThan(-76.7);
  });
});

import { describe, it, expect } from 'vitest';
import { Establecimiento } from '../../types';
import rawEstablecimientos from '../../data/establecimientos.json';
import {
  calcularTerritorio,
  establecimientoDeZona,
  contienePunto,
  esPrimerNivel,
  RADIO_MAX_KM,
  Punto,
} from '../territorios';
import { haversineKm } from '../distancia';

const datos = rawEstablecimientos as Establecimiento[];
const primerNivel = datos.filter(esPrimerNivel);

describe('esPrimerNivel', () => {
  it('acepta I-1 a I-4 y rechaza el resto', () => {
    const categorias = new Set(datos.filter(esPrimerNivel).map((d) => d.categoria));
    expect([...categorias].every((c) => /^I-[1-4]$/.test(c))).toBe(true);
    // II-E empieza por "I" pero no es primer nivel: se llega por referencia.
    expect(datos.some((d) => d.categoria === 'II-E')).toBe(true);
    expect(datos.filter((d) => d.categoria === 'II-E').every((d) => !esPrimerNivel(d))).toBe(true);
  });
});

describe('establecimientoDeZona', () => {
  it('devuelve el primer nivel más cercano dentro del radio', () => {
    // Una rejilla sobre Lima: cada punto tiene que caer en el establecimiento
    // del que menos dista, y solo si está a menos del radio máximo.
    let comprobados = 0;

    for (let i = 0; i <= 10; i++) {
      for (let j = 0; j <= 10; j++) {
        const lat = -12.25 + (0.35 * i) / 10;
        const lng = -77.15 + (0.3 * j) / 10;

        const masCercano = primerNivel.reduce((mejor, item) =>
          haversineKm(lat, lng, item.lat, item.lng) < haversineKm(lat, lng, mejor.lat, mejor.lng)
            ? item
            : mejor
        );
        const distancia = haversineKm(lat, lng, masCercano.lat, masCercano.lng);
        const zona = establecimientoDeZona([lat, lng], datos);

        if (distancia <= RADIO_MAX_KM) {
          expect(zona?.codigo).toBe(masCercano.codigo);
        } else {
          expect(zona).toBeNull();
        }
        comprobados++;
      }
    }

    expect(comprobados).toBe(121);
  });

  it('sobre un establecimiento devuelve ese mismo establecimiento', () => {
    for (const item of primerNivel.slice(0, 40)) {
      expect(establecimientoDeZona([item.lat, item.lng], datos)?.codigo).toBe(item.codigo);
    }
  });

  it('no considera hospitales: no tienen sector asignado', () => {
    const hospital = datos.find((d) => d.categoria === 'III-2')!;
    expect(establecimientoDeZona([hospital.lat, hospital.lng], datos)?.codigo).not.toBe(
      hospital.codigo
    );
  });
});

describe('calcularTerritorio', () => {
  it('no dibuja zona para un hospital', () => {
    const hospital = datos.find((d) => !esPrimerNivel(d))!;
    expect(calcularTerritorio(hospital, datos)).toBeNull();
  });

  it('devuelve un polígono cerrado que contiene a su establecimiento', () => {
    for (const item of primerNivel.slice(0, 40)) {
      const zona = calcularTerritorio(item, datos);
      expect(zona).not.toBeNull();
      expect(zona!.poligono.length).toBeGreaterThanOrEqual(3);
      expect(contienePunto([item.lat, item.lng], zona!.poligono)).toBe(true);
    }
  });

  it('no se extiende más allá del radio máximo', () => {
    for (const item of primerNivel.slice(0, 40)) {
      const zona = calcularTerritorio(item, datos)!;
      for (const [lat, lng] of zona.poligono) {
        // Holgura mínima: el círculo se dibuja con 28 lados, no es exacto.
        expect(haversineKm(item.lat, item.lng, lat, lng)).toBeLessThanOrEqual(RADIO_MAX_KM * 1.02);
      }
    }
  });

  it('deja cada vértice más cerca de su establecimiento que de cualquier otro', () => {
    for (const item of primerNivel.slice(0, 25)) {
      const zona = calcularTerritorio(item, datos)!;
      for (const [lat, lng] of zona.poligono) {
        const propia = haversineKm(lat, lng, item.lat, item.lng);
        for (const otro of primerNivel) {
          if (otro.codigo === item.codigo) continue;
          const ajena = haversineKm(lat, lng, otro.lat, otro.lng);
          // Tolerancia por el paso a plano local, que no es exacto.
          expect(propia).toBeLessThanOrEqual(ajena + 0.02);
        }
      }
    }
  });

  it('con un radio más pequeño la zona encoge', () => {
    const item = primerNivel[0];
    const area = (poligono: Punto[]) => {
      let a = 0;
      for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
        a += poligono[j][1] * poligono[i][0] - poligono[i][1] * poligono[j][0];
      }
      return Math.abs(a / 2);
    };

    const grande = calcularTerritorio(item, datos, 1)!;
    const pequena = calcularTerritorio(item, datos, 0.4)!;
    expect(area(pequena.poligono)).toBeLessThan(area(grande.poligono));
  });
});

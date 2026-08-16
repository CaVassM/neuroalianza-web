import { Establecimiento } from '../types';

/**
 * Zona de atención aproximada de un establecimiento de primer nivel.
 *
 * En el primer nivel del MINSA cada puesto y centro de salud tiene un sector
 * asignado, y la familia se atiende en el que cubre su domicilio. Esos límites
 * existen por resolución de cada DIRIS, pero se publican como mapas en PDF: ni
 * el portal de datos abiertos ni el propio servicio geoespacial del MINSA
 * (GeoRIS) los entregan como polígonos, solo como puntos.
 *
 * Así que aquí se APROXIMAN: el territorio de un establecimiento es la parte
 * del mapa que le queda más cerca a él que a cualquier otro (celda de Voronói),
 * recortada además a un radio máximo. No es la sectorización oficial y la
 * interfaz debe decirlo; sirve para comunicar la lógica —"a cada zona le
 * corresponde un establecimiento"— mientras no haya datos reales que cargar.
 *
 * Solo aplica al PRIMER NIVEL. Un hospital II o III no tiene territorio: se
 * llega a él por referencia, no por dirección.
 */

export type Punto = [number, number]; // [lat, lng]

export interface TerritorioAproximado {
  codigo: string;
  nombre: string;
  poligono: Punto[];
}

/**
 * Radio máximo de una zona, en kilómetros.
 *
 * Sin tope, el establecimiento del borde se queda con todo el mapa que no le
 * disputa nadie y la zona deja de leerse como un barrio. Un sector urbano de
 * primer nivel se camina, así que un kilómetro es una escala honesta para el
 * prototipo.
 */
export const RADIO_MAX_KM = 1;

/** Kilómetros por grado, para pasar el radio al plano de trabajo. */
const KM_POR_GRADO = 111;

/** Lados del polígono con que se dibuja el tope de radio. */
const LADOS_CIRCULO = 28;

/** Un establecimiento de primer nivel: categorías I-1 a I-4. */
export function esPrimerNivel(item: Establecimiento): boolean {
  return item.categoria.startsWith('I-');
}

/**
 * Recorta un polígono con un semiplano (algoritmo de Sutherland-Hodgman).
 * Conserva la parte que cumple `dentro`.
 */
function recortar(
  poligono: Punto[],
  dentro: (p: Punto) => boolean,
  corte: (a: Punto, b: Punto) => Punto
): Punto[] {
  const salida: Punto[] = [];

  for (let i = 0; i < poligono.length; i++) {
    const actual = poligono[i];
    const previo = poligono[(i - 1 + poligono.length) % poligono.length];
    const actualDentro = dentro(actual);
    const previoDentro = dentro(previo);

    if (actualDentro) {
      if (!previoDentro) salida.push(corte(previo, actual));
      salida.push(actual);
    } else if (previoDentro) {
      salida.push(corte(previo, actual));
    }
  }

  return salida;
}

/** Distancia en kilómetros, sobre la esfera. */
function distanciaKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(bLat - aLat);
  const dLng = rad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * A qué establecimiento le corresponde un punto.
 *
 * Por definición de la aproximación, la zona que contiene un punto es la del
 * primer nivel más cercano: no hace falta dibujar ningún polígono para saberlo.
 * Devuelve null si el punto queda fuera del radio máximo de todos, que es el
 * caso real de una familia sin establecimiento cerca.
 */
export function establecimientoDeZona(
  [lat, lng]: Punto,
  establecimientos: Establecimiento[],
  radioMaxKm = RADIO_MAX_KM
): Establecimiento | null {
  let mejor: Establecimiento | null = null;
  let mejorDistancia = Infinity;

  for (const item of establecimientos) {
    if (!esPrimerNivel(item)) continue;
    const d = distanciaKm(lat, lng, item.lat, item.lng);
    if (d < mejorDistancia) {
      mejorDistancia = d;
      mejor = item;
    }
  }

  return mejor && mejorDistancia <= radioMaxKm ? mejor : null;
}

/**
 * Dibuja la zona de un establecimiento.
 *
 * Se parte de un círculo del radio máximo y se le van quitando las mitades que
 * le quedan más cerca a un vecino. Solo los vecinos a menos del doble del radio
 * pueden recortar algo, así que el resto ni se mira: con 650 establecimientos
 * cargados, comparar contra todos en cada movimiento del cursor se notaría.
 *
 * Las coordenadas se proyectan a un plano local antes de operar: un grado de
 * longitud es más corto que uno de latitud, y sin corregirlo las fronteras
 * salen desplazadas. A la latitud de Lima el factor es ~0.978.
 */
export function calcularTerritorio(
  sitio: Establecimiento,
  establecimientos: Establecimiento[],
  radioMaxKm = RADIO_MAX_KM
): TerritorioAproximado | null {
  if (!esPrimerNivel(sitio)) return null;

  const k = Math.cos((sitio.lat * Math.PI) / 180);
  const aPlano = (lat: number, lng: number): Punto => [lng * k, lat];
  const aGeo = ([x, y]: Punto): Punto => [y, x / k];

  const centro = aPlano(sitio.lat, sitio.lng);
  const radio = radioMaxKm / KM_POR_GRADO;

  let poligono: Punto[] = Array.from({ length: LADOS_CIRCULO }, (_, i) => {
    const angulo = (2 * Math.PI * i) / LADOS_CIRCULO;
    return [centro[0] + radio * Math.cos(angulo), centro[1] + radio * Math.sin(angulo)] as Punto;
  });

  for (const otro of establecimientos) {
    if (otro.codigo === sitio.codigo || !esPrimerNivel(otro)) continue;
    if (distanciaKm(sitio.lat, sitio.lng, otro.lat, otro.lng) > 2 * radioMaxKm) continue;

    const vecino = aPlano(otro.lat, otro.lng);
    const dx = vecino[0] - centro[0];
    const dy = vecino[1] - centro[1];
    const medio: Punto = [(centro[0] + vecino[0]) / 2, (centro[1] + vecino[1]) / 2];

    // Mediatriz entre los dos: negativo = del lado del establecimiento propio.
    const lado = (p: Punto) => (p[0] - medio[0]) * dx + (p[1] - medio[1]) * dy;
    const corte = (a: Punto, b: Punto): Punto => {
      const la = lado(a);
      const t = la / (la - lado(b));
      return [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];
    };

    poligono = recortar(poligono, (p) => lado(p) <= 0, corte);
    if (poligono.length === 0) return null;
  }

  return {
    codigo: sitio.codigo,
    nombre: sitio.nombre,
    poligono: poligono.map(aGeo),
  };
}

/** Punto dentro de polígono, por número de cruces. */
export function contienePunto([lat, lng]: Punto, poligono: Punto[]): boolean {
  let dentro = false;
  for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
    const [latI, lngI] = poligono[i];
    const [latJ, lngJ] = poligono[j];
    const cruza =
      lngI > lng !== lngJ > lng &&
      lat < ((latJ - latI) * (lng - lngI)) / (lngJ - lngI) + latI;
    if (cruza) dentro = !dentro;
  }
  return dentro;
}

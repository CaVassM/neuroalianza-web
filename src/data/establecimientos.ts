import { Establecimiento } from '../types';
import datos from './establecimientos.json';

/**
 * El padrón, con su tipo ya puesto.
 *
 * Único sitio de la aplicación que toca el JSON. Al pasar de 6 registros a 650,
 * TypeScript empezó a construir el tipo literal de los 650 objetos y a
 * compararlo campo por campo contra `Establecimiento` en cada archivo que lo
 * importaba: el chequeo de tipos agotaba los cuatro gigas de memoria y moría.
 *
 * El doble aserto se salta esa comparación estructural. A cambio, el JSON deja
 * de estar verificado contra el tipo, así que quien lo garantiza es el
 * generador —scripts/generar-establecimientos.mjs— y la prueba que recorre el
 * padrón comprobando categorías, coberturas y coordenadas.
 */
export const ESTABLECIMIENTOS = datos as unknown as Establecimiento[];

import centrosDistrito from '../data/centrosDistrito.json';

/**
 * Haversine formula for distance in kilometers
 */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Format distance according to requirements:
 * Less than 1 km as "800 m", 1 km or more with one decimal as "2.4 km"
 */
export function formatDistancia(km: number): string {
  if (isNaN(km) || km < 0) return '0 m';
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${meters} m`;
  }
  return `${km.toFixed(1)} km`;
}

/** Para que "Breña", "BREÑA" y "Brena" busquen lo mismo. */
const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toUpperCase();

/**
 * Centro de cada distrito, calculado desde los establecimientos que tiene.
 *
 * Antes esto era una lista escrita a mano con trece distritos de Lima. Quien se
 * registraba en cualquiera de los otros treinta y siete —Breña, San Juan de
 * Lurigancho, Comas— acababa con el mapa centrado en Miraflores sin que nada se
 * lo advirtiera, y con todas las distancias medidas desde allí.
 *
 * Ahora sale del propio padrón, así que cubre los 50 distritos cargados y se
 * actualiza solo cuando cambie el corte. No es el centroide geográfico del
 * distrito sino el centro de sus establecimientos de salud, que para ordenar
 * por cercanía es incluso más útil.
 *
 * Se usa la mediana y no la media: distritos como Ate, Lurigancho o San Juan de
 * Lurigancho se estiran más de veinte kilómetros, con casi todos sus
 * establecimientos apiñados en la parte urbana y unos pocos sueltos en la
 * quebrada. La media los arrastraba hacia el cerro, donde no vive casi nadie.
 *
 * Los centros llegan ya calculados desde el generador. Calcularlos aquí
 * obligaba a importar el padrón entero —650 registros— en una utilidad que usan
 * cuatro componentes, y el chequeo de tipos acababa agotando la memoria
 * infiriendo su tipo literal una y otra vez.
 */
const CENTROS_DISTRITO: Map<string, { lat: number; lng: number }> = new Map(
  (centrosDistrito as Array<{ clave: string; lat: number; lng: number }>).map((d) => [
    d.clave,
    { lat: d.lat, lng: d.lng },
  ])
);

/**
 * Referencias de fuera de Lima y Callao.
 *
 * El prototipo solo tiene cargados los establecimientos de Lima Metropolitana y
 * Callao. Estas coordenadas sirven para situar el mapa de una familia de
 * provincia, pero no habrá establecimientos que enseñarle: la interfaz tiene que
 * decírselo, no fingir que los de Lima le sirven.
 */
const CAPITALES: Record<string, { lat: number; lng: number }> = {
  AREQUIPA: { lat: -16.409, lng: -71.5375 },
  CUSCO: { lat: -13.5319, lng: -71.9675 },
  TRUJILLO: { lat: -8.1118, lng: -79.0286 },
  PIURA: { lat: -5.1945, lng: -80.6328 },
  CHICLAYO: { lat: -6.7714, lng: -79.8409 },
  HUANCAYO: { lat: -12.0651, lng: -75.2049 },
};

/**
 * Coordenadas desde las que buscar.
 *
 * Devuelve null cuando el distrito no se reconoce. Antes caía a Miraflores, que
 * es la peor respuesta posible: la familia veía un mapa creíble de un sitio que
 * no era el suyo. Quien llame a esta función tiene que contemplar el null y
 * decirlo en pantalla.
 */
export function getDistrictCoordinates(
  districtName: string
): { lat: number; lng: number } | null {
  const clave = normalizar(districtName || '');
  if (!clave) return null;

  return CENTROS_DISTRITO.get(clave) ?? CAPITALES[clave] ?? null;
}

/** true si el distrito tiene establecimientos cargados en el padrón. */
export function distritoConCobertura(districtName: string): boolean {
  return CENTROS_DISTRITO.has(normalizar(districtName || ''));
}

/** Centro de la zona cubierta, para situar el mapa cuando no hay distrito. */
export function centroCobertura(): { lat: number; lng: number } {
  const centros = [...CENTROS_DISTRITO.values()];
  return {
    lat: centros.reduce((s, c) => s + c.lat, 0) / centros.length,
    lng: centros.reduce((s, c) => s + c.lng, 0) / centros.length,
  };
}

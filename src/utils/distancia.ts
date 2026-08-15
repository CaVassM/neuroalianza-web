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

/**
 * District coordinates fallback for Lima and regional capitals
 */
export const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Miraflores: { lat: -12.1219, lng: -77.0297 },
  'San Isidro': { lat: -12.0984, lng: -77.0354 },
  Surquillo: { lat: -12.1128, lng: -77.0189 },
  'San Borja': { lat: -12.0911, lng: -76.9996 },
  'Santiago de Surco': { lat: -12.1456, lng: -76.9942 },
  Barranco: { lat: -12.1486, lng: -77.0208 },
  'Jesús María': { lat: -12.0747, lng: -77.0478 },
  Lince: { lat: -12.0838, lng: -77.0336 },
  'Magdalena del Mar': { lat: -12.0906, lng: -77.0706 },
  'Pueblo Libre': { lat: -12.0739, lng: -77.0631 },
  Lima: { lat: -12.0464, lng: -77.0428 },
  'San Miguel': { lat: -12.0772, lng: -77.0864 },
  Callao: { lat: -12.0566, lng: -77.1181 },
  Arequipa: { lat: -16.409, lng: -71.5375 },
  Cusco: { lat: -13.5319, lng: -71.9675 },
  Trujillo: { lat: -8.1118, lng: -79.0286 },
  Piura: { lat: -5.1945, lng: -80.6328 },
  Chiclayo: { lat: -6.7714, lng: -79.8409 },
  Huancayo: { lat: -12.0651, lng: -75.2049 },
};

export function getDistrictCoordinates(districtName: string): { lat: number; lng: number } {
  if (DISTRICT_COORDINATES[districtName]) {
    return DISTRICT_COORDINATES[districtName];
  }
  // Default to Miraflores, Lima centroid
  return { lat: -12.1219, lng: -77.0297 };
}

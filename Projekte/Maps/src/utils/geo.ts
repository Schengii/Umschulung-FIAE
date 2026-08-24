/**
 * Haversine-Formel: Berechnet Distanz zwischen zwei Koordinaten in Kilometern
 */
export function haversineDistanceKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Berechnet Kompass-Ausrichtung (Bearing) zwischen zwei Punkten in Grad (0-360)
 */
export function calculateBearing(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const dLon = deg2rad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(deg2rad(lat2));
  const x =
    Math.cos(deg2rad(lat1)) * Math.sin(deg2rad(lat2)) -
    Math.sin(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.cos(dLon);
  const brng = Math.atan2(y, x);
  return ((brng * (180 / Math.PI)) + 360) % 360;
}

/**
 * Formatiert einen Kompass-Kurswinkel in Himmelsrichtungen (N, NO, O, SO, ...)
 */
export function bearingToCardinal(bearing: number): string {
  const directions = ['N', 'NO', 'O', 'SO', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(bearing / 45) % 8];
}

/**
 * Interpoliert einen Punkt auf einer Strecke zwischen zwei Koordinaten (0-1)
 */
export function interpolateCoordinate(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
  t: number
): { latitude: number; longitude: number } {
  return {
    latitude: lat1 + (lat2 - lat1) * t,
    longitude: lon1 + (lon2 - lon1) * t,
  };
}

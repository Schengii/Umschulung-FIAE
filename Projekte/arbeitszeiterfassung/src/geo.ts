/**
 * Calculates the geodetic distance between two coordinates in meters using the Haversine formula.
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Checks if a coordinate is within a given radius from another center coordinate.
 */
export function isInsideGeofence(
  userLat: number,
  userLng: number,
  fenceLat: number,
  fenceLng: number,
  radiusMeters: number
): boolean {
  const dist = calculateDistance(userLat, userLng, fenceLat, fenceLng);
  return dist <= radiusMeters;
}

/**
 * Geolocation Manager that abstracts watchPosition.
 */
export class GeolocationService {
  onLocationUpdate: (coords: GeolocationCoordinates) => void;
  onError: (error: { code: number; message: string }) => void;
  watchId: number | null;
  options: PositionOptions;

  constructor(
    onLocationUpdate: (coords: GeolocationCoordinates) => void,
    onError: (error: { code: number; message: string }) => void
  ) {
    this.onLocationUpdate = onLocationUpdate;
    this.onError = onError;
    this.watchId = null;
    this.options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };
  }

  startTracking(): void {
    if (!("geolocation" in navigator)) {
      this.onError({ code: 0, message: "Standortbestimmung wird vom Browser nicht unterstützt." });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => this.onLocationUpdate(pos.coords),
      err => this.onError(err),
      this.options
    );

    this.watchId = navigator.geolocation.watchPosition(
      pos => this.onLocationUpdate(pos.coords),
      err => this.onError(err),
      this.options
    );
  }

  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  getCurrentPosition(): Promise<GeolocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        reject(new Error("Geolocation wird nicht unterstützt."));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        pos => resolve(pos.coords),
        err => reject(err),
        this.options
      );
    });
  }
}

if (typeof window !== "undefined") {
  (window as any).calculateDistance = calculateDistance;
  (window as any).isInsideGeofence = isInsideGeofence;
  (window as any).GeolocationService = GeolocationService;
}

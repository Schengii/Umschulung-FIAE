/**
 * Calculates the geodetic distance between two coordinates in meters using the Haversine formula.
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // Distance in meters
}

/**
 * Checks if a coordinate is within a given radius from another center coordinate.
 */
function isInsideGeofence(userLat, userLng, fenceLat, fenceLng, radiusMeters) {
  const dist = calculateDistance(userLat, userLng, fenceLat, fenceLng);
  return dist <= radiusMeters;
}

/**
 * Geolocation Manager that abstracts watchPosition.
 */
class GeolocationService {
  constructor(onLocationUpdate, onError) {
    this.onLocationUpdate = onLocationUpdate;
    this.onError = onError;
    this.watchId = null;
    this.options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };
  }

  startTracking() {
    if (!('geolocation' in navigator)) {
      this.onError({ code: 0, message: 'Standortbestimmung wird vom Browser nicht unterstützt.' });
      return;
    }

    // Single check immediately
    navigator.geolocation.getCurrentPosition(
      (pos) => this.onLocationUpdate(pos.coords),
      (err) => this.onError(err),
      this.options
    );

    // Watch position
    this.watchId = navigator.geolocation.watchPosition(
      (pos) => this.onLocationUpdate(pos.coords),
      (err) => this.onError(err),
      this.options
    );
  }

  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // Get current position as a promise
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation wird nicht unterstützt.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos.coords),
        (err) => reject(err),
        this.options
      );
    });
  }
}

window.calculateDistance = calculateDistance;
window.isInsideGeofence = isInsideGeofence;
window.GeolocationService = GeolocationService;

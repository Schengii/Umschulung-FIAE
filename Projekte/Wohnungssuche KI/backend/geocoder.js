import axios from 'axios';

// Cache to prevent duplicate Nominatim API hits and stay within their Usage Policy
const geocodeCache = new Map();

/**
 * Geocodiert eine Adresse (z.B. Ort, PLZ oder vollständige Adresse) in Breitengrad/Längengrad.
 * Nutzt die kostenfreie OpenStreetMap Nominatim API.
 */
export async function geocodeAddress(address) {
  if (!address || address.trim().length === 0) return null;
  
  const trimmed = address.trim();
  if (geocodeCache.has(trimmed)) {
    return geocodeCache.get(trimmed);
  }

  const queryNominatim = async (q) => {
    try {
      // Warte 1.2 Sekunden vor jedem Nominatim-API-Aufruf, um das Rate Limit einzuhalten
      await new Promise(resolve => setTimeout(resolve, 1200));
      console.log(`Geocodiere Adresse über Nominatim: "${q}"...`);
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: q,
          format: 'json',
          addressdetails: 1,
          limit: 1
        },
        headers: {
          'User-Agent': 'WohnungssucheKI/1.0 (sche-)' // Erforderlich laut Nominatim Nutzungsbedingungen
        },
        timeout: 5000
      });

      if (response.data && response.data.length > 0) {
        const addr = response.data[0].address || {};
        const cityName = addr.city || addr.town || addr.village || addr.county || addr.state || '';
        return {
          lat: parseFloat(response.data[0].lat),
          lon: parseFloat(response.data[0].lon),
          displayName: response.data[0].display_name,
          state: addr.state || '',
          city: cityName
        };
      }
    } catch (error) {
      console.error(`Geocoding Fehler für "${q}":`, error.message);
    }
    return null;
  };

  // 1. Try original query
  let result = await queryNominatim(trimmed);
  if (result) {
    geocodeCache.set(trimmed, result);
    return result;
  }

  // 2. Try simplified query if original fails
  // Strip words like "Stadtteil", "Ortsteil", "Bezirk", "Umland", "Umgebung", "Mitte"
  let simplified = trimmed
    .replace(/\b(?:stadtteil|ortsteil|bezirk|umland|umgebung|mitte)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (simplified !== trimmed) {
    result = await queryNominatim(simplified);
    if (result) {
      geocodeCache.set(trimmed, result);
      return result;
    }
  }

  // 3. Try splitting by comma or space and taking the first part
  // e.g. "Bonn, 53175" -> "Bonn"
  const firstPart = trimmed.split(/[\s,]+/)[0];
  if (firstPart && firstPart !== trimmed && firstPart !== simplified) {
    result = await queryNominatim(firstPart);
    if (result) {
      geocodeCache.set(trimmed, result);
      return result;
    }
  }

  return null;
}

/**
 * Berechnet die Luftlinien-Entfernung in Kilometern zwischen zwei Koordinaten
 * unter Verwendung der Haversine-Formel.
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return null;
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null;

  const R = 6371; // Erdradius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Runden auf 1 Dezimalstelle
}

export async function getOSRMRoute(lat1, lon1, lat2, lon2, profile = 'driving') {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return null;
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null;

  // Da der öffentliche OSRM-Demoserver nur das Profil "driving" unterstützt,
  // rufen wir immer "driving" auf, um die reale Straßenentfernung zu erhalten.
  // Die Dauer berechnen wir dann basierend auf realistischen Durchschnittsgeschwindigkeiten.
  const queryProfile = 'driving';
  const url = `http://router.project-osrm.org/route/v1/${queryProfile}/${lon1},${lat1};${lon2},${lat2}?overview=false`;
  
  try {
    const response = await axios.get(url, { timeout: 3000 });
    if (response.data && response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
      
      let durationMin = Math.round(route.duration / 60);
      if (profile === 'foot') {
        durationMin = Math.round(distanceKm * 12); // ca. 5 km/h -> 12 Min. pro km
      } else if (profile === 'bicycle' || profile === 'bike') {
        durationMin = Math.round(distanceKm * 4);  // ca. 15 km/h -> 4 Min. pro km
      }
      
      return {
        distanceKm,
        durationMin
      };
    }
  } catch (error) {
    console.error(`OSRM Routing Fehler (${profile}):`, error.message);
  }
  return null;
}

/**
 * Berechnet die Reisezeit mit öffentlichen Verkehrsmitteln (ÖPNV)
 * unter Verwendung der kostenlosen db-transport.rest API.
 */
export async function getTransitRoute(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return null;
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null;

  const url = `https://v5.db.transport.rest/journeys`;
  
  try {
    const response = await axios.get(url, {
      params: {
        'from.latitude': lat1,
        'from.longitude': lon1,
        'to.latitude': lat2,
        'to.longitude': lon2,
        'results': 1
      },
      timeout: 4000
    });

    if (response.data && response.data.journeys && response.data.journeys.length > 0) {
      const journey = response.data.journeys[0];
      
      if (journey.legs && journey.legs.length > 0) {
        const departure = new Date(journey.legs[0].departure || journey.departure);
        const arrival = new Date(journey.legs[journey.legs.length - 1].arrival || journey.arrival);
        const durationMin = Math.round((arrival - departure) / 60000);
        
        return {
          durationMin
        };
      }
    }
  } catch (error) {
    console.error(`db-transport.rest Transit Routing Fehler:`, error.message);
  }
  
  // Fallback: Schätzen basierend auf Luftlinie (z. B. 8 Min pro km + 5 Min Umsteigezeit)
  const dist = calculateDistance(lat1, lon1, lat2, lon2);
  if (dist !== null) {
    return {
      durationMin: Math.round(dist * 8 + 5),
      isEstimated: true
    };
  }
  return null;
}

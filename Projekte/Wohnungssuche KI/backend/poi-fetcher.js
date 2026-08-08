import axios from 'axios';
import { calculateDistance } from './geocoder.js';

/**
 * Fragt nahegelegene Points of Interest (POIs) über die Overpass API ab
 * im Umkreis von 1000m um einen bestimmten Längen- und Breitengrad.
 * 
 * @param {number} lat Breitengrad der Wohnung
 * @param {number} lon Längengrad der Wohnung
 * @returns {Promise<{supermarkets: Array, publicTransit: Array, parks: Array, education: Array, noiseFactors: Array}>}
 */
export async function fetchNearbyPOIs(lat, lon) {
  if (!lat || !lon) {
    return { supermarkets: [], publicTransit: [], parks: [], education: [], noiseFactors: [] };
  }

  const overpassUrl = 'https://overpass-api.de/api/interpreter';
  
  // Query für Supermärkte, Bahnhöfe, U-Bahnen, Trams, Bushaltestellen, Parks, Kitas, Schulen, Autobahnen und Bahnlinien
  const query = `[out:json][timeout:12];
(
  node(around:1000,${lat},${lon})["amenity"="supermarket"];
  node(around:1000,${lat},${lon})["railway"="station"];
  node(around:1000,${lat},${lon})["railway"="subway_station"];
  node(around:1000,${lat},${lon})["railway"="tram_stop"];
  node(around:1000,${lat},${lon})["highway"="bus_stop"];
  node(around:1000,${lat},${lon})["leisure"="park"];
  way(around:1000,${lat},${lon})["leisure"="park"];
  node(around:1000,${lat},${lon})["amenity"~"kindergarten|school"];
  way(around:500,${lat},${lon})["highway"~"motorway|trunk|primary"];
  way(around:500,${lat},${lon})["railway"="rail"];
);
out body center;`;

  try {
    console.log(`Rufe nahegelegene POIs für Koordinaten [${lat}, ${lon}] von Overpass API ab...`);
    const response = await axios.get(overpassUrl, {
      params: { data: query },
      timeout: 10000
    });

    const elements = response.data?.elements || [];
    
    const supermarkets = [];
    const publicTransit = [];
    const parks = [];
    const education = [];
    const noiseFactors = [];

    for (const el of elements) {
      const poiLat = el.lat || el.center?.lat;
      const poiLon = el.lon || el.center?.lon;
      if (!poiLat || !poiLon) continue;

      const dist = calculateDistance(lat, lon, poiLat, poiLon);
      const name = el.tags?.name || el.tags?.brand || el.tags?.operator || 'Unbekannt';
      
      const poi = {
        id: el.id,
        name,
        lat: poiLat,
        lon: poiLon,
        distanceKm: dist
      };

      if (el.tags?.amenity === 'supermarket') {
        supermarkets.push(poi);
      } else if (el.tags?.leisure === 'park') {
        parks.push(poi);
      } else if (el.tags?.amenity === 'kindergarten' || el.tags?.amenity === 'school') {
        poi.type = el.tags.amenity === 'kindergarten' ? 'Kita / Kindergarten' : 'Schule';
        education.push(poi);
      } else if (el.tags?.highway === 'motorway' || el.tags?.highway === 'trunk' || el.tags?.highway === 'primary' || el.tags?.railway === 'rail') {
        poi.type = el.tags.railway === 'rail' ? 'Bahnstrecke' : 'Hauptstraße / Autobahn';
        noiseFactors.push(poi);
      } else if (el.tags?.railway || el.tags?.highway === 'bus_stop') {
        let type = 'ÖPNV-Haltestelle';
        if (el.tags?.railway === 'station') type = 'Bahnhof';
        else if (el.tags?.railway === 'subway_station') type = 'U-Bahn';
        else if (el.tags?.railway === 'tram_stop') type = 'Straßenbahn';
        else if (el.tags?.highway === 'bus_stop') type = 'Bushaltestelle';
        
        poi.type = type;
        publicTransit.push(poi);
      }
    }

    const sortByDistance = (a, b) => a.distanceKm - b.distanceKm;

    const result = {
      supermarkets: supermarkets.sort(sortByDistance).slice(0, 5),
      publicTransit: publicTransit.sort(sortByDistance).slice(0, 5),
      parks: parks.sort(sortByDistance).slice(0, 5),
      education: education.sort(sortByDistance).slice(0, 5),
      noiseFactors: noiseFactors.sort(sortByDistance).slice(0, 5)
    };

    console.log(`POIs geladen: ${result.supermarkets.length} Supermärkte, ${result.publicTransit.length} ÖPNV, ${result.parks.length} Parks, ${result.education.length} Bildung, ${result.noiseFactors.length} Lärmfaktoren.`);
    return result;
  } catch (error) {
    console.error(`Overpass API Fehler beim Laden von POIs:`, error.message);
    return { supermarkets: [], publicTransit: [], parks: [], education: [], noiseFactors: [] };
  }
}

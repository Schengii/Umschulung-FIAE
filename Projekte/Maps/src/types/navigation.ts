export type TransportMode = 'hiking' | 'cycling' | 'driving' | 'transit' | 'ev';

export type MapStyleLayer = 'standard' | 'outdoors' | 'satellite' | 'high_contrast';

export interface LocationPoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  address?: string;
  name?: string;
}

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentType = 'jam' | 'construction' | 'accident' | 'hazard' | 'weather' | 'speed_camera' | 'breakdown' | 'ice';

export interface TrafficIncident {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  title: string;
  description: string;
  locationName: string;
  coordinate: LocationPoint;
  delayMinutes: number;
  source: 'Radio Bayen' | 'Verkehrszentrale' | 'Komoot Community' | 'Polizei News' | 'OSM Live' | 'Community Report';
  timestamp: string;
  expiresAt?: number;
  confirmations?: number;
}

export interface LaneInfo {
  valid: boolean;
  directions: ('straight' | 'left' | 'right' | 'slight_left' | 'slight_right' | 'uturn')[];
  active: boolean;
}

export interface NavigationStep {
  instruction: string;
  distanceMeter: number;
  durationSeconds: number;
  iconName: string;
  coordinate: LocationPoint;
  lanes?: LaneInfo[];
  transitDetails?: {
    lineName: string;
    vehicleType: 'bus' | 'train' | 'tram' | 'subway';
    headsign?: string;
    numStops?: number;
    departureTime?: string;
    arrivalTime?: string;
    departureStop?: string;
    arrivalStop?: string;
  };
}

export interface ElevationPoint {
  distanceKm: number;
  elevation: number;
  coordinate: LocationPoint;
  gradientPercent?: number;
}

export interface EVChargingStop {
  id: string;
  name: string;
  operator: string;
  powerKw: number;
  plugType: string;
  coordinate: LocationPoint;
  chargeTimeMinutes: number;
  arrivalBatteryPercent: number;
  targetBatteryPercent: number;
}

export interface FuelStationInfo {
  id: string;
  name: string;
  brand: string;
  coordinate: LocationPoint;
  distanceKm: number;
  diesel: number;
  e5: number;
  e10: number;
  isOpen: boolean;
}

export interface RouteOption {
  id: string;
  mode: TransportMode;
  title: string;
  distanceKm: number;
  durationMinutes: number;
  elevationGainMeters?: number;
  elevationLossMeters?: number;
  elevationProfile?: ElevationPoint[];
  surfaceBreakdown?: {
    pavedPercent: number;
    unpavedPercent: number;
    trailPercent: number;
  };
  trafficDelayMinutes: number;
  coordinates: LocationPoint[];
  steps: NavigationStep[];
  isFastest: boolean;
  isScenic: boolean;
  warnings: string[];
  evStops?: EVChargingStop[];
  estimatedEnergyKwh?: number;
  transitFareEur?: number;
  transitChanges?: number;
  estimatedFuelCostEur?: number;
}

export interface GdprConsentState {
  hasAnswered: boolean;
  locationServices: boolean;
  trafficAnalytics: boolean;
  mediaNewsFeed: boolean;
  localStorageOnly: boolean;
}

export interface ThemeModeState {
  isDark: boolean;
  isHighContrast: boolean;
  fontSizeMultiplier: number;
}

// ── BLE Sensoren Typen ──
export type BLESensorType = 'heart_rate' | 'cadence' | 'power_meter' | 'speed';

export interface BLESensorDevice {
  id: string;
  name: string;
  type: BLESensorType;
  isConnected: boolean;
  batteryLevel?: number;
  rssi: number;
}

export interface BLESensorMetrics {
  heartRateBpm?: number;
  cadenceRpm?: number;
  powerWatts?: number;
  heartRateZone?: 'Regeneration' | 'Fettverbrennung' | 'Ausdauer' | 'Schwellentraining' | 'Maximal';
}

// ── Indoor / Etagen Mapping Typen ──
export interface IndoorLevel {
  level: number;
  name: string;
  shortName: string;
}

export interface IndoorFeature {
  id: string;
  name: string;
  type: 'gate' | 'platform' | 'restroom' | 'elevator' | 'stairs' | 'shop' | 'info';
  level: number;
  coordinate: LocationPoint;
}

export interface IndoorBuilding {
  id: string;
  name: string;
  type: 'station' | 'mall' | 'airport';
  bounds: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
  levels: IndoorLevel[];
  features: IndoorFeature[];
}

// ── Vektorkarten Typen ──
export interface VectorMapRegion {
  id: string;
  name: string;
  country: string;
  sizeMb: number;
  isDownloaded: boolean;
  downloadProgress?: number;
  lastUpdated?: string;
  format: 'mbtiles' | 'osm_pbf';
}

// ── Cloud Sync & Backup Payload ──
export interface CloudSyncPayload {
  version: string;
  createdAt: number;
  deviceId: string;
  favoritesCount: number;
  recordedTracksCount: number;
  themeSettings: ThemeModeState;
  encryptedBlob: string;
}

// ── AR Fußgänger Navigation Typen ──
export interface ARWaymarker {
  id: string;
  title: string;
  distanceMeters: number;
  bearingDeg: number;
  pitchDeg: number;
  screenXPercent: number;
  screenYPercent: number;
  iconType: 'turn_left' | 'turn_right' | 'straight' | 'destination' | 'poi';
}

// ── Smartwatch Companion Sync Typen ──
export interface SmartwatchSyncState {
  isConnected: boolean;
  watchModel: 'Apple Watch Series 9 / Ultra' | 'Galaxy Watch 6 (WearOS)' | 'Garmin Forerunner';
  batteryPercent: number;
  nextTurnInstruction: string;
  distanceToTurnMeters: number;
  estimatedArrival: string;
  currentHeartRate?: number;
  hapticPattern: 'single_tap' | 'double_left' | 'triple_right' | 'warning';
}

// ── Navigations Audio Player Typen ──
export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationSeconds: number;
  coverUrl?: string;
  streamType: 'podcast' | 'radio' | 'spotify';
}

// ── KI-Tour-Guide & Audio POI Storytelling ──
export interface AITourStory {
  id: string;
  title: string;
  category: 'castle' | 'monument' | 'nature' | 'history' | 'viewpoint';
  coordinate: LocationPoint;
  storyText: string;
  estimatedReadTimeMinutes: number;
  audioDurationSeconds: number;
  isAudioPlaying?: boolean;
  triggerDistanceMeters: number;
}

// ── CarPlay & Android Auto Sync State ──
export interface CarPlayDisplayState {
  isConnected: boolean;
  displayMode: 'carplay' | 'android_auto';
  nightMode: boolean;
  speedLimitKmh: number;
  currentSpeedKmh: number;
  quickPOIFilter?: 'gas_station' | 'rest_area' | 'fast_food';
}

// ── Live Wetterradar Typen (Phase 5) ──
export interface WeatherRadarFrame {
  time: number;
  path: string; // URL-Pfad für Kachel-Overlay
  label: string; // z.B. "Vor 15 Min", "Jetzt", "In +30 Min (Prognose)"
  isForecast: boolean;
}

// ── Social Group Ride & Live-Tracking Typen (Phase 5) ──
export interface GroupRideMember {
  id: string;
  name: string;
  role: 'leader' | 'member';
  coordinate: LocationPoint;
  speedKmh: number;
  batteryPercent: number;
  distanceFromLeaderMeters: number;
  status: 'active' | 'breakdown' | 'stopped';
  lastPingTime: number;
}

export interface GroupRideSession {
  joinCode: string; // z.B. "RIDE-7749"
  title: string;
  leaderId: string;
  members: GroupRideMember[];
  isActive: boolean;
}

export interface TrackPoint extends LocationPoint {
  timestamp: number;
  heartRateBpm?: number;
  cadenceRpm?: number;
  powerWatts?: number;
}

export interface RecordedTrack {
  id: string;
  title: string;
  startTime: number;
  endTime?: number;
  durationSeconds: number;
  distanceKm: number;
  elevationGainMeters: number;
  maxSpeedKmh: number;
  avgSpeedKmh: number;
  avgHeartRateBpm?: number;
  avgCadenceRpm?: number;
  avgPowerWatts?: number;
  points: TrackPoint[];
}

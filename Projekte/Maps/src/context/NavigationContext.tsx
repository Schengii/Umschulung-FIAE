import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  TransportMode,
  RouteOption,
  LocationPoint,
  TrafficIncident,
  MapStyleLayer,
  ThemeModeState,
  IndoorBuilding,
} from '../types/navigation';
import { RoutingService } from '../services/RoutingService';
import { TrafficService } from '../services/TrafficService';
import { POIService, POI, POICategory } from '../services/POIService';
import { OfflineService } from '../services/OfflineService';
import { HazardReportService } from '../services/HazardReportService';
import { IndoorMapService } from '../services/IndoorMapService';
import { OfflineRoutingEngineService } from '../services/OfflineRoutingEngineService';
import { useLocation } from './LocationContext';

interface NavigationContextType {
  // Transport
  transportMode: TransportMode;
  setTransportMode: (mode: TransportMode) => void;
  // Routing
  origin: LocationPoint;
  destination: LocationPoint | null;
  setDestination: (dest: LocationPoint | null) => void;
  waypoints: LocationPoint[];
  addWaypoint: (wp: LocationPoint) => void;
  removeWaypoint: (index: number) => void;
  clearWaypoints: () => void;
  availableRoutes: RouteOption[];
  selectedRoute: RouteOption | null;
  setSelectedRoute: (route: RouteOption | null) => void;
  isRouteLoading: boolean;
  routeError: string | null;
  // Scrubber / Profile Point
  highlightedRoutePoint: LocationPoint | null;
  setHighlightedRoutePoint: (point: LocationPoint | null) => void;
  // Navigation
  isNavigating: boolean;
  startNavigation: () => void;
  stopNavigation: () => void;
  // 3D & HUD & AR & CarPlay
  is3DMode: boolean;
  setIs3DMode: (active: boolean | ((prev: boolean) => boolean)) => void;
  isHUDOpen: boolean;
  setIsHUDOpen: (open: boolean) => void;
  isAROpen: boolean;
  setIsAROpen: (open: boolean) => void;
  isSmartwatchOpen: boolean;
  setIsSmartwatchOpen: (open: boolean) => void;
  isCarPlayOpen: boolean;
  setIsCarPlayOpen: (open: boolean) => void;
  isAITourOpen: boolean;
  setIsAITourOpen: (open: boolean) => void;
  isWeatherRadarOpen: boolean;
  setIsWeatherRadarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  isGroupRideOpen: boolean;
  setIsGroupRideOpen: (open: boolean) => void;
  // Indoor / Levels
  currentIndoorBuilding: IndoorBuilding | null;
  activeIndoorLevel: number;
  setActiveIndoorLevel: (level: number) => void;
  // Map
  mapStyle: MapStyleLayer;
  setMapStyle: (style: MapStyleLayer) => void;
  // Traffic & Hazards
  trafficIncidents: TrafficIncident[];
  isTrafficPanelOpen: boolean;
  setIsTrafficPanelOpen: (open: boolean) => void;
  refreshHazards: () => Promise<void>;
  // POI
  activePOIs: POI[];
  activePOICategories: POICategory[];
  togglePOICategory: (cat: POICategory) => void;
  isPOILoading: boolean;
  // Theme
  theme: ThemeModeState;
  toggleDarkTheme: () => void;
  toggleHighContrast: () => void;
  setFontScale: (scale: number) => void;
  // Modals
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isHazardModalOpen: boolean;
  setIsHazardModalOpen: (open: boolean) => void;
  isLoopModalOpen: boolean;
  setIsLoopModalOpen: (open: boolean) => void;
  isBLEModalOpen: boolean;
  setIsBLEModalOpen: (open: boolean) => void;
  isVectorMapsModalOpen: boolean;
  setIsVectorMapsModalOpen: (open: boolean) => void;
  isCloudSyncModalOpen: boolean;
  setIsCloudSyncModalOpen: (open: boolean) => void;
  // Offline & Battery
  isOffline: boolean;
  isBatterySaverMode: boolean;
  toggleBatterySaver: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userLocation } = useLocation();

  // Transport
  const [transportMode, setTransportModeState] = useState<TransportMode>('driving');

  // Routing
  const [destination, setDestinationState] = useState<LocationPoint | null>({
    latitude: 48.1751,
    longitude: 11.5518,
    name: 'Olympiapark München',
    address: 'Spiridon-Louis-Ring 21, München',
  });
  const [availableRoutes, setAvailableRoutes] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [highlightedRoutePoint, setHighlightedRoutePoint] = useState<LocationPoint | null>(null);

  // Navigation
  const [isNavigating, setIsNavigating] = useState(false);
  const [is3DMode, setIs3DMode] = useState(false);
  const [isHUDOpen, setIsHUDOpen] = useState(false);
  const [isAROpen, setIsAROpen] = useState(false);
  const [isSmartwatchOpen, setIsSmartwatchOpen] = useState(false);
  const [isCarPlayOpen, setIsCarPlayOpen] = useState(false);
  const [isAITourOpen, setIsAITourOpen] = useState(false);
  const [isWeatherRadarOpen, setIsWeatherRadarOpen] = useState(false);
  const [isGroupRideOpen, setIsGroupRideOpen] = useState(false);

  // Indoor Mapping
  const [currentIndoorBuilding, setCurrentIndoorBuilding] = useState<IndoorBuilding | null>(null);
  const [activeIndoorLevel, setActiveIndoorLevel] = useState<number>(0);

  // Map
  const [mapStyle, setMapStyle] = useState<MapStyleLayer>('standard');

  // Traffic & Hazards
  const [isTrafficPanelOpen, setIsTrafficPanelOpen] = useState(false);
  const [trafficIncidents, setTrafficIncidents] = useState<TrafficIncident[]>([]);

  // Modals
  const [isHazardModalOpen, setIsHazardModalOpen] = useState(false);
  const [isLoopModalOpen, setIsLoopModalOpen] = useState(false);
  const [isBLEModalOpen, setIsBLEModalOpen] = useState(false);
  const [isVectorMapsModalOpen, setIsVectorMapsModalOpen] = useState(false);
  const [isCloudSyncModalOpen, setIsCloudSyncModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // POI
  const [activePOIs, setActivePOIs] = useState<POI[]>([]);
  const [activePOICategories, setActivePOICategories] = useState<POICategory[]>([]);
  const [isPOILoading, setIsPOILoading] = useState(false);

  // Theme
  const [theme, setTheme] = useState<ThemeModeState>({
    isDark: true,
    isHighContrast: false,
    fontSizeMultiplier: 1.0,
  });

  // Offline & Battery
  const [isOffline, setIsOffline] = useState(false);
  const [isBatterySaverMode, setIsBatterySaverMode] = useState(false);

  const toggleBatterySaver = useCallback(() => {
    setIsBatterySaverMode(prev => !prev);
  }, []);

  useEffect(() => {
    const b = IndoorMapService.findBuildingAtLocation(userLocation);
    setCurrentIndoorBuilding(b);
  }, [userLocation.latitude, userLocation.longitude]);

  const refreshHazards = useCallback(async () => {
    const baseIncidents = TrafficService.getActiveIncidents();
    const communityHazards = await HazardReportService.getActiveHazards();
    setTrafficIncidents([...communityHazards, ...baseIncidents]);
  }, []);

  useEffect(() => {
    refreshHazards();
  }, [refreshHazards]);

  useEffect(() => {
    OfflineService.checkConnectivity().then(status => {
      setIsOffline(!status.isConnected || !status.isInternetReachable);
    });
    const interval = setInterval(async () => {
      const status = await OfflineService.checkConnectivity();
      setIsOffline(!status.isConnected || !status.isInternetReachable);
    }, 15_000);
    return () => clearInterval(interval);
  }, []);

  const [waypoints, setWaypoints] = useState<LocationPoint[]>([]);

  useEffect(() => {
    if (!destination) {
      setAvailableRoutes([]);
      setSelectedRoute(null);
      return;
    }

    let cancelled = false;
    const calculateRoutes = async () => {
      setIsRouteLoading(true);
      setRouteError(null);
      try {
        let routes: RouteOption[] = [];
        if (isOffline) {
          const offlineRoute = await OfflineRoutingEngineService.calculateOfflineRoute(userLocation, destination, transportMode);
          routes = [offlineRoute];
        } else {
          routes = await RoutingService.calculateRoutes(userLocation, destination, transportMode, waypoints);
        }

        if (!cancelled) {
          setAvailableRoutes(routes);
          setSelectedRoute(routes[0] ?? null);
        }
      } catch (error) {
        if (!cancelled) {
          setRouteError('Route konnte nicht berechnet werden.');
          setAvailableRoutes([]);
          setSelectedRoute(null);
        }
      } finally {
        if (!cancelled) setIsRouteLoading(false);
      }
    };

    calculateRoutes();
    return () => { cancelled = true; };
  }, [transportMode, destination, waypoints, isOffline, userLocation.latitude, userLocation.longitude]);

  useEffect(() => {
    if (activePOICategories.length === 0) {
      setActivePOIs([]);
      return;
    }
    let cancelled = false;
    const loadPOIs = async () => {
      setIsPOILoading(true);
      try {
        const pois = await POIService.loadPOIs(userLocation, 1000, activePOICategories);
        if (!cancelled) setActivePOIs(pois);
      } catch {
        if (!cancelled) setActivePOIs([]);
      } finally {
        if (!cancelled) setIsPOILoading(false);
      }
    };
    loadPOIs();
    return () => { cancelled = true; };
  }, [activePOICategories, userLocation.latitude, userLocation.longitude]);

  const setTransportMode = useCallback((mode: TransportMode) => {
    setTransportModeState(mode);
  }, []);

  const setDestination = useCallback((dest: LocationPoint | null) => {
    setDestinationState(dest);
    setIsNavigating(false);
  }, []);

  const startNavigation = useCallback(() => setIsNavigating(true), []);
  const stopNavigation = useCallback(() => {
    setIsNavigating(false);
    setIsHUDOpen(false);
    setIsAROpen(false);
    setIsCarPlayOpen(false);
  }, []);

  const togglePOICategory = useCallback((cat: POICategory) => {
    setActivePOICategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }, []);

  const toggleDarkTheme = useCallback(() => {
    setTheme(prev => ({ ...prev, isDark: !prev.isDark, isHighContrast: false }));
  }, []);

  const toggleHighContrast = useCallback(() => {
    setTheme(prev => ({ ...prev, isHighContrast: !prev.isHighContrast }));
  }, []);

  const setFontScale = useCallback((scale: number) => {
    setTheme(prev => ({ ...prev, fontSizeMultiplier: scale }));
  }, []);

  const addWaypoint = useCallback((wp: LocationPoint) => {
    setWaypoints(prev => [...prev, wp]);
  }, []);

  const removeWaypoint = useCallback((index: number) => {
    setWaypoints(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearWaypoints = useCallback(() => {
    setWaypoints([]);
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        transportMode, setTransportMode,
        origin: userLocation,
        destination, setDestination,
        waypoints, addWaypoint, removeWaypoint, clearWaypoints,
        availableRoutes, selectedRoute, setSelectedRoute,
        isRouteLoading, routeError,
        highlightedRoutePoint, setHighlightedRoutePoint,
        isNavigating, startNavigation, stopNavigation,
        is3DMode, setIs3DMode,
        isHUDOpen, setIsHUDOpen,
        isAROpen, setIsAROpen,
        isSmartwatchOpen, setIsSmartwatchOpen,
        isCarPlayOpen, setIsCarPlayOpen,
        isAITourOpen, setIsAITourOpen,
        isWeatherRadarOpen, setIsWeatherRadarOpen,
        isGroupRideOpen, setIsGroupRideOpen,
        currentIndoorBuilding, activeIndoorLevel, setActiveIndoorLevel,
        mapStyle, setMapStyle,
        trafficIncidents, isTrafficPanelOpen, setIsTrafficPanelOpen, refreshHazards,
        activePOIs, activePOICategories, togglePOICategory, isPOILoading,
        theme, toggleDarkTheme, toggleHighContrast, setFontScale,
        isSettingsOpen, setIsSettingsOpen,
        isHazardModalOpen, setIsHazardModalOpen,
        isLoopModalOpen, setIsLoopModalOpen,
        isBLEModalOpen, setIsBLEModalOpen,
        isVectorMapsModalOpen, setIsVectorMapsModalOpen,
        isCloudSyncModalOpen, setIsCloudSyncModalOpen,
        isOffline,
        isBatterySaverMode, toggleBatterySaver,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useNavigation must be used within a NavigationProvider');
  return context;
};

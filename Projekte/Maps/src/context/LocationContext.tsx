import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { LocationPoint } from '../types/navigation';

interface LocationContextType {
  userLocation: LocationPoint;
  isTracking: boolean;
  heading: number;
  speedKmh: number;
  hasPermission: boolean;
  permissionDenied: boolean;
  toggleTracking: () => void;
  updateLocation: (newLoc: LocationPoint) => void;
  recenter: () => void;
}

// Default: Munich Marienplatz (Fallback wenn GPS-Permission verweigert)
const MUNICH_DEFAULT: LocationPoint = {
  latitude: 48.137154,
  longitude: 11.576124,
  altitude: 519,
  heading: 0,
  speed: 0,
  address: 'Marienplatz, 80331 München',
  name: 'Mein Standort (Fallback)',
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userLocation, setUserLocation] = useState<LocationPoint>(MUNICH_DEFAULT);
  const [isTracking, setIsTracking] = useState<boolean>(true);
  const [heading, setHeading] = useState<number>(0);
  const [speedKmh, setSpeedKmh] = useState<number>(0);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);

  // GPS Permission anfordern und echten Standort starten
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let headingSubscription: Location.LocationSubscription | null = null;

    const startTracking = async () => {
      try {
        // Foreground-Permission anfordern (DSGVO: nur bei expliziter Zustimmung)
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          setPermissionDenied(true);
          setHasPermission(false);
          // Fallback auf München-Koordinaten
          setUserLocation(MUNICH_DEFAULT);
          return;
        }

        setHasPermission(true);
        setPermissionDenied(false);

        // Aktuelle Position sofort abrufen
        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const point: LocationPoint = {
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
          altitude: current.coords.altitude ?? undefined,
          speed: current.coords.speed ?? 0,
          accuracy: current.coords.accuracy ?? undefined,
          name: 'Mein Standort',
        };
        setUserLocation(point);
        setSpeedKmh(Math.round((current.coords.speed ?? 0) * 3.6));

        // Kontinuierliche Standort-Updates starten
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 2000,   // alle 2 Sekunden
            distanceInterval: 5,  // oder alle 5 Meter
          },
          (location) => {
            if (!isTracking) return;
            const newPoint: LocationPoint = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              altitude: location.coords.altitude ?? undefined,
              heading: location.coords.heading ?? heading,
              speed: location.coords.speed ?? 0,
              accuracy: location.coords.accuracy ?? undefined,
              name: 'Mein Standort',
            };
            setUserLocation(newPoint);
            setHeading(location.coords.heading ?? 0);
            setSpeedKmh(Math.round((location.coords.speed ?? 0) * 3.6));
          }
        ) as unknown as Location.LocationSubscription;

        // Heading (Kompass-Ausrichtung) separat überwachen
        const headingSub = await Location.watchHeadingAsync((headingData) => {
          setHeading(headingData.trueHeading ?? headingData.magHeading ?? 0);
        });
        headingSubscription = headingSub as unknown as Location.LocationSubscription;

      } catch (error) {
        console.warn('[LocationContext] GPS-Fehler:', error);
        setHasPermission(false);
        setUserLocation(MUNICH_DEFAULT);
      }
    };

    startTracking();

    return () => {
      subscription?.remove();
      headingSubscription?.remove();
    };
  }, []);

  const toggleTracking = useCallback(() => {
    setIsTracking(prev => !prev);
  }, []);

  const updateLocation = useCallback((newLoc: LocationPoint) => {
    setUserLocation(newLoc);
  }, []);

  const recenter = useCallback(() => {
    setIsTracking(true);
  }, []);

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        isTracking,
        heading,
        speedKmh,
        hasPermission,
        permissionDenied,
        toggleTracking,
        updateLocation,
        recenter,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

import { useEffect, useState, useCallback } from 'react';
import { TrafficIncident } from '../types/navigation';
import { TrafficService } from '../services/TrafficService';
import { LocationPoint } from '../types/navigation';

interface UseTrafficFeedReturn {
  incidents: TrafficIncident[];
  isLoading: boolean;
  refresh: () => void;
  lastUpdated: Date | null;
}

/**
 * Hook für Live-Verkehrsmeldungen.
 * Automatische Aktualisierung alle 60 Sekunden (simuliert Radio/Echtzeit-Feed)
 */
export function useTrafficFeed(userLocation?: LocationPoint, radiusKm: number = 30): UseTrafficFeedReturn {
  const [incidents, setIncidents] = useState<TrafficIncident[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(() => {
    setIsLoading(true);
    try {
      const data = userLocation
        ? TrafficService.getIncidentsNearLocation(userLocation, radiusKm)
        : TrafficService.getActiveIncidents();
      setIncidents(data);
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  }, [userLocation, radiusKm]);

  // Initial fetch + 60-Sekunden Live-Update
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 60_000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { incidents, isLoading, refresh, lastUpdated };
}

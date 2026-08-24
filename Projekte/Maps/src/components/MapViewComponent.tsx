import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import { useLocation } from '../context/LocationContext';
import { useNavigation } from '../context/NavigationContext';
import { lightTheme, darkTheme, highContrastTheme } from '../theme/colors';
import { POI } from '../services/POIService';
import { WeatherRadarService } from '../services/WeatherRadarService';
import { GroupRideService } from '../services/GroupRideService';
import { GroupRideSession } from '../types/navigation';
import { MapPin, ArrowUp, Zap, Users } from 'lucide-react-native';

const MAP_TILE_PROVIDERS = {
  standard: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  outdoors: 'https://tile.opentopomap.org/{z}/{x}/{y}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  high_contrast: 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
};

interface MapViewComponentProps {
  activePOIs: POI[];
}

export const MapViewComponent: React.FC<MapViewComponentProps> = ({ activePOIs }) => {
  const { userLocation } = useLocation();
  const {
    destination,
    setDestination,
    selectedRoute,
    waypoints,
    addWaypoint,
    highlightedRoutePoint,
    mapStyle,
    trafficIncidents,
    theme,
    currentIndoorBuilding,
    activeIndoorLevel,
    is3DMode,
    isWeatherRadarOpen,
  } = useNavigation();

  const [radarFrame, setRadarFrame] = useState(WeatherRadarService.getActiveFrame());
  const [groupSession, setGroupSession] = useState<GroupRideSession | null>(GroupRideService.getSession());

  useEffect(() => {
    const unsubRadar = WeatherRadarService.subscribe(() => {
      setRadarFrame(WeatherRadarService.getActiveFrame());
    });
    const unsubGroup = GroupRideService.subscribe(setGroupSession);
    return () => {
      unsubRadar();
      unsubGroup();
    };
  }, []);

  const colors = theme.isHighContrast
    ? highContrastTheme
    : theme.isDark
    ? darkTheme
    : lightTheme;

  const currentIndoorFeatures = currentIndoorBuilding
    ? currentIndoorBuilding.features.filter(f => f.level === activeIndoorLevel)
    : [];

  const handleMapLongPress = (e: any) => {
    const coord = e.nativeEvent.coordinate;
    if (!destination) {
      setDestination({
        latitude: coord.latitude,
        longitude: coord.longitude,
        name: 'Gesetzter Zielort',
        address: `${coord.latitude.toFixed(4)}, ${coord.longitude.toFixed(4)}`,
      });
    } else {
      addWaypoint({
        latitude: coord.latitude,
        longitude: coord.longitude,
        name: `Zwischenstopp ${waypoints.length + 1}`,
      });
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        camera={
          is3DMode
            ? {
                center: {
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                },
                pitch: 50,
                heading: userLocation.heading || 0,
                altitude: 350,
                zoom: 17,
              }
            : undefined
        }
        showsUserLocation
        showsMyLocationButton
        showsCompass
        onLongPress={handleMapLongPress}
      >
        <UrlTile urlTemplate={MAP_TILE_PROVIDERS[mapStyle]} maximumZ={19} flipY={false} zIndex={1} />

        {/* Live-Wetterradar Overlay Kachel-Layer */}
        {isWeatherRadarOpen && radarFrame && (
          <UrlTile
            urlTemplate={radarFrame.path}
            maximumZ={15}
            flipY={false}
            opacity={0.65}
            zIndex={2}
          />
        )}

        {/* Social Group Ride Marker (Freunde & Konvoi) */}
        {groupSession &&
          groupSession.members.map(member => (
            <Marker
              key={member.id}
              coordinate={member.coordinate}
              title={`${member.name} (${member.speedKmh} km/h)`}
              description={`Abstand: ${member.distanceFromLeaderMeters}m | Akku: ${member.batteryPercent}%`}
              zIndex={20}
            >
              <View style={[styles.groupMemberMarker, member.status === 'breakdown' && styles.groupMemberSOS]}>
                <Users color="#FFFFFF" size={14} />
                <Text style={styles.groupMemberName} numberOfLines={1}>{member.name.split(' ')[0]}</Text>
              </View>
            </Marker>
          ))}

        {/* Indoor Features */}
        {currentIndoorFeatures.map(feat => (
          <Marker
            key={feat.id}
            coordinate={feat.coordinate}
            title={feat.name}
            description={`Ebene: ${feat.level}`}
            zIndex={12}
          >
            <View style={[styles.indoorMarker, { backgroundColor: '#8B5CF6' }]}>
              <Text style={styles.indoorMarkerText}>{feat.name.substring(0, 8)}</Text>
            </View>
          </Marker>
        ))}

        {/* Highlighted Elevation Profile Scrubber Point */}
        {highlightedRoutePoint && (
          <Marker coordinate={highlightedRoutePoint} zIndex={15}>
            <View style={[styles.scrubberMarker, { backgroundColor: '#F59E0B' }]}>
              <View style={styles.scrubberInner} />
            </View>
          </Marker>
        )}

        {/* EV-Charging Stops */}
        {selectedRoute?.evStops?.map(stop => (
          <Marker
            key={stop.id}
            coordinate={stop.coordinate}
            title={`⚡ ${stop.name} (${stop.powerKw} kW)`}
            description={`Ladezeit: ${stop.chargeTimeMinutes} Min. (von ${stop.arrivalBatteryPercent}% auf ${stop.targetBatteryPercent}%)`}
            zIndex={11}
          >
            <View style={[styles.evMarker, { backgroundColor: '#10B981' }]}>
              <Zap color="#FFFFFF" size={16} fill="#FFFFFF" />
            </View>
          </Marker>
        ))}

        {/* Route Polyline */}
        {selectedRoute && (
          <Polyline
            coordinates={selectedRoute.coordinates}
            strokeColor={colors.primary}
            strokeWidth={5}
            zIndex={5}
          />
        )}

        {/* Ziel-Marker */}
        {destination && (
          <Marker
            coordinate={destination}
            title={destination.name || 'Ziel'}
            description={destination.address}
            pinColor={colors.primary}
            zIndex={10}
          />
        )}

        {/* Waypoints */}
        {waypoints.map((wp, index) => (
          <Marker
            key={`wp-${index}`}
            coordinate={wp}
            title={wp.name || `Zwischenstopp ${index + 1}`}
            pinColor={colors.secondary}
            zIndex={9}
          />
        ))}

        {/* POIs */}
        {activePOIs.map(poi => (
          <Marker
            key={poi.id}
            coordinate={poi.coordinate}
            title={poi.name}
            description={poi.address}
            zIndex={8}
          >
            <View style={[styles.poiMarker, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
              <Text style={styles.poiIcon}>
                {poi.category === 'drinking_water' ? '🚰' : poi.category === 'bicycle_repair' ? '🔧' : '📍'}
              </Text>
            </View>
          </Marker>
        ))}

        {/* Gefahren & Blitzer */}
        {trafficIncidents.map(inc => (
          <Marker
            key={inc.id}
            coordinate={inc.coordinate}
            title={`⚠️ ${inc.title}`}
            description={`${inc.description} (${inc.source})`}
            zIndex={10}
          >
            <View style={[styles.hazardMarker, { backgroundColor: inc.type === 'speed_camera' ? '#000000' : colors.trafficJam }]}>
              <Text style={styles.hazardIconText}>
                {inc.type === 'speed_camera' ? '📷' : inc.type === 'ice' ? '❄️' : '⚠️'}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  poiMarker: {
    padding: 4,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  poiIcon: { fontSize: 14 },
  hazardMarker: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    elevation: 6,
  },
  hazardIconText: { fontSize: 14 },
  scrubberMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 8,
  },
  scrubberInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  evMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  indoorMarker: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  indoorMarkerText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  groupMemberMarker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 6,
  },
  groupMemberSOS: {
    backgroundColor: '#EF4444',
  },
  groupMemberName: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    maxWidth: 60,
  },
});

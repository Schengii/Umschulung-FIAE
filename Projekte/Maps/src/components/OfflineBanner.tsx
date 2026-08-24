import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { OfflineService, NetworkStatus } from '../services/OfflineService';
import { useNavigation } from '../context/NavigationContext';
import { lightTheme, darkTheme, highContrastTheme } from '../theme/colors';
import { WifiOff, Wifi } from 'lucide-react-native';

export const OfflineBanner: React.FC = () => {
  const { theme } = useNavigation();
  const [status, setStatus] = useState<NetworkStatus>({ isConnected: true, isInternetReachable: true, type: 'unknown' });
  const [showReconnected, setShowReconnected] = useState(false);
  const opacity = React.useRef(new Animated.Value(0)).current;

  const colors = theme.isHighContrast ? highContrastTheme : theme.isDark ? darkTheme : lightTheme;

  useEffect(() => {
    // Initialer Check
    OfflineService.checkConnectivity().then(s => setStatus(s));

    // Regelmäßiger Check alle 10 Sekunden
    const interval = setInterval(async () => {
      const prev = status.isConnected;
      const newStatus = await OfflineService.checkConnectivity();
      setStatus(newStatus);

      if (!prev && newStatus.isConnected) {
        // Wieder verbunden → kurze Erfolgsmeldung
        setShowReconnected(true);
        setTimeout(() => setShowReconnected(false), 3000);
      }
    }, 10_000);

    return () => clearInterval(interval);
  }, []);

  // Einblend-Animation
  useEffect(() => {
    const isVisible = !status.isConnected || showReconnected;
    Animated.timing(opacity, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [status.isConnected, showReconnected]);

  if (status.isConnected && !showReconnected) return null;

  const isOffline = !status.isConnected;
  const bgColor = isOffline ? '#DC2626' : '#16A34A';
  const message = isOffline
    ? 'Kein Internet – Karte und Routing offline'
    : '✓ Verbindung wiederhergestellt';

  return (
    <Animated.View style={[styles.banner, { backgroundColor: bgColor, opacity }]}>
      {isOffline
        ? <WifiOff color="#FFFFFF" size={16} />
        : <Wifi color="#FFFFFF" size={16} />}
      <Text
        style={styles.text}
        accessibilityLabel={message}
        accessibilityRole="alert"
      >
        {message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
    zIndex: 300,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
});

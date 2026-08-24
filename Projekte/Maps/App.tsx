import React from 'react';
import { LocationProvider } from './src/context/LocationContext';
import { NavigationProvider } from './src/context/NavigationContext';
import { HomeScreen } from './src/screens/HomeScreen';

/**
 * Maps App - Root Entry Point
 *
 * Provider hierarchy:
 *  LocationProvider  → Provides real-time GPS data to all children
 *    NavigationProvider → Provides routing, traffic, and theme state
 *      HomeScreen → Main UI assembling all components
 *
 * DSGVO/GDPR & WCAG compliance is handled via:
 *  - GdprBanner (consent management, rendered inside HomeScreen)
 *  - High-contrast mode toggle in HeaderBar
 *  - Accessible labels on all interactive elements
 */
export default function App() {
  return (
    <LocationProvider>
      <NavigationProvider>
        <HomeScreen />
      </NavigationProvider>
    </LocationProvider>
  );
}

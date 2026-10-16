// ============================================================
// Amazon 2.0 – Sub-Orbital Cargo Rocket Logistics Engine
// ============================================================

export interface SuborbitRocketTelemetry {
  rocketId: string;
  vehicleType: string;
  trajectoryRoute: string;
  speedMach: number;
  apogeeAltitudeKm: number;
  heatShieldTemperatureCelsius: number;
  flightDurationMinutes: number;
  payloadCapacityTons: number;
  isMHDShieldActive: boolean;
}

export function getRocketFlightTelemetry(rocketId: string = 'STARSHIP-CARGO-MK2'): SuborbitRocketTelemetry {
  return {
    rocketId,
    vehicleType: 'Amazon Prime Orbital Rocket (Reusable Methane-Oxygen Booster)',
    trajectoryRoute: 'Spaceport Boca Chica ➔ European Landing Pad Rotterdam Hub',
    speedMach: 18.2, // ~22,000 km/h
    apogeeAltitudeKm: 185, // Sub-orbital low Earth space
    heatShieldTemperatureCelsius: 1380,
    flightDurationMinutes: 42,
    payloadCapacityTons: 120,
    isMHDShieldActive: true,
  };
}

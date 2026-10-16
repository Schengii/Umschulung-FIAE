// ============================================================
// Amazon 2.0 – Smart Logistics Drone Delivery 3D Flight Engine
// ============================================================

export type DroneFlightStatus = 'takeoff' | 'cruising' | 'approaching' | 'descending' | 'delivered';

export interface DroneTelemetry {
  droneId: string;
  droneModel: string;
  status: DroneFlightStatus;
  altitudeMeters: number;
  speedKmh: number;
  batteryPercent: number;
  windSpeedKmh: number;
  etaMinutes: number;
  payloadWeightKg: number;
  landingZoneId: string;
  flightProgressPercent: number;
}

export function getInitialDroneTelemetry(droneId: string = 'AMZ-PRIME-AIR-09'): DroneTelemetry {
  return {
    droneId,
    droneModel: 'Amazon Prime Air MK30 Autonomous Quad-Octocopter',
    status: 'cruising',
    altitudeMeters: 118,
    speedKmh: 76.4,
    batteryPercent: 88,
    windSpeedKmh: 12.2,
    etaMinutes: 14,
    payloadWeightKg: 1.45,
    landingZoneId: 'LZ-BERLIN-TERRACE-4A',
    flightProgressPercent: 45,
  };
}

export function updateDroneTelemetryTick(telemetry: DroneTelemetry): DroneTelemetry {
  const next = { ...telemetry };
  next.flightProgressPercent = Math.min(100, next.flightProgressPercent + 10);
  next.batteryPercent = Math.max(20, next.batteryPercent - 1);

  if (next.flightProgressPercent < 20) {
    next.status = 'takeoff';
    next.altitudeMeters = 45;
  } else if (next.flightProgressPercent < 75) {
    next.status = 'cruising';
    next.altitudeMeters = 120;
    next.etaMinutes = Math.max(5, Math.round(15 * (1 - next.flightProgressPercent / 100)));
  } else if (next.flightProgressPercent < 95) {
    next.status = 'approaching';
    next.altitudeMeters = 35;
    next.etaMinutes = 2;
  } else if (next.flightProgressPercent < 100) {
    next.status = 'descending';
    next.altitudeMeters = 5;
    next.etaMinutes = 1;
  } else {
    next.status = 'delivered';
    next.altitudeMeters = 0;
    next.speedKmh = 0;
    next.etaMinutes = 0;
  }

  return next;
}

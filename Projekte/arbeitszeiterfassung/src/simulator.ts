import { storageService } from "./storage";
import { calculateArbZG } from "./arbzg";

export class SimulatorService {
  isActive: boolean = false;
  virtualDistance: number = 2000;
  speedMultiplier: number = 1;
  onSimStateChange: (active: boolean) => void;
  onLocationTick: (
    coords: { latitude: number; longitude: number; accuracy: number },
    distance: number
  ) => void;
  officeLocation: any;
  simulationIntervalId: any = null;
  simulatedTimeOffset: number = 0;

  constructor(
    onSimStateChange: (active: boolean) => void,
    onLocationTick: (
      coords: { latitude: number; longitude: number; accuracy: number },
      distance: number
    ) => void
  ) {
    this.onSimStateChange = onSimStateChange;
    this.onLocationTick = onLocationTick;
    this.officeLocation = storageService.getLocation();
  }

  toggle(active: boolean): void {
    this.isActive = active;

    if (active) {
      this.startSimulationLoop();
    } else {
      this.stopSimulationLoop();
      this.simulatedTimeOffset = 0;
    }

    this.onSimStateChange(active);
  }

  setDistance(meters: number): void {
    this.virtualDistance = meters;
    this.triggerLocationTick();
  }

  setSpeed(multiplier: number): void {
    this.speedMultiplier = multiplier;
    if (this.isActive) {
      this.startSimulationLoop();
    }
  }

  teleportToOffice(): void {
    this.setDistance(0);
  }

  teleportToBorder(): void {
    this.officeLocation = storageService.getLocation();
    this.setDistance(Math.max(0, this.officeLocation.radius - 10));
  }

  teleportToHome(): void {
    this.setDistance(2000);
  }

  getSimulatedCoords(): { latitude: number; longitude: number; accuracy: number } {
    this.officeLocation = storageService.getLocation();
    const lat = this.officeLocation.lat;
    const lng = this.officeLocation.lng;

    if (this.virtualDistance === 0) {
      return { latitude: lat, longitude: lng, accuracy: 5 };
    }

    const deltaLat = this.virtualDistance / 111111;
    return {
      latitude: lat + deltaLat,
      longitude: lng,
      accuracy: 10,
    };
  }

  triggerLocationTick(): void {
    if (!this.isActive) return;
    const coords = this.getSimulatedCoords();
    this.onLocationTick(coords, this.virtualDistance);
  }

  startSimulationLoop(): void {
    this.stopSimulationLoop();

    this.simulationIntervalId = setInterval(() => {
      this.simulatedTimeOffset += (this.speedMultiplier - 1) * 1000;
      this.triggerLocationTick();
    }, 1000);

    this.triggerLocationTick();
  }

  stopSimulationLoop(): void {
    if (this.simulationIntervalId) {
      clearInterval(this.simulationIntervalId);
      this.simulationIntervalId = null;
    }
  }

  getSimulatedNow(): number {
    return Date.now() + this.simulatedTimeOffset;
  }

  generateDemoData(): void {
    this.officeLocation = storageService.getLocation();
    const history: any[] = [];
    const today = new Date();
    const settings = storageService.getSettings();

    for (let i = 14; i >= 1; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const dayOfWeek = date.getDay();

      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const workHours = 7.2 + Math.random() * 2.3; // 7.2 to 9.5 hours
        const grossDurationMs = Math.round(workHours * 60 * 60 * 1000);
        const actualPauseMs = Math.round((20 + Math.random() * 30) * 60 * 1000);

        const startHour = 8 + Math.floor(Math.random() * 2);
        const startMin = Math.floor(Math.random() * 60);

        const checkInDate = new Date(date);
        checkInDate.setHours(startHour, startMin, 0, 0);
        const checkInTime = checkInDate.getTime();
        const checkOutTime = checkInTime + grossDurationMs + actualPauseMs;

        const dateString = date.toISOString().split("T")[0];

        const arbzgResult = calculateArbZG(
          grossDurationMs,
          actualPauseMs,
          settings.arbzgBreaksEnabled
        );

        const formatTime = (ts: number) => {
          const d = new Date(ts);
          return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
        };

        history.push({
          id: "demo_" + dateString,
          date: dateString,
          startTime: formatTime(checkInTime),
          endTime: formatTime(checkOutTime),
          start: checkInTime,
          end: checkOutTime,
          checkIn: checkInTime,
          checkOut: checkOutTime,
          pauseMs: actualPauseMs,
          pauseDuration: actualPauseMs,
          grossDurationMs,
          mandatoryPauseMs: arbzgResult.mandatoryPauseMs,
          netDurationMs: arbzgResult.netDurationMs,
          duration: arbzgResult.netDurationMs,
          locationName: this.officeLocation.name,
          manual: false,
          type: "work",
        });
      }
    }

    storageService.saveHistory(history);
  }
}

if (typeof window !== "undefined") {
  (window as any).SimulatorService = SimulatorService;
}

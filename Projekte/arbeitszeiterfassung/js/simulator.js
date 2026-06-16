class SimulatorService {
  constructor(onSimStateChange, onLocationTick) {
    this.isActive = false;
    this.virtualDistance = 2000; // start at home
    this.speedMultiplier = 1; // 1x, 60x, 3600x
    this.onSimStateChange = onSimStateChange;
    this.onLocationTick = onLocationTick;
    
    this.officeLocation = storageService.getLocation();
    this.simulationIntervalId = null;
    this.simulatedTimeOffset = 0; // ms offset from real time
  }

  toggle(active) {
    this.isActive = active;
    
    if (active) {
      this.startSimulationLoop();
    } else {
      this.stopSimulationLoop();
      this.simulatedTimeOffset = 0;
    }
    
    this.onSimStateChange(active);
  }

  setDistance(meters) {
    this.virtualDistance = meters;
    this.triggerLocationTick();
  }

  setSpeed(multiplier) {
    this.speedMultiplier = multiplier;
    // Restart loop to apply new frequency/speed
    if (this.isActive) {
      this.startSimulationLoop();
    }
  }

  /**
   * Teleport to predefined distances
   */
  teleportToOffice() {
    this.setDistance(0);
  }

  teleportToBorder() {
    // Just within or outside the radius
    this.officeLocation = storageService.getLocation();
    this.setDistance(this.officeLocation.radius - 10); // 10 meters inside
  }

  teleportToHome() {
    this.setDistance(2000); // 2 km away
  }

  /**
   * Calculates simulated coordinates based on a bearing from the office
   * and the current virtual distance.
   */
  getSimulatedCoords() {
    this.officeLocation = storageService.getLocation();
    const lat = this.officeLocation.lat;
    const lng = this.officeLocation.lng;
    
    if (this.virtualDistance === 0) {
      return { latitude: lat, longitude: lng, accuracy: 5 };
    }
    
    // Move coordinates northwards by distance
    // 1 degree latitude is approx 111,111 meters
    const deltaLat = this.virtualDistance / 111111;
    return {
      latitude: lat + deltaLat,
      longitude: lng,
      accuracy: 10
    };
  }

  triggerLocationTick() {
    if (!this.isActive) return;
    const coords = this.getSimulatedCoords();
    this.onLocationTick(coords, this.virtualDistance);
  }

  startSimulationLoop() {
    this.stopSimulationLoop();
    
    // We tick every second
    this.simulationIntervalId = setInterval(() => {
      // Advance simulated time
      // If speed is 60x, 1 real second = 60 simulated seconds (60,000 ms)
      // So we add (speedMultiplier - 1) * 1000 to the offset
      this.simulatedTimeOffset += (this.speedMultiplier - 1) * 1000;
      
      this.triggerLocationTick();
    }, 1000);
    
    this.triggerLocationTick();
  }

  stopSimulationLoop() {
    if (this.simulationIntervalId) {
      clearInterval(this.simulationIntervalId);
      this.simulationIntervalId = null;
    }
  }

  getSimulatedNow() {
    return Date.now() + this.simulatedTimeOffset;
  }

  /**
   * Generates mock history entries for the last 14 days
   */
  generateDemoData() {
    this.officeLocation = storageService.getLocation();
    const history = [];
    const today = new Date();
    
    // Generate data from 14 days ago to yesterday
    for (let i = 14; i >= 1; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const dayOfWeek = date.getDay();
      
      // Mo-Fr (1-5) are workdays. Skip Sa/So (0, 6) or make it rare
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        // Random work hours (between 7.2 and 9.5 hours)
        const workHours = 7.2 + Math.random() * 2.3;
        const durationMs = Math.round(workHours * 60 * 60 * 1000);
        
        // Random pause duration (between 30 and 60 minutes)
        const pauseDurationMs = Math.round((30 + Math.random() * 30) * 60 * 1000);
        
        // Check-in around 08:00 - 09:30
        const startHour = 8 + Math.floor(Math.random() * 2);
        const startMin = Math.floor(Math.random() * 60);
        
        const checkInDate = new Date(date);
        checkInDate.setHours(startHour, startMin, 0, 0);
        const checkInTime = checkInDate.getTime();
        
        // Checkout is work duration + break duration later
        const checkOutTime = checkInTime + durationMs + pauseDurationMs;
        
        const dateString = date.toISOString().split('T')[0];
        
        history.push({
          id: 'demo_' + dateString,
          date: dateString,
          checkIn: checkInTime,
          checkOut: checkOutTime,
          duration: durationMs,
          pauseDuration: pauseDurationMs,
          locationName: this.officeLocation.name,
          manual: false
        });
      }
    }
    
    // Save to storage
    storageService.saveHistory(history);
  }
}

window.SimulatorService = SimulatorService;

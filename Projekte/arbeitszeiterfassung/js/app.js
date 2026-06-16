// Global App State
let activeTab = 'tab-dashboard';
let activeSession = null;
let history = [];
let officeLocation = null;
let settings = null;
let timerIntervalId = null;
let isConfettiFiredToday = false;

// Service Instances
let geolocationService = null;
let mapService = null;
let simulatorService = null;

// DOM Elements
const DOM = {
  // Navigation
  navButtons: document.querySelectorAll('.nav-item'),
  tabPanes: document.querySelectorAll('.tab-pane'),
  
  // Header status
  globalStatusBadge: document.getElementById('global-status-badge'),
  globalStatusText: document.getElementById('global-status-text'),
  
  // Dashboard tab
  dashboardTimer: document.getElementById('dashboard-timer'),
  dashboardTargetLabel: document.getElementById('dashboard-target-label'),
  dailyProgressRing: document.getElementById('daily-progress-ring'),
  statusLocationName: document.getElementById('status-location-name'),
  statusDistanceValue: document.getElementById('status-distance-value'),
  statusGeofenceStatus: document.getElementById('status-geofence-status'),
  btnManualCheckin: document.getElementById('btn-manual-checkin'),
  btnManualCheckout: document.getElementById('btn-manual-checkout'),
  trackingActionGroup: document.getElementById('tracking-action-group'),
  btnPauseStart: document.getElementById('btn-pause-start'),
  btnPauseStop: document.getElementById('btn-pause-stop'),
  dashboardPauseLabel: document.getElementById('dashboard-pause-label'),
  statsMonthlyTotal: document.getElementById('stats-monthly-total'),
  statsDaysCompleted: document.getElementById('stats-days-completed'),
  
  // Location tab
  mapSearchInput: document.getElementById('map-search-input'),
  btnMapSearch: document.getElementById('btn-map-search'),
  searchSuggestions: document.getElementById('search-suggestions'),
  locationNameInput: document.getElementById('location-name-input'),
  valLat: document.getElementById('val-lat'),
  valLng: document.getElementById('val-lng'),
  btnSaveLocation: document.getElementById('btn-save-location'),
  radiusButtons: document.querySelectorAll('.btn-radius'),
  
  // History tab
  manualLogToggle: document.getElementById('manual-log-toggle'),
  manualLogForm: document.getElementById('manual-log-form'),
  manualLogDate: document.getElementById('manual-log-date'),
  manualLogStart: document.getElementById('manual-log-start'),
  manualLogEnd: document.getElementById('manual-log-end'),
  btnAddManualLog: document.getElementById('btn-add-manual-log'),
  btnClearHistory: document.getElementById('btn-clear-history'),
  historyItemsContainer: document.getElementById('history-items-container'),
  
  // Stats tab
  statsAvgHours: document.getElementById('stats-avg-hours'),
  statsTotalHours: document.getElementById('stats-total-hours'),
  statsBestDay: document.getElementById('stats-best-day'),
  
  // Simulator
  simulatorDrawer: document.getElementById('simulator-drawer'),
  simulatorHeader: document.getElementById('simulator-header'),
  simDrawerIcon: document.getElementById('sim-drawer-icon'),
  simActiveToggle: document.getElementById('sim-active-toggle'),
  simControlsSection: document.getElementById('sim-controls-section'),
  btnSimTeleportOffice: document.getElementById('btn-sim-teleport-office'),
  btnSimTeleportBorder: document.getElementById('btn-sim-teleport-border'),
  btnSimTeleportHome: document.getElementById('btn-sim-teleport-home'),
  simDistanceSlider: document.getElementById('sim-distance-slider'),
  valSimDistance: document.getElementById('val-sim-distance'),
  simSpeedSlider: document.getElementById('sim-speed-slider'),
  valSimSpeed: document.getElementById('val-sim-speed'),
  btnSimGenerateData: document.getElementById('btn-sim-generate-data')
};

// ==========================================================================
// APP INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  // 1. Load Data
  officeLocation = storageService.getLocation();
  activeSession = storageService.getActiveSession();
  history = storageService.getHistory();
  settings = storageService.getSettings();

  // Initialize UI Values
  DOM.locationNameInput.value = officeLocation.name;
  DOM.statusLocationName.textContent = officeLocation.name;

  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 2. Setup Services
  initMapService();
  initSimulatorService();
  initGeolocationService();

  // 3. Register Events
  setupNavEvents();
  setupLocationEvents();
  setupHistoryEvents();
  setupSimulatorEvents();
  setupManualTrackingEvents();

  // 4. Start Loops
  if (activeSession) {
    startTimerLoop();
    toggleCheckinButtons(true);
  } else {
    toggleCheckinButtons(false);
  }
  
  updateDashboardStats();
  
  // 5. Register PWA Service Worker
  registerServiceWorker();
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registriert. Scope:', reg.scope))
      .catch(err => console.warn('Service Worker Registrierung fehlgeschlagen:', err));
  }
}

// ==========================================================================
// NAVIGATION HANDLERS
// ==========================================================================
function setupNavEvents() {
  DOM.navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });
}

function switchTab(tabId) {
  activeTab = tabId;
  
  // Update nav classes
  DOM.navButtons.forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Show active tab, hide others
  DOM.tabPanes.forEach(pane => {
    if (pane.id === tabId) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });

  // Action on tab entry
  if (tabId === 'tab-location' && mapService) {
    mapService.invalidateSize();
  } else if (tabId === 'tab-history') {
    renderHistoryList();
  } else if (tabId === 'tab-stats') {
    renderStatsTab();
  }
}

// ==========================================================================
// GEOLOCATION & GEOCONTROL HANDLERS
// ==========================================================================
function initGeolocationService() {
  geolocationService = new GeolocationService(
    (coords) => handleLocationUpdate(coords),
    (err) => handleLocationError(err)
  );

  // Start standard tracking immediately if simulator is not active
  if (!simulatorService.isActive) {
    geolocationService.startTracking();
  }
}

function handleLocationUpdate(coords) {
  // If simulator is active, we ignore real geolocation updates
  if (simulatorService.isActive) return;

  processPositionUpdate(coords.latitude, coords.longitude);
}

function handleLocationError(err) {
  if (simulatorService.isActive) return; // ignore real GPS errors in simulation
  console.warn('Geolocation Error:', err.message);
  DOM.globalStatusText.textContent = 'GPS Fehler';
  DOM.statusDistanceValue.textContent = 'Ortung gesperrt';
}

function processPositionUpdate(latitude, longitude, distanceOverride = null) {
  // Update location fields in Standort tab
  if (activeTab === 'tab-location' && !mapService.isUserInteracting) {
    // Optionally update coordinates values
  }

  // Calculate distance to configured office geofence
  let distance = distanceOverride;
  if (distance === null) {
    distance = calculateDistance(
      latitude, 
      longitude, 
      officeLocation.lat, 
      officeLocation.lng
    );
  }

  // Update UI values
  DOM.statusDistanceValue.textContent = `${distance} m`;
  
  const inside = distance <= officeLocation.radius;
  
  if (inside) {
    DOM.statusGeofenceStatus.textContent = 'Im Radius';
    DOM.statusGeofenceStatus.className = 'value status-active in-office';
    
    // Auto check-in if not checked in and tracking is active
    if (!activeSession) {
      triggerCheckin(false); // False means auto-checkin
    }
  } else {
    DOM.statusGeofenceStatus.textContent = 'Außerhalb';
    DOM.statusGeofenceStatus.className = 'value status-active out-office';
    
    // Auto check-out if user was auto-checked-in and leaves the geofence
    if (activeSession && !activeSession.manual) {
      triggerCheckout();
    }
  }

  // Update header indicator
  updateHeaderIndicator(inside);
}

function updateHeaderIndicator(inside) {
  DOM.globalStatusBadge.className = 'status-indicator-badge';
  
  if (simulatorService && simulatorService.isActive) {
    DOM.globalStatusBadge.classList.add('status-sim');
    DOM.globalStatusText.textContent = 'Simulator';
  } else if (activeSession) {
    DOM.globalStatusBadge.classList.add('status-in');
    DOM.globalStatusText.textContent = inside ? 'Im Büro' : 'Eingeloggt';
  } else {
    DOM.globalStatusBadge.classList.add('status-out');
    DOM.globalStatusText.textContent = 'Abwesend';
  }
}

// ==========================================================================
// MANUAL TRACKING HANDLERS
// ==========================================================================
function setupManualTrackingEvents() {
  DOM.btnManualCheckin.addEventListener('click', () => {
    triggerCheckin(true); // True means manual override
  });

  DOM.btnManualCheckout.addEventListener('click', () => {
    triggerCheckout();
  });

  DOM.btnPauseStart.addEventListener('click', () => {
    triggerPauseStart();
  });

  DOM.btnPauseStop.addEventListener('click', () => {
    triggerPauseStop();
  });
}

function triggerPauseStart() {
  if (!activeSession || activeSession.isPaused) return;

  const now = simulatorService.isActive ? simulatorService.getSimulatedNow() : Date.now();
  
  activeSession.isPaused = true;
  activeSession.pauseStart = now;

  storageService.saveActiveSession(activeSession);
  toggleCheckinButtons(true);
}

function triggerPauseStop() {
  if (!activeSession || !activeSession.isPaused) return;

  const now = simulatorService.isActive ? simulatorService.getSimulatedNow() : Date.now();
  const pauseDuration = now - activeSession.pauseStart;
  
  activeSession.totalPauseDuration += pauseDuration;
  activeSession.isPaused = false;
  activeSession.pauseStart = null;

  storageService.saveActiveSession(activeSession);
  toggleCheckinButtons(true);
}

function triggerCheckin(isManual = true) {
  if (activeSession) return;

  const now = simulatorService.isActive ? simulatorService.getSimulatedNow() : Date.now();
  
  activeSession = {
    start: now,
    locationName: officeLocation.name,
    manual: isManual,
    isPaused: false,
    pauseStart: null,
    totalPauseDuration: 0
  };

  storageService.saveActiveSession(activeSession);
  toggleCheckinButtons(true);
  startTimerLoop();
  
  const isInside = DOM.statusGeofenceStatus.classList.contains('in-office');
  updateHeaderIndicator(isInside);
  
  // Show active check-in ring state
  DOM.dailyProgressRing.classList.add('tracking-active');
}

function triggerCheckout() {
  if (!activeSession) return;

  const endTime = simulatorService.isActive ? simulatorService.getSimulatedNow() : Date.now();
  const startTime = activeSession.start;
  
  // End break if checkout was triggered while on break
  if (activeSession.isPaused) {
    const pauseDur = endTime - activeSession.pauseStart;
    activeSession.totalPauseDuration += pauseDur;
    activeSession.isPaused = false;
    activeSession.pauseStart = null;
  }

  const duration = (endTime - startTime) - activeSession.totalPauseDuration;
  const todayDateString = new Date(startTime).toISOString().split('T')[0];

  // Only log if duration is at least a few seconds (prevent accidental ticks, e.g. > 1 sec)
  if (duration >= 1000) {
    const entry = {
      date: todayDateString,
      checkIn: startTime,
      checkOut: endTime,
      duration: duration,
      pauseDuration: activeSession.totalPauseDuration,
      locationName: activeSession.locationName,
      manual: activeSession.manual
    };

    storageService.addHistoryEntry(entry);
    history = storageService.getHistory(); // reload
  }

  // Clear Session
  activeSession = null;
  storageService.clearActiveSession();
  toggleCheckinButtons(false);
  stopTimerLoop();
  
  const isInside = DOM.statusGeofenceStatus.classList.contains('in-office');
  updateHeaderIndicator(isInside);
  
  // Reset active check-in ring state
  DOM.dailyProgressRing.classList.remove('tracking-active');
  
  // Update dashboard and stats
  updateDashboardStats();
  
  // If we are on history or stats, update
  if (activeTab === 'tab-history') renderHistoryList();
  if (activeTab === 'tab-stats') renderStatsTab();
}

function toggleCheckinButtons(isCheckedIn) {
  if (isCheckedIn) {
    DOM.btnManualCheckin.classList.add('hidden');
    DOM.trackingActionGroup.classList.remove('hidden');
    
    if (activeSession && activeSession.isPaused) {
      DOM.btnPauseStart.classList.add('hidden');
      DOM.btnPauseStop.classList.remove('hidden');
      DOM.dashboardPauseLabel.classList.remove('hidden');
    } else {
      DOM.btnPauseStart.classList.remove('hidden');
      DOM.btnPauseStop.classList.add('hidden');
      if (activeSession && activeSession.totalPauseDuration > 0) {
        DOM.dashboardPauseLabel.classList.remove('hidden');
      } else {
        DOM.dashboardPauseLabel.classList.add('hidden');
      }
    }
  } else {
    DOM.btnManualCheckin.classList.remove('hidden');
    DOM.trackingActionGroup.classList.add('hidden');
    DOM.dashboardPauseLabel.classList.add('hidden');
  }
}

// ==========================================================================
// TIMER & DASHBOARD UPDATE LOOP
// ==========================================================================
function startTimerLoop() {
  stopTimerLoop();
  
  // Update immediately
  updateTimerDisplay();

  // Tick interval
  timerIntervalId = setInterval(() => {
    updateTimerDisplay();
  }, 1000);
}

function stopTimerLoop() {
  if (timerIntervalId) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }
  
  // Update to show zero or total logged time
  updateTimerDisplay(true);
}

function updateTimerDisplay(forceStop = false) {
  let todayLoggedMs = getTodayLoggedTimeMs();
  let currentSessionMs = 0;
  let currentPauseMs = 0;

  if (activeSession) {
    const now = simulatorService.isActive ? simulatorService.getSimulatedNow() : Date.now();
    
    if (activeSession.isPaused) {
      currentPauseMs = activeSession.totalPauseDuration + (now - activeSession.pauseStart);
    } else {
      currentPauseMs = activeSession.totalPauseDuration;
    }
    
    if (!forceStop) {
      currentSessionMs = (now - activeSession.start) - currentPauseMs;
    }
  }

  const totalTimeMs = todayLoggedMs + currentSessionMs;
  
  // Format Work Time to HH:MM:SS
  const seconds = Math.floor((totalTimeMs / 1000) % 60);
  const minutes = Math.floor((totalTimeMs / (1000 * 60)) % 60);
  const hours = Math.floor((totalTimeMs / (1000 * 60 * 60)));

  const pad = (n) => n.toString().padStart(2, '0');
  DOM.dashboardTimer.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  // Format Pause Time to HH:MM:SS
  if (activeSession && (currentPauseMs > 0 || activeSession.isPaused)) {
    const pSecs = Math.floor((currentPauseMs / 1000) % 60);
    const pMins = Math.floor((currentPauseMs / (1000 * 60)) % 60);
    const pHrs = Math.floor((currentPauseMs / (1000 * 60 * 60)));
    DOM.dashboardPauseLabel.textContent = `Pause: ${pad(pHrs)}:${pad(pMins)}:${pad(pSecs)}`;
    DOM.dashboardPauseLabel.classList.remove('hidden');
  } else {
    DOM.dashboardPauseLabel.classList.add('hidden');
  }

  // Circular progress updates
  const targetMs = settings.dailyTarget * 60 * 60 * 1000;
  const percentage = Math.min(totalTimeMs / targetMs, 1);
  
  // Circumference of circle with r=42 is 263.89
  const circumference = 263.89;
  const strokeDashoffset = circumference * (1 - percentage);
  DOM.dailyProgressRing.style.strokeDashoffset = strokeDashoffset;
  
  // Confetti trigger when reaching 100% for the first time today!
  if (percentage >= 1.0 && !isConfettiFiredToday) {
    isConfettiFiredToday = true;
    fireGoalConfetti();
  }
}

function getTodayLoggedTimeMs() {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = history.filter(log => log.date === todayStr);
  return todayLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
}

function updateDashboardStats() {
  // Monthly total
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  
  const monthlyLogs = history.filter(log => log.date.startsWith(currentMonthStr));
  const monthlyMs = monthlyLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
  DOM.statsMonthlyTotal.textContent = `${(monthlyMs / 3600000).toFixed(1)} Std.`;

  // Completed Days (where target was reached)
  const targetMs = settings.dailyTarget * 60 * 60 * 1000;
  
  // Group logs by date
  const logsByDate = {};
  history.forEach(log => {
    if (!logsByDate[log.date]) logsByDate[log.date] = 0;
    logsByDate[log.date] += log.duration || 0;
  });

  let completedDaysCount = 0;
  let totalTrackedDays = Object.keys(logsByDate).length;
  
  Object.values(logsByDate).forEach(dayMs => {
    if (dayMs >= targetMs) completedDaysCount++;
  });

  DOM.statsDaysCompleted.textContent = `${completedDaysCount} / ${totalTrackedDays} Tage`;
}

function fireGoalConfetti() {
  if (window.confetti) {
    window.confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8b5cf6', '#10b981', '#60a5fa']
    });
  }
}

// ==========================================================================
// MAP & LOCATION SELECTION HANDLERS
// ==========================================================================
function initMapService() {
  mapService = new MapService('map', officeLocation, (lat, lng, radius) => {
    DOM.valLat.textContent = lat.toFixed(6);
    DOM.valLng.textContent = lng.toFixed(6);
  });
}

function setupLocationEvents() {
  // Radius selector
  DOM.radiusButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      DOM.radiusButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const radius = btn.getAttribute('data-radius');
      mapService.updateRadius(radius);
    });
  });

  // Save Location Button
  DOM.btnSaveLocation.addEventListener('click', () => {
    const name = DOM.locationNameInput.value.trim() || 'Büro';
    
    officeLocation = {
      name: name,
      lat: mapService.lat,
      lng: mapService.lng,
      radius: mapService.radius
    };

    storageService.saveLocation(officeLocation);
    
    DOM.statusLocationName.textContent = name;
    
    // Trigger location update
    if (simulatorService.isActive) {
      simulatorService.triggerLocationTick();
    } else {
      geolocationService.getCurrentPosition().then(coords => {
        processPositionUpdate(coords.latitude, coords.longitude);
      }).catch(() => {
        processPositionUpdate(mapService.lat, mapService.lng); // fallback to office itself
      });
    }

    // Success alert micro-animation/banner
    alert(`Standort "${name}" erfolgreich gespeichert!`);
  });

  // Address Search Button
  DOM.btnMapSearch.addEventListener('click', () => {
    executeAddressSearch();
  });

  DOM.mapSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      executeAddressSearch();
    }
  });

  // Suggestion click handler
  DOM.searchSuggestions.addEventListener('click', (e) => {
    const item = e.target.closest('.suggestion-item');
    if (item) {
      const lat = parseFloat(item.getAttribute('data-lat'));
      const lng = parseFloat(item.getAttribute('data-lng'));
      const displayName = item.getAttribute('data-name');
      
      mapService.updatePosition(lat, lng);
      
      // Auto fill name if empty or generic
      if (DOM.locationNameInput.value === 'Büro' || DOM.locationNameInput.value === '') {
        const shortName = displayName.split(',')[0];
        DOM.locationNameInput.value = shortName;
      }

      DOM.searchSuggestions.classList.add('hidden');
      DOM.mapSearchInput.value = displayName;
    }
  });

  // Close search suggestions on body click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-bar') && !e.target.closest('.search-suggestions-box')) {
      DOM.searchSuggestions.classList.add('hidden');
    }
  });
}

async function executeAddressSearch() {
  const query = DOM.mapSearchInput.value.trim();
  if (query.length < 3) return;

  DOM.btnMapSearch.disabled = true;
  DOM.searchSuggestions.innerHTML = '<div class="suggestion-item">Suche...</div>';
  DOM.searchSuggestions.classList.remove('hidden');

  const results = await mapService.searchAddress(query);
  DOM.btnMapSearch.disabled = false;

  if (results.length === 0) {
    DOM.searchSuggestions.innerHTML = '<div class="suggestion-item text-muted">Keine Ergebnisse gefunden</div>';
    return;
  }

  let html = '';
  results.forEach(res => {
    html += `
      <div class="suggestion-item" data-lat="${res.lat}" data-lng="${res.lng}" data-name="${res.display_name}">
        ${res.display_name}
      </div>
    `;
  });
  DOM.searchSuggestions.innerHTML = html;
}

// ==========================================================================
// HISTORY LIST HANDLERS
// ==========================================================================
function setupHistoryEvents() {
  // Collapsible toggle
  DOM.manualLogToggle.addEventListener('click', () => {
    DOM.manualLogToggle.classList.toggle('active');
    DOM.manualLogForm.classList.toggle('hidden');
  });

  // Add Manual Log
  DOM.btnAddManualLog.addEventListener('click', () => {
    const dateVal = DOM.manualLogDate.value;
    const startVal = DOM.manualLogStart.value;
    const endVal = DOM.manualLogEnd.value;

    if (!dateVal || !startVal || !endVal) {
      alert('Bitte fülle alle Felder aus.');
      return;
    }

    const startParts = startVal.split(':');
    const endParts = endVal.split(':');

    const startDate = new Date(dateVal);
    startDate.setHours(parseInt(startParts[0], 10), parseInt(startParts[1], 10), 0, 0);

    const endDate = new Date(dateVal);
    endDate.setHours(parseInt(endParts[0], 10), parseInt(endParts[1], 10), 0, 0);

    if (endDate <= startDate) {
      alert('Die Gehen-Uhrzeit muss nach der Kommen-Uhrzeit liegen.');
      return;
    }

    const duration = endDate.getTime() - startDate.getTime();

    const entry = {
      date: dateVal,
      checkIn: startDate.getTime(),
      checkOut: endDate.getTime(),
      duration: duration,
      locationName: officeLocation.name,
      manual: true
    };

    storageService.addHistoryEntry(entry);
    history = storageService.getHistory(); // reload
    
    // Clear inputs
    DOM.manualLogDate.value = '';
    DOM.manualLogStart.value = '';
    DOM.manualLogEnd.value = '';
    DOM.manualLogForm.classList.add('hidden');
    DOM.manualLogToggle.classList.remove('active');

    renderHistoryList();
    updateDashboardStats();
    
    alert('Arbeitszeit erfolgreich nachgetragen!');
  });

  // Clear History
  DOM.btnClearHistory.addEventListener('click', () => {
    if (confirm('Möchtest du wirklich alle aufgezeichneten Daten löschen? Dies kann nicht rückgängig gemacht werden.')) {
      storageService.clearHistory();
      history = [];
      renderHistoryList();
      updateDashboardStats();
      
      // Reset confetti flag
      isConfettiFiredToday = false;
    }
  });

  // Single Item Delete
  DOM.historyItemsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-delete-item');
    if (btn) {
      const id = btn.getAttribute('data-id');
      if (confirm('Eintrag löschen?')) {
        storageService.deleteHistoryEntry(id);
        history = storageService.getHistory();
        renderHistoryList();
        updateDashboardStats();
      }
    }
  });
}

function renderHistoryList() {
  if (history.length === 0) {
    DOM.historyItemsContainer.innerHTML = `
      <div class="empty-state">
        <i data-lucide="info" class="empty-icon"></i>
        <p>Keine Einträge für die Vergangenheit gefunden. Verwende den Simulator oder trage Zeiten manuell nach.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  let html = '';
  const targetMs = settings.dailyTarget * 60 * 60 * 1000;

  history.forEach(log => {
    const dateObj = new Date(log.checkIn);
    
    // Format Date: Mo., 12.05.2026
    const days = ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'];
    const weekday = days[dateObj.getDay()];
    const dateStr = `${weekday}, ${dateObj.getDate().toString().padStart(2, '0')}.${(dateObj.getMonth() + 1).toString().padStart(2, '0')}.${dateObj.getFullYear()}`;
    
    // Format Hours
    const formatTime = (ts) => {
      const d = new Date(ts);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} Uhr`;
    };

    const durationHrs = log.duration / 3600000;
    const isTargetMet = log.duration >= targetMs;
    const badgeClass = isTargetMet ? 'history-duration-badge completed' : 'history-duration-badge';

    // Pause info
    let pauseHtml = '';
    if (log.pauseDuration && log.pauseDuration > 0) {
      const pauseMins = Math.round(log.pauseDuration / 60000);
      pauseHtml = ` • Pause: ${pauseMins} Min.`;
    }

    html += `
      <div class="history-item">
        <div class="history-item-left">
          <span class="history-item-date">${dateStr}</span>
          <span class="history-item-times">
            ${formatTime(log.checkIn)} - ${formatTime(log.checkOut)} ${log.manual ? '(Manuell)' : ''}${pauseHtml}
          </span>
          <span class="history-item-loc">${log.locationName || 'Büro'}</span>
        </div>
        <div class="history-item-right">
          <span class="${badgeClass}">${durationHrs.toFixed(1)} Std.</span>
          <button class="btn-delete-item" data-id="${log.id}" title="Eintrag löschen">
            <i data-lucide="x"></i>
          </button>
        </div>
      </div>
    `;
  });

  DOM.historyItemsContainer.innerHTML = html;
  if (window.lucide) window.lucide.createIcons();
}

// ==========================================================================
// STATS TAB GRAPHICS RENDERING
// ==========================================================================
function renderStatsTab() {
  // Update general statistics values
  const totalHrs = history.reduce((sum, log) => sum + (log.duration || 0), 0) / 3600000;
  DOM.statsTotalHours.textContent = `${totalHrs.toFixed(1)} Std.`;

  // Group by date to find averages
  const logsByDate = {};
  history.forEach(log => {
    if (!logsByDate[log.date]) logsByDate[log.date] = 0;
    logsByDate[log.date] += log.duration || 0;
  });

  const dates = Object.keys(logsByDate);
  const avgHrs = dates.length > 0 ? (totalHrs / dates.length) : 0;
  DOM.statsAvgHours.textContent = `${avgHrs.toFixed(1)} Std.`;

  // Best Day
  let bestDate = '-';
  let maxMs = 0;
  Object.entries(logsByDate).forEach(([dateStr, ms]) => {
    if (ms > maxMs) {
      maxMs = ms;
      bestDate = dateStr;
    }
  });

  if (bestDate !== '-') {
    const bd = new Date(bestDate);
    DOM.statsBestDay.textContent = `${bd.getDate().toString().padStart(2, '0')}.${(bd.getMonth() + 1).toString().padStart(2, '0')}. (${(maxMs / 3600000).toFixed(1)}h)`;
  } else {
    DOM.statsBestDay.textContent = '-';
  }

  // Draw SVG Charts
  chartService.renderWeeklyChart('weekly-chart-container', history);
  chartService.renderMonthlyChart('monthly-chart-container', history);
}

// ==========================================================================
// SIMULATOR PANEL LOGIC
// ==========================================================================
function initSimulatorService() {
  simulatorService = new SimulatorService(
    (isActive) => {
      // Callback when simulation state changes
      if (isActive) {
        geolocationService.stopTracking();
        DOM.globalStatusBadge.classList.add('status-sim');
        DOM.globalStatusText.textContent = 'Simulator';
        DOM.simControlsSection.classList.remove('disabled');
      } else {
        DOM.simControlsSection.classList.add('disabled');
        DOM.globalStatusBadge.classList.remove('status-sim');
        
        // Resume real position
        geolocationService.startTracking();
      }
    },
    (coords, distance) => {
      // Callback on simulated loop ticks
      processPositionUpdate(coords.latitude, coords.longitude, distance);
    }
  );
}

function setupSimulatorEvents() {
  // Drawer slider opening
  DOM.simulatorHeader.addEventListener('click', () => {
    DOM.simulatorDrawer.classList.toggle('open');
  });

  // Simulator Toggle Switch
  DOM.simActiveToggle.addEventListener('change', (e) => {
    simulatorService.toggle(e.target.checked);
  });

  // Pre-sets Teleport
  DOM.btnSimTeleportOffice.addEventListener('click', () => {
    simulatorService.teleportToOffice();
    DOM.simDistanceSlider.value = 0;
    DOM.valSimDistance.textContent = '0 m';
  });

  DOM.btnSimTeleportBorder.addEventListener('click', () => {
    simulatorService.teleportToBorder();
    DOM.simDistanceSlider.value = simulatorService.virtualDistance;
    DOM.valSimDistance.textContent = `${simulatorService.virtualDistance} m`;
  });

  DOM.btnSimTeleportHome.addEventListener('click', () => {
    simulatorService.teleportToHome();
    DOM.simDistanceSlider.value = 2000;
    DOM.valSimDistance.textContent = '2000 m';
  });

  // Distance Slider
  DOM.simDistanceSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    DOM.valSimDistance.textContent = `${val} m`;
    simulatorService.setDistance(val);
  });

  // Speed Slider
  DOM.simSpeedSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    DOM.valSimSpeed.textContent = val === 1 ? '1x (Echtzeit)' : `${val}x (Zeitraffer)`;
    simulatorService.setSpeed(val);
  });

  // Generate Demo Data Button
  DOM.btnSimGenerateData.addEventListener('click', () => {
    if (confirm('Dadurch werden Demo-Daten für die letzten 14 Tage generiert. Bestehende Einträge bleiben erhalten. Fortfahren?')) {
      simulatorService.generateDemoData();
      history = storageService.getHistory(); // reload
      
      renderHistoryList();
      updateDashboardStats();
      
      // Confetti for fun
      fireGoalConfetti();
      
      alert('14 Tage Demo-Daten wurden erfolgreich erstellt! Wechseln Sie auf die Tabs "Verlauf" oder "Statistiken" um diese zu sehen.');
    }
  });
}

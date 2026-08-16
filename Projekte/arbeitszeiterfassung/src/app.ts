import { storageService } from "./storage";
import { calculateDistance, GeolocationService } from "./geo";
import { calculateArbZG } from "./arbzg";
import { MapService } from "./map";
import { chartService } from "./charts";
import { SimulatorService } from "./simulator";
import { setupProjectsUI, getProjects } from "./projects";
import { initSettingsUI } from "./settings";
import { initExportUI } from "./export";
import { OfficeLocation, WorkSession, HistoryEntry, AppSettings } from "./types";

let activeTab = "tab-dashboard";
let activeSession: WorkSession | null = null;
let history: HistoryEntry[] = [];
let officeLocation: OfficeLocation = storageService.getLocation();
let settings: AppSettings = storageService.getSettings();
let timerIntervalId: any = null;
let isConfettiFiredToday = false;

let geolocationService: GeolocationService | null = null;
let mapService: MapService | null = null;
let simulatorService: SimulatorService | null = null;

let DOM: Record<string, any> = {};

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp(): void {
  DOM = {
    navButtons: document.querySelectorAll(".nav-item"),
    tabPanes: document.querySelectorAll(".tab-pane"),
    globalStatusBadge: document.getElementById("global-status-badge"),
    globalStatusText: document.getElementById("global-status-text"),
    dashboardTimer: document.getElementById("dashboard-timer"),
    dashboardTargetLabel: document.getElementById("dashboard-target-label"),
    dailyProgressRing: document.getElementById("daily-progress-ring"),
    statusLocationName: document.getElementById("status-location-name"),
    statusDistanceValue: document.getElementById("status-distance-value"),
    statusGeofenceStatus: document.getElementById("status-geofence-status"),
    btnManualCheckin: document.getElementById("btn-manual-checkin"),
    btnManualCheckout: document.getElementById("btn-manual-checkout"),
    trackingActionGroup: document.getElementById("tracking-action-group"),
    btnPauseStart: document.getElementById("btn-pause-start"),
    btnPauseStop: document.getElementById("btn-pause-stop"),
    dashboardPauseLabel: document.getElementById("dashboard-pause-label"),
    statsMonthlyTotal: document.getElementById("stats-monthly-total"),
    statsDaysCompleted: document.getElementById("stats-days-completed"),
    statsOvertime: document.getElementById("stats-overtime"),
    mapSearchInput: document.getElementById("map-search-input") as HTMLInputElement,
    btnMapSearch: document.getElementById("btn-map-search") as HTMLButtonElement,
    searchSuggestions: document.getElementById("search-suggestions"),
    locationNameInput: document.getElementById("location-name-input") as HTMLInputElement,
    valLat: document.getElementById("val-lat"),
    valLng: document.getElementById("val-lng"),
    btnSaveLocation: document.getElementById("btn-save-location"),
    radiusButtons: document.querySelectorAll(".btn-radius"),
    manualLogToggle: document.getElementById("manual-log-toggle"),
    manualLogForm: document.getElementById("manual-log-form"),
    manualLogDate: document.getElementById("manual-log-date") as HTMLInputElement,
    manualLogStart: document.getElementById("manual-log-start") as HTMLInputElement,
    manualLogEnd: document.getElementById("manual-log-end") as HTMLInputElement,
    btnAddManualLog: document.getElementById("btn-add-manual-log"),
    absenceLogToggle: document.getElementById("absence-log-toggle"),
    absenceLogForm: document.getElementById("absence-log-form"),
    absenceLogDate: document.getElementById("absence-log-date") as HTMLInputElement,
    absenceLogType: document.getElementById("absence-log-type") as HTMLSelectElement,
    btnAddAbsenceLog: document.getElementById("btn-add-absence-log"),
    btnClearHistory: document.getElementById("btn-clear-history"),
    historyItemsContainer: document.getElementById("history-items-container"),
    statsAvgHours: document.getElementById("stats-avg-hours"),
    statsTotalHours: document.getElementById("stats-total-hours"),
    statsBestDay: document.getElementById("stats-best-day"),
    simulatorDrawer: document.getElementById("simulator-drawer"),
    simulatorHeader: document.getElementById("simulator-header"),
    simActiveToggle: document.getElementById("sim-active-toggle") as HTMLInputElement,
    simControlsSection: document.getElementById("sim-controls-section"),
    btnSimTeleportOffice: document.getElementById("btn-sim-teleport-office"),
    btnSimTeleportBorder: document.getElementById("btn-sim-teleport-border"),
    btnSimTeleportHome: document.getElementById("btn-sim-teleport-home"),
    simDistanceSlider: document.getElementById("sim-distance-slider") as HTMLInputElement,
    valSimDistance: document.getElementById("val-sim-distance"),
    simSpeedSlider: document.getElementById("sim-speed-slider") as HTMLInputElement,
    valSimSpeed: document.getElementById("val-sim-speed"),
    btnSimGenerateData: document.getElementById("btn-sim-generate-data"),
  };

  officeLocation = storageService.getLocation();
  activeSession = storageService.getActiveSession();
  history = storageService.getHistory();
  settings = storageService.getSettings();

  if (settings && settings.theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  }

  if (DOM.locationNameInput) DOM.locationNameInput.value = officeLocation.name;
  if (DOM.statusLocationName) DOM.statusLocationName.textContent = officeLocation.name;

  DOM.radiusButtons?.forEach((btn: HTMLElement) => {
    const btnRadius = parseInt(btn.getAttribute("data-radius") || "100", 10);
    if (btnRadius === officeLocation.radius) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  initMapService();
  initSimulatorService();
  initGeolocationService();

  setupNavEvents();
  setupLocationEvents();
  setupHistoryEvents();
  setupSimulatorEvents();
  setupManualTrackingEvents();
  setupProjectsUI();
  initSettingsUI();
  initExportUI();

  if (activeSession) {
    startTimerLoop();
    toggleCheckinButtons(true);
  } else {
    toggleCheckinButtons(false);
  }

  updateDashboardStats();
  registerServiceWorker();
}

function registerServiceWorker(): void {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./sw.js")
      .then(reg => console.log("Service Worker registriert. Scope:", reg.scope))
      .catch(err => console.warn("Service Worker Registrierung fehlgeschlagen:", err));
  }
}

function setupNavEvents(): void {
  DOM.navButtons?.forEach((btn: HTMLElement) => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      if (tabId) switchTab(tabId);
    });
  });
}

function switchTab(tabId: string): void {
  activeTab = tabId;

  DOM.navButtons?.forEach((btn: HTMLElement) => {
    if (btn.getAttribute("data-tab") === tabId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  DOM.tabPanes?.forEach((pane: HTMLElement) => {
    if (pane.id === tabId) {
      pane.classList.add("active");
    } else {
      pane.classList.remove("active");
    }
  });

  if (tabId === "tab-location" && mapService) {
    mapService.invalidateSize();
  } else if (tabId === "tab-history") {
    renderHistoryList();
  } else if (tabId === "tab-stats") {
    renderStatsTab();
  }
}

function initGeolocationService(): void {
  geolocationService = new GeolocationService(
    coords => handleLocationUpdate(coords),
    err => handleLocationError(err)
  );

  if (simulatorService && !simulatorService.isActive) {
    geolocationService.startTracking();
  }
}

function handleLocationUpdate(coords: GeolocationCoordinates): void {
  if (simulatorService && simulatorService.isActive) return;
  processPositionUpdate(coords.latitude, coords.longitude);
}

function handleLocationError(err: { message: string }): void {
  if (simulatorService && simulatorService.isActive) return;
  console.warn("Geolocation Error:", err.message);
  if (DOM.globalStatusText) DOM.globalStatusText.textContent = "GPS Fehler";
  if (DOM.statusDistanceValue) DOM.statusDistanceValue.textContent = "Ortung gesperrt";
}

function processPositionUpdate(
  latitude: number,
  longitude: number,
  distanceOverride: number | null = null
): void {
  let distance = distanceOverride;
  if (distance === null) {
    distance = calculateDistance(latitude, longitude, officeLocation.lat, officeLocation.lng);
  }

  if (DOM.statusDistanceValue) DOM.statusDistanceValue.textContent = `${distance} m`;

  const inside = distance <= officeLocation.radius;

  if (DOM.statusGeofenceStatus) {
    if (inside) {
      DOM.statusGeofenceStatus.textContent = "Im Radius";
      DOM.statusGeofenceStatus.className = "value status-active in-office";

      if (!activeSession) {
        triggerCheckin(false);
      }
    } else {
      DOM.statusGeofenceStatus.textContent = "Außerhalb";
      DOM.statusGeofenceStatus.className = "value status-active out-office";

      if (activeSession && !(activeSession as any).manual) {
        triggerCheckout();
      }
    }
  }

  updateHeaderIndicator(inside);
}

function updateHeaderIndicator(inside: boolean): void {
  if (!DOM.globalStatusBadge || !DOM.globalStatusText) return;
  DOM.globalStatusBadge.className = "status-indicator-badge";

  if (simulatorService && simulatorService.isActive) {
    DOM.globalStatusBadge.classList.add("status-sim");
    DOM.globalStatusText.textContent = "Simulator";
  } else if (activeSession) {
    DOM.globalStatusBadge.classList.add("status-in");
    DOM.globalStatusText.textContent = inside ? "Im Büro" : "Eingeloggt";
  } else {
    DOM.globalStatusBadge.classList.add("status-out");
    DOM.globalStatusText.textContent = "Abwesend";
  }
}

function setupManualTrackingEvents(): void {
  DOM.btnManualCheckin?.addEventListener("click", () => triggerCheckin(true));
  DOM.btnManualCheckout?.addEventListener("click", () => triggerCheckout());
  DOM.btnPauseStart?.addEventListener("click", () => triggerPauseStart());
  DOM.btnPauseStop?.addEventListener("click", () => triggerPauseStop());
}

function triggerPauseStart(): void {
  if (!activeSession || activeSession.isPaused) return;

  const now =
    simulatorService && simulatorService.isActive ? simulatorService.getSimulatedNow() : Date.now();

  activeSession.isPaused = true;
  activeSession.pauseStartTime = now;

  storageService.saveActiveSession(activeSession);
  toggleCheckinButtons(true);
}

function triggerPauseStop(): void {
  if (!activeSession || !activeSession.isPaused || !activeSession.pauseStartTime) return;

  const now =
    simulatorService && simulatorService.isActive ? simulatorService.getSimulatedNow() : Date.now();
  const pauseDuration = now - activeSession.pauseStartTime;

  activeSession.totalPauseMs += pauseDuration;
  activeSession.isPaused = false;
  activeSession.pauseStartTime = null;

  storageService.saveActiveSession(activeSession);
  toggleCheckinButtons(true);
}

function triggerCheckin(isManual = true): void {
  if (activeSession) return;

  const now =
    simulatorService && simulatorService.isActive ? simulatorService.getSimulatedNow() : Date.now();

  activeSession = {
    startTime: now,
    active: true,
    isPaused: false,
    pauseStartTime: null,
    totalPauseMs: 0,
    projectId: null,
    note: isManual ? "Manuell" : "Geofence",
  };
  (activeSession as any).manual = isManual;
  (activeSession as any).locationName = officeLocation.name;
  (activeSession as any).start = now;

  storageService.saveActiveSession(activeSession);
  toggleCheckinButtons(true);
  startTimerLoop();

  const isInside = DOM.statusGeofenceStatus?.classList.contains("in-office") || false;
  updateHeaderIndicator(isInside);

  if (DOM.dailyProgressRing) DOM.dailyProgressRing.classList.add("tracking-active");
}

function triggerCheckout(): void {
  if (!activeSession) return;

  const endTime =
    simulatorService && simulatorService.isActive ? simulatorService.getSimulatedNow() : Date.now();
  const startTime = (activeSession as any).start || activeSession.startTime;

  if (activeSession.isPaused && activeSession.pauseStartTime) {
    const pauseDur = endTime - activeSession.pauseStartTime;
    activeSession.totalPauseMs += pauseDur;
    activeSession.isPaused = false;
    activeSession.pauseStartTime = null;
  }

  const grossDuration = endTime - startTime;
  const actualPauseMs = activeSession.totalPauseMs || 0;

  const arbzgResult = calculateArbZG(
    grossDuration,
    actualPauseMs,
    settings.arbzgBreaksEnabled !== false
  );

  if (arbzgResult.warningMessage) {
    console.warn("ArbZG Hinweis:", arbzgResult.warningMessage);
  }

  const todayDateString = new Date(startTime).toISOString().split("T")[0];

  if (arbzgResult.netDurationMs >= 1000) {
    const formatTime = (ts: number) => {
      const d = new Date(ts);
      return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    };

    const entry: Omit<HistoryEntry, "id"> = {
      date: todayDateString,
      startTime: formatTime(startTime),
      endTime: formatTime(endTime),
      start: startTime,
      end: endTime,
      pauseMs: arbzgResult.effectivePauseMs,
      grossDurationMs,
      mandatoryPauseMs: arbzgResult.mandatoryPauseMs,
      netDurationMs: arbzgResult.netDurationMs,
      type: "work",
    };
    (entry as any).checkIn = startTime;
    (entry as any).checkOut = endTime;
    (entry as any).duration = arbzgResult.netDurationMs;
    (entry as any).pauseDuration = arbzgResult.effectivePauseMs;
    (entry as any).locationName = (activeSession as any).locationName || officeLocation.name;
    (entry as any).manual = (activeSession as any).manual ?? true;

    storageService.addHistoryEntry(entry);
    history = storageService.getHistory();
  }

  activeSession = null;
  storageService.clearActiveSession();
  toggleCheckinButtons(false);
  stopTimerLoop();

  const isInside = DOM.statusGeofenceStatus?.classList.contains("in-office") || false;
  updateHeaderIndicator(isInside);

  if (DOM.dailyProgressRing) DOM.dailyProgressRing.classList.remove("tracking-active");

  updateDashboardStats();

  if (activeTab === "tab-history") renderHistoryList();
  if (activeTab === "tab-stats") renderStatsTab();
}

function toggleCheckinButtons(isCheckedIn: boolean): void {
  if (isCheckedIn) {
    DOM.btnManualCheckin?.classList.add("hidden");
    DOM.trackingActionGroup?.classList.remove("hidden");

    if (activeSession && activeSession.isPaused) {
      DOM.btnPauseStart?.classList.add("hidden");
      DOM.btnPauseStop?.classList.remove("hidden");
      DOM.dashboardPauseLabel?.classList.remove("hidden");
    } else {
      DOM.btnPauseStart?.classList.remove("hidden");
      DOM.btnPauseStop?.classList.add("hidden");
      if (activeSession && activeSession.totalPauseMs > 0) {
        DOM.dashboardPauseLabel?.classList.remove("hidden");
      } else {
        DOM.dashboardPauseLabel?.classList.add("hidden");
      }
    }
  } else {
    DOM.btnManualCheckin?.classList.remove("hidden");
    DOM.trackingActionGroup?.classList.add("hidden");
    DOM.dashboardPauseLabel?.classList.add("hidden");
  }
}

function startTimerLoop(): void {
  stopTimerLoop();
  updateTimerDisplay();
  timerIntervalId = setInterval(() => {
    updateTimerDisplay();
  }, 1000);
}

function stopTimerLoop(): void {
  if (timerIntervalId) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }
  updateTimerDisplay(true);
}

function updateTimerDisplay(forceStop = false): void {
  const todayLoggedMs = getTodayLoggedTimeMs();
  let currentSessionMs = 0;
  let currentPauseMs = 0;

  if (activeSession) {
    const now =
      simulatorService && simulatorService.isActive
        ? simulatorService.getSimulatedNow()
        : Date.now();
    const startTime = (activeSession as any).start || activeSession.startTime;

    if (activeSession.isPaused && activeSession.pauseStartTime) {
      currentPauseMs = activeSession.totalPauseMs + (now - activeSession.pauseStartTime);
    } else {
      currentPauseMs = activeSession.totalPauseMs;
    }

    if (!forceStop) {
      currentSessionMs = now - startTime - currentPauseMs;
    }
  }

  const totalTimeMs = todayLoggedMs + currentSessionMs;

  const seconds = Math.floor((totalTimeMs / 1000) % 60);
  const minutes = Math.floor((totalTimeMs / (1000 * 60)) % 60);
  const hours = Math.floor(totalTimeMs / (1000 * 60 * 60));

  const pad = (n: number) => n.toString().padStart(2, "0");
  if (DOM.dashboardTimer)
    DOM.dashboardTimer.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  if (activeSession && (currentPauseMs > 0 || activeSession.isPaused)) {
    const pSecs = Math.floor((currentPauseMs / 1000) % 60);
    const pMins = Math.floor((currentPauseMs / (1000 * 60)) % 60);
    const pHrs = Math.floor(currentPauseMs / (1000 * 60 * 60));
    if (DOM.dashboardPauseLabel) {
      DOM.dashboardPauseLabel.textContent = `Pause: ${pad(pHrs)}:${pad(pMins)}:${pad(pSecs)}`;
      DOM.dashboardPauseLabel.classList.remove("hidden");
    }
  } else {
    if (DOM.dashboardPauseLabel) DOM.dashboardPauseLabel.classList.add("hidden");
  }

  const targetMs = settings.dailyTarget * 60 * 60 * 1000;
  const percentage = Math.min(totalTimeMs / targetMs, 1);
  const circumference = 263.89;
  const strokeDashoffset = circumference * (1 - percentage);

  if (DOM.dailyProgressRing) DOM.dailyProgressRing.style.strokeDashoffset = strokeDashoffset;

  if (percentage >= 1.0 && !isConfettiFiredToday) {
    isConfettiFiredToday = true;
    fireGoalConfetti();
  }
}

function getTodayLoggedTimeMs(): number {
  const todayStr = new Date().toISOString().split("T")[0];
  const todayLogs = history.filter(log => log.date === todayStr);
  return todayLogs.reduce((sum, log) => sum + (log.netDurationMs || (log as any).duration || 0), 0);
}

function updateDashboardStats(): void {
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`;

  const monthlyLogs = history.filter(log => log.date.startsWith(currentMonthStr));
  const monthlyMs = monthlyLogs.reduce(
    (sum, log) => sum + (log.netDurationMs || (log as any).duration || 0),
    0
  );
  if (DOM.statsMonthlyTotal)
    DOM.statsMonthlyTotal.textContent = `${(monthlyMs / 3600000).toFixed(1)} Std.`;

  const targetMs = settings.dailyTarget * 60 * 60 * 1000;

  const logsByDate: Record<string, number> = {};
  history.forEach(log => {
    if (!logsByDate[log.date]) logsByDate[log.date] = 0;
    logsByDate[log.date] += log.netDurationMs || (log as any).duration || 0;
  });

  let completedDaysCount = 0;
  const totalTrackedDays = Object.keys(logsByDate).length;
  let totalLoggedMsAllTime = 0;

  Object.values(logsByDate).forEach(dayMs => {
    if (dayMs >= targetMs) completedDaysCount++;
    totalLoggedMsAllTime += dayMs;
  });

  if (DOM.statsDaysCompleted)
    DOM.statsDaysCompleted.textContent = `${completedDaysCount} / ${totalTrackedDays} Tage`;

  if (DOM.statsOvertime) {
    const requiredMsAllTime = totalTrackedDays * targetMs;
    const overtimeMs = totalLoggedMsAllTime - requiredMsAllTime;
    const overtimeHrs = (overtimeMs / 3600000).toFixed(1);

    if (overtimeMs > 0) {
      DOM.statsOvertime.textContent = `+${overtimeHrs} Std.`;
      DOM.statsOvertime.style.color = "var(--accent-green)";
    } else if (overtimeMs < 0) {
      DOM.statsOvertime.textContent = `${overtimeHrs} Std.`;
      DOM.statsOvertime.style.color = "var(--accent-red)";
    } else {
      DOM.statsOvertime.textContent = `0.0 Std.`;
      DOM.statsOvertime.style.color = "var(--text-primary)";
    }
  }
}

function fireGoalConfetti(): void {
  const win = window as any;
  if (win.confetti) {
    win.confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#8b5cf6", "#10b981", "#60a5fa"],
    });
  }
}

function initMapService(): void {
  mapService = new MapService("map", officeLocation, (lat, lng, _radius) => {
    if (DOM.valLat) DOM.valLat.textContent = lat.toFixed(6);
    if (DOM.valLng) DOM.valLng.textContent = lng.toFixed(6);
  });
}

function setupLocationEvents(): void {
  DOM.radiusButtons?.forEach((btn: HTMLElement) => {
    btn.addEventListener("click", () => {
      DOM.radiusButtons.forEach((b: HTMLElement) => b.classList.remove("active"));
      btn.classList.add("active");
      const radius = btn.getAttribute("data-radius") || "100";
      if (mapService) mapService.updateRadius(radius);
    });
  });

  DOM.btnSaveLocation?.addEventListener("click", () => {
    if (!mapService) return;
    const name = DOM.locationNameInput.value.trim() || "Büro";

    officeLocation = {
      name: name,
      lat: mapService.lat,
      lng: mapService.lng,
      radius: mapService.radius,
    };

    storageService.saveLocation(officeLocation);

    if (DOM.statusLocationName) DOM.statusLocationName.textContent = name;

    if (simulatorService && simulatorService.isActive) {
      simulatorService.triggerLocationTick();
    } else if (geolocationService) {
      geolocationService
        .getCurrentPosition()
        .then(coords => {
          processPositionUpdate(coords.latitude, coords.longitude);
        })
        .catch(() => {
          processPositionUpdate(mapService!.lat, mapService!.lng);
        });
    }

    alert(`Standort "${name}" erfolgreich gespeichert!`);
  });

  DOM.btnMapSearch?.addEventListener("click", () => {
    executeAddressSearch();
  });

  DOM.mapSearchInput?.addEventListener("keypress", (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      executeAddressSearch();
    }
  });

  DOM.searchSuggestions?.addEventListener("click", (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const item = target.closest(".suggestion-item");
    if (item && mapService) {
      const lat = parseFloat(item.getAttribute("data-lat") || "0");
      const lng = parseFloat(item.getAttribute("data-lng") || "0");
      const displayName = item.getAttribute("data-name") || "";

      mapService.updatePosition(lat, lng);

      if (DOM.locationNameInput.value === "Büro" || DOM.locationNameInput.value === "") {
        const shortName = displayName.split(",")[0];
        DOM.locationNameInput.value = shortName;
      }

      DOM.searchSuggestions.classList.add("hidden");
      DOM.mapSearchInput.value = displayName;
    }
  });

  document.addEventListener("click", e => {
    const target = e.target as HTMLElement;
    if (!target.closest(".search-bar") && !target.closest(".search-suggestions-box")) {
      if (DOM.searchSuggestions) DOM.searchSuggestions.classList.add("hidden");
    }
  });
}

async function executeAddressSearch(): Promise<void> {
  if (!DOM.mapSearchInput || !mapService) return;
  const query = DOM.mapSearchInput.value.trim();
  if (query.length < 3) return;

  if (DOM.btnMapSearch) DOM.btnMapSearch.disabled = true;
  if (DOM.searchSuggestions) {
    DOM.searchSuggestions.innerHTML = '<div class="suggestion-item">Suche...</div>';
    DOM.searchSuggestions.classList.remove("hidden");
  }

  const results = await mapService.searchAddress(query);
  if (DOM.btnMapSearch) DOM.btnMapSearch.disabled = false;

  if (results.length === 0) {
    if (DOM.searchSuggestions) {
      DOM.searchSuggestions.innerHTML =
        '<div class="suggestion-item text-muted">Keine Ergebnisse gefunden</div>';
    }
    return;
  }

  let html = "";
  results.forEach(res => {
    html += `
      <div class="suggestion-item" data-lat="${res.lat}" data-lng="${res.lng}" data-name="${res.display_name}">
        ${res.display_name}
      </div>
    `;
  });
  if (DOM.searchSuggestions) DOM.searchSuggestions.innerHTML = html;
}

function setupHistoryEvents(): void {
  DOM.manualLogToggle?.addEventListener("click", () => {
    DOM.manualLogToggle.classList.toggle("active");
    DOM.manualLogForm.classList.toggle("hidden");
  });

  if (DOM.absenceLogToggle) {
    DOM.absenceLogToggle.addEventListener("click", () => {
      DOM.absenceLogToggle.classList.toggle("active");
      DOM.absenceLogForm.classList.toggle("hidden");
    });
  }

  DOM.btnAddManualLog?.addEventListener("click", () => {
    const dateVal = DOM.manualLogDate.value;
    const startVal = DOM.manualLogStart.value;
    const endVal = DOM.manualLogEnd.value;

    if (!dateVal || !startVal || !endVal) {
      alert("Bitte fülle alle Felder aus.");
      return;
    }

    const startParts = startVal.split(":");
    const endParts = endVal.split(":");

    const startDate = new Date(dateVal);
    startDate.setHours(parseInt(startParts[0], 10), parseInt(startParts[1], 10), 0, 0);

    const endDate = new Date(dateVal);
    endDate.setHours(parseInt(endParts[0], 10), parseInt(endParts[1], 10), 0, 0);

    if (endDate <= startDate) {
      alert("Die Gehen-Uhrzeit muss nach der Kommen-Uhrzeit liegen.");
      return;
    }

    const grossDuration = endDate.getTime() - startDate.getTime();
    const arbzgResult = calculateArbZG(grossDuration, 0, settings.arbzgBreaksEnabled !== false);

    const formatTime = (ts: number) => {
      const d = new Date(ts);
      return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    };

    const entry: Omit<HistoryEntry, "id"> = {
      date: dateVal,
      startTime: formatTime(startDate.getTime()),
      endTime: formatTime(endDate.getTime()),
      start: startDate.getTime(),
      end: endDate.getTime(),
      pauseMs: arbzgResult.effectivePauseMs,
      grossDurationMs,
      mandatoryPauseMs: arbzgResult.mandatoryPauseMs,
      netDurationMs: arbzgResult.netDurationMs,
      type: "work",
    };
    (entry as any).checkIn = startDate.getTime();
    (entry as any).checkOut = endDate.getTime();
    (entry as any).duration = arbzgResult.netDurationMs;
    (entry as any).locationName = officeLocation.name;
    (entry as any).manual = true;

    storageService.addHistoryEntry(entry);
    history = storageService.getHistory();

    DOM.manualLogDate.value = "";
    DOM.manualLogStart.value = "";
    DOM.manualLogEnd.value = "";
    DOM.manualLogForm.classList.add("hidden");
    DOM.manualLogToggle.classList.remove("active");

    renderHistoryList();
    updateDashboardStats();

    alert("Arbeitszeit erfolgreich nachgetragen!");
  });

  if (DOM.btnAddAbsenceLog) {
    DOM.btnAddAbsenceLog.addEventListener("click", () => {
      const dateVal = DOM.absenceLogDate.value;
      const typeVal = DOM.absenceLogType.value;

      if (!dateVal) {
        alert("Bitte wähle ein Datum aus.");
        return;
      }

      const targetHours = settings.dailyTarget || 8;
      const durationMs = targetHours * 3600000;

      const startDate = new Date(dateVal);
      startDate.setHours(8, 0, 0, 0);
      const endDate = new Date(startDate.getTime() + durationMs);

      const entry: Omit<HistoryEntry, "id"> = {
        date: dateVal,
        startTime: "08:00",
        endTime: "16:00",
        start: startDate.getTime(),
        end: endDate.getTime(),
        pauseMs: 0,
        grossDurationMs: durationMs,
        mandatoryPauseMs: 0,
        netDurationMs: durationMs,
        type: typeVal === "urlaub" ? "vacation" : "sick",
      };
      (entry as any).checkIn = startDate.getTime();
      (entry as any).checkOut = endDate.getTime();
      (entry as any).duration = durationMs;
      (entry as any).locationName = typeVal === "urlaub" ? "Urlaub" : "Krankheit";
      (entry as any).manual = true;
      (entry as any).isAbsence = true;
      (entry as any).absenceType = typeVal;

      storageService.addHistoryEntry(entry);
      history = storageService.getHistory();

      DOM.absenceLogDate.value = "";
      DOM.absenceLogForm.classList.add("hidden");
      DOM.absenceLogToggle.classList.remove("active");

      renderHistoryList();
      updateDashboardStats();

      alert("Abwesenheit erfolgreich eingetragen!");
    });
  }

  DOM.btnClearHistory?.addEventListener("click", () => {
    if (
      confirm(
        "Möchtest du wirklich alle aufgezeichneten Daten löschen? Dies kann nicht rückgängig gemacht werden."
      )
    ) {
      storageService.clearHistory();
      history = [];
      renderHistoryList();
      updateDashboardStats();
      isConfettiFiredToday = false;
    }
  });

  DOM.historyItemsContainer?.addEventListener("click", (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const btn = target.closest(".btn-delete-item");
    if (btn) {
      const id = btn.getAttribute("data-id");
      if (id && confirm("Eintrag löschen?")) {
        storageService.deleteHistoryEntry(id);
        history = storageService.getHistory();
        renderHistoryList();
        updateDashboardStats();
      }
    }
  });
}

function renderHistoryList(): void {
  if (!DOM.historyItemsContainer) return;

  if (history.length === 0) {
    DOM.historyItemsContainer.innerHTML = `
      <div class="empty-state">
        <i data-lucide="info" class="empty-icon"></i>
        <p>Keine Einträge für die Vergangenheit gefunden. Verwende den Simulator oder trage Zeiten manuell nach.</p>
      </div>
    `;
    const win = window as any;
    if (win.lucide) win.lucide.createIcons();
    return;
  }

  let html = "";
  const targetMs = settings.dailyTarget * 60 * 60 * 1000;

  history.forEach((log: any) => {
    const checkInTs = log.start || log.checkIn || Date.now();
    const dateObj = new Date(checkInTs);

    const days = ["So.", "Mo.", "Di.", "Mi.", "Do.", "Fr.", "Sa."];
    const weekday = days[dateObj.getDay()];
    const dateStr = `${weekday}, ${dateObj.getDate().toString().padStart(2, "0")}.${(dateObj.getMonth() + 1).toString().padStart(2, "0")}.${dateObj.getFullYear()}`;

    const formatTime = (ts: number) => {
      const d = new Date(ts);
      return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")} Uhr`;
    };

    const netMs = log.netDurationMs || log.duration || 0;
    const durationHrs = netMs / 3600000;
    const isTargetMet = netMs >= targetMs;
    const badgeClass = isTargetMet ? "history-duration-badge completed" : "history-duration-badge";

    let pauseHtml = "";
    const totalPause = log.pauseMs || log.pauseDuration || 0;
    if (totalPause > 0) {
      const pauseMins = Math.round(totalPause / 60000);
      pauseHtml = ` • Pause: ${pauseMins} Min.`;
    }
    if (log.mandatoryPauseMs && log.mandatoryPauseMs > (log.actualPauseMs || 0)) {
      const arbzgMins = Math.round(log.mandatoryPauseMs / 60000);
      pauseHtml += ` (inkl. ${arbzgMins} Min. ArbZG)`;
    }

    let timeStrHtml = `${log.startTime || formatTime(checkInTs)} - ${log.endTime || (log.checkOut ? formatTime(log.checkOut) : "-")} ${log.manual ? "(Manuell)" : ""}${pauseHtml}`;
    if (log.isAbsence) {
      timeStrHtml =
        log.absenceType === "urlaub" ? "Urlaubstag (Erfüllt)" : "Krankheitstag (Erfüllt)";
    }

    html += `
      <div class="history-item">
        <div class="history-item-left">
          <span class="history-item-date">${dateStr}</span>
          <span class="history-item-times">
            ${timeStrHtml}
          </span>
          <span class="history-item-loc">${log.locationName || "Büro"}</span>
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
  const win = window as any;
  if (win.lucide) win.lucide.createIcons();
}

function renderStatsTab(): void {
  const totalHrs =
    history.reduce((sum, log: any) => sum + (log.netDurationMs || log.duration || 0), 0) / 3600000;
  if (DOM.statsTotalHours) DOM.statsTotalHours.textContent = `${totalHrs.toFixed(1)} Std.`;

  const logsByDate: Record<string, number> = {};
  history.forEach((log: any) => {
    if (!logsByDate[log.date]) logsByDate[log.date] = 0;
    logsByDate[log.date] += log.netDurationMs || log.duration || 0;
  });

  const dates = Object.keys(logsByDate);
  const avgHrs = dates.length > 0 ? totalHrs / dates.length : 0;
  if (DOM.statsAvgHours) DOM.statsAvgHours.textContent = `${avgHrs.toFixed(1)} Std.`;

  let bestDate = "-";
  let maxMs = 0;
  Object.entries(logsByDate).forEach(([dateStr, ms]) => {
    if (ms > maxMs) {
      maxMs = ms;
      bestDate = dateStr;
    }
  });

  if (bestDate !== "-") {
    const bd = new Date(bestDate);
    if (DOM.statsBestDay)
      DOM.statsBestDay.textContent = `${bd.getDate().toString().padStart(2, "0")}.${(bd.getMonth() + 1).toString().padStart(2, "0")}. (${(maxMs / 3600000).toFixed(1)}h)`;
  } else {
    if (DOM.statsBestDay) DOM.statsBestDay.textContent = "-";
  }

  chartService.renderWeeklyChart("weekly-chart-container", history);
  chartService.renderMonthlyChart("monthly-chart-container", history);
  chartService.renderProjectDonutChart("project-chart-container", getProjects());
}

function initSimulatorService(): void {
  simulatorService = new SimulatorService(
    isActive => {
      if (isActive) {
        if (geolocationService) geolocationService.stopTracking();
        if (DOM.globalStatusBadge) DOM.globalStatusBadge.classList.add("status-sim");
        if (DOM.globalStatusText) DOM.globalStatusText.textContent = "Simulator";
        if (DOM.simControlsSection) DOM.simControlsSection.classList.remove("disabled");
      } else {
        if (DOM.simControlsSection) DOM.simControlsSection.classList.add("disabled");
        if (DOM.globalStatusBadge) DOM.globalStatusBadge.classList.remove("status-sim");
        if (geolocationService) geolocationService.startTracking();
      }
    },
    (coords, distance) => {
      processPositionUpdate(coords.latitude, coords.longitude, distance);
    }
  );
}

function setupSimulatorEvents(): void {
  DOM.simulatorHeader?.addEventListener("click", () => {
    DOM.simulatorDrawer?.classList.toggle("open");
  });

  DOM.simActiveToggle?.addEventListener("change", (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (simulatorService) simulatorService.toggle(target.checked);
  });

  DOM.btnSimTeleportOffice?.addEventListener("click", () => {
    if (!simulatorService) return;
    simulatorService.teleportToOffice();
    if (DOM.simDistanceSlider) DOM.simDistanceSlider.value = "0";
    if (DOM.valSimDistance) DOM.valSimDistance.textContent = "0 m";
  });

  DOM.btnSimTeleportBorder?.addEventListener("click", () => {
    if (!simulatorService) return;
    simulatorService.teleportToBorder();
    if (DOM.simDistanceSlider)
      DOM.simDistanceSlider.value = simulatorService.virtualDistance.toString();
    if (DOM.valSimDistance)
      DOM.valSimDistance.textContent = `${simulatorService.virtualDistance} m`;
  });

  DOM.btnSimTeleportHome?.addEventListener("click", () => {
    if (!simulatorService) return;
    simulatorService.teleportToHome();
    if (DOM.simDistanceSlider) DOM.simDistanceSlider.value = "2000";
    if (DOM.valSimDistance) DOM.valSimDistance.textContent = "2000 m";
  });

  DOM.simDistanceSlider?.addEventListener("input", (e: Event) => {
    const target = e.target as HTMLInputElement;
    const val = parseInt(target.value, 10);
    if (DOM.valSimDistance) DOM.valSimDistance.textContent = `${val} m`;
    if (simulatorService) simulatorService.setDistance(val);
  });

  DOM.simSpeedSlider?.addEventListener("input", (e: Event) => {
    const target = e.target as HTMLInputElement;
    const val = parseInt(target.value, 10);
    if (DOM.valSimSpeed)
      DOM.valSimSpeed.textContent = val === 1 ? "1x (Echtzeit)" : `${val}x (Zeitraffer)`;
    if (simulatorService) simulatorService.setSpeed(val);
  });

  DOM.btnSimGenerateData?.addEventListener("click", () => {
    if (
      confirm(
        "Dadurch werden Demo-Daten für die letzten 14 Tage generiert. Bestehende Einträge bleiben erhalten. Fortfahren?"
      )
    ) {
      if (simulatorService) simulatorService.generateDemoData();
      history = storageService.getHistory();
      renderHistoryList();
      updateDashboardStats();
      fireGoalConfetti();
      alert(
        '14 Tage Demo-Daten wurden erfolgreich erstellt! Wechseln Sie auf die Tabs "Verlauf" oder "Statistiken" um diese zu sehen.'
      );
    }
  });
}

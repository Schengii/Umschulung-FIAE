import { LitElement, html, unsafeCSS, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DiagnosisResult } from "../services/ai-types";
import "@vaadin/progress-bar";
import wizardStyles from "./ec-diagnosis-wizard.css?inline";

@customElement("ec-dashboard")
export class EcDashboard extends LitElement {
  static styles = [
    unsafeCSS(wizardStyles),
    css`
      .dashboard-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
        margin-top: 1.25rem;
      }

      @media (min-width: 600px) {
        .dashboard-grid {
          grid-template-columns: 1fr 1fr;
        }
      }

      .chart-card {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid var(--border);
        border-radius: var(--radius-m);
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .chart-title {
        font-size: 0.95rem;
        font-weight: 700;
        margin: 0 0 1rem 0;
        align-self: flex-start;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .donut-container {
        position: relative;
        width: 140px;
        height: 140px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .donut-svg {
        transform: rotate(-90deg);
        width: 100%;
        height: 100%;
      }

      .donut-circle-bg {
        fill: none;
        stroke: var(--border);
        stroke-width: 8;
      }

      .donut-circle-segment {
        fill: none;
        stroke-width: 8;
        stroke-linecap: round;
        transition: stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease;
      }

      .donut-label {
        position: absolute;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        pointer-events: none;
      }

      .donut-number {
        font-size: 1.75rem;
        font-weight: 800;
        color: var(--text-primary);
        line-height: 1;
      }

      .donut-unit {
        font-size: 0.7rem;
        color: var(--text-muted);
        text-transform: uppercase;
        font-weight: 600;
        margin-top: 2px;
      }

      .chart-legend {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
        margin-top: 1.25rem;
      }

      .legend-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.85rem;
      }

      .legend-color-label {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .legend-color-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        display: inline-block;
      }

      .legend-count {
        font-weight: 700;
        color: var(--text-primary);
      }

      /* SVG Bar Chart */
      .bar-chart-svg {
        width: 100%;
        height: 160px;
        overflow: visible;
      }

      .bar-rect {
        transition: height 0.5s ease, y 0.5s ease, opacity 0.2s;
        cursor: pointer;
      }

      .bar-rect:hover {
        opacity: 0.85;
      }

      .bar-label-text {
        font-size: 10px;
        fill: var(--text-secondary);
        font-weight: 500;
      }

      .bar-value-text {
        font-size: 10px;
        fill: var(--text-primary);
        font-weight: 700;
      }

      .grid-line {
        stroke: var(--border);
        stroke-dasharray: 2 2;
        stroke-width: 0.5;
      }

      #leaflet-map {
        background: #090d16;
      }
    `
  ];

  @property({ type: Array }) history: DiagnosisResult[] = [];
  private _map: any = null;

  firstUpdated() {
    if (this.history && this.history.length > 0) {
      setTimeout(() => {
        this._initMap();
      }, 150);
    }
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);
    if (changedProperties.has("history") && this.history && this.history.length > 0) {
      setTimeout(() => {
        this._initMap();
      }, 150);
    }
  }

  private _initMap() {
    const mapContainer = this.shadowRoot?.getElementById("leaflet-map");
    if (!mapContainer || !(window as any).L) return;

    if (this._map) {
      this._map.remove();
      this._map = null;
    }

    try {
      const L = (window as any).L;
      // Default: Center Germany
      const map = L.map(mapContainer).setView([51.1657, 10.4515], 5);
      this._map = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      let hasMarkers = false;
      let sumLat = 0;
      let sumLng = 0;
      let count = 0;

      this.history.forEach((item) => {
        const location = (item as any).location;
        if (!location) return;
        const match = location.match(/Lat:\s*([-\d.]+),\s*Lng:\s*([-\d.]+)/i);
        if (match) {
          const lat = parseFloat(match[1]);
          const lng = parseFloat(match[2]);
          if (!isNaN(lat) && !isNaN(lng)) {
            sumLat += lat;
            sumLng += lng;
            count++;

            const safety = (item.safetyLevel || "SAFE").toUpperCase();
            const markerColor =
              safety === "DANGER"
                ? "#ef4444"
                : safety === "WARNING"
                ? "#f59e0b"
                : "#10b981";

            const customIcon = L.divIcon({
              className: "custom-map-marker",
              html: `<div style="background-color: ${markerColor}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.5);"></div>`,
              iconSize: [14, 14],
              iconAnchor: [7, 7]
            });

            L.marker([lat, lng], { icon: customIcon })
              .addTo(map)
              .bindPopup(`
                <div style="color: black; font-family: sans-serif; font-size: 0.8rem;">
                  <strong style="color: ${markerColor}; font-size: 0.85rem;">${item.deviceName || "Gerät"}</strong><br/>
                  <strong>Defekt:</strong> ${item.identifiedDefect || "Kein Defekt"}<br/>
                  <strong>Status:</strong> ${safety}
                </div>
              `);
            
            hasMarkers = true;
          }
        }
      });

      if (hasMarkers && count > 0) {
        map.setView([sumLat / count, sumLng / count], 10);
      }
    } catch (e) {
      console.error("Fehler beim Initialisieren der Leaflet-Karte:", e);
    }
  }

  render() {
    if (this.history.length === 0) {
      return html`
        <div class="card empty-dashboard">
          <h3 class="text-muted m-0">Keine Daten vorhanden</h3>
          <p>Starte deine erste Diagnose, um hier Statistiken zu sehen.</p>
        </div>
      `;
    }

    const totalDiagnoses = this.history.length;

    // 1. Safety Level Distribution Calculations
    const safetyCounts = this.history.reduce(
      (acc, item) => {
        const lvl = (item.safetyLevel || "SAFE").toUpperCase();
        if (lvl === "DANGER") acc.danger++;
        else if (lvl === "WARNING") acc.warning++;
        else acc.safe++;
        return acc;
      },
      { safe: 0, warning: 0, danger: 0 }
    );

    const r = 36;
    const circ = 2 * Math.PI * r;

    const safePct = totalDiagnoses > 0 ? safetyCounts.safe / totalDiagnoses : 0;
    const warningPct = totalDiagnoses > 0 ? safetyCounts.warning / totalDiagnoses : 0;
    const dangerPct = totalDiagnoses > 0 ? safetyCounts.danger / totalDiagnoses : 0;

    const safeDash = circ * safePct;
    const warningDash = circ * warningPct;
    const dangerDash = circ * dangerPct;

    const safeOffset = 0;
    const warningOffset = -safeDash;
    const dangerOffset = -(safeDash + warningDash);

    // 2. Top Device Calculations for Bar Chart
    const deviceCounts = this.history.reduce(
      (acc, item) => {
        const name = item.deviceName || "Unbekannt";
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const sortedDevices = Object.entries(deviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    const maxCount = Math.max(...sortedDevices.map(([, count]) => count), 1);

    const avgDifficulty = (
      this.history.reduce(
        (sum, item) => sum + (item.repairDifficulty || 1),
        0,
      ) / totalDiagnoses
    ).toFixed(1);

    return html`
      <div class="card result-card">
        <h3 class="m-0 dashboard-title">📊 Management Dashboard</h3>
        
        <div class="dashboard-stats" style="margin-top: 1rem;">
          <div class="stat-card">
            <div class="stat-value-primary">${totalDiagnoses}</div>
            <div class="stat-label">Gesamt-Tickets</div>
          </div>
          <div class="stat-card">
            <div class="stat-value-warning">${avgDifficulty} / 5</div>
            <div class="stat-label">Ø Schwierigkeit</div>
          </div>
        </div>

        <div class="dashboard-grid">
          <!-- Safety Levels Donut Chart -->
          <div class="chart-card">
            <h4 class="chart-title">🛡️ Sicherheitsstufen</h4>
            
            <div class="donut-container">
              <svg class="donut-svg" viewBox="0 0 100 100">
                <circle class="donut-circle-bg" cx="50" cy="50" r="${r}"></circle>
                
                ${safePct > 0 ? html`
                  <circle 
                    class="donut-circle-segment" 
                    cx="50" 
                    cy="50" 
                    r="${r}" 
                    stroke="var(--success, #10b981)" 
                    stroke-dasharray="${safeDash} ${circ - safeDash}" 
                    stroke-dashoffset="${safeOffset}"
                  ></circle>
                ` : ""}

                ${warningPct > 0 ? html`
                  <circle 
                    class="donut-circle-segment" 
                    cx="50" 
                    cy="50" 
                    r="${r}" 
                    stroke="var(--warning, #f59e0b)" 
                    stroke-dasharray="${warningDash} ${circ - warningDash}" 
                    stroke-dashoffset="${warningOffset}"
                  ></circle>
                ` : ""}

                ${dangerPct > 0 ? html`
                  <circle 
                    class="donut-circle-segment" 
                    cx="50" 
                    cy="50" 
                    r="${r}" 
                    stroke="var(--danger, #ef4444)" 
                    stroke-dasharray="${dangerDash} ${circ - dangerDash}" 
                    stroke-dashoffset="${dangerOffset}"
                  ></circle>
                ` : ""}
              </svg>
              
              <div class="donut-label">
                <span class="donut-number">${totalDiagnoses}</span>
                <span class="donut-unit">Prüfungen</span>
              </div>
            </div>

            <div class="chart-legend">
              <div class="legend-item">
                <div class="legend-color-label">
                  <span class="legend-color-dot" style="background-color: var(--success, #10b981)"></span>
                  <span>Sicher (SAFE)</span>
                </div>
                <span class="legend-count">${safetyCounts.safe} (${Math.round(safePct * 100)}%)</span>
              </div>
              <div class="legend-item">
                <div class="legend-color-label">
                  <span class="legend-color-dot" style="background-color: var(--warning, #f59e0b)"></span>
                  <span>Warnung (WARNING)</span>
                </div>
                <span class="legend-count">${safetyCounts.warning} (${Math.round(warningPct * 100)}%)</span>
              </div>
              <div class="legend-item">
                <div class="legend-color-label">
                  <span class="legend-color-dot" style="background-color: var(--danger, #ef4444)"></span>
                  <span>Gefahr (DANGER)</span>
                </div>
                <span class="legend-count">${safetyCounts.danger} (${Math.round(dangerPct * 100)}%)</span>
              </div>
            </div>
          </div>

          <!-- Top Devices Bar Chart -->
          <div class="chart-card">
            <h4 class="chart-title">📈 Top Geräte & Fehlerverteilung</h4>
            
            <svg class="bar-chart-svg" viewBox="0 0 200 160">
              <line class="grid-line" x1="40" y1="20" x2="200" y2="20"></line>
              <line class="grid-line" x1="40" y1="60" x2="200" y2="60"></line>
              <line class="grid-line" x1="40" y1="100" x2="200" y2="100"></line>
              <line class="grid-line" x1="40" y1="140" x2="200" y2="140"></line>

              ${sortedDevices.map(([name, count], index) => {
                const y = 20 + index * 32;
                const barWidth = Math.max((count / maxCount) * 120, 5);
                const truncatedName = name.length > 8 ? name.slice(0, 6) + "..." : name;

                return html`
                  <g>
                    <text class="bar-label-text" x="5" y="${y + 12}" text-anchor="start">${truncatedName}</text>
                    <rect 
                      class="bar-rect" 
                      x="40" 
                      y="${y + 2}" 
                      width="${barWidth}" 
                      height="14" 
                      rx="3" 
                      fill="var(--primary, #3b82f6)"
                    ></rect>
                    <text class="bar-value-text" x="${40 + barWidth + 5}" y="${y + 12}" text-anchor="start">${count}x</text>
                  </g>
                `;
              })}
              
              <line x1="40" y1="15" x2="40" y2="145" stroke="var(--border)" stroke-width="1"></line>
            </svg>
          </div>

          <!-- GPS Ticket-Landkarte -->
          <div class="chart-card" style="grid-column: span 1; width: 100%; min-height: 270px; justify-content: flex-start;">
            <h4 class="chart-title">📍 Ticket-Landkarte (GPS)</h4>
            <div id="leaflet-map" style="width: 100%; height: 200px; border-radius: var(--radius-s); border: 1px solid var(--border); z-index: 1;"></div>
          </div>
        </div>
      </div>
    `;
  }
}

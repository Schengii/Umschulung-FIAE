// ============================================================
// Amazon 2.0 – Smart-Home Blueprint & Interactive Room Planner
// ============================================================
import type { AppState } from '../types';
import { formatPrice } from '../utils/formatters';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';
import { emit } from '../store';

export interface SmartDeviceSlot {
  id: string;
  name: string;
  category: string;
  icon: string;
  x: number; // Percentage on blueprint (0 - 100)
  y: number; // Percentage on blueprint (0 - 100)
  productId: string;
  productTitle: string;
  price: number;
  powerWatts: number;
  status: 'on' | 'off' | 'dimmed';
  automationRole: string;
}

export type RoomPreset = 'living_room' | 'office' | 'bedroom' | 'kitchen';

interface RoomConfig {
  title: string;
  icon: string;
  dimensions: string;
  devices: SmartDeviceSlot[];
}

const ROOM_PRESETS: Record<RoomPreset, RoomConfig> = {
  living_room: {
    title: 'Wohnzimmer (Living Room)',
    icon: '🛋️',
    dimensions: '28 m² • 4 Zonen',
    devices: [
      {
        id: 'dev-tv',
        name: 'Smart 4K OLED TV 65"',
        category: 'Entertainment',
        icon: '📺',
        x: 50,
        y: 18,
        productId: 'prod-4',
        productTitle: 'Samsung Smart 4K OLED TV',
        price: 899.99,
        powerWatts: 120,
        status: 'on',
        automationRole: 'Kino & Media',
      },
      {
        id: 'dev-echo-hub',
        name: 'Echo Hub Smart Control Center',
        category: 'Hub',
        icon: '🎛️',
        x: 20,
        y: 45,
        productId: 'prod-3',
        productTitle: 'Amazon Echo Hub Smart Display',
        price: 179.99,
        powerWatts: 15,
        status: 'on',
        automationRole: 'Zentrale Steuerung',
      },
      {
        id: 'dev-light-ambient',
        name: 'Philips Hue Smart Lightstrip Plus',
        category: 'Lighting',
        icon: '💡',
        x: 80,
        y: 25,
        productId: 'prod-hue-strip',
        productTitle: 'Philips Hue Smart Ambient Lightstrip',
        price: 79.99,
        powerWatts: 20,
        status: 'dimmed',
        automationRole: 'Ambiente-Licht',
      },
      {
        id: 'dev-thermo',
        name: 'Tado Smart Heizkörper-Thermostat X',
        category: 'Climate',
        icon: '🌡️',
        x: 82,
        y: 75,
        productId: 'prod-tado-x',
        productTitle: 'Tado Smart Radiator Thermostat X',
        price: 89.99,
        powerWatts: 2,
        status: 'on',
        automationRole: 'Temperaturregelung (21.5°C)',
      },
      {
        id: 'dev-cam',
        name: 'Ring Indoor Cam HD 2. Gen',
        category: 'Security',
        icon: '📹',
        x: 15,
        y: 80,
        productId: 'prod-ring-cam',
        productTitle: 'Ring Indoor Security Camera HD',
        price: 59.99,
        powerWatts: 5,
        status: 'on',
        automationRole: 'Sicherheitsüberwachung',
      },
    ],
  },
  office: {
    title: 'Home-Office Studio',
    icon: '💼',
    dimensions: '16 m² • Fokus-Zone',
    devices: [
      {
        id: 'dev-off-monitor',
        name: 'Curved Productivity Monitor 34"',
        category: 'Entertainment',
        icon: '🖥️',
        x: 50,
        y: 25,
        productId: 'prod-4',
        productTitle: 'UltraWide Curved Monitor',
        price: 499.99,
        powerWatts: 65,
        status: 'on',
        automationRole: 'Workstation Display',
      },
      {
        id: 'dev-off-echo',
        name: 'Echo Pop Smart Speaker',
        category: 'Hub',
        icon: '🔊',
        x: 75,
        y: 35,
        productId: 'prod-3',
        productTitle: 'Amazon Echo Pop Compact',
        price: 44.99,
        powerWatts: 10,
        status: 'on',
        automationRole: 'Fokus-Musik & Voice AI',
      },
      {
        id: 'dev-off-desklight',
        name: 'BenQ ScreenBar Halo Monitor Light',
        category: 'Lighting',
        icon: '💡',
        x: 50,
        y: 45,
        productId: 'prod-desk-light',
        productTitle: 'Smart ScreenBar Desk Lamp',
        price: 129.99,
        powerWatts: 12,
        status: 'on',
        automationRole: 'Ergonomisches Licht',
      },
    ],
  },
  bedroom: {
    title: 'Schlafzimmer (Bedroom)',
    icon: '🛏️',
    dimensions: '20 m² • Schlaf-Zone',
    devices: [
      {
        id: 'dev-bed-echo-spot',
        name: 'Echo Spot Smart Wecker',
        category: 'Hub',
        icon: '⏰',
        x: 25,
        y: 35,
        productId: 'prod-3',
        productTitle: 'Echo Spot Wecker mit Display',
        price: 79.99,
        powerWatts: 8,
        status: 'dimmed',
        automationRole: 'Sanfter Sonnenaufgangswecker',
      },
      {
        id: 'dev-bed-purifier',
        name: 'Philips Smart Air Purifier 3000i',
        category: 'Climate',
        icon: '🍃',
        x: 75,
        y: 70,
        productId: 'prod-air-purifier',
        productTitle: 'Smart HEPA Luftreiniger',
        price: 249.99,
        powerWatts: 30,
        status: 'on',
        automationRole: 'Leiser Nachtmodus (19 dB)',
      },
    ],
  },
  kitchen: {
    title: 'Smarte Küche',
    icon: '🍳',
    dimensions: '14 m² • Koch-Zone',
    devices: [
      {
        id: 'dev-kitch-show',
        name: 'Echo Show 10 mit Dreh-Display',
        category: 'Hub',
        icon: '🍲',
        x: 45,
        y: 25,
        productId: 'prod-3',
        productTitle: 'Amazon Echo Show 10 Koch-Assistent',
        price: 269.99,
        powerWatts: 22,
        status: 'on',
        automationRole: 'Rezept- & Video-Assistent',
      },
      {
        id: 'dev-kitch-plug',
        name: 'Smart Plug Energie-Zwischenstecker',
        category: 'Power',
        icon: '🔌',
        x: 80,
        y: 60,
        productId: 'prod-smart-plug',
        productTitle: 'Smart Plug Energiemesser',
        price: 24.99,
        powerWatts: 1,
        status: 'on',
        automationRole: 'Kaffeemaschinen-Auto-Start',
      },
    ],
  },
};

let currentRoom: RoomPreset = 'living_room';
let activeAutomation: 'normal' | 'movie' | 'goodnight' | 'eco' = 'normal';
let plannerModalEl: HTMLElement | null = null;

function getPlannerModal(): HTMLElement {
  if (!plannerModalEl) {
    plannerModalEl = document.createElement('div');
    plannerModalEl.id = 'smartHomePlannerModal';
    plannerModalEl.className = 'modal-overlay';
    plannerModalEl.setAttribute('role', 'dialog');
    plannerModalEl.setAttribute('aria-modal', 'true');
    plannerModalEl.setAttribute('aria-label', 'Smart-Home Blueprint & Raumplaner');
    document.body.appendChild(plannerModalEl);
  }
  return plannerModalEl;
}

export function openSmartHomePlannerModal(state: AppState): void {
  const modal = getPlannerModal();
  renderPlannerUI(state);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeSmartHomePlannerModal(): void {
  if (plannerModalEl) {
    plannerModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function calculateRoomMetrics(devices: SmartDeviceSlot[]) {
  const totalPrice = devices.reduce((sum, d) => sum + d.price, 0);
  const bundleDiscount = 0.15; // 15% Bundle Discount
  const discountedPrice = totalPrice * (1 - bundleDiscount);
  const totalWatts = devices.reduce((sum, d) => sum + (d.status === 'off' ? 0 : d.status === 'dimmed' ? d.powerWatts * 0.4 : d.powerWatts), 0);
  const monthlyKwh = ((totalWatts * 8 * 30) / 1000).toFixed(1);

  return { totalPrice, discountedPrice, bundleDiscount, totalWatts: Math.round(totalWatts), monthlyKwh };
}

function renderPlannerUI(state: AppState): void {
  const modal = getPlannerModal();
  const room = ROOM_PRESETS[currentRoom];
  const metrics = calculateRoomMetrics(room.devices);

  modal.innerHTML = `
    <div class="modal-dialog planner-dialog">
      <button class="modal-close" id="closePlannerBtn" aria-label="Schließen">✕</button>

      <div class="planner-header">
        <div class="planner-title-badge">🏠 INTERAKTIVER 2D/3D BLUEPRINT</div>
        <h2>Smart-Home Raumplaner & Automations-Studio</h2>
        <p class="planner-sub">Konfiguriere deinen perfekten vernetzten Raum, simuliere Szenarien und spare 15% im Komplettpaket.</p>
      </div>

      <!-- Room Tabs -->
      <div class="planner-room-tabs">
        ${(Object.keys(ROOM_PRESETS) as RoomPreset[]).map(key => `
          <button class="planner-tab ${currentRoom === key ? 'active' : ''}" data-room="${key}">
            ${ROOM_PRESETS[key].icon} ${ROOM_PRESETS[key].title}
          </button>
        `).join('')}
      </div>

      <!-- Automation Scenario Selector -->
      <div class="automation-scenarios-bar">
        <span class="scenario-label">⚡ Live-Szenario testen:</span>
        <button class="scenario-chip ${activeAutomation === 'normal' ? 'active' : ''}" data-scenario="normal">☀️ Tag-Modus</button>
        <button class="scenario-chip ${activeAutomation === 'movie' ? 'active' : ''}" data-scenario="movie">🍿 Kino-Modus</button>
        <button class="scenario-chip ${activeAutomation === 'goodnight' ? 'active' : ''}" data-scenario="goodnight">🌙 Gute Nacht</button>
        <button class="scenario-chip ${activeAutomation === 'eco' ? 'active' : ''}" data-scenario="eco">🌱 Eco-Stromspar</button>
      </div>

      <div class="planner-main-grid">
        <!-- Interactive Blueprint Grid -->
        <div class="blueprint-canvas-wrapper">
          <div class="blueprint-grid-overlay">
            <div class="room-dimension-tag">${room.dimensions}</div>
            
            ${room.devices.map(dev => `
              <div
                class="blueprint-device-node ${dev.status}"
                style="left: ${dev.x}%; top: ${dev.y}%;"
                data-dev-id="${dev.id}"
                title="${dev.name} (${dev.automationRole})"
              >
                <div class="device-pulse-ring"></div>
                <div class="device-node-icon">${dev.icon}</div>
                <div class="device-node-label">${dev.name}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Right Side: Device List & Bundle Buy Card -->
        <div class="planner-sidebar">
          <h3 class="sidebar-title">Installierte Geräte (${room.devices.length})</h3>
          
          <div class="planner-device-list">
            ${room.devices.map(dev => `
              <div class="planner-dev-card">
                <div class="planner-dev-icon">${dev.icon}</div>
                <div class="planner-dev-info">
                  <strong>${dev.name}</strong>
                  <span class="dev-role">${dev.automationRole}</span>
                  <span class="dev-watt">${dev.powerWatts} W • ${formatPrice(dev.price)}</span>
                </div>
                <button class="dev-toggle-btn ${dev.status}" data-toggle-id="${dev.id}">
                  ${dev.status === 'on' ? 'AN' : dev.status === 'dimmed' ? 'GEDIMMT' : 'AUS'}
                </button>
              </div>
            `).join('')}
          </div>

          <!-- Energy Telemetry -->
          <div class="energy-telemetry-box">
            <div class="telemetry-item">
              <span class="telemetry-label">⚡ Aktueller Verbrauch:</span>
              <strong>${metrics.totalWatts} Watt</strong>
            </div>
            <div class="telemetry-item">
              <span class="telemetry-label">📊 Prognose / Monat:</span>
              <strong>~${metrics.monthlyKwh} kWh</strong>
            </div>
          </div>

          <!-- Bundle Purchase Card -->
          <div class="planner-bundle-card">
            <div class="bundle-discount-badge">🎉 15% KOMPLETT-SET RABATT</div>
            <div class="bundle-prices-row">
              <span class="bundle-orig-price">${formatPrice(metrics.totalPrice)}</span>
              <span class="bundle-final-price">${formatPrice(metrics.discountedPrice)}</span>
            </div>
            <p class="bundle-savings">Du sparst ${formatPrice(metrics.totalPrice - metrics.discountedPrice)} beim Kauf des gesamten Raumpakets!</p>
            <button class="btn-primary bundle-buy-btn" id="buyCompleteBundleBtn">
              🛒 Komplettes ${room.title.split(' ')[0]} Paket kaufen
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Event Wiring
  document.getElementById('closePlannerBtn')?.addEventListener('click', closeSmartHomePlannerModal);

  // Room Switch
  modal.querySelectorAll('.planner-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      currentRoom = btn.getAttribute('data-room') as RoomPreset;
      activeAutomation = 'normal';
      playSound('click');
      renderPlannerUI(state);
    });
  });

  // Scenario Switch
  modal.querySelectorAll('.scenario-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const scenario = btn.getAttribute('data-scenario') as typeof activeAutomation;
      activeAutomation = scenario;
      playSound('quest');
      triggerHaptic('light');

      // Apply scenario logic to devices
      room.devices.forEach(dev => {
        if (scenario === 'movie') {
          if (dev.category === 'Entertainment') dev.status = 'on';
          else if (dev.category === 'Lighting') dev.status = 'dimmed';
          else if (dev.category === 'Climate') dev.status = 'on';
        } else if (scenario === 'goodnight') {
          if (dev.category === 'Lighting' || dev.category === 'Entertainment') dev.status = 'off';
          else if (dev.category === 'Security' || dev.category === 'Hub') dev.status = 'dimmed';
        } else if (scenario === 'eco') {
          if (dev.category === 'Lighting') dev.status = 'dimmed';
          else dev.status = 'off';
        } else {
          dev.status = 'on';
        }
      });

      showToast(`⚡ Szenario „${btn.textContent?.trim()}“ aktiviert!`, 'success');
      renderPlannerUI(state);
    });
  });

  // Toggle individual devices
  modal.querySelectorAll('.dev-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-toggle-id');
      const dev = room.devices.find(d => d.id === id);
      if (dev) {
        dev.status = dev.status === 'on' ? 'off' : dev.status === 'off' ? 'dimmed' : 'on';
        playSound('click');
        triggerHaptic('medium');
        renderPlannerUI(state);
      }
    });
  });

  // 1-Click Buy Whole Room Setup
  document.getElementById('buyCompleteBundleBtn')?.addEventListener('click', () => {
    // Add dummy bundle or products to cart
    room.devices.forEach(dev => {
      const prod = state.products.find(p => p.id === dev.productId) || state.products[0];
      const existing = state.cart.find(c => c.product.id === prod.id);
      if (existing) existing.qty += 1;
      else state.cart.push({ product: prod, qty: 1, addedAt: Date.now() });
    });

    emit('cart:changed');
    triggerHaptic('heavy');
    playSound('checkout');
    showToast(`🎉 Komplettes ${room.title} Paket (-15% Rabatt) zum Warenkorb hinzugefügt!`, 'success');
    closeSmartHomePlannerModal();
  });
}

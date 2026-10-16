// ============================================================
// Amazon 2.0 – Offline-First CRDT Sync Modal
// ============================================================
import {
  CRDTObservedRemoveSet,
  getNetworkMode,
  setNetworkMode,
  type NetworkMode,
} from '../utils/crdtSync';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';

let crdtModalEl: HTMLElement | null = null;
const clientASet = new CRDTObservedRemoveSet<string>();
const clientBSet = new CRDTObservedRemoveSet<string>();

// Seed initial items
clientASet.add('item-1', 'Sony WH-1000XM5 (Client A Offline)', 'client-a', Date.now() - 5000);
clientBSet.add('item-2', 'Apple AirPods Pro 2 (Client B Offline)', 'client-b', Date.now() - 3000);

function getModal(): HTMLElement {
  if (!crdtModalEl) {
    crdtModalEl = document.createElement('div');
    crdtModalEl.id = 'crdtSyncModal';
    crdtModalEl.className = 'modal-overlay';
    crdtModalEl.setAttribute('role', 'dialog');
    crdtModalEl.setAttribute('aria-modal', 'true');
    crdtModalEl.setAttribute('aria-label', 'CRDT Offline-Sync Hub');
    document.body.appendChild(crdtModalEl);
  }
  return crdtModalEl;
}

export function openCrdtSyncModal(): void {
  const modal = getModal();
  renderCrdtUI(modal);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeCrdtSyncModal(): void {
  if (crdtModalEl) {
    crdtModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderCrdtUI(modal: HTMLElement): void {
  const netMode = getNetworkMode();
  const aItems = clientASet.read();
  const bItems = clientBSet.read();

  modal.innerHTML = `
    <div class="modal-dialog crdt-dialog">
      <button class="modal-close" id="closeCrdtBtn" aria-label="Schließen">✕</button>

      <div class="crdt-header">
        <div class="crdt-badge">🔄 OFFLINE-FIRST CRDT SYNC ENGINE</div>
        <h2>Konfliktfreie Replikation & Offline-Shopping</h2>
        <p class="crdt-sub">Mathematisch garantierte Konsistenz (OR-Set) bei gleichzeitigen Warenkorb-Änderungen ohne Internet.</p>
      </div>

      <!-- Network Simulator Selector -->
      <div class="network-sim-bar">
        <span class="net-status-label">Simulierter Netzwerkstatus:</span>
        <div class="net-chips">
          <button class="net-chip ${netMode === 'online' ? 'active' : ''}" data-net="online">🟢 Online (100 MB/s)</button>
          <button class="net-chip ${netMode === 'offline' ? 'active' : ''}" data-net="offline">🔴 Offline (Flugmodus)</button>
          <button class="net-chip ${netMode === 'unstable' ? 'active' : ''}" data-net="unstable">🟡 Instabil (Edge)</button>
        </div>
      </div>

      <!-- Dual Client Replica Grid -->
      <div class="crdt-clients-grid">
        <!-- Client A -->
        <div class="client-replica-card">
          <div class="client-card-header">
            <h4>📱 Client A (Smartphone)</h4>
            <span class="client-tag">${aItems.length} Artikel</span>
          </div>
          <div class="client-items-list">
            ${aItems.length === 0 ? '<p class="empty-hint">Keine Artikel</p>' : ''}
            ${aItems.map(item => `
              <div class="crdt-item-pill">
                <span>🛒 ${item}</span>
              </div>
            `).join('')}
          </div>
          <button class="btn-add-client-item" id="addClientABtn">+ Artikel auf Client A hinzufügen</button>
        </div>

        <!-- Client B -->
        <div class="client-replica-card">
          <div class="client-card-header">
            <h4>💻 Client B (Laptop)</h4>
            <span class="client-tag">${bItems.length} Artikel</span>
          </div>
          <div class="client-items-list">
            ${bItems.length === 0 ? '<p class="empty-hint">Keine Artikel</p>' : ''}
            ${bItems.map(item => `
              <div class="crdt-item-pill">
                <span>🛒 ${item}</span>
              </div>
            `).join('')}
          </div>
          <button class="btn-add-client-item" id="addClientBBtn">+ Artikel auf Client B hinzufügen</button>
        </div>
      </div>

      <!-- Reconcile & Merge Action -->
      <div class="crdt-merge-box">
        <button class="btn-primary btn-crdt-merge" id="triggerCrdtMergeBtn">
          ⚡ 2-Way CRDT Sync & Mathematischer Merge
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeCrdtBtn')?.addEventListener('click', closeCrdtSyncModal);

  // Network selector
  modal.querySelectorAll('.net-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-net') as NetworkMode;
      setNetworkMode(mode);
      playSound('click');
      triggerHaptic('light');
      renderCrdtUI(modal);
    });
  });

  // Add Item to A
  document.getElementById('addClientABtn')?.addEventListener('click', () => {
    clientASet.add(`item-${Date.now()}`, `Produkt #${Math.floor(100 + Math.random() * 900)} (A)`, 'client-a');
    playSound('cart');
    triggerHaptic('light');
    renderCrdtUI(modal);
  });

  // Add Item to B
  document.getElementById('addClientBBtn')?.addEventListener('click', () => {
    clientBSet.add(`item-${Date.now()}`, `Produkt #${Math.floor(100 + Math.random() * 900)} (B)`, 'client-b');
    playSound('cart');
    triggerHaptic('light');
    renderCrdtUI(modal);
  });

  // Merge
  document.getElementById('triggerCrdtMergeBtn')?.addEventListener('click', () => {
    clientASet.merge(clientBSet);
    clientBSet.merge(clientASet);
    playSound('success');
    triggerHaptic('heavy');
    showToast('✓ CRDT 2-Way Sync abgeschlossen: 0 Konflikte, 100% konsistente Daten!', 'success');
    renderCrdtUI(modal);
  });
}

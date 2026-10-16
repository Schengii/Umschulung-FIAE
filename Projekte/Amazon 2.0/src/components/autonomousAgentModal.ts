// ============================================================
// Amazon 2.0 – Autonomous AI Shopping Agent Modal
// ============================================================
import type { AppState } from '../types';
import { formatPrice, formatDate } from '../utils/formatters';
import { getAgentTasks, createAgentTask, executeAgentSimulation, saveAgentTasks } from '../utils/autonomousAgent';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';

let agentModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!agentModalEl) {
    agentModalEl = document.createElement('div');
    agentModalEl.id = 'autonomousAgentModal';
    agentModalEl.className = 'modal-overlay';
    agentModalEl.setAttribute('role', 'dialog');
    agentModalEl.setAttribute('aria-modal', 'true');
    agentModalEl.setAttribute('aria-label', 'Autonomer KI-Einkaufs-Agent');
    document.body.appendChild(agentModalEl);
  }
  return agentModalEl;
}

export function openAutonomousAgentModal(state: AppState): void {
  const modal = getModal();
  renderAgentUI(modal, state);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeAutonomousAgentModal(): void {
  if (agentModalEl) {
    agentModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderAgentUI(modal: HTMLElement, state: AppState): void {
  const tasks = getAgentTasks();
  const totalBudget = tasks.reduce((sum, t) => sum + t.maxMonthlyBudget, 0);
  const totalSpent = tasks.reduce((sum, t) => sum + t.spentBudget, 0);

  modal.innerHTML = `
    <div class="modal-dialog agent-dialog">
      <button class="modal-close" id="closeAgentBtn" aria-label="Schließen">✕</button>

      <div class="agent-header">
        <div class="agent-badge">🤖 AUTONOMER KI-SHOPPING-AGENT</div>
        <h2>Autonomer Budget- & Kauf-Delegator</h2>
        <p class="agent-sub">Delegiere Kaufentscheidungen an deine KI: Sie überwacht Preise 24/7 und bestellt bei Deal-Treffern automatisch.</p>
      </div>

      <!-- Telemetry Card -->
      <div class="agent-telemetry-banner">
        <div class="telemetry-col">
          <span>Delegiertes Monatsbudget:</span>
          <strong>${formatPrice(totalBudget)}</strong>
        </div>
        <div class="telemetry-col">
          <span>Bisher autonom gekauft:</span>
          <strong style="color: #10b981;">${formatPrice(totalSpent)}</strong>
        </div>
        <div class="telemetry-col">
          <span>Aktive Agenten-Tasks:</span>
          <strong>${tasks.filter(t => t.status === 'active').length} aktiv</strong>
        </div>
      </div>

      <!-- Tasks List -->
      <div class="agent-tasks-section">
        <h3>Aktive Delegationen (${tasks.length})</h3>

        <div class="agent-tasks-container">
          ${tasks.map(t => `
            <div class="agent-task-card status-${t.status}">
              <div class="task-card-header">
                <div>
                  <h4>${t.productTitle}</h4>
                  <div class="task-meta-row">
                    <span>Zielpreis: <strong>${formatPrice(t.targetPrice)}</strong></span>
                    <span>Budget-Limit: <strong>${formatPrice(t.maxMonthlyBudget)}</strong></span>
                    <span>Gekauft: <strong>${t.boughtQuantity} / ${t.maxQuantity}</strong></span>
                  </div>
                </div>
                <span class="task-status-pill status-${t.status}">
                  ${t.status === 'active' ? '● Überwacht' : t.status === 'completed' ? '✓ Erledigt' : '⏸ Pausiert'}
                </span>
              </div>

              <!-- Task Logs -->
              <div class="task-mini-logs">
                ${t.logs.slice(0, 2).map(l => `
                  <div class="log-entry log-${l.type}">
                    <span class="log-time">${formatDate(l.timestamp)}:</span>
                    <span class="log-msg">${l.message}</span>
                  </div>
                `).join('')}
              </div>

              <div class="task-card-actions">
                ${t.status === 'active' ? `
                  <button class="btn-simulate-buy" data-sim-id="${t.id}">⚡ Preistreffer & Kauf testen</button>
                  <button class="btn-toggle-task" data-toggle-id="${t.id}">⏸ Pausieren</button>
                ` : t.status === 'paused' ? `
                  <button class="btn-toggle-task" data-toggle-id="${t.id}">▶ Fortsetzen</button>
                ` : ''}
                <button class="btn-delete-task" data-del-id="${t.id}">🗑️ Löschen</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Create New Delegation Form -->
      <div class="create-agent-box">
        <h4>+ Neue autonome Kauf-Regel anlegen</h4>
        <div class="create-agent-grid">
          <select id="agentProductSelect" class="form-select">
            ${state.products.map(p => `<option value="${p.id}">${p.title} (Aktuell: ${formatPrice(p.price)})</option>`).join('')}
          </select>
          <input type="number" id="agentTargetPriceInput" class="form-input" placeholder="Zielpreis in € (z. B. 240)" step="5" />
          <input type="number" id="agentBudgetInput" class="form-input" placeholder="Max. Monatsbudget €" step="10" />
          <button class="btn-primary" id="saveNewAgentTaskBtn">🤖 Agent delegieren</button>
        </div>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeAgentBtn')?.addEventListener('click', closeAutonomousAgentModal);

  // Simulate buy
  modal.querySelectorAll('.btn-simulate-buy').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-sim-id');
      if (id) {
        executeAgentSimulation(state, id);
        triggerHaptic('heavy');
        renderAgentUI(modal, state);
      }
    });
  });

  // Toggle pause/resume
  modal.querySelectorAll('.btn-toggle-task').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-toggle-id');
      const target = tasks.find(t => t.id === id);
      if (target) {
        target.status = target.status === 'active' ? 'paused' : 'active';
        saveAgentTasks(tasks);
        playSound('click');
        triggerHaptic('light');
        renderAgentUI(modal, state);
      }
    });
  });

  // Delete
  modal.querySelectorAll('.btn-delete-task').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-del-id');
      const updated = tasks.filter(t => t.id !== id);
      saveAgentTasks(updated);
      playSound('alert');
      triggerHaptic('light');
      showToast('Agenten-Aufgabe wurde gelöscht.', 'info');
      renderAgentUI(modal, state);
    });
  });

  // Create new task
  document.getElementById('saveNewAgentTaskBtn')?.addEventListener('click', () => {
    const prodId = (document.getElementById('agentProductSelect') as HTMLSelectElement)?.value;
    const price = parseFloat((document.getElementById('agentTargetPriceInput') as HTMLInputElement)?.value);
    const budget = parseFloat((document.getElementById('agentBudgetInput') as HTMLInputElement)?.value) || (price * 1.2);

    const product = state.products.find(p => p.id === prodId) || state.products[0];

    if (!price || isNaN(price) || price <= 0) {
      showToast('Bitte gib einen gültigen Zielpreis an.', 'error');
      return;
    }

    createAgentTask(product, price, budget, 1);
    playSound('success');
    triggerHaptic('medium');
    showToast(`🤖 Neuer Agent für „${product.title}“ bei <= ${price.toFixed(2)}€ aktiv!`, 'success');
    renderAgentUI(modal, state);
  });
}

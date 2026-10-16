// ============================================================
// Amazon 2.0 – Zero-Knowledge Proof (zk-SNARKs) Modal
// ============================================================
import { getZKProofs, generateZKProof, type ZKCircuitType } from '../utils/zkProofAuth';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';
import { formatDate } from '../utils/formatters';

let zkModalEl: HTMLElement | null = null;
let isProving = false;

function getModal(): HTMLElement {
  if (!zkModalEl) {
    zkModalEl = document.createElement('div');
    zkModalEl.id = 'zkProofModal';
    zkModalEl.className = 'modal-overlay';
    zkModalEl.setAttribute('role', 'dialog');
    zkModalEl.setAttribute('aria-modal', 'true');
    zkModalEl.setAttribute('aria-label', 'Zero-Knowledge Proofs Hub');
    document.body.appendChild(zkModalEl);
  }
  return zkModalEl;
}

export function openZKProofModal(): void {
  const modal = getModal();
  renderZKUI(modal);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeZKProofModal(): void {
  if (zkModalEl) {
    zkModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderZKUI(modal: HTMLElement): void {
  const proofs = getZKProofs();

  modal.innerHTML = `
    <div class="modal-dialog zk-dialog">
      <button class="modal-close" id="closeZKBtn" aria-label="Schließen">✕</button>

      <div class="zk-header">
        <div class="zk-badge">🪙 ZERO-KNOWLEDGE CRYPTOGRAPHY (zk-SNARKs)</div>
        <h2>Privatsphäre-Beweise ohne Datenübertragung</h2>
        <p class="zk-sub">Beweise Alter (18+), Bonität und Wohnsitz mathematisch exakt, ohne Geburtsdaten, Kontostände oder Adressen an Amazon 2.0 zu senden.</p>
      </div>

      <!-- ZK Proofs List -->
      <div class="zk-proofs-section">
        <h3>Verifizierte ZK-Proofs (${proofs.length})</h3>
        <div class="zk-proofs-list">
          ${proofs.map(p => `
            <div class="zk-proof-card">
              <div class="zk-card-top">
                <strong>${p.circuitTitle}</strong>
                <span class="zk-status-pill">✓ Mathematisch verifiziert</span>
              </div>
              <p class="zk-statement">${p.statementProven}</p>
              <div class="zk-proof-meta">
                <span>Proof Hash: <code>${p.proofHashHex}</code></span>
                <span>Verifier: <code>${p.verifierContract}</code></span>
                <span>Erstellt: ${formatDate(p.timestamp)}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Generate New Proof Action Buttons -->
      <div class="zk-generate-box">
        <h4>Neuen kryptografischen Zero-Knowledge Proof berechnen:</h4>
        <div class="zk-circuits-grid">
          <button class="btn-zk-circuit" data-circuit="age-18-plus">
            🔞 zk-Age Proof (18+ FSK Beweis)
          </button>
          <button class="btn-zk-circuit" data-circuit="credit-score-700">
            💳 zk-Bonitätsnachweis (Score >= 720)
          </button>
          <button class="btn-zk-circuit" data-circuit="eu-residency">
            🇪🇺 zk-EU Wohnsitznachweis
          </button>
        </div>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeZKBtn')?.addEventListener('click', closeZKProofModal);

  modal.querySelectorAll('.btn-zk-circuit').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      if (isProving) return;
      isProving = true;

      const circuit = (e.currentTarget as HTMLElement).getAttribute('data-circuit') as ZKCircuitType;
      playSound('quest');
      triggerHaptic('medium');

      const proof = await generateZKProof(circuit);
      isProving = false;

      playSound('success');
      triggerHaptic('heavy');
      showToast(`🪙 ${proof.circuitTitle} erfolgreich berechnet & verifiziert!`, 'success');
      renderZKUI(modal);
    });
  });
}

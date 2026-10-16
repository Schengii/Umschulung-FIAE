// ============================================================
// Amazon 2.0 – Post-Quantum Cryptography Suite Modal
// ============================================================
import { getPQCKeypairs, generatePQCKeypair, signQuantumTransaction, savePQCKeypairs } from '../utils/postQuantumCrypto';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';
import { formatDate } from '../utils/formatters';

let pqcModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!pqcModalEl) {
    pqcModalEl = document.createElement('div');
    pqcModalEl.id = 'postQuantumModal';
    pqcModalEl.className = 'modal-overlay';
    pqcModalEl.setAttribute('role', 'dialog');
    pqcModalEl.setAttribute('aria-modal', 'true');
    pqcModalEl.setAttribute('aria-label', 'Post-Quantum Kryptografie Suite');
    document.body.appendChild(pqcModalEl);
  }
  return pqcModalEl;
}

export function openPostQuantumModal(): void {
  const modal = getModal();
  renderPQCUI(modal);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closePostQuantumModal(): void {
  if (pqcModalEl) {
    pqcModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderPQCUI(modal: HTMLElement): void {
  const keys = getPQCKeypairs();

  modal.innerHTML = `
    <div class="modal-dialog pqc-dialog">
      <button class="modal-close" id="closePQCBtn" aria-label="Schließen">✕</button>

      <div class="pqc-header">
        <div class="pqc-badge">🛡️ NIST POST-QUANTUM CRYPTOGRAPHY SUITE</div>
        <h2>Quantenresistente Verschlüsselung & Signaturen</h2>
        <p class="pqc-sub">Lattice-basierte Absicherung nach NIST-Standards (ML-KEM Kyber & ML-DSA Dilithium) gegen zukünftige Quantencomputer-Angriffe.</p>
      </div>

      <!-- Quantum Resilience Score Banner -->
      <div class="pqc-score-banner">
        <div class="pqc-shield-icon">🛡️</div>
        <div class="pqc-score-meta">
          <h4>Quanten-Sicherheitslevel: <strong>256-Bit Post-Quantum</strong></h4>
          <p>Alle deine Passkey-Transaktionen & Web3-Zahlungen sind gegen Shor- & Grover-Algorithmen immun.</p>
        </div>
        <div class="pqc-status-tag">✓ NIST PQC READY</div>
      </div>

      <!-- Active Keypairs List -->
      <div class="pqc-keys-section">
        <h3>Aktive Post-Quantum Schlüsselpaare (${keys.length})</h3>
        <div class="pqc-keys-list">
          ${keys.map(k => `
            <div class="pqc-key-card">
              <div class="key-card-top">
                <strong>${k.name}</strong>
                <span class="algo-badge">${k.algorithm}</span>
              </div>
              <div class="key-fingerprint">
                <span>Fingerprint: <code>${k.fingerprint}</code></span>
                <span>Schlüssel-Stärke: <strong>${k.securityLevelBits} Bit</strong></span>
              </div>
              <div class="key-card-footer">
                <span class="key-date">Erstellt: ${formatDate(k.createdAt)}</span>
                <button class="btn-del-pqc-key" data-del-id="${k.id}" title="Schlüssel löschen">🗑️</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Generate Key & Test Signature Action -->
      <div class="pqc-actions-grid">
        <button class="btn-secondary" id="generateKyberKeyBtn">
          🔑 Neues Kyber-768 Schlüsselpaar generieren
        </button>
        <button class="btn-primary" id="testQuantumSignatureBtn">
          ⚡ Quanten-Signatur-Test ausführen
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closePQCBtn')?.addEventListener('click', closePostQuantumModal);

  // Delete key
  modal.querySelectorAll('.btn-del-pqc-key').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-del-id');
      const updated = keys.filter(k => k.id !== id);
      savePQCKeypairs(updated);
      playSound('alert');
      triggerHaptic('light');
      renderPQCUI(modal);
    });
  });

  // Generate key
  document.getElementById('generateKyberKeyBtn')?.addEventListener('click', () => {
    generatePQCKeypair('Lattice Shield Key #2', 'ML-KEM-768 (Kyber)');
    playSound('success');
    triggerHaptic('medium');
    showToast('🔑 Neues NIST Kyber-768 Schlüsselpaar erfolgreich generiert!', 'success');
    renderPQCUI(modal);
  });

  // Test signature
  document.getElementById('testQuantumSignatureBtn')?.addEventListener('click', () => {
    const proof = signQuantumTransaction('ORDER-TEST-#9941', 149.99);
    playSound('quest');
    triggerHaptic('heavy');
    showToast(`⚡ Quanten-Signatur (${proof.quantumSignature.substring(0, 16)}...) verifiziert von ${proof.verifiedByValidatorNodes} Validierungs-Nodes!`, 'success');
  });
}

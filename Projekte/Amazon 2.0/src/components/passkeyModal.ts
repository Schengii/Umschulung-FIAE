// ============================================================
// Amazon 2.0 – Biometric Passkey / WebAuthn Management Modal
// ============================================================
import { getSavedPasskeys, registerNewPasskey, verifyPasskeyBiometric, savePasskeys } from '../utils/passkeyAuth';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';
import { formatDate } from '../utils/formatters';

let passkeyModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!passkeyModalEl) {
    passkeyModalEl = document.createElement('div');
    passkeyModalEl.id = 'passkeyModal';
    passkeyModalEl.className = 'modal-overlay';
    passkeyModalEl.setAttribute('role', 'dialog');
    passkeyModalEl.setAttribute('aria-modal', 'true');
    passkeyModalEl.setAttribute('aria-label', 'Passkey & Biometrie Manager');
    document.body.appendChild(passkeyModalEl);
  }
  return passkeyModalEl;
}

export function openPasskeyModal(): void {
  const modal = getModal();
  renderPasskeyUI(modal);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closePasskeyModal(): void {
  if (passkeyModalEl) {
    passkeyModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderPasskeyUI(modal: HTMLElement): void {
  const keys = getSavedPasskeys();

  modal.innerHTML = `
    <div class="modal-dialog passkey-dialog">
      <button class="modal-close" id="closePasskeyBtn" aria-label="Schließen">✕</button>

      <div class="passkey-header">
        <div class="passkey-badge">🔐 FIDO2 / WEBAUTHN BIOMETRIE</div>
        <h2>Passkey & One-Touch Fast-Checkout</h2>
        <p class="passkey-sub">Melde dich passwortlos an und bezahle Einkäufe in Sekunden mit Touch ID, Face ID oder Windows Hello.</p>
      </div>

      <!-- Fingerprint Visual Scanner Widget -->
      <div class="biometric-scanner-card" id="biometricTestArea">
        <div class="fingerprint-scan-circle">
          <svg class="fingerprint-icon" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 2a10 10 0 0 0-10 10c0 3.1 1.4 5.9 3.6 7.8M12 2a10 10 0 0 1 10 10c0 3.1-1.4 5.9-3.6 7.8M12 6a6 6 0 0 0-6 6c0 1.8.8 3.5 2.1 4.7M12 6a6 6 0 0 1 6 6c0 1.8-.8 3.5-2.1 4.7M12 10a2 2 0 0 0-2 2c0 .6.3 1.2.7 1.6M12 10a2 2 0 0 1 2 2c0 .6-.3 1.2-.7 1.6"/>
          </svg>
          <div class="fingerprint-laser-line"></div>
        </div>
        <div class="scanner-text-info">
          <h4>Biometrischen Schlüssel testen</h4>
          <p>Klicke hier, um den Fingerabdruck-Sensor zu simulieren</p>
        </div>
      </div>

      <!-- Saved Passkeys List -->
      <div class="passkey-list-section">
        <h3>Gespeicherte Passkeys (${keys.length})</h3>
        
        <div class="passkey-items-container">
          ${keys.map(k => `
            <div class="passkey-item-row">
              <div class="passkey-item-icon">
                ${k.deviceType === 'apple' ? '🍎' : k.deviceType === 'windows' ? '🪟' : '📱'}
              </div>
              <div class="passkey-item-meta">
                <strong>${k.name}</strong>
                <span class="passkey-tech-tag">ID: ${k.publicKeySnippet} • Erstellt: ${formatDate(k.createdAt)}</span>
              </div>
              <button class="btn-delete-passkey" data-del-id="${k.id}" title="Passkey entfernen">🗑️</button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Add New Passkey Form -->
      <div class="add-passkey-box">
        <input type="text" id="newPasskeyNameInput" class="form-input" placeholder="Gerätename (z. B. MacBook Pro Touch ID)" />
        <button class="btn-primary" id="registerPasskeyBtn">
          + Neuen Passkey registrieren
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closePasskeyBtn')?.addEventListener('click', closePasskeyModal);

  // Test Biometric Authentication
  document.getElementById('biometricTestArea')?.addEventListener('click', async () => {
    const card = document.getElementById('biometricTestArea');
    card?.classList.add('scanning');
    playSound('click');
    triggerHaptic('light');

    const result = await verifyPasskeyBiometric();
    card?.classList.remove('scanning');
    card?.classList.add('success');
    playSound('success');
    triggerHaptic('medium');
    showToast(`✅ Biometrie erfolgreich bestätigt mit „${result.passkeyName}“!`, 'success');

    setTimeout(() => {
      card?.classList.remove('success');
    }, 2000);
  });

  // Delete Passkey
  modal.querySelectorAll('.btn-delete-passkey').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-del-id');
      const updated = keys.filter(k => k.id !== id);
      savePasskeys(updated);
      playSound('alert');
      triggerHaptic('light');
      showToast('Passkey wurde entfernt.', 'info');
      renderPasskeyUI(modal);
    });
  });

  // Register New Passkey
  document.getElementById('registerPasskeyBtn')?.addEventListener('click', async () => {
    const input = document.getElementById('newPasskeyNameInput') as HTMLInputElement;
    const name = input?.value.trim();
    playSound('click');
    triggerHaptic('light');

    const newKey = await registerNewPasskey(name);
    playSound('success');
    triggerHaptic('medium');
    showToast(`🎉 Neuer Passkey „${newKey.name}“ erfolgreich registriert!`, 'success');
    renderPasskeyUI(modal);
  });
}

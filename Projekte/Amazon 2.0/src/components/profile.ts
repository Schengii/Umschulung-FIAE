// ============================================================
// Amazon 2.0 – User Profile Modal Component
// ============================================================
import type { AppState, UserProfile, ShippingAddress } from '../types';
import { formatDate, sanitizeHtml } from '../utils/formatters';
import { writeStorage, KEYS } from '../utils/persist';
import { showToast } from './toast';

type RefreshCallback = () => void;

let profileModal: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!profileModal) {
    profileModal = document.createElement('div');
    profileModal.id = 'profileModal';
    profileModal.className = 'modal-overlay';
    profileModal.setAttribute('role', 'dialog');
    profileModal.setAttribute('aria-modal', 'true');
    profileModal.setAttribute('aria-label', 'Mein Profil');
    document.body.appendChild(profileModal);
    profileModal.addEventListener('click', e => {
      if (e.target === profileModal) closeProfileModal();
    });
  }
  return profileModal;
}

export function getStoredProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(KEYS.profile);
    if (raw) return JSON.parse(raw) as UserProfile;
  } catch { /* ignore */ }
  return {
    name: 'Max Mustermann',
    email: 'max.mustermann@example.de',
    isPrime: false,
    memberSince: '2024-01-15',
    addresses: [{
      name: 'Max Mustermann',
      street: 'Musterstraße 1',
      city: 'Berlin',
      zip: '10115',
      country: 'Deutschland',
    }],
    defaultAddressIdx: 0,
    paymentMethods: ['Kreditkarte (****4242)', 'PayPal'],
  };
}

export function openProfileModal(state: AppState, onRefresh: RefreshCallback): void {
  const modal = getModal();
  const profile = state.userProfile;
  let activeTab = 'info';

  function renderModal() {
    modal.innerHTML = `
      <div class="modal-dialog profile-dialog">
        <button class="modal-close" id="profileClose" aria-label="Schließen">✕</button>
        <div class="profile-header">
          <div class="profile-avatar-lg">${profile.name.charAt(0).toUpperCase()}</div>
          <div>
            <h2 class="profile-name">${profile.name}</h2>
            <p class="profile-email">${profile.email}</p>
            <p class="profile-member-since">Mitglied seit ${formatDate(new Date(profile.memberSince))}</p>
            ${profile.isPrime
              ? '<span class="prime-badge-lg">⭐ Prime Mitglied</span>'
              : '<button class="btn-prime-join" id="joinPrimeBtn">⭐ Prime beitreten</button>'
            }
          </div>
        </div>

        <div class="tab-nav">
          <button class="tab-btn ${activeTab === 'info' ? 'active' : ''}" data-tab="info">Profil bearbeiten</button>
          <button class="tab-btn ${activeTab === 'addresses' ? 'active' : ''}" data-tab="addresses">Adressen</button>
          <button class="tab-btn ${activeTab === 'payment' ? 'active' : ''}" data-tab="payment">Zahlung</button>
          <button class="tab-btn ${activeTab === 'settings' ? 'active' : ''}" data-tab="settings">Einstellungen</button>
        </div>

        <!-- Info Tab -->
        <div class="tab-pane ${activeTab === 'info' ? 'active' : ''}" id="tab-info">
          <form id="profileForm" class="profile-form" novalidate>
            <div class="form-row">
              <div class="form-group">
                <label for="profileName">Name *</label>
                <input type="text" id="profileName" class="form-input" value="${profile.name}" required />
              </div>
              <div class="form-group">
                <label for="profileEmail">E-Mail *</label>
                <input type="email" id="profileEmail" class="form-input" value="${profile.email}" required />
              </div>
            </div>
            <button type="submit" class="btn-primary" id="saveProfileBtn">Profil speichern</button>
          </form>
        </div>

        <!-- Addresses Tab -->
        <div class="tab-pane ${activeTab === 'addresses' ? 'active' : ''}" id="tab-addresses">
          <div class="addresses-list">
            ${profile.addresses.map((addr, idx) => `
              <div class="address-card ${idx === profile.defaultAddressIdx ? 'default-address' : ''}">
                ${idx === profile.defaultAddressIdx ? '<span class="default-badge">Standard</span>' : ''}
                <p><strong>${addr.name}</strong></p>
                <p>${addr.street}</p>
                <p>${addr.zip} ${addr.city}</p>
                <p>${addr.country}</p>
                <div class="address-actions">
                  ${idx !== profile.defaultAddressIdx ? `
                    <button class="btn-secondary-sm set-default-btn" data-addr-idx="${idx}">Als Standard</button>
                  ` : ''}
                  ${profile.addresses.length > 1 ? `
                    <button class="btn-ghost-sm remove-addr-btn" data-addr-idx="${idx}">Entfernen</button>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
          <button class="btn-secondary add-address-btn" id="addAddressBtn">+ Neue Adresse</button>
          <form id="addAddressForm" class="add-address-form hidden">
            <div class="form-row">
              <div class="form-group">
                <label for="addrName">Name *</label>
                <input type="text" id="addrName" class="form-input" placeholder="Vollständiger Name" />
              </div>
              <div class="form-group">
                <label for="addrStreet">Straße *</label>
                <input type="text" id="addrStreet" class="form-input" placeholder="Straße und Hausnummer" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="addrZip">PLZ *</label>
                <input type="text" id="addrZip" class="form-input" placeholder="12345" />
              </div>
              <div class="form-group">
                <label for="addrCity">Stadt *</label>
                <input type="text" id="addrCity" class="form-input" placeholder="Berlin" />
              </div>
            </div>
            <div class="form-group">
              <label for="addrCountry">Land</label>
              <select id="addrCountry" class="filter-select">
                <option value="Deutschland">Deutschland</option>
                <option value="Österreich">Österreich</option>
                <option value="Schweiz">Schweiz</option>
              </select>
            </div>
            <button type="button" class="btn-primary" id="saveAddrBtn">Adresse speichern</button>
          </form>
        </div>

        <!-- Payment Tab -->
        <div class="tab-pane ${activeTab === 'payment' ? 'active' : ''}" id="tab-payment">
          <div class="payment-list">
            ${profile.paymentMethods.map((pm, idx) => `
              <div class="payment-method-card">
                <span class="payment-icon">💳</span>
                <span>${pm}</span>
                ${profile.paymentMethods.length > 1 ? `
                  <button class="btn-ghost-sm remove-payment-btn" data-pm-idx="${idx}">Entfernen</button>
                ` : ''}
              </div>
            `).join('')}
          </div>
          <button class="btn-secondary" id="addPaymentBtn">+ Zahlungsmethode hinzufügen</button>
        </div>

        <!-- Settings Tab -->
        <div class="tab-pane ${activeTab === 'settings' ? 'active' : ''}" id="tab-settings">
          <div class="settings-section">
            <h4>Design</h4>
            <label class="toggle-label">
              <span>Dark Mode</span>
              <div class="toggle-switch ${state.theme === 'dark' ? 'active' : ''}" id="themeToggle" role="switch" aria-checked="${state.theme === 'dark'}">
                <div class="toggle-thumb"></div>
              </div>
            </label>
          </div>
          <div class="settings-section">
            <h4>Konto</h4>
            <button class="btn-danger" id="clearDataBtn">Alle Daten löschen</button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Close
    document.getElementById('profileClose')?.addEventListener('click', closeProfileModal);

    // Tabs
    modal.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.getAttribute('data-tab')!;
        renderModal();
      });
    });

    // Profile form
    document.getElementById('profileForm')?.addEventListener('submit', e => {
      e.preventDefault();
      const name = sanitizeHtml((document.getElementById('profileName') as HTMLInputElement).value.trim());
      const email = sanitizeHtml((document.getElementById('profileEmail') as HTMLInputElement).value.trim());
      if (name && email) {
        profile.name = name;
        profile.email = email;
        writeStorage(KEYS.profile, profile);
        onRefresh();
        showToast('Profil gespeichert!', 'success');
        renderModal();
      }
    });

    // Join Prime
    document.getElementById('joinPrimeBtn')?.addEventListener('click', () => {
      profile.isPrime = true;
      profile.primeExpiry = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
      writeStorage(KEYS.profile, profile);
      onRefresh();
      showToast('🎉 Willkommen bei Prime!', 'success');
      renderModal();
    });

    // Addresses
    document.getElementById('addAddressBtn')?.addEventListener('click', () => {
      document.getElementById('addAddressForm')?.classList.toggle('hidden');
    });

    document.getElementById('saveAddrBtn')?.addEventListener('click', () => {
      const name = (document.getElementById('addrName') as HTMLInputElement).value.trim();
      const street = (document.getElementById('addrStreet') as HTMLInputElement).value.trim();
      const zip = (document.getElementById('addrZip') as HTMLInputElement).value.trim();
      const city = (document.getElementById('addrCity') as HTMLInputElement).value.trim();
      const country = (document.getElementById('addrCountry') as HTMLSelectElement).value;

      if (name && street && zip && city) {
        const newAddr: ShippingAddress = { name, street, city, zip, country };
        profile.addresses.push(newAddr);
        writeStorage(KEYS.profile, profile);
        showToast('Adresse hinzugefügt!', 'success');
        activeTab = 'addresses';
        renderModal();
      }
    });

    modal.querySelectorAll('.set-default-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        profile.defaultAddressIdx = Number(btn.getAttribute('data-addr-idx'));
        writeStorage(KEYS.profile, profile);
        renderModal();
      });
    });

    modal.querySelectorAll('.remove-addr-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-addr-idx'));
        profile.addresses.splice(idx, 1);
        if (profile.defaultAddressIdx >= profile.addresses.length) {
          profile.defaultAddressIdx = 0;
        }
        writeStorage(KEYS.profile, profile);
        renderModal();
      });
    });

    modal.querySelectorAll('.remove-payment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-pm-idx'));
        profile.paymentMethods.splice(idx, 1);
        writeStorage(KEYS.profile, profile);
        renderModal();
      });
    });

    // Theme toggle
    document.getElementById('themeToggle')?.addEventListener('click', () => {
      import('../store').then(({ state: appState, emit }) => {
        appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', appState.theme);
        writeStorage(KEYS.theme, appState.theme);
        emit('theme:changed');
        renderModal();
      });
    });

    // Clear data
    document.getElementById('clearDataBtn')?.addEventListener('click', () => {
      if (confirm('Alle gespeicherten Daten wirklich löschen?')) {
        import('../utils/persist').then(({ clearAllStorage }) => {
          clearAllStorage();
          showToast('Alle Daten gelöscht. Seite wird neu geladen…', 'info');
          setTimeout(() => location.reload(), 1500);
        });
      }
    });

    // Escape
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { closeProfileModal(); document.removeEventListener('keydown', onKeydown); }
    };
    document.addEventListener('keydown', onKeydown);
  }

  renderModal();
}

function closeProfileModal(): void {
  profileModal?.classList.remove('open');
  document.body.style.overflow = '';
}

// js/settings.js

const SETTINGS_DOM = {
  authEmail: document.getElementById('auth-email'),
  authPassword: document.getElementById('auth-password'),
  btnLogin: document.getElementById('btn-login'),
  btnLogout: document.getElementById('btn-logout'),
  authStatusContainer: document.getElementById('auth-status-container'),
  authLoggedInContainer: document.getElementById('auth-logged-in-container'),
  authUserEmail: document.getElementById('auth-user-email'),
  arbzgToggle: document.getElementById('setting-arbzg-toggle'),
  themeToggle: document.getElementById('setting-theme-toggle')
};

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initSettingsUI();
    setupSettingsEvents();
  }, 100);
});

function initSettingsUI() {
  // Init ArbZG Toggle
  if (window.settings && SETTINGS_DOM.arbzgToggle) {
    SETTINGS_DOM.arbzgToggle.checked = window.settings.arbzgBreaksEnabled !== false;
  }

  // Init Theme Toggle
  if (window.settings && SETTINGS_DOM.themeToggle) {
    const isLightMode = window.settings.theme === 'light';
    SETTINGS_DOM.themeToggle.checked = isLightMode;
    if (isLightMode) {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }

  // Init Auth Status
  if (window.firebaseMock && window.firebaseMock.auth) {
    window.firebaseMock.auth.onAuthStateChanged((user) => {
      if (user) {
        SETTINGS_DOM.authStatusContainer.classList.add('hidden');
        SETTINGS_DOM.authLoggedInContainer.classList.remove('hidden');
        SETTINGS_DOM.authUserEmail.textContent = user.email;
        // Trigger initial load and sync
        if (window.storageService && window.storageService.loadFromCloud) {
          window.storageService.loadFromCloud();
        }
      } else {
        SETTINGS_DOM.authStatusContainer.classList.remove('hidden');
        SETTINGS_DOM.authLoggedInContainer.classList.add('hidden');
        SETTINGS_DOM.authUserEmail.textContent = '';
      }
    });
  }
}

function setupSettingsEvents() {
  if (!SETTINGS_DOM.btnLogin) return;

  // Login
  SETTINGS_DOM.btnLogin.addEventListener('click', async () => {
    const email = SETTINGS_DOM.authEmail.value.trim();
    const password = SETTINGS_DOM.authPassword.value;
    if (!email || !password) {
      alert("Bitte gib E-Mail und Passwort ein.");
      return;
    }
    try {
      await window.firebaseMock.auth.signInWithEmailAndPassword(email, password);
      SETTINGS_DOM.authEmail.value = '';
      SETTINGS_DOM.authPassword.value = '';
    } catch (e) {
      alert("Fehler beim Anmelden: " + e.message);
    }
  });

  // Logout
  SETTINGS_DOM.btnLogout.addEventListener('click', async () => {
    try {
      await window.firebaseMock.auth.signOut();
    } catch (e) {
      console.error(e);
    }
  });

  // ArbZG Toggle
  SETTINGS_DOM.arbzgToggle.addEventListener('change', (e) => {
    if (window.settings && window.storageService) {
      window.settings.arbzgBreaksEnabled = e.target.checked;
      window.storageService.saveSettings(window.settings);
    }
  });

  // Theme Toggle
  SETTINGS_DOM.themeToggle.addEventListener('change', (e) => {
    const isLight = e.target.checked;
    if (isLight) {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    
    if (window.settings && window.storageService) {
      window.settings.theme = isLight ? 'light' : 'dark';
      window.storageService.saveSettings(window.settings);
    }
  });
}

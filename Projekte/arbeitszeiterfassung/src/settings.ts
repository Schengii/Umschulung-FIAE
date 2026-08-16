import { storageService } from "./storage";

export function initSettingsUI(): void {
  const arbzgToggle = document.getElementById("setting-arbzg-toggle") as HTMLInputElement | null;
  const themeToggle = document.getElementById("setting-theme-toggle") as HTMLInputElement | null;
  const authStatusContainer = document.getElementById("auth-status-container");
  const authLoggedInContainer = document.getElementById("auth-logged-in-container");
  const authUserEmail = document.getElementById("auth-user-email");
  const btnLogin = document.getElementById("btn-login");
  const btnLogout = document.getElementById("btn-logout");
  const authEmail = document.getElementById("auth-email") as HTMLInputElement | null;
  const authPassword = document.getElementById("auth-password") as HTMLInputElement | null;

  const currentSettings = storageService.getSettings();

  if (arbzgToggle) {
    arbzgToggle.checked = currentSettings.arbzgBreaksEnabled !== false;
    arbzgToggle.addEventListener("change", () => {
      const updated = storageService.getSettings();
      updated.arbzgBreaksEnabled = arbzgToggle.checked;
      storageService.saveSettings(updated);
    });
  }

  if (themeToggle) {
    const isLightMode = currentSettings.theme === "light";
    themeToggle.checked = isLightMode;
    if (isLightMode) {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }

    themeToggle.addEventListener("change", () => {
      const updated = storageService.getSettings();
      const isLight = themeToggle.checked;
      updated.theme = isLight ? "light" : "dark";
      if (isLight) {
        document.documentElement.setAttribute("data-theme", "light");
      } else {
        document.documentElement.removeAttribute("data-theme");
      }
      storageService.saveSettings(updated);
    });
  }

  const win = window as any;
  if (win.firebaseMock && win.firebaseMock.auth) {
    win.firebaseMock.auth.onAuthStateChanged((user: any) => {
      if (user) {
        if (authStatusContainer) authStatusContainer.classList.add("hidden");
        if (authLoggedInContainer) authLoggedInContainer.classList.remove("hidden");
        if (authUserEmail) authUserEmail.textContent = user.email;
        storageService.loadFromCloud();
      } else {
        if (authStatusContainer) authStatusContainer.classList.remove("hidden");
        if (authLoggedInContainer) authLoggedInContainer.classList.add("hidden");
        if (authUserEmail) authUserEmail.textContent = "";
      }
    });
  }

  if (btnLogin) {
    btnLogin.addEventListener("click", async () => {
      if (!authEmail || !authPassword) return;
      const email = authEmail.value.trim();
      const password = authPassword.value;
      if (!email || !password) {
        alert("Bitte gib E-Mail und Passwort ein.");
        return;
      }
      try {
        await win.firebaseMock.auth.signInWithEmailAndPassword(email, password);
        authEmail.value = "";
        authPassword.value = "";
      } catch (e: any) {
        alert("Fehler beim Anmelden: " + e.message);
      }
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener("click", async () => {
      try {
        await win.firebaseMock.auth.signOut();
      } catch (e) {
        console.error(e);
      }
    });
  }
}

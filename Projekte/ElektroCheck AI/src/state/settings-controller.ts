import type { ReactiveController, ReactiveControllerHost } from "lit";

export interface InspectorProfile {
  name: string;
  company: string;
  id: string;
}

export interface SettingsUpdate {
  apiKey?: string;
  perplexityApiKey?: string;
  backendUrl?: string;
  inspectorName?: string;
  inspectorCompany?: string;
  inspectorId?: string;
}

const KEY = {
  theme: "electrocheck_theme",
  geminiApiKey: "electrocheck_gemini_api_key",
  perplexityApiKey: "electrocheck_perplexity_api_key",
  backendUrl: "electrocheck_backend_url",
  accessible: "electrocheck_accessible_mode",
  gdpr: "electrocheck_gdpr_accepted",
  inspectorName: "electrocheck_inspector_name",
  inspectorCompany: "electrocheck_inspector_company",
  inspectorId: "electrocheck_inspector_id",
} as const;

type Host = ReactiveControllerHost & HTMLElement;

/**
 * Persistente Einstellungen (localStorage), Darstellungsmodi und Prüferprofil.
 * Setzt die Theme-/Barrierefreiheits-Attribute auf Host und Dokument.
 */
export class SettingsController implements ReactiveController {
  apiKey = "";
  perplexityApiKey = "";
  backendUrl = "";
  accessibleMode = false;
  hasAcceptedGdpr = false;
  isDarkMode = false;
  isGloveMode = false;
  isHighContrast = false;
  inspector: InspectorProfile = { name: "", company: "", id: "" };

  constructor(private readonly host: Host) {
    host.addController(this);
  }

  hostConnected(): void {
    // Laden erfolgt explizit über load() (nach dem ersten Rendern)
  }

  load(): void {
    try {
      const savedTheme = localStorage.getItem(KEY.theme);
      const theme = savedTheme ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      this.isDarkMode = theme === "dark";
      this.applyTheme();

      this.apiKey = localStorage.getItem(KEY.geminiApiKey) || "";
      this.perplexityApiKey = localStorage.getItem(KEY.perplexityApiKey) || "";
      this.backendUrl = localStorage.getItem(KEY.backendUrl) || "";

      if (localStorage.getItem(KEY.accessible) === "true") {
        this.applyAccessibleMode(true);
      }

      this.hasAcceptedGdpr = localStorage.getItem(KEY.gdpr) === "true";
      this.inspector = {
        name: localStorage.getItem(KEY.inspectorName) || "",
        company: localStorage.getItem(KEY.inspectorCompany) || "",
        id: localStorage.getItem(KEY.inspectorId) || "",
      };
    } catch (e) {
      console.warn("Einstellungen konnten nicht aus LocalStorage geladen werden:", e);
    }
    this.host.requestUpdate();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem(KEY.theme, this.isDarkMode ? "dark" : "light");
    this.applyTheme();
    this.host.requestUpdate();
  }

  toggleGloveMode(): void {
    this.isGloveMode = !this.isGloveMode;
    document.documentElement.setAttribute("glove-mode", this.isGloveMode ? "true" : "false");
    this.host.requestUpdate();
  }

  toggleHighContrast(): void {
    this.isHighContrast = !this.isHighContrast;
    document.documentElement.setAttribute("high-contrast", this.isHighContrast ? "true" : "false");
    this.host.requestUpdate();
  }

  setAccessibleMode(enabled: boolean): void {
    localStorage.setItem(KEY.accessible, enabled ? "true" : "false");
    this.applyAccessibleMode(enabled);
    this.host.requestUpdate();
  }

  save(update: SettingsUpdate): void {
    this.apiKey = update.apiKey ?? "";
    this.perplexityApiKey = update.perplexityApiKey || "";
    this.backendUrl = update.backendUrl ?? "";
    this.inspector = {
      name: update.inspectorName || "",
      company: update.inspectorCompany || "",
      id: update.inspectorId || "",
    };
    localStorage.setItem(KEY.geminiApiKey, this.apiKey);
    localStorage.setItem(KEY.perplexityApiKey, this.perplexityApiKey);
    localStorage.setItem(KEY.backendUrl, this.backendUrl);
    localStorage.setItem(KEY.inspectorName, this.inspector.name);
    localStorage.setItem(KEY.inspectorCompany, this.inspector.company);
    localStorage.setItem(KEY.inspectorId, this.inspector.id);
    this.host.requestUpdate();
  }

  acceptGdpr(): void {
    this.hasAcceptedGdpr = true;
    localStorage.setItem(KEY.gdpr, "true");
    this.host.requestUpdate();
  }

  /** Setzt die im Speicher gehaltenen Werte zurück (der localStorage wird vom Aufrufer geleert). */
  resetInMemory(): void {
    this.apiKey = "";
    this.backendUrl = "";
    this.inspector = { name: "", company: "", id: "" };
    this.hasAcceptedGdpr = false;
    this.host.requestUpdate();
  }

  private applyTheme(): void {
    const theme = this.isDarkMode ? "dark" : "light";
    this.host.setAttribute("theme", theme);
    document.documentElement.setAttribute("theme", theme);
  }

  private applyAccessibleMode(enabled: boolean): void {
    this.accessibleMode = enabled;
    document.documentElement.classList.toggle("accessible-reading", enabled);
    this.host.classList.toggle("accessible-reading", enabled);
  }
}

import { LitElement, html, unsafeCSS } from "lit";
import wizardStyles from "./ec-diagnosis-wizard.css?inline";
import { customElement, state, query } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import "@vaadin/button";
import "@vaadin/progress-bar";
import "@vaadin/text-area";

import { GeminiAIService } from "../services/gemini-services";
import { TicketService, type Ticket } from "../services/ticket-service";
import { PerplexityService } from "../services/perplexity-services";
import type { DiagnosisResult, TypePlateResult } from "../services/ai-types";
import { Network } from "@capacitor/network";
import { findMatchingDatasheet, type OfflineDatasheet } from "../utils/indexed-db";

import "./ec-app-header";
import "./ec-gdpr-consent";
import "./ec-legal-modal";
import "./ec-camera-capture";
import "./ec-image-annotator";
import "./ec-dguv-form";
import "./ec-settings";
import "./ec-safety-checks";
import "./ec-guided-repair";
import "./ec-ble-multimeter";
import "./ec-gbu-generator";
import "./ec-datasheet-manager";
import "./ec-wholesaler-finder";
import "./ec-roi-calculator";
import "./ec-trouble-tree";
import "./ec-property-selector";
import "./ec-repair-checklist";
import "./ec-spare-part-links";
import "./ec-chat-panel";
import "./ec-history-list";
import "./ec-ocr-result";
import "./ec-pdf-preview";
import "./ec-multimeter-scan-modal";
import "./ec-inspection-schedule";
import type { AppTab } from "./ec-app-header";
import type { EcImageAnnotator } from "./ec-image-annotator";

import { getCachedUser, logout } from "../services/auth-service";
import { SettingsController } from "../state/settings-controller";
import { HistoryController } from "../state/history-controller";
import { DictationController } from "../state/dictation-controller";
import { AudioNoteController } from "../state/audio-note-controller";
import { ReportController } from "../state/report-controller";
import { buildApiHeaders } from "../utils/auth-headers";
import { getErrorMessage } from "../utils/error";
import { buildHistoryExport, downloadTextFile, type HistoryExportFormat } from "../utils/history-export";
import { getCurrentLocation } from "../utils/location";
import { findLocalDiagnosis } from "../utils/local-diagnosis";
import { formatMarkdown } from "../utils/markdown";
import {
  buildDguvPayload,
  type DguvFormChange,
  type GbuData,
  type ReportContext,
  type RoiData,
} from "../utils/report-actions";
import {
  classifyDue,
  loadInspections,
  saveInspections,
  upsertInspection,
  type InspectionRecord,
} from "../utils/inspection-schedule";
import { showToast, showConfirm } from "../utils/toast";

/** Nur-Tab-Komponenten werden erst beim ersten Öffnen des Tabs nachgeladen (kleineres Start-Bundle). */
const TAB_LOADERS: Partial<Record<AppTab, () => Promise<unknown>>> = {
  dashboard: () => import("./ec-dashboard"),
  thermal: () => import("./ec-thermal-analysis"),
  calculator: () => import("./ec-vde-calculator"),
  rules: () => import("./ec-vde-rules"),
  schematic: () => import("./ec-schematic-analyzer"),
};

const DISCLAIMER_TEXT =
  "Haftungsausschluss: Die Nutzung dieser Anwendung sowie die Umsetzung der bereitgestellten Tipps und Diagnoseergebnisse erfolgen ausschließlich auf eigene Gefahr und auf eigenes Risiko. Bei den Inhalten handelt es sich um KI-generierte Empfehlungen, die nach bestem Wissen erstellt wurden; sie stellen jedoch keine Rechtsberatung, keine technische Gewährleistung und keine Erfolgsgarantie dar. Diese Informationen können fehlerhaft sein und ersetzen unter keinen Umständen die Prüfung und Durchführung durch einen qualifizierten Servicetechniker. Vor Arbeiten an elektrischen Anlagen ist die Spannungsfreiheit sicherzustellen und die Einhaltung der geltenden Sicherheitsvorschriften (z.B. die 5 Sicherheitsregeln) liegt in der alleinigen Verantwortung des Nutzers.";

const LOADING_PHRASES = [
  "Übertrage Daten...",
  "Scanne Bauteile...",
  "Analysiere Beschreibung...",
  "Gleiche Datenbank ab...",
  "Kalkuliere Kosten...",
  "Erstelle Protokoll...",
];

/**
 * Shell der Haupt-App: Tab-Navigation, Diagnose-Ablauf (Eingabe → KI-Analyse → Ergebnis) und
 * Verdrahtung der Feature-Komponenten. Einstellungen, Verlauf, Spracheingabe, Chat, Berichte
 * u.a. liegen in eigenen Controllern/Komponenten (src/state, src/utils/report-actions.ts).
 */
@customElement("ec-diagnosis-wizard")
export class EcDiagnosisWizard extends LitElement {
  static styles = unsafeCSS(wizardStyles);

  // ==========================================
  // 1. STATE & PROPERTIES
  // ==========================================

  // UI
  @state() private _isSettingsOpen = false;
  @state() private _isLoading = false;
  @state() private _isTicketCreating = false;
  @state() private _isOnline = true;
  @state() private _loadingMessage = "Bereite Analyse vor...";
  @state() private _safetyConfirmed = false;
  @state() private _safetyChecks: boolean[] = [false, false, false, false, false];
  @state() private _activeTab: AppTab = "diagnose";
  @state() private _guidedRepairStepIndex: number | null = null;
  @state() private _showLegalModal: "imprint" | "privacy" | null = null;
  @state() private _isMultimeterCameraOpen = false;

  // Messwerte
  @state() private _rPe = "";
  @state() private _rIso = "";
  @state() private _iLeak = "";
  @state() private _signatureUrl: string | null = null;
  @state() private _dguvForm: DguvFormChange | null = null;

  // Diagnose-Daten
  @state() private _description = "";
  @state() private _capturedImage: string | null = null;
  @state() private _result: DiagnosisResult | null = null;
  @state() private _ocrResult: TypePlateResult | null = null;
  @state() private _offlineDatasheetMatch: OfflineDatasheet | null = null;
  @state() private _roiData: RoiData | null = null;
  @state() private _gbuData: GbuData | null = null;
  @state() private _resultConfirmed = false;
  @state() private _inspections: InspectionRecord[] = [];
  @state() private _perplexityResult: string | null = null;
  @state() private _isSearchingPerplexity = false;
  @state() private _tickets: Ticket[] = [];

  @query("ec-image-annotator") private _annotator?: EcImageAnnotator;

  private _loadingInterval: number | null = null;
  private _cancelRequested = false;
  private _analysisAbortController: AbortController | null = null;

  // Services & Controller
  private _aiService = new GeminiAIService();
  private _perplexityService = new PerplexityService();
  private _ticketService = new TicketService();

  private _settings = new SettingsController(this);
  private _history = new HistoryController(this);
  private _dictation = new DictationController(this, (text) => this._appendToDescription(text));
  private _audioNote = new AudioNoteController(this, (audio) => this._transcribeAudio(audio));
  private _report = new ReportController(this, {
    getContext: () => this._reportContext(),
    setBusy: (message) => {
      this._isLoading = message !== null;
      if (message !== null) this._loadingMessage = message;
    },
    onExported: (ctx) => this._recordInspection(ctx),
    getHeaders: () =>
      buildApiHeaders({ apiKey: this._settings.apiKey, perplexityApiKey: this._settings.perplexityApiKey }),
  });

  // ==========================================
  // 2. LIFECYCLE
  // ==========================================

  async firstUpdated() {
    this._settings.load();
    this._inspections = loadInspections();
    this._notifyDueInspections();
    await this._history.load();
    await this._initNetworkRadar();
  }

  private async _initNetworkRadar() {
    const status = await Network.getStatus();
    this._isOnline = status.connected;
    // Beim Start noch wartende Analysen aus früheren Sitzungen nachholen
    if (status.connected && this._history.offlineQueue.length > 0) this._processOfflineQueue();

    Network.addListener("networkStatusChange", (change) => {
      this._isOnline = change.connected;
      if (!change.connected) return;

      if (this._history.offlineQueue.length > 0) {
        this._processOfflineQueue();
      }
      this._ticketService
        .syncOfflineTickets()
        .then((count) => {
          if (count > 0) showToast(`${count} Offline-Ticket(s) erfolgreich synchronisiert.`, "success");
        })
        .catch((err) => console.error("Fehler bei Ticket-Synchronisation:", err));
    });
  }

  // ==========================================
  // 3. EINGABE & MESSWERTE
  // ==========================================

  private _appendToDescription(text: string) {
    this._description = this._description ? `${this._description} ${text}` : text;
  }

  private _openTab(tab: AppTab) {
    TAB_LOADERS[tab]?.().catch((err) => {
      console.error(`Tab "${tab}" konnte nicht geladen werden:`, err);
      showToast("Dieser Bereich konnte nicht geladen werden. Bitte Verbindung prüfen.", "error");
    });
    if (tab === "dashboard") {
      this._loadTickets();
    }
    this._activeTab = tab;
  }

  private async _loadTickets() {
    try {
      this._tickets = await this._ticketService.getTickets();
    } catch (err) {
      console.warn("Tickets konnten nicht für Dashboard geladen werden:", err);
    }
  }

  /** Meldet beim App-Start fällige Prüfungen (nur mit erteilter Benachrichtigungs-Berechtigung). */
  private _notifyDueInspections() {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const overdue = this._inspections.filter((r) => classifyDue(r) === "overdue").length;
    const soon = this._inspections.filter((r) => classifyDue(r) === "due-soon").length;
    if (overdue + soon === 0) return;
    new Notification("ElectroCheck AI – Prüffristen", {
      body: `${overdue} Prüfung(en) überfällig, ${soon} in den nächsten 30 Tagen fällig.`,
    });
  }

  /** Hält die Prüfung samt nächster Fälligkeit fest (nur wenn das Protokoll ein Prüfintervall enthält). */
  private _recordInspection(ctx: ReportContext) {
    const next = ctx.dguv?.nextInspectionDate;
    if (!next) return;
    this._inspections = upsertInspection(this._inspections, {
      id: crypto.randomUUID(),
      deviceName: ctx.dguv?.equipmentName || ctx.result.deviceName,
      inventoryNumber: ctx.dguv?.inventoryNumber || undefined,
      location: ctx.result.location,
      inspectedAt: new Date().toISOString(),
      nextInspection: next,
      status: ctx.dguv?.status ?? "",
    });
    saveInspections(this._inspections);
  }

  private _removeInspection(id: string) {
    this._inspections = this._inspections.filter((r) => r.id !== id);
    saveInspections(this._inspections);
  }

  private _handleBleMeasurement(e: CustomEvent) {
    const { target, value } = e.detail;
    if (target === "R_PE") this._rPe = value;
    if (target === "R_ISO") this._rIso = value;
    if (target === "I_LEAK") this._iLeak = value;
  }

  private _handleSafetyChanged(e: CustomEvent) {
    const { index, checked } = e.detail;
    this._safetyChecks = [...this._safetyChecks.slice(0, index), checked, ...this._safetyChecks.slice(index + 1)];
  }

  private _reset() {
    this._capturedImage = null;
    this._result = null;
    this._ocrResult = null;
    this._description = "";
    this._rPe = "";
    this._rIso = "";
    this._iLeak = "";
  }

  private async _transcribeAudio(audio: Blob) {
    this._isLoading = true;
    this._loadingMessage = "Transkribiere Sprachnotiz...";
    try {
      const text = await this._aiService.transcribeAudio(audio);
      if (text) this._appendToDescription(text);
    } catch {
      showToast("Fehler bei der Transkription der Sprachnotiz.", "error");
    } finally {
      this._isLoading = false;
    }
  }

  private async _handleMultimeterPhotoCaptured(e: CustomEvent) {
    const image = e.detail.image;
    this._isMultimeterCameraOpen = false;
    this._isLoading = true;
    this._loadingMessage = "Lese Multimeter ab...";
    try {
      const res = await this._aiService.scanMultimeter(image);
      if (res.value !== null && res.value !== undefined) {
        const valStr = res.value.toString();
        const unit = (res.unit || "").toUpperCase();
        if (unit.includes("KOHM") || unit.includes("MOHM") || unit === "OHM") {
          if (res.value > 10) {
            this._rIso = valStr;
          } else {
            this._rPe = valStr;
          }
        } else if (unit.includes("MA") || unit === "A") {
          this._iLeak = valStr;
        } else if (unit === "V") {
          showToast(`Spannungsmesswert erkannt: ${valStr} V – bitte manuell eintragen.`, "info", 5000);
        }
        showToast(`Messwert eingelesen: ${valStr} ${res.unit}`, "success");
      } else {
        showToast("Messwert konnte nicht eindeutig erkannt werden.", "warning");
      }
    } catch (err) {
      showToast("Fehler beim Ablesen des Multimeters: " + getErrorMessage(err), "error");
    } finally {
      this._isLoading = false;
    }
  }

  private async _handleOcrScanRequested(image: string) {
    this._capturedImage = image;
    this._isLoading = true;
    this._loadingMessage = "Lese Typenschild...";
    try {
      this._ocrResult = await this._aiService.scanTypePlate(image);
      if (this._ocrResult?.componentName) {
        this._offlineDatasheetMatch = await findMatchingDatasheet(this._ocrResult.componentName);
      }
    } catch {
      showToast("OCR-Fehler. Stellen Sie sicher, dass das Typenschild gut lesbar ist.", "error");
    } finally {
      this._isLoading = false;
    }
  }

  private _handleQrDetected(text: string) {
    this._description = `[Anlage erkannt: ${text}]\n` + this._description;
    showToast(`Code erkannt: ${text}`, "success");
  }

  private _openOfflineDatasheet() {
    if (!this._offlineDatasheetMatch) return;
    const link = document.createElement("a");
    link.href = this._offlineDatasheetMatch.fileData;
    link.download = this._offlineDatasheetMatch.name;
    link.click();
  }

  // ==========================================
  // 4. KI-ANALYSE
  // ==========================================

  private _currentImage(): string | null {
    return this._annotator?.getDataUrl() ?? this._capturedImage;
  }

  private _stopLoadingTicker() {
    if (this._loadingInterval) clearInterval(this._loadingInterval);
  }

  private _cancelAnalysis() {
    this._cancelRequested = true;
    this._analysisAbortController?.abort();
    this._analysisAbortController = null;
    this._isLoading = false;
    this._stopLoadingTicker();
  }

  private async _startAnalysis() {
    if (!this._capturedImage && !this._description.trim()) {
      showToast("Bitte Bild aufnehmen oder Beschreibung eingeben.", "warning");
      return;
    }
    const finalImage = this._currentImage();

    if (!this._isOnline) {
      const stored = await this._history.enqueue({ image: finalImage, description: this._description, timestamp: Date.now() });
      showToast(
        stored
          ? "Offline! Daten wurden im Wartezimmer gespeichert."
          : "Offline! Speicher voll – die Analyse wird nur bis zum Schließen der App vorgehalten.",
        "warning",
        4000,
      );
      return this._reset();
    }

    this._cancelRequested = false;
    this._analysisAbortController = new AbortController();
    this._isLoading = true;
    this._result = null;
    this._ocrResult = null;

    let phraseIndex = 0;
    this._loadingMessage = LOADING_PHRASES[0];
    this._loadingInterval = window.setInterval(() => {
      phraseIndex++;
      if (phraseIndex < LOADING_PHRASES.length) this._loadingMessage = LOADING_PHRASES[phraseIndex];
    }, 1800);

    if (this._description.trim()) {
      const localMatch = findLocalDiagnosis(this._description);
      if (localMatch) {
        this._setResult({ ...localMatch, disclaimer: DISCLAIMER_TEXT, location: await getCurrentLocation() });
        this._isLoading = false;
        this._stopLoadingTicker();
        return;
      }
    }

    try {
      const res = await this._aiService.getDiagnosis(
        finalImage,
        this._description,
        this._analysisAbortController.signal,
      );
      if (!this._cancelRequested) {
        this._setResult({ ...res, disclaimer: DISCLAIMER_TEXT, location: await getCurrentLocation() });
      }
    } catch (e) {
      const aborted = e instanceof DOMException && e.name === "AbortError";
      if (!this._cancelRequested && !aborted) {
        showToast("Analyse fehlgeschlagen. Bitte erneut versuchen.", "error");
      }
    } finally {
      this._isLoading = false;
      this._analysisAbortController = null;
      this._stopLoadingTicker();
    }
  }

  private _setResult(result: DiagnosisResult) {
    this._result = result;
    this._resultConfirmed = false;
    this._history.save(result);
  }

  private async _processOfflineQueue() {
    const remaining = await this._history.processQueue(this._aiService);
    if (remaining === 0) {
      showToast("Alle Offline-Diagnosen erfolgreich verarbeitet.", "success");
    }
  }

  private async _runPerplexitySearch() {
    if (!this._result) return;
    this._isSearchingPerplexity = true;
    this._perplexityResult = null;

    try {
      const queryText = `Recherchiere VDE-Richtlinien und typische Reparaturanleitungen für folgendes Gerät und Defekt: Gerät: ${this._result.deviceName}, Defekt: ${this._result.identifiedDefect}. Was sind die wichtigsten Sicherheitsvorkehrungen und VDE-Regeln für diesen Fall?`;
      this._perplexityResult = await this._perplexityService.search(queryText);
    } catch (e) {
      showToast(`Perplexity-Suche fehlgeschlagen: ${getErrorMessage(e)}`, "error");
    } finally {
      this._isSearchingPerplexity = false;
    }
  }

  // ==========================================
  // 5. ERGEBNIS-AKTIONEN (Ticket, Teilen, Berichte)
  // ==========================================

  private _setActionStepCompleted(index: number, completed: boolean) {
    if (!this._result?.actionSteps) return;
    this._result.actionSteps[index].completed = completed;
    this.requestUpdate();
    this._history.save(this._result);
  }

  private _handleGuidedRepairCompleted() {
    showToast("Glückwunsch! Alle Reparatur-Schritte abgeschlossen.", "success", 5000);
    this._guidedRepairStepIndex = null;
  }

  private _handlePropertySelected(e: CustomEvent<{ displayLocation?: string; boardName?: string }>) {
    if (this._result) {
      if (e.detail.displayLocation) this._result.location = e.detail.displayLocation;
      if (e.detail.boardName && !this._result.deviceName) this._result.deviceName = e.detail.boardName;
    }
    this.requestUpdate();
  }

  private _selectFromHistory(result: DiagnosisResult) {
    this._result = result;
    this._resultConfirmed = false;
    this._perplexityResult = null;
  }

  private async _createTicket() {
    if (!this._result) return;
    this._isTicketCreating = true;
    try {
      const ticketId = await this._ticketService.createMaintenanceTicket(this._result);
      const ctx = this._reportContext();
      if (ctx) this._recordInspection(ctx);
      showToast(`Ticket erstellt: ${ticketId}`, "success", 4500);
    } catch (e) {
      showToast(getErrorMessage(e), "error", 5000);
    } finally {
      this._isTicketCreating = false;
    }
  }

  private async _shareResult() {
    if (!this._result) return;
    const text = `Diagnose: ${this._result.deviceName}\nDefekt: ${this._result.identifiedDefect}`;
    if (navigator.share) {
      await navigator.share({ title: "ElectroCheck AI", text });
    } else {
      await navigator.clipboard.writeText(text);
      showToast("In Zwischenablage kopiert.", "success");
    }
  }

  private _reportContext(): ReportContext | null {
    if (!this._result) return null;
    return {
      result: this._result,
      image: this._currentImage(),
      disclaimerText: DISCLAIMER_TEXT,
      dguv: buildDguvPayload({
        rPe: this._rPe,
        rIso: this._rIso,
        iLeak: this._iLeak,
        signatureUrl: this._signatureUrl,
        form: this._dguvForm,
      }),
      inspector: this._settings.inspector,
      roi: this._roiData,
      gbu: this._gbuData,
    };
  }

  // ==========================================
  // 6. EINSTELLUNGEN & DATENSCHUTZ
  // ==========================================

  private _handleSaveSettings(e: CustomEvent) {
    this._settings.save(e.detail);
    this._isSettingsOpen = false;
    showToast("Einstellungen gespeichert.", "success");
  }

  private async _logout() {
    await logout();
    window.location.reload();
  }

  private _exportData(format: HistoryExportFormat) {
    try {
      downloadTextFile(buildHistoryExport(this._history.history, format));
      showToast(`Daten als ${format.toUpperCase()} exportiert.`, "success");
    } catch {
      showToast("Fehler beim Exportieren der Daten.", "error");
    }
  }

  private async _deleteData() {
    const confirmed = await showConfirm(
      "Möchten Sie wirklich alle lokalen Daten (Historie, Einstellungen, API-Schlüssel) unwiderruflich löschen?",
    );
    if (!confirmed) return;

    localStorage.clear();
    this._history.clearHistory();
    this._settings.resetInMemory();
    this._isSettingsOpen = false;
    this._safetyConfirmed = false;
    this._safetyChecks = [false, false, false, false, false];
    showToast("Alle lokalen Daten wurden gelöscht.", "info");
    setTimeout(() => window.location.reload(), 1200);
  }

  // ==========================================
  // 7. RENDER
  // ==========================================

  private _renderSkeleton() {
    return html`
      <div class="card skeleton-card">
        <div class="tech-spinner"></div>
        <p class="loading-text">${this._loadingMessage}</p>
        <vaadin-button theme="tertiary error" @click="${this._cancelAnalysis}" class="mt-1">❌ Abbrechen</vaadin-button>
      </div>
    `;
  }

  private _renderFooter() {
    const openLegal = (type: "imprint" | "privacy") => (e: Event) => {
      e.preventDefault();
      this._showLegalModal = type;
    };
    return html`
      <footer class="app-footer">
        <div>© ${new Date().getFullYear()} ElectroCheck AI. Alle Rechte vorbehalten.</div>
        <div class="footer-links">
          <a href="#" @click="${openLegal("imprint")}">Impressum</a>
          <span>|</span>
          <a href="#" @click="${openLegal("privacy")}">Datenschutzerklärung</a>
        </div>
      </footer>
    `;
  }

  private _renderLegalModal() {
    if (!this._showLegalModal) return html``;
    return html`<ec-legal-modal .type="${this._showLegalModal}" @close="${() => (this._showLegalModal = null)}"></ec-legal-modal>`;
  }

  private _renderInputSection() {
    return html`
      ${!this._capturedImage
        ? html`
            <ec-camera-capture
              .isLoading="${this._isLoading}"
              @photo-captured="${(e: CustomEvent) => (this._capturedImage = e.detail.image)}"
              @ocr-scan-requested="${(e: CustomEvent) => this._handleOcrScanRequested(e.detail.image)}"
              @qr-detected="${(e: CustomEvent) => this._handleQrDetected(e.detail.text)}"
            ></ec-camera-capture>
          `
        : html`<ec-image-annotator
            .image="${this._capturedImage}"
            .boxes="${this._result?.boundingBoxes}"
          ></ec-image-annotator>`}

      <div class="card mt-1">
        <vaadin-text-area
          class="w-100"
          label="Problembeschreibung"
          helper-text="Beschreibe den Defekt oder diktiere per Mikrofon"
          .value="${this._description}"
          @value-changed="${(e: CustomEvent) => (this._description = e.detail.value)}"
        >
          <div slot="suffix" style="display: flex; gap: 4px; align-items: center;">
            <vaadin-button
              theme="tertiary"
              @click="${() => this._dictation.toggle()}"
              aria-label="Echtzeit-Spracheingabe"
              title="Echtzeit-Transkription"
            >
              ${this._dictation.isListening ? "🛑" : "🎤"}
            </vaadin-button>
            <vaadin-button
              theme="${this._audioNote.isRecording ? "tertiary error" : "tertiary"}"
              @click="${() => this._audioNote.toggle()}"
              aria-label="Audioaufnahme transkribieren"
              title="Sprachnotiz aufnehmen & transkribieren"
            >
              ${this._audioNote.isRecording ? "🛑 Stopp" : "🎙️ Diktieren"}
            </vaadin-button>
          </div>
        </vaadin-text-area>

        <div class="action-bar mt-1">
          ${this._capturedImage
            ? html`
                <vaadin-button theme="secondary" @click="${this._reset}">🔄 Bild entfernen</vaadin-button>
                <vaadin-button
                  theme="primary"
                  class="flex-1"
                  ?disabled="${this._isLoading || (!this._description.trim() && !this._capturedImage)}"
                  @click="${this._startAnalysis}"
                  >⚡ Analyse starten</vaadin-button
                >
              `
            : ""}
        </div>
      </div>

      <div class="card mt-1">
        <ec-ble-multimeter @ble-measurement-received="${this._handleBleMeasurement}"></ec-ble-multimeter>
      </div>
    `;
  }

  private _renderLocation(result: DiagnosisResult) {
    if (!result.location) return "";
    const isCoordinates = result.location.includes("Lat:");
    const mapsQuery = encodeURIComponent(result.location.replace("Lat: ", "").replace(", Lng: ", ","));
    return html`
      <div class="mt-1">
        <span class="label">📍 Anlagenstandort:</span><br />
        ${isCoordinates
          ? html`<a
              href="https://www.google.com/maps/search/?api=1&query=${mapsQuery}"
              target="_blank"
              rel="noopener noreferrer"
              class="link-primary"
              >${result.location}</a
            >`
          : html`<span class="text-danger-small">${result.location}</span>`}
      </div>
    `;
  }

  private _renderResultActions() {
    const locked = !this._resultConfirmed;
    const lockedTitle = "Bitte zuerst den KI-Befund fachlich prüfen und bestätigen";
    return html`
      <label
        class="legal-box"
        style="display: flex; gap: 10px; align-items: flex-start; cursor: pointer; margin-top: 1rem; text-align: left;"
      >
        <input
          type="checkbox"
          .checked="${this._resultConfirmed}"
          @change="${(e: Event) => (this._resultConfirmed = (e.target as HTMLInputElement).checked)}"
          style="margin-top: 4px; transform: scale(1.2);"
        />
        <span class="legal-text">
          <strong>KI-Vorschlag – Prüfung erforderlich:</strong> Ich habe Befund und Empfehlung fachlich geprüft und
          übernehme die Verantwortung für Protokoll, Ticket und Berichtsversand.
        </span>
      </label>
      <div class="result-actions">
        <vaadin-button theme="secondary" @click="${() => this._report.openPreview()}" ?disabled="${locked}" title="${locked ? lockedTitle : ""}"
          >📄 Vorschau</vaadin-button
        >
        <vaadin-button theme="primary success" @click="${() => this._report.downloadPdf()}" ?disabled="${locked}" title="${locked ? lockedTitle : ""}"
          >💾 PDF</vaadin-button
        >
        <vaadin-button theme="primary" @click="${this._shareResult}">📲 Teilen</vaadin-button>
        <vaadin-button
          theme="secondary"
          @click="${this._createTicket}"
          ?disabled="${locked || this._isTicketCreating}"
          title="${locked ? lockedTitle : ""}"
          >${this._isTicketCreating ? "⏳..." : "🎫 Ticket"}</vaadin-button
        >
        <vaadin-button
          theme="secondary"
          @click="${this._runPerplexitySearch}"
          ?disabled="${this._isSearchingPerplexity || !this._isOnline}"
          style="grid-column: span 2;"
          >🔍 ${this._isSearchingPerplexity ? "Suche läuft..." : "Perplexity Web-Suche"}</vaadin-button
        >
        <vaadin-button
          theme="tertiary"
          @click="${() => this._report.exportZveh("csv")}"
          ?disabled="${locked}"
          title="${locked ? lockedTitle : "ZVEH-kompatibler CSV-Export für Handwerkersoftware"}"
          >📊 ZVEH (CSV)</vaadin-button
        >
        <vaadin-button
          theme="tertiary"
          @click="${() => this._report.exportZveh("xml")}"
          ?disabled="${locked}"
          title="${locked ? lockedTitle : "E-CHECK konformer XML-Datenexport"}"
          >📄 E-CHECK (XML)</vaadin-button
        >
        <vaadin-button
          theme="secondary"
          @click="${() => this._report.downloadLegend()}"
          ?disabled="${locked}"
          title="${locked ? lockedTitle : "Druckfertiges Stromkreisverzeichnis für die Schaltschranktür nach DIN EN 61439"}"
          >🏷️ Legende (PDF)</vaadin-button
        >
        <vaadin-button
          theme="secondary"
          @click="${() => this._report.sendEmail()}"
          ?disabled="${locked}"
          title="${locked ? lockedTitle : "Prüfbericht inklusive PDF direkt per E-Mail an Kunden versenden"}"
          >✉️ E-Mail-Versand</vaadin-button
        >
      </div>
    `;
  }

  private _renderResult(result: DiagnosisResult) {
    return html`
      <div class="card result-card mt-1">
        <h3 class="m-0">✅ ${result.deviceName}</h3>
        <div class="difficulty-stars">
          <span class="stat-label">Schwierigkeit: </span>
          ${"★".repeat(result.repairDifficulty || 1)}${"☆".repeat(5 - (result.repairDifficulty || 1))}
        </div>
        <p><span class="label">Defekt:</span><br />${result.identifiedDefect}</p>
        <p><span class="label">Empfehlung:</span><br />${result.recommendation}</p>

        <ec-wholesaler-finder .searchTerm="${result.sparePartSearchTerm || result.deviceName}"></ec-wholesaler-finder>

        <ec-trouble-tree
          @fault-tree-diagnosis-selected="${(e: CustomEvent) => {
            this._result = e.detail.diagnosis;
            this._resultConfirmed = false;
          }}"
        ></ec-trouble-tree>

        <ec-roi-calculator @roi-changed="${(e: CustomEvent<RoiData>) => (this._roiData = e.detail)}"></ec-roi-calculator>

        <ec-gbu-generator @gbu-created="${(e: CustomEvent<GbuData>) => (this._gbuData = e.detail)}"></ec-gbu-generator>

        <ec-datasheet-manager></ec-datasheet-manager>

        <ec-repair-checklist
          .steps="${[...(result.actionSteps ?? [])]}"
          @step-toggled="${(e: CustomEvent) => this._setActionStepCompleted(e.detail.index, e.detail.completed)}"
          @guided-repair-requested="${() => (this._guidedRepairStepIndex = 0)}"
        ></ec-repair-checklist>

        <ec-property-selector @property-selected="${this._handlePropertySelected}"></ec-property-selector>

        <ec-dguv-form
          .rPe="${this._rPe}"
          .rIso="${this._rIso}"
          .iLeak="${this._iLeak}"
          .isScanning="${this._isLoading && this._isMultimeterCameraOpen}"
          @scan-multimeter-requested="${() => (this._isMultimeterCameraOpen = true)}"
          @dguv-changed="${(e: CustomEvent) => {
            this._rPe = e.detail.rPe;
            this._rIso = e.detail.rIso;
            this._iLeak = e.detail.iLeak;
            this._signatureUrl = e.detail.signatureUrl;
            this._dguvForm = e.detail;
          }}"
        ></ec-dguv-form>

        ${this._renderLocation(result)}
        ${result.customerExperience
          ? html`<div class="experience-box">💡 <strong>Techniker-Erfahrung:</strong> ${result.customerExperience}</div>`
          : ""}
        ${result.additionalTips && result.additionalTips.length > 0
          ? html`
              <div class="mt-1">
                <span class="label">Profi-Tipps:</span>
                <ul class="tips-list">
                  ${result.additionalTips.map((tip: string) => html`<li>${tip}</li>`)}
                </ul>
              </div>
            `
          : ""}

        <div class="legal-box">
          <p class="legal-text">
            <strong>⚖️ Rechtlicher Hinweis:</strong><br />
            ${result.disclaimer || DISCLAIMER_TEXT}
          </p>
        </div>

        ${this._renderResultActions()}

        <ec-chat-panel .result="${result}"></ec-chat-panel>

        ${this._perplexityResult
          ? html`
              <div class="card mt-1" style="border-left: 4px solid var(--primary); text-align: left; background: var(--bg-app); box-shadow: var(--shadow-sm);">
                <h4 style="margin: 0 0 8px 0; font-weight: bold; color: var(--primary); display: flex; align-items: center; gap: 6px;">
                  🌐 Perplexity Web-Recherche:
                </h4>
                <div style="font-size: 0.85rem; line-height: 1.6; color: var(--text-primary);">
                  ${unsafeHTML(formatMarkdown(this._perplexityResult))}
                </div>
              </div>
            `
          : ""}

        <ec-spare-part-links .searchTerm="${result.sparePartSearchTerm}"></ec-spare-part-links>
      </div>
    `;
  }

  private _renderDiagnoseTab() {
    if (!this._safetyConfirmed) {
      return html`
        <ec-safety-checks
          .safetyChecks="${this._safetyChecks}"
          @safety-changed="${this._handleSafetyChanged}"
          @safety-confirmed="${() => (this._safetyConfirmed = true)}"
        ></ec-safety-checks>
      `;
    }

    if (this._guidedRepairStepIndex !== null) {
      return html`
        <ec-guided-repair
          .result="${this._result}"
          .stepIndex="${this._guidedRepairStepIndex}"
          @step-changed="${(e: CustomEvent) => (this._guidedRepairStepIndex = e.detail.index)}"
          @step-completed="${(e: CustomEvent) => this._setActionStepCompleted(e.detail.index, true)}"
          @repair-completed="${this._handleGuidedRepairCompleted}"
          @close="${() => (this._guidedRepairStepIndex = null)}"
        ></ec-guided-repair>
      `;
    }

    return html`
      ${this._renderInputSection()}
      ${this._isLoading ? this._renderSkeleton() : ""}
      ${this._result && !this._isLoading ? this._renderResult(this._result) : ""}
      ${this._ocrResult && !this._isLoading
        ? html`<ec-ocr-result
            .result="${this._ocrResult}"
            .hasOfflineDatasheet="${!!this._offlineDatasheetMatch}"
            @open-datasheet="${this._openOfflineDatasheet}"
          ></ec-ocr-result>`
        : ""}
      <ec-history-list
        .history="${this._history.history}"
        @history-selected="${(e: CustomEvent) => this._selectFromHistory(e.detail.result)}"
      ></ec-history-list>
    `;
  }

  private _renderActiveTab() {
    switch (this._activeTab) {
      case "dashboard":
        return html`
          <ec-inspection-schedule
            .records="${this._inspections}"
            @inspection-removed="${(e: CustomEvent) => this._removeInspection(e.detail.id)}"
          ></ec-inspection-schedule>
          <ec-dashboard .history="${this._history.history}" .tickets="${this._tickets}"></ec-dashboard>
        `;
      case "thermal":
        return html`<ec-thermal-analysis></ec-thermal-analysis>`;
      case "calculator":
        return html`<ec-vde-calculator></ec-vde-calculator>`;
      case "rules":
        return html`<ec-vde-rules></ec-vde-rules>`;
      case "schematic":
        return html`<ec-schematic-analyzer></ec-schematic-analyzer>`;
      case "gbu":
        return html`<ec-gbu-generator></ec-gbu-generator>`;
      default:
        return this._renderDiagnoseTab();
    }
  }

  render() {
    if (!this._settings.hasAcceptedGdpr) {
      return html`
        <div class="container">
          <ec-gdpr-consent
            @consent-accepted="${() => this._settings.acceptGdpr()}"
            @legal-requested="${(e: CustomEvent) => (this._showLegalModal = e.detail.type)}"
          ></ec-gdpr-consent>
          ${this._renderLegalModal()}
        </div>
      `;
    }

    return html`
      <div class="container">
        <ec-app-header
          .activeTab="${this._activeTab}"
          .gloveMode="${this._settings.isGloveMode}"
          .highContrast="${this._settings.isHighContrast}"
          .darkMode="${this._settings.isDarkMode}"
          @tab-changed="${(e: CustomEvent) => this._openTab(e.detail.tab)}"
          @toggle-glove="${() => this._settings.toggleGloveMode()}"
          @toggle-contrast="${() => this._settings.toggleHighContrast()}"
          @toggle-theme="${() => this._settings.toggleTheme()}"
          @open-settings="${() => (this._isSettingsOpen = true)}"
        ></ec-app-header>

        ${!this._isOnline
          ? html`<div class="offline-banner" role="status">
              📶 Offline-Modus aktiv${this._history.offlineQueue.length > 0
                ? ` – ${this._history.offlineQueue.length} Analyse(n) warten auf Übertragung`
                : ""}
            </div>`
          : this._history.offlineQueue.length > 0
            ? html`<div class="offline-banner" role="status">🔄 ${this._history.offlineQueue.length} wartende Analyse(n) werden übertragen …</div>`
            : ""}
        ${this._renderActiveTab()} ${this._renderFooter()}
        ${this._report.pdfPreviewUrl
          ? html`<ec-pdf-preview .url="${this._report.pdfPreviewUrl}" @close="${() => this._report.closePreview()}"></ec-pdf-preview>`
          : ""}
        ${this._isSettingsOpen
          ? html`
              <ec-settings
                .apiKey="${this._settings.apiKey}"
                .perplexityApiKey="${this._settings.perplexityApiKey}"
                .backendUrl="${this._settings.backendUrl}"
                .accessibleMode="${this._settings.accessibleMode}"
                .inspectorName="${this._settings.inspector.name}"
                .inspectorCompany="${this._settings.inspector.company}"
                .inspectorId="${this._settings.inspector.id}"
                .userEmail="${getCachedUser()?.email ?? ""}"
                @close="${() => (this._isSettingsOpen = false)}"
                @save-settings="${this._handleSaveSettings}"
                @accessible-changed="${(e: CustomEvent) => this._settings.setAccessibleMode(e.detail.checked)}"
                @export-data="${(e: CustomEvent) => this._exportData(e.detail?.format || "json")}"
                @delete-data="${this._deleteData}"
                @logout="${this._logout}"
              ></ec-settings>
            `
          : ""}
        ${this._isMultimeterCameraOpen
          ? html`<ec-multimeter-scan-modal
              .isLoading="${this._isLoading}"
              @photo-captured="${this._handleMultimeterPhotoCaptured}"
              @close="${() => (this._isMultimeterCameraOpen = false)}"
            ></ec-multimeter-scan-modal>`
          : ""}
        ${this._renderLegalModal()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ec-diagnosis-wizard": EcDiagnosisWizard;
  }
}

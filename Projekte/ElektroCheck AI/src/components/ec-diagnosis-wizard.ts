import { LitElement, html, unsafeCSS } from "lit";
import wizardStyles from "./ec-diagnosis-wizard.css?inline";
import { customElement, state, query } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import "@vaadin/button";
import "@vaadin/progress-bar";
import "@vaadin/text-area";
import "@vaadin/vertical-layout";

import { GeminiAIService } from "../services/gemini-services";
import { TicketService } from "../services/ticket-service";
import { PerplexityService } from "../services/perplexity-services";
import { DiagnosisResult } from "../services/ai-types";
import { Network } from "@capacitor/network";
import { Geolocation } from "@capacitor/geolocation";
import { REPAIR_DATA } from "../data/repair-database";
import { findMatchingDatasheet, OfflineDatasheet } from "../utils/indexed-db";

import "./ec-camera-capture";
import "./ec-dguv-form";
import "./ec-dashboard";
import "./ec-settings";
import "./ec-safety-checks";
import "./ec-guided-repair";
import "./ec-thermal-analysis";
import "./ec-vde-calculator";
import "./ec-vde-rules";
import "./ec-ble-multimeter";
import "./ec-schematic-analyzer";
import "./ec-gbu-generator";
import { buildPdfDocDefinition } from "../utils/pdf-generator";

interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

@customElement("ec-diagnosis-wizard")
export class EcDiagnosisWizard extends LitElement {
  static styles = unsafeCSS(wizardStyles);

  // ==========================================
  // 1. STATE & PROPERTIES
  // ==========================================

  // UI States
  @state() private _isDarkMode: boolean = false;
  @state() private _isSettingsOpen: boolean = false;
  @state() private _isLoading: boolean = false;
  @state() private _isTicketCreating: boolean = false;
  @state() private _isOnline: boolean = true;
  @state() private _loadingMessage: string = "Bereite Analyse vor...";
  @state() private _isListening: boolean = false;
  @state() private _safetyConfirmed: boolean = false;
  @state() private _safetyChecks: boolean[] = [false, false, false, false, false];
  @state() private _activeTab: "diagnose" | "dashboard" | "thermal" | "calculator" | "rules" | "schematic" | "gbu" = "diagnose";
  @state() private _isGloveMode: boolean = false;
  @state() private _isHighContrast: boolean = false;

  // Hardware & Canvas
  @state() private _rPe: string = "";
  @state() private _rIso: string = "";
  @state() private _iLeak: string = "";
  @state() private _capturedImage: string | null = null;
  @state() private _selectedBoxLabel: string | null = null;
  @query("#drawing-canvas") private _drawCanvas!: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D | null = null;
  private _isDrawing = false;
  private _lastX = 0;
  private _lastY = 0;
  private _recognition: any = null;

  // Core Data
  @state() private _description: string = "";
  @state() private _result: DiagnosisResult | null = null;
  @state() private _ocrResult: any = null;
  @state() private _history: DiagnosisResult[] = [];
  @state() private _offlineQueue: Array<{
    image: string | null;
    description: string;
    timestamp: number;
  }> = [];
  @state() private _pdfPreviewUrl: string | null = null;
  private _loadingInterval: number | null = null;
  private _cancelRequested: boolean = false;

  @state() private _apiKey: string = "";
  @state() private _perplexityApiKey: string = "";
  @state() private _perplexityResult: string | null = null;
  @state() private _isSearchingPerplexity: boolean = false;
  @state() private _offlineDatasheetMatch: OfflineDatasheet | null = null;
  @state() private _signatureUrl: string | null = null;
  @state() private _isRecordingAudio: boolean = false;
  
  @state() private _backendUrl: string = "http://localhost:3000";
  @state() private _accessibleMode: boolean = false;
  @state() private _hasAcceptedGDPR: boolean = false;
  @state() private _inspectorName: string = "";
  @state() private _inspectorCompany: string = "";
  @state() private _inspectorId: string = "";
  @state() private _gdprCheckbox: boolean = false;
  @state() private _guidedRepairStepIndex: number | null = null;
  @state() private _showLegalModal: "imprint" | "privacy" | null = null;
  @state() private _isMultimeterCameraOpen: boolean = false;

  private _mediaRecorder: MediaRecorder | null = null;
  private _audioChunks: Blob[] = [];

  // Services
  private _aiService = new GeminiAIService();
  private _perplexityService = new PerplexityService();
  private _ticketService = new TicketService();

  // Constants
  private readonly _disclaimerText: string =
    "Haftungsausschluss: Die Nutzung dieser Anwendung sowie die Umsetzung der bereitgestellten Tipps und Diagnoseergebnisse erfolgen ausschließlich auf eigene Gefahr und auf eigenes Risiko. Bei den Inhalten handelt es sich um KI-generierte Empfehlungen, die nach bestem Wissen erstellt wurden; sie stellen jedoch keine Rechtsberatung, keine technische Gewährleistung und keine Erfolgsgarantie dar. Diese Informationen können fehlerhaft sein und ersetzen unter keinen Umständen die Prüfung und Durchführung durch einen qualifizierten Servicetechniker. Vor Arbeiten an elektrischen Anlagen ist die Spannungsfreiheit sicherzustellen und die Einhaltung der geltenden Sicherheitsvorschriften (z.B. die 5 Sicherheitsregeln) liegt in der alleinigen Verantwortung des Nutzers.";

  private readonly _loadingPhrases = [
    "Übertrage Daten...",
    "Scanne Bauteile...",
    "Analysiere Beschreibung...",
    "Gleiche Datenbank ab...",
    "Kalkuliere Kosten...",
    "Erstelle Protokoll...",
  ];

  // ==========================================
  // 2. LIFECYCLE & INITIALIZATION
  // ==========================================

  async firstUpdated() {
    this._loadAppData();
    this._initNetworkRadar();
  }

  disconnectedCallback() {
    if (this._recognition) this._recognition.stop();
    super.disconnectedCallback();
  }

  private async _loadAppData() {
    const savedHistory = localStorage.getItem("electrocheck_history_v2");
    if (savedHistory) this._history = JSON.parse(savedHistory);

    const savedQueue = localStorage.getItem("electrocheck_queue");
    if (savedQueue) this._offlineQueue = JSON.parse(savedQueue);

    const savedTheme = localStorage.getItem("electrocheck_theme");
    if (savedTheme) {
      this._isDarkMode = savedTheme === "dark";
      this.setAttribute("theme", savedTheme);
      document.documentElement.setAttribute("theme", savedTheme);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      this._isDarkMode = prefersDark;
      const theme = prefersDark ? "dark" : "light";
      this.setAttribute("theme", theme);
      document.documentElement.setAttribute("theme", theme);
    }

    const savedApiKey = localStorage.getItem("electrocheck_gemini_api_key");
    if (savedApiKey) this._apiKey = savedApiKey;

    const savedPerplexityApiKey = localStorage.getItem("electrocheck_perplexity_api_key");
    if (savedPerplexityApiKey) this._perplexityApiKey = savedPerplexityApiKey;

    const savedBackendUrl = localStorage.getItem("electrocheck_backend_url");
    if (savedBackendUrl) this._backendUrl = savedBackendUrl;

    const savedAccessible = localStorage.getItem("electrocheck_accessible_mode");
    if (savedAccessible === "true") {
      this._accessibleMode = true;
      document.documentElement.classList.add("accessible-reading");
      this.classList.add("accessible-reading");
    }

    const savedGdpr = localStorage.getItem("electrocheck_gdpr_accepted");
    this._hasAcceptedGDPR = savedGdpr === "true";

    const savedInspectorName = localStorage.getItem("electrocheck_inspector_name") || "";
    const savedInspectorCompany = localStorage.getItem("electrocheck_inspector_company") || "";
    const savedInspectorId = localStorage.getItem("electrocheck_inspector_id") || "";
    this._inspectorName = savedInspectorName;
    this._inspectorCompany = savedInspectorCompany;
    this._inspectorId = savedInspectorId;
  }

  private async _initNetworkRadar() {
    const status = await Network.getStatus();
    this._isOnline = status.connected;

    Network.addListener("networkStatusChange", (status) => {
      this._isOnline = status.connected;
      if (status.connected) {
        if (this._offlineQueue.length > 0) {
          this._processOfflineQueue();
        }
        this._ticketService.syncOfflineTickets().then(count => {
          if (count > 0) {
            alert(`✅ ${count} Offline-Ticket(s) erfolgreich synchronisiert.`);
          }
        }).catch(err => {
          console.error("Fehler bei Ticket-Synchronisation:", err);
        });
      }
    });
  }

  // ==========================================
  // 3. UI & INTERACTION HANDLERS
  // ==========================================

  private _toggleTheme() {
    this._isDarkMode = !this._isDarkMode;
    const theme = this._isDarkMode ? "dark" : "light";
    localStorage.setItem("electrocheck_theme", theme);
    this.setAttribute("theme", theme);
    document.documentElement.setAttribute("theme", theme);
  }

  private _toggleGloveMode() {
    this._isGloveMode = !this._isGloveMode;
    document.documentElement.setAttribute("glove-mode", this._isGloveMode ? "true" : "false");
  }

  private _toggleHighContrast() {
    this._isHighContrast = !this._isHighContrast;
    document.documentElement.setAttribute("high-contrast", this._isHighContrast ? "true" : "false");
  }

  private _handleBleMeasurement(e: CustomEvent) {
    const { target, value } = e.detail;
    if (target === 'R_PE') this._rPe = value;
    if (target === 'R_ISO') this._rIso = value;
    if (target === 'I_LEAK') this._iLeak = value;
  }

  private _handleSafetyChanged(e: CustomEvent) {
    const { index, checked } = e.detail;
    this._safetyChecks = [
      ...this._safetyChecks.slice(0, index),
      checked,
      ...this._safetyChecks.slice(index + 1)
    ];
  }

  private _handleSafetyConfirmed() {
    this._safetyConfirmed = true;
  }

  private _cancelAnalysis() {
    this._cancelRequested = true;
    this._isLoading = false;
    if (this._loadingInterval) clearInterval(this._loadingInterval);
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

  // ==========================================
  // 4. HARDWARE (MIC & GPS)
  // ==========================================

  private _getDguvStatus(): { passed: boolean; message: string; details: string[] } {
    const details: string[] = [];
    let passed = true;

    if (this._rPe.trim()) {
      const val = parseFloat(this._rPe.replace(",", "."));
      if (isNaN(val)) {
        details.push("R_PE: Ungültiger Wert");
        passed = false;
      } else if (val > 0.3) {
        details.push(`R_PE: ${val} Ω (> 0.3 Ω Grenzwert) ❌`);
        passed = false;
      } else {
        details.push(`R_PE: ${val} Ω (≤ 0.3 Ω) ✅`);
      }
    }

    if (this._rIso.trim()) {
      const val = parseFloat(this._rIso.replace(",", "."));
      if (isNaN(val)) {
        details.push("R_ISO: Ungültiger Wert");
        passed = false;
      } else if (val < 1.0) {
        details.push(`R_ISO: ${val} MΩ (< 1.0 MΩ Grenzwert) ❌`);
        passed = false;
      } else {
        details.push(`R_ISO: ${val} MΩ (≥ 1.0 MΩ) ✅`);
      }
    }

    if (this._iLeak.trim()) {
      const val = parseFloat(this._iLeak.replace(",", "."));
      if (isNaN(val)) {
        details.push("I_leak: Ungültiger Wert");
        passed = false;
      } else if (val > 3.5) {
        details.push(`Ableitstrom: ${val} mA (> 3.5 mA Grenzwert) ❌`);
        passed = false;
      } else {
        details.push(`Ableitstrom: ${val} mA (≤ 3.5 mA) ✅`);
      }
    }

    const hasAny = this._rPe.trim() || this._rIso.trim() || this._iLeak.trim();
    if (!hasAny) {
      return { passed: true, message: "Keine Messdaten eingetragen", details: [] };
    }

    return {
      passed,
      message: passed ? "BESTANDEN" : "NICHT BESTANDEN",
      details
    };
  }



  private _toggleVoice() {
    if (!this._recognition) {
      const SpeechRecognitionConstructor =
        (window as IWindow).SpeechRecognition ||
        (window as IWindow).webkitSpeechRecognition;
      if (!SpeechRecognitionConstructor) {
        alert("Dein Browser unterstützt leider keine Spracherkennung.");
        return;
      }
      this._recognition = new SpeechRecognitionConstructor();
      this._recognition.lang = "de-DE";
      this._recognition.continuous = false;
      this._recognition.interimResults = true;
      this._recognition.maxAlternatives = 1;

      this._recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this._description = this._description
          ? this._description + " " + transcript
          : transcript;
      };

      this._recognition.onend = () => {
        this._isListening = false;
      };

      this._recognition.onerror = () => {
        this._isListening = false;
        alert(
          "Fehler bei der Spracherkennung. Bitte Mikrofon-Berechtigung prüfen oder versuchen Sie es erneut.",
        );
      };
    }

    if (this._isListening) {
      this._recognition.stop();
      this._isListening = false;
    } else {
      this._description = "";
      try {
        this._recognition.start();
        this._isListening = true;
      } catch (e) {
        console.error("Error starting speech recognition:", e);
        alert("Fehler beim Starten der Spracherkennung.");
      }
    }
  }

  private async _getCurrentLocation(): Promise<string | undefined> {
    try {
      try {
        const permStatus = await Geolocation.checkPermissions();
        if (permStatus.location !== "granted") {
          const requestStatus = await Geolocation.requestPermissions();
          if (requestStatus.location !== "granted") {
            console.warn("Standort-Berechtigung verweigert.");
            return "Standort-Berechtigung verweigert";
          }
        }
      } catch (permError) {
        console.warn(
          "Berechtigungsprüfung übersprungen (vermutlich Browser):",
          permError,
        );
      }
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });
      return `Lat: ${pos.coords.latitude.toFixed(5)}, Lng: ${pos.coords.longitude.toFixed(5)}`;
    } catch (error) {
      console.error("Standortfehler:", error);
      return "Standort konnte nicht ermittelt werden (Evtl. kein HTTPS oder blockiert)";
    }
  }

  // ==========================================
  // 5. CANVAS & IMAGE PROCESSING
  // ==========================================

  // (Legacy camera capture code removed)

  private _initDrawingCanvas() {
    if (!this._drawCanvas || !this._capturedImage) return;
    this._ctx = this._drawCanvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      this._drawCanvas.width = img.width;
      this._drawCanvas.height = img.height;
      this._ctx?.drawImage(img, 0, 0);
      if (this._ctx) {
        this._ctx.strokeStyle = "#ff0000";
        this._ctx.lineWidth = 10;
        this._ctx.lineCap = "round";
      }
    };
    img.src = this._capturedImage;
  }

  private _handlePointerDown(e: PointerEvent) {
    const rect = this._drawCanvas.getBoundingClientRect();
    const scale = this._drawCanvas.width / rect.width;
    const clickX = (e.clientX - rect.left) * scale;
    const clickY = (e.clientY - rect.top) * scale;

    // Falls wir ein Ergebnis haben, prüfen ob wir in eine Bounding Box geklickt haben
    if (this._result && this._result.boundingBoxes && this._result.boundingBoxes.length > 0) {
      const w = this._drawCanvas.width;
      const h = this._drawCanvas.height;
      const clickedBox = this._result.boundingBoxes.find(box => {
        if (!box.box_2d || box.box_2d.length !== 4) return false;
        const ymin = (box.box_2d[0] / 1000) * h;
        const xmin = (box.box_2d[1] / 1000) * w;
        const ymax = (box.box_2d[2] / 1000) * h;
        const xmax = (box.box_2d[3] / 1000) * w;
        return clickX >= xmin && clickX <= xmax && clickY >= ymin && clickY <= ymax;
      });

      if (clickedBox) {
        this._selectedBoxLabel = clickedBox.label;
        this._drawAIBoundingBoxes();

        // Zeige eine kleine temporäre Meldung
        const notification = document.createElement("div");
        notification.style.position = "fixed";
        notification.style.bottom = "80px";
        notification.style.left = "50%";
        notification.style.transform = "translateX(-50%)";
        notification.style.background = "var(--lumo-primary-color, #005fcc)";
        notification.style.color = "white";
        notification.style.padding = "10px 20px";
        notification.style.borderRadius = "8px";
        notification.style.zIndex = "9999";
        notification.style.fontWeight = "bold";
        notification.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
        notification.innerText = `Ausgewählt: ${clickedBox.label}`;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2500);
        return;
      }
    }

    this._isDrawing = true;
    this._lastX = clickX;
    this._lastY = clickY;
  }

  private _handlePointerMove(e: PointerEvent) {
    if (!this._isDrawing || !this._ctx) return;
    const rect = this._drawCanvas.getBoundingClientRect();
    const scale = this._drawCanvas.width / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;
    this._ctx.beginPath();
    this._ctx.moveTo(this._lastX, this._lastY);
    this._ctx.lineTo(x, y);
    this._ctx.stroke();
    this._lastX = x;
    this._lastY = y;
  }

  // ==========================================
  // 6. AI DIAGNOSIS & LOGIC
  // ==========================================

  private _checkLocalDatabase(query: string): DiagnosisResult | null {
    const lowerQuery = query.toLowerCase();
    const match = REPAIR_DATA.find(
      (item) =>
        lowerQuery.includes(item.model.toLowerCase()) ||
        lowerQuery.includes(item.errorCode.toLowerCase()),
    );

    if (match) {
      return {
        deviceName: match.model,
        identifiedDefect: match.diagnosis,
        recommendation: match.action,
        estimatedRepairCost: "0 - 50 €",
        repairDifficulty: 2,
        safetyLevel: "WARNING" as any,
        additionalTips: [match.safety],
        sparePartSearchTerm: "",
        customerExperience: "⚡ Sofort-Diagnose aus lokaler Offline-Datenbank.",
      };
    }
    return null;
  }

  private async _startAnalysis() {
    if (!this._capturedImage && !this._description.trim())
      return alert("Kein Bild oder Text vorhanden.");
    const finalImage = this._drawCanvas
      ? this._drawCanvas.toDataURL("image/jpeg", 0.8)
      : this._capturedImage;

    if (!this._isOnline) {
      this._offlineQueue = [
        ...this._offlineQueue,
        {
          image: finalImage,
          description: this._description,
          timestamp: Date.now(),
        },
      ];
      localStorage.setItem(
        "electrocheck_queue",
        JSON.stringify(this._offlineQueue),
      );
      alert("Offline! Daten wurden im Wartezimmer gespeichert.");
      return this._reset();
    }

    this._cancelRequested = false;
    this._isLoading = true;
    this._result = null;
    this._ocrResult = null;

    let i = 0;
    this._loadingMessage = this._loadingPhrases[0];
    this._loadingInterval = window.setInterval(() => {
      i++;
      if (i < this._loadingPhrases.length)
        this._loadingMessage = this._loadingPhrases[i];
    }, 1800);

    if (this._description.trim()) {
      const localMatch = this._checkLocalDatabase(this._description);
      if (localMatch) {
        const locationStr = await this._getCurrentLocation();
        this._result = {
          ...localMatch,
          disclaimer: this._disclaimerText,
          location: locationStr,
        } as any;
        this._saveToHistory(this._result!);
        this._isLoading = false;
        if (this._loadingInterval) clearInterval(this._loadingInterval);
        return;
      }
    }

    try {
      const res = await this._aiService.getDiagnosis(
        finalImage,
        this._description,
      );

      if (!this._cancelRequested) {
        const locationStr = await this._getCurrentLocation();
        this._result = {
          ...res,
          disclaimer: this._disclaimerText,
          location: locationStr,
        } as any;
        if (this._result) {
          this._saveToHistory(this._result!);
          await this.updateComplete;
          if (this._result.boundingBoxes && this._result.boundingBoxes.length > 0) {
            this._drawAIBoundingBoxes();
          }
        }
      }
    } catch (e: any) {
      if (!this._cancelRequested) alert("Analyse fehlgeschlagen.");
    } finally {
      this._isLoading = false;
      if (this._loadingInterval) clearInterval(this._loadingInterval);
    }
  }

  private _drawAIBoundingBoxes() {
    if (!this._drawCanvas || !this._result || !this._result.boundingBoxes || !this._capturedImage) return;
    const ctx = this._drawCanvas.getContext("2d");
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      
      const w = this._drawCanvas.width;
      const h = this._drawCanvas.height;

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      this._result!.boundingBoxes!.forEach(box => {
        if (!box.box_2d || box.box_2d.length !== 4) return;
        
        const ymin = (box.box_2d[0] / 1000) * h;
        const xmin = (box.box_2d[1] / 1000) * w;
        const ymax = (box.box_2d[2] / 1000) * h;
        const xmax = (box.box_2d[3] / 1000) * w;

        const boxW = xmax - xmin;
        const boxH = ymax - ymin;

        const isSelected = box.label === this._selectedBoxLabel;

        ctx.lineWidth = isSelected ? Math.max(6, Math.floor(w / 100)) : Math.max(3, Math.floor(w / 200));
        ctx.strokeStyle = isSelected ? "#eab308" : "#10b981"; // Gelb falls selektiert, Grün falls normal
        ctx.strokeRect(xmin, ymin, boxW, boxH);

        ctx.fillStyle = isSelected ? "rgba(234, 179, 8, 0.95)" : "rgba(16, 185, 129, 0.85)";
        const fontSize = Math.max(12, Math.floor(w / 40));
        ctx.font = `bold ${fontSize}px var(--font-sans, sans-serif)`;
        const textWidth = ctx.measureText(box.label).width;

        ctx.fillRect(xmin, ymin - fontSize - 6, textWidth + 12, fontSize + 8);

        ctx.fillStyle = "#ffffff";
        ctx.fillText(box.label, xmin + 6, ymin - 5);
      });
    };
    img.src = this._capturedImage;
  }

  private async _runPerplexitySearch() {
    if (!this._result) return;
    this._isSearchingPerplexity = true;
    this._perplexityResult = null;
    
    try {
      const queryText = `Recherchiere VDE-Richtlinien und typische Reparaturanleitungen für folgendes Gerät und Defekt: Gerät: ${this._result.deviceName}, Defekt: ${this._result.identifiedDefect}. Was sind die wichtigsten Sicherheitsvorkehrungen und VDE-Regeln für diesen Fall?`;
      this._perplexityResult = await this._perplexityService.search(queryText);
    } catch (e: any) {
      alert(`Fehler bei der Perplexity-Suche: ${e.message}`);
    } finally {
      this._isSearchingPerplexity = false;
    }
  }

  private _formatMarkdown(text: string): string {
    if (!text) return "";
    let formatted = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    formatted = formatted.replace(/^\*\s(.*)$/gm, "• $1");
    return formatted;
  }

  private async _toggleAudioRecording() {
    if (this._isRecordingAudio) {
      this._stopAudioRecording();
    } else {
      await this._startAudioRecording();
    }
  }

  private async _startAudioRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this._mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      this._audioChunks = [];

      this._mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this._audioChunks.push(e.data);
        }
      };

      this._mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this._audioChunks, { type: "audio/webm" });
        stream.getTracks().forEach(track => track.stop());
        await this._sendAudioToTranscribe(audioBlob);
      };

      this._mediaRecorder.start();
      this._isRecordingAudio = true;
    } catch (e) {
      alert("Zugriff auf das Mikrofon verweigert oder nicht unterstützt.");
    }
  }

  private _stopAudioRecording() {
    if (this._mediaRecorder && this._mediaRecorder.state !== "inactive") {
      this._mediaRecorder.stop();
      this._isRecordingAudio = false;
    }
  }

  private async _sendAudioToTranscribe(blob: Blob) {
    this._isLoading = true;
    this._loadingMessage = "Transkribiere Sprachnotiz...";
    
    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const response = await fetch(`${this._backendUrl}/api/gemini/transcribe`, {
        method: "POST",
        headers: this._getHeaders(),
        body: JSON.stringify({ audioBase64: base64Data }),
      });

      if (!response.ok) throw new Error("Transkriptionsanfrage fehlgeschlagen.");
      
      const data = await response.json();
      if (data.text) {
        this._description = this._description 
          ? `${this._description} ${data.text}`
          : data.text;
      }
    } catch (e) {
      alert("Fehler bei der Transkription der Sprachnotiz.");
    } finally {
      this._isLoading = false;
    }
  }

  private _getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (this._apiKey) {
      headers["x-gemini-api-key"] = this._apiKey;
    }
    const savedPerplexity = localStorage.getItem("electrocheck_perplexity_api_key");
    if (savedPerplexity) {
      headers["x-perplexity-api-key"] = savedPerplexity;
    }
    return headers;
  }

  private async _processOfflineQueue() {
    const tasks = [...this._offlineQueue];

    for (const t of tasks) {
      try {
        const res = await this._aiService.getDiagnosis(
          t.image,
          t.description,
        );
        this._saveToHistory(res);
        // Erfolgreich übertragen -> Aus lokaler State-Warteschlange & LocalStorage löschen
        this._offlineQueue = this._offlineQueue.filter(item => item.timestamp !== t.timestamp);
        localStorage.setItem("electrocheck_queue", JSON.stringify(this._offlineQueue));
      } catch (e) {
        console.warn("Fehler bei der Abarbeitung der Offline-Queue. Pausiere Übertragung.", e);
        break; // Stop loop as we are likely still offline
      }
    }

    if (this._offlineQueue.length === 0) {
      alert("Alle Offline-Diagnosen verarbeitet.");
    }
  }

  private async _handlePhotoCaptured(image: string) {
    this._capturedImage = image;
    await this.updateComplete;
    this._initDrawingCanvas();
  }

  private _handleMultimeterScanRequested() {
    this._isMultimeterCameraOpen = true;
  }

  private async _handleMultimeterPhotoCaptured(e: CustomEvent) {
    const image = e.detail.image;
    this._isMultimeterCameraOpen = false;
    this._isLoading = true;
    this._loadingMessage = "Lese Multimeter ab...";
    try {
      const res = await this._aiService.scanMultimeter(image);
      console.log("Multimeter-Scan Ergebnis:", res);
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
          alert(`Spannungsmesswert erkannt: ${valStr} V. Bitte tragen Sie diesen Wert manuell ein.`);
        }
        alert(`Messwert erfolgreich eingelesen: ${valStr} ${res.unit}`);
      } else {
        alert("Messwert konnte auf dem Bild nicht eindeutig erkannt werden.");
      }
    } catch (err: any) {
      alert("Fehler beim Ablesen des Multimeters: " + err.message);
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
      if (this._ocrResult && this._ocrResult.componentName) {
        const match = await findMatchingDatasheet(this._ocrResult.componentName);
        this._offlineDatasheetMatch = match;
      }
    } catch (e) {
      alert("OCR-Fehler. Stellen Sie sicher, dass das Typenschild gut lesbar ist.");
    } finally {
      this._isLoading = false;
    }
  }

  private _handleQrDetected(text: string) {
    this._description = `[Anlage erkannt: ${text}]\n` + this._description;
    alert(`✅ Code erkannt: ${text}`);
  }

  private _openOfflineDatasheet() {
    if (!this._offlineDatasheetMatch) return;
    const link = document.createElement("a");
    link.href = this._offlineDatasheetMatch.fileData;
    link.download = this._offlineDatasheetMatch.name;
    link.click();
  }

  private _saveToHistory(res: DiagnosisResult) {
    this._history = [res, ...this._history.slice(0, 9)];
    localStorage.setItem("electrocheck_history_v2", JSON.stringify(this._history));
  }

  private _handleSaveSettings(e: CustomEvent) {
    this._apiKey = e.detail.apiKey;
    this._perplexityApiKey = e.detail.perplexityApiKey || "";
    this._backendUrl = e.detail.backendUrl;
    this._inspectorName = e.detail.inspectorName || "";
    this._inspectorCompany = e.detail.inspectorCompany || "";
    this._inspectorId = e.detail.inspectorId || "";
    localStorage.setItem("electrocheck_gemini_api_key", this._apiKey);
    localStorage.setItem("electrocheck_perplexity_api_key", this._perplexityApiKey);
    localStorage.setItem("electrocheck_backend_url", this._backendUrl);
    localStorage.setItem("electrocheck_inspector_name", this._inspectorName);
    localStorage.setItem("electrocheck_inspector_company", this._inspectorCompany);
    localStorage.setItem("electrocheck_inspector_id", this._inspectorId);
    this._isSettingsOpen = false;
    alert("Einstellungen gespeichert!");
  }

  private _handleAccessibleChanged(e: CustomEvent) {
    const checked = e.detail.checked;
    this._accessibleMode = checked;
    localStorage.setItem("electrocheck_accessible_mode", checked ? "true" : "false");
    if (checked) {
      document.documentElement.classList.add("accessible-reading");
      this.classList.add("accessible-reading");
    } else {
      document.documentElement.classList.remove("accessible-reading");
      this.classList.remove("accessible-reading");
    }
  }

  private _acceptGDPR() {
    if (this._gdprCheckbox) {
      this._hasAcceptedGDPR = true;
      localStorage.setItem("electrocheck_gdpr_accepted", "true");
    }
  }

  private _exportData() {
    try {
      const dataStr = JSON.stringify(this._history, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = 'electrocheck_diagnosen_export.json';

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (e) {
      alert("Fehler beim Exportieren der Daten.");
    }
  }

  private _deleteData() {
    if (confirm("Möchten Sie wirklich alle lokalen Daten (Historie, Einstellungen, API-Schlüssel) unwiderruflich löschen?")) {
      localStorage.clear();
      this._history = [];
      this._apiKey = "";
      this._backendUrl = "http://localhost:3000";
      this._inspectorName = "";
      this._inspectorCompany = "";
      this._inspectorId = "";
      this._hasAcceptedGDPR = false;
      this._isSettingsOpen = false;
      this._safetyConfirmed = false;
      this._safetyChecks = [false, false, false, false, false];
      alert("Alle lokalen Daten wurden gelöscht.");
      window.location.reload();
    }
  }

  // ==========================================
  // 7. TICKETING, PDF & EXPORT
  // ==========================================

  private async _createTicket() {
    if (!this._result) return;
    this._isTicketCreating = true;
    try {
      const ticketId = await this._ticketService.createMaintenanceTicket(
        this._result!,
      );
      alert(`✅ Ticket erfolgreich erstellt: ${ticketId}`);
    } catch (e: any) {
      alert(e.message);
    } finally {
      this._isTicketCreating = false;
    }
  }

  private async _shareResult() {
    if (!this._result) return;
    const text = `Diagnose: ${this._result.deviceName}\nDefekt: ${this._result.identifiedDefect}`;
    if (navigator.share)
      await navigator.share({ title: "ElectroCheck AI", text });
    else {
      await navigator.clipboard.writeText(text);
      alert("In Zwischenablage kopiert!");
    }
  }

  private async _openPdfPreview() {
    this._isLoading = true;
    this._loadingMessage = "Lade Vorschau...";
    try {
      const dguvData = (this._rPe.trim() || this._rIso.trim() || this._iLeak.trim()) ? {
        rPe: this._rPe,
        rIso: this._rIso,
        iLeak: this._iLeak,
        status: this._getDguvStatus().message,
        details: this._getDguvStatus().details,
        signatureUrl: this._signatureUrl
      } : undefined;
      const docDef = buildPdfDocDefinition(
        this._result!,
        this._drawCanvas ? this._drawCanvas.toDataURL("image/jpeg", 0.8) : this._capturedImage,
        this._disclaimerText,
        dguvData,
        {
          name: this._inspectorName,
          company: this._inspectorCompany,
          id: this._inspectorId,
        }
      );
      if (!docDef) return;

      const pdfMakeMod = await import("pdfmake/build/pdfmake");
      const pdfFontsMod = await import("pdfmake/build/vfs_fonts");
      const pdfMake = (pdfMakeMod as any).default || pdfMakeMod;
      const pdfFonts = (pdfFontsMod as any).default || pdfFontsMod;

      pdfMake.vfs = (pdfFonts as any).pdfMake
        ? (pdfFonts as any).pdfMake.vfs
        : (pdfFonts as any).vfs;
      pdfMake.createPdf(docDef).getBlob((blob: Blob) => {
        this._pdfPreviewUrl = URL.createObjectURL(blob);
        this._isLoading = false;
        this.requestUpdate();
      });
    } catch (e) {
      alert("Fehler bei der PDF-Vorschau.");
      this._isLoading = false;
    }
  }

  private async _downloadPdfDirectly() {
    try {
      const dguvData = (this._rPe.trim() || this._rIso.trim() || this._iLeak.trim()) ? {
        rPe: this._rPe,
        rIso: this._rIso,
        iLeak: this._iLeak,
        status: this._getDguvStatus().message,
        details: this._getDguvStatus().details,
        signatureUrl: this._signatureUrl
      } : undefined;
      const docDef = buildPdfDocDefinition(
        this._result!,
        this._drawCanvas ? this._drawCanvas.toDataURL("image/jpeg", 0.8) : this._capturedImage,
        this._disclaimerText,
        dguvData,
        {
          name: this._inspectorName,
          company: this._inspectorCompany,
          id: this._inspectorId,
        }
      );
      if (!docDef) return;
      const pdfMakeMod = await import("pdfmake/build/pdfmake");
      const pdfFontsMod = await import("pdfmake/build/vfs_fonts");
      const pdfMake = (pdfMakeMod as any).default || pdfMakeMod;
      const pdfFonts = (pdfFontsMod as any).default || pdfFontsMod;
      pdfMake.vfs = (pdfFonts as any).pdfMake
        ? (pdfFonts as any).pdfMake.vfs
        : (pdfFonts as any).vfs;
      pdfMake
        .createPdf(docDef)
        .download(
          `Protokoll_${this._result?.deviceName.replace(/\s+/g, "_")}.pdf`,
        );
    } catch (e) {
      alert("Fehler beim PDF Download.");
    }
  }

  // ==========================================
  // 8. RENDER TEMPLATES
  // ==========================================

  private _toggleChecklistStep(index: number, e: Event) {
    if (!this._result || !this._result.actionSteps) return;
    const isChecked = (e.target as HTMLInputElement).checked;
    this._result.actionSteps[index].completed = isChecked;
    this.requestUpdate();
    this._saveToHistory(this._result);
  }

  private _getChecklistProgress(): number {
    if (
      !this._result ||
      !this._result.actionSteps ||
      this._result.actionSteps.length === 0
    )
      return 0;
    const completed = this._result.actionSteps.filter(
      (s) => s.completed,
    ).length;
    return completed / this._result.actionSteps.length;
  }

  private _handleGuidedStepCompleted(index: number) {
    if (this._result && this._result.actionSteps) {
      this._result.actionSteps[index].completed = true;
      this.requestUpdate();
      this._saveToHistory(this._result);
    }
  }

  private _handleGuidedRepairCompleted() {
    alert("🎉 Glückwunsch! Sie haben alle Reparatur-Schritte abgeschlossen.");
    this._guidedRepairStepIndex = null;
  }

  private _renderGDPRConsent() {
    return html`
      <div class="modal-overlay">
        <div class="card consent-card">
          <h3 class="consent-title">🔒 DSGVO-Einwilligung & Datenschutz</h3>
          <p class="consent-text">
            Um eine KI-gestützte Fehlerdiagnose durchführen zu können, müssen Ihre Eingaben (Fehlerbeschreibungen und ggf. aufgenommene Bilder) zur Analyse an die Google Gemini API übertragen werden.
          </p>
          <p class="consent-text">
            Ihre Daten werden über eine gesicherte SSL-Verbindung an unseren Backend-Proxy übermittelt. Es findet keine dauerhafte Speicherung Ihrer Bilddateien auf unseren Servern statt. Die App speichert Ihre Diagnosehistorie sowie Einstellungen ausschließlich lokal in Ihrem Webbrowser (Local Storage).
          </p>
          
          <label class="consent-checkbox-label">
            <input 
              type="checkbox" 
              .checked="${this._gdprCheckbox}" 
              @change="${(e: Event) => {
                this._gdprCheckbox = (e.target as HTMLInputElement).checked;
                this.requestUpdate();
              }}"
            />
            <span>
              Ich willige in die Verarbeitung meiner Daten zum Zwecke der KI-Diagnose ein und bestätige, dass ich die <a href="#" @click="${(e: Event) => { e.preventDefault(); this._showLegalModal = 'privacy'; }}">Datenschutzerklärung</a> gelesen habe.
            </span>
          </label>
          
          <vaadin-button
            theme="primary"
            class="w-100"
            ?disabled="${!this._gdprCheckbox}"
            @click="${this._acceptGDPR}"
            >Einwilligen & Fortfahren</vaadin-button
          >
        </div>
      </div>
    `;
  }

  private _renderLegalModal() {
    if (!this._showLegalModal) return html``;
    
    const isImprint = this._showLegalModal === "imprint";
    
    return html`
      <div class="modal-overlay" style="z-index: 3000;">
        <div class="card settings-card" style="max-height: 85vh; overflow-y: auto;">
          <h3 class="m-0">${isImprint ? "Impressum" : "Datenschutzerklärung"}</h3>
          <div style="margin: 1.25rem 0; font-size: 0.875rem; line-height: 1.6; text-align: left; color: var(--text-secondary);">
            ${isImprint 
              ? html`
                  <p><strong>ElectroCheck AI</strong></p>
                  <p>Eine innovative Anwendung für Elektrofachkräfte.</p>
                  <p><strong>Vertreten durch:</strong><br>Schengi / ElektroCheck AI GmbH</p>
                  <p><strong>Kontakt:</strong><br>E-Mail: info@electrocheck-ai.de<br>Webseite: www.electrocheck-ai.de</p>
                  <p><strong>Haftungsausschluss:</strong><br>Die Inhalte dieser App (insb. die KI-Diagnosen) wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Arbeiten an elektrischen Anlagen dürfen nur durch qualifizierte Elektrofachkräfte unter Einhaltung der 5 Sicherheitsregeln durchgeführt werden.</p>
                `
              : html`
                  <p><strong>1. Datenschutz auf einen Blick</strong></p>
                  <p>Diese Datenschutzerklärung informiert Sie über die Art, den Umfang und Zweck der Verarbeitung von personenbezogenen Daten innerhalb unserer App.</p>
                  
                  <p><strong>2. Datenverarbeitung durch die Gemini-API</strong></p>
                  <p>Für die Analyse von Fehlern übermittelt diese App Bilddaten und Beschreibungen per HTTPS-Verschlüsselung an unseren Backend-Proxy, welcher die Anfrage an die Google Gemini API weiterleitet. Die Bilddaten werden temporär übertragen und nicht dauerhaft serverseitig gespeichert.</p>
                  
                  <p><strong>3. Lokale Speicherung (Local Storage)</strong></p>
                  <p>Diese App nutzt den lokalen Speicher Ihres Browsers, um Ihre Diagnosehistorie, Ihre Einstellungen und Ihren API-Schlüssel zu speichern. Diese Daten verlassen Ihr Gerät nicht, es sei denn, Sie führen eine Diagnoseanfrage durch. Sie können diese Daten in den Einstellungen jederzeit löschen.</p>
                  
                  <p><strong>4. Ihre Rechte</strong></p>
                  <p>Sie haben das Recht auf Auskunft, Datenübertragbarkeit und Löschung Ihrer Daten. Nutzen Sie hierfür die Export- und Löschfunktionen in den Einstellungen.</p>
                `
            }
          </div>
          <div class="modal-actions">
            <vaadin-button theme="primary" @click="${() => this._showLegalModal = null}">Schließen</vaadin-button>
          </div>
        </div>
      </div>
    `;
  }

  private _renderFooter() {
    return html`
      <footer class="app-footer">
        <div>© ${new Date().getFullYear()} ElectroCheck AI. Alle Rechte vorbehalten.</div>
        <div class="footer-links">
          <a href="#" @click="${(e: Event) => { e.preventDefault(); this._showLegalModal = 'imprint'; }}">Impressum</a>
          <span>|</span>
          <a href="#" @click="${(e: Event) => { e.preventDefault(); this._showLegalModal = 'privacy'; }}">Datenschutzerklärung</a>
        </div>
      </footer>
    `;
  }

  private _renderSkeleton() {
    return html`
      <div class="card skeleton-card">
        <div class="tech-spinner"></div>
        <p class="loading-text">${this._loadingMessage}</p>
        <vaadin-button
          theme="tertiary error"
          @click="${this._cancelAnalysis}"
          class="mt-1"
          >❌ Abbrechen</vaadin-button
        >
      </div>
    `;
  }

  render() {
    if (!this._hasAcceptedGDPR) {
      return html`
        <div class="container">
          ${this._renderGDPRConsent()}
          ${this._renderLegalModal()}
        </div>
      `;
    }

    return html`
      <div class="container">
        <header class="header">
          <div class="header-left"> 
            <h2 class="header-title">ElectroCheck AI</h2>
            <vaadin-button
              theme="${this._activeTab === "diagnose" ? "primary" : "secondary"}"
              @click="${() => (this._activeTab = "diagnose")}"
              >📷 Diagnose</vaadin-button
            >
            <vaadin-button
              theme="${this._activeTab === "thermal" ? "primary" : "secondary"}"
              @click="${() => (this._activeTab = "thermal")}"
              >🔥 Wärmebild</vaadin-button
            >
            <vaadin-button
              theme="${this._activeTab === "dashboard"
                ? "primary"
                : "secondary"}"
              @click="${() => (this._activeTab = "dashboard")}"
              >📊 Dashboard</vaadin-button
            >
            <vaadin-button
              theme="${this._activeTab === "calculator"
                ? "primary"
                : "secondary"}"
              @click="${() => (this._activeTab = "calculator")}"
              >⚡ Rechner</vaadin-button
            >
            <vaadin-button
              theme="${this._activeTab === "rules"
                ? "primary"
                : "secondary"}"
              @click="${() => (this._activeTab = "rules")}"
              >📚 VDE-Regeln</vaadin-button
            >
            <vaadin-button
              theme="${this._activeTab === "schematic"
                ? "primary"
                : "secondary"}"
              @click="${() => (this._activeTab = "schematic")}"
              >📐 Schaltplan</vaadin-button
            >
            <vaadin-button
              theme="${this._activeTab === "gbu"
                ? "primary"
                : "secondary"}"
              @click="${() => (this._activeTab = "gbu")}"
              >🛡️ GBU</vaadin-button
            >
          </div>
          <div style="display: flex; gap: 4px;">
            <vaadin-button
              theme="${this._isGloveMode ? "primary" : "secondary"}"
              @click="${this._toggleGloveMode}"
              title="Handschuh-Modus (Große Buttons)"
              >🧤</vaadin-button
            >
            <vaadin-button
              theme="${this._isHighContrast ? "primary" : "secondary"}"
              @click="${this._toggleHighContrast}"
              title="High-Contrast Outdoor Modus"
              >🔆</vaadin-button
            >
            <vaadin-button
              theme="secondary" 
              @click="${() => (this._isSettingsOpen = true)}"
              aria-label="Einstellungen"
              >⚙️</vaadin-button
            >
            <vaadin-button 
              theme="secondary" 
              @click="${this._toggleTheme}"
              aria-label="Farbschema wechseln"
              >${this._isDarkMode ? "☀️" : "🌙"}</vaadin-button
            >
          </div>
        </header>

        ${!this._isOnline
          ? html`<div class="offline-banner" role="status">📶 Offline-Modus aktiv</div>`
          : ""}
        
        ${this._activeTab === "dashboard"
          ? html`<ec-dashboard .history="${this._history}"></ec-dashboard>`
          : this._activeTab === "thermal"
          ? html`<ec-thermal-analysis></ec-thermal-analysis>`
          : this._activeTab === "calculator"
          ? html`<ec-vde-calculator></ec-vde-calculator>`
          : this._activeTab === "rules"
          ? html`<ec-vde-rules></ec-vde-rules>`
          : this._activeTab === "schematic"
          ? html`<ec-schematic-analyzer></ec-schematic-analyzer>`
          : this._activeTab === "gbu"
          ? html`<ec-gbu-generator></ec-gbu-generator>`
          : html`
              ${!this._safetyConfirmed
                ? html`
                    <ec-safety-checks
                      .safetyChecks="${this._safetyChecks}"
                      @safety-changed="${this._handleSafetyChanged}"
                      @safety-confirmed="${this._handleSafetyConfirmed}"
                    ></ec-safety-checks>
                  `
                : html`
                    ${this._guidedRepairStepIndex !== null
                      ? html`
                          <ec-guided-repair
                            .result="${this._result}"
                            .stepIndex="${this._guidedRepairStepIndex}"
                            @step-changed="${(e: CustomEvent) => (this._guidedRepairStepIndex = e.detail.index)}"
                            @step-completed="${(e: CustomEvent) => this._handleGuidedStepCompleted(e.detail.index)}"
                            @repair-completed="${this._handleGuidedRepairCompleted}"
                            @close="${() => (this._guidedRepairStepIndex = null)}"
                          ></ec-guided-repair>
                        `
                      : html`
                          ${!this._capturedImage
                            ? html`
                                <ec-camera-capture
                                  .isLoading="${this._isLoading}"
                                  @photo-captured="${(e: CustomEvent) => this._handlePhotoCaptured(e.detail.image)}"
                                  @ocr-scan-requested="${(e: CustomEvent) => this._handleOcrScanRequested(e.detail.image)}"
                                  @qr-detected="${(e: CustomEvent) => this._handleQrDetected(e.detail.text)}"
                                ></ec-camera-capture>
                              `
                            : html`
                                <div class="media-box" style="background: var(--surface);">
                                  <canvas
                                    id="drawing-canvas"
                                    @pointerdown="${this._handlePointerDown}"
                                    @pointermove="${this._handlePointerMove}"
                                    @pointerup="${() => (this._isDrawing = false)}"
                                    aria-label="Diagnosebild mit Markierungsfunktion"
                                  ></canvas>
                                  <div
                                    class="camera-hint"
                                    role="status"
                                    aria-live="polite"
                                  >
                                    ✏️ <strong>Markiere den Fehler</strong> auf dem Bild für eine genauere Analyse
                                  </div>
                                </div>
                              `}

                          <div class="card mt-1">
                            <vaadin-text-area
                              class="w-100"
                              label="Problembeschreibung"
                              helper-text="Beschreibe den Defekt oder diktiere per Mikrofon"
                              .value="${this._description}"
                              @value-changed="${(e: CustomEvent) =>
                                (this._description = e.detail.value)}"
                            >
                              <div slot="suffix" style="display: flex; gap: 4px; align-items: center;">
                                <vaadin-button
                                  theme="tertiary"
                                  @click="${this._toggleVoice}"
                                  aria-label="Echtzeit-Spracheingabe"
                                  title="Echtzeit-Transkription"
                                >
                                  ${this._isListening ? "🛑" : "🎤"}
                                </vaadin-button>
                                <vaadin-button
                                  theme="${this._isRecordingAudio ? "tertiary error" : "tertiary"}"
                                  @click="${this._toggleAudioRecording}"
                                  aria-label="Audioaufnahme transkribieren"
                                  title="Sprachnotiz aufnehmen & transkribieren"
                                >
                                  ${this._isRecordingAudio ? "🛑 Stopp" : "🎙️ Diktieren"}
                                </vaadin-button>
                              </div>
                            </vaadin-text-area>

                            <div class="action-bar mt-1">
                              ${this._capturedImage
                                ? html`
                                    <vaadin-button
                                      theme="secondary"
                                      @click="${this._reset}"
                                      >🔄 Bild entfernen</vaadin-button
                                    >
                                    <vaadin-button
                                      theme="primary"
                                      class="flex-1"
                                      ?disabled="${this._isLoading ||
                                      (!this._description.trim() &&
                                        !this._capturedImage)}"
                                      @click="${this._startAnalysis}"
                                      >⚡ Analyse starten</vaadin-button
                                    >
                                  `
                                : ""}
                            </div>
                          </div>

                          <div class="card mt-1">
                            <ec-ble-multimeter
                              @ble-measurement-received="${this._handleBleMeasurement}"
                            ></ec-ble-multimeter>

                            <ec-dguv-form
                              .rPe="${this._rPe}"
                              .rIso="${this._rIso}"
                              .iLeak="${this._iLeak}"
                              @rpe-changed="${(e: CustomEvent) => this._rPe = e.detail.value}"
                              @riso-changed="${(e: CustomEvent) => this._rIso = e.detail.value}"
                              @ileak-changed="${(e: CustomEvent) => this._iLeak = e.detail.value}"
                            ></ec-dguv-form>
                          </div>

                          ${this._isLoading ? this._renderSkeleton() : ""}
                          ${this._result && !this._isLoading
                            ? html`
                                <div class="card result-card mt-1">
                                  <h3 class="m-0">✅ ${this._result.deviceName}</h3>
                                  <div class="difficulty-stars">
                                    <span class="stat-label">Schwierigkeit: </span>
                                    ${"★".repeat(
                                      this._result.repairDifficulty || 1,
                                    )}${"☆".repeat(
                                      5 - (this._result.repairDifficulty || 1),
                                    )}
                                  </div>
                                  <p>
                                    <span class="label">Defekt:</span><br />${this._result.identifiedDefect}
                                  </p>
                                  <p>
                                    <span class="label">Empfehlung:</span><br />${this._result.recommendation}
                                  </p>

                                  ${this._result.actionSteps &&
                                  this._result.actionSteps.length > 0
                                    ? html`
                                        <div
                                          style="margin: 1.5rem 0; padding: 1rem; background: var(--bg-app); border-radius: 8px; border: 1px solid var(--border);"
                                        >
                                          <div
                                            style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;"
                                          >
                                            <span
                                              class="label"
                                              style="color: var(--primary);"
                                              >🛠️ Reparatur-Checkliste:</span
                                            >
                                            <span
                                              style="font-size: 0.85rem; font-weight: bold; color: var(--text-muted);"
                                              >${Math.round(
                                                this._getChecklistProgress() * 100,
                                              )}%</span
                                            >
                                          </div>
                                          <vaadin-progress-bar
                                            value="${this._getChecklistProgress()}"
                                            style="margin-bottom: 1rem;"
                                          ></vaadin-progress-bar>
                                          
                                          <vaadin-button
                                            theme="primary success"
                                            class="w-100 mb-1"
                                            style="margin-bottom: 12px;"
                                            @click="${() => { this._guidedRepairStepIndex = 0; }}"
                                            >🛠️ Geführte Reparatur starten (Vorlesen)</vaadin-button
                                          >

                                          <div
                                            style="display: flex; flex-direction: column; gap: 0.5rem;"
                                          >
                                            ${this._result.actionSteps.map(
                                              (step, idx) => html`
                                                <label
                                                  style="display: flex; gap: 12px; align-items: flex-start; cursor: pointer; padding: 10px; background: var(--bg-card); border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); border: 1px solid var(--border); transition: all 0.2s ease;"
                                                >
                                                  <input
                                                    type="checkbox"
                                                    .checked="${step.completed}"
                                                    @change="${(e: Event) =>
                                                      this._toggleChecklistStep(
                                                        idx,
                                                        e,
                                                      )}"
                                                    style="margin-top: 4px; transform: scale(1.2);"
                                                  />
                                                  <span
                                                    style="line-height: 1.4; transition: all 0.2s ease; ${step.completed
                                                      ? "text-decoration: line-through; color: var(--text-muted); opacity: 0.6;"
                                                      : "color: var(--text-primary); font-weight: 500;"}"
                                                  >
                                                    ${step.text}
                                                  </span>
                                                </label>
                                              `,
                                            )}
                                          </div>
                                        </div>
                                      `
                                    : ""}

                                  <ec-dguv-form
                                    .rPe="${this._rPe}"
                                    .rIso="${this._rIso}"
                                    .iLeak="${this._iLeak}"
                                    .isScanning="${this._isLoading && this._isMultimeterCameraOpen}"
                                    @scan-multimeter-requested="${this._handleMultimeterScanRequested}"
                                    @dguv-changed="${(e: CustomEvent) => {
                                      this._rPe = e.detail.rPe;
                                      this._rIso = e.detail.rIso;
                                      this._iLeak = e.detail.iLeak;
                                      this._signatureUrl = e.detail.signatureUrl;
                                      this.requestUpdate();
                                    }}"
                                  ></ec-dguv-form>

                                  ${(this._result as any).location
                                    ? html`
                                        <div class="mt-1">
                                          <span class="label"
                                            >📍 Anlagenstandort:</span
                                          ><br />
                                          ${(this._result as any).location.includes(
                                            "Lat:",
                                          )
                                            ? html`<a
                                                href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                                  (this._result as any).location
                                                    .replace("Lat: ", "")
                                                    .replace(", Lng: ", ","),
                                                )}"
                                                target="_blank"
                                                class="link-primary"
                                                >${(this._result as any).location}</a
                                              >`
                                            : html`<span class="text-danger-small"
                                                >${(this._result as any)
                                                  .location}</span
                                              >`}
                                        </div>
                                      `
                                    : ""}
                                  ${this._result.customerExperience
                                    ? html`<div class="experience-box">
                                        💡
                                        <strong>Techniker-Erfahrung:</strong> ${this._result.customerExperience}
                                      </div>`
                                    : ""}
                                  ${this._result.additionalTips &&
                                  this._result.additionalTips.length > 0
                                    ? html`
                                        <div class="mt-1">
                                          <span class="label">Profi-Tipps:</span>
                                          <ul class="tips-list">
                                            ${this._result.additionalTips.map(
                                              (tip: string) => html`<li>${tip}</li>`,
                                            )}
                                          </ul>
                                        </div>
                                      `
                                    : ""}

                                  <div class="legal-box">
                                    <p class="legal-text">
                                      <strong>⚖️ Rechtlicher Hinweis:</strong><br />
                                      ${(this._result as any).disclaimer ||
                                      this._disclaimerText}
                                    </p>
                                  </div>

                                  <div class="result-actions">
                                    <vaadin-button
                                      theme="secondary"
                                      @click="${this._openPdfPreview}"
                                      >📄 Vorschau</vaadin-button
                                    >
                                    <vaadin-button
                                      theme="primary success"
                                      @click="${this._downloadPdfDirectly}"
                                      >💾 PDF</vaadin-button
                                    >
                                    <vaadin-button
                                      theme="primary"
                                      @click="${this._shareResult}"
                                      >📲 Teilen</vaadin-button
                                    >
                                    <vaadin-button
                                      theme="secondary"
                                      @click="${this._createTicket}"
                                      ?disabled="${this._isTicketCreating}"
                                      >${this._isTicketCreating
                                        ? "⏳..."
                                        : "🎫 Ticket"}</vaadin-button
                                    >
                                    <vaadin-button
                                      theme="secondary"
                                      @click="${this._runPerplexitySearch}"
                                      ?disabled="${this._isSearchingPerplexity || !this._isOnline}"
                                      style="grid-column: span 2;"
                                      >🔍 ${this._isSearchingPerplexity ? "Suche läuft..." : "Perplexity Web-Suche"}</vaadin-button
                                    >
                                  </div>

                                  ${this._perplexityResult
                                    ? html`
                                        <div class="card mt-1" style="border-left: 4px solid var(--primary); text-align: left; background: var(--bg-app); box-shadow: var(--shadow-sm);">
                                          <h4 style="margin: 0 0 8px 0; font-weight: bold; color: var(--primary); display: flex; align-items: center; gap: 6px;">
                                            🌐 Perplexity Web-Recherche:
                                          </h4>
                                          <div style="font-size: 0.85rem; line-height: 1.6; color: var(--text-primary);">
                                            ${unsafeHTML(this._formatMarkdown(this._perplexityResult))}
                                          </div>
                                        </div>
                                      `
                                    : ""}

                                  ${this._result.sparePartSearchTerm
                                    ? html`
                                        <div style="margin-top: 16px; text-align: left;">
                                          <div style="font-size: 0.85rem; font-weight: bold; color: var(--text-secondary); margin-bottom: 6px;">
                                            🛒 Ersatzteil bestellen bei:
                                          </div>
                                          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px;">
                                            <a
                                              href="https://www.amazon.de/s?k=${encodeURIComponent(this._result.sparePartSearchTerm)}"
                                              target="_blank"
                                              class="no-underline"
                                            >
                                              <vaadin-button class="btn-amazon" style="width: 100%;"
                                                >🛒 Amazon</vaadin-button
                                              >
                                            </a>
                                            <a
                                              href="https://www.conrad.de/de/search.html?search=${encodeURIComponent(this._result.sparePartSearchTerm)}"
                                              target="_blank"
                                              class="no-underline"
                                            >
                                              <vaadin-button theme="secondary" style="width: 100%;"
                                                >🏢 Conrad B2B</vaadin-button
                                              >
                                            </a>
                                            <a
                                              href="https://de.rs-online.com/web/c/?searchTerm=${encodeURIComponent(this._result.sparePartSearchTerm)}"
                                              target="_blank"
                                              class="no-underline"
                                            >
                                              <vaadin-button theme="secondary" style="width: 100%;"
                                                >🔧 RS Components</vaadin-button
                                              >
                                            </a>
                                            <a
                                              href="https://www.reichelt.de/de/de/index.html?ACTION=446&LA=4&q=${encodeURIComponent(this._result.sparePartSearchTerm)}"
                                              target="_blank"
                                              class="no-underline"
                                            >
                                              <vaadin-button theme="secondary" style="width: 100%;"
                                                >🔌 Reichelt</vaadin-button
                                              >
                                            </a>
                                            <a
                                              href="https://www.mercateo.com/q?query=${encodeURIComponent(this._result.sparePartSearchTerm)}"
                                              target="_blank"
                                              class="no-underline"
                                            >
                                              <vaadin-button theme="secondary" style="width: 100%;"
                                                >📦 Mercateo</vaadin-button
                                              >
                                            </a>
                                          </div>
                                        </div>
                                      `
                                    : ""}
                                </div>
                              `
                            : ""}

                          ${this._ocrResult && !this._isLoading
                            ? html`
                                <div class="card ocr-card mt-1">
                                  <h3 class="m-0">
                                    🔍 ${this._ocrResult.componentName}
                                  </h3>
                                  <p>${this._ocrResult.extractedText}</p>
                                  
                                  <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px;">
                                    <a
                                      href="${this._ocrResult.datasheetSearchUrl}"
                                      target="_blank"
                                      class="no-underline"
                                      style="flex: 1; min-width: 120px;"
                                    >
                                      <vaadin-button theme="secondary" style="width: 100%;"
                                        >🌐 Datenblatt suchen</vaadin-button
                                      >
                                    </a>
                                    
                                    ${this._offlineDatasheetMatch
                                      ? html`
                                          <vaadin-button
                                            theme="primary success"
                                            @click="${this._openOfflineDatasheet}"
                                            style="flex: 1; min-width: 120px;"
                                          >
                                            📄 Offline-Datenblatt öffnen
                                          </vaadin-button>
                                        `
                                      : ""}
                                  </div>
                                </div>
                              `
                            : ""}

                          ${this._history.length > 0
                            ? html`
                                <div class="history-section mt-1-5">
                                  <div class="history-header">
                                    🗂️ Letzte Diagnosen
                                  </div>
                                  ${this._history.map(
                                    (h) => html`
                                      <div
                                        class="history-item"
                                        @click="${() => { this._result = h; this._perplexityResult = null; if (h.boundingBoxes && h.boundingBoxes.length > 0) { this.updateComplete.then(() => this._drawAIBoundingBoxes()); } }}"
                                      >
                                        <span class="history-title"
                                          >${h.deviceName}</span
                                        >
                                        <span class="history-defect"
                                          >${h.identifiedDefect}</span
                                        >
                                      </div>
                                    `,
                                  )}
                                </div>
                              `
                            : ""}
                        `}
                  `}
            `}
        
        ${this._renderFooter()}

        ${this._pdfPreviewUrl
          ? html`
              <div class="modal-overlay">
                <div class="card pdf-modal-card">
                  <h3 class="m-0">📄 PDF Protokoll Vorschau</h3>
                  <iframe src="${this._pdfPreviewUrl}" class="pdf-iframe"></iframe>
                  <div class="modal-actions">
                    <vaadin-button
                      theme="primary"
                      @click="${() => {
                        URL.revokeObjectURL(this._pdfPreviewUrl!);
                        this._pdfPreviewUrl = null;
                      }}"
                      >Schließen</vaadin-button
                    >
                  </div>
                </div>
              </div>
            `
          : ""}

        ${this._isSettingsOpen
          ? html`
              <ec-settings
                .apiKey="${this._apiKey}"
                .perplexityApiKey="${this._perplexityApiKey}"
                .backendUrl="${this._backendUrl}"
                .accessibleMode="${this._accessibleMode}"
                .inspectorName="${this._inspectorName}"
                .inspectorCompany="${this._inspectorCompany}"
                .inspectorId="${this._inspectorId}"
                @close="${() => (this._isSettingsOpen = false)}"
                @save-settings="${this._handleSaveSettings}"
                @accessible-changed="${this._handleAccessibleChanged}"
                @export-data="${this._exportData}"
                @delete-data="${this._deleteData}"
              ></ec-settings>
            `
          : ""}

        ${this._isMultimeterCameraOpen
          ? html`
              <div class="modal-overlay">
                <div class="card" style="max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto;">
                  <h3 class="m-0" style="margin-bottom: 8px;">📸 Multimeter-Scan</h3>
                  <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px;">
                    Zentrieren Sie die Messwertanzeige des Multimeters auf dem Bildschirm. Die KI versucht den Wert automatisch abzulesen.
                  </p>
                  <ec-camera-capture
                    .isLoading="${this._isLoading}"
                    @photo-captured="${this._handleMultimeterPhotoCaptured}"
                    @camera-stopped="${() => (this._isMultimeterCameraOpen = false)}"
                  ></ec-camera-capture>
                  <div class="modal-actions" style="margin-top: 12px; justify-content: flex-end;">
                    <vaadin-button
                      theme="tertiary"
                      @click="${() => (this._isMultimeterCameraOpen = false)}"
                      >Schließen</vaadin-button
                    >
                  </div>
                </div>
              </div>
            `
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

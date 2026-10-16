import { withAccessToken } from "../utils/auth-headers";
import { fetchWithTimeout, GEMINI_TIMEOUT_MS } from "../utils/fetch-timeout";
import { DiagnosisResult, MultimeterReading, SchematicAnalysisResult, ThermalAnalysisResult, TypePlateResult } from "./ai-types";

export class GeminiAIService {
  private defaultBackendUrl: string;

  constructor(backendUrl: string = "") {
    this.defaultBackendUrl = backendUrl;
  }

  private _getBackendUrl(): string {
    const savedUrl = localStorage.getItem("electrocheck_backend_url");
    return savedUrl ? savedUrl.trim() : this.defaultBackendUrl;
  }

  private _getHeaders(requestId?: string): HeadersInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-request-id": requestId || 'req-' + Math.random().toString(36).substring(2, 11)
    };
    const savedApiKey = localStorage.getItem("electrocheck_gemini_api_key");
    if (savedApiKey) {
      headers["x-gemini-api-key"] = savedApiKey;
    }
    return withAccessToken(headers);
  }

  private async fetchWithRetry(url: string, options: RequestInit, retries = 3, delay = 1000): Promise<Response> {
    try {
      const response = await fetchWithTimeout(url, options, GEMINI_TIMEOUT_MS);
      if (!response.ok && response.status >= 500 && retries > 0 && !options.signal?.aborted) {
        console.warn(`API-Anfrage fehlgeschlagen (${response.status}). Versuche erneut in ${delay}ms... (${retries} Versuche übrig)`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      return response;
    } catch (error) {
      // Abbruch durch den Nutzer und Zeitüberschreitung nicht wiederholen (sonst Minuten Wartezeit)
      if (error instanceof DOMException && error.name === 'AbortError') throw error;
      if (error instanceof Error && error.name === 'TimeoutError') throw error;
      if (retries > 0) {
        console.warn(`Netzwerkfehler: ${error}. Versuche erneut in ${delay}ms... (${retries} Versuche übrig)`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  async getDiagnosis(
    imageBase64: string | null,
    description: string,
    signal?: AbortSignal,
  ): Promise<DiagnosisResult> {
    const backendUrl = this._getBackendUrl();
    const response = await this.fetchWithRetry(`${backendUrl}/api/gemini/diagnosis`, {
      method: "POST",
      headers: this._getHeaders(),
      body: JSON.stringify({ imageBase64, description }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Fehler bei der Diagnoseanfrage über den Proxy.",
      );
    }
    try {
      const data = await response.json();
      return data as DiagnosisResult;
    } catch (error) {
      console.error("Fehler beim Parsen der Diagnoseantwort:", error);
      throw new Error(
        "Diagnose fehlgeschlagen. Ungültige Antwort vom Server.",
      );
    }
  }

  async scanTypePlate(imageBase64: string): Promise<TypePlateResult> {
    const backendUrl = this._getBackendUrl();
    const payload = {
      imageBase64,
    };

    const response = await this.fetchWithRetry(`${backendUrl}/api/gemini/scan-type-plate`, {
      method: "POST",
      headers: this._getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "API Fehler beim Scannen des Typenschilds über den Proxy.",
      );
    }
    try {
      const data = await response.json();
      return data as TypePlateResult;
    } catch (error) {
      console.error("Fehler beim Parsen der OCR-Antwort:", error);
      throw new Error(
        "OCR-Scan fehlgeschlagen. Ungültige Antwort vom Server.",
      );
    }
  }

  async analyzeThermalImage(
    imageBase64: string,
    description: string,
  ): Promise<ThermalAnalysisResult> {
    const backendUrl = this._getBackendUrl();
    const response = await this.fetchWithRetry(`${backendUrl}/api/gemini/thermal-analysis`, {
      method: "POST",
      headers: this._getHeaders(),
      body: JSON.stringify({ imageBase64, description }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Fehler bei der thermografischen Analyse über den Proxy.",
      );
    }
    try {
      const data = await response.json();
      return data as ThermalAnalysisResult;
    } catch (error) {
      console.error("Fehler beim Parsen der Thermografie-Antwort:", error);
      throw new Error(
        "Wärmebild-Analyse fehlgeschlagen. Ungültige Antwort vom Server.",
      );
    }
  }

  async analyzeThermal(
    imageBase64: string,
    description: string,
  ): Promise<ThermalAnalysisResult> {
    return this.analyzeThermalImage(imageBase64, description);
  }

  async analyzeSchematic(
    imageBase64: string,
    notes?: string,
  ): Promise<SchematicAnalysisResult> {
    const backendUrl = this._getBackendUrl();
    const response = await this.fetchWithRetry(`${backendUrl}/api/gemini/schematic-analysis`, {
      method: "POST",
      headers: this._getHeaders(),
      body: JSON.stringify({ imageBase64, notes }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Fehler bei der Schaltplan-Analyse über den Proxy.",
      );
    }
    try {
      const data = await response.json();
      return data as SchematicAnalysisResult;
    } catch (error) {
      console.error("Fehler beim Parsen der Schaltplan-Antwort:", error);
      throw new Error(
        "Schaltplan-Analyse fehlgeschlagen. Ungültige Antwort vom Server.",
      );
    }
  }

  async scanMultimeter(imageBase64: string): Promise<MultimeterReading> {
    const backendUrl = this._getBackendUrl();
    const response = await this.fetchWithRetry(`${backendUrl}/api/gemini/scan-multimeter`, {
      method: "POST",
      headers: this._getHeaders(),
      body: JSON.stringify({ imageBase64 }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Fehler beim Ablesen des Multimeters über den Proxy.",
      );
    }
    try {
      const data = await response.json();
      return data as MultimeterReading;
    } catch (error) {
      console.error("Fehler beim Parsen der Multimeter-Antwort:", error);
      throw new Error(
        "Multimeter-Ablesung fehlgeschlagen. Ungültige Antwort vom Server.",
      );
    }
  }

  /** Transkribiert eine Sprachnotiz (Audio-Blob) in deutschen Text. */
  async transcribeAudio(audio: Blob): Promise<string> {
    const audioBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(audio);
    });

    const response = await this.fetchWithRetry(`${this._getBackendUrl()}/api/gemini/transcribe`, {
      method: "POST",
      headers: this._getHeaders(),
      body: JSON.stringify({ audioBase64 }),
    });
    if (!response.ok) throw new Error("Transkriptionsanfrage fehlgeschlagen.");

    const data = await response.json();
    return typeof data.text === "string" ? data.text : "";
  }

  async sendChatMessage(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    context?: { deviceName?: string; identifiedDefect?: string; recommendation?: string },
    signal?: AbortSignal
  ): Promise<string> {
    const backendUrl = this._getBackendUrl();
    const response = await this.fetchWithRetry(`${backendUrl}/api/gemini/chat`, {
      method: "POST",
      headers: this._getHeaders(),
      body: JSON.stringify({ messages, context }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Fehler beim KI-Chat über den Proxy.",
      );
    }
    const data = await response.json();
    return data.reply || "";
  }
}




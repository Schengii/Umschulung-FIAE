import { DiagnosisResult, ThermalAnalysisResult } from "./ai-types";

export class GeminiAIService {
  private defaultBackendUrl: string;

  constructor(backendUrl: string = "http://localhost:3000") {
    this.defaultBackendUrl = backendUrl;
  }

  private _getBackendUrl(): string {
    const savedUrl = localStorage.getItem("electrocheck_backend_url");
    return savedUrl ? savedUrl.trim() : this.defaultBackendUrl;
  }

  private _getHeaders(requestId?: string): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "x-request-id": requestId || 'req-' + Math.random().toString(36).substring(2, 11)
    };
    const savedApiKey = localStorage.getItem("electrocheck_gemini_api_key");
    if (savedApiKey) {
      headers["x-gemini-api-key"] = savedApiKey;
    }
    return headers;
  }

  private async fetchWithRetry(url: string, options: RequestInit, retries = 3, delay = 1000): Promise<Response> {
    try {
      const response = await fetch(url, options);
      if (!response.ok && response.status >= 500 && retries > 0) {
        console.warn(`API-Anfrage fehlgeschlagen (${response.status}). Versuche erneut in ${delay}ms... (${retries} Versuche übrig)`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      return response;
    } catch (error) {
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
  ): Promise<DiagnosisResult> {
    const backendUrl = this._getBackendUrl();
    const response = await this.fetchWithRetry(`${backendUrl}/api/gemini/diagnosis`, {
      method: "POST",
      headers: this._getHeaders(),
      body: JSON.stringify({ imageBase64, description }),
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

  async scanTypePlate(imageBase64: string) {
    const backendUrl = this._getBackendUrl();
    const payload = {
      imageBase64,
    };

    const response = await this.fetchWithRetry(`${backendUrl}/api/gemini/scanTypePlate`, {
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
      return data;
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

  async scanMultimeter(imageBase64: string): Promise<{ value: number | null; unit: string }> {
    const backendUrl = this._getBackendUrl();
    const response = await this.fetchWithRetry(`${backendUrl}/api/gemini/scanMultimeter`, {
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
      return data as { value: number | null; unit: string };
    } catch (error) {
      console.error("Fehler beim Parsen der Multimeter-Antwort:", error);
      throw new Error(
        "Multimeter-Ablesung fehlgeschlagen. Ungültige Antwort vom Server.",
      );
    }
  }
}



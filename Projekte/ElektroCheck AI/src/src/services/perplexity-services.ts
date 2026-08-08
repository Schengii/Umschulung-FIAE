export class PerplexityService {
  private defaultBackendUrl: string;

  constructor(backendUrl: string = "http://localhost:3000") {
    this.defaultBackendUrl = backendUrl;
  }

  private _getBackendUrl(): string {
    const savedUrl = localStorage.getItem("electrocheck_backend_url");
    return savedUrl ? savedUrl.trim() : this.defaultBackendUrl;
  }

  private _getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    const savedApiKey = localStorage.getItem("electrocheck_perplexity_api_key");
    if (savedApiKey) {
      headers["x-perplexity-api-key"] = savedApiKey;
    }
    return headers;
  }

  async search(query: string): Promise<string> {
    const backendUrl = this._getBackendUrl();
    const response = await fetch(`${backendUrl}/api/perplexity/search`, {
      method: "POST",
      headers: this._getHeaders(),
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Fehler bei der Perplexity-Suche über das Backend."
      );
    }

    try {
      const data = await response.json();
      return data.answer;
    } catch (error) {
      console.error("Fehler beim Parsen der Perplexity-Antwort:", error);
      throw new Error("Suche fehlgeschlagen. Ungültige Antwort vom Server.");
    }
  }
}

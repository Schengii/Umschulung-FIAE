/**
 * Zugriff auf Yahoo Finance über den EIGENEN Proxy (`api/yahoo.ts` auf Vercel).
 * Es wird bewusst kein Drittanbieter-CORS-Proxy mehr verwendet, damit Ticker/ISINs
 * (= Depotinhalt) nicht an fremde Server gehen.
 *
 * Konfiguration über `VITE_MARKET_PROXY_URL`:
 *   - leer      -> same-origin `/api/yahoo` (funktioniert auf Vercel)
 *   - eigene URL -> z. B. Proxy-Endpoint bei GitHub-Pages-Betrieb
 *   - `off`     -> keine Proxy-Abrufe (nur Finnhub/CoinGecko/lokale Daten)
 */
export function getMarketProxyBase(): string | null {
  const configured = import.meta.env.VITE_MARKET_PROXY_URL?.trim();
  if (configured === 'off') return null;
  return configured || '/api/yahoo';
}

export function yahooChartProxyUrl(ticker: string): string | null {
  const base = getMarketProxyBase();
  if (!base) return null;
  return `${base}?kind=chart&symbol=${encodeURIComponent(ticker)}`;
}

export function yahooSearchProxyUrl(query: string): string | null {
  const base = getMarketProxyBase();
  if (!base) return null;
  return `${base}?kind=search&q=${encodeURIComponent(query)}`;
}

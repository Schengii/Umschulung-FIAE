/**
 * Eigener, eng begrenzter Kurs-Proxy für Vercel (ersetzt den Drittanbieter corsproxy.io).
 *
 * Erlaubt ausschließlich zwei Yahoo-Finance-Abfragen:
 *   GET /api/yahoo?kind=chart&symbol=AAPL
 *   GET /api/yahoo?kind=search&q=US0378331005
 *
 * Es werden keine Cookies/Header des Browsers weitergereicht und nichts gespeichert.
 */

const SYMBOL_RE = /^[A-Za-z0-9.\-^=]{1,20}$/;
const QUERY_RE = /^[A-Za-z0-9 .\-]{1,40}$/;

export function buildUpstreamUrl(params: URLSearchParams): string | null {
  const kind = params.get('kind');
  if (kind === 'chart') {
    const symbol = params.get('symbol') ?? '';
    if (!SYMBOL_RE.test(symbol)) return null;
    return `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d`;
  }
  if (kind === 'search') {
    const q = params.get('q') ?? '';
    if (!QUERY_RE.test(q)) return null;
    return `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=1&newsCount=0`;
  }
  return null;
}

export async function GET(request: Request): Promise<Response> {
  const upstream = buildUpstreamUrl(new URL(request.url).searchParams);
  if (!upstream) {
    return new Response(JSON.stringify({ error: 'invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const res = await fetch(upstream, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FinanzPortfolio-Proxy)' },
      signal: AbortSignal.timeout(8000)
    });
    return new Response(await res.text(), {
      status: res.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  } catch {
    return new Response(JSON.stringify({ error: 'upstream unavailable' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

const FX_API_URL = 'https://open.er-api.com/v6/latest/EUR';
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,cardano,solana,ripple&vs_currencies=eur,usd';

export async function fetchLiveExchangeRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch(FX_API_URL);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    if (data && data.rates) {
      return {
        EUR: 1.0,
        USD: data.rates.USD || 1.08,
        CHF: data.rates.CHF || 0.96,
        GBP: data.rates.GBP || 0.85
      };
    }
  } catch (e) {
    console.warn('Failed to fetch live FX rates, using fallback:', e);
  }
  return {
    EUR: 1.0,
    USD: 1.08,
    CHF: 0.96,
    GBP: 0.85
  };
}

const CRYPTO_TICKER_MAP: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  ADA: 'cardano',
  SOL: 'solana',
  XRP: 'ripple'
};

export async function fetchLiveCryptoPrices(): Promise<Record<string, number>> {
  try {
    const res = await fetch(COINGECKO_API_URL);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    
    const prices: Record<string, number> = {};
    Object.entries(CRYPTO_TICKER_MAP).forEach(([ticker, id]) => {
      if (data[id] && data[id].eur) {
        prices[ticker] = data[id].eur;
      }
    });
    return prices;
  } catch (e) {
    console.warn('Failed to fetch live Crypto prices from CoinGecko:', e);
    return {};
  }
}

export async function fetchLiveStockPrices(tickers: string[]): Promise<Record<string, number>> {
  const fetchedPrices: Record<string, number> = {};

  for (const ticker of tickers) {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        const meta = json?.chart?.result?.[0]?.meta;
        if (meta && meta.regularMarketPrice) {
          fetchedPrices[ticker] = meta.regularMarketPrice;
        }
      }
    } catch {
      // CORS or network fallback
    }
  }

  return fetchedPrices;
}

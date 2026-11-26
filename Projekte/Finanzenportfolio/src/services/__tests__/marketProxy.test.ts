import { describe, it, expect } from 'vitest';
import { buildUpstreamUrl } from '../../../api/yahoo';
import { yahooChartProxyUrl, yahooSearchProxyUrl, getMarketProxyBase } from '../marketProxy';

const q = (s: string) => new URLSearchParams(s);

describe('api/yahoo Allowlist', () => {
  it('erlaubt Chart-Abfragen mit gültigem Symbol', () => {
    expect(buildUpstreamUrl(q('kind=chart&symbol=AAPL'))).toBe(
      'https://query1.finance.yahoo.com/v8/finance/chart/AAPL?interval=1d'
    );
    expect(buildUpstreamUrl(q('kind=chart&symbol=BRK-B'))).toContain('BRK-B');
    expect(buildUpstreamUrl(q('kind=chart&symbol=%5EGSPC'))).toContain('%5EGSPC');
  });

  it('erlaubt Suche nach ISIN', () => {
    expect(buildUpstreamUrl(q('kind=search&q=US0378331005'))).toContain('search?q=US0378331005');
  });

  it('lehnt Path-Traversal, fremde Hosts und Sonderzeichen ab', () => {
    expect(buildUpstreamUrl(q('kind=chart&symbol=../../etc/passwd'))).toBeNull();
    expect(buildUpstreamUrl(q('kind=chart&symbol=AAPL%3Fx%3D1'))).toBeNull();
    expect(buildUpstreamUrl(q('kind=chart&symbol=a/b'))).toBeNull();
    expect(buildUpstreamUrl(q('kind=search&q=a%26b%3Dc'))).toBeNull();
    expect(buildUpstreamUrl(q('kind=chart'))).toBeNull();
  });

  it('lehnt unbekannte Arten und überlange Eingaben ab', () => {
    expect(buildUpstreamUrl(q('kind=quote&symbol=AAPL'))).toBeNull();
    expect(buildUpstreamUrl(q('symbol=AAPL'))).toBeNull();
    expect(buildUpstreamUrl(q(`kind=chart&symbol=${'A'.repeat(21)}`))).toBeNull();
  });
});

describe('marketProxy (Client)', () => {
  it('verwendet standardmäßig den same-origin Proxy und nie corsproxy.io', () => {
    const base = getMarketProxyBase();
    expect(base).toBeTruthy();
    expect(yahooChartProxyUrl('AAPL')).toBe(`${base}?kind=chart&symbol=AAPL`);
    expect(yahooSearchProxyUrl('US0378331005')).not.toContain('corsproxy');
    expect(yahooChartProxyUrl('AAPL')).not.toContain('corsproxy');
  });
});

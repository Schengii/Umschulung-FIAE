/**
 * Generiert einen RSS 2.0 XML-Feed für Home Assistant, Apple Shortcuts oder RSS-Reader.
 */
export function generateRssFeed(listings, profileName = 'Wohnungssuche KI') {
  const sorted = [...listings].sort((a, b) => new Date(b.scrapedAt || 0) - new Date(a.scrapedAt || 0));

  const itemsXml = sorted.map(l => `
    <item>
      <title><![CDATA[${l.matchScore ? `[${l.matchScore}%]` : ''} ${l.title || 'Mietwohnung'}]]></title>
      <link>${l.url || 'http://localhost:5173'}</link>
      <guid isPermaLink="false">${l.id}</guid>
      <pubDate>${new Date(l.scrapedAt || Date.now()).toUTCString()}</pubDate>
      <description><![CDATA[
        <p><strong>Miete:</strong> ${l.priceWarm || l.priceKalt || 0} € | <strong>Größe:</strong> ${l.sqm || 0} m² | <strong>Zimmer:</strong> ${l.rooms || 0}</p>
        <p><strong>Ort:</strong> ${l.location || 'N/A'}</p>
        <p><strong>KI-Fazit:</strong> ${l.matchSummary || 'Keine Zusammenfassung'}</p>
      ]]></description>
    </item>
  `).join('\n');

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title><![CDATA[${profileName} - Wohnungssuche KI Feed]]></title>
  <link>http://localhost:5173</link>
  <description>Automatischer RSS-Feed für neu gefundene Wohnungsangebote</description>
  <language>de-DE</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  ${itemsXml}
</channel>
</rss>`;
}

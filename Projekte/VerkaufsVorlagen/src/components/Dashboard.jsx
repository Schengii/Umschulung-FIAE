import React from 'react';
import { Download, Printer } from 'lucide-react';

export default function Dashboard({ history }) {
  const soldItems = history.filter(item => item.saleDetails?.isSold);
  const totalRevenue = soldItems.reduce((acc, item) => acc + (item.saleDetails?.soldPrice || 0), 0);
  const totalFees = soldItems.reduce((acc, item) => acc + (item.saleDetails?.platformFees || 0) + (item.saleDetails?.shippingCost || 0), 0);
  const netProfit = totalRevenue - totalFees;
  
  const itemsWithPurchasePrice = soldItems.filter(item => item.purchaseDetails?.originalPrice > 0);
  const totalOriginalPrice = itemsWithPurchasePrice.reduce((acc, item) => acc + item.purchaseDetails.originalPrice, 0);
  const totalRecoveredSoldPrice = itemsWithPurchasePrice.reduce((acc, item) => acc + item.saleDetails.soldPrice, 0);
  const recoveryRate = totalOriginalPrice > 0 ? Math.round((totalRecoveredSoldPrice / totalOriginalPrice) * 100) : 0;

  // Calculate average selling time in days
  const itemsWithSellingTime = soldItems.filter(item => item.createdAt && item.saleDetails?.soldDate);
  let averageSellingDays = 'N/A';
  if (itemsWithSellingTime.length > 0) {
    const totalDays = itemsWithSellingTime.reduce((acc, item) => {
      const created = new Date(item.createdAt);
      const parts = item.saleDetails.soldDate.split('.');
      let sold;
      if (parts.length === 3) {
        sold = new Date(parts[2], parts[1] - 1, parts[0]);
      } else {
        sold = new Date(item.saleDetails.soldDate);
      }
      const diffTime = Math.abs(sold - created);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return acc + diffDays;
    }, 0);
    averageSellingDays = `${Math.round(totalDays / itemsWithSellingTime.length)} Tage`;
  }
  
  // Platform metrics
  const platformRevenue = soldItems.reduce((acc, item) => {
    const plat = item.saleDetails.soldPlatform || 'andere';
    acc[plat] = (acc[plat] || 0) + item.saleDetails.soldPrice;
    return acc;
  }, {});

  const maxPlatformRev = Math.max(1, ...Object.values(platformRevenue));

  const handleExportCSV = () => {
    if (soldItems.length === 0) return;
    
    // CSV headers
    const headers = ['Artikel', 'Plattform', 'Verkaufsdatum', 'Neupreis (€)', 'Verkaufspreis (€)', 'Plattformgebühren (€)', 'Versandkosten (€)', 'Netto-Gewinn (€)'];
    
    // CSV rows
    const rows = soldItems.map(item => {
      const net = (item.saleDetails.soldPrice - item.saleDetails.platformFees - item.saleDetails.shippingCost).toFixed(2);
      return [
        `"${item.name.replace(/"/g, '""')}"`,
        item.saleDetails.soldPlatform,
        item.saleDetails.soldDate,
        item.purchaseDetails?.originalPrice || '',
        item.saleDetails.soldPrice,
        item.saleDetails.platformFees,
        item.saleDetails.shippingCost,
        net
      ];
    });
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' }); // UTF-8 BOM
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `listerai_verkaeufe_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReceipt = (item) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Get disclaimer text based on disclaimer type
    let disclaimerText = 'Der Verkauf erfolgt unter Ausschluss jeglicher Sachmängelhaftung.';
    if (item.disclaimer === 'erweitert') {
      disclaimerText = 'Da es sich um einen Privatverkauf handelt, schließe ich jegliche Garantie, Gewährleistung und Rücknahme aus.';
    } else if (item.disclaimer === 'elektronik') {
      disclaimerText = 'Hinweis zum EU-Recht: Dies ist ein Privatverkauf. Der Artikel wird verkauft wie beschrieben und abgebildet. Eine Rücknahme, Gewährleistung oder Garantie wird ausgeschlossen.';
    } else if (item.disclaimer === 'kein') {
      disclaimerText = 'Privatverkauf. Keine Gewährleistung.';
    }

    const netProfitItem = (item.saleDetails.soldPrice - item.saleDetails.platformFees - item.saleDetails.shippingCost).toFixed(2);

    printWindow.document.write(`
      <html>
        <head>
          <title>Private Kaufquittung - ${item.name}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #333;
              padding: 40px;
              line-height: 1.6;
              max-width: 700px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 0 0 10px 0;
              font-size: 24px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .header p {
              margin: 0;
              color: #666;
              font-size: 14px;
            }
            .details-table {
              width: 100%;
              border-collapse: collapse;
              margin: 30px 0;
            }
            .details-table th, .details-table td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            .details-table th {
              background-color: #f9f9f9;
            }
            .total-row {
              font-weight: bold;
              font-size: 16px;
              background-color: #f5f5f5;
            }
            .section {
              margin-bottom: 25px;
            }
            .section h3 {
              border-bottom: 1px solid #eee;
              padding-bottom: 5px;
              margin-bottom: 10px;
              font-size: 16px;
            }
            .signatures {
              display: flex;
              justify-content: space-between;
              margin-top: 60px;
            }
            .signature-box {
              width: 45%;
              border-top: 1px solid #333;
              text-align: center;
              padding-top: 10px;
              font-size: 14px;
            }
            .disclaimer {
              font-style: italic;
              font-size: 12px;
              color: #555;
              background: #f9f9f9;
              padding: 15px;
              border-left: 3px solid #ccc;
              margin-top: 30px;
            }
            @media print {
              body {
                padding: 20px;
              }
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div style="text-align: right; margin-bottom: 20px;">
            <button onclick="window.print()" style="padding: 8px 16px; background-color: #333; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">Drucken / PDF speichern</button>
          </div>
          
          <div class="header">
            <h1>Private Kaufquittung</h1>
            <p>Eigentumsnachweis für Gebrauchtwarenkauf von Privat an Privat</p>
          </div>

          <div class="section">
            <table style="width:100%; margin-bottom: 20px;">
              <tr>
                <td style="border:none; padding: 0; width: 50%;">
                  <strong>Verkäufer (Privat):</strong><br/>
                  Name: ____________________________<br/>
                  Straße: ___________________________<br/>
                  Ort: _____________________________<br/>
                </td>
                <td style="border:none; padding: 0; width: 50%;">
                  <strong>Käufer (Privat):</strong><br/>
                  Name: ____________________________<br/>
                  Straße: ___________________________<br/>
                  Ort: _____________________________<br/>
                </td>
              </tr>
            </table>
          </div>

          <table class="details-table">
            <thead>
              <tr>
                <th>Gegenstand / Artikel</th>
                <th>Plattform</th>
                <th>Kaufdatum</th>
                <th style="text-align: right;">Betrag</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${item.name}</strong></td>
                <td>${item.saleDetails.soldPlatform}</td>
                <td>${item.saleDetails.soldDate}</td>
                <td style="text-align: right;">${item.saleDetails.soldPrice.toFixed(2)} €</td>
              </tr>
              <tr>
                <td colspan="3" style="text-align: right; color: #666;">Abzüglich Versand/Porto (falls inkl.)</td>
                <td style="text-align: right; color: #666;">-${item.saleDetails.shippingCost.toFixed(2)} €</td>
              </tr>
              <tr class="total-row">
                <td colspan="3" style="text-align: right;">Erhaltene Nettosumme (Bar/Überweisung)</td>
                <td style="text-align: right;">${netProfitItem} €</td>
              </tr>
            </tbody>
          </table>

          <div class="section">
            <strong>Rechtlicher Hinweis & Gewährleistung:</strong>
            <div class="disclaimer">
              ${disclaimerText}
            </div>
          </div>

          <p style="font-size: 13px; color: #666; margin-top: 30px;">
            Der Verkäufer bestätigt hiermit den Erhalt des oben genannten Betrags. Der Käufer bestätigt die Übergabe / den Versand des beschriebenen Artikels in ordnungsgemäßem Zustand.
          </p>

          <div class="signatures">
            <div class="signature-box">
              Ort, Datum, Unterschrift Verkäufer
            </div>
            <div class="signature-box">
              Ort, Datum, Unterschrift Käufer
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ textAlign: 'left' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>Verkaufs-Statistiken</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Verwalte deine Einnahmen und Verkäufe auf einen Blick.</p>
        </div>
        
        {soldItems.length > 0 && (
          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ padding: '8px 16px', gap: '6px', fontSize: '0.85rem' }} 
            onClick={handleExportCSV}
          >
            <Download size={14} />
            Exportieren (CSV)
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gesamtumsatz</span>
          <strong style={{ fontSize: '1.8rem', color: '#fff' }}>{totalRevenue.toFixed(2)} €</strong>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>aus {soldItems.length} Verkäufen</span>
        </div>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gebühren & Versand</span>
          <strong style={{ fontSize: '1.8rem', color: 'var(--accent-rose)' }}>{totalFees.toFixed(2)} €</strong>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Plattformgebühren + Porto</span>
        </div>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Netto Einnahmen</span>
          <strong style={{ fontSize: '1.8rem', color: 'var(--accent-emerald)' }}>{netProfit.toFixed(2)} €</strong>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Umsatz abzgl. Kosten</span>
        </div>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Wertrückgewinnung</span>
          <strong style={{ fontSize: '1.8rem', color: 'var(--accent-amber)' }}>{recoveryRate}%</strong>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Verkaufspreis vs. Neupreis</span>
        </div>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Verkaufszeit Ø</span>
          <strong style={{ fontSize: '1.8rem', color: 'var(--primary)' }}>{averageSellingDays}</strong>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Dauer bis zum Verkauf</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '12px' }}>
        {/* Verkaufsliste */}
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'left' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Verkaufte Artikel</h3>
          {soldItems.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '32px 0' }}>
              Bisher wurden keine Artikel als verkauft markiert.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px' }}>Artikel</th>
                    <th style={{ padding: '10px' }}>Plattform</th>
                    <th style={{ padding: '10px' }}>Datum</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Kosten</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Erlös</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {soldItems.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '12px 10px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
                        <img src={item.image} alt="" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }} />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{item.name}</span>
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <span className={`comparison-platform comp-${item.saleDetails.soldPlatform}`}>
                          {item.saleDetails.soldPlatform}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>{item.saleDetails.soldDate}</td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', color: 'var(--accent-rose)' }}>
                        -{(item.saleDetails.platformFees + item.saleDetails.shippingCost).toFixed(2)} €
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                        {item.saleDetails.soldPrice.toFixed(2)} €
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem', gap: '4px' }}
                          onClick={() => handlePrintReceipt(item)}
                          title="Private Kaufquittung drucken"
                        >
                          <Printer size={12} />
                          Quittung
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Plattformen Chart */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Umsatz nach Plattform</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {['kleinanzeigen', 'ebay', 'vinted', 'andere'].map((plat) => {
              const rev = platformRevenue[plat] || 0;
              const pct = maxPlatformRev > 0 ? (rev / maxPlatformRev) * 100 : 0;
              return (
                <div key={plat} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{plat}</span>
                    <span>{rev.toFixed(2)} €</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div 
                      className={`comp-${plat}`}
                      style={{ 
                        width: `${pct}%`, 
                        height: '100%', 
                        borderRadius: '4px',
                        transition: 'width 0.5s ease-in-out'
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

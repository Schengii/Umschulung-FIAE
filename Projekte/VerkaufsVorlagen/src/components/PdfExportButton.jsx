import React from 'react';
import html2pdf from 'html2pdf.js';

export default function PdfExportButton({ currentItem }) {
  const handleExport = () => {
    // Create an off-screen print container dynamically
    const element = document.createElement('div');
    element.className = 'print-pdf-document';
    element.style.padding = '30px';
    element.style.fontFamily = 'Outfit, Arial, sans-serif';
    element.style.color = '#1f2937';
    element.style.background = '#ffffff';

    const title = currentItem.name || 'Neue Anzeige';
    const price = currentItem.suggestedPrice ? `${currentItem.suggestedPrice} €` : 'N/A';
    const minPrice = currentItem.minimumPrice ? `${currentItem.minimumPrice} €` : 'N/A';
    const condition = currentItem.condition || 'Gut';
    const functionality = currentItem.functionality || 'Keine Angaben';
    const shipping = currentItem.shippingMethod || 'Nur Abholung';
    const payment = currentItem.paymentMethod || 'Keine Angaben';
    const description = currentItem.description || 'Keine Beschreibung vorhanden.';
    const utility = currentItem.utility || '';
    const tags = currentItem.tags || '';

    let warrantyInfoHTML = '';
    if (currentItem.purchaseDetails) {
      const expiry = new Date(currentItem.purchaseDetails.warrantyUntil);
      warrantyInfoHTML = `
        <div style="margin-top: 15px; padding: 12px; background: #f3f4f6; border-radius: 8px; border: 1px solid #e5e7eb;">
          <h4 style="margin: 0 0 6px 0; color: #111827; font-size: 0.95rem;">📄 Kaufbeleg & Restgarantie</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.85rem; color: #4b5563;">
            <div><strong>Händler:</strong> ${currentItem.purchaseDetails.merchant}</div>
            <div><strong>Neupreis:</strong> ${currentItem.purchaseDetails.originalPrice.toFixed(2)} €</div>
            <div><strong>Kaufdatum:</strong> ${new Date(currentItem.purchaseDetails.purchaseDate).toLocaleDateString()}</div>
            <div><strong>Garantie bis:</strong> ${expiry.toLocaleDateString()}</div>
          </div>
        </div>
      `;
    }

    element.innerHTML = `
      <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 style="margin: 0; font-size: 1.6rem; color: #1e3a8a;">ListerAI Verkaufs-Datenblatt</h1>
          <p style="margin: 3px 0 0 0; font-size: 0.85rem; color: #6b7280;">Erstellt am ${new Date().toLocaleDateString()}</p>
        </div>
        <div style="font-size: 1.25rem; font-weight: 800; color: #3b82f6; letter-spacing: 0.5px;">ListerAI</div>
      </div>

      <div style="display: flex; gap: 20px; margin-bottom: 20px;">
        ${currentItem.image ? `
          <div style="width: 200px; height: 150px; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; flex-shrink: 0;">
            <img src="${currentItem.image}" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
        ` : ''}
        <div style="flex: 1;">
          <h2 style="margin: 0 0 8px 0; font-size: 1.2rem; color: #111827; line-height: 1.3;">${title}</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.85rem; color: #4b5563; margin-bottom: 8px;">
            <div><strong>Zustand:</strong> ${condition}</div>
            <div><strong>Versand:</strong> ${shipping}</div>
            <div><strong>Zahlung:</strong> ${payment}</div>
            <div><strong>Funktionalität:</strong> ${functionality}</div>
          </div>
          <div style="display: flex; gap: 15px; font-size: 0.95rem; border-top: 1px solid #f3f4f6; padding-top: 8px; margin-top: 8px;">
            <div>Empfohlener Preis: <strong style="color: #10b981;">${price}</strong></div>
            ${currentItem.minimumPrice ? `<div>Mindestpreis: <strong style="color: #ef4444;">${minPrice}</strong></div>` : ''}
          </div>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin: 0 0 8px 0; font-size: 1rem; color: #1e3a8a;">Beschreibung</h3>
        <p style="font-size: 0.88rem; color: #374151; white-space: pre-wrap; line-height: 1.5; margin: 0;">${description}</p>
      </div>

      ${utility ? `
        <div style="margin-bottom: 20px;">
          <h3 style="border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin: 0 0 8px 0; font-size: 1rem; color: #1e3a8a;">Nutzen & Vorteile</h3>
          <p style="font-size: 0.88rem; color: #374151; line-height: 1.5; margin: 0;">${utility}</p>
        </div>
      ` : ''}

      ${warrantyInfoHTML}

      ${tags ? `
        <div style="margin-top: 20px; font-size: 0.8rem; color: #3b82f6; font-style: italic; border-top: 1px dashed #e5e7eb; padding-top: 8px;">
          Tags: ${tags}
        </div>
      ` : ''}

      <div style="margin-top: 40px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 10px; font-size: 0.75rem; color: #9ca3af;">
        Exporte sind für den privaten Gebrauch bestimmt. Generiert mit ListerAI.
      </div>
    `;

    const opt = {
      margin:       0.5,
      filename:     `ListerAI_Vorlage_${title.replace(/\s+/g, '_').slice(0, 20)}_${new Date().toISOString().split('T')[0]}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <button 
      className="btn btn-secondary" 
      style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }} 
      onClick={handleExport}
    >
      📄 PDF Exportieren
    </button>
  );
}

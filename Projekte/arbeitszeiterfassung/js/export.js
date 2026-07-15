// js/export.js

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const btnCsv = document.getElementById('btn-export-csv');
    const btnPdf = document.getElementById('btn-export-pdf');

    if (btnCsv) {
      btnCsv.addEventListener('click', exportToCSV);
    }
    if (btnPdf) {
      btnPdf.addEventListener('click', exportToPDF);
    }
  }, 100);
});

function getExportData() {
  if (!window.history || window.history.length === 0) {
    if (window.storageService) {
      return window.storageService.getHistory();
    }
    return [];
  }
  return window.history; // This is the history array from app.js
}

function formatTimeStr(ts) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function exportToCSV() {
  const data = getExportData();
  if (data.length === 0) {
    alert("Keine Daten zum Exportieren gefunden.");
    return;
  }

  // Header
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Datum,Kommen,Gehen,Pause (Min),Dauer (Std),Ort,Erfasst\n";

  data.forEach(log => {
    const date = log.date;
    const start = formatTimeStr(log.checkIn);
    const end = log.checkOut ? formatTimeStr(log.checkOut) : 'Laufend';
    const pauseMins = log.pauseDuration ? Math.round(log.pauseDuration / 60000) : 0;
    const durationHrs = log.duration ? (log.duration / 3600000).toFixed(2) : 0;
    const loc = `"${log.locationName}"`;
    const type = log.manual ? "Manuell" : "Auto";

    csvContent += `${date},${start},${end},${pauseMins},${durationHrs},${loc},${type}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Zeiterfassung_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportToPDF() {
  const data = getExportData();
  if (data.length === 0) {
    alert("Keine Daten zum Exportieren gefunden.");
    return;
  }

  if (!window.jspdf) {
    alert("PDF Bibliothek nicht geladen.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Stundenzettel / Timesheet", 14, 22);

  doc.setFontSize(11);
  doc.text(`Generiert am: ${new Date().toLocaleDateString()}`, 14, 30);

  const tableColumn = ["Datum", "Kommen", "Gehen", "Pause", "Dauer", "Ort", "Typ"];
  const tableRows = [];

  let totalMs = 0;

  data.forEach(log => {
    const dateObj = new Date(log.checkIn);
    const dateStr = `${dateObj.getDate().toString().padStart(2, '0')}.${(dateObj.getMonth() + 1).toString().padStart(2, '0')}.${dateObj.getFullYear()}`;
    
    const start = formatTimeStr(log.checkIn);
    const end = log.checkOut ? formatTimeStr(log.checkOut) : '-';
    const pauseMins = log.pauseDuration ? Math.round(log.pauseDuration / 60000) + ' Min' : '0 Min';
    
    const durationHrsNum = log.duration ? (log.duration / 3600000) : 0;
    const durationHrs = durationHrsNum.toFixed(2) + ' Std';
    
    totalMs += (log.duration || 0);

    const loc = log.locationName;
    const type = log.manual ? "Manuell" : "Auto";

    tableRows.push([dateStr, start, end, pauseMins, durationHrs, loc, type]);
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    theme: 'striped',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [139, 92, 246] }
  });

  const finalY = doc.lastAutoTable.finalY || 40;
  
  doc.setFontSize(12);
  const totalHrs = (totalMs / 3600000).toFixed(2);
  doc.text(`Gesamtarbeitszeit: ${totalHrs} Stunden`, 14, finalY + 15);

  // Unterschriftenfeld
  doc.setLineWidth(0.5);
  doc.line(14, finalY + 45, 80, finalY + 45);
  doc.setFontSize(10);
  doc.text("Datum, Unterschrift Mitarbeiter", 14, finalY + 50);

  doc.line(120, finalY + 45, 186, finalY + 45);
  doc.text("Datum, Unterschrift Arbeitgeber", 120, finalY + 50);

  doc.save(`Stundenzettel_${new Date().toISOString().split('T')[0]}.pdf`);
}

import { storageService } from "./storage";

export function getExportData(): any[] {
  const win = window as any;
  if (win.history && win.history.length > 0) {
    return win.history;
  }
  return storageService.getHistory();
}

export function formatTimeStr(ts: number): string {
  if (!ts) return "-";
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export function exportToCSV(): void {
  const data = getExportData();
  if (!data || data.length === 0) {
    alert("Keine Daten zum Exportieren gefunden.");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Datum,Kommen,Gehen,Pause (Min),Netto-Dauer (Std),Gesetzl. Abzug,Ort,Erfasst\n";

  data.forEach((log: any) => {
    const date = log.date || (log.start ? new Date(log.start).toISOString().split("T")[0] : "");
    const start = log.startTime || formatTimeStr(log.checkIn || log.start);
    const end =
      log.endTime || (log.checkOut || log.end ? formatTimeStr(log.checkOut || log.end) : "Laufend");
    const pauseMins = Math.round((log.pauseMs || log.pauseDuration || 0) / 60000);
    const netMs = log.netDurationMs || log.duration || 0;
    const durationHrs = (netMs / 3600000).toFixed(2);
    const mandatoryPause = log.mandatoryPauseMs ? Math.round(log.mandatoryPauseMs / 60000) : 0;
    const loc = `"${log.locationName || log.location || "Büro"}"`;
    const type = log.manual || log.type ? "Manuell" : "Auto";

    csvContent += `${date},${start},${end},${pauseMins},${durationHrs},${mandatoryPause} Min,${loc},${type}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Zeiterfassung_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(): void {
  const data = getExportData();
  if (!data || data.length === 0) {
    alert("Keine Daten zum Exportieren gefunden.");
    return;
  }

  const win = window as any;
  if (!win.jspdf) {
    alert("PDF Bibliothek nicht geladen.");
    return;
  }

  const { jsPDF } = win.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Stundenzettel / Timesheet", 14, 22);

  doc.setFontSize(11);
  doc.text(`Generiert am: ${new Date().toLocaleDateString()}`, 14, 30);

  const tableColumn = ["Datum", "Kommen", "Gehen", "Pause", "Dauer (Netto)", "ArbZG Abzug", "Typ"];
  const tableRows: any[] = [];

  let totalMs = 0;

  data.forEach((log: any) => {
    const checkInTs = log.start || log.checkIn || Date.now();
    const dateObj = new Date(checkInTs);
    const dateStr =
      log.date ||
      `${dateObj.getDate().toString().padStart(2, "0")}.${(dateObj.getMonth() + 1).toString().padStart(2, "0")}.${dateObj.getFullYear()}`;

    const start = log.startTime || formatTimeStr(checkInTs);
    const end =
      log.endTime || (log.end || log.checkOut ? formatTimeStr(log.end || log.checkOut) : "-");
    const pauseMins = Math.round((log.pauseMs || log.pauseDuration || 0) / 60000) + " Min";

    const netMs = log.netDurationMs || log.duration || 0;
    const durationHrsNum = netMs / 3600000;
    const durationHrs = durationHrsNum.toFixed(2) + " Std";

    totalMs += netMs;

    const arbzgDeduction = log.mandatoryPauseMs
      ? Math.round(log.mandatoryPauseMs / 60000) + " Min"
      : "0 Min";
    const type = log.manual || log.type ? "Manuell" : "Auto";

    tableRows.push([dateStr, start, end, pauseMins, durationHrs, arbzgDeduction, type]);
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    theme: "striped",
    styles: { fontSize: 9 },
    headStyles: { fillColor: [139, 92, 246] },
  });

  const finalY = doc.lastAutoTable.finalY || 40;

  doc.setFontSize(12);
  const totalHrs = (totalMs / 3600000).toFixed(2);
  doc.text(`Gesamtarbeitszeit (Netto): ${totalHrs} Stunden`, 14, finalY + 15);

  doc.setLineWidth(0.5);
  doc.line(14, finalY + 45, 80, finalY + 45);
  doc.setFontSize(10);
  doc.text("Datum, Unterschrift Mitarbeiter", 14, finalY + 50);

  doc.line(120, finalY + 45, 186, finalY + 45);
  doc.text("Datum, Unterschrift Arbeitgeber", 120, finalY + 50);

  doc.save(`Stundenzettel_${new Date().toISOString().split("T")[0]}.pdf`);
}

export function initExportUI(): void {
  const btnCsv = document.getElementById("btn-export-csv");
  const btnPdf = document.getElementById("btn-export-pdf");

  if (btnCsv) btnCsv.addEventListener("click", exportToCSV);
  if (btnPdf) btnPdf.addEventListener("click", exportToPDF);
}

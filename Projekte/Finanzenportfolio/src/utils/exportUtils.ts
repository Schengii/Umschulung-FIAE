import * as XLSX from 'xlsx';
import type { Portfolio, PortfolioStats, Holding, Transaction, DepositLadderItem } from '../types';
import type { DachTaxResult } from '../components/performanceUtils';

export interface ExcelExportOptions {
  portfolio: Portfolio;
  stats?: PortfolioStats;
  holdings: Holding[];
  transactions: Transaction[];
  depositLadder?: DepositLadderItem[];
  taxResult?: DachTaxResult;
  baseCurrency?: string;
  filename?: string;
}

/**
 * Builds the complete multi-sheet Microsoft Excel workbook
 */
export function buildPortfolioExcelWorkbook({
  portfolio,
  stats,
  holdings,
  transactions,
  depositLadder = [],
  taxResult,
  baseCurrency = 'EUR'
}: ExcelExportOptions): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Übersicht & Kennzahlen (KPIs)
  const totalVal = stats?.totalValue ?? holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
  const totalCost = stats?.totalCost ?? holdings.reduce((sum, h) => sum + (h.totalCost || 0), 0);
  const totalGains = stats?.totalGains ?? (totalVal - totalCost);
  const totalGainsPct = stats?.totalGainsPercent ?? (totalCost > 0 ? (totalGains / totalCost) * 100 : 0);

  const overviewData = [
    { Kennzahl: 'Portfolio Name', Wert: portfolio.name },
    { Kennzahl: 'Exportdatum', Wert: new Date().toLocaleDateString('de-DE') },
    { Kennzahl: 'Basiswährung', Wert: baseCurrency },
    { Kennzahl: `Gesamtwert (${baseCurrency})`, Wert: totalVal },
    { Kennzahl: `Investiertes Kapital (${baseCurrency})`, Wert: totalCost },
    { Kennzahl: `Realisierter Gewinn / Verlust (${baseCurrency})`, Wert: stats?.realizedGains ?? 0 },
    { Kennzahl: `Unrealisierter Gewinn / Verlust (${baseCurrency})`, Wert: totalGains },
    { Kennzahl: 'Gesamtrendite (%)', Wert: `${totalGainsPct.toFixed(2)}%` },
    { Kennzahl: 'Annualisierte Rendite (IRR %)', Wert: `${((stats?.irr || 0) * 100).toFixed(2)}%` },
    { Kennzahl: 'Zeitgewichtete Rendite (TTWRR %)', Wert: `${((stats?.ttwrr || 0) * 100).toFixed(2)}%` },
    { Kennzahl: 'Sharpe Ratio', Wert: (stats?.sharpeRatio || 0).toFixed(2) },
    { Kennzahl: 'Maximaler Drawdown (%)', Wert: `${(stats?.maxDrawdown || 0).toFixed(2)}%` },
    { Kennzahl: `Dividendenertrag p.a. (${baseCurrency})`, Wert: stats?.dividendsReceived ?? 0 },
    { Kennzahl: 'Anzahl Positionen', Wert: holdings.length },
    { Kennzahl: 'Anzahl Transaktionen', Wert: transactions.length }
  ];
  const wsOverview = XLSX.utils.json_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(wb, wsOverview, 'Übersicht');

  // Sheet 2: Bestände (Holdings)
  const holdingsData = holdings.map(h => ({
    'Symbol / Ticker': h.ticker,
    'Name': h.name,
    'Kategorie': h.category,
    'Broker': h.broker || 'Standard',
    'Stückzahl': h.shares,
    'Einstandskurs': h.averageBuyPrice,
    'Aktueller Kurs': h.currentPrice,
    'Investiertes Kapital': h.totalCost,
    'Aktueller Marktwert': h.currentValue,
    'Gewinn / Verlust (Absolut)': h.totalGain,
    'Gewinn / Verlust (%)': `${h.totalGainPercent.toFixed(2)}%`,
    'Portfolio-Anteil (%)': `${h.portfolioWeight.toFixed(2)}%`,
    'Dividendenrendite p.a. (%)': `${(h.yieldOnCost || 0).toFixed(2)}%`
  }));
  const wsHoldings = XLSX.utils.json_to_sheet(holdingsData);
  XLSX.utils.book_append_sheet(wb, wsHoldings, 'Bestände');

  // Sheet 3: Transaktionen (Transactions)
  const transactionsData = transactions.map(t => ({
    'ID': t.id,
    'Datum': t.date,
    'Typ': t.type,
    'Symbol': t.ticker,
    'Name': t.name,
    'Kategorie': t.category,
    'Broker': t.broker || 'Standard',
    'Stückzahl / Menge': t.amount,
    'Ausführungskurs': t.price,
    'Gesamtvolumen': t.amount * t.price,
    'Gebühr': t.fee || 0,
    'Steuer': t.tax || 0,
    'Währung': t.currency || 'EUR',
    'Wechselkurs': t.exchangeRate || 1.0,
    'Notizen': t.notes || ''
  }));
  const wsTransactions = XLSX.utils.json_to_sheet(transactionsData);
  XLSX.utils.book_append_sheet(wb, wsTransactions, 'Transaktionen');

  // Sheet 4: Dividenden-Historie
  const dividendTxs = transactions.filter(t => t.type === 'DIVIDEND');
  const dividendData = dividendTxs.map(t => ({
    'Datum': t.date,
    'Symbol': t.ticker,
    'Wertpapier': t.name,
    'Broker': t.broker || 'Standard',
    'Anteile': t.amount,
    'Ausschüttung je Anteil': t.price,
    'Bruttobetrag': t.amount * t.price,
    'Einbehaltene Steuer': t.tax || 0,
    'Nettobetrag': (t.amount * t.price) - (t.tax || 0),
    'Währung': t.currency || 'EUR'
  }));
  const wsDividends = XLSX.utils.json_to_sheet(dividendData.length > 0 ? dividendData : [{ Hinweis: 'Keine Dividendenzahlungen vorhanden' }]);
  XLSX.utils.book_append_sheet(wb, wsDividends, 'Dividenden');

  // Sheet 5: Zinstreppe & Festgelder
  if (depositLadder.length > 0) {
    const depositData = depositLadder.map(d => ({
      'Bank': d.bankName,
      'Anlageart': d.depositType,
      'Anlagebetrag': d.principalEur,
      'Zinssatz p.a. (%)': `${d.interestRatePercent.toFixed(2)}%`,
      'Startdatum': d.startDate,
      'Fälligkeitsdatum': d.maturityDate,
      'Ausschüttung': d.payoutInterval,
      'Einlagensicherung (>100k Risiko)': d.principalEur > 100000 ? 'ACHTUNG: Über 100.000 €' : 'Gesichert (unter 100k €)'
    }));
    const wsDeposits = XLSX.utils.json_to_sheet(depositData);
    XLSX.utils.book_append_sheet(wb, wsDeposits, 'Zinstreppe & Cash');
  }

  // Sheet 6: DACH Steuer-Report
  if (taxResult) {
    const taxData = [
      { Position: 'Steuerland', Betrag: taxResult.countryName },
      { Position: 'Steuerpflichtiges Gesamteinkommen', Betrag: taxResult.totalTaxableIncomeEur },
      { Position: 'Fällige Steuer (Vorab-Kalkulation)', Betrag: taxResult.totalTaxDueEur },
      { Position: 'Effektiver Steuersatz (%)', Betrag: `${taxResult.effectiveTaxRatePct.toFixed(2)}%` },
      { Position: 'Genutzter Sparer-Pauschbetrag', Betrag: taxResult.allowanceUsedEur },
      { Position: 'Verbleibender Freibetrag', Betrag: taxResult.allowanceRemainingEur },
      ...taxResult.details.map((detail, idx) => ({ Position: `Regelwerk Detail ${idx + 1}`, Betrag: detail }))
    ];
    const wsTax = XLSX.utils.json_to_sheet(taxData);
    XLSX.utils.book_append_sheet(wb, wsTax, 'Steuer-Report');
  }

  return wb;
}

/**
 * Generates and downloads a multi-sheet Microsoft Excel (.xlsx) workbook
 */
export function exportPortfolioToExcel(options: ExcelExportOptions): void {
  const wb = buildPortfolioExcelWorkbook(options);
  const dateStr = new Date().toISOString().split('T')[0];
  const exportFilename = options.filename || `FinanzPortfolio_${options.portfolio.name.replace(/\s+/g, '_')}_${dateStr}.xlsx`;
  XLSX.writeFile(wb, exportFilename);
}

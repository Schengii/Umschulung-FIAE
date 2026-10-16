/** Dokumentierte Prüfung eines Geräts bzw. einer Anlage inklusive Fälligkeit der nächsten Prüfung. */
export interface InspectionRecord {
  id: string;
  deviceName: string;
  inventoryNumber?: string;
  location?: string;
  /** ISO-Zeitstempel der Prüfung */
  inspectedAt: string;
  /** Nächste Prüfung im Format MM/YYYY (wie vom DGUV-Prüfassistenten geliefert) */
  nextInspection: string;
  status: string;
}

export type DueState = "overdue" | "due-soon" | "ok";

const MAX_RECORDS = 200;

/** "MM/YYYY" → letzter Tag des Monats (die Prüfung ist bis Monatsende fällig); null bei ungültigem Format. */
export function parseMonthYear(value: string): Date | null {
  const match = /^(\d{1,2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const month = Number(match[1]);
  const year = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return new Date(year, month, 0, 23, 59, 59, 999);
}

export function classifyDue(record: InspectionRecord, now: Date = new Date(), soonDays = 30): DueState {
  const due = parseMonthYear(record.nextInspection);
  if (!due) return "ok";
  if (due.getTime() < now.getTime()) return "overdue";
  const soon = new Date(now.getTime() + soonDays * 24 * 60 * 60 * 1000);
  return due.getTime() <= soon.getTime() ? "due-soon" : "ok";
}

const identity = (r: InspectionRecord): string => `${r.deviceName.trim().toLowerCase()}|${(r.inventoryNumber ?? "").trim().toLowerCase()}`;

/** Fügt eine Prüfung hinzu; eine frühere Prüfung desselben Geräts (Name + Inventarnummer) wird ersetzt. */
export function upsertInspection(records: InspectionRecord[], record: InspectionRecord): InspectionRecord[] {
  const rest = records.filter((r) => identity(r) !== identity(record));
  return [record, ...rest].slice(0, MAX_RECORDS);
}

/** Sortiert nach Dringlichkeit: überfällig, bald fällig, dann nach Fälligkeitsdatum. */
export function sortByDue(records: InspectionRecord[], now: Date = new Date()): InspectionRecord[] {
  const rank: Record<DueState, number> = { overdue: 0, "due-soon": 1, ok: 2 };
  const time = (r: InspectionRecord) => parseMonthYear(r.nextInspection)?.getTime() ?? Number.MAX_SAFE_INTEGER;
  return [...records].sort((a, b) => rank[classifyDue(a, now)] - rank[classifyDue(b, now)] || time(a) - time(b));
}

const STORAGE_KEY = "electrocheck_inspection_log";

export function loadInspections(): InspectionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as InspectionRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveInspections(records: InspectionRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.warn("Prüffristen konnten nicht gespeichert werden:", e);
  }
}

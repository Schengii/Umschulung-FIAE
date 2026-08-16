export interface OfficeLocation {
  name: string;
  lat: number;
  lng: number;
  radius: number; // in meters
}

export interface WorkSession {
  startTime: number; // timestamp ms
  pauseStartTime?: number | null;
  totalPauseMs: number;
  active: boolean;
  isPaused: boolean;
  projectId?: string | null;
  note?: string;
}

export interface HistoryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  start: number; // timestamp ms
  end: number; // timestamp ms
  pauseMs: number;
  netDurationMs: number;
  grossDurationMs: number;
  mandatoryPauseMs: number;
  project?: string;
  type?: "work" | "vacation" | "sick" | "holiday" | "compensation";
  note?: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  client?: string;
}

export interface AppSettings {
  dailyTarget: number; // in hours (e.g. 8)
  arbzgBreaksEnabled: boolean; // default: true
  theme?: "dark" | "light";
  weeklyTarget?: number; // in hours (e.g. 40)
}

export interface GeofenceStatus {
  isInside: boolean;
  distance: number;
  locationName: string;
}

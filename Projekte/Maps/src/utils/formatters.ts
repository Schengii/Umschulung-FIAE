/**
 * Formatiert Distanz in lesbares Format
 * < 1 km → "850 m", >= 1 km → "3,5 km"
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1).replace('.', ',')} km`;
}

/**
 * Formatiert Dauer in "X Std. Y Min." oder "Y Min." Format
 */
export function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} Std. ${mins} Min.` : `${hours} Std.`;
  }
  return `${minutes} Min.`;
}

/**
 * Schätzt Ankunftszeit basierend auf aktueller Zeit + Dauer
 */
export function estimatedArrival(durationMinutes: number): string {
  const arrival = new Date(Date.now() + durationMinutes * 60 * 1000);
  return arrival.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Gibt Icon-Namen zurück, passend zum Incident-Typ (Lucide Icons)
 */
export function getIncidentIconName(type: string): string {
  switch (type) {
    case 'jam': return 'alert-triangle';
    case 'construction': return 'construction';
    case 'accident': return 'alert-octagon';
    case 'hazard': return 'alert-circle';
    case 'weather': return 'cloud-rain';
    default: return 'info';
  }
}

/**
 * Gibt Farbetikett für Incident-Severity zurück
 */
export function getSeverityLabel(severity: string): string {
  switch (severity) {
    case 'low': return 'Gering';
    case 'medium': return 'Mittel';
    case 'high': return 'Stark';
    case 'critical': return 'Kritisch';
    default: return 'Unbekannt';
  }
}

/**
 * Gibt Beschriftung für Transportmodus zurück
 */
export function getTransportModeLabel(mode: string): string {
  switch (mode) {
    case 'hiking': return 'Wandern / Fußgänger';
    case 'cycling': return 'Fahrrad';
    case 'driving': return 'Auto';
    default: return mode;
  }
}

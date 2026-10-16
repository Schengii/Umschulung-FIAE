import { Geolocation } from "@capacitor/geolocation";

/**
 * Obergrenze für die gesamte Standortermittlung inkl. Berechtigungsabfrage. Das `timeout` von getCurrentPosition
 * zählt erst nach der Freigabe – ignoriert der Nutzer die Abfrage des Browsers, bliebe die Analyse sonst hängen.
 */
export const LOCATION_TIMEOUT_MS = 12_000;

const LOCATION_UNAVAILABLE = "Standort konnte nicht ermittelt werden (Evtl. kein HTTPS oder blockiert)";

async function resolveLocation(): Promise<string | undefined> {
  try {
    try {
      const permStatus = await Geolocation.checkPermissions();
      if (permStatus.location !== "granted") {
        const requestStatus = await Geolocation.requestPermissions();
        if (requestStatus.location !== "granted") {
          console.warn("Standort-Berechtigung verweigert.");
          return "Standort-Berechtigung verweigert";
        }
      }
    } catch (permError) {
      console.warn("Berechtigungsprüfung übersprungen (vermutlich Browser):", permError);
    }
    const pos = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    });
    return `Lat: ${pos.coords.latitude.toFixed(5)}, Lng: ${pos.coords.longitude.toFixed(5)}`;
  } catch (error) {
    console.warn("Standortfehler:", error);
    return LOCATION_UNAVAILABLE;
  }
}

/** Ermittelt den aktuellen Standort als Text ("Lat: …, Lng: …") oder liefert eine Fehlermeldung als Text. */
export async function getCurrentLocation(): Promise<string | undefined> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<string>((resolve) => {
    timer = setTimeout(() => {
      console.warn("Standortermittlung abgebrochen (Zeitüberschreitung).");
      resolve(LOCATION_UNAVAILABLE);
    }, LOCATION_TIMEOUT_MS);
  });
  try {
    return await Promise.race([resolveLocation(), timeout]);
  } finally {
    clearTimeout(timer);
  }
}

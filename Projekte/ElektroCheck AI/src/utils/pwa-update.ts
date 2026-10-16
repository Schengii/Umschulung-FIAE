import { registerSW } from "virtual:pwa-register";
import { showConfirm } from "./toast";

/**
 * Registriert den Service Worker. Neue Versionen werden nicht still mitten in einer Prüfung eingespielt,
 * sondern erst nach Bestätigung (ein Neuladen würde nicht gespeicherte Eingaben verwerfen).
 */
export function initPwaUpdates(): void {
  const updateSW = registerSW({
    onNeedRefresh() {
      void showConfirm("Eine neue App-Version ist verfügbar. Jetzt aktualisieren? Nicht gespeicherte Eingaben gehen dabei verloren.").then(
        (accepted) => {
          if (accepted) void updateSW(true);
        },
      );
    },
  });
}

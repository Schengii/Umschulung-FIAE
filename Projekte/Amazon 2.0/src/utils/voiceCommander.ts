// ============================================================
// Amazon 2.0 – Smart Voice Shopping Commander
// ============================================================
import type { AppState, Product } from '../types';

export type VoiceActionType =
  | 'search'
  | 'add_to_cart'
  | 'open_cart'
  | 'open_checkout'
  | 'open_orders'
  | 'open_wishlist'
  | 'clear_filters'
  | 'toggle_theme'
  | 'open_coupons'
  | 'unknown';

export interface VoiceCommandResult {
  action: VoiceActionType;
  query?: string;
  matchedProduct?: Product;
  message: string;
}

export function parseVoiceCommand(transcript: string, products: Product[] = []): VoiceCommandResult {
  const text = transcript.toLowerCase().trim();

  // 1. Open Cart
  if (/^(?:öffne|zeige|gehe zu|zum)\s*(?:den|meinen|meinen\s+gesamten)?\s*(?:warenkorb|einkaufswagen)/i.test(text) || text === 'warenkorb') {
    return { action: 'open_cart', message: 'Warenkorb wird geöffnet...' };
  }

  // 2. Checkout
  if (/^(?:gehe zur|zur|ab zur|öffne die)\s*kasse/i.test(text) || /^(?:jetzt\s*)?bezahlen/i.test(text) || text === 'kasse') {
    return { action: 'open_checkout', message: 'Kasse wird geöffnet...' };
  }

  // 3. Orders
  if (/^(?:zeige|öffne|wo ist)?\s*(?:meine|mein)?\s*(?:bestellungen|paket)/i.test(text) || text === 'bestellungen') {
    return { action: 'open_orders', message: 'Bestellungen werden geöffnet...' };
  }

  // 4. Wishlist
  if (/^(?:zeige|öffne)?\s*(?:meine)?\s*(?:wunschliste|wunschzettel)/i.test(text) || text === 'wunschliste') {
    return { action: 'open_wishlist', message: 'Wunschliste wird geöffnet...' };
  }

  // 5. Coupons
  if (/^(?:zeige|öffne)?\s*(?:meine)?\s*(?:gutscheine|coupons|rabatte)/i.test(text) || text === 'gutscheine') {
    return { action: 'open_coupons', message: 'Gutschein-Center wird geöffnet...' };
  }

  // 6. Toggle Theme
  if (/dark\s*mode|dunkler\s*modus|nachtmodus|light\s*mode|heller\s*modus/i.test(text)) {
    return { action: 'toggle_theme', message: 'Design wird umgeschaltet...' };
  }

  // 7. Clear Filters
  if (/filter\s*(zurücksetzen|löschen|leeren)|alle\s*produkte/i.test(text)) {
    return { action: 'clear_filters', message: 'Filter werden zurückgesetzt...' };
  }

  // 8. Add to Cart: "Füge [Produkt] zum Warenkorb hinzu", "Packe [Produkt] in den Warenkorb"
  const addMatch = transcript.match(/(?:füge|packe|lege|pack)\s+(?:das\s+|den\s+|die\s+|ein\s+)?(.+?)\s+(?:in den|zum|in meinen|zu den)\s+warenkorb/i)
    || transcript.match(/(?:in den warenkorb|kaufen)\s+(.+)/i);

  if (addMatch && addMatch[1]) {
    const rawTarget = addMatch[1].trim();
    // Match product in catalog
    const matched = products.find(p =>
      p.title.toLowerCase().includes(rawTarget.toLowerCase()) ||
      rawTarget.toLowerCase().includes(p.title.toLowerCase()) ||
      (p.brand && rawTarget.toLowerCase().includes(p.brand.toLowerCase()))
    );

    if (matched) {
      return {
        action: 'add_to_cart',
        matchedProduct: matched,
        query: rawTarget,
        message: `„${matched.title}“ wird zum Warenkorb hinzugefügt...`,
      };
    }
  }

  // 9. Search: "Suche nach [Query]", "Finde [Query]", "Zeige mir [Query]"
  const searchMatch = transcript.match(/(?:suche nach|suche|finde|zeige mir|zeige)\s+(.+)/i);
  if (searchMatch && searchMatch[1]) {
    const q = searchMatch[1].trim();
    return { action: 'search', query: q, message: `Suche nach „${q}“...` };
  }

  // Fallback: Default to search if text is not recognized as a command
  return { action: 'search', query: transcript.trim(), message: `Suche nach „${transcript.trim()}“...` };
}

export function startSpeechRecognition(
  onResult: (result: VoiceCommandResult) => void,
  onError: (err: string) => void,
  state: AppState
): () => void {
  const SpeechRecognition = (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
    (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError('Spracherkennung wird von diesem Browser leider nicht unterstützt.');
    return () => {};
  }

  const recognition = new SpeechRecognition();
  recognition.lang = state.language === 'en' ? 'en-US' : 'de-DE';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    const res = parseVoiceCommand(transcript, state.products);
    onResult(res);
  };

  recognition.onerror = (event: any) => {
    onError(`Fehler bei der Spracherkennung: ${event.error}`);
  };

  recognition.start();

  return () => {
    try { recognition.stop(); } catch { /* ignore */ }
  };
}

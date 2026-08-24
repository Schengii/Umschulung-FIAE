// ============================================================
// Amazon 2.0 – Utility Formatters
// ============================================================

/**
 * Formats a price number to a locale-aware currency string.
 */
export function formatPrice(price: number, currency = 'EUR', locale = 'de-DE'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price);
}

/**
 * Formats a timestamp (ms) or Date to a localized date string.
 */
export function formatDate(ts: number | Date, locale = 'de-DE'): string {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(typeof ts === 'number' ? new Date(ts) : ts);
}

/**
 * Formats a timestamp to a relative time string (e.g. "vor 3 Tagen").
 */
export function formatRelativeTime(ts: number, locale = 'de-DE'): string {
  const diff = (Date.now() - ts) / 1000; // seconds
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diff < 60) return rtf.format(-Math.floor(diff), 'second');
  if (diff < 3600) return rtf.format(-Math.floor(diff / 60), 'minute');
  if (diff < 86400) return rtf.format(-Math.floor(diff / 3600), 'hour');
  if (diff < 2592000) return rtf.format(-Math.floor(diff / 86400), 'day');
  if (diff < 31536000) return rtf.format(-Math.floor(diff / 2592000), 'month');
  return rtf.format(-Math.floor(diff / 31536000), 'year');
}

/**
 * Renders a star rating as HTML ★ characters.
 */
export function renderStars(rating: number, maxStars = 5): string {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = maxStars - full - half;

  return (
    '<span class="stars" aria-label="' + rating.toFixed(1) + ' von 5 Sternen">' +
    '★'.repeat(full) +
    (half ? '<span class="star-half">★</span>' : '') +
    '<span class="star-empty">' + '★'.repeat(empty) + '</span>' +
    '</span>'
  );
}

/**
 * Generates a discount badge label string.
 */
export function formatDiscount(original: number, current: number): string {
  const pct = Math.max(0, Math.round(((original - current) / original) * 100));
  return `-${pct}%`;
}

/**
 * Truncates a string to a max length, appending '…'.
 */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '…';
}

/**
 * Generates a random order ID.
 */
export function generateOrderId(): string {
  return 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
}

/**
 * Generates a random UUID-like ID.
 */
export function generateId(): string {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
}

/**
 * Sanitizes an HTML string by removing script tags (basic XSS prevention for user input).
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Debounce helper for search inputs.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Clamps a number between min and max.
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

/**
 * Formats a countdown duration in seconds to MM:SS.
 */
export function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

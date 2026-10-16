const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/**
 * Wandelt das einfache Markdown der Perplexity-Antwort (**fett**, "* Aufzählung") in HTML um.
 * Der Text wird zuerst HTML-escaped, damit das Ergebnis gefahrlos per unsafeHTML gerendert werden kann.
 */
export function formatMarkdown(text: string): string {
  if (!text) return "";
  let formatted = escapeHtml(text).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  formatted = formatted.replace(/^\*\s(.*)$/gm, "• $1");
  return formatted;
}

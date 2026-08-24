// ============================================================
// Amazon 2.0 – Smart AI Customer Support & Live Chat Widget
// ============================================================
import type { AppState } from '../types';
import { formatPrice } from '../utils/formatters';
import { showToast } from './toast';

let chatEl: HTMLElement | null = null;
let isOpen = false;

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

const chatHistory: ChatMessage[] = [
  {
    sender: 'bot',
    text: 'Hallo! 👋 Ich bin dein KI-Kundenservice Assistent von Amazon 2.0. Wie kann ich dir heute helfen?',
    timestamp: getFormattedTime(),
  },
];

function getFormattedTime(): string {
  const d = new Date();
  return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
}

export function initSupportChat(state: AppState): void {
  if (chatEl) return;

  chatEl = document.createElement('div');
  chatEl.id = 'supportChatWidget';
  chatEl.className = 'support-chat-widget';
  document.body.appendChild(chatEl);

  renderChatWidget(state);
}

function renderChatWidget(state: AppState): void {
  if (!chatEl) return;

  chatEl.innerHTML = `
    <!-- Floating Trigger Button -->
    <button id="chatToggleBtn" class="chat-toggle-btn" aria-label="Kundenservice Live Chat">
      <span class="chat-icon">💬</span>
      <span class="chat-label">Hilfe & Live-Chat</span>
      <span class="chat-badge-pulse"></span>
    </button>

    <!-- Chat Window Drawer -->
    <div class="chat-window ${isOpen ? 'open' : ''}" id="chatWindow">
      <div class="chat-header">
        <div class="chat-bot-avatar">🤖</div>
        <div class="chat-header-info">
          <h3>Amazon 2.0 Support-Bot</h3>
          <span class="online-indicator">● 24/7 Online</span>
        </div>
        <button id="chatCloseBtn" class="chat-close-btn" aria-label="Schließen">✕</button>
      </div>

      <div class="chat-body" id="chatBody">
        ${chatHistory.map(msg => `
          <div class="chat-bubble ${msg.sender}">
            <div class="bubble-content">${msg.text}</div>
            <span class="bubble-time">${msg.timestamp}</span>
          </div>
        `).join('')}
      </div>

      <!-- Quick Action Chips -->
      <div class="chat-chips">
        <button class="chat-chip" data-query="Wo ist mein Paket?">📦 Paket-Status</button>
        <button class="chat-chip" data-query="Wie funktioniert die Rückgabe?">↩ Retoure</button>
        <button class="chat-chip" data-query="Gibt es aktuelle Gutscheine?">🎟️ Gutscheine</button>
        <button class="chat-chip" data-query="Wie hoch ist mein Guthaben?">💰 Guthaben</button>
      </div>

      <div class="chat-footer">
        <input type="text" id="chatInput" placeholder="Schreibe eine Nachricht..." autocomplete="off" />
        <button id="chatSendBtn" class="chat-send-btn" aria-label="Senden">➔</button>
      </div>
    </div>
  `;

  // Wiring
  document.getElementById('chatToggleBtn')?.addEventListener('click', toggleChat);
  document.getElementById('chatCloseBtn')?.addEventListener('click', toggleChat);

  const input = document.getElementById('chatInput') as HTMLInputElement;
  const sendBtn = document.getElementById('chatSendBtn');

  sendBtn?.addEventListener('click', () => handleUserSend(state));
  input?.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleUserSend(state);
  });

  chatEl.querySelectorAll('.chat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.getAttribute('data-query')!;
      addUserMessage(q);
      processBotReply(q, state);
    });
  });
}

function toggleChat(): void {
  isOpen = !isOpen;
  const win = document.getElementById('chatWindow');
  win?.classList.toggle('open', isOpen);
  if (isOpen) {
    scrollChatBottom();
  }
}

function handleUserSend(state: AppState): void {
  const input = document.getElementById('chatInput') as HTMLInputElement;
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  addUserMessage(text);
  processBotReply(text, state);
}

function addUserMessage(text: string): void {
  chatHistory.push({ sender: 'user', text, timestamp: getFormattedTime() });
  updateChatBody();
}

function addBotMessage(text: string): void {
  chatHistory.push({ sender: 'bot', text, timestamp: getFormattedTime() });
  updateChatBody();
}

function updateChatBody(): void {
  const body = document.getElementById('chatBody');
  if (!body) return;
  body.innerHTML = chatHistory.map(msg => `
    <div class="chat-bubble ${msg.sender}">
      <div class="bubble-content">${msg.text}</div>
      <span class="bubble-time">${msg.timestamp}</span>
    </div>
  `).join('');
  scrollChatBottom();
}

function scrollChatBottom(): void {
  const body = document.getElementById('chatBody');
  if (body) body.scrollTop = body.scrollHeight;
}

function processBotReply(query: string, state: AppState): void {
  const q = query.toLowerCase();

  // Show typing indicator
  const body = document.getElementById('chatBody');
  if (body) {
    const typing = document.createElement('div');
    typing.className = 'chat-bubble bot typing-indicator';
    typing.id = 'typingBubble';
    typing.innerHTML = '<div class="bubble-content"><span>.</span><span>.</span><span>.</span></div>';
    body.appendChild(typing);
    scrollChatBottom();
  }

  setTimeout(() => {
    document.getElementById('typingBubble')?.remove();

    if (q.includes('paket') || q.includes('wo ist') || q.includes('lieferung') || q.includes('bestellung')) {
      if (state.orders.length > 0) {
        const latest = state.orders[0];
        addBotMessage(`Deine letzte Bestellung <strong>${latest.id}</strong> ist aktuell im Status: <strong>${latest.status}</strong>. Voraussichtliche Lieferung: ${latest.estimatedDelivery ?? 'Heute'}.`);
      } else {
        addBotMessage('Du hast noch keine aktiven Bestellungen. Sobald du etwas kaufst, kannst du das Paket in der Bestellübersicht live verfolgen!');
      }
    } else if (q.includes('retoure') || q.includes('rückgabe') || q.includes('zurück')) {
      addBotMessage('Bei Amazon 2.0 hast du 30 Tage kostenfreies Rückgaberecht. Gehe einfach auf "Bestellungen", wähle den Artikel aus und klicke auf "↩ Rückgabe", um dein Versandetikett zu drucken!');
    } else if (q.includes('gutschein') || q.includes('rabatt') || q.includes('code')) {
      addBotMessage('Aktuell verfügbare Gutscheincodes findest du oben im Menü unter 🎟️ "Gutscheine". Nutze z.B. <strong>AMZ2026</strong> für 10% Rabatt!');
    } else if (q.includes('guthaben') || q.includes('geld') || q.includes('saldo')) {
      addBotMessage(`Dein aktuelles Geschenk-Guthaben beträgt <strong>${formatPrice(state.userBalance.amount)}</strong>. Du kannst es direkt im Checkout einlösen!`);
    } else if (q.includes('hallo') || q.includes('hi') || q.includes('hey')) {
      addBotMessage('Hallo! Wie kann ich dir heute weiterhelfen? Frage mich nach Bestellungen, Retouren oder Gutscheinen!');
    } else if (q.includes('mitarbeiter') || q.includes('mensch') || q.includes('telefon')) {
      addBotMessage('Unser Telefon-Support ist erreichbar unter 📞 0800-AMAZON-20. Oder möchtest du eine Rückrufbitte hinterlassen?');
      showToast('📞 Support-Rückruf wurde simuliert angefordert.', 'info');
    } else {
      addBotMessage('Vielen Dank für deine Anfrage! Ich helfe dir gerne bei Fragen zu Produkten, Bestellungen, Versand oder Gutscheinen weiter.');
    }
  }, 900);
}

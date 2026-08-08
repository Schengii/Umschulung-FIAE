import React, { useState } from 'react';
import { Send, Lightbulb, Check, Sparkles, AlertTriangle } from 'lucide-react';
import { chatWithBuyer, suggestResponse, getNegotiationFeedback } from '../gemini';

const BUYER_PERSONAS = [
  { id: 'feilscher', name: 'Der Feilscher', emoji: '💸', description: 'Sucht aggressiv nach Rabatten, fragt nach "was letzte Preis?" und bietet unverschämt niedrige Preise.' },
  { id: 'skeptiker', name: 'Der Detail-Skeptiker', emoji: '🧐', description: 'Fragt nach Gebrauchsspuren, Garantie, OVP und möchte alles ganz genau wissen.' },
  { id: 'direkt', name: 'Der Direktkäufer', emoji: '🤝', description: 'Sehr freundlich, zahlt meist den Wunschpreis und möchte den Deal unkompliziert abschließen.' }
];

export default function ChatSimulator({ 
  currentItem, 
  apiKey, 
  showToast, 
  onOpenSoldModal 
}) {
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [negotiationTips, setNegotiationTips] = useState([]);

  const handleStartChat = async (persona) => {
    setSelectedPersona(persona);
    setChatHistory([]);
    setNegotiationTips([]);
    setIsChatLoading(true);

    setTimeout(async () => {
      let firstMsgText = '';
      if (!apiKey) {
        if (persona.id === 'feilscher') {
          firstMsgText = `Hi, ist der Artikel noch da? Was ist dein absoluter Schmerzpreis? Für ${Math.round(currentItem.suggestedPrice * 0.5 || 20)} € hol ich es sofort ab!`;
        } else if (persona.id === 'skeptiker') {
          firstMsgText = `Hallo! Ich habe Interesse. Gibt es irgendwelche Kratzer, Flecken oder Mängel, die nicht auf den Bildern zu sehen sind? Ist eine OVP vorhanden?`;
        } else {
          firstMsgText = `Hallo, schöner Artikel! Ist der Preis von ${currentItem.suggestedPrice || 50} € als Festpreis gedacht oder lässt sich da noch ein wenig machen?`;
        }
      } else {
        try {
          firstMsgText = await chatWithBuyer(currentItem, persona, [], apiKey);
        } catch {
          firstMsgText = 'Hallo, ist das Angebot noch aktuell?';
        }
      }

      const initialHistory = [{ sender: 'buyer', text: firstMsgText }];
      setChatHistory(initialHistory);
      setIsChatLoading(false);
      updateNegotiationTips(initialHistory, persona);
    }, 1000);
  };

  const updateNegotiationTips = async (history, persona) => {
    if (!apiKey) {
      if (persona.id === 'feilscher') {
        const limitStr = currentItem.minimumPrice ? ` (Limit: ${currentItem.minimumPrice} €)` : '';
        setNegotiationTips([
          `- Bleibe ruhig und sachlich. Feilscher versuchen dich emotional zu drücken.${limitStr}`,
          '- Argumentiere mit der Qualität oder dem Zubehör deines Artikels.',
          '- Biete einen kleinen Rabatt an, aber bleibe nah an deinem Wunschpreis.'
        ]);
      } else if (persona.id === 'skeptiker') {
        setNegotiationTips([
          '- Beantworte alle Fragen zum Zustand ehrlich, das schafft Vertrauen.',
          '- Falls eine Rechnung vorhanden ist, erwähne diese als zusätzlichen Pluspunkt.',
          '- Biete an, bei Bedarf ein weiteres Foto hochzuladen.'
        ]);
      } else {
        setNegotiationTips([
          '- Dieser Käufer ist unkompliziert. Antworte schnell und freundlich.',
          '- Halte die Abhol- oder Versandmodalitäten einfach.',
          '- Akzeptiere ein faires Angebot, um den Deal schnell abzuschließen.'
        ]);
      }
    } else {
      try {
        const tips = await getNegotiationFeedback(currentItem, persona, history, apiKey);
        setNegotiationTips(tips.split('\n').filter(line => line.trim().length > 0));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = { sender: 'user', text: chatInput };
    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    setChatInput('');
    setIsChatLoading(true);

    setTimeout(async () => {
      let replyText = '';
      if (!apiKey) {
        const lastUserText = userMsg.text.toLowerCase();
        if (selectedPersona.id === 'feilscher') {
          if (lastUserText.includes('schmerzgrenze') || lastUserText.includes('deal') || lastUserText.includes('ok') || lastUserText.includes('abholen') || lastUserText.includes('einverstanden')) {
            replyText = `Super, machen wir so! Wann passt es dir wegen der Abholung?`;
          } else {
            const botOffer = currentItem.minimumPrice 
              ? Math.max(5, Math.round(currentItem.minimumPrice * 0.85)) 
              : Math.round((currentItem.suggestedPrice || 50) * 0.7);
            replyText = `Das ist mir echt zu teuer. Lass uns die Mitte machen, z.B. ${botOffer} €, okay?`;
          }
        } else if (selectedPersona.id === 'skeptiker') {
          if (lastUserText.includes('kratzer') || lastUserText.includes('mängel') || lastUserText.includes('zustand')) {
            replyText = `Danke für die ehrliche Antwort. Lässt sich am Preis noch ein wenig was machen?`;
          } else {
            replyText = `Alles klar. Ich würde es gerne kaufen, wenn wir uns auf einen fairen Preis einigen können.`;
          }
        } else {
          replyText = `Klingt sehr gut! Ich würde den Artikel gerne nehmen. Sende mir einfach deine Bankdaten oder deinen PayPal-Link.`;
        }
      } else {
        try {
          replyText = await chatWithBuyer(currentItem, selectedPersona, updatedHistory, apiKey);
        } catch {
          replyText = 'Ok, verstehe. Können wir uns trotzdem einigen?';
        }
      }

      const finalHistory = [...updatedHistory, { sender: 'buyer', text: replyText }];
      setChatHistory(finalHistory);
      setIsChatLoading(false);
      updateNegotiationTips(finalHistory, selectedPersona);
    }, 1500);
  };

  const handleSuggestReply = async () => {
    if (chatHistory.length === 0 || isChatLoading) return;
    showToast('Generiere Antwortvorschlag...');
    try {
      let suggestion = '';
      if (!apiKey) {
        if (selectedPersona.id === 'feilscher') {
          const limit = currentItem.minimumPrice || Math.round((currentItem.suggestedPrice || 50) * 0.85);
          suggestion = `Hallo! Vielen Dank für dein Angebot, aber unter ${limit} € kann ich den Artikel leider nicht abgeben. Er ist in einem top Zustand.`;
        } else {
          suggestion = `Hallo! Gerne können wir uns auf einen Preis von ${Math.round((currentItem.suggestedPrice || 50) * 0.95)} € inklusive Versand einigen. Passt das für dich?`;
        }
      } else {
        suggestion = await suggestResponse(currentItem, selectedPersona, chatHistory, apiKey);
      }
      setChatInput(suggestion);
      showToast('Antwortvorschlag eingefügt!');
    } catch (err) {
      console.error(err);
      showToast('Konnte keinen Antwortvorschlag generieren.');
    }
  };

  const handleCloseDeal = () => {
    const prices = chatHistory
      .map(m => m.text.match(/\b\d+(?:[.,]\d+)?\b/g))
      .filter(Boolean)
      .flat()
      .map(p => parseFloat(p.replace(',', '.')));
    const lastPrice = prices.length > 0 ? prices[prices.length - 1] : currentItem.suggestedPrice;
    onOpenSoldModal(lastPrice);
  };

  const getLastBuyerOffer = () => {
    if (chatHistory.length === 0) return null;
    const lastBuyerMsg = [...chatHistory].reverse().find(msg => msg.sender === 'buyer');
    if (!lastBuyerMsg) return null;
    
    const prices = lastBuyerMsg.text.match(/\b\d+(?:[.,]\d+)?\b/g);
    if (!prices || prices.length === 0) return null;
    
    return parseFloat(prices[prices.length - 1].replace(',', '.'));
  };

  const lastOffer = getLastBuyerOffer();
  const isBelowLimit = lastOffer !== null && currentItem.minimumPrice && lastOffer < currentItem.minimumPrice;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', marginTop: '10px' }}>
      {!selectedPersona ? (
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Wähle einen Käufer zum Üben der Verhandlung:
          </h4>
          <div className="persona-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {BUYER_PERSONAS.map((p) => (
              <button
                key={p.id}
                type="button"
                className="persona-card"
                style={{ textAlign: 'left', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px', cursor: 'pointer', transition: 'var(--transition-smooth)' }}
                onClick={() => handleStartChat(p)}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 700 }}>
                  <span>{p.emoji}</span>
                  <span style={{ color: '#fff' }}>{p.name}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.4 }}>
                  {p.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Verhandlungs-Simulator</h4>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              onClick={() => setSelectedPersona(null)}
            >
              Anderen Käufer wählen
            </button>
          </div>

          <div className="chat-container" style={{ display: 'flex', flexDirection: 'column', height: '500px' }}>
            {/* Messenger Header inside container */}
            <div style={{ 
              background: '#232936', 
              borderBottom: '1px solid var(--border-color)', 
              padding: '12px 16px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  background: 'var(--primary-bg)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  border: '1px solid var(--border-color)'
                }}>
                  {selectedPersona.emoji}
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: '#fff' }}>{selectedPersona.name}</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                    <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--accent-emerald)', borderRadius: '50%', display: 'inline-block' }}></span>
                    Online
                  </span>
                </div>
              </div>
              
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '3px 8px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                {selectedPersona.id === 'feilscher' ? '🔥 Feilscht gern' : selectedPersona.id === 'skeptiker' ? '🧐 Sehr genau' : '🤝 Direkt'}
              </span>
            </div>

            {/* Chat Messages */}
            <div className="chat-messages" style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`chat-message ${msg.sender}`}>
                  <span className="chat-sender-name">
                    {msg.sender === 'user' ? 'Du (Verkäufer)' : selectedPersona.name}
                  </span>
                  <div className="chat-bubble">
                    {msg.text}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="typing-indicator">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              )}
            </div>

            {/* Below Schmerzgrenze Warning */}
            {isBelowLimit && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', margin: '0 12px 10px 12px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', color: '#f87171', fontSize: '0.82rem' }}>
                <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                <span>Angebot liegt unter deiner Schmerzgrenze von {currentItem.minimumPrice} €.</span>
              </div>
            )}

            {/* Quick Replies Bar */}
            <div className="quick-replies-bar" style={{ 
              display: 'flex', 
              gap: '8px', 
              overflowX: 'auto', 
              padding: '10px 12px', 
              background: 'rgba(22, 26, 36, 0.2)', 
              borderTop: '1px solid var(--border-color)',
              whiteSpace: 'nowrap',
              scrollbarWidth: 'none'
            }}>
              {[
                { label: '👋 Hallo', text: 'Hallo! Ja, der Artikel ist noch da.' },
                { label: '💰 Festpreis', text: `Das ist ein Festpreis, da kann ich leider am Preis nichts mehr machen.` },
                { label: '🛑 Zu wenig', text: 'Nein, tut mir leid, das Angebot ist mir leider zu wenig.' },
                { label: '📦 Versand', text: `Versand wäre möglich. Das würde als DHL Paket versichert 5,49 € extra kosten.` },
                { label: '🤝 Abholung', text: 'Abholung ist möglich. Wann würde es dir denn zeitlich passen?' }
              ].map((reply, idx) => (
                <button
                  key={idx}
                  type="button"
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    borderRadius: '20px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setChatInput(reply.text)}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                >
                  {reply.label}
                </button>
              ))}
            </div>

            {/* Input bar */}
            <div className="chat-input-bar">
              <input
                type="text"
                className="input-field"
                style={{ margin: 0, flex: 1 }}
                placeholder="Schreibe eine Nachricht..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                disabled={isChatLoading}
              />
              <button
                type="button"
                className="btn btn-primary"
                style={{ padding: '10px', minWidth: '40px', display: 'flex', justifyContent: 'center' }}
                onClick={handleSendMessage}
                disabled={isChatLoading || !chatInput.trim()}
              >
                <Send size={16} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1, fontSize: '0.85rem', gap: '6px', justifyContent: 'center' }}
              onClick={handleSuggestReply}
              disabled={isChatLoading || chatHistory.length === 0}
            >
              <Lightbulb size={14} style={{ color: 'var(--accent-amber)' }} />
              Antwort vorschlagen
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ flex: 1, fontSize: '0.85rem', backgroundColor: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald)', gap: '6px', justifyContent: 'center' }}
              onClick={handleCloseDeal}
            >
              <Check size={14} />
              Deal abschließen
            </button>
          </div>

          {/* Negotiation Feedback Tips */}
          {negotiationTips.length > 0 && (
            <div className="negotiation-tip-box" style={{ marginTop: '16px', padding: '16px', background: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.1)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)', fontWeight: 600, fontSize: '0.9rem' }}>
                <Sparkles size={14} />
                <span>Verhandlungstipps</span>
              </div>
              <ul style={{ listStyleType: 'none', padding: 0, margin: '8px 0 0 0' }}>
                {negotiationTips.map((tip, idx) => (
                  <li key={idx} style={{ margin: '6px 0', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', gap: '6px', alignItems: 'baseline' }}>
                    <span style={{ color: 'var(--accent-emerald)' }}>•</span>
                    <span>{tip.replace(/^-\s*/, '')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Amazon 2.0 – Custom Synthetic AI Voice Personas Engine
// ============================================================

export interface VoicePersona {
  id: string;
  name: string;
  role: string;
  avatar: string;
  pitch: number; // 0.5 to 2.0
  rate: number; // 0.5 to 2.0
  greeting: string;
  accentColor: string;
  sampleCatchphrase: string;
}

export const VOICE_PERSONAS: VoicePersona[] = [
  {
    id: 'tech-guru',
    name: 'Tech-Guru Max',
    role: 'Hardware & Performance Experte',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
    pitch: 1.1,
    rate: 1.05,
    greeting: 'Hi! Lass uns die besten Specs und maximale Performance für dich herausholen!',
    accentColor: '#3b82f6',
    sampleCatchphrase: 'Die Benchmark-Werte und der verbaute Chipsatz sind absolute Spitzenklasse!',
  },
  {
    id: 'bargain-hunter',
    name: 'Sparfuchs Sophie',
    role: 'Deal- & Cashback-Jägerin',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120',
    pitch: 1.3,
    rate: 1.1,
    greeting: 'Hallo Schnäppchenjäger! Ich finde für dich jeden geheimen Rabatt und Gutscheincode!',
    accentColor: '#10b981',
    sampleCatchphrase: 'Achtung Deal-Alarm! Mit diesem Rabattcode sparst du heute richtig viel Geld!',
  },
  {
    id: 'luxury-expert',
    name: 'Luxus-Berater Alexander',
    role: 'Premium- & Design-Kurator',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120',
    pitch: 0.85,
    rate: 0.95,
    greeting: 'Guten Tag. Lassen Sie uns die feinsten Materialien und edelstes Design entdecken.',
    accentColor: '#f59e0b',
    sampleCatchphrase: 'Eine exzellente Wahl. Dieses Produkt besticht durch zeitlose Eleganz und Haptik.',
  },
  {
    id: 'cyberpunk-ai',
    name: 'Cyberpunk AI 2077',
    role: 'Synthetische Zukunfts-KI',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120',
    pitch: 0.7,
    rate: 1.15,
    greeting: 'System online. Starte neuronale Produkt-Telemetrie und Datenstrom.',
    accentColor: '#ec4899',
    sampleCatchphrase: 'Neuronale Analyse abgeschlossen: Maximale Rechenleistung und Quanten-Effizienz verifiziert.',
  },
];

const STORAGE_KEY = 'amazon2_active_persona';
let inMemoryActivePersonaId = 'tech-guru';

export function getActiveVoicePersona(): VoicePersona {
  try {
    if (typeof localStorage !== 'undefined') {
      const id = localStorage.getItem(STORAGE_KEY);
      if (id) {
        return VOICE_PERSONAS.find(p => p.id === id) || VOICE_PERSONAS[0];
      }
    }
  } catch {
    // ignore
  }
  return VOICE_PERSONAS.find(p => p.id === inMemoryActivePersonaId) || VOICE_PERSONAS[0];
}

export function setActiveVoicePersona(id: string): void {
  inMemoryActivePersonaId = id;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, id);
    }
  } catch (e) {
    console.error('Failed to set active voice persona', e);
  }
}

export function speakWithActivePersona(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const persona = getActiveVoicePersona();

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE';
  utterance.pitch = persona.pitch;
  utterance.rate = persona.rate;

  const voices = window.speechSynthesis.getVoices();
  const deVoice = voices.find(v => v.lang.startsWith('de')) || voices[0];
  if (deVoice) utterance.voice = deVoice;

  window.speechSynthesis.speak(utterance);
}

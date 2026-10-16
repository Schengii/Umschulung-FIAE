// ============================================================
// Amazon 2.0 – Live Shopping Radio & Podcast Mini-Player
// ============================================================
import { isAudioMuted, playSound } from '../utils/audio';
import { showToast } from './toast';

interface RadioStation {
  id: string;
  title: string;
  host: string;
  genre: string;
  icon: string;
  nowPlaying: string;
}

export const STATIONS: RadioStation[] = [
  {
    id: 'deals-radar',
    title: '⚡ Deal Radar Live',
    host: 'Tech-Redaktion',
    genre: 'Top-Angebote & Trends',
    icon: '📻',
    nowPlaying: 'Blitzangebote-Analyse: Die besten Smart-Home Deals der Woche',
  },
  {
    id: 'tech-talk',
    title: '🎙️ Gear & Gadgets Talk',
    host: 'Alex & Marina',
    genre: 'Hardware-Podcast',
    icon: '🎙️',
    nowPlaying: 'Episode #42: Die Zukunft von 3D-Shopping und WebXR',
  },
  {
    id: 'chill-lounge',
    title: '🎧 Chill Shopping Lounge',
    host: 'Ambient Sound Lab',
    genre: 'Lo-Fi Beats & Vibes',
    icon: '🎧',
    nowPlaying: 'Smooth Electronic Chords for Relaxed Browsing',
  },
];

let currentStationIdx = 0;
let isPlaying = false;
let radioBarEl: HTMLElement | null = null;
let audioCtx: AudioContext | null = null;
let oscillatorNode: OscillatorNode | null = null;
let gainNode: GainNode | null = null;

export function initShoppingRadio(): void {
  if (typeof document === 'undefined') return;

  radioBarEl = document.createElement('aside');
  radioBarEl.id = 'shoppingRadioBar';
  radioBarEl.className = 'shopping-radio-bar';
  radioBarEl.setAttribute('role', 'region');
  radioBarEl.setAttribute('aria-label', 'Shopping Radio & Podcast Player');
  document.body.appendChild(radioBarEl);

  renderRadioBar();
}

function renderRadioBar(): void {
  if (!radioBarEl) return;

  const station = STATIONS[currentStationIdx];

  radioBarEl.innerHTML = `
    <div class="radio-bar-inner">
      <div class="radio-station-badge">
        <span class="radio-live-indicator ${isPlaying ? 'live' : ''}"></span>
        <span class="station-icon">${station.icon}</span>
        <div class="station-meta">
          <strong>${station.title}</strong>
          <span class="now-playing-ticker">${station.nowPlaying}</span>
        </div>
      </div>

      <!-- Equalizer animation -->
      <div class="radio-eq-bars ${isPlaying ? 'playing' : ''}">
        <span></span><span></span><span></span><span></span>
      </div>

      <!-- Controls -->
      <div class="radio-controls">
        <button class="radio-ctrl-btn" id="prevStationBtn" title="Vorheriger Sender">⏮</button>
        <button class="radio-play-btn ${isPlaying ? 'active' : ''}" id="toggleRadioPlayBtn" title="${isPlaying ? 'Pause' : 'Play'}">
          ${isPlaying ? '⏸' : '▶'}
        </button>
        <button class="radio-ctrl-btn" id="nextStationBtn" title="Nächster Sender">⏭</button>
      </div>
    </div>
  `;

  // Wire events
  document.getElementById('toggleRadioPlayBtn')?.addEventListener('click', togglePlay);
  document.getElementById('nextStationBtn')?.addEventListener('click', nextStation);
  document.getElementById('prevStationBtn')?.addEventListener('click', prevStation);
}

export function togglePlay(): void {
  isPlaying = !isPlaying;

  if (isPlaying) {
    startRadioSynth();
    playSound('click');
    showToast(`📻 Radio läuft: ${STATIONS[currentStationIdx].title}`, 'info');
  } else {
    stopRadioSynth();
  }

  renderRadioBar();
}

export function nextStation(): void {
  currentStationIdx = (currentStationIdx + 1) % STATIONS.length;
  playSound('click');
  showToast(`📻 Sender gewechselt: ${STATIONS[currentStationIdx].title}`, 'info');
  if (isPlaying) {
    startRadioSynth();
  }
  renderRadioBar();
}

export function prevStation(): void {
  currentStationIdx = (currentStationIdx - 1 + STATIONS.length) % STATIONS.length;
  playSound('click');
  showToast(`📻 Sender gewechselt: ${STATIONS[currentStationIdx].title}`, 'info');
  if (isPlaying) {
    startRadioSynth();
  }
  renderRadioBar();
}

function startRadioSynth(): void {
  if (isAudioMuted() || typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    stopRadioSynth();

    const station = STATIONS[currentStationIdx];
    const baseFreq = station.id === 'deals-radar' ? 220 : station.id === 'tech-talk' ? 174.61 : 130.81;

    oscillatorNode = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();

    oscillatorNode.type = 'sine';
    oscillatorNode.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0.015, audioCtx.currentTime);

    oscillatorNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillatorNode.start();
  } catch {
    // Ignore audio autoplay restrictions
  }
}

function stopRadioSynth(): void {
  try {
    if (oscillatorNode) {
      oscillatorNode.stop();
      oscillatorNode.disconnect();
      oscillatorNode = null;
    }
  } catch {
    // Ignore
  }
}

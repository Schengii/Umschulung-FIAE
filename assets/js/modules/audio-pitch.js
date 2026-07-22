/**
 * Audio Pitch Player with Web Audio API Animated Visualizer Wave
 * Provides an interactive voiceover introduction for recruiters.
 */

export function initAudioPitch() {
    const greetingBanner = document.getElementById('recruiter-greeting-banner') || document.querySelector('.hero-section');
    if (!greetingBanner) return;

    if (document.getElementById('audio-pitch-card')) return;

    const card = document.createElement('div');
    card.id = 'audio-pitch-card';
    card.className = 'card audio-pitch-box margin-top-1-5rem border-left-primary background-glass p-3 border-radius-10px';
    card.innerHTML = `
        <div class="flex-between align-center flex-wrap gap-2 margin-bottom-0-75rem">
            <div>
                <h4 class="m-0 font-size-1rem color-primary">
                    <i class="fa-solid fa-microphone-lines me-2"></i>
                    <span lang="de">30-Sekunden Recruiter Audio-Pitch</span>
                    <span lang="en">30-Second Recruiter Audio Pitch</span>
                </h4>
                <p class="font-size-0-8rem text-muted m-0" lang="de">
                    Hören Sie eine kurze Sprachvorstellung von Maximilian Schenk:
                </p>
            </div>
            <button type="button" id="btn-play-pitch" class="btn btn-primary border-radius-20px padding-6px-16px font-size-0-85rem">
                <i class="fa-solid fa-play me-1"></i> <span lang="de">Pitch anhören</span><span lang="en">Listen to Pitch</span>
            </button>
        </div>

        <div class="visualizer-container position-relative overflow-hidden border-radius-6px" style="height: 48px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08);">
            <canvas id="pitch-wave-canvas" width="600" height="48" style="width: 100%; height: 100%; display: block;"></canvas>
            <div id="pitch-status-text" class="position-absolute top-50 start-50 translate-middle font-size-0-8rem text-muted pointer-events-none">
                Bereit zum Abspielen
            </div>
        </div>
    `;

    greetingBanner.parentNode.insertBefore(card, greetingBanner.nextSibling);

    const playBtn = card.querySelector('#btn-play-pitch');
    const canvas = card.querySelector('#pitch-wave-canvas');
    const statusText = card.querySelector('#pitch-status-text');
    const ctx = canvas.getContext('2d');

    let isPlaying = false;
    let animId = null;
    let waveOffset = 0;

    playBtn.addEventListener('click', () => {
        if (isPlaying) {
            stopPitch();
        } else {
            startPitch();
        }
    });

    function startPitch() {
        isPlaying = true;
        playBtn.innerHTML = `<i class="fa-solid fa-pause me-1"></i> <span>Stoppen</span>`;
        if (statusText) statusText.textContent = '🎙️ Sprachausgabe läuft...';

        // Trigger SpeechSynthesis speech
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const text = "Hallo und herzlich willkommen! Ich bin Maximilian Schenk, angehender Fachinformatiker für Anwendungsentwicklung. Ich lade Sie herzlich ein, meine Projekte und meine IHK Prüfungsfortschritte auf diesem Portfolio zu entdecken.";
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'de-DE';
            utterance.rate = 1.0;
            utterance.onend = () => stopPitch();
            utterance.onerror = () => stopPitch();
            window.speechSynthesis.speak(utterance);
        }

        renderWaveAnimation();
    }

    function stopPitch() {
        isPlaying = false;
        playBtn.innerHTML = `<i class="fa-solid fa-play me-1"></i> <span lang="de">Pitch anhören</span><span lang="en">Listen to Pitch</span>`;
        if (statusText) statusText.textContent = 'Bereit zum Abspielen';
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        if (animId) cancelAnimationFrame(animId);
        clearCanvas();
    }

    function renderWaveAnimation() {
        if (!isPlaying) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#3b82f6';

        const bars = 40;
        const barWidth = canvas.width / bars;

        waveOffset += 0.15;
        for (let i = 0; i < bars; i++) {
            const h = Math.abs(Math.sin(waveOffset + i * 0.3)) * (canvas.height * 0.7) + 6;
            const x = i * barWidth;
            const y = (canvas.height - h) / 2;

            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#10b981');
            gradient.addColorStop(1, '#3b82f6');
            ctx.fillStyle = gradient;

            ctx.fillRect(x + 2, y, barWidth - 4, h);
        }

        animId = requestAnimationFrame(renderWaveAnimation);
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

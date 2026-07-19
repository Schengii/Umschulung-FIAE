/**
 * Premium Effects Phase 2 Module — Page transitions and Web Audio API synthesized interface sounds.
 */

export function initPremiumEffectsP2() {
    // 1. Initialize Page Transition Overlay
    initPageTransitions();

    // 2. Initialize UI Audio Core
    initUIAudio();
}

/**
 * Creates a global transition overlay and intercepts link clicks to animate transitions
 */
function initPageTransitions() {
    // Check if overlay already exists
    let overlay = document.querySelector('.page-transition-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay active'; // start active to fade in
        
        const spinner = document.createElement('div');
        spinner.className = 'transition-spinner';
        overlay.appendChild(spinner);
        
        document.body.appendChild(overlay);
    }

    // Fade out overlay on load (entry transition)
    setTimeout(() => {
        overlay.classList.remove('active');
    }, 100);

    // Intercept internal clicks
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        const target = link.getAttribute('target');

        // Check if it is a valid internal navigation link
        if (
            href &&
            !href.startsWith('#') &&
            !href.startsWith('javascript:') &&
            !href.startsWith('mailto:') &&
            !href.startsWith('tel:') &&
            target !== '_blank' &&
            !e.ctrlKey &&
            !e.metaKey &&
            !e.shiftKey
        ) {
            e.preventDefault();
            
            // Play click sound
            playAudioCue('click');
            
            // Fade in transition overlay
            overlay.classList.add('active');
            
            // Navigate after fade duration
            setTimeout(() => {
                window.location.href = href;
            }, 350);
        }
    });
}

/**
 * Synthesizes high-fidelity click and hover UI sound effects using Web Audio API
 */
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

function playAudioCue(type) {
    // Check if audio effects are enabled (default: true)
    if (localStorage.getItem('audio_effects_enabled') === 'false') return;

    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        if (type === 'hover') {
            // High-pass dynamic blip
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1000, now);
            osc.frequency.exponentialRampToValueAtTime(450, now + 0.05);
            gain.gain.setValueAtTime(0.005, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === 'click') {
            // Rich mechanical click
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(650, now);
            osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);
            gain.gain.setValueAtTime(0.035, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
        }
    } catch (err) {
        console.warn('Audio synthesis failed:', err);
    }
}

function initUIAudio() {
    // Default audio toggle config
    if (localStorage.getItem('audio_effects_enabled') === null) {
        localStorage.setItem('audio_effects_enabled', 'true');
    }

    // Attach hover/click sounds to interactive elements
    const selectors = 'a, button, .card, .nav-item, input, select';
    
    document.addEventListener('mouseover', (e) => {
        const el = e.target.closest(selectors);
        if (el) {
            // Debounce or filter out continuous hovers on identical target
            if (el.dataset.audioHovered !== 'true') {
                el.dataset.audioHovered = 'true';
                playAudioCue('hover');
                setTimeout(() => {
                    delete el.dataset.audioHovered;
                }, 250);
            }
        }
    });

    document.addEventListener('click', (e) => {
        const el = e.target.closest(selectors);
        if (el) {
            // If the element clicked is the audio toggle itself, handle the state flip
            if (el.id === 'audio-toggle') {
                e.preventDefault();
                e.stopPropagation();
                const isEnabled = localStorage.getItem('audio_effects_enabled') !== 'false';
                const newStatus = !isEnabled;
                localStorage.setItem('audio_effects_enabled', String(newStatus));
                
                const icon = el.querySelector('i');
                if (icon) {
                    icon.className = `fa-solid ${newStatus ? 'fa-volume-high' : 'fa-volume-xmark'}`;
                }
                
                if (window.showToast) {
                    window.showToast(newStatus ? 'Sound-Effekte aktiviert' : 'Sound-Effekte deaktiviert', 'success');
                }
                
                if (newStatus) {
                    playAudioCue('click');
                }
                return;
            }
            playAudioCue('click');
        }
    });
}


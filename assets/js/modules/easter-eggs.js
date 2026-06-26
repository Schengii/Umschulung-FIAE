/**
 * Easter Egg Module — Konami Code + Hidden Features
 * ↑ ↑ ↓ ↓ ← → ← → B A triggers a secret celebration
 */
function initEasterEggs() {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
        // Skip if typing in inputs
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;

        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                konamiIndex = 0;
                triggerEasterEgg();
            }
        } else {
            konamiIndex = 0;
        }
    });

    function triggerEasterEgg() {
        // Fire confetti
        if (typeof Confetti !== 'undefined') {
            Confetti.start(5000);
        }

        // Play victory sound
        if (typeof GameAudio !== 'undefined') {
            GameAudio.play('win');
        }

        // Show easter egg message
        const msg = document.createElement('div');
        msg.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea, #764ba2); color: white;
            padding: 2rem 3rem; border-radius: 1rem; z-index: 100000;
            font-size: 1.5rem; font-weight: 700; text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: easterEggPop 0.5s ease-out;
        `;
        msg.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 0.5rem;">🎉🥚🎮</div>
            <div><span lang="de">Easter Egg gefunden!</span><span lang="en">Easter Egg found!</span></div>
            <div style="font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.8;">
                <span lang="de">Du hast den Konami Code entdeckt!</span>
                <span lang="en">You discovered the Konami Code!</span>
            </div>
        `;
        document.body.appendChild(msg);

        // Track achievement
        if (typeof Achievements !== 'undefined') {
            Achievements.unlock('konami_master');
        }

        setTimeout(() => {
            msg.style.transition = 'opacity 0.5s ease';
            msg.style.opacity = '0';
            setTimeout(() => msg.remove(), 500);
        }, 4000);
    }
}

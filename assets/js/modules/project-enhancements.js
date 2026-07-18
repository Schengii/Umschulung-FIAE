/**
 * Project Enhancements Module
 * Implements the Project Matchmaker Wizard and Live Demo Iframe container logic.
 */
export function initProjectEnhancements() {
    initProjectMatchmaker();
    initLiveDemoIframe();
}

function initProjectMatchmaker() {
    const matchButtons = document.querySelectorAll('.btn-match');
    const resultDiv = document.getElementById('matchmaker-result');

    if (!matchButtons.length || !resultDiv) return;

    const recommendations = {
        games: {
            titleDe: "🏰 BurgenGame — 2D-Aufbaustrategiespiel",
            titleEn: "🏰 BurgenGame — 2D Strategy Game",
            descDe: "Ein voll spielbares 2D-Aufbaustrategiespiel mit Ressourcen-Zyklen, Bau- und Upgradelogik und Speicherung.",
            descEn: "A fully playable 2D city-builder strategy game featuring resource cycles, building upgrade logic, and persistence.",
            linkDe: "BurgenGame testen",
            linkEn: "Try BurgenGame",
            url: "Projekte/BurgenGame/index.html"
        },
        web: {
            titleDe: "⏱️ Arbeitszeiterfassung — PWA Zeiterfassung",
            titleEn: "⏱️ Arbeitszeiterfassung — Time Tracker PWA",
            descDe: "Erfassung von Arbeitsstunden, Überstunden und Abwesenheiten mit SVG Analytics.",
            descEn: "Track working hours, overtime, and absences with SVG analytics.",
            linkDe: "Arbeitszeiterfassung testen",
            linkEn: "Try Time Tracker",
            url: "Projekte/arbeitszeiterfassung/index.html"
        },
        ai: {
            titleDe: "🍳 EcoChef — KI-Rezept-Zauberer",
            titleEn: "🍳 EcoChef — AI Recipe Wizard",
            descDe: "IHK-Abschlussarbeit (Hybrid-App) – ein intelligenter Rezept-Assistent mit der Gemini-KI und Sprachausgabe.",
            descEn: "IHK final graduation project (hybrid app) – intelligent recipe assistant using Gemini AI and speech synthesis.",
            linkDe: "EcoChef Details ansehen",
            linkEn: "View EcoChef Details",
            url: "Projekte/EcoChef/www/index.html"
        }
    };

    matchButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            matchButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const matchType = btn.getAttribute('data-match');
            const rec = recommendations[matchType];
            const lang = document.documentElement.getAttribute('lang') || 'de';

            if (rec) {
                resultDiv.style.display = 'block';
                resultDiv.innerHTML = `
                    <div style="font-weight: 700; color: var(--primary); margin-bottom: 0.25rem;">
                        ${lang === 'de' ? 'Unsere Empfehlung:' : 'Our Recommendation:'}
                    </div>
                    <strong>${lang === 'de' ? rec.titleDe : rec.titleEn}</strong>
                    <p style="margin: 4px 0 8px 0; font-size: 0.85rem; color: var(--text-secondary);">${lang === 'de' ? rec.descDe : rec.descEn}</p>
                    <button type="button" class="btn-primary open-demo-btn" data-url="${rec.url}" data-title="${lang === 'de' ? rec.titleDe : rec.titleEn}" style="font-size: 0.75rem; padding: 4px 8px; border-radius: 4px; border: none; cursor: pointer;">
                        ${lang === 'de' ? rec.linkDe : rec.linkEn}
                    </button>
                `;

                // Add listener to the dynamically generated button
                const demoBtn = resultDiv.querySelector('.open-demo-btn');
                if (demoBtn) {
                    demoBtn.addEventListener('click', () => {
                        window.dispatchEvent(new CustomEvent('openlivedemo', {
                            detail: { url: rec.url, title: lang === 'de' ? rec.titleDe : rec.titleEn }
                        }));
                    });
                }
            }
        });
    });

    document.addEventListener('langchange', () => {
        const activeBtn = document.querySelector('.btn-match.active');
        if (activeBtn) activeBtn.click();
    });
}

function initLiveDemoIframe() {
    const demoModal = document.getElementById('demo-modal');
    const demoClose = document.getElementById('demo-modal-close');
    const demoIframe = document.getElementById('demo-iframe');
    const demoTitle = document.getElementById('demo-modal-title');

    if (!demoModal || !demoClose || !demoIframe || !demoTitle) return;

    window.addEventListener('openlivedemo', (e) => {
        const { url, title } = e.detail;
        demoTitle.textContent = title;
        demoIframe.src = url;
        demoModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    function closeDemo() {
        demoModal.style.display = 'none';
        demoIframe.src = 'about:blank';
        document.body.style.overflow = '';
    }

    demoClose.addEventListener('click', closeDemo);
    demoModal.addEventListener('click', (e) => {
        if (e.target === demoModal) closeDemo();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && demoModal.style.display === 'flex') closeDemo();
    });
}

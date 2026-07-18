/**
 * About Me Enhancements Module
 * Implements the interactive Electronics-Developer Skill Bridge and the Certificates Carousel.
 */
export function initAboutMeEnhancements() {
    initSkillBridge();
    initCertificatesCarousel();
}

function initSkillBridge() {
    const bridgeButtons = document.querySelectorAll('.bridge-buttons button');
    const displayEl = document.getElementById('bridge-display');

    if (!bridgeButtons.length || !displayEl) return;

    const bridgeData = {
        trouble: {
            titleDe: "Systematisches Troubleshooting",
            titleEn: "Systematic Troubleshooting",
            de: "Elektronik: Aufspüren von Wackelkontakten und Sensorstörungen in riesigen Haribo-Produktionsstraßen.<br><br><strong>IT-Transfer:</strong> Exakt dieselbe analytische Vorgehensweise (Signale messen, Pfade isolieren) hilft beim Debuggen von REST-API-Aufrufen und komplexen JS-Event-Chains.",
            en: "Electronics: Locating faulty contacts and sensor glitches in huge Haribo production lines.<br><br><strong>IT-Transfer:</strong> The exact same analytical approach (measuring signals, isolating paths) helps debug REST API requests and complex JS event chains."
        },
        security: {
            titleDe: "Sicherheitsbewusstsein (SecOps)",
            titleEn: "Security Awareness (SecOps)",
            de: "Elektronik: Strikte Einhaltung von DGUV-V3-Schutzvorschriften bei Arbeiten an 400V-Anlagen.<br><br><strong>IT-Transfer:</strong> Ein natürlicher Respekt vor Risiken führt zu sauberem Input-Validation, sicheren Environment-Variablen und robustem Error-Handling im Code.",
            en: "Electronics: Strict compliance with safety regulations (DGUV-V3) when working on 400V machinery.<br><br><strong>IT-Transfer:</strong> A natural respect for operational hazards leads to clean input validation, secure environment variables, and robust error handling."
        },
        logic: {
            titleDe: "Prozesslogik & Zustände",
            titleEn: "Process Logic & States",
            de: "Elektronik: Programmierung von Ablaufsteuerungen in SPS (TIA Portal) mittels Grafcet.<br><br><strong>IT-Transfer:</strong> Die Modellierung von physischen Anlagen als Zustandsautomaten (Finite State Machines) bildet das perfekte Fundament für State Management (React Context, Redux) und reaktive Benutzeroberflächen.",
            en: "Electronics: Programming step-by-step logic in PLCs (TIA Portal) using Grafcet.<br><br><strong>IT-Transfer:</strong> Modeling physical systems as finite state machines is the perfect foundation for UI state management (React Context, Redux) and reactive components."
        }
    };

    function updateBridge(key) {
        const lang = document.documentElement.getAttribute('lang') || 'de';
        const item = bridgeData[key];
        if (!item) return;

        displayEl.innerHTML = `
            <h4 style="margin-top: 0; color: var(--primary);">${lang === 'de' ? item.titleDe : item.titleEn}</h4>
            <p style="margin: 0.5rem 0 0 0; line-height: 1.5;">${lang === 'de' ? item.de : item.en}</p>
        `;
    }

    bridgeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            bridgeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateBridge(btn.getAttribute('data-bridge'));
        });
    });

    // Initialize with first tab
    updateBridge('trouble');

    document.addEventListener('langchange', () => {
        const activeBtn = document.querySelector('.bridge-buttons button.active');
        if (activeBtn) {
            updateBridge(activeBtn.getAttribute('data-bridge'));
        }
    });
}

function initCertificatesCarousel() {
    const prevBtn = document.getElementById('cert-prev');
    const nextBtn = document.getElementById('cert-next');
    const slides = document.querySelectorAll('.carousel-slide');

    if (!prevBtn || !nextBtn || !slides.length) return;

    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.style.display = i === index ? 'block' : 'none';
            if (i === index) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
    }

    prevBtn.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    });

    nextBtn.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    });
}

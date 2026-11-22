/**
 * Skill Radar Chart Module — Interactive SVG radar visualization
 * Replaces/augments static skill bars with a visual radar chart.
 */
export function initSkillRadar() {
    const container = document.getElementById('skill-radar-container');
    if (!container) return;

    // Stufen statt Prozenten: 1 Grundkenntnisse, 2 Fortgeschritten, 3 Sicher im Einsatz
    const LEVEL_LABELS = [
        '',
        'Grundkenntnisse / Basic knowledge',
        'Fortgeschritten / Intermediate',
        'Sicher im Einsatz / Confident in use',
    ];
    const MAX_LEVEL = 3;
    const skills = [
        { name: 'HTML/CSS', level: 3 },
        { name: 'JavaScript', level: 3 },
        { name: 'Java/OOP', level: 2 },
        { name: 'SQL/DB', level: 2 },
        { name: 'Git', level: 3 },
        { name: 'Spring Boot', level: 1 },
        { name: 'React', level: 3 },
        { name: 'Testing', level: 2 },
        { name: 'KI/AI', level: 3 },
    ];

    const size = 280;
    const center = size / 2;
    const maxRadius = center - 40;
    const levels = MAX_LEVEL;
    const angleStep = (2 * Math.PI) / skills.length;

    let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" class="skill-radar-svg">`;

    // Draw grid circles
    for (let i = 1; i <= levels; i++) {
        const r = (maxRadius / levels) * i;
        svg += `<circle cx="${center}" cy="${center}" r="${r}" fill="none" stroke="var(--border)" stroke-width="0.5" stroke-dasharray="3,3"/>`;
    }

    // Draw axis lines and labels
    skills.forEach((skill, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const x = center + Math.cos(angle) * maxRadius;
        const y = center + Math.sin(angle) * maxRadius;

        svg += `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="var(--border)" stroke-width="0.5"/>`;

        // Label position (slightly outside)
        const labelX = center + Math.cos(angle) * (maxRadius + 22);
        const labelY = center + Math.sin(angle) * (maxRadius + 22);
        svg += `<text x="${labelX}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" fill="var(--text-secondary)" font-size="10" font-family="var(--font-sans)" class="radar-label" style="cursor:pointer;" data-skill="${skill.name}" tabindex="0" role="button" aria-label="Projekte filtern: ${skill.name}" data-en-aria-label="Filter projects: ${skill.name}">${skill.name}</text>`;
    });

    // Draw skill polygon
    let points = '';
    skills.forEach((skill, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const r = (skill.level / MAX_LEVEL) * maxRadius;
        const x = center + Math.cos(angle) * r;
        const y = center + Math.sin(angle) * r;
        points += `${x},${y} `;
    });

    svg += `<polygon points="${points.trim()}" fill="rgba(37, 99, 235, 0.15)" stroke="var(--primary)" stroke-width="2" class="radar-polygon"/>`;

    // Draw skill dots
    skills.forEach((skill, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const r = (skill.level / MAX_LEVEL) * maxRadius;
        const x = center + Math.cos(angle) * r;
        const y = center + Math.sin(angle) * r;
        svg += `<circle cx="${x}" cy="${y}" r="4" fill="var(--primary)" stroke="white" stroke-width="1.5" class="radar-dot" style="cursor:pointer;" data-skill="${skill.name}">
            <title>${skill.name}: ${LEVEL_LABELS[skill.level]}</title>
        </circle>`;
    });

    svg += `</svg>`;

    container.innerHTML = svg;

    // Attach interaction listener
    container.addEventListener('click', (e) => {
        const target = /** @type {HTMLElement} */ (e.target).closest('.radar-label, .radar-dot');
        if (target) {
            const skillName = target.getAttribute('data-skill');
            if (skillName) {
                document.dispatchEvent(new CustomEvent('radarfilter', { detail: skillName }));
            }
        }
    });

    // Keyboard access to the labels (the dots are the same filter for the mouse)
    container.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const target = /** @type {HTMLElement} */ (e.target).closest('.radar-label');
        const skillName = target?.getAttribute('data-skill');
        if (!skillName) return;
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('radarfilter', { detail: skillName }));
    });

    // Animate radar on scroll
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const polygon = container.querySelector('.radar-polygon');
                    if (polygon) {
                        polygon.style.animation = 'radarFadeIn 1s ease-out forwards';
                    }
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.3 }
    );

    observer.observe(container);
}

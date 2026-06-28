/**
 * Skill Radar Chart Module — Interactive SVG radar visualization
 * Replaces/augments static skill bars with a visual radar chart.
 */
function initSkillRadar() {
    const container = document.getElementById('skill-radar-container');
    if (!container) return;

    const skills = [
        { name: 'HTML/CSS', value: 85 },
        { name: 'JavaScript', value: 75 },
        { name: 'Java/OOP', value: 70 },
        { name: 'SQL/DB', value: 65 },
        { name: 'Git', value: 80 },
        { name: 'Spring Boot', value: 60 },
        { name: 'React', value: 55 },
        { name: 'Testing', value: 50 },
        { name: 'KI/AI', value: 70 }
    ];

    const size = 280;
    const center = size / 2;
    const maxRadius = center - 40;
    const levels = 5;
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
        svg += `<text x="${labelX}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" fill="var(--text-secondary)" font-size="10" font-family="var(--font-sans)" class="radar-label" style="cursor:pointer;" data-skill="${skill.name}">${skill.name}</text>`;
    });

    // Draw skill polygon
    let points = '';
    skills.forEach((skill, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const r = (skill.value / 100) * maxRadius;
        const x = center + Math.cos(angle) * r;
        const y = center + Math.sin(angle) * r;
        points += `${x},${y} `;
    });

    svg += `<polygon points="${points.trim()}" fill="rgba(37, 99, 235, 0.15)" stroke="var(--primary)" stroke-width="2" class="radar-polygon"/>`;

    // Draw skill dots
    skills.forEach((skill, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const r = (skill.value / 100) * maxRadius;
        const x = center + Math.cos(angle) * r;
        const y = center + Math.sin(angle) * r;
        svg += `<circle cx="${x}" cy="${y}" r="4" fill="var(--primary)" stroke="white" stroke-width="1.5" class="radar-dot" style="cursor:pointer;" data-skill="${skill.name}">
            <title>${skill.name}: ${skill.value}%</title>
        </circle>`;
    });

    svg += `</svg>`;

    container.innerHTML = svg;

    // Attach interaction listener
    container.addEventListener('click', (e) => {
        const target = e.target.closest('.radar-label, .radar-dot');
        if (target) {
            const skillName = target.getAttribute('data-skill');
            if (skillName) {
                document.dispatchEvent(new CustomEvent('radarfilter', { detail: skillName }));
            }
        }
    });

    // Animate radar on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const polygon = container.querySelector('.radar-polygon');
                if (polygon) {
                    polygon.style.animation = 'radarFadeIn 1s ease-out forwards';
                }
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    observer.observe(container);
}

/**
 * Skill Bars Module — Animated skill bar fill via IntersectionObserver
 */
function initSkillBars() {
    const skillFills = document.querySelectorAll('.skill-fill');
    if (!skillFills.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    skillFills.forEach(fill => observer.observe(fill));
}

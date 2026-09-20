/**
 * C4 Architecture Model Deep-Dive Module
 * Adds C4 Level controls (Context, Container, Component) to architecture diagrams.
 */

export const C4_DESCRIPTIONS = {
    1: 'High-Level System Overview: Interaktion zwischen Nutzer, Frontend & Cloud-Services',
    2: 'Container Diagramm: Schnittstellen zwischen Web-App, Spring Boot API & Database',
    3: 'Component View: Detaillierte Klassen, Services, DTOs & JPA Repositories',
};

export function getHotspotStyleForLevel(level, component) {
    const lvl = String(level);
    if (lvl === '1') {
        return { opacity: '1', transform: 'scale(1)' };
    }
    if (lvl === '2') {
        const isCore = component === 'database' || component === 'client';
        return { opacity: isCore ? '1' : '0.7', transform: 'scale(1.02)' };
    }
    return { opacity: '1', transform: 'scale(1.04)' };
}

export function initC4Architecture() {
    const tabsBar = document.querySelector('.arch-tabs-bar');
    if (!tabsBar) return;

    if (document.getElementById('c4-level-switcher')) return;

    const switcher = document.createElement('div');
    switcher.id = 'c4-level-switcher';
    switcher.className =
        'c4-level-bar margin-bottom-1rem p-2 background-glass border-radius-6px flex-between align-center flex-wrap gap-2';
    switcher.innerHTML = `
        <div class="d-flex align-center gap-2">
            <span class="font-weight-600 font-size-0-85rem color-primary me-2">
                <i class="fa-solid fa-layer-group me-1"></i> C4 Architecture Level:
            </span>
            <button type="button" class="btn btn-sm btn-outline-primary btn-c4-level active" data-level="1">
                L1: System Context
            </button>
            <button type="button" class="btn btn-sm btn-outline-primary btn-c4-level" data-level="2">
                L2: Container Diagram
            </button>
            <button type="button" class="btn btn-sm btn-outline-primary btn-c4-level" data-level="3">
                L3: Component View
            </button>
        </div>
        <span id="c4-level-info" class="badge badge-secondary font-size-0-8rem padding-4px-8px">
            High-Level System Overview
        </span>
    `;

    tabsBar.parentNode.insertBefore(switcher, tabsBar);

    const levelBtns = switcher.querySelectorAll('.btn-c4-level');
    const levelInfo = switcher.querySelector('#c4-level-info');

    levelBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            levelBtns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');

            const lvl = btn.dataset.level;
            if (levelInfo) levelInfo.textContent = C4_DESCRIPTIONS[lvl] || '';

            const hotspots = document.querySelectorAll('.hotspot');
            hotspots.forEach((h) => {
                h.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
                const style = getHotspotStyleForLevel(lvl, h.dataset.component);
                h.style.opacity = style.opacity;
                h.style.transform = style.transform;
            });

            if (window.showToast) {
                window.showToast(`C4 Zoom auf Level ${lvl} angepasst`, 'info');
            }
        });
    });
}

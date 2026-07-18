// assets/js/modal.js – Project detail modal handler

(function () {
  'use strict';

  const modal = document.getElementById('project-modal');
  if (!modal) return;

  const modalContent = modal.querySelector('.modal-content');
  const modalBody = document.getElementById('modal-body');

  // ── Open modal when a project card body is clicked (not on link/button) ──
  document.addEventListener('click', function (e) {
    // Close if click is on the overlay backdrop (outside modal-content)
    if (e.target === modal) {
      closeModal();
      return;
    }

    // Close if the dedicated close buttons are clicked
    if (e.target.closest('.modal-close') || e.target.id === 'modal-close-inner') {
      closeModal();
      return;
    }

    // Only open on project card click — but NOT when clicking a link or button inside the card (except the Details button)
    const card = e.target.closest('.project-card');
    if (!card) return;
    if (e.target.closest('a')) return;
    const button = e.target.closest('button');
    if (button && !button.classList.contains('btn-details')) return;

    openModal(card);
  });

  // ── Keyboard: Escape to close ──
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      closeModal();
    }
  });

  function openModal(card) {
    const titleDe  = card.dataset.titleDe  || '';
    const titleEn  = card.dataset.titleEn  || '';
    const descDe   = card.dataset.descDe   || 'Keine Beschreibung verfügbar.';
    const descEn   = card.dataset.descEn   || 'No description available.';
    const image    = card.dataset.image    || '';
    const link     = card.dataset.link     || '';
    const github   = card.dataset.github   || '';
    let tags = [];
    try {
      tags = card.dataset.tags ? JSON.parse(decodeURIComponent(card.dataset.tags)) : [];
    } catch (_) { tags = []; }

    const tagsHTML  = tags.length
      ? `<div class="tech-tags">${tags.map(t => `<span class="tech-tag">${t}</span>`).join('')}</div>`
      : '';

    // Check if there is a video playlist in window.projectsData
    const repoName = card.dataset.repoName;
    const projectData = (window.projectsData && Array.isArray(window.projectsData)) 
        ? window.projectsData.find(p => p.repoName === repoName) 
        : null;

    let images = [];
    try {
      images = card.dataset.images ? JSON.parse(decodeURIComponent(card.dataset.images)) : [];
      images = images.filter(img => img);
    } catch (_) {
      images = image ? [image] : [];
    }

    let mediaHTML = '';
    let hasPlaylist = false;
    let hasCarousel = false;

    if (projectData && Array.isArray(projectData.videoPlaylist) && projectData.videoPlaylist.length > 0) {
        hasPlaylist = true;
        const lang = document.documentElement.getAttribute('lang') || 'de';
        const playlist = projectData.videoPlaylist;
        
        const playlistOptions = playlist.map((vid, idx) => {
            const title = lang === 'de' ? vid.titleDe : vid.titleEn;
            return `<button type="button" class="video-select-btn${idx === 0 ? ' active' : ''}" data-index="${idx}" data-url="${vid.url}" style="padding: 0.35rem 0.6rem; font-size: 0.75rem; border: 1px solid var(--border); background: var(--bg-card); cursor: pointer; border-radius: var(--radius-sm); font-weight: 600; color: var(--text-secondary); transition: var(--transition);">${title}</button>`;
        }).join('\n');

        const initialVideo = playlist[0];
        const initialDesc = lang === 'de' ? initialVideo.descDe : initialVideo.descEn;

        mediaHTML = `
            <div class="modal-media-wrapper" style="margin-bottom: 1rem;">
                <div class="video-container" style="background: #000; border-radius: var(--radius-md); overflow: hidden; aspect-ratio: 16/9; max-height: 300px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border);">
                    <video id="modal-video-player" controls src="${initialVideo.url}" style="width: 100%; height: 100%; object-fit: contain;"></video>
                </div>
                <div class="video-playlist-selector" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;">
                    ${playlistOptions}
                </div>
                <p id="modal-video-description" class="small-muted" style="margin-top: 0.5rem; font-size: 0.8rem; font-style: italic; border-left: 2px solid var(--primary); padding-left: 0.5rem;">
                    ${initialDesc}
                </p>
            </div>
        `;
    } else if (images.length > 1) {
        hasCarousel = true;
        const slides = images.map(img => `
            <img src="${img}" class="carousel-slide-img" alt="${titleDe}">
        `).join('\n');
        
        const dots = images.map((_, idx) => `
            <button class="carousel-dot${idx === 0 ? ' active' : ''}" data-index="${idx}" aria-label="Slide ${idx+1}"></button>
        `).join('\n');

        mediaHTML = `
            <div class="modal-carousel-container" style="aspect-ratio:16/9; max-height:240px; margin-bottom:1rem;">
                <div class="carousel-track" id="modal-carousel-track">
                    ${slides}
                </div>
                <button class="carousel-btn prev-btn" id="carousel-prev" aria-label="Vorheriges Bild">‹</button>
                <button class="carousel-btn next-btn" id="carousel-next" aria-label="Nächstes Bild">›</button>
                <div class="carousel-dots" id="carousel-dots-container">
                    ${dots}
                </div>
            </div>
        `;
    } else if (images.length === 1) {
        mediaHTML = `
            <div class="project-image-container" style="aspect-ratio:16/9;max-height:240px;margin-bottom:1rem;">
               <img src="${images[0]}" alt="${titleDe}" class="project-image" loading="lazy">
            </div>`;
    }

    const linkHTML = link
      ? `<a href="${link}" target="_blank" rel="noopener" class="btn-project">
           <span lang="de"><i class="fa fa-external-link" aria-hidden="true"></i> Projekt öffnen</span>
           <span lang="en"><i class="fa fa-external-link" aria-hidden="true"></i> Open Project</span>
         </a>`
      : '';

    const githubHTML = github
      ? `<a href="${github}" target="_blank" rel="noopener" class="btn-project btn-github">
           <i class="fa-brands fa-github" aria-hidden="true"></i> GitHub
         </a>`
      : '';

    modalBody.innerHTML = `
      <h2 id="modal-title" lang="de" style="margin-bottom:0.25rem;">${titleDe}</h2>
      <h2 lang="en" style="margin-bottom:1rem;">${titleEn}</h2>
      ${mediaHTML}
      ${tagsHTML}
      <p lang="de" style="margin:1rem 0;">${descDe}</p>
      <p lang="en" style="margin:1rem 0;">${descEn}</p>
      <div class="modal-buttons">
        ${linkHTML}
        ${githubHTML}
        <button class="btn-project" id="modal-close-inner" style="background:#6b7280;flex:0;">
          <span lang="de">✕ Schließen</span>
          <span lang="en">✕ Close</span>
        </button>
      </div>
    `;

    // Bind click listeners for video selector buttons
    if (hasPlaylist) {
        const videoSelectButtons = modalBody.querySelectorAll('.video-select-btn');
        const player = modalBody.querySelector('#modal-video-player');
        const videoDesc = modalBody.querySelector('#modal-video-description');
        const lang = document.documentElement.getAttribute('lang') || 'de';

        if (videoSelectButtons.length && player && projectData) {
            videoSelectButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    videoSelectButtons.forEach(b => {
                        b.classList.remove('active');
                        b.style.color = '';
                        b.style.background = '';
                        b.style.borderColor = '';
                    });
                    btn.classList.add('active');
                    btn.style.color = 'var(--primary)';
                    btn.style.borderColor = 'var(--primary)';
                    btn.style.background = 'var(--primary-light)';
                    
                    const idx = parseInt(btn.dataset.index);
                    const item = projectData.videoPlaylist[idx];
                    player.src = item.url;
                    player.play().catch(() => {});
                    
                    if (videoDesc) {
                        videoDesc.textContent = lang === 'de' ? item.descDe : item.descEn;
                    }
                });
            });

            const activeBtn = modalBody.querySelector('.video-select-btn.active');
            if (activeBtn) {
                activeBtn.style.color = 'var(--primary)';
                activeBtn.style.borderColor = 'var(--primary)';
                activeBtn.style.background = 'var(--primary-light)';
            }
        }
    }

    // Bind carousel navigation click listeners
    if (hasCarousel) {
        const track = modalBody.querySelector('#modal-carousel-track');
        const prevBtn = modalBody.querySelector('#carousel-prev');
        const nextBtn = modalBody.querySelector('#carousel-next');
        const carouselDots = modalBody.querySelectorAll('.carousel-dot');
        let activeIdx = 0;
        const maxIdx = images.length - 1;

        const updateCarousel = (newIdx) => {
            activeIdx = newIdx;
            track.style.transform = `translateX(-${activeIdx * 100}%)`;
            carouselDots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === activeIdx);
            });
        };

        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const newIdx = activeIdx === 0 ? maxIdx : activeIdx - 1;
            updateCarousel(newIdx);
        });

        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const newIdx = activeIdx === maxIdx ? 0 : activeIdx + 1;
            updateCarousel(newIdx);
        });

        carouselDots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                const newIdx = parseInt(dot.dataset.index);
                updateCarousel(newIdx);
            });
        });
    }

    modal.classList.remove('hidden');
    // Force reflow then add show class for animation
    modal.offsetHeight;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Set URL hash for deep linking
    const cleanTitle = (titleDe || titleEn).replace(/[^a-zA-Z0-9]/g, '');
    window.location.hash = encodeURIComponent(cleanTitle);
  }

  function closeModal() {
    modal.classList.remove('show');
    document.body.style.overflow = '';
    // Clear URL hash
    if (window.location.hash) {
      history.pushState("", document.title, window.location.pathname + window.location.search);
    }
    // After transition, hide completely
    setTimeout(() => {
      if (!modal.classList.contains('show')) {
        modal.classList.add('hidden');
      }
    }, 320);
  }

  // Expose globally for use in other scripts if needed
  window.openProjectModal = openModal;
  window.closeProjectModal = closeModal;
})();

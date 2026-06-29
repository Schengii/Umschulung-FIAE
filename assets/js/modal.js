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

    const imageHTML = image
      ? `<div class="project-image-container" style="aspect-ratio:16/9;max-height:240px;">
           <img src="${image}" alt="${titleDe}" class="project-image" loading="lazy">
         </div>`
      : '';

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
      ${imageHTML}
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

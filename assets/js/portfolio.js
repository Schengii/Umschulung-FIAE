/**
 * Portfolio Project Manager JS
 * Handles dynamic project addition, LocalStorage persistence,
 * real-time live preview rendering, HTML code export, and custom project removal.
 */

document.addEventListener('DOMContentLoaded', () => {
    const toggleAdminBtn = document.getElementById('toggle-admin-btn');
    const adminFormContainer = document.getElementById('admin-form-container');
    const projectForm = document.getElementById('project-form');
    
    const inputTitleDe = document.getElementById('proj-title-de');
    const inputTitleEn = document.getElementById('proj-title-en');
    const inputTags = document.getElementById('proj-tags');
    const inputImage = document.getElementById('proj-image');
    const inputDescDe = document.getElementById('proj-desc-de');
    const inputDescEn = document.getElementById('proj-desc-en');
    const inputLink = document.getElementById('proj-link');
    
    const livePreviewContainer = document.getElementById('live-preview-container');
    const customProjectsContainer = document.getElementById('custom-projects-container');
    const exportSection = document.getElementById('export-section');
    const htmlExportCode = document.getElementById('html-export-code');
    const copyCodeBtn = document.getElementById('copy-code-btn');

    // Load and render existing custom projects from LocalStorage
    let customProjects = JSON.parse(localStorage.getItem('portfolio_custom_projects')) || [];
    renderCustomProjects();

    // 1. Toggle Admin Card
    if (toggleAdminBtn && adminFormContainer) {
        toggleAdminBtn.addEventListener('click', () => {
            const isCollapsed = adminFormContainer.classList.contains('collapsed');
            if (isCollapsed) {
                adminFormContainer.classList.remove('collapsed');
                toggleAdminBtn.setAttribute('aria-expanded', 'true');
                toggleAdminBtn.innerHTML = '<i class="fa fa-minus" aria-hidden="true"></i> Schließen / Close';
                updateLivePreview(); // Init preview
            } else {
                adminFormContainer.classList.add('collapsed');
                toggleAdminBtn.setAttribute('aria-expanded', 'false');
                toggleAdminBtn.innerHTML = '<i class="fa fa-plus" aria-hidden="true"></i> Neues Projekt / New Project';
            }
        });
    }

    // 2. Real-time Live Preview listeners
    const inputFields = [inputTitleDe, inputTitleEn, inputTags, inputImage, inputDescDe, inputDescEn, inputLink];
    inputFields.forEach(field => {
        if (field) {
            field.addEventListener('input', updateLivePreview);
        }
    });

    function getFormValues() {
        const titleDe = (inputTitleDe ? inputTitleDe.value.trim() : '') || '🍳 Projekt-Titel';
        const titleEn = (inputTitleEn ? inputTitleEn.value.trim() : '') || '🍳 Project Title';
        const tagsRaw = inputTags ? inputTags.value.trim() : '';
        const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(t => t) : ['HTML5', 'CSS3', 'JS'];
        const image = (inputImage ? inputImage.value.trim() : '') || 'assets/images/career_mentoring.png';
        const descDe = (inputDescDe ? inputDescDe.value.trim() : '') || 'Hier steht deine deutsche Projektbeschreibung...';
        const descEn = (inputDescEn ? inputDescEn.value.trim() : '') || 'Your English project description goes here...';
        const link = inputLink ? inputLink.value.trim() : '';

        return { titleDe, titleEn, tags, image, descDe, descEn, link };
    }

    function generateCardHTML(project, isPreview = false, index = null) {
        const tagsHTML = project.tags.map(tag => `<span class="tech-tag">${tag}</span>`).join('\n        ');
        
        let imageHTML = '';
        if (project.image) {
            imageHTML = `
    <div style="margin: 1.25rem 0; border-radius: 8px; overflow: hidden; border: 1px solid var(--border);">
        <img src="${project.image}" alt="${project.titleDe}" loading="lazy" style="width: 100%; height: auto; display: block; max-height: 350px; object-fit: cover; margin-bottom: 0;">
    </div>`;
        }

        let linkHTML = '';
        if (project.link) {
            linkHTML = `
    <div style="margin-top: 1rem;">
        <a href="${project.link}" target="_blank" rel="noopener" class="btn-primary" style="display: inline-block; width: auto; text-decoration: none; padding: 0.5rem 1rem;">
            <span lang="de"><i class="fa fa-external-link" aria-hidden="true"></i> Link öffnen</span>
            <span lang="en"><i class="fa fa-external-link" aria-hidden="true"></i> View Link</span>
        </a>
    </div>`;
        }

        let deleteBtnHTML = '';
        if (!isPreview && index !== null) {
            deleteBtnHTML = `
            <button class="btn-delete-project" data-index="${index}" title="Projekt löschen" aria-label="Projekt löschen">
                <i class="fa fa-trash" aria-hidden="true"></i>
            </button>`;
        }

        return `
<article class="card fade-in visible" style="position: relative;">
    ${deleteBtnHTML}
    <h3 lang="de">${project.titleDe}</h3>
    <h3 lang="en">${project.titleEn}</h3>
    <div class="tech-tags">
        ${tagsHTML}
    </div>
    ${imageHTML}
    <p lang="de">${project.descDe}</p>
    <p lang="en">${project.descEn}</p>
    ${linkHTML}
</article>`;
    }

    function updateLivePreview() {
        if (!livePreviewContainer) return;
        const project = getFormValues();
        livePreviewContainer.innerHTML = generateCardHTML(project, true);
        
        // Reinforce translation rules in preview
        const activeLang = document.documentElement.getAttribute('lang') || 'de';
        const deEl = livePreviewContainer.querySelectorAll('[lang="de"]');
        const enEl = livePreviewContainer.querySelectorAll('[lang="en"]');
        
        if (activeLang === 'de') {
            enEl.forEach(el => el.style.setProperty('display', 'none', 'important'));
            deEl.forEach(el => el.style.removeProperty('display'));
        } else {
            deEl.forEach(el => el.style.setProperty('display', 'none', 'important'));
            enEl.forEach(el => el.style.removeProperty('display'));
        }
    }

    // 3. Form submit to save
    if (projectForm) {
        projectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const project = getFormValues();
            
            // Save to array
            customProjects.push(project);
            localStorage.setItem('portfolio_custom_projects', JSON.stringify(customProjects));
            
            // Update container
            renderCustomProjects();
            
            // Show Export section
            if (exportSection && htmlExportCode) {
                const rawHTML = generateCardHTML(project, true).trim();
                htmlExportCode.textContent = rawHTML;
                exportSection.style.display = 'block';
            }
            
            // Reset form
            projectForm.reset();
            updateLivePreview();
        });
    }

    // 4. Render Saved Projects
    function renderCustomProjects() {
        if (!customProjectsContainer) return;
        customProjectsContainer.innerHTML = '';

        customProjects.forEach((proj, idx) => {
            const cardHTML = generateCardHTML(proj, false, idx);
            customProjectsContainer.insertAdjacentHTML('beforeend', cardHTML);
        });

        // Add delete listeners
        const deleteButtons = customProjectsContainer.querySelectorAll('.btn-delete-project');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.getAttribute('data-index'));
                const confirmDe = confirm('Möchtest du dieses Projekt wirklich aus deinem lokalen Speicher löschen?\n\nDo you really want to delete this project from your local storage?');
                if (confirmDe) {
                    customProjects.splice(idx, 1);
                    localStorage.setItem('portfolio_custom_projects', JSON.stringify(customProjects));
                    renderCustomProjects();
                    if (exportSection) exportSection.style.display = 'none';
                }
            });
        });

        // Trigger language switcher alignment
        document.dispatchEvent(new CustomEvent('langchange', { detail: document.documentElement.getAttribute('lang') || 'de' }));
    }

    // 5. Copy Code button
    if (copyCodeBtn && htmlExportCode) {
        copyCodeBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(htmlExportCode.textContent).then(() => {
                const origText = copyCodeBtn.innerHTML;
                copyCodeBtn.innerHTML = '<i class="fa fa-check"></i> Kopiert! / Copied!';
                copyCodeBtn.style.backgroundColor = '#10b981';
                setTimeout(() => {
                    copyCodeBtn.innerHTML = origText;
                    copyCodeBtn.style.backgroundColor = '';
                }, 1500);
            });
        });
    }

    // Listen to global language change to keep previews in sync
    document.addEventListener('langchange', () => {
        updateLivePreview();
    });
});

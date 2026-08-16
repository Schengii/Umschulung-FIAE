/**
 * Skill-Gap Learning Roadmap Generator Submodule
 * Generates structured learning milestones and curated free resources for missing skills.
 */

export const learningRoadmap = {
    render(container, job, profile) {
        const userSkills = profile.skills || [];
        const jobDesc = (job.description || '').toLowerCase();

        // Standard Skill Catalog & Learning Resources Map
        const skillCatalog = {
            'docker': { name: 'Docker & Containerization', time: '2-3 Tage', link: 'https://docs.docker.com/get-started/', steps: ['Grundlagen von Containern & Images', 'Dockerfile erstellen & verwalten', 'Docker Compose für Multi-Container Apps'] },
            'react': { name: 'React.js Fundamentals', time: '3-5 Tage', link: 'https://react.dev/learn', steps: ['Components, Props & State', 'Hooks (useState, useEffect, useMemo)', 'State Management & Router'] },
            'typescript': { name: 'TypeScript', time: '2-4 Tage', link: 'https://www.typescriptlang.org/docs/', steps: ['Interfaces, Types & Generics', 'Strict Mode & Type Guards', 'Integration in Build Tools'] },
            'next.js': { name: 'Next.js Framework', time: '3 Tage', link: 'https://nextjs.org/docs', steps: ['App Router & Server Components', 'Server Actions & Data Fetching', 'SEO & Performance Tuning'] },
            'node.js': { name: 'Node.js & Express', time: '3 Tage', link: 'https://nodejs.org/en/docs/', steps: ['Event Loop & Async I/O', 'REST APIs mit Express bauen', 'Middleware & Authentifizierung'] },
            'kubernetes': { name: 'Kubernetes (k8s)', time: '1 Woche', link: 'https://kubernetes.io/docs/', steps: ['Pods, Deployments & Services', 'ConfigMaps & Secrets', 'Helm Charts'] },
            'graphql': { name: 'GraphQL APIs', time: '2 Tage', link: 'https://graphql.org/learn/', steps: ['Queries, Mutations & Schemas', 'Apollo Client Integration', 'Resolvers & Subscriptions'] },
            'figma': { name: 'Figma for Developers', time: '1 Tag', link: 'https://help.figma.com/', steps: ['Auto-Layout & Components', 'Dev Mode Tokens auslesen', 'Design-to-Code Handoff'] },
            'tailwind': { name: 'TailwindCSS', time: '1 Tag', link: 'https://tailwindcss.com/docs', steps: ['Utility-First Konzept', 'Responsive Classes & Themes', 'Custom Plugins & Config'] }
        };

        const missingSkillsDetected = Object.keys(skillCatalog).filter(key => {
            return jobDesc.includes(key) && !userSkills.some(s => s.toLowerCase().includes(key));
        });

        container.innerHTML = `
            <div class="learning-roadmap-box">
                <div class="flex-between align-center" style="margin-bottom: 16px;">
                    <h3><i data-lucide="map"></i> Skill-Gap Learning Roadmap</h3>
                    <span class="badge badge-primary">${missingSkillsDetected.length} Fehlende Skills erkannt</span>
                </div>

                <p class="text-secondary" style="font-size: 0.85rem; margin-bottom: 20px;">
                    Maßgeschneiderte Lern-Roadmap für die Stelle <strong>${job.title}</strong> bei <strong>${job.company}</strong>, um bestehende Wissenslücken gezielt zu schließen:
                </p>

                ${missingSkillsDetected.length === 0 ? `
                    <div class="glass-card empty-state" style="padding: 30px;">
                        <i data-lucide="check-circle2" style="color: var(--color-success); font-size: 2.5rem;"></i>
                        <h4>Perfektes Skill-Match!</h4>
                        <p class="text-secondary">Es wurden keine gravierenden Wissenslücken für diese Stelle identifiziert. Du bist bestens vorbereitet!</p>
                    </div>
                ` : `
                    <div class="roadmap-cards-grid" style="display: flex; flex-direction: column; gap: 16px;">
                        ${missingSkillsDetected.map(key => {
                            const info = skillCatalog[key];
                            return `
                                <div class="glass-card" style="padding: 20px;">
                                    <div class="flex-between align-center" style="margin-bottom: 10px;">
                                        <h4 style="margin: 0; color: var(--color-primary);">${info.name}</h4>
                                        <span class="badge badge-saved"><i data-lucide="clock" style="width: 12px; height: 12px; display: inline;"></i> Ca. ${info.time}</span>
                                    </div>

                                    <div style="margin-bottom: 12px;">
                                        <strong style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-secondary);">Empfohlener Lernpfad:</strong>
                                        <ol style="padding-left: 18px; font-size: 0.85rem; margin-top: 6px; line-height: 1.5;">
                                            ${info.steps.map(step => `<li>${step}</li>`).join('')}
                                        </ol>
                                    </div>

                                    <a href="${info.link}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm flex-row align-center" style="display: inline-flex; width: auto; gap: 6px;">
                                        <i data-lucide="external-link"></i> Kostenlose Doku &amp; Tutorial öffnen
                                    </a>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `}
            </div>
        `;

        if (window.lucide) lucide.createIcons();
    }
};

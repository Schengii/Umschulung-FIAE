import { storage } from '../storage.js';
import { mockAi } from '../mockAi.js';
import { coverLetterGen } from './copilot/coverLetterGen.js';
import { interviewSimulator } from './copilot/interviewSimulator.js';
import { showcaseBuilder } from './copilot/showcaseBuilder.js';
import { resignationGen } from './copilot/resignationGen.js';
import { audioDrill } from './copilot/audioDrill.js';
import { pitchFlyer } from './copilot/pitchFlyer.js';
import { contractChecker } from './copilot/contractChecker.js';
import { onboardingPlanner } from './copilot/onboardingPlanner.js';
import { salaryRadar } from './copilot/salaryRadar.js';
import { inboxSimulator } from './copilot/inboxSimulator.js';
import { cvOptimizer } from './copilot/cvOptimizer.js';
import { cvBuilder } from './copilot/cvBuilder.js';
import { aiMentor } from './copilot/aiMentor.js';
import { emailSuite } from './copilot/emailSuite.js';
import { referenceChecker } from './copilot/referenceChecker.js';
import { outreachGen } from './copilot/outreachGen.js';
import { cheatSheet } from './copilot/cheatSheet.js';
import { negotiatorView } from './copilot/negotiatorView.js';
import { learningRoadmap } from './copilot/learningRoadmap.js';

export const copilotView = {
    selectedJobId: null,

    render(containerId, targetJobId = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const jobs = storage.getJobs();
        const profile = storage.getProfile();

        if (jobs.length === 0) {
            container.innerHTML = `
                <div class="glass-card empty-state" style="padding: 60px 40px; min-height: 400px;">
                    <i data-lucide="sparkles"></i>
                    <h2>Bewerbungs-Copilot ist bereit!</h2>
                    <p>Füge zuerst Jobangebote hinzu, um den AI-gestützten Skill-Vergleich, Anschreiben-Generator, CV-Builder und Interview-Simulator zu nutzen.</p>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
            return;
        }

        if (targetJobId) {
            this.selectedJobId = targetJobId;
        } else if (!this.selectedJobId || !jobs.some(j => j.id === this.selectedJobId)) {
            this.selectedJobId = jobs[0].id;
        }

        const activeJob = jobs.find(j => j.id === this.selectedJobId) || jobs[0];
        const matchData = mockAi.analyzeJobMatch(activeJob.description || '', profile.skills || []);

        container.innerHTML = `
            <div class="kanban-header">
                <h2>Bewerbungs-Copilot (AI)</h2>
                <span class="text-secondary">Analysiere Übereinstimmungen und entwerfe maßgeschneiderte Bewerbungen</span>
            </div>

            <div class="copilot-layout">
                <!-- Left panel: Job selection -->
                <div class="copilot-panel">
                    <div class="glass-card job-select-card">
                        <h3><i data-lucide="briefcase"></i> Job auswählen</h3>
                        <div class="job-selector-list">
                            ${jobs.map(job => `
                                <button class="job-selector-item ${job.id === this.selectedJobId ? 'active' : ''}" data-id="${job.id}">
                                    <span class="title">${job.title}</span>
                                    <span class="company">${job.company}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <div class="glass-card" style="padding: 20px;">
                        <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 700; margin-bottom: 10px;">Profil-Skills</h4>
                        <div class="keyword-tags">
                            ${(profile.skills || []).map(skill => `<span class="keyword-badge match">${skill}</span>`).join('')}
                        </div>
                    </div>
                </div>

                <!-- Right panel: AI Tools -->
                <div class="copilot-main">
                    <div class="copilot-match-row flex-row gap-16" style="margin-bottom: 20px;">
                        <div class="glass-card match-circle-card" style="text-align: center; padding: 20px; min-width: 160px;">
                            <div class="match-radial" style="font-size: 2.2rem; font-weight: 800; color: var(--color-primary);">
                                ${matchData.matchScore}%
                            </div>
                            <h4 style="font-size: 0.85rem; margin-top: 4px;">Skill-Übereinstimmung</h4>
                        </div>

                        <div class="glass-card match-details-card flex-1" style="padding: 20px;">
                            <h4 style="margin-bottom: 10px;">Anforderungs-Abgleich</h4>
                            <div class="keyword-lists flex-row gap-16">
                                <div class="keyword-col matching flex-1">
                                    <h5 style="color: var(--color-success); font-size: 0.8rem;"><i data-lucide="check-circle2"></i> Gefunden (${matchData.matchingSkills.length})</h5>
                                    <div class="keyword-tags" style="margin-top: 4px;">
                                        ${matchData.matchingSkills.map(s => `<span class="keyword-badge match">${s}</span>`).join('')}
                                    </div>
                                </div>
                                <div class="keyword-col missing flex-1">
                                    <h5 style="color: var(--color-warning); font-size: 0.8rem;"><i data-lucide="alert-circle"></i> Fehlend (${matchData.missingSkills.length})</h5>
                                    <div class="keyword-tags" style="margin-top: 4px;">
                                        ${matchData.missingSkills.map(s => `<span class="keyword-badge miss">${s}</span>`).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- AI Tool Tabs -->
                    <div class="glass-card" style="padding: 24px;">
                        <nav class="tabs-nav flex-row gap-8" style="border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 20px; overflow-x: auto;">
                            <button class="tab-btn active" data-tab="tab-cover-letter"><i data-lucide="file-text"></i> Anschreiben</button>
                            <button class="tab-btn" data-tab="tab-cv-builder"><i data-lucide="award"></i> CV-Builder &amp; PDF</button>
                            <button class="tab-btn" data-tab="tab-showcase"><i data-lucide="folder-git-2"></i> Projekt-Showcase</button>
                            <button class="tab-btn" data-tab="tab-resignation"><i data-lucide="file-minus"></i> Kündigungsschreiben</button>
                            <button class="tab-btn" data-tab="tab-salary-radar"><i data-lucide="compass"></i> Gehalts-Radar</button>
                            <button class="tab-btn" data-tab="tab-onboarding"><i data-lucide="calendar"></i> 30-60-90 Onboarding</button>
                            <button class="tab-btn" data-tab="tab-inbox-sim"><i data-lucide="inbox"></i> E-Mail-Inbox Sync</button>
                            <button class="tab-btn" data-tab="tab-pitch-flyer"><i data-lucide="presentation"></i> Bewerber-Flyer</button>
                            <button class="tab-btn" data-tab="tab-contract-checker"><i data-lucide="shield-alert"></i> Vertrags-Checker</button>
                            <button class="tab-btn" data-tab="tab-audio-drill"><i data-lucide="headphones"></i> Audio-Drill</button>
                            <button class="tab-btn" data-tab="tab-ai-mentor"><i data-lucide="bot"></i> KI-Mentor &amp; Sparring</button>
                            <button class="tab-btn" data-tab="tab-email-suite"><i data-lucide="mail"></i> E-Mail-Suite</button>
                            <button class="tab-btn" data-tab="tab-outreach"><i data-lucide="send"></i> LinkedIn/Xing Pitch</button>
                            <button class="tab-btn" data-tab="tab-reference-checker"><i data-lucide="file-badge"></i> Zeugnis-Prüfer</button>
                            <button class="tab-btn" data-tab="tab-interview-prep"><i data-lucide="help-circle"></i> STAR-Simulator</button>
                            <button class="tab-btn" data-tab="tab-cv-optimizer"><i data-lucide="file-check"></i> CV-Parser</button>
                            <button class="tab-btn" data-tab="tab-cheat-sheet"><i data-lucide="file-spreadsheet"></i> 1-Pager Spickzettel</button>
                            <button class="tab-btn" data-tab="tab-negotiator"><i data-lucide="calculator"></i> Gehalts-Guide</button>
                            <button class="tab-btn" data-tab="tab-learning-roadmap"><i data-lucide="map"></i> Skill-Lernpfad</button>
                        </nav>

                        <div id="copilot-tab-content"></div>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
        this.bindEvents(container, activeJob, profile);
        this.switchTab('tab-cover-letter', activeJob, profile);
    },

    bindEvents(container, activeJob, profile) {
        // Job switching items
        container.querySelectorAll('.job-selector-item').forEach(item => {
            item.addEventListener('click', () => {
                const jobId = item.getAttribute('data-id');
                this.selectedJobId = jobId;
                this.render('view-copilot', jobId);
            });
        });

        // Tab switching buttons
        container.querySelectorAll('.tabs-nav .tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.tabs-nav .tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const tabId = btn.getAttribute('data-tab');
                this.switchTab(tabId, activeJob, profile);
            });
        });
    },

    switchTab(tabId, job, profile) {
        const contentBox = document.getElementById('copilot-tab-content');
        if (!contentBox) return;

        switch (tabId) {
            case 'tab-cover-letter':
                coverLetterGen.render(contentBox, job, profile);
                break;
            case 'tab-cv-builder':
                cvBuilder.render(contentBox, job, profile);
                break;
            case 'tab-showcase':
                showcaseBuilder.render(contentBox, job, profile);
                break;
            case 'tab-resignation':
                resignationGen.render(contentBox, job, profile);
                break;
            case 'tab-salary-radar':
                salaryRadar.render(contentBox, job, profile);
                break;
            case 'tab-onboarding':
                onboardingPlanner.render(contentBox, job, profile);
                break;
            case 'tab-inbox-sim':
                inboxSimulator.render(contentBox, job, profile);
                break;
            case 'tab-pitch-flyer':
                pitchFlyer.render(contentBox, job, profile);
                break;
            case 'tab-contract-checker':
                contractChecker.render(contentBox, job, profile);
                break;
            case 'tab-audio-drill':
                audioDrill.init(job, profile);
                audioDrill.render(contentBox, job, profile);
                break;
            case 'tab-ai-mentor':
                aiMentor.render(contentBox, job, profile);
                break;
            case 'tab-email-suite':
                emailSuite.render(contentBox, job, profile);
                break;
            case 'tab-outreach':
                outreachGen.render(contentBox, job, profile);
                break;
            case 'tab-reference-checker':
                referenceChecker.render(contentBox, job, profile);
                break;
            case 'tab-interview-prep':
                interviewSimulator.init(job, profile);
                interviewSimulator.renderCurrentQuestion(contentBox);
                break;
            case 'tab-cv-optimizer':
                cvOptimizer.render(contentBox, job, profile);
                break;
            case 'tab-cheat-sheet':
                cheatSheet.render(contentBox, job, profile);
                break;
            case 'tab-negotiator':
                negotiatorView.render(contentBox, job, profile);
                break;
            case 'tab-learning-roadmap':
                learningRoadmap.render(contentBox, job, profile);
                break;
            default:
                coverLetterGen.render(contentBox, job, profile);
        }
    }
};

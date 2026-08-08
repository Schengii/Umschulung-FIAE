// Storage management layer using localStorage

const STORAGE_KEYS = {
    JOBS: 'jobmatch_jobs',
    PROFILE: 'jobmatch_profile',
    PROFILES: 'jobmatch_profiles',
    ACTIVE_PROFILE_ID: 'jobmatch_active_profile_id',
    WEIGHTS: 'jobmatch_weights'
};

const DEFAULT_PROFILE = {
    name: 'Alex Neumann',
    title: 'Frontend Developer',
    skills: ['JavaScript', 'HTML5', 'CSS Grid', 'React', 'Figma', 'TypeScript', 'Responsive Design', 'Git'],
    experience: '- 3 Jahre Erfahrung als Webentwickler im E-Commerce\n- Erstellung von responsiven User Interfaces\n- Erfahrung mit REST APIs und State Management',
    geminiApiKey: '',
    geminiModel: 'gemini-1.5-flash',
    geminiTemperature: 0.7,
    geminiCustomInstructions: '',
    lrsEnabled: false,
    rgsEnabled: false,
    taxClass: '1',
    churchTax: '0',
    hasChildren: false,
    supabaseUrl: '',
    supabaseAnonKey: '',
    themePrimaryHue: 239,
    themeSecondaryHue: 263,
    weeklyGoal: 3,
    cvText: ''
};

const DEFAULT_WEIGHTS = {
    salary: 4,
    commute: 2,
    remote: 5,
    culture: 3,
    tech: 4
};

const DEFAULT_JOBS = [
    {
        id: 'mock-1',
        title: 'Senior Frontend Developer (m/w/d)',
        company: 'InnoTech Solutions',
        location: 'München / Hybrid',
        workMode: 'Hybrid',
        salary: 72000,
        url: 'https://example.com/jobs/innotech-frontend',
        deadline: '2026-06-30',
        description: 'Wir suchen einen Frontend-Enthusiasten mit fundierten Kenntnissen in JavaScript, React und CSS Grid. Erfahrung mit TypeScript und Figma ist ein großes Plus.',
        status: 'interviewing',
        ratings: { salary: 8, commute: 6, remote: 8, culture: 7, tech: 9 },
        createdAt: '2026-06-01T10:00:00.000Z'
    },
    {
        id: 'mock-2',
        title: 'Web Entwickler / React Specialist',
        company: 'Global Commerce GmbH',
        location: 'Remote',
        workMode: 'Remote',
        salary: 65000,
        url: 'https://example.com/jobs/global-react',
        deadline: '2026-07-15',
        description: 'Deine Aufgaben: Weiterentwicklung unserer Storefronts in React und TypeScript. Enge Abstimmung mit UX-Designern in Figma. Kenntnisse in REST APIs und Git vorausgesetzt.',
        status: 'applied',
        ratings: { salary: 7, commute: 10, remote: 10, culture: 8, tech: 8 },
        createdAt: '2026-06-03T14:30:00.000Z'
    },
    {
        id: 'mock-3',
        title: 'Junior UI Engineer',
        company: 'DesignKraft Agency',
        location: 'Berlin / Vor Ort',
        workMode: 'Vor Ort',
        salary: 48000,
        url: 'https://example.com/jobs/designkraft-junior',
        deadline: '2026-06-18',
        description: 'Unterstütze uns bei der Umsetzung von kreativen Websites. Du liebst HTML5, CSS Grid und Responsive Design? Adobe XD und Figma sind dir keine Fremdwörter?',
        status: 'saved',
        ratings: { salary: 5, commute: 4, remote: 2, culture: 9, tech: 7 },
        createdAt: '2026-06-05T09:15:00.000Z'
    },
    {
        id: 'mock-4',
        title: 'Frontend Lead Developer',
        company: 'CoreByte Systems',
        location: 'München',
        workMode: 'Vor Ort',
        salary: 85000,
        url: 'https://example.com/jobs/corebyte-lead',
        deadline: '2026-06-25',
        description: 'Architektur unserer Frontend-Systeme. Stack: Next.js, TypeScript, TailwindCSS. Du koordinierst das Entwickler-Team und stimmst dich mit dem Produktmanagement ab.',
        status: 'offer',
        ratings: { salary: 9, commute: 4, remote: 3, culture: 6, tech: 8 },
        createdAt: '2026-05-28T16:00:00.000Z'
    }
];

export const storage = {
    getJobs() {
        const jobsRaw = localStorage.getItem(STORAGE_KEYS.JOBS);
        let jobs = [];
        if (!jobsRaw) {
            jobs = DEFAULT_JOBS;
            this.saveJobs(jobs);
        } else {
            jobs = JSON.parse(jobsRaw);
        }
        
        let migrated = false;
        const migratedJobs = jobs.map(j => {
            let updated = false;
            if (!j.todos || !Array.isArray(j.todos)) {
                j.todos = [];
                updated = true;
            }
            if (!j.interviews || !Array.isArray(j.interviews)) {
                j.interviews = [];
                updated = true;
            }
            if (!j.communicationLogs || !Array.isArray(j.communicationLogs)) {
                j.communicationLogs = [];
                updated = true;
            }
            if (!j.expenses || !Array.isArray(j.expenses)) {
                j.expenses = [];
                updated = true;
            }
            if (!j.documents || !Array.isArray(j.documents)) {
                j.documents = [];
                updated = true;
            }
            if (updated) migrated = true;
            return j;
        });
        
        if (migrated) {
            this.saveJobs(migratedJobs);
        }
        return migratedJobs;
    },

    saveJobs(jobs) {
        localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
        const profile = this.getProfile();
        import('./utils/supabaseSync.js').then(module => {
            module.supabaseSync.syncJobs(profile, jobs);
        }).catch(err => console.warn('Supabase jobs sync failed:', err));
        if (window.app && typeof window.app.updateNotificationBell === 'function') {
            window.app.updateNotificationBell();
        }
    },

    addJob(job) {
        const jobs = this.getJobs();
        const newJob = {
            ...job,
            id: 'job-' + Date.now(),
            createdAt: new Date().toISOString()
        };
        jobs.push(newJob);
        this.saveJobs(jobs);
        return newJob;
    },

    updateJob(updatedJob) {
        const jobs = this.getJobs();
        const index = jobs.findIndex(j => j.id === updatedJob.id);
        if (index !== -1) {
            jobs[index] = { ...jobs[index], ...updatedJob };
            this.saveJobs(jobs);
            return true;
        }
        return false;
    },

    deleteJob(id) {
        const jobs = this.getJobs();
        const filtered = jobs.filter(j => j.id !== id);
        this.saveJobs(filtered);
    },

    getProfiles() {
        let profilesRaw = localStorage.getItem(STORAGE_KEYS.PROFILES);
        let activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE_ID);
        
        let profiles = [];
        if (profilesRaw) {
            try {
                profiles = JSON.parse(profilesRaw);
            } catch(e) {}
        }
        
        // Migration from old single profile
        const oldProfileRaw = localStorage.getItem(STORAGE_KEYS.PROFILE);
        if (!profiles || profiles.length === 0) {
            let initialProfile = DEFAULT_PROFILE;
            if (oldProfileRaw) {
                try {
                    initialProfile = JSON.parse(oldProfileRaw);
                } catch(e) {}
            }
            if (!initialProfile.id) {
                initialProfile.id = 'prof-default';
            }
            if (!initialProfile.profileName) {
                initialProfile.profileName = initialProfile.name || 'Standard Profil';
            }
            profiles = [initialProfile];
            localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
        }
        
        // Ensure all profiles have an ID and a profileName
        let migrated = false;
        profiles = profiles.map((p, idx) => {
            if (!p.id) {
                p.id = 'prof-' + idx + '-' + Date.now();
                migrated = true;
            }
            if (!p.profileName) {
                p.profileName = p.name || `Profil ${idx + 1}`;
                migrated = true;
            }
            return p;
        });
        
        if (migrated) {
            localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
        }
        
        // Ensure active ID is valid
        if (!activeId || !profiles.some(p => p.id === activeId)) {
            activeId = profiles[0].id;
            localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE_ID, activeId);
        }
        
        return profiles;
    },

    getActiveProfileId() {
        this.getProfiles(); // Runs migration if needed
        return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE_ID);
    },

    setActiveProfileId(id) {
        const profiles = this.getProfiles();
        if (profiles.some(p => p.id === id)) {
            localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE_ID, id);
            const activeProfile = profiles.find(p => p.id === id);
            localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(activeProfile));
            
            import('./utils/supabaseSync.js').then(module => {
                module.supabaseSync.syncProfile(activeProfile);
                const jobs = this.getJobs();
                module.supabaseSync.syncJobs(activeProfile, jobs);
            }).catch(err => console.warn('Supabase profile sync failed:', err));
        }
    },

    getProfile() {
        const profiles = this.getProfiles();
        const activeId = this.getActiveProfileId();
        return profiles.find(p => p.id === activeId) || profiles[0];
    },

    saveProfile(profile) {
        if (!profile.id) {
            profile.id = this.getActiveProfileId() || 'prof-default';
        }
        if (!profile.profileName) {
            profile.profileName = profile.name || 'Standard Profil';
        }
        
        const profiles = this.getProfiles();
        const index = profiles.findIndex(p => p.id === profile.id);
        if (index !== -1) {
            profiles[index] = profile;
        } else {
            profiles.push(profile);
        }
        
        localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
        
        const activeId = this.getActiveProfileId();
        if (activeId === profile.id) {
            localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile)); // Compatibility
            
            import('./utils/supabaseSync.js').then(module => {
                module.supabaseSync.syncProfile(profile);
                const jobs = this.getJobs();
                module.supabaseSync.syncJobs(profile, jobs);
            }).catch(err => console.warn('Supabase profile sync failed:', err));
        }
    },

    addProfile(profileName) {
        const profiles = this.getProfiles();
        const activeProfile = this.getProfile();
        
        const newProfile = {
            ...DEFAULT_PROFILE,
            ...activeProfile,
            id: 'prof-' + Date.now(),
            profileName: profileName,
            name: activeProfile.name || 'Alex Neumann',
            skills: [...activeProfile.skills],
            experience: activeProfile.experience || ''
        };
        
        profiles.push(newProfile);
        localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
        this.setActiveProfileId(newProfile.id);
        return newProfile;
    },

    deleteProfile(id) {
        let profiles = this.getProfiles();
        if (profiles.length <= 1) {
            throw new Error("Das letzte verbleibende Profil kann nicht gelöscht werden.");
        }
        
        profiles = profiles.filter(p => p.id !== id);
        localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
        
        const activeId = this.getActiveProfileId();
        if (activeId === id) {
            this.setActiveProfileId(profiles[0].id);
        }
    },

    getWeights() {
        const weights = localStorage.getItem(STORAGE_KEYS.WEIGHTS);
        if (!weights) {
            this.saveWeights(DEFAULT_WEIGHTS);
            return DEFAULT_WEIGHTS;
        }
        return JSON.parse(weights);
    },

    saveWeights(weights) {
        localStorage.setItem(STORAGE_KEYS.WEIGHTS, JSON.stringify(weights));
    },

    exportBackup() {
        return JSON.stringify({
            version: '1.0',
            jobs: this.getJobs(),
            profile: this.getProfile(),
            weights: this.getWeights()
        }, null, 2);
    },

    importBackup(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (!data.jobs || !Array.isArray(data.jobs) || !data.profile || !data.weights) {
                throw new Error("Ungültiges Format: jobs, profile oder weights fehlen.");
            }
            this.saveJobs(data.jobs);
            this.saveProfile(data.profile);
            this.saveWeights(data.weights);
            return true;
        } catch (e) {
            console.error("Backup Import fehlgeschlagen", e);
            throw e;
        }
    }
};

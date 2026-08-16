const translations = {
    de: {
        appTitle: "JobMatch",
        dashboard: "Dashboard",
        kanban: "Kanban-Board",
        comparer: "Job-Vergleicher",
        calendar: "Kalender",
        finder: "Job-Suche",
        copilot: "Bewerbungs-Copilot",
        myProfile: "Mein Profil / Skills",
        addJob: "Neuen Job hinzufügen",
        searchPlaceholder: "Jobs, Firmen oder Skills suchen...",
        totalJobs: "Gesamtanzahl",
        openApplications: "Bewerbungen offen",
        offersReceived: "Angebote erhalten",
        interviewsCount: "Einladungen / Gespräch",
        applicationExpenses: "Bewerbungs-Kosten",
        marketSalaryBenchmark: "Marktgehalt Benchmark",
        saved: "Gespeichert",
        prepared: "Unterlagen bereit",
        applied: "Beworben",
        interviewing: "Gespräch",
        offer: "Angebot erhalten",
        rejected: "Absage",
        coverLetterGenerator: "Anschreiben-Generator",
        interviewPrep: "Interview-Vorbereitung",
        resumeOptimizer: "Lebenslauf-Optimizer",
        emailAssistant: "E-Mail-Assistent",
        salaryNegotiation: "Gehaltsverhandlung",
        companyResearch: "360° Unternehmensrecherche",
        startSimulator: "Simulator starten",
        exportCv: "Lebenslauf exportieren",
        saveProfile: "Profil speichern"
    },
    en: {
        appTitle: "JobMatch",
        dashboard: "Dashboard",
        kanban: "Kanban Board",
        comparer: "Job Comparer",
        calendar: "Calendar",
        finder: "Job Search",
        copilot: "AI Copilot",
        myProfile: "My Profile / Skills",
        addJob: "Add New Job",
        searchPlaceholder: "Search jobs, companies or skills...",
        totalJobs: "Total Jobs",
        openApplications: "Active Applications",
        offersReceived: "Offers Received",
        interviewsCount: "Interviews Scheduled",
        applicationExpenses: "Job Search Expenses",
        marketSalaryBenchmark: "Market Salary Benchmark",
        saved: "Saved",
        prepared: "Prepared",
        applied: "Applied",
        interviewing: "Interviewing",
        offer: "Offer Received",
        rejected: "Rejected",
        coverLetterGenerator: "Cover Letter Generator",
        interviewPrep: "Interview Prep",
        resumeOptimizer: "Resume Optimizer",
        emailAssistant: "Email Assistant",
        salaryNegotiation: "Salary Negotiation",
        companyResearch: "360° Company Research",
        startSimulator: "Start Simulator",
        exportCv: "Export CV / Resume",
        saveProfile: "Save Profile"
    }
};

export const i18n = {
    currentLang: localStorage.getItem('jobmatch_lang') || 'de',

    setLanguage(lang) {
        if (translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('jobmatch_lang', lang);
            this.updateDom();
        }
    },

    getLanguage() {
        return this.currentLang;
    },

    t(key) {
        return translations[this.currentLang]?.[key] || translations['de']?.[key] || key;
    },

    updateDom() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key && translations[this.currentLang]?.[key]) {
                if (el.tagName === 'INPUT' && el.placeholder) {
                    el.placeholder = translations[this.currentLang][key];
                } else {
                    el.textContent = translations[this.currentLang][key];
                }
            }
        });

        const langBtn = document.getElementById('btn-lang-toggle');
        if (langBtn) {
            langBtn.textContent = this.currentLang.toUpperCase();
        }
    }
};

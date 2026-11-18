const newsData = [
    {
        id: 'ihk-kartei-2000-karten',
        category: 'milestone',
        date: '2026-10-28',
        title_de: '🗂️ IHK-Kartei: rund 2 000 Lernkarten für AP1, AP2 und WiSo',
        title_en: '🗂️ IHK Card Index: Around 2,000 Flashcards for AP1, AP2 and WiSo',
        content_de: [
            'Die Lernkarten-Seite hat eine zuschaltbare IHK-Kartei bekommen: rund 2 000 Karten aus meinen eigenen Prüfungsnotizen zu AP1, AP2 und Wirtschafts- und Sozialkunde. Die Karten laufen durch dieselbe Leitner-Box wie die Kernkarten, mit Fälligkeitsterminen und Export des Lernplans als Kalenderdatei.',
            'Die Kartei ist nur auf Deutsch verfügbar und wird erst geladen, wenn der Schalter „Erweiterte IHK-Kartei einbeziehen“ aktiv ist. Wer sich gerade auf die Abschlussprüfung vorbereitet, kann sie frei nutzen.',
        ],
        content_en: [
            'The flashcards page now has an optional IHK card index: around 2,000 cards from my own exam notes on AP1, AP2 and economics and social studies. The cards run through the same Leitner box as the core cards, with due dates and an export of the study plan as a calendar file.',
            'The card index is available in German only and is loaded only once the switch "Erweiterte IHK-Kartei einbeziehen" is on. Anyone preparing for the final exam is welcome to use it.',
        ],
    },
    {
        id: 'portfolio-release-1-5-0',
        category: 'milestone',
        date: '2026-10-24',
        title_de: '🔒 Version 1.5.0: strengere Content Security Policy und mehr Tests',
        title_en: '🔒 Version 1.5.0: Stricter Content Security Policy and More Tests',
        content_de: [
            'Mit Version 1.5.0 erlaubt die Content Security Policy der Seiten nur noch Stylesheets aus Dateien. Alle Inline-Styles sind in CSS-Dateien umgezogen, und ein End-to-End-Test schlägt bei jeder CSP-Verletzung fehl.',
            'Dazu kommen Unit-Tests für die DOM-Module, eine Mindestgrenze für die Testabdeckung, die nur noch steigen darf, und neue Prüfungen für Barrierefreiheit: Kontrast je Akzentfarbe, reduzierte Bewegung und Fokus-Rückgabe bei Dialogen. Die Einzelheiten stehen im Changelog des Repositorys.',
        ],
        content_en: [
            'With version 1.5.0 the Content Security Policy of the pages only allows stylesheets from files. All inline styles have moved into CSS files, and an end-to-end test fails on every CSP violation.',
            'On top of that come unit tests for the DOM modules, a minimum for test coverage that may only go up, and new accessibility checks: contrast per accent colour, reduced motion and focus return for dialogs. The details are in the changelog of the repository.',
        ],
    },
    {
        id: 'job-search-start',
        category: 'milestone',
        date: '2026-07-06',
        title_de: '🚀 Auf Jobsuche — jetzt bereit für den ersten Job als Entwickler!',
        title_en: '🚀 Job Search Begins — Ready for My First Developer Role!',
        content_de: [
            'Die Umschulung ist erfolgreich abgeschlossen und ich bin ab sofort aktiv auf der Suche nach meiner ersten Festanstellung als Fachinformatiker für Anwendungsentwicklung im Raum Bonn und deutschlandweit remote. Mein Fokus liegt auf modernen Web-Technologien, Java/Spring Boot und KI-gestützter Entwicklung.',
            'Falls du Recruiter oder Entwickler bist und einen motivierten, frisch ausgebildeten FIAE suchst: Schau dir gerne mein Portfolio an und melde dich über das Kontaktformular. Ich freue mich auf spannende Projekte und ein starkes Team!',
        ],
        content_en: [
            'My retraining is officially completed and I am now actively searching for my first permanent role as an IT Specialist in Application Development — in the Bonn area and nationwide remote. My focus is on modern web technologies, Java/Spring Boot, and AI-assisted development.',
            'If you are a recruiter or a developer looking for a motivated, freshly certified FIAE: Check out my portfolio and feel free to reach out using the contact form. Looking forward to exciting projects and a great team!',
        ],
    },
    {
        id: 'portfolio-relaunch-2026',
        category: 'milestone',
        date: '2026-06-25',
        title_de: '🌐 Portfolio-Relaunch: Recruiter-Features, Achievements & Keyboard-Shortcuts',
        title_en: '🌐 Portfolio Relaunch: Recruiter Features, Achievements & Keyboard Shortcuts',
        content_de: [
            'Das Portfolio wurde mit einem umfangreichen Update ausgeliefert! Neu sind: personalisierte Recruiter-Willkommenskarten (via URL-Parameter), ein Gamification-System mit freischaltbaren Achievements, vollständige Dark-Mode & Zweisprachigkeit (DE/EN), ein IHK-Notenrechner im Dashboard sowie interaktive Lernkarten für die FIAE-Prüfungsthemen.',
            'Außerdem wurden Keyboard-Shortcuts (Strg+K, T, L, ?) für Power-User integriert und die Performance durch den Service Worker für Offline-Fähigkeit (PWA) optimiert. Das Portfolio ist auch als App auf dem Smartphone installierbar!',
        ],
        content_en: [
            'The portfolio has shipped a major update! New features include: personalized recruiter welcome cards (via URL parameters), a gamification system with unlockable achievements, full dark mode and bilingual support (DE/EN), an IHK grade calculator in the dashboard, and interactive flashcards for FIAE exam topics.',
            'Keyboard shortcuts (Ctrl+K, T, L, ?) for power users were added and performance was improved via a Service Worker for offline capability (PWA). The portfolio can also be installed as an app on mobile devices!',
        ],
    },
    {
        id: 'ihk-exam-recap',
        category: 'milestone',
        date: '2026-06-10',
        title_de: '🎓 Rückblick: Mündliche IHK-AP2 und das Fachgespräch',
        title_en: '🎓 Recap: Oral IHK AP2 Final Exam and Expert Interview',
        content_de: [
            "Ein paar Tage nach dem Prüfungstag möchte ich kurz reflektieren: Die mündliche AP2-Prüfung am 07. Juni 2026 vor dem IHK-Prüfungsausschuss Dortmund war intensiv, aber lehrreich. Nach meiner 15-minütigen Projektpräsentation zu 'EcoChef' folgte ein 15-minütiges Fachgespräch zu Themen wie Softwarearchitektur, Datenbankdesign und IT-Sicherheit.",
            'Besonders spannend waren die Rückfragen zu meiner Entscheidung für das Cordova-Framework und zur Amortisationsberechnung. Das Prüfungsteam war fair und professionell — ein tolles Erlebnis, das ich jedem empfehle, der vor seiner AP2 steht. Vorbereitung ist alles!',
        ],
        content_en: [
            "A few days after the exam, I want to briefly reflect: The oral AP2 exam on June 7, 2026, before the IHK examination board in Dortmund was intense but highly educational. Following my 15-minute project presentation of 'EcoChef,' a 15-minute expert discussion covered topics like software architecture, database design, and IT security.",
            'Especially interesting were the follow-up questions on my choice of the Cordova framework and the amortization calculation. The examining board was fair and professional — a great experience I would recommend to anyone preparing for their AP2. Preparation is everything!',
        ],
    },
    {
        id: 'ecochef-media-release',
        category: 'milestone',
        date: '2026-06-15',
        title_de: '🎬 EcoChef: Live-Demos & IHK-Vortragsfolien veröffentlicht!',
        title_en: '🎬 EcoChef: Live Demos & IHK Slides Published!',
        content_de: [
            'Für mein IHK-Abschlossprojekt EcoChef habe ich fünf kurze Demonstrationsvideos hochgeladen! Diese veranschaulichen die Kernfunktionen wie den interaktiven Kochmodus mit Sprachausgabe (TTS), den virtuellen Kühlschrank, die dynamische Rezeptanpassung durch die Gemini-KI sowie das LocalStorage-Management.',
            'Zusätzlich steht ab sofort meine vollständige Präsentationsdatei (PPTX), die ich vor dem IHK-Prüfungsausschuss gehalten habe, zum Download bereit. Du findest die Videos und Downloads sowohl im Projektdetail als auch im Bereich Praktikumsbetrieb.',
        ],
        content_en: [
            'For my IHK graduation project EcoChef, I have published five short demonstration clips! These show core features like the hands-free cooking mode with speech synthesis (TTS), the virtual pantry, custom AI-driven recipe edits, and offline storage options.',
            'Furthermore, my official examination slides (PowerPoint) are now open for download. You can inspect the videos and slides both on the project detail page and in the internship section.',
        ],
    },
    {
        id: 'dfg-media-release',
        category: 'dfg',
        date: '2026-03-15',
        title_de: '📊 DFG-Betriebsstruktur & Präsentation online',
        title_en: '📊 DFG Structural Insights & Slides Online',
        content_de: [
            'Um einen besseren Einblick in meinen Praktikumsbetrieb – die Deutsche Forschungsgemeinschaft (DFG) in Bonn – zu geben, habe ich eine informative Unternehmenspräsentation zum Download bereitgestellt.',
            'Ergänzend dazu gibt es nun interaktive Strukturdiagramme, die das Web-Entwicklungsteam (Z-INF), die fachlichen Zuständigkeiten, den agilen Scrum-Entwicklungszyklus und die Verteilung der Förderaktivitäten visualisieren.',
        ],
        content_en: [
            'To provide better insight into my host company – the German Research Foundation (DFG) in Bonn – I have published a corporate PowerPoint presentation.',
            'In addition, I integrated interactive diagrams displaying the web development department (Z-INF) structure, functional areas, the agile Scrum sprint cycle, and general funding statistics.',
        ],
    },
    {
        id: 'dfg-ihk-graduation',
        category: 'milestone',
        date: '2026-06-07',
        title_de: '🏆 IHK-Abschlussprüfung erfolgreich bestanden!',
        title_en: '🏆 Successfully Passed IHK Final Exams!',
        content_de: [
            "Geschafft! Mit der heutigen Präsentation meines Abschlussprojektes 'EcoChef' und dem anschließenden Fachgespräch vor dem IHK-Prüfungsausschuss habe ich meine Umschulung zum Fachinformatiker für Anwendungsentwicklung erfolgreich abgeschlossen.",
            'Die monatelange Arbeit an EcoChef (Hybrid-App, Gemini-KI und Cordova) hat sich voll ausgezahlt. Ein großes Dankeschön an mein Team bei der DFG Bonn für die großartige Betreuung und Unterstützung während der gesamten Praxisphase.',
        ],
        content_en: [
            "Done! With today's presentation of my graduation project 'EcoChef' and the subsequent technical interview before the IHK examination board, I have successfully completed my retraining as an IT Specialist in Application Development.",
            'Months of working on EcoChef (hybrid app, Gemini AI, and Cordova) have fully paid off. A huge thank you to my team at DFG Bonn for their great mentorship and support throughout the practical phase.',
        ],
    },
    {
        id: 'bfw-ihk-written',
        category: 'bfw',
        date: '2026-05-06',
        title_de: '📝 Schriftliche IHK-Abschlussprüfung (Teil 2) absolviert',
        title_en: '📝 Completed Written IHK Final Exams (Part 2)',
        content_de: [
            "Die schriftlichen Prüfungen im BFW Dortmund sind geschafft. In den Bereichen 'Planung eines Softwareprodukts', 'Entwicklung und Umsetzung von Algorithmen' sowie 'Wirtschafts- und Sozialkunde' wurden uns knifflige, praxisnahe Aufgaben gestellt.",
            'Jetzt konzentriere ich mich voll auf die Fertigstellung der Projektdokumentation für mein IHK-Abschlussprojekt EcoChef.',
        ],
        content_en: [
            'The written examinations at BFW Dortmund are done. We faced challenging, practical tasks covering software product planning, algorithm development, and economic/social studies.',
            'Now, I am focusing entirely on wrapping up the technical project documentation for my graduation project EcoChef.',
        ],
    },
    {
        id: 'dfg-project-approval',
        category: 'dfg',
        date: '2026-01-10',
        title_de: '⚙️ Genehmigung des IHK-Projektantrags (EcoChef)',
        title_en: '⚙️ Approval of IHK Capstone Project Proposal (EcoChef)',
        content_de: [
            "Großartige Neuigkeiten: Mein Projektantrag für die IHK-Abschlussarbeit wurde vom Prüfungsausschuss ohne Auflagen genehmigt! In den kommenden Wochen werde ich 'EcoChef' entwickeln — einen KI-Rezept-Assistenten auf Basis von LitElement, TypeScript, Cordova und der Gemini API.",
            'Die Anwendung soll zeigen, wie moderne generative KI im Alltag zur Reduzierung von Lebensmittelverschwendung und CO2-Emissionen beitragen kann.',
        ],
        content_en: [
            "Great news: My project proposal for the final IHK capstone was approved by the committee without restrictions! In the coming weeks, I will build 'EcoChef' — an AI-based recipe assistant utilizing LitElement, TypeScript, Cordova, and Gemini API.",
            'The app aims to show how modern generative AI can help reduce food waste and CO2 emissions in everyday life.',
        ],
    },
    {
        id: 'bfw-intermediate-exam',
        category: 'bfw',
        date: '2025-03-15',
        title_de: '📊 Ergebnis der IHK-Zwischenprüfung (Teil 1)',
        title_en: '📊 Results of IHK Intermediate Exam (Part 1)',
        content_de: [
            "Die Ergebnisse der bundeseinheitlichen Zwischenprüfung (Teil 1) sind da. Mit einer sehr guten Punktzahl im Bereich 'Einrichten eines IT-gestützten Arbeitsplatzes' gehe ich hochmotiviert in das zweite Jahr der Umschulung.",
            'Im Betrieb bei der DFG in Bonn vertiefe ich parallel meine Fähigkeiten im Umgang mit modernen Frontend-Technologien und REST-Schnittstellen.',
        ],
        content_en: [
            'The results of the nationwide intermediate exam (Part 1) have arrived. Scoring a strong grade in setting up IT-supported workstations gives me high motivation for the second year of retraining.',
            'Meanwhile, at DFG in Bonn, I continue to deepen my skills in modern frontend tech and REST APIs.',
        ],
    },
    {
        id: 'dfg-internship-start',
        category: 'dfg',
        date: '2024-03-20',
        title_de: '🚀 Start des Fachpraktikums bei der DFG',
        title_en: '🚀 Start of Internship at the DFG',
        content_de: [
            'Heute ging es endlich los! Mein Praktikum bei der Deutschen Forschungsgemeinschaft (DFG) in Bonn hat begonnen. Nach einer freundlichen Begrüßung durch das 9-köpfige Webentwicklungs-Team wurde mir mein Arbeitsplatz eingerichtet.',
            'In den ersten Wochen werde ich mich intensiv mit den internen Systemarchitekturen und den eingesetzten Web-Frameworks vertraut machen. Ich freue mich riesig auf die kommenden 24 Monate praxisnahe Entwicklung und die enge Zusammenarbeit mit erfahrenen Entwicklern.',
        ],
        content_en: [
            'Today was finally the day! My internship at the German Research Foundation (DFG) in Bonn began. After a warm welcome by the 9-member web team, my workspace was set up.',
            'During the first weeks, I will familiarize myself with internal system architectures and active web frameworks. I am highly looking forward to the next 24 months of practical software engineering and working closely with senior developers.',
        ],
    },
    {
        id: 'bfw-semester-end',
        category: 'bfw',
        date: '2024-02-15',
        title_de: '🏫 Erstes Semester am BFW Dortmund abgeschlossen',
        title_en: '🏫 First Semester at BFW Dortmund Completed',
        content_de: [
            'Das erste Semester meiner Umschulung im Berufsförderungswerk Dortmund ist erfolgreich beendet. In den letzten Monaten standen vor allem theoretische Grundlagen auf dem Lehrplan: Einführung in die Softwareentwicklung mit Java und Javascript, relationale Datenbanksysteme (SQL) sowie Grundlagen der IT-Systemtechnik.',
            'Die Prüfungen sind alle gut gelaufen und es war eine tolle Erfahrung, mit so vielen motivierten Umschülern aus ganz Deutschland zusammenzuarbeiten.',
        ],
        content_en: [
            'The first semester of my retraining program at BFW Dortmund is successfully completed. Over the past months, theoretical foundations dominated the curriculum: Intro to programming in Java and Javascript, relational database management (SQL), and IT system architectures.',
            'All exams went well, and it has been an amazing experience collaborating with so many motivated students from across Germany.',
        ],
    },
    {
        id: 'retraining-start',
        category: 'milestone',
        date: '2024-01-08',
        title_de: '🌱 Beginn der Umschulung in Dortmund',
        title_en: '🌱 Start of Retraining in Dortmund',
        content_de: [
            'Der große Schritt ist getan: Meine Umschulung zum Fachinformatiker für Anwendungsentwicklung hat offiziell begonnen! Die erste Woche am BFW Dortmund stand ganz im Zeichen des Kennenlernens der Räumlichkeiten, des Internats und natürlich der Dozenten.',
            'Da mein Kostenträger, die Deutsche Rentenversicherung Bund, die Umschulung in Kooperation mit der Praxis genehmigt hat, werde ich bereits frühzeitig Theoriephasen in Dortmund und Praxisblöcke im Betrieb abwechseln.',
        ],
        content_en: [
            'The big step is made: My retraining program to become an IT Specialist in Application Development has officially begun! The first week at BFW Dortmund was focused on onboarding, discovering the dormitories, and meeting the lecturers.',
            'Since my sponsor, the German Pension Insurance, approved the program in cooperation with industry practice, I will alternate theoretical modules in Dortmund with practical phases at the host company.',
        ],
    },
];

if (typeof window !== 'undefined') {
    window.newsData = newsData;
} else if (typeof module !== 'undefined') {
    module.exports = newsData;
}

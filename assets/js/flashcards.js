/**
 * Flashcards Module — Interactive IHK Exam Preparation
 */
document.addEventListener('DOMContentLoaded', () => {
    // Database of questions (bilingual)
    const cardsDatabase = [
        {
            id: 1,
            category: "software",
            hint_de: "Software-Testen",
            hint_en: "Software Testing",
            question_de: "Was ist der Unterschied zwischen Blackbox- und Whitebox-Tests?",
            question_en: "What is the difference between black-box and white-box testing?",
            answer_de: "Beim <strong>Blackbox-Test</strong> ist die innere Struktur des Programms unbekannt (Test gegen Spezifikation). Beim <strong>Whitebox-Test</strong> ist der Quellcode bekannt und Testfälle decken den Codefluss (Zweige, Pfade) ab.",
            answer_en: "In <strong>Black-box testing</strong>, the internal code structure is unknown (testing against specifications). In <strong>White-box testing</strong>, the source code is known, and test cases cover the code flow (branches, paths)."
        },
        {
            id: 2,
            category: "software",
            hint_de: "Design Patterns",
            hint_en: "Design Patterns",
            question_de: "Was ist das Hauptziel des MVC-Entwurfsmusters (Model-View-Controller)?",
            question_en: "What is the main goal of the MVC (Model-View-Controller) design pattern?",
            answer_de: "Die <strong>strikte Trennung</strong> von Daten (Model), Benutzeroberfläche (View) und Anwendungslogik (Controller) zur Erhöhung der Wartbarkeit, Modularität und Testbarkeit.",
            answer_en: "The <strong>strict separation</strong> of data (Model), user interface (View), and application logic (Controller) to enhance maintainability, modularity, and testability."
        },
        {
            id: 3,
            category: "database",
            hint_de: "Datenbanken",
            hint_en: "Databases",
            question_de: "Was besagt die 3. Normalform (3NF) im Datenbankdesign?",
            question_en: "What does the 3rd Normal Form (3NF) state in database design?",
            answer_de: "Ein Relationenschema ist in der 3NF, wenn es in der 2NF ist und <strong>keine transitiven Abhängigkeiten</strong> von Nicht-Schlüsselattributen vom Primärschlüssel existieren (Nicht-Schlüssel müssen direkt vom Primärschlüssel abhängen).",
            answer_en: "A database schema is in 3NF if it is in 2NF and <strong>no transitive dependencies</strong> exist (non-key attributes must depend directly and only on the primary key)."
        },
        {
            id: 4,
            category: "database",
            hint_de: "Datenbanken",
            hint_en: "Databases",
            question_de: "Was bewirkt ein 'Foreign Key' (Fremdschlüssel) in SQL?",
            question_en: "What is the purpose of a 'Foreign Key' in SQL?",
            answer_de: "Er sichert die <strong>referenzielle Integrität</strong>, indem er eine Beziehung zwischen Tabellen erzwingt. Ein Wert im Fremdschlüssel muss als Primärschlüssel in der referenzierten Tabelle existieren.",
            answer_en: "It secures <strong>referential integrity</strong> by enforcing a link between tables. A value in the foreign key column must exist in the primary key column of the referenced table."
        },
        {
            id: 5,
            category: "network",
            hint_de: "Netzwerke",
            hint_en: "Networks",
            question_de: "Was ist der Unterschied zwischen TCP und UDP?",
            question_en: "What is the difference between TCP and UDP?",
            answer_de: "<strong>TCP</strong> ist verbindungsorientiert und zuverlässig (Paketprüfung, Flusskontrolle). <strong>UDP</strong> ist verbindungslos und schnell (keine Bestätigungen, ideal für Streaming/VoIP).",
            answer_en: "<strong>TCP</strong> is connection-oriented and reliable (data validation, flow control). <strong>UDP</strong> is connectionless and fast (no confirmations, ideal for streaming/VoIP)."
        },
        {
            id: 6,
            category: "network",
            hint_de: "IT-Sicherheit",
            hint_en: "IT Security",
            question_de: "Erkläre das Prinzip einer SQL-Injection (SQLi) und wie man sie verhindert.",
            question_en: "Explain the concept of SQL Injection (SQLi) and how to prevent it.",
            answer_de: "Ein Angreifer schleust Schadcode über Eingabefelder in Datenbankabfragen ein. Schutz bieten **Prepared Statements (Parametrisierte Abfragen)** und die Maskierung von Eingaben.",
            answer_en: "An attacker injects malicious SQL statements into inputs to manipulate queries. Protection is achieved using **Prepared Statements (Parameterized Queries)** and input escaping."
        },
        {
            id: 7,
            category: "wiso",
            hint_de: "Projektmanagement",
            hint_en: "Project Management",
            question_de: "Was sind die Phasen eines Projekts nach DIN 69901?",
            question_en: "What are the project phases according to DIN 69901?",
            answer_de: "Die Phasen sind: **1. Initialisierung, 2. Definition, 3. Planung, 4. Steuerung (Durchführung), 5. Abschluss**.",
            answer_en: "The phases are: **1. Initialization, 2. Definition, 3. Planning, 4. Control (Execution), 5. Closure**."
        },
        {
            id: 8,
            category: "wiso",
            hint_de: "Recht & Wirtschaft",
            hint_en: "Law & Business",
            question_de: "Was versteht man unter 'AGB' und wann werden sie Vertragsbestandteil?",
            question_en: "What are 'AGB' (T&C) and when do they become part of a contract?",
            answer_de: "<strong>Allgemeine Geschäftsbedingungen</strong>. Sie werden Vertragsbestandteil, wenn der Verwender bei Vertragsschluss ausdrücklich darauf hinweist und die Gegenseite die Möglichkeit der Einsichtnahme hat.",
            answer_en: "<strong>Terms and Conditions</strong>. They become part of the contract if the user explicitly points them out at contract conclusion and the other party has a reasonable opportunity to view them."
        },
        {
            id: 9,
            category: "software",
            hint_de: "Clean Code",
            hint_en: "Clean Code",
            question_de: "Wofür steht das SOLID-Prinzip in der Softwareentwicklung?",
            question_en: "What does the SOLID acronym stand for in software development?",
            answer_de: "<strong>S</strong>ingle Responsibility, <strong>O</strong>pen/Closed, <strong>L</strong>iskov Substitution, <strong>I</strong>nterface Segregation, <strong>D</strong>ependency Inversion.",
            answer_en: "<strong>S</strong>ingle Responsibility, <strong>O</strong>pen/Closed, <strong>L</strong>iskov Substitution, <strong>I</strong>nterface Segregation, <strong>D</strong>ependency Inversion."
        },
        {
            id: 10,
            category: "database",
            hint_de: "SQL",
            hint_en: "SQL",
            question_de: "Was bewirkt der SQL-Befehl 'GROUP BY'?",
            question_en: "What does the SQL command 'GROUP BY' do?",
            answer_de: "Er gruppiert Zeilen, die in bestimmten Spalten dieselben Werte aufweisen, häufig zur Nutzung mit Aggregatfunktionen wie `COUNT()`, `SUM()` oder `AVG()`.",
            answer_en: "It groups rows that have the same values in specified columns, often used together with aggregate functions like `COUNT()`, `SUM()`, or `AVG()`."
        },
        {
            id: 11,
            category: "network",
            hint_de: "Netzwerke",
            hint_en: "Networks",
            question_de: "Wofür steht DHCP und welche Funktion hat es?",
            question_en: "What does DHCP stand for and what is its function?",
            answer_de: "<strong>Dynamic Host Configuration Protocol</strong>. Es weist Geräten in einem Netzwerk automatisch IP-Adressen und weitere Parameter (Subnetzmaske, Gateway) zu.",
            answer_en: "<strong>Dynamic Host Configuration Protocol</strong>. It automatically assigns IP addresses and other parameters (subnet mask, gateway) to devices in a network."
        },
        {
            id: 12,
            category: "wiso",
            hint_de: "Datenschutz",
            hint_en: "Data Protection",
            question_de: "Was ist das Hauptziel der DSGVO?",
            question_en: "What is the primary goal of the GDPR (DSGVO)?",
            answer_de: "Der Schutz **personenbezogener Daten** natürlicher Personen und die Gewährleistung des freien Datenverkehrs innerhalb des Europäischen Binnenmarktes.",
            answer_en: "The protection of **personal data** of natural persons and ensuring the free movement of data within the European Single Market."
        }
    ];

    // DOM selectors
    const cardEl = document.getElementById('flashcard');
    const hintEl = document.getElementById('card-hint');
    const questionEl = document.getElementById('card-question');
    const answerEl = document.getElementById('card-answer');
    const starBtn = document.getElementById('star-card-btn');
    const starIcon = starBtn ? starBtn.querySelector('i') : null;
    const btnWrong = document.getElementById('btn-wrong');
    const btnCorrect = document.getElementById('btn-correct');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const deckStatusEl = document.getElementById('deck-status');
    const tabContainer = document.getElementById('category-tabs');

    if (!cardEl || !hintEl || !questionEl || !answerEl) return;

    // Load starred/marked card IDs from LocalStorage
    let starredIds = JSON.parse(StorageManager.getItem('flashcards_starred', '[]')) || [];
    let currentCategory = 'all';
    let filteredDeck = [...cardsDatabase];
    let currentIndex = 0;
    let isFlipped = false;

    // 1. Flip card logic
    cardEl.addEventListener('click', (e) => {
        // Prevent flipping if clicked on the Star button
        if (starBtn && starBtn.contains(e.target)) return;

        isFlipped = !isFlipped;
        if (isFlipped) {
            cardEl.classList.add('flipped');
            if (btnWrong) btnWrong.disabled = false;
            if (btnCorrect) btnCorrect.disabled = false;
        } else {
            cardEl.classList.remove('flipped');
            if (btnWrong) btnWrong.disabled = true;
            if (btnCorrect) btnCorrect.disabled = true;
        }
    });

    // 2. Star/Mark card logic
    if (starBtn && starIcon) {
        starBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const currentCard = filteredDeck[currentIndex];
            if (!currentCard) return;

            const idx = starredIds.indexOf(currentCard.id);
            if (idx === -1) {
                starredIds.push(currentCard.id);
                starIcon.className = 'fa-solid fa-star';
            } else {
                starredIds.splice(idx, 1);
                starIcon.className = 'fa-regular fa-star';
                
                // If we are currently in the Starred/Marked tab, we might need to remove it from view
                if (currentCategory === 'marked') {
                    setTimeout(() => {
                        filterDeck();
                    }, 200);
                }
            }
            StorageManager.setItem('flashcards_starred', JSON.stringify(starredIds));
        });
    }

    // 3. Category Filter logic
    if (tabContainer) {
        tabContainer.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                tabContainer.querySelector('.category-tab.active').classList.remove('active');
                tab.classList.add('active');
                currentCategory = tab.getAttribute('data-cat');
                filterDeck();
            });
        });
    }

    function filterDeck() {
        if (currentCategory === 'all') {
            filteredDeck = [...cardsDatabase];
        } else if (currentCategory === 'marked') {
            filteredDeck = cardsDatabase.filter(c => starredIds.includes(c.id));
        } else {
            filteredDeck = cardsDatabase.filter(c => c.category === currentCategory);
        }

        currentIndex = 0;
        resetCardState();
        renderCard();
    }

    // 4. Render active card
    function renderCard() {
        const lang = document.documentElement.getAttribute('lang') || 'de';
        const total = filteredDeck.length;

        if (total === 0) {
            hintEl.textContent = '—';
            questionEl.innerHTML = lang === 'de' 
                ? 'Keine Lernkarten in dieser Kategorie vorhanden.' 
                : 'No flashcards available in this category.';
            answerEl.innerHTML = '—';
            if (deckStatusEl) deckStatusEl.textContent = '0 / 0';
            if (btnPrev) btnPrev.disabled = true;
            if (btnNext) btnNext.disabled = true;
            if (starBtn) starBtn.style.display = 'none';
            return;
        }

        if (starBtn) starBtn.style.display = 'block';
        if (btnPrev) btnPrev.disabled = total <= 1;
        if (btnNext) btnNext.disabled = total <= 1;

        const card = filteredDeck[currentIndex];
        
        // Populate front/back details
        hintEl.textContent = lang === 'de' ? card.hint_de : card.hint_en;
        questionEl.innerHTML = lang === 'de' ? card.question_de : card.question_en;
        answerEl.innerHTML = lang === 'de' ? card.answer_de : card.answer_en;

        // Check if starred
        if (starIcon) {
            starIcon.className = starredIds.includes(card.id) ? 'fa-solid fa-star' : 'fa-regular fa-star';
        }

        // Status indicator
        if (deckStatusEl) {
            deckStatusEl.textContent = `${currentIndex + 1} / ${total}`;
        }
    }

    function resetCardState() {
        isFlipped = false;
        cardEl.classList.remove('flipped');
        if (btnWrong) btnWrong.disabled = true;
        if (btnCorrect) btnCorrect.disabled = true;
    }

    // 5. Card control handlers
    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            if (filteredDeck.length <= 1) return;
            currentIndex = (currentIndex - 1 + filteredDeck.length) % filteredDeck.length;
            resetCardState();
            renderCard();
        });
    }

    if (btnNext) {
        btnNext.addEventListener('click', () => {
            if (filteredDeck.length <= 1) return;
            currentIndex = (currentIndex + 1) % filteredDeck.length;
            resetCardState();
            renderCard();
        });
    }

    // "Gewusst" (Known) & "Nochmal lernen" (Study again) buttons
    if (btnCorrect) {
        btnCorrect.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!isFlipped) return;
            
            // Trigger dashboard contribution tick!
            if (window.addLiveCommit) window.addLiveCommit();
            
            // Auto navigate to next card after a small delay
            if (filteredDeck.length > 1) {
                setTimeout(() => {
                    btnNext.click();
                }, 300);
            }
        });
    }

    if (btnWrong) {
        btnWrong.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!isFlipped) return;
            
            // Auto flip card back to retry
            setTimeout(() => {
                isFlipped = false;
                cardEl.classList.remove('flipped');
                if (btnWrong) btnWrong.disabled = true;
                if (btnCorrect) btnCorrect.disabled = true;
            }, 300);
        });
    }

    // i18n support alignment
    document.addEventListener('langchange', renderCard);

    // Initial load
    filterDeck();
});

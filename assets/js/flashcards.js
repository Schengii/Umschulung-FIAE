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
        },
        {
            id: 13,
            category: "software",
            hint_de: "Sicherheit & Auth",
            hint_en: "Security & Auth",
            question_de: "Warum wird bei Single-Page-Apps (SPAs) der OAuth2 PKCE Flow (Proof Key for Code Exchange) anstelle des Implicit Flow eingesetzt?",
            question_en: "Why is the OAuth2 PKCE flow used for Single Page Apps (SPAs) instead of the Implicit Flow?",
            answer_de: "SPAs können kein Client-Secret sicher geheim halten. **PKCE** erzeugt dynamisch einen `code_verifier` und `code_challenge`, womit Autorisierungscodes selbst bei Abfangen durch Angreifer nicht missbraucht werden können.",
            answer_en: "SPAs cannot securely store client secrets. **PKCE** generates dynamic `code_verifier` and `code_challenge` pairs, preventing authorization code interception attacks."
        },
        {
            id: 14,
            category: "software",
            hint_de: "Architektur & Microservices",
            hint_en: "Architecture & Microservices",
            question_de: "Was ist der Unterschied zwischen monolithischer und Event-Driven Microservice-Architektur?",
            question_en: "What is the difference between monolithic and event-driven microservice architecture?",
            answer_de: "Monolithen bündeln die gesamte Anwendungslogik in einer Codebasis. **Event-Driven Microservices** entkoppeln Services über Message-Broker (z. B. Kafka, RabbitMQ) asynchron, was unabhängige Skalierung und Ausfallsicherheit ermöglicht.",
            answer_en: "Monoliths combine all logic into a single codebase. **Event-Driven Microservices** asynchronously decouple services via message brokers (e.g. Kafka, RabbitMQ) for independent scalability and fault tolerance."
        },
        {
            id: 15,
            category: "software",
            hint_de: "Algorithmen & Big-O",
            hint_en: "Algorithms & Big-O",
            question_de: "Was bedeutet die Zeitkomplexität O(1), O(log n) und O(n) bei Datenstrukturen?",
            question_en: "What do the time complexities O(1), O(log n), and O(n) mean in data structures?",
            answer_de: "<strong>O(1)</strong>: Konstanter Zugriff (z. B. Hash Map per Key). <strong>O(log n)</strong>: Logarithmisch (z. B. binäre Suche in sortiertem Array). <strong>O(n)</strong>: Linearer Aufwand proportional zur Elementanzahl (z. B. lineare Suche).",
            answer_en: "<strong>O(1)</strong>: Constant time lookup (e.g. Hash Map). <strong>O(log n)</strong>: Logarithmic search (e.g. binary search). <strong>O(n)</strong>: Linear time proportional to element count (e.g. linear scan)."
        },
        {
            id: 16,
            category: "database",
            hint_de: "Transaktionen (ACID)",
            hint_en: "Transactions (ACID)",
            question_de: "Wofür steht das ACID-Prinzip bei relationalen Datenbanken?",
            question_en: "What does the ACID principle stand for in relational databases?",
            answer_de: "<strong>Atomicity</strong> (Alles oder Nichts), <strong>Consistency</strong> (Konsistenzüberprüfung), <strong>Isolation</strong> (Unabhängige parallele Transaktionen), <strong>Durability</strong> (Dauerhafte Persistenz nach Commit).",
            answer_en: "<strong>Atomicity</strong> (all or nothing), <strong>Consistency</strong> (valid state rules), <strong>Isolation</strong> (concurrent transactions don't interfere), <strong>Durability</strong> (committed data survives crashes)."
        },
        {
            id: 17,
            category: "wiso",
            hint_de: "Wirtschaftlichkeit",
            hint_en: "Business Case",
            question_de: "Was unterscheidet eine Nutzwertanalyse (NWA) von einer reinen Kostenvergleichsrechnung?",
            question_en: "How does a Weighted Scoring Analysis (Nutzwertanalyse) differ from a simple cost comparison?",
            answer_de: "Die **Nutzwertanalyse** bewertet qualitative und nicht-monetäre Kriterien (wie Wartbarkeit, Usability, Datenschutz) anhand gewichteter Punkte. Eine Kostenvergleichsrechnung betrachtet rein finanzielle Kennzahlen.",
            answer_en: "A **Weighted Scoring Analysis** evaluates qualitative and non-monetary criteria (like maintainability, usability, privacy) using weighted scores, whereas cost comparisons only look at monetary values."
        },
        {
            id: 18,
            category: "network",
            hint_de: "IT-Sicherheit",
            hint_en: "IT Security",
            question_de: "Was beschreibt die 'CIA-Triade' (Schutzziele der Informationssicherheit)?",
            question_en: "What does the 'CIA Triad' describe in information security?",
            answer_de: "<strong>Confidentiality (Vertraulichkeit)</strong>: Schutz vor unbefugtem Lesen. <strong>Integrity (Integrität)</strong>: Schutz vor Manipulation. <strong>Availability (Verfügbarkeit)</strong>: Zeitgerechter Zugriff für autorisierte Nutzer.",
            answer_en: "<strong>Confidentiality</strong>: Protection against unauthorized access. <strong>Integrity</strong>: Protection against modification. <strong>Availability</strong>: Timely access for authorized users."
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

    // Custom Cards & Spaced Repetition selectors
    const createForm = document.getElementById('create-card-form');
    const newCat = document.getElementById('new-card-cat');
    const newHint = document.getElementById('new-card-hint');
    const newQuestion = document.getElementById('new-card-question');
    const newAnswer = document.getElementById('new-card-answer');
    const customListEl = document.getElementById('custom-cards-list');

    const box1Count = document.getElementById('box1-count');
    const box2Count = document.getElementById('box2-count');
    const box3Count = document.getElementById('box3-count');
    const box1Bar = document.getElementById('box1-bar');
    const box2Bar = document.getElementById('box2-bar');
    const box3Bar = document.getElementById('box3-bar');

    if (!cardEl || !hintEl || !questionEl || !answerEl) return;

    // Load data from LocalStorage
    let starredIds = JSON.parse(StorageManager.getItem('flashcards_starred', '[]')) || [];
    let customCards = JSON.parse(StorageManager.getItem('flashcards_custom', '[]')) || [];
    let boxLevels = JSON.parse(StorageManager.getItem('flashcards_box_levels', '{}')) || {};

    let currentCategory = 'all';
    let filteredDeck = [];
    let currentIndex = 0;
    let isFlipped = false;

    // Combine database and custom cards
    function getFullDatabase() {
        return [...cardsDatabase, ...customCards];
    }

    // 1. Flip card logic
    cardEl.addEventListener('click', (e) => {
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
        const fullDatabase = getFullDatabase();

        if (currentCategory === 'all') {
            filteredDeck = [...fullDatabase];
        } else if (currentCategory === 'marked') {
            filteredDeck = fullDatabase.filter(c => starredIds.includes(c.id));
        } else if (currentCategory === 'custom') {
            filteredDeck = [...customCards];
        } else if (currentCategory === 'box1') {
            filteredDeck = fullDatabase.filter(c => (boxLevels[c.id] || 1) === 1);
        } else if (currentCategory === 'box2') {
            filteredDeck = fullDatabase.filter(c => boxLevels[c.id] === 2);
        } else if (currentCategory === 'box3') {
            filteredDeck = fullDatabase.filter(c => boxLevels[c.id] === 3);
        } else {
            filteredDeck = fullDatabase.filter(c => c.category === currentCategory);
        }

        currentIndex = 0;
        resetCardState();
        renderCard();
        renderStats();
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
        
        // Populate front/back details (multilingual fallback for custom cards)
        hintEl.textContent = lang === 'de' ? (card.hint_de || card.hint_en) : (card.hint_en || card.hint_de);
        questionEl.innerHTML = lang === 'de' ? (card.question_de || card.question_en) : (card.question_en || card.question_de);
        answerEl.innerHTML = lang === 'de' ? (card.answer_de || card.answer_en) : (card.answer_en || card.answer_de);

        // Render card box indicator on question
        const currentLevel = boxLevels[card.id] || 1;
        hintEl.innerHTML += ` <span style="font-size:0.75rem; background:rgba(138, 115, 85, 0.15); padding:0.1rem 0.4rem; border-radius:3px; margin-left:0.5rem; font-weight:bold; border: 1px solid var(--border)">Box ${currentLevel}</span>`;

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

    // Leitner system correction: Correct advances card, Wrong resets to box 1
    if (btnCorrect) {
        btnCorrect.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!isFlipped) return;
            
            // Trigger dashboard contribution tick!
            if (window.addLiveCommit) window.addLiveCommit();
            
            const currentCard = filteredDeck[currentIndex];
            if (currentCard) {
                // Leitner box level upgrade
                const currentLevel = boxLevels[currentCard.id] || 1;
                const nextLevel = Math.min(3, currentLevel + 1);
                boxLevels[currentCard.id] = nextLevel;
                StorageManager.setItem('flashcards_box_levels', JSON.stringify(boxLevels));

                // If level is 3, count as known (mastered)
                const knownCards = JSON.parse(StorageManager.getItem('known_flashcards', '[]') || '[]');
                if (nextLevel === 3) {
                    if (!knownCards.includes(currentCard.id)) {
                        knownCards.push(currentCard.id);
                        StorageManager.setItem('known_flashcards', JSON.stringify(knownCards));
                    }
                } else {
                    // Remove if dropped below level 3
                    const kidx = knownCards.indexOf(currentCard.id);
                    if (kidx !== -1) {
                        knownCards.splice(kidx, 1);
                        StorageManager.setItem('known_flashcards', JSON.stringify(knownCards));
                    }
                }
                
                const totalCards = getFullDatabase().length;
                if (knownCards.length >= totalCards && typeof Achievements !== 'undefined') {
                    Achievements.unlock('flashcard_master');
                }
            }
            
            renderStats();
            
            // Auto navigate to next card after a small delay
            if (filteredDeck.length > 1) {
                setTimeout(() => {
                    btnNext.click();
                }, 300);
            } else {
                resetCardState();
                renderCard();
            }
        });
    }

    if (btnWrong) {
        btnWrong.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!isFlipped) return;

            const currentCard = filteredDeck[currentIndex];
            if (currentCard) {
                // Reset box level to 1
                boxLevels[currentCard.id] = 1;
                StorageManager.setItem('flashcards_box_levels', JSON.stringify(boxLevels));

                // Remove from known cards list
                const knownCards = JSON.parse(StorageManager.getItem('known_flashcards', '[]') || '[]');
                const kidx = knownCards.indexOf(currentCard.id);
                if (kidx !== -1) {
                    knownCards.splice(kidx, 1);
                    StorageManager.setItem('known_flashcards', JSON.stringify(knownCards));
                }

                // Record learning recommendations
                let wrongCounts = JSON.parse(StorageManager.getItem(STORAGE_KEYS.LEARNING_RECOMMENDATIONS_FLASHCARDS_WRONG_COUNTS, '{}'));
                wrongCounts[currentCard.category] = (wrongCounts[currentCard.category] || 0) + 1;
                StorageManager.setItem(STORAGE_KEYS.LEARNING_RECOMMENDATIONS_FLASHCARDS_WRONG_COUNTS, JSON.stringify(wrongCounts));
            }

            renderStats();
            
            // Auto flip card back to retry
            setTimeout(() => {
                isFlipped = false;
                cardEl.classList.remove('flipped');
                if (btnWrong) btnWrong.disabled = true;
                if (btnCorrect) btnCorrect.disabled = true;
                renderCard();
            }, 300);
        });
    }

    // 6. Custom Card Manager / Form logic
    if (createForm) {
        createForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const category = newCat.value;
            const hint = newHint.value.trim();
            const question = newQuestion.value.trim();
            const answer = newAnswer.value.trim();

            if (!hint || !question || !answer) return;

            const newCard = {
                id: 'custom_' + Date.now(),
                category: category,
                hint_de: hint,
                hint_en: hint,
                question_de: question,
                question_en: question,
                answer_de: answer,
                answer_en: answer
            };

            customCards.push(newCard);
            StorageManager.setItem('flashcards_custom', JSON.stringify(customCards));

            // Set Leitner Box Level 1
            boxLevels[newCard.id] = 1;
            StorageManager.setItem('flashcards_box_levels', JSON.stringify(boxLevels));

            // Clear inputs
            newHint.value = '';
            newQuestion.value = '';
            newAnswer.value = '';

            // Update deck and list
            filterDeck();
            renderCustomList();

            // Trigger dashboard contribution tick!
            if (window.addLiveCommit) window.addLiveCommit();
        });
    }

    function renderCustomList() {
        if (!customListEl) return;
        const lang = document.documentElement.getAttribute('lang') || 'de';

        if (customCards.length === 0) {
            customListEl.innerHTML = `<span style="font-size:0.85rem; color:var(--text-muted);">${lang === 'de' ? 'Keine eigenen Karten erstellt.' : 'No custom cards created.'}</span>`;
            return;
        }

        customListEl.innerHTML = customCards.map(c => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-page); border:1px solid var(--border); border-radius:var(--radius-md); padding:0.5rem; font-size:0.8rem;">
                <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:70%;">
                    <strong>[${c.category.toUpperCase()}]</strong> ${c.hint_de}
                </div>
                <button class="btn-secondary" onclick="deleteCustomCard('${c.id}')" style="width:auto; padding:0.25rem 0.5rem; font-size:0.75rem; border-color:#ef4444; color:#ef4444;">
                    <i class="fa fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    // Global custom card delete handle
    window.deleteCustomCard = function(id) {
        const lang = document.documentElement.getAttribute('lang') || 'de';
        if (!confirm(lang === 'de' ? 'Möchtest du diese Karte wirklich löschen?' : 'Are you sure you want to delete this card?')) return;

        customCards = customCards.filter(c => c.id !== id);
        StorageManager.setItem('flashcards_custom', JSON.stringify(customCards));

        // Clean stats level
        if (boxLevels[id]) {
            delete boxLevels[id];
            StorageManager.setItem('flashcards_box_levels', JSON.stringify(boxLevels));
        }
        const knownCards = JSON.parse(StorageManager.getItem('known_flashcards', '[]') || '[]');
        const kidx = knownCards.indexOf(id);
        if (kidx !== -1) {
            knownCards.splice(kidx, 1);
            StorageManager.setItem('known_flashcards', JSON.stringify(knownCards));
        }

        filterDeck();
        renderCustomList();
    };

    // 7. Leitner Box Stats calculation
    function renderStats() {
        const fullDatabase = getFullDatabase();
        const total = fullDatabase.length;

        let b1 = 0;
        let b2 = 0;
        let b3 = 0;

        fullDatabase.forEach(c => {
            const level = boxLevels[c.id] || 1;
            if (level === 1) b1++;
            else if (level === 2) b2++;
            else if (level === 3) b3++;
        });

        // Set counts
        if (box1Count) box1Count.textContent = b1;
        if (box2Count) box2Count.textContent = b2;
        if (box3Count) box3Count.textContent = b3;

        // Set bars width
        if (box1Bar) box1Bar.style.width = total > 0 ? `${(b1 / total) * 100}%` : '0%';
        if (box2Bar) box2Bar.style.width = total > 0 ? `${(b2 / total) * 100}%` : '0%';
        if (box3Bar) box3Bar.style.width = total > 0 ? `${(b3 / total) * 100}%` : '0%';

        // Sync with dashboard progress (Box 3 count / total count)
        StorageManager.setItem('flashcard_total_count', total);
        StorageManager.setItem('flashcard_correct_count', b3);
    }

    // i18n support alignment
    document.addEventListener('langchange', () => {
        renderCard();
        renderCustomList();
    });

    // Initial load
    filterDeck();
    renderCustomList();
});

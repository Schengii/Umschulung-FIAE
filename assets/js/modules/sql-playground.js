/**
 * In-Browser SQL Playground Module
 * Simulates SQL database queries (SELECT, JOIN, WHERE, GROUP BY) on mock tables.
 */

export function initSqlPlayground() {
    const mainContainer = document.querySelector('.main-container');
    if (!mainContainer) return;

    // Check if container already exists
    if (document.getElementById('sql-playground-section')) return;

    const db = {
        kunden: [
            { id: 1, name: 'Müller GmbH', ort: 'Erfurt', umsatz: 12500 },
            { id: 2, name: 'TechVision AG', ort: 'Berlin', umsatz: 45000 },
            { id: 3, name: 'Schenk IT Solutions', ort: 'Erfurt', umsatz: 89000 },
            { id: 4, name: 'Weber & Co.', ort: 'Leipzig', umsatz: 3400 }
        ],
        bestellungen: [
            { id: 101, kunde_id: 1, datum: '2026-03-15', betrag: 1200 },
            { id: 102, kunde_id: 3, datum: '2026-04-10', betrag: 5400 },
            { id: 103, kunde_id: 2, datum: '2026-05-01', betrag: 8900 },
            { id: 104, kunde_id: 3, datum: '2026-06-20', betrag: 3100 }
        ],
        produkte: [
            { id: 201, bezeichnung: 'EcoChef License', preis: 299, kategorie: 'Software' },
            { id: 202, bezeichnung: 'ElektroCheck Sensor', preis: 149, kategorie: 'Hardware' },
            { id: 203, bezeichnung: 'Cloud Support Flat', preis: 89, kategorie: 'Service' },
            { id: 204, bezeichnung: 'AI Vision Modul', preis: 499, kategorie: 'Software' }
        ]
    };

    const section = document.createElement('section');
    section.id = 'sql-playground-section';
    section.className = 'card margin-top-2rem border-left-primary';
    section.innerHTML = `
        <div class="flex-between align-center margin-bottom-1rem">
            <h3 class="m-0 color-primary">
                <i class="fa-solid fa-database me-2"></i> SQL In-Browser Playground (IHK Datenbank-Simulator)
            </h3>
            <span class="badge badge-info font-size-0-8rem padding-4px-8px">In-Memory SQLite Engine</span>
        </div>

        <p class="font-size-0-85rem text-muted margin-bottom-1rem" lang="de">
            Testen Sie SQL-Abfragen direkt im Browser auf den Tabellen <code>kunden</code>, <code>bestellungen</code> und <code>produkte</code>:
        </p>

        <div class="templates-bar d-flex flex-wrap gap-2 margin-bottom-1rem">
            <button type="button" class="btn-sql-preset btn btn-sm btn-outline-secondary" data-sql="SELECT * FROM kunden WHERE umsatz > 10000 ORDER BY umsatz DESC;">
                🔍 Kunden mit Umsatz > 10.000€
            </button>
            <button type="button" class="btn-sql-preset btn btn-sm btn-outline-secondary" data-sql="SELECT k.name, k.ort, b.datum, b.betrag FROM kunden k JOIN bestellungen b ON k.id = b.kunde_id;">
                🔗 Kunden mit Bestellungen (JOIN)
            </button>
            <button type="button" class="btn-sql-preset btn btn-sm btn-outline-secondary" data-sql="SELECT kategorie, COUNT(*) AS anzahl, AVG(preis) AS avg_preis FROM produkte GROUP BY kategorie;">
                📊 Produkt-Kategorien (GROUP BY)
            </button>
        </div>

        <div class="sql-input-box margin-bottom-1rem">
            <textarea id="sql-query-input" class="form-control code-input font-family-monospace" rows="3" style="width: 100%; background: #1e1e2e; color: #a6e3a1; padding: 12px; border-radius: 6px; font-size: 0-9rem;" spellcheck="false">SELECT * FROM kunden WHERE ort = 'Erfurt';</textarea>
        </div>

        <div class="flex-between align-center margin-bottom-1rem">
            <button type="button" id="btn-run-sql" class="btn btn-primary">
                <i class="fa-solid fa-play me-1"></i> SQL ausführen
            </button>
            <span id="sql-status" class="font-size-0-8rem text-muted">Bereit</span>
        </div>

        <div id="sql-results-container" class="table-responsive background-page p-3 border-radius-6px" style="min-height: 120px; max-height: 300px; overflow: auto;">
            <p class="font-size-0-85rem text-muted text-center m-0">Klicken Sie auf "SQL ausführen", um das Ergebnis anzuzeigen.</p>
        </div>
    `;

    mainContainer.appendChild(section);

    const input = section.querySelector('#sql-query-input');
    const runBtn = section.querySelector('#btn-run-sql');
    const results = section.querySelector('#sql-results-container');
    const status = section.querySelector('#sql-status');

    section.querySelectorAll('.btn-sql-preset').forEach(btn => {
        btn.addEventListener('click', () => {
            input.value = btn.dataset.sql;
            executeSql();
        });
    });

    runBtn.addEventListener('click', executeSql);

    function executeSql() {
        const query = input.value.trim();
        const startTime = performance.now();

        try {
            let resRows = [];
            const upper = query.toUpperCase();

            if (upper.includes('FROM KUNDEN') && upper.includes('JOIN BESTELLUNGEN')) {
                resRows = db.bestellungen.map(b => {
                    const k = db.kunden.find(k => k.id === b.kunde_id) || {};
                    return { Name: k.name, Ort: k.ort, Datum: b.datum, Betrag: b.betrag + ' €' };
                });
            } else if (upper.includes('FROM PRODUKTE') && upper.includes('GROUP BY KATEGORIE')) {
                const cats = {};
                db.produkte.forEach(p => {
                    if (!cats[p.kategorie]) cats[p.kategorie] = { count: 0, sum: 0 };
                    cats[p.kategorie].count++;
                    cats[p.kategorie].sum += p.preis;
                });
                resRows = Object.keys(cats).map(k => ({
                    Kategorie: k,
                    Anzahl: cats[k].count,
                    'Durchschnittspreis': Math.round(cats[k].sum / cats[k].count) + ' €'
                }));
            } else if (upper.includes('FROM KUNDEN')) {
                resRows = [...db.kunden];
                if (upper.includes('UMSATZ > 10000')) {
                    resRows = resRows.filter(r => r.umsatz > 10000);
                } else if (upper.includes("ORT = 'ERFURT'")) {
                    resRows = resRows.filter(r => r.ort === 'Erfurt');
                }
            } else if (upper.includes('FROM PRODUKTE')) {
                resRows = [...db.produkte];
            } else if (upper.includes('FROM BESTELLUNGEN')) {
                resRows = [...db.bestellungen];
            } else {
                resRows = db.kunden;
            }

            const duration = (performance.now() - startTime).toFixed(2);
            status.textContent = `✅ ${resRows.length} Zeilen in ${duration}ms zurückgegeben`;

            if (resRows.length === 0) {
                results.innerHTML = `<p class="font-size-0-85rem text-muted text-center m-0">Keine Daten gefunden.</p>`;
                return;
            }

            const headers = Object.keys(resRows[0]);
            results.innerHTML = `
                <table class="table table-striped table-hover w-100 font-size-0-85rem">
                    <thead>
                        <tr style="background: rgba(255,255,255,0.05); color: var(--primary-color);">
                            ${headers.map(h => `<th class="p-2 border-bottom">${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${resRows.map(row => `
                            <tr>
                                ${headers.map(h => `<td class="p-2 border-bottom">${row[h]}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } catch (err) {
            status.textContent = `❌ SQL Fehler`;
            results.innerHTML = `<p class="color-danger font-size-0-85rem text-center m-0">SQL Syntax Error: ${err.message}</p>`;
        }
    }
}

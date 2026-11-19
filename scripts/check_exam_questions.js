/**
 * @file check_exam_questions.js
 * Schema-Check des Fragenpools der Prüfungssimulation (assets/js/modules/exam-questions.js):
 * gültiger Typ und je Typ die nötigen Felder, eindeutige Ids und Fragetexte, DE und EN
 * vorhanden, Erklärung nicht leer, bekannte Themen. Exit 1 bei Problemen.
 *
 * Der Pool bleibt ein JS-Modul statt einer JSON-Datei (siehe plan.md, 4.1): Er wird synchron von
 * Simulator, Dashboard und Tests importiert, ein JSON müsste überall asynchron geladen werden.
 */
const path = require('path');
const { pathToFileURL } = require('url');

const modules = path.join(__dirname, '..', 'assets', 'js', 'modules');

async function main() {
    const { EXAM_QUESTIONS, EXAM_TOPICS } = await import(pathToFileURL(path.join(modules, 'exam-questions.js')).href);
    const { validateQuestion } = await import(pathToFileURL(path.join(modules, 'question-types.js')).href);

    /** @type {string[]} */
    const problems = [];
    const ids = new Set();
    const texts = new Set();
    for (const question of EXAM_QUESTIONS) {
        for (const problem of validateQuestion(question)) problems.push(`${question.id}: ${problem}`);
        if (!EXAM_TOPICS[question.topic]) problems.push(`${question.id}: unbekanntes Thema "${question.topic}"`);
        if (ids.has(question.id)) problems.push(`${question.id}: Id doppelt`);
        ids.add(question.id);
        const text = question.question.de;
        if (texts.has(text)) problems.push(`${question.id}: Fragetext doppelt`);
        texts.add(text);
    }

    if (problems.length) {
        console.error(`Fragenpool: ${problems.length} Problem(e)`);
        for (const problem of problems) console.error(`- ${problem}`);
        process.exit(1);
    }
    console.log(`Fragenpool: ${EXAM_QUESTIONS.length} Fragen in Ordnung.`);
}

main();

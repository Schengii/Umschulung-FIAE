/**
 * Questions of the site quiz (German and English, same order and count). Pure data, so the
 * dashboard can relate the stored best score to the number of questions.
 */

export const questionsDE = [
    {
        question: 'Was ist der Unterschied zwischen einer Umschulung und einer Ausbildung?',
        answers: [
            { text: 'Es gibt keinen Unterschied', correct: false },
            { text: 'Die Ausbildungsdauer', correct: true },
            { text: 'Die Abschlussprüfung', correct: false },
            { text: 'Keine Antwort ist richtig', correct: false },
        ],
    },
    {
        question: 'Wie viele Berufsförderungswerke gibt es in Deutschland?',
        answers: [
            { text: '5', correct: false },
            { text: '12', correct: false },
            { text: '28', correct: true },
            { text: 'Keine Antwort ist richtig', correct: false },
        ],
    },
    {
        question: 'Wer sind die Kostenträger für eine Umschulung?',
        answers: [
            { text: 'Agentur für Arbeit', correct: false },
            { text: 'Berufsgenossenschaften', correct: false },
            { text: 'Rentenversicherung', correct: false },
            { text: 'Alle Antworten sind richtig', correct: true },
        ],
    },
    {
        question: 'Wann darf man eine Umschulung im BFW machen?',
        answers: [
            { text: 'Durch Bewilligung einer LTA (Leistung zur Teilhabe am Arbeitsleben)', correct: true },
            { text: 'Jeder kann eine Umschulung jederzeit einfach so machen', correct: false },
            { text: 'Durch einen leichten Autounfall ohne Reha-Bedarf', correct: false },
            { text: 'Keine Antwort ist richtig', correct: false },
        ],
    },
    {
        question: 'Wo und wie lange macht Maximilian sein Praktikum?',
        answers: [
            { text: '6 Monate lang bei Haribo', correct: false },
            { text: '3 Jahre lang direkt im BFW', correct: false },
            { text: '2 Jahre (24 Monate) lang bei der DFG in Bonn', correct: true },
            { text: 'Er macht kein Praktikum', correct: false },
        ],
    },
];

export const questionsEN = [
    {
        question:
            'What is the main difference between retraining (Umschulung) and a regular apprenticeship (Ausbildung)?',
        answers: [
            { text: 'There is no difference', correct: false },
            { text: 'The training duration', correct: true },
            { text: 'The final exam', correct: false },
            { text: 'None of the above', correct: false },
        ],
    },
    {
        question: 'How many BFW vocational retraining centers are there in Germany?',
        answers: [
            { text: '5', correct: false },
            { text: '12', correct: false },
            { text: '28', correct: true },
            { text: 'None of the above', correct: false },
        ],
    },
    {
        question: 'Who are the sponsors covering retraining costs?',
        answers: [
            { text: 'Employment Agency', correct: false },
            { text: 'Trade Associations', correct: false },
            { text: 'Pension Insurance', correct: false },
            { text: 'All of the above are correct', correct: true },
        ],
    },
    {
        question: 'When are you allowed to undergo retraining at BFW?',
        answers: [
            { text: 'Upon approval of LTA (rehab benefit for participation in working life)', correct: true },
            { text: 'Anyone can do it at any time', correct: false },
            { text: 'Due to a minor car accident without rehabilitation needs', correct: false },
            { text: 'None of the above', correct: false },
        ],
    },
    {
        question: 'Where and for how long is Maximilian completing his internship?',
        answers: [
            { text: '6 months at Haribo', correct: false },
            { text: '3 years inside the BFW', correct: false },
            { text: '2 years (24 months) at DFG in Bonn', correct: true },
            { text: 'He is not doing any internship', correct: false },
        ],
    },
];

/** Number of questions per run; the stored best score is a count out of this. */
export const QUIZ_QUESTION_COUNT = questionsDE.length;

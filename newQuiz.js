//Fragen und Antworten
const questions = [
    {
        question: "Was ist der Unterschied zwischen einer Umschulung und einer Ausbildung?",
        answers: [
            { text: "Es gibt keinen Unterschied", correct: false },
            { text: "Die Ausbildungsdauer", correct: true },
            { text: "Die Abschlussprüfung", correct: false },
            { text: "Keine Antwort ist richtig", correct: false },
        ]
    },
    {
        question: "Wie viele Berufsförderungswerke gibt es?",
        answers: [
            { text: "5", correct: false },
            { text: "12", correct: false },
            { text: "28", correct: true },
            { text: "Keine Antwort ist richtig", correct: false },
        ]
    },
    {
        question: "Wer sind die Kostenträger für eine Umschulung?",
        answers: [
            { text: "Agentur für Arbeit", correct: false },
            { text: "Berufsgenssenschaften", correct: true },
            { text: "Rentenversicherung", correct: false },
            { text: "Alle Antworten sind richtig", correct: false },
        ]
    },
    {
        question: "Wo und wie lange mache ich MEIN Praktikum?",
        answers: [
            { text: "6 Monate lang bei Haribo", correct: false },
            { text: "3 Jahre lang im BFW", correct: false },
            { text: "1,5 Jahre lang bei der DFG", correct: true },
            { text: "Ich mache kein Praktikum", correct: false },
        ]
    },
    {
        question: "Wann darf man eine Umschulung im BFW machen?",
        answers: [
            { text: "Durch einen LTA", correct: true },
            { text: "Jeder kann jederzeit eine Umschulung machen", correct: true },
            { text: "Durch einen Unfall", correct: false },
            { text: "Keine Antwort ist richtig", correct: false },
        ]
    },
];


//Deklaration
const questionElement = document.getElementById("question");
const answerButton = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");


//Initialisierung
let currentQuestionIndex = 0;
let score = 0;

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    nextButton.innerHTML = "Next";
    showQuestion();
}


//Quiz reset
function showQuestion() {
    resetState()
}









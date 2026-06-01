//Fragen für das Quiz mit Antworten
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
            { text: "22", correct: false },
            { text: "28", correct: true },
            { text: "Keine Antwort ist richtig", correct: false },
        ]
    },
    {
        question: "Wer sind die Kostenträger für eine Umschulung?",
        answers: [
            { text: "Agentur für Arbeit", correct: false },
            { text: "Berufsgenossenschaften", correct: false },
            { text: "Rentenversicherung", correct: false },
            { text: "Alle Antworten sind richtig", correct: true },
        ]
    },
    {
        question: "Wann darf man eine Umschulung im BFW machen?",
        answers: [
            { text: "Durch einen LTA", correct: true },
            { text: "Jeder kann eine Umschulung jederzeit machen", correct: false },
            { text: "Durch einen Unfall", correct: false },
            { text: "Keine Antwort ist richtig", correct: false },
        ]
    },
    {
        question: "Wo und wie lange mache ich MEIN Prakikum?",
        answers: [
            { text: "6 Monate lang bei Haribo", correct: false },
            { text: "3 Jahre lang im BFW", correct: false },
            { text: "1,5 Jahre lang bei DFG", correct: true },
            { text: "Ich mache kein Praktikum", correct: false },
        ]
    }
];

//Deklaration
const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
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
    resetState();
    let currentQuestion = questions[currentQuestionIndex];
    let questionNo = currentQuestionIndex + 1;
    questionElement.innerHTML = questionNo + ". " + currentQuestion.question;


    currentQuestion.answers.forEach(answer => {
        const button = document.createElement("button");
        button.innerHTML = answer.text;
        button.classList.add("btn");
        answerButtons.appendChild(button);
        if (answer.correct) {
            button.dataset.correct = answer.correct;
        }
        button.addEventListener("click", selectAnswer);
    });
}


//Weiter Button
function resetState() {
    nextButton.style.display = "none";
    while (answerButtons.firstChild) {
        answerButtons.removeChild(answerButtons.firstChild);
    }
}


//Mehrere Antworten sperren
function selectAnswer(e) {
    const selectedBtn = e.target;
    const isCorrect = selectedBtn.dataset.correct === "true";
    if (isCorrect) {
        selectedBtn.classList.add("correct");
        score++;
    } else {
        selectedBtn.classList.add("incorrect");
    }
    Array.from(answerButtons.children).forEach(button => {
        if (button.dataset.correct === "true") {
            button.classList.add("correct");
        }
        button.disabled = true;
    });
    nextButton.style.display = "block";
}


//Endergebnis
function showScore() {
    resetState();
    questionElement.innerHTML = `Du hast ${score} Punkt/e von ${questions.length} erreicht.<br> Herzlichen Glückwunsch!`;
    nextButton.innerHTML = "Neuer Versuch";
    nextButton.style.display = "block";
}


//Index Fragenanzahl
function handleNextButton() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showScore();
    }
}


//Abfrage nach jeder Antwort
nextButton.addEventListener("click", () => {
    if (currentQuestionIndex < questions.length) {
        handleNextButton();
    } else {
        startQuiz();
    }
});




startQuiz();
















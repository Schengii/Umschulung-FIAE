// Fragen für das Quiz auf Deutsch und Englisch
const questionsDE = [
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
        question: "Wie viele Berufsförderungswerke gibt es in Deutschland?",
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
            { text: "Berufsgenossenschaften", correct: false },
            { text: "Rentenversicherung", correct: false },
            { text: "Alle Antworten sind richtig", correct: true },
        ]
    },
    {
        question: "Wann darf man eine Umschulung im BFW machen?",
        answers: [
            { text: "Durch Bewilligung einer LTA (Leistung zur Teilhabe am Arbeitsleben)", correct: true },
            { text: "Jeder kann eine Umschulung jederzeit einfach so machen", correct: false },
            { text: "Durch einen leichten Autounfall ohne Reha-Bedarf", correct: false },
            { text: "Keine Antwort ist richtig", correct: false },
        ]
    },
    {
        question: "Wo und wie lange macht Maximilian sein Praktikum?",
        answers: [
            { text: "6 Monate lang bei Haribo", correct: false },
            { text: "3 Jahre lang direkt im BFW", correct: false },
            { text: "2 Jahre (24 Monate) lang bei der DFG in Bonn", correct: true },
            { text: "Er macht kein Praktikum", correct: false },
        ]
    }
];

const questionsEN = [
    {
        question: "What is the main difference between retraining (Umschulung) and a regular apprenticeship (Ausbildung)?",
        answers: [
            { text: "There is no difference", correct: false },
            { text: "The training duration", correct: true },
            { text: "The final exam", correct: false },
            { text: "None of the above", correct: false },
        ]
    },
    {
        question: "How many BFW vocational retraining centers are there in Germany?",
        answers: [
            { text: "5", correct: false },
            { text: "12", correct: false },
            { text: "28", correct: true },
            { text: "None of the above", correct: false },
        ]
    },
    {
        question: "Who are the sponsors covering retraining costs?",
        answers: [
            { text: "Employment Agency", correct: false },
            { text: "Trade Associations", correct: false },
            { text: "Pension Insurance", correct: false },
            { text: "All of the above are correct", correct: true },
        ]
    },
    {
        question: "When are you allowed to undergo retraining at BFW?",
        answers: [
            { text: "Upon approval of LTA (rehab benefit for participation in working life)", correct: true },
            { text: "Anyone can do it at any time", correct: false },
            { text: "Due to a minor car accident without rehabilitation needs", correct: false },
            { text: "None of the above", correct: false },
        ]
    },
    {
        question: "Where and for how long is Maximilian completing his internship?",
        answers: [
            { text: "6 months at Haribo", correct: false },
            { text: "3 years inside the BFW", correct: false },
            { text: "2 years (24 months) at DFG in Bonn", correct: true },
            { text: "He is not doing any internship", correct: false },
        ]
    }
];

// DOM Elemente
const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");
const quizProgress = document.getElementById("quiz-progress");

// Spielvariablen
let currentQuestionIndex = 0;
let score = 0;

function getActiveQuestions() {
    const lang = document.documentElement.getAttribute('lang') || 'de';
    return lang === 'de' ? questionsDE : questionsEN;
}

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    
    const lang = document.documentElement.getAttribute('lang') || 'de';
    nextButton.innerHTML = lang === 'de' ? 'Nächste Frage <i class="fa fa-arrow-right"></i>' : 'Next Question <i class="fa fa-arrow-right"></i>';
    nextButton.className = "btn-primary";
    
    showQuestion();
}

function showQuestion() {
    resetState();
    const questions = getActiveQuestions();
    let currentQuestion = questions[currentQuestionIndex];
    let questionNo = currentQuestionIndex + 1;
    
    // Setzen der Frage
    questionElement.innerHTML = `${questionNo}. ${currentQuestion.question}`;
    
    // Fortschrittsanzeige
    if (quizProgress) {
        const percent = ((currentQuestionIndex) / questions.length) * 100;
        quizProgress.style.width = `${percent}%`;
    }

    // Antworten generieren
    currentQuestion.answers.forEach(answer => {
        const button = document.createElement("button");
        button.innerHTML = answer.text;
        button.classList.add("btn-quiz");
        button.setAttribute("role", "button");
        answerButtons.appendChild(button);
        
        if (answer.correct) {
            button.dataset.correct = answer.correct;
        }
        button.addEventListener("click", selectAnswer);
    });
}

function resetState() {
    nextButton.style.display = "none";
    while (answerButtons.firstChild) {
        answerButtons.removeChild(answerButtons.firstChild);
    }
}

function selectAnswer(e) {
    const selectedBtn = e.target;
    const isCorrect = selectedBtn.dataset.correct === "true";
    
    if (isCorrect) {
        selectedBtn.classList.add("correct");
        score++;
    } else {
        selectedBtn.classList.add("incorrect");
    }
    
    // Alle Knöpfe deaktivieren und die richtige Antwort markieren
    Array.from(answerButtons.children).forEach(button => {
        if (button.dataset.correct === "true") {
            button.classList.add("correct");
        }
        button.disabled = true;
    });
    
    nextButton.style.display = "block";
}

function showScore() {
    resetState();
    const questions = getActiveQuestions();
    
    if (quizProgress) {
        quizProgress.style.width = "100%";
    }
    
    const percentage = Math.round((score / questions.length) * 100);
    const lang = document.documentElement.getAttribute('lang') || 'de';
    let feedback = "";
    
    if (lang === 'de') {
        if (percentage === 100) {
            feedback = "Hervorragend! Du hast alle Fragen perfekt beantwortet! 🎉";
        } else if (percentage >= 60) {
            feedback = "Gut gemacht! Du hast die meisten Fragen richtig beantwortet. 👍";
        } else {
            feedback = "Schade! Lies dir die Webseite am besten noch einmal durch und probiere es erneut. 📚";
        }
        
        questionElement.innerHTML = `
            <div style="text-align: center; padding: 1rem 0;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🏆</div>
                <h3>Quiz beendet!</h3>
                <p style="font-size: 1.2rem; margin: 1rem 0; font-weight: bold; color: var(--primary);">
                    Du hast ${score} von ${questions.length} Punkten erreicht (${percentage}%).
                </p>
                <p style="color: var(--text-secondary);">${feedback}</p>
            </div>
        `;
        
        nextButton.innerHTML = '<i class="fa fa-refresh"></i> Quiz neu starten';
    } else {
        if (percentage === 100) {
            feedback = "Excellent! You answered all questions perfectly! 🎉";
        } else if (percentage >= 60) {
            feedback = "Well done! You answered most questions correctly. 👍";
        } else {
            feedback = "Too bad! Please read the website content again and try once more. 📚";
        }
        
        questionElement.innerHTML = `
            <div style="text-align: center; padding: 1rem 0;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🏆</div>
                <h3>Quiz Finished!</h3>
                <p style="font-size: 1.2rem; margin: 1rem 0; font-weight: bold; color: var(--primary);">
                    You scored ${score} out of ${questions.length} points (${percentage}%).
                </p>
                <p style="color: var(--text-secondary);">${feedback}</p>
            </div>
        `;
        
        nextButton.innerHTML = '<i class="fa fa-refresh"></i> Restart Quiz';
    }
    
    nextButton.className = "btn-primary";
    nextButton.style.display = "block";
}

function handleNextButton() {
    const questions = getActiveQuestions();
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showScore();
    }
}

nextButton.addEventListener("click", () => {
    const questions = getActiveQuestions();
    if (currentQuestionIndex < questions.length) {
        handleNextButton();
    } else {
        startQuiz();
    }
});

// Bei Sprachwechsel das Quiz sofort neu laden/übersetzen
document.addEventListener('langchange', () => {
    startQuiz();
});

// Quiz beim Laden starten
startQuiz();

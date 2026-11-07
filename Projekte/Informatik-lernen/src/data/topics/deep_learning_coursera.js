/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Künstliche Intelligenz, Machine Learning und Deep Learning abgrenzen und die drei Lernarten nennen',
    'Erklären, wie ein Neuron rechnet und wie ein Netz mit Verlustfunktion und Gradientenabstieg lernt',
    'Overfitting erkennen und ein Modell mit Accuracy, Precision und Recall bewerten',
    'Transformer, LLMs und RAG einordnen sowie die Risikoklassen des EU AI Act nennen'
  ],
  content: `
## Begriffe: KI, ML, Deep Learning

- **Künstliche Intelligenz (KI)**: Oberbegriff für Systeme, die Aufgaben lösen, für die man sonst menschliche Intelligenz braucht – vom Schachprogramm mit festen Regeln bis zum Sprachmodell.
- **Machine Learning (ML)**: Teilgebiet der KI. Statt Regeln zu programmieren, **lernt** ein Modell aus **Beispieldaten**.
- **Deep Learning**: Teilgebiet des ML mit **tiefen neuronalen Netzen** (viele Schichten). Besonders stark bei unstrukturierten Daten wie Bildern, Sprache und Text.

Klassische Programmierung: **Regeln + Daten → Ergebnis**. Machine Learning: **Daten + Ergebnisse → Regeln (Modell)**.

## Lernarten

| Lernart | Daten | Aufgabe | Beispiele |
| :--- | :--- | :--- | :--- |
| **Überwachtes Lernen** (*supervised*) | mit **Label** (richtige Antwort) | **Klassifikation** (Kategorie) oder **Regression** (Zahl) | Spam ja/nein, Hauspreis schätzen |
| **Unüberwachtes Lernen** (*unsupervised*) | ohne Label | Strukturen finden: **Clustering**, Dimensionsreduktion | Kundensegmente, Anomalien |
| **Bestärkendes Lernen** (*reinforcement*) | Belohnung/Strafe aus der Umgebung | Strategie lernen | Spiele, Robotersteuerung |

Große Sprachmodelle werden zunächst **selbstüberwacht** auf riesigen Textmengen vortrainiert (das „Label“ ist einfach das nächste Wort) und danach mit menschlichem Feedback feinjustiert.

Die Daten teilt man in **Trainings-**, **Validierungs-** und **Testdaten** (z. B. 70/15/15 %). Getestet wird immer mit Daten, die das Modell beim Training **nie gesehen** hat.

## Wie ein Neuron rechnet

![Ein künstliches Neuron](neuron.svg "Gewichtete Summe plus Bias, dann Aktivierungsfunktion")

Ein Neuron bildet die **gewichtete Summe** seiner Eingaben, addiert einen **Bias** und gibt das Ergebnis durch eine **Aktivierungsfunktion**:

**z = w₁·x₁ + w₂·x₂ + … + b**, **y = f(z)**

| Aktivierungsfunktion | Formel | Einsatz |
| :--- | :--- | :--- |
| ReLU | max(0, z) | Standard in versteckten Schichten |
| Sigmoid | 1 ÷ (1 + e^(−z)), Werte zwischen 0 und 1 | Ausgabe bei Ja/Nein-Entscheidungen |
| Softmax | wandelt mehrere Werte in Wahrscheinlichkeiten mit Summe 1 | Ausgabe bei mehreren Klassen |

Ohne nicht-lineare Aktivierung wäre ein Netz mit beliebig vielen Schichten nur eine einzige lineare Funktion. Ein **neuronales Netz** besteht aus einer **Eingabeschicht**, beliebig vielen **versteckten Schichten** und einer **Ausgabeschicht**.

## Wie ein Netz lernt

1. **Vorwärtsdurchlauf**: Das Netz berechnet für ein Trainingsbeispiel eine Vorhersage.
2. **Verlustfunktion** (*Loss*): misst den Fehler, z. B. mittlerer quadratischer Fehler bei Regression oder Kreuzentropie bei Klassifikation.
3. **Backpropagation**: berechnet rückwärts durch das Netz, wie stark jedes Gewicht zum Fehler beigetragen hat (Gradient).
4. **Gradientenabstieg**: Jedes Gewicht wird ein kleines Stück in die Richtung verschoben, die den Fehler verringert: **w_neu = w_alt − Lernrate × Gradient**.
5. Wiederholen für viele Beispiele und **Epochen** (Durchläufe durch alle Trainingsdaten).

Die **Lernrate** ist ein Hyperparameter: zu groß, und das Training springt hin und her; zu klein, und es dauert ewig.

### Overfitting und Underfitting

- **Overfitting** (Überanpassung): Das Modell lernt die Trainingsdaten **auswendig**, inklusive Rauschen. Trainingsfehler sinkt, Fehler auf neuen Daten steigt. Gegenmittel: mehr Daten, einfacheres Modell, Regularisierung, **Dropout**, frühes Stoppen.
- **Underfitting**: Das Modell ist zu einfach und erfasst die Zusammenhänge nicht – schon die Trainingsdaten werden schlecht vorhergesagt.

## Modelle bewerten

Bei der Klassifikation zählt man in einer **Konfusionsmatrix** die Treffer und Fehler:

| | tatsächlich positiv | tatsächlich negativ |
| :--- | :---: | :---: |
| **vorhergesagt positiv** | richtig positiv (TP) | falsch positiv (FP) |
| **vorhergesagt negativ** | falsch negativ (FN) | richtig negativ (TN) |

- **Accuracy** = (TP + TN) ÷ alle – Anteil richtiger Vorhersagen. Trügerisch bei unausgewogenen Klassen: Wenn nur 1 % der Transaktionen Betrug sind, erreicht ein Modell, das nie „Betrug“ sagt, 99 % Accuracy.
- **Precision** = TP ÷ (TP + FP) – Wie viele der als positiv markierten sind wirklich positiv?
- **Recall** = TP ÷ (TP + FN) – Wie viele der tatsächlich positiven wurden gefunden?
- **F1-Score** = harmonisches Mittel aus Precision und Recall.

Was wichtiger ist, hängt vom Einsatz ab: Bei einer Krebsvorsorge zählt **Recall** (keinen Fall übersehen), bei einem Spamfilter eher **Precision** (keine wichtige Mail im Spam).

## Wichtige Netzarchitekturen

- **CNN** (*Convolutional Neural Network*): erkennt mit **Faltungsfiltern** lokale Muster (Kanten, Formen) in Bildern; Einsatz in Bilderkennung, Qualitätskontrolle, Medizin.
- **RNN/LSTM**: verarbeiten **Sequenzen** Schritt für Schritt mit einem inneren Gedächtnis. Weitgehend von Transformern abgelöst.
- **Transformer** (2017): verarbeiten eine ganze Sequenz parallel. Der **Self-Attention**-Mechanismus berechnet für jedes Token, wie stark es auf jedes andere Token „achten“ soll – so versteht das Modell, worauf sich „es“ in einem Satz bezieht. Grundlage aller großen Sprachmodelle.

## Große Sprachmodelle (LLMs)

Ein **LLM** ist ein Transformer, der gelernt hat, das **nächste Token** (Wortteil) vorherzusagen. Wichtige Begriffe:

- **Token**: Texteinheit, im Deutschen oft ein Wortteil; Kosten und Grenzen werden in Tokens gemessen.
- **Kontextfenster**: wie viel Text (Eingabe + Ausgabe) das Modell auf einmal berücksichtigt.
- **Temperatur**: steuert die Zufälligkeit der Ausgabe (niedrig = vorhersehbar, hoch = kreativ).
- **Halluzination**: eine plausibel klingende, aber falsche Antwort. LLMs „wissen“ nicht, ob etwas stimmt – Ergebnisse müssen geprüft werden.
- **Prompt Engineering**: Aufgaben klar formulieren, Kontext und Beispiele mitgeben, das gewünschte Format vorgeben.

### RAG: Wissen nachladen

**Retrieval-Augmented Generation** verbindet ein LLM mit eigenen Dokumenten: Die Dokumente werden in Abschnitte (*Chunks*) zerlegt und als **Embeddings** (Vektoren, die die Bedeutung repräsentieren) in einer **Vektordatenbank** gespeichert. Bei einer Frage sucht das System die ähnlichsten Abschnitte und gibt sie dem Modell als Kontext mit. So antwortet es auf Basis aktueller, firmeninterner Quellen – und kann sie zitieren.

## Recht und Verantwortung: der EU AI Act

Die **KI-Verordnung der EU** (AI Act) ist seit dem **1. August 2024** in Kraft und wird stufenweise wirksam. Sie ordnet KI-Systeme nach ihrem **Risiko**:

| Risikoklasse | Beispiele | Folge |
| :--- | :--- | :--- |
| **unannehmbar** | Social Scoring, Emotionserkennung am Arbeitsplatz, manipulative Techniken | **verboten** (seit 2. Februar 2025) |
| **hoch** | KI für Personalauswahl, Kreditwürdigkeit, kritische Infrastruktur, Medizinprodukte | strenge Pflichten: Risikomanagement, Datenqualität, Dokumentation, menschliche Aufsicht |
| **begrenzt** | Chatbots, KI-generierte Bilder und Texte (Deepfakes) | **Transparenzpflicht**: Nutzer müssen erkennen, dass sie mit einer KI interagieren bzw. Inhalte KI-generiert sind |
| **minimal** | Spamfilter, KI in Videospielen | keine besonderen Pflichten |

Für Anbieter von **KI-Modellen mit allgemeinem Verwendungszweck** (z. B. große Sprachmodelle) gelten seit August 2025 eigene Pflichten. Die Pflichten für Hochrisiko-Systeme hat die EU mit dem „Digital Omnibus“ 2026 verschoben, für eigenständige Hochrisiko-Systeme auf Dezember 2027 – vor Projekten den aktuellen Stand prüfen. Zusätzlich verlangt die Verordnung, dass Beschäftigte, die KI einsetzen, über ausreichende **KI-Kompetenz** verfügen. Und weiterhin gilt: Verarbeitet eine KI personenbezogene Daten, gilt die **DSGVO**.
`,
  codeSnippet: `# Ein kleines Netz für Ziffernerkennung mit PyTorch (28×28 Pixel → 10 Klassen)
import torch
from torch import nn

model = nn.Sequential(
    nn.Flatten(),             # 28×28 → 784 Eingaben
    nn.Linear(784, 128),
    nn.ReLU(),
    nn.Dropout(0.2),          # gegen Overfitting
    nn.Linear(128, 10)        # 10 Ausgaben (Logits); Softmax steckt in der Verlustfunktion
)
loss_fn = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)

def train_step(bilder, labels):
    optimizer.zero_grad()
    verlust = loss_fn(model(bilder), labels)   # Vorwärtsdurchlauf + Verlust
    verlust.backward()                         # Backpropagation
    optimizer.step()                           # Gewichte anpassen
    return verlust.item()`,
  codeLanguage: 'Python',
  exercises: [
    {
      id: 'lernart',
      title: 'Lernart und Aufgabe bestimmen',
      prompt: 'Welche Lernart und welche Aufgabe (Klassifikation, Regression, Clustering) liegen vor?\n\n1. Aus 10.000 gelabelten Tickets lernt ein Modell, neue Tickets der Kategorie „Hardware“, „Software“ oder „Netzwerk“ zuzuordnen.\n2. Ein Onlineshop will seine Kunden ohne Vorgaben in Gruppen mit ähnlichem Kaufverhalten einteilen.\n3. Aus vergangenen Daten soll der Stromverbrauch des Rechenzentrums für morgen in kWh geschätzt werden.',
      solution: '1. **Überwacht**, **Klassifikation** (feste Kategorien, gelabelte Daten)\n2. **Unüberwacht**, **Clustering** (keine Labels, Gruppen werden gefunden)\n3. **Überwacht**, **Regression** (Zielgröße ist eine Zahl)'
    },
    {
      id: 'neuron-rechnen',
      title: 'Ein Neuron von Hand rechnen',
      prompt: 'Ein Neuron hat die Eingaben x₁ = 2, x₂ = −1, x₃ = 0,5, die Gewichte w₁ = 0,5, w₂ = 1,5, w₃ = −2 und den Bias b = 1. Berechne z sowie die Ausgabe mit ReLU und mit Sigmoid (e^(−0,5) ≈ 0,607).',
      solution: 'z = 2 · 0,5 + (−1) · 1,5 + 0,5 · (−2) + 1 = 1 − 1,5 − 1 + 1 = **−0,5**\n\n- ReLU: max(0; −0,5) = **0** (das Neuron ist „inaktiv“)\n- Sigmoid: 1 ÷ (1 + e^(0,5)) = 1 ÷ (1 + 1,649) ≈ **0,377**\n\n(Für z = −0,5 ist e^(−z) = e^(0,5) ≈ 1,649.)'
    },
    {
      id: 'konfusionsmatrix',
      title: 'Einen Spamfilter bewerten',
      prompt: 'Ein Spamfilter prüft 1.000 E-Mails, davon sind 100 tatsächlich Spam. Er markiert 90 Mails als Spam, von denen 80 wirklich Spam sind. Stelle die Konfusionsmatrix auf und berechne Accuracy, Precision und Recall. Wie beurteilst du das Ergebnis?',
      solution: 'TP = 80, FP = 90 − 80 = **10**, FN = 100 − 80 = **20**, TN = 1.000 − 80 − 10 − 20 = **890**.\n\n- Accuracy = (80 + 890) ÷ 1.000 = **97 %**\n- Precision = 80 ÷ 90 ≈ **88,9 %** – rund jede neunte Spam-Markierung trifft eine echte Mail\n- Recall = 80 ÷ 100 = **80 %** – jede fünfte Spam-Mail landet im Posteingang\n\nDie hohe Accuracy täuscht, weil die meisten Mails ohnehin kein Spam sind. Für einen Spamfilter sind 10 fälschlich aussortierte Mails kritisch – die Precision sollte steigen, etwa mit einem höheren Schwellenwert.'
    },
    {
      id: 'ai-act',
      title: 'Risikoklasse nach dem AI Act',
      prompt: 'Ordne die Systeme einer Risikoklasse zu: (1) ein KI-Chatbot im Kundenservice eines Onlineshops, (2) eine KI, die Bewerbungen vorsortiert und Kandidaten ablehnt, (3) ein KI-gestützter Spamfilter, (4) ein System, das Bürger anhand ihres Sozialverhaltens bewertet.',
      solution: '1. **begrenztes Risiko** – Transparenzpflicht: Kunden müssen erkennen, dass sie mit einer KI sprechen.\n2. **hohes Risiko** – Beschäftigung und Personalauswahl gehören zu den Hochrisiko-Bereichen (Anhang III).\n3. **minimales Risiko** – keine besonderen Pflichten.\n4. **unannehmbares Risiko** – Social Scoring ist verboten.'
    }
  ],
  quiz: [
    {
      question: 'Wie verhält sich Deep Learning zu Machine Learning?',
      options: ['Es ist das Gegenteil', 'Es ist ein Teilgebiet des Machine Learning mit tiefen neuronalen Netzen', 'Es ist ein Oberbegriff für KI', 'Es kommt ohne Daten aus'],
      correct: 1,
      explanation: 'KI ⊃ Machine Learning ⊃ Deep Learning.'
    },
    {
      question: 'Was ist Overfitting?',
      options: [
        'Das Modell ist zu einfach',
        'Das Modell lernt die Trainingsdaten auswendig und verallgemeinert schlecht',
        'Das Training dauert zu lange',
        'Die Lernrate ist zu klein'
      ],
      correct: 1,
      explanation: 'Kennzeichen: sehr guter Trainingsfehler, aber schlechte Ergebnisse auf neuen Daten.'
    },
    {
      question: 'Was berechnet ReLU für z = −3?',
      options: ['−3', '0', '3', '1'],
      correct: 1,
      explanation: 'ReLU(z) = max(0, z) – negative Werte werden zu 0.'
    },
    {
      question: 'Welche Kennzahl beantwortet „Wie viele der tatsächlich positiven Fälle wurden gefunden“?',
      options: ['Accuracy', 'Precision', 'Recall', 'Loss'],
      correct: 2,
      explanation: 'Recall = TP ÷ (TP + FN).'
    },
    {
      question: 'Welcher Mechanismus kennzeichnet die Transformer-Architektur?',
      options: ['Faltungsfilter', 'Self-Attention', 'Entscheidungsbäume', 'k-Means'],
      correct: 1,
      explanation: 'Self-Attention gewichtet die Beziehungen aller Tokens zueinander und erlaubt parallele Verarbeitung.'
    },
    {
      question: 'Was ist das Ziel von Retrieval-Augmented Generation (RAG)?',
      options: [
        'Das Modell neu zu trainieren',
        'Dem Modell zur Laufzeit passende Abschnitte aus eigenen Dokumenten als Kontext mitzugeben',
        'Die Temperatur zu senken',
        'Bilder zu erzeugen'
      ],
      correct: 1,
      explanation: 'RAG sucht relevante Dokumentabschnitte (meist per Vektorsuche) und gibt sie dem LLM mit – ohne Neutraining.'
    },
    {
      question: 'In welche Risikoklasse des EU AI Act fällt ein Kundenservice-Chatbot typischerweise?',
      options: ['verboten', 'hohes Risiko', 'begrenztes Risiko mit Transparenzpflicht', 'gar nicht geregelt'],
      correct: 2,
      explanation: 'Nutzer müssen erkennen können, dass sie mit einer KI interagieren.'
    }
  ],
  relatedLabs: [
    { id: 'neural_net_lab', label: 'Neuronales Netz visualisiert' },
    { id: 'transformer_attention', label: 'Transformer & Attention' },
    { id: 'rag_ai', label: 'RAG-Simulator' },
    { id: 'llm_rag_chunking_lab', label: 'RAG-Chunking' },
    { id: 'vector_search', label: 'Vektorsuche' }
  ],
  sources: [
    { title: 'Verordnung (EU) 2024/1689 – KI-Verordnung (AI Act)', url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj' },
    { title: 'Europäische Kommission: AI Act – Überblick und Zeitplan', url: 'https://digital-strategy.ec.europa.eu/de/policies/regulatory-framework-ai' },
    { title: 'EU AI Act Compliance Tracker – Entwicklungen und Umsetzungsfristen', url: 'https://artificialintelligenceact.eu/developments/', note: 'Verschiebung der Hochrisiko-Pflichten' },
    { title: 'Vaswani et al. (2017): Attention Is All You Need', url: 'https://arxiv.org/abs/1706.03762' },
    { title: 'Goodfellow, Bengio, Courville: Deep Learning, MIT Press (frei online)', url: 'https://www.deeplearningbook.org/' },
    { title: 'PyTorch-Tutorial: Build the Neural Network', url: 'https://docs.pytorch.org/tutorials/beginner/basics/buildmodel_tutorial.html' },
    { title: 'Google: Machine Learning Crash Course – Classification (Accuracy, Precision, Recall)', url: 'https://developers.google.com/machine-learning/crash-course/classification/accuracy-precision-recall' }
  ],
  sourcesCheckedOn: '29.10.2026'
};

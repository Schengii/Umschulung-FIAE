/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Lage- und Streuungsmaße (Mittelwert, Median, Standardabweichung, Quartile) berechnen und Ausreißer erkennen',
    'Korrelation und lineare Regression anwenden und Korrelation von Kausalität abgrenzen',
    'Daten bereinigen und skalieren sowie den Ablauf eines Datenanalyse-Projekts beschreiben',
    'Überwachtes, unüberwachtes und bestärkendes Lernen unterscheiden und Over- und Underfitting erklären',
    'Klassifikationsmodelle mit Konfusionsmatrix, Präzision, Trefferquote und F1-Wert bewerten'
  ],
  content: `
## Warum Datenanalyse?

Unternehmen erzeugen große Datenmengen: Verkäufe, Sensorwerte, Logfiles, Kundenverhalten. **Datenanalyse** macht daraus Entscheidungen: Was ist passiert (deskriptiv), warum (diagnostisch), was wird passieren (prädiktiv) und was sollen wir tun (präskriptiv)? Das **CRISP-DM-Vorgehen** gliedert Projekte in sechs Phasen: Geschäftsverständnis, Datenverständnis, Datenaufbereitung, Modellierung, Bewertung und Einsatz. Die Phasen werden iterativ wiederholt. Erfahrungsgemäß nimmt die Datenaufbereitung den größten Teil der Zeit ein.

## Deskriptive Statistik

### Lagemaße

- **Arithmetisches Mittel:** Summe aller Werte geteilt durch die Anzahl. Empfindlich gegenüber Ausreißern.
- **Median:** der mittlere Wert der sortierten Reihe (bei gerader Anzahl der Mittelwert der beiden mittleren). **Robust** gegenüber Ausreißern.
- **Modus:** der häufigste Wert. Auch für nicht numerische Merkmale nutzbar.

**Beispiel:** Antwortzeiten in ms: 2, 4, 4, 5, 7, 9. Mittelwert = 31 : 6 = 5,17. Median = (4 + 5) : 2 = 4,5. Modus = 4.

### Streuungsmaße

- **Spannweite:** Maximum minus Minimum (hier 9 − 2 = 7).
- **Varianz:** mittlere quadratische Abweichung vom Mittelwert. Bei einer **Stichprobe** teilt man durch n − 1 (Bessel-Korrektur), bei der **Grundgesamtheit** durch n.
- **Standardabweichung:** Wurzel der Varianz, in der Einheit der Daten.

Für das Beispiel: Die Quadratsumme der Abweichungen vom Mittelwert beträgt etwa 30,83. Varianz der Stichprobe = 30,83 : 5 = 6,17, Standardabweichung = 2,48 ms. Bei Behandlung als Grundgesamtheit: 30,83 : 6 = 5,14 und 2,27 ms.

### Quartile und Ausreißer

Quartile teilen die sortierte Reihe in vier gleich große Teile. **Q1** liegt bei 25 %, **Q2** ist der Median, **Q3** bei 75 %. Der **Interquartilsabstand** ist IQR = Q3 − Q1. Als Faustregel gilt ein Wert als **Ausreißer**, wenn er unter Q1 − 1,5 · IQR oder über Q3 + 1,5 · IQR liegt. Der **Boxplot** zeigt diese Größen grafisch.

**Beispiel:** 3, 5, 6, 7, 8, 9, 11, 12, 40 (n = 9). Median = 8. Untere Hälfte (3, 5, 6, 7): Q1 = 5,5. Obere Hälfte (9, 11, 12, 40): Q3 = 11,5. IQR = 6. Obergrenze = 11,5 + 1,5 · 6 = 20,5. Der Wert 40 ist ein Ausreißer. Der Mittelwert (11,2) wird dadurch stark nach oben gezogen, der Median (8) bleibt stabil. (Die Quartile werden je nach Verfahren leicht unterschiedlich berechnet. Tabellenkalkulationen und Bibliotheken verwenden teils andere Methoden.)

> [!warning] Ausreißer sind nicht automatisch Fehler
> Ein Ausreißer kann ein Messfehler sein, aber auch ein echtes, wichtiges Ereignis (Betrugsfall, Anlagenstörung). Erst prüfen, dann entscheiden, ob man ihn behält, korrigiert oder entfernt, und die Entscheidung dokumentieren.

### Verteilungen

Die **Normalverteilung** (Gauß-Glocke) ist symmetrisch um den Mittelwert. Als Daumenregel liegen etwa **68 %** der Werte innerhalb von ±1 Standardabweichung, **95 %** innerhalb von ±2 und **99,7 %** innerhalb von ±3. Der **z-Wert** z = (x − Mittelwert) : Standardabweichung gibt an, um wie viele Standardabweichungen ein Wert vom Mittel abweicht. Viele reale Daten sind schief verteilt (Einkommen, Antwortzeiten), dann ist der Median aussagekräftiger.

## Zusammenhänge: Korrelation und Regression

Der **Korrelationskoeffizient nach Pearson (r)** misst den linearen Zusammenhang zweier Merkmale und liegt zwischen −1 und +1. +1 heißt perfekter gleichläufiger Zusammenhang, −1 perfekter gegenläufiger, 0 heißt kein *linearer* Zusammenhang. Je näher |r| an 1 liegt, desto stärker ist der lineare Zusammenhang.

> [!warning] Korrelation ist keine Kausalität
> Eisverkäufe und Sonnenbrände korrelieren, aber Eis verursacht keinen Sonnenbrand: Beide hängen von einer dritten Größe ab (Sonne, Wetter). Solche **Störfaktoren** (Confounder) führen leicht zu Fehlschlüssen. Ursache und Wirkung belegt man durch Experimente oder fachliche Begründung, nicht allein durch eine Korrelation.

**Lineare Regression** legt eine Gerade y = a + b · x durch die Datenpunkte, sodass die Summe der quadrierten Abweichungen minimal wird (Methode der kleinsten Quadrate). Die Steigung ist b = Σ((x − x̄)(y − ȳ)) : Σ((x − x̄)²), der Achsenabschnitt a = ȳ − b · x̄.

**Beispiel:** Punkte (1|2), (2|3), (3|5), (4|4), (5|6). Mittelwerte x̄ = 3 und ȳ = 4. Zähler: (−2)(−2) + (−1)(−1) + 0 + (1)(0) + (2)(2) = 9. Nenner: 4 + 1 + 0 + 1 + 4 = 10. Also b = 0,9 und a = 4 − 0,9 · 3 = 1,3. Prognose für x = 6: y = 1,3 + 0,9 · 6 = 6,7. Vorsicht bei **Extrapolation** außerhalb des Datenbereichs: Der Zusammenhang muss dort nicht mehr gelten.

## Datenaufbereitung

Realdaten sind unvollständig, doppelt, falsch formatiert oder widersprüchlich. Typische Schritte (*Data Cleaning*):

1. **Datenqualität prüfen:** Vollständigkeit, Eindeutigkeit, Plausibilität, Konsistenz, Aktualität.
2. **Fehlende Werte:** Zeilen entfernen, mit Mittelwert, Median oder häufigstem Wert auffüllen oder mit einem Modell schätzen. Der Grund für das Fehlen ist wichtig (zufällig oder systematisch?).
3. **Duplikate** entfernen, **Formate** vereinheitlichen (Datum, Einheiten, Schreibweisen).
4. **Kategorien kodieren:** ordinale Werte als Zahlen, nominale per One-Hot-Encoding (eine Spalte pro Ausprägung).
5. **Skalieren:** Merkmale mit sehr unterschiedlichen Wertebereichen (Alter 0 bis 100, Einkommen 0 bis 200 000) benachteiligen abstandsbasierte Verfahren. Üblich sind **Min-Max-Normalisierung** x' = (x − min) : (max − min), die auf 0 bis 1 skaliert, und **Standardisierung** (z-Wert), die Mittelwert 0 und Standardabweichung 1 erzeugt.

**Beispiel Min-Max:** Alter 30 bei Minimum 18 und Maximum 66: (30 − 18) : (66 − 18) = 12 : 48 = 0,25.

Datenschutz gilt auch hier: Personenbezogene Daten werden nur zweckgebunden und datensparsam verwendet, wo möglich **pseudonymisiert oder anonymisiert** (siehe Artikel zu DSGVO).

## Maschinelles Lernen im Überblick

**Maschinelles Lernen (ML)** lernt Zusammenhänge aus Daten, statt dass Regeln von Hand programmiert werden. Man unterscheidet:

| Art | Idee | Beispiele |
| :--- | :--- | :--- |
| **Überwachtes Lernen** (Supervised) | Trainingsdaten haben bekannte Zielwerte (Labels) | **Klassifikation** (Spam ja/nein), **Regression** (Preisvorhersage) |
| **Unüberwachtes Lernen** (Unsupervised) | keine Labels, Struktur wird gesucht | **Clustering** (Kundensegmente), Dimensionsreduktion, Anomalieerkennung |
| **Bestärkendes Lernen** (Reinforcement) | Agent lernt durch Belohnung und Bestrafung | Spiele, Robotersteuerung |

Bekannte Verfahren: lineare und logistische Regression, Entscheidungsbaum, Random Forest, k-nächste-Nachbarn, Support Vector Machine, k-Means (Clustering) und neuronale Netze (siehe Artikel zu Deep Learning).

### Trainieren, validieren, testen

Ein Modell soll auf **neuen, ungesehenen** Daten gut funktionieren. Deshalb teilt man die Daten, typisch in **Trainingsdaten** (z. B. 70 %, zum Lernen), **Validierungsdaten** (z. B. 15 %, zum Einstellen der Parameter) und **Testdaten** (z. B. 15 %, einmalige Endbewertung). Die Testdaten dürfen beim Training und Tuning nicht verwendet werden, sonst ist die Bewertung zu optimistisch (*Data Leakage*). Bei wenig Daten hilft die **Kreuzvalidierung** (k-fold): Man teilt in k Teile und trainiert k-mal, wobei jeweils ein anderer Teil als Test dient.

**Overfitting** (Überanpassung): Das Modell lernt die Trainingsdaten samt Rauschen auswendig, auf neuen Daten ist es schlecht. Erkennbar an hoher Güte im Training und deutlich geringerer im Test. Gegenmaßnahmen: mehr Daten, einfacheres Modell, Regularisierung, frühes Stoppen. **Underfitting:** Das Modell ist zu einfach und schneidet schon im Training schlecht ab.

### Bewertung von Klassifikatoren

Die **Konfusionsmatrix** zählt, wie oft das Modell richtig und falsch lag:

![Konfusionsmatrix mit Kennzahlen](konfusionsmatrix.svg "Vier-Felder-Tabelle mit TP, FN, FP, TN und den berechneten Kennzahlen")

- **Genauigkeit (Accuracy)** = (TP + TN) : n. Anteil aller richtigen Vorhersagen.
- **Präzision (Precision)** = TP : (TP + FP). Wie viele der als positiv vorhergesagten sind wirklich positiv?
- **Trefferquote (Recall, Sensitivität)** = TP : (TP + FN). Wie viele der tatsächlich positiven wurden gefunden?
- **F1-Wert** = 2 · Präzision · Trefferquote : (Präzision + Trefferquote). Harmonisches Mittel beider.

Im Beispiel (TP = 40, FN = 20, FP = 10, TN = 130): Genauigkeit 170 : 200 = 85 %, Präzision 40 : 50 = 80 %, Trefferquote 40 : 60 = 66,7 %, F1 = 2 · 0,8 · 0,667 : 1,467 = 72,7 %.

> [!warning] Die Genauigkeit täuscht bei unausgewogenen Klassen
> Sind nur 1 % der Transaktionen Betrug, erreicht ein Modell, das **immer „kein Betrug“** sagt, 99 % Genauigkeit, findet aber keinen einzigen Fall (Trefferquote 0 %). Dann sind Präzision, Trefferquote und F1 aussagekräftiger. Welche Kennzahl wichtig ist, hängt vom Fehlerrisiko ab: Bei einer Krankheitsdiagnose will man wenige **falsch negative** (hohe Trefferquote), bei einer Spam-Sperre wenige **falsch positive** (hohe Präzision).

Für Regressionsmodelle verwendet man Fehlermaße wie den **mittleren absoluten Fehler (MAE)** oder den **mittleren quadratischen Fehler (MSE)** beziehungsweise dessen Wurzel (RMSE) und das Bestimmtheitsmaß R².

## Verantwortungsvoller Umgang mit Modellen

- **Verzerrung (Bias):** Spiegeln die Trainingsdaten Vorurteile oder unausgewogene Gruppen, übernimmt das Modell sie. Daten und Ergebnisse auf Fairness prüfen.
- **Erklärbarkeit:** Entscheidungen mit Folgen für Menschen müssen nachvollziehbar sein. Einfache Modelle (Entscheidungsbaum) sind leichter zu erklären als tiefe Netze.
- **Rechtlicher Rahmen:** Die DSGVO schränkt vollautomatisierte Einzelentscheidungen ein (Art. 22), und die EU-KI-Verordnung stuft Anwendungen nach Risiko.
- **Modellbetrieb (MLOps):** Modelle altern, wenn sich die Daten ändern (*Drift*). Überwachung, erneutes Training und Versionierung gehören zum Betrieb.

## Werkzeuge in der Praxis

In Python sind **pandas** (Tabellen), **NumPy** (Zahlen), **matplotlib** oder **seaborn** (Diagramme) und **scikit-learn** (ML-Verfahren und Metriken) üblich, daneben SQL für den Datenzugriff und Jupyter Notebooks zum Dokumentieren. Typisch: Daten laden (\`pd.read_csv\`), Überblick (\`df.describe()\`, \`df.info()\`), fehlende Werte zählen (\`df.isna().sum()\`), gruppieren (\`df.groupby("Region")["Umsatz"].mean()\`), aufteilen (\`train_test_split\`), trainieren (\`model.fit\`), bewerten (\`classification_report\`).

> [!exam] Prüfungshinweis
> In FIDP-Aufgaben kommen Lage- und Streuungsmaße, Interpretation von Diagrammen, Begründung von Datenbereinigungsschritten, Auswahl geeigneter Verfahren (Klassifikation oder Regression, überwacht oder unüberwacht) und die Bewertung mit Konfusionsmatrix vor. Rechne mit Einheiten und begründe, welche Kennzahl für den Fall am wichtigsten ist.
`,
  codeSnippet: `# Datenanalyse mit pandas und scikit-learn (Skizze)
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix

df = pd.read_csv("kunden.csv")
print(df.describe())              # Lage- und Streuungsmaße
print(df.isna().sum())            # fehlende Werte je Spalte

df = df.drop_duplicates()
df["Alter"] = df["Alter"].fillna(df["Alter"].median())

X = df[["Alter", "Umsatz", "Bestellungen"]]
y = df["abgewandert"]             # Ziel: 0 = geblieben, 1 = abgewandert

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

modell = LogisticRegression(max_iter=1000)
modell.fit(X_train, y_train)

vorhersage = modell.predict(X_test)
print(confusion_matrix(y_test, vorhersage))
print(classification_report(y_test, vorhersage))
`,
  codeLanguage: 'Python',
  exercises: [
    {
      id: 'lage-streuung',
      title: 'Kennzahlen berechnen',
      prompt: 'Die Tagesumsätze (in Euro) einer Woche lauten: 120, 135, 128, 410, 130, 125, 132. Berechne Mittelwert und Median. Welcher Wert beschreibt den typischen Tag besser? Prüfe mit der IQR-Regel, ob ein Ausreißer vorliegt (Quartile nach der Hälften-Methode ohne Median).',
      hints: ['Sortiere zuerst: 120, 125, 128, 130, 132, 135, 410', 'Q1 ist der Median der unteren drei Werte'],
      solution: 'Summe = 1180, Mittelwert = 1180 : 7 = 168,57 Euro. Sortiert: 120, 125, 128, 130, 132, 135, 410, Median (4. Wert) = 130 Euro. Der Median beschreibt den typischen Tag besser, weil der Mittelwert durch 410 stark nach oben gezogen wird. Q1 = Median von 120, 125, 128 = 125. Q3 = Median von 132, 135, 410 = 135. IQR = 10. Obergrenze = 135 + 15 = 150. Der Wert 410 liegt darüber und ist ein Ausreißer. Vor dem Entfernen klären, ob ein Sondereffekt (Großauftrag, Buchungsfehler) die Ursache ist.'
    },
    {
      id: 'konfusionsmatrix-rechnen',
      title: 'Klassifikator bewerten',
      prompt: 'Ein Modell soll Betrugsfälle erkennen. Von 1000 Transaktionen sind 20 Betrug. Das Modell erkennt 15 davon, meldet aber insgesamt 45 Transaktionen als Betrug. Erstelle die Konfusionsmatrix und berechne Genauigkeit, Präzision und Trefferquote. Wie bewertest du das Modell?',
      hints: ['TP = 15, FN = 5, FP = 45 − 15', 'TN = 1000 − TP − FN − FP'],
      solution: 'TP = 15, FN = 20 − 15 = 5, FP = 45 − 15 = 30, TN = 1000 − 15 − 5 − 30 = 950. Genauigkeit = (15 + 950) : 1000 = 96,5 %. Präzision = 15 : 45 = 33,3 %. Trefferquote = 15 : 20 = 75 %. Die hohe Genauigkeit täuscht, weil Betrug selten ist (ein Modell, das nie Betrug meldet, hätte 98 %). Das Modell findet drei Viertel der Betrugsfälle, aber nur jede dritte Meldung ist echt. Ob das ausreicht, hängt von den Kosten ab: Falschmeldungen verursachen Prüfaufwand, übersehener Betrug Schaden. Gegebenenfalls Schwellenwert anpassen.'
    },
    {
      id: 'regression-prognose',
      title: 'Regressionsgerade nutzen',
      prompt: 'Aus Messdaten ergibt sich für die Serverlast y (in Prozent) in Abhängigkeit von der Zahl gleichzeitiger Nutzer x die Gerade y = 8 + 0,5 · x. Wie hoch ist die erwartete Last bei 120 Nutzern? Warum ist eine Prognose für 500 Nutzer problematisch?',
      hints: ['Einsetzen in die Geradengleichung', 'Last kann nicht über 100 % steigen'],
      solution: 'Bei x = 120: y = 8 + 0,5 · 120 = 68 %. Für 500 Nutzer ergäbe die Formel 258 %, was unmöglich ist. Das ist eine Extrapolation außerhalb des beobachteten Bereichs. Die Gerade gilt nur im Messbereich, bei Annäherung an die Kapazitätsgrenze verläuft der Zusammenhang nicht mehr linear (Warteschlangen, Sättigung). Für solche Prognosen braucht man Messungen in diesem Bereich (Lasttest) oder ein anderes Modell.'
    },
    {
      id: 'aufbereitung-planen',
      title: 'Datenaufbereitung planen',
      prompt: 'Ein Datensatz mit Kundendaten enthält: doppelte Zeilen, fehlende Altersangaben bei 4 % der Kunden, das Geschlecht als Text (m, w, d), Umsätze von 0 bis 250000 Euro und das Alter von 18 bis 90. Das Ziel ist ein k-Means-Clustering. Beschreibe die Schritte und begründe, warum Skalierung wichtig ist.',
      hints: ['k-Means nutzt Abstände zwischen Punkten'],
      solution: 'Schritte: 1) Duplikate entfernen. 2) Fehlende Alter prüfen (zufällig oder systematisch) und z. B. mit dem Median auffüllen oder die wenigen Zeilen entfernen. 3) Geschlecht als nominales Merkmal per One-Hot-Encoding in Spalten umwandeln. 4) Ausreißer prüfen. 5) Merkmale skalieren (Standardisierung oder Min-Max). Begründung: k-Means misst Euklidische Abstände. Ohne Skalierung dominiert der Umsatz (Wertebereich bis 250000) den Abstand völlig, das Alter (bis 90) spielt praktisch keine Rolle. Nach der Skalierung tragen beide Merkmale vergleichbar bei. Dokumentation der Schritte nicht vergessen, ebenso Datenschutz (Pseudonymisierung).'
    }
  ],
  quiz: [
    {
      question: 'Welches Lagemaß ist gegenüber Ausreißern am robustesten?',
      options: ['Arithmetisches Mittel', 'Median', 'Spannweite', 'Varianz'],
      correct: 1,
      explanation: 'Der Median hängt nur von der Position in der sortierten Reihe ab, nicht von der Größe extremer Werte.'
    },
    {
      question: 'Was gibt ein Korrelationskoeffizient von r = -0,9 an?',
      options: [
        'Einen starken gegenläufigen linearen Zusammenhang',
        'Keinen Zusammenhang',
        'Einen schwachen gleichläufigen Zusammenhang',
        'Dass A die Ursache von B ist'
      ],
      correct: 0,
      explanation: 'Das Vorzeichen zeigt die Richtung (negativ = gegenläufig), der Betrag die Stärke. Kausalität lässt sich daraus allein nicht ableiten.'
    },
    {
      question: 'Welche Aussage über Over-Fitting trifft zu?',
      options: [
        'Das Modell ist schon im Training schlecht',
        'Das Modell ist im Training sehr gut, bei neuen Daten aber deutlich schlechter',
        'Das Modell verwendet zu wenige Parameter',
        'Es entsteht nur bei unüberwachtem Lernen'
      ],
      correct: 1,
      explanation: 'Beim Overfitting hat sich das Modell an das Rauschen der Trainingsdaten angepasst und verallgemeinert schlecht.'
    },
    {
      question: 'Welche Kennzahl gibt an, wie viele der tatsächlich positiven Fälle gefunden wurden?',
      options: ['Präzision', 'Genauigkeit', 'Trefferquote (Recall)', 'Spezifität'],
      correct: 2,
      explanation: 'Trefferquote = TP : (TP + FN). Die Präzision bezieht sich dagegen auf alle als positiv vorhergesagten Fälle.'
    },
    {
      question: 'Zu welcher Lernart gehört das Clustern von Kunden ohne vorgegebene Gruppen?',
      options: ['Überwachtes Lernen', 'Unüberwachtes Lernen', 'Bestärkendes Lernen', 'Regression'],
      correct: 1,
      explanation: 'Ohne Labels sucht das Verfahren selbst nach Strukturen. Das ist unüberwachtes Lernen.'
    },
    {
      question: 'Warum dürfen Testdaten nicht zum Einstellen der Modellparameter genutzt werden?',
      options: [
        'Weil Testdaten immer fehlerhaft sind',
        'Sonst wird die Endbewertung zu optimistisch (Data Leakage)',
        'Weil Modelle nur mit Trainingsdaten arbeiten dürfen',
        'Weil sie sonst gelöscht werden'
      ],
      correct: 1,
      explanation: 'Fließt Wissen aus den Testdaten in Training oder Tuning ein, misst der Test nicht mehr die Leistung auf wirklich neuen Daten.'
    },
    {
      question: 'Min-Max-Normalisierung eines Wertes 30 bei Minimum 10 und Maximum 50 ergibt:',
      options: ['0,25', '0,5', '0,6', '0,75'],
      correct: 1,
      explanation: '(30 − 10) : (50 − 10) = 20 : 40 = 0,5.'
    }
  ],
  relatedLabs: [
    { id: 'neural_net_lab', label: 'Neuronales Netz' },
    { id: 'data_lineage_etl', label: 'ETL und Data Lineage' }
  ],
  sources: [
    { title: 'scikit-learn: Metrics and scoring', url: 'https://scikit-learn.org/stable/modules/model_evaluation.html' },
    { title: 'pandas: 10 minutes to pandas', url: 'https://pandas.pydata.org/docs/user_guide/10min.html' },
    { title: 'Wikipedia: Standardabweichung', url: 'https://de.wikipedia.org/wiki/Standardabweichung' },
    { title: 'Wikipedia: Konfusionsmatrix', url: 'https://de.wikipedia.org/wiki/Konfusionsmatrix' },
    { title: 'Wikipedia: Cross-industry standard process for data mining (CRISP-DM)', url: 'https://en.wikipedia.org/wiki/Cross-industry_standard_process_for_data_mining' }
  ],
  sourcesCheckedOn: '25.11.2026'
};

/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Zentrale und verteilte Versionsverwaltung unterscheiden und die vier Bereiche von Git erklären',
    'Die wichtigsten Git-Befehle für den Alltag sicher anwenden',
    'Branches anlegen, mergen und rebasen sowie Merge-Konflikte lösen',
    'Branching-Strategien vergleichen und aussagekräftige Commit-Nachrichten schreiben'
  ],
  content: `
## Warum Versionsverwaltung?

Eine **Versionsverwaltung** (*Version Control System, VCS*) protokolliert jede Änderung an Dateien: **wer** hat **wann** **was** und **warum** geändert. Man kann jederzeit zu einem alten Stand zurück, parallel an Funktionen arbeiten und Änderungen mehrerer Personen zusammenführen.

| | zentral (z. B. Subversion) | verteilt (z. B. Git) |
| :--- | :--- | :--- |
| Historie | nur auf dem Server | vollständig auf jedem Rechner |
| offline arbeiten | eingeschränkt | voll (Commits, Branches, Historie) |
| Ausfall des Servers | Arbeit steht | jede Kopie ist ein Backup |
| Branches | eher schwerfällig | sehr leichtgewichtig |

**Git** wurde 2005 von Linus Torvalds für die Entwicklung des Linux-Kernels geschrieben und ist heute der Standard. GitHub, GitLab und Bitbucket sind **Plattformen**, die Git-Repositories hosten und um Pull Requests, Issues und CI ergänzen.

## Die vier Bereiche

![Arbeitsverzeichnis, Staging Area, lokales Repository und Remote](git-bereiche.svg "Mit add, commit und push wandert eine Änderung von links nach rechts")

Die **Staging Area** ist der Zwischenschritt, der Git besonders macht: Man stellt genau die Änderungen zusammen, die in den nächsten Commit gehören – auch nur einzelne Teile einer Datei (\`git add -p\`).

## Befehle für den Alltag

| Befehl | Wirkung |
| :--- | :--- |
| \`git init\` / \`git clone <url>\` | neues Repository anlegen / bestehendes kopieren |
| \`git status\` | Überblick über geänderte, vorgemerkte und unbekannte Dateien |
| \`git add datei\` | Änderung für den nächsten Commit vormerken |
| \`git commit -m "…"\` | vorgemerkte Änderungen als Commit speichern |
| \`git log --oneline --graph\` | Historie kompakt mit Branch-Verlauf |
| \`git diff\` / \`git diff --staged\` | Änderungen anzeigen (noch nicht vorgemerkt / vorgemerkt) |
| \`git switch -c feature/login\` | neuen Branch anlegen und wechseln |
| \`git merge feature/login\` | Branch in den aktuellen Branch übernehmen |
| \`git pull\` / \`git push\` | Änderungen holen / hochladen |
| \`git restore datei\` | ungespeicherte Änderungen an einer Datei verwerfen |
| \`git stash\` / \`git stash pop\` | Änderungen kurz beiseitelegen / zurückholen |

Jeder Commit hat eine eindeutige **ID** (SHA-Hash), kennt seinen Vorgänger (*Parent*) und speichert einen vollständigen Schnappschuss des Projekts. Ein **Branch** ist nur ein beweglicher Zeiger auf einen Commit; **HEAD** zeigt, wo du gerade stehst.

## Branches zusammenführen

### Merge

\`git merge\` führt zwei Entwicklungslinien zusammen:

- **Fast-Forward**: Hat sich der Zielbranch seit der Abzweigung nicht verändert, wird der Zeiger einfach nach vorne geschoben – kein neuer Commit.
- **Drei-Wege-Merge**: Haben sich beide Seiten verändert, erzeugt Git einen **Merge-Commit** mit zwei Vorgängern. Die Historie bleibt wahrheitsgetreu, wird aber verzweigt.

### Rebase

\`git rebase main\` setzt die eigenen Commits so um, als wären sie erst **nach** dem aktuellen Stand von \`main\` entstanden. Das ergibt eine **lineare** Historie. Dabei entstehen **neue** Commits mit neuen IDs.

> [!warning] Goldene Regel des Rebasens
> Rebase nur Commits, die **noch niemand anderes** hat. Wer bereits gepushte, gemeinsam genutzte Commits umschreibt, zwingt alle Kollegen zu mühsamen Korrekturen. Für den eigenen, noch nicht geteilten Feature-Branch ist Rebase dagegen praktisch.

### Konflikte lösen

Ändern zwei Branches dieselbe Stelle unterschiedlich, kann Git nicht entscheiden und meldet einen **Konflikt**. In der Datei stehen dann beide Versionen:

\`\`\`text
<<<<<<< HEAD
const MWST = 0.19;
=======
const MWST_SATZ = 0.19;
>>>>>>> feature/steuer
\`\`\`

Vorgehen: (1) Datei öffnen und die richtige Fassung herstellen (oft eine Kombination), (2) Konfliktmarker entfernen, (3) testen, (4) \`git add datei\`, (5) \`git commit\` bzw. \`git rebase --continue\`. Abbrechen geht mit \`git merge --abort\`.

## Änderungen rückgängig machen

| Situation | Befehl | Wirkung |
| :--- | :--- | :--- |
| Datei im Arbeitsverzeichnis zurücksetzen | \`git restore datei\` | lokale Änderung ist weg |
| aus der Staging Area nehmen | \`git restore --staged datei\` | Änderung bleibt in der Datei |
| letzten Commit korrigieren (noch nicht gepusht) | \`git commit --amend\` | Commit wird ersetzt |
| gepushten Commit rückgängig machen | \`git revert <id>\` | **neuer** Commit, der die Änderung umkehrt – Historie bleibt |
| lokal auf alten Stand zurück | \`git reset --hard <id>\` | **gefährlich**: verwirft Commits und Änderungen |

Auch scheinbar verlorene Commits findet man meist noch über \`git reflog\` – das Protokoll, wohin HEAD in den letzten Wochen gezeigt hat.

## Branching-Strategien

| Strategie | Ablauf | passt für |
| :--- | :--- | :--- |
| **Feature-Branch + Pull Request** | jede Änderung auf eigenem Branch, Review und automatische Tests im PR, dann Merge in \`main\` | die meisten Teams |
| **GitFlow** | dauerhafte Branches \`main\` und \`develop\`, dazu \`feature/*\`, \`release/*\`, \`hotfix/*\` | Software mit festen, versionierten Releases |
| **Trunk-Based Development** | alle arbeiten auf \`main\` bzw. mit sehr kurzlebigen Branches, unfertige Funktionen hinter Feature-Flags | Continuous Delivery, erfahrene Teams |

## Gute Commits

- **Klein und thematisch**: ein Commit = eine logische Änderung.
- **Aussagekräftige Nachricht**: kurze Betreffzeile im Imperativ (max. ca. 50 Zeichen), Leerzeile, dann das **Warum**.
- **Conventional Commits** machen die Art der Änderung maschinenlesbar und erlauben automatische Changelogs und Versionsnummern:

| Präfix | Bedeutung | Auswirkung auf die Version (SemVer) |
| :--- | :--- | :--- |
| \`feat:\` | neue Funktion | Minor (1.**4**.0) |
| \`fix:\` | Fehlerbehebung | Patch (1.4.**1**) |
| \`docs:\`, \`test:\`, \`refactor:\`, \`chore:\` | Doku, Tests, Umbau, Wartung | keine |
| \`feat!:\` oder Fußzeile \`BREAKING CHANGE:\` | inkompatible Änderung | Major (**2**.0.0) |

Was nicht ins Repository gehört (Build-Ergebnisse, \`node_modules\`, \`.env\` mit Zugangsdaten), steht in der Datei **\`.gitignore\`**. Ein einmal gepushtes Passwort gilt als kompromittiert – es muss ausgetauscht werden, Löschen aus der Historie reicht nicht.
`,
  codeSnippet: `# Typischer Ablauf mit Feature-Branch und Pull Request
git switch main
git pull                              # aktuellen Stand holen
git switch -c feature/passwort-reset  # eigener Branch

# … arbeiten …
git add -p                            # Änderungen stückweise prüfen und vormerken
git commit -m "feat: Passwort per E-Mail-Link zurücksetzen"

git fetch origin
git rebase origin/main                # eigenen Branch auf den neuesten Stand bringen
git push -u origin feature/passwort-reset
# → Pull Request öffnen, Review, CI grün, Merge`,
  codeLanguage: 'Bash',
  exercises: [
    {
      id: 'bereiche-befehle',
      title: 'Welcher Befehl?',
      prompt: 'Nenne den passenden Befehl:\n\n1. Du willst sehen, welche Dateien geändert, aber noch nicht vorgemerkt sind.\n2. Du hast `config.php` versehentlich vorgemerkt und willst sie wieder herausnehmen, ohne die Änderung zu verlieren.\n3. Ein fehlerhafter Commit ist bereits auf GitHub und von Kollegen gepullt. Er soll rückgängig gemacht werden.\n4. Du musst dringend einen Hotfix machen, hast aber halbfertige Änderungen, die du nicht committen willst.',
      solution: '1. `git status` (Details mit `git diff`)\n2. `git restore --staged config.php`\n3. `git revert <commit-id>` – erzeugt einen neuen Commit, die gemeinsame Historie bleibt unverändert\n4. `git stash`, Hotfix-Branch anlegen und erledigen, dann zurückwechseln und `git stash pop`'
    },
    {
      id: 'merge-rebase',
      title: 'Merge oder Rebase?',
      prompt: 'Von `main` (Commits A–B) zweigt `feature` ab und bekommt die Commits C und D. Auf `main` kommt danach Commit E hinzu. Skizziere die Historie (a) nach `git switch main && git merge feature` und (b) nach `git switch feature && git rebase main` gefolgt von einem Merge in main. Welche Variante hat neue Commit-IDs?',
      solution: '(a) **Merge**: A – B – E – M, wobei der Merge-Commit **M** zwei Vorgänger hat (E und D); C und D bleiben als Seitenlinie sichtbar.\n\n(b) **Rebase**: C und D werden als **C\' und D\'** hinter E neu geschrieben: A – B – E – C\' – D\'. Der anschließende Merge in main ist ein **Fast-Forward**, die Historie ist linear.\n\nNeue Commit-IDs entstehen beim **Rebase** (C\', D\'), deshalb nur auf nicht geteilten Branches rebasen.'
    },
    {
      id: 'commit-nachrichten',
      title: 'Commit-Nachrichten verbessern',
      prompt: 'Formuliere die Nachrichten im Stil von Conventional Commits um und gib an, welche Versionsänderung (Major, Minor, Patch) jeweils folgt, ausgehend von 2.3.1:\n\n1. „bug gefixt“\n2. „neue Exportfunktion CSV“\n3. „API: Feld kundennr heißt jetzt customerId“\n4. „readme“',
      solution: '1. `fix: Rundungsfehler bei der Mehrwertsteuer behoben` → **2.3.2** (Patch)\n2. `feat: Bestellungen als CSV exportieren` → **2.4.0** (Minor)\n3. `feat!: Feld kundennr in customerId umbenannt` mit `BREAKING CHANGE:` in der Fußzeile → **3.0.0** (Major)\n4. `docs: Installationsanleitung in der README ergänzt` → keine Versionsänderung'
    }
  ],
  quiz: [
    {
      question: 'Was ist ein Vorteil verteilter gegenüber zentraler Versionsverwaltung?',
      options: ['Es gibt nur eine Kopie der Historie', 'Jeder Entwickler hat die komplette Historie und kann offline arbeiten', 'Branches sind verboten', 'Commits brauchen immer eine Serververbindung'],
      correct: 1,
      explanation: 'Bei Git ist jede Arbeitskopie ein vollständiges Repository.'
    },
    {
      question: 'Welcher Befehl merkt Änderungen für den nächsten Commit vor?',
      options: ['git commit', 'git push', 'git add', 'git fetch'],
      correct: 2,
      explanation: 'git add überträgt Änderungen in die Staging Area.'
    },
    {
      question: 'Was ist der Unterschied zwischen git fetch und git pull?',
      options: [
        'Es gibt keinen',
        'fetch lädt nur herunter, pull lädt herunter und führt zusammen',
        'pull lädt nur herunter, fetch führt zusammen',
        'fetch lädt hoch, pull lädt herunter'
      ],
      correct: 1,
      explanation: 'git pull = git fetch + git merge (bzw. rebase).'
    },
    {
      question: 'Wie macht man einen bereits geteilten Commit sicher rückgängig?',
      options: ['git reset --hard', 'git revert', 'git commit --amend', 'git rebase -i'],
      correct: 1,
      explanation: 'revert erzeugt einen neuen Commit, der die Änderung umkehrt, ohne die gemeinsame Historie umzuschreiben.'
    },
    {
      question: 'Wann entsteht bei git merge kein Merge-Commit?',
      options: ['Bei einem Konflikt', 'Bei einem Fast-Forward', 'Immer', 'Bei mehr als zwei Branches'],
      correct: 1,
      explanation: 'Hat sich der Zielbranch nicht weiterentwickelt, wird der Zeiger nur nach vorne geschoben.'
    },
    {
      question: 'Welche Versionsänderung folgt laut Conventional Commits und SemVer auf einen fix-Commit?',
      options: ['Major', 'Minor', 'Patch', 'keine'],
      correct: 2,
      explanation: 'fix → Patch, feat → Minor, Breaking Change → Major.'
    }
  ],
  relatedLabs: [
    { id: 'git_lab', label: 'Git-Lab' },
    { id: 'git_graph_lab', label: 'Git-Branch-Graph' },
    { id: 'git_conflict_lab', label: 'Merge-Konflikte lösen' },
    { id: 'github_actions_lab', label: 'GitHub Actions' }
  ],
  sources: [
    { title: 'Scott Chacon, Ben Straub: Pro Git (2. Aufl., deutsch, frei online)', url: 'https://git-scm.com/book/de/v2' },
    { title: 'Git-Referenzdokumentation', url: 'https://git-scm.com/docs' },
    { title: 'Conventional Commits 1.0.0', url: 'https://www.conventionalcommits.org/de/v1.0.0/' },
    { title: 'Semantic Versioning 2.0.0', url: 'https://semver.org/lang/de/' },
    { title: 'Atlassian: Vergleich von Git-Workflows', url: 'https://www.atlassian.com/de/git/tutorials/comparing-workflows' },
    { title: 'GitHub Docs: Removing sensitive data from a repository', url: 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository' }
  ],
  sourcesCheckedOn: '29.10.2026'
};

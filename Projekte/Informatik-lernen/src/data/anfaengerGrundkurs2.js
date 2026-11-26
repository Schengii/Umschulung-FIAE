// Fortsetzung von anfaengerGrundkurs.js: Kapitel 7 bis 12 des Einsteiger-Kurses (Format siehe dort).

export const GRUNDKURS_EXTRA_TEIL_2 = {
  webseiten: {
    readTime: '11 Min',
    bild: {
      src: 'webseite-schichten.svg',
      alt: 'HTML, CSS und JavaScript mit je einem Codebeispiel, die zusammen im Browser eine Webseite ergeben',
      caption: 'HTML liefert den Inhalt, CSS das Aussehen, JavaScript das Verhalten.'
    },
    theorie: `
## Was passiert, wenn du eine Webseite aufrufst?

1. Du gibst eine Adresse ein oder klickst auf einen Link.
2. Der Browser fragt per **DNS** nach der IP-Adresse des Servers.
3. Er schickt eine **Anfrage** (*Request*) über das Protokoll **HTTP** oder **HTTPS** an den **Server**.
4. Der Server antwortet (*Response*) mit den Dateien der Seite: **HTML**, **CSS**, **JavaScript**, Bilder.
5. Der **Browser** setzt daraus die Seite zusammen und zeigt sie an.

**HTTPS** ist HTTP mit Verschlüsselung. Sie schützt vor Mitlesen und Verändern. Du erkennst sie am Schloss-Symbol in der Adresszeile. Das Schloss sagt aber nur, dass die Verbindung verschlüsselt ist, nicht, dass die Seite seriös ist.

## Die drei Bausteine

| Baustein | Aufgabe | Vergleich mit einem Haus |
| :--- | :--- | :--- |
| **HTML** | Inhalt und Struktur: Überschriften, Absätze, Bilder, Links | Mauern und Räume |
| **CSS** | Aussehen: Farben, Schriften, Abstände, Layout | Anstrich und Einrichtung |
| **JavaScript** | Verhalten: Klicks, Animationen, Daten nachladen | Elektrik: Licht an, Tür öffnet |

## HTML: Struktur mit Tags

HTML (*HyperText Markup Language*) ist eine **Auszeichnungssprache**. Sie beschreibt, was ein Textstück bedeutet: „Das ist eine Überschrift“, „das ist ein Absatz“, „das ist ein Link“. Dazu dienen **Tags** in spitzen Klammern.

\`\`\`html
<!DOCTYPE html>
<html>
  <head>
    <title>Meine erste Seite</title>
  </head>
  <body>
    <h1>Hallo Welt</h1>
    <p>Das ist mein <strong>erster</strong> Absatz.</p>
    <a href="https://www.w3schools.com">Link zu W3Schools</a>
    <img src="katze.jpg" alt="Eine Katze auf dem Sofa">
  </body>
</html>
\`\`\`

So liest du das Beispiel:

- \`<!DOCTYPE html>\` sagt dem Browser, dass es ein HTML-Dokument ist.
- \`<head>\` enthält Angaben über die Seite, zum Beispiel den \`<title>\`, der im Browser-Tab steht.
- \`<body>\` enthält alles, was sichtbar ist.
- \`<h1>\` ist die wichtigste Überschrift, \`<p>\` ein Absatz, \`<strong>\` hebt Text hervor.
- \`<a href="...">\` ist ein Link, \`<img>\` ein Bild. **Attribute** wie \`href\` und \`alt\` geben dem Tag zusätzliche Angaben.

Ein **Element** besteht aus Anfangs-Tag, Inhalt und End-Tag, zum Beispiel \`<p>Text</p>\`. Elemente lassen sich **verschachteln**: Das \`<strong>\` steht im \`<p>\`.

> **Barrierefreiheit:** Der **alt**-Text beschreibt ein Bild für Menschen, die es nicht sehen können, etwa mit Screenreader, und erscheint, wenn das Bild nicht lädt. Er gehört zu jedem Bild.

## CSS: das Aussehen

CSS (*Cascading Style Sheets*) legt fest, wie HTML-Elemente aussehen. Eine Regel besteht aus einem **Selektor**, der angibt, welches Element gemeint ist, und einem **Deklarationsblock** in geschweiften Klammern. Jede Deklaration nennt eine **Eigenschaft** und einen **Wert**, getrennt durch einen Doppelpunkt:

\`\`\`css
h1 {
  color: teal;
  font-size: 2rem;
}

p {
  color: #333333;
  line-height: 1.6;
}
\`\`\`

Der Selektor \`h1\` trifft alle Überschriften erster Ordnung, \`color\` ändert die Schriftfarbe. Farben lassen sich als Namen (\`teal\`) oder Hexwerte (\`#333333\`) angeben. CSS regelt auch das Layout: Abstände, Spalten und wie sich die Seite an kleine Bildschirme anpasst (**responsives Design**).

## JavaScript: das Verhalten

**JavaScript** ist eine Programmiersprache, die direkt im Browser läuft. Sie kann auf Klicks reagieren, Inhalte der Seite verändern, Formulare prüfen und Daten vom Server nachladen, ohne die Seite neu zu laden:

\`\`\`html
<button id="knopf">Klick mich</button>
<p id="text">Noch nichts passiert.</p>

<script>
  document.getElementById("knopf").onclick = function () {
    document.getElementById("text").innerText = "Danke fürs Klicken!";
  };
</script>
\`\`\`

Beim Klick auf den Knopf ändert JavaScript den Text des Absatzes mit der ID \`text\`.

## Statisch oder dynamisch?

- **Statische Seiten** liegen fertig als Dateien auf dem Server und sehen für alle gleich aus.
- **Dynamische Seiten** werden erst bei der Anfrage erzeugt oder durch JavaScript angepasst, zum Beispiel ein Online-Shop mit deinem Warenkorb. Dahinter arbeiten oft Programme auf dem Server und eine **Datenbank**.

## Hinter die Kulissen schauen

Jeder Browser hat **Entwicklerwerkzeuge**, die du mit der Taste **F12** öffnest. Dort siehst du den HTML-Code der Seite, ihre CSS-Regeln und die Netzwerkanfragen. Probiere es auf einer beliebigen Seite aus, du kannst nichts kaputt machen: Änderungen gelten nur lokal und nur bis zum Neuladen.

> **Merksatz:** HTML sagt, was da ist. CSS sagt, wie es aussieht. JavaScript sagt, was passiert, wenn man darauf klickt.
`,
    aufgaben: [
      {
        id: 'web-tags-erkennen',
        frage: 'Betrachte diese Zeile: <a href="https://example.org">Zur Seite</a>. Nenne Tag, Attribut, Attributwert und sichtbaren Inhalt.',
        loesung: '**Tag**: `a` (Anfangs-Tag `<a ...>` und End-Tag `</a>`). **Attribut**: `href`. **Attributwert**: `https://example.org` (Ziel des Links). **Sichtbarer Inhalt**: „Zur Seite“.'
      },
      {
        id: 'web-css-schreiben',
        frage: 'Schreibe eine CSS-Regel, die alle Absätze (p) in der Farbe Blau darstellt und den Text zentriert (text-align: center).',
        hinweis: 'Selektor, geschweifte Klammern, Eigenschaft: Wert; mit Semikolon.',
        loesung: '```css\np {\n  color: blue;\n  text-align: center;\n}\n```\nDer Selektor `p` wählt alle Absätze, die beiden Deklarationen setzen Farbe und Ausrichtung.'
      },
      {
        id: 'web-sprache-zuordnen',
        frage: 'Welche der drei Techniken (HTML, CSS, JavaScript) ist jeweils zuständig? a) Die Überschrift ist grün. b) Ein Klick auf „Warenkorb“ fügt einen Artikel hinzu. c) Die Seite hat drei Absätze und ein Bild. d) Der Text steht 20 Pixel vom Rand entfernt.',
        loesung: 'a) **CSS** (Farbe). b) **JavaScript** (Verhalten bei Klick, oft zusammen mit dem Server). c) **HTML** (Inhalt und Struktur). d) **CSS** (Abstand).'
      }
    ],
    sources: [
      { label: 'W3Schools: Introduction to HTML', url: 'https://www.w3schools.com/html/html_intro.asp' },
      { label: 'W3Schools: HTML Basic', url: 'https://www.w3schools.com/html/html_basic.asp' },
      { label: 'W3Schools: CSS Syntax', url: 'https://www.w3schools.com/css/css_syntax.asp' },
      { label: 'W3Schools: JavaScript Introduction', url: 'https://www.w3schools.com/js/js_intro.asp' },
      { label: 'W3Schools: What is HTTP', url: 'https://www.w3schools.com/whatis/whatis_http.asp' }
    ]
  },

  daten_speichern: {
    readTime: '10 Min',
    bild: {
      src: 'speicher-pyramide.svg',
      alt: 'Speicherpyramide von Registern über Cache, Arbeitsspeicher und SSD bis zu Festplatte und Cloud',
      caption: 'Je schneller ein Speicher, desto kleiner und teurer ist er. Oben ist er flüchtig, unten dauerhaft.'
    },
    theorie: `
## Wo Computer Daten ablegen

Ein Computer hat nicht nur einen Speicher, sondern mehrere Stufen. Die schnellen sind klein und teuer, die großen sind langsamer und billig.

| Speicher | Geschwindigkeit | Größe | Bleibt ohne Strom? |
| :--- | :--- | :--- | :--- |
| **Register** (in der CPU) | extrem schnell | wenige Byte | nein |
| **Cache** (in der CPU) | sehr schnell | Megabyte | nein |
| **Arbeitsspeicher (RAM)** | schnell | Gigabyte | **nein** (flüchtig) |
| **SSD** | schnell | Gigabyte bis Terabyte | **ja** |
| **Festplatte (HDD)** | langsamer | bis viele Terabyte | **ja** |
| **Cloud, Netzlaufwerk** | abhängig vom Netz | praktisch unbegrenzt | ja |

**Faustregel:** Alles, was du behalten willst, muss auf einen **dauerhaften Speicher**. Alles, womit der Computer gerade arbeitet, liegt im **Arbeitsspeicher**.

## Dateien und Ordner

Die einfachste Art zu speichern sind **Dateien** in **Ordnern**. Jede Datei hat einen Namen, eine **Endung** (.txt, .jpg, .pdf), die den Typ anzeigt, und einen Pfad. Das Betriebssystem verwaltet sie im **Dateisystem**. Für einzelne Dokumente und Bilder reicht das. Sobald viele zusammengehörige Daten verwaltet werden, wird es unübersichtlich.

## Warum Datenbanken?

Denk an einen Online-Shop mit 100.000 Kunden und Millionen Bestellungen. In Dateien wäre es kaum möglich, schnell zu fragen: „Welche Kunden aus Köln haben im Mai mehr als 50 Euro ausgegeben?“ Eine **Datenbank** speichert Daten **geordnet** und beantwortet solche Fragen in Sekundenbruchteilen. Außerdem sorgt sie dafür, dass mehrere Nutzer gleichzeitig arbeiten können, ohne sich zu stören, und dass Daten konsistent bleiben.

## Relationale Datenbanken: Tabellen

Am verbreitetsten sind **relationale Datenbanken**. Sie ordnen Daten in **Tabellen**:

- Eine **Zeile** ist ein **Datensatz** (ein Kunde).
- Eine **Spalte** ist eine **Eigenschaft** (Name, Stadt).
- Jede Tabelle hat einen **Primärschlüssel**: eine Spalte, deren Wert jede Zeile **eindeutig** macht, etwa die Kundennummer. Er darf nicht doppelt vorkommen.

Tabelle **kunde**:

| nr | name | stadt |
| :---: | :--- | :--- |
| 1 | Mia | Köln |
| 2 | Ben | Bonn |
| 3 | Lea | Köln |

Ein zweiter Namensvetter „Mia“ ließe sich über die Nummer sauber unterscheiden, deshalb nimmt man eine Nummer und nicht den Namen als Schlüssel.

### Tabellen verknüpfen

Bestellungen gehören zu Kunden. Statt jedes Mal Name und Stadt zu wiederholen, speichert die Tabelle **bestellung** nur die Kundennummer. Eine solche Spalte, die auf den Primärschlüssel einer anderen Tabelle zeigt, heißt **Fremdschlüssel**:

| bestell_nr | kunde_nr | betrag |
| :---: | :---: | :---: |
| 101 | 1 | 25,00 |
| 102 | 3 | 80,00 |
| 103 | 1 | 12,50 |

Mia (Kundennummer 1) hat zwei Bestellungen. Vorteil: Ändert sich Mias Adresse, muss man sie nur an einer Stelle ändern.

## SQL: mit der Datenbank sprechen

Die Sprache für Datenbanken heißt **SQL** (*Structured Query Language*). Die vier wichtigsten Befehle:

| Befehl | Wirkung | Beispiel |
| :--- | :--- | :--- |
| **SELECT** | Daten abfragen | \`SELECT name FROM kunde;\` |
| **INSERT** | Neue Zeile hinzufügen | \`INSERT INTO kunde VALUES (4, 'Tim', 'Bonn');\` |
| **UPDATE** | Daten ändern | \`UPDATE kunde SET stadt = 'Köln' WHERE nr = 2;\` |
| **DELETE** | Zeilen löschen | \`DELETE FROM kunde WHERE nr = 4;\` |

Mit **WHERE** grenzt man ein, welche Zeilen gemeint sind:

\`\`\`sql
SELECT name FROM kunde WHERE stadt = 'Köln';
\`\`\`

Ergebnis: **Mia** und **Lea**. Mit **ORDER BY** sortiert man das Ergebnis:

\`\`\`sql
SELECT name, stadt FROM kunde ORDER BY name;
\`\`\`

> **Achtung bei UPDATE und DELETE:** Ohne WHERE gelten sie für **alle** Zeilen der Tabelle. Prüfe die Bedingung immer zuerst mit einem SELECT.

## Wo trifft man Datenbanken?

Fast überall: im Online-Shop, bei der Bank, in der Schulverwaltung, in Apps. Der Webserver fragt die Datenbank, baut aus dem Ergebnis eine Seite und schickt sie an deinen Browser. Auch dein Smartphone nutzt Datenbanken für Kontakte und Nachrichten.

## Datensicherung

Auch der beste Speicher geht eines Tages kaputt. Wichtige Daten gehören deshalb **mehrfach** gesichert (**Backup**), am besten an einem zweiten Ort. Mehr dazu im Kapitel „Sicher im Netz“.

> **Merksatz:** RAM ist der Schreibtisch, SSD oder Festplatte der Aktenschrank, die Datenbank das gut sortierte Archiv, in dem man blitzschnell sucht.
`,
    aufgaben: [
      {
        id: 'daten-sql-abfrage',
        frage: 'Gegeben ist die Tabelle kunde aus dem Text. Schreibe eine SQL-Abfrage, die die Namen aller Kunden aus Bonn liefert. Welches Ergebnis erscheint?',
        hinweis: 'SELECT Spalte FROM Tabelle WHERE Bedingung;',
        loesung: '```sql\nSELECT name FROM kunde WHERE stadt = \'Bonn\';\n```\nErgebnis: **Ben**.'
      },
      {
        id: 'daten-primaerschluessel',
        frage: 'Eine Schule speichert Schüler mit Vorname, Nachname und Klasse. Warum ist der Nachname als Primärschlüssel ungeeignet, und was wäre besser?',
        loesung: 'Nachnamen können **doppelt** vorkommen (zwei „Müller“), ein Primärschlüssel muss aber jede Zeile eindeutig machen. Besser ist eine **Schülernummer**, die jede Person nur einmal bekommt.'
      },
      {
        id: 'daten-speicher-zuordnen',
        frage: 'Wo liegen diese Daten gerade? a) Das Dokument, an dem du arbeitest, bevor du speicherst  b) Dein Urlaubsfoto von gestern  c) Der Befehl, den die CPU als Nächstes ausführt.',
        loesung: 'a) im **Arbeitsspeicher (RAM)**, flüchtig. b) auf **SSD oder Festplatte** (oder in der Cloud), dauerhaft. c) in einem **Register oder im Cache** der CPU.'
      }
    ],
    sources: [
      { label: 'W3Schools: SQL Introduction', url: 'https://www.w3schools.com/sql/sql_intro.asp' },
      { label: 'W3Schools: SQL SELECT Statement', url: 'https://www.w3schools.com/sql/sql_select.asp' },
      { label: 'W3Schools: SQL WHERE Clause', url: 'https://www.w3schools.com/sql/sql_where.asp' },
      { label: 'W3Schools: SQL PRIMARY KEY Constraint', url: 'https://www.w3schools.com/sql/sql_primarykey.asp' },
      { label: 'Wikipedia: Arbeitsspeicher', url: 'https://de.wikipedia.org/wiki/Arbeitsspeicher' }
    ]
  },

  sicher_im_netz: {
    readTime: '11 Min',
    bild: {
      src: 'zwei-faktor.svg',
      alt: 'Zwei-Faktor-Anmeldung mit den drei Faktoren Wissen, Besitz und Sein und dem Ablauf Passwort, zweiter Nachweis, angemeldet',
      caption: 'Mit einem zweiten Nachweis reicht ein gestohlenes Passwort allein nicht mehr aus.'
    },
    theorie: `
## Warum Sicherheit uns alle betrifft

Cyberkriminelle suchen sich keine bestimmten Opfer, sondern probieren es massenhaft. Viele Angriffe zielen dabei **auf Menschen statt auf Technik**: Eine überzeugende E-Mail ist oft einfacher als ein Einbruch in ein System. Mit wenigen Gewohnheiten schützt du dich gut.

## 1. Passwörter

Das Passwort ist der Schlüssel zu deinen Konten. Nach den Empfehlungen des **BSI** (Bundesamt für Sicherheit in der Informationstechnik) gilt:

- **Länge schlägt Komplexität.** Ein kurzes Passwort sollte mindestens **8 Zeichen** lang sein und **vier Zeichenarten** mischen (Groß- und Kleinbuchstaben, Ziffern, Sonderzeichen). Ein langes, weniger komplexes Passwort sollte mindestens **25 Zeichen** haben.
- Eine gute Alternative ist eine **Passphrase**: fünf bis sechs zufällig gewählte Wörter, durch Leerzeichen getrennt.
- Nutze für **jedes Konto ein eigenes Passwort**. Wird eine Seite gehackt, sind sonst alle anderen Konten gefährdet.
- Ungeeignet: Namen von Familie oder Haustieren, Geburtsdaten, Tastaturmuster wie 123456.
- Das WLAN-Passwort zu Hause sollte nach BSI mindestens 20 Zeichen lang sein.

Das BSI hält regelmäßige **erzwungene Passwortwechsel** für kontraproduktiv, weil Menschen dann schwächere Passwörter wählen. Wechsle ein Passwort, wenn es bekannt geworden sein könnte.

### Passwortmanager

Niemand kann sich Dutzende lange, einzigartige Passwörter merken. Ein **Passwortmanager** erzeugt und speichert sie verschlüsselt. Du musst dir nur ein starkes **Masterpasswort** merken. Das BSI empfiehlt Passwortmanager ausdrücklich, rät aber auch zu einer Sicherung, denn ohne Masterpasswort sind die Daten sonst verloren.

## 2. Zwei-Faktor-Anmeldung (2FA)

Bei der **Zwei-Faktor-Anmeldung** braucht man **zwei verschiedene Nachweise**. Es gibt drei Arten:

| Faktor | Bedeutung | Beispiel |
| :--- | :--- | :--- |
| **Wissen** | etwas, das du weißt | Passwort, PIN |
| **Besitz** | etwas, das du hast | Smartphone mit App, Sicherheitsschlüssel |
| **Sein** | etwas, das du bist | Fingerabdruck, Gesicht |

Wer nur dein Passwort erbeutet hat, scheitert am zweiten Schritt. Das BSI empfiehlt, 2FA zu aktivieren, sobald ein Dienst sie anbietet. Besser als Codes per SMS sind Codes aus einer **Authenticator-App** oder ein **Hardware-Schlüssel**. Noch einen Schritt weiter gehen **Passkeys**, die Passwörter ganz ersetzen können.

## 3. Phishing erkennen

**Phishing** (von *fishing*, angeln) bedeutet: Betrüger verschicken gefälschte Nachrichten, die vortäuschen, von Bank, Paketdienst oder Behörde zu kommen. Ziel sind Passwörter, Kartendaten oder Geld. Per SMS heißt es **Smishing**, am Telefon **Vishing**.

Typische Warnzeichen:

- **Zeitdruck oder Drohung**: „Ihr Konto wird in 24 Stunden gesperrt.“
- **Unpersönliche Anrede**: „Sehr geehrter Kunde“.
- **Aufforderung, Zugangsdaten einzugeben**: Seriöse Anbieter fragen PIN oder Passwort nie per Mail ab.
- **Seltsame Absenderadresse** oder ein Link, dessen Ziel nicht zur Firma passt (mit der Maus darüberfahren, ohne zu klicken).
- Auch **QR-Codes** in unerwarteten Mails können auf Betrugsseiten führen.

Rechtschreibfehler sind **kein verlässliches Zeichen** mehr, denn professionelle Täter schreiben oft fehlerfrei.

**Was tun?** Nicht klicken, nichts herunterladen, nichts antworten. Rufe den Anbieter über die dir bekannte Adresse oder Nummer selbst auf. Hast du schon Daten eingegeben: sofort Passwort ändern, bei Bankdaten die Bank anrufen und Karte sperren lassen.

## 4. Updates

Jede Software enthält Fehler, manche davon sind **Sicherheitslücken**. Hersteller schließen sie mit Updates. Das BSI rät, Updates **möglichst schnell** zu installieren, denn Kriminelle nutzen Lücken oft schon kurz nach deren Bekanntwerden aus. Am einfachsten sind **automatische Updates** für Betriebssystem, Browser und Apps.

> **Vorsicht vor falschen Updates:** Gefälschte Pop-ups und Mails, die zu einem „dringenden Update“ drängen, verbreiten Schadsoftware. Installiere Updates nur über die gewohnten Wege deines Systems oder die Webseite des Herstellers.

Läuft ein Gerät oder Programm nicht mehr mit Updates (Support-Ende), solltest du es nicht mehr für sensible Aufgaben wie Online-Banking nutzen.

## 5. Schadsoftware (Malware)

| Art | Wirkung |
| :--- | :--- |
| **Virus** | verbreitet sich, indem er andere Dateien infiziert |
| **Trojaner** | tarnt sich als nützliches Programm und öffnet Hintertüren |
| **Ransomware** | verschlüsselt Dateien und fordert Lösegeld |
| **Spyware** | spioniert Eingaben und Gewohnheiten aus |

Schutz bieten Updates, ein aktueller **Virenschutz** (unter Windows ist Microsoft Defender enthalten), Vorsicht bei Anhängen und Downloads sowie ein **Backup**, das die Folgen von Ransomware begrenzt.

## 6. Backups

Sichere wichtige Daten regelmäßig auf einen zweiten Datenträger, der **nicht dauerhaft angeschlossen** ist, und am besten zusätzlich an einem anderen Ort. Das BSI rät, die Sicherung gelegentlich zu prüfen: Sind alle Daten enthalten und lesbar?

## 7. Öffentliche Netze und Datensparsamkeit

- Im **öffentlichen WLAN** (Café, Bahnhof) keine Bank- oder Passwortdaten eingeben, oder ein VPN nutzen.
- Gib nur so viele Daten preis, wie nötig sind, und prüfe die **Datenschutzeinstellungen** deiner Konten.
- Schütze Geräte mit einer **Bildschirmsperre**.

> **Merksatz:** Lang statt kurz, einzigartig statt wiederverwendet, zwei Faktoren statt einem, Update statt Aufschieben, Misstrauen bei Zeitdruck.
`,
    aufgaben: [
      {
        id: 'sicher-passwort-bewerten',
        frage: 'Bewerte diese Passwörter und begründe: a) Mia2010  b) kaffee tisch regen wolke lampe stern  c) Q7!xP  d) Passwort123',
        loesung: 'a) **schwach**: Name und Geburtsjahr sind leicht zu erraten. b) **gut**: Passphrase aus sechs zufälligen Wörtern, lang und merkbar. c) **zu kurz**: nur 5 Zeichen, trotz gemischter Zeichenarten (BSI: mindestens 8). d) **schwach**: ein Wort aus dem Wörterbuch mit angehängten Ziffern, eine der häufigsten Varianten. Am besten: ein Passwortmanager erzeugt ein langes Zufallspasswort.'
      },
      {
        id: 'sicher-phishing-mail',
        frage: 'Du erhältst diese Mail: „Betreff: DRINGEND! Ihr Paket wurde nicht zugestellt. Absender: service@paket-zustellung-info.example. Klicken Sie innerhalb von 12 Stunden auf den Link und bestätigen Sie Ihre Kartendaten, sonst wird das Paket vernichtet.“ Nenne mindestens drei Warnzeichen und das richtige Verhalten.',
        loesung: 'Warnzeichen: **Zeitdruck** (12 Stunden), **Drohung** (Paket wird vernichtet), **Aufforderung zur Eingabe von Kartendaten**, **unpersönliche Anrede ohne Sendungsnummer**, **ungewöhnliche Absenderdomain** statt der Adresse des echten Paketdienstes. Richtig: **nicht klicken**, keine Daten eingeben, die Mail löschen oder melden. Ob wirklich ein Paket unterwegs ist, prüfst du im Kundenkonto des Anbieters über die dir bekannte Adresse.'
      },
      {
        id: 'sicher-faktoren',
        frage: 'Ordne zu (Wissen, Besitz oder Sein): a) Fingerabdruck  b) PIN  c) Code in der Authenticator-App  d) Sicherheitsschlüssel am Schlüsselbund. Warum ist ein zweiter Faktor so wertvoll?',
        loesung: 'a) **Sein**, b) **Wissen**, c) **Besitz** (das Smartphone), d) **Besitz**. Ein zweiter Faktor ist wertvoll, weil ein Angreifer mit einem gestohlenen Passwort allein noch nicht ins Konto kommt: Ihm fehlt das Gerät oder das Merkmal.'
      }
    ],
    sources: [
      { label: 'BSI: Sichere Passwörter erstellen', url: 'https://www.bsi.bund.de/DE/Themen/Verbraucherinnen-und-Verbraucher/Informationen-und-Empfehlungen/Cyber-Sicherheitsempfehlungen/Accountschutz/Sichere-Passwoerter-erstellen/sichere-passwoerter-erstellen_node.html' },
      { label: 'BSI: Zwei-Faktor-Authentisierung', url: 'https://www.bsi.bund.de/DE/Themen/Verbraucherinnen-und-Verbraucher/Informationen-und-Empfehlungen/Cyber-Sicherheitsempfehlungen/Accountschutz/Zwei-Faktor-Authentisierung/zwei-faktor-authentisierung.html' },
      { label: 'BSI: Softwareupdates schnellstmöglich installieren', url: 'https://www.bsi.bund.de/DE/Themen/Verbraucherinnen-und-Verbraucher/Informationen-und-Empfehlungen/Cyber-Sicherheitsempfehlungen/Updates-Browser-Open-Source-Software/Wichtige-Softwareupdates/wichtige-softwareupdates_node.html' },
      { label: 'BSI: Spam, Phishing & Co', url: 'https://www.bsi.bund.de/DE/Themen/Verbraucherinnen-und-Verbraucher/Cyber-Sicherheitslage/Methoden-der-Cyber-Kriminalitaet/Spam-Phishing-Co/spam-phishing-co_node.html' },
      { label: 'BSI: Datensicherung – wie geht das?', url: 'https://www.bsi.bund.de/DE/Themen/Verbraucherinnen-und-Verbraucher/Informationen-und-Empfehlungen/Cyber-Sicherheitsempfehlungen/Daten-sichern-verschluesseln-und-loeschen/Datensicherung-und-Datenverlust/Datensicherung-wie-geht-das/datensicherung-wie-geht-das_node.html' }
    ]
  },

  heimnetz: {
    readTime: '10 Min',
    bild: {
      src: 'heimnetz-aufbau.svg',
      alt: 'Heimnetz mit Smartphone, Laptop und Drucker mit privaten Adressen hinter einem Router, der mit einer öffentlichen Adresse im Internet auftritt',
      caption: 'Alle Geräte teilen sich die öffentliche Adresse des Routers. Intern haben sie private Adressen.'
    },
    theorie: `
## Was gehört zu einem Heimnetz?

In fast jedem Haushalt sind mehrere Geräte vernetzt: Smartphones, Laptops, Fernseher, Drucker, Spielkonsole, Smart-Lautsprecher. Ein **Router** verbindet sie untereinander und mit dem Internet. Meist liefert der Internetanbieter ihn mit. Oft steckt ein **Modem** (wandelt das Signal der Leitung um), ein **Switch** (verteilt Kabelanschlüsse) und ein **WLAN-Zugangspunkt** im selben Gehäuse.

## LAN und WLAN

| Begriff | Bedeutung | Eigenschaften |
| :--- | :--- | :--- |
| **LAN** (*Local Area Network*) | lokales Netz, meist per **Netzwerkkabel** (Ethernet) | stabil, schnell, geringe Verzögerung |
| **WLAN** (*Wireless LAN*) | lokales Netz per **Funk** | bequem, aber abhängig von Entfernung, Wänden und Störungen |

WLAN arbeitet meist in zwei Frequenzbändern. **2,4 GHz** reicht weiter und durchdringt Wände besser, ist aber langsamer und oft überlaufen. **5 GHz** ist schneller, hat aber geringere Reichweite. Für feste Geräte mit hohem Datenbedarf (Fernseher, Spielkonsole, PC) ist ein Kabel die beste Wahl.

## Wer gibt welche Adresse?

Jedes Gerät im Netz braucht eine **IP-Adresse**. Im Heimnetz verteilt sie der Router automatisch. Dafür sorgt der Dienst **DHCP** (*Dynamic Host Configuration Protocol*): Schaltest du ein neues Gerät ein, fragt es „Ich brauche eine Adresse“, und der Router weist ihm eine freie zu. Zusammen mit der Adresse erhält das Gerät weitere Angaben:

- **Subnetzmaske**, meist 255.255.255.0: Sie legt fest, welche Adressen zum eigenen Netz gehören. Bei dieser Maske gehören alle Adressen dazu, die in den ersten drei Zahlen übereinstimmen.
- **Standardgateway**: die Adresse des Routers, an den alles geht, was nicht im eigenen Netz bleibt.
- **DNS-Server**: wer Namen in Adressen übersetzt.

## Private und öffentliche Adressen

Es gibt nicht genug IPv4-Adressen für jedes Gerät. Deshalb sind drei Bereiche für **private Netze** reserviert. Sie werden im Internet nicht weitergeleitet und dürfen in jedem Haushalt gleichzeitig vorkommen:

| Bereich | Typische Verwendung |
| :--- | :--- |
| 10.0.0.0 bis 10.255.255.255 | große Firmennetze |
| 172.16.0.0 bis 172.31.255.255 | mittlere Netze |
| 192.168.0.0 bis 192.168.255.255 | **Heimnetze** (z. B. 192.168.178.x, 192.168.0.x) |

Alle anderen Adressen sind **öffentlich** und weltweit eindeutig. Ein Gerät im Heimnetz hat also eine private Adresse (z. B. 192.168.178.23). Dein Router besitzt zusätzlich eine **öffentliche Adresse**, die er vom Provider erhält und die sich oft von Zeit zu Zeit ändert.

### NAT: Adressen übersetzen

Wie kommen Geräte mit privaten Adressen ins Internet? Der Router übersetzt: Er ersetzt bei ausgehenden Paketen die private Absenderadresse durch seine öffentliche und merkt sich, welches Gerät gefragt hat. Kommt die Antwort, leitet er sie an das richtige Gerät weiter. Dieses Verfahren heißt **NAT** (*Network Address Translation*). Ein angenehmer Nebeneffekt: Von außen kann niemand einfach auf Geräte im Heimnetz zugreifen, solange der Router keine Verbindung ausdrücklich freigibt.

## Das WLAN absichern

Dein WLAN ist die Tür zu deinem Heimnetz. Nach den Empfehlungen des **BSI** gilt:

1. **Verschlüsselung WPA3** wählen, oder WPA2, wenn ein Gerät WPA3 noch nicht unterstützt. Die alte Verschlüsselung WEP ist unsicher und darf nicht mehr verwendet werden.
2. **WLAN-Passwort** mit mindestens **20 Zeichen**. Es sollte nicht mit dem Passwort für die Router-Einstellungen übereinstimmen.
3. **Router-Passwort ändern**: Das voreingestellte Passwort der Einstellungsseite durch ein eigenes ersetzen.
4. **Updates einspielen**: Die Software (Firmware) des Routers aktuell halten, am besten mit **automatischen Updates**.
5. **Fernzugriff abschalten**, wenn du ihn nicht brauchst.
6. **Gast-WLAN** für Besucher und Smart-Home-Geräte einrichten, damit sie vom Rest des Netzes getrennt sind.

## Wenn das Netz hakt

Gehe der Reihe nach vor:

1. **Betrifft es nur ein Gerät oder alle?** Teste ein zweites Gerät.
2. **WLAN eingeschaltet?** Flugmodus aus?
3. **Router neu starten**: Netzstecker ziehen, etwa 30 Sekunden warten, wieder einstecken, mehrere Minuten abwarten.
4. **Kabel prüfen**, bei Kabelverbindung auch den Stecker im Router.
5. **Adresse prüfen**: Unter Windows zeigt \`ipconfig\` die IP-Adresse. Beginnt sie mit 169.254, hat das Gerät keine Adresse vom Router bekommen.
6. **Verbindung testen**: \`ping 192.168.178.1\` (Adresse des Routers) prüft das Heimnetz, \`ping beispiel.de\` das Internet.
7. **Provider-Störung?** Auf der Webseite des Anbieters nachsehen.

> **Merksatz:** Intern private Adressen, nach außen eine öffentliche, dazwischen der Router mit DHCP und NAT. Ein langes WLAN-Passwort und ein aktueller Router sind der beste Schutz.
`,
    aufgaben: [
      {
        id: 'heim-adressen-sortieren',
        frage: 'Welche dieser IPv4-Adressen sind private, welche öffentliche Adressen? a) 192.168.0.15  b) 8.8.8.8  c) 10.4.2.1  d) 172.20.1.9  e) 172.32.0.1',
        hinweis: 'Private Bereiche: 10.x.x.x, 172.16.x.x bis 172.31.x.x, 192.168.x.x.',
        loesung: '**Privat**: a) 192.168.0.15, c) 10.4.2.1, d) 172.20.1.9 (liegt zwischen 172.16 und 172.31). **Öffentlich**: b) 8.8.8.8 und e) 172.32.0.1, denn 172.32 liegt knapp **außerhalb** des privaten Bereichs.'
      },
      {
        id: 'heim-wlan-check',
        frage: 'Dein Router hat noch das Werkspasswort, das WLAN-Passwort lautet „12345678“, und die Firmware ist drei Jahre alt. Welche drei Maßnahmen setzt du als Erstes um?',
        loesung: '1. **Router-Passwort** (Einstellungsseite) auf ein eigenes, starkes Passwort ändern. 2. **WLAN-Passwort** durch ein langes ersetzen (mindestens 20 Zeichen, BSI), Verschlüsselung WPA3 oder WPA2 prüfen. 3. **Firmware aktualisieren** und automatische Updates einschalten. Zusätzlich sinnvoll: Gast-WLAN einrichten und Fernzugriff ausschalten.'
      },
      {
        id: 'heim-nat-erklaeren',
        frage: 'Dein Handy hat die Adresse 192.168.178.23. Wenn du eine Webseite aufrufst, sieht der Webserver aber eine andere Adresse. Erkläre, warum, und nenne die Technik.',
        loesung: 'Der Router übersetzt per **NAT** die private Absenderadresse (192.168.178.23) in seine **öffentliche Adresse**. Der Webserver sieht also nur die öffentliche Adresse des Routers. Kommt die Antwort zurück, merkt sich der Router, welches Gerät gefragt hat, und leitet die Daten ans Handy weiter.'
      }
    ],
    sources: [
      { label: 'RFC 1918: Address Allocation for Private Internets', url: 'https://www.rfc-editor.org/rfc/rfc1918' },
      { label: 'RFC 2131: Dynamic Host Configuration Protocol (DHCP)', url: 'https://www.rfc-editor.org/rfc/rfc2131' },
      { label: 'RFC 3022: Traditional IP Network Address Translator (NAT)', url: 'https://www.rfc-editor.org/rfc/rfc3022' },
      { label: 'BSI: Sicherheitstipps für privates und öffentliches WLAN', url: 'https://www.bsi.bund.de/DE/Themen/Verbraucherinnen-und-Verbraucher/Informationen-und-Empfehlungen/Cyber-Sicherheitsempfehlungen/Router-WLAN-VPN/Sicherheitstipps-fuer-privates-und-oeffentliches-WLAN/sicherheitstipps-fuer-privates-und-oeffentliches-wlan_node.html' },
      { label: 'BSI: WLAN & LAN – was man wissen sollte', url: 'https://www.bsi.bund.de/DE/Themen/Verbraucherinnen-und-Verbraucher/Informationen-und-Empfehlungen/Cyber-Sicherheitsempfehlungen/Router-WLAN-VPN/WLAN-LAN-was-man-wissen-sollte/wlan-lan-was-man-wissen-sollte_node.html' }
    ]
  },

  cloud_und_apps: {
    readTime: '10 Min',
    bild: {
      src: 'cloud-modelle.svg',
      alt: 'IaaS, PaaS und SaaS: welche Schichten der Kunde selbst verwaltet und welche der Anbieter',
      caption: 'Bei IaaS verwaltest du am meisten selbst, bei SaaS nutzt du nur noch die fertige Anwendung.'
    },
    theorie: `
## Was bedeutet „Cloud“?

Die **Cloud** („Wolke“) ist ein bildhaftes Wort für Rechenleistung, Speicher und Programme, die du **über das Internet** bei einem Anbieter nutzt, statt sie selbst zu besitzen. Die Daten liegen nicht auf deinem Gerät, sondern auf **Servern** in **Rechenzentren**: großen Hallen mit Tausenden Rechnern, Notstrom, Kühlung und Sicherheitsdiensten.

Das US-amerikanische **NIST** (National Institute of Standards and Technology) hat Cloud-Computing definiert. Danach hat eine Cloud fünf wesentliche Eigenschaften:

| Eigenschaft | Bedeutung |
| :--- | :--- |
| **Selbstbedienung auf Abruf** | Du holst dir Ressourcen selbst per Klick, ohne mit einem Menschen zu sprechen |
| **Breiter Netzzugang** | Zugriff über das Netz mit Laptop, Handy oder Tablet |
| **Gemeinsamer Ressourcenpool** | Viele Kunden teilen sich dieselbe Technik, die Ressourcen werden dynamisch zugeteilt |
| **Schnelle Anpassung** | Kapazität wächst und schrumpft mit dem Bedarf, oft automatisch |
| **Messbare Nutzung** | Es wird gemessen, was du verbrauchst, und danach abgerechnet |

## Beispiele aus dem Alltag

- **Online-Speicher**: Fotos und Dokumente liegen im Netz und sind auf allen Geräten verfügbar.
- **Web-Mail** und **Online-Office**: Programme im Browser statt auf dem Rechner.
- **Streaming**: Filme und Musik kommen aus der Cloud, du besitzt sie nicht.
- **Videokonferenzen** und **Messenger**.
- **Online-Spiele** und **Navigations-Dienste**.

## Die drei Dienstmodelle

| Modell | Du bekommst | Du kümmerst dich um | Beispiel |
| :--- | :--- | :--- | :--- |
| **IaaS** (*Infrastructure as a Service*) | gemietete Technik wie virtuelle Server und Speicher | Betriebssystem, Software, Daten | ein virtueller Server für eine eigene Anwendung |
| **PaaS** (*Platform as a Service*) | eine fertige Umgebung, in der du eigene Programme laufen lässt | nur deine Anwendung und deine Daten | Plattform, auf der Entwickler ihre Web-App betreiben |
| **SaaS** (*Software as a Service*) | eine fertige Anwendung | nur deine Inhalte und Einstellungen | Web-Mail, Online-Office |

Als Faustregel: Je weiter rechts (SaaS), desto bequemer, aber desto weniger Einfluss hast du.

## Wem gehört die Cloud? Bereitstellungsmodelle

| Modell | Bedeutung |
| :--- | :--- |
| **Öffentliche Cloud** (*Public*) | Anbieter stellt seine Dienste vielen Kunden bereit |
| **Private Cloud** | Betrieben für eine einzige Organisation, im eigenen oder fremden Rechenzentrum |
| **Hybride Cloud** | Mischung aus privater und öffentlicher Cloud |
| **Community Cloud** | Gemeinsam genutzt von mehreren Organisationen mit ähnlichen Anforderungen |

## Vorteile

- **Von überall erreichbar**: mit jedem Gerät mit Internet.
- **Kein eigener Betrieb**: Wartung, Updates und Ausfallsicherheit übernimmt der Anbieter.
- **Skalierbar**: Für einen kurzen Spitzenbedarf mietet man mehr und gibt es danach wieder zurück.
- **Kostenmodell**: Statt hoher Anschaffungskosten zahlt man nach Nutzung oder pauschal im Abo.
- **Zusammenarbeit**: Mehrere Personen bearbeiten dasselbe Dokument gleichzeitig.

## Nachteile und Risiken

- **Ohne Internet kein Zugriff**, sofern es keine Offline-Funktion gibt.
- **Abhängigkeit vom Anbieter**: Fällt er aus oder ändert Preise und Bedingungen, bist du betroffen. Ein Wechsel kann aufwendig sein (*Vendor Lock-in*).
- **Datenschutz**: Deine Daten liegen bei einem Dritten. Es zählt, **wo** sie gespeichert werden (Standort des Rechenzentrums) und **wer darauf zugreifen darf**. In der EU gilt die **DSGVO**.
- **Sicherheit**: Schwache Passwörter und fehlende Zwei-Faktor-Anmeldung sind die häufigste Schwachstelle, nicht die Technik des Anbieters.
- **Laufende Kosten**: Bei dauerhafter Nutzung kann ein Abo teurer werden als ein eigener Speicher.

## Praktische Tipps

1. Verwende ein **starkes, einzigartiges Passwort** und aktiviere die **Zwei-Faktor-Anmeldung**.
2. Prüfe den **Speicherort** und die **Datenschutzbedingungen** des Anbieters.
3. Lade **sensible Daten** (Ausweiskopien, Gesundheitsdaten) nur **verschlüsselt** hoch.
4. Cloud-Speicher ist **kein Backup**: Wird eine Datei auf einem Gerät gelöscht oder von Schadsoftware verschlüsselt, synchronisiert der Dienst das oft mit. Sichere Wichtiges zusätzlich an einem anderen Ort.
5. Prüfe, **wer** Dateien und Ordner geteilt bekommen hat, und entferne alte Freigaben.

> **Merksatz:** Cloud heißt, die Technik eines anderen zu nutzen. Das ist bequem, verlangt aber Vertrauen und Sorgfalt bei Passwörtern, Datenschutz und Sicherungen.
`,
    aufgaben: [
      {
        id: 'cloud-modelle-zuordnen',
        frage: 'Ordne SaaS, PaaS oder IaaS zu: a) Du nutzt ein E-Mail-Postfach im Browser.  b) Du mietest einen leeren virtuellen Server und installierst selbst das Betriebssystem.  c) Du lädst deine fertige Web-App auf eine Plattform, die sich um Server und Betriebssystem kümmert.',
        loesung: 'a) **SaaS** (fertige Anwendung). b) **IaaS** (nur die Technik wird gemietet, Betriebssystem und Software verwaltest du selbst). c) **PaaS** (Plattform übernimmt Server und Betriebssystem, du kümmerst dich um App und Daten).'
      },
      {
        id: 'cloud-vor-nachteile',
        frage: 'Eine kleine Firma überlegt, ihre Buchhaltungssoftware in die Cloud zu verlegen. Nenne zwei Vorteile und zwei Punkte, die geprüft werden sollten.',
        loesung: 'Vorteile: **Zugriff von überall** (z. B. im Homeoffice), **keine eigene Wartung** und Updates der Software, planbare Kosten im Abo. Zu prüfen: **Speicherort und Datenschutz (DSGVO)** der Buchhaltungsdaten, **Zugangsschutz** mit Zwei-Faktor-Anmeldung, **Ausfallsicherheit** und Datenexport bei einem Anbieterwechsel, zusätzlich ein **eigenes Backup**.'
      },
      {
        id: 'cloud-backup-frage',
        frage: 'Ein Freund sagt: „Meine Fotos sind in der Cloud, ein Backup brauche ich nicht.“ Stimmt das? Begründe.',
        loesung: 'Nicht ganz. Viele Cloud-Dienste **synchronisieren** nur: Löschst du ein Foto versehentlich oder verschlüsselt Schadsoftware die Dateien, wird das oft mit übertragen. Zudem kann ein Konto gesperrt werden oder der Anbieter ausfallen. Ein **Backup** an einem zweiten, unabhängigen Ort (z. B. externe Festplatte) schützt davor.'
      }
    ],
    sources: [
      { label: 'NIST SP 800-145: The NIST Definition of Cloud Computing', url: 'https://csrc.nist.gov/pubs/sp/800/145/final' },
      { label: 'Wikipedia: Cloud Computing', url: 'https://de.wikipedia.org/wiki/Cloud-Computing' },
      { label: 'BSI: Datensicherung – wie geht das?', url: 'https://www.bsi.bund.de/DE/Themen/Verbraucherinnen-und-Verbraucher/Informationen-und-Empfehlungen/Cyber-Sicherheitsempfehlungen/Daten-sichern-verschluesseln-und-loeschen/Datensicherung-und-Datenverlust/Datensicherung-wie-geht-das/datensicherung-wie-geht-das_node.html' }
    ]
  },

  it_berufe: {
    readTime: '10 Min',
    bild: {
      src: 'ausbildungsweg.svg',
      alt: 'Ausbildung zum Fachinformatiker über drei Jahre mit Teil 1 in der Mitte und Teil 2 am Ende sowie der Gewichtung der Prüfungsbereiche',
      caption: 'Teil 1 zählt 20 Prozent, die betriebliche Projektarbeit in Teil 2 zählt 50 Prozent der Gesamtnote.'
    },
    theorie: `
## IT als Beruf: viele Wege

Informationstechnik steckt in fast jeder Branche: Banken, Krankenhäuser, Fabriken, Behörden, Schulen und Handel brauchen Menschen, die Systeme planen, betreiben und weiterentwickeln. Der klassische Einstieg ist eine **duale Ausbildung**: Du lernst im **Betrieb** die Praxis und in der **Berufsschule** die Theorie, bekommst eine Ausbildungsvergütung und bist von Anfang an im Arbeitsalltag.

## Die Fachinformatiker-Ausbildung

Die Ausbildung dauert in der Regel **drei Jahre** und endet mit der Abschlussprüfung vor der **IHK** (Industrie- und Handelskammer). Es gibt vier Fachrichtungen:

| Fachrichtung | Kürzel | Schwerpunkt |
| :--- | :---: | :--- |
| **Anwendungsentwicklung** | FIAE | Software planen, programmieren, testen, betreiben |
| **Systemintegration** | FISI | Netzwerke, Server, Arbeitsplätze und IT-Systeme einrichten und betreuen |
| **Daten- und Prozessanalyse** | FIDP | Daten sammeln, auswerten, Prozesse analysieren und verbessern |
| **Digitale Vernetzung** | FIDV | vernetzte Geräte und Anlagen (z. B. Sensoren, Industrie 4.0) einrichten und betreiben |

In den ersten Monaten lernen alle Fachrichtungen gemeinsame Grundlagen: Arbeitsplätze einrichten, Hardware und Betriebssysteme, Netzwerke, IT-Sicherheit, Datenschutz, Projektarbeit und Kundenkommunikation. Erst danach vertiefen sie ihre Fachrichtung.

## Weitere IT-Berufe

- **IT-System-Elektroniker/-in**: verbindet Elektrotechnik und IT, zum Beispiel beim Aufbau von Netzen und Anlagen.
- **Kaufmann/Kauffrau für IT-System-Management**: verbindet IT-Wissen mit Verkauf, Beratung und Projektplanung.
- **Kaufmann/Kauffrau für Digitalisierungsmanagement**: begleitet Unternehmen bei der Digitalisierung von Abläufen.
- Außerhalb der Ausbildung: **Studium** der Informatik oder Wirtschaftsinformatik, auch als duales Studium.

## Die Abschlussprüfung

Die Prüfung ist **gestreckt**: Sie besteht aus zwei Teilen, die zeitlich getrennt stattfinden.

| Teil | Wann | Inhalt | Gewicht |
| :--- | :--- | :--- | :---: |
| **Teil 1** | etwa Mitte der Ausbildung | berufsbildübergreifende Aufgabe (u. a. Einrichten eines IT-gestützten Arbeitsplatzes), schriftlich, 90 Minuten | **20 %** |
| **Teil 2** | am Ende der Ausbildung | betriebliche Projektarbeit mit Dokumentation, Präsentation und Fachgespräch | **50 %** |
| | | zwei berufsspezifische schriftliche Aufgaben | je **10 %** |
| | | Wirtschafts- und Sozialkunde (schriftlich) | **10 %** |

### Die betriebliche Projektarbeit

In Teil 2 bearbeitest du ein **echtes Projekt aus deinem Betrieb** selbstständig. Für die Projektarbeit gelten Obergrenzen: In der Fachrichtung **Anwendungsentwicklung höchstens 80 Stunden**, in den übrigen Fachrichtungen **höchstens 40 Stunden**. Du schreibst eine **Projektdokumentation**, hältst eine **Präsentation** von höchstens 15 Minuten und beantwortest danach Fragen im **Fachgespräch**. Präsentation und Fachgespräch zusammen dauern höchstens 30 Minuten.

Die genauen Regeln können sich je nach Kammer in Einzelheiten unterscheiden. Verbindlich sind die Hinweise deiner zuständigen IHK.

## Was du mitbringen solltest

- **Neugier** und Freude am Ausprobieren
- **Logisches Denken** und Geduld bei der Fehlersuche
- **Genauigkeit**: Ein Zeichen kann ein Programm lahmlegen
- **Kommunikation**: IT-Fachleute erklären Technik Menschen, die sie nicht kennen
- **Lernbereitschaft**: Die Technik ändert sich ständig
- **Englischkenntnisse**: Dokumentation und Fachbegriffe sind oft englisch

Einen bestimmten Schulabschluss schreibt das Gesetz nicht vor. Die Betriebe wählen ihre Auszubildenden selbst aus, viele erwarten mindestens einen mittleren Abschluss und gute Noten in Mathematik und Englisch.

## Wie geht es nach der Ausbildung weiter?

- **Berufserfahrung** sammeln und sich spezialisieren, zum Beispiel auf IT-Sicherheit, Cloud, Datenbanken oder Softwarearchitektur.
- **Weiterbildung** zu höheren Berufsabschlüssen oder Zertifikaten der Hersteller (z. B. für Netzwerke oder Cloud-Plattformen).
- **Studium**: Mit einer abgeschlossenen Ausbildung und Berufserfahrung ist der Weg an eine Hochschule oft möglich.

> **Merksatz:** Ausbildung heißt lernen und arbeiten zugleich. Wer früh Projekte macht, Fehler untersucht und dokumentiert, ist für die Abschlussprüfung und den Beruf am besten vorbereitet.
`,
    aufgaben: [
      {
        id: 'beruf-zuordnen',
        frage: 'Welche Fachrichtung passt am besten? a) Du möchtest eine App für Termine in einer Arztpraxis programmieren.  b) Du richtest Server und das WLAN für ein neues Bürogebäude ein.  c) Du wertest Verkaufszahlen aus und findest Muster.  d) Du vernetzt Sensoren in einer Fabrikhalle.',
        loesung: 'a) **Anwendungsentwicklung (FIAE)**, b) **Systemintegration (FISI)**, c) **Daten- und Prozessanalyse (FIDP)**, d) **Digitale Vernetzung (FIDV)**.'
      },
      {
        id: 'beruf-pruefung-rechnen',
        frage: 'Wie viel Prozent der Gesamtnote machen Teil 1 und die Projektarbeit zusammen aus? Wie viel bleibt für die drei übrigen Prüfungsbereiche von Teil 2?',
        hinweis: 'Teil 1: 20 %, Projektarbeit: 50 %. Die drei übrigen Bereiche zählen je 10 %.',
        loesung: 'Teil 1 (20 %) + Projektarbeit (50 %) = **70 %**. Die übrigen drei Prüfungsbereiche (zwei berufsspezifische Aufgaben und Wirtschafts- und Sozialkunde) zählen je 10 %, zusammen **30 %**. Zusammen ergibt das 100 %.'
      },
      {
        id: 'beruf-projektidee',
        frage: 'Überlege dir ein kleines Projekt, das in einem Betrieb sinnvoll wäre, zum Beispiel für die Systemintegration oder Anwendungsentwicklung. Beschreibe in drei Sätzen: Ausgangslage, Ziel, Nutzen.',
        loesung: 'Beispiel: **Ausgangslage**: In einer kleinen Firma werden Geräte (Laptops, Drucker) auf Papierlisten verwaltet, Daten sind veraltet. **Ziel**: Eine einfache Inventar-Datenbank mit Weboberfläche, in der jedes Gerät mit Nummer, Standort und Nutzer erfasst ist. **Nutzen**: Der Bestand ist aktuell und durchsuchbar, Wartung und Austausch lassen sich planen. Entscheidend ist, dass Ausgangslage, Ziel und Nutzen klar und messbar beschrieben sind.'
      }
    ],
    sources: [
      { label: 'IHK Düsseldorf: Fachinformatiker/-in (Prüfungsstruktur)', url: 'https://www.ihk.de/duesseldorf/ausbildung/ausbildungsberufe/fachinformatiker-4676986' },
      { label: 'IHK: Hinweise für die gestreckte Abschlussprüfung Fachinformatiker/-in (PDF)', url: 'https://www.ihk.de/blueprint/servlet/resource/blob/5488020/dadf1176241699cf66ea5216c4ef3817/merkblatt-fachinformatiker-ab-01-08-2020-data.pdf' }
    ]
  }
};

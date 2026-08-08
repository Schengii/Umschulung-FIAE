# ListerAI - Intelligenter Verkaufs-Assistent 🚀

ListerAI (VerkaufsVorlagen) ist eine moderne React + Vite Webanwendung, die mithilfe von künstlicher Intelligenz (Gemini 2.0 API) den Verkaufsprozess auf Plattformen wie eBay, Kleinanzeigen, Vinted und Shoop revolutioniert.

## ✨ Features & Erweiterungen

### 1. 🤖 Gemini 2.0 Multimodale Analyse & Grounding
* **Gemini 2.0-flash Upgrade:** Alle Operationen verwenden das neueste `gemini-2.0-flash` Modell für extrem schnelle, präzise und intelligente Antworten.
* **Structured JSON Output:** Garantierte JSON-Strukturen bei allen API-Aufrufen über `responseMimeType: "application/json"`. Es gibt keine Parsing-Fehler mehr durch Markdown-Zäune.
* **Search Grounding:** Die KI vergleicht live aktuelle Angebote im Internet, um fundierte Preisschätzungen und echte Vergleichs-Angebote mit Links zu finden.
* **Foto-Qualitätsanalyse:** Konkrete Ratschläge zur Verbesserung der Produktfotos für eine höhere Klickrate.

### 2. 🎨 Client-Side Bild-Studio (Hintergrund-Entferner)
* **Hintergrund entfernen (Studio-Look):** Mit einem Klick analysiert die Anwendung die Pixel des aktiven Fotos im Canvas und bereinigt unruhige Bildhintergründe zu einem makellosen Studiodesign (reinweiß #ffffff).

### 3. 💬 Realistischer Messenger-Simulator & Verhandlungs-Coach
* **Smartphone-Messenger UI:** Ein nachempfundener Chatverlauf mit farbigen Sprechblasen, Kontakt-Avataren und Online-Status.
* **Quick-Replies (Schnellantworten):** Horizontal scrollbare Chat-Vorschläge wie *"Hallo, Artikel ist noch da!"*, *"Zu wenig"* oder *"Abholung/Versand"* zur sekundenschnellen Texteingabe.
* **Verhandlungs-Warnungen:** Automatische Hinweise, wenn der simulierte Käufer ein Angebot unter deiner eingestellten Schmerzgrenze (Mindestpreis) macht.

### 4. 📋 Schritt-für-Schritt Kopier-Assistent
* **Copy Console:** Ein strukturiertes Formular-Overlay direkt unter den Templates. Felder wie Titel, Preis, Beschreibung, Versand und Tags können einzeln mit einem Klick in die Zwischenablage geladen werden. Ideal zum schnellen Ausfüllen von echten Inseratsformularen im Browser.

### 5. 📱 Live-Plattform-Mockups (Visual Mockup)
* Echtzeit-Vorschau des Inserats auf **Kleinanzeigen** (grünes Layout, VB-Badge, Verkäufer-Bewertung) oder **eBay** (weißes Branding, Kauf-Buttons, Versand-Highlights) direkt im Editor-Workspace.

### 6. 📄 Premium PDF-Export & Private Kaufquittung
* **PDF-Datenblatt-Export:** Erstellt ein druckfertiges, sauberes PDF-Datenblatt der Verkaufsanzeige (inklusive Coverbild, Beschreibung, Zustand, Zahlung, Versand und Garantieangaben).
* **Quittungs-Druck:** Erzeugt im Dashboard eine druckfertige private Kaufquittung (Eigentumsnachweis) für den Käufer mit Gewährleistungsausschluss.

---

## 🛠️ Installation & Entwicklung

1. **Abhängigkeiten installieren:**
   ```bash
   npm install
   ```

2. **Entwicklungsserver starten:**
   ```bash
   npm run dev
   ```

3. **Produktions-Build erstellen:**
   ```bash
   npm run build
   ```

## 🔑 API-Key Konfiguration

Für den vollen Funktionsumfang der KI-Analysen benötigst du einen Google Gemini API-Schlüssel. Klicke dazu in der Anwendung auf **Schlüssel einrichten** oder öffne das Einstellungs-Zahnrad. Ohne Schlüssel läuft die Anwendung in einem voll funktionsfähigen **Mock-Modus** zur Demonstration.

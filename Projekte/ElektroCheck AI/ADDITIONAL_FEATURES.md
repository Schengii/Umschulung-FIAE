# Empfohlene Feature-Erweiterungen für ElectroCheck AI

Hier sind einige sehr nützliche und praxisorientierte Funktionen, die das Projekt noch professioneller machen und den Arbeitsalltag von Elektrikern massiv erleichtern.

---

## 1. 🔦 Taschenlampen-Steuerung (Torch Control) für die Kamera
Elektriker arbeiten oft in dunklen Schaltschränken oder Kellerräumen. Wenn die Kamera in der App aktiv ist, kann die physische Taschenlampe des Smartphones direkt per JavaScript ein- und ausgeschaltet werden.

### Code-Beispiel zur Integration in `ec-diagnosis-wizard.ts`:
Füge in der Hauptkomponente eine Methode hinzu, um den Kamera-Track zu steuern:

```typescript
@state() private _isTorchOn: boolean = false;

private async _toggleTorch() {
  if (!this._stream) return;
  const track = this._stream.getVideoTracks()[0];
  
  // Überprüfen, ob das Gerät eine Taschenlampe unterstützt
  const capabilities = (track as any).getCapabilities?.() || {};
  if (capabilities.torch) {
    try {
      this._isTorchOn = !this._isTorchOn;
      await track.applyConstraints({
        advanced: [{ torch: this._isTorchOn } as any]
      });
    } catch (e) {
      console.error("Taschenlampe konnte nicht gesteuert werden", e);
    }
  } else {
    alert("Taschenlampe wird von dieser Kamera nicht unterstützt.");
  }
}
```

**UI-Erweiterung:**
Füge in der `render()`-Methode neben dem "Wechseln"-Button ein Taschenlampen-Icon hinzu:
```html
<vaadin-button
  theme="secondary"
  @click="${this._toggleTorch}"
  title="Taschenlampe ein/aus"
>
  ${this._isTorchOn ? "🔦 Aus" : "💡 Ein"}
</vaadin-button>
```

---

## 2. 📋 DGUV V3 / VDE 0701-0702 Prüfprotokoll-Assistent
Elektrogeräte müssen regelmäßig geprüft werden. Du kannst ein einfaches Formular hinzufügen, um DGUV V3 Messwerte einzutragen und direkt in das PDF-Protokoll einzubinden:

* **Messwerte-Formular**:
  * Schutzleiterwiderstand ($R_{PE}$) in $\Omega$ (Grenzwert: $< 0,3\,\Omega$)
  * Isolationswiderstand ($R_{ISO}$) in $M\Omega$ (Grenzwert: $> 1,0\,M\Omega$)
  * Schutzleiterstrom / Ableitstrom in $mA$ (Grenzwert: $< 3,5\,mA$)
* **Automatisches Urteil**: Die App prüft, ob die Grenzwerte eingehalten wurden, und setzt den Status des Geräts auf **"Bestanden"** oder **"Nicht bestanden"**.

---

## 3. 🗣️ Hände-Frei Sprachsteuerung für die Reparatur
Wenn ein Elektriker an einer Anlage arbeitet, hat er oft Werkzeug in der Hand oder trägt isolierte Handschuhe. Die geführte Reparatur (`ec-guided-repair.ts`) kann über einfache Sprachbefehle gesteuert werden.

### Integration in `ec-guided-repair.ts`:
Nutze das native SpeechRecognition-System für Hotwords:

```typescript
private _recognition: any = null;

startVoiceControl() {
  const SpeechConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechConstructor) return;
  
  this._recognition = new SpeechConstructor();
  this._recognition.continuous = true;
  this._recognition.lang = 'de-DE';
  this._recognition.interimResults = false;

  this._recognition.onresult = (event: any) => {
    const lastResult = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
    
    if (lastResult.includes("weiter") || lastResult.includes("nächst")) {
      this._handleNext(this.result.actionSteps.length);
    } else if (lastResult.includes("zurück")) {
      this._handleBack();
    } else if (lastResult.includes("vorlesen") || lastResult.includes("sprich")) {
      this._speakStep(this.result.actionSteps[this.stepIndex].text);
    } else if (lastResult.includes("stopp") || lastResult.includes("halt")) {
      this._stopSpeech();
    }
  };

  this._recognition.start();
}
```

---

## 📂 4. Offline Datenblatt-Manager (PDF-Ablage)
Es gibt oft kein Netz in Industriehallen. Du könntest eine Bibliothek erstellen, in der Datenblätter heruntergeladen und lokal im IndexedDB-Speicher abgelegt werden. 
* Wenn der OCR-Scanner das Typenschild eines Bauteils erkennt, kann die App prüfen, ob das Datenblatt bereits offline auf dem Gerät liegt, und es sofort im integrierten Viewer öffnen, anstatt auf Google zu verweisen.

---

## 🛒 5. Ersatzteil-Direktkauf über Großhändler-APIs
Amazon ist für den Privatgebrauch super, aber Elektriker bestellen meist über spezielle Großhändler.
* **Erweiterung**: Erzeuge neben dem Amazon-Button Links zu:
  * **Conrad Electronic** B2B Portal
  * **RS Components**
  * **Reichelt Elektronik**
  * **Mercateo** (B2B-Marktplatz)

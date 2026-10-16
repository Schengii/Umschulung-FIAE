// JSON-Schema für Fehlerdiagnose
export const diagnosisSchema = {
  type: "object",
  properties: {
    deviceName: {
      type: "string",
      description: "Name des Geräts oder Bauteils"
    },
    identifiedDefect: {
      type: "string",
      description: "Kurze, präzise Beschreibung des Defekts"
    },
    recommendation: {
      type: "string",
      description: "Zusammenfassung der vorgeschlagenen Lösung"
    },
    actionSteps: {
      type: "array",
      description: "Schritt-für-Schritt-Anleitungen für die Reparatur, nummeriert und mit completed als false",
      items: {
        type: "object",
        properties: {
          id: { type: "integer" },
          text: { type: "string" },
          completed: { type: "boolean" }
        },
        required: ["id", "text", "completed"]
      }
    },
    estimatedRepairCost: {
      type: "string",
      description: "Geschätzte Kosten für die Reparatur"
    },
    repairDifficulty: {
      type: "integer",
      description: "Schwierigkeitsgrad von 1 (sehr leicht) bis 5 (Experte)"
    },
    safetyLevel: {
      type: "string",
      enum: ["SAFE", "WARNING", "DANGER"],
      description: "Sicherheitsstufe basierend auf Gefahrenpotential"
    },
    additionalTips: {
      type: "array",
      items: { type: "string" },
      description: "1-3 kurze Tipps zur Vermeidung oder Pflege"
    },
    sparePartSearchTerm: {
      type: "string",
      description: "Exakter Suchbegriff für benötigte Ersatzteile"
    },
    customerExperience: {
      type: "string",
      description: "Erfahrungswerte: Ist dies ein typischer Verschleißfehler?"
    },
    boundingBoxes: {
      type: "array",
      description: "Markierungen von identifizierten Defekten, Schäden oder Bauteilen auf dem Bild. Wenn kein Bild vorliegt oder nichts markiert werden kann, leeres Array zurückgeben.",
      items: {
        type: "object",
        properties: {
          label: { type: "string", description: "Bezeichnung des Bereichs, z.B. 'Beschädigte Isolierung' oder 'Aufgequollener Kondensator'" },
          box_2d: {
            type: "array",
            description: "4 Ganzzahlen [ymin, xmin, ymax, xmax] normiert auf 0 bis 1000 relativ zum Bild",
            items: { type: "integer" }
          }
        },
        required: ["label", "box_2d"]
      }
    }
  },
  required: [
    "deviceName",
    "identifiedDefect",
    "recommendation",
    "actionSteps",
    "estimatedRepairCost",
    "repairDifficulty",
    "safetyLevel",
    "additionalTips",
    "sparePartSearchTerm",
    "customerExperience",
    "boundingBoxes"
  ]
};

// JSON-Schema für Typenschild OCR
export const scanSchema = {
  type: "object",
  properties: {
    componentName: {
      type: "string",
      description: "Identifiziertes Bauteil oder Gerät"
    },
    extractedText: {
      type: "string",
      description: "Alle wichtigen Werte, Seriennummern und Spezifikationen vom Typenschild"
    },
    datasheetSearchUrl: {
      type: "string",
      description: "Eine Google-Such-URL zum Auffinden des Datenblatts"
    }
  },
  required: ["componentName", "extractedText", "datasheetSearchUrl"]
};

// JSON-Schema für Wärmebild-Analyse
export const thermalAnalysisSchema = {
  type: "object",
  properties: {
    overallStatus: {
      type: "string",
      enum: ["SAFE", "MONITOR", "CRITICAL"],
      description: "Gesamtsicherheitsstatus der thermografischen Untersuchung"
    },
    generalRecommendation: {
      type: "string",
      description: "Zusammenfassung der Erkenntnisse und dringende Maßnahmen auf Deutsch"
    },
    detectedHotspots: {
      type: "array",
      description: "Liste der erkannten Wärmeanomalien und Hotspots auf dem Bild.",
      items: {
        type: "object",
        properties: {
          label: { type: "string", description: "Bezeichnung des Bauteils oder Bereichs, z.B. 'Zuleitung Klemme L1' oder 'Sicherung F2'" },
          temperature: { type: "string", description: "Geschätzte Temperatur des Hotspots (z.B. '85°C')" },
          severity: { type: "string", enum: ["OK", "MONITOR", "CRITICAL"], description: "Kritikalität des Hotspots" },
          box_2d: {
            type: "array",
            description: "4 Ganzzahlen [ymin, xmin, ymax, xmax] normiert auf 0 bis 1000 relativ zum Bild für den markierten Hotspot",
            items: { type: "integer" }
          }
        },
        required: ["label", "temperature", "severity", "box_2d"]
      }
    },
    actionSteps: {
      type: "array",
      description: "Nummerierte Schritt-für-Schritt-Anleitung zur Behebung der thermischen Probleme auf Deutsch.",
      items: {
        type: "object",
        properties: {
          id: { type: "integer" },
          text: { type: "string" },
          completed: { type: "boolean" }
        },
        required: ["id", "text", "completed"]
      }
    },
    safetyTips: {
      type: "array",
      items: { type: "string" },
      description: "1-3 VDE-konforme Sicherheitshinweise zur Thermografie (z.B. Grenztemperaturen nach DIN EN 60204-1) auf Deutsch."
    }
  },
  required: ["overallStatus", "generalRecommendation", "detectedHotspots", "actionSteps", "safetyTips"]
};

// JSON-Schema für Multimeter OCR
export const multimeterSchema = {
  type: "object",
  properties: {
    value: {
      type: "number",
      description: "Der gelesene Messwert als Dezimalzahl (z.B. 0.23, 230.5). Wenn kein gültiger Zahlenwert erkannt wird, liefere null."
    },
    unit: {
      type: "string",
      enum: ["V", "mA", "A", "Ohm", "kOhm", "MOhm", "UNKNOWN"],
      description: "Die physikalische Einheit auf dem Display des Multimeters."
    }
  },
  required: ["value", "unit"]
};

// JSON-Schema für Schaltplan- & Stromlaufplan-Analyse
export const schematicAnalysisSchema = {
  type: "object",
  properties: {
    diagramTitle: {
      type: "string",
      description: "Titel oder Typ des Schaltplans (z.B. 'Wendeschützsteuerung', 'Stern-Dreieck-Schaltung', 'Verteilerplan')"
    },
    identifiedComponents: {
      type: "array",
      description: "Liste aller identifizierten Bauteile im Schaltplan mit Klemmen und Kennzeichnung",
      items: {
        type: "object",
        properties: {
          tag: { type: "string", description: "Betriebsmittelkennzeichnung z.B. 'Q1', 'K1M', 'F1'" },
          name: { type: "string", description: "Bezeichnung z.B. 'Leitungsschutzschalter 16A', 'Hauptschütz'" },
          terminals: { type: "string", description: "Identifizierte Klemmen z.B. '1, 3, 5 / 2, 4, 6'" }
        },
        required: ["tag", "name", "terminals"]
      }
    },
    detectedErrors: {
      type: "array",
      description: "Erkannte Verdrahtungsfehler, fehlende PE-Leiter, Kurzschlussrisiken oder Normabweichungen nach DIN EN 61082 / VDE 0100",
      items: {
        type: "object",
        properties: {
          severity: { type: "string", enum: ["INFO", "WARNING", "CRITICAL"] },
          description: { type: "string", description: "Detaillierte Beschreibung der Auffälligkeit" },
          vdeReference: { type: "string", description: "Referenzierte VDE-Norm z.B. 'DIN VDE 0100-410'" }
        },
        required: ["severity", "description", "vdeReference"]
      }
    },
    summary: {
      type: "string",
      description: "Zusammenfassung der Schaltplanprüfung auf Deutsch"
    }
  },
  required: ["diagramTitle", "identifiedComponents", "detectedErrors", "summary"]
};

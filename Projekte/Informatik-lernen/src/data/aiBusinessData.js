export const AI_BUSINESS_MODULES = [
  {
    id: 'prompt_templates',
    title: '1. Business & Marketing Prompt Templates (Golem-Style)',
    category: 'AI Efficiency',
    desc: 'Erstelle professionelle Marketing-Texte, E-Mails, Zusammenfassungen und Strategiepapiere mit strukturierten Prompts.',
    promptTemplate: `Rolle: Senior Marketing Strategist & Copywriter
Kontext: Neue B2B SaaS-App für IT-Entwickler und Systemintegratoren
Aufgabe: Erstelle einen 3-stufigen E-Mail-Funnel für Kaltakquise von IT-Leitern.
Format: 
- E-Mail 1: Problem-Awareness & Hook
- E-Mail 2: Fallstudie & Mehrwert (Social Proof)
- E-Mail 3: Dringlichkeit & Call-to-Action (Demo-Termin)`,
    bestPractice: 'Kombiniere immer Rolle + Kontext + konkrete Aufgabe + Format-Vorgaben.'
  },
  {
    id: 'chain_of_thought',
    title: '2. Advanced Prompt Engineering: Chain-of-Thought (CoT)',
    category: 'Prompt Engineering',
    desc: 'Bringe das LLM dazu, komplexe logische Probleme schrittweise zu durchdenken ("Think step-by-step"), um Halluzinationen zu minimieren.',
    promptTemplate: `Aufgabe: Analysiere folgenden Systemarchitektur-Entwurf für 50.000 gleichzeitige Nutzer.
Denke Schritt für Schritt vor deiner Antwort:
Schritt 1: Identifiziere potenzielle Engpässe (Bottlenecks) in der Datenbank.
Schritt 2: Evaluiere die Caching-Strategie mit Redis.
Schritt 3: Gib konkrete Handlungsempfehlungen zur Skalierung.`,
    bestPractice: 'Fordere das Modell explizit auf, Zwischenschritte zu begründen.'
  },
  {
    id: 'few_shot',
    title: '3. Few-Shot Prompting mit Beispielen',
    category: 'In-Context Learning',
    desc: 'Übermittle dem Modell 2-3 Beispiele im Prompt, um das exakte Ausgabenformat ohne Feintuning zu erzwingen.',
    promptTemplate: `Konvertiere Fehlermeldungen in benutzerfreundliche Toast-Benachrichtigungen.

Beispiel 1:
Input: "ERR_CONNECTION_REFUSED at 127.0.0.1:5432"
Output: "Verbindung zum Datenbank-Server fehlgeschlagen. Bitte prüfe dein Netzwerk."

Beispiel 2:
Input: "HTTP 401 Unauthorized - Invalid JWT Token"
Output: "Sitzung abgelaufen. Bitte melde dich erneut an."

Input: "HTTP 504 Gateway Timeout"
Output:`,
    bestPractice: 'Few-Shot Beispiele garantieren 100% konsistente JSON oder Textausgaben.'
  },
  {
    id: 'deep_learning',
    title: '4. Deep Learning & Neuronale Netze (Coursera-Inspired)',
    category: 'AI Engineering',
    desc: 'Verstehe die Funktionsweise von künstlichen neuronalen Netzen, Layer (Input, Hidden, Output), Activation Functions (ReLU, Sigmoid) und Backpropagation.',
    promptTemplate: `# PyTorch Neural Network Architektur-Beispiel
import torch
import torch.nn as nn

class DeepLearningClassifier(nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim):
        super().__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_dim, output_dim)
        self.sigmoid = nn.Sigmoid()
        
    def forward(self, x):
        out = self.relu(self.fc1(x))
        out = self.sigmoid(self.fc2(out))
        return out`,
    bestPractice: 'Neuronale Netze lernen durch Minimierung einer Loss-Funktion mittels Gradient Descent & Backpropagation.'
  }
];

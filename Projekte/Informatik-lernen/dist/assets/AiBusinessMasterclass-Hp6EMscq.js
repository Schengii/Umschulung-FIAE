import{r as e}from"./rolldown-runtime-hePW80VL.js";import{h as t}from"./vendor-charts-LpGij_Qu.js";import{n}from"./vendor-react-CYlvDiRg.js";import{Qt as r,Tn as i}from"./vendor-ui-Cq2y2VJf.js";var a=e(t(),1),o=[{id:`prompt_templates`,title:`1. Business & Marketing Prompt Templates (Golem-Style)`,category:`AI Efficiency`,desc:`Erstelle professionelle Marketing-Texte, E-Mails, Zusammenfassungen und Strategiepapiere mit strukturierten Prompts.`,promptTemplate:`Rolle: Senior Marketing Strategist & Copywriter
Kontext: Neue B2B SaaS-App für IT-Entwickler und Systemintegratoren
Aufgabe: Erstelle einen 3-stufigen E-Mail-Funnel für Kaltakquise von IT-Leitern.
Format: 
- E-Mail 1: Problem-Awareness & Hook
- E-Mail 2: Fallstudie & Mehrwert (Social Proof)
- E-Mail 3: Dringlichkeit & Call-to-Action (Demo-Termin)`,bestPractice:`Kombiniere immer Rolle + Kontext + konkrete Aufgabe + Format-Vorgaben.`},{id:`chain_of_thought`,title:`2. Advanced Prompt Engineering: Chain-of-Thought (CoT)`,category:`Prompt Engineering`,desc:`Bringe das LLM dazu, komplexe logische Probleme schrittweise zu durchdenken ("Think step-by-step"), um Halluzinationen zu minimieren.`,promptTemplate:`Aufgabe: Analysiere folgenden Systemarchitektur-Entwurf für 50.000 gleichzeitige Nutzer.
Denke Schritt für Schritt vor deiner Antwort:
Schritt 1: Identifiziere potenzielle Engpässe (Bottlenecks) in der Datenbank.
Schritt 2: Evaluiere die Caching-Strategie mit Redis.
Schritt 3: Gib konkrete Handlungsempfehlungen zur Skalierung.`,bestPractice:`Fordere das Modell explizit auf, Zwischenschritte zu begründen.`},{id:`few_shot`,title:`3. Few-Shot Prompting mit Beispielen`,category:`In-Context Learning`,desc:`Übermittle dem Modell 2-3 Beispiele im Prompt, um das exakte Ausgabenformat ohne Feintuning zu erzwingen.`,promptTemplate:`Konvertiere Fehlermeldungen in benutzerfreundliche Toast-Benachrichtigungen.

Beispiel 1:
Input: "ERR_CONNECTION_REFUSED at 127.0.0.1:5432"
Output: "Verbindung zum Datenbank-Server fehlgeschlagen. Bitte prüfe dein Netzwerk."

Beispiel 2:
Input: "HTTP 401 Unauthorized - Invalid JWT Token"
Output: "Sitzung abgelaufen. Bitte melde dich erneut an."

Input: "HTTP 504 Gateway Timeout"
Output:`,bestPractice:`Few-Shot Beispiele garantieren 100% konsistente JSON oder Textausgaben.`},{id:`deep_learning`,title:`4. Deep Learning & Neuronale Netze (Coursera-Inspired)`,category:`AI Engineering`,desc:`Verstehe die Funktionsweise von künstlichen neuronalen Netzen, Layer (Input, Hidden, Output), Activation Functions (ReLU, Sigmoid) und Backpropagation.`,promptTemplate:`# PyTorch Neural Network Architektur-Beispiel
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
        return out`,bestPractice:`Neuronale Netze lernen durch Minimierung einer Loss-Funktion mittels Gradient Descent & Backpropagation.`}],s=n();function c(){let[e,t]=(0,a.useState)(o[0].id),[n,c]=(0,a.useState)(!1),l=o.find(t=>t.id===e)||o[0];return(0,s.jsxs)(`div`,{style:{maxWidth:`1000px`,margin:`0 auto`,paddingBottom:`60px`},children:[(0,s.jsxs)(`div`,{className:`glass-panel`,style:{padding:`32px`,marginBottom:`24px`,border:`2px solid var(--accent-primary)`},children:[(0,s.jsxs)(`h1`,{style:{fontSize:`2.2rem`,fontWeight:`800`,marginBottom:`8px`,color:`var(--text-main)`,display:`flex`,alignItems:`center`,gap:`10px`},children:[(0,s.jsx)(i,{size:32,style:{color:`var(--accent-primary)`}}),` AI Business & Deep Learning Masterclass`]}),(0,s.jsx)(`p`,{style:{color:`var(--text-muted)`,fontSize:`1.05rem`},children:`Golems & Coursera-inspirierter Kurs für KI-Effizienz im Beruf, Business Prompts & Neuronale Netze.`})]}),(0,s.jsx)(`div`,{style:{display:`flex`,gap:`10px`,marginBottom:`24px`,overflowX:`auto`},children:o.map(n=>(0,s.jsx)(`button`,{onClick:()=>t(n.id),style:{minHeight:`48px`,padding:`10px 20px`,borderRadius:`var(--radius-md)`,fontWeight:`700`,fontSize:`0.95rem`,background:e===n.id?`var(--accent-primary)`:`var(--bg-card)`,color:e===n.id?`#ffffff`:`var(--text-main)`,border:e===n.id?`2px solid var(--accent-primary)`:`2px solid var(--border-color)`,cursor:`pointer`,whiteSpace:`nowrap`},children:n.title},n.id))}),(0,s.jsxs)(`div`,{className:`glass-panel`,style:{padding:`32px`},children:[(0,s.jsx)(`span`,{className:`badge badge-indigo`,style:{marginBottom:`10px`},children:l.category}),(0,s.jsx)(`h2`,{style:{fontSize:`1.6rem`,fontWeight:`800`,marginBottom:`8px`,color:`var(--text-main)`},children:l.title}),(0,s.jsx)(`p`,{style:{color:`var(--text-muted)`,fontSize:`1.02rem`,lineHeight:`1.6`,marginBottom:`24px`},children:l.desc}),(0,s.jsxs)(`div`,{className:`code-window`,style:{marginBottom:`20px`},children:[(0,s.jsxs)(`div`,{className:`code-header`,children:[(0,s.jsx)(`span`,{children:`Prompt Vorlage / Code Snippet`}),(0,s.jsxs)(`button`,{onClick:()=>{navigator.clipboard.writeText(l.promptTemplate),c(!0),setTimeout(()=>c(!1),2e3)},style:{background:`transparent`,border:`none`,color:`#f8fafc`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`4px`,fontSize:`0.85rem`},children:[(0,s.jsx)(r,{size:14}),` `,n?`Kopiert ✓`:`Kopieren`]})]}),(0,s.jsx)(`pre`,{className:`code-body`,children:(0,s.jsx)(`code`,{children:l.promptTemplate})})]}),(0,s.jsxs)(`div`,{style:{background:`var(--bg-tertiary)`,padding:`16px`,borderRadius:`var(--radius-md)`,borderLeft:`4px solid var(--accent-amber)`},children:[(0,s.jsx)(`strong`,{style:{color:`var(--accent-amber)`,fontSize:`0.9rem`,display:`block`,marginBottom:`4px`},children:`💡 Pro-Tipp / Best Practice:`}),(0,s.jsx)(`p`,{style:{margin:0,fontSize:`0.94rem`,color:`var(--text-main)`},children:l.bestPractice})]})]})]})}export{c as default};
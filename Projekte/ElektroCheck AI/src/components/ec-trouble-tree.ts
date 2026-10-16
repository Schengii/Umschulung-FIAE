import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import "@vaadin/button";
import {
  FAULT_TREES,
  getTreeNode,
  type FaultTree,
  type FaultNode,
} from "../utils/fault-tree-engine";
import type { DiagnosisResult } from "../services/ai-types";

@customElement("ec-trouble-tree")
export class EcTroubleTree extends LitElement {
  @state() private _selectedTree: FaultTree | null = null;
  @state() private _currentNode: FaultNode | null = null;
  @state() private _breadcrumbs: Array<{ nodeId: string; question: string; answerLabel: string }> = [];

  static styles = css`
    :host {
      display: block;
      width: 100%;
      text-align: left;
    }
    .tree-card {
      background: var(--bg-card, #ffffff);
      padding: 1.25rem;
      border-radius: var(--radius-m, 12px);
      border: 1px solid var(--border, #cbd5e1);
      margin-top: 10px;
    }
    h4 {
      margin: 0 0 4px 0;
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .subtitle {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin: 0 0 1rem 0;
    }

    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin-top: 10px;
    }
    .cat-btn {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 14px;
      border-radius: 8px;
      border: 1px solid var(--border, #cbd5e1);
      background: var(--bg-app, #f8fafc);
      cursor: pointer;
      transition: all 0.2s ease;
      color: var(--text-primary);
    }
    .cat-btn:hover {
      border-color: var(--accent-primary, #0284c7);
      background: var(--bg-card, #ffffff);
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.15);
      transform: translateY(-2px);
    }
    .cat-icon {
      font-size: 1.5rem;
      margin-bottom: 6px;
    }
    .cat-title {
      font-weight: bold;
      font-size: 0.95rem;
      margin-bottom: 4px;
    }
    .cat-desc {
      font-size: 0.75rem;
      color: var(--text-secondary);
      line-height: 1.3;
    }

    .breadcrumbs {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 1rem;
      font-size: 0.8rem;
    }
    .crumb {
      background: rgba(2, 132, 199, 0.1);
      color: var(--accent-primary, #0284c7);
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: 600;
    }

    .question-box {
      background: var(--bg-app, #f8fafc);
      border: 1.5px solid var(--accent-primary, #0284c7);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 1rem;
    }
    .question-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 10px;
    }
    .safety-hint {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      color: #92400e;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .options-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .option-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid var(--border, #cbd5e1);
      background: var(--bg-card, #ffffff);
      color: var(--text-primary);
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: left;
    }
    .option-btn:hover {
      background: var(--accent-primary, #0284c7);
      color: #ffffff;
      border-color: var(--accent-primary, #0284c7);
    }

    .result-card {
      background: rgba(11, 138, 90, 0.08);
      border: 1.5px solid #0b8a5a;
      border-radius: 8px;
      padding: 16px;
      margin-top: 1rem;
    }
    .result-title {
      font-size: 1.1rem;
      font-weight: 800;
      color: #0b8a5a;
      margin-bottom: 8px;
    }
  `;

  private _selectTree(tree: FaultTree) {
    this._selectedTree = tree;
    this._breadcrumbs = [];
    this._currentNode = getTreeNode(tree.id, tree.rootNodeId);
  }

  private _selectOption(optionId: string, label: string, nextNodeId: string) {
    if (!this._selectedTree || !this._currentNode) return;

    this._breadcrumbs = [
      ...this._breadcrumbs,
      { nodeId: this._currentNode.id, question: this._currentNode.question, answerLabel: label },
    ];

    this._currentNode = getTreeNode(this._selectedTree.id, nextNodeId);
  }

  private _reset() {
    this._selectedTree = null;
    this._currentNode = null;
    this._breadcrumbs = [];
  }

  private _applyDiagnosisToWizard(diagnosis: DiagnosisResult) {
    this.dispatchEvent(
      new CustomEvent("fault-tree-diagnosis-selected", {
        detail: { diagnosis },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <div class="tree-card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h4>🧠 KI-Fehlerbaum Leitstand (Offline Störungs-Analyse)</h4>
          ${this._selectedTree
            ? html`
                <vaadin-button
                  theme="tertiary"
                  @click="${this._reset}"
                  style="min-height: auto; height: 30px; font-size: 0.8rem;"
                >
                  ↩️ Auswählen
                </vaadin-button>
              `
            : ""}
        </div>
        <p class="subtitle">
          Interaktiver Entscheidungsbaum zur schnellen Eingrenzung elektrischer Fehler im Feld (funktioniert 100% offline):
        </p>

        ${!this._selectedTree
          ? html`
              <div class="category-grid">
                ${FAULT_TREES.map(
                  (tree) => html`
                    <div class="cat-btn" @click="${() => this._selectTree(tree)}">
                      <div class="cat-icon">${tree.icon}</div>
                      <div class="cat-title">${tree.title}</div>
                      <div class="cat-desc">${tree.description}</div>
                    </div>
                  `
                )}
              </div>
            `
          : html`
              <!-- Breadcrumbs -->
              ${this._breadcrumbs.length > 0
                ? html`
                    <div class="breadcrumbs">
                      ${this._breadcrumbs.map(
                        (b) => html`<span class="crumb">➜ ${b.answerLabel}</span>`
                      )}
                    </div>
                  `
                : ""}

              ${this._currentNode
                ? this._currentNode.diagnosis
                  ? html`
                      <!-- Result Node -->
                      <div class="result-card">
                        <div class="result-title">
                          ✅ Diagnose: ${this._currentNode.diagnosis.deviceName}
                        </div>
                        <p style="margin: 0 0 8px 0; font-size: 0.9rem;">
                          <strong>Identifizierter Defekt:</strong><br />
                          ${this._currentNode.diagnosis.identifiedDefect}
                        </p>
                        <p style="margin: 0 0 12px 0; font-size: 0.85rem; color: var(--text-secondary);">
                          <strong>Handlungsempfehlung:</strong><br />
                          ${this._currentNode.diagnosis.recommendation}
                        </p>

                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                          <vaadin-button
                            theme="primary success"
                            @click="${() =>
                              this._applyDiagnosisToWizard(this._currentNode!.diagnosis!)}"
                          >
                            📋 Ergebnis in Ticket übernehmen
                          </vaadin-button>
                          <vaadin-button theme="secondary" @click="${this._reset}">
                            🔄 Neue Diagnose
                          </vaadin-button>
                        </div>
                      </div>
                    `
                  : html`
                      <!-- Question Node -->
                      <div class="question-box">
                        <div class="question-title">❓ ${this._currentNode.question}</div>
                        ${this._currentNode.safetyHint
                          ? html`<div class="safety-hint">${this._currentNode.safetyHint}</div>`
                          : ""}
                        <div class="options-grid">
                          ${this._currentNode.options.map(
                            (opt) => html`
                              <button
                                class="option-btn"
                                @click="${() =>
                                  this._selectOption(opt.id, opt.label, opt.nextNodeId)}"
                              >
                                <span>${opt.label}</span>
                                <span>➔</span>
                              </button>
                            `
                          )}
                        </div>
                      </div>
                    `
                : html`<p>Knoten nicht gefunden.</p>`}
            `}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ec-trouble-tree": EcTroubleTree;
  }
}

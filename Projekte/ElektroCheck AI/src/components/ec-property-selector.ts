import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import "@vaadin/button";
import "@vaadin/text-field";
import { PropertyManager, type ClientCustomer } from "../utils/property-manager";
import { showToast } from "../utils/toast";

@customElement("ec-property-selector")
export class EcPropertySelector extends LitElement {
  @state() private _customers: ClientCustomer[] = [];
  @state() private _selectedCustomerId: string = "";
  @state() private _selectedPropertyId: string = "";
  @state() private _selectedBoardId: string = "";

  @state() private _isAddingCustomer: boolean = false;
  @state() private _newCustomerName: string = "";
  @state() private _newCustomerContact: string = "";
  @state() private _newCustomerEmail: string = "";

  @state() private _isAddingProperty: boolean = false;
  @state() private _newPropertyName: string = "";
  @state() private _newPropertyAddress: string = "";

  @state() private _isAddingBoard: boolean = false;
  @state() private _newBoardName: string = "";
  @state() private _newBoardLocation: string = "";

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }
    .manager-card {
      background: var(--bg-card, #ffffff);
      border: 1px solid var(--border, #cbd5e1);
      border-radius: var(--radius-m, 12px);
      padding: 1.25rem;
      margin-bottom: 1.25rem;
      text-align: left;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    h4 {
      margin: 0;
      color: var(--primary, #0284c7);
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin-bottom: 1rem;
    }
    .select-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .select-group label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary, #64748b);
    }
    select, input {
      background: var(--bg-app, #f8fafc);
      color: var(--text-primary, #0f172a);
      border: 1px solid var(--border, #cbd5e1);
      padding: 8px 10px;
      border-radius: 6px;
      font-size: 0.85rem;
      width: 100%;
      box-sizing: border-box;
    }
    .add-row {
      display: flex;
      gap: 6px;
      margin-top: 4px;
    }
    .active-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.82rem;
      background: rgba(2, 132, 199, 0.08);
      color: var(--primary, #0284c7);
      padding: 6px 12px;
      border-radius: 6px;
      border: 1px solid rgba(2, 132, 199, 0.25);
    }
    .inline-form {
      background: var(--bg-app, #f8fafc);
      padding: 10px;
      border-radius: 6px;
      margin-top: 8px;
      border: 1px dashed var(--border, #cbd5e1);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._loadData();
  }

  private _loadData() {
    this._customers = PropertyManager.getAllCustomers();
    if (this._customers.length > 0 && !this._selectedCustomerId) {
      this._selectedCustomerId = this._customers[0].id;
      if (this._customers[0].properties.length > 0) {
        this._selectedPropertyId = this._customers[0].properties[0].id;
        if (this._customers[0].properties[0].distributionBoards.length > 0) {
          this._selectedBoardId = this._customers[0].properties[0].distributionBoards[0].id;
        }
      }
      this._notifySelection();
    }
  }

  private _notifySelection() {
    const cust = this._customers.find(c => c.id === this._selectedCustomerId);
    const prop = cust?.properties.find(p => p.id === this._selectedPropertyId);
    const board = prop?.distributionBoards.find(b => b.id === this._selectedBoardId);

    this.dispatchEvent(new CustomEvent("property-selected", {
      detail: {
        customer: cust,
        property: prop,
        distributionBoard: board,
        displayLocation: prop ? `${cust?.name || ''} – ${prop.name} (${prop.address})` : '',
        boardName: board?.name || ''
      },
      bubbles: true,
      composed: true
    }));
  }

  private _handleCustomerChange(e: Event) {
    this._selectedCustomerId = (e.target as HTMLSelectElement).value;
    const cust = this._customers.find(c => c.id === this._selectedCustomerId);
    this._selectedPropertyId = cust?.properties[0]?.id || "";
    this._selectedBoardId = cust?.properties[0]?.distributionBoards[0]?.id || "";
    this._notifySelection();
  }

  private _handlePropertyChange(e: Event) {
    this._selectedPropertyId = (e.target as HTMLSelectElement).value;
    const cust = this._customers.find(c => c.id === this._selectedCustomerId);
    const prop = cust?.properties.find(p => p.id === this._selectedPropertyId);
    this._selectedBoardId = prop?.distributionBoards[0]?.id || "";
    this._notifySelection();
  }

  private _handleBoardChange(e: Event) {
    this._selectedBoardId = (e.target as HTMLSelectElement).value;
    this._notifySelection();
  }

  private _saveNewCustomer() {
    if (!this._newCustomerName.trim()) {
      showToast("Kundenname erforderlich", "warning");
      return;
    }
    const created = PropertyManager.addCustomer({
      name: this._newCustomerName.trim(),
      contactPerson: this._newCustomerContact.trim() || undefined,
      email: this._newCustomerEmail.trim() || undefined,
    });
    this._customers = PropertyManager.getAllCustomers();
    this._selectedCustomerId = created.id;
    this._selectedPropertyId = "";
    this._selectedBoardId = "";
    this._isAddingCustomer = false;
    this._newCustomerName = "";
    this._newCustomerContact = "";
    this._newCustomerEmail = "";
    showToast(`Kunde "${created.name}" angelegt!`, "success");
    this._notifySelection();
  }

  private _saveNewProperty() {
    if (!this._selectedCustomerId) {
      showToast("Bitte zuerst einen Kunden wählen", "warning");
      return;
    }
    if (!this._newPropertyName.trim()) {
      showToast("Gebäudename erforderlich", "warning");
      return;
    }
    const created = PropertyManager.addProperty(this._selectedCustomerId, {
      name: this._newPropertyName.trim(),
      address: this._newPropertyAddress.trim() || "Keine Adresse angegeben",
    });
    if (created) {
      this._customers = PropertyManager.getAllCustomers();
      this._selectedPropertyId = created.id;
      this._selectedBoardId = "";
      this._isAddingProperty = false;
      this._newPropertyName = "";
      this._newPropertyAddress = "";
      showToast(`Liegenschaft "${created.name}" hinzugefügt!`, "success");
      this._notifySelection();
    }
  }

  private _saveNewBoard() {
    if (!this._selectedCustomerId || !this._selectedPropertyId) {
      showToast("Bitte zuerst Kunde und Gebäude wählen", "warning");
      return;
    }
    if (!this._newBoardName.trim()) {
      showToast("Verteilerbezeichnung erforderlich", "warning");
      return;
    }
    const created = PropertyManager.addDistributionBoard(this._selectedCustomerId, this._selectedPropertyId, {
      name: this._newBoardName.trim(),
      location: this._newBoardLocation.trim() || "Standort n.a.",
    });
    if (created) {
      this._customers = PropertyManager.getAllCustomers();
      this._selectedBoardId = created.id;
      this._isAddingBoard = false;
      this._newBoardName = "";
      this._newBoardLocation = "";
      showToast(`Verteilung "${created.name}" hinzugefügt!`, "success");
      this._notifySelection();
    }
  }

  render() {
    const currentCust = this._customers.find(c => c.id === this._selectedCustomerId);
    const properties = currentCust?.properties || [];
    const currentProp = properties.find(p => p.id === this._selectedPropertyId);
    const boards = currentProp?.distributionBoards || [];
    const currentBoard = boards.find(b => b.id === this._selectedBoardId);

    return html`
      <div class="manager-card">
        <div class="header">
          <h4>🏢 Liegenschafts- & Kundenhierarchie (Prüfort)</h4>
          <span style="font-size: 0.75rem; color: var(--text-secondary);">DIN VDE 0100-600 / DGUV V3</span>
        </div>

        <div class="grid">
          <!-- Kunde -->
          <div class="select-group">
            <label>1. Kunde / Auftraggeber:</label>
            <select aria-label="Kunde" .value="${this._selectedCustomerId}" @change="${this._handleCustomerChange}">
              ${this._customers.map(c => html`<option value="${c.id}">${c.name}</option>`)}
            </select>
            <div class="add-row">
              <vaadin-button
                theme="tertiary small"
                @click="${() => this._isAddingCustomer = !this._isAddingCustomer}"
                style="font-size: 0.75rem; padding: 0;"
              >
                ${this._isAddingCustomer ? "✕ Abbrechen" : "+ Neuer Kunde"}
              </vaadin-button>
            </div>
          </div>

          <!-- Liegenschaft / Gebäude -->
          <div class="select-group">
            <label>2. Liegenschaft / Gebäude:</label>
            <select aria-label="Gebäude" .value="${this._selectedPropertyId}" @change="${this._handlePropertyChange}">
              ${properties.length === 0 ? html`<option value="">(Keine Liegenschaft angelegt)</option>` : ''}
              ${properties.map(p => html`<option value="${p.id}">${p.name}</option>`)}
            </select>
            <div class="add-row">
              <vaadin-button
                theme="tertiary small"
                ?disabled="${!this._selectedCustomerId}"
                @click="${() => this._isAddingProperty = !this._isAddingProperty}"
                style="font-size: 0.75rem; padding: 0;"
              >
                ${this._isAddingProperty ? "✕ Abbrechen" : "+ Neues Gebäude"}
              </vaadin-button>
            </div>
          </div>

          <!-- Unterverteiler -->
          <div class="select-group">
            <label>3. Verteiler / Prüfstation:</label>
            <select aria-label="Verteilung" .value="${this._selectedBoardId}" @change="${this._handleBoardChange}">
              ${boards.length === 0 ? html`<option value="">(Kein Verteiler angelegt)</option>` : ''}
              ${boards.map(b => html`<option value="${b.id}">${b.name} (${b.location})</option>`)}
            </select>
            <div class="add-row">
              <vaadin-button
                theme="tertiary small"
                ?disabled="${!this._selectedPropertyId}"
                @click="${() => this._isAddingBoard = !this._isAddingBoard}"
                style="font-size: 0.75rem; padding: 0;"
              >
                ${this._isAddingBoard ? "✕ Abbrechen" : "+ Neue Verteilung"}
              </vaadin-button>
            </div>
          </div>
        </div>

        <!-- Inline-Erstellungsformulare -->
        ${this._isAddingCustomer ? html`
          <div class="inline-form">
            <strong>Neuen Kunden anlegen:</strong>
            <input
              aria-label="Firmen- oder Kundenname (z.B. Schmidt Elektrotechnik)"
              type="text"
              placeholder="Firmen- oder Kundenname (z.B. Schmidt Elektrotechnik)"
              .value="${this._newCustomerName}"
              @input="${(e: Event) => this._newCustomerName = (e.target as HTMLInputElement).value}"
            />
            <input
              aria-label="Ansprechpartner (optional)"
              type="text"
              placeholder="Ansprechpartner (optional)"
              .value="${this._newCustomerContact}"
              @input="${(e: Event) => this._newCustomerContact = (e.target as HTMLInputElement).value}"
            />
            <input
              aria-label="E-Mail für Prüfbericht-Versand (optional)"
              type="email"
              placeholder="E-Mail für Prüfbericht-Versand (optional)"
              .value="${this._newCustomerEmail}"
              @input="${(e: Event) => this._newCustomerEmail = (e.target as HTMLInputElement).value}"
            />
            <vaadin-button theme="primary small" @click="${this._saveNewCustomer}">Kunde speichern</vaadin-button>
          </div>
        ` : ''}

        ${this._isAddingProperty ? html`
          <div class="inline-form">
            <strong>Neue Liegenschaft für ${currentCust?.name || 'Kunde'} hinzufügen:</strong>
            <input
              aria-label="Gebäude / Liegenschaftsname (z.B. Produktionshalle 3)"
              type="text"
              placeholder="Gebäude / Liegenschaftsname (z.B. Produktionshalle 3)"
              .value="${this._newPropertyName}"
              @input="${(e: Event) => this._newPropertyName = (e.target as HTMLInputElement).value}"
            />
            <input
              aria-label="Adresse / Standort (z.B. Industrieweg 10, 70173 Stuttgart)"
              type="text"
              placeholder="Adresse / Standort (z.B. Industrieweg 10, 70173 Stuttgart)"
              .value="${this._newPropertyAddress}"
              @input="${(e: Event) => this._newPropertyAddress = (e.target as HTMLInputElement).value}"
            />
            <vaadin-button theme="primary small" @click="${this._saveNewProperty}">Gebäude speichern</vaadin-button>
          </div>
        ` : ''}

        ${this._isAddingBoard ? html`
          <div class="inline-form">
            <strong>Neuen Verteiler für ${currentProp?.name || 'Gebäude'} anlegen:</strong>
            <input
              aria-label="Bezeichnung (z.B. Unterverteilung UV-OG2)"
              type="text"
              placeholder="Bezeichnung (z.B. Unterverteilung UV-OG2)"
              .value="${this._newBoardName}"
              @input="${(e: Event) => this._newBoardName = (e.target as HTMLInputElement).value}"
            />
            <input
              aria-label="Raum / Standort (z.B. Technikraum 2.04)"
              type="text"
              placeholder="Raum / Standort (z.B. Technikraum 2.04)"
              .value="${this._newBoardLocation}"
              @input="${(e: Event) => this._newBoardLocation = (e.target as HTMLInputElement).value}"
            />
            <vaadin-button theme="primary small" @click="${this._saveNewBoard}">Verteilung speichern</vaadin-button>
          </div>
        ` : ''}

        <!-- Aktuell gewählter Prüfort -->
        ${currentCust && currentProp ? html`
          <div class="active-badge mt-1">
            📍 <strong>Ausgewählter Prüfort:</strong> ${currentCust.name} &gt; ${currentProp.name} ${currentBoard ? `&gt; ${currentBoard.name}` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ec-property-selector": EcPropertySelector;
  }
}

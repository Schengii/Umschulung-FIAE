export interface DistributionBoard {
  id: string;
  name: string; // z.B. UV-01 EG
  location: string; // z.B. Flur Ost
}

export interface BuildingProperty {
  id: string;
  name: string; // z.B. Hauptverwaltung, Werk 2
  address: string; // z.B. Industriestr. 12, 80331 München
  distributionBoards: DistributionBoard[];
}

export interface ClientCustomer {
  id: string;
  name: string; // z.B. Siemens AG, Bäckerei Müller
  contactPerson?: string;
  email?: string;
  phone?: string;
  properties: BuildingProperty[];
}

/** Eindeutige ID (Date.now() allein kollidiert bei mehreren Anlagen in derselben Millisekunde). */
const newId = (prefix: string): string => {
  // randomUUID gibt es nur in sicheren Kontexten (HTTPS/localhost), nicht bei http://192.168.x.x im LAN
  const unique = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${unique}`;
};

const STORAGE_KEY = 'electrocheck_customers_v1';

export class PropertyManager {
  private static _getStorage(): ClientCustomer[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private static _saveStorage(customers: ClientCustomer[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    } catch (e) {
      console.warn('Fehler beim Speichern der Kundenstruktur:', e);
    }
  }

  static getAllCustomers(): ClientCustomer[] {
    const list = this._getStorage();
    if (list.length === 0) {
      // Demo-Initialisierung für sofortigen Nutzen in der Praxis
      const demo: ClientCustomer[] = [
        {
          id: 'cust-1',
          name: 'Musterbetrieb GmbH',
          contactPerson: 'Herr Schulz (Betriebsleiter)',
          email: 'schulz@musterbetrieb.de',
          properties: [
            {
              id: 'prop-1',
              name: 'Hauptgebäude',
              address: 'Gewerbepark 4, 10115 Berlin',
              distributionBoards: [
                { id: 'board-1', name: 'Hauptverteilung HV-01', location: 'UG Technikraum' },
                { id: 'board-2', name: 'Unterverteilung UV-EG', location: 'EG Flur' }
              ]
            }
          ]
        }
      ];
      this._saveStorage(demo);
      return demo;
    }
    return list;
  }

  static addCustomer(customer: Omit<ClientCustomer, 'id' | 'properties'>): ClientCustomer {
    const list = this.getAllCustomers();
    const newCustomer: ClientCustomer = {
      ...customer,
      id: newId('cust'),
      properties: []
    };
    list.push(newCustomer);
    this._saveStorage(list);
    return newCustomer;
  }

  static addProperty(customerId: string, property: Omit<BuildingProperty, 'id' | 'distributionBoards'>): BuildingProperty | null {
    const list = this.getAllCustomers();
    const cust = list.find(c => c.id === customerId);
    if (!cust) return null;

    const newProp: BuildingProperty = {
      ...property,
      id: newId('prop'),
      distributionBoards: []
    };
    cust.properties.push(newProp);
    this._saveStorage(list);
    return newProp;
  }

  static addDistributionBoard(customerId: string, propertyId: string, board: Omit<DistributionBoard, 'id'>): DistributionBoard | null {
    const list = this.getAllCustomers();
    const cust = list.find(c => c.id === customerId);
    if (!cust) return null;
    const prop = cust.properties.find(p => p.id === propertyId);
    if (!prop) return null;

    const newBoard: DistributionBoard = {
      ...board,
      id: newId('board')
    };
    prop.distributionBoards.push(newBoard);
    this._saveStorage(list);
    return newBoard;
  }
}

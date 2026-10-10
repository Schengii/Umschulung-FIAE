// @ts-check
/**
 * Clean Architecture & Hexagonal Ports/Adapters Linter Engine
 * Modelliert Schichten, Abhängigkeitsregeln (Dependency Inversion Rule nach Robert C. Martin),
 * Ports (Inbound/Outbound Interfaces) und Adapter (REST, Database, Message Queue).
 */

/**
 * @typedef {'entities' | 'use_cases' | 'adapters' | 'frameworks'} ArchLayer
 * 
 * @typedef {Object} ArchComponent
 * @property {string} id
 * @property {string} name
 * @property {ArchLayer} layer
 * @property {string} [role]
 * @property {string} description
 */

export const ARCH_LAYERS = {
  entities: {
    id: 'entities',
    level: 1, // Innere Schicht (Kern)
    name: '1. Entities (Enterprise Business Rules)',
    color: '#eab308',
    bg: 'rgba(234, 179, 8, 0.1)',
    description: 'Kapseln allgemeine Geschäftsregeln, Domänenmodelle und Invarianten. Frei von externen Abhängigkeiten.'
  },
  use_cases: {
    id: 'use_cases',
    level: 2,
    name: '2. Use Cases (Application Business Rules)',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    description: 'Steuern den Datenfluss zwischen Entitäten und definieren Ports (Eingabe-/Ausgabe-Schnittstellen).'
  },
  adapters: {
    id: 'adapters',
    level: 3,
    name: '3. Interface Adapters (Controllers, Gateways, Presenters)',
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.1)',
    description: 'Wandeln Daten aus UI/DB in das Use-Case-Format um (DTOs, Mappings, Repositories).'
  },
  frameworks: {
    id: 'frameworks',
    level: 4, // Äußere Schicht
    name: '4. Frameworks & Drivers (DB, Web, Devices, External APIs)',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.1)',
    description: 'Konkrete Technologien: Express/React, PostgreSQL Driver, AWS SDK, Kafka Client.'
  }
};

/** @type {ArchComponent[]} */
export const DEFAULT_COMPONENTS = [
  { id: 'comp-entity-order', name: 'Order Entity', layer: 'entities', description: 'Reines Domänenmodell mit Preisberechnung und Status-Prüfung' },
  { id: 'comp-entity-user', name: 'User Entity', layer: 'entities', description: 'Benutzerdaten und Validierungslogik' },
  { id: 'comp-usecase-create-order', name: 'CreateOrderUseCase', layer: 'use_cases', description: 'Orchestriert Bestellerstellung, ruft PaymentPort und OrderRepoPort auf' },
  { id: 'comp-port-repo', name: 'OrderRepositoryPort (Interface)', layer: 'use_cases', description: 'Abstrakte Schnittstelle: saveOrder(order): Promise<void>' },
  { id: 'comp-port-payment', name: 'PaymentGatewayPort (Interface)', layer: 'use_cases', description: 'Abstrakte Schnittstelle: charge(amount): Promise<boolean>' },
  { id: 'comp-adapter-rest', name: 'OrderRestController', layer: 'adapters', description: 'Nimmt HTTP POST JSON entgegen, mappt auf CreateOrderCommand' },
  { id: 'comp-adapter-repo-impl', name: 'PostgresOrderRepository', layer: 'adapters', description: 'Implementiert OrderRepositoryPort via SQL Queries' },
  { id: 'comp-driver-pg', name: 'pg / TypeORM Connection Pool', layer: 'frameworks', description: 'PostgreSQL TCP Client Treiber' },
  { id: 'comp-driver-express', name: 'Express.js Web Server', layer: 'frameworks', description: 'Node.js HTTP Routing Framework' }
];

/**
 * Überprüft, ob eine Abhängigkeit von Quelle nach Ziel die Dependency Rule verletzt
 * Regel: Abhängigkeiten dürfen NUR von außen nach innen zeigen (höheres Level -> niedrigeres Level oder gleiches Level).
 * @param {ArchLayer} sourceLayer - Wo der Aufruf startet (import ...)
 * @param {ArchLayer} targetLayer - Was importiert/aufgerufen wird
 * @returns {{ isValid: boolean, reason: string }}
 */
export function validateDependency(sourceLayer, targetLayer) {
  const sourceLevel = ARCH_LAYERS[sourceLayer].level;
  const targetLevel = ARCH_LAYERS[targetLayer].level;

  if (sourceLevel < targetLevel) {
    return {
      isValid: false,
      reason: `Verletzung der Dependency Rule! Schicht "${ARCH_LAYERS[sourceLayer].name}" (Level ${sourceLevel}) darf nicht von der äußeren Schicht "${ARCH_LAYERS[targetLayer].name}" (Level ${targetLevel}) abhängen. Nutze Dependency Inversion (Ports & Adapters)!`
    };
  }

  return {
    isValid: true,
    reason: `Gültig: Abhängigkeit zeigt nach innen (${sourceLevel} -> ${targetLevel}).`
  };
}

/**
 * Validiert eine Liste von Abhängigkeiten im Projekt
 * @param {Array<{ fromId: string, toId: string }>} connections
 * @param {ArchComponent[]} components
 */
export function auditArchitecture(connections, components = DEFAULT_COMPONENTS) {
  const compMap = new Map(components.map(c => [c.id, c]));
  /** @type {Array<{ from: ArchComponent, to: ArchComponent, isValid: boolean, reason: string }>} */
  const violations = [];
  /** @type {Array<{ from: ArchComponent, to: ArchComponent, isValid: boolean, reason: string }>} */
  const validConnections = [];

  connections.forEach(conn => {
    const fromComp = compMap.get(conn.fromId);
    const toComp = compMap.get(conn.toId);

    if (!fromComp || !toComp) return;

    const check = validateDependency(fromComp.layer, toComp.layer);
    const item = {
      from: fromComp,
      to: toComp,
      isValid: check.isValid,
      reason: check.reason
    };

    if (!check.isValid) {
      violations.push(item);
    } else {
      validConnections.push(item);
    }
  });

  const total = connections.length;
  const complianceScore = total > 0 ? Math.round(((total - violations.length) / total) * 100) : 100;

  return {
    total,
    violationsCount: violations.length,
    validCount: validConnections.length,
    complianceScore,
    isClean: violations.length === 0,
    violations,
    validConnections
  };
}

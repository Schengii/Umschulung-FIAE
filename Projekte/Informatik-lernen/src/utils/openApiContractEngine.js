/**
 * OpenAPI 3.1 & JSON-Schema Contract Testing Engine
 * Validates REST API payloads against JSON Schema 2020-12 / OpenAPI 3.1 specifications,
 * detects breaking changes between API versions, and generates test mocks & TypeScript interfaces.
 */

/**
 * Standard OpenAPI 3.1 Spezifikation (v1.0.0)
 */
export const SAMPLE_OPENAPI_SPEC_V1 = {
  openapi: '3.1.0',
  info: {
    title: 'Customer Order & Payment API',
    version: '1.0.0'
  },
  paths: {
    '/api/v1/orders': {
      post: {
        summary: 'Erstellt eine neue Kundenbestellung',
        requestBody: {
          required: true,
          schema: {
            type: 'object',
            required: ['customerId', 'amount', 'currency', 'items'],
            properties: {
              customerId: { type: 'string', minLength: 3 },
              amount: { type: 'number', minimum: 0.01 },
              currency: { type: 'string', enum: ['EUR', 'USD', 'CHF'] },
              items: {
                type: 'array',
                minItems: 1
              },
              emailNotification: { type: 'boolean' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Bestellung erfolgreich angelegt',
            schema: {
              type: 'object',
              required: ['orderId', 'status', 'totalPrice'],
              properties: {
                orderId: { type: 'string' },
                status: { type: 'string', enum: ['PENDING', 'PAID', 'SHIPPED'] },
                totalPrice: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }
};

/**
 * Validiert ein JavaScript/JSON-Objekt gegen ein JSON-Schema
 * @param {any} data - Zu testendes Objekt
 * @param {Object} schema - JSON-Schema / OpenAPI Schema Object
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validatePayloadAgainstSchema(data, schema) {
  const errors = [];

  if (!schema) return { valid: true, errors: [] };

  // 1. Root Type Check
  if (schema.type === 'object') {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      errors.push({ field: 'root', rule: 'type', message: `Erwartet 'object', erhalten '${Array.isArray(data) ? 'array' : typeof data}'` });
      return { valid: false, errors };
    }

    // Required fields
    if (Array.isArray(schema.required)) {
      schema.required.forEach(field => {
        if (data[field] === undefined || data[field] === null || data[field] === '') {
          errors.push({ field, rule: 'required', message: `Pflichtfeld '${field}' fehlt oder ist leer.` });
        }
      });
    }

    // Properties check
    if (schema.properties) {
      Object.keys(schema.properties).forEach(key => {
        const propValue = data[key];
        const propSchema = schema.properties[key];

        if (propValue !== undefined && propValue !== null) {
          // Type checks
          if (propSchema.type === 'string') {
            if (typeof propValue !== 'string') {
              errors.push({ field: key, rule: 'type', message: `Feld '${key}' muss vom Typ 'string' sein.` });
            } else {
              if (propSchema.minLength && propValue.length < propSchema.minLength) {
                errors.push({ field: key, rule: 'minLength', message: `Feld '${key}' unterschreitet Mindestlänge von ${propSchema.minLength}.` });
              }
              if (propSchema.format === 'email' && !propValue.includes('@')) {
                errors.push({ field: key, rule: 'format', message: `Feld '${key}' ist keine gültige E-Mail-Adresse.` });
              }
            }
          } else if (propSchema.type === 'number') {
            if (typeof propValue !== 'number' || isNaN(propValue)) {
              errors.push({ field: key, rule: 'type', message: `Feld '${key}' muss eine Zahl ('number') sein.` });
            } else {
              if (propSchema.minimum !== undefined && propValue < propSchema.minimum) {
                errors.push({ field: key, rule: 'minimum', message: `Feld '${key}' muss mindestens ${propSchema.minimum} betragen.` });
              }
            }
          } else if (propSchema.type === 'boolean') {
            if (typeof propValue !== 'boolean') {
              errors.push({ field: key, rule: 'type', message: `Feld '${key}' muss ein Boolean ('true'/'false') sein.` });
            }
          } else if (propSchema.type === 'array') {
            if (!Array.isArray(propValue)) {
              errors.push({ field: key, rule: 'type', message: `Feld '${key}' muss ein Array sein.` });
            } else if (propSchema.minItems && propValue.length < propSchema.minItems) {
              errors.push({ field: key, rule: 'minItems', message: `Feld '${key}' muss mindestens ${propSchema.minItems} Einträge enthalten.` });
            }
          }

          // Enum check
          if (Array.isArray(propSchema.enum) && !propSchema.enum.includes(propValue)) {
            errors.push({ field: key, rule: 'enum', message: `Feld '${key}' hat den unzulässigen Wert '${propValue}'. Erlaubt: [${propSchema.enum.join(', ')}]` });
          }
        }
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Analysiert zwei OpenAPI Spezifikationen auf Breaking Changes (Rückwärtsinkompatibilitäten)
 */
export function detectContractBreakingChanges(specOld, specNew) {
  const changes = [];

  const oldPaths = specOld?.paths || {};
  const newPaths = specNew?.paths || {};

  // 1. Gelöschte Pfade
  Object.keys(oldPaths).forEach(path => {
    if (!newPaths[path]) {
      changes.push({
        type: 'BREAKING',
        location: path,
        description: `API-Endpunkt '${path}' wurde komplett entfernt.`
      });
    }
  });

  // 2. Pfad-Untersuchung
  Object.keys(newPaths).forEach(path => {
    if (!oldPaths[path]) {
      changes.push({
        type: 'NON_BREAKING',
        location: path,
        description: `Neuer API-Endpunkt '${path}' hinzugefügt.`
      });
      return;
    }

    const oldMethods = oldPaths[path];
    const newMethods = newPaths[path];

    // Gelöschte Methoden
    Object.keys(oldMethods).forEach(method => {
      if (!newMethods[method]) {
        changes.push({
          type: 'BREAKING',
          location: `${method.toUpperCase()} ${path}`,
          description: `HTTP-Methode '${method.toUpperCase()}' für '${path}' wurde entfernt.`
        });
      }
    });

    // Methoden-Vergleich
    Object.keys(newMethods).forEach(method => {
      if (!oldMethods[method]) {
        changes.push({
          type: 'NON_BREAKING',
          location: `${method.toUpperCase()} ${path}`,
          description: `Neue HTTP-Methode '${method.toUpperCase()}' für '${path}' hinzugefügt.`
        });
        return;
      }

      const oldReqSchema = oldMethods[method]?.requestBody?.schema;
      const newReqSchema = newMethods[method]?.requestBody?.schema;

      if (oldReqSchema && newReqSchema) {
        // Neu hinzugefügtes Pflichtfeld im RequestBody? -> BREAKING!
        const oldReqFields = oldReqSchema.required || [];
        const newReqFields = newReqSchema.required || [];
        newReqFields.forEach(field => {
          if (!oldReqFields.includes(field)) {
            changes.push({
              type: 'BREAKING',
              location: `${method.toUpperCase()} ${path} -> requestBody`,
              description: `Neues Pflichtfeld '${field}' im Request-Body erzwingt Client-Update.`
            });
          }
        });

        // Datentyp geändert? -> BREAKING!
        const oldProps = oldReqSchema.properties || {};
        const newProps = newReqSchema.properties || {};
        Object.keys(oldProps).forEach(prop => {
          if (newProps[prop] && oldProps[prop].type !== newProps[prop].type) {
            changes.push({
              type: 'BREAKING',
              location: `${method.toUpperCase()} ${path} -> ${prop}`,
              description: `Datentyp von Feld '${prop}' von '${oldProps[prop].type}' zu '${newProps[prop].type}' geändert.`
            });
          }
        });
      }

      // Response-Prüfung: Entferntes Feld aus Response? -> BREAKING!
      const oldResSchema = oldMethods[method]?.responses?.['201']?.schema || oldMethods[method]?.responses?.['200']?.schema;
      const newResSchema = newMethods[method]?.responses?.['201']?.schema || newMethods[method]?.responses?.['200']?.schema;

      if (oldResSchema?.properties && newResSchema?.properties) {
        Object.keys(oldResSchema.properties).forEach(prop => {
          if (!newResSchema.properties[prop]) {
            changes.push({
              type: 'BREAKING',
              location: `${method.toUpperCase()} ${path} -> response`,
              description: `Feld '${prop}' wurde aus der Response entfernt (bricht bestehende Client-Parser).`
            });
          }
        });

        // Neues optionales Response-Feld -> NON_BREAKING!
        Object.keys(newResSchema.properties).forEach(prop => {
          if (!oldResSchema.properties[prop]) {
            changes.push({
              type: 'NON_BREAKING',
              location: `${method.toUpperCase()} ${path} -> response`,
              description: `Neues Feld '${prop}' zur Response hinzugefügt.`
            });
          }
        });
      }
    });
  });

  const breakingCount = changes.filter(c => c.type === 'BREAKING').length;
  const nonBreakingCount = changes.filter(c => c.type === 'NON_BREAKING').length;

  return {
    isCompatible: breakingCount === 0,
    breakingCount,
    nonBreakingCount,
    changes
  };
}

/**
 * Generiert ein realistisches Test-Mock Objekt basierend auf einem Schema
 */
export function generateMockPayload(schema) {
  if (!schema || schema.type !== 'object') return {};

  const mock = {};
  const props = schema.properties || {};

  Object.keys(props).forEach(key => {
    const p = props[key];
    if (p.enum && p.enum.length > 0) {
      mock[key] = p.enum[0];
    } else if (p.type === 'string') {
      if (p.format === 'email') mock[key] = 'test.user@company.de';
      else if (key.toLowerCase().includes('id')) mock[key] = `ID-${Math.floor(1000 + Math.random() * 9000)}`;
      else mock[key] = `Sample ${key}`;
    } else if (p.type === 'number') {
      mock[key] = p.minimum ? p.minimum + 99.90 : 49.99;
    } else if (p.type === 'boolean') {
      mock[key] = true;
    } else if (p.type === 'array') {
      mock[key] = ['Item-A', 'Item-B'];
    }
  });

  return mock;
}

/**
 * Generiert ein TypeScript DTO Interface
 */
export function generateTypeScriptDto(interfaceName, schema) {
  if (!schema || schema.type !== 'object') return '';

  const required = schema.required || [];
  const props = schema.properties || {};

  const lines = [`export interface ${interfaceName} {`];

  Object.keys(props).forEach(key => {
    const p = props[key];
    const isReq = required.includes(key);
    let tsType = 'unknown';

    if (p.enum) {
      tsType = p.enum.map(val => `'${val}'`).join(' | ');
    } else if (p.type === 'string') {
      tsType = 'string';
    } else if (p.type === 'number') {
      tsType = 'number';
    } else if (p.type === 'boolean') {
      tsType = 'boolean';
    } else if (p.type === 'array') {
      tsType = 'string[]';
    }

    lines.push(`  ${key}${isReq ? '' : '?'}: ${tsType};`);
  });

  lines.push('}');
  return lines.join('\n');
}

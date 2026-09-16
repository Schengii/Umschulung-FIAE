import { describe, it, expect } from 'vitest';
import { 
  validatePayloadAgainstSchema, 
  detectContractBreakingChanges, 
  generateMockPayload, 
  generateTypeScriptDto,
  SAMPLE_OPENAPI_SPEC_V1 
} from './openApiContractEngine';

describe('openApiContractEngine', () => {
  const orderSchema = SAMPLE_OPENAPI_SPEC_V1.paths['/api/v1/orders'].post.requestBody.schema;

  it('validates a correct payload against OpenAPI JSON schema', () => {
    const validData = {
      customerId: 'CUST-1002',
      amount: 159.95,
      currency: 'EUR',
      items: ['Book A', 'Book B'],
      emailNotification: true
    };
    const result = validatePayloadAgainstSchema(validData, orderSchema);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('detects missing required fields and constraint violations in payload', () => {
    const invalidData = {
      customerId: 'AB', // minLength 3 violation
      amount: -10,      // minimum 0.01 violation
      currency: 'GBP'   // enum violation
      // items missing
    };
    const result = validatePayloadAgainstSchema(invalidData, orderSchema);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'customerId')).toBe(true);
    expect(result.errors.some(e => e.field === 'amount')).toBe(true);
    expect(result.errors.some(e => e.field === 'currency')).toBe(true);
    expect(result.errors.some(e => e.field === 'items')).toBe(true);
  });

  it('detects breaking changes when required properties are added to request', () => {
    const specV2Breaking = JSON.parse(JSON.stringify(SAMPLE_OPENAPI_SPEC_V1));
    // Add new required property to request
    specV2Breaking.paths['/api/v1/orders'].post.requestBody.schema.required.push('taxId');
    specV2Breaking.paths['/api/v1/orders'].post.requestBody.schema.properties.taxId = { type: 'string' };

    const diff = detectContractBreakingChanges(SAMPLE_OPENAPI_SPEC_V1, specV2Breaking);
    expect(diff.isCompatible).toBe(false);
    expect(diff.breakingCount).toBeGreaterThan(0);
    expect(diff.changes.some(c => c.type === 'BREAKING' && c.description.includes('taxId'))).toBe(true);
  });

  it('generates schema-compliant test mock and TypeScript interface', () => {
    const mock = generateMockPayload(orderSchema);
    expect(mock.customerId).toBeDefined();
    expect(mock.currency).toBe('EUR');
    expect(mock.amount).toBeGreaterThan(0);

    const tsDto = generateTypeScriptDto('CreateOrderDto', orderSchema);
    expect(tsDto).toContain('export interface CreateOrderDto');
    expect(tsDto).toContain('customerId: string;');
    expect(tsDto).toContain("currency: 'EUR' | 'USD' | 'CHF';");
  });
});

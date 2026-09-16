import { describe, it, expect } from 'vitest';
import { executeGraphQLQuery, SAMPLE_GRAPHQL_QUERIES } from './graphqlSandboxEngine';

describe('graphqlSandboxEngine', () => {
  it('führt GraphQL Product Query erfolgreich aus und liefert korrekte Felder', () => {
    const res = executeGraphQLQuery(SAMPLE_GRAPHQL_QUERIES[0].query);

    expect(res.success).toBe(true);
    expect(res.data.products).toBeDefined();
    expect(res.data.products.length).toBe(4);
    expect(res.data.products[0].title).toBe('Entwickler-Tastatur RGB');
    expect(res.ast.definitions[0].selectionSet[0].name).toBe('products');
  });

  it('gibt Fehlermeldung bei ungültigem Query zurück', () => {
    const res = executeGraphQLQuery('query { unknownEntity { id } }');
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });
});

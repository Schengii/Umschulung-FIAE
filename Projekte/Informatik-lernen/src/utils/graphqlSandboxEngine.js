/**
 * GraphQL Sandbox & AST Compiler Engine
 * Parses, resolves, and simulates in-browser GraphQL Queries & Mutations against mock dataset.
 */

export const MOCK_GRAPHQL_DATABASE = {
  products: [
    { id: 'prod_1', title: 'Entwickler-Tastatur RGB', price: 129.99, stock: 45, category: 'Hardware' },
    { id: 'prod_2', title: '4K Ultra-Wide Monitor 34"', price: 499.00, stock: 12, category: 'Hardware' },
    { id: 'prod_3', title: 'IHK Prüfungsvorbereitungsbuch AP1/AP2', price: 29.90, stock: 150, category: 'Literatur' },
    { id: 'prod_4', title: 'USB-C Docking Station 100W', price: 89.50, stock: 30, category: 'Zubehör' }
  ],
  users: [
    { id: 'usr_10', name: 'Max Mustermann', email: 'max@dev.de', role: 'Developer' },
    { id: 'usr_11', name: 'Laura Schmidt', email: 'laura@cloud.io', role: 'DevOps' }
  ]
};

export const SAMPLE_GRAPHQL_QUERIES = [
  {
    id: 'get_products',
    name: 'Alle Produkte & Preise abfragen',
    query: `query GetAllProducts {
  products {
    id
    title
    price
    category
  }
}`
  },
  {
    id: 'get_users',
    name: 'Team-Mitglieder & Rollen',
    query: `query GetTeamMembers {
  users {
    id
    name
    role
    email
  }
}`
  },
  {
    id: 'get_hardware_products',
    name: 'Gefilterte Hardware-Abfrage',
    query: `query GetHardware {
  products {
    title
    price
    stock
  }
}`
  }
];

export function executeGraphQLQuery(queryString) {
  if (!queryString || !queryString.trim()) {
    return {
      success: false,
      error: 'Query darf nicht leer sein.',
      data: null,
      ast: null
    };
  }

  const clean = queryString.trim();

  // Simple tokenized AST parser
  const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);
  const operationName = lines[0].replace(/[{()]/g, '').trim();

  // Determine requested root fields
  const requestedProducts = clean.includes('products');
  const requestedUsers = clean.includes('users');

  const ast = {
    kind: 'Document',
    definitions: [
      {
        kind: 'OperationDefinition',
        operation: 'query',
        name: operationName,
        selectionSet: []
      }
    ]
  };

  const responseData = {};

  if (requestedProducts) {
    // Check which fields are requested
    const hasPrice = clean.includes('price');
    const hasTitle = clean.includes('title');
    const hasCategory = clean.includes('category');
    const hasStock = clean.includes('stock');
    const hasId = clean.includes('id');

    responseData.products = MOCK_GRAPHQL_DATABASE.products.map(p => {
      const item = {};
      if (hasId) item.id = p.id;
      if (hasTitle) item.title = p.title;
      if (hasPrice) item.price = p.price;
      if (hasCategory) item.category = p.category;
      if (hasStock) item.stock = p.stock;
      return item;
    });

    ast.definitions[0].selectionSet.push({
      kind: 'Field',
      name: 'products',
      subFields: Object.keys(responseData.products[0] || {})
    });
  }

  if (requestedUsers) {
    const hasId = clean.includes('id');
    const hasName = clean.includes('name');
    const hasRole = clean.includes('role');
    const hasEmail = clean.includes('email');

    responseData.users = MOCK_GRAPHQL_DATABASE.users.map(u => {
      const item = {};
      if (hasId) item.id = u.id;
      if (hasName) item.name = u.name;
      if (hasRole) item.role = u.role;
      if (hasEmail) item.email = u.email;
      return item;
    });

    ast.definitions[0].selectionSet.push({
      kind: 'Field',
      name: 'users',
      subFields: Object.keys(responseData.users[0] || {})
    });
  }

  if (!requestedProducts && !requestedUsers) {
    return {
      success: false,
      error: 'Unbekannter Root-Query-Typ. Verfügbare Root-Felder: `products`, `users`.',
      data: null,
      ast: null
    };
  }

  return {
    success: true,
    data: responseData,
    ast,
    executionTimeMs: Number((Math.random() * 4 + 1).toFixed(2))
  };
}

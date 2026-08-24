export const API_STUDIO_ENDPOINTS = [
  {
    id: 'rest',
    type: 'REST API',
    method: 'GET',
    url: 'https://api.devgame.it/v1/users/42',
    responseBody: `{
  "id": 42,
  "username": "developer_pro",
  "email": "dev@example.com",
  "xp": 1420,
  "level": 12,
  "unlockedBadges": ["first_steps", "sql_master", "pwa_hero"]
}`
  },
  {
    id: 'graphql',
    type: 'GraphQL API',
    method: 'POST',
    url: 'https://api.devgame.it/graphql',
    query: `query GetUser {
  user(id: 42) {
    username
    xp
    level
  }
}`,
    responseBody: `{
  "data": {
    "user": {
      "username": "developer_pro",
      "xp": 1420,
      "level": 12
    }
  }
}`
  }
];

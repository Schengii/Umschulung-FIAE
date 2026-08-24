export const DOCKER_MODULES = [
  {
    id: 'dockerfile',
    title: '1. Dockerfile Erstellung',
    desc: 'Lerne wie man ein sauberes Multi-Stage Dockerfile für Node.js oder React-Anwendungen schreibt.',
    snippet: `FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`
  },
  {
    id: 'compose',
    title: '2. Docker Compose (Multi-Container)',
    desc: 'Orchestriere mehrere Container (Frontend, Node.js API, PostgreSQL) mit einer einzigen docker-compose.yml Datei.',
    snippet: `version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=db
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secretpassword
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:`
  },
  {
    id: 'networking',
    title: '3. Docker Netzwerke (Bridge, Host, Overlay)',
    desc: 'Container-Kommunikation über isolierte User-Defined Bridge-Netzwerke mit automatischer DNS-Namensauflösung.',
    snippet: `# Erstelle isoliertes Netzwerk
docker network create my-app-net

# Starte Container im Netzwerk
docker run -d --name backend --network my-app-net backend-image:latest
docker run -d --name frontend --network my-app-net -p 80:80 frontend-image:latest

# Der Frontend-Container kann den Backend-Container direkt per Namen 'http://backend:8080' erreichen!`
  },
  {
    id: 'security',
    title: '4. Docker Security & Non-Root User',
    desc: 'Best Practices: Führe Container niemals als root-User aus, nutze Alpine-Images und minimiere Angriffsflächen.',
    snippet: `FROM node:20-alpine
# Gruppe und unprivilegierten Nutzer anlegen
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --chown=appuser:appgroup . .
# Zum sicheren Nutzer wechseln
USER appuser
EXPOSE 3000
CMD ["node", "server.js"]`
  }
];

# Build-Kontext ist das Repo-Root (siehe docker-compose.yml), weil der Express-Adapter
# die Vercel-Functions aus /api importiert.
FROM node:22-alpine

WORKDIR /app

# Abhängigkeiten der Vercel-Functions (/api) – bewusst ohne das komplette Frontend-package.json
RUN printf '{"name":"electrocheck-api","private":true,"type":"module","dependencies":{"@google/genai":"^2.28.0","@upstash/redis":"^1.39.0","ajv":"^8.12.0"}}' > package.json \
  && npm install --omit=dev --ignore-scripts

# Abhängigkeiten des Express-Adapters
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

COPY api ./api
COPY backend ./backend

WORKDIR /app/backend
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "index.js"]

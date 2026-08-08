FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only, skip devDeps unless tests are run inside container)
RUN npm ci --only=production

# Copy backend source code
COPY . .

EXPOSE 3000

CMD ["npm", "start"]

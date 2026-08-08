# Stage 1: Build the frontend
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
# Copy a custom nginx configuration to support routing (if needed) or default
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# Stage 1: Build React App
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve App with Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 5222 (match host port)
EXPOSE 5222

# Configure Nginx to serve port 5222 and support SPA routing (Vite)
RUN sed -i 's/listen       80;/listen       5222;/g' /etc/nginx/conf.d/default.conf \
    && sed -i 's/index  index.html index.htm;/try_files $uri $uri\/ \/index.html;/g' /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]

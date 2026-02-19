# --- Build Stage ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Runtime Stage (nginx) ---
FROM nginx:alpine

# Entferne Default-Seite
RUN rm -rf /usr/share/nginx/html/*

# Kopiere statischen Astro-Build nach Nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

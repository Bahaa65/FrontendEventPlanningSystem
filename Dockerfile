# Stage 1: Build Angular app
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Install Vite (if needed) globally
RUN npm install -g vite

# Copy all source files
COPY . .

# Build Angular app
RUN npm run build

# Stage 2: Nginx to serve Angular app
FROM nginxinc/nginx-unprivileged:latest

# Switch to root to copy files
USER root

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy Angular build output to Nginx html folder
COPY --from=build /app/dist/event-planner-frontend /usr/share/nginx/html

# Ensure proper ownership
RUN chown -R nginx:nginx /usr/share/nginx/html

# Switch back to nginx user
USER nginx

# Expose port
EXPOSE 8080

# Start Nginx
CMD ["nginx","-g","daemon off;"]

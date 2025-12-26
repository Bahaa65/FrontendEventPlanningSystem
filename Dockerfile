#####
# Stage 1: Build frontend
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Install vite
RUN npm install -g vite

# Copy source and build
COPY . .
RUN npm run build


#####
# Stage 2: Production
FROM nginxinc/nginx-unprivileged:latest

# Switch to root to copy files
USER root

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Adjust permissions for non-root user
RUN chown -R nginx:nginx /usr/share/nginx/html

# Switch back to non-root user
USER nginx

EXPOSE 8080

# Run nginx
CMD ["nginx", "-g", "daemon off;"]

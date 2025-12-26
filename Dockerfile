# Stage 1: Build Angular app
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Install Angular CLI globally
RUN npm install -g @angular/cli@latest

# Copy the rest of the application
COPY . .

# Build Angular app in production mode
RUN ng build --configuration production

# Stage 2: Serve with Nginx
FROM nginxinc/nginx-unprivileged:latest

# Switch to root to copy files and update permissions
USER root

# Copy custom nginx configuration if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy Angular build output to Nginx html directory
# Update the folder name according to your Angular project name in angular.json
COPY --from=build /app/dist/event-planner-frontend /usr/share/nginx/html

# Set proper ownership for Nginx
RUN chown -R nginx:nginx /usr/share/nginx/html

# Switch back to nginx user
USER nginx

# Expose port 8080
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

#####
# Stage 1: Build Angular application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --silent

COPY . .
RUN npm run build -- --configuration production

#####
# Stage 2: Serve with Nginx
FROM nginx:1.25-alpine

# Copy Angular build output
COPY --from=builder /app/dist/event-planner-frontend/browser /usr/share/nginx/html

# Copy custom nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 8080
EXPOSE 8080

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]

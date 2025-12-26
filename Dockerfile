#####
# Stage 1: Build Angular application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --silent

# Copy source code
COPY . .

# Build Angular app for production
RUN npm run build -- --configuration production

#####
# Stage 2: Serve with Nginx (OpenShift-compatible)
FROM nginx:1.25-alpine

# Create a non-root user (UID 1001 is standard in OpenShift)
USER 1001

# Copy built Angular app from builder stage
COPY --from=builder /app/dist/event-planner-frontend/browser /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Ensure proper permissions
RUN chown -R 1001:0 /usr/share/nginx/html

# Expose port 8080 (OpenShift prefers high ports for non-root)
EXPOSE 8080

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]

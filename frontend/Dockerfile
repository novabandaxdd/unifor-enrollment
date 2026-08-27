# ============================================================
# Multi-stage Dockerfile for the Angular 20 frontend
# Stage 1: Build with Node 20
# Stage 2: Serve with nginx (SPA routing)
# ============================================================

# -------------------------------------------------------------------
# Stage 1 — Build
# -------------------------------------------------------------------
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files first for layer caching
COPY package.json package-lock.json* ./

# Install dependencies (ci for reproducible installs)
RUN npm ci --prefer-offline --no-audit

# Copy the rest of the workspace
COPY . .

# Build the production bundle
RUN npm run build

# -------------------------------------------------------------------
# Stage 2 — Serve
# -------------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built Angular app from stage 1
COPY --from=build /app/dist/apps/enrollment-app/browser /usr/share/nginx/html

# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

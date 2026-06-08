# Frontend — Vite SPA, built and served as static files.
# Railway service for this uses Root Directory = "/" (repo root).
FROM node:20-slim

WORKDIR /app

# Install deps (npm install, not npm ci — resilient to lockfile/npm-version drift)
COPY package.json package-lock.json ./
RUN npm install

# Build the static site.
# VITE_API_URL is baked into the bundle at build time. Railway passes service
# variables to Docker builds as build args, but only if declared with ARG here.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
COPY . .
RUN npm run build

ENV NODE_ENV=production

# Railway injects $PORT. "npm run start" runs: serve -s dist -l ${PORT:-3000}
CMD ["npm", "run", "start"]

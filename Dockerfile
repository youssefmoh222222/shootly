# Frontend — Vite SPA, built and served as static files.
# Railway service for this uses Root Directory = "/" (repo root).
FROM node:20-slim

WORKDIR /app

# Install deps (npm install, not npm ci — resilient to lockfile/npm-version drift)
COPY package.json package-lock.json ./
RUN npm install

# Build the static site
COPY . .
RUN npm run build

ENV NODE_ENV=production

# Railway injects $PORT. "npm run start" runs: serve -s dist -l ${PORT:-3000}
CMD ["npm", "run", "start"]

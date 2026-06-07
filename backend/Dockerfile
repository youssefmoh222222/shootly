# Backend — Next.js API (Prisma + Postgres).
# Railway service for this uses Root Directory = "backend".
FROM node:20-slim

WORKDIR /app

# Prisma needs OpenSSL at build (client generation) and runtime
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Install deps (npm install, not npm ci — resilient to lockfile/npm-version drift)
COPY package.json package-lock.json ./
RUN npm install

# Build: "npm run build" runs `prisma generate && next build`
COPY . .
RUN npm run build

ENV NODE_ENV=production

# Railway injects $PORT. "npm run start" runs: next start -p ${PORT:-3001}
CMD ["npm", "run", "start"]

FROM node:22-slim

# Install OpenSSL (needed by Prisma engines) and curl (for healthchecks)
RUN apt-get update -y && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency manifests and configs
COPY package*.json ./
COPY tsconfig*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma/

# Install dependencies and generate Prisma client
RUN npm install
ENV DATABASE_URL="postgresql://root:1234@db:5432/crestDB?schema=public"
RUN npx prisma generate

# Copy source code
COPY src ./src

EXPOSE 8080

# Push schema to Postgres on startup and launch server
CMD ["sh", "-c", "npx prisma db push && npm run dev"]

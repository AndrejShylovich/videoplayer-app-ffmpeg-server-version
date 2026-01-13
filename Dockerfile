# =========================
# 1. Dependencies
# =========================
FROM node:20-alpine AS deps

RUN apk add --no-cache ffmpeg

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# =========================
# 2. Build
# =========================
FROM node:20-alpine AS builder

RUN apk add --no-cache ffmpeg

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT BUILD
RUN npm run build

# =========================
# 3. Runtime
# =========================
FROM node:20-alpine AS runner

RUN apk add --no-cache ffmpeg

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Копируем только нужное
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# Runtime директории
RUN mkdir -p uploads public/frames public/trimmed

EXPOSE 3000

CMD ["npm", "start"]

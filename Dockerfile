FROM node:20-alpine AS builder

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/backend/dist ./dist

RUN mkdir -p uploads && chown -R node:node uploads

USER node

EXPOSE 3001

CMD ["node", "dist/main.js"]

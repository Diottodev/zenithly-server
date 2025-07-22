# Dockerfile (docs/Dockerfile)
FROM node:20-alpine AS builder

WORKDIR /app

# Copia apenas arquivos dentro do contexto ./docs
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile || npm ci

COPY . .
RUN yarn docs:build

# Imagem final com "serve"
FROM node:20-alpine
WORKDIR /docs
RUN npm install -g serve
COPY --from=builder /app/docs/.vitepress/dist ./dist
EXPOSE 5050
CMD ["serve", "./dist", "-l", "5050"]
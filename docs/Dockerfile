# Dockerfile para servir a documentação estática
default
FROM node:20-alpine AS builder
WORKDIR /build
COPY ../package.json ../yarn.lock* ./
RUN yarn install --frozen-lockfile || npm ci
COPY . ./
RUN yarn docs:build

FROM node:20-alpine
WORKDIR /docs
RUN npm install -g serve
COPY --from=builder /build/docs/.vitepress/dist ./dist
EXPOSE 5050
CMD ["serve", "./dist", "-l", "5050"]

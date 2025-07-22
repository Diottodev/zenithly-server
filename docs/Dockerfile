# docs/Dockerfile

FROM node:20-alpine AS builder

WORKDIR /app
COPY . ./
RUN yarn install --frozen-lockfile || npm ci
RUN yarn docs:build

FROM node:20-alpine
WORKDIR /docs
RUN npm install -g serve
COPY --from=builder /app/.vitepress/dist ./dist
EXPOSE 5050
CMD ["serve", "./dist", "-l", "5050"]
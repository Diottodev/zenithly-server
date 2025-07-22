# Dockerfile para a API Node.js
FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock* ./
RUN yarn install --production --frozen-lockfile || npm ci --omit=dev

COPY . .

ENV NODE_ENV=production

CMD ["yarn", "start"]

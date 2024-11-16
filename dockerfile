FROM node:20-alpine3.18

WORKDIR /app

COPY package*.json ./

COPY . .

RUN pnpm ci --omit=dev --ignore-scripts

EXPOSE 3001

RUN ["pnpm", "run", "dev"]

FROM node:22-bookworm AS build

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable \
  && corepack prepare pnpm@10.7.0 --activate \
  && pnpm install --frozen-lockfile

COPY . .

RUN pnpm build --configuration production

FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

RUN npm install -g serve

COPY --from=build /app/dist/random-teams/browser /app/dist

EXPOSE 8080

CMD ["sh", "-c", "serve -s dist -l ${PORT}"]

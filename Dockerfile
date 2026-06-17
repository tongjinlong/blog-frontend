# syntax=docker/dockerfile:1.7

FROM node:24-alpine AS builder

WORKDIR /app
RUN corepack enable

ARG VITE_APP_NAME
ARG VITE_APP_ENV=production
ARG VITE_API_BASE_URL
ARG VITE_SENTRY_DSN
ARG VITE_SENTRY_RELEASE
ARG VITE_SOURCEMAP=false
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ARG SENTRY_RELEASE

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN --mount=type=secret,id=sentry_auth_token \
  SENTRY_AUTH_TOKEN="$(cat /run/secrets/sentry_auth_token 2>/dev/null || true)" pnpm build && \
  find dist -name '*.map' -type f -exec rm -f {} +

FROM nginx:alpine AS runner

RUN apk upgrade --no-cache

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY nginx/runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
COPY --from=builder /app/dist /usr/share/nginx/html
RUN chmod +x /docker-entrypoint.d/40-runtime-config.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]

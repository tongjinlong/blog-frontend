#!/bin/sh
set -eu

CONFIG_FILE="${APP_CONFIG_FILE:-/usr/share/nginx/html/config.js}"
APP_NAME="${APP_NAME:-${VITE_APP_NAME:-Blog Frontend}}"
APP_ENV="${APP_ENV:-${VITE_APP_ENV:-production}}"
API_BASE_URL="${API_BASE_URL:-${VITE_API_BASE_URL:-/api}}"
SENTRY_DSN="${SENTRY_DSN:-${VITE_SENTRY_DSN:-}}"
SENTRY_RELEASE="${SENTRY_RELEASE:-${VITE_SENTRY_RELEASE:-}}"

json_string() {
  escaped=$(printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g')
  printf '"%s"' "$escaped"
}

mkdir -p "$(dirname "$CONFIG_FILE")"

cat > "$CONFIG_FILE" <<EOF
window.__APP_CONFIG__ = {
  APP_NAME: $(json_string "$APP_NAME"),
  APP_ENV: $(json_string "$APP_ENV"),
  API_BASE_URL: $(json_string "$API_BASE_URL"),
  SENTRY_DSN: $(json_string "$SENTRY_DSN"),
  SENTRY_RELEASE: $(json_string "$SENTRY_RELEASE")
};
EOF

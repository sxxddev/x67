#!/bin/bash
# Run on inwCloud Terminal (DirectAdmin) — fixes 503/500 for x67secretme.shop
set -e
APP="/home/in8lx67secre/domains/x67secretme.shop/nextjs"
VENV="/home/in8lx67secre/nodevenv/domains/x67secretme.shop/nextjs/20/bin/activate"
LOG="$APP/hosting-diagnose.log"

exec > >(tee -a "$LOG") 2>&1
echo "=== x67secretme hosting fix $(date) ==="

if [ -f "$VENV" ]; then
  # shellcheck disable=SC1090
  source "$VENV"
else
  echo "WARN: nodevenv not found at $VENV — using system node"
fi

cd "$APP" || exit 1
echo "PWD: $(pwd)"
echo "Node: $(node -v)"
echo "NPM: $(npm -v)"

echo "--- .env check ---"
if [ ! -f .env ]; then
  echo "ERROR: .env missing"
  exit 1
fi
if grep -q 'DB_USER\|DB_PASSWORD\|DB_NAME' .env; then
  echo "ERROR: DATABASE_URL still has placeholder (DB_USER/DB_PASSWORD) — fix .env first"
  exit 1
fi
if ! grep -q '^DATABASE_URL=' .env; then
  echo "ERROR: DATABASE_URL not set in .env"
  exit 1
fi
echo "DATABASE_URL: set (hidden)"

echo "--- npm install ---"
npm install --omit=dev --ignore-scripts
npm install dotenv
npx prisma generate

echo "--- rebuild on Linux (required) ---"
rm -rf .next
npm run build

echo "--- quick local test ---"
set -a
# shellcheck disable=SC1091
source .env
set +a
export NODE_ENV=production
export PORT=3999
timeout 25s node server.js &
PID=$!
sleep 12
if curl -sf -m 10 "http://127.0.0.1:3999/" >/dev/null; then
  echo "OK: local curl to port 3999 succeeded"
else
  echo "WARN: local curl failed — check errors above"
fi
kill "$PID" 2>/dev/null || true
wait "$PID" 2>/dev/null || true

echo ""
echo "=== DONE ==="
echo "1) Setup Node.js App -> ADD VARIABLE: NODE_ENV, DATABASE_URL, AUTH_SECRET, AUTH_URL, NEXTAUTH_URL, NEXTAUTH_SECRET"
echo "2) Startup file: server.js | Mode: Production | RESTART app"
echo "3) Log saved: $LOG"

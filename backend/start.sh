#!/usr/bin/env bash
# Запуск backend Mary платформы (Express on Node 24)
set -e
cd "$(dirname "$0")"

# Используем Node 24 из brew (Node 25 на macOS сейчас сломан с simdjson)
NODE_BIN="/opt/homebrew/opt/node@24/bin"
if [ ! -x "$NODE_BIN/node" ]; then
  echo "❌ Node 24 не найден. Установи: brew install node@24"
  exit 1
fi
export PATH="$NODE_BIN:$PATH"

# Грузим .env
set -o allexport
[ -f .env ] && source .env
set +o allexport

# Если node_modules устарели — переустановим
if [ ! -d node_modules/express ]; then
  echo "→ Установка зависимостей..."
  rm -rf node_modules package-lock.json
  npm install
fi

echo ""
echo "🐶 Mary backend starting on http://localhost:${N8N_PORT:-5678}"
echo "   Node: $(node --version)"
echo ""

exec node server.js

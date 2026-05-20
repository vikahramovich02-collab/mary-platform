#!/usr/bin/env bash
# Авто-деплой Mary платформы на 77.237.241.242
#   bash deploy.sh                                → деплоит и фронт, и бэк
#   bash deploy.sh frontend                       → только фронт
#   bash deploy.sh backend                        → только бэк
#   bash deploy.sh all "что изменили"             → с заметкой в TG
#   bash deploy.sh frontend "почистил кнопки чата"
set -e

SERVER="root@77.237.241.242"
KEY="$HOME/.ssh/openclaw-mary"
SSH="ssh -i $KEY -o IdentitiesOnly=yes -o LogLevel=ERROR"
SCP="scp -i $KEY -o IdentitiesOnly=yes -o LogLevel=ERROR -q"

cd "$(dirname "$0")"

# Аргументы: $1 = target (frontend|backend|all|"" — alias all), $2 = note
case "${1:-}" in
  frontend|front|fe|backend|back|be|all|both|"")
    TARGET="${1:-all}"
    NOTE="${2:-}"
    ;;
  *)
    # Если первый аргумент не таргет — это note для all
    TARGET="all"
    NOTE="$1"
    ;;
esac
DEPLOY_START=$(date +%s)

# Используем Node 24 (npm на 25/26 у тебя ломается из-за simdjson)
export PATH="/opt/homebrew/opt/node@24/bin:$PATH"

# ── Git: коммит изменений ПЕРЕД деплоем (если есть, что коммитить) ───
if [ -d .git ] && [ -n "$(git status --porcelain 2>/dev/null)" ]; then
  COMMIT_MSG="${NOTE:-deploy: $TARGET (no note)}"
  echo "📝 Коммитю изменения: $COMMIT_MSG"
  git add -A
  git commit -m "$COMMIT_MSG" 2>&1 | tail -2 || echo "  (не получилось коммитнуть — продолжаю деплой)"
  if git remote get-url origin >/dev/null 2>&1; then
    echo "⬆️  Push на GitHub..."
    git push 2>&1 | tail -2 || echo "  (push не прошёл — продолжаю деплой, push повторишь руками)"
  fi
elif [ -d .git ]; then
  echo "📝 Git: нечего коммитить (working tree чистый)"
fi
echo

deploy_frontend() {
  echo "🎨 Frontend → build..."
  npm run build --silent 2>&1 | tail -3

  echo "📦 Pack (без macOS-метаданных)..."
  COPYFILE_DISABLE=1 tar --no-xattrs --no-mac-metadata -czf /tmp/mary-frontend.tar.gz -C dist . 2>/dev/null

  echo "🚀 Upload..."
  $SCP /tmp/mary-frontend.tar.gz $SERVER:/opt/mary2/

  # Распаковка В ТУ ЖЕ ПАПКУ что mount-нута в контейнер (без mv,
  # иначе inode меняется и контейнер теряет mount).
  echo "📂 Extract in-place..."
  $SSH $SERVER '
    set -e
    cd /opt/mary2
    mkdir -p dist
    # Распаковываем во временную папку
    rm -rf dist.tmp && mkdir dist.tmp
    tar xzf mary-frontend.tar.gz -C dist.tmp
    # Чистим macOS junk
    find dist.tmp -name "._*" -delete 2>/dev/null || true
    # Атомарно копируем в существующую папку (НЕ mv папки!)
    rsync -a --delete dist.tmp/ dist/
    rm -rf dist.tmp mary-frontend.tar.gz
  '

  # Проверка через nginx
  HTTP=$($SSH $SERVER 'curl -s -o /dev/null -w "%{http_code}" http://localhost/')
  if [ "$HTTP" = "200" ]; then
    echo "✓ Frontend готов: http://77.237.241.242/?page=tg-kanal (HTTP $HTTP)"
  else
    echo "⚠️  Frontend вернул HTTP $HTTP — пробую restart контейнера"
    $SSH $SERVER 'docker restart mary-frontend > /dev/null && sleep 2'
    HTTP=$($SSH $SERVER 'curl -s -o /dev/null -w "%{http_code}" http://localhost/')
    echo "  после restart: HTTP $HTTP"
  fi
}

deploy_backend() {
  echo "⚙️  Backend → pack..."
  cd backend
  tar czf /tmp/mary-backend.tar.gz Dockerfile server.js package.json .env data 2>/dev/null

  echo "🚀 Upload..."
  $SCP /tmp/mary-backend.tar.gz $SERVER:/opt/mary2/

  echo "🐳 Build & restart container..."
  $SSH $SERVER '
    cd /opt/mary2 &&
    rm -rf backend.new && mkdir backend.new &&
    tar xzf mary-backend.tar.gz -C backend.new &&
    cd backend.new &&
    cp /opt/mary2/.env . 2>/dev/null || true &&
    docker build -t mary-backend . 2>&1 | tail -3 &&
    docker rm -f mary-backend 2>/dev/null &&
    mkdir -p /opt/mary2/kb-files &&
    docker run -d --name mary-backend --restart unless-stopped \
      --env-file /opt/mary2/.env \
      -e KB_DIR=/data/kb-files \
      -v /opt/mary2/kb-files:/data/kb-files \
      -v /opt/mary2/data:/data \
      -p 5678:5678 mary-backend > /dev/null &&
    sleep 2 &&
    docker logs mary-backend 2>&1 | tail -3 &&
    cd /opt/mary2 && rm mary-backend.tar.gz
  '
  cd ..
  echo "✓ Backend готов: http://77.237.241.242:5678/health"
}

case "$TARGET" in
  frontend|front|fe)  deploy_frontend; DEPLOYED="frontend" ;;
  backend|back|be)    deploy_backend;  DEPLOYED="backend"  ;;
  all|both|"")        deploy_backend; deploy_frontend; DEPLOYED="all"  ;;
  *)                  echo "usage: $0 [frontend|backend|all] [\"note\"]"; exit 1 ;;
esac

DEPLOY_DUR=$(( $(date +%s) - DEPLOY_START ))

# ── Уведомление в Telegram (всем из allowlist) ──────────────────────────
TG_TOKEN=$(grep -E "^TELEGRAM_BOT_TOKEN=" backend/.env 2>/dev/null | cut -d= -f2-)
ALLOWLIST=$(grep -E "^TELEGRAM_ALLOWLIST_CHAT_IDS=" backend/.env 2>/dev/null | cut -d= -f2-)
OWNER=$(grep -E "^TELEGRAM_OWNER_CHAT_ID=" backend/.env 2>/dev/null | cut -d= -f2-)
if [ -n "$ALLOWLIST" ]; then
  TG_CHATS=$(echo "$ALLOWLIST" | tr ',' '\n')
elif [ -n "$OWNER" ]; then
  TG_CHATS="$OWNER"
else
  TG_CHATS=""
fi
if [ -n "$TG_TOKEN" ] && [ -n "$TG_CHATS" ]; then
  # Health-чек
  HEALTH=$(curl -s --max-time 5 http://77.237.241.242:5678/health 2>/dev/null || echo '{}')
  UPTIME=$(echo "$HEALTH" | python3 -c "import json,sys; d=json.load(sys.stdin); print(int(d.get('uptime',0)))" 2>/dev/null || echo "?")
  POSTS=$(echo "$HEALTH"  | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('posts',0))" 2>/dev/null || echo "?")

  EMOJI="🟢"
  case "$DEPLOYED" in
    all)      WHAT="frontend + backend" ;;
    frontend) WHAT="frontend" ;;
    backend)  WHAT="backend (uptime сброшен)" ;;
  esac

  NL=$'\n'
  TEXT="${EMOJI} <b>Mary deploy</b> · ${WHAT}"
  TEXT="${TEXT}${NL}⏱ ${DEPLOY_DUR}с"
  if [ "$UPTIME" != "?" ] && [ -n "$UPTIME" ]; then
    TEXT="${TEXT} · backend uptime ${UPTIME}с · posts ${POSTS}"
  fi
  if [ -n "$NOTE" ]; then
    NOTE_ESCAPED=$(echo "$NOTE" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g')
    TEXT="${TEXT}${NL}${NL}📝 ${NOTE_ESCAPED}"
  fi
  TEXT="${TEXT}${NL}${NL}<a href=\"http://77.237.241.242/?page=tg-kanal\">открыть платформу</a>"

  SENT=0
  for CHAT in $TG_CHATS; do
    CHAT_TRIM=$(echo "$CHAT" | tr -d ' ')
    [ -z "$CHAT_TRIM" ] && continue
    curl -s "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
      --data-urlencode "chat_id=${CHAT_TRIM}" \
      --data-urlencode "text=${TEXT}" \
      --data-urlencode "parse_mode=HTML" \
      --data-urlencode "disable_web_page_preview=true" \
      > /dev/null && SENT=$((SENT + 1))
  done
  echo "📲 TG (×${SENT})"
fi

echo ""
echo "🧪 Smoke-тесты после деплоя..."
TEST_OUT=$(node --test tests/backend.test.mjs 2>&1)
TEST_BACK_RC=$?
TEST_E2E_OUT=$(node tests/e2e.spec.mjs 2>&1)
TEST_E2E_RC=$?
if [ $TEST_BACK_RC -eq 0 ] && [ $TEST_E2E_RC -eq 0 ]; then
  echo "✓ все smoke-тесты прошли"
else
  echo "❌ ТЕСТЫ УПАЛИ — backend rc=$TEST_BACK_RC, e2e rc=$TEST_E2E_RC"
  echo "$TEST_OUT" | tail -10
  echo "---"
  echo "$TEST_E2E_OUT" | tail -10
  # Alert в TG (не блокируем — деплой уже прошёл, надо знать)
  if [ -n "$TG_TOKEN" ] && [ -n "$TG_CHATS" ]; then
    for CHAT in $TG_CHATS; do
      curl -s "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
        --data-urlencode "chat_id=$(echo $CHAT | tr -d ' ')" \
        --data-urlencode "text=🚨 Smoke-тесты упали после деплоя ${WHAT}. backend rc=${TEST_BACK_RC}, e2e rc=${TEST_E2E_RC}. Прод может быть сломан — проверь http://77.237.241.242/" \
        > /dev/null
    done
  fi
fi

echo ""
echo "🐶 Готово: http://77.237.241.242/?page=tg-kanal"

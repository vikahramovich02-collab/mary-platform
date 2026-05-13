#!/usr/bin/env bash
# Уведомление в Telegram от Mary платформы.
#
# Использование:
#   bash notify.sh "Что произошло — простыми словами, как для не-разработчика"
#
# Опционально — топик меняет только эмодзи:
#   bash notify.sh --topic feature   "..."   ✨
#   bash notify.sh --topic fix       "..."   🔧
#   bash notify.sh --topic deploy    "..."   🚀
#   bash notify.sh --topic security  "..."   🛡
#   bash notify.sh --topic docs      "..."   📝
#   bash notify.sh --topic idea      "..."   💡
#   bash notify.sh --topic error     "..."   🚨
#
# ВАЖНО: пиши в TG ПОНЯТНО. Не "добавлен endpoint POST /api/foo" а
# "Теперь Mary умеет сохранять контент-планы прямо в БЗ — раньше всё было в чате".
set -e
cd "$(dirname "$0")"

TOPIC=""
if [ "${1:-}" = "--topic" ]; then
  TOPIC="$2"
  shift 2
fi

TEXT="${1:-}"
if [ -z "$TEXT" ] && [ ! -t 0 ]; then
  TEXT=$(cat)
fi
if [ -z "$TEXT" ]; then
  echo "usage: bash notify.sh [--topic <topic>] \"что произошло, по-человечески\""
  exit 1
fi

case "$TOPIC" in
  feature)  EMOJI="✨" ;;
  fix)      EMOJI="🔧" ;;
  deploy)   EMOJI="🚀" ;;
  security) EMOJI="🛡" ;;
  docs)     EMOJI="📝" ;;
  idea)     EMOJI="💡" ;;
  error)    EMOJI="🚨" ;;
  *)        EMOJI="🐶" ;;
esac

TG_TOKEN=$(grep -E "^TELEGRAM_BOT_TOKEN=" backend/.env 2>/dev/null | cut -d= -f2-)
ALLOWLIST=$(grep -E "^TELEGRAM_ALLOWLIST_CHAT_IDS=" backend/.env 2>/dev/null | cut -d= -f2-)
OWNER=$(grep -E "^TELEGRAM_OWNER_CHAT_ID=" backend/.env 2>/dev/null | cut -d= -f2-)
[ -z "$TG_TOKEN" ] && { echo "❌ TG не настроен"; exit 1; }

if [ -n "$ALLOWLIST" ]; then
  RECIPIENTS=$(echo "$ALLOWLIST" | tr ',' '\n')
elif [ -n "$OWNER" ]; then
  RECIPIENTS="$OWNER"
else
  echo "❌ Нет получателей в TG"; exit 1
fi

ESCAPED=$(echo "$TEXT" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g')
PAYLOAD="${EMOJI} ${ESCAPED}"

SENT=0
for CHAT in $RECIPIENTS; do
  CHAT_TRIM=$(echo "$CHAT" | tr -d ' ')
  [ -z "$CHAT_TRIM" ] && continue
  curl -s "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
    --data-urlencode "chat_id=${CHAT_TRIM}" \
    --data-urlencode "text=${PAYLOAD}" \
    --data-urlencode "parse_mode=HTML" \
    --data-urlencode "disable_web_page_preview=true" \
    > /dev/null && SENT=$((SENT + 1))
done
echo "📲 → TG (×${SENT})"

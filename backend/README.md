# Mary backend (n8n)

Локальный backend для платформы Mary на n8n. Каждый Mary-агент = workflow в n8n. Frontend (Vite, port 3000) звонит на webhook'и через прокси `/api/mary/*` → n8n (port 5678).

## Запуск

```bash
cd /Users/vika/Desktop/mary/mary/backend
./start.sh
```

Первый запуск долгий (n8n качает зависимости через npx). Дальше будет быстро — данные хранятся в `./n8n-data/`.

После старта:
- **n8n редактор** → http://localhost:5678
- **API для фронта** → http://localhost:5678/webhook/mary/chat (через прокси: http://localhost:3000/api/mary/chat)

## Импорт первого workflow

1. Открой http://localhost:5678
2. Workflows → Import from file → выбери `workflows/mary-orchestrator.json`
3. Открой workflow → нажми `Activate` (toggle справа сверху)
4. Скопируй webhook URL — путь `/webhook/mary/chat`

## Что делает Mary Orchestrator (mock)

- Принимает `POST /webhook/mary/chat` с body `{ message, history?, kbContext? }`
- Анализирует тему сообщения регуляркой (keyword routing) и решает кому делегировать:
  - `marketer` — идеи / контент-план
  - `copywriter` — текст поста
  - `designer` — обложка / визуал
  - `researcher` — ресёрч / тренды
  - `analyst` — метрики / отчёт
  - `mary` — общий случай, просит уточнить
- Возвращает `{ agentId, text, delegateTo, timestamp }`

## Что дальше (не в этом MVP)

1. **Реальный LLM** — добавить ноду `Anthropic Chat Model` с API key из `.env` для умного ответа Mary
2. **Подworkflow на каждого агента** — Researcher Parser (через Telethon), Marketer Ideator (через Claude), Designer (Higgsfield API), и т.д.
3. **Persistence** — n8n Postgres вместо SQLite в production
4. **Auth** — n8n user management, public webhook auth

## Тест без фронта

```bash
curl -X POST http://localhost:5678/webhook/mary/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"напиши контент-план на неделю"}'
```

Ожидаемый ответ:
```json
{
  "agentId": "mary",
  "text": "Передаю Маркетологу — соберёт идеи постов под твой бриф.",
  "delegateTo": "marketer",
  "timestamp": "2026-05-10T...",
  "backend": "n8n-mock"
}
```

## Подключение к фронту

Уже сделано через прокси в `vite.config.js`:

```js
proxy: {
  '/api/mary': {
    target: 'http://localhost:5678',
    rewrite: (p) => p.replace(/^\/api\/mary/, '/webhook/mary'),
  },
}
```

Frontend дёргает `fetch('/api/mary/chat', ...)`, Vite перенаправляет на `http://localhost:5678/webhook/mary/chat`.

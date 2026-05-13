# Backend Mary

Express-сервер с function-calling агентом Mary через OpenRouter (GLM 5.1). Стрим ответов через SSE.

## Запуск

```bash
cp .env.example .env
# Заполни OPENROUTER_API_KEY и TELEGRAM_BOT_TOKEN
npm install
node server.js              # → http://localhost:5678
```

Health: `curl http://localhost:5678/health`

## Endpoints

| Метод | URL | Что |
|---|---|---|
| POST | `/webhook/mary/agent` | One-shot ответ (без SSE) |
| POST | `/webhook/mary/agent/stream` | Стрим ответа SSE: `text_delta`, `tool_start`, `tool_end`, `done` |
| GET  | `/conversations` | Список чатов |
| GET  | `/conversations/:id` | Сообщения чата |
| POST | `/conversations` | Создать чат |
| DELETE | `/conversations/:id` | Удалить |
| GET  | `/departments` | Список отделов |
| DELETE | `/departments/:id` | Удалить отдел |
| GET/POST/DELETE | `/kb` | База знаний |
| GET  | `/health` | Health + uptime + counts |

Frontend дёргает `/api/mary/*`, Vite проксирует на `:5678/webhook/mary/*` (см. `vite.config.js`).

## Tools для агента Mary

Определены в `MARY_TOOLS` в `server.js`:

- `list_departments`, `create_department`, `add_channel`, `add_agent`, `set_department_integrations` — управление отделами
- `kb_list`, `kb_read`, `kb_write`, `search_kb` — работа с БЗ
- `read_chat` — читать чат другого отдела
- `get_research_insights`, `generate_ideas`, `write_post`, `publish_post`, `create_task` — основные действия

Системный промпт `MARY_SYSTEM_AGENT` — большой, описывает стиль Mary, правила работы с tools, self-onboarding нового отдела через discovery-интервью.

## Production

Docker контейнер `mary-backend` на 77.237.241.242, рестартится через `bash deploy.sh backend "note"`. nginx проксирует `/api/mary/*` → `:5678/webhook/mary/*` (с `proxy_buffering off` для SSE).

## Data

`./data/` — JSON-файлы:
- `conversations.json` — все чаты + сообщения
- `departments.json` — отделы + агенты + интеграции
- `posts.json` — спарсенные посты (researcher input)
- `kb-files/*.md` — markdown-файлы базы знаний
- `brand.md` — бренд-бриф

В репо НЕ закоммичены (см. `backend/.gitignore`).

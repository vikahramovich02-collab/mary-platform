# Mary

AI-оркестратор отделов компании. Юзер пишет в чат «настрой отдел поддержки» — Mary через discovery-интервью собирает команду агентов под конкретный бизнес: каналы, агенты, интеграции. Дальше каждый отдел работает в своём чате с агентами как со штатными сотрудниками.

**Prod:** http://77.237.241.242/?page=tg-kanal

## Контекст продукта и UX

- [Обязательный контекст платформы](PLATFORM_CONTEXT.md)
- [Единая end-to-end карта](MARY_END_TO_END_USER_FLOW.md)
- [JTBD-персоны и Customer Journey Maps](PERSONAS_AND_JOURNEYS.md)
- [Индекс UX-карт](USER_FLOWS_INDEX.md)
- [Шаблон задачи для Codex CLI](CODEX_TASK_BRIEF.md)
- [Редактируемый user flow в FigJam](https://www.figma.com/board/wsCfO0YGlrIzXCUcorgYSe?utm_source=other&utm_content=edit_in_figjam&oai_id=v1%2FtofhoCJfXpMG6Ai41eBz6zt1dCmrgr1I6bxTIMt5T0dhjaZWT3Mgsa&request_id=bfe1e5d0-d30e-402d-81a0-951fe055a2d0)

Перед изменением отдельной страницы Codex должен прочитать `AGENTS.md`, общий
контекст и профильный `*_USER_FLOW.md`.

## Стек

- **Frontend** — React 19 + Vite, всё в одном файле `src/platform/pages/TgKanalPage.jsx`
- **Backend** — Node 24 + Express, SSE-стрим, function-calling агенты через OpenRouter (GLM 5.1)
- **Storage** — JSON-файлы (`backend/data/`): conversations, departments, posts, kb-files
- **Deploy** — Docker контейнеры на Contabo, rsync + atomic restart, smoke-тесты + TG-алерты

## Запуск локально

```bash
# Frontend
cp .env.example .env
npm install
npm run dev                # → http://localhost:3000

# Backend (в отдельном терминале)
cd backend
cp .env.example .env        # вставь OPENROUTER_API_KEY и TELEGRAM_BOT_TOKEN
npm install
node server.js              # → http://localhost:5678
```

Открой `http://localhost:3000/?page=chat-mary` — попадёшь в чат Mary.

## Деплой

```bash
bash deploy.sh "что изменилось"   # → коммит + push + сборка + upload + smoke-тест + TG
```

`deploy.sh` сам делает `git add+commit+push` перед деплоем — прод и репо синхронны.

## Тесты

```bash
node --test tests/backend.test.mjs           # backend smoke
node tests/business-scenarios.mjs            # 10 базовых бизнес-сценариев Mary
node tests/jtbd-cases.mjs                    # 20 JTBD-кейсов из разных сфер
node tests/onboarding-flow.mjs               # self-onboarding отдела
node tests/e2e.spec.mjs                      # Playwright UI
```

## Структура

```
mary/
├── backend/
│   ├── server.js         # Express + SSE + tool-calling агент Mary
│   ├── Dockerfile
│   └── data/             # conversations.json, departments.json, kb-files/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── platform/pages/
│   │   └── TgKanalPage.jsx   # вся UI-логика (чат, граф, КБ, отделы)
│   └── ui/
│       └── components.jsx
├── tests/                # backend + UI + сценарные тесты
├── deploy.sh             # деплой + commit + smoke
├── notify.sh             # TG-уведомления
└── .github/workflows/ci.yml
```

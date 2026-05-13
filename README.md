# Mary AI

## Запуск

```bash
cp .env.example .env        # вставь Claude API ключ
npm install
npm run dev                  # → localhost:3000
```

## Флоу
- `localhost:3000/landing.html` — лендинг
- `localhost:3000` — онбординг → платформа

Кнопки на лендинге ведут на `/` → онбординг.
После оплаты → платформа (сохраняется в localStorage).

## Структура

```
mary/
├── .cursor/rules
├── .env.example
├── design/
│   ├── figma-links.md
│   ├── prototypes/          ← прототипы (полный функционал)
│   │   ├── landing.html
│   │   ├── onboarding.jsx
│   │   └── platform.jsx
│   ├── figma-screens/
│   └── moodboard/
├── docs/
│   └── CONTEXT.md
├── public/
│   └── landing.html         ← лендинг (раздаётся Vite)
├── src/
│   ├── App.jsx              ← роутер: onboarding → platform
│   ├── main.jsx
│   ├── onboarding/
│   │   └── Onboarding.jsx
│   └── platform/
│       └── Platform.jsx
├── package.json
└── vite.config.js
```

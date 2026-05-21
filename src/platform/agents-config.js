// Хардкод-данные графа агентов СММ для frontend-карточек.
// Извлечено из TgKanalPage.jsx (Phase 1 refactor). Pipeline'ы реальных агентов
// живут в backend departments.json (см. defaultPipelineFor).

// ── Данные графа ────────────────────────────────────────────
export const AGENTS = [
  {
    id: "researcher", label: "Ресерчер", color: "#3F95FF", x: 60, y: 200, hasUpdate: true, unread: 2,
    role: "Парсит ТГ-каналы конкурентов каждый день в 9:00 и собирает топ-посты",
    model: "gpt-4o", reasoning: "minimal",
    skills: [
      "Парсит ТГ-каналы по списку из КБ",
      "Считает охваты, реакции, комменты",
      "Кластеризует посты по темам",
      "Выделяет тренды недели",
      "Возвращает топ-20 постов в JSON",
    ],
    tools: ["База знаний", "Web browser", "Telegram API"],
    runs: 12, cost: "$0.42",
    currentTask: "Сбор постов за 5–11 мая по 12 каналам",
    lastActive: "2 часа назад",
    stats: { week: 12, label: "ресёрчей" },
    kb: {
      inputs: [
        { kind: "channels", title: "Каналы для парсинга" },
        { kind: "posts",    title: "Свежие посты" },
      ],
      outputs: [],
    },
    pipeline: [
      { title: "Каналы для парсинга", status: "ready",   unread: false, kb: "Каналы для парсинга" },
      { title: "Последние посты",     status: "ready",   unread: true,  kb: "Свежие посты"        },
      { title: "Тренды и инсайты",    status: "pending", unread: false, kb: null                  },
    ],
    flow: {
      // Координаты в локальной системе (offset относительно центра агента)
      nodes: [
        // ── ВХОД (слева) ──
        { id: "in-channels", kind: "input",   title: "Список каналов",   sub: "38 источников",   ox: -520, oy: -160 },
        { id: "in-schedule", kind: "input",   title: "Расписание",       sub: "cron + on-demand", ox: -520, oy:  -40 },
        { id: "in-brand",    kind: "input",   title: "Контекст бренда",  sub: "ниша Mary",        ox: -520, oy:   80 },

        // ── ПАЙПЛАЙН (горизонтальная цепочка) ──
        { id: "s1-fetch",     kind: "subagent", title: "Сборщик",            sub: "забирает посты", ox: -260, oy: -160 },
        { id: "s2-dedup",     kind: "subagent", title: "Дедупликатор",       sub: "выкидывает повторы", ox: -260, oy: -40 },
        { id: "s3-relevance", kind: "llm-step", title: "Фильтр релевантности", sub: "GLM · ниша Mary", ox: -260, oy:  80 },
        { id: "s4-scorer",    kind: "subagent", title: "Скорер",             sub: "охват · ER · комменты", ox:    0, oy: -100 },
        { id: "s5-cluster",   kind: "llm-step", title: "Кластеризатор",      sub: "темы и сюжеты · LLM", ox:    0, oy:   20 },
        { id: "s6-synth",     kind: "llm-step", title: "Синтезатор инсайтов", sub: "tl;dr недели · LLM", ox:  260, oy:  -40 },

        // ── БОКОВАЯ ВЕТКА: поиск новых каналов ──
        { id: "s7-discover",  kind: "subagent", title: "Поиск каналов",      sub: "раз в неделю · по нишам", ox: -260, oy: 200 },

        // ── ВЫХОД (справа) ──
        { id: "out-top",       kind: "output-kb",   title: "Топ-посты недели", sub: "→ База знаний", ox: 520, oy: -160 },
        { id: "out-trends",    kind: "next-agent",  title: "Темы недели",      sub: "→ Маркетолог",  ox: 520, oy:  -40 },
        { id: "out-formats",   kind: "next-agent",  title: "Форматы хуков",    sub: "→ Копирайтер",  ox: 520, oy:   80 },
        { id: "out-newchans",  kind: "output-kb",   title: "Новые каналы",     sub: "→ автоматически в источники", ox: 520, oy: 200 },
      ],
      edges: [
        // Вход → начало пайплайна
        ["in-channels", "s1-fetch"],
        ["in-schedule", "s1-fetch"],

        // Цепочка очистки
        ["s1-fetch", "s2-dedup"],
        ["s2-dedup", "s3-relevance"],

        // Параллельные ветки после фильтра
        ["s3-relevance", "s4-scorer"],
        ["s3-relevance", "s5-cluster"],

        // Сходятся в синтезатор
        ["s4-scorer",  "s6-synth"],
        ["s5-cluster", "s6-synth"],

        // Боковая ветка discovery
        ["in-brand",     "s7-discover"],
        ["in-channels",  "s7-discover"],

        // Выходы
        ["s4-scorer",    "out-top"],
        ["s6-synth",     "out-trends"],
        ["s6-synth",     "out-formats"],
        ["s7-discover",  "out-newchans"],
      ],
    },
    tasks: [
      { title: "Собрать актуальные посты",     desc: "парсинг каналов за 24-72ч", cron: "cron daily 9:00",      tool: "Парсер TG-каналов",  out: "Каналы",           status: "В работе" },
      { title: "Кластеризовать темы",          desc: "без повторов из истории",   cron: null,                   tool: "Маркетолог Mary",    out: "Инсайт-карточки",  status: "В работе" },
      { title: "Подготовить 3-5 инсайт-карточек", desc: "для Контент-плана",      cron: null,                   tool: "Ресерчер инсайтов",  out: "Инсайт-карточки",  status: "Готово" },
      { title: "Найти новые TG-каналы",        desc: "по нишам Mary",             cron: "cron weekly mon 8:00", tool: "TG-радар",           out: "Каналы",           status: "Запланирована" },
      { title: "Дайджест трендов Вике",        desc: "что взяли / что отбросили", cron: "weekly",               tool: "Ресерчер инсайтов",  out: "Дайджест",         status: "Запланирована" },
    ],
    integrations: [
      { name: "Telegram",     desc: "Парсинг каналов через Telethon",   on: true },
      { name: "Google Sheets", desc: "Запись топ-постов в таблицу",     on: true },
    ],
  },
  {
    id: "marketer", label: "Маркетолог", color: "#FF8B3D", x: 320, y: 200, hasUpdate: true, unread: 3,
    role: "На основе ресёрча подбирает темы постов и определяет концепт",
    model: "claude-sonnet-4", reasoning: "minimal",
    skills: [
      "Кластеризует посты по темам (один сюжет = один кластер)",
      "Оценивает релевантность Mary (AI-агенты, no-code, индихакеры)",
      "Оценивает потенциал вовлечения (хайп vs затухание)",
      "Находит уникальный угол подачи",
      "Возвращает 3 идеи с обоснованием",
    ],
    tools: ["База знаний", "Web browser"],
    runs: 18, cost: "$1.20",
    currentTask: "Идеи на неделю 12–18 мая",
    lastActive: "1 час назад",
    stats: { week: 18, label: "идей" },
    kb: {
      inputs:  [],
      outputs: [
        { kind: "ideas",    title: "Идеи постов" },
        { kind: "concepts", title: "Концепты"    },
      ],
    },
    pipeline: [
      { title: "Инсайт-карточки",    status: "ready",   unread: false, kb: "Тренды и инсайты" },
      { title: "Идеи постов",        status: "ready",   unread: true,  kb: "Идеи постов"      },
      { title: "Концепты постов",    status: "pending", unread: false, kb: "Концепты"         },
    ],
    tasks: [
      { title: "Идеи на неделю",         desc: "по инсайт-карточкам ресерчера", cron: "cron weekly mon 10:00", tool: "Маркетолог Mary",  out: "Идеи",     status: "На апруве" },
      { title: "Оценить релевантность",  desc: "по нишам Mary",                 cron: null,                    tool: "Маркетолог Mary",  out: "Идеи",     status: "Готово" },
      { title: "Подобрать угол подачи",  desc: "что своего скажем",             cron: null,                    tool: "Маркетолог Mary",  out: "Концепты", status: "Готово" },
      { title: "Согласовать с апрувером",desc: "запросить апрув в чате",        cron: null,                    tool: "Чат-бот",          out: "Чат",      status: "На апруве" },
    ],
    integrations: [
      { name: "Google Sheets", desc: "Запись идей и концептов", on: true },
    ],
  },
  {
    id: "copywriter", label: "Копирайтер", color: "#7A86FF", x: 580, y: 80, hasUpdate: true, unread: 1,
    role: "Пишет тексты постов под утверждённые идеи в тоне Mary",
    model: "claude-sonnet-4", reasoning: "minimal",
    skills: [
      "Пишет в tone of voice Mary",
      "Структурирует пост: хук, тело, призыв",
      "Адаптирует длину под канал (300–800 знаков для ТГ)",
      "Делает 2 варианта для A/B-теста",
      "Расставляет эмодзи и форматирование",
    ],
    tools: ["База знаний"],
    runs: 9, cost: "$0.66",
    currentTask: "Текст к идее «Чек-лист SMM»",
    lastActive: "30 мин назад",
    stats: { week: 9, label: "текстов" },
    kb: {
      inputs:  [],
      outputs: [
        { kind: "text",  title: "Готовые тексты" },
        { kind: "text",  title: "A/B варианты"   },
      ],
    },
    pipeline: [
      { title: "Идеи на апруве",   status: "ready",   unread: false, kb: "Идеи постов"    },
      { title: "Черновики текстов", status: "ready",   unread: true,  kb: "Готовые тексты" },
      { title: "A/B варианты",      status: "pending", unread: false, kb: "A/B варианты"   },
    ],
    tasks: [
      { title: "Написать текст по идее",  desc: "хук + тело + призыв", cron: null, tool: "Копирайтер Mary", out: "Тексты", status: "В работе" },
      { title: "Сделать A/B варианты",    desc: "2 версии на идею",    cron: null, tool: "Копирайтер Mary", out: "Тексты", status: "В работе" },
      { title: "Адаптировать под канал",  desc: "длина 300–800 знаков", cron: null, tool: "Копирайтер Mary", out: "Тексты", status: "Запланирована" },
      { title: "Отдать на апрув",         desc: "в чат отдела",         cron: null, tool: "Чат-бот",         out: "Чат",    status: "Запланирована" },
    ],
    integrations: [
      { name: "Google Sheets", desc: "Хранение черновиков текстов", on: true },
    ],
  },
  {
    id: "analyst", label: "Аналитик", color: "#FF6FB3", x: 580, y: 200, hasUpdate: false, unread: 0,
    role: "Снимает аналитику с опубликованных постов и формирует инсайты",
    model: "gpt-4o", reasoning: "medium",
    skills: [
      "Снимает метрики через TG Stat API",
      "Сравнивает с прошлыми постами канала",
      "Считает CTR, охват, ER",
      "Находит инсайты для следующих постов",
      "Формирует выводы для маркетолога",
    ],
    tools: ["База знаний", "TG Stat API", "Web browser"],
    runs: 5, cost: "$0.18",
    currentTask: "Ждёт публикации поста #14",
    lastActive: "вчера",
    stats: { week: 5, label: "отчётов" },
    kb: {
      inputs:  [],
      outputs: [
        { kind: "report", title: "Аналитика поста"     },
        { kind: "report", title: "Рекомендации на след." },
      ],
    },
    pipeline: [
      { title: "Опубликованные посты",   status: "ready",   unread: false, kb: "Готовые тексты"        },
      { title: "Метрики и охваты",       status: "ready",   unread: false, kb: "Аналитика поста"       },
      { title: "Рекомендации Маркетологу", status: "pending", unread: false, kb: "Рекомендации на след." },
    ],
    tasks: [
      { title: "Снять метрики поста",         desc: "через 24ч после публикации", cron: "cron +24h after publish", tool: "TG Stat",       out: "Аналитика"    },
      { title: "Сравнить с прошлыми",         desc: "тренд по каналу",            cron: null,                       tool: "Аналитик Mary", out: "Аналитика"    },
      { title: "Сформировать инсайты",        desc: "что зашло / что нет",        cron: null,                       tool: "Аналитик Mary", out: "Рекомендации" },
      { title: "Отчёт Маркетологу",           desc: "к планированию след. недели", cron: "cron weekly fri 16:00",   tool: "Аналитик Mary", out: "Чат"          },
    ],
    integrations: [
      { name: "Telegram",      desc: "Чтение метрик и реакций постов", on: true },
      { name: "Google Sheets", desc: "Лог метрик за период",           on: true },
    ],
  },
  {
    id: "designer", label: "Дизайнер", color: "#7A86FF", x: 580, y: 320, hasUpdate: true, unread: 1,
    role: "Генерит обложки и визуал к постам в стиле бренда Mary",
    model: "flux-pro + dall-e-3", reasoning: "minimal",
    skills: [
      "Генерит обложки в брендстиле Mary",
      "Делает 3 варианта на выбор",
      "Подбирает палитру под контекст поста",
      "Адаптирует под mobile-first превью",
      "Учитывает гайдлайны бренда",
    ],
    tools: ["База знаний", "Image generation"],
    runs: 7, cost: "$2.10",
    currentTask: "Обложка к посту #1, варианты 1–3",
    lastActive: "15 мин назад",
    stats: { week: 7, label: "визуалов" },
    kb: {
      inputs:  [],
      outputs: [
        { kind: "image", title: "Обложки постов" },
        { kind: "image", title: "Финал"          },
      ],
    },
    pipeline: [
      { title: "Концепты от Маркетолога", status: "ready",   unread: false, kb: "Концепты"        },
      { title: "3 варианта обложки",      status: "ready",   unread: true,  kb: "Обложки постов"  },
      { title: "Финальный визуал",        status: "pending", unread: false, kb: "Финал"           },
    ],
    tasks: [
      { title: "Сгенерить 3 обложки",        desc: "разные палитры и композиции", cron: null, tool: "flux-pro",      out: "Обложки" },
      { title: "Адаптировать под mobile",    desc: "превью в ленте ТГ",           cron: null, tool: "Дизайнер Mary", out: "Обложки" },
      { title: "Финализировать выбранный",   desc: "после апрува",                cron: null, tool: "Дизайнер Mary", out: "Финал"   },
      { title: "Отдать в публикацию",        desc: "в чат отдела",                cron: null, tool: "Чат-бот",       out: "Чат"     },
    ],
    integrations: [
      { name: "Figma",         desc: "Сборка финального макета",       on: true },
      { name: "Google Sheets", desc: "Реестр визуалов и связи с постами", on: true },
    ],
  },
];

export const EDGES = [
  ["researcher", "marketer"],
  ["marketer", "copywriter"],
  ["marketer", "analyst"],
  ["marketer", "designer"],
];
export const CARD_W = 180;
export const CARD_H = 64;

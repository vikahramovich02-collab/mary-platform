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
    flow: {
      nodes: [
        // ── ВХОД ──
        { id: "in-insights",  kind: "input",    title: "Инсайт-карточки",   sub: "от Ресерчера",          ox: -520, oy: -120 },
        { id: "in-brand",     kind: "input",    title: "Контекст бренда",   sub: "ToV, ниша, аудитория",  ox: -520, oy:   40 },
        { id: "in-history",   kind: "input",    title: "История постов",    sub: "что уже публиковали",   ox: -520, oy:  200 },

        // ── АНАЛИЗ ──
        { id: "s1-cluster",   kind: "llm-step", title: "Кластеризатор",     sub: "темы недели · LLM",     ox: -240, oy:  -40 },
        { id: "s2-relevance", kind: "llm-step", title: "Фильтр релевантности", sub: "ниша Mary · LLM",   ox: -240, oy:  120 },

        // ── ГЕНЕРАЦИЯ ──
        { id: "s3-ideas",     kind: "llm-step", title: "Генератор идей",    sub: "3 идеи с обоснованием", ox:   40, oy:  -40 },
        { id: "s4-angle",     kind: "llm-step", title: "Поиск угла подачи", sub: "что своего · LLM",      ox:   40, oy:  120 },

        // ── УПАКОВКА ──
        { id: "s5-concepts",  kind: "llm-step", title: "Упаковщик концептов", sub: "идея + угол + формат", ox:  280, oy:   40 },

        // ── ВЫХОД ──
        { id: "out-ideas",    kind: "next-agent",  title: "Идеи постов",    sub: "→ Копирайтер",          ox:  520, oy: -80 },
        { id: "out-concepts", kind: "output-kb",   title: "Концепты",       sub: "→ База знаний",         ox:  520, oy:  80 },
      ],
      edges: [
        ["in-insights",  "s1-cluster"],
        ["in-history",   "s2-relevance"],
        ["in-brand",     "s2-relevance"],
        ["s1-cluster",   "s3-ideas"],
        ["s2-relevance", "s3-ideas"],
        ["s3-ideas",     "s4-angle"],
        ["s3-ideas",     "s5-concepts"],
        ["s4-angle",     "s5-concepts"],
        ["s5-concepts",  "out-ideas"],
        ["s5-concepts",  "out-concepts"],
      ],
    },
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
    flow: {
      nodes: [
        // ── ВХОД ──
        { id: "in-idea",    kind: "input",    title: "Идея поста",       sub: "от Маркетолога",          ox: -520, oy: -120 },
        { id: "in-tov",     kind: "input",    title: "ToV бриф",         sub: "тон, длина, стиль Mary",  ox: -520, oy:   40 },
        { id: "in-archive", kind: "input",    title: "Архив постов",     sub: "что уже выходило",        ox: -520, oy:  200 },

        // ── НАПИСАНИЕ ──
        { id: "s1-hook",    kind: "llm-step", title: "Хук",              sub: "первое предложение · LLM", ox: -220, oy: -80 },
        { id: "s2-body",    kind: "llm-step", title: "Тело поста",       sub: "суть + аргументы · LLM",  ox: -220, oy:  80 },

        // ── ДОРАБОТКА ──
        { id: "s3-cta",     kind: "llm-step", title: "CTA + концовка",   sub: "призыв к действию · LLM", ox:   60, oy:  -40 },
        { id: "s4-ab",      kind: "llm-step", title: "A/B вариант",      sub: "альтернативный хук · LLM", ox:   60, oy:  120 },

        // ── ВЫХОД ──
        { id: "out-text",   kind: "next-agent",  title: "Готовый текст", sub: "→ Дизайнер",              ox:  520, oy:  -80 },
        { id: "out-ab",     kind: "output-kb",   title: "A/B варианты",  sub: "→ База знаний",           ox:  520, oy:   80 },
      ],
      edges: [
        ["in-idea",    "s1-hook"],
        ["in-tov",     "s1-hook"],
        ["in-archive", "s2-body"],
        ["in-tov",     "s2-body"],
        ["s1-hook",    "s3-cta"],
        ["s2-body",    "s3-cta"],
        ["s1-hook",    "s4-ab"],
        ["s3-cta",     "out-text"],
        ["s4-ab",      "out-ab"],
      ],
    },
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
    flow: {
      nodes: [
        // ── ВХОД ──
        { id: "in-post",    kind: "input",    title: "Опубликованный пост", sub: "ссылка + текст",          ox: -520, oy:  -80 },
        { id: "in-history", kind: "input",    title: "История постов",      sub: "архив метрик из БЗ",      ox: -520, oy:   80 },

        // ── СБОР ДАННЫХ ──
        { id: "s1-fetch",   kind: "subagent", title: "Сбор метрик",         sub: "охват · ER · репосты · CTR", ox: -240, oy:  -80 },
        { id: "s2-compare", kind: "llm-step", title: "Сравнение",           sub: "vs. предыдущие 10 · LLM", ox: -240, oy:   80 },

        // ── АНАЛИЗ ──
        { id: "s3-why",     kind: "llm-step", title: "Гипотезы",            sub: "почему зашло / не зашло", ox:   40, oy:    0 },

        // ── ВЫХОД ──
        { id: "out-report", kind: "output-kb",  title: "Отчёт по посту",    sub: "→ База знаний",           ox:  520, oy:  -80 },
        { id: "out-rec",    kind: "next-agent",  title: "Рекомендации",      sub: "→ Маркетолог",            ox:  520, oy:   80 },
      ],
      edges: [
        ["in-post",    "s1-fetch"],
        ["in-history", "s2-compare"],
        ["s1-fetch",   "s2-compare"],
        ["s1-fetch",   "s3-why"],
        ["s2-compare", "s3-why"],
        ["s3-why",     "out-report"],
        ["s3-why",     "out-rec"],
      ],
    },
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
    flow: {
      nodes: [
        // ── ВХОД ──
        { id: "in-concept",  kind: "input",    title: "Концепт поста",      sub: "текст + идея · Маркетолог",  ox: -520, oy: -120 },
        { id: "in-brand",    kind: "input",    title: "Брендбук",           sub: "цвета, шрифты, стиль",       ox: -520, oy:   40 },
        { id: "in-text",     kind: "input",    title: "Готовый текст",      sub: "от Копирайтера",             ox: -520, oy:  200 },

        // ── ПРОМПТЫ ──
        { id: "s1-prompts",  kind: "llm-step", title: "Генератор промптов", sub: "3 стиля: minimal, bold, editorial", ox: -220, oy:   40 },

        // ── ГЕНЕРАЦИЯ ──
        { id: "s2-v1",       kind: "subagent", title: "Вариант 1",          sub: "minimalist · image-gen",     ox:   60, oy: -160 },
        { id: "s2-v2",       kind: "subagent", title: "Вариант 2",          sub: "editorial · image-gen",      ox:   60, oy:  -20 },
        { id: "s2-v3",       kind: "subagent", title: "Вариант 3",          sub: "bold · image-gen",           ox:   60, oy:  120 },

        // ── ВЫХОД ──
        { id: "out-covers",  kind: "next-agent",  title: "3 варианта обложки", sub: "→ на апрув",              ox:  520, oy:  -80 },
        { id: "out-final",   kind: "output-kb",   title: "Финальный визуал",   sub: "→ База знаний",           ox:  520, oy:   80 },
      ],
      edges: [
        ["in-concept",  "s1-prompts"],
        ["in-brand",    "s1-prompts"],
        ["in-text",     "s1-prompts"],
        ["s1-prompts",  "s2-v1"],
        ["s1-prompts",  "s2-v2"],
        ["s1-prompts",  "s2-v3"],
        ["s2-v1",       "out-covers"],
        ["s2-v2",       "out-covers"],
        ["s2-v3",       "out-covers"],
        ["out-covers",  "out-final"],
      ],
    },
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

// ── Instagram workflow ───────────────────────────────────────────
export const INSTAGRAM_AGENTS = [
  {
    id: "researcher", label: "Ресерчер", color: "#3F95FF", x: 60, y: 290, hasUpdate: true, unread: 1,
    role: "Исследует тренды и конкурентов в Instagram",
    skills: ["Анализ конкурентов", "Тренды Reels", "Анализ хэштегов", "Бенчмарки ER"],
    tools: ["База знаний", "Web browser", "Instagram API"],
    stats: { week: 8, label: "ресёрчей" },
    flow: {
      nodes: [
        { id: "in-comps",   kind: "input",    title: "Конкуренты",        sub: "список аккаунтов из БЗ",     ox: -520, oy: -120 },
        { id: "in-trends",  kind: "input",    title: "Триггеры трендов",  sub: "Reels, хэштеги, аудио",      ox: -520, oy:   40 },
        { id: "s1-parser",  kind: "subagent", title: "Парсер аккаунтов",  sub: "охват · ER · формат",        ox: -220, oy: -80 },
        { id: "s2-hashtag", kind: "subagent", title: "Хэштег-сканер",     sub: "топ по нише",                ox: -220, oy:  80 },
        { id: "s3-cluster", kind: "llm-step", title: "Кластер трендов",   sub: "тренды + форматы · LLM",     ox:   60, oy:  -40 },
        { id: "out-ins",    kind: "next-agent",  title: "Инсайты недели", sub: "→ Маркетолог",               ox:  520, oy:  -80 },
        { id: "out-kb",     kind: "output-kb",   title: "Топ-посты",      sub: "→ База знаний",              ox:  520, oy:   80 },
      ],
      edges: [
        ["in-comps","s1-parser"],["in-trends","s2-hashtag"],
        ["s1-parser","s3-cluster"],["s2-hashtag","s3-cluster"],
        ["s3-cluster","out-ins"],["s3-cluster","out-kb"],
      ],
    },
  },
  {
    id: "marketer", label: "Маркетолог", color: "#FF8B3D", x: 330, y: 290, hasUpdate: false, unread: 0,
    role: "Формирует контент-план: посты, Reels, Stories",
    skills: ["Контент-стратегия Instagram", "Планирование Reels", "Stories-воронки"],
    tools: ["База знаний"],
    stats: { week: 6, label: "планов" },
    flow: {
      nodes: [
        { id: "in-research", kind: "input",    title: "Инсайты Ресерчера", sub: "тренды недели",             ox: -520, oy: -120 },
        { id: "in-brief",    kind: "input",    title: "Бренд-бриф",        sub: "ToV, цели, аудитория",      ox: -520, oy:   40 },
        { id: "s1-ideas",    kind: "llm-step", title: "Генерация идей",    sub: "посты / Reels / Stories",   ox: -220, oy:  -40 },
        { id: "s2-rank",     kind: "llm-step", title: "Приоритизация",     sub: "охват × бренд × новизна",   ox:   60, oy:  -40 },
        { id: "out-posts",   kind: "next-agent", title: "Идеи постов",     sub: "→ Копирайтер",              ox:  520, oy: -160 },
        { id: "out-video",   kind: "next-agent", title: "Концепты Reels",  sub: "→ Видеограф",               ox:  520, oy:  -40 },
        { id: "out-stories", kind: "next-agent", title: "Темы Stories",    sub: "→ Stories-мейкер",          ox:  520, oy:   80 },
      ],
      edges: [
        ["in-research","s1-ideas"],["in-brief","s1-ideas"],
        ["s1-ideas","s2-rank"],
        ["s2-rank","out-posts"],["s2-rank","out-video"],["s2-rank","out-stories"],
      ],
    },
  },
  {
    id: "copywriter", label: "Копирайтер", color: "#7A86FF", x: 600, y: 60, hasUpdate: false, unread: 0,
    role: "Пишет подписи к постам и хуки для Reels",
    skills: ["Посты с хуком", "Подписи к Reels", "Хэштег-наборы"],
    tools: ["База знаний"],
    stats: { week: 12, label: "постов" },
    flow: {
      nodes: [
        { id: "in-idea",    kind: "input",    title: "Идея поста",        sub: "от Маркетолога",             ox: -520, oy: -120 },
        { id: "in-tov",     kind: "input",    title: "ToV бриф",          sub: "тон и стиль аккаунта",       ox: -520, oy:   40 },
        { id: "s1-hook",    kind: "llm-step", title: "Хук (первая строка)", sub: "цепляет за 2 сек · LLM",  ox: -200, oy: -80 },
        { id: "s2-caption", kind: "llm-step", title: "Подпись поста",     sub: "история + CTA · LLM",        ox: -200, oy:  80 },
        { id: "s3-hashtags",kind: "subagent", title: "Хэштег-подборщик", sub: "30 тегов по нише",           ox:   80, oy:  -40 },
        { id: "out-text",   kind: "next-agent", title: "Готовый текст",   sub: "→ Дизайнер",                 ox:  520, oy:  -80 },
        { id: "out-kb",     kind: "output-kb",  title: "Архив текстов",   sub: "→ База знаний",              ox:  520, oy:   80 },
      ],
      edges: [
        ["in-idea","s1-hook"],["in-tov","s1-hook"],
        ["in-idea","s2-caption"],["in-tov","s2-caption"],
        ["s1-hook","s3-hashtags"],["s2-caption","s3-hashtags"],
        ["s3-hashtags","out-text"],["s3-hashtags","out-kb"],
      ],
    },
  },
  {
    id: "videographer", label: "Видеограф", color: "#34C759", x: 600, y: 190, hasUpdate: false, unread: 0,
    role: "Снимает и монтирует Reels и видео-посты",
    skills: ["Сценарии Reels", "Монтаж вертикального видео", "Саунддизайн"],
    tools: ["Видео-генератор", "База знаний"],
    stats: { week: 4, label: "видео" },
    flow: {
      nodes: [
        { id: "in-concept", kind: "input",    title: "Концепт Reels",     sub: "от Маркетолога",             ox: -520, oy: -120 },
        { id: "in-tov",     kind: "input",    title: "Стиль бренда",      sub: "цвета, темп, tone",          ox: -520, oy:   40 },
        { id: "s1-script",  kind: "subagent", title: "Сценарист",         sub: "структура + текст · LLM",    ox: -200, oy: -120 },
        { id: "s2-shot",    kind: "subagent", title: "Оператор",          sub: "раскадровка + съёмка",       ox: -200, oy:    0 },
        { id: "s3-sound",   kind: "subagent", title: "Саунд-дизайнер",   sub: "трек + синхрон",             ox: -200, oy:  120 },
        { id: "s4-edit",    kind: "subagent", title: "Монтажёр",          sub: "нарезка + эффекты",          ox:   80, oy:  -40 },
        { id: "s5-cover",   kind: "llm-step", title: "Обложка Reels",    sub: "превью с хуком",             ox:   80, oy:  100 },
        { id: "out-video",  kind: "next-agent", title: "Готовый Reels",   sub: "→ Дизайнер",                 ox:  520, oy:  -80 },
        { id: "out-kb",     kind: "output-kb",  title: "Видео-архив",     sub: "→ База знаний",              ox:  520, oy:   80 },
      ],
      edges: [
        ["in-concept","s1-script"],["in-tov","s1-script"],
        ["in-concept","s2-shot"],["in-tov","s3-sound"],
        ["s1-script","s2-shot"],["s2-shot","s4-edit"],
        ["s3-sound","s4-edit"],["s4-edit","s5-cover"],
        ["s4-edit","out-video"],["s5-cover","out-kb"],
      ],
    },
  },
  {
    id: "stories", label: "Stories-мейкер", color: "#FF6FB3", x: 600, y: 320, hasUpdate: false, unread: 0,
    role: "Создаёт интерактивные Stories: опросы, реакции, квизы",
    skills: ["Stories с вовлечением", "Опросы и квизы", "Хайлайты"],
    tools: ["Шаблоны Stories", "База знаний"],
    stats: { week: 10, label: "stories" },
    flow: {
      nodes: [
        { id: "in-theme",  kind: "input",    title: "Тема Stories",       sub: "от Маркетолога",             ox: -520, oy: -120 },
        { id: "in-brand",  kind: "input",    title: "Бренд-кит",          sub: "цвета, шрифты, стикеры",     ox: -520, oy:   40 },
        { id: "s1-script", kind: "subagent", title: "Сценарист Stories", sub: "серия из 5–10 экранов",      ox: -200, oy: -80 },
        { id: "s2-design", kind: "subagent", title: "Дизайнер шаблонов", sub: "макеты по бренду",           ox: -200, oy:  80 },
        { id: "s3-inter",  kind: "subagent", title: "UX-взаимодействие", sub: "опросы, квизы, слайдеры",    ox:   80, oy:  -40 },
        { id: "s4-anim",   kind: "subagent", title: "Аниматор",          sub: "переходы + анимации",        ox:   80, oy:  100 },
        { id: "out-pack",  kind: "next-agent", title: "Пакет Stories",    sub: "→ Дизайнер",                 ox:  520, oy:  -80 },
        { id: "out-hl",    kind: "output-kb",  title: "Хайлайты",         sub: "→ База знаний",              ox:  520, oy:   80 },
      ],
      edges: [
        ["in-theme","s1-script"],["in-brand","s2-design"],
        ["s1-script","s3-inter"],["s2-design","s3-inter"],
        ["s3-inter","s4-anim"],["s4-anim","out-pack"],["s4-anim","out-hl"],
      ],
    },
  },
  {
    id: "designer", label: "Дизайнер", color: "#7A86FF", x: 600, y: 450, hasUpdate: false, unread: 0,
    role: "Создаёт визуалы для постов, Reels и Stories",
    skills: ["Карточки постов", "Обложки Reels", "Визуалы Stories"],
    tools: ["Imagen", "База знаний"],
    stats: { week: 8, label: "дизайнов" },
    flow: {
      nodes: [
        { id: "in-text",    kind: "input",    title: "Текст поста",        sub: "от Копирайтера",             ox: -520, oy: -160 },
        { id: "in-video",   kind: "input",    title: "Reels-файл",         sub: "от Видеографа",              ox: -520, oy:  -40 },
        { id: "in-stories", kind: "input",    title: "Пакет Stories",      sub: "от Stories-мейкера",         ox: -520, oy:   80 },
        { id: "s1-concept", kind: "llm-step", title: "Концепт визуала",   sub: "цвет + компоновка · LLM",    ox: -180, oy: -80 },
        { id: "s2-render",  kind: "subagent", title: "Генератор изображений", sub: "Higgsfield / SDXL",      ox:   80, oy: -120 },
        { id: "s3-cover",   kind: "subagent", title: "Обложка Reels",     sub: "превью · 9:16",              ox:   80, oy:    0 },
        { id: "s4-kit",     kind: "subagent", title: "Дизайн-кит Stories", sub: "5–10 экранов",              ox:   80, oy:  120 },
        { id: "out-post",   kind: "next-agent", title: "Готовый пост",     sub: "→ Аналитик",                 ox:  520, oy:  -80 },
        { id: "out-kb",     kind: "output-kb",  title: "Медиа-библиотека", sub: "→ База знаний",              ox:  520, oy:   80 },
      ],
      edges: [
        ["in-text","s1-concept"],["in-video","s1-concept"],["in-stories","s1-concept"],
        ["s1-concept","s2-render"],["s1-concept","s3-cover"],["s1-concept","s4-kit"],
        ["s2-render","out-post"],["s3-cover","out-kb"],["s4-kit","out-kb"],
      ],
    },
  },
  {
    id: "analyst", label: "Аналитик", color: "#FF6FB3", x: 600, y: 560, hasUpdate: false, unread: 0,
    role: "Отслеживает охваты, ER, рост подписчиков по каналам",
    skills: ["Метрики Instagram", "Анализ Reels", "Отчёты Stories"],
    tools: ["Instagram Insights", "База знаний"],
    stats: { week: 4, label: "отчётов" },
    flow: {
      nodes: [
        { id: "in-post",   kind: "input",    title: "Опубликованный пост", sub: "пост / Reels / Story",       ox: -520, oy: -80 },
        { id: "in-hist",   kind: "input",    title: "Исторические данные", sub: "архив метрик из БЗ",         ox: -520, oy:  80 },
        { id: "s1-reach",  kind: "subagent", title: "Парсер охватов",     sub: "Instagram Insights API",      ox: -200, oy: -80 },
        { id: "s2-er",     kind: "subagent", title: "ER-калькулятор",     sub: "лайки + комменты + сохр.",    ox: -200, oy:  80 },
        { id: "s3-insight",kind: "llm-step", title: "Синтез инсайтов",    sub: "что сработало · LLM",         ox:   80, oy:  -40 },
        { id: "out-report",kind: "output-kb",  title: "Отчёт по посту",   sub: "→ База знаний",               ox:  520, oy:  -80 },
        { id: "out-recs",  kind: "next-agent", title: "Рекомендации",     sub: "→ Маркетолог",                ox:  520, oy:   80 },
      ],
      edges: [
        ["in-post","s1-reach"],["in-hist","s2-er"],
        ["s1-reach","s3-insight"],["s2-er","s3-insight"],
        ["s3-insight","out-report"],["s3-insight","out-recs"],
      ],
    },
  },
];

export const INSTAGRAM_EDGES = [
  ["researcher",  "marketer"],
  ["marketer",    "copywriter"],
  ["marketer",    "videographer"],
  ["marketer",    "stories"],
  ["marketer",    "designer"],
  ["marketer",    "analyst"],
];

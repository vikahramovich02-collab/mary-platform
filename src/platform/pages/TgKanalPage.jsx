import { useState, useRef, useEffect, useMemo } from "react";
import { color, transition, font } from "../../ui/tokens.js";

// Реплика экрана Figma node 5522:2547 (file: o1syNp93H3v2dyA3JHp4em — Mary)
// Сабпейдж "Тг-канал" в отделе "СММ".

const SIDEBAR_W = 220;
const RIGHT_W = 64;

// ── Иконки (14px по умолчанию для меню) ─────────────────────
function I({ d, size = 14, stroke = 1.75, fill = "none" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
         strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {d}
    </svg>
  );
}
// PNG-иконка из брендбука
function P({ src, size = 14 }) {
  return <img src={src} alt="" style={{ width: size, height: size, objectFit: "contain", display: "block" }} />;
}
const ic = {
  home: <I d={<path d="M3.5 10.8 12 3.5l8.5 7.3V20a1 1 0 0 1-1 1h-4v-6h-7v6h-4a1 1 0 0 1-1-1v-9.2z" />} />,
  chat:         <P src="/icons/icon_main-2.png" />,
  inbox:        <P src="/icons/icon_main-3.png" />,
  bizproc:      <P src="/icons/icon_main-4.png" />,
  depts:        <P src="/icons/icon_main-5.png" />,
  people:       <P src="/icons/icon_main-6.png" />,
  tasks:        <P src="/icons/icon_main-7.png" />,
  kb:           <P src="/icons/icon_main-8.png" />,
  integrations: <P src="/icons/icon_main-9.png" />,
  hr:           <P src="/icons/icon_main-3.png" />,
  help:         <P src="/icons/icon_main-9.png" />,
  support:      <P src="/icons/icon_main.png" />,
  settings:     <P src="/icons/icon_main-1.png" />,
  smm: <I d={<path d="M12 3c-.6 2.5.4 3.5-.5 5C10 6.7 8.7 7 8.4 8.5 8 10.4 6 11.7 6 14.2A6 6 0 0 0 18 14c0-3.4-2.7-4.6-3.6-7.5C13.7 4.6 13 3.6 12 3z" />} />,
  // Тёмный силуэт-голова с маленьким хвостиком справа (для отделов)
  dept: (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8c0-1.5-.4-2.9-1.2-4.1-.5.4-1.2.6-1.9.6-1.7 0-3-1.3-3-3 0-.6.2-1.2.4-1.7C13.6 3.3 12.8 3 12 3z" />
      <circle cx="17" cy="6.5" r="2" />
    </svg>
  ),
  chevron: <I d={<path d="M6 9l6 6 6-6" />} size={14} stroke={1.8} />,
  chevronUp: <I d={<path d="M6 15l6-6 6 6" />} size={14} stroke={1.8} />,
  plus: <I d={<path d="M12 5v14M5 12h14" />} size={14} stroke={1.9} />,
  collapse: <P src="/icons/streamline-flex_layout-right-sidebar-remix.png" size={18} />,
  // Робот для карточек агентов (цвет наследуется → меняется per-агент)
  agentBot: (
    <svg width={26} height={26} viewBox="0 0 24 24">
      <rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor" />
      <rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor" />
      <circle cx="9.3"  cy="13" r="1.4" fill="white" />
      <circle cx="14.7" cy="13" r="1.4" fill="white" />
    </svg>
  ),
  hand: <I d={<><path d="M18 11V6a2 2 0 1 0-4 0v5" /><path d="M14 10V4a2 2 0 1 0-4 0v6" /><path d="M10 10.5V6a2 2 0 0 0-4 0v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-1-5.5-2.5L2 15c-.6-.9-.4-2 .5-2.5.9-.6 2-.4 2.5.5L7 15" /></>} size={16} />,
  zoomIn: <I d={<path d="M12 5v14M5 12h14" />} size={16} stroke={1.9} />,
  zoomOut: <I d={<path d="M5 12h14" />} size={16} stroke={1.9} />,
  expand: <I d={<><path d="M3 9V3h6" /><path d="M21 9V3h-6" /><path d="M3 15v6h6" /><path d="M21 15v6h-6" /></>} size={16} />,
  close: <I d={<path d="M6 6l12 12M18 6L6 18" />} size={16} stroke={1.7} />,
  arrowUpRight: <I d={<><path d="M7 17L17 7" /><path d="M8 7h9v9" /></>} size={16} stroke={1.7} />,
  mic: <I d={<><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><path d="M12 18v3" /></>} size={16} stroke={1.7} />,
  plusBig: <I d={<path d="M12 5v14M5 12h14" />} size={18} stroke={1.7} />,
  // Icons для КБ
  file: <I d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></>} size={16} stroke={1.6} />,
  image: <I d={<><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></>} size={16} stroke={1.6} />,
  link: <I d={<><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" /><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" /></>} size={16} stroke={1.6} />,
  inboxArrow: <I d={<><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6L5.5 5z" /></>} size={16} stroke={1.6} />,
  package: <I d={<><path d="M16.5 9.4l-9-5.19" /><path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><path d="M3.27 6.96L12 12l8.73-5.04" /><path d="M12 22.08V12" /></>} size={16} stroke={1.6} />,
  attach: <I d={<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />} size={16} stroke={1.7} />,
  uploadCloud: <I d={<><path d="M16 16l-4-4-4 4" /><path d="M12 12v9" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /><path d="M16 16l-4-4-4 4" /></>} size={22} stroke={1.6} />,
  book: <I d={<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>} size={16} stroke={1.6} />,
  paperPlane: <I d={<><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></>} size={14} stroke={1.6} />,
  // Метрики постов
  eye: <I d={<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>} size={13} stroke={1.6} />,
  heart: <I d={<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />} size={13} stroke={1.6} />,
  bubbleSm: <I d={<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />} size={13} stroke={1.6} />,
  mediaPic: <I d={<><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></>} size={13} stroke={1.6} />,
  externalLink: <I d={<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><path d="M15 3h6v6" /><path d="M10 14L21 3" /></>} size={13} stroke={1.6} />,
  text: <I d={<><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h10" /></>} size={16} stroke={1.7} />,
  pointer: (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.5 3l13 7-5.6 1.6 1.6 5.6-2 1-3-7-4 4z" />
    </svg>
  ),
  undo: <I d={<><path d="M9 14L4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-2" /></>} size={14} stroke={1.7} />,
  redo: <I d={<><path d="M15 14l5-5-5-5" /><path d="M20 9H9a5 5 0 0 0 0 10h2" /></>} size={14} stroke={1.7} />,
  arrowRight: <I d={<><path d="M5 12h14" /><path d="M13 5l7 7-7 7" /></>} size={14} stroke={1.7} />,
  trendUp:   <I d={<><path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" /></>} size={13} stroke={1.7} />,
  trendDown: <I d={<><path d="M3 7l6 6 4-4 8 8" /><path d="M14 17h7v-7" /></>} size={13} stroke={1.7} />,
  searching: <I d={<><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></>} size={13} stroke={1.7} />,
  checkSm: <I d={<path d="M5 12.5l4.5 4.5L19 7.5" />} size={13} stroke={2} />,
  fileSm: <I d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></>} size={13} stroke={1.7} />,
  spinnerSm: <I d={<><path d="M21 12a9 9 0 1 1-6.2-8.55" /></>} size={13} stroke={1.7} />,
  // Status (для pipeline items) — минималистично, без зелёных ячеек
  statusDone: (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#262633" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  statusCurrent: (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" fill="#FF8B3D" />
    </svg>
  ),
  statusPending: (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" stroke="rgba(38,38,51,0.25)" strokeWidth="1.5" fill="none" />
    </svg>
  ),
  // Hover-toolbar над карточкой агента
  play:    <I d={<path d="M6 4l14 8-14 8V4z" />} size={14} stroke={1.7} fill="currentColor" />,
  stopSm:  <I d={<rect x="6" y="6" width="12" height="12" rx="2" />} size={14} stroke={1.7} fill="currentColor" />,
  gear:    <I d={<><circle cx="12" cy="12" r="3" /><path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></>} size={14} stroke={1.6} />,
  chatSm:  <I d={<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />} size={14} stroke={1.6} />,
  // Lucide-style 4-конечный sparkle
  spark: (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c.4 0 .8.3.9.7l1 4 4 1c.4.1.7.5.7.9s-.3.8-.7.9l-4 1-1 4c-.1.4-.5.7-.9.7s-.8-.3-.9-.7l-1-4-4-1c-.4-.1-.7-.5-.7-.9s.3-.8.7-.9l4-1 1-4c.1-.4.5-.7.9-.7z" />
      <path d="M19 14c.3 0 .6.2.7.5l.5 1.6 1.6.5c.3.1.5.4.5.7s-.2.6-.5.7l-1.6.5-.5 1.6c-.1.3-.4.5-.7.5s-.6-.2-.7-.5l-.5-1.6-1.6-.5c-.3-.1-.5-.4-.5-.7s.2-.6.5-.7l1.6-.5.5-1.6c.1-.3.4-.5.7-.5z" />
    </svg>
  ),
};

// ── Mary логотип (PNG из брендбука) ─────────────────────────
function MaryLogo({ height = 22 }) {
  return <img src="/brand_logo.png" alt="mary" style={{ height, width: "auto", display: "block" }} />;
}

// ── Данные графа ────────────────────────────────────────────
const AGENTS = [
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

// Мок-сообщения чата
const MOCK_MESSAGES = [
  {
    id: "m1", agentId: "researcher", time: "09:14",
    type: "research",
    text: "Спарсил 51 пост за неделю с 31 канала. Топ по охвату:",
    items: [
      { ch: "neural_prosecco",          postId: 4821, title: "OpenAI Realtime API — latency 320 мс" },
      { ch: "zheleznyak_gi",            postId: 905,  title: "Как набрать 50k подписчиков в ТГ за год без рекламы" },
      { ch: "ai_product",               postId: 991,  title: "Anthropic Computer Use — Claude кликает сам" },
      { ch: "machinelearning_interview", postId: 2103, title: "Как готовиться к ML-собесам в 2026" },
    ],
  },
  {
    id: "m1b", agentId: "researcher", time: "09:18",
    type: "insights",
    text: "Из этих 51 поста выделил темы и форматы, которые сейчас работают:",
    trends: [
      { label: "AI-агенты и автономные workflow", direction: "up",   note: "5 постов · ср. охват 12k" },
      { label: "Telegram-рост без рекламы",        direction: "up",   note: "3 поста · высокий ER 6–8%" },
      { label: "Indie hackers / micro-MRR",        direction: "up",   note: "4 поста · много комментов" },
      { label: "Ребрендинг «AI-стартапов»",        direction: "down", note: "тема надоела, низкая вовлечённость" },
    ],
    formats: [
      "Хук с конкретной цифрой в первой строке → +30% охват",
      "Кейсы с цифрами заходят в 2.4× лучше теории",
      "Длина 300–600 знаков работает лучше лонгридов",
      "Личные истории «я попробовал» > expertise-постов на ту же тему",
    ],
    notes: [
      "У 60% топ-постов первая строка — метрика или цифра",
      "Скрины с цифрами повышают reach на ≈22%",
      "Опросы в комментах поднимают ER на 1.5 п.п.",
    ],
  },
  {
    id: "m4", agentId: "marketer", time: "09:22",
    type: "ideas",
    text: "На основе ресёрча и инсайтов от Ресерчера — вот 4 идеи постов на след. неделю. Отметь галочками те, что берём в работу — Копирайтер и Дизайнер запустятся по ним параллельно.",
    items: [
      { id: "i1", angle: "AI-агенты · кейс с цифрой", title: "Как 5 AI-агентов делают за меня недельный контент-план — кейс Mary", hook: "До Mary я тратила 14 часов в неделю на контент. Сейчас — 40 минут.", angleNote: "Хук с конкретной цифрой → +30% охват по ресёрчу" },
      { id: "i2", angle: "Indie · личная история",     title: "Год назад я закрыла агентство и пошла в SaaS. Вот что узнала", hook: "Год назад мне пришла мысль: «Если бы у меня был помощник, который ведёт весь SMM — я бы вернула себе вечера».", angleNote: "Личные истории > expertise-постов в 2.4× по ER" },
      { id: "i3", angle: "B2B · разбор-объяснялка",    title: "Почему GPT не справляется с SMM (и как помогает оркестратор агентов)", hook: "Если ChatGPT пишет тебе посты — ты в ловушке промпт-инжиниринга. Объясняю почему.", angleNote: "Контр-нарратив против общего хайпа на GPT" },
      { id: "i4", angle: "TG-рост · мини-чек-лист",    title: "Чек-лист: как настроить SMM-отдел из AI-агентов за выходные", hook: "Чек-лист из 7 шагов — от парсинга конкурентов до автопостинга.", angleNote: "Чек-листы по ресёрчу: длина 300-600 знаков работает лучше всего" },
    ],
  },
];
const EDGES = [
  ["researcher", "marketer"],
  ["marketer", "copywriter"],
  ["marketer", "analyst"],
  ["marketer", "designer"],
];
const CARD_W = 180;
const CARD_H = 64;

// ── Сайдбар-айтемы ──────────────────────────────────────────
function SideRow({ icon, label, active, indent = 0, trailing, onClick, weight = 450 }) {
  const [h, setH] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        height: 40,
        padding: `0 10px 0 ${10 + indent}px`,
        margin: "1px 8px",
        borderRadius: 8,
        background: active ? "rgba(38,38,51,0.06)" : h ? "rgba(38,38,51,0.035)" : "transparent",
        color: "#262633",
        cursor: "pointer",
        transition: transition.fast,
        userSelect: "none",
      }}
    >
      {icon && <span style={{ display: "flex", width: 14, height: 14, color: "#262633", flexShrink: 0 }}>{icon}</span>}
      <span style={{ fontSize: 13.5, fontWeight: weight, lineHeight: 1.1, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {label}
      </span>
      {trailing}
    </div>
  );
}

function SectionHeader({ label, action }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 18px 4px", color: "rgba(38,38,51,0.45)",
      fontSize: 11, fontWeight: 500,
    }}>
      <span>{label}</span>
      {action}
    </div>
  );
}

// ── Граф агентов ─────────────────────────────────────────────
function PipelineItem({ p, onOpenKb, blocked }) {
  const [h, setH] = useState(false);
  const clickable = !blocked && p.status === "ready" && p.kb;
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (clickable) onOpenKb(p.kb);
      }}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 10px",
        borderRadius: 9,
        background: h && clickable ? "rgba(38,38,51,0.06)" : "transparent",
        cursor: clickable ? "pointer" : "default",
        transition: transition.fast,
      }}
    >
      <span style={{
        fontSize: 13, fontWeight: 500,
        color: blocked ? "rgba(38,38,51,0.4)" : "#262633",
        flex: 1, minWidth: 0,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>{p.title}</span>
      {p.unread && (
        <span style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "#FF8B3D", flexShrink: 0,
        }} />
      )}
    </div>
  );
}

function AgentCard({ a, expanded, selected, dragging, approvals, onApprove, onMouseDown, onToggle, onOpenKb, onOpenChat, onOpenSettings, onOpenFlow }) {
  const [h, setH] = useState(false);
  const [running, setRunning] = useState(true);
  const hasPipeline = (a.pipeline?.length || 0) > 0;
  const showToolbar = h || expanded || selected;
  // Зависимости агентов: Copywriter и Designer ждут апрува идей маркетолога
  const blockedByMarketer = (a.id === "copywriter" || a.id === "designer") && !approvals?.marketerIdeas;
  const dot = {
    position: "absolute", top: 32, transform: "translateY(-50%)",
    width: 9, height: 9, borderRadius: "50%",
    background: color.white, border: "1px solid rgba(38,38,51,0.18)",
  };
  return (
    <div
      onMouseDown={onMouseDown}
      onClick={onToggle}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        position: "absolute", left: a.x, top: a.y,
        width: CARD_W,
        background: color.white,
        borderRadius: 24,
        boxShadow: dragging
          ? "0 12px 32px rgba(38,38,51,0.18)"
          : (selected || expanded || h)
          ? "0 2px 6px rgba(38,38,51,0.05)"
          : "0 1px 2px rgba(38,38,51,0.03)",
        display: "flex", flexDirection: "column",
        cursor: dragging ? "grabbing" : "grab",
        transition: dragging ? "none" : transition.fast,
        zIndex: dragging ? 10 : (expanded || selected) ? 4 : 1,
        userSelect: "none",
      }}
    >
      {/* Header (всегда виден) */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "0 16px", height: CARD_H,
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: a.color + "26",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <span style={{ color: a.color, display: "flex" }}>{ic.agentBot}</span>
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 510, color: "#262633", lineHeight: 1.1 }}>{a.label}</div>
          <div style={{ fontSize: 12, color: "rgba(38,38,51,0.5)", marginTop: 3 }}>Агент</div>
        </div>
      </div>

      {/* Pipeline (только в expanded) */}
      {expanded && hasPipeline && (
        <div style={{
          padding: "4px 8px 10px",
          borderTop: "1px solid rgba(38,38,51,0.06)",
          display: "flex", flexDirection: "column", gap: 2,
        }}>
          {a.pipeline.map((p, i) => (
            <PipelineItem
              key={i}
              p={p}
              onOpenKb={onOpenKb}
              blocked={blockedByMarketer}
            />
          ))}
          {blockedByMarketer && (
            <div style={{
              fontSize: 11.5, color: "rgba(38,38,51,0.55)",
              padding: "8px 10px", lineHeight: 1.4,
            }}>
              Ждёт апрува идей от Маркетолога
            </div>
          )}
          {a.flow && onOpenFlow && (
            <button
              onClick={(e) => { e.stopPropagation(); onOpenFlow(); }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 8, padding: "8px 10px", marginTop: 6,
                background: "rgba(122,134,255,0.08)",
                color: "#7A86FF",
                border: "none", borderRadius: 9,
                fontSize: 12.5, fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit",
                width: "100%", textAlign: "left",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(122,134,255,0.14)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(122,134,255,0.08)"}
            >
              <span>Раскрыть workflow</span>
              <span>{ic.arrowRight}</span>
            </button>
          )}
        </div>
      )}

      {/* Точка «есть что-то на тебя» */}
      {a.hasUpdate && (
        <span style={{
          position: "absolute", top: 8, right: 10,
          width: 8, height: 8, borderRadius: "50%",
          background: "#FF8B3D",
          boxShadow: "0 0 0 2px " + color.white,
        }} />
      )}

      {/* Hover toolbar — действия над агентом */}
      {showToolbar && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: -42, right: 0,
            display: "flex", gap: 4,
            background: color.white,
            border: "1px solid rgba(38,38,51,0.08)",
            borderRadius: 999,
            padding: "4px 6px",
            boxShadow: "0 4px 12px rgba(38,38,51,0.08)",
            zIndex: 5,
          }}
        >
          <CardToolBtn icon={ic.chatSm} title="Открыть чат" onClick={() => onOpenChat?.(a.id)} />
          <CardToolBtn icon={ic.gear}   title="Настройки"    onClick={() => onOpenSettings?.(a.id)} />
          <CardToolBtn
            icon={running ? ic.stopSm : ic.play}
            title={running ? "Остановить" : "Запустить"}
            onClick={() => setRunning(v => !v)}
            color={running ? "#FF3407" : "#34C759"}
          />
        </div>
      )}

      {/* Connection dots */}
      <span style={{ ...dot, left: -4 }} />
      <span style={{ ...dot, right: -4 }} />
    </div>
  );
}

function CardToolBtn({ icon, title, onClick, color: c }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      title={title}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 28, height: 28,
        background: h ? "rgba(38,38,51,0.06)" : "transparent",
        border: "none", borderRadius: 999,
        cursor: "pointer", color: c || "#262633",
        fontFamily: "inherit",
        transition: transition.fast,
      }}
    >{icon}</button>
  );
}

// ── Chat header с дропдауном выбора агента ──────────────────
function TypingIndicator({ agents }) {
  if (!agents?.length) return null;
  const names = agents.map(a => a.label).join(", ");
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 12.5, color: "rgba(38,38,51,0.45)",
      whiteSpace: "nowrap",
      fontFamily: "inherit",
    }}>
      <style>{`@keyframes typingDot { 0%, 80%, 100% { opacity: 0.25 } 40% { opacity: 1 } }`}</style>
      <span>{names} {agents.length > 1 ? "печатают" : "печатает"}</span>
      <span style={{ display: "inline-flex", gap: 1.5 }}>
        <span style={{ animation: "typingDot 1.2s infinite", animationDelay: "0s" }}>.</span>
        <span style={{ animation: "typingDot 1.2s infinite", animationDelay: "0.2s" }}>.</span>
        <span style={{ animation: "typingDot 1.2s infinite", animationDelay: "0.4s" }}>.</span>
      </span>
    </span>
  );
}

function ChatHeader({ activeFilter, onFilter, onClose, startDrag, mode, onToggleMode, typingAgents }) {
  const [open, setOpen] = useState(false);
  const agent = activeFilter === "all" ? null : AGENTS.find(a => a.id === activeFilter);
  const label = agent ? agent.label : "Mary (общий)";
  const dot = agent ? agent.color : "#262633";

  return (
    <div
      onMouseDown={startDrag}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 14px",
        borderBottom: "1px solid rgba(38,38,51,0.06)",
        cursor: mode === "floating" ? "move" : "default",
        userSelect: "none",
        position: "relative",
      }}
    >
      <div style={{
        width: 26, height: 26, borderRadius: 7,
        background: agent ? agent.color + "26" : "rgba(38,38,51,0.08)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: dot, flexShrink: 0,
      }}>
        <svg width={16} height={16} viewBox="0 0 24 24">
          <rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor" />
          <rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor" />
          <circle cx="9.3" cy="13" r="1.4" fill="white" />
          <circle cx="14.7" cy="13" r="1.4" fill="white" />
        </svg>
      </div>
      <button
        onMouseDown={e => e.stopPropagation()}
        onClick={() => setOpen(v => !v)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "transparent", border: "none",
          padding: "4px 6px",
          borderRadius: 7,
          fontSize: 14, fontWeight: 450, color: "#262633",
          cursor: "pointer", fontFamily: "inherit",
          position: "relative",
        }}
      >
        <span style={{ position: "relative" }}>
          {label}
          {(() => {
            const u = agent ? (agent.unread || 0) : AGENTS.reduce((s, x) => s + (x.unread || 0), 0);
            return u > 0 ? (
              <span style={{
                position: "absolute", top: -2, right: -8,
                width: 6, height: 6, borderRadius: "50%",
                background: "#FF4D2E",
              }} />
            ) : null;
          })()}
        </span>
        <span style={{ display: "flex", color: "rgba(38,38,51,0.5)", marginLeft: 4 }}>{ic.chevron}</span>
      </button>
      <TypingIndicator agents={typingAgents} />
      <div style={{ flex: 1 }} />
      <button
        onMouseDown={e => e.stopPropagation()}
        onClick={onToggleMode}
        title={mode === "docked" ? "Открепить (плавающее окно)" : "Прикрепить вниз"}
        style={{ ...zoomBtn, color: "rgba(38,38,51,0.55)", padding: 6 }}
      >{ic.arrowUpRight}</button>
      <button onMouseDown={e => e.stopPropagation()} onClick={onClose} style={{ ...zoomBtn, color: "rgba(38,38,51,0.55)", padding: 6 }}>{ic.close}</button>

      {open && (
        <div
          onMouseDown={e => e.stopPropagation()}
          style={{
            position: "absolute", top: "calc(100% - 4px)", left: 14,
            background: color.white,
            border: "1px solid rgba(38,38,51,0.1)",
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(38,38,51,0.12)",
            padding: 6,
            minWidth: 220,
            zIndex: 7,
          }}
        >
          <HeaderOpt
            label="Mary (общий)"
            active={activeFilter === "all"}
            unread={AGENTS.reduce((sum, x) => sum + (x.unread || 0), 0)}
            onClick={() => { onFilter("all"); setOpen(false); }}
          />
          {AGENTS.map(a => (
            <HeaderOpt
              key={a.id}
              agent={a}
              label={a.label}
              active={activeFilter === a.id}
              unread={a.unread || 0}
              onClick={() => { onFilter(a.id); setOpen(false); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
function HeaderOpt({ agent, label, active, unread, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        width: "100%", padding: "7px 8px",
        background: active ? "rgba(38,38,51,0.05)" : "transparent",
        border: "none", borderRadius: 7,
        cursor: "pointer", fontFamily: "inherit", textAlign: "left",
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(38,38,51,0.03)"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <div style={{
        width: 22, height: 22, borderRadius: 6,
        background: agent ? agent.color + "26" : "rgba(38,38,51,0.08)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: agent ? agent.color : "#262633", flexShrink: 0,
      }}>
        <svg width={14} height={14} viewBox="0 0 24 24">
          <rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor" />
          <rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor" />
          <circle cx="9.3" cy="13" r="1.4" fill="white" />
          <circle cx="14.7" cy="13" r="1.4" fill="white" />
        </svg>
      </div>
      <span style={{ fontSize: 13, color: "#262633", fontWeight: 500, flex: 1 }}>{label}</span>
      {unread > 0 && (
        <span style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          minWidth: 16, height: 16, padding: "0 5px",
          background: "#FF4D2E", color: color.white,
          fontSize: 10.5, fontWeight: 600, lineHeight: 1,
          borderRadius: 999,
        }}>{unread}</span>
      )}
    </button>
  );
}

// ── Filter bar (chips для фильтрации по агентам) ────────────
function FilterChip({ label, dotColor, active, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "6px 12px",
        height: 30,
        borderRadius: 8,
        border: "none",
        background: active ? "rgba(38,38,51,0.06)" : h ? "rgba(38,38,51,0.03)" : "transparent",
        color: active ? "#262633" : "rgba(38,38,51,0.3)",
        fontSize: 13, fontWeight: 400,
        cursor: "pointer",
        transition: transition.fast,
        fontFamily: "inherit",
      }}
    >
      {dotColor && <span style={{ width: 7, height: 7, borderRadius: "50%", background: dotColor }} />}
      <span>{label}</span>
    </button>
  );
}

function FilterBar({ activeFilter, onFilter }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "10px 16px",
      borderBottom: "1px solid rgba(38,38,51,0.06)",
      overflowX: "auto",
    }}>
      <FilterChip label="Все" active={activeFilter === "all"} onClick={() => onFilter("all")} />
      {AGENTS.map(a => (
        <FilterChip
          key={a.id}
          label={a.label}
          dotColor={a.color}
          active={activeFilter === a.id}
          onClick={() => onFilter(a.id)}
        />
      ))}
    </div>
  );
}

// ── Inline-карточки контента в треде ────────────────────────
function ApproveActions({ onApprove, onRefine, label = "Апрув" }) {
  const [refineOpen, setRefineOpen] = useState(false);
  const [refineText, setRefineText] = useState("");
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {onApprove && (
          <button
            onClick={onApprove}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "8px 14px",
              background: "#262633",
              color: color.white,
              border: "none",
              borderRadius: 999,
              fontSize: 13, fontWeight: 500,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >{label}</button>
        )}
        <button
          onClick={() => setRefineOpen(v => !v)}
          style={chatBtn("secondary")}
        >Доработать</button>
      </div>
      {refineOpen && (
        <div style={{
          marginTop: 8, display: "flex", gap: 8, alignItems: "flex-start",
        }}>
          <textarea
            value={refineText}
            onChange={e => setRefineText(e.target.value)}
            placeholder="Что поправить?"
            rows={2}
            style={{
              flex: 1,
              padding: "8px 10px",
              border: "1px solid rgba(38,38,51,0.12)",
              borderRadius: 10,
              fontSize: 13, fontFamily: "inherit",
              resize: "vertical",
              outline: "none",
            }}
          />
          <button
            onClick={() => {
              if (!refineText.trim()) return;
              onRefine?.(refineText.trim());
              setRefineText("");
              setRefineOpen(false);
            }}
            style={{
              padding: "8px 12px",
              background: "#262633", color: color.white,
              border: "none", borderRadius: 10,
              fontSize: 13, fontWeight: 500,
              cursor: "pointer", fontFamily: "inherit",
              flexShrink: 0,
            }}
          >Отправить</button>
        </div>
      )}
    </div>
  );
}

function ResearchCard({ msg }) {
  const [allOpen, setAllOpen] = useState(false);
  const researcher = AGENTS.find(a => a.id === "researcher");
  return (
    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6, maxWidth: 550 }}>
      {msg.items.map((it, i) => (
        <a
          key={i}
          href={`https://t.me/${it.ch}/${it.postId}`}
          target="_blank" rel="noreferrer"
          style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 12px",
            background: "rgba(38,38,51,0.03)",
            borderRadius: 10,
            textDecoration: "none",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 450, color: "#262633" }}>{it.title}</div>
            <div style={{ fontSize: 12, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>@{it.ch}</div>
          </div>
          <span style={{ display: "flex", color: "rgba(38,38,51,0.45)", flexShrink: 0 }}>{ic.externalLink}</span>
        </a>
      ))}
      <button
        onClick={() => setAllOpen(true)}
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
          marginTop: 4,
          padding: "9px 14px",
          background: "transparent",
          border: "1px solid rgba(38,38,51,0.12)",
          borderRadius: 10,
          fontSize: 13, color: "#262633", fontWeight: 450,
          cursor: "pointer", fontFamily: "inherit",
          alignSelf: "flex-start",
        }}
      >
        <span>Посмотреть все 51 пост</span>
        <span style={{ display: "flex", color: "rgba(38,38,51,0.5)" }}>{ic.arrowRight}</span>
      </button>
      {allOpen && (
        <KbPopup
          item={{ title: "Свежие посты", agent: researcher }}
          onClose={() => setAllOpen(false)}
        />
      )}
    </div>
  );
}

function InsightsCard({ msg }) {
  const [open, setOpen] = useState(false);
  const heading = { fontSize: 16, fontWeight: 500, color: "#262633", letterSpacing: "-0.01em" };
  const researcher = AGENTS.find(a => a.id === "researcher");
  return (
    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 18, maxWidth: 550 }}>
      {/* Тренды */}
      {msg.trends?.length > 0 && (
        <div>
          <div style={heading}>Темы недели</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
            {msg.trends.map((t, i) => {
              const isUp = t.direction === "up";
              const dirColor = isUp ? "#34C759" : t.direction === "down" ? "#FF3407" : "rgba(38,38,51,0.45)";
              return (
                <button
                  key={i}
                  onClick={() => setOpen(true)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px",
                    background: "rgba(38,38,51,0.03)",
                    border: "none", borderRadius: 10,
                    cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                    width: "100%",
                    transition: transition.fast,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(38,38,51,0.06)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(38,38,51,0.03)"}
                >
                  <span style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 22, height: 22, borderRadius: 6,
                    background: dirColor + "1A", color: dirColor, flexShrink: 0,
                  }}>{isUp ? ic.trendUp : ic.trendDown}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 450, color: "#262633" }}>{t.label}</div>
                    <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>{t.note}</div>
                  </div>
                  <span style={{ display: "flex", color: "rgba(38,38,51,0.4)", flexShrink: 0 }}>{ic.arrowRight}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      {open && <KbPopup item={{ title: "Свежие посты", agent: researcher }} onClose={() => setOpen(false)} />}

      {/* Форматы */}
      {msg.formats?.length > 0 && (
        <div>
          <div style={heading}>Что работает по форматам</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
            {msg.formats.map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "0 4px", alignItems: "flex-start" }}>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#262633", marginTop: 8, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "#262633", lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Доп.заметки */}
      {msg.notes?.length > 0 && (
        <div>
          <div style={heading}>Заметки</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
            {msg.notes.map((n, i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "0 4px", alignItems: "flex-start" }}>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(38,38,51,0.4)", marginTop: 8, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "rgba(38,38,51,0.7)", lineHeight: 1.5 }}>{n}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function IdeasCard({ msg, onAction }) {
  const [selected, setSelected] = useState(() => new Set(msg.items.map(it => it.id)));
  const [submitted, setSubmitted] = useState(false);
  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const count = selected.size;

  return (
    <div style={cardWrap}>
      <div style={cardLabel}>Идеи на след. неделю · {msg.items.length}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
        {msg.items.map((it, i) => {
          const isSel = selected.has(it.id);
          return (
            <button
              key={it.id}
              onClick={() => !submitted && toggle(it.id)}
              disabled={submitted}
              style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                width: "100%",
                padding: "12px 14px",
                background: isSel ? "rgba(63,149,255,0.06)" : "rgba(38,38,51,0.03)",
                border: isSel ? "1px solid rgba(63,149,255,0.45)" : "1px solid transparent",
                borderRadius: 10,
                cursor: submitted ? "default" : "pointer",
                fontFamily: "inherit", textAlign: "left",
                transition: transition.fast,
              }}
            >
              <span style={{
                width: 18, height: 18, borderRadius: 5,
                border: isSel ? "none" : "1.5px solid rgba(38,38,51,0.25)",
                background: isSel ? "#3F95FF" : "transparent",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                color: color.white,
                flexShrink: 0,
                marginTop: 1,
              }}>
                {isSel && (
                  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                )}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: "rgba(38,38,51,0.55)",
                    background: color.white, padding: "2px 7px", borderRadius: 999,
                  }}>#{i + 1}</span>
                  <span style={{ fontSize: 12, color: "rgba(38,38,51,0.55)" }}>{it.angle}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 510, color: "#262633", marginTop: 6, lineHeight: 1.35 }}>{it.title}</div>
                {it.hook && (
                  <div style={{ fontSize: 12.5, color: "rgba(38,38,51,0.7)", marginTop: 6, lineHeight: 1.4, fontStyle: "italic" }}>«{it.hook}»</div>
                )}
                {it.angleNote && (
                  <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.5)", marginTop: 6 }}>↪ {it.angleNote}</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 14 }}>
        <button
          disabled={submitted || count === 0}
          onClick={() => {
            if (count === 0 || submitted) return;
            const ideas = msg.items.filter(it => selected.has(it.id));
            setSubmitted(true);
            onAction?.({ kind: "approveIdeas", ideas });
          }}
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "10px 16px",
            background: submitted ? "rgba(38,38,51,0.1)" : count === 0 ? "rgba(38,38,51,0.1)" : "#262633",
            color: submitted ? "rgba(38,38,51,0.45)" : count === 0 ? "rgba(38,38,51,0.4)" : color.white,
            border: "none",
            borderRadius: 999,
            fontSize: 13, fontWeight: 500,
            cursor: submitted || count === 0 ? "not-allowed" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {submitted ? `Передано в работу · ${count}` : count === 0 ? "Выберите идеи" : `Берём в работу · ${count}`}
        </button>
      </div>
    </div>
  );
}

// ── Tool status chip с живым таймером ───────────────────
// Дружелюбные подписи tool'ов для трейла в чате.
const TOOL_LABELS = {
  kb_list: "Смотрю базу знаний",
  kb_read: "Открываю файл",
  kb_write: "Сохраняю в базу",
  search_kb: "Ищу в базе",
  read_chat: "Читаю чат отдела",
  list_departments: "Смотрю отделы",
  create_department: "Создаю отдел",
  add_channel: "Добавляю канал",
  add_agent: "Добавляю агента",
  set_department_integrations: "Подключаю интеграции",
  get_research_insights: "Запрашиваю ресёрч",
  list_posts: "Смотрю посты",
  generate_ideas: "Генерю идеи",
  write_post: "Пишу пост",
  publish_post: "Публикую",
  create_task: "Ставлю задачу",
};
function toolLabel(name) { return TOOL_LABELS[name] || name; }

// Build-tools (создание/обновление отдела) — рендерим как карточки в чате.
const BUILD_TOOLS = new Set(["create_department", "add_channel", "add_agent", "set_department_integrations"]);

function BuildCard({ t }) {
  const a = t.args || {};
  const r = t.result || {};
  let icon, color, title, sub;
  if (t.name === "create_department") {
    icon = "🏢"; color = r.department?.color || "#7A86FF";
    title = "Отдел " + (a.name || r.department?.name || "");
    sub = a.description || "";
  } else if (t.name === "add_channel") {
    icon = "📡"; color = "#3F95FF";
    title = a.name || r.channel?.name || "Канал";
    sub = a.type || r.channel?.type || "";
  } else if (t.name === "add_agent") {
    icon = "🤖"; color = a.color || r.agent?.color || "#7A86FF";
    title = a.role || r.agent?.role || "Агент";
    sub = a.tasks || "";
  } else if (t.name === "set_department_integrations") {
    icon = "🔌"; color = "#34C759";
    title = "Интеграции";
    sub = (a.integrations || []).join(" · ");
  }
  const running = t.status === "running";
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      padding: "9px 12px",
      background: color.white,
      border: `1px solid rgba(38,38,51,0.1)`,
      borderLeft: `3px solid ${color}`,
      borderRadius: 8,
      opacity: running ? 0.7 : 1,
      transition: "opacity 0.2s",
    }}>
      <span style={{ fontSize: 14, lineHeight: 1.3 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#262633" }}>{title}</div>
        {sub && <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2, lineHeight: 1.4 }}>{sub}</div>}
      </div>
      {running ? (
        <span style={{
          width: 6, height: 6, borderRadius: "50%", background: "#FF8B3D",
          animation: "marypulse 1.2s ease-in-out infinite", flexShrink: 0, marginTop: 4,
        }} />
      ) : t.ok === false ? (
        <span style={{ color: "#FF3B30", fontSize: 12, marginTop: 1 }}>✗</span>
      ) : (
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth={3}
             strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }}>
          <path d="M5 12l5 5L20 7" />
        </svg>
      )}
    </div>
  );
}

// Группы tools: discovery (изучает контекст) сворачиваемая, build (карточки), остальное плоско.
const DISCOVERY_TOOLS = new Set(["kb_list", "kb_read", "search_kb", "list_departments", "read_chat", "list_posts", "get_research_insights"]);

function CollapsibleToolGroup({ label, tools, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const anyRunning = tools.some(t => t.status === "running");
  return (
    <div style={{ marginBottom: 4 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "4px 4px",
          background: "transparent", border: "none",
          fontSize: 12.5, color: "rgba(38,38,51,0.7)",
          cursor: "pointer", fontFamily: "inherit",
        }}
      >
        <svg width={11} height={11} viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
             style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
        {anyRunning ? (
          <span style={{
            width: 6, height: 6, borderRadius: "50%", background: "#FF8B3D",
            animation: "marypulse 1.2s ease-in-out infinite",
          }} />
        ) : (
          <svg width={11} height={11} viewBox="0 0 24 24" fill="none"
               stroke="rgba(38,38,51,0.45)" strokeWidth={2.5}
               strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5L20 7" />
          </svg>
        )}
        <span style={{ fontWeight: 500 }}>{label}</span>
        <span style={{ color: "rgba(38,38,51,0.4)" }}>{tools.length}</span>
      </button>
      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 3, paddingLeft: 24, marginTop: 2 }}>
          {tools.map((t, i) => (
            <div key={i} style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontSize: 12, color: "rgba(38,38,51,0.6)",
            }}>
              {t.status === "running" ? (
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#FF8B3D", flexShrink: 0 }} />
              ) : (
                <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="rgba(38,38,51,0.45)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M5 12l5 5L20 7" />
                </svg>
              )}
              <span>{toolLabel(t.name)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ToolsTrail({ tools }) {
  // Группируем discovery в collapsible, build остаётся карточками, остальное флэт.
  const groups = [];
  let discoveryBucket = [];
  const flushDiscovery = () => {
    if (discoveryBucket.length > 0) {
      groups.push({ kind: "discovery", items: discoveryBucket });
      discoveryBucket = [];
    }
  };
  for (const t of tools) {
    if (DISCOVERY_TOOLS.has(t.name)) {
      discoveryBucket.push(t);
    } else {
      flushDiscovery();
      groups.push({ kind: "single", item: t });
    }
  }
  flushDiscovery();

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 6,
      marginBottom: 6,
    }}>
      {groups.map((g, gi) => {
        if (g.kind === "discovery") {
          return <CollapsibleToolGroup key={gi} label="Изучаю контекст" tools={g.items} />;
        }
        const t = g.item;
        if (BUILD_TOOLS.has(t.name)) return <BuildCard key={gi} t={t} />;
        return (
        <div key={gi} style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          fontSize: 12.5, color: "rgba(38,38,51,0.65)",
          paddingLeft: 2,
        }}>
          {t.status === "running" ? (
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#FF8B3D",
              animation: "marypulse 1.2s ease-in-out infinite",
              flexShrink: 0,
            }} />
          ) : t.ok === false ? (
            <span style={{
              display: "inline-flex", color: "#FF3B30", fontSize: 11, lineHeight: 1, flexShrink: 0,
            }}>✗</span>
          ) : (
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none"
                 stroke="rgba(38,38,51,0.55)" strokeWidth={2.5}
                 strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M5 12l5 5L20 7" />
            </svg>
          )}
          <span style={{
            color: t.status === "running" ? "#262633" : "rgba(38,38,51,0.6)",
          }}>{toolLabel(t.name)}{t.status === "running" ? "…" : ""}</span>
          {t.status === "done" && t.durationMs > 1500 && (
            <span style={{
              color: "rgba(38,38,51,0.4)",
              fontFamily: "ui-monospace, SF Mono, monospace", fontSize: 11,
            }}>{Math.round(t.durationMs / 100) / 10}с</span>
          )}
        </div>
        );
      })}
      <style>{`@keyframes marypulse { 0%,100%{opacity:.4} 50%{opacity:1} }`}</style>
    </div>
  );
}

function ToolStatusChip({ status, startedAt }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!startedAt) return;
    const id = setInterval(() => setTick(t => t + 1), 250);
    return () => clearInterval(id);
  }, [startedAt]);
  const elapsed = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      marginTop: 8, marginBottom: 4,
      padding: "6px 12px",
      background: "rgba(38,38,51,0.04)",
      borderRadius: 999,
      fontSize: 12.5, color: "rgba(38,38,51,0.65)",
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: "#FF8B3D",
        animation: "marypulse 1.2s ease-in-out infinite",
      }} />
      <span>{status}…</span>
      {elapsed >= 1 && (
        <span style={{ color: "rgba(38,38,51,0.4)", fontFamily: "ui-monospace, SF Mono, monospace", fontSize: 11.5 }}>
          {elapsed}с
        </span>
      )}
      <style>{`@keyframes marypulse { 0%,100%{opacity:.4} 50%{opacity:1} }`}</style>
    </div>
  );
}

// ── File Agent rows (как в Claude Code) ──────────────────
function FileActionRow({ icon = "write", file, sub }) {
  const ICONS = {
    write: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 18v-6"/><path d="M9 15l3-3 3 3"/></svg>,
    read:  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>,
    list:  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>,
  };
  const LABEL = { write: "Writing", read: "Read", list: "Files" };
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      marginTop: 6, padding: "5px 10px",
      background: "rgba(38,38,51,0.04)",
      borderRadius: 8,
      fontSize: 12.5, color: "#262633",
      fontFamily: "ui-monospace, SF Mono, monospace",
      maxWidth: 550,
    }}>
      <span style={{ display: "inline-flex", color: "rgba(38,38,51,0.55)" }}>{ICONS[icon]}</span>
      <span style={{ fontWeight: 500 }}>{LABEL[icon]}</span>
      <span style={{ color: "#262633" }}>{file}</span>
      {sub && <span style={{ color: "rgba(38,38,51,0.5)", marginLeft: 4 }}>· {sub}</span>}
    </div>
  );
}
function PublishedRow({ url, channel }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      marginTop: 6, padding: "8px 14px",
      background: "linear-gradient(135deg, #34C759, #2EA64D)",
      color: "#fff",
      borderRadius: 999,
      fontSize: 13, fontWeight: 500,
      textDecoration: "none",
    }}>
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
      <span>Опубликован в {channel}</span>
    </a>
  );
}

function TextCard({ msg }) {
  const ideas = msg.ideaIds?.length || 1;
  return (
    <div style={cardWrap}>
      <div style={cardLabel}>{ideas > 1 ? `Тексты · ${ideas} идеи` : "Текст поста"}</div>
      <div style={{
        marginTop: 10,
        padding: "12px 14px",
        background: "rgba(38,38,51,0.03)",
        borderRadius: 10,
        fontSize: 13.5, lineHeight: 1.5, color: "#262633",
        whiteSpace: "pre-wrap",
        maxHeight: 240, overflow: "auto",
      }}>{msg.body}</div>
    </div>
  );
}

function VisualCard({ msg }) {
  const items = msg.items || [{ id: "_", title: null, palette: msg.palette }];
  return (
    <div style={cardWrap}>
      <div style={cardLabel}>{items.length > 1 ? `Обложки · ${items.length} идеи · по 3 варианта` : "Визуал · 3 варианта обложки"}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 10 }}>
        {items.map((it, idx) => (
          <div key={it.id || idx}>
            {it.title && (
              <div style={{ fontSize: 12, color: "rgba(38,38,51,0.55)", marginBottom: 6 }}>{it.title}</div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              {(it.palette || msg.palette).map((c, i) => (
                <div key={i} style={{
                  flex: 1, height: 90, borderRadius: 10,
                  background: `linear-gradient(135deg, ${c}26, ${c}66)`,
                  border: "1px solid rgba(38,38,51,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, color: "#262633", fontWeight: 510,
                }}>v{i + 1}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FinalPostCard({ msg, onAction }) {
  const palette = msg.palette || ["#3F95FF", "#7A86FF", "#262633"];
  return (
    <div style={cardWrap}>
      <div style={cardLabel}>Финальное превью поста</div>
      <div style={{
        marginTop: 12,
        background: color.white,
        border: "1px solid rgba(38,38,51,0.08)",
        borderRadius: 14,
        overflow: "hidden",
      }}>
        {/* Mock cover */}
        <div style={{
          height: 130,
          background: `linear-gradient(135deg, ${palette[0]}, ${palette[1]} 60%, ${palette[2]})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: color.white, fontWeight: 600, fontSize: 16, textAlign: "center", padding: "0 20px",
        }}>{msg.idea?.title}</div>
        {/* Channel header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px 6px" }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "#262633", color: color.white,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 600,
          }}>m</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#262633" }}>Mary · SMM</div>
            <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.5)" }}>{msg.channel} · {msg.scheduledFor}</div>
          </div>
        </div>
        {/* Body */}
        <div style={{
          padding: "0 14px 12px",
          fontSize: 13.5, lineHeight: 1.5, color: "#262633",
          whiteSpace: "pre-wrap",
          maxHeight: 220, overflow: "auto",
        }}>{msg.body}</div>
        {/* Mock metrics */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "8px 14px 12px",
          borderTop: "1px solid rgba(38,38,51,0.06)",
          fontSize: 12, color: "rgba(38,38,51,0.55)",
        }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{ic.eye} прогноз ~12k</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{ic.heart} ER ~6%</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{ic.bubbleSm} ~80</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <button
          onClick={() => onAction?.({ kind: "publishPost", idea: msg.idea, channel: msg.channel, scheduledFor: msg.scheduledFor })}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "10px 16px",
            background: "#262633", color: color.white,
            border: "none", borderRadius: 999,
            fontSize: 13, fontWeight: 500,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >Опубликовать</button>
        <button
          onClick={() => onAction?.({ kind: "copyPost", idea: msg.idea })}
          style={chatBtn("secondary")}
        >Скопировать</button>
      </div>
      {msg.rest?.length > 0 && (
        <div style={{
          marginTop: 12, padding: "10px 12px",
          background: "rgba(38,38,51,0.03)",
          borderRadius: 10,
          fontSize: 12, color: "rgba(38,38,51,0.55)",
        }}>
          Ещё {msg.rest.length} {msg.rest.length === 1 ? "пост готов" : msg.rest.length < 5 ? "поста готовы" : "постов готовы"}: {msg.rest.map(r => `«${r.title}»`).join(", ")}
        </div>
      )}
    </div>
  );
}

function ToolTrace({ agentLabel, steps }) {
  const [open, setOpen] = useState(false);
  function stepIcon(kind) {
    if (kind === "search") return ic.searching;
    if (kind === "check")  return ic.checkSm;
    if (kind === "spin")   return ic.spinnerSm;
    return ic.fileSm;
  }
  return (
    <div style={{ marginTop: 12 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "5px 8px", margin: "-5px -8px",
          background: "transparent", border: "none", borderRadius: 7,
          cursor: "pointer", fontFamily: "inherit",
          color: "rgba(38,38,51,0.7)",
        }}
      >
        <span style={{ display: "flex" }}>{ic.fileSm}</span>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{agentLabel}</span>
        <span style={{ display: "flex", color: "rgba(38,38,51,0.4)", transform: open ? "rotate(180deg)" : "none", transition: transition.fast }}>
          {ic.chevron}
        </span>
      </button>
      {open && (
        <div style={{
          marginTop: 6,
          paddingLeft: 22,
          display: "flex", flexDirection: "column", gap: 5,
        }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 8,
              fontSize: 12.5, color: "rgba(38,38,51,0.55)",
            }}>
              <span style={{ display: "flex" }}>{stepIcon(s.kind)}</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PeopleOptions({ items, onPick }) {
  const [hover, setHover] = useState(-1);
  return (
    <div style={{ marginTop: 10, maxWidth: 550, display: "flex", flexDirection: "column", borderBottom: "1px solid rgba(38,38,51,0.08)" }}>
      {items.map((p, i) => (
        <button
          key={i}
          onClick={() => onPick?.(p.name)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(-1)}
          style={{
            display: "flex", alignItems: "center", gap: 12,
            width: "100%",
            padding: "10px 4px",
            background: hover === i ? "rgba(38,38,51,0.03)" : "transparent",
            border: "none",
            borderTop: "1px solid rgba(38,38,51,0.08)",
            borderRadius: 0,
            cursor: "pointer", fontFamily: "inherit", textAlign: "left",
            transition: transition.fast,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: "#262633", fontWeight: 400, lineHeight: 1.3 }}>{p.name}</div>
            {p.sub && <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.5)", marginTop: 2 }}>{p.sub}</div>}
          </div>
          <span style={{ display: "flex", color: "rgba(38,38,51,0.45)", flexShrink: 0, transform: "scale(0.85)" }}>{ic.arrowRight}</span>
        </button>
      ))}
    </div>
  );
}

function FollowUps({ items, onPick }) {
  const [hover, setHover] = useState(-1);
  return (
    <div style={{ marginTop: 10, maxWidth: 550, display: "flex", flexDirection: "column", borderBottom: "1px solid rgba(38,38,51,0.08)" }}>
      {items.map((s, i) => (
        <button
          key={i}
          onClick={() => onPick?.(s)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(-1)}
          style={{
            display: "flex", alignItems: "center", gap: 12,
            width: "100%",
            padding: "10px 4px",
            background: hover === i ? "rgba(38,38,51,0.03)" : "transparent",
            border: "none",
            borderTop: "1px solid rgba(38,38,51,0.08)",
            borderRadius: 0,
            cursor: "pointer", fontFamily: "inherit", textAlign: "left",
            transition: transition.fast,
          }}
        >
          <span style={{ flex: 1, fontSize: 13, color: "#262633", fontWeight: 400, lineHeight: 1.3 }}>{s}</span>
          <span style={{ display: "flex", color: "rgba(38,38,51,0.45)", flexShrink: 0, transform: "scale(0.85)" }}>{ic.arrowRight}</span>
        </button>
      ))}
    </div>
  );
}

function ChatMessage({ msg, onPick, onAction }) {
  // Сообщение от пользователя — справа, серый бабл
  if (msg.agentId === "user") {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
        <div style={{
          background: "rgba(38,38,51,0.06)",
          color: "#262633",
          padding: "10px 14px",
          borderRadius: 16,
          maxWidth: 480,
          fontSize: 14, lineHeight: 1.45,
          whiteSpace: "pre-wrap",
        }}>{msg.text}</div>
      </div>
    );
  }
  const isMary = msg.agentId === "mary";
  const agent = isMary
    ? { id: "mary", label: "Mary", color: "#262633" }
    : AGENTS.find(a => a.id === msg.agentId);
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: isMary ? "rgba(38,38,51,0.06)" : agent.color + "26",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        overflow: "hidden",
      }}>
        {isMary ? (
          <img src="/brand_logo.png" alt="Mary" style={{ height: 18, width: "auto" }} />
        ) : (
          <span style={{ color: agent.color, display: "flex" }}>
            <svg width={20} height={20} viewBox="0 0 24 24">
              <rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor" />
              <rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor" />
              <circle cx="9.3" cy="13" r="1.4" fill="white" />
              <circle cx="14.7" cy="13" r="1.4" fill="white" />
            </svg>
          </span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 13.5, fontWeight: 510, color: "#262633" }}>{agent.label}</span>
          <span style={{ fontSize: 11.5, color: "rgba(38,38,51,0.5)" }}>{msg.time}</span>
        </div>
        {msg.tools && <ToolTrace agentLabel={`${agent.label} agent`} steps={msg.tools} />}
        {msg._toolStatus && (
          <ToolStatusChip status={msg._toolStatus} startedAt={msg._toolStatusStartedAt} />
        )}
        {msg.text && (
          <div style={{
            fontSize: 14, color: "#262633", lineHeight: 1.5,
            marginTop: msg.tools ? 14 : 0,
            whiteSpace: "pre-wrap",
            maxWidth: 550,
          }}>
            {msg.text}
            {msg._streaming && <span style={{
              display: "inline-block", width: 7, height: 14,
              background: "#262633",
              marginLeft: 2, verticalAlign: "text-bottom",
              animation: "maryblink 1s steps(2) infinite",
            }} />}
            <style>{`@keyframes maryblink { 50% { opacity: 0 } }`}</style>
          </div>
        )}
        {msg._streaming && !msg.text && !msg._toolStatus && (
          <div style={{
            display: "inline-flex", gap: 4, marginTop: 4,
            padding: "8px 0",
          }}>
            {[0,1,2].map(i => (
              <span key={i} style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "rgba(38,38,51,0.4)",
                animation: `marypulse 1.4s ease-in-out infinite ${i*0.2}s`,
              }} />
            ))}
          </div>
        )}
        {msg.type === "research" && <ResearchCard msg={msg} />}
        {msg.type === "insights" && <InsightsCard msg={msg} />}
        {msg.type === "ideas"    && <IdeasCard    msg={msg} onAction={onAction} />}
        {msg.type === "text"     && <TextCard     msg={msg} onAction={onAction} />}
        {msg.type === "visual"   && <VisualCard   msg={msg} onAction={onAction} />}
        {msg.type === "finalPost" && <FinalPostCard msg={msg} onAction={onAction} />}
        {msg.type === "fileWrite" && <FileActionRow icon="write" file={msg.file} sub={msg.existed ? `обновила · ${msg.size} б` : `создала · ${msg.size} б`} />}
        {msg.type === "fileRead"  && <FileActionRow icon="read"  file={msg.file} sub={`прочитала · ${msg.length} симв.`} />}
        {msg.type === "fileList"  && <FileActionRow icon="list"  file={`файлов в БЗ: ${msg.count}`} />}
        {msg.type === "published" && <PublishedRow url={msg.url} channel={msg.channel} />}
        {msg.options && <QuestionOptions items={msg.options} onPick={onPick} />}
        {msg.peopleOptions && <PeopleOptions items={msg.peopleOptions} onPick={onPick} />}
        {msg.followUps && <FollowUps items={msg.followUps} onPick={onPick} />}
      </div>
    </div>
  );
}

function QuestionOptions({ items, onPick }) {
  const [hover, setHover] = useState(-1);
  return (
    <div style={{ marginTop: 10, maxWidth: 550, display: "flex", flexDirection: "column", borderBottom: "1px solid rgba(38,38,51,0.08)" }}>
      {items.map((s, i) => (
        <button
          key={i}
          onClick={() => onPick?.(s)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(-1)}
          style={{
            display: "flex", alignItems: "center", gap: 12,
            width: "100%",
            padding: "10px 4px",
            background: hover === i ? "rgba(38,38,51,0.03)" : "transparent",
            border: "none",
            borderTop: "1px solid rgba(38,38,51,0.08)",
            borderRadius: 0,
            cursor: "pointer", fontFamily: "inherit", textAlign: "left",
            transition: transition.fast,
          }}
        >
          <span style={{ flex: 1, fontSize: 13, color: "#262633", fontWeight: 400, lineHeight: 1.3 }}>{s}</span>
          <span style={{ display: "flex", color: "rgba(38,38,51,0.45)", flexShrink: 0, transform: "scale(0.85)" }}>{ic.arrowRight}</span>
        </button>
      ))}
    </div>
  );
}

// ── Плавающее окно чата (drag + resize) ─────────────────────
function ChatPanel({ onClose, activeFilter, onFilter, mode: modeProp, onModeChange, dockedHeight = 420, onDockedHeightChange, pendingMaryMessage, onPendingConsumed, taskFlow, onTaskFlowChange, onAddTask, onOpenTasks }) {
  const taskDraftRef = useRef({});
  const [localMode, setLocalMode] = useState("docked");
  const mode = modeProp ?? localMode;
  const setMode = onModeChange ?? setLocalMode;
  const [pos, setPos] = useState({ x: 60, y: 80 });
  const [size, setSize] = useState({ w: 640, h: 460 });
  const [text, setText] = useState("");
  const [attached, setAttached] = useState([]);
  const [kbOpen, setKbOpen] = useState(false);
  const [allMessages, setAllMessages] = useState(MOCK_MESSAGES);
  const [conversationId, setConversationId] = useState(null);

  // Привязка к persistent conversation для отдела (scope=smm/tg-kanal)
  useEffect(() => {
    let cancelled = false;
    async function ensureConv() {
      try {
        const list = await fetch("/api/mary/conversations").then(r => r.json());
        let conv = (list.conversations || []).find(c => c.scope === "smm/tg-kanal");
        if (!conv) {
          conv = await fetch("/api/mary/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: "Чат СММ-отдела · Тг-канал", scope: "smm/tg-kanal" }),
          }).then(r => r.json());
        }
        if (cancelled) return;
        setConversationId(conv.id);
        // Подгружаем существующие сообщения с бэка
        const full = await fetch(`/api/mary/conversations/${conv.id}`).then(r => r.json());
        if (!cancelled && full.messages?.length > 0) {
          // Конвертируем БД-формат в формат UI
          const converted = full.messages.map((m, i) => ({
            id: "h" + i + "-" + (m.ts || ""),
            agentId: m.role === "user" ? "user" : "mary",
            time: (m.ts || "").slice(11, 16),
            text: m.text || "",
          }));
          // Заменяем mock-историю на реальную, если она есть
          setAllMessages(converted);
        }
      } catch {}
    }
    ensureConv();
    return () => { cancelled = true; };
  }, []);
  const [typingIds, setTypingIds] = useState(["mary", "copywriter"]);
  const fileRef = useRef(null);

  // Мок-симуляция печати: меняем набор «печатающих» каждые 5-7 сек
  useEffect(() => {
    const cycles = [
      ["mary", "copywriter"],
      ["researcher"],
      [],
      ["mary"],
      ["marketer", "designer"],
      [],
      ["analyst"],
    ];
    let idx = 0;
    const t = setInterval(() => {
      idx = (idx + 1) % cycles.length;
      setTypingIds(cycles[idx]);
    }, 5500);
    return () => clearInterval(t);
  }, []);

  const typingAgents = typingIds.map(id => {
    if (id === "mary") return { id: "mary", label: "Mary", color: "#262633" };
    return AGENTS.find(a => a.id === id);
  }).filter(Boolean);
  const dragRef = useRef(null);
  const resizeRef = useRef(null);
  const sendActive = (text.trim().length > 0 || attached.length > 0) && !!conversationId;

  function nowTime() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  function appendMary(extra) {
    setAllMessages(prev => [...prev, { id: "m" + Date.now() + Math.random(), agentId: "mary", time: nowTime(), ...extra }]);
    // Сохранение в persistent conversation (если есть и есть текст)
    if (conversationId && extra.text) {
      fetch(`/api/mary/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "mary", text: extra.text }),
      }).catch(() => {});
    }
  }
  function appendAgent(agentId, extra) {
    setAllMessages(prev => [...prev, { id: "a" + Date.now() + Math.random(), agentId, time: nowTime(), ...extra }]);
  }
  function generateTextForIdea(idea) {
    return `${idea.hook || ""}\n\nАгент-оркестратор Mary за неделю:\n— спарсил 51 пост из 31 канала\n— выделил 4 темы и 3 формата, которые сейчас в моменте\n— собрал 4 идеи постов под мой бриф\n— сгенерил 12 обложек и оставил по 1 финальной\n— подготовил тексты с хуком, телом и призывом\n\nЯ всё это пересмотрела за 30 минут и нажала «Опубликовать».\n\n${idea.angle.includes("чек-лист") ? "Чек-лист в комментах ↓" : "Подпишись, если интересно как я строю SMM-отдел из агентов."}`;
  }
  function paletteForIdea(idea) {
    if (idea.angle.includes("AI"))   return ["#3F95FF", "#7A86FF", "#262633"];
    if (idea.angle.includes("Indie")) return ["#FF8B3D", "#FF6FB3", "#7A86FF"];
    if (idea.angle.includes("B2B"))   return ["#262633", "#3F95FF", "#7A86FF"];
    return ["#34C759", "#3F95FF", "#FF8B3D"];
  }
  async function callMarketerIdeate(opts = {}) {
    try {
      const res = await fetch("/api/mary/marketer/ideate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: opts.count || 4, brief: opts.brief || "" }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch { return null; }
  }
  async function callCopywriterWrite(idea) {
    try {
      const res = await fetch("/api/mary/copywriter/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch { return null; }
  }

  function handleIdeasApproved(ideas) {
    if (!ideas?.length) return;
    const titles = ideas.map(i => `«${i.title}»`).join(", ");
    appendUser(`Берём в работу: ${titles}`);

    // Копирайтер пишет тексты ПО-НАСТОЯЩЕМУ через backend (один запрос на каждую идею)
    Promise.all(ideas.map(idea => callCopywriterWrite(idea))).then(results => {
      const validResults = results.filter(r => r && r.body);
      if (validResults.length === 0) {
        // Fallback на mock если backend недоступен
        appendAgent("copywriter", {
          text: `Беру в работу ${ideas.length === 1 ? "идею" : `${ideas.length} идеи`}. Готов первый драфт по каждой:`,
          type: "text",
          body: ideas.map(it => `📌 ${it.title}\n\n${generateTextForIdea(it)}`).join("\n\n———————\n\n"),
          ideaIds: ideas.map(i => i.id),
        });
      } else {
        appendAgent("copywriter", {
          text: `Готов первый драфт по ${validResults.length === 1 ? "идее" : `${validResults.length} идеям`}:`,
          type: "text",
          body: validResults.map(r => `📌 ${r.idea?.title || ""}\n\n${r.body}`).join("\n\n———————\n\n"),
          ideaIds: validResults.map(r => r.idea?.id),
        });
      }
    });

    setTimeout(() => {
      appendAgent("designer", {
        text: `Сгенерил по 3 варианта обложки на каждую идею (${ideas.length}). Отметь в КБ финальные:`,
        type: "visual",
        palette: paletteForIdea(ideas[0]),
        ideaIds: ideas.map(i => i.id),
        items: ideas.map(it => ({ id: it.id, title: it.title, palette: paletteForIdea(it) })),
      });
    }, 2300);

    setTimeout(async () => {
      // Финальный пост с реальным текстом от копирайтера
      const finalText = await callCopywriterWrite(ideas[0]);
      appendMary({
        text: `Текст и обложки готовы по всем ${ideas.length} ${ideas.length === 1 ? "идее" : "идеям"}. Собрала превью первого поста — глянь и жми «Опубликовать», если ок:`,
        type: "finalPost",
        idea: ideas[0],
        body: (finalText && finalText.body) || generateTextForIdea(ideas[0]),
        palette: paletteForIdea(ideas[0]),
        channel: "@mary_smm",
        scheduledFor: "сегодня в 12:00",
        rest: ideas.slice(1).map(i => ({ id: i.id, title: i.title })),
      });
    }, 8000);
  }
  function handleAction(action) {
    if (!action) return;
    if (action.kind === "approveIdeas") {
      handleIdeasApproved(action.ideas);
      return;
    }
    if (action.kind === "refineIdea") {
      appendUser(`↻ Доработать «${action.idea.title}»: ${action.comment}`);
      setTimeout(() => {
        appendAgent("marketer", {
          text: `Понял. Перепишу «${action.idea.title}» с учётом «${action.comment}» — пришлю обновлённую идею через минуту.`,
        });
      }, 1200);
      return;
    }
    if (action.kind === "publishPost") {
      appendUser(`🚀 Опубликовать «${action.idea.title}» в ${action.channel} ${action.scheduledFor}`);
      setTimeout(() => {
        appendMary({
          text: `Готово. Поставила в очередь на ${action.scheduledFor}. Аналитик снимет метрики через 24ч после публикации и принесёт отчёт.`,
        });
      }, 1000);
      return;
    }
    if (action.kind === "copyPost") {
      appendUser(`📋 Скопировано: «${action.idea.title}»`);
      return;
    }
  }
  // Мок-загрузка и релевантность по описанию задачи
  function rankPeople(desc) {
    const d = (desc || "").toLowerCase();
    return MOCK_PEOPLE.map(p => {
      const title = p.title.toLowerCase();
      let rel = 25;
      if (/(пост|текст|копи)/.test(d) && /копирайтер/.test(title)) rel = 92;
      else if (/(дизайн|обложк|визуал|макет)/.test(d) && /дизайнер/.test(title)) rel = 90;
      else if (/(стратег|план|концепт)/.test(d) && /стратег/.test(title)) rel = 85;
      else if (/(smm|канал|пост|охват)/.test(d) && /smm/.test(title)) rel = 78;
      else if (/head/.test(title)) rel = 70;
      const load = Math.floor(20 + (p.id * 13) % 70);
      return { ...p, relevance: rel, load };
    }).sort((a, b) => (b.relevance - b.load) - (a.relevance - a.load));
  }
  function rankAgents(desc) {
    const d = (desc || "").toLowerCase();
    return AGENTS.map(a => {
      const role = a.role.toLowerCase();
      let rel = 30;
      if (/(пост|конкурент|ресёрч|посты)/.test(d) && /парсит/.test(role)) rel = 95;
      else if (/(идея|концепт|тема|план)/.test(d) && /идеи/.test(role)) rel = 90;
      else if (/(текст|пост)/.test(d) && /пишет/.test(role)) rel = 88;
      else if (/(обложк|визуал|дизайн)/.test(d) && /визуал/.test(role)) rel = 90;
      else if (/(аналитик|метрик|охват|er)/.test(d) && /аналитик/.test(role)) rel = 92;
      const load = Math.floor(15 + (a.runs * 4) % 75);
      return { ...a, relevance: rel, load };
    }).sort((a, b) => (b.relevance - b.load) - (a.relevance - a.load));
  }

  function appendUser(content) {
    setAllMessages(prev => [...prev, { id: "u" + Date.now() + Math.random(), agentId: "user", time: nowTime(), text: content }]);
    // Сохранение в persistent conversation (если есть)
    if (conversationId) {
      fetch(`/api/mary/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "user", text: content }),
      }).catch(() => {});
    }

    setTimeout(() => {
      // Task flow state machine
      if (taskFlow === "desc") {
        // Юзер ответил описанием задачи
        taskDraftRef.current.description = content;
        onTaskFlowChange?.("who");
        const top = rankPeople(content)[0];
        const topA = rankAgents(content)[0];
        appendMary({
          type: "question",
          text: `Понял: «${content}». Кому это лучше адресовать?\n\nМоя рекомендация — ${top.name} (релевантность ${top.relevance}%, загрузка ${top.load}%) или ${topA.label}-агент (релевантность ${topA.relevance}%).`,
          options: ["Сотруднику", "Агенту", "Раскидай сама"],
        });
        return;
      }
      if (taskFlow === "who") {
        if (content === "Сотруднику") {
          onTaskFlowChange?.("person");
          const ranked = rankPeople(taskDraftRef.current.description);
          appendMary({
            type: "question",
            text: "Кому именно? Сортировка — сначала те, кому задача релевантнее и кто меньше загружен.",
            peopleOptions: [
              ...ranked.map(p => ({ name: p.name, sub: `${p.title} · релевантность ${p.relevance}% · загрузка ${p.load}%` })),
              { name: "Пригласить нового сотрудника", sub: "если нужного нет в команде" },
            ],
          });
        } else if (content === "Агенту") {
          onTaskFlowChange?.("agent");
          const ranked = rankAgents(taskDraftRef.current.description);
          appendMary({
            type: "question",
            text: "Какому агенту?",
            peopleOptions: ranked.map(a => ({ name: a.label, sub: `${a.role.split(",")[0]} · релевантность ${a.relevance}% · загрузка ${a.load}%` })),
          });
        } else {
          onTaskFlowChange?.("team");
          appendMary({
            type: "question",
            text: "Окей, раскидаю сама. Пришлю план — кто что делает — на твой апрув через минуту.",
          });
        }
        return;
      }
      if (taskFlow === "person") {
        if (content === "Пригласить нового сотрудника") {
          appendMary({
            type: "question",
            text: "Скинь ссылку-инвайт новому сотруднику в любой мессенджер. Как только он зайдёт по ней — появится в команде.\n\nhttps://mary.app/invite/sm-x9q2k",
          });
          return;
        }
        // Создаём задачу
        onAddTask?.({ title: taskDraftRef.current.description, assignee: content, kind: "person" });
        appendMary({
          type: "question",
          text: `Готово. Задача «${taskDraftRef.current.description}» отправлена ${content}. Сейчас она в статусе «Ожидает принятия» — отобразится в Задачах сразу, цвет статуса сменится когда сотрудник примет.`,
          followUps: ["Открыть задачи", "Поставить ещё одну"],
        });
        onTaskFlowChange?.(null);
        taskDraftRef.current = {};
        return;
      }
      if (taskFlow === "agent") {
        onAddTask?.({ title: taskDraftRef.current.description, assignee: content, kind: "agent" });
        appendMary({
          type: "question",
          text: `Принял. Задача «${taskDraftRef.current.description}» передана ${content}-агенту. Запустится сразу — отслеживай в Задачах.`,
          followUps: ["Открыть задачи", "Поставить ещё одну"],
        });
        onTaskFlowChange?.(null);
        taskDraftRef.current = {};
        return;
      }
      // follow-ups
      if (content === "Открыть задачи") { onOpenTasks?.(); return; }
      if (content === "Поставить ещё одну") {
        onTaskFlowChange?.("desc");
        appendMary({ type: "question", text: "Окей. Опиши следующую задачу." });
        return;
      }
      // Свободное сообщение — Mary решает, отвечать самой или делегировать агенту
      // Сначала пробуем реальный backend (n8n на :5678 через /api/mary прокси).
      // Если он offline — fallback на mock.
      // Стримящаяся версия: Mary печатает посимвольно, прогресс tool-calls live
      streamMaryAgent(content).catch(() => handleFreeMessage(content));
    }, 350);
  }
  // ── Streaming agent: SSE ──────────────────────────────
  // Создаёт draft-сообщение Mary, дописывает его текст по мере прихода chunks,
  // показывает tool-progress в виде "печатает..." → результаты как карточки
  async function streamMaryAgent(message) {
    const draftId = "m-stream-" + Date.now() + Math.random();
    let draftCreated = false;
    let toolStatus = null; // активный tool для индикатора

    const ensureDraft = () => {
      if (draftCreated) return;
      draftCreated = true;
      setAllMessages(prev => [...prev, {
        id: draftId, agentId: "mary", time: nowTime(),
        text: "", _streaming: true,
      }]);
    };
    const appendToDraft = (delta) => {
      ensureDraft();
      setAllMessages(prev => prev.map(m =>
        m.id === draftId ? { ...m, text: (m.text || "") + delta } : m
      ));
    };
    const setDraftStatus = (status) => {
      ensureDraft();
      setAllMessages(prev => prev.map(m =>
        m.id === draftId ? {
          ...m,
          _toolStatus: status,
          _toolStatusStartedAt: status ? Date.now() : null,
        } : m
      ));
    };
    const finalizeDraft = () => {
      setAllMessages(prev => prev.map(m =>
        m.id === draftId ? { ...m, _streaming: false, _toolStatus: null } : m
      ));
    };

    const TOOL_LABELS = {
      get_research_insights: "Запрашиваю свежий ресёрч",
      generate_ideas:        "Передаю Маркетологу — генерит идеи",
      write_post:            "Передаю Копирайтеру — пишет драфт",
      search_kb:             "Ищу в базе знаний",
      create_task:           "Создаю задачу",
      publish_post:          "Публикую пост в канал",
    };

    const res = await fetch("/api/mary/agent/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        conversationId, // ← привязка к persistent чату отдела
        history: conversationId ? [] : allMessages.slice(-30).map(m => ({ agentId: m.agentId, text: m.text || "" })),
      }),
    });
    if (!res.ok || !res.body) throw new Error("stream failed");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const handleEvent = (event, data) => {
      if (event === "text_delta" && data.delta) {
        appendToDraft(data.delta);
      } else if (event === "tool_start") {
        const label = TOOL_LABELS[data.name] || data.name;
        setDraftStatus(label);
      } else if (event === "tool_end") {
        // Сразу рендерим результат tool как карточку агента в чат
        renderAgentTrace([{
          name: data.name,
          ok: data.ok,
          result: data.result,
        }]);
        setDraftStatus(null);
      } else if (event === "done") {
        finalizeDraft();
      } else if (event === "error") {
        setDraftStatus(`Ошибка: ${data.message}`);
        finalizeDraft();
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split("\n\n");
      buffer = blocks.pop() || "";
      for (const block of blocks) {
        const lines = block.split("\n");
        let event = "message", dataStr = "";
        for (const line of lines) {
          if (line.startsWith("event:")) event = line.slice(6).trim();
          else if (line.startsWith("data:")) dataStr += line.slice(5).trim();
        }
        if (!dataStr) continue;
        try { handleEvent(event, JSON.parse(dataStr)); } catch {}
      }
    }
    finalizeDraft();
  }

  // Рендер результатов tool-calls Mary как карточки агентов в треде
  function renderAgentTrace(trace) {
    if (!Array.isArray(trace)) return;
    for (const t of trace) {
      if (!t.ok || !t.result) continue;
      if (t.name === "get_research_insights") {
        const r = t.result;
        if (r.themes?.length) {
          appendAgent("researcher", {
            type: "insights",
            text: `Проанализировал ${r.sampleSize || "?"} топ-постов из ${r.lookbackDays || "?"}-дневного окна:`,
            trends: r.themes.map(t => ({ label: t.label, direction: t.direction || "stable", note: t.note || "" })),
            formats: r.formats || [],
            notes: r.observations || [],
          });
        }
      } else if (t.name === "generate_ideas") {
        const r = t.result;
        if (r.items?.length) {
          appendAgent("marketer", {
            type: "ideas",
            text: `Подобрал ${r.items.length} идей. Отметь те, что берём в работу:`,
            items: r.items,
          });
        }
      } else if (t.name === "write_post") {
        const r = t.result;
        if (r.body) {
          appendAgent("copywriter", {
            type: "text",
            text: `Готов драфт (${r.length} знаков):`,
            body: r.body,
          });
        }
      } else if (t.name === "create_task") {
        const r = t.result;
        if (r.taskId) {
          addPendingTask?.({
            title: r.description || "Новая задача",
            assignee: r.assignee,
            kind: ["researcher","marketer","copywriter","designer","analyst"].includes(r.assignee) ? "agent" : "person",
          });
        }
      } else if (t.name === "kb_write") {
        const r = t.result;
        if (r.ok) {
          appendAgent("mary", {
            type: "fileWrite",
            file: r.path,
            existed: r.existed,
            size: r.size,
          });
        }
      } else if (t.name === "kb_read") {
        const r = t.result;
        if (r.content) {
          appendAgent("mary", {
            type: "fileRead",
            file: r.name,
            length: r.length,
          });
        }
      } else if (t.name === "kb_list") {
        const r = t.result;
        appendAgent("mary", {
          type: "fileList",
          count: r.files?.length || 0,
        });
      } else if (t.name === "publish_post") {
        const r = t.result;
        if (r.ok) {
          appendAgent("mary", {
            type: "published",
            url: r.url,
            channel: r.channel,
          });
        }
      }
    }
  }
  async function callMaryBackend(message) {
    try {
      // /agent — новый endpoint с function calling. Mary сама решает что вызвать.
      const res = await fetch("/api/mary/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: allMessages.slice(-30).map(m => ({ agentId: m.agentId, text: m.text || "" })),
        }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  }
  async function callResearcherInsights(opts = {}) {
    try {
      const res = await fetch("/api/mary/researcher/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: opts.days || 14, sample: opts.sample || 25 }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  }
  function triggerAgentMock(agentId) {
    const ideasItems = [
      { id: "i1", angle: "AI-агенты · кейс с цифрой", title: "Как 5 AI-агентов делают за меня недельный контент-план — кейс Mary", hook: "До Mary я тратила 14 часов в неделю на контент. Сейчас — 40 минут.", angleNote: "Хук с конкретной цифрой → +30% охват по ресёрчу" },
      { id: "i2", angle: "Indie · личная история",     title: "Год назад я закрыла агентство и пошла в SaaS. Вот что узнала", hook: "Год назад мне пришла мысль: «Если бы у меня был помощник, который ведёт весь SMM».", angleNote: "Личные истории > expertise-постов в 2.4× по ER" },
      { id: "i3", angle: "B2B · разбор-объяснялка",    title: "Почему GPT не справляется с SMM (и как помогает оркестратор агентов)", hook: "Если ChatGPT пишет тебе посты — ты в ловушке промпт-инжиниринга.", angleNote: "Контр-нарратив против общего хайпа на GPT" },
      { id: "i4", angle: "TG-рост · мини-чек-лист",    title: "Чек-лист: как настроить SMM-отдел из AI-агентов за выходные", hook: "Чек-лист из 7 шагов — от парсинга до автопостинга.", angleNote: "Чек-листы по ресёрчу: длина 300-600 знаков работает лучше всего" },
    ];
    if (agentId === "marketer") {
      // Реальный вызов маркетолога — он сам подтянет insights ресерчера
      callMarketerIdeate({ count: 4 }).then(data => {
        if (data && data.items?.length) {
          appendAgent("marketer", {
            type: "ideas",
            text: `Подобрал ${data.items.length} идей на основе свежего ресёрча. Отметь те, что берём в работу:`,
            items: data.items,
          });
        } else {
          appendAgent("marketer", { type: "ideas", text: "Вот 4 идеи постов — отметь те, что берём в работу:", items: ideasItems });
        }
      });
    } else if (agentId === "copywriter") {
      // Реальный копирайтер — берёт первую mock-идею для демо (когда нет конкретной)
      callCopywriterWrite(ideasItems[0]).then(data => {
        appendAgent("copywriter", {
          text: "Вот драфт.",
          type: "text",
          body: (data && data.body) || generateTextForIdea(ideasItems[0]),
        });
      });
    } else if (agentId === "designer") {
      appendAgent("designer", { text: "3 варианта обложки:", type: "visual", palette: ["#3F95FF", "#7A86FF", "#262633"] });
    } else if (agentId === "researcher") {
      // Реальный вызов backend — анализ 25 топ-постов через GLM 5.1
      callResearcherInsights().then(data => {
        if (data && data.themes?.length) {
          appendAgent("researcher", {
            type: "insights",
            text: `Проанализировал ${data.sampleSize} топ-постов из ${data.lookbackDays}-дневного окна. Вот темы и форматы, которые работают сейчас:`,
            trends: data.themes.map(t => ({ label: t.label, direction: t.direction || "stable", note: t.note || "" })),
            formats: data.formats || [],
            notes: data.observations || [],
          });
        } else {
          // Fallback если backend не ответил
          appendAgent("researcher", { type: "research", text: "Топ-постов:", items: [
            { ch: "neural_prosecco", postId: 4821, title: "OpenAI Realtime API — latency 320 мс" },
            { ch: "ai_product",      postId: 991,  title: "Anthropic Computer Use — Claude кликает сам" },
          ] });
        }
      });
    } else if (agentId === "analyst") {
      appendAgent("analyst", { text: "Сводка по последним 5 постам:\n\n— ср. охват: 8.2k\n— ср. ER: 5.4%\n— топ-пост: «Чек-лист SMM-отдела» (12.1k охват, 7.8% ER)" });
    }
  }
  function handleFreeMessage(content) {
    const d = (content || "").toLowerCase();
    const ideasItems = [
      { id: "i1", angle: "AI-агенты · кейс с цифрой", title: "Как 5 AI-агентов делают за меня недельный контент-план — кейс Mary", hook: "До Mary я тратила 14 часов в неделю на контент. Сейчас — 40 минут.", angleNote: "Хук с конкретной цифрой → +30% охват по ресёрчу" },
      { id: "i2", angle: "Indie · личная история",     title: "Год назад я закрыла агентство и пошла в SaaS. Вот что узнала", hook: "Год назад мне пришла мысль: «Если бы у меня был помощник, который ведёт весь SMM».", angleNote: "Личные истории > expertise-постов в 2.4× по ER" },
      { id: "i3", angle: "B2B · разбор-объяснялка",    title: "Почему GPT не справляется с SMM (и как помогает оркестратор агентов)", hook: "Если ChatGPT пишет тебе посты — ты в ловушке промпт-инжиниринга.", angleNote: "Контр-нарратив против общего хайпа на GPT" },
      { id: "i4", angle: "TG-рост · мини-чек-лист",    title: "Чек-лист: как настроить SMM-отдел из AI-агентов за выходные", hook: "Чек-лист из 7 шагов — от парсинга до автопостинга.", angleNote: "Чек-листы по ресёрчу: длина 300-600 знаков работает лучше всего" },
    ];

    // Контент-план / идеи постов → Маркетолог
    if (/(контент.?план|план.{0,10}пост|идеи|темы постов)/.test(d)) {
      appendMary({ text: "Окей, ставлю задачу Маркетологу — соберёт контент-план на неделю с учётом твоего брифа и трендов из последнего ресёрча." });
      setTimeout(() => {
        appendAgent("marketer", {
          type: "ideas",
          text: "Готово. Вот 4 идеи постов на след. неделю — отметь те, что берём в работу:",
          items: ideasItems,
        });
      }, 2500);
      return;
    }
    // Текст поста → Копирайтер
    if (/(напиши пост|напиши текст|текст поста|пост на тему)/.test(d)) {
      appendMary({ text: "Передаю Копирайтеру — он напишет драфт в твоём ToV (личные истории + цифры, без воды)." });
      setTimeout(() => {
        const idea = ideasItems[0];
        appendAgent("copywriter", {
          text: "Вот драфт. Если что-то не так — нажми «Доработать» и опиши:",
          type: "text",
          body: generateTextForIdea(idea),
        });
      }, 2300);
      return;
    }
    // Обложка / визуал → Дизайнер
    if (/(обложк|визуал|картинк|дизайн|оформлен)/.test(d)) {
      appendMary({ text: "Прошу Дизайнера — даст 3 варианта в брендстиле." });
      setTimeout(() => {
        appendAgent("designer", {
          text: "3 варианта обложки — выбирай:",
          type: "visual",
          palette: ["#3F95FF", "#7A86FF", "#262633"],
        });
      }, 2300);
      return;
    }
    // Ресёрч → Ресерчер
    if (/(ресёрч|ресерч|конкурент|спарси|посты конкурентов|тренд|инсайт)/.test(d)) {
      appendMary({ text: "Ресерчер уже на ходу — собирает свежие посты по 31 каналу. Через минуту даст подборку." });
      setTimeout(() => {
        appendAgent("researcher", {
          type: "research",
          text: "Спарсил топ-постов за 24ч:",
          items: [
            { ch: "neural_prosecco", postId: 4821, title: "OpenAI Realtime API — latency 320 мс" },
            { ch: "ai_product",      postId: 991,  title: "Anthropic Computer Use — Claude кликает сам" },
          ],
        });
      }, 2500);
      return;
    }
    // Аналитика → Аналитик
    if (/(аналитик|метрик|охват|er|отчёт|статистик)/.test(d)) {
      appendMary({ text: "Спрошу Аналитика — он принесёт цифры по последним постам." });
      setTimeout(() => {
        appendAgent("analyst", {
          text: "Сводка по последним 5 постам:\n\n— ср. охват: 8.2k\n— ср. ER: 5.4%\n— топ-пост: «Чек-лист SMM-отдела» (12.1k охват, 7.8% ER)\n— просадка: посты с длинной >800 знаков (–34% ER)\n\nРекомендация: держим длину 300-600 знаков, больше чек-листов и кейсов с цифрами.",
        });
      }, 2300);
      return;
    }
    // Опубликовать
    if (/(опубликуй|постни|выкатывай|published)/.test(d)) {
      appendMary({ text: "Какой пост публикуем? Дай номер или название из последних, или попроси новый." });
      return;
    }
    // Дефолтный ответ Mary — задаёт уточняющий вопрос
    appendMary({
      text: "Понял. Опиши задачу подробнее — я передам нужному агенту (Ресерчер / Маркетолог / Копирайтер / Дизайнер / Аналитик) или сделаю сама.",
    });
  }
  // Принимаем pendingMaryMessage снаружи — добавляем в тред один раз
  useEffect(() => {
    if (pendingMaryMessage) {
      setAllMessages(prev => [...prev, pendingMaryMessage]);
      onPendingConsumed?.();
    }
  }, [pendingMaryMessage, onPendingConsumed]);

  // Список всех KB-материалов из агентов
  const kbList = AGENTS.flatMap(a =>
    [...(a.kb?.inputs || []), ...(a.kb?.outputs || [])].map(it => ({ ...it, agent: a }))
  );

  function handlePickFile(e) {
    const files = Array.from(e.target.files || []);
    if (files.length) setAttached(prev => [...prev, ...files.map(f => ({ kind: "file", name: f.name }))]);
    e.target.value = "";
  }
  function pickKb(item) {
    setAttached(prev => [...prev, { kind: "kb", name: item.title, color: item.agent.color }]);
    setKbOpen(false);
  }
  function removeAttached(i) {
    setAttached(prev => prev.filter((_, idx) => idx !== i));
  }
  function send() {
    if (!sendActive) return;
    const parts = [];
    attached.forEach(a => parts.push(a.kind === "kb" ? `[КБ: ${a.name}]` : a.name));
    if (text.trim()) parts.push(text.trim());
    if (parts.length) appendUser(parts.join(" "));
    setText("");
    setAttached([]);
  }

  useEffect(() => {
    function onMove(e) {
      if (dragRef.current) {
        const d = dragRef.current;
        setPos({ x: e.clientX - d.dx, y: e.clientY - d.dy });
      }
      if (resizeRef.current) {
        const r = resizeRef.current;
        setSize({
          w: Math.max(380, r.w + (e.clientX - r.x)),
          h: Math.max(320, r.h + (e.clientY - r.y)),
        });
      }
    }
    function onUp() { dragRef.current = null; resizeRef.current = null; }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  function startDrag(e) {
    if (mode !== "floating") return;
    dragRef.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
  }
  function startResize(e) {
    if (mode !== "floating") return;
    resizeRef.current = { x: e.clientX, y: e.clientY, w: size.w, h: size.h };
    e.stopPropagation();
  }
  const dockResizeRef = useRef(null);
  function startDockResize(e) {
    if (mode !== "docked") return;
    dockResizeRef.current = { startY: e.clientY, startH: dockedHeight };
    e.preventDefault();
    e.stopPropagation();
  }
  useEffect(() => {
    function onMove(e) {
      if (!dockResizeRef.current) return;
      const r = dockResizeRef.current;
      const next = Math.max(220, Math.min(800, r.startH - (e.clientY - r.startY)));
      onDockedHeightChange?.(next);
    }
    function onUp() { dockResizeRef.current = null; }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [onDockedHeightChange]);
  function toggleMode() {
    // Цикл: mini → docked → side → floating → mini
    if (mode === "mini")     setMode("docked");
    else if (mode === "docked") setMode("side");
    else if (mode === "side")   setMode("floating");
    else setMode("mini");
  }

  const messages = activeFilter === "all"
    ? allMessages
    : allMessages.filter(m => m.agentId === activeFilter || m.agentId === "user");

  const containerStyle =
    mode === "docked" ? {
      position: "absolute",
      left: 16, right: 16, bottom: 16,
      height: dockedHeight,
    } : mode === "side" ? {
      width: 380, minWidth: 380,
      height: "100%",
      borderRadius: 0,
      borderTop: "none", borderBottom: "none", borderRight: "none",
      borderLeft: "1px solid rgba(38,38,51,0.06)",
      boxShadow: "none",
    } : mode === "mini" ? {
      position: "fixed",
      right: 24, bottom: 24,
      width: 380, height: 480,
      boxShadow: "0 12px 40px rgba(38,38,51,0.18)",
    } : {
      position: "absolute",
      left: pos.x, top: pos.y,
      width: size.w, height: size.h,
    };
  return (
    <div style={{
      background: color.white,
      border: mode === "side" ? "none" : "1px solid rgba(38,38,51,0.08)",
      borderRadius: mode === "side" ? 0 : 18,
      boxShadow: mode === "side" ? "none" : "0 2px 8px rgba(38,38,51,0.05)",
      ...containerStyle,
      display: "flex", flexDirection: "column",
      overflow: "hidden",
      zIndex: 10,
    }}>
      {/* Vertical resize handle сверху (только docked) */}
      {mode === "docked" && (
        <div
          onMouseDown={startDockResize}
          style={{
            position: "absolute", top: -3, left: 0, right: 0,
            height: 8,
            cursor: "ns-resize",
            zIndex: 12,
          }}
        />
      )}

      {/* Header (drag handle) */}
      <ChatHeader
        activeFilter={activeFilter}
        onFilter={onFilter}
        onClose={onClose}
        startDrag={startDrag}
        mode={mode}
        onToggleMode={toggleMode}
        typingAgents={typingAgents}
      />

      {/* Thread */}
      <div style={{
        flex: 1, minHeight: 0, overflowY: "auto",
        padding: "16px 18px",
      }}>
        {messages.map(m => <ChatMessage key={m.id} msg={m} onPick={appendUser} onAction={handleAction} />)}
        {messages.length === 0 && (
          <div style={{ fontSize: 13.5, color: "rgba(38,38,51,0.5)", textAlign: "center", padding: 24 }}>
            Сообщений нет
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: "0 14px 14px", position: "relative" }}>
        <div style={{
          background: color.white,
          border: "1px solid rgba(38,38,51,0.12)",
          borderRadius: 16,
          padding: "12px 14px",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          {/* Чипы прикреплённого + input на одной строке (wrap) */}
          <div style={{
            display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8,
            minHeight: 22,
          }}>
            {attached.map((it, i) => (
              <span key={i} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "6px 8px 6px 12px",
                background: "rgba(38,38,51,0.06)",
                border: "none",
                borderRadius: 10,
                fontSize: 13, color: "rgba(38,38,51,0.7)",
                maxWidth: 240,
              }}>
                <span style={{
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{it.name}</span>
                <button
                  onClick={() => removeAttached(i)}
                  title="Убрать"
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 16, height: 16,
                    background: "transparent", border: "none", borderRadius: "50%",
                    color: "rgba(38,38,51,0.45)", cursor: "pointer", padding: 0,
                    fontFamily: "inherit", flexShrink: 0,
                  }}
                >
                  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </span>
            ))}
            <input
              data-testid="chat-input"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={attached.length > 0 ? "" : (conversationId ? "Спросить у Mary" : "Загружаю чат…")}
              disabled={!conversationId}
              autoFocus={attached.length > 0}
              style={{
                border: "none", outline: "none",
                fontSize: 14, color: "#262633",
                background: "transparent", fontFamily: "inherit",
                padding: 0,
                flex: 1, minWidth: 120,
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setKbOpen(v => !v)}
              title="Добавить из базы знаний"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 28, height: 28,
                background: kbOpen ? "rgba(38,38,51,0.06)" : "transparent",
                border: "1px solid rgba(38,38,51,0.18)",
                borderRadius: "50%",
                color: "rgba(38,38,51,0.7)",
                cursor: "pointer", fontFamily: "inherit",
              }}>{ic.plus}</button>
            <button
              onClick={() => fileRef.current?.click()}
              title="Прикрепить файл с компьютера"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 28, height: 28,
                background: "transparent", border: "none", borderRadius: 7,
                color: "rgba(38,38,51,0.55)",
                cursor: "pointer", fontFamily: "inherit",
              }}>{ic.attach}</button>
            <input
              ref={fileRef} type="file" multiple
              onChange={handlePickFile}
              style={{ display: "none" }}
            />
            <div style={{ flex: 1 }} />
            <button title="Микрофон" style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 28, height: 28,
              background: "transparent", border: "none", borderRadius: 7,
              color: "rgba(38,38,51,0.55)",
              cursor: "pointer", fontFamily: "inherit",
            }}>{ic.mic}</button>
            <button
              data-testid="chat-send"
              onClick={send}
              disabled={!sendActive}
              title="Отправить"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 30, height: 30,
                background: sendActive ? "#262633" : "rgba(38,38,51,0.35)",
                border: "none", borderRadius: "50%",
                color: color.white,
                cursor: sendActive ? "pointer" : "not-allowed",
                fontFamily: "inherit",
                transition: transition.fast,
              }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5" />
                <path d="M5 12l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* KB dropdown — выпадает над input'ом */}
        {kbOpen && (
          <div style={{
            position: "absolute", left: 14, bottom: "100%", marginBottom: 6,
            background: color.white,
            border: "1px solid rgba(38,38,51,0.1)",
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(38,38,51,0.12)",
            padding: 6,
            minWidth: 280, maxHeight: 280, overflowY: "auto",
            zIndex: 6,
          }}>
            <div style={{
              fontSize: 11, fontWeight: 600, color: "rgba(38,38,51,0.5)",
              textTransform: "uppercase", letterSpacing: "0.04em",
              padding: "6px 10px 4px",
            }}>База знаний</div>
            {kbList.length === 0 && (
              <div style={{ padding: 12, fontSize: 13, color: "rgba(38,38,51,0.5)", textAlign: "center" }}>
                Пусто
              </div>
            )}
            {kbList.map((it, i) => (
              <button
                key={i}
                onClick={() => pickKb(it)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  width: "100%",
                  padding: "8px 10px",
                  background: "transparent", border: "none", borderRadius: 7,
                  cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(38,38,51,0.05)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: it.agent.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: "#262633", fontWeight: 500 }}>{it.title}</div>
                  <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)" }}>{it.agent.label}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Resize handle (только в floating) */}
      {mode === "floating" && (
        <div
          onMouseDown={startResize}
          style={{
            position: "absolute", right: 0, bottom: 0,
            width: 18, height: 18,
            cursor: "nwse-resize",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" style={{ position: "absolute", right: 2, bottom: 2 }}>
            <path d="M5 17 L17 5 M10 17 L17 10 M15 17 L17 15" stroke="rgba(38,38,51,0.35)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  );
}

// ── Узел внутреннего workflow (drill-in) ───────────────────
function FlowNode({ n, pos, w, h, accent = "#7A86FF", visible = true }) {
  const style = (kind) => {
    switch (kind) {
      case "input":      return { iconBg: "#FFF4D1", iconColor: "#FFB800",
        icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg> };
      case "subagent":   return { iconBg: "#EEF0FF", iconColor: "#7A86FF",
        icon: <svg width={18} height={18} viewBox="0 0 24 24"><rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor"/><rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor"/><circle cx="9.3" cy="13" r="1.4" fill="white"/><circle cx="14.7" cy="13" r="1.4" fill="white"/></svg> };
      case "llm-step":   return { iconBg: "#FFE7F5", iconColor: "#D946A8",
        icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 L14.5 9 L22 12 L14.5 15 L12 22 L9.5 15 L2 12 L9.5 9 Z"/></svg> };
      case "output-kb":  return { iconBg: "#E8F8EE", iconColor: "#34C759",
        icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> };
      case "next-agent": return { iconBg: accent + "26", iconColor: accent,
        icon: <svg width={18} height={18} viewBox="0 0 24 24"><rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor"/><rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor"/><circle cx="9.3" cy="13" r="1.4" fill="white"/><circle cx="14.7" cy="13" r="1.4" fill="white"/></svg> };
      default:           return { iconBg: "#EEF0FF", iconColor: "#7A86FF", icon: null };
    }
  };
  const s = style(n.kind);
  return (
    <div
      style={{
        position: "absolute",
        left: pos.x, top: pos.y,
        width: w, height: h,
        background: color.white,
        borderRadius: 24,
        boxShadow: "0 1px 2px rgba(38,38,51,0.04)",
        display: "flex", alignItems: "center", gap: 10,
        padding: "0 14px",
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.92)",
        transition: "opacity 0.4s ease 0.2s, transform 0.4s ease 0.2s",
        userSelect: "none",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 11,
        background: s.iconBg, color: s.iconColor,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>{s.icon}</div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{
          fontSize: 13, fontWeight: 510, color: "#262633", lineHeight: 1.15,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{n.title}</div>
        <div style={{
          fontSize: 11, color: "rgba(38,38,51,0.5)", marginTop: 2,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{n.sub}</div>
      </div>
      {/* Connector dots */}
      <span style={{
        position: "absolute", left: -5, top: "50%", transform: "translateY(-50%)",
        width: 9, height: 9, borderRadius: "50%",
        background: color.white, border: "1px solid rgba(38,38,51,0.18)",
      }} />
      <span style={{
        position: "absolute", right: -5, top: "50%", transform: "translateY(-50%)",
        width: 9, height: 9, borderRadius: "50%",
        background: color.white, border: "1px solid rgba(38,38,51,0.18)",
      }} />
    </div>
  );
}

// ── Sub-graph workflow одного агента (LEGACY — overlay, не используется) ───
function AgentFlowCanvas({ agent, onClose }) {
  const FLOW_NODE_W = 240;
  const FLOW_NODE_H = 64;
  const FLOW_PAD_X = 40;
  const FLOW_PAD_Y = 80; // снизу шапки
  const LANE_LABEL_H = 28;

  if (!agent?.flow) return null;
  const { nodes, edges, lanes = [] } = agent.flow;
  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));

  function pathBetween(a, b) {
    if (!a || !b) return "";
    const ax = a.x + FLOW_NODE_W;
    const ay = a.y + FLOW_NODE_H / 2;
    const bx = b.x;
    const by = b.y + FLOW_NODE_H / 2;
    const dx = Math.max(40, (bx - ax) / 2);
    return `M ${ax} ${ay} C ${ax + dx} ${ay}, ${bx - dx} ${by}, ${bx} ${by}`;
  }

  // Цвета и иконки в нашем стиле
  const nodeStyle = (kind) => {
    switch (kind) {
      case "trigger-cron":   return { iconBg: "#FFF4D1", iconColor: "#FFB800", labelKind: "Триггер · cron" };
      case "trigger-manual": return { iconBg: "#FFF4D1", iconColor: "#FFB800", labelKind: "Триггер · вручную" };
      case "integration":    return { iconBg: "#E6F1FF", iconColor: "#3F95FF", labelKind: "Источник" };
      case "subagent":       return { iconBg: "#EEF0FF", iconColor: "#7A86FF", labelKind: "Агент" };
      case "next-agent":     return { iconBg: agent.color + "26", iconColor: agent.color, labelKind: "Следующий агент" };
      case "output-kb":      return { iconBg: "#E8F8EE", iconColor: "#34C759", labelKind: "Артефакт" };
      default:               return { iconBg: "#EEF0FF", iconColor: "#7A86FF", labelKind: "" };
    }
  };

  const nodeIcon = (kind) => {
    if (kind === "trigger-cron") {
      return (
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    }
    if (kind === "trigger-manual") {
      return (
        <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 2 L4 14 h7 v8 l9 -12 h-7 z" />
        </svg>
      );
    }
    if (kind === "integration") {
      return (
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M3 9h18M9 3v18" />
        </svg>
      );
    }
    if (kind === "output-kb") {
      return (
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
      );
    }
    // subagent / next-agent — мини-робот как у AgentCard
    return (
      <svg width={18} height={18} viewBox="0 0 24 24">
        <rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor" />
        <rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor" />
        <circle cx="9.3" cy="13" r="1.4" fill="white" />
        <circle cx="14.7" cy="13" r="1.4" fill="white" />
      </svg>
    );
  };

  // Подсчёт canvas-bounds
  const maxX = Math.max(...nodes.map(n => n.x)) + FLOW_NODE_W + FLOW_PAD_X * 2;
  const maxY = Math.max(...nodes.map(n => n.y)) + FLOW_NODE_H + FLOW_PAD_Y + 80;

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: color.white,
      backgroundImage: "radial-gradient(rgba(38,38,51,0.12) 1px, transparent 1px)",
      backgroundSize: "20px 20px",
      backgroundPosition: "10px 10px",
      borderRadius: 18,
      overflow: "auto",
      zIndex: 6,
    }}>
      {/* Шапка drill-in */}
      <div style={{
        position: "sticky", top: 0, zIndex: 3,
        display: "flex", alignItems: "center", gap: 14,
        padding: "14px 20px",
        background: "linear-gradient(to bottom, rgba(255,255,255,0.97), rgba(255,255,255,0.88))",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(38,38,51,0.06)",
      }}>
        <button
          onClick={onClose}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 12px 6px 8px",
            background: "rgba(38,38,51,0.05)",
            color: "#262633",
            border: "none", borderRadius: 999,
            fontSize: 13, fontWeight: 500,
            cursor: "pointer", fontFamily: "inherit",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(38,38,51,0.09)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(38,38,51,0.05)"}
        >
          <span style={{ transform: "rotate(180deg)", display: "inline-flex", color: "rgba(38,38,51,0.6)" }}>{ic.arrowRight}</span>
          <span>Назад к графу</span>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: agent.color + "26",
            color: agent.color,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width={22} height={22} viewBox="0 0 24 24">
              <rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor" />
              <rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor" />
              <circle cx="9.3" cy="13" r="1.4" fill="white" />
              <circle cx="14.7" cy="13" r="1.4" fill="white" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#262633" }}>{agent.label}</div>
            <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.5)", marginTop: 1 }}>{agent.role}</div>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(38,38,51,0.5)" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34C759" }} />
          <span>workflow активен</span>
        </div>
      </div>

      {/* Канвас workflow */}
      <div style={{
        position: "relative",
        width: maxX,
        minHeight: maxY,
        padding: 0,
      }}>
        {/* Lane-заголовки */}
        {lanes.map(lane => (
          <div
            key={lane.id}
            style={{
              position: "absolute",
              left: lane.x + FLOW_PAD_X,
              top: FLOW_PAD_Y - LANE_LABEL_H,
              width: FLOW_NODE_W,
              fontSize: 11, fontWeight: 600,
              color: "rgba(38,38,51,0.45)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >{lane.label}</div>
        ))}

        {/* SVG-связи */}
        <svg
          width={maxX} height={maxY}
          style={{ position: "absolute", left: FLOW_PAD_X, top: FLOW_PAD_Y, pointerEvents: "none", overflow: "visible" }}
        >
          {edges.map(([f, t]) => (
            <path
              key={`${f}-${t}`}
              d={pathBetween(byId[f], byId[t])}
              stroke="rgba(38,38,51,0.18)"
              strokeWidth="1.4"
              fill="none"
            />
          ))}
        </svg>

        {/* Узлы */}
        {nodes.map(n => {
          const ns = nodeStyle(n.kind);
          return (
            <div
              key={n.id}
              style={{
                position: "absolute",
                left: n.x + FLOW_PAD_X,
                top: n.y + FLOW_PAD_Y,
                width: FLOW_NODE_W, height: FLOW_NODE_H,
                background: color.white,
                borderRadius: 24,
                display: "flex", alignItems: "center", gap: 12,
                padding: "0 16px",
                boxShadow: "0 1px 2px rgba(38,38,51,0.04)",
              }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: ns.iconBg, color: ns.iconColor,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>{nodeIcon(n.kind)}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontSize: 13.5, fontWeight: 510, color: "#262633",
                  lineHeight: 1.15,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{n.title}</div>
                <div style={{
                  fontSize: 11.5, color: "rgba(38,38,51,0.5)", marginTop: 3,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{n.sub}</div>
              </div>
              {/* Connector dots — как в основном графе */}
              <span style={{
                position: "absolute", left: -5, top: "50%", transform: "translateY(-50%)",
                width: 9, height: 9, borderRadius: "50%",
                background: color.white, border: "1px solid rgba(38,38,51,0.18)",
              }} />
              <span style={{
                position: "absolute", right: -5, top: "50%", transform: "translateY(-50%)",
                width: 9, height: 9, borderRadius: "50%",
                background: color.white, border: "1px solid rgba(38,38,51,0.18)",
              }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GraphCanvas({ chatOpen, chatMode, onChatModeChange, dockedHeight, onDockedHeightChange, onOpenChat, onCloseChat, activeFilter, onFilter, onAgentChat, onAgentSettings, selectedAgentId, approvals, onApprove, pendingMaryMessage, onPendingConsumed, taskFlow, onTaskFlowChange, onAddTask, onOpenTasks }) {
  const [positions, setPositions] = useState(() =>
    Object.fromEntries(AGENTS.map(a => [a.id, { x: a.x, y: a.y }]))
  );
  const [expandedId, setExpandedId] = useState(null);
  const [drilledAgentId, setDrilledAgentId] = useState(null);
  const [pipelineKb, setPipelineKb] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const dragRef = useRef(null);
  const wasDraggedRef = useRef(false);
  const panRef = useRef(null);
  const canvasRef = useRef(null);

  function zoomBy(delta) {
    setView(v => {
      const next = Math.max(0.3, Math.min(2, +(v.scale + delta).toFixed(2)));
      return { ...v, scale: next };
    });
  }
  function fitToView() {
    const padding = 60;
    const xs = Object.values(positions).map(p => p.x);
    const ys = Object.values(positions).map(p => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs) + CARD_W;
    const minY = Math.min(...ys), maxY = Math.max(...ys) + CARD_H;
    const cw = canvasRef.current?.clientWidth || 1000;
    const fullH = canvasRef.current?.clientHeight || 600;
    // Если чат докнут — учитываем что нижняя половина закрыта
    const chatBottom = chatOpen && chatMode === "docked" ? Math.round(fullH * 0.55) + 28 : 0;
    const ch = fullH - chatBottom;
    const sx = (cw - padding * 2) / (maxX - minX);
    const sy = (ch - padding * 2) / (maxY - minY);
    const scale = Math.min(1, Math.max(0.3, Math.min(sx, sy)));
    const x = (cw - (maxX - minX) * scale) / 2 - minX * scale;
    const y = (ch - (maxY - minY) * scale) / 2 - minY * scale;
    setView({ x, y, scale });
  }

  // Агент с актуальной позицией
  const agentsWithPos = AGENTS.map(a => ({ ...a, ...positions[a.id] }));
  const byId = Object.fromEntries(agentsWithPos.map(a => [a.id, a]));

  function pathBetween(from, to) {
    const x1 = from.x + CARD_W;
    const y1 = from.y + CARD_H / 2;
    const x2 = to.x;
    const y2 = to.y + CARD_H / 2;
    const dx = (x2 - x1) * 0.5;
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  }

  // ── DRILL-IN: zoom-в-агента + рендер внутренних нод ──────
  const drilledAgent = drilledAgentId ? byId[drilledAgentId] : null;
  const FLOW_NODE_W = 220;
  const FLOW_NODE_H = 64;
  const prevViewRef = useRef(null);

  // Вычисляем абсолютные координаты внутренних нод (offset от центра агента)
  function flowNodeAbsPos(agent, n) {
    const cx = agent.x + CARD_W / 2;
    const cy = agent.y + CARD_H / 2;
    return {
      x: cx + n.ox - FLOW_NODE_W / 2,
      y: cy + n.oy - FLOW_NODE_H / 2,
    };
  }
  function flowPathBetween(a, b) {
    const ax = a.x + FLOW_NODE_W;
    const ay = a.y + FLOW_NODE_H / 2;
    const bx = b.x;
    const by = b.y + FLOW_NODE_H / 2;
    const dx = Math.max(40, (bx - ax) * 0.5);
    return `M ${ax} ${ay} C ${ax + dx} ${ay}, ${bx - dx} ${by}, ${bx} ${by}`;
  }

  // Анимация: при входе в drill — летим в агента и фит inner-flow
  useEffect(() => {
    if (drilledAgent && drilledAgent.flow) {
      if (!prevViewRef.current) prevViewRef.current = { ...view };
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      // Bounding box внутренних нод
      const positions = drilledAgent.flow.nodes.map(n => flowNodeAbsPos(drilledAgent, n));
      const minX = Math.min(...positions.map(p => p.x));
      const minY = Math.min(...positions.map(p => p.y));
      const maxX = Math.max(...positions.map(p => p.x + FLOW_NODE_W));
      const maxY = Math.max(...positions.map(p => p.y + FLOW_NODE_H));
      const w = maxX - minX + 100;
      const h = maxY - minY + 100;
      const targetScale = Math.min(rect.width / w, rect.height / h, 1.0);
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      setView({
        x: rect.width / 2 - cx * targetScale,
        y: rect.height / 2 - cy * targetScale,
        scale: targetScale,
      });
    } else if (prevViewRef.current) {
      setView(prevViewRef.current);
      prevViewRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drilledAgentId]);

  useEffect(() => {
    function onMove(e) {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      if (!d.dragging && Math.hypot(dx, dy) > 4) {
        d.dragging = true;
        setDraggingId(d.id);
      }
      if (d.dragging) {
        setPositions(prev => ({
          ...prev,
          [d.id]: { x: Math.max(0, d.origX + dx), y: Math.max(0, d.origY + dy) },
        }));
      }
    }
    function onUp() {
      if (dragRef.current) {
        wasDraggedRef.current = dragRef.current.dragging;
        dragRef.current = null;
        setDraggingId(null);
      }
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  function handleAgentMouseDown(id, e) {
    const pos = positions[id];
    dragRef.current = {
      id,
      startX: e.clientX, startY: e.clientY,
      origX: pos.x, origY: pos.y,
      dragging: false,
    };
  }
  function handleAgentToggle(id) {
    if (wasDraggedRef.current) {
      wasDraggedRef.current = false;
      return;
    }
    // Если у агента есть workflow — сразу раскрываем его флоу.
    // Если нет — fallback на старый раскрывающийся pipeline на карточке.
    const a = AGENTS.find(x => x.id === id);
    if (a?.flow) {
      setDrilledAgentId(id);
      return;
    }
    setExpandedId(prev => prev === id ? null : id);
  }
  function handleOpenKb(title, agent) {
    setPipelineKb({ title, agent });
  }

  function handleCanvasMouseDown(e) {
    // Pan только если кликнули по пустому полю (не по карточке/контролам)
    if (e.target !== e.currentTarget && !e.target.dataset?.panSurface) return;
    panRef.current = { startX: e.clientX, startY: e.clientY, vx: view.x, vy: view.y };
  }
  useEffect(() => {
    function onMove(e) {
      if (!panRef.current) return;
      const p = panRef.current;
      setView(v => ({ ...v, x: p.vx + (e.clientX - p.startX), y: p.vy + (e.clientY - p.startY) }));
    }
    function onUp() { panRef.current = null; }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  return (
    <div
      ref={canvasRef}
      onMouseDown={handleCanvasMouseDown}
      style={{
        position: "relative",
        flex: 1,
        minHeight: 0,
        background: "#F7F7F7",
        backgroundImage: "radial-gradient(circle, #FFFFFF 1.4px, transparent 1.4px)",
        backgroundSize: "20px 20px",
        backgroundPosition: "10px 10px",
        borderRadius: 16,
        overflow: "hidden",
        cursor: panRef.current ? "grabbing" : "default",
      }}
    >
      {/* Breadcrumb внутри прямоугольника, сверху-слева */}
      <div style={{
        position: "absolute", top: 18, left: 24,
        display: "flex", alignItems: "center", gap: 8,
        fontSize: 13.5, color: "rgba(38,38,51,0.55)",
        zIndex: 5,
      }}>
        <span style={{ cursor: drilledAgentId ? "pointer" : "default" }}
          onClick={() => drilledAgentId && setDrilledAgentId(null)}
        >СММ-Отдел</span>
        <span style={{ opacity: 0.6 }}>›</span>
        <span
          style={{
            color: drilledAgentId ? "rgba(38,38,51,0.55)" : "#262633",
            cursor: drilledAgentId ? "pointer" : "default",
          }}
          onClick={() => drilledAgentId && setDrilledAgentId(null)}
        >Тг-канал</span>
        {drilledAgentId && drilledAgent && (
          <>
            <span style={{ opacity: 0.6 }}>›</span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 10px",
              background: drilledAgent.color + "1A",
              color: drilledAgent.color,
              borderRadius: 999,
              fontSize: 12.5, fontWeight: 500,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: drilledAgent.color }} />
              {drilledAgent.label}
            </span>
          </>
        )}
      </div>

      {/* Pan/zoom-обёртка для графа */}
      <div
        data-pan-surface="true"
        style={{
          position: "absolute", inset: 0,
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
          transformOrigin: "0 0",
          transition: panRef.current || dragRef.current
            ? "none"
            : drilledAgentId ? "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)" : "transform 0.18s ease",
        }}
      >
        {/* Главные ребра между агентами — гаснут при drill-in */}
        <svg
          width="100%" height="100%"
          style={{
            position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible",
            opacity: drilledAgentId ? 0 : 1,
            transition: "opacity 0.3s ease",
          }}
        >
          {EDGES.map(([f, t]) => (
            <path
              key={`${f}-${t}`}
              d={pathBetween(byId[f], byId[t])}
              stroke="rgba(38,38,51,0.18)"
              strokeWidth="1.4"
              fill="none"
            />
          ))}
        </svg>

        {/* Inner-flow ребра — появляются при drill-in */}
        {drilledAgent?.flow && (
          <svg
            width="100%" height="100%"
            style={{
              position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible",
              opacity: drilledAgentId ? 1 : 0,
              transition: "opacity 0.4s ease 0.2s",
            }}
          >
            {drilledAgent.flow.edges.map(([fid, tid]) => {
              const fn = drilledAgent.flow.nodes.find(n => n.id === fid);
              const tn = drilledAgent.flow.nodes.find(n => n.id === tid);
              if (!fn || !tn) return null;
              const a = flowNodeAbsPos(drilledAgent, fn);
              const b = flowNodeAbsPos(drilledAgent, tn);
              return (
                <path
                  key={`${fid}-${tid}`}
                  d={flowPathBetween(a, b)}
                  stroke="rgba(38,38,51,0.18)"
                  strokeWidth="1.4"
                  fill="none"
                />
              );
            })}
          </svg>
        )}

        {/* Карточки агентов */}
        {agentsWithPos.map(a => {
          const isDrilled = drilledAgentId === a.id;
          const hide      = !!drilledAgentId; // при drill-in прячем все агенты — видна только внутрянка
          return (
            <div
              key={a.id}
              style={{
                position: "absolute", inset: 0,
                opacity: hide ? 0 : 1,
                pointerEvents: hide ? "none" : "auto",
                transition: "opacity 0.35s ease",
              }}
            >
              <AgentCard
                a={a}
                expanded={expandedId === a.id}
                selected={selectedAgentId === a.id}
                dragging={draggingId === a.id}
                approvals={approvals}
                onApprove={onApprove}
                onMouseDown={(e) => handleAgentMouseDown(a.id, e)}
                onToggle={() => handleAgentToggle(a.id)}
                onOpenKb={(title) => handleOpenKb(title, a)}
                onOpenChat={onAgentChat}
                onOpenSettings={onAgentSettings}
                onOpenFlow={() => setDrilledAgentId(a.id)}
              />
            </div>
          );
        })}

        {/* Inner-flow ноды — появляются при drill-in */}
        {drilledAgent?.flow && drilledAgent.flow.nodes.map(n => {
          const pos = flowNodeAbsPos(drilledAgent, n);
          return (
            <FlowNode
              key={n.id}
              n={n}
              pos={pos}
              w={FLOW_NODE_W}
              h={FLOW_NODE_H}
              accent={drilledAgent.color}
              visible={!!drilledAgentId}
            />
          );
        })}
      </div>

      {pipelineKb && (
        <KbPopup item={pipelineKb} onClose={() => setPipelineKb(null)} />
      )}

      {/* Tool/zoom bar — поднимается над докнутым чатом */}
      <ToolBar
        chatOpen={chatOpen}
        chatMode={chatMode}
        dockedHeight={dockedHeight}
        scale={view.scale}
        onZoomIn={() => zoomBy(0.1)}
        onZoomOut={() => zoomBy(-0.1)}
        onFit={fitToView}
      />

      {/* Чип «Спросить у Mary» — всегда виден, открывает чат */}
      {!chatOpen && (
        <button
          onClick={onOpenChat}
          style={{
            position: "absolute", left: "50%", bottom: 16, transform: "translateX(-50%)",
            display: "flex", alignItems: "center", gap: 10,
            background: color.white,
            border: "1px solid rgba(38,38,51,0.08)",
            borderRadius: 999,
            padding: "9px 16px 9px 18px",
            boxShadow: "0 2px 8px rgba(38,38,51,0.06)",
            fontSize: 14, color: "#262633", fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <span>Спросить у Mary</span>
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 22, height: 22, borderRadius: 7,
            background: "rgba(255,139,61,0.12)", color: "#FF8B3D",
          }}>{ic.spark}</span>
        </button>
      )}

      {/* Плавающее или докнутое окно чата (side рендерится снаружи, в layout) */}
      {chatOpen && chatMode !== "side" && (
        <ChatPanel
          onClose={onCloseChat}
          activeFilter={activeFilter}
          onFilter={onFilter}
          mode={chatMode}
          onModeChange={onChatModeChange}
          dockedHeight={dockedHeight}
          onDockedHeightChange={onDockedHeightChange}
          pendingMaryMessage={pendingMaryMessage}
          onPendingConsumed={onPendingConsumed}
          taskFlow={taskFlow}
          onTaskFlowChange={onTaskFlowChange}
          onAddTask={onAddTask}
          onOpenTasks={onOpenTasks}
        />
      )}
    </div>
  );
}

function ToolBar({ chatOpen, chatMode, dockedHeight, scale, onZoomIn, onZoomOut, onFit }) {
  const [tool, setTool] = useState("pointer"); // "pointer" | "hand"
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      position: "absolute", left: 16,
      bottom: chatOpen && chatMode === "docked" ? (dockedHeight ?? 420) + 28 : 16,
      display: "flex", alignItems: "center",
      height: 40,
      background: color.white,
      border: "1px solid rgba(38,38,51,0.08)",
      borderRadius: 12,
      padding: "0 10px",
      boxShadow: "0 1px 2px rgba(38,38,51,0.04)",
      gap: 6,
      zIndex: 11,
      transition: transition.base,
    }}>
      {/* Tool selector */}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <button style={zoomBtn} onClick={() => setOpen(v => !v)}>
          {tool === "pointer" ? ic.pointer : ic.hand}
        </button>
        <button style={{ ...zoomBtn, color: "rgba(38,38,51,0.5)" }} onClick={() => setOpen(v => !v)}>
          {ic.chevron}
        </button>
        {open && (
          <div style={{
            position: "absolute", bottom: "calc(100% + 6px)", left: 0,
            background: color.white,
            border: "1px solid rgba(38,38,51,0.1)",
            borderRadius: 10,
            boxShadow: "0 6px 18px rgba(38,38,51,0.1)",
            padding: 4, minWidth: 130,
            zIndex: 5,
          }}>
            <ToolOpt icon={ic.pointer} label="Указатель" active={tool === "pointer"} onClick={() => { setTool("pointer"); setOpen(false); }} />
            <ToolOpt icon={ic.hand}    label="Рука"      active={tool === "hand"}    onClick={() => { setTool("hand"); setOpen(false); }} />
          </div>
        )}
      </div>
      <div style={{ width: 1, height: 18, background: "rgba(38,38,51,0.1)" }} />
      <button style={zoomBtn} title="Уменьшить" onClick={onZoomOut}>{ic.zoomOut}</button>
      <span style={{ fontSize: 13, color: "#262633", minWidth: 40, textAlign: "center", fontFamily: "inherit" }}>{Math.round((scale ?? 1) * 100)}%</span>
      <button style={zoomBtn} title="Увеличить" onClick={onZoomIn}>{ic.zoomIn}</button>
      <div style={{ width: 1, height: 18, background: "rgba(38,38,51,0.1)" }} />
      <button style={zoomBtn} title="Уместить весь флоу" onClick={onFit}>{ic.expand}</button>
    </div>
  );
}

function ToolOpt({ icon, label, active, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        width: "100%", padding: "7px 10px",
        background: active ? "rgba(38,38,51,0.06)" : h ? "rgba(38,38,51,0.03)" : "transparent",
        color: "#262633",
        border: "none", borderRadius: 7,
        cursor: "pointer", fontFamily: "inherit", textAlign: "left",
        fontSize: 13, fontWeight: 500,
      }}
    >
      <span style={{ display: "flex" }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// ── Правая узкая панель ─────────────────────────────────────
function RightRail({ activeRail, onSelect, chatSideActive, onToggleChatSide }) {
  // Маленькая иконка-агент 16px для правого рейла
  const agentMini = (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="#262633">
      <rect x="11.25" y="2" width="1.5" height="3" rx=".75" />
      <rect x="4.5" y="5.5" width="15" height="15" rx="4.5" />
      <circle cx="9.3" cy="13" r="1.4" fill="white" />
      <circle cx="14.7" cy="13" r="1.4" fill="white" />
    </svg>
  );
  const chatIcon = (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#262633" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />
    </svg>
  );
  const items = [
    { id: "tasks",        icon: ic.tasks,        label: "Задачи" },
    { id: "kb",           icon: ic.kb,           label: "База" },
    { id: "integrations", icon: ic.integrations, label: "Интеграции" },
    { id: "agents",       icon: agentMini,       label: "Агенты" },
    { id: "people",       icon: ic.people,       label: "Люди" },
  ];
  return (
    <aside style={{
      width: RIGHT_W, minWidth: RIGHT_W,
      background: color.white,
      borderLeft: "1px solid rgba(38,38,51,0.06)",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "16px 0",
      gap: 6,
    }}>
      {items.map(it => (
        <RailItem
          key={it.id}
          icon={it.icon}
          label={it.label}
          active={activeRail === it.id}
          onClick={() => onSelect(activeRail === it.id ? null : it.id)}
        />
      ))}
      <div style={{ width: 28, height: 1, background: "rgba(38,38,51,0.08)", margin: "4px 0" }} />
      <RailItem
        icon={chatIcon}
        label="Чат"
        active={chatSideActive}
        onClick={onToggleChatSide}
      />
    </aside>
  );
}
function RailItem({ icon, label, active, onClick }) {
  const [h, setH] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
        padding: "8px 6px", width: 50, borderRadius: 10,
        background: active ? "rgba(38,38,51,0.05)" : h ? "rgba(38,38,51,0.03)" : "transparent",
        cursor: "pointer", transition: transition.fast,
      }}
    >
      <span style={{ display: "flex", color: "#262633" }}>{icon}</span>
      <span style={{ fontSize: 11, color: "#262633", lineHeight: 1.1 }}>{label}</span>
    </div>
  );
}

// ── Drawer для правого рейла ────────────────────────────────
const RAIL_DRAWER_TITLE = {
  tasks: "Задачи отдела",
  kb: "База знаний",
  integrations: "Интеграции",
  agents: "Агенты",
  people: "Люди",
};

const MOCK_PEOPLE = [
  { id: 1, name: "Виктория Ахрамович", handle: "@vika",       role: "approver", title: "Head of SMM",      color: "#8A38F5", avatar: "/brand_logo.png", joined: "5 мая 2026", lastActive: "сейчас online", isMe: true },
  { id: 2, name: "Александр Орлов",     handle: "@a.orlov",    role: "approver", title: "Контент-стратег",  color: "#FF8B3D",                            joined: "5 мая 2026", lastActive: "10 мин назад" },
  { id: 3, name: "Алёна Иванова",       handle: "@alena.iv",   role: "member",   title: "SMM-менеджер",     color: "#3F95FF",                            joined: "12 мая 2026", lastActive: "1 час назад" },
  { id: 4, name: "Дмитрий Петров",      handle: "@d.petrov",   role: "member",   title: "Копирайтер",       color: "#7A86FF",                            joined: "14 мая 2026", lastActive: "вчера" },
  { id: 5, name: "Мария Соколова",      handle: "@m.sokolova", role: "member",   title: "Дизайнер",         color: "#FF6FB3",                            joined: "20 мая 2026", lastActive: "2 дня назад" },
];

const MOCK_TASKS = [
  { id: 1, title: "Ресёрч ТГ-каналов конкурентов", agent: "Ресерчер",   status: "Готово",      color: "#34C759" },
  { id: 2, title: "3 идеи постов на след. неделю", agent: "Маркетолог", status: "На апруве",   color: "#FF8B3D" },
  { id: 3, title: "Текст к идее #1 «Чек-лист»",    agent: "Копирайтер", status: "На апруве",   color: "#FF8B3D" },
  { id: 4, title: "Визуал к идее #1",              agent: "Дизайнер",   status: "На апруве",   color: "#FF8B3D" },
  { id: 5, title: "Текст к идее #2 «Кейс»",        agent: "Копирайтер", status: "В работе",    color: "#3F95FF" },
  { id: 6, title: "Аналитика поста от 5 мая",      agent: "Аналитик",   status: "Запланирована", color: "rgba(38,38,51,0.4)" },
];
const MOCK_FILES = {
  in: [
    { name: "brief_smm_q2.pdf",      size: "1.2 MB", time: "2 дня назад" },
    { name: "tone_of_voice.md",      size: "8 KB",   time: "5 дней назад" },
    { name: "competitor_audit.xlsx", size: "320 KB", time: "1 неделя" },
  ],
  out: [
    { name: "post_checklist_v1.md",  size: "4 KB",   time: "сегодня" },
    { name: "cover_v1.png",          size: "180 KB", time: "сегодня" },
    { name: "cover_v2.png",          size: "175 KB", time: "сегодня" },
    { name: "research_topweek.json", size: "12 KB",  time: "вчера" },
  ],
};
const MOCK_INTEGRATIONS = [
  { name: "Telegram",          desc: "Канал @mary_smm",       on: true  },
  { name: "Notion",            desc: "База контента",         on: true  },
  { name: "Google Analytics",  desc: "post analytics",        on: false },
  { name: "Slack",             desc: "Уведомления апрувов",   on: false },
];

function RailDrawer({ kind, onClose, agentsSelected, setAgentsSelected, kbUserItems, setKbUserItems, onCreateTask, pendingTasks }) {
  const [addOpen, setAddOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  return (
    <aside style={{
      width: 360, minWidth: 360,
      background: color.white,
      borderLeft: "1px solid rgba(38,38,51,0.06)",
      display: "flex", flexDirection: "column",
    }}>
      {/* Header (скрыт в режиме agent detail — там собственный header) */}
      {!(kind === "agents" && agentsSelected) && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "16px 18px",
          borderBottom: "1px solid rgba(38,38,51,0.06)",
        }}>
          <span style={{ fontSize: 15, fontWeight: 510, color: "#262633", flex: 1 }}>
            {RAIL_DRAWER_TITLE[kind]}
          </span>
          {kind === "kb" && (
            <button
              onClick={() => setAddOpen(true)}
              title="Добавить материал"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 28, height: 28,
                background: "rgba(38,38,51,0.05)",
                color: "rgba(38,38,51,0.6)",
                border: "none", borderRadius: 8,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >{ic.plus}</button>
          )}
          {kind === "people" && (
            <button
              onClick={() => setInviteOpen(true)}
              title="Пригласить"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 28, height: 28,
                background: "rgba(38,38,51,0.05)",
                color: "rgba(38,38,51,0.6)",
                border: "none", borderRadius: 8,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >{ic.plus}</button>
          )}
          {kind === "tasks" && (
            <button
              onClick={onCreateTask}
              title="Поставить задачу через чат с Mary"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 28, height: 28,
                background: "rgba(38,38,51,0.05)",
                color: "rgba(38,38,51,0.6)",
                border: "none", borderRadius: 8,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >{ic.plus}</button>
          )}
          <button onClick={onClose} style={{ ...zoomBtn, color: "rgba(38,38,51,0.55)", padding: 6 }}>
            {ic.close}
          </button>
        </div>
      )}
      {/* Body per kind */}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px" }}>
        {kind === "tasks"        && <TasksContent pendingTasks={pendingTasks} />}
        {kind === "kb"           && <FilesContent addOpen={addOpen} onCloseAdd={() => setAddOpen(false)} userItems={kbUserItems} setUserItems={setKbUserItems} />}
        {kind === "integrations" && <IntegrationsContent />}
        {kind === "agents"       && (
          <AgentsContent selected={agentsSelected} onSelect={setAgentsSelected} />
        )}
        {kind === "people"       && <PeopleContent />}
      </div>
    </aside>
  );
}

function TasksContent({ pendingTasks = [] }) {
  const [collapsed, setCollapsed] = useState({});
  const toggle = key => setCollapsed(c => ({ ...c, [key]: !c[key] }));

  // Собираем все cron-задачи из всех агентов в одну группу сверху
  const cronTasks = AGENTS.flatMap(a =>
    (a.tasks || []).filter(t => t.cron).map(t => ({ ...t, agent: a }))
  );

  function TaskCard({ t, agentBadge }) {
    const isCron = !!t.cron;
    const iconColor = isCron ? "#7A86FF" : "#3F95FF";
    return (
      <div style={{
        ...drawerRow,
        cursor: "pointer",
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: iconColor + "1F",
          color: iconColor,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          {isCron ? (
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          ) : (
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#262633", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
          {agentBadge && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: agentBadge.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)" }}>{agentBadge.label}</span>
            </div>
          )}
        </div>
        {isCron && (
          <span style={{
            fontSize: 11, color: "rgba(38,38,51,0.5)",
            fontFamily: "ui-monospace, SF Mono, monospace",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}>{t.cron.replace(/^cron\s*/, "")}</span>
        )}
        <button
          title={`Открыть «${t.out}» в базе знаний`}
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 28, height: 28, borderRadius: 8,
            background: "transparent",
            color: "rgba(38,38,51,0.55)",
            border: "none",
            cursor: "pointer", fontFamily: "inherit",
            flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(38,38,51,0.05)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          {ic.arrowRight}
        </button>
      </div>
    );
  }

  function GroupHeader({ dotColor, label, icon, isCollapsed, onToggle }) {
    return (
      <button
        onClick={onToggle}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 4px",
          width: "100%",
          background: "transparent", border: "none",
          cursor: "pointer", fontFamily: "inherit", textAlign: "left",
        }}
      >
        {icon ? icon : (
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
        )}
        <span style={{
          fontSize: 14, fontWeight: 500, color: "#262633",
        }}>{label}</span>
        <span style={{ flex: 1 }} />
        <span style={{
          display: "inline-flex",
          color: "rgba(38,38,51,0.45)",
          transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
          transition: "transform 0.15s ease",
        }}>{ic.chevron}</span>
      </button>
    );
  }

  const clockIcon = (
    <span style={{ display: "inline-flex", color: "rgba(38,38,51,0.55)" }}>
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    </span>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* 1. Крон-задачи (закреплены вверху) */}
      {cronTasks.length > 0 && (
        <div>
          <GroupHeader
            label={`Крон-задачи · ${cronTasks.length}`} count=""
            icon={clockIcon}
            isCollapsed={!!collapsed.cron}
            onToggle={() => toggle("cron")}
          />
          {!collapsed.cron && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {cronTasks.map((t, i) => (
                <TaskCard key={`cron-${i}`} t={t} dotColor="#34C759" agentBadge={t.agent} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Ожидающие принятия (под крон) */}
      {pendingTasks.length > 0 && (
        <div>
          <GroupHeader
            dotColor="#FFD60A"
            label={`Ожидает принятия · ${pendingTasks.length}`}
            isCollapsed={!!collapsed.pending}
            onToggle={() => toggle("pending")}
          />
          {!collapsed.pending && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {pendingTasks.map(t => (
                <div key={t.id} style={{
                  background: color.white,
                  border: "1px solid rgba(38,38,51,0.08)",
                  borderRadius: 10,
                  padding: "10px 12px",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FFD60A", marginTop: 5, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: "#262633" }}>{t.title}</div>
                      <div style={{ fontSize: 11, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>
                        {t.kind === "agent" ? `${t.assignee}-агенту` : t.assignee} · {t.status} · поставлено в {t.createdAt}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Все остальные задачи (без cron, не pending) — один список */}
      {(() => {
        const otherTasks = AGENTS.flatMap(a =>
          (a.tasks || []).filter(t => !t.cron).map(t => ({ ...t, agent: a }))
        );
        if (otherTasks.length === 0) return null;
        return (
          <div>
            <GroupHeader
              dotColor="#34C759"
              label={`В работе · ${otherTasks.length}`}
              isCollapsed={!!collapsed.work}
              onToggle={() => toggle("work")}
            />
            {!collapsed.work && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {otherTasks.map((t, i) => (
                  <TaskCard key={`other-${i}`} t={t} dotColor="#34C759" agentBadge={t.agent} />
                ))}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

function FilesContent({ addOpen, onCloseAdd, userItems = [], setUserItems }) {
  const [tab, setTab] = useState("in");
  const [opened, setOpened] = useState(null);
  const [textView, setTextView] = useState(null);
  const [serverFiles, setServerFiles] = useState([]);

  // Подтягиваем файлы созданные Mary через File Agent
  useEffect(() => {
    let active = true;
    const load = () =>
      fetch("/api/mary/kb/files")
        .then(r => r.ok ? r.json() : { files: [] })
        .then(d => { if (active) setServerFiles(d.files || []); })
        .catch(() => {});
    load();
    const id = setInterval(load, 5000); // обновляем каждые 5 сек на случай новых
    return () => { active = false; clearInterval(id); };
  }, []);

  const items = AGENTS.flatMap(a => {
    const list = tab === "in" ? (a.kb?.inputs || []) : (a.kb?.outputs || []);
    return list.map(it => ({ ...it, agent: a }));
  });

  function addUserItem(it) {
    setUserItems(prev => [it, ...prev]);
  }
  async function openServerFile(name) {
    const r = await fetch("/api/mary/kb/file?name=" + encodeURIComponent(name));
    if (!r.ok) return;
    const d = await r.json();
    setTextView({ name: d.name, body: d.content, kind: "text", meta: `${d.length} симв. · от Mary` });
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 0 12px" }}>
        <FilterChip label="Получено" active={tab === "in"}  onClick={() => setTab("in")} />
        <FilterChip label="Сделано"  active={tab === "out"} onClick={() => setTab("out")} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {/* Файлы созданные Mary через File Agent */}
        {tab === "in" && serverFiles.map((f, i) => (
          <div
            key={`srv-${i}`}
            onClick={() => openServerFile(f.name)}
            style={{ ...drawerRow, cursor: "pointer" }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "rgba(52,199,89,0.14)", color: "#34C759",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>{ic.fileSm || ic.file}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 450, color: "#262633", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
              <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>
                {fmtBytes(f.size)} · от Mary · {new Date(f.modified).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 600, color: "#34C759",
              background: "rgba(52,199,89,0.12)",
              padding: "2px 7px", borderRadius: 999,
            }}>MARY</span>
          </div>
        ))}
        {/* Сначала загруженные пользователем */}
        {tab === "in" && userItems.map((it, i) => {
          const canOpenFile = (it.kind === "file" || it.kind === "image") && it.data;
          const isLink = it.kind === "link";
          const isText = it.kind === "text" && it.body;
          function open() {
            if (isLink) { window.open(it.name, "_blank"); return; }
            if (canOpenFile) { window.open(it.data, "_blank"); return; }
            if (isText) { setTextView(it); return; }
          }
          const clickable = canOpenFile || isLink || isText;
          return (
          <div
            key={`u-${i}`}
            onClick={clickable ? open : undefined}
            title={clickable ? "Открыть" : ""}
            style={{ ...drawerRow, cursor: clickable ? "pointer" : "default" }}
          >
            <UserItemThumb it={it} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 450, color: "#262633", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.name}</div>
              <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                <UserItemKindBadge kind={it.kind} />
                <span>{it.meta}</span>
              </div>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 600, color: "#7A86FF",
              background: "rgba(122,134,255,0.12)",
              padding: "2px 7px", borderRadius: 999,
            }}>NEW</span>
          </div>
          );
        })}

        {/* Потом — авто-источники от агентов */}
        {items.map((it, i) => (
          <div
            key={i}
            onClick={() => setOpened(it)}
            style={{ ...drawerRow, cursor: "pointer" }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: it.agent.color + "1A",
              color: it.agent.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              {tab === "in" ? ic.inboxArrow : ic.package}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 450, color: "#262633" }}>{it.title}</div>
              <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: it.agent.color }} />
                <span>{it.agent.label}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {opened && <KbPopup item={opened} onClose={() => setOpened(null)} />}
      {addOpen && <AddKbPopup onAdd={addUserItem} onClose={onCloseAdd} />}
      {textView && <TextViewerPopup item={textView} onClose={() => setTextView(null)} />}
    </>
  );
}

function userItemIcon(kind) {
  if (kind === "image") return ic.image;
  if (kind === "link")  return ic.link;
  if (kind === "text")  return ic.text;
  return ic.file;
}
const KIND_META = {
  image: { color: "#3F95FF", label: "Фото" },
  link:  { color: "#34C759", label: "Ссылка" },
  text:  { color: "#FF8B3D", label: "Текст" },
  file:  { color: "#7A86FF", label: "Файл" },
};
function UserItemThumb({ it }) {
  // Картинка с превью — рисуем сам файл миниатюрой
  if (it.kind === "image" && it.data) {
    return (
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: "rgba(38,38,51,0.05)",
        flexShrink: 0,
        overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <img src={it.data} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    );
  }
  const meta = KIND_META[it.kind] || KIND_META.file;
  return (
    <div style={{
      width: 32, height: 32, borderRadius: 8,
      background: meta.color + "22",
      color: meta.color,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>{userItemIcon(it.kind)}</div>
  );
}
function UserItemKindBadge({ kind }) {
  const meta = KIND_META[kind] || KIND_META.file;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "1px 7px",
      background: meta.color + "1F",
      color: meta.color,
      borderRadius: 999,
      fontSize: 10, fontWeight: 500,
    }}>{meta.label}</span>
  );
}
function fmtBytes(b) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(1) + " MB";
}

// ── Просмотр спарсенных постов ──────────────────────────────
function parseViews(v) {
  if (!v) return 0;
  const n = parseFloat(String(v).replace(",", "."));
  return /k$/i.test(v) ? n * 1000 : n;
}

function PostCard({ p }) {
  const [open, setOpen] = useState(false);
  const url = `https://t.me/${p.ch}/${p.id}`;
  return (
    <div style={{
      background: color.white,
      border: "1px solid rgba(38,38,51,0.08)",
      borderRadius: 12,
      padding: "12px 14px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <a
          href={`https://t.me/${p.ch}`}
          target="_blank" rel="noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 12, fontWeight: 600, color: "#3F95FF",
            textDecoration: "none",
          }}
        >
          <span style={{ display: "flex" }}>{ic.paperPlane}</span>
          @{p.ch}
        </a>
        <span style={{ fontSize: 11.5, color: "rgba(38,38,51,0.5)" }}>· {p.time}</span>
        {p.hasMedia && (
          <span title="Есть медиа" style={{
            display: "inline-flex", alignItems: "center", gap: 3,
            fontSize: 11, color: "rgba(38,38,51,0.5)",
            marginLeft: "auto",
          }}>
            {ic.mediaPic}
          </span>
        )}
      </div>

      {/* Text */}
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          fontSize: 13, color: "#262633", lineHeight: 1.5,
          marginTop: 8,
          cursor: "pointer",
          display: open ? "block" : "-webkit-box",
          WebkitLineClamp: open ? "unset" : 2,
          WebkitBoxOrient: "vertical",
          overflow: open ? "visible" : "hidden",
        }}
      >{p.text}</div>

      {/* Footer: metrics + link */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        marginTop: 10,
        fontSize: 11.5, color: "rgba(38,38,51,0.6)",
      }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          {ic.eye} {p.views || p.view || "—"}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          {ic.heart} {p.reactions}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          {ic.bubbleSm} {p.comments}
        </span>
        <a
          href={url}
          target="_blank" rel="noreferrer"
          style={{
            marginLeft: "auto",
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 11.5, color: "#262633", fontWeight: 500,
            textDecoration: "none",
            padding: "4px 8px",
            border: "1px solid rgba(38,38,51,0.12)",
            borderRadius: 7,
          }}
        >
          Открыть в ТГ {ic.externalLink}
        </a>
      </div>
    </div>
  );
}

const PERIOD_DAYS = { today: 0, week: 7, month: 30, all: Infinity };
const PERIOD_LABEL = {
  today: "За сегодня",
  week:  "За неделю",
  month: "За месяц",
  all:   "За всё время",
};
const MODE_LABEL = {
  feed:  "По постам",
  group: "По каналам",
};
const SORT_FN = {
  views:     (a, b) => parseViews(b.views || b.view) - parseViews(a.views || a.view),
  reactions: (a, b) => (b.reactions || 0) - (a.reactions || 0),
  comments:  (a, b) => (b.comments  || 0) - (a.comments  || 0),
  newest:    (a, b) => (a.daysAgo   || 0) - (b.daysAgo   || 0),
};
const SORT_LABEL = {
  views:     "По охвату",
  reactions: "По реакциям",
  comments:  "По комментам",
  newest:    "По времени",
};

function DropdownChip({ value, options, onChange, openId, setOpenId, id }) {
  const open = openId === id;
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpenId(open ? null : id)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          height: 32, padding: "0 12px",
          background: color.white,
          border: "1px solid rgba(38,38,51,0.1)",
          borderRadius: 999,
          fontSize: 13, color: "#262633", fontWeight: 500,
          cursor: "pointer", fontFamily: "inherit",
        }}
      >
        <span>{options[value]}</span>
        <span style={{ display: "flex", color: "rgba(38,38,51,0.5)" }}>{ic.chevron}</span>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, marginTop: 4,
          background: color.white,
          border: "1px solid rgba(38,38,51,0.1)",
          borderRadius: 10,
          boxShadow: "0 6px 18px rgba(38,38,51,0.1)",
          zIndex: 5, minWidth: 160, padding: 4,
        }}>
          {Object.entries(options).map(([k, label]) => (
            <button
              key={k}
              onClick={() => { onChange(k); setOpenId(null); }}
              style={{
                display: "block", width: "100%",
                textAlign: "left",
                padding: "8px 10px",
                background: value === k ? "rgba(38,38,51,0.05)" : "transparent",
                border: "none", borderRadius: 7,
                fontSize: 13, color: "#262633",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >{label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function PostsViewer({ rows }) {
  const [mode, setMode] = useState("feed");
  const [period, setPeriod] = useState("today");
  const [sort, setSort] = useState("views");
  const [openId, setOpenId] = useState(null);

  const maxDays = PERIOD_DAYS[period];
  const filtered = rows.filter(r => (r.daysAgo ?? 0) <= maxDays);
  const sorted = [...filtered].sort(SORT_FN[sort]);

  const grouped = {};
  filtered.forEach(r => { (grouped[r.ch] ||= []).push(r); });
  Object.keys(grouped).forEach(ch => grouped[ch].sort(SORT_FN[sort]));
  const channels = Object.keys(grouped);

  return (
    <div>
      {/* 3 dropdown chips */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <DropdownChip id="period" value={period} options={PERIOD_LABEL} onChange={setPeriod} openId={openId} setOpenId={setOpenId} />
        <DropdownChip id="mode"   value={mode}   options={MODE_LABEL}   onChange={setMode}   openId={openId} setOpenId={setOpenId} />
        <DropdownChip id="sort"   value={sort}   options={SORT_LABEL}   onChange={setSort}   openId={openId} setOpenId={setOpenId} />
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11.5, color: "rgba(38,38,51,0.5)", alignSelf: "center" }}>
          {filtered.length} {mode === "group" ? `· ${channels.length} каналов` : "постов"}
        </span>
      </div>

      {filtered.length === 0 && (
        <div style={{
          fontSize: 13, color: "rgba(38,38,51,0.5)", textAlign: "center",
          padding: 32,
        }}>За этот период постов нет</div>
      )}

      {mode === "feed" && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sorted.map((p, i) => <PostCard key={i} p={p} />)}
        </div>
      )}
      {mode === "group" && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {channels.map(ch => (
            <ChannelGroup key={ch} ch={ch} posts={grouped[ch]} />
          ))}
        </div>
      )}
    </div>
  );
}

function ChannelGroup({ ch, posts }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "0 4px 8px",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <span style={{ display: "flex", color: "rgba(38,38,51,0.5)", transform: open ? "" : "rotate(-90deg)", transition: transition.fast }}>
          {ic.chevron}
        </span>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "#262633" }}>@{ch}</span>
        <span style={{ fontSize: 11.5, color: "rgba(38,38,51,0.5)" }}>· {posts.length}</span>
      </div>
      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {posts.map((p, i) => <PostCard key={i} p={p} />)}
        </div>
      )}
    </div>
  );
}

function TextViewerPopup({ item, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(38,38,51,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 560, maxWidth: "100%", maxHeight: "80vh",
          background: color.white,
          borderRadius: 18,
          boxShadow: "0 20px 60px rgba(38,38,51,0.25)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "14px 18px",
          borderBottom: "1px solid rgba(38,38,51,0.06)",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "rgba(122,134,255,0.14)", color: "#7A86FF",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>{ic.text}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 510, color: "#262633", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
            <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>{item.meta} · загрузил(а) ты</div>
          </div>
          <button onClick={onClose} style={{ ...zoomBtn, padding: 6, color: "rgba(38,38,51,0.55)" }}>{ic.close}</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 18 }}>
          <div style={{
            background: "rgba(38,38,51,0.03)",
            borderRadius: 10,
            padding: "14px 16px",
            fontSize: 13.5, color: "#262633", lineHeight: 1.55,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}>{item.body}</div>
        </div>
      </div>
    </div>
  );
}

function AddKbPopup({ onAdd, onClose }) {
  const [over, setOver] = useState(false);
  const [askLink, setAskLink] = useState(false);
  const [askText, setAskText] = useState(false);
  const [linkVal, setLinkVal] = useState("");
  const [textVal, setTextVal] = useState("");
  const [pasteFlash, setPasteFlash] = useState(false);
  const fileRef = useRef(null);

  // Поддержка Cmd/Ctrl+V — вставка картинки или текста из буфера
  useEffect(() => {
    function onPaste(e) {
      // Если открыто текстовое поле — пусть вставка идёт туда обычным образом
      const tag = (e.target?.tagName || "").toLowerCase();
      if ((tag === "input" || tag === "textarea") && askText) return;
      const items = e.clipboardData?.items || [];
      // Картинка из буфера
      for (const it of items) {
        if (it.type?.startsWith("image/")) {
          const file = it.getAsFile();
          if (file) {
            e.preventDefault();
            const named = new File([file], file.name && file.name !== "image.png" ? file.name : `clipboard_${Date.now()}.${(file.type.split("/")[1] || "png")}`, { type: file.type });
            setPasteFlash(true);
            setTimeout(() => setPasteFlash(false), 250);
            handleFiles([named]);
            return;
          }
        }
      }
      // Текст / URL из буфера
      const txt = e.clipboardData?.getData("text")?.trim();
      if (txt) {
        e.preventDefault();
        setPasteFlash(true);
        setTimeout(() => setPasteFlash(false), 250);
        if (/^https?:\/\//i.test(txt) && !/\s/.test(txt)) {
          onAdd({ kind: "link", name: txt, meta: "ссылка" });
        } else {
          const firstLine = txt.split("\n")[0].slice(0, 60) || "Заметка";
          onAdd({ kind: "text", name: firstLine, meta: `${txt.length} симв.`, body: txt });
        }
        onClose();
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [askText]);

  function handleFiles(fileList) {
    Array.from(fileList).forEach(f => {
      const isImg = f.type.startsWith("image/");
      const reader = new FileReader();
      reader.onload = () => {
        onAdd({
          kind: isImg ? "image" : "file",
          name: f.name,
          meta: fmtBytes(f.size),
          mime: f.type,
          data: reader.result,
        });
      };
      reader.readAsDataURL(f);
    });
    onClose();
  }
  function handleDrop(e) {
    e.preventDefault();
    setOver(false);
    if (e.dataTransfer.files?.length) {
      handleFiles(e.dataTransfer.files);
      return;
    }
    const url = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");
    if (url && /^https?:\/\//i.test(url.trim())) {
      onAdd({ kind: "link", name: url.trim(), meta: "ссылка" });
      onClose();
    }
  }
  function addLink() {
    const v = linkVal.trim();
    if (!v) return;
    const url = /^https?:\/\//i.test(v) ? v : "https://" + v;
    onAdd({ kind: "link", name: url, meta: "ссылка" });
    setLinkVal("");
    setAskLink(false);
    onClose();
  }
  function addText() {
    const v = textVal.trim();
    if (!v) return;
    const firstLine = v.split("\n")[0].slice(0, 60) || "Заметка";
    onAdd({ kind: "text", name: firstLine, meta: `${v.length} симв.`, body: v });
    setTextVal("");
    setAskText(false);
    onClose();
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(38,38,51,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 440, maxWidth: "100%",
          background: color.white,
          borderRadius: 18,
          boxShadow: "0 20px 60px rgba(38,38,51,0.25)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center",
          padding: "14px 16px",
          borderBottom: "1px solid rgba(38,38,51,0.06)",
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#262633", flex: 1 }}>
            Добавить в базу знаний
          </span>
          <button onClick={onClose} style={{ ...zoomBtn, padding: 6, color: "rgba(38,38,51,0.55)" }}>
            {ic.close}
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 18 }}>
          <div
            onDragOver={e => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `1.5px dashed ${over || pasteFlash ? "#7A86FF" : "rgba(38,38,51,0.18)"}`,
              background: pasteFlash ? "rgba(122,134,255,0.16)" : over ? "rgba(122,134,255,0.06)" : "rgba(38,38,51,0.02)",
              borderRadius: 12,
              padding: "28px 18px",
              textAlign: "center",
              cursor: "pointer",
              transition: transition.fast,
            }}
          >
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              color: over || pasteFlash ? "#7A86FF" : "rgba(38,38,51,0.55)",
              marginBottom: 10,
            }}>{ic.uploadCloud}</div>
            <div style={{ fontSize: 14, fontWeight: 510, color: "#262633" }}>
              Перетащи файл, картинку или ссылку
            </div>
            <div style={{ fontSize: 12, color: "rgba(38,38,51,0.55)", marginTop: 4 }}>
              кликни, чтобы выбрать с компьютера, или вставь Cmd+V
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            multiple
            onChange={e => { handleFiles(e.target.files); e.target.value = ""; }}
            style={{ display: "none" }}
          />

          {askLink && (
            <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
              <input
                autoFocus
                value={linkVal}
                onChange={e => setLinkVal(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addLink(); if (e.key === "Escape") setAskLink(false); }}
                placeholder="https://..."
                style={{
                  flex: 1, height: 36, padding: "0 12px",
                  background: color.white,
                  border: "1px solid rgba(38,38,51,0.1)",
                  borderRadius: 9,
                  fontSize: 13, color: "#262633",
                  fontFamily: "inherit", outline: "none",
                }}
              />
              <button onClick={addLink} style={{
                height: 36, padding: "0 14px",
                background: "#262633", color: color.white,
                border: "none", borderRadius: 9,
                fontSize: 13, fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit",
              }}>Добавить</button>
            </div>
          )}
          {askText && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
              <textarea
                autoFocus
                value={textVal}
                onChange={e => setTextVal(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addText();
                  if (e.key === "Escape") setAskText(false);
                }}
                placeholder="Вставь или напиши текст…"
                style={{
                  width: "100%", minHeight: 120, padding: "10px 12px",
                  background: color.white,
                  border: "1px solid rgba(38,38,51,0.1)",
                  borderRadius: 9,
                  fontSize: 13, color: "#262633", lineHeight: 1.5,
                  fontFamily: "inherit", outline: "none",
                  resize: "vertical",
                }}
              />
              <button onClick={addText} style={{
                alignSelf: "flex-end",
                height: 36, padding: "0 14px",
                background: "#262633", color: color.white,
                border: "none", borderRadius: 9,
                fontSize: 13, fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit",
              }}>Добавить</button>
            </div>
          )}
          {!askLink && !askText && (
            <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
              <button onClick={() => setAskText(true)} style={smallActionBtn}>
                <span style={{ display: "flex" }}>{ic.text}</span>
                <span>Текст</span>
              </button>
              <button onClick={() => setAskLink(true)} style={smallActionBtn}>
                <span style={{ display: "flex" }}>{ic.link}</span>
                <span>Ссылка</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const smallActionBtn = {
  flex: 1,
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
  height: 36,
  background: color.white,
  border: "1px solid rgba(38,38,51,0.1)",
  borderRadius: 9,
  fontSize: 13, color: "#262633", fontWeight: 500,
  cursor: "pointer", fontFamily: "inherit",
};

// ── Контент КБ (моки по типу) ───────────────────────────────
const KB_CONTENT = {
  "Каналы для парсинга": {
    type: "list",
    editable: "tg",
    rows: [
      { name: "@YakovPartners",            meta: "канал" },
      { name: "@ai_product",               meta: "канал" },
      { name: "@app_growth",               meta: "канал" },
      { name: "@bogdanisssimo",            meta: "канал" },
      { name: "@business_by",              meta: "канал" },
      { name: "@cryptoEssay",              meta: "канал" },
      { name: "@danokhlopkov",             meta: "канал" },
      { name: "@dashalovesstartups",       meta: "канал" },
      { name: "@dimabeseda",               meta: "канал" },
      { name: "@gleb_pro_ai",              meta: "канал" },
      { name: "@gordeyai",                 meta: "канал" },
      { name: "@ict_moscow_ai",            meta: "канал" },
      { name: "@ikspertnaya",              meta: "канал" },
      { name: "@ilya_krasinsky",           meta: "канал" },
      { name: "@its_capitan",              meta: "канал" },
      { name: "@kgrbnv",                   meta: "канал" },
      { name: "@linkedinhero",             meta: "канал" },
      { name: "@machinelearning_interview",meta: "канал" },
      { name: "@marketpsy",                meta: "канал" },
      { name: "@microfounders",            meta: "канал" },
      { name: "@mnk_stories",              meta: "канал" },
      { name: "@neural_prosecco",          meta: "канал" },
      { name: "@pervmarketing",            meta: "канал" },
      { name: "@pohodu_media",             meta: "канал" },
      { name: "@salikov_i",                meta: "канал" },
      { name: "@showstartup",              meta: "канал" },
      { name: "@telega_Rinata",            meta: "канал" },
      { name: "@tvoi_memolog",             meta: "канал" },
      { name: "@vladimir_merkushev",       meta: "канал" },
      { name: "@your_pet_project",         meta: "канал" },
      { name: "@zheleznyak_gi",            meta: "канал" },
    ],
  },
  "Ручные материалы": {
    type: "files",
    rows: [
      { name: "brief_smm_q2.pdf",        meta: "1.2 MB · 2 дня назад" },
      { name: "competitor_audit.xlsx",   meta: "320 KB · 1 неделя"   },
      { name: "voice_examples.md",       meta: "8 KB · 5 дней назад"  },
      { name: "swipe_file_2026.pdf",     meta: "4.5 MB · 2 недели"    },
    ],
  },
  "Tone of voice Mary": {
    type: "text",
    body: "Mary говорит:\n• Просто и без воды — никаких «синергий» и «таргетов»\n• С эмпатией к индихакеру и no-code-разработчику\n• С лёгкой иронией, но без сарказма\n• Конкретные примеры > общие советы\n• Эмодзи редко, только смыслово\n• Длина — 300–800 знаков для ТГ-постов",
  },
  "Контент-план (шаблон)": {
    type: "list",
    rows: [
      { name: "Понедельник",    meta: "Кейс / разбор" },
      { name: "Среда",          meta: "Чек-лист / гайд" },
      { name: "Пятница",        meta: "Тренд / новость с разбором" },
      { name: "Воскресенье",    meta: "Опрос / обсуждение" },
    ],
  },
  "Инсайт-карточки от Ресерчера": {
    type: "cards",
    rows: [
      { title: "Тренд: AI-агенты для SMM", meta: "12 постов конкурентов · хайп" },
      { title: "Boom: no-code запуски",    meta: "8 постов · растущий" },
      { title: "Дискуссия: рилсы vs посты", meta: "15 постов · затухание"  },
      { title: "+ ещё 9 карточек",         meta: "не показаны" },
    ],
  },
  "Утверждённые идеи": {
    type: "cards",
    rows: [
      { title: "Чек-лист: что проверить в SMM-стратегии до запуска", meta: "практика" },
      { title: "Кейс: как мы подняли вовлечённость в ТГ на 40%",     meta: "кейс с цифрами" },
      { title: "Разбор: почему рилсы заходят, а посты нет",          meta: "разбор тренда" },
    ],
  },
  "Примеры лучших постов": {
    type: "cards",
    rows: [
      { title: "5 ошибок в SMM, которые убивают охват", meta: "12.4k охват · 324 реакции" },
      { title: "Как мы выросли с 0 до 50k за 3 месяца", meta: "8.7k охват · 201 реакция"  },
      { title: "+ ещё 22 поста",                        meta: "не показаны"               },
    ],
  },
  "Опубликованные посты": {
    type: "cards",
    rows: [
      { title: "Пост #38 · Чек-лист SMM",   meta: "5 мая · 4.2k охват · ER 6.8%" },
      { title: "Пост #37 · Кейс роста",     meta: "3 мая · 5.8k охват · ER 8.1%" },
      { title: "Пост #36 · Разбор рилсов",  meta: "1 мая · 3.1k охват · ER 4.2%" },
      { title: "+ ещё 35 постов",           meta: "не показаны" },
    ],
  },
  "История метрик": {
    type: "text",
    body: "Средние показатели за квартал:\n• Охват: 4.6k (+18% к предыдущему кварталу)\n• ER: 6.2% (+0.8 п.п.)\n• Подписчиков: +1.2k\n• Лучший пост: #37 (ER 8.1%)\n• Худший пост: #29 (ER 2.3%)",
  },
  "Конкуренты для бенчмарка": {
    type: "list",
    editable: "tg",
    rows: [
      { name: "@marketing_pro",   meta: "12.4k · ER 5.4%" },
      { name: "@growth_hacks",    meta: "8.7k · ER 7.8%"  },
      { name: "@content_kitchen", meta: "6.2k · ER 6.1%"  },
    ],
  },
  // Outputs
  "Идеи постов": {
    type: "cards",
    rows: [
      { title: "Чек-лист SMM",     meta: "практика · апрувнуто" },
      { title: "Кейс роста +40%",  meta: "кейс · апрувнуто" },
      { title: "Разбор рилсов",    meta: "разбор · апрувнуто" },
    ],
  },
  "Концепты": {
    type: "cards",
    rows: [
      { title: "#1 Чек-лист", meta: "хук → 7 пунктов → CTA на гайд" },
      { title: "#2 Кейс",     meta: "крюк → цифры → метод → вывод"   },
      { title: "#3 Разбор",   meta: "тренд → почему → антитренд → mary" },
    ],
  },
  "Готовые тексты": {
    type: "cards",
    rows: [
      { title: "Текст #1 (Чек-лист)",  meta: "638 знаков · готов" },
      { title: "Текст #2 (Кейс)",      meta: "742 знака · в работе" },
      { title: "Текст #3 (Разбор)",    meta: "не начат" },
    ],
  },
  "A/B варианты": {
    type: "cards",
    rows: [
      { title: "Чек-лист · вариант A", meta: "хук про ошибки" },
      { title: "Чек-лист · вариант B", meta: "хук про экономию" },
    ],
  },
  "Обложки постов": {
    type: "list",
    rows: [
      { name: "cover_v1.png", meta: "1080×1080 · оранжевая" },
      { name: "cover_v2.png", meta: "1080×1080 · синяя"     },
      { name: "cover_v3.png", meta: "1080×1080 · фиолетовая" },
    ],
  },
  "Финал": {
    type: "list",
    rows: [
      { name: "post_38_final.png", meta: "1080×1080 · ready to publish" },
    ],
  },
  "Аналитика поста": {
    type: "text",
    body: "Пост #37 «Кейс роста +40%»\n\n• Охват: 5.8k (+12% от среднего)\n• Реакции: 412\n• Комментариев: 28\n• ER: 8.1%\n• Поделились: 47\n• Подписки после: +18\n\nЗашло благодаря конкретным цифрам в первой строке.",
  },
  "Рекомендации на след.": {
    type: "text",
    body: "Что улучшить в следующих постах:\n• Цифры в хук — работает\n• Длинные посты (>700 знаков) теряют 30% охвата\n• Картинки с лицами вовлекают на 22% сильнее\n• Опросы в комментах поднимают ER на 1.5 п.п.\n• Лучшее время паблиша — 10:00–11:00 в будние",
  },
  "Дайджест трендов": {
    type: "text",
    body: "Топ-3 тренда за неделю:\n• AI-агенты для SMM — 12 постов, растёт\n• No-code запуски — 8 постов, растёт\n• Рилсы vs посты — 15 постов, затухает\n\nЧто отбросили:\n• Споры про ИИ-этику (не наша ниша)\n• Истории про увольнения (offtopic)",
  },
  "Свежие посты": {
    type: "posts",
    rows: [
      // Сегодня (0)
      { ch: "neural_prosecco",           id: 4821, daysAgo: 0, time: "сегодня 08:42", text: "OpenAI выкатили новый Realtime API — теперь GPT-4o умеет слушать, говорить и видеть в одной сессии. Latency упала до 320 мс — это уже почти как живой собеседник. Цена 5$/1M токенов ввода.", views: "18.2k", reactions: 412, comments: 67, hasMedia: true  },
      { ch: "ilya_krasinsky",            id: 1208, daysAgo: 0, time: "сегодня 07:15", text: "Маркетинг 2026 — это не «делай рилсы». Это: личный бренд + комьюнити + автоматизация на агентах. Кто залип в 2018-м — будет догонять.", views: "9.4k", reactions: 287, comments: 43, hasMedia: false },
      // Вчера (1)
      { ch: "ai_product",                id: 991,  daysAgo: 1, time: "вчера 19:30", text: "Anthropic запустили Computer Use — Claude может сам кликать по экрану и работать с браузером. Демо: бронирование столика за 4 минуты.", views: "12.8k", reactions: 356, comments: 89, hasMedia: true  },
      { ch: "bogdanisssimo",             id: 433,  daysAgo: 1, time: "вчера 16:42", text: "Indie hackers, которые сделали MRR $10k за полгода в 2026 — почти все на одном паттерне: нишевый AI-tool под конкретную профессию. Не «AI для всех», а «AI для дантистов».", views: "6.2k", reactions: 198, comments: 34, hasMedia: false },
      { ch: "microfounders",             id: 287,  daysAgo: 1, time: "вчера 14:18", text: "Запустил MVP за выходные — лендинг + Stripe + один Claude prompt в бэке. Первая продажа на 3-й день. Стоимость разработки: 0$, только время.", views: "4.7k", reactions: 142, comments: 28, hasMedia: false },
      { ch: "gleb_pro_ai",               id: 612,  daysAgo: 1, time: "вчера 12:05", text: "Сравнил Sonnet 4.6 и GPT-4o на 100 задачах из реальной работы (саммари митингов, кодинг, аналитика данных). Sonnet выигрывает в 73% случаев. Полный отчёт в комментах.", views: "8.1k", reactions: 245, comments: 91, hasMedia: true  },
      { ch: "marketpsy",                 id: 1547, daysAgo: 1, time: "вчера 10:30", text: "Психология ЦА в 2026: люди устали от «продающих» постов. Работает только то, что выглядит как личный опыт. Кейс: переписали 5 постов из «эксперт» в «я попробовал» — ER вырос в 2.4 раза.", views: "5.6k", reactions: 178, comments: 22, hasMedia: false },
      // Позавчера (2)
      { ch: "dashalovesstartups",        id: 821,  daysAgo: 2, time: "2 дня назад", text: "Сходила на питч-сессию 30 AI-стартапов. 27 из 30 — обёртки над Claude/GPT. 3 — реально интересные. Делюсь шорт-листом.", views: "4.3k", reactions: 156, comments: 41, hasMedia: false },
      { ch: "machinelearning_interview", id: 2103, daysAgo: 2, time: "2 дня назад", text: "Большой разбор: как готовиться к ML-собесам в 2026, когда LLM знают всё. Ключ — не зубрить алгоритмы, а уметь объяснять решения и считать unit-economics модели.", views: "11.4k", reactions: 312, comments: 56, hasMedia: true  },
      { ch: "danokhlopkov",              id: 678,  daysAgo: 2, time: "2 дня назад", text: "За 3 года в продукте я видел 100+ growth-экспериментов. Работают 3 из 100. И это нормально. Главное — научиться быстро убивать неработающее.", views: "7.2k", reactions: 224, comments: 38, hasMedia: false },
      // 3-7 (Неделя)
      { ch: "app_growth",                id: 1832, daysAgo: 3, time: "3 дня назад", text: "Топ-5 ASO-фишек 2026: 1) видеообложка обязательна, 2) субтитры в первые 3 сек, 3) локализация на 5 языков минимум, 4) A/B иконки каждые 2 недели, 5) ответы на ВСЕ ревью.", views: "5.8k", reactions: 167, comments: 29, hasMedia: false },
      { ch: "vladimir_merkushev",        id: 412,  daysAgo: 4, time: "4 дня назад", text: "Менеджмент, который реально работает — это меньше митингов и больше письменного контекста. Линеры, ноушены, лупы — всё это инструменты. Главное — культура «писать, не созваниваться».", views: "3.9k", reactions: 134, comments: 24, hasMedia: false },
      { ch: "zheleznyak_gi",             id: 905,  daysAgo: 5, time: "5 дней назад", text: "Как я набрал 50k подписчиков в ТГ за год без рекламы: 1) пишу каждый день, 2) пишу про ниша, в которой топ-5 в стране, 3) комменты под каждым постом, 4) мемы по теме раз в неделю.", views: "13.7k", reactions: 398, comments: 78, hasMedia: true  },
      { ch: "showstartup",               id: 564,  daysAgo: 6, time: "6 дней назад", text: "Проанализировал 200 pitch-deck-ов за 2026 год. Слайд №2 (Problem) убивает 60% инвесторов на старте. Если проблема не понятна за 5 секунд — pitch проигран.", views: "6.5k", reactions: 189, comments: 32, hasMedia: false },
      { ch: "kgrbnv",                    id: 1109, daysAgo: 7, time: "1 неделя",    text: "Сделал side-проект на Cursor + Claude за 2 вечера. Запустил, получил 23 платных юзера за неделю. Цена — 9$/мес. Maintenance — 1 час в неделю.", views: "4.8k", reactions: 156, comments: 47, hasMedia: false },
      // 8-30 (Месяц)
      { ch: "YakovPartners",             id: 778,  daysAgo: 10, time: "10 дней назад", text: "VC-рынок 2026: чек инвестиций сократился на 18%, но количество сделок выросло на 22%. Тренд — ранние раунды и микро-фонды.", views: "9.1k", reactions: 268, comments: 45, hasMedia: false },
      { ch: "tvoi_memolog",              id: 3201, daysAgo: 12, time: "12 дней назад", text: "Когда твой агент впервые сам апрувнул задачу без тебя 🤖", views: "22.4k", reactions: 1240, comments: 134, hasMedia: true },
      { ch: "salikov_i",                 id: 654,  daysAgo: 14, time: "2 недели назад", text: "За 7 лет в дизайне я понял одно: лучшие интерфейсы — это те, которые ты не замечаешь. Если юзеру нужен онбординг — ты проиграл.", views: "7.8k", reactions: 234, comments: 41, hasMedia: false },
      { ch: "your_pet_project",          id: 187,  daysAgo: 18, time: "18 дней назад", text: "Запустил pet-project в декабре, забыл про него на 4 месяца, зашёл — 312 платных подписок $5/мес. Урок: иногда лучшее, что можешь сделать со своим продуктом — оставить его в покое.", views: "16.3k", reactions: 521, comments: 87, hasMedia: false },
      { ch: "pohodu_media",              id: 928,  daysAgo: 22, time: "3 недели назад", text: "Контент-маркетинг 2026: TG-каналы заменили блоги, рилсы заменили YouTube, Substack заменил рассылки. А podcasts всё там же — 5% аудитории, 0.5% дохода.", views: "5.4k", reactions: 178, comments: 33, hasMedia: false },
      { ch: "linkedinhero",              id: 1455, daysAgo: 28, time: "месяц назад",   text: "LinkedIn algorithm change: посты с 1-3 хэштегами получают +40% impressions vs 5+. Качество > количество. Запостил, дождался первых 10 комментов — алгоритм даёт +120% reach.", views: "8.6k", reactions: 298, comments: 52, hasMedia: false },
      // Архив 30+
      { ch: "ict_moscow_ai",             id: 412,  daysAgo: 45, time: "1.5 месяца назад", text: "Москва запустила пилот: 50 школ — учителя используют AI-агентов для проверки сочинений. Время проверки сократилось в 4 раза, качество (по двойному аудиту) — выше человеческого.", views: "11.2k", reactions: 387, comments: 96, hasMedia: true  },
      { ch: "gordeyai",                  id: 209,  daysAgo: 65, time: "2 месяца назад",   text: "Думал собрать AI-фреймворк сам — оказалось проще написать обёртку над Claude SDK на 200 строк. 90% сложности AI-проектов это не модель, а данные и UX.", views: "6.8k", reactions: 187, comments: 28, hasMedia: false },

      // Дополнительно — Сегодня
      { ch: "ai_product",                id: 1002, daysAgo: 0, time: "сегодня 10:18", text: "Apple Intelligence добавили нативный API для агентов в iOS 19. Можно запускать действия в любом приложении голосом — Calendar, Notes, Mail и любые third-party. Анонс с WWDC.", views: "24.6k", reactions: 587, comments: 142, hasMedia: true  },
      { ch: "telega_Rinata",             id: 711,  daysAgo: 0, time: "сегодня 09:55", text: "Опросил 50 фаундеров: какой инструмент сильнее всего изменил их работу в 2026? Топ-3: 1) Cursor (28), 2) Claude Sonnet (22), 3) Linear AI (19).", views: "5.7k", reactions: 178, comments: 31, hasMedia: false },
      { ch: "cryptoEssay",               id: 489,  daysAgo: 0, time: "сегодня 09:12", text: "Crypto + AI = новый narrative. Tokens of agent platforms за неделю выросли в среднем на 38%. Самые активные: Bittensor, Fetch, Render.", views: "8.3k", reactions: 234, comments: 56, hasMedia: false },
      { ch: "pervmarketing",             id: 1841, daysAgo: 0, time: "сегодня 08:30", text: "Реклама в ТГ 2026: средний CPM в нишевых каналах — 480₽, в массовых — 240₽. Но конверсия в нишевых в 4-5 раз выше. Считайте CAC, а не клики.", views: "4.2k", reactions: 145, comments: 28, hasMedia: false },

      // Дополнительно — Вчера
      { ch: "dimabeseda",                id: 624,  daysAgo: 1, time: "вчера 22:10", text: "Год работы remote: 320 митингов, 1200 PR-ов, 8 продуктов. Главный инсайт — деление команды на «делает» и «решает» убивает skill-set обоих.", views: "6.9k", reactions: 215, comments: 47, hasMedia: false },
      { ch: "its_capitan",               id: 388,  daysAgo: 1, time: "вчера 18:42", text: "Капитанский совет: если ты Product Owner и не можешь объяснить новому стажёру свой роадмап за 5 минут — у тебя не роадмап, а wishlist.", views: "5.1k", reactions: 167, comments: 34, hasMedia: false },
      { ch: "ikspertnaya",               id: 1156, daysAgo: 1, time: "вчера 15:18", text: "Эксперт-маркетинг сдох в 2024-м. То, что работает в 2026: «делюсь, потому что сама пробую». Обзоры > советы.", views: "4.6k", reactions: 156, comments: 22, hasMedia: false },
      { ch: "linkedinhero",              id: 1502, daysAgo: 1, time: "вчера 13:30", text: "LinkedIn: новая фича Comment Boost — посты с >50 комментов в первые 30 минут получают +400% reach. Попросите комьюнити поддержать в первые часы.", views: "9.8k", reactions: 312, comments: 78, hasMedia: false },
      { ch: "mnk_stories",               id: 822,  daysAgo: 1, time: "вчера 11:00", text: "История от подписчика: 2 года работал в найме на 250к, ушёл в свой проект на $500/мес. Через год — $14k MRR. Главный страх — съехать с ипотеки — оказался необоснованным.", views: "12.1k", reactions: 423, comments: 89, hasMedia: true  },

      // Дополнительно — 2 дня
      { ch: "salikov_i",                 id: 712,  daysAgo: 2, time: "2 дня назад", text: "Дизайн-системы 2026: variables в Figma + Tokens Studio + автоматическая синхронизация в Tailwind. Время от изменения цвета в Figma до прода — 30 минут.", views: "5.3k", reactions: 189, comments: 36, hasMedia: false },
      { ch: "your_pet_project",          id: 195,  daysAgo: 2, time: "2 дня назад", text: "Запустил pet ровно неделю назад. Метрики: 1.2k посещений, 87 регистраций, 14 платных подписок ($5/мес). CAC = 0₽ (только TG), MRR = $70. Доволен.", views: "7.8k", reactions: 256, comments: 45, hasMedia: false },
      { ch: "machinelearning_interview", id: 2118, daysAgo: 2, time: "2 дня назад", text: "Топ-10 ошибок в ML-инфраструктуре, которые видели на собесах в 2026: 1) пайплайн без версионирования данных, 2) нет мониторинга drift, 3) фичи на боевом контуре считаются по-другому. Полный список — в комментах.", views: "10.5k", reactions: 287, comments: 92, hasMedia: false },

      // Дополнительно — 3-7 дней (Неделя)
      { ch: "marketpsy",                 id: 1561, daysAgo: 3, time: "3 дня назад", text: "Когнитивная дешёвая ловушка: «я подпишусь, потом разберусь». 80% подписок на каналы > 6 месяцев — это просто шум в подписках. Делайте регулярную чистку.", views: "4.9k", reactions: 167, comments: 28, hasMedia: false },
      { ch: "bogdanisssimo",             id: 451,  daysAgo: 4, time: "4 дня назад", text: "Запустил No-Code MVP на Cursor — построил, развернул, нашёл первого юзера за 6 часов. Раньше на это уходили недели. Главный навык 2026 — не программирование, а постановка задач.", views: "6.7k", reactions: 224, comments: 41, hasMedia: false },
      { ch: "ai_product",                id: 1015, daysAgo: 5, time: "5 дней назад", text: "Тренд: AI Personality Layer — компании добавляют «характер» к своим LLM-ассистентам. Notion AI стал «друг», Linear AI — «строгий менеджер». UX через personality.", views: "8.4k", reactions: 256, comments: 53, hasMedia: true  },
      { ch: "showstartup",               id: 578,  daysAgo: 6, time: "6 дней назад", text: "Что отличает успешный pitch от провального: не идея, не команда, не traction. А способность фаундера за 30 секунд объяснить, почему именно сейчас, именно эта команда, именно эта проблема.", views: "5.6k", reactions: 178, comments: 32, hasMedia: false },
      { ch: "pohodu_media",              id: 941,  daysAgo: 7, time: "1 неделя",     text: "Контент-маркетинг 2026: один длинный лонгрид > 10 коротких постов. Глубокие материалы цитируют, в них возвращаются, на них ссылаются. Короткие — пролистывают.", views: "4.3k", reactions: 145, comments: 24, hasMedia: false },

      // Дополнительно — 8-30 дней (Месяц)
      { ch: "neural_prosecco",           id: 4795, daysAgo: 11, time: "11 дней назад", text: "Anthropic выкатили Claude Memory — модель помнит контекст между сессиями. Можно построить персонального помощника, который реально знает историю общения. Цена памяти — отдельный пул токенов.", views: "16.8k", reactions: 489, comments: 102, hasMedia: true  },
      { ch: "tvoi_memolog",              id: 3245, daysAgo: 15, time: "2 недели",     text: "Ребрендинг 2026: «AI стартап» теперь звучит как «дотком стартап» в 2002. Все они есть. Ищите тех, кто говорит «agentic platform» или «autonomous workflow».", views: "18.2k", reactions: 712, comments: 124, hasMedia: false },
      { ch: "vladimir_merkushev",        id: 442,  daysAgo: 19, time: "19 дней назад", text: "Корпоративная этика 2026: использование AI для работы — норма. Но скрывать это перед заказчиком — токсично. Открытость = доверие. Прозрачность = премиум-цена.", views: "4.7k", reactions: 156, comments: 31, hasMedia: false },
      { ch: "kgrbnv",                    id: 1145, daysAgo: 24, time: "3.5 недели",   text: "Запустил агентскую систему, заменил 3 человека из команды. Освободил $18k/мес. Заработал $0 — всё ушло на токены и мониторинг. Реальная экономия — внимание, а не деньги.", views: "7.2k", reactions: 234, comments: 48, hasMedia: false },
      { ch: "danokhlopkov",              id: 695,  daysAgo: 27, time: "месяц назад",  text: "Лучший Growth-эксперимент 2025-го у нас: убрали онбординг полностью. Конверсия в paid выросла на 23%. Иногда меньше — больше.", views: "8.6k", reactions: 287, comments: 56, hasMedia: false },

      // Дополнительно — Архив 30+
      { ch: "YakovPartners",             id: 821,  daysAgo: 38, time: "1.3 месяца",  text: "Q1 2026 в venture: $42B, deals 2840. AI/agents забрали 38% всего объёма. SaaS classic упал до 12%. Видеть в физическом b2b — реально новая ниша.", views: "13.4k", reactions: 412, comments: 87, hasMedia: true  },
      { ch: "ilya_krasinsky",            id: 1188, daysAgo: 52, time: "1.7 месяца",  text: "Маркетинг как когнитивная архитектура: что в голове клиента, когда он видит твой бренд? Это не «awareness», это слой смыслов. И он строится годами.", views: "7.9k", reactions: 245, comments: 38, hasMedia: false },
      { ch: "microfounders",             id: 312,  daysAgo: 78, time: "2.5 месяца",  text: "Микробизнес 2026: 1 человек, $5-30k MRR, 0-1 сотрудников. Это новая золотая середина. Не unicorn, не лайфстайл — просто умная экономия скейла.", views: "11.7k", reactions: 356, comments: 67, hasMedia: false },
    ],
  },
  "Инсайт-карточки тем": {
    type: "cards",
    rows: [
      { title: "AI-агенты для SMM",      meta: "хайп · 12 постов" },
      { title: "No-code запуски",        meta: "растёт · 8 постов" },
      { title: "Рилсы vs посты",         meta: "затухает · 15 постов" },
      { title: "+ ещё 9 карточек",       meta: "не показаны" },
    ],
  },
};

function normalizeTgUsername(input) {
  let s = (input || "").trim();
  s = s.replace(/^https?:\/\//, "").replace(/^t\.me\//, "").replace(/^@/, "");
  s = s.replace(/[^a-zA-Z0-9_]/g, "");
  return s ? "@" + s : "";
}

function EditableTgList({ initialRows }) {
  const [rows, setRows] = useState(initialRows);
  const [draft, setDraft] = useState("");
  const [hoverIdx, setHoverIdx] = useState(-1);

  function add() {
    const u = normalizeTgUsername(draft);
    if (!u) return;
    if (rows.some(r => r.name === u)) { setDraft(""); return; }
    setRows([...rows, { name: u, meta: "новый" }]);
    setDraft("");
  }
  function remove(i) {
    setRows(rows.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      {/* Add input */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
          placeholder="@username или t.me/username"
          style={{
            flex: 1, height: 36,
            padding: "0 12px",
            background: color.white,
            border: "1px solid rgba(38,38,51,0.1)",
            borderRadius: 9,
            fontSize: 13, color: "#262633",
            fontFamily: "inherit", outline: "none",
          }}
        />
        <button
          onClick={add}
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            height: 36, padding: "0 14px",
            background: "#262633", color: color.white,
            border: "none", borderRadius: 9,
            fontSize: 13, fontWeight: 500,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >+ Добавить</button>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {rows.length === 0 && (
          <div style={{ fontSize: 13, color: "rgba(38,38,51,0.5)", textAlign: "center", padding: "24px 0" }}>
            Список пуст. Добавь первый канал.
          </div>
        )}
        {rows.map((r, i) => {
          const u = r.name.replace(/^@/, "");
          return (
            <div
              key={i}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(-1)}
              style={drawerRow}
            >
              <a
                href={`https://t.me/${u}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  flex: 1, minWidth: 0,
                  textDecoration: "none", color: "inherit",
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "rgba(63,149,255,0.12)", color: "#3F95FF",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>{ic.paperPlane}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 510, color: "#262633" }}>{r.name}</div>
                  {r.meta && <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>{r.meta}</div>}
                </div>
              </a>
              <button
                onClick={() => remove(i)}
                title="Удалить"
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 28, height: 28,
                  background: "transparent", border: "none", borderRadius: 7,
                  cursor: "pointer", color: "#FF3407",
                  opacity: hoverIdx === i ? 1 : 0,
                  transition: transition.fast,
                  fontFamily: "inherit",
                }}
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KbPopup({ item, onClose }) {
  const data = KB_CONTENT[item.title];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(38,38,51,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100,
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 520, maxWidth: "100%", maxHeight: "80vh",
          background: color.white,
          borderRadius: 18,
          boxShadow: "0 20px 60px rgba(38,38,51,0.25)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "16px 18px",
          borderBottom: "1px solid rgba(38,38,51,0.06)",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: item.agent.color + "1A", color: item.agent.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>{ic.book}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#262633" }}>{item.title}</div>
            <div style={{ fontSize: 12, color: "rgba(38,38,51,0.55)", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: item.agent.color }} />
              <span>{item.agent.label}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ ...zoomBtn, padding: 6, color: "rgba(38,38,51,0.55)" }}>
            {ic.close}
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 18 }}>
          {!data && (
            <div style={{ fontSize: 13, color: "rgba(38,38,51,0.55)", textAlign: "center", padding: "24px 0" }}>
              Содержимое ещё не подгружено
            </div>
          )}
          {data?.type === "text" && (
            <div style={{
              fontSize: 13.5, color: "#262633", lineHeight: 1.55,
              whiteSpace: "pre-wrap",
              padding: "12px 14px",
              background: "rgba(38,38,51,0.03)",
              borderRadius: 10,
            }}>{data.body}</div>
          )}
          {data?.type === "list" && data?.editable === "tg" && (
            <EditableTgList initialRows={data.rows} />
          )}
          {(data?.type === "list" || data?.type === "files") && !data?.editable && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {data.rows.map((r, i) => (
                <div key={i} style={drawerRow}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: "rgba(38,38,51,0.04)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "rgba(38,38,51,0.5)", flexShrink: 0,
                  }}>{data.type === "files" ? ic.file : (
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: "currentColor" }} />
                  )}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 510, color: "#262633" }}>{r.name}</div>
                    {r.meta && <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>{r.meta}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {data?.type === "posts" && <PostsViewer rows={data.rows} />}
          {data?.type === "cards" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.rows.map((r, i) => (
                <div key={i} style={{
                  background: color.white,
                  border: "1px solid rgba(38,38,51,0.08)",
                  borderRadius: 10,
                  padding: "10px 12px",
                }}>
                  <div style={{ fontSize: 13, fontWeight: 510, color: "#262633" }}>{r.title}</div>
                  {r.meta && <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 3 }}>{r.meta}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 18px",
          borderTop: "1px solid rgba(38,38,51,0.06)",
          display: "flex", gap: 8,
        }}>
          <button style={{
            flex: 1, height: 36,
            background: "#262633", color: color.white,
            border: "none", borderRadius: 9,
            fontSize: 13, fontWeight: 500,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            Открыть в чате с {item.agent.label}
          </button>
          <button style={{
            height: 36, padding: "0 14px",
            background: color.white, color: "#262633",
            border: "1px solid rgba(38,38,51,0.12)",
            borderRadius: 9,
            fontSize: 13, fontWeight: 500,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            Редактировать
          </button>
        </div>
      </div>
    </div>
  );
}

function PeopleContent() {
  const [tab, setTab] = useState("all");
  const [profile, setProfile] = useState(null);
  const list = tab === "approvers" ? MOCK_PEOPLE.filter(p => p.role === "approver") : MOCK_PEOPLE;
  return (
    <>
      <div style={{ display: "flex", gap: 4, padding: "0 0 12px" }}>
        <FilterChip label="Все"      active={tab === "all"}       onClick={() => setTab("all")} />
        <FilterChip label="Апруверы" active={tab === "approvers"} onClick={() => setTab("approvers")} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {list.map(p => (
          <div
            key={p.id}
            onClick={() => setProfile(p)}
            style={{ ...drawerRow, cursor: "pointer" }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: p.color + "26", color: p.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              fontSize: 13, fontWeight: 600,
              overflow: "hidden",
            }}>
              {p.avatar
                ? <img src={p.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : p.name.split(" ").map(s => s[0]).join("").slice(0, 2)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 450, color: "#262633" }}>{p.name}</span>
                {p.role === "approver" && (
                  <span style={{
                    fontSize: 10, fontWeight: 500,
                    color: "#FF8B3D",
                    background: "rgba(255,139,61,0.12)",
                    padding: "1px 6px", borderRadius: 999,
                  }}>Апрувер</span>
                )}
              </div>
              <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>
                {p.title} · {p.handle}
              </div>
            </div>
          </div>
        ))}
      </div>
      {profile && <ProfilePopup person={profile} onClose={() => setProfile(null)} />}
    </>
  );
}

function ProfilePopup({ person, onClose }) {
  const [mode, setMode] = useState("view"); // "view" | "message"
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  function send() {
    if (!text.trim()) return;
    setSent(true);
    setTimeout(onClose, 1200);
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(38,38,51,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 440, maxWidth: "100%",
          background: color.white,
          borderRadius: 18,
          boxShadow: "0 20px 60px rgba(38,38,51,0.25)",
          overflow: "hidden",
        }}
      >
        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center",
          padding: "10px 12px",
          borderBottom: "1px solid rgba(38,38,51,0.06)",
        }}>
          {mode === "message" ? (
            <button
              onClick={() => { setMode("view"); setText(""); setSent(false); }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                background: "transparent", border: "none", padding: "6px 8px",
                fontSize: 13, color: "rgba(38,38,51,0.6)",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Профиль
            </button>
          ) : <span />}
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={{ ...zoomBtn, padding: 6, color: "rgba(38,38,51,0.55)" }}>{ic.close}</button>
        </div>

        {mode === "view" && (
          <>
            {/* Profile head */}
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "16px 18px 18px",
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: person.color + "26", color: person.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, fontWeight: 600,
                overflow: "hidden",
                marginBottom: 12,
              }}>
                {person.avatar
                  ? <img src={person.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : person.name.split(" ").map(s => s[0]).join("").slice(0, 2)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 510, color: "#262633" }}>{person.name}</span>
                {person.role === "approver" && (
                  <span style={{
                    fontSize: 10.5, fontWeight: 500,
                    color: "#FF8B3D",
                    background: "rgba(255,139,61,0.12)",
                    padding: "2px 7px", borderRadius: 999,
                  }}>Апрувер</span>
                )}
              </div>
              <div style={{ fontSize: 13, color: "rgba(38,38,51,0.6)", marginTop: 4 }}>{person.title}</div>
              <div style={{ fontSize: 12.5, color: "rgba(38,38,51,0.5)", marginTop: 2 }}>{person.handle}</div>
            </div>

            {/* Meta rows */}
            <div style={{
              padding: "0 18px 14px",
              display: "flex", flexDirection: "column", gap: 6,
            }}>
              <div style={profileMetaRow}>
                <span style={profileMetaLabel}>В команде</span>
                <span style={profileMetaValue}>с {person.joined}</span>
              </div>
              <div style={profileMetaRow}>
                <span style={profileMetaLabel}>Активность</span>
                <span style={profileMetaValue}>{person.lastActive}</span>
              </div>
              <div style={profileMetaRow}>
                <span style={profileMetaLabel}>Роль</span>
                <span style={profileMetaValue}>{person.role === "approver" ? "Апрувер" : "Сотрудник"}</span>
              </div>
            </div>

            {/* Actions */}
            {!person.isMe && (
              <div style={{
                padding: "12px 18px 18px",
                borderTop: "1px solid rgba(38,38,51,0.06)",
                display: "flex", gap: 8,
              }}>
                <button
                  onClick={() => setMode("message")}
                  style={{
                    flex: 1, height: 38,
                    background: "#262633", color: color.white,
                    border: "none", borderRadius: 10,
                    fontSize: 13.5, fontWeight: 500,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >Написать сообщение</button>
                <button
                  style={{
                    height: 38, padding: "0 14px",
                    background: color.white, color: "#262633",
                    border: "1px solid rgba(38,38,51,0.12)",
                    borderRadius: 10,
                    fontSize: 13.5, fontWeight: 500,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >{person.role === "approver" ? "Снять апрувера" : "Сделать апрувером"}</button>
                <button
                  title="Удалить из команды"
                  style={{
                    height: 38, width: 38,
                    background: color.white, color: "#FF3407",
                    border: "1px solid rgba(255,52,7,0.2)",
                    borderRadius: 10,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}

        {mode === "message" && (
          <>
            {/* Compact recipient */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px 14px" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: person.color + "26", color: person.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 600, overflow: "hidden", flexShrink: 0,
              }}>
                {person.avatar
                  ? <img src={person.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : person.name.split(" ").map(s => s[0]).join("").slice(0, 2)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 510, color: "#262633" }}>{person.name}</div>
                <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)" }}>уйдёт во Входящие</div>
              </div>
            </div>

            <div style={{ padding: "0 18px" }}>
              {sent ? (
                <div style={{ padding: "32px 0", textAlign: "center", fontSize: 14, color: "#262633" }}>
                  Сообщение отправлено в Входящие <b>{person.name.split(" ")[0]}</b>
                </div>
              ) : (
                <textarea
                  autoFocus
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(); }}
                  placeholder={`Сообщение для ${person.name.split(" ")[0]}…`}
                  style={{
                    width: "100%", minHeight: 140, padding: "12px 14px",
                    background: color.white,
                    border: "1px solid rgba(38,38,51,0.1)",
                    borderRadius: 12,
                    fontSize: 14, color: "#262633", lineHeight: 1.5,
                    fontFamily: "inherit", outline: "none", resize: "vertical",
                  }}
                />
              )}
            </div>

            {!sent && (
              <div style={{
                display: "flex", justifyContent: "flex-end", gap: 8,
                padding: "14px 18px 18px",
              }}>
                <button onClick={() => setMode("view")} style={{
                  height: 36, padding: "0 14px",
                  background: color.white, color: "#262633",
                  border: "1px solid rgba(38,38,51,0.12)",
                  borderRadius: 9,
                  fontSize: 13, fontWeight: 500,
                  cursor: "pointer", fontFamily: "inherit",
                }}>Отмена</button>
                <button onClick={send} disabled={!text.trim()} style={{
                  height: 36, padding: "0 16px",
                  background: text.trim() ? "#262633" : "rgba(38,38,51,0.3)",
                  color: color.white,
                  border: "none", borderRadius: 9,
                  fontSize: 13, fontWeight: 500,
                  cursor: text.trim() ? "pointer" : "not-allowed",
                  fontFamily: "inherit",
                }}>Отправить</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const profileMetaRow = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "8px 12px",
  background: "rgba(38,38,51,0.03)",
  borderRadius: 9,
  fontSize: 12.5,
};
const profileMetaLabel = { color: "rgba(38,38,51,0.5)" };
const profileMetaValue = { color: "#262633", fontWeight: 450 };

function SendMessagePopup({ person, onClose }) {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  function send() {
    if (!text.trim()) return;
    setSent(true);
    setTimeout(onClose, 1200);
  }
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(38,38,51,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 480, maxWidth: "100%",
          background: color.white,
          borderRadius: 18,
          boxShadow: "0 20px 60px rgba(38,38,51,0.25)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "16px 18px",
          borderBottom: "1px solid rgba(38,38,51,0.06)",
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: person.color + "26", color: person.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, fontSize: 14, fontWeight: 600,
            overflow: "hidden",
          }}>
            {person.avatar
              ? <img src={person.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : person.name.split(" ").map(s => s[0]).join("").slice(0, 2)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 510, color: "#262633" }}>{person.name}</div>
            <div style={{ fontSize: 12, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>
              {person.title} · {person.handle}
            </div>
          </div>
          <button onClick={onClose} style={{ ...zoomBtn, padding: 6, color: "rgba(38,38,51,0.55)" }}>{ic.close}</button>
        </div>

        {/* Body */}
        <div style={{ padding: 18 }}>
          {sent ? (
            <div style={{
              padding: "32px 12px", textAlign: "center",
              fontSize: 14, color: "#262633",
            }}>
              Сообщение отправлено в Входящие <b>{person.name.split(" ")[0]}</b>
            </div>
          ) : (
            <textarea
              autoFocus
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(); }}
              placeholder={`Сообщение для ${person.name.split(" ")[0]}…`}
              style={{
                width: "100%", minHeight: 140, padding: "12px 14px",
                background: color.white,
                border: "1px solid rgba(38,38,51,0.1)",
                borderRadius: 12,
                fontSize: 14, color: "#262633", lineHeight: 1.5,
                fontFamily: "inherit", outline: "none", resize: "vertical",
              }}
            />
          )}
        </div>

        {/* Footer */}
        {!sent && (
          <div style={{
            display: "flex", justifyContent: "flex-end", gap: 8,
            padding: "0 18px 18px",
          }}>
            <button onClick={onClose} style={{
              height: 36, padding: "0 14px",
              background: color.white, color: "#262633",
              border: "1px solid rgba(38,38,51,0.12)",
              borderRadius: 9,
              fontSize: 13, fontWeight: 500,
              cursor: "pointer", fontFamily: "inherit",
            }}>Отмена</button>
            <button onClick={send} disabled={!text.trim()} style={{
              height: 36, padding: "0 16px",
              background: text.trim() ? "#262633" : "rgba(38,38,51,0.3)",
              color: color.white,
              border: "none", borderRadius: 9,
              fontSize: 13, fontWeight: 500,
              cursor: text.trim() ? "pointer" : "not-allowed",
              fontFamily: "inherit",
            }}>Отправить</button>
          </div>
        )}
      </div>
    </div>
  );
}

function IntegrationsContent() {
  // Агрегируем уникальные интеграции из всех агентов
  const map = new Map();
  AGENTS.forEach(a => {
    (a.integrations || []).forEach(it => {
      if (!map.has(it.name)) {
        map.set(it.name, { ...it, agents: [a] });
      } else {
        const ex = map.get(it.name);
        ex.agents.push(a);
        if (it.on) ex.on = true;
      }
    });
  });
  const list = Array.from(map.values());
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {list.map((it, i) => {
        const logo = INTEGRATION_LOGOS[it.name];
        return (
        <div key={i} style={drawerRow}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: "rgba(38,38,51,0.04)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(38,38,51,0.6)", flexShrink: 0,
            overflow: "hidden",
            padding: 4,
          }}>
            {logo
              ? <img src={logo} alt={it.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              : ic.integrations}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 450, color: "#262633" }}>{it.name}</div>
            <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>{it.desc}</div>
          </div>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 11.5, fontWeight: 400,
            color: it.on ? "rgba(38,38,51,0.55)" : "rgba(38,38,51,0.4)",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: it.on ? "#34C759" : "rgba(38,38,51,0.25)",
            }} />
            {it.on ? "Активна" : "Выкл"}
          </span>
        </div>
        );
      })}
    </div>
  );
}

const INTEGRATION_LOGOS = {
  "Telegram":      "/integrations/telegram.jpg",
  "Figma":         "/integrations/figma.webp",
  "Google Sheets": "/integrations/sheets.png",
};

function AgentsContent({ selected, onSelect }) {
  const setSelected = onSelect;
  const agent = selected ? AGENTS.find(a => a.id === selected) : null;

  if (agent) return <AgentDetail a={agent} onBack={() => setSelected(null)} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {AGENTS.map(a => (
        <div key={a.id} style={{ ...drawerRow, cursor: "pointer" }} onClick={() => setSelected(a.id)}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: a.color + "26",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: a.color, flexShrink: 0,
          }}>
            <svg width={20} height={20} viewBox="0 0 24 24">
              <rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor" />
              <rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor" />
              <circle cx="9.3" cy="13" r="1.4" fill="white" />
              <circle cx="14.7" cy="13" r="1.4" fill="white" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 510, color: "#262633" }}>{a.label}</div>
            <div style={{ fontSize: 12, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>Агент</div>
          </div>
          {a.hasUpdate && (
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#FF8B3D", flexShrink: 0,
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

function AgentDetail({ a, onBack }) {
  const [chatHistory, setChatHistory] = useState(true);
  const [showInChat, setShowInChat] = useState(true);
  const [showSources, setShowSources] = useState(true);
  const [continueOnError, setContinueOnError] = useState(false);
  const [writeHistory, setWriteHistory] = useState(true);

  return (
    <div style={{ margin: -16 }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 12,
        padding: "16px 18px",
        borderBottom: "1px solid rgba(38,38,51,0.06)",
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: a.color + "26",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: a.color, flexShrink: 0,
        }}>
          <svg width={26} height={26} viewBox="0 0 24 24">
            <rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor" />
            <rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor" />
            <circle cx="9.3" cy="13" r="1.4" fill="white" />
            <circle cx="14.7" cy="13" r="1.4" fill="white" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#262633" }}>{a.label} Mary</div>
          <div style={{ fontSize: 11.5, color: a.color, fontWeight: 500, marginTop: 1 }}>AI Агент</div>
        </div>
        <button onClick={onBack} style={iconSquareBtn}>{ic.close}</button>
      </div>

      {/* Description */}
      <div style={{
        padding: "12px 18px",
        fontSize: 12, color: "rgba(38,38,51,0.6)",
        lineHeight: 1.4,
        borderBottom: "1px solid rgba(38,38,51,0.06)",
      }}>
        {a.role}
      </div>

      {/* Form */}
      <div style={{ padding: "14px 18px 96px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Имя */}
        <FormField label="Имя">
          <FormInput value={a.label + " Mary"} />
        </FormField>

        {/* Скиллы */}
        <FormField
          label="Скиллы"
          actions={[<button key="p" style={iconSquareBtn}>{ic.plus}</button>]}
        >
          <div style={{
            background: color.white,
            border: "1px solid rgba(38,38,51,0.1)",
            borderRadius: 10,
            padding: "10px 12px",
            display: "flex", flexDirection: "column", gap: 6,
          }}>
            {a.skills.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{
                  display: "inline-block", width: 4, height: 4, borderRadius: "50%",
                  background: "#262633", marginTop: 6, flexShrink: 0,
                }} />
                <span style={{ fontSize: 12, color: "#262633", lineHeight: 1.4 }}>{s}</span>
              </div>
            ))}
          </div>
        </FormField>

        {/* История чата */}
        <FormRow label="История чата">
          <Toggle on={chatHistory} onClick={() => setChatHistory(v => !v)} />
        </FormRow>

        {/* Модель */}
        <FormRow label="Модель">
          <FakeSelect value={a.model} />
        </FormRow>

        {/* Уровень рассуждений */}
        <FormRow label="Уровень рассуждений">
          <FakeSelect value={a.reasoning} />
        </FormRow>

        {/* Инструменты */}
        <FormField
          label="Инструменты"
          actions={[<button key="p" style={iconSquareBtn}>{ic.plus}</button>]}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {a.tools.map((t, i) => (
              <span key={i} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 12px",
                borderRadius: 999,
                border: "1px solid rgba(38,38,51,0.1)",
                background: color.white,
                fontSize: 13, color: "#262633",
              }}>{t}</span>
            ))}
          </div>
        </FormField>

        {/* Формат ответа */}
        <FormRow label="Формат ответа">
          <FakeSelect value="Text" />
        </FormRow>

        <SectionDivider label="Параметры модели" />
        <FormRow label="Подробность"><FakeSelect value="medium" /></FormRow>
        <FormRow label="Резюме"><FakeSelect value="auto" /></FormRow>

        <SectionDivider label="Чат" />
        <FormRow label="Показывать ответ в чате">
          <Toggle on={showInChat} onClick={() => setShowInChat(v => !v)} />
        </FormRow>
        <FormRow label="Показывать источники">
          <Toggle on={showSources} onClick={() => setShowSources(v => !v)} />
        </FormRow>

        <SectionDivider label="Дополнительно" />
        <FormRow label="Продолжать при ошибке">
          <Toggle on={continueOnError} onClick={() => setContinueOnError(v => !v)} />
        </FormRow>
        <FormRow label="Писать в историю чата">
          <Toggle on={writeHistory} onClick={() => setWriteHistory(v => !v)} />
        </FormRow>

        <SectionDivider label="Сегодня" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div style={statBox}>
            <div style={{ fontSize: 10.5, color: "rgba(38,38,51,0.55)" }}>Запусков</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#262633", marginTop: 2 }}>{a.runs}</div>
          </div>
          <div style={statBox}>
            <div style={{ fontSize: 10.5, color: "rgba(38,38,51,0.55)" }}>Стоимость</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#262633", marginTop: 2 }}>{a.cost}</div>
          </div>
        </div>
      </div>

      {/* Sticky action bar */}
      <div style={{
        position: "sticky", bottom: 0,
        background: color.white,
        borderTop: "1px solid rgba(38,38,51,0.08)",
        padding: "10px 14px",
        display: "flex", alignItems: "center", gap: 8,
        boxShadow: "0 -4px 12px rgba(38,38,51,0.04)",
      }}>
        <button style={{
          flex: 1, height: 36,
          background: "#262633", color: color.white,
          border: "none", borderRadius: 9,
          fontSize: 13, fontWeight: 500,
          cursor: "pointer", fontFamily: "inherit",
        }}>
          Открыть в чате
        </button>
        <button style={{
          height: 36, padding: "0 14px",
          background: color.white, color: "#262633",
          border: "1px solid rgba(38,38,51,0.12)",
          borderRadius: 9,
          fontSize: 13, fontWeight: 500,
          cursor: "pointer", fontFamily: "inherit",
        }}>
          Запустить
        </button>
        <button title="Удалить агента" style={{
          height: 36, width: 36,
          background: color.white, color: "#FF3407",
          border: "1px solid rgba(255,52,7,0.2)",
          borderRadius: 9,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", fontFamily: "inherit",
        }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Tabs контента для AgentDetail ──────────────────────────
function TabSectionLabel({ icon, children }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "0 4px 10px",
      fontSize: 11, fontWeight: 600, color: "rgba(38,38,51,0.55)",
      textTransform: "uppercase", letterSpacing: "0.04em",
    }}>
      {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
      <span>{children}</span>
    </div>
  );
}

function KBTab({ a }) {
  const inputs  = a.kb?.inputs  || [];
  const outputs = a.kb?.outputs || [];
  return (
    <div style={{ padding: "16px 18px 96px", display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Inputs */}
      <div>
        <TabSectionLabel icon="📥">Что мы скормили</TabSectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {inputs.map((it, i) => (
            <div key={i} style={drawerRow}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 450, color: "#262633" }}>{it.title}</div>
                <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>{it.count} элементов</div>
              </div>
              <button style={iconSquareBtn}>{ic.plus}</button>
            </div>
          ))}
        </div>
      </div>

      {/* Outputs */}
      <div>
        <TabSectionLabel icon="📤">Что нам выдали</TabSectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {outputs.map((it, i) => (
            <div key={i} style={{ ...drawerRow, background: "rgba(122,134,255,0.06)" }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "rgba(122,134,255,0.18)", color: "#7A86FF",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, fontSize: 16,
              }}>📦</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 450, color: "#262633" }}>{it.title}</div>
                <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>{it.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TasksTab({ a }) {
  const tasks = a.tasks || [];
  return (
    <div style={{ padding: "16px 18px 96px", display: "flex", flexDirection: "column", gap: 8 }}>
      {tasks.map((t, i) => (
        <div key={i} style={{
          background: color.white,
          border: "1px solid rgba(38,38,51,0.08)",
          borderRadius: 12,
          padding: "12px 14px",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#34C759", marginTop: 5, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#262633" }}>{t.title}</div>
              <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>{t.desc}</div>
            </div>
            {t.cron && (
              <span style={{
                fontSize: 10.5, color: "rgba(38,38,51,0.55)",
                fontFamily: "ui-monospace, SF Mono, monospace",
                whiteSpace: "nowrap",
              }}>{t.cron}</span>
            )}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, marginLeft: 15 }}>
            <span style={pillTool}><PillIcon color="#3F95FF" kind="bot" />{t.tool}</span>
            <span style={pillKb}><PillIcon color="#7A86FF" kind="kb" />{t.out} →</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function AgentIntegrationsTab({ a }) {
  const ints = a.integrations || [];
  return (
    <div style={{ padding: "16px 18px 96px", display: "flex", flexDirection: "column", gap: 6 }}>
      {ints.map((it, i) => (
        <div key={i} style={drawerRow}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "rgba(38,38,51,0.04)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(38,38,51,0.6)", flexShrink: 0,
          }}>
            {ic.integrations}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 510, color: "#262633" }}>{it.name}</div>
            <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>{it.desc}</div>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 500,
            color: it.on ? "#34C759" : "rgba(38,38,51,0.45)",
            background: it.on ? "rgba(52,199,89,0.1)" : "rgba(38,38,51,0.05)",
            padding: "3px 8px", borderRadius: 999,
          }}>{it.on ? "Активна" : "Выкл"}</span>
        </div>
      ))}
    </div>
  );
}

function AgentChatTab({ a }) {
  return (
    <div style={{ padding: "24px 18px 96px", textAlign: "center" }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: a.color + "26", color: a.color,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        marginBottom: 14,
      }}>
        <svg width={32} height={32} viewBox="0 0 24 24">
          <rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor" />
          <rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor" />
          <circle cx="9.3" cy="13" r="1.4" fill="white" />
          <circle cx="14.7" cy="13" r="1.4" fill="white" />
        </svg>
      </div>
      <div style={{ fontSize: 14, fontWeight: 510, color: "#262633" }}>
        Открыть чат с агентом
      </div>
      <div style={{ fontSize: 12, color: "rgba(38,38,51,0.55)", marginTop: 4, lineHeight: 1.4 }}>
        Откроется общий чат отдела с автофильтром на «{a.label}»
      </div>
    </div>
  );
}

const pillTool = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "3px 9px 3px 3px", borderRadius: 999,
  background: "rgba(63,149,255,0.1)", color: "#3F95FF",
  fontSize: 11.5, fontWeight: 500,
};
const pillKb = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "3px 9px 3px 3px", borderRadius: 999,
  background: "rgba(122,134,255,0.1)", color: "#7A86FF",
  fontSize: 11.5, fontWeight: 500,
};
function PillIcon({ color, kind }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 18, height: 18, borderRadius: 5,
      background: color + "26",
      color,
      flexShrink: 0,
    }}>
      {kind === "bot" ? (
        <svg width={11} height={11} viewBox="0 0 24 24">
          <rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor" />
          <rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor" />
          <circle cx="9.3" cy="13" r="1.4" fill="white" />
          <circle cx="14.7" cy="13" r="1.4" fill="white" />
        </svg>
      ) : (
        <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      )}
    </span>
  );
}

// ── Form atoms ──────────────────────────────────────────────
function FormField({ label, actions, children }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "#262633", flex: 1 }}>{label}</span>
        {actions}
      </div>
      {children}
    </div>
  );
}
function FormRow({ label, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: "#262633", flex: 1 }}>{label}</span>
      {children}
    </div>
  );
}
function FormInput({ value }) {
  return (
    <input
      defaultValue={value}
      style={{
        width: "100%",
        height: 32,
        padding: "0 10px",
        background: color.white,
        border: "1px solid rgba(38,38,51,0.1)",
        borderRadius: 8,
        fontSize: 12, color: "#262633",
        fontFamily: "inherit", outline: "none",
      }}
    />
  );
}
function FakeSelect({ value }) {
  return (
    <button style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      height: 28, padding: "0 8px 0 10px",
      background: color.white,
      border: "1px solid rgba(38,38,51,0.1)",
      borderRadius: 7,
      fontSize: 12, color: "#262633",
      fontFamily: "inherit", cursor: "pointer",
    }}>
      <span>{value}</span>
      <span style={{ display: "flex", color: "rgba(38,38,51,0.5)" }}>{ic.chevron}</span>
    </button>
  );
}
function Toggle({ on, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 32, height: 19, borderRadius: 999, border: "none",
        background: on ? "#262633" : "rgba(38,38,51,0.2)",
        cursor: "pointer", padding: 0,
        position: "relative", transition: transition.fast,
        flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute", top: 2, left: on ? 15 : 2,
        width: 15, height: 15, borderRadius: "50%",
        background: color.white,
        transition: transition.fast,
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
      }} />
    </button>
  );
}
function SectionDivider({ label }) {
  return (
    <div style={{
      borderTop: "1px solid rgba(38,38,51,0.08)",
      paddingTop: 10,
      fontSize: 11, color: "rgba(38,38,51,0.5)", fontWeight: 500,
    }}>
      {label}
    </div>
  );
}

const iconSquareBtn = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  width: 28, height: 28,
  background: "rgba(38,38,51,0.04)",
  border: "1px solid rgba(38,38,51,0.06)",
  borderRadius: 7,
  cursor: "pointer", color: "rgba(38,38,51,0.6)",
  fontFamily: "inherit",
};
const statBox = {
  background: "rgba(38,38,51,0.04)",
  borderRadius: 10,
  padding: "10px 12px",
};

const drawerRow = {
  display: "flex", alignItems: "center", gap: 10,
  padding: "10px 12px",
  borderRadius: 10,
  background: "rgba(38,38,51,0.025)",
};

// ── Страница «База знаний» ──────────────────────────────────
function KbPage({ kbUserItems = [], setKbUserItems, onOpenChat }) {
  // Активный раздел дерева: "company" | "smm" | "smm/tg-kanal" | "smm/inst" | "hr"
  const [scope, setScope] = useState("smm/tg-kanal");
  const [smmOpen, setSmmOpen] = useState(true);
  const [hrOpen, setHrOpen] = useState(false);
  const [folder, setFolder] = useState("all"); // тип материала
  const [source, setSource] = useState("all"); // "all" | "user" | "agents"
  const [search, setSearch] = useState("");
  const [opened, setOpened] = useState(null);
  const [textView, setTextView] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

  // Все агентские материалы (плоско)
  const agentItems = AGENTS.flatMap(a => {
    const inputs  = (a.kb?.inputs  || []).map(it => ({ ...it, agent: a, source: "input"  }));
    const outputs = (a.kb?.outputs || []).map(it => ({ ...it, agent: a, source: "output" }));
    return [...inputs, ...outputs];
  });
  const userItems = kbUserItems.map(it => ({ ...it, source: "user" }));
  const all = [...userItems, ...agentItems];

  // Фильтр по разделу — пока всё, что есть, относится к smm/tg-kanal.
  // hr и smm/inst — пустые placeholder'ы.
  function matchScope(it) {
    if (scope === "company")      return true;
    if (scope === "smm")          return true;
    if (scope === "smm/tg-kanal") return true;
    if (scope === "smm/inst")     return false;
    if (scope === "hr")           return false;
    return true;
  }
  function matchSource(it) {
    if (source === "all")    return true;
    if (source === "user")   return it.source === "user";
    if (source === "agents") return it.source !== "user";
    return true;
  }
  function matchFolder(it) {
    if (folder === "all")     return true;
    if (folder === "image")   return it.kind === "image";
    if (folder === "file")    return it.kind === "file" || (!it.kind && /\.(pdf|docx?|xlsx?|csv)$/i.test(it.name || ""));
    if (folder === "link")    return it.kind === "link";
    if (folder === "text")    return it.kind === "text";
    if (folder === "video")   return it.kind === "video";
    if (folder === "audio")   return it.kind === "audio";
    return true;
  }

  const filtered = all.filter(it => {
    if (!matchScope(it)) return false;
    if (!matchSource(it)) return false;
    if (!matchFolder(it)) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const name = (it.name || it.title || "").toLowerCase();
      if (!name.includes(q)) return false;
    }
    return true;
  });

  // Подсчёты для шапки фильтра (по текущему scope)
  const scoped = all.filter(matchScope);
  const counts = {
    all:    scoped.length,
    user:   scoped.filter(it => it.source === "user").length,
    agents: scoped.filter(it => it.source !== "user").length,
  };
  // Подсчёты для типов (по scope + source)
  const scopedAndSourced = scoped.filter(matchSource);
  const folderCounts = {
    all:    scopedAndSourced.length,
    image:  scopedAndSourced.filter(it => it.kind === "image").length,
    file:   scopedAndSourced.filter(it => it.kind === "file").length,
    link:   scopedAndSourced.filter(it => it.kind === "link").length,
    text:   scopedAndSourced.filter(it => it.kind === "text").length,
    video:  scopedAndSourced.filter(it => it.kind === "video").length,
    audio:  scopedAndSourced.filter(it => it.kind === "audio").length,
  };
  const folderRows = [
    { id: "all",   label: "Все материалы", icon: ic.kb,    count: folderCounts.all },
    { id: "image", label: "Фото",          icon: ic.image, count: folderCounts.image },
    { id: "file",  label: "Файлы",         icon: ic.file,  count: folderCounts.file },
    { id: "link",  label: "Ссылки",        icon: ic.link,  count: folderCounts.link },
    { id: "text",  label: "Тексты",        icon: ic.text,  count: folderCounts.text },
    { id: "video", label: "Видео",         icon: ic.mediaPic, count: folderCounts.video, dim: folderCounts.video === 0 },
    { id: "audio", label: "Аудио",         icon: ic.mic,   count: folderCounts.audio, dim: folderCounts.audio === 0 },
  ];

  function addUserItem(it) {
    setKbUserItems(prev => [it, ...prev]);
  }

  const scopeLabel =
    scope === "company"      ? "Все материалы компании" :
    scope === "smm"          ? "СММ-отдел" :
    scope === "smm/tg-kanal" ? "Тг-канал" :
    scope === "smm/inst"     ? "Инст" :
    scope === "hr"           ? "HR-отдел" :
    "Материалы";

  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
      {/* Вторичный сайдбар: папки/отделы */}
      <aside style={{
        width: 240, minWidth: 240,
        borderRight: "1px solid rgba(38,38,51,0.06)",
        background: color.white,
        padding: "20px 12px",
        display: "flex", flexDirection: "column",
        gap: 2,
      }}>
        <div style={{ padding: "0 8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#262633" }}>База знаний</span>
          <button
            onClick={() => setAddOpen(true)}
            title="Добавить"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 26, height: 26,
              background: "rgba(38,38,51,0.05)",
              color: "rgba(38,38,51,0.6)",
              border: "none", borderRadius: 8,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >{ic.plus}</button>
        </div>
        {/* Раздел: Компания */}
        <KbTreeRow
          icon={ic.kb}
          label="Компания"
          active={scope === "company"}
          onClick={() => setScope("company")}
          weight={500}
        />
        {/* СММ-отдел (раскрываемый) */}
        <KbTreeRow
          icon={<span style={{ display: "flex", color: "#262633" }}>{ic.dept}</span>}
          label="СММ-отдел"
          indent={14}
          active={scope === "smm"}
          onClick={() => setScope("smm")}
          trailing={
            <button
              onClick={(e) => { e.stopPropagation(); setSmmOpen(v => !v); }}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 18, height: 18, background: "transparent", border: "none",
                cursor: "pointer", color: "rgba(38,38,51,0.55)",
              }}
            >{smmOpen ? ic.chevronUp : ic.chevron}</button>
          }
        />
        {smmOpen && (
          <>
            <KbTreeRow
              label="Тг-канал"
              indent={36}
              active={scope === "smm/tg-kanal"}
              onClick={() => setScope("smm/tg-kanal")}
            />
            <KbTreeRow
              label="Инстаграм"
              indent={36}
              dim
              active={scope === "smm/inst"}
              onClick={() => setScope("smm/inst")}
            />
          </>
        )}
        {/* HR-отдел (раскрываемый, пока пусто) */}
        <KbTreeRow
          icon={<span style={{ display: "flex", color: "#262633" }}>{ic.hr}</span>}
          label="HR-отдел"
          indent={14}
          active={scope === "hr"}
          onClick={() => setScope("hr")}
          trailing={
            <button
              onClick={(e) => { e.stopPropagation(); setHrOpen(v => !v); }}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 18, height: 18, background: "transparent", border: "none",
                cursor: "pointer", color: "rgba(38,38,51,0.55)",
              }}
            >{hrOpen ? ic.chevronUp : ic.chevron}</button>
          }
        />
        {hrOpen && (
          <KbTreeRow label="(пусто)" indent={36} dim />
        )}

        {/* Разделитель + типы материалов (фильтр поверх scope) */}
        <div style={{ height: 1, background: "rgba(38,38,51,0.06)", margin: "12px 8px 8px" }} />
        {folderRows.map(f => (
          <KbTreeRow
            key={f.id}
            icon={f.icon}
            label={f.label}
            active={folder === f.id}
            dim={f.dim}
            onClick={() => setFolder(f.id)}
            trailing={
              <span style={{ fontSize: 11.5, color: "rgba(38,38,51,0.45)" }}>{f.count}</span>
            }
          />
        ))}
      </aside>

      {/* Main: список материалов */}
      <div style={{ flex: 1, minWidth: 0, padding: "20px 24px", overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 22, fontWeight: 600, color: "#262633" }}>
            {scopeLabel}
          </div>
          <span style={{ fontSize: 13, color: "rgba(38,38,51,0.5)" }}>· {filtered.length}</span>
          <div style={{ flex: 1 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по материалам…"
            style={{
              width: 280,
              padding: "8px 12px",
              background: "rgba(38,38,51,0.04)",
              border: "none",
              borderRadius: 999,
              fontSize: 13, color: "#262633",
              fontFamily: "inherit", outline: "none",
            }}
          />
        </div>
        {/* Фильтр по источнику */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 18 }}>
          {[
            { id: "all",    label: "Все",        n: counts.all },
            { id: "user",   label: "От меня",    n: counts.user },
            { id: "agents", label: "От агентов", n: counts.agents },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setSource(s.id)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 12px",
                background: source === s.id ? "#262633" : "rgba(38,38,51,0.05)",
                color: source === s.id ? color.white : "#262633",
                border: "none", borderRadius: 999,
                fontSize: 12.5, fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <span>{s.label}</span>
              <span style={{
                fontSize: 11,
                color: source === s.id ? "rgba(255,255,255,0.6)" : "rgba(38,38,51,0.45)",
              }}>{s.n}</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{
            padding: "60px 20px", textAlign: "center",
            color: "rgba(38,38,51,0.5)", fontSize: 14,
          }}>
            В этой папке пока пусто
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 8,
          }}>
            {filtered.map((it, i) => (
              <KbCard
                key={`${it.source}-${i}`}
                it={it}
                onOpen={() => {
                  if (it.source === "user") {
                    if (it.kind === "link") { window.open(it.name, "_blank"); return; }
                    if (it.kind === "image" && it.data) { window.open(it.data, "_blank"); return; }
                    if (it.kind === "file"  && it.data) { window.open(it.data, "_blank"); return; }
                    if (it.kind === "text") { setTextView(it); return; }
                    return;
                  }
                  setOpened(it);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Мини-чат «Спросить у Mary» по центру снизу */}
      <button
        onClick={onOpenChat}
        style={{
          position: "fixed",
          left: "50%", bottom: 24,
          transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: 10,
          background: color.white,
          border: "1px solid rgba(38,38,51,0.08)",
          borderRadius: 999,
          padding: "10px 18px",
          boxShadow: "0 4px 14px rgba(38,38,51,0.08)",
          fontSize: 14, color: "#262633", fontWeight: 500,
          cursor: "pointer", fontFamily: "inherit",
          zIndex: 5,
        }}
      >
        <span>Спросить у Mary</span>
        <span style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 22, height: 22, borderRadius: 7,
          background: "rgba(255,139,61,0.12)", color: "#FF8B3D",
        }}>{ic.spark}</span>
      </button>

      {opened && <KbPopup item={opened} onClose={() => setOpened(null)} />}
      {textView && <TextViewerPopup item={textView} onClose={() => setTextView(null)} />}
      {addOpen && <AddKbPopup onAdd={addUserItem} onClose={() => setAddOpen(false)} />}
    </div>
  );
}

function KbTreeRow({ icon, label, indent = 0, active, dim, onClick, trailing, weight = 450 }) {
  const [h, setH] = useState(false);
  const clickable = !!onClick;
  return (
    <div
      onClick={clickable ? onClick : undefined}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: `8px 10px 8px ${10 + indent}px`,
        background: active ? "rgba(38,38,51,0.06)" : h && clickable ? "rgba(38,38,51,0.035)" : "transparent",
        borderRadius: 8,
        cursor: clickable ? "pointer" : "default",
        color: dim ? "rgba(38,38,51,0.4)" : "#262633",
        userSelect: "none",
      }}
    >
      {icon && <span style={{ display: "flex", width: 14, color: "currentColor", flexShrink: 0 }}>{icon}</span>}
      <span style={{ fontSize: 13, fontWeight: weight, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      {trailing}
    </div>
  );
}

function KbCard({ it, onOpen }) {
  const isUser = it.source === "user";
  const meta = isUser ? (KIND_META[it.kind] || KIND_META.file) : null;
  return (
    <button
      onClick={onOpen}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        width: "100%",
        padding: "12px 14px",
        background: "rgba(38,38,51,0.03)",
        border: "none", borderRadius: 12,
        cursor: "pointer", fontFamily: "inherit", textAlign: "left",
        transition: transition.fast,
      }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(38,38,51,0.05)"}
      onMouseLeave={e => e.currentTarget.style.background = "rgba(38,38,51,0.03)"}
    >
      {isUser ? (
        <UserItemThumb it={it} />
      ) : (
        <div style={{
          width: 36, height: 36, borderRadius: 9,
          background: it.agent.color + "1A",
          color: it.agent.color,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          {it.source === "input" ? ic.inboxArrow : ic.package}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: "#262633", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {it.name || it.title}
        </div>
        <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 3, display: "flex", alignItems: "center", gap: 6 }}>
          {isUser ? (
            <>
              <UserItemKindBadge kind={it.kind} />
              <span>{it.meta}</span>
            </>
          ) : (
            <>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: it.agent.color }} />
              <span>{it.agent.label}</span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Страница «Интеграции» ───────────────────────────────────
// Логотипы — Google favicon API (реальные брендовые иконки сервисов)
function favicon(domain) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}
const ALL_INTEGRATIONS = [
  { id: "telegram",   name: "Telegram",         desc: "Парсинг каналов, чтение метрик постов", logo: "/integrations/telegram.jpg", connected: true },
  { id: "figma",      name: "Figma",            desc: "Сборка финального макета поста",        logo: "/integrations/figma.webp",   connected: true },
  { id: "gsheets",    name: "Google Sheets",    desc: "Хранение данных и таблиц",              logo: "/integrations/sheets.png",   connected: true },
  { id: "gdrive",     name: "Google Drive",     desc: "Файловое хранилище",                    logo: favicon("drive.google.com") },
  { id: "gdocs",      name: "Google Docs",      desc: "Тексты и документы",                    logo: favicon("docs.google.com") },
  { id: "gforms",     name: "Google Forms",     desc: "Опросы и анкеты",                       logo: favicon("forms.google.com") },
  { id: "gcal",       name: "Google Calendar",  desc: "События и расписание",                  logo: favicon("calendar.google.com") },
  { id: "gads",       name: "Google Ads",       desc: "Управление рекламными кампаниями",      logo: favicon("ads.google.com") },
  { id: "ganalytics", name: "Google Analytics", desc: "Веб-аналитика сайта",                   logo: favicon("analytics.google.com") },
  { id: "gmail",      name: "Gmail",            desc: "Email и переписка",                     logo: favicon("mail.google.com") },
  { id: "notion",     name: "Notion",           desc: "База знаний и документация",            logo: favicon("notion.so") },
  { id: "slack",      name: "Slack",            desc: "Уведомления и переписка команды",       logo: favicon("slack.com") },
  { id: "github",     name: "GitHub",           desc: "Репозитории и issues",                  logo: favicon("github.com") },
  { id: "linear",     name: "Linear",           desc: "Управление задачами",                   logo: favicon("linear.app") },
  { id: "tgstat",     name: "TG Stat",          desc: "Аналитика Telegram-каналов",            logo: favicon("tgstat.ru") },
  { id: "miro",       name: "Miro",             desc: "Доски для брейнштормов",                logo: favicon("miro.com") },
  { id: "hubspot",    name: "HubSpot",          desc: "CRM и продажи",                         logo: favicon("hubspot.com") },
  { id: "amplitude",  name: "Amplitude",        desc: "Продуктовая аналитика",                 logo: favicon("amplitude.com") },
  { id: "stripe",     name: "Stripe",           desc: "Приём платежей",                        logo: favicon("stripe.com") },
  { id: "openai",     name: "OpenAI",           desc: "GPT-модели для агентов",                logo: favicon("openai.com") },
  { id: "anthropic",  name: "Anthropic",        desc: "Claude-модели для агентов",             logo: favicon("anthropic.com") },
  { id: "midjourney", name: "Midjourney",       desc: "Генерация изображений",                 logo: favicon("midjourney.com") },
];

function IntegrationsPage({ onOpenChat }) {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState(ALL_INTEGRATIONS);

  const q = search.trim().toLowerCase();
  const matched = items.filter(it => !q || it.name.toLowerCase().includes(q) || it.desc.toLowerCase().includes(q));
  const connected = matched.filter(it => it.connected);
  const available = matched.filter(it => !it.connected);

  function toggleConnect(id) {
    setItems(prev => prev.map(it => it.id === id ? { ...it, connected: !it.connected } : it));
  }

  return (
    <div style={{ flex: 1, minWidth: 0, padding: "20px 24px 80px", overflow: "auto", background: color.white }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: "#262633", marginBottom: 18 }}>Интеграции</div>

        {/* Поиск + кнопка */}
        <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
          <div style={{
            flex: 1,
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 12px",
            background: "rgba(38,38,51,0.04)",
            border: "none",
            borderRadius: 999,
          }}>
            <span style={{ display: "flex", color: "rgba(38,38,51,0.45)" }}>{ic.searching}</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по интеграциям…"
              style={{
                flex: 1, border: "none", outline: "none",
                background: "transparent",
                fontSize: 13, fontFamily: "inherit", color: "#262633",
              }}
            />
          </div>
          <button style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "0 16px",
            background: "#262633", color: color.white,
            border: "none", borderRadius: 999,
            fontSize: 13, fontWeight: 500,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            <span>+</span><span>Подключить</span>
          </button>
        </div>

        {/* Подключённые */}
        {connected.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 12, color: "rgba(38,38,51,0.5)", marginBottom: 12, fontWeight: 500 }}>
              Подключённые · {connected.length}
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 12,
            }}>
              {connected.map(it => (
                <IntegrationCard key={it.id} it={it} onToggle={() => toggleConnect(it.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Доступные */}
        {available.length > 0 && (
          <div>
            <div style={{ fontSize: 12, color: "rgba(38,38,51,0.5)", marginBottom: 12, fontWeight: 500 }}>
              Доступные · {available.length}
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 12,
            }}>
              {available.map(it => (
                <IntegrationCard key={it.id} it={it} onToggle={() => toggleConnect(it.id)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Мини-чат «Спросить у Mary» по центру снизу */}
      <button
        onClick={onOpenChat}
        style={{
          position: "fixed",
          left: "50%", bottom: 24,
          transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: 10,
          background: color.white,
          border: "1px solid rgba(38,38,51,0.08)",
          borderRadius: 999,
          padding: "10px 18px",
          boxShadow: "0 4px 14px rgba(38,38,51,0.08)",
          fontSize: 14, color: "#262633", fontWeight: 500,
          cursor: "pointer", fontFamily: "inherit",
          zIndex: 5,
        }}
      >
        <span>Спросить у Mary</span>
        <span style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 22, height: 22, borderRadius: 7,
          background: "rgba(255,139,61,0.12)", color: "#FF8B3D",
        }}>{ic.spark}</span>
      </button>
    </div>
  );
}

function IntegrationCard({ it, onToggle }) {
  const [h, setH] = useState(false);
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 14px",
        background: h ? "rgba(38,38,51,0.04)" : "rgba(38,38,51,0.025)",
        borderRadius: 10,
        transition: transition.fast,
      }}
    >
      {/* Логотип */}
      <div style={{
        width: 36, height: 36, borderRadius: 9,
        overflow: "hidden",
        background: color.white,
        border: "1px solid rgba(38,38,51,0.06)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <img src={it.logo} alt={it.name} style={{ width: 22, height: 22, objectFit: "contain" }} />
      </div>
      {/* Название + описание */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: "#262633" }}>{it.name}</div>
        <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.desc}</div>
      </div>
      {/* Кнопка */}
      {it.connected ? (
        <button
          onClick={onToggle}
          style={{
            padding: "6px 12px",
            background: "transparent",
            color: "rgba(38,38,51,0.7)",
            border: "1px solid rgba(38,38,51,0.12)",
            borderRadius: 999,
            fontSize: 12, fontWeight: 450,
            cursor: "pointer", fontFamily: "inherit",
            flexShrink: 0,
          }}
        >Отключить</button>
      ) : (
        <button
          onClick={onToggle}
          style={{
            padding: "6px 14px",
            background: "#262633",
            color: color.white,
            border: "none", borderRadius: 999,
            fontSize: 12, fontWeight: 500,
            cursor: "pointer", fontFamily: "inherit",
            flexShrink: 0,
          }}
        >Подключить</button>
      )}
    </div>
  );
}

// ── Страница «Задачи» (канбан) ──────────────────────────────
// Доп. мок задач на реальных людей (кроме AGENTS.tasks)
const PEOPLE_TASKS = [
  { id: "p1", title: "Согласовать контент-план на май", desc: "проверить идеи Маркетолога", assigneeKind: "person", assigneeId: 1, status: "На апруве",   dept: "smm", channel: "tg-kanal" },
  { id: "p2", title: "Снять короткое видео с лица бренда", desc: "30 сек, формат Reels",     assigneeKind: "person", assigneeId: 1, status: "Запланирована", dept: "smm", channel: "tg-kanal" },
  { id: "p3", title: "Написать манифест канала", desc: "большой пилотный пост",              assigneeKind: "person", assigneeId: 2, status: "В работе",     dept: "smm", channel: "tg-kanal" },
  { id: "p4", title: "Подобрать 5 экспертов для интервью", desc: "из ниши indie-hackers",     assigneeKind: "person", assigneeId: 4, status: "В работе",     dept: "smm", channel: "tg-kanal" },
  { id: "p5", title: "Обновить визуальный гайд бренда", desc: "обновить палитру и шрифты",   assigneeKind: "person", assigneeId: 3, status: "Готово",       dept: "smm", channel: "tg-kanal" },
];

const KANBAN_COLUMNS = [
  { id: "Запланирована", label: "Запланировано", color: "rgba(38,38,51,0.45)" },
  { id: "В работе",       label: "В работе",      color: "#3F95FF" },
  { id: "На апруве",      label: "На апруве",     color: "#FF8B3D" },
  { id: "Готово",         label: "Готово",        color: "#34C759" },
];

function TasksPage({ pendingTasks = [], onOpenChat }) {
  const [scope, setScope] = useState("smm/tg-kanal");
  const [smmOpen, setSmmOpen] = useState(true);
  const [hrOpen, setHrOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | agents | people

  // Все задачи: AGENTS.tasks + PEOPLE_TASKS + pendingTasks
  const agentTasks = AGENTS.flatMap(a =>
    (a.tasks || []).map((t, i) => ({
      id: `a-${a.id}-${i}`,
      title: t.title,
      desc:  t.desc,
      cron:  t.cron,
      tool:  t.tool,
      out:   t.out,
      status: t.status || "Запланирована",
      assigneeKind: "agent",
      assignee: a,
      dept: "smm",
      channel: "tg-kanal",
    }))
  );
  const peopleTasks = PEOPLE_TASKS.map(t => ({
    ...t,
    assignee: MOCK_PEOPLE.find(p => p.id === t.assigneeId),
  }));
  const pending = pendingTasks.map(t => ({
    id: `pend-${t.id}`,
    title: t.title,
    desc: `${t.kind === "agent" ? `${t.assignee}-агенту` : t.assignee}`,
    status: "Ожидает принятия",
    assigneeKind: t.kind,
    assignee: t.kind === "agent"
      ? AGENTS.find(a => a.label.toLowerCase() === t.assignee.toLowerCase())
      : MOCK_PEOPLE.find(p => p.name === t.assignee),
    dept: "smm",
    channel: "tg-kanal",
    pending: true,
  }));

  const all = [...pending, ...agentTasks, ...peopleTasks];

  function matchScope(t) {
    if (scope === "company")      return true;
    if (scope === "smm")          return t.dept === "smm";
    if (scope === "smm/tg-kanal") return t.dept === "smm" && t.channel === "tg-kanal";
    if (scope === "smm/inst")     return t.dept === "smm" && t.channel === "inst";
    if (scope === "hr")           return t.dept === "hr";
    return true;
  }
  function matchFilter(t) {
    if (filter === "all")     return true;
    if (filter === "agents")  return t.assigneeKind === "agent";
    if (filter === "people")  return t.assigneeKind === "person";
    return true;
  }
  function matchSearch(t) {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (t.title || "").toLowerCase().includes(q) || (t.desc || "").toLowerCase().includes(q);
  }
  const filtered = all.filter(t => matchScope(t) && matchFilter(t) && matchSearch(t));
  const scoped = all.filter(matchScope);
  const counts = {
    all:    scoped.length,
    agents: scoped.filter(t => t.assigneeKind === "agent").length,
    people: scoped.filter(t => t.assigneeKind === "person").length,
  };

  // Группировка по статусам
  function inColumn(t, colId) {
    if (t.pending) return colId === "Запланирована";
    return t.status === colId;
  }

  const scopeLabel =
    scope === "company"      ? "Все задачи компании" :
    scope === "smm"          ? "СММ-отдел" :
    scope === "smm/tg-kanal" ? "Тг-канал" :
    scope === "smm/inst"     ? "Инст" :
    scope === "hr"           ? "HR-отдел" :
    "Задачи";

  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
      {/* Вторичный сайдбар: дерево отделов */}
      <aside style={{
        width: 240, minWidth: 240,
        borderRight: "1px solid rgba(38,38,51,0.06)",
        background: color.white,
        padding: "20px 12px",
        display: "flex", flexDirection: "column",
        gap: 2,
        overflowY: "auto",
      }}>
        <div style={{ padding: "0 8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#262633" }}>Задачи</span>
        </div>
        <KbTreeRow
          icon={ic.kb}
          label="Компания"
          active={scope === "company"}
          onClick={() => setScope("company")}
          weight={500}
        />
        <KbTreeRow
          icon={<span style={{ display: "flex", color: "#262633" }}>{ic.dept}</span>}
          label="СММ-отдел"
          indent={14}
          active={scope === "smm"}
          onClick={() => setScope("smm")}
          trailing={
            <button
              onClick={(e) => { e.stopPropagation(); setSmmOpen(v => !v); }}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 18, height: 18, background: "transparent", border: "none",
                cursor: "pointer", color: "rgba(38,38,51,0.55)",
              }}
            >{smmOpen ? ic.chevronUp : ic.chevron}</button>
          }
        />
        {smmOpen && (
          <>
            <KbTreeRow label="Тг-канал" indent={36} active={scope === "smm/tg-kanal"} onClick={() => setScope("smm/tg-kanal")} />
            <KbTreeRow label="Инстаграм" indent={36} dim active={scope === "smm/inst"} onClick={() => setScope("smm/inst")} />
          </>
        )}
        <KbTreeRow
          icon={<span style={{ display: "flex", color: "#262633" }}>{ic.hr}</span>}
          label="HR-отдел"
          indent={14}
          active={scope === "hr"}
          onClick={() => setScope("hr")}
          trailing={
            <button
              onClick={(e) => { e.stopPropagation(); setHrOpen(v => !v); }}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 18, height: 18, background: "transparent", border: "none",
                cursor: "pointer", color: "rgba(38,38,51,0.55)",
              }}
            >{hrOpen ? ic.chevronUp : ic.chevron}</button>
          }
        />
        {hrOpen && <KbTreeRow label="(пусто)" indent={36} dim />}
      </aside>

      {/* Канбан */}
      <div style={{ flex: 1, minWidth: 0, padding: "20px 24px 80px", overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 22, fontWeight: 600, color: "#262633" }}>{scopeLabel}</div>
          <span style={{ fontSize: 13, color: "rgba(38,38,51,0.5)" }}>· {filtered.length}</span>
          <div style={{ flex: 1 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск задач…"
            style={{
              width: 240,
              padding: "8px 12px",
              background: "rgba(38,38,51,0.04)",
              border: "none", borderRadius: 999,
              fontSize: 13, color: "#262633",
              fontFamily: "inherit", outline: "none",
            }}
          />
        </div>

        {/* Фильтр исполнителей */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 18 }}>
          {[
            { id: "all",    label: "Все",        n: counts.all },
            { id: "agents", label: "Агенты",     n: counts.agents },
            { id: "people", label: "Сотрудники", n: counts.people },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setFilter(s.id)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 12px",
                background: filter === s.id ? "#262633" : "rgba(38,38,51,0.05)",
                color: filter === s.id ? color.white : "#262633",
                border: "none", borderRadius: 999,
                fontSize: 12.5, fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <span>{s.label}</span>
              <span style={{
                fontSize: 11,
                color: filter === s.id ? "rgba(255,255,255,0.6)" : "rgba(38,38,51,0.45)",
              }}>{s.n}</span>
            </button>
          ))}
        </div>

        {/* Канбан-колонки */}
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${KANBAN_COLUMNS.length}, minmax(220px, 1fr))`,
          gap: 12,
          alignItems: "start",
        }}>
          {KANBAN_COLUMNS.map(col => {
            const colTasks = filtered.filter(t => inColumn(t, col.id));
            return (
              <div key={col.id} style={{
                background: "rgba(38,38,51,0.025)",
                borderRadius: 12,
                padding: 10,
                minHeight: 200,
              }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "4px 6px 10px",
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: col.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#262633" }}>{col.label}</span>
                  <span style={{ fontSize: 11.5, color: "rgba(38,38,51,0.45)" }}>· {colTasks.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {colTasks.map(t => <TaskKanbanCard key={t.id} t={t} />)}
                  {colTasks.length === 0 && (
                    <div style={{
                      padding: "16px 8px", textAlign: "center",
                      fontSize: 11.5, color: "rgba(38,38,51,0.4)",
                    }}>пусто</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Мини-чат «Спросить у Mary» по центру снизу */}
      <button
        onClick={onOpenChat}
        style={{
          position: "fixed",
          left: "50%", bottom: 24,
          transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: 10,
          background: color.white,
          border: "1px solid rgba(38,38,51,0.08)",
          borderRadius: 999,
          padding: "10px 18px",
          boxShadow: "0 4px 14px rgba(38,38,51,0.08)",
          fontSize: 14, color: "#262633", fontWeight: 500,
          cursor: "pointer", fontFamily: "inherit",
          zIndex: 5,
        }}
      >
        <span>Спросить у Mary</span>
        <span style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 22, height: 22, borderRadius: 7,
          background: "rgba(255,139,61,0.12)", color: "#FF8B3D",
        }}>{ic.spark}</span>
      </button>
    </div>
  );
}

function TaskKanbanCard({ t }) {
  const a = t.assignee;
  const isAgent = t.assigneeKind === "agent";
  return (
    <div style={{
      background: color.white,
      borderRadius: 10,
      padding: "10px 12px",
      border: t.pending ? "1px solid rgba(255,214,10,0.6)" : "1px solid rgba(38,38,51,0.06)",
    }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: "#262633", lineHeight: 1.3 }}>{t.title}</div>
      {t.desc && (
        <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 3, lineHeight: 1.35 }}>{t.desc}</div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
        {a ? (
          isAgent ? (
            <>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 16, height: 16, borderRadius: 4,
                background: a.color + "22", color: a.color, flexShrink: 0,
              }}>
                <svg width={10} height={10} viewBox="0 0 24 24">
                  <rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor" />
                  <rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor" />
                  <circle cx="9.3" cy="13" r="1.4" fill="white" />
                  <circle cx="14.7" cy="13" r="1.4" fill="white" />
                </svg>
              </span>
              <span style={{ fontSize: 11, color: "rgba(38,38,51,0.65)" }}>{a.label}-агент</span>
            </>
          ) : (
            <>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 16, height: 16, borderRadius: "50%",
                background: a.color, color: color.white,
                fontSize: 9, fontWeight: 600,
                flexShrink: 0,
              }}>{a.name?.split(" ").map(w => w[0]).join("").slice(0, 2)}</span>
              <span style={{ fontSize: 11, color: "rgba(38,38,51,0.65)" }}>{a.name}</span>
            </>
          )
        ) : (
          <span style={{ fontSize: 11, color: "rgba(38,38,51,0.45)" }}>не назначено</span>
        )}
        <div style={{ flex: 1 }} />
        {t.cron && (
          <span style={{
            fontSize: 9.5, color: "rgba(38,38,51,0.5)",
            fontFamily: "ui-monospace, SF Mono, monospace",
            whiteSpace: "nowrap",
          }}>{t.cron.replace(/^cron\s*/, "")}</span>
        )}
        {t.pending && (
          <span style={{
            fontSize: 10, fontWeight: 500,
            background: "rgba(255,214,10,0.18)",
            color: "#A8770A",
            padding: "1px 7px", borderRadius: 999,
          }}>Ожидает</span>
        )}
      </div>
    </div>
  );
}

// ── Страница «Чат Mary» (Claude-style: список чатов + thread) ──
function ChatMaryPage() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);     // сообщения активного чата
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);    // отправка
  const [draftId, setDraftId] = useState(null);     // id draft-сообщения Mary в стриме
  // Live-визуализатор того что Mary сейчас собирает
  const [build, setBuild] = useState(null); // { type: "department", deptId, name, channels:[], agents:[], integrations:[] }
  const [showActivity, setShowActivity] = useState(false);
  const [activity, setActivity] = useState([]); // лог последних tool calls

  // Список чатов с бэка
  const refreshList = async () => {
    try {
      const r = await fetch("/api/mary/conversations");
      const d = await r.json();
      setConversations(d.conversations || []);
      // Если ничего не выбрано — выберем первый или создадим новый
      if (!activeId && (d.conversations || []).length > 0) {
        setActiveId(d.conversations[0].id);
      } else if (!activeId) {
        await newChat();
      }
    } catch {}
  };
  useEffect(() => { refreshList(); }, []);

  // Загрузка сообщений активного чата
  useEffect(() => {
    if (!activeId) return;
    fetch(`/api/mary/conversations/${activeId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setMessages(d.messages || []); })
      .catch(() => {});
  }, [activeId]);

  async function newChat(scope = "general") {
    const r = await fetch("/api/mary/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scope, title: "Новый чат" }),
    });
    const c = await r.json();
    setConversations(prev => [c, ...prev]);
    setActiveId(c.id);
    setMessages([]);
    return c.id;
  }
  async function deleteChat(id) {
    if (!confirm("Удалить чат?")) return;
    await fetch(`/api/mary/conversations/${id}`, { method: "DELETE" });
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeId === id) {
      const next = conversations.find(c => c.id !== id);
      setActiveId(next ? next.id : null);
      if (!next) setMessages([]);
    }
  }

  async function send(overrideText, opts = {}) {
    const msg = (overrideText ?? text).trim();
    if (!msg || loading) return;
    if (overrideText === undefined) setText("");
    // Edit & Resend: сначала отрезаем хвост сообщений начиная с editFromIndex,
    // и в UI убираем те же сообщения.
    if (opts.editFromIndex !== undefined && activeId) {
      try {
        await fetch(`/api/mary/conversations/${activeId}/messages?from=${opts.editFromIndex}`, { method: "DELETE" });
      } catch {}
      setMessages(prev => prev.slice(0, opts.editFromIndex));
    }
    let cid = activeId;
    if (!cid) cid = await newChat();
    // Добавляем user-сообщение в UI оптимистично
    setMessages(prev => [...prev, { role: "user", text: msg, ts: new Date().toISOString() }]);
    setLoading(true);
    const newDraftId = "draft-" + Date.now();
    setDraftId(newDraftId);
    setMessages(prev => [...prev, { role: "mary", text: "", _streaming: true, _id: newDraftId, ts: new Date().toISOString() }]);

    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const res = await fetch("/api/mary/agent/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, conversationId: cid }),
        signal: ac.signal,
      });
      if (!res.ok || !res.body) throw new Error("stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() || "";
        for (const block of blocks) {
          const lines = block.split("\n");
          let event = "message", dataStr = "";
          for (const line of lines) {
            if (line.startsWith("event:")) event = line.slice(6).trim();
            else if (line.startsWith("data:")) dataStr += line.slice(5).trim();
          }
          if (!dataStr) continue;
          let data; try { data = JSON.parse(dataStr); } catch { continue; }
          if (event === "text_delta" && data.delta) {
            setMessages(prev => prev.map(m =>
              m._id === newDraftId ? { ...m, text: (m.text || "") + data.delta } : m
            ));
          } else if (event === "tool_start") {
            setMessages(prev => prev.map(m => {
              if (m._id !== newDraftId) return m;
              const tools = (m._tools || []).slice();
              tools.push({ name: data.name, args: data.args, status: "running", startedAt: Date.now() });
              return { ...m, _toolStatus: data.name, _toolStatusStartedAt: Date.now(), _tools: tools };
            }));
          } else if (event === "tool_end") {
            setMessages(prev => prev.map(m => {
              if (m._id !== newDraftId) return m;
              const tools = (m._tools || []).slice();
              // Помечаем последний running tool с таким именем как done и сохраняем result
              for (let i = tools.length - 1; i >= 0; i--) {
                if (tools[i].name === data.name && tools[i].status === "running") {
                  tools[i] = { ...tools[i], status: "done", durationMs: data.durationMs, ok: data.ok, result: data.result };
                  break;
                }
              }
              return { ...m, _toolStatus: null, _tools: tools };
            }));
            // Логируем в activity
            setActivity(prev => [{
              name: data.name,
              ok: data.ok,
              durationMs: data.durationMs,
              result: data.result,
              ts: Date.now(),
            }, ...prev].slice(0, 30));
            // Авто-открытие activity panel при первой работе
            setShowActivity(true);
            // ── live workflow builder: апдейт по результатам tool ──
            // Любой dept-mutating tool возвращает полное состояние department —
            // используем его как источник правды (на случай если Mary апдейтит
            // существующий отдел и create_department не вызывался).
            if (data.ok && data.result?.department) {
              const d = data.result.department;
              setBuild({
                type: "department",
                deptId: d.id, name: d.name,
                color: d.color || "#7A86FF",
                channels: d.channels || [],
                agents: d.agents || [],
                integrations: d.integrations || [],
              });
            }
          } else if (event === "done") {
            setMessages(prev => prev.map(m =>
              m._id === newDraftId ? { ...m, _streaming: false, _toolStatus: null } : m
            ));
          }
        }
      }
      // Обновим список чатов чтобы title обновился
      refreshList();
    } catch (e) {
      // Stop-кнопка → AbortError. Не показываем как ошибку, мягко закрываем.
      if (e.name === "AbortError") {
        setMessages(prev => prev.map(m =>
          m._id === newDraftId ? {
            ...m,
            text: (m.text || "") + (m.text ? "\n\n" : "") + "_(остановлено)_",
            _streaming: false, _toolStatus: null,
          } : m
        ));
      } else {
        setMessages(prev => prev.map(m =>
          m._id === newDraftId ? { ...m, text: "Ошибка: " + e.message, _streaming: false } : m
        ));
      }
    } finally {
      setLoading(false);
      setDraftId(null);
      abortRef.current = null;
    }
  }

  const SCOPE_LABEL = { general: "Общий", smm: "СММ", free: "Свободный" };

  // Typewriter placeholder для пустого чата
  const typewriterPhrases = useMemo(() => ([
    "Создай отдел продаж…",
    "Поставь задачу маркетологу собрать идеи постов…",
    "Покажи метрики ТГ-канала за неделю…",
    "Найди свежий ресёрч по конкурентам…",
    "Подключи Google Sheets к отделу СММ…",
    "Что нового в чате СММ-отдела?",
    "Сгенерируй контент-план на 14 дней…",
    "Какие посты собрали больше всего реакций?",
  ]), []);
  const isEmptyChat = messages.length === 0 && !loading;
  const typewriterText = useTypewriterPlaceholder(typewriterPhrases, isEmptyChat);
  const [chatsCollapsed, setChatsCollapsed] = useState(false);
  const [chatsQuery, setChatsQuery] = useState("");
  // AbortController для прерывания текущего стрима через Stop-кнопку
  const abortRef = useRef(null);
  function stopStream() { abortRef.current?.abort(); }

  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0, background: color.white }}>
      {/* Sidebar — список чатов (можно скрыть) */}
      {chatsCollapsed ? (
        <div style={{
          width: 44, minWidth: 44,
          background: color.white,
          borderRight: "1px solid rgba(38,38,51,0.06)",
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "16px 0", gap: 8,
        }}>
          <button
            onClick={() => setChatsCollapsed(false)}
            title="Раскрыть список чатов"
            style={{
              width: 32, height: 32,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: "transparent", border: "none", borderRadius: 7,
              color: "rgba(38,38,51,0.55)", cursor: "pointer", fontFamily: "inherit",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(38,38,51,0.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >{ic.collapse}</button>
          <button
            onClick={() => newChat("general")}
            title="Новый чат"
            style={{
              width: 32, height: 32,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: "#262633", border: "none", borderRadius: 7,
              color: color.white, cursor: "pointer", fontFamily: "inherit",
            }}
          >{ic.plus}</button>
        </div>
      ) : (
      <aside style={{
        width: 280, minWidth: 280,
        borderRight: "1px solid rgba(38,38,51,0.06)",
        display: "flex", flexDirection: "column",
        background: color.white,
      }}>
        <div style={{ padding: "16px 14px 12px", display: "flex", alignItems: "center", gap: 8 }}>
          <button
            data-testid="new-chat-btn"
            onClick={() => newChat("general")}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              flex: 1, padding: "10px 14px",
              background: "#262633", color: color.white,
              border: "none", borderRadius: 10,
              fontSize: 13, fontWeight: 500,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >{ic.plus} <span>Новый чат</span></button>
          <button
            onClick={() => setChatsCollapsed(true)}
            title="Скрыть список чатов"
            style={{
              width: 32, height: 32, flexShrink: 0,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: "transparent", border: "none", borderRadius: 7,
              color: "rgba(38,38,51,0.55)", cursor: "pointer", fontFamily: "inherit",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(38,38,51,0.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >{ic.collapse}</button>
        </div>
        {/* Поиск по чатам */}
        <div style={{ padding: "0 14px 8px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(38,38,51,0.04)",
            borderRadius: 8, padding: "7px 10px",
          }}>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="rgba(38,38,51,0.45)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              value={chatsQuery}
              onChange={e => setChatsQuery(e.target.value)}
              placeholder="Поиск чатов"
              style={{
                flex: 1, border: "none", outline: "none",
                background: "transparent", fontSize: 13, color: "#262633",
                fontFamily: "inherit", padding: 0,
              }}
            />
            {chatsQuery && (
              <button
                onClick={() => setChatsQuery("")}
                title="Очистить"
                style={{
                  background: "transparent", border: "none", padding: 0,
                  display: "inline-flex", color: "rgba(38,38,51,0.45)",
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >{ic.close}</button>
            )}
          </div>
        </div>
        <div style={{
          padding: "0 8px 16px", overflowY: "auto", flex: 1,
          display: "flex", flexDirection: "column", gap: 2,
        }}>
          {conversations.length === 0 && (
            <div style={{ padding: 14, fontSize: 12.5, color: "rgba(38,38,51,0.5)", textAlign: "center" }}>
              Нет чатов. Создай первый.
            </div>
          )}
          {/* Поиск (flat-список) или группировка по дате */}
          {(() => {
            const q = chatsQuery.trim().toLowerCase();
            const filtered = q
              ? conversations.filter(c => (c.title || "").toLowerCase().includes(q))
              : conversations;

            if (q && filtered.length === 0) {
              return (
                <div style={{ padding: "20px 14px", fontSize: 12.5, color: "rgba(38,38,51,0.5)", textAlign: "center" }}>
                  Ничего не найдено.
                </div>
              );
            }

            // Сортируем по updatedAt (новые сверху)
            const sorted = [...filtered].sort((a, b) =>
              new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
            );

            // helper для рендера одной строки чата
            const renderItem = (c) => {
              const active = c.id === activeId;
              const isDept = c.scope === "smm" || c.scope.startsWith("smm/");
              const dot = isDept ? "#FF8B3D" : c.scope === "general" ? "#262633" : "#34C759";
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 10px",
                    background: active ? "rgba(38,38,51,0.06)" : "transparent",
                    borderRadius: 8, cursor: "pointer",
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(38,38,51,0.03)"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: "#262633", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.title}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(38,38,51,0.45)", marginTop: 1 }}>
                      {c.messageCount} сообщ.
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteChat(c.id); }}
                    style={{
                      background: "transparent", border: "none", cursor: "pointer",
                      color: "rgba(38,38,51,0.4)", padding: 4, borderRadius: 6,
                      display: active ? "flex" : "none",
                    }}
                    title="Удалить"
                  >{ic.close}</button>
                </div>
              );
            };

            // Если идёт поиск — flat-список без заголовков
            if (q) {
              return <div style={{ marginTop: 4 }}>{sorted.map(renderItem)}</div>;
            }

            // Группировка по «когда»
            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            const startOfYesterday = startOfToday - 86400000;
            const startOfWeek = startOfToday - 7 * 86400000;
            const buckets = { today: [], yesterday: [], week: [], earlier: [] };
            for (const c of sorted) {
              const t = new Date(c.updatedAt || c.createdAt).getTime();
              if      (t >= startOfToday)     buckets.today.push(c);
              else if (t >= startOfYesterday) buckets.yesterday.push(c);
              else if (t >= startOfWeek)      buckets.week.push(c);
              else                            buckets.earlier.push(c);
            }
            const groups = [
              { id: "today",     label: "Сегодня",      items: buckets.today },
              { id: "yesterday", label: "Вчера",        items: buckets.yesterday },
              { id: "week",      label: "На этой неделе", items: buckets.week },
              { id: "earlier",   label: "Раньше",       items: buckets.earlier },
            ].filter(g => g.items.length > 0);

            return groups.map(g => (
              <div key={g.id} style={{ marginBottom: 10 }}>
                <div style={{
                  fontSize: 10.5, color: "rgba(38,38,51,0.5)", fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.06em",
                  padding: "8px 10px 4px",
                }}>{g.label}</div>
                {g.items.map(renderItem)}
              </div>
            ));
          })()}
        </div>
      </aside>
      )}

      {/* Thread */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {!activeId ? (
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(38,38,51,0.5)",
          }}>
            Выбери чат или создай новый
          </div>
        ) : (
          <>
            {/* Шапка */}
            <div style={{
              padding: "14px 24px",
              borderBottom: "1px solid rgba(38,38,51,0.06)",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: 14, fontWeight: 510, color: "#262633" }}>
                {conversations.find(c => c.id === activeId)?.title || "Чат"}
              </span>
              <span style={{
                fontSize: 11, color: "rgba(38,38,51,0.5)",
                padding: "2px 8px", background: "rgba(38,38,51,0.06)", borderRadius: 999,
              }}>{SCOPE_LABEL[conversations.find(c => c.id === activeId)?.scope] || ""}</span>
            </div>

            {/* Сообщения */}
            <div style={{
              flex: 1, overflowY: "auto", padding: "20px 0",
              display: "flex", flexDirection: "column",
            }}>
              {messages.length === 0 ? (
                <ChatWelcome onSuggest={(s) => send(s)}>
                  <MaryInputBox
                    text={text} setText={setText} send={send}
                    loading={loading} onStop={stopStream}
                    placeholder={isEmptyChat ? typewriterText : "Спросить у Mary"}
                  />
                </ChatWelcome>
              ) : (
                <div style={{ maxWidth: 760, width: "100%", margin: "0 auto", padding: "0 24px" }}>
                  {messages.map((m, i) => (
                    <ChatBubble
                      key={i}
                      m={m}
                      index={i}
                      isLast={i === messages.length - 1}
                      onPickOption={(opt) => send(opt)}
                      onEdit={(newText, idx) => send(newText, { editFromIndex: idx })}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Input внизу — только когда есть переписка. На welcome он внутри центра экрана. */}
            {messages.length > 0 && (
            <div style={{ padding: "12px 24px 18px" }}>
              <div style={{ maxWidth: 760, margin: "0 auto" }}>
                <div style={{
                  background: color.white,
                  border: "1px solid rgba(38,38,51,0.12)",
                  borderRadius: 16,
                  padding: "12px 14px",
                  display: "flex", flexDirection: "column", gap: 10,
                }}>
                  {/* Row 1: input */}
                  <input
                    data-testid="chat-mary-input"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                    placeholder={isEmptyChat ? typewriterText : "Спросить у Mary"}
                    disabled={loading}
                    style={{
                      width: "100%", border: "none", outline: "none",
                      fontSize: 14, color: "#262633",
                      background: "transparent", fontFamily: "inherit",
                      padding: 0, minHeight: 22,
                    }}
                  />
                  {/* Row 2: actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      title="Добавить из базы знаний"
                      style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 28, height: 28,
                        background: "transparent",
                        border: "1px solid rgba(38,38,51,0.18)",
                        borderRadius: "50%",
                        color: "rgba(38,38,51,0.7)",
                        cursor: "pointer", fontFamily: "inherit",
                      }}>{ic.plus}</button>
                    <button
                      title="Прикрепить файл"
                      style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 28, height: 28,
                        background: "transparent", border: "none", borderRadius: 7,
                        color: "rgba(38,38,51,0.55)",
                        cursor: "pointer", fontFamily: "inherit",
                      }}>{ic.attach}</button>
                    <div style={{ flex: 1 }} />
                    <button title="Микрофон" style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 28, height: 28,
                      background: "transparent", border: "none", borderRadius: 7,
                      color: "rgba(38,38,51,0.55)",
                      cursor: "pointer", fontFamily: "inherit",
                    }}>{ic.mic}</button>
                    {loading ? (
                      <button
                        data-testid="chat-mary-stop"
                        onClick={stopStream}
                        title="Остановить"
                        style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          width: 30, height: 30,
                          background: "#262633",
                          border: "none", borderRadius: "50%",
                          color: color.white, cursor: "pointer", fontFamily: "inherit",
                          transition: transition.fast,
                        }}>
                        <svg width={11} height={11} viewBox="0 0 16 16" fill="currentColor">
                          <rect x="2" y="2" width="12" height="12" rx="1.5" />
                        </svg>
                      </button>
                    ) : (
                    <button
                      data-testid="chat-mary-send"
                      onClick={() => send()}
                      disabled={!text.trim()}
                      title="Отправить"
                      style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 30, height: 30,
                        background: text.trim() ? "#262633" : "rgba(38,38,51,0.35)",
                        border: "none", borderRadius: "50%",
                        color: color.white,
                        cursor: text.trim() ? "pointer" : "not-allowed",
                        fontFamily: "inherit",
                        transition: transition.fast,
                      }}>
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 19V5" />
                        <path d="M5 12l7-7 7 7" />
                      </svg>
                    </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            )}
          </>
        )}
      </div>

      {/* Activity panel: открывается кнопкой в углу */}
      {showActivity && (
        <ActivityPanel
          build={build}
          activity={activity}
          onClose={() => setShowActivity(false)}
        />
      )}
      {!showActivity && (
        <button
          onClick={() => setShowActivity(true)}
          title="Что делает Mary"
          style={{
            position: "absolute", right: 16, top: 14, zIndex: 5,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 32, height: 32,
            background: color.white,
            border: "1px solid rgba(38,38,51,0.1)",
            borderRadius: 8,
            cursor: "pointer", fontFamily: "inherit",
            color: "rgba(38,38,51,0.6)",
            boxShadow: "0 1px 3px rgba(38,38,51,0.05)",
          }}
        >
          {/* sidebar-right иконка */}
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M15 3v18" />
          </svg>
          {(activity.length > 0 || build) && (
            <span style={{
              position: "absolute", top: 4, right: 4,
              width: 6, height: 6, borderRadius: "50%",
              background: "#FF8B3D",
            }} />
          )}
        </button>
      )}
    </div>
  );
}

// ── Activity Panel: workflow + log ──────────────────────
function ActivityPanel({ build, activity, onClose }) {
  const [tab, setTab] = useState(build ? "build" : "log");
  // Если build впервые появляется во время работы — автоматически переключаемся на него.
  useEffect(() => { if (build && tab === "log" && activity.length <= 2) setTab("build"); }, [build]);
  return (
    <aside style={{
      width: 540, minWidth: 540,
      borderLeft: "1px solid rgba(38,38,51,0.06)",
      display: "flex", flexDirection: "column",
      background: color.white,
    }}>
      {/* Шапка: табы + close */}
      <div style={{
        display: "flex", alignItems: "center", gap: 4,
        padding: "10px 12px",
        borderBottom: "1px solid rgba(38,38,51,0.06)",
        background: color.white,
      }}>
        {build && (
          <button
            onClick={() => setTab("build")}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "5px 12px",
              background: tab === "build" ? "rgba(38,38,51,0.05)" : "transparent",
              border: "none", borderRadius: 8,
              fontSize: 12.5, color: "#262633", fontWeight: 500,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: 2, background: build.color || "#7A86FF" }} />
            Workflow: {build.name}
          </button>
        )}
        <button
          onClick={() => setTab("log")}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 12px",
            background: tab === "log" ? "rgba(38,38,51,0.05)" : "transparent",
            border: "none", borderRadius: 8,
            fontSize: 12.5, color: "#262633", fontWeight: 500,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Активность <span style={{ color: "rgba(38,38,51,0.4)", marginLeft: 4 }}>{activity.length}</span>
        </button>
        <div style={{ flex: 1 }} />
        <button onClick={onClose} title="Свернуть" style={{
          ...zoomBtn, color: "rgba(38,38,51,0.5)", padding: 6,
        }}>{ic.close}</button>
      </div>

      {tab === "build" && build ? (
        <BuildCanvas build={build} />
      ) : (
        <ActivityLog activity={activity} />
      )}

      {/* Footer */}
      <div style={{
        padding: "10px 14px",
        borderTop: "1px solid rgba(38,38,51,0.06)",
        background: color.white,
        fontSize: 11.5, color: "rgba(38,38,51,0.55)",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34C759" }} />
        <span>Mary онлайн</span>
      </div>
    </aside>
  );
}

function ActivityLog({ activity }) {
  if (activity.length === 0) {
    return (
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        color: "rgba(38,38,51,0.45)", fontSize: 13, padding: 20, textAlign: "center",
      }}>
        Здесь появится всё что Mary делает: вызовы агентов, чтения базы знаний, создание файлов.
      </div>
    );
  }
  const TOOL_LABEL = {
    get_research_insights: { label: "Свежий ресёрч от Ресерчера", icon: "🔍" },
    generate_ideas:        { label: "Идеи постов от Маркетолога", icon: "💡" },
    write_post:            { label: "Текст поста от Копирайтера",  icon: "✍️" },
    search_kb:             { label: "Поиск в базе знаний",         icon: "📚" },
    create_task:           { label: "Создание задачи",              icon: "📋" },
    publish_post:          { label: "Публикация в Telegram",        icon: "🚀" },
    kb_list:               { label: "Список файлов в БЗ",           icon: "📁" },
    kb_read:               { label: "Чтение файла из БЗ",           icon: "📄" },
    kb_write:              { label: "Сохранение файла в БЗ",        icon: "💾" },
    read_chat:             { label: "Чтение чата отдела",           icon: "💬" },
    list_departments:      { label: "Список отделов",               icon: "🏢" },
    create_department:     { label: "Создание отдела",              icon: "✨" },
    add_channel:           { label: "Добавление канала",            icon: "📡" },
    add_agent:             { label: "Добавление агента",            icon: "🤖" },
    set_department_integrations: { label: "Настройка интеграций",   icon: "🔌" },
  };
  const fmtTime = (ts) => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return `${diff}с назад`;
    if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
    return new Date(ts).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  };
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {activity.map((a, i) => {
          const t = TOOL_LABEL[a.name] || { label: a.name, icon: "⚙" };
          return (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "10px 12px",
              background: "rgba(38,38,51,0.025)",
              borderRadius: 10,
              animation: i === 0 ? "build-pop 0.4s ease" : "none",
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: 8,
                background: a.ok ? "rgba(52,199,89,0.14)" : "rgba(255,77,46,0.14)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, fontSize: 13,
              }}>{a.ok ? t.icon : "❌"}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: "#262633" }}>{t.label}</div>
                <div style={{ fontSize: 11, color: "rgba(38,38,51,0.55)", marginTop: 2, display: "flex", gap: 8 }}>
                  <span>{fmtTime(a.ts)}</span>
                  {a.durationMs != null && <span>· {a.durationMs < 1000 ? `${a.durationMs}ms` : `${Math.round(a.durationMs / 1000)}с`}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Live workflow builder — как полноценный граф отдела ──
function BuildCanvas({ build }) {
  const accent = build.color || "#7A86FF";

  // Layout: каналы слева → отдел центр → агенты справа (вертикально)
  const NODE_W = 200, NODE_H = 56, GAP_Y = 14, COL_GAP = 110;
  const channelsCount = build.channels.length;
  const agentsCount   = build.agents.length;
  const maxCount = Math.max(channelsCount, agentsCount, 1);
  const colHeight = maxCount * (NODE_H + GAP_Y) - GAP_Y;
  const canvasH = Math.max(colHeight, NODE_H) + 80;

  const COL_X = {
    channels: 30,
    dept:     30 + NODE_W + COL_GAP,
    agents:   30 + NODE_W + COL_GAP + NODE_W + COL_GAP,
  };
  const totalW = COL_X.agents + NODE_W + 30;

  // Y-позиции для каждой колонки (центрирование)
  const yFor = (count, idx) => {
    const colH = count * (NODE_H + GAP_Y) - GAP_Y;
    const offset = (canvasH - colH) / 2;
    return offset + idx * (NODE_H + GAP_Y);
  };
  const deptY = (canvasH - NODE_H) / 2;

  // Bezier между двумя точками
  const path = (x1, y1, x2, y2) => {
    const dx = Math.max(40, (x2 - x1) * 0.5);
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  };

  return (
    <div style={{
      flex: 1, position: "relative", overflow: "auto",
      background: color.white,
      backgroundImage: "radial-gradient(rgba(38,38,51,0.12) 1px, transparent 1px)",
      backgroundSize: "20px 20px",
      backgroundPosition: "10px 10px",
    }}>
        <div style={{ position: "relative", width: totalW, minHeight: canvasH, padding: "0 0" }}>
          {/* Заголовки колонок */}
          {channelsCount > 0 && (
            <div style={{
              position: "absolute", left: COL_X.channels, top: 12, width: NODE_W,
              fontSize: 10.5, color: "rgba(38,38,51,0.5)", fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "0.05em",
            }}>Каналы · {channelsCount}</div>
          )}
          {agentsCount > 0 && (
            <div style={{
              position: "absolute", left: COL_X.agents, top: 12, width: NODE_W,
              fontSize: 10.5, color: "rgba(38,38,51,0.5)", fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "0.05em",
            }}>Агенты · {agentsCount}</div>
          )}

          {/* SVG bezier-связи */}
          <svg width={totalW} height={canvasH} style={{
            position: "absolute", left: 0, top: 36, pointerEvents: "none", overflow: "visible",
          }}>
            {/* Каналы → Отдел */}
            {build.channels.map((_, i) => path && (
              <path key={`ch-${i}`}
                d={path(
                  COL_X.channels + NODE_W,
                  yFor(channelsCount, i) + NODE_H / 2,
                  COL_X.dept,
                  deptY + NODE_H / 2,
                )}
                stroke="rgba(38,38,51,0.18)" strokeWidth="1.4" fill="none"
              />
            ))}
            {/* Отдел → Агенты */}
            {build.agents.map((_, i) => (
              <path key={`ag-${i}`}
                d={path(
                  COL_X.dept + NODE_W,
                  deptY + NODE_H / 2,
                  COL_X.agents,
                  yFor(agentsCount, i) + NODE_H / 2,
                )}
                stroke="rgba(38,38,51,0.18)" strokeWidth="1.4" fill="none"
              />
            ))}
          </svg>

          {/* Каналы (слева) */}
          {build.channels.map((c, i) => (
            <BuildNode key={c.id || i}
              x={COL_X.channels} y={yFor(channelsCount, i) + 36}
              w={NODE_W} h={NODE_H}
              icon="ch" iconBg="#FFF4D1" iconColor="#FFB800"
              title={c.name} sub={c.type || "канал"}
              animate={i === channelsCount - 1}
            />
          ))}

          {/* Отдел (центр) */}
          <BuildNode
            x={COL_X.dept} y={deptY + 36}
            w={NODE_W} h={NODE_H}
            icon="dept" iconBg={accent + "26"} iconColor={accent}
            title={build.name} sub="отдел"
            isMain
          />

          {/* Агенты (справа) */}
          {build.agents.map((a, i) => (
            <BuildNode key={a.id || i}
              x={COL_X.agents} y={yFor(agentsCount, i) + 36}
              w={NODE_W} h={NODE_H}
              icon="agent" iconBg={(a.color || "#7A86FF") + "26"} iconColor={a.color || "#7A86FF"}
              title={a.role} sub={a.tasks || "AI-агент"}
              animate={i === agentsCount - 1}
            />
          ))}
        </div>

        {/* Интеграции — внизу как chip-плажки */}
        {build.integrations.length > 0 && (
          <div style={{
            position: "absolute", left: 0, right: 0, bottom: 0,
            padding: "12px 18px",
            background: "linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0.8))",
            borderTop: "1px solid rgba(38,38,51,0.06)",
            zIndex: 1,
          }}>
            <div style={{ fontSize: 10.5, color: "rgba(38,38,51,0.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
              Интеграции · {build.integrations.length}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {build.integrations.map((it, i) => (
                <span key={i} style={{
                  padding: "5px 12px",
                  background: "rgba(63,149,255,0.1)",
                  color: "#3F95FF",
                  fontSize: 12, fontWeight: 500,
                  borderRadius: 999,
                  animation: i === build.integrations.length - 1 ? "build-pop 0.4s ease" : "none",
                }}>{it}</span>
              ))}
            </div>
          </div>
        )}

      <style>{`
        @keyframes build-pop {
          0%   { opacity: 0; transform: scale(0.85); }
          70%  { transform: scale(1.04); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

function BuildNode({ x, y, w, h, icon, iconBg, iconColor, title, sub, animate, isMain }) {
  const ICONS = {
    agent: <svg width={16} height={16} viewBox="0 0 24 24"><rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor"/><rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor"/><circle cx="9.3" cy="13" r="1.4" fill="white"/><circle cx="14.7" cy="13" r="1.4" fill="white"/></svg>,
    dept:  <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8c0-1.5-.4-2.9-1.2-4.1-.5.4-1.2.6-1.9.6-1.7 0-3-1.3-3-3 0-.6.2-1.2.4-1.7C13.6 3.3 12.8 3 12 3z"/><circle cx="17" cy="6.5" r="2"/></svg>,
    ch:    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 L4 14 h7 v8 l9 -12 h-7 z"/></svg>,
  };
  return (
    <div style={{
      position: "absolute", left: x, top: y,
      width: w, height: h,
      background: color.white,
      borderRadius: 24,
      boxShadow: isMain
        ? `0 4px 16px ${iconColor}33`
        : "0 1px 2px rgba(38,38,51,0.04)",
      display: "flex", alignItems: "center", gap: 10,
      padding: "0 12px",
      animation: animate ? "build-pop 0.45s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 11,
        background: iconBg, color: iconColor,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>{ICONS[icon] || ICONS.agent}</div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 510, color: "#262633", lineHeight: 1.15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
        <div style={{ fontSize: 11, color: "rgba(38,38,51,0.5)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</div>
      </div>
      {/* Connector dots — точки на левом и правом крае как в основном графе */}
      <span style={{
        position: "absolute", left: -4, top: "50%", transform: "translateY(-50%)",
        width: 8, height: 8, borderRadius: "50%",
        background: color.white, border: "1px solid rgba(38,38,51,0.18)",
      }} />
      <span style={{
        position: "absolute", right: -4, top: "50%", transform: "translateY(-50%)",
        width: 8, height: 8, borderRadius: "50%",
        background: color.white, border: "1px solid rgba(38,38,51,0.18)",
      }} />
    </div>
  );
}

function ChatWelcome({ onSuggest, children }) {
  const quickActions = [
    { emoji: "🤖", label: "Автоматизировать отдел", prompt: "Помоги автоматизировать отдел" },
    { emoji: "✅", label: "Поставить задачу",       prompt: "Помоги поставить задачу" },
    { emoji: "📄", label: "Найти документ",         prompt: "Найди документ в базе знаний" },
    { emoji: "📊", label: "Метрики и отчёты",       prompt: "Покажи метрики за последнюю неделю" },
    { emoji: "💡", label: "Идеи постов",            prompt: "Предложи идеи постов на основе свежего ресёрча" },
    { emoji: "🔌", label: "Подключить интеграцию",  prompt: "Помоги подключить новую интеграцию" },
  ];
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 22,
      width: "100%", maxWidth: 760, margin: "0 auto",
      padding: "20px 24px",
    }}>
      {/* Чипы быстрых действий */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 8,
        justifyContent: "center",
      }}>
        {quickActions.map((a, i) => (
          <button
            key={i}
            onClick={() => onSuggest(a.prompt)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "8px 14px",
              background: color.white,
              border: "1px solid rgba(38,38,51,0.12)",
              borderRadius: 999,
              fontSize: 13, fontWeight: 400, color: "#262633",
              cursor: "pointer", fontFamily: "inherit", transition: transition.fast,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(38,38,51,0.04)";
              e.currentTarget.style.borderColor = "rgba(38,38,51,0.22)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = color.white;
              e.currentTarget.style.borderColor = "rgba(38,38,51,0.12)";
            }}
          >
            <span style={{ fontSize: 14 }}>{a.emoji}</span>
            <span>{a.label}</span>
          </button>
        ))}
      </div>
      {/* Большой заголовок */}
      <div style={{
        textAlign: "center",
        fontSize: 32, fontWeight: 600, color: "#262633",
        letterSpacing: "-0.02em",
      }}>
        Что сделаем, Виктория?
      </div>
      {/* Input-блок прямо под заголовком */}
      {children && (
        <div style={{ width: "100%", maxWidth: 640 }}>
          {children}
        </div>
      )}
    </div>
  );
}

// Переиспользуемая обёртка inline-input'а Mary (двухстрочная: text + actions row).
function MaryInputBox({ text, setText, send, loading, onStop, placeholder }) {
  return (
    <div style={{
      background: color.white,
      border: "1px solid rgba(38,38,51,0.12)",
      borderRadius: 16,
      padding: "12px 14px",
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      <input
        data-testid="chat-mary-input"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
        placeholder={placeholder}
        disabled={loading}
        style={{
          width: "100%", border: "none", outline: "none",
          fontSize: 14, color: "#262633",
          background: "transparent", fontFamily: "inherit",
          padding: 0, minHeight: 22,
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button title="Добавить из базы знаний" style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 28, height: 28, background: "transparent",
          border: "1px solid rgba(38,38,51,0.18)", borderRadius: "50%",
          color: "rgba(38,38,51,0.7)", cursor: "pointer", fontFamily: "inherit",
        }}>{ic.plus}</button>
        <button title="Прикрепить файл" style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 28, height: 28, background: "transparent", border: "none", borderRadius: 7,
          color: "rgba(38,38,51,0.55)", cursor: "pointer", fontFamily: "inherit",
        }}>{ic.attach}</button>
        <div style={{ flex: 1 }} />
        <button title="Микрофон" style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 28, height: 28, background: "transparent", border: "none", borderRadius: 7,
          color: "rgba(38,38,51,0.55)", cursor: "pointer", fontFamily: "inherit",
        }}>{ic.mic}</button>
        {loading && onStop ? (
          <button
            data-testid="chat-mary-stop"
            onClick={onStop}
            title="Остановить"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 30, height: 30,
              background: "#262633", border: "none", borderRadius: "50%",
              color: color.white, cursor: "pointer",
              fontFamily: "inherit", transition: transition.fast,
            }}>
            <svg width={11} height={11} viewBox="0 0 16 16" fill="currentColor">
              <rect x="2" y="2" width="12" height="12" rx="1.5" />
            </svg>
          </button>
        ) : (
        <button
          data-testid="chat-mary-send"
          onClick={() => send()}
          disabled={!text.trim() || loading}
          title="Отправить"
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 30, height: 30,
            background: text.trim() && !loading ? "#262633" : "rgba(38,38,51,0.35)",
            border: "none", borderRadius: "50%",
            color: color.white,
            cursor: text.trim() && !loading ? "pointer" : "not-allowed",
            fontFamily: "inherit", transition: transition.fast,
          }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5" />
            <path d="M5 12l7-7 7 7" />
          </svg>
        </button>
        )}
      </div>
    </div>
  );
}

// Hook: typewriter-плейсхолдер для input — циклически печатает/стирает фразы.
function useTypewriterPlaceholder(phrases, enabled) {
  const [text, setText] = useState(phrases[0] || "");
  useEffect(() => {
    if (!enabled) return;
    let phraseIdx = 0;
    let charIdx = phrases[0]?.length || 0;
    let phase = "pause-full"; // pause-full → erasing → pause-empty → typing → pause-full
    let timer;
    const tick = () => {
      const cur = phrases[phraseIdx];
      if (phase === "pause-full") {
        phase = "erasing";
        timer = setTimeout(tick, 1800);
      } else if (phase === "erasing") {
        charIdx = Math.max(0, charIdx - 2);
        setText(cur.slice(0, charIdx));
        if (charIdx === 0) {
          phase = "pause-empty";
          timer = setTimeout(tick, 280);
        } else {
          timer = setTimeout(tick, 25);
        }
      } else if (phase === "pause-empty") {
        phraseIdx = (phraseIdx + 1) % phrases.length;
        charIdx = 0;
        phase = "typing";
        timer = setTimeout(tick, 80);
      } else if (phase === "typing") {
        const next = phrases[phraseIdx];
        charIdx = Math.min(next.length, charIdx + 1);
        setText(next.slice(0, charIdx));
        if (charIdx === next.length) {
          phase = "pause-full";
          timer = setTimeout(tick, 2200);
        } else {
          timer = setTimeout(tick, 45 + Math.random() * 35);
        }
      }
    };
    timer = setTimeout(tick, 1200);
    return () => clearTimeout(timer);
  }, [enabled, phrases]);
  return text;
}

// Inline markdown: **bold** *italic* `code` [text](url). React-элементы, без dangerouslySetInnerHTML.
function renderInline(text) {
  if (!text) return text;
  // Один токенайзер: **bold** | *italic* | `code` | [text](url)
  const re = /(\*\*[^*]+\*\*)|(\*[^*\n]+\*)|(`[^`\n]+`)|(\[[^\]]+\]\([^)\s]+\))/g;
  const out = [];
  let last = 0, m, key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (m[1]) out.push(<strong key={key++} style={{ fontWeight: 600 }}>{tok.slice(2, -2)}</strong>);
    else if (m[2]) out.push(<em key={key++}>{tok.slice(1, -1)}</em>);
    else if (m[3]) out.push(<code key={key++} style={{
      fontFamily: "ui-monospace, SF Mono, monospace", fontSize: 12.5,
      background: "rgba(38,38,51,0.06)", padding: "1px 6px", borderRadius: 4,
    }}>{tok.slice(1, -1)}</code>);
    else if (m[4]) {
      const linkMatch = tok.match(/\[([^\]]+)\]\(([^)\s]+)\)/);
      out.push(<a key={key++} href={linkMatch[2]} target="_blank" rel="noopener noreferrer"
        style={{ color: "#3F95FF", textDecoration: "underline" }}>{linkMatch[1]}</a>);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out.map((p, i) => typeof p === "string" ? <span key={"s"+i}>{p}</span> : p);
}

// Блочный markdown: # / ## / ### заголовки, - / * / 1. списки, > цитаты, ``` блоки кода, --- разделители.
function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Заголовки
    const h = line.match(/^(#{1,3})\s+(.+)$/);
    if (h) {
      const level = h[1].length;
      const sizes = { 1: 22, 2: 18, 3: 16 };
      blocks.push(<div key={blocks.length} style={{
        fontSize: sizes[level], fontWeight: 600,
        marginTop: blocks.length === 0 ? 0 : 14, marginBottom: 6,
      }}>{renderInline(h[2])}</div>);
      i++; continue;
    }
    // Цитата
    if (line.startsWith("> ")) {
      const quoteLines = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      blocks.push(<blockquote key={blocks.length} style={{
        margin: "8px 0", paddingLeft: 12,
        borderLeft: "3px solid rgba(38,38,51,0.18)",
        color: "rgba(38,38,51,0.7)",
      }}>{renderInline(quoteLines.join("\n"))}</blockquote>);
      continue;
    }
    // Разделитель
    if (/^---+$/.test(line.trim())) {
      blocks.push(<hr key={blocks.length} style={{
        border: "none", borderTop: "1px solid rgba(38,38,51,0.1)", margin: "10px 0",
      }} />);
      i++; continue;
    }
    // Кодовый блок
    if (line.startsWith("```")) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push(<pre key={blocks.length} style={{
        background: "rgba(38,38,51,0.05)", padding: "10px 12px", borderRadius: 8,
        fontFamily: "ui-monospace, SF Mono, monospace", fontSize: 12.5,
        overflowX: "auto", margin: "8px 0",
      }}>{codeLines.join("\n")}</pre>);
      continue;
    }
    // Маркированный список (- / *)
    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push(<ul key={blocks.length} style={{
        margin: "6px 0", paddingLeft: 22,
      }}>{items.map((it, k) => <li key={k} style={{ marginBottom: 2 }}>{renderInline(it)}</li>)}</ul>);
      continue;
    }
    // Нумерованный список (1. 2. ...) — но НЕ хвост (он уже отдельно рендерится как опции)
    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push(<ol key={blocks.length} style={{
        margin: "6px 0", paddingLeft: 22,
      }}>{items.map((it, k) => <li key={k} style={{ marginBottom: 2 }}>{renderInline(it)}</li>)}</ol>);
      continue;
    }
    // Пустая строка → паузу
    if (line.trim() === "") { i++; continue; }
    // Обычный параграф (подряд непустые строки до пустой / спец-блока)
    const para = [];
    while (i < lines.length && lines[i].trim() !== ""
           && !/^(#|>|---|```|[-*]\s|\d+\.\s)/.test(lines[i])) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(<p key={blocks.length} style={{ margin: "4px 0" }}>{renderInline(para.join(" "))}</p>);
  }
  return blocks;
}

// Извлекает хвост из ≥2 пронумерованных строк (1. ... 2. ...) в конце текста.
// Возвращает { body: текст до списка, options: [строки опций без префикса] | null }.
function parseNumberedOptions(text) {
  if (!text) return { body: text, options: null };
  const lines = text.split("\n");
  const opts = [];
  let i = lines.length - 1;
  // схлопываем хвостовые пустые строки
  while (i >= 0 && lines[i].trim() === "") i--;
  // собираем подряд идущие "N. ..." с конца
  const collected = [];
  while (i >= 0) {
    const m = lines[i].match(/^\s*\d+\.\s+(.+?)\s*$/);
    if (!m) break;
    collected.unshift(m[1].replace(/\*\*/g, ""));
    i--;
  }
  if (collected.length < 2) return { body: text, options: null };
  // тело — всё до первой опции, обрезаем хвостовые пустые строки
  const bodyLines = lines.slice(0, i + 1);
  while (bodyLines.length && bodyLines[bodyLines.length - 1].trim() === "") bodyLines.pop();
  return { body: bodyLines.join("\n"), options: collected };
}

function ChatBubble({ m, isLast, onPickOption, index, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  if (m.role === "user") {
    if (editing) {
      return (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
          <div style={{
            background: color.white,
            border: "1px solid rgba(38,38,51,0.18)", borderRadius: 14,
            padding: 10, width: "min(80%, 520px)",
            display: "flex", flexDirection: "column", gap: 8,
          }}>
            <textarea
              autoFocus
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey && draft.trim()) {
                  e.preventDefault();
                  setEditing(false);
                  onEdit?.(draft.trim(), index);
                }
                if (e.key === "Escape") setEditing(false);
              }}
              rows={Math.max(2, draft.split("\n").length)}
              style={{
                width: "100%", border: "none", outline: "none",
                resize: "none", fontFamily: "inherit",
                fontSize: 14, color: "#262633",
                background: "transparent", padding: 0,
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
              <button
                onClick={() => setEditing(false)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(38,38,51,0.18)", borderRadius: 8,
                  padding: "5px 12px", fontSize: 12.5, color: "#262633",
                  fontFamily: "inherit", cursor: "pointer",
                }}
              >Отмена</button>
              <button
                disabled={!draft.trim()}
                onClick={() => { setEditing(false); onEdit?.(draft.trim(), index); }}
                style={{
                  background: draft.trim() ? "#262633" : "rgba(38,38,51,0.3)",
                  border: "none", borderRadius: 8,
                  padding: "5px 12px", fontSize: 12.5, color: color.white,
                  fontFamily: "inherit", cursor: draft.trim() ? "pointer" : "not-allowed",
                }}
              >Отправить</button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18, gap: 6, alignItems: "flex-start" }}
           className="user-bubble-row">
        {onEdit && index !== undefined && (
          <button
            onClick={() => { setDraft(m.text); setEditing(true); }}
            title="Изменить и отправить заново"
            style={{
              opacity: 0, transition: "opacity 0.15s",
              background: "transparent", border: "none",
              color: "rgba(38,38,51,0.4)", cursor: "pointer",
              padding: 6, marginTop: 2, fontFamily: "inherit",
              display: "inline-flex",
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = 1; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = 0; }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
        )}
        <div
          style={{
            background: "rgba(38,38,51,0.06)", color: "#262633",
            padding: "10px 14px", borderRadius: 16,
            maxWidth: "80%", fontSize: 14, lineHeight: 1.45, whiteSpace: "pre-wrap",
          }}
          onMouseEnter={e => {
            const btn = e.currentTarget.parentElement.querySelector("button");
            if (btn) btn.style.opacity = 0.6;
          }}
          onMouseLeave={e => {
            const btn = e.currentTarget.parentElement.querySelector("button");
            if (btn) btn.style.opacity = 0;
          }}
        >{m.text}</div>
      </div>
    );
  }
  // Парсим опции только для законченного последнего сообщения Mary
  const showOptions = isLast && !m._streaming && !m._toolStatus && onPickOption;
  const { body, options } = showOptions ? parseNumberedOptions(m.text) : { body: m.text, options: null };
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 22 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 7,
        background: "rgba(38,38,51,0.08)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, color: "#262633",
      }}>
        <svg width={14} height={14} viewBox="0 0 24 24">
          <rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor" />
          <rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor" />
          <circle cx="9.3" cy="13" r="1.4" fill="white" />
          <circle cx="14.7" cy="13" r="1.4" fill="white" />
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0, maxWidth: 640, paddingTop: 4 }}>
        {m._tools && m._tools.length > 0 && (
          <ToolsTrail tools={m._tools} />
        )}
        <div style={{
          fontSize: 14, color: "#262633", lineHeight: 1.55,
          marginTop: (m._tools && m._tools.length > 0) ? 10 : 0,
        }}>
          {renderMarkdown(body)}
          {m._streaming && m.text && (
            <span style={{
              display: "inline-block", width: 7, height: 14,
              background: "#262633", marginLeft: 2, verticalAlign: "text-bottom",
              animation: "maryblink 1s steps(2) infinite",
            }} />
          )}
        </div>
        {options && options.length >= 2 && (
          <div style={{
            marginTop: 14,
            borderTop: "1px solid rgba(38,38,51,0.08)",
            borderBottom: "1px solid rgba(38,38,51,0.08)",
          }}>
            {options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => onPickOption(opt)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  width: "100%",
                  padding: "10px 4px",
                  background: "transparent",
                  border: "none",
                  borderTop: idx > 0 ? "1px solid rgba(38,38,51,0.08)" : "none",
                  fontSize: 13, fontWeight: 400, color: "#262633",
                  lineHeight: 1.3,
                  textAlign: "left", fontFamily: "inherit",
                  cursor: "pointer", transition: transition.fast,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(38,38,51,0.03)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ flex: 1 }}>{opt}</span>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                     stroke="rgba(38,38,51,0.45)" strokeWidth={1.6}
                     strokeLinecap="round" strokeLinejoin="round"
                     style={{ transform: "scale(0.85)", flexShrink: 0 }}>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            ))}
          </div>
        )}
        {m._streaming && !m.text && !m._toolStatus && (
          <div style={{ display: "inline-flex", gap: 4, padding: "8px 0" }}>
            {[0,1,2].map(i => (
              <span key={i} style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "rgba(38,38,51,0.4)",
                animation: `marypulse 1.4s ease-in-out infinite ${i*0.2}s`,
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Общий wrapper для простых страниц ───────────────────
function PageShell({ title, sub, children, action }) {
  return (
    <div style={{ flex: 1, padding: "32px 40px", overflow: "auto", background: color.white }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 28 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 24, fontWeight: 600, color: "#262633" }}>{title}</div>
            {sub && <div style={{ fontSize: 13, color: "rgba(38,38,51,0.55)", marginTop: 4 }}>{sub}</div>}
          </div>
          {action}
        </div>
        {children}
      </div>
    </div>
  );
}

function StatCard({ label, value, hint, color: tintColor = "#262633" }) {
  return (
    <div style={{
      background: "rgba(38,38,51,0.025)", borderRadius: 14,
      padding: "18px 20px",
    }}>
      <div style={{ fontSize: 11, color: "rgba(38,38,51,0.5)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 600, color: tintColor, marginTop: 8 }}>{value}</div>
      {hint && <div style={{ fontSize: 12, color: "rgba(38,38,51,0.55)", marginTop: 6 }}>{hint}</div>}
    </div>
  );
}

function NavCard({ icon, title, sub, onClick, accent = "#262633" }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "16px 18px",
        background: h ? "rgba(38,38,51,0.04)" : "rgba(38,38,51,0.025)",
        border: "none", borderRadius: 12,
        cursor: "pointer", fontFamily: "inherit", textAlign: "left",
        width: "100%", transition: transition.fast,
      }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: accent + "1A", color: accent,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 510, color: "#262633" }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>{sub}</div>}
      </div>
      <span style={{ display: "flex", color: "rgba(38,38,51,0.4)" }}>{ic.arrowRight}</span>
    </button>
  );
}

// ── Главная (Dashboard) ─────────────────────────────────
function HomePage({ onNavigate }) {
  const [stats, setStats] = useState({ posts: 249, conversations: 0, tasks: 21 });
  useEffect(() => {
    fetch("/api/mary/health").then(r => r.json()).then(d => setStats(s => ({ ...s, posts: d.posts || 0 }))).catch(() => {});
    fetch("/api/mary/conversations").then(r => r.json()).then(d => setStats(s => ({ ...s, conversations: d.conversations?.length || 0 }))).catch(() => {});
  }, []);
  return (
    <PageShell title="Привет, Виктория 👋" sub="Что сегодня делаем?">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 32 }}>
        <StatCard label="Постов в БЗ" value={stats.posts} hint="спарсено из 38 каналов" />
        <StatCard label="Чатов с Mary" value={stats.conversations} hint="общие + отделов" />
        <StatCard label="Активных задач" value={stats.tasks} hint="6 крон + 15 в работе" color="#34C759" />
        <StatCard label="Агенты онлайн" value="5/5" hint="отдел СММ" color="#3F95FF" />
      </div>

      <div style={{ fontSize: 12, color: "rgba(38,38,51,0.5)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>
        Куда зайти
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10, marginBottom: 32 }}>
        <NavCard icon={ic.chat}    title="Чат Mary"     sub="общий ассистент по всей платформе" accent="#262633" onClick={() => onNavigate("chat-mary")} />
        <NavCard icon={ic.dept}    title="СММ-отдел"     sub="граф из 5 AI-агентов · Тг-канал" accent="#FF8B3D" onClick={() => onNavigate("tg-kanal")} />
        <NavCard icon={ic.kb}      title="База знаний"  sub="файлы, посты, спарсенные каналы"   accent="#7A86FF" onClick={() => onNavigate("kb")} />
        <NavCard icon={ic.tasks}   title="Задачи"       sub="что в работе и на апруве"          accent="#34C759" onClick={() => onNavigate("tasks")} />
        <NavCard icon={ic.integrations} title="Интеграции" sub="Telegram, Figma, Google Sheets" accent="#3F95FF" onClick={() => onNavigate("integrations")} />
        <NavCard icon={ic.people}  title="Команда"      sub="люди и AI-агенты"                  accent="#FF6FB3" onClick={() => onNavigate("team")} />
      </div>
    </PageShell>
  );
}

// ── Входящие ────────────────────────────────────────────
function InboxPage({ onNavigate }) {
  const inbox = [
    { kind: "approval", title: "Маркетолог: 3 идеи постов на неделю", from: "Маркетолог", agent: true, color: "#FF8B3D", time: "5 мин назад", action: "tg-kanal" },
    { kind: "ready",    title: "Копирайтер написал текст «Чек-лист SMM»", from: "Копирайтер", agent: true, color: "#7A86FF", time: "20 мин назад", action: "tg-kanal" },
    { kind: "ready",    title: "Дизайнер сгенерил 3 обложки", from: "Дизайнер", agent: true, color: "#7A86FF", time: "30 мин назад", action: "tg-kanal" },
    { kind: "report",   title: "Аналитик: отчёт по постам за неделю", from: "Аналитик", agent: true, color: "#FF6FB3", time: "сегодня в 09:00", action: "tg-kanal" },
    { kind: "task",     title: "Александр Орлов прислал коммент к идее #2", from: "Александр Орлов", agent: false, color: "#FF8B3D", time: "вчера", action: "tg-kanal" },
  ];
  const KIND = {
    approval: { label: "На апрув", color: "#FF8B3D" },
    ready:    { label: "Готово",   color: "#34C759" },
    report:   { label: "Отчёт",    color: "#7A86FF" },
    task:     { label: "Сообщение", color: "#3F95FF" },
  };
  return (
    <PageShell title="Входящие" sub={`${inbox.length} элементов требуют твоего внимания`}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {inbox.map((it, i) => (
          <button key={i} onClick={() => onNavigate(it.action)} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "14px 18px",
            background: "rgba(38,38,51,0.025)",
            border: "none", borderRadius: 12,
            cursor: "pointer", fontFamily: "inherit", textAlign: "left",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(38,38,51,0.04)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(38,38,51,0.025)"}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: it.color + "26", color: it.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, fontSize: 13, fontWeight: 600,
            }}>{it.from.split(" ").map(w => w[0]).join("").slice(0, 2)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: "#262633" }}>{it.title}</div>
              <div style={{ fontSize: 12, color: "rgba(38,38,51,0.55)", marginTop: 3, display: "flex", gap: 8, alignItems: "center" }}>
                <span>{it.from}</span>
                <span>·</span>
                <span>{it.time}</span>
              </div>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 500,
              padding: "4px 10px", borderRadius: 999,
              background: KIND[it.kind].color + "1A",
              color: KIND[it.kind].color,
              flexShrink: 0,
            }}>{KIND[it.kind].label}</span>
            <span style={{ display: "flex", color: "rgba(38,38,51,0.4)" }}>{ic.arrowRight}</span>
          </button>
        ))}
      </div>
    </PageShell>
  );
}

// ── Команда (люди + агенты) ─────────────────────────────
function TeamPage() {
  return (
    <PageShell title="Команда" sub="Все сотрудники и AI-агенты в одном месте">
      <div style={{ fontSize: 12, color: "rgba(38,38,51,0.5)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>
        Сотрудники · {MOCK_PEOPLE.length}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 8, marginBottom: 32 }}>
        {MOCK_PEOPLE.map(p => (
          <div key={p.id} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "14px 16px",
            background: "rgba(38,38,51,0.025)", borderRadius: 12,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: p.color, color: color.white,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 600, flexShrink: 0,
            }}>{p.name.split(" ").map(w => w[0]).join("").slice(0, 2)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: "#262633" }}>
                {p.name} {p.isMe && <span style={{ fontSize: 11, color: "rgba(38,38,51,0.5)" }}>(ты)</span>}
              </div>
              <div style={{ fontSize: 12, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>
                {p.title} · {p.lastActive}
              </div>
            </div>
            {p.role === "approver" && (
              <span style={{
                fontSize: 10, fontWeight: 500, padding: "3px 8px", borderRadius: 999,
                background: "rgba(255,139,61,0.14)", color: "#FF8B3D",
              }}>Апрувер</span>
            )}
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, color: "rgba(38,38,51,0.5)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>
        AI-агенты · {AGENTS.length}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 8 }}>
        {AGENTS.map(a => (
          <div key={a.id} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "14px 16px",
            background: "rgba(38,38,51,0.025)", borderRadius: 12,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: a.color + "26", color: a.color,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>{ic.agentBot}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: "#262633" }}>{a.label}</div>
              <div style={{ fontSize: 12, color: "rgba(38,38,51,0.55)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {a.role}
              </div>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 500, padding: "3px 8px", borderRadius: 999,
              background: "rgba(52,199,89,0.14)", color: "#34C759",
            }}>online</span>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

// ── Бизнес-процесс ──────────────────────────────────────
function BizprocPage({ onNavigate }) {
  const flows = [
    { id: "smm-content", name: "Контент в Telegram-канал", dept: "СММ", status: "active",  steps: 5, channel: "tg-kanal" },
    { id: "smm-inst",    name: "Контент в Instagram",       dept: "СММ", status: "draft",   steps: 0, channel: null },
    { id: "hr-hire",     name: "Подбор и онбординг",        dept: "HR",  status: "draft",   steps: 0, channel: null },
    { id: "fin-report",  name: "Финансовый отчёт",          dept: "Финансы", status: "draft", steps: 0, channel: null },
  ];
  return (
    <PageShell title="Бизнес-процессы" sub="Workflows которые работают параллельно через AI-агенты"
      action={
        <button style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "8px 16px",
          background: "#262633", color: color.white,
          border: "none", borderRadius: 999,
          fontSize: 13, fontWeight: 500,
          cursor: "pointer", fontFamily: "inherit",
        }}>+ Новый процесс</button>
      }>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {flows.map(f => {
          const isActive = f.status === "active";
          return (
            <div key={f.id} onClick={() => f.channel && onNavigate("tg-kanal")} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "16px 18px",
              background: "rgba(38,38,51,0.025)", borderRadius: 12,
              cursor: f.channel ? "pointer" : "default",
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: isActive ? "rgba(52,199,89,0.14)" : "rgba(38,38,51,0.06)",
                color: isActive ? "#34C759" : "rgba(38,38,51,0.45)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>{ic.bizproc}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 510, color: "#262633" }}>{f.name}</div>
                <div style={{ fontSize: 12, color: "rgba(38,38,51,0.55)", marginTop: 3 }}>
                  {f.dept} · {f.steps > 0 ? `${f.steps} агентов` : "не настроен"}
                </div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 500, padding: "4px 10px", borderRadius: 999,
                background: isActive ? "rgba(52,199,89,0.14)" : "rgba(38,38,51,0.08)",
                color: isActive ? "#34C759" : "rgba(38,38,51,0.5)",
              }}>{isActive ? "Активен" : "Черновик"}</span>
              {f.channel && <span style={{ display: "flex", color: "rgba(38,38,51,0.4)" }}>{ic.arrowRight}</span>}
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}

// ── Настройки ───────────────────────────────────────────
function SettingsPage() {
  const [health, setHealth] = useState(null);
  useEffect(() => {
    fetch("/api/mary/health").then(r => r.json()).then(setHealth).catch(() => {});
  }, []);
  return (
    <PageShell title="Настройки" sub="Профиль, токены, доступы">
      <div style={{ fontSize: 12, color: "rgba(38,38,51,0.5)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>
        Профиль
      </div>
      <div style={{ background: "rgba(38,38,51,0.025)", borderRadius: 12, padding: 18, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#8A38F5", color: color.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 600 }}>ВА</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: "#262633" }}>Виктория Ахрамович</div>
            <div style={{ fontSize: 12.5, color: "rgba(38,38,51,0.55)" }}>Head of SMM · vikahramovich02@gmail.com</div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 12, color: "rgba(38,38,51,0.5)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>
        Backend
      </div>
      <div style={{ background: "rgba(38,38,51,0.025)", borderRadius: 12, padding: "14px 18px", marginBottom: 24, fontSize: 13, color: "#262633", fontFamily: "ui-monospace, SF Mono, monospace" }}>
        <div>URL: 77.237.241.242:5678</div>
        <div style={{ marginTop: 4 }}>LLM: {health?.llmModel || "..."}</div>
        <div style={{ marginTop: 4 }}>Telegram bot: {health?.telegram?.botConnected ? "✓ подключён" : "✗"} · {health?.telegram?.allowlistSize || 0} получателей</div>
        <div style={{ marginTop: 4 }}>Posts in KB: {health?.posts || "..."}</div>
        <div style={{ marginTop: 4 }}>Uptime: {health ? `${Math.round(health.uptime / 60)} мин` : "..."}</div>
      </div>

      <div style={{ fontSize: 12, color: "rgba(38,38,51,0.5)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>
        Telegram-уведомления (allowlist)
      </div>
      <div style={{ background: "rgba(38,38,51,0.025)", borderRadius: 12, padding: 18, fontSize: 13, color: "rgba(38,38,51,0.7)" }}>
        Чтобы добавить нового получателя — он пишет любое сообщение боту <a href="https://t.me/botikkkklkkk_bot" target="_blank" rel="noreferrer" style={{ color: "#3F95FF" }}>@botikkkklkkk_bot</a>, потом chat_id добавляется в .env.
      </div>
    </PageShell>
  );
}

function HelpPage() {
  return (
    <PageShell title="Помощь" sub="Гайды и FAQ">
      <div style={{ background: "rgba(38,38,51,0.025)", borderRadius: 12, padding: 24, fontSize: 14, color: "rgba(38,38,51,0.7)", lineHeight: 1.6 }}>
        Раздел в разработке. Если что-то не работает — спроси Mary в общем чате.
      </div>
    </PageShell>
  );
}

// ── Generic-страница для динамического канала отдела (созданного Mary) ──
function DepartmentChannelPage({ deptId, channelPage, onNavigate }) {
  const [dept, setDept] = useState(null);
  useEffect(() => {
    fetch("/api/mary/departments")
      .then(r => r.json())
      .then(d => {
        const found = (d.departments || []).find(x => x.id === deptId);
        setDept(found || null);
      })
      .catch(() => {});
  }, [deptId]);
  if (!dept) {
    return <PageShell title="Загрузка..." sub="">{null}</PageShell>;
  }
  const channel = (dept.channels || []).find(c => c.page === channelPage);
  return (
    <PageShell
      title={`${channel?.name || "Канал"}`}
      sub={`${dept.name} · ${dept.description || ""}`}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12, marginBottom: 28 }}>
        <StatCard label="Каналов" value={dept.channels?.length || 0} hint="в этом отделе" />
        <StatCard label="Агентов" value={dept.agents?.length || 0} hint="разворачивает Mary" color={dept.color} />
        <StatCard label="Интеграций" value={dept.integrations?.length || 0} hint="подключено" />
        <StatCard label="Статус" value={dept.status === "configured" ? "Настроен" : "Черновик"} hint={dept.status === "active" ? "активен" : "ждёт первой задачи"} color={dept.status === "active" ? "#34C759" : "#FF8B3D"} />
      </div>
      {(dept.agents?.length || 0) > 0 && (
        <>
          <div style={{ fontSize: 12, color: "rgba(38,38,51,0.5)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>Агенты</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 8, marginBottom: 28 }}>
            {dept.agents.map(a => (
              <div key={a.id} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 16px",
                background: "rgba(38,38,51,0.025)", borderRadius: 12,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: (a.color || "#7A86FF") + "26", color: a.color || "#7A86FF",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>{ic.agentBot}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: "#262633" }}>{a.role}</div>
                  <div style={{ fontSize: 12, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>{a.tasks || "—"}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {(dept.integrations?.length || 0) > 0 && (
        <>
          <div style={{ fontSize: 12, color: "rgba(38,38,51,0.5)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>Интеграции</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
            {dept.integrations.map((it, i) => (
              <span key={i} style={{
                padding: "6px 14px",
                background: "rgba(63,149,255,0.1)",
                color: "#3F95FF",
                fontSize: 13, fontWeight: 500,
                borderRadius: 999,
              }}>{it}</span>
            ))}
          </div>
        </>
      )}
      {dept.status !== "configured" && (
        <div style={{
          background: "rgba(255,139,61,0.08)", color: "#9B5A1F",
          borderRadius: 12, padding: "16px 20px", fontSize: 13.5, lineHeight: 1.5,
          marginBottom: 20,
        }}>
          ⚙ Отдел в стадии разворачивания. Зайди в <button onClick={() => onNavigate("chat-mary")} style={{ background: "transparent", border: "none", color: "#3F95FF", cursor: "pointer", fontSize: 13.5, padding: 0, fontFamily: "inherit", textDecoration: "underline" }}>чат Mary</button> и продолжи диалог.
        </div>
      )}
    </PageShell>
  );
}

function SupportPage() {
  return (
    <PageShell title="Поддержка" sub="Связаться с командой Mary">
      <div style={{ background: "rgba(38,38,51,0.025)", borderRadius: 12, padding: 24, fontSize: 14, color: "rgba(38,38,51,0.7)", lineHeight: 1.6 }}>
        Напиши на support@mary.app или в Telegram <a href="https://t.me/viksaaaaaa_a" target="_blank" rel="noreferrer" style={{ color: "#3F95FF" }}>@viksaaaaaa_a</a>.
      </div>
    </PageShell>
  );
}

// ── Корневой компонент ──────────────────────────────────────
export default function TgKanalPage() {
  const [smmOpen, setSmmOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("page") || "tg-kanal"
  ); // "tg-kanal" | "kb" | "integrations" | "tasks" | "chat-mary" | "home" | "inbox" | "team" | "bizproc" | "settings"
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [openDepts, setOpenDepts] = useState({ smm: true });
  // Подгружаем список отделов с бэка (Mary через create_department их добавляет)
  useEffect(() => {
    const load = () => fetch("/api/mary/departments")
      .then(r => r.ok ? r.json() : { departments: [] })
      .then(d => setDepartments(d.departments || []))
      .catch(() => {});
    load();
    const id = setInterval(load, 5000); // авто-апдейт когда Mary создаёт новый
    return () => clearInterval(id);
  }, []);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMode, setChatMode] = useState("docked"); // "docked" | "floating" | "side" | "mini"
  const [dockedHeight, setDockedHeight] = useState(420);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeRail, setActiveRail] = useState(null);
  const [agentsSelected, setAgentsSelected] = useState(null);
  const [approvals, setApprovals] = useState({ marketerIdeas: false });
  const [kbUserItems, setKbUserItems] = useState(() => {
    try {
      const raw = localStorage.getItem("mary_kb_user_items");
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  });
  useEffect(() => {
    try {
      // Сохраняем в localStorage только метаданные + dataURL для маленьких файлов (<2MB)
      const lite = kbUserItems.map(it => {
        if (it.data && it.data.length > 2_000_000) {
          const { data, ...rest } = it;
          return rest;
        }
        return it;
      });
      localStorage.setItem("mary_kb_user_items", JSON.stringify(lite));
    } catch (e) {
      // QuotaExceededError — сохраняем без data
      try {
        const stripped = kbUserItems.map(({ data, ...rest }) => rest);
        localStorage.setItem("mary_kb_user_items", JSON.stringify(stripped));
      } catch (e2) {}
    }
  }, [kbUserItems]);

  function handleAgentClick(agentId) {
    setChatOpen(true);
    setActiveFilter(agentId);
  }
  function nowTime() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  function startTaskCreation() {
    setActiveRail(null);
    setChatOpen(true);
    setActiveFilter("all");
    setTaskFlow("desc");
    setPendingMaryMessage({
      id: "task-" + Date.now(),
      agentId: "mary",
      time: nowTime(),
      type: "question",
      text: "Опиши задачу — что нужно сделать? Любым текстом снизу, я сама придумаю кому передать или предложу варианты.",
    });
  }
  function openTasksDrawer() {
    setActiveRail("tasks");
  }
  const [pendingMaryMessage, setPendingMaryMessage] = useState(null);
  const [taskFlow, setTaskFlow] = useState(null); // null | "desc" | "who" | "person" | "agent" | "team"
  const [pendingTasks, setPendingTasks] = useState([]);
  function addPendingTask(t) {
    setPendingTasks(prev => [{ id: "pt-" + Date.now(), createdAt: nowTime(), status: "Ожидает принятия", color: "#FFD60A", ...t }, ...prev]);
  }

  return (
    <div style={{
      display: "flex",
      width: "100vw",
      height: "100vh",
      background: color.white,
      fontFamily: font,
      color: "#262633",
    }}>
      {/* ── Sidebar ────────────────────────────────────── */}
      {sidebarCollapsed ? (
        <div style={{
          width: 44, minWidth: 44,
          background: color.white,
          borderRight: "1px solid rgba(38,38,51,0.06)",
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "16px 0",
        }}>
          <button
            onClick={() => setSidebarCollapsed(false)}
            title="Раскрыть сайдбар"
            style={{
              width: 32, height: 32,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: "transparent", border: "none", borderRadius: 7,
              color: "rgba(38,38,51,0.55)", cursor: "pointer", fontFamily: "inherit",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(38,38,51,0.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >{ic.collapse}</button>
        </div>
      ) : (
      <aside style={{
        width: SIDEBAR_W,
        minWidth: SIDEBAR_W,
        background: color.white,
        borderRight: "1px solid rgba(38,38,51,0.06)",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Logo + collapse */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 18px 16px",
        }}>
          <MaryLogo height={22} />
          <button
            onClick={() => setSidebarCollapsed(true)}
            title="Скрыть сайдбар"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 24, height: 24, padding: 0,
              background: "transparent", border: "none", borderRadius: 6,
              color: "rgba(38,38,51,0.55)", cursor: "pointer", fontFamily: "inherit",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(38,38,51,0.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >{ic.collapse}</button>
        </div>

        <SideRow icon={ic.home}  label="Главная" active={currentPage === "home"} onClick={() => setCurrentPage("home")} />
        <SideRow
          icon={ic.chat}
          label="Чат Mary"
          active={currentPage === "chat-mary"}
          onClick={() => setCurrentPage("chat-mary")}
        />
        <SideRow icon={ic.inbox} label="Входящие" active={currentPage === "inbox"} onClick={() => setCurrentPage("inbox")} />

        <SectionHeader label="Компания" />
        <SideRow icon={ic.people}       label="Команда" active={currentPage === "team"} onClick={() => setCurrentPage("team")} />
        <SideRow
          icon={ic.tasks}
          label="Задачи"
          active={currentPage === "tasks"}
          onClick={() => setCurrentPage("tasks")}
        />
        <SideRow
          icon={ic.kb}
          label="База знаний"
          active={currentPage === "kb"}
          onClick={() => setCurrentPage("kb")}
        />
        <SideRow
          icon={ic.integrations}
          label="Интеграции"
          active={currentPage === "integrations"}
          onClick={() => setCurrentPage("integrations")}
        />

        <SectionHeader
          label="Отделы"
          action={
            <span
              onClick={() => setCurrentPage("chat-mary")}
              title="Создать отдел через Mary"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 18, height: 18, borderRadius: 4,
                cursor: "pointer", color: "rgba(38,38,51,0.5)",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(38,38,51,0.06)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >{ic.plus}</span>
          }
        />
        {/* Динамический список отделов (Mary добавляет через create_department) */}
        {departments.map(d => {
          const isOpen = openDepts[d.id] !== false; // по умолчанию открыты
          const hasChannels = (d.channels || []).length > 0;
          return (
            <div key={d.id}>
              <SideRow
                icon={
                  <span style={{ display: "flex", color: d.color }}>
                    {d.icon === "hr" ? ic.hr : d.icon === "people" ? ic.people : ic.dept}
                  </span>
                }
                label={d.name}
                trailing={hasChannels && (
                  <span style={{ display: "flex", color: "#262633" }}>{isOpen ? ic.chevronUp : ic.chevron}</span>
                )}
                onClick={() => hasChannels ? setOpenDepts(o => ({ ...o, [d.id]: !isOpen })) : null}
              />
              {isOpen && (d.channels || []).map(ch => (
                <SideRow
                  key={ch.id}
                  label={ch.name}
                  indent={28}
                  active={currentPage === ch.page}
                  onClick={() => setCurrentPage(ch.page)}
                />
              ))}
            </div>
          );
        })}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        <div style={{ paddingBottom: 14 }}>
          <SideRow icon={ic.help}     label="Помощь" active={currentPage === "help"} onClick={() => setCurrentPage("help")} />
          <SideRow icon={ic.support}  label="Поддержка" active={currentPage === "support"} onClick={() => setCurrentPage("support")} />
          <SideRow icon={ic.settings} label="Настройки" active={currentPage === "settings"} onClick={() => setCurrentPage("settings")} />
        </div>
      </aside>
      )}

      {/* ── Main: канвас / БЗ / Интеграции ────────────── */}
      <main style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        background: color.white,
        padding: currentPage === "tg-kanal" ? 16 : 0,
      }}>
        {currentPage === "tg-kanal" ? (
          <GraphCanvas
            chatOpen={chatOpen}
            chatMode={chatMode}
            onChatModeChange={(m) => {
              if (m === "side") setActiveRail(null);
              setChatMode(m);
            }}
            pendingMaryMessage={pendingMaryMessage}
            onPendingConsumed={() => setPendingMaryMessage(null)}
            dockedHeight={dockedHeight}
            onDockedHeightChange={setDockedHeight}
            taskFlow={taskFlow}
            onTaskFlowChange={setTaskFlow}
            onAddTask={addPendingTask}
            onOpenTasks={openTasksDrawer}
            onOpenChat={() => { setChatOpen(true); setActiveFilter("all"); }}
            onCloseChat={() => setChatOpen(false)}
            activeFilter={activeFilter}
            onFilter={setActiveFilter}
            onAgentChat={(agentId) => {
              setActiveFilter(agentId);
              setChatOpen(true);
            }}
            onAgentSettings={(agentId) => {
              setActiveRail("agents");
              setAgentsSelected(agentId);
            }}
            selectedAgentId={activeRail === "agents" ? agentsSelected : null}
            approvals={approvals}
            onApprove={(key) => setApprovals(prev => ({ ...prev, [key]: true }))}
          />
        ) : currentPage === "kb" ? (
          <KbPage
            kbUserItems={kbUserItems}
            setKbUserItems={setKbUserItems}
            onOpenChat={() => { setChatOpen(true); setChatMode("mini"); setActiveFilter("all"); }}
          />
        ) : currentPage === "integrations" ? (
          <IntegrationsPage
            onOpenChat={() => { setChatOpen(true); setChatMode("mini"); setActiveFilter("all"); }}
          />
        ) : currentPage === "chat-mary" ? (
          <ChatMaryPage />
        ) : currentPage === "home" ? (
          <HomePage onNavigate={setCurrentPage} />
        ) : currentPage === "inbox" ? (
          <InboxPage onNavigate={setCurrentPage} />
        ) : currentPage === "team" ? (
          <TeamPage />
        ) : currentPage === "bizproc" ? (
          <BizprocPage onNavigate={setCurrentPage} />
        ) : currentPage === "settings" ? (
          <SettingsPage />
        ) : currentPage === "help" ? (
          <HelpPage />
        ) : currentPage === "support" ? (
          <SupportPage />
        ) : (() => {
          // Если currentPage — динамический канал отдела (тип "deptId-channelId")
          for (const dept of departments) {
            const ch = (dept.channels || []).find(c => c.page === currentPage);
            if (ch) {
              return <DepartmentChannelPage deptId={dept.id} channelPage={currentPage} onNavigate={setCurrentPage} />;
            }
          }
          // Fallback — Tasks
          return (
            <TasksPage
              pendingTasks={pendingTasks}
              onOpenChat={() => { setChatOpen(true); setChatMode("mini"); setActiveFilter("all"); }}
            />
          );
        })()}
      </main>

      {/* ── Drawer (выдвигается слева от рейла) ──────── */}
      {activeRail && (
        <RailDrawer
          kind={activeRail}
          onClose={() => setActiveRail(null)}
          agentsSelected={agentsSelected}
          setAgentsSelected={setAgentsSelected}
          kbUserItems={kbUserItems}
          setKbUserItems={setKbUserItems}
          onCreateTask={startTaskCreation}
          pendingTasks={pendingTasks}
        />
      )}

      {/* ── Чат как боковая панель / мини-окно ─────────── */}
      {chatOpen && (chatMode === "side" || chatMode === "mini") && (
        <ChatPanel
          onClose={() => setChatOpen(false)}
          activeFilter={activeFilter}
          onFilter={setActiveFilter}
          mode={chatMode}
          onModeChange={(m) => {
            if (m === "side") setActiveRail(null);
            setChatMode(m);
          }}
          dockedHeight={dockedHeight}
          onDockedHeightChange={setDockedHeight}
          pendingMaryMessage={pendingMaryMessage}
          onPendingConsumed={() => setPendingMaryMessage(null)}
          taskFlow={taskFlow}
          onTaskFlowChange={setTaskFlow}
          onAddTask={addPendingTask}
          onOpenTasks={openTasksDrawer}
        />
      )}

      {/* ── Right rail (скрыт на страницах БЗ/Интеграции) ── */}
      {currentPage === "tg-kanal" && <RightRail
        activeRail={activeRail}
        onSelect={(id) => {
          // При выборе любого drawer'а — закрываем чат-side, если он был открыт
          if (chatOpen && chatMode === "side") setChatOpen(false);
          setActiveRail(id);
        }}
        chatSideActive={chatOpen && chatMode === "side"}
        onToggleChatSide={() => {
          if (chatOpen && chatMode === "side") {
            setChatOpen(false);
          } else {
            // Открываем чат-side и закрываем любой другой drawer
            setActiveRail(null);
            setChatOpen(true);
            setChatMode("side");
          }
        }}
      />}
    </div>
  );
}

const cardWrap = {
  marginTop: 8,
  background: color.white,
  border: "1px solid rgba(38,38,51,0.08)",
  borderRadius: 14,
  padding: 14,
  maxWidth: 550,
};
const cardLabel = {
  fontSize: 11, fontWeight: 600,
  color: "rgba(38,38,51,0.55)",
  textTransform: "uppercase", letterSpacing: "0.04em",
};
const chatBtn = (variant) => ({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  height: 32, padding: "0 14px",
  borderRadius: 8,
  fontSize: 13, fontWeight: 500,
  fontFamily: "inherit",
  cursor: "pointer",
  border: variant === "secondary" ? "1px solid rgba(38,38,51,0.12)" : "none",
  background: variant === "secondary" ? color.white : "transparent",
  color: "#262633",
});

const zoomBtn = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  padding: 0,
  background: "transparent", border: "none",
  cursor: "pointer", color: "#262633",
  fontFamily: "inherit",
};

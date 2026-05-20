// Backend для платформы Mary.
// Если есть OPENROUTER_API_KEY — звонит в OpenRouter (GLM 5.1 по умолчанию).
// Если ключа нет или вызов упал — fallback на keyword-routing.

import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.N8N_PORT || process.env.PORT || 5678);
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4.5";
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_OWNER_CHAT_ID = process.env.TELEGRAM_OWNER_CHAT_ID || ""; // legacy, единичный получатель
const TELEGRAM_ALLOWLIST_CHAT_IDS = (process.env.TELEGRAM_ALLOWLIST_CHAT_IDS || "")
  .split(",").map(s => s.trim()).filter(Boolean); // массив получателей алертов
const TELEGRAM_PUBLISH_CHAT = process.env.TELEGRAM_PUBLISH_CHAT || "";   // канал для публикации постов
const KB_DIR = process.env.KB_DIR || path.join(__dirname, "kb-files");
const CONV_FILE = path.join(KB_DIR, "..", "conversations.json");
const DEPT_FILE = path.join(KB_DIR, "..", "departments.json");
const SANDBOX_FILE = path.join(KB_DIR, "..", "sandbox-runs.json");
const GOLDEN_FILE = path.join(KB_DIR, "..", "golden-tests.json");
const TRANSCRIPTS_FILE = path.join(KB_DIR, "..", "transcripts.json");
const TRANSCRIPTS_DIR = path.join(KB_DIR, "..", "audio");
const TASKS_FILE = path.join(KB_DIR, "..", "tasks.json");
const INBOX_STATE_FILE = path.join(KB_DIR, "..", "inbox-state.json");

// ── Departments (отделы компании) ────────────────────────
const DEFAULT_DEPARTMENTS = [
  {
    id: "smm", name: "СММ", icon: "dept", color: "#FF8B3D",
    description: "Контент в социальных сетях, посты, ресёрч, аналитика",
    createdAt: "2026-05-01T00:00:00Z",
    channels: [{ id: "tg-kanal", name: "Тг-канал", page: "tg-kanal" }],
  },
  {
    id: "hr", name: "HR-отдел", icon: "hr", color: "#3F95FF",
    description: "Найм, онбординг, развитие команды",
    createdAt: "2026-05-01T00:00:00Z",
    channels: [],
  },
];
function loadDepartments() {
  try {
    if (!fs.existsSync(DEPT_FILE)) {
      const data = { departments: DEFAULT_DEPARTMENTS };
      fs.mkdirSync(path.dirname(DEPT_FILE), { recursive: true });
      fs.writeFileSync(DEPT_FILE, JSON.stringify(data, null, 2), "utf8");
      return data;
    }
    return JSON.parse(fs.readFileSync(DEPT_FILE, "utf8"));
  } catch {
    return { departments: [...DEFAULT_DEPARTMENTS] };
  }
}
function saveDepartments(data) {
  fs.mkdirSync(path.dirname(DEPT_FILE), { recursive: true });
  fs.writeFileSync(DEPT_FILE, JSON.stringify(data, null, 2), "utf8");
}
function deptCreate({ name, description = "", color = "#7A86FF", icon = "dept" }) {
  if (!name) throw new Error("name required");
  const data = loadDepartments();
  const slug = String(name).toLowerCase().replace(/[^a-zа-я0-9]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 30) || ("dept-" + Date.now());
  if (data.departments.some(d => d.id === slug)) {
    throw new Error(`отдел '${slug}' уже существует`);
  }
  const dept = {
    id: slug, name, icon, color, description,
    createdAt: new Date().toISOString(),
    channels: [],
    agents: [],          // { id, role, name, color, tools[] }
    integrations: [],    // [ "Telegram", "Email", ... ]
    status: "draft",     // draft | configured | active
  };
  data.departments.push(dept);
  saveDepartments(data);
  return dept;
}
function deptAddChannel(deptId, channel) {
  const data = loadDepartments();
  const dept = data.departments.find(d => d.id === deptId);
  if (!dept) throw new Error(`отдел '${deptId}' не найден`);
  if (!channel.id) channel.id = String(channel.name || "ch").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 20) || ("ch-" + Date.now());
  if (!channel.page) channel.page = `${deptId}-${channel.id}`;
  dept.channels.push(channel);
  saveDepartments(data);
  return channel;
}
function deptAddAgent(deptId, agent) {
  const data = loadDepartments();
  const dept = data.departments.find(d => d.id === deptId);
  if (!dept) throw new Error(`отдел '${deptId}' не найден`);
  agent.id = agent.id || (String(agent.role || "agent").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 20));
  if (!agent.pipeline) agent.pipeline = defaultPipelineFor(agent.role || agent.id);
  // Должностная инструкция — дефолты по роли, перекрываются переданными значениями
  const profile = defaultProfileFor(agent.role || agent.id);
  agent.model          = agent.model          || profile.model;
  agent.systemPrompt   = agent.systemPrompt   || profile.systemPrompt;
  agent.tools          = agent.tools          || profile.tools;
  agent.memory         = agent.memory         || profile.memory;
  agent.responseFormat = agent.responseFormat || profile.responseFormat;
  dept.agents.push(agent);
  saveDepartments(data);
  return agent;
}

// Дефолтная «должностная инструкция» по типу роли
function defaultProfileFor(roleOrId) {
  const key = String(roleOrId || "").toLowerCase();
  const base = {
    model: "claude-sonnet-4-6",
    memory: "short",
    responseFormat: "text",
    tools: [],
    systemPrompt: "",
  };
  if (/(researcher|ресерч|аналитик|insight)/.test(key)) {
    return { ...base, model: "claude-sonnet-4-6", tools: ["web-search", "knowledge-base", "telegram-parser"], memory: "long",
      systemPrompt: "Ты — исследователь отдела. Твоя задача: парсить контент по нишевым каналам/источникам, дедуплицировать, фильтровать релевантное, кластеризовать по темам, синтезировать инсайты недели. На выходе — структурированный отчёт: топ-посты, темы, форматы-хуки. Не выдумывай факты — каждый инсайт привязан к источнику." };
  }
  if (/(marketer|маркетол|strateg|стратег)/.test(key)) {
    return { ...base, model: "claude-sonnet-4-6", tools: ["knowledge-base"], memory: "short",
      systemPrompt: "Ты — маркетолог отдела. Берёшь инсайты от ресерчера + бренд-бриф и генеришь 7-10 идей постов в неделю, ранжируешь по бренд-критериям (соответствие ToV, потенциальный охват, новизна). На выходе — список идей с обоснованием." };
  }
  if (/(copywriter|копирайт|writer)/.test(key)) {
    return { ...base, model: "claude-sonnet-4-6", tools: ["knowledge-base"], memory: "short", responseFormat: "text",
      systemPrompt: "Ты — копирайтер. По идее от маркетолога пишешь черновик поста в стиле бренда (живой, человечный, без консультантщины). Структура: хук → суть → инсайт → CTA. Длина под платформу: TG — 600-1200 знаков, IG — 800-1500." };
  }
  if (/(designer|дизайн)/.test(key)) {
    return { ...base, model: "gpt-4.1", tools: ["image-generation", "knowledge-base"], memory: "short",
      systemPrompt: "Ты — дизайнер. По готовому посту создаёшь 3 варианта обложек в брендстиле. Используй цветовую палитру и шрифты бренда. На выходе — 3 PNG + краткое обоснование выбора." };
  }
  if (/(editor|редактор|qa)/.test(key)) {
    return { ...base, model: "claude-sonnet-4-6", tools: ["knowledge-base"], memory: "short",
      systemPrompt: "Ты — главный редактор. Проверяешь черновик: фактическая точность, сила хука, ритм, СТА, соответствие платформе. На выходе — правки + оценка готовности (ready/needs-work/redo)." };
  }
  if (/(triage|триаж|тикет|support|поддерж)/.test(key)) {
    return { ...base, model: "claude-sonnet-4-6", tools: ["knowledge-base", "crm"], memory: "long",
      systemPrompt: "Ты — триаж-агент службы поддержки. Читаешь входящие обращения, классифицируешь по типу (баг / вопрос / фича-реквест / billing), определяешь приоритет, генерируешь черновик ответа на основе базы знаний." };
  }
  if (/(lead|лид|qualif|квалифик)/.test(key)) {
    return { ...base, model: "claude-sonnet-4-6", tools: ["crm", "knowledge-base"], memory: "long", responseFormat: "json",
      systemPrompt: "Ты — лид-квалификатор продаж. Получаешь входящие лиды (формы, email, чат), задаёшь уточняющие вопросы для квалификации (бюджет, сроки, ЛПР), скоринг по BANT, передаёшь в CRM с тегами." };
  }
  if (/(account|аккаунт|менеджер|crm)/.test(key)) {
    return { ...base, model: "claude-sonnet-4-6", tools: ["crm", "email", "knowledge-base"], memory: "long",
      systemPrompt: "Ты — аккаунт-менеджер. Ведёшь сделки в CRM: фоллоу-апы, отправка КП, напоминания, эскалация при тишине >7 дней." };
  }
  if (/(report|отчёт|финанс|бухгалт)/.test(key)) {
    return { ...base, model: "claude-sonnet-4-6", tools: ["google-sheets", "knowledge-base"], memory: "short", responseFormat: "json",
      systemPrompt: "Ты — финансовый отчётный агент. Ежемесячно собираешь данные из таблиц (бюджет, расходы, налоги, cash flow), формируешь сводный отчёт с дельтами к плану." };
  }
  if (/(hr|recru|рекру|подбор|найм)/.test(key)) {
    return { ...base, model: "claude-sonnet-4-6", tools: ["knowledge-base", "email"], memory: "long",
      systemPrompt: "Ты — HR-агент по подбору. Скринишь резюме по критериям вакансии, генеришь первичные вопросы для собеседования, ведёшь воронку кандидатов." };
  }
  // дефолт
  return { ...base,
    systemPrompt: "Ты — специализированный AI-агент отдела. Описание задачи будет добавлено руководителем (Mary) при настройке." };
}

// ── Pipeline (внутренний воркфлоу агента) ─────────────────
// Узел: { id, type: "trigger"|"step"|"llm"|"output", title, sub?, settings? }
// Edge: ["fromId", "toId"]
function defaultPipelineFor(roleOrId) {
  const key = String(roleOrId || "").toLowerCase();
  if (/(researcher|ресерч)/.test(key)) {
    return {
      nodes: [
        { id: "channels",  type: "trigger", title: "Список каналов", sub: "источники для парсинга", settings: { sources: [] } },
        { id: "schedule",  type: "trigger", title: "Расписание",     sub: "cron + on-demand",       settings: { cron: "0 9 * * *" } },
        { id: "brand",     type: "trigger", title: "Контекст бренда",sub: "ниша и tone of voice",    settings: { niche: "" } },
        { id: "fetcher",   type: "step",    title: "Сборщик",        sub: "забирает посты" },
        { id: "dedup",     type: "step",    title: "Дедупликатор",   sub: "выкидывает повторы" },
        { id: "filter",    type: "llm",     title: "Фильтр релевантности", sub: "GLM · ниша Mary", settings: { model: "z-ai/glm-5.1" } },
        { id: "discover",  type: "step",    title: "Поиск каналов",  sub: "раз в неделю · по нишам" },
        { id: "scorer",    type: "step",    title: "Скорер",         sub: "охват · ER · комменты", settings: { weights: { reach: 50, er: 30, comments: 20 } } },
        { id: "cluster",   type: "llm",     title: "Кластеризатор",  sub: "темы и сюжеты · LLM" },
        { id: "synth",     type: "llm",     title: "Синтезатор инсайтов", sub: "tl;dr недели · LLM" },
        { id: "out_top",   type: "output",  title: "Топ-посты недели", sub: "→ База знаний", settings: { target: "kb" } },
        { id: "out_themes",type: "output",  title: "Темы недели",      sub: "→ Маркетолог",  settings: { target: "agent:marketer" } },
        { id: "out_hooks", type: "output",  title: "Форматы хуков",    sub: "→ Копирайтер",  settings: { target: "agent:copywriter" } },
        { id: "out_new",   type: "output",  title: "Новые каналы",     sub: "→ автоматически в источники", settings: { target: "self:channels" } },
      ],
      edges: [
        ["channels","fetcher"], ["schedule","fetcher"],
        ["fetcher","dedup"], ["dedup","filter"], ["brand","filter"],
        ["filter","scorer"], ["filter","cluster"],
        ["scorer","synth"], ["cluster","synth"],
        ["synth","out_top"], ["synth","out_themes"], ["synth","out_hooks"],
        ["discover","out_new"],
      ],
    };
  }
  if (/(marketer|маркетол)/.test(key)) {
    return {
      nodes: [
        { id: "research_in", type: "trigger", title: "Темы от Ресерчера", sub: "input от researcher" },
        { id: "brief",       type: "trigger", title: "Бренд-бриф",        sub: "ниша, ToV, цели" },
        { id: "ideate",      type: "llm",     title: "Генератор идей",    sub: "темы → 7-10 идей · LLM" },
        { id: "rank",        type: "llm",     title: "Скорер идей",       sub: "по бренд-критериям" },
        { id: "out_ideas",   type: "output",  title: "Идеи постов",       sub: "→ Копирайтер", settings: { target: "agent:copywriter" } },
      ],
      edges: [["research_in","ideate"], ["brief","ideate"], ["ideate","rank"], ["rank","out_ideas"]],
    };
  }
  if (/(copywriter|копирайт)/.test(key)) {
    return {
      nodes: [
        { id: "idea_in",   type: "trigger", title: "Идея от Маркетолога", sub: "input" },
        { id: "hooks_in",  type: "trigger", title: "Форматы хуков",       sub: "от Ресерчера" },
        { id: "draft",     type: "llm",     title: "Черновик",            sub: "хук → тело → CTA · LLM" },
        { id: "polish",    type: "llm",     title: "Редактура",           sub: "ToV, ритм · LLM" },
        { id: "out_text",  type: "output",  title: "Текст поста",         sub: "→ Дизайнер + БЗ", settings: { target: "agent:designer" } },
      ],
      edges: [["idea_in","draft"], ["hooks_in","draft"], ["draft","polish"], ["polish","out_text"]],
    };
  }
  if (/(designer|дизайн)/.test(key)) {
    return {
      nodes: [
        { id: "text_in", type: "trigger", title: "Текст поста",     sub: "от Копирайтера" },
        { id: "concept", type: "llm",     title: "Концепт визуала", sub: "идея + промпт · LLM" },
        { id: "render",  type: "step",    title: "Генератор",       sub: "Higgsfield/SDXL" },
        { id: "out_img", type: "output",  title: "Готовая обложка", sub: "→ Аналитик + БЗ" },
      ],
      edges: [["text_in","concept"], ["concept","render"], ["render","out_img"]],
    };
  }
  if (/(analyst|аналитик)/.test(key)) {
    return {
      nodes: [
        { id: "post_in", type: "trigger", title: "Опубликованный пост", sub: "from publish_post" },
        { id: "fetch",   type: "step",    title: "Снимаю метрики",     sub: "TG Stat / API" },
        { id: "analyze", type: "llm",     title: "Анализ",             sub: "что зашло, что нет · LLM" },
        { id: "out_report", type: "output", title: "Отчёт",            sub: "→ БЗ + Маркетолог", settings: { target: "kb" } },
      ],
      edges: [["post_in","fetch"], ["fetch","analyze"], ["analyze","out_report"]],
    };
  }
  // Дефолтный простой pipeline для незнакомой роли
  return {
    nodes: [
      { id: "input",  type: "trigger", title: "Входящий запрос" },
      { id: "process",type: "llm",     title: "Обработка",    sub: "LLM" },
      { id: "output", type: "output",  title: "Результат" },
    ],
    edges: [["input","process"], ["process","output"]],
  };
}

// Pipeline mutations — апдейт конкретного агента в отделе
function withAgent(deptId, agentId, mutate) {
  const data = loadDepartments();
  const dept = data.departments.find(d => d.id === deptId);
  if (!dept) throw new Error(`отдел '${deptId}' не найден`);
  const agent = dept.agents.find(a => a.id === agentId);
  if (!agent) throw new Error(`агент '${agentId}' в отделе '${deptId}' не найден`);
  if (!agent.pipeline) agent.pipeline = defaultPipelineFor(agent.role || agent.id);
  mutate(agent.pipeline, agent, dept);
  saveDepartments(data);
  return { dept, agent };
}
function pipelineAddNode(deptId, agentId, node, after) {
  return withAgent(deptId, agentId, (p) => {
    if (!node.id) node.id = String(node.title || "node").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 20) + "-" + Date.now().toString(36).slice(-4);
    p.nodes.push(node);
    if (after) p.edges.push([after, node.id]);
  });
}
function pipelineRemoveNode(deptId, agentId, nodeId) {
  return withAgent(deptId, agentId, (p) => {
    p.nodes = p.nodes.filter(n => n.id !== nodeId);
    p.edges = p.edges.filter(([from, to]) => from !== nodeId && to !== nodeId);
  });
}
function pipelineUpdateNode(deptId, agentId, nodeId, patch) {
  return withAgent(deptId, agentId, (p) => {
    const n = p.nodes.find(x => x.id === nodeId);
    if (!n) throw new Error(`узел '${nodeId}' не найден`);
    Object.assign(n, patch);
    if (patch.settings) n.settings = { ...(n.settings || {}), ...patch.settings };
  });
}
function pipelineConnect(deptId, agentId, from, to) {
  return withAgent(deptId, agentId, (p) => {
    if (!p.edges.some(([f, t]) => f === from && t === to)) p.edges.push([from, to]);
  });
}
function pipelineDisconnect(deptId, agentId, from, to) {
  return withAgent(deptId, agentId, (p) => {
    p.edges = p.edges.filter(([f, t]) => !(f === from && t === to));
  });
}
function deptSetIntegrations(deptId, integrations) {
  const data = loadDepartments();
  const dept = data.departments.find(d => d.id === deptId);
  if (!dept) throw new Error(`отдел '${deptId}' не найден`);
  dept.integrations = integrations || [];
  if (dept.channels.length > 0 && dept.agents.length > 0) dept.status = "configured";
  saveDepartments(data);
  return dept;
}
function deptDelete(id) {
  const data = loadDepartments();
  const before = data.departments.length;
  data.departments = data.departments.filter(d => d.id !== id);
  if (data.departments.length === before) return false;
  saveDepartments(data);
  return true;
}

// ── Conversations: хранение чатов в JSON-файле ──────────
function loadConversations() {
  try {
    if (!fs.existsSync(CONV_FILE)) return { conversations: [] };
    return JSON.parse(fs.readFileSync(CONV_FILE, "utf8"));
  } catch {
    return { conversations: [] };
  }
}
function saveConversations(data) {
  fs.mkdirSync(path.dirname(CONV_FILE), { recursive: true });
  fs.writeFileSync(CONV_FILE, JSON.stringify(data, null, 2), "utf8");
}
function convCreate({ title, scope = "general" } = {}) {
  const data = loadConversations();
  // Уникальный дефолтный title с временем чтобы не было нескольких одинаковых
  if (!title) {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    title = `Чат ${d.getDate()}.${String(d.getMonth() + 1).padStart(2, "0")} · ${hh}:${mm}`;
  }
  const conv = {
    id: "c-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
    title,
    scope,                 // general | smm | free
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
  };
  data.conversations.unshift(conv);
  saveConversations(data);
  return conv;
}
function convGet(id) {
  return loadConversations().conversations.find(c => c.id === id);
}

// ── Workflow policy: owner + votes + blockers + decisions per thread ──
// Хранится в conv.workflow = { ownerId, votes: [{by, vote, ts}], blockers: [{reason, ts, public}], decisions: [{text, ts}], closed: bool }
function convWorkflow(id) {
  const data = loadConversations();
  const c = data.conversations.find(x => x.id === id);
  if (!c) throw new Error(`thread '${id}' не найден`);
  if (!c.workflow) c.workflow = { ownerId: null, votes: [], blockers: [], decisions: [], closed: false };
  return { data, c, save: () => saveConversations(data) };
}
function deptPolicy(deptId) {
  const dd = loadDepartments();
  const d = dd.departments.find(x => x.id === deptId);
  if (!d) throw new Error(`отдел '${deptId}' не найден`);
  if (!d.policy) d.policy = { ownerPerThread: true, maxVotes: 2, publicBlockers: true, weeklyMemo: true };
  return { dd, d, save: () => saveDepartments(dd) };
}
function convAppend(id, msg) {
  const data = loadConversations();
  const conv = data.conversations.find(c => c.id === id);
  if (!conv) return null;
  conv.messages.push({ ...msg, ts: new Date().toISOString() });
  conv.updatedAt = new Date().toISOString();
  // Авто-генерация title из первого user-сообщения (если только дефолтный «Чат DD.MM · HH:MM» или «Новый чат»)
  const isDefault = /^(Новый чат|Чат \d{1,2}\.\d{2} · \d{2}:\d{2})$/.test(conv.title || "");
  if (isDefault && msg.role === "user" && msg.text) {
    conv.title = msg.text.slice(0, 60).trim();
  }
  saveConversations(data);
  return conv;
}
function convList() {
  return loadConversations().conversations.map(c => ({
    id: c.id, title: c.title, scope: c.scope,
    createdAt: c.createdAt, updatedAt: c.updatedAt,
    messageCount: c.messages.length,
  }));
}
function convDelete(id) {
  const data = loadConversations();
  const before = data.conversations.length;
  data.conversations = data.conversations.filter(c => c.id !== id);
  if (data.conversations.length !== before) {
    saveConversations(data);
    return true;
  }
  return false;
}
function convRename(id, title) {
  const data = loadConversations();
  const conv = data.conversations.find(c => c.id === id);
  if (!conv) return null;
  conv.title = title || conv.title;
  conv.updatedAt = new Date().toISOString();
  saveConversations(data);
  return conv;
}

// ── KB файловая система (общая, без юзеров пока) ──────────
function ensureKbDir() {
  try { fs.mkdirSync(KB_DIR, { recursive: true }); } catch {}
}
function safeKbPath(name) {
  // Защита от path traversal: только имя файла, без подкаталогов
  const clean = String(name).replace(/[\/\\]/g, "_").replace(/^\.+/, "").trim();
  if (!clean) throw new Error("invalid filename");
  return path.join(KB_DIR, clean);
}
function kbList() {
  ensureKbDir();
  try {
    return fs.readdirSync(KB_DIR)
      .filter(f => !f.startsWith("."))
      .map(f => {
        const full = path.join(KB_DIR, f);
        const st = fs.statSync(full);
        return {
          name: f,
          size: st.size,
          modified: st.mtime.toISOString(),
        };
      })
      .sort((a, b) => b.modified.localeCompare(a.modified));
  } catch {
    return [];
  }
}
function kbRead(name) {
  const p = safeKbPath(name);
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, "utf8");
}
function kbWrite(name, content) {
  ensureKbDir();
  const p = safeKbPath(name);
  const cleanName = path.basename(p);  // нормализованное имя без ../
  const exists = fs.existsSync(p);
  fs.writeFileSync(p, String(content || ""), "utf8");
  return { path: cleanName, size: Buffer.byteLength(content || "", "utf8"), existed: exists };
}
function kbDelete(name) {
  const p = safeKbPath(name);
  if (!fs.existsSync(p)) return false;
  fs.unlinkSync(p);
  return true;
}

// ── Telegram helper ───────────────────────────────────────
async function tgSend(chatId, text, opts = {}) {
  if (!TELEGRAM_BOT_TOKEN || !chatId) return { error: "telegram not configured" };
  try {
    const r = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: opts.parseMode || "HTML",
        disable_web_page_preview: opts.disablePreview || false,
      }),
    });
    const d = await r.json();
    if (!d.ok) console.warn("[tg] send failed:", d.description);
    return d;
  } catch (e) {
    console.warn("[tg] send error:", e.message);
    return { error: e.message };
  }
}
async function tgAlert(text) {
  // Список получателей: ALLOWLIST или fallback на одного OWNER
  const recipients = TELEGRAM_ALLOWLIST_CHAT_IDS.length
    ? TELEGRAM_ALLOWLIST_CHAT_IDS
    : (TELEGRAM_OWNER_CHAT_ID ? [TELEGRAM_OWNER_CHAT_ID] : []);
  if (recipients.length === 0) return;
  return Promise.all(recipients.map(chatId =>
    tgSend(chatId, `🚨 <b>Mary alert</b>\n${text}`)
  ));
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" })); // 50mb для base64 аудио

// ── Researcher: данные ────────────────────────────────────
let _postsCache = null;
function loadPosts() {
  if (_postsCache) return _postsCache;
  try {
    const file = path.join(__dirname, "data", "posts.json");
    const raw = fs.readFileSync(file, "utf8");
    const parsed = JSON.parse(raw);
    const posts = Array.isArray(parsed.posts) ? parsed.posts : [];
    _postsCache = posts;
    console.log(`[researcher] loaded ${posts.length} posts from ${file}`);
    return posts;
  } catch (e) {
    console.warn("[researcher] no posts data:", e.message);
    return [];
  }
}
let _brandCache = null;
function loadBrand() {
  if (_brandCache) return _brandCache;
  try {
    const file = path.join(__dirname, "data", "brand.md");
    _brandCache = fs.readFileSync(file, "utf8");
    return _brandCache;
  } catch {
    return "";
  }
}
let _insightsCache = null; let _insightsTs = 0;
async function getInsightsCached(maxAgeSec = 600) {
  const now = Date.now();
  if (_insightsCache && (now - _insightsTs) < maxAgeSec * 1000) return _insightsCache;
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}/webhook/mary/researcher/insights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ days: 14, sample: 25 }),
    });
    if (!r.ok) return null;
    _insightsCache = await r.json();
    _insightsTs = now;
    return _insightsCache;
  } catch { return null; }
}
async function callLLM({ system, user, temperature = 0.7, maxTokens = 1200, jsonMode = true, label = "llm", returnUsage = false }) {
  if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY not set");
  const start = Date.now();
  const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://77.237.241.242",
      "X-Title": "Mary Platform",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      temperature,
      max_tokens: maxTokens,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!r.ok) throw new Error(`OpenRouter ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const data = await r.json();
  const choice = data.choices?.[0];
  const content = choice?.message?.content || "";
  console.log(`[${label}] ${Date.now() - start}ms tokens=${data.usage?.total_tokens || "?"} finish=${choice?.finish_reason} len=${content.length}`);
  return returnUsage ? { content, usage: data.usage || {}, model: data.model, durationMs: Date.now() - start } : content;
}

// Грубый прайсинг — GLM 5.1 ~$0.15/$0.55 за 1M токенов (input/output)
function estimateCostUsd(usage = {}, model = OPENROUTER_MODEL) {
  const pIn = usage.prompt_tokens || 0;
  const pOut = usage.completion_tokens || 0;
  // дефолт GLM (можно расширить по моделям)
  let inPrice = 0.15, outPrice = 0.55;
  if (/claude/i.test(model)) { inPrice = 3; outPrice = 15; }
  if (/gpt-4/i.test(model))  { inPrice = 5; outPrice = 15; }
  return (pIn * inPrice + pOut * outPrice) / 1_000_000;
}
function postScore(p) {
  const v = Number(p.views || 0);
  const r = (p.reactions || []).reduce((s, x) => s + (x.count || 0), 0);
  const c = Number(p.comments || 0);
  return v + r * 50 + c * 100;
}
function topPosts(limit = 30, lookbackDays = 14) {
  const cutoff = Date.now() - lookbackDays * 24 * 3600 * 1000;
  return loadPosts()
    .filter(p => {
      if (!p.datetime) return true;
      return new Date(p.datetime).getTime() > cutoff;
    })
    .sort((a, b) => postScore(b) - postScore(a))
    .slice(0, limit);
}

// ── System prompt: кто такая Mary, какие у неё агенты, какой формат ответа ──
const SYSTEM_PROMPT = `Ты — Mary, AI-оркестратор отдела СММ платформы Mary.app.
Юзер — Виктория Ахрамович, Head of SMM. Канал в Telegram про Mary как продукт + AI-агентов.

У тебя 5 специализированных агентов в отделе СММ:
- researcher — парсит 31 ТГ-канал конкурентов, выделяет тренды и инсайты
- marketer — на основе ресёрча придумывает идеи постов, концепты, угол подачи
- copywriter — пишет тексты постов в ToV: просто, без воды, с цифрами и личными историями, длина 300-800 знаков
- designer — генерит обложки в брендстиле (3 варианта на идею)
- analyst — снимает метрики опубликованных постов через TG Stat, формирует рекомендации

КАК ОТВЕЧАТЬ:
1. Отвечай как Mary — спокойно, по делу, без воды, по-русски.
2. Если задача чётко относится к одному агенту — делегируй ему (укажи в delegateTo).
3. Если задача неясна — задай 1 уточняющий вопрос, не делегируй (delegateTo: null).
4. Короткий ответ 1-3 предложения максимум — это чат, не статья.
5. Никаких эмодзи если только юзер сама не использует.

ФОРМАТ ОТВЕТА — строго JSON (никакого markdown):
{
  "text": "<твой ответ юзеру, 1-3 предложения>",
  "delegateTo": "researcher|marketer|copywriter|designer|analyst|null"
}`;

// ── Keyword fallback ──
function routeByKeywords(message) {
  const m = (message || "").toLowerCase();
  if (/(контент.?план|план.{0,10}пост|идеи|темы постов)/.test(m))
    return { delegateTo: "marketer",   text: "Передаю Маркетологу — соберёт идеи постов под твой бриф." };
  if (/(напиши пост|напиши текст|текст поста|пост на тему)/.test(m))
    return { delegateTo: "copywriter", text: "Передаю Копирайтеру — он напишет драфт в твоём ToV." };
  if (/(обложк|визуал|картинк|дизайн|оформлен)/.test(m))
    return { delegateTo: "designer",   text: "Прошу Дизайнера — даст 3 варианта в брендстиле." };
  if (/(ресёрч|ресерч|конкурент|спарси|посты конкурентов|тренд|инсайт)/.test(m))
    return { delegateTo: "researcher", text: "Ресерчер уже на ходу — собирает свежие посты по 31 каналу." };
  if (/(аналитик|метрик|охват|er|отчёт|статистик)/.test(m))
    return { delegateTo: "analyst",    text: "Спрошу Аналитика — он принесёт цифры по последним постам." };
  return { delegateTo: null, text: "Понял. Опиши задачу подробнее — я передам нужному агенту или сделаю сама." };
}

// ── OpenRouter call ──
async function askOpenRouter(message, history) {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.slice(-20).map(h => ({
      role: h.agentId === "user" ? "user" : "assistant",
      content: h.text || "",
    })).filter(m => m.content),
    { role: "user", content: message },
  ];

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Mary Platform",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "";
  let parsed;
  try { parsed = JSON.parse(raw); }
  catch { return { text: raw || "Не смогла разобрать ответ.", delegateTo: null }; }
  // Нормализуем delegateTo
  const allowed = ["researcher", "marketer", "copywriter", "designer", "analyst"];
  const delegateTo = allowed.includes(parsed.delegateTo) ? parsed.delegateTo : null;
  return { text: String(parsed.text || ""), delegateTo, _model: data.model, _usage: data.usage };
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    backend: "mary-express",
    llmEnabled: !!OPENROUTER_API_KEY,
    llmModel: OPENROUTER_API_KEY ? OPENROUTER_MODEL : null,
    posts: loadPosts().length,
    telegram: {
      botConnected: !!TELEGRAM_BOT_TOKEN,
      allowlistSize: TELEGRAM_ALLOWLIST_CHAT_IDS.length || (TELEGRAM_OWNER_CHAT_ID ? 1 : 0),
      publishChannel: TELEGRAM_PUBLISH_CHAT || null,
    },
    uptime: process.uptime(),
  });
});

// ── Departments CRUD ─────────────────────────────────────
app.get("/webhook/mary/departments", (_req, res) => {
  res.json(loadDepartments());
});
app.post("/webhook/mary/departments", (req, res) => {
  try { res.json(deptCreate(req.body || {})); }
  catch (e) { res.status(400).json({ error: e.message }); }
});
app.delete("/webhook/mary/departments/:id", (req, res) => {
  res.json({ ok: deptDelete(req.params.id) });
});

// ── Conversations CRUD ───────────────────────────────────
app.get("/webhook/mary/conversations", (_req, res) => {
  res.json({ conversations: convList() });
});
app.get("/webhook/mary/conversations/:id", (req, res) => {
  const c = convGet(req.params.id);
  if (!c) return res.status(404).json({ error: "not found" });
  res.json(c);
});
app.post("/webhook/mary/conversations", (req, res) => {
  const { title, scope } = req.body || {};
  res.json(convCreate({ title, scope }));
});
app.delete("/webhook/mary/conversations/:id", (req, res) => {
  res.json({ ok: convDelete(req.params.id) });
});
app.patch("/webhook/mary/conversations/:id", (req, res) => {
  const { title } = req.body || {};
  const c = convRename(req.params.id, title);
  if (!c) return res.status(404).json({ error: "not found" });
  res.json(c);
});
// Принять одно сообщение в conversation (для случаев без stream)
// ── Team / TG-mock seed ──────────────────────────────
// Создаёт mock-сотрудников + 3 «подключенных TG-группы» + 2 внутренних чата с сообщениями.
const MOCK_PEOPLE_LIST = [
  { id: "alex",    name: "Александр Орлов",    role: "Бекенд-лид",      color: "#3F95FF" },
  { id: "maria",   name: "Мария Дудник",       role: "Дизайнер",        color: "#FF6FB3" },
  { id: "ivan",    name: "Иван Соколов",       role: "Маркетинг",       color: "#FF8B3D" },
  { id: "katya",   name: "Катя Сафина",        role: "Контент",         color: "#7A86FF" },
  { id: "andrey",  name: "Андрей Шумилов",     role: "Аналитик",        color: "#34C759" },
];

app.get("/webhook/mary/team/people", (req, res) => {
  res.json({ people: MOCK_PEOPLE_LIST });
});

app.post("/webhook/mary/team/seed", (req, res) => {
  const data = loadConversations();
  // Если уже есть seed — не плодим
  if (data.conversations.some(c => c.scope?.startsWith("team/") || c.scope?.startsWith("tg/"))) {
    return res.json({ ok: true, seeded: false, message: "Уже засеяно" });
  }
  const now = Date.now();
  const ago = (mins) => new Date(now - mins * 60000).toISOString();

  const seeds = [
    // 1-1 с Александром (внутренний)
    {
      scope: "team/alex", title: "Александр Орлов",
      meta: { kind: "personal", peopleIds: ["alex"], source: "internal" },
      messages: [
        { role: "user",      agentId: "alex",    text: "Привет. Виктория, посмотри коммент к идее #2 — нужен твой апрув", ts: ago(95) },
        { role: "user",      agentId: "vika",    text: "Окей, гляну после обеда", ts: ago(80) },
        { role: "user",      agentId: "alex",    text: "Спасибо. И ещё застрял с OAuth — не пускает callback. Думаю это блокер на релиз", ts: ago(30) },
      ],
    },
    // 1-1 с Марией
    {
      scope: "team/maria", title: "Мария Дудник",
      meta: { kind: "personal", peopleIds: ["maria"], source: "internal" },
      messages: [
        { role: "user", agentId: "maria", text: "Виктория, обложку к утренним привычкам выложила в фигму. Глянь?", ts: ago(120) },
        { role: "user", agentId: "vika",  text: "Огонь, апрувлю!", ts: ago(110) },
        { role: "user", agentId: "maria", text: "Поняла, передаю в продакшен 👍", ts: ago(108) },
      ],
    },
    // Группа «Команда продукта» (внутренняя)
    {
      scope: "team/product", title: "Команда продукта",
      meta: { kind: "group", peopleIds: ["alex", "maria", "ivan", "vika"], source: "internal" },
      messages: [
        { role: "user", agentId: "ivan",   text: "Команда, релиз AI-агентов планируем на 25.05. Все согласны?", ts: ago(180) },
        { role: "user", agentId: "alex",   text: "Я бы предложил перенести на 26.05 — нужен ещё день на OAuth", ts: ago(170) },
        { role: "user", agentId: "maria",  text: "Согласна, пусть будет 26-го", ts: ago(165) },
        { role: "user", agentId: "vika",   text: "Окей, 26 мая. Александр — owner релиза", ts: ago(160) },
      ],
    },

    // TG-интеграции (mock — типа подключены боты)
    {
      scope: "tg/mary30", title: "Mary 3.0",
      meta: { kind: "tg_group", source: "tg", platform: "telegram", botConnected: true, membersCount: 8 },
      messages: [
        { role: "user", agentId: "alex",   text: "Виктория, посмотри пожалуйста PR #847 — там фикс по publish_post", ts: ago(45) },
        { role: "user", agentId: "ivan",   text: "Ребят, дайджест за неделю готов: https://disk.yandex.ru/i/abc", ts: ago(40) },
        { role: "user", agentId: "katya",  text: "У меня вопрос — кто-нибудь видел метрики по @neural_prosecco? Не сходится с прошлой недели", ts: ago(25) },
      ],
    },
    {
      scope: "tg/design-team", title: "Дизайн-команда",
      meta: { kind: "tg_group", source: "tg", platform: "telegram", botConnected: true, membersCount: 5 },
      messages: [
        { role: "user", agentId: "maria",  text: "Завтра в 14:00 ревью обложек — все придут?", ts: ago(60) },
        { role: "user", agentId: "katya",  text: "Я смогу к 14:30", ts: ago(58) },
      ],
    },
    {
      scope: "tg/sales", title: "Продажи · оперативка",
      meta: { kind: "tg_group", source: "tg", platform: "telegram", botConnected: true, membersCount: 4 },
      messages: [
        { role: "user", agentId: "andrey", text: "@vika клиент Stellar просит демо AI-агентов до пятницы — успеваем?", ts: ago(15) },
        { role: "user", agentId: "ivan",   text: "Стоит делать. Мария поможет с визуалом?", ts: ago(10) },
      ],
    },
  ];

  for (const s of seeds) {
    const id = "c-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
    data.conversations.unshift({
      id, title: s.title, scope: s.scope,
      createdAt: ago(300), updatedAt: s.messages[s.messages.length - 1]?.ts || ago(300),
      messages: s.messages,
      meta: s.meta,
    });
  }
  saveConversations(data);
  res.json({ ok: true, seeded: true, count: seeds.length });
});

// Отправка сообщения от текущего юзера (Виктории) в team-чат
app.post("/webhook/mary/team/:id/send", (req, res) => {
  const { text } = req.body || {};
  if (!text?.trim()) return res.status(400).json({ error: "text required" });
  const data = loadConversations();
  const c = data.conversations.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: "not found" });
  c.messages.push({ role: "user", agentId: "vika", text: text.trim(), ts: new Date().toISOString() });
  c.updatedAt = new Date().toISOString();
  saveConversations(data);
  // Mock: для TG-чатов через 2-4 сек кто-то «отвечает» (просто демо)
  if (c.scope?.startsWith("tg/") && Math.random() > 0.5) {
    setTimeout(() => {
      const data2 = loadConversations();
      const c2 = data2.conversations.find(x => x.id === req.params.id);
      if (!c2) return;
      const replies = ["Окей, понял", "👍", "Принято", "Сделаю до конца дня", "Согласен"];
      const otherPeople = MOCK_PEOPLE_LIST.filter(p => p.id !== "vika");
      const p = otherPeople[Math.floor(Math.random() * otherPeople.length)];
      c2.messages.push({ role: "user", agentId: p.id, text: replies[Math.floor(Math.random() * replies.length)], ts: new Date().toISOString() });
      c2.updatedAt = new Date().toISOString();
      saveConversations(data2);
    }, 2000 + Math.random() * 3000);
  }
  res.json({ ok: true });
});

app.post("/webhook/mary/conversations/:id/messages", (req, res) => {
  const { role = "user", text = "", trace } = req.body || {};
  const c = convAppend(req.params.id, { role, text, ...(trace ? { trace } : {}) });
  if (!c) return res.status(404).json({ error: "not found" });
  res.json({ ok: true });
});
// Отрезать хвост сообщений начиная с index (для функции Edit & Resend)
app.delete("/webhook/mary/conversations/:id/messages", (req, res) => {
  const fromIndex = Math.max(0, parseInt(req.query.from || "0", 10));
  const data = loadConversations();
  const c = data.conversations.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: "not found" });
  c.messages = (c.messages || []).slice(0, fromIndex);
  c.updatedAt = new Date().toISOString();
  saveConversations(data);
  res.json({ ok: true, remaining: c.messages.length });
});

// ── KB файловые endpoints для фронта ─────────────────────
app.get("/webhook/mary/kb/files", (_req, res) => {
  res.json({ files: kbList() });
});
app.get("/webhook/mary/kb/file", (req, res) => {
  const name = req.query.name;
  if (!name) return res.status(400).json({ error: "name required" });
  const content = kbRead(String(name));
  if (content === null) return res.status(404).json({ error: "not found" });
  res.json({ name, content, length: content.length });
});
app.post("/webhook/mary/kb/file", (req, res) => {
  const { name, content } = req.body || {};
  if (!name || typeof content !== "string") return res.status(400).json({ error: "name and content required" });
  try {
    const r = kbWrite(name, content);
    res.json({ ok: true, ...r });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.delete("/webhook/mary/kb/file", (req, res) => {
  const name = req.query.name;
  if (!name) return res.status(400).json({ error: "name required" });
  res.json({ ok: kbDelete(String(name)) });
});

// ── Telegram: utility endpoints ───────────────────────────
app.get("/webhook/mary/telegram/updates", async (_req, res) => {
  if (!TELEGRAM_BOT_TOKEN) return res.status(503).json({ error: "no token" });
  const r = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?limit=20`);
  const d = await r.json();
  const chats = new Map();
  for (const u of (d.result || [])) {
    const m = u.message || u.channel_post;
    if (m?.chat) {
      chats.set(m.chat.id, {
        id: m.chat.id,
        type: m.chat.type,
        title: m.chat.title || `${m.chat.first_name || ""} ${m.chat.last_name || ""}`.trim(),
        username: m.chat.username || null,
        lastMessage: m.text || "(no text)",
      });
    }
  }
  res.json({ chats: [...chats.values()] });
});

app.post("/webhook/mary/telegram/publish", async (req, res) => {
  const { text, channel } = req.body || {};
  if (!text) return res.status(400).json({ error: "text required" });
  const target = channel || TELEGRAM_PUBLISH_CHAT;
  if (!target) return res.status(400).json({ error: "no channel" });
  const r = await tgSend(target, text);
  if (!r.ok) return res.status(500).json({ error: r.description || r.error });
  const m = r.result;
  res.json({
    ok: true,
    messageId: m.message_id,
    url: `https://t.me/${String(target).replace(/^@/, "")}/${m.message_id}`,
  });
});

// ── Researcher endpoints ──────────────────────────────────
app.get("/webhook/mary/researcher/posts", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 30, 100);
  const days  = Math.min(Number(req.query.days)  || 14, 90);
  const top = topPosts(limit, days);
  res.json({
    total: loadPosts().length,
    returned: top.length,
    lookbackDays: days,
    posts: top.map(p => ({
      channel: p.channel,
      messageId: p.message_id,
      datetime: p.datetime,
      views: p.views,
      reactions: (p.reactions || []).reduce((s, x) => s + (x.count || 0), 0),
      comments: p.comments,
      url: `https://t.me/${p.channel}/${p.message_id}`,
      text: (p.text || "").slice(0, 400),
    })),
  });
});

app.post("/webhook/mary/researcher/insights", async (req, res) => {
  const start = Date.now();
  const days   = Math.min(Number(req.body?.days)  || 7,  90);
  const sample = Math.min(Number(req.body?.sample) || 25, 60);
  const top = topPosts(sample, days);
  if (top.length === 0) {
    return res.status(503).json({ error: "no posts loaded" });
  }
  if (!OPENROUTER_API_KEY) {
    return res.status(503).json({ error: "LLM not configured" });
  }
  const compact = top.map((p, i) => ({
    n: i + 1,
    ch: p.channel,
    score: Math.round(postScore(p)),
    views: p.views,
    text: (p.text || "").replace(/\s+/g, " ").slice(0, 600),
  }));
  const sys = `Ты — Ресерчер AI-агент платформы Mary.app, отдел СММ. Анализируешь посты конкурентов из ниши AI/стартапы/маркетинг и находишь паттерны.

Тебе дают набор спарсенных топ-постов за период. Ты возвращаешь СТРОГО JSON:
{
  "themes":  [{"label":"...", "direction":"up|down|stable", "note":"X постов · ср. охват Yk"}],
  "formats": ["короткое утверждение про работающий формат, 1 строка"],
  "observations": ["конкретная цифра/инсайт по структуре поста"]
}
4-6 тем · 4 формата · 3 observation. По-русски, без воды.`;
  const usr = `Период: ${days} дней. Постов в выборке: ${top.length}.\n\n${
    compact.map(p => `[${p.n}] @${p.ch} · score=${p.score} · views=${p.views ?? "?"}\n${p.text}`).join("\n\n")
  }`;
  try {
    const raw = await callLLM({ system: sys, user: usr, temperature: 0.4, maxTokens: 3500, label: "researcher" });
    let parsed;
    try { parsed = JSON.parse(raw); } catch { parsed = { themes: [], formats: [], observations: [], _raw: raw.slice(0, 200) }; }
    console.log(`[researcher] parsed themes=${parsed.themes?.length || 0} formats=${parsed.formats?.length || 0} obs=${parsed.observations?.length || 0}`);
    if (parsed.themes?.length === 0 && parsed._raw) console.log(`[researcher] raw sample: ${parsed._raw}`);
    const data = { model: OPENROUTER_MODEL };
    res.json({
      agentId: "researcher",
      lookbackDays: days,
      sampleSize: top.length,
      themes: parsed.themes || [],
      formats: parsed.formats || [],
      observations: parsed.observations || [],
      backend: "mary-express",
      model: data.model,
      durationMs: Date.now() - start,
    });
  } catch (e) {
    console.error("[researcher] LLM error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Function calling: tools которые Mary может вызвать ────
const MARY_TOOLS = [
  {
    type: "function",
    function: {
      name: "get_research_insights",
      description: "Запросить у Ресерчера свежие тренды и форматы постов из ниши. Возвращает темы недели, рабочие форматы и observations с цифрами. Вызывай когда нужен контекст что обсуждают конкуренты или ищем идеи на основе данных. Кешируется на 10 минут.",
      parameters: {
        type: "object",
        properties: {
          days:   { type: "integer", description: "За сколько дней назад смотреть посты (1-90)", default: 14 },
          sample: { type: "integer", description: "Сколько топ-постов проанализировать (10-60)", default: 25 },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_ideas",
      description: "Попросить Маркетолога придумать N идей постов под бриф. Маркетолог автоматически подтянет свежие тренды от Ресерчера и применит ToV из бренд-брифа. Возвращает массив идей {id, angle, title, hook, angleNote}.",
      parameters: {
        type: "object",
        properties: {
          count: { type: "integer", description: "Сколько идей сгенерить (1-8)", default: 4 },
          brief: { type: "string", description: "Дополнительный контекст от юзера: тема, аудитория, формат" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "write_post",
      description: "Попросить Копирайтера написать готовый текст поста под одну конкретную идею в твоём ToV. Возвращает body — готовый Telegram-пост 300-700 знаков.",
      parameters: {
        type: "object",
        properties: {
          idea: {
            type: "object",
            description: "Идея поста",
            properties: {
              id:        { type: "string" },
              title:     { type: "string", description: "Короткое название идеи" },
              angle:     { type: "string", description: "Жанр/угол поста" },
              hook:      { type: "string", description: "Черновик первой строки" },
              angleNote: { type: "string", description: "Обоснование почему это сработает" },
            },
            required: ["title"],
          },
        },
        required: ["idea"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_kb",
      description: "Найти материалы в базе знаний пользователя по запросу (документы, посты, файлы, ссылки которые юзер сам загрузила). Используй когда юзер ссылается на 'у меня в базе', 'тот документ что я добавила', или нужны конкретные данные о её бренде/продукте.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Поисковый запрос" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_task",
      description: "Создать задачу в kanban-доске. Появится в колонке Backlog (или указанной status). Связывается с отделом и owner-ом — отображается на странице Задачи.",
      parameters: {
        type: "object",
        properties: {
          title:       { type: "string", description: "Короткое название задачи (5-10 слов)" },
          description: { type: "string", description: "Подробности что нужно сделать" },
          deptId:      { type: "string", description: "ID отдела (smm/hr/sales/...). Опускай если общая задача" },
          assignee:    { type: "string", description: "Имя owner-а (человек или агент researcher/marketer/copywriter/designer/analyst)" },
          dueDate:     { type: "string", description: "ISO date или текст ('завтра 18:00')" },
          priority:    { type: "string", enum: ["high", "normal", "low"], description: "Приоритет, дефолт normal" },
          status:      { type: "string", enum: ["backlog", "doing", "blocked", "done"], description: "Дефолт backlog" },
          source:      { type: "object", description: "Откуда задача: { type: 'mary' | 'transcript' | 'decision' | 'manual', refId?: '...' }" },
        },
        required: ["title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "kb_list",
      description: "Получить список файлов в БЗ юзера. Используй чтобы понять что уже есть, прежде чем создавать новый файл (вдруг такой уже существует и его нужно обновить).",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "kb_read",
      description: "Прочитать содержимое файла из БЗ. Возвращает текст файла. Используй чтобы посмотреть существующий контент перед обновлением, или подгрузить контекст для следующего шага (например, прочитать бренд-бриф или прошлый контент-план).",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Имя файла, например 'Контент-план на 14 дней.md'" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "kb_write",
      description: "Создать или перезаписать файл в БЗ юзера. Используй для сохранения контент-планов, заметок, гайдов, идей в формате markdown. Файл с этим именем будет показан юзеру в Drawer 'База знаний'. Если файл с таким именем уже есть — он будет ПЕРЕЗАПИСАН (вызови kb_read сначала если хочешь сохранить части старого).",
      parameters: {
        type: "object",
        properties: {
          name:    { type: "string", description: "Имя файла .md, например 'Контент-план на 14 дней — Фитнес и ЗОЖ.md'" },
          content: { type: "string", description: "Полный текст файла в markdown (с таблицами, списками, заголовками)" },
        },
        required: ["name", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_departments",
      description: "Получить список отделов которые уже есть на платформе. Используй чтобы понять что уже создано прежде чем создавать новый отдел.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "create_department",
      description: "Создать новый отдел на платформе. Появится в сайдбаре в секции 'Отделы'. Используй когда юзер прямо просит создать отдел. Создаёт пустой контейнер — после этого начни onboarding-диалог: спроси про каналы, задачи, потом добавь add_channel и add_agent.",
      parameters: {
        type: "object",
        properties: {
          name:        { type: "string", description: "Название отдела (по-русски, например 'Продажи' или 'Финансы')" },
          description: { type: "string", description: "Что отдел делает (1-2 предложения)" },
          color:       { type: "string", description: "Brand-цвет в hex для иконки в сайдбаре. Дефолт #7A86FF" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_channel",
      description: "Добавить канал коммуникации в отдел (Telegram-канал, Instagram, Email-рассылка, поддержка-чат и т.д.). Канал = одна площадка где отдел работает. Появится в сайдбаре под отделом.",
      parameters: {
        type: "object",
        properties: {
          deptId: { type: "string", description: "ID отдела (например 'продажи', 'smm')" },
          name:   { type: "string", description: "Название канала ('Тг-канал', 'Инстаграм', 'B2B email')" },
          type:   { type: "string", description: "Тип: telegram | instagram | email | support | other", default: "other" },
        },
        required: ["deptId", "name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_agent",
      description: "Добавить AI-агента в отдел с полной должностной инструкцией. Обязательно заполняй systemPrompt (полная роль), model и tools — это видно клиенту в drill-down агента и используется при прогоне pipeline.",
      parameters: {
        type: "object",
        properties: {
          deptId: { type: "string", description: "ID отдела" },
          role:   { type: "string", description: "Роль агента (по-русски: 'Ресерчер', 'Лид-квалификатор', 'Аккаунт-менеджер')" },
          color:  { type: "string", description: "Цвет аватара hex (#3F95FF, #FF8B3D, #7A86FF, #FF6FB3, #34C759)" },
          tasks:  { type: "string", description: "Что агент делает (1-2 предложения) — короткое summary для карточки" },
          model:  { type: "string", description: "Модель: 'claude-sonnet-4-6' (дефолт для текстовых задач), 'gpt-4.1' (для генерации изображений/мультимодальных), 'z-ai/glm-5.1' (быстрая и дешёвая для классификации/фильтрации)" },
          systemPrompt: { type: "string", description: "ПОЛНАЯ должностная инструкция (5-15 предложений): кто агент, что делает шаг за шагом, на каких данных, в каком стиле/формате на выходе. Это его 'роль' в pipeline." },
          tools: { type: "array", items: { type: "string" }, description: "Список инструментов: 'web-search', 'knowledge-base', 'telegram-parser', 'image-generation', 'crm', 'email', 'google-sheets', 'calendar', etc." },
          memory: { type: "string", enum: ["none", "short", "long"], description: "Тип памяти: none (без памяти, чистый prompt), short (контекст текущей сессии), long (хранит контекст между сессиями в KB)" },
          responseFormat: { type: "string", enum: ["text", "json"], description: "Формат ответа: text (свободный) или json (структурированный)" },
        },
        required: ["deptId", "role", "systemPrompt"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "set_department_integrations",
      description: "Установить список интеграций для отдела (Telegram, Google Sheets, HubSpot, Stripe, и т.д.) после диалога с юзером.",
      parameters: {
        type: "object",
        properties: {
          deptId:       { type: "string" },
          integrations: { type: "array", items: { type: "string" }, description: "Массив названий интеграций" },
        },
        required: ["deptId", "integrations"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_pipeline_node",
      description: "Добавить шаг (узел) в pipeline конкретного агента. Например юзер говорит 'добавь Ресерчеру шаг проверки на спам' → добавляешь узел type=step после filter. Типы узлов: trigger (источник данных), step (обработка), llm (LLM-узел), output (выход).",
      parameters: {
        type: "object",
        properties: {
          deptId:  { type: "string" },
          agentId: { type: "string", description: "id агента внутри отдела (researcher, marketer, copywriter, designer, analyst или кастомный)" },
          type:    { type: "string", enum: ["trigger", "step", "llm", "output"] },
          title:   { type: "string", description: "Короткое название узла, например 'Спам-фильтр'" },
          sub:     { type: "string", description: "Подзаголовок 1 строкой что узел делает", default: "" },
          settings:{ type: "object", description: "Параметры узла, например { model: 'z-ai/glm-5.1' }", default: {} },
          after:   { type: "string", description: "id узла после которого вставить (создаст edge after→new). Опционально." },
        },
        required: ["deptId", "agentId", "type", "title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "remove_pipeline_node",
      description: "Удалить узел из pipeline агента (по id). Все edges с этим узлом тоже удаляются.",
      parameters: {
        type: "object",
        properties: {
          deptId:  { type: "string" },
          agentId: { type: "string" },
          nodeId:  { type: "string" },
        },
        required: ["deptId", "agentId", "nodeId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_pipeline_node",
      description: "Изменить title/sub/settings конкретного узла. Например юзер говорит 'поменяй вес комментов в Скорере на 50%' → update_pipeline_node({nodeId:'scorer', settings:{weights:{...}}}).",
      parameters: {
        type: "object",
        properties: {
          deptId:  { type: "string" },
          agentId: { type: "string" },
          nodeId:  { type: "string" },
          patch:   { type: "object", description: "Объект с обновлёнными полями. settings мерджится поверх." },
        },
        required: ["deptId", "agentId", "nodeId", "patch"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "connect_nodes",
      description: "Соединить два узла в pipeline (edge from→to). Используй когда юзер говорит 'пусть Скорер ещё подаёт в Кластеризатор'.",
      parameters: {
        type: "object",
        properties: {
          deptId:  { type: "string" },
          agentId: { type: "string" },
          from:    { type: "string", description: "id узла-источника" },
          to:      { type: "string", description: "id узла-приёмника" },
        },
        required: ["deptId", "agentId", "from", "to"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "disconnect_nodes",
      description: "Удалить связь между двумя узлами в pipeline (только edge, узлы остаются).",
      parameters: {
        type: "object",
        properties: {
          deptId:  { type: "string" },
          agentId: { type: "string" },
          from:    { type: "string" },
          to:      { type: "string" },
        },
        required: ["deptId", "agentId", "from", "to"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "set_workflow_policy",
      description: "Изменить workflow-политику отдела: ownerPerThread (нужен ли owner на каждый тред), maxVotes (сколько голосов «за» закрывают решение, обычно 2), publicBlockers (постить блокеры в публичный TG), weeklyMemo (собирать ли еженедельный отчёт).",
      parameters: {
        type: "object",
        properties: {
          deptId: { type: "string" },
          ownerPerThread: { type: "boolean" },
          maxVotes:       { type: "integer", description: "Сколько 'за' закрывают решение (дефолт 2)" },
          publicBlockers: { type: "boolean" },
          weeklyMemo:     { type: "boolean" },
        },
        required: ["deptId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "assign_thread_owner",
      description: "Назначить ответственного (owner) на тред-конверсацию. Применяется по правилу policy.ownerPerThread.",
      parameters: {
        type: "object",
        properties: {
          threadId: { type: "string", description: "id conversation" },
          ownerId:  { type: "string", description: "имя или username/role того кто owner" },
        },
        required: ["threadId", "ownerId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "record_vote",
      description: "Записать голос «за» или «против» по треду. Когда наберётся policy.maxVotes одинаковых голосов — тред автоматически закрывается, решение записывается в decision log. Используй когда юзер пишет 'согласна', 'ок', 'против', '+1', '👍' в чате отдела по конкретному вопросу.",
      parameters: {
        type: "object",
        properties: {
          threadId: { type: "string" },
          by:       { type: "string", description: "кто голосует" },
          vote:     { type: "string", enum: ["for", "against"] },
          decision: { type: "string", description: "формулировка решения (нужна для авто-закрытия)" },
        },
        required: ["threadId", "by", "vote"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "flag_blocker",
      description: "Пометить блокер по треду. Если у отдела policy.publicBlockers=true — отправляется уведомление в общий TG-allowlist (Виктория видит сразу).",
      parameters: {
        type: "object",
        properties: {
          threadId: { type: "string" },
          deptId:   { type: "string", description: "для определения policy.publicBlockers и формулировки в TG" },
          reason:   { type: "string", description: "что блокирует" },
        },
        required: ["threadId", "reason"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_decision",
      description: "Добавить запись в decision log треда. Одна строка — что решено, кем, когда. Используется когда тред закрывается с финальным решением.",
      parameters: {
        type: "object",
        properties: {
          threadId: { type: "string" },
          text:     { type: "string", description: "Краткая формулировка решения (≤120 символов)" },
        },
        required: ["threadId", "text"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "weekly_memo",
      description: "Собрать еженедельный memo по отделу: что решили / что в работе / блокеры / следующие шаги. Сохраняется в БЗ как файл. Запускать раз в неделю (понедельник утром) или по запросу.",
      parameters: {
        type: "object",
        properties: {
          deptId: { type: "string" },
        },
        required: ["deptId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "read_chat",
      description: "Прочитать последние N сообщений из чата отдела (например 'smm') чтобы понять что там обсуждается. Используй когда юзер спрашивает 'что я писала в СММ', 'какие задачи стоят перед маркетологом', 'покажи последние идеи' и подобное. Возвращает массив сообщений {role, text, ts}.",
      parameters: {
        type: "object",
        properties: {
          scope: { type: "string", description: "Скоуп чата: 'smm' (или конкретный канал — 'smm/tg-kanal'), 'general' для общих, 'free' для свободных" },
          limit: { type: "integer", description: "Сколько последних сообщений вернуть (1-50)", default: 20 },
        },
        required: ["scope"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "ask_agent",
      description: "ДЕЛЕГИРУЙ задачу конкретному агенту отдела вместо того чтобы делать самой. Используй когда юзер просит: написать контент-план/пост (→ Копирайтер), сгенерить идеи (→ Маркетолог), сделать ресёрч/анализ канала (→ Ресерчер), создать обложку (→ Дизайнер), отчёт (→ Аналитик), квалифицировать лид (→ Лид-квалификатор). Агент отвечает СВОИМ голосом, со своей экспертизой — Mary сама не пытается имитировать. Результат tool возвращает ответ агента (output), Mary в финальном тёрне ПРОСТО передаёт его юзеру (можно с короткой подводкой: «Передала Маркетологу, вот что он/она думает:»).",
      parameters: {
        type: "object",
        properties: {
          deptId:  { type: "string", description: "ID отдела, например 'smm'" },
          agentId: { type: "string", description: "ID агента: 'researcher', 'marketer', 'copywriter', 'designer', 'analyst', 'lead-qualifier' и т.д. — посмотри в list_departments если не знаешь" },
          task:    { type: "string", description: "Задача для агента — что именно нужно сделать. Формулируй чётко, как ТЗ от руководителя. Включи весь контекст из диалога с юзером." },
          context: { type: "string", description: "Опциональный дополнительный контекст: ссылки на инсайты, бренд-бриф, прошлые посты. Если пусто — агент использует только свою память." },
        },
        required: ["deptId", "agentId", "task"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "publish_post",
      description: "Опубликовать готовый пост в Telegram-канал Mary. Используй ТОЛЬКО когда юзер прямо просит опубликовать, либо после явного апрува текста. НЕ публикуй автоматически черновик.",
      parameters: {
        type: "object",
        properties: {
          text:    { type: "string", description: "Готовый текст поста" },
          channel: { type: "string", description: "@handle канала; по умолчанию канал из .env" },
        },
        required: ["text"],
      },
    },
  },
];

const MARY_SYSTEM_AGENT = `Ты — Mary, AI-оркестратор отдела СММ платформы Mary.app.
Юзер — Виктория Ахрамович, Head of SMM. Канал в Telegram про Mary как продукт + AI-агенты.

У тебя есть 5 специализированных агентов в отделе:
- researcher — парсит ТГ-каналы конкурентов, выделяет тренды
- marketer — придумывает идеи постов на основе ресёрча и брифа
- copywriter — пишет тексты постов в ToV: просто, без воды, с цифрами и личными историями, 300-800 знаков
- designer — генерит обложки в брендстиле
- analyst — снимает метрики опубликованных постов

ПРИНЦИП РАБОТЫ:
1. Ты сама решаешь что делать. Можешь вызвать tools, можешь ответить напрямую.
2. Цепочки: один tool может породить вызов другого. Например: запросить ресёрч → потом сгенерить идеи на его основе → потом написать пост по выбранной идее.
3. Если задача непонятна — задай ОДИН уточняющий вопрос, не вызывай tools.
4. Короткие ответы 1-3 предложения. Это чат, не статья.
5. Никаких эмодзи если только юзер сама не использует.
6. По-русски, по делу, без воды.
7. AUTO-APPROVE — Виктория НЕ хочет чтобы ты переспрашивала «согласна?», «делать?», «публикуем?», «уверена?», «готова продолжить?». Решила что нужно — делай. Покажи результат, не процесс. Исключение — Фаза 1 онбординга отдела (там специально нужны вопросы про бизнес для построения).

⚡️ СКОРОСТЬ И ПРОЗРАЧНОСТЬ:
- ПЕРЕД тем как звать долгий tool (researcher/marketer/copywriter — каждый по 30-60 сек) — сначала ОДНОЙ короткой фразой скажи юзеру что собираешься делать. Например: "Сейчас гляну свежие тренды и соберу контент-план — займёт минуту." Потом вызывай tool.
- НЕ дёргай get_research_insights если тема юзера не требует свежих трендов. Например для "напиши пост про чек-лист SMM" — НЕ нужен researcher, у тебя есть бренд-бриф.
- НЕ дёргай generate_ideas если юзер не просил идеи — например на "сделай контент-план" сразу пиши план в файл (kb_write), не нужны промежуточные идеи.
- Не вызывай tools параллельно если они зависят друг от друга. Параллельно ОК если независимы.

ВАЖНО про tools:
- get_research_insights — кешируется 10 мин, не вызывай повторно если только что получала
- generate_ideas — Маркетолог сам подтянет ресёрч, тебе не надо его вызывать перед
- write_post — для одной конкретной идеи; чтобы написать N постов, вызывай N раз параллельно
- search_kb — когда нужен реальный материал юзера (документы/файлы/посты)
- create_task — только когда юзер ясно просит поставить задачу кому-то
- read_chat — когда юзер ссылается на другой чат: «что я писала в СММ», «какие задачи у маркетолога», «глянь чат отдела». scope='smm' для СММ-отдела, 'general' для общих, 'free' для свободных.
- ask_agent — ⚡️ ДЕЛЕГИРУЙ задачу конкретному агенту отдела вместо того чтобы делать её сама. Это ключевая команда. Юзер собрал отдел чтобы агенты работали — не Mary. Триггеры делегации: «напиши контент-план / пост / текст» → Копирайтер (copywriter); «придумай идеи / темы» → Маркетолог (marketer); «сделай ресёрч / проанализируй канал X / какие сейчас тренды» → Ресерчер (researcher); «сделай обложку / нарисуй» → Дизайнер (designer); «отчёт за месяц» → Аналитик/Отчётный; «оквалифицируй лид» → Лид-квалификатор. Если отдел ещё не создан — сначала собери его (create_department + add_agent), потом делегируй. После tool ask_agent в финальном текстовом ответе передай результат от агента юзеру с короткой подводкой: «Передала Копирайтеру, вот что получилось:» + сам текст агента. НЕ ПЕРЕПИСЫВАЙ ответ агента — он отвечает СВОИМ голосом, со своей экспертизой.
- list_departments — посмотри какие отделы уже есть прежде чем создавать новый
- create_department — ТОЛЬКО когда юзер прямо просит создать отдел («создай отдел продаж»). Не создавай по своей инициативе.
- add_channel / add_agent / set_department_integrations — для разворачивания отдела (см. ONBOARDING ниже)
- add_pipeline_node / remove_pipeline_node / update_pipeline_node / connect_nodes / disconnect_nodes — для редактирования внутреннего pipeline агента (это его «процессная схема»: триггеры → шаги → LLM → выходы). См. PIPELINE-РЕДАКТИРОВАНИЕ ниже.
- publish_post — ⚠️ ТОЛЬКО когда юзер прямо просит ПОСТ В КАНАЛ. Триггеры: «опубликуй пост», «запости в канал», «напиши пост про X», «постни», «дай пост». «Помоги настроить X», «как мне делать Y», «нужна автоматизация Z» — это НЕ просьба про пост, не пиши и не публикуй! Если сомневаешься — НЕ ПУБЛИКУЙ, лучше задать уточняющий вопрос или предложить заведение отдела (см. ниже). После явного запроса на пост — auto-approve работает: можно одним тёрном write_post + publish_post без переспроса «публикуем?».

Ты — главная над всеми отделами. Можешь создавать новые отделы и разворачивать их по запросу.

🎯 ЗАПРОСЫ ВНЕ СММ → ПРЕДЛАГАЙ ЗАВЕСТИ ОТДЕЛ, не отказывайся!
Если юзер просит про продажи / поддержку / финансы / HR / логистику / юр / производство / IoT / e-com / контрагентов / автозаполнение / 1С / Битрикс / CRM / командировки и т.п. — НЕ ОТВЕЧАЙ «это не моя зона / у меня нет доступа / я только СММ». Это ВСЁ можно автоматизировать через создание соответствующего отдела с агентами и интеграциями.

Правильная реакция: «Вижу, нужен отдел [Продаж/HR/Поддержки/...]. Заведу под это отдельную команду — будет агент по [конкретике из запроса]. Расскажи коротко: [1 уточняющий вопрос про бизнес/масштаб]» — и дальше Phase 1 интервью (см. ниже). Триггер create_department приходит после 4+ собранных ответов.

ИСКЛЮЧЕНИЕ: если юзер прямо говорит «не нужно отдел, просто скажи как» — ОК, отвечай текстом без onboarding. Но первая реакция всегда — предложить отдел.

⚙️ SELF-ONBOARDING ОТДЕЛА (важно!):
Когда юзер просит создать отдел — ты ПРОДУКТ-МЕНЕДЖЕР на discovery-интервью. Не «исполнитель» который сразу строит. Сначала глубокое интервью, потом сборка.

ФАЗА 1: ИНТЕРВЬЮ — РОВНО ОДИН ВОПРОС НА СООБЩЕНИЕ + ВАРИАНТЫ ОТВЕТОВ

ЖЁСТКИЕ ПРАВИЛА:
1. В одном сообщении — РОВНО 1 вопрос, не больше. НЕ списком 2-5 пунктов, не «и ещё уточни Х». Один.
2. Под вопросом — 3-5 вариантов ответа. Формат зависит от типа вопроса:
   • SINGLE-CHOICE (один правильный ответ): нумерованный список "1. ... 2. ... 3. ...". Юзер кликнет один — он сразу отправится.
   • MULTI-CHOICE (можно отметить несколько): чек-лист "- [ ] вариант 1" / "- [ ] вариант 2". Фронт нарисует чекбоксы и кнопку «Отправить».
   Используй MULTI для вопросов вида «какие соцсети ведёшь?», «какие интеграции уже подключены?», «через какие каналы общаешься с клиентами?». SINGLE — для дискриминирующих: «консалтинг или агентство?», «сколько человек в команде?».
3. Минимум 4 раунда (4 разных вопроса) прежде чем трогать tools. Никаких create_department / list_departments в первых 4 ответах. Только текст.

Темы по порядку (один вопрос = одна тема, не смешивай):
1. Бизнес — что продаёте, какой масштаб
2. Текущий процесс — кто/как делает работу сейчас
3. Боль — что больше всего съедает время
4. Каналы — где работаете с клиентами
5. Инструменты — что уже подключено
6. Апруверы — кто принимает решения

ФОРМАТ КАЖДОГО ВОПРОСА (строго):

[короткий контекст 1 предложение если нужно]

**[Сам вопрос одной строкой]?**

1. [вариант ответа]
2. [вариант ответа]
3. [вариант ответа]
4. Другое — напиши своё

ПРИМЕР SINGLE-CHOICE (нумерованный):
«Окей, отдел Поддержки. Начнём с основного.

**Что у вас за продукт и масштаб?**

1. SaaS B2B, до 100 клиентов
2. SaaS B2B, 100-1000 клиентов
3. SaaS B2C, тысячи юзеров
4. Маркетплейс / e-commerce
5. Другое — расскажи»

ПРИМЕР MULTI-CHOICE (чек-лист):
«Через какие каналы клиенты сейчас вас находят и пишут?

- [ ] Telegram
- [ ] Instagram Direct
- [ ] Email
- [ ] WhatsApp
- [ ] Сайт (форма / чат)
- [ ] Звонки»

Адаптируй варианты под контекст из предыдущих ответов. Когда собрала 4+ ответа → Фаза 2.

ФАЗА 2: ПОСТЕПЕННАЯ СБОРКА — КАРТОЧКИ САМИ ГОВОРЯТ, ТЕКСТ КОРОТКИЙ

⚠️ В фазе сборки фронт показывает каждый канал/агент как ВИЗУАЛЬНУЮ КАРТОЧКУ с цветом, иконкой, названием и описанием из tasks/description. Юзеру не нужно читать длинные параграфы — он видит карточки. Поэтому твой ТЕКСТ в фазе сборки = МИНИМАЛЬНЫЙ.

⚠️ КРИТИЧНО: ОДИН TOOL НА ОДИН ТЁРН. Никаких 5-7 tool calls в одном response. Это даёт юзеру читать ритмично + карточки появляются по очереди.

ПРАВИЛЬНЫЙ ФОРМАТ ТЁРНА в фазе сборки:

Тёрн = 0-1 короткое предложение (≤10 слов) + ОДИН tool call.

Примеры:
✅ «Подключаю 1С.» → add_channel(1C, type=other)
✅ «Telegram для алертов.» → add_channel(Telegram, type=telegram)
✅ «Reconcile-агент — матчит банк с 1С.» → add_agent(role=Reconcile, tasks="ежедневный матчинг банк-выписки с 1С", systemPrompt="Ты — Reconcile-агент. Каждое утро забираешь банковскую выписку и оборотку из 1С, матчишь по сумме+дате+контрагенту. Расхождения >100₽ или без пары — флагуешь в Telegram-канал. На выходе — JSON: {matched: N, mismatched: [...], suspicious: [...]}.", model="claude-sonnet-4-6", tools=["google-sheets","knowledge-base"], memory="long", responseFormat="json")
✅ «Отчётный — месячный отчёт по бюджету.» → add_agent(role=Отчётный, tasks="ежемесячный отчёт: бюджет, налоги, cash flow", systemPrompt="Ты — финансовый отчётный агент. 1-го числа месяца собираешь данные из Google Sheets и 1С, считаешь дельты к плану по статьям, формируешь PDF-сводку с графиками. Ключевые метрики: revenue/burn/runway/MRR. Если burn вырос >15% к прошлому месяцу — отдельным абзацем причины.", model="claude-sonnet-4-6", tools=["google-sheets","knowledge-base"], memory="short", responseFormat="text")
✅ «Добавила интеграции — нужно подключить кнопкой ниже.» → set_department_integrations(...)

⚠️ systemPrompt — ОБЯЗАТЕЛЕН и подробен (5-15 предложений). Он становится «должностной инструкцией» агента, которую видит клиент на drill-down странице. Стиль: «Ты — [роль]. Твоя задача: [шаг 1]. Затем: [шаг 2]. На выходе: [формат]. Особые правила: [важные нюансы].» НЕ пиши «помогает с задачами» или «обрабатывает данные» — это пустые слова. Пиши конкретно: что забирает, что делает, что отдаёт.

⚠️ ВАЖНО про интеграции: НЕ говори «подключила AmoCRM», «AmoCRM подключена», «готово, всё работает». Это ЛОЖЬ — реального OAuth/подключения нет, ты только записала названия в БД. Юзер должен сам нажать кнопку «Подключить» на каждой интеграции в карточке. Правильная формулировка: «Добавила интеграции в шаблон отдела — каждую нужно подключить отдельно через кнопку рядом» или «Готово. Интеграции — каждую подключи кнопкой ниже, нужны OAuth/API ключи.»

📦 ФИНАЛЬНЫЙ ОТЧЁТ ПОСЛЕ СБОРКИ ОТДЕЛА (важно!):

Когда отдел собран (set_department_integrations выполнен), пиши последнее сообщение СТРУКТУРИРОВАННО через markdown. НЕ слипай в один абзац. Используй:

1) H1 заголовок: # ✅ [Имя] собран
2) Краткое описание 1 предложение что это за отдел
3) H2 секция "## 🏗 Архитектура" + fenced code block (тройные обратные кавычки) с ASCII-схемой workflow: Вход → Агент1 → Агент2 → Выход
4) H2 секция "## 👥 Команда" + markdown-таблица с колонками Агент / Задача — по строке на каждого добавленного агента (используй РЕАЛЬНЫЕ имена из твоих add_agent calls, не выдумывай)
5) H2 секция "## 📦 На выходе" + bullet list (- item) с артефактами что отдел производит
6) ОБЯЗАТЕЛЬНО кликабельная кнопка-ссылка на отдел: [Открыть [Имя] →](dept://[id отдела из create_department]). Например: [Открыть СММ →](dept://smm). Это спецссылка — фронт превратит её в кнопку которая откроет страницу отдела.
7) В конце 3-5 нумерованных вариантов "что дальше" (1. ... 2. ... 3. ...) — юзер кликнет один. Например: Прогнать тестовый кейс / Подключить интеграции / Настроить шаблоны / Сгенерить первый результат.

КРИТИЧНО:
- Каждая секция — отдельным абзацем (двойной перевод строки между блоками).
- Таблица — обязательно с | --- | --- | разделителем после header.
- ASCII-схема в code-block — стрелки ↓ или → между шагами.
- Никакого слипшегося текста "Готово, X собран. Подключаю Y. Лид-квалификатор фильтрует... CRM-ассистент снимает рутину..." — это плохо.

ПЛОХО (так НЕ надо):
❌ Параграф «Окей, собираю отдел. Начну с каналов — основной это Email, куда сыплются все запросы. Теперь Telegram для алертов чтобы агенты могли уведомлять. Каналы готовы. Перехожу к агентам. Первый — Триаж-агент он будет читать входящие email...» (ВСЁ это в одном тёрне с 7 параллельными add_*)
❌ Длинные описания зачем нужен агент — это пишется в args.tasks, фронт сам отрисует
❌ Текст «Подключаю Email — куда сыплются все запросы клиентов и т.д.» — описание идёт в description/tasks поле tool call, не в текст ответа

ШАГИ:
- Первый tool в фазе сборки — list_departments (проверка дубликатов)
- Если отдел не найден — следующий тёрн create_department с короткой фразой «Создаю отдел [Имя].»
- Дальше каждый канал — отдельный тёрн (добавь в args.type правильный из {telegram, email, other, support})
- Каждый агент — отдельный тёрн (детальное описание роли в args.tasks, не в тексте)
- Финал — set_department_integrations + одна фраза «Готово, [Имя] собран.»

ИТОГ: для отдела с 2 каналами + 3 агентами получится ~8 тёрнов вместо 1 простыни.

🔧 PIPELINE-РЕДАКТИРОВАНИЕ (важно):

У каждого агента есть внутренний pipeline — граф из узлов 4 типов:
- trigger — источник данных (список каналов, расписание cron, контекст бренда)
- step — обработка (Сборщик, Дедупликатор, Скорер)
- llm — LLM-узел (Фильтр релевантности, Кластеризатор, Синтезатор инсайтов)
- output — куда уходит результат (БЗ, другой агент, сам в источники)

Юзер НЕ может править граф через UI (нет drag&drop). Только через тебя в чате. Когда юзер говорит «добавь Ресерчеру шаг проверки на спам» / «убери Дедупликатор» / «увеличь вес комментов в Скорере» / «пусть Скорер отдаёт сразу в Синтезатор минуя Кластеризатор» — используй pipeline-tools:

- add_pipeline_node({ deptId, agentId, type, title, sub, settings, after }) — добавить узел. after = id предыдущего узла (создаст edge after→new).
- remove_pipeline_node({ deptId, agentId, nodeId }) — удалить узел и все его edges.
- update_pipeline_node({ deptId, agentId, nodeId, patch }) — поправить title/sub/settings. patch.settings мерджится поверх.
- connect_nodes({ deptId, agentId, from, to }) — добавить связь.
- disconnect_nodes({ deptId, agentId, from, to }) — удалить связь.

Чтобы найти id узла — посмотри текущий pipeline через list_departments (там есть agents[].pipeline.nodes с id).

После каждого изменения кратко: «Добавила узел "Спам-фильтр" между Дедупликатором и Фильтром релевантности — граф перерисовался.»

🎯 WORKFLOW-ПОЛИТИКА ОТДЕЛА (важно!):

Каждый отдел имеет policy: ownerPerThread, maxVotes (обычно 2), publicBlockers, weeklyMemo. Применяй её автоматически:

1. **Owner на тред.** При новом обсуждении в чате отдела (новый conversation со scope=deptId) — если policy.ownerPerThread и owner ещё не назначен — спроси «Кто owner этого треда?» (1 раз, в начале). Дальше assign_thread_owner. Без owner тред не «живой» — все рекомендации/решения должны быть привязаны к owner.

2. **Два голоса на решение.** Когда юзер пишет в треде «согласна», «ок», «+1», «👍», «против» по конкретному предложению — вызови record_vote с параметром decision=формулировка обсуждаемого решения. После policy.maxVotes одинаковых голосов «for» тред автоматически закрывается + add_decision. Скажи: «2/2 за — решение «X» принято и записано».

3. **Публичные блокеры.** Если в треде кто-то говорит «не могу продолжить», «жду от X», «застрял на Y» — это блокер. Вызови flag_blocker — если policy.publicBlockers=true, моментально летит в TG (Виктория видит). Скажи: «Поставила блокер «X» — Виктория уведомлена в TG».

4. **Decision log.** Любое принятое решение — одна короткая строка через add_decision. Это long-term память отдела: «решили перейти с Notion на Linear, 12 мая», «дед-лайн релиза — 25 мая, owner: Виктория».

5. **Еженедельный memo.** В понедельник утром (или по запросу) — weekly_memo(deptId). Соберёт: решено / в работе / блокеры / следующие шаги за неделю. Запишет в БЗ как файл "Memo · [Имя] · [дата].md". Скажи юзеру «Готов еженедельный memo по [Отделу] — лежит в БЗ».

Эти 5 правил — фундамент. Не «забывай» о них. Если новый отдел создан без policy — используется дефолт. Если юзер просит изменить — set_workflow_policy.

ФАЙЛЫ В БЗ (важно):
У тебя есть полноценная файловая система БЗ. Используй её для долгосрочных артефактов.
- kb_list — посмотри что уже есть, прежде чем создавать
- kb_read — прочитать существующий файл (бренд-бриф, прошлый план)
- kb_write — создать или ОБНОВИТЬ файл (всегда .md, всегда полный текст)

Когда юзер просит контент-план, гайд, заметку, чек-лист, любой структурированный артефакт на несколько дней/недель — НЕ пиши длинный ответ в чат. Вместо этого:
1. kb_list → посмотри существующие
2. Если файл с похожим именем есть — kb_read → прочти → обнови (kb_write с новым содержимым)
3. Если нет — kb_write новый
4. В чат верни 1-2 предложения «обновила X» или «создала Y» с указанием имени файла.

Это даёт юзеру: документ в БЗ который можно открыть, обновлять и переиспользовать. Не теряется в чате.

Формат файлов: всегда markdown с заголовками, таблицами (| col | col |), списками. Имя описательное: 'Контент-план на 14 дней — Фитнес.md', 'Гайд по ToV — Mary.md'.`;

// ── Реализация tool-функций (мост к существующим endpoint'ам) ──
const TOOL_HANDLERS = {
  async get_research_insights(args = {}) {
    const insights = await getInsightsCached(600);
    if (!insights) return { error: "researcher unavailable" };
    return {
      themes: insights.themes || [],
      formats: insights.formats || [],
      observations: insights.observations || [],
      sampleSize: insights.sampleSize,
      lookbackDays: insights.lookbackDays,
    };
  },
  async generate_ideas(args = {}) {
    const r = await fetch(`http://127.0.0.1:${PORT}/webhook/mary/marketer/ideate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: args.count || 4, brief: args.brief || "" }),
    });
    if (!r.ok) return { error: `marketer ${r.status}` };
    const d = await r.json();
    return { items: d.items || [], basedOn: d.basedOn };
  },
  async write_post(args = {}) {
    if (!args.idea) return { error: "idea required" };
    const r = await fetch(`http://127.0.0.1:${PORT}/webhook/mary/copywriter/write`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea: args.idea }),
    });
    if (!r.ok) return { error: `copywriter ${r.status}` };
    const d = await r.json();
    return { body: d.body, length: d.length };
  },
  async search_kb(args = {}) {
    // TODO: настоящий RAG (Этап 3 спринта). Пока mock.
    return { found: 0, results: [], note: "KB search будет на этапе 3 (RAG)" };
  },
  async create_task(args = {}) {
    try {
      const t = taskCreate({
        title: args.title || args.description?.slice(0, 80) || "Без названия",
        description: args.description || "",
        deptId: args.deptId || "general",
        ownerId: args.assignee || args.ownerId || null,
        dueDate: args.deadline || args.dueDate || null,
        priority: args.priority || "normal",
        source: args.source || { type: "mary" },
        status: args.status || "backlog",
      });
      return { ok: true, task: t };
    } catch (e) { return { error: e.message }; }
  },
  async kb_list() {
    return { files: kbList() };
  },
  async kb_read(args = {}) {
    if (!args.name) return { error: "name required" };
    const content = kbRead(args.name);
    if (content === null) return { error: "not found", name: args.name };
    return { name: args.name, content, length: content.length };
  },
  async kb_write(args = {}) {
    if (!args.name) return { error: "name required" };
    if (typeof args.content !== "string") return { error: "content required" };
    try {
      const r = kbWrite(args.name, args.content);
      return { ok: true, ...r };
    } catch (e) {
      return { error: e.message };
    }
  },
  async list_departments() {
    return loadDepartments();
  },
  async create_department(args = {}) {
    try {
      const d = deptCreate(args);
      return { ok: true, department: d };
    } catch (e) {
      return { error: e.message };
    }
  },
  async add_channel(args = {}) {
    try {
      const channel = deptAddChannel(args.deptId, { name: args.name, type: args.type || "other" });
      const data = loadDepartments();
      const department = data.departments.find(d => d.id === args.deptId);
      return { ok: true, channel, department };
    } catch (e) { return { error: e.message }; }
  },
  async add_agent(args = {}) {
    try {
      const agent = deptAddAgent(args.deptId, {
        role: args.role,
        color: args.color || "#7A86FF",
        tasks: args.tasks || "",
        model: args.model,
        systemPrompt: args.systemPrompt,
        tools: args.tools,
        memory: args.memory,
        responseFormat: args.responseFormat,
      });
      const data = loadDepartments();
      const department = data.departments.find(d => d.id === args.deptId);
      return { ok: true, agent, department };
    } catch (e) { return { error: e.message }; }
  },
  async set_department_integrations(args = {}) {
    try { return { ok: true, department: deptSetIntegrations(args.deptId, args.integrations || []) }; }
    catch (e) { return { error: e.message }; }
  },
  async add_pipeline_node(args = {}) {
    try {
      const { deptId, agentId, type, title, sub = "", settings = {}, after } = args;
      const r = pipelineAddNode(deptId, agentId, { type, title, sub, settings }, after);
      return { ok: true, agent: r.agent, department: r.dept };
    } catch (e) { return { error: e.message }; }
  },
  async remove_pipeline_node(args = {}) {
    try {
      const r = pipelineRemoveNode(args.deptId, args.agentId, args.nodeId);
      return { ok: true, agent: r.agent, department: r.dept };
    } catch (e) { return { error: e.message }; }
  },
  async update_pipeline_node(args = {}) {
    try {
      const r = pipelineUpdateNode(args.deptId, args.agentId, args.nodeId, args.patch || {});
      return { ok: true, agent: r.agent, department: r.dept };
    } catch (e) { return { error: e.message }; }
  },
  async connect_nodes(args = {}) {
    try {
      const r = pipelineConnect(args.deptId, args.agentId, args.from, args.to);
      return { ok: true, agent: r.agent, department: r.dept };
    } catch (e) { return { error: e.message }; }
  },
  async disconnect_nodes(args = {}) {
    try {
      const r = pipelineDisconnect(args.deptId, args.agentId, args.from, args.to);
      return { ok: true, agent: r.agent, department: r.dept };
    } catch (e) { return { error: e.message }; }
  },
  async set_workflow_policy(args = {}) {
    try {
      const { dd, d, save } = deptPolicy(args.deptId);
      for (const k of ["ownerPerThread", "maxVotes", "publicBlockers", "weeklyMemo"]) {
        if (args[k] !== undefined) d.policy[k] = args[k];
      }
      save();
      return { ok: true, policy: d.policy };
    } catch (e) { return { error: e.message }; }
  },
  async assign_thread_owner(args = {}) {
    try {
      const { c, save } = convWorkflow(args.threadId);
      c.workflow.ownerId = args.ownerId;
      save();
      return { ok: true, ownerId: args.ownerId };
    } catch (e) { return { error: e.message }; }
  },
  async record_vote(args = {}) {
    try {
      const { c, save } = convWorkflow(args.threadId);
      c.workflow.votes.push({ by: args.by, vote: args.vote, ts: new Date().toISOString() });
      // Если деп есть и набрали maxVotes "for" — автоматом close + decision
      let auto = null;
      const scope = c.scope || "general";
      const deptId = scope.startsWith("smm") ? "smm" : scope.split("/")[0];
      try {
        const { d } = deptPolicy(deptId);
        const max = d.policy.maxVotes || 2;
        const fors = c.workflow.votes.filter(v => v.vote === "for").length;
        if (fors >= max && !c.workflow.closed && args.decision) {
          c.workflow.decisions.push({ text: args.decision, ts: new Date().toISOString() });
          c.workflow.closed = true;
          auto = "тред закрыт, решение записано";
        }
      } catch {}
      save();
      return { ok: true, votes: c.workflow.votes.length, autoClose: auto };
    } catch (e) { return { error: e.message }; }
  },
  async flag_blocker(args = {}) {
    try {
      const { c, save } = convWorkflow(args.threadId);
      const blocker = { reason: args.reason, ts: new Date().toISOString() };
      let posted = false;
      try {
        const deptId = args.deptId || (c.scope || "").split("/")[0] || "general";
        const { d } = deptPolicy(deptId);
        if (d.policy.publicBlockers) {
          await tgAlert(`🚨 БЛОКЕР · отдел ${d.name}\nТред: ${c.title}\nПричина: ${args.reason}`);
          blocker.public = true;
          posted = true;
        }
      } catch {}
      c.workflow.blockers.push(blocker);
      save();
      return { ok: true, postedToTg: posted };
    } catch (e) { return { error: e.message }; }
  },
  async add_decision(args = {}) {
    try {
      const { c, save } = convWorkflow(args.threadId);
      c.workflow.decisions.push({ text: args.text, ts: new Date().toISOString() });
      save();
      return { ok: true, total: c.workflow.decisions.length };
    } catch (e) { return { error: e.message }; }
  },
  async weekly_memo(args = {}) {
    try {
      const { d } = deptPolicy(args.deptId);
      const since = Date.now() - 7 * 86400000;
      const allConvs = loadConversations().conversations
        .filter(c => (c.scope || "").startsWith(args.deptId));
      const decisions = [], blockers = [], inProgress = [];
      for (const c of allConvs) {
        const w = c.workflow || {};
        for (const dec of (w.decisions || [])) {
          if (new Date(dec.ts).getTime() >= since) decisions.push(`- ${dec.text} _(${c.title})_`);
        }
        for (const b of (w.blockers || [])) {
          if (new Date(b.ts).getTime() >= since) blockers.push(`- ${b.reason} _(${c.title})_`);
        }
        if (!w.closed && new Date(c.updatedAt).getTime() >= since) {
          inProgress.push(`- ${c.title}${w.ownerId ? ` · owner: ${w.ownerId}` : ""}`);
        }
      }
      const week = new Date().toLocaleDateString("ru", { day: "numeric", month: "short" });
      const body = `# Memo · ${d.name} · ${week}\n\n## ✅ Решено (${decisions.length})\n${decisions.join("\n") || "_пусто_"}\n\n## 🔄 В работе (${inProgress.length})\n${inProgress.join("\n") || "_пусто_"}\n\n## 🚨 Блокеры (${blockers.length})\n${blockers.join("\n") || "_пусто_"}\n\n## ➡ Следующие шаги\n_допиши вручную или попроси Mary_\n`;
      const name = `Memo · ${d.name} · ${week}.md`;
      kbWrite(name, body);
      return { ok: true, file: name, counts: { decisions: decisions.length, inProgress: inProgress.length, blockers: blockers.length } };
    } catch (e) { return { error: e.message }; }
  },
  async read_chat(args = {}) {
    if (!args.scope) return { error: "scope required" };
    const limit = Math.min(Math.max(Number(args.limit) || 20, 1), 50);
    const data = loadConversations();
    // Берём конверсации с этим scope (или с префиксом — 'smm' матчит и 'smm/tg-kanal')
    const matches = data.conversations
      .filter(c => c.scope === args.scope || c.scope.startsWith(args.scope + "/"));
    if (matches.length === 0) {
      return { found: 0, scope: args.scope, messages: [], note: "нет чатов в этом scope" };
    }
    // Самая свежая конверсация
    const conv = matches.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    const msgs = conv.messages.slice(-limit).map(m => ({
      role: m.role,
      text: (m.text || "").slice(0, 500),
      ts: m.ts,
    }));
    return {
      conversationId: conv.id,
      title: conv.title,
      scope: conv.scope,
      messages: msgs,
      total: conv.messages.length,
      returned: msgs.length,
    };
  },
  async ask_agent(args = {}) {
    try {
      const { deptId, agentId, task, context = "" } = args;
      if (!deptId || !agentId || !task) return { error: "deptId, agentId, task — обязательны" };
      const data = loadDepartments();
      const dept = data.departments.find(d => d.id === deptId);
      if (!dept) return { error: `отдел '${deptId}' не найден` };
      const agent = (dept.agents || []).find(a => a.id === agentId);
      if (!agent) return { error: `агент '${agentId}' в отделе '${deptId}' не найден` };
      const sysPrompt = agent.systemPrompt || `Ты — ${agent.role} отдела ${dept.name}.`;
      const userMsg = context ? `${task}\n\n--- Дополнительный контекст ---\n${context}` : task;
      // Модель агента → ID для OpenRouter. Маппинг короткое-имя → полный slug.
      const modelMap = {
        "claude-sonnet-4-6": "anthropic/claude-sonnet-4",
        "gpt-4.1": "openai/gpt-4.1",
        "z-ai/glm-5.1": "z-ai/glm-5.1",
      };
      const model = modelMap[agent.model] || agent.model || OPENROUTER_MODEL;
      if (!OPENROUTER_API_KEY) {
        // Fallback без LLM — заглушка
        return {
          agentId, agentRole: agent.role, agentColor: agent.color, deptId,
          output: `[mock] ${agent.role} получил задачу: "${task}". Без OPENROUTER_API_KEY реального вызова не будет.`,
          model: agent.model, tools: agent.tools || [],
        };
      }
      const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://77.237.241.242",
          "X-Title": `Mary · ${agent.role}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: sysPrompt },
            { role: "user",   content: userMsg },
          ],
          temperature: 0.7,
          max_tokens: agent.responseFormat === "json" ? 1500 : 1200,
        }),
      });
      if (!r.ok) {
        const errText = (await r.text()).slice(0, 200);
        return { error: `LLM ${r.status}: ${errText}`, agentId, agentRole: agent.role };
      }
      const d = await r.json();
      const output = d.choices?.[0]?.message?.content || "(пустой ответ)";
      return {
        agentId, agentRole: agent.role, agentColor: agent.color || "#7A86FF", deptId,
        output, model: agent.model, tools: agent.tools || [],
        usage: d.usage || null,
      };
    } catch (e) { return { error: e.message }; }
  },
  async publish_post(args = {}) {
    if (!args.text) return { error: "text required" };
    const target = args.channel || TELEGRAM_PUBLISH_CHAT;
    if (!target) return { error: "no channel set (TELEGRAM_PUBLISH_CHAT in .env)" };
    const r = await tgSend(target, args.text, { parseMode: "HTML" });
    if (r.error || !r.ok) {
      tgAlert(`Не смогла опубликовать пост в ${target}:\n${r.description || r.error}`);
      return { ok: false, error: r.description || r.error };
    }
    const m = r.result;
    const url = `https://t.me/${String(target).replace(/^@/, "")}/${m.message_id}`;
    tgAlert(`Опубликовала пост в ${target}: ${url}`);
    return { ok: true, messageId: m.message_id, channel: target, url };
  },
};

// ── Agent loop: Mary с tools ──────────────────────────────
// Подпись tool call для детекции дубликатов в одном тёрне.
function toolSignature(name, args) {
  const sorted = JSON.stringify(args, Object.keys(args || {}).sort());
  return `${name}::${sorted}`;
}

// Если последние 3 шага = те же N tool calls, значит зацикливание — стоп.
function detectsLoop(trace) {
  if (trace.length < 6) return false;
  const last6 = trace.slice(-6).map(t => toolSignature(t.name, t.args));
  // Проверяем что шесть последних — повторение пары
  return last6[0] === last6[2] && last6[2] === last6[4]
      && last6[1] === last6[3] && last6[3] === last6[5];
}

async function runAgent({ message, history, maxSteps = 15 }) {
  const messages = [
    { role: "system", content: MARY_SYSTEM_AGENT },
    ...history.slice(-30).map(h => ({
      role: h.agentId === "user" ? "user" : "assistant",
      content: h.text || "",
    })).filter(m => m.content),
    { role: "user", content: message },
  ];
  const trace = [];
  const seenSignatures = new Set();
  let lastTextChunk = "";

  for (let step = 0; step < maxSteps; step++) {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://77.237.241.242",
        "X-Title": "Mary Agent",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages,
        tools: MARY_TOOLS,
        tool_choice: "auto",
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });
    if (!r.ok) throw new Error(`OpenRouter ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const data = await r.json();
    const choice = data.choices?.[0];
    const msg = choice?.message;
    console.log(`[agent step=${step}] finish=${choice?.finish_reason} tools=${msg?.tool_calls?.length || 0} text=${(msg?.content || "").length}`);

    if (!msg) break;

    if (msg.content) lastTextChunk = msg.content;

    // Если есть tool_calls — выполняем все параллельно (с антидублем)
    if (msg.tool_calls && msg.tool_calls.length > 0) {
      messages.push({ role: "assistant", content: msg.content || "", tool_calls: msg.tool_calls });
      const toolResults = await Promise.all(msg.tool_calls.map(async tc => {
        const fnName = tc.function?.name;
        let args = {};
        try { args = JSON.parse(tc.function?.arguments || "{}"); } catch {}
        const sig = toolSignature(fnName, args);
        const tStart = Date.now();
        let result;
        let isDuplicate = false;
        if (seenSignatures.has(sig)) {
          isDuplicate = true;
          result = { error: "DUPLICATE_CALL", message: "Этот tool с такими же аргументами уже вызван в этом тёрне. Используй уже полученный результат и переходи к ответу." };
        } else {
          seenSignatures.add(sig);
          const handler = TOOL_HANDLERS[fnName];
          try {
            result = handler ? await handler(args) : { error: `unknown tool ${fnName}` };
          } catch (e) {
            result = { error: e.message };
          }
        }
        const traceEntry = { step, name: fnName, args, result, durationMs: Date.now() - tStart, ok: !result.error, duplicate: isDuplicate };
        trace.push(traceEntry);
        console.log(`[agent tool] ${fnName}(${JSON.stringify(args).slice(0, 80)}) → ${traceEntry.durationMs}ms ok=${traceEntry.ok}${isDuplicate ? " DUPLICATE" : ""}`);
        return { tool_call_id: tc.id, role: "tool", name: fnName, content: JSON.stringify(result) };
      }));
      messages.push(...toolResults);
      // Антипетля: если последние 6 trace entries это повторение пары (A,B,A,B,A,B) — стоп
      if (detectsLoop(trace)) {
        console.log(`[agent] LOOP DETECTED at step ${step}, breaking with fallback`);
        break;
      }
      continue;
    }

    // Нет tool_calls — это финальный текстовый ответ
    return {
      text: msg.content || "",
      trace,
      model: data.model,
      steps: step + 1,
    };
  }
  // Graceful fallback — отдаём то что собрали + честное «прервалась»
  const fallback = lastTextChunk
    ? `${lastTextChunk}\n\n_(прервалась на полпути — много шагов. Уточни запрос или скажи «продолжай», и я доделаю.)_`
    : "Запутывалась в этой задаче слишком долго и остановилась. Дай задачу проще или уточни что именно нужно — попробую ещё раз.";
  return { text: fallback, trace, steps: maxSteps };
}

// ── Streaming agent: SSE ─────────────────────────────────
async function runAgentStream({ message, history, maxSteps = 15, emit }) {
  const messages = [
    { role: "system", content: MARY_SYSTEM_AGENT },
    ...history.slice(-30).map(h => ({
      role: h.agentId === "user" ? "user" : "assistant",
      content: h.text || "",
    })).filter(m => m.content),
    { role: "user", content: message },
  ];
  const trace = [];
  const seenSignatures = new Set();
  let finalText = "";
  let lastTextChunk = "";

  for (let step = 0; step < maxSteps; step++) {
    emit("step_start", { step });
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://77.237.241.242",
        "X-Title": "Mary Agent Stream",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages,
        tools: MARY_TOOLS,
        tool_choice: "auto",
        temperature: 0.7,
        max_tokens: 1500,
        stream: true,
      }),
    });
    if (!r.ok) throw new Error(`OpenRouter ${r.status}: ${(await r.text()).slice(0, 200)}`);

    // Парсинг SSE стрима OpenRouter
    let collectedText = "";
    let collectedToolCalls = []; // [{id, function:{name, arguments(string)}}]
    let finishReason = null;
    const reader = r.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") continue;
        try {
          const chunk = JSON.parse(payload);
          const delta = chunk.choices?.[0]?.delta;
          if (chunk.choices?.[0]?.finish_reason) finishReason = chunk.choices[0].finish_reason;
          if (delta?.content) {
            collectedText += delta.content;
            emit("text_delta", { delta: delta.content });
          }
          if (delta?.tool_calls) {
            for (const tc of delta.tool_calls) {
              const idx = tc.index ?? 0;
              collectedToolCalls[idx] = collectedToolCalls[idx] || { id: tc.id, function: { name: "", arguments: "" } };
              if (tc.id) collectedToolCalls[idx].id = tc.id;
              if (tc.function?.name) collectedToolCalls[idx].function.name += tc.function.name;
              if (tc.function?.arguments) collectedToolCalls[idx].function.arguments += tc.function.arguments;
            }
          }
        } catch { /* malformed chunk, skip */ }
      }
    }

    console.log(`[stream step=${step}] finish=${finishReason} text=${collectedText.length} tools=${collectedToolCalls.length}`);

    if (collectedText) lastTextChunk = collectedText;

    if (collectedToolCalls.length > 0) {
      messages.push({ role: "assistant", content: collectedText, tool_calls: collectedToolCalls });
      const toolResults = await Promise.all(collectedToolCalls.map(async tc => {
        const fnName = tc.function?.name;
        let args = {};
        try { args = JSON.parse(tc.function?.arguments || "{}"); } catch {}
        const sig = toolSignature(fnName, args);
        emit("tool_start", { name: fnName, args, id: tc.id });
        const tStart = Date.now();
        let result;
        let isDuplicate = false;
        if (seenSignatures.has(sig)) {
          isDuplicate = true;
          result = { error: "DUPLICATE_CALL", message: "Этот tool с такими же аргументами уже вызван в этом тёрне. Используй уже полученный результат и переходи к ответу." };
        } else {
          seenSignatures.add(sig);
          const handler = TOOL_HANDLERS[fnName];
          try {
            result = handler ? await handler(args) : { error: `unknown tool ${fnName}` };
          } catch (e) {
            result = { error: e.message };
          }
        }
        const dur = Date.now() - tStart;
        const ok = !result.error;
        const traceEntry = { step, name: fnName, args, result, durationMs: dur, ok, duplicate: isDuplicate };
        trace.push(traceEntry);
        emit("tool_end", { name: fnName, durationMs: dur, ok, result, duplicate: isDuplicate });
        console.log(`[stream tool] ${fnName} → ${dur}ms ok=${ok}${isDuplicate ? " DUPLICATE" : ""}`);
        return { tool_call_id: tc.id, role: "tool", name: fnName, content: JSON.stringify(result) };
      }));
      messages.push(...toolResults);
      if (detectsLoop(trace)) {
        console.log(`[stream] LOOP DETECTED at step ${step}, breaking with fallback`);
        break;
      }
      continue;
    }

    finalText = collectedText;
    return { text: finalText, trace, steps: step + 1 };
  }
  // Graceful fallback вместо «Слишком много шагов» — отдаём что есть + честно
  const fallback = lastTextChunk
    ? `${lastTextChunk}\n\n_(прервалась на полпути — много шагов. Уточни запрос или скажи «продолжай», и я доделаю.)_`
    : "Запутывалась в этой задаче слишком долго и остановилась. Дай задачу проще или уточни что именно нужно — попробую ещё раз.";
  // Эмитим как text_delta, чтобы стрим-клиент увидел текст
  if (!lastTextChunk) emit("text_delta", { delta: fallback });
  else emit("text_delta", { delta: "\n\n_(прервалась на полпути — много шагов. Уточни запрос или скажи «продолжай», и я доделаю.)_" });
  return { text: fallback, trace, steps: maxSteps };
}

app.post("/webhook/mary/agent/stream", async (req, res) => {
  const { message = "", history = [], conversationId } = req.body || {};
  if (!OPENROUTER_API_KEY) return res.status(503).json({ error: "LLM not configured" });

  // Если передан conversationId — берём историю с бэка (а не из request body)
  let actualHistory = history;
  if (conversationId) {
    const conv = convGet(conversationId);
    if (conv) {
      actualHistory = conv.messages.map(m => ({
        agentId: m.role === "user" ? "user" : "mary",
        text: m.text || "",
      }));
      // Сохраняем user-сообщение в conv
      convAppend(conversationId, { role: "user", text: message });
    }
  }

  // SSE setup
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // отключаем буферизацию nginx
  res.flushHeaders?.();

  const emit = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const start = Date.now();
  emit("connected", { ts: start, conversationId });
  try {
    const result = await runAgentStream({ message, history: actualHistory, emit });
    if (conversationId) {
      convAppend(conversationId, {
        role: "mary",
        text: result.text || "",
        trace: result.trace || [],
      });
    }
    emit("done", {
      text: result.text,
      trace: result.trace,
      steps: result.steps,
      durationMs: Date.now() - start,
      conversationId,
    });
  } catch (e) {
    console.error("[stream] error:", e.message);
    emit("error", { message: e.message });
    tgAlert(`Stream error: ${e.message}`);
  }
  res.end();
});

// ── Sandbox runner: прогон pipeline агента ──────────────
// Берёт inputs от юзера, топ-сортит nodes, прогоняет каждый по типу,
// стримит SSE: node_start / node_end / done.
// dryRun=true — LLM не вызывается, mock ответы (бесплатно для проверки flow).
function topoSort(pipeline) {
  const { nodes, edges } = pipeline;
  const inDeg = Object.fromEntries(nodes.map(n => [n.id, 0]));
  const adj = {};
  for (const [from, to] of edges || []) {
    if (inDeg[to] !== undefined) inDeg[to]++;
    (adj[from] = adj[from] || []).push(to);
  }
  const out = [];
  const queue = nodes.filter(n => inDeg[n.id] === 0);
  while (queue.length) {
    const n = queue.shift();
    out.push(n);
    for (const next of adj[n.id] || []) {
      if (--inDeg[next] === 0) queue.push(nodes.find(x => x.id === next));
    }
  }
  return out;
}
async function runSandbox({ deptId, agentId, inputs = {}, dryRun = false, emit, costAcc }) {
  const data = loadDepartments();
  const dept = data.departments.find(d => d.id === deptId);
  if (!dept) throw new Error(`отдел '${deptId}' не найден`);
  const agent = (dept.agents || []).find(a => a.id === agentId);
  if (!agent) throw new Error(`агент '${agentId}' не найден`);
  if (!agent.pipeline?.nodes?.length) throw new Error("у агента нет pipeline");

  const sorted = topoSort(agent.pipeline);
  const outputs = {}; // nodeId → текст output

  // Собираем outputs предыдущих узлов как контекст для текущего
  const contextFor = (nodeId) => {
    const incoming = (agent.pipeline.edges || []).filter(([_, to]) => to === nodeId).map(([from]) => from);
    return incoming.map(id => `[${id}]: ${outputs[id] || "(пусто)"}`).join("\n");
  };

  for (const node of sorted) {
    const start = Date.now();
    emit("node_start", { nodeId: node.id, type: node.type, title: node.title });
    let output = "";
    let nodeCost = 0;
    let nodeTokens = 0;
    try {
      if (node.type === "trigger") {
        output = inputs[node.id] || node.settings?.placeholder || `(${node.title})`;
      } else if (node.type === "step") {
        output = `${node.title} → обработано (вход: ${contextFor(node.id).slice(0, 100)}…)`;
      } else if (node.type === "llm") {
        if (dryRun) {
          output = `[DRY] ${node.title} — пропуск LLM-вызова, mock-ответ`;
        } else {
          const sys = `Ты — узел "${node.title}" (${node.sub || "обработчик"}) внутри pipeline агента "${agent.role}". Делай только свою функцию, кратко.`;
          const usr = `Контекст от предыдущих узлов:\n${contextFor(node.id)}\n\nВыполни свою функцию и верни результат.`;
          const r = await callLLM({ system: sys, user: usr, jsonMode: false, maxTokens: 500, label: `sandbox/${node.id}`, returnUsage: true });
          output = r.content;
          nodeTokens = r.usage?.total_tokens || 0;
          nodeCost = estimateCostUsd(r.usage, r.model);
          if (costAcc) { costAcc.tokens += nodeTokens; costAcc.usd += nodeCost; }
        }
      } else if (node.type === "output") {
        output = `→ ${node.settings?.target || "результат"}: ${contextFor(node.id).slice(0, 200)}`;
      }
      outputs[node.id] = output;
      emit("node_end", { nodeId: node.id, ok: true, output, durationMs: Date.now() - start, tokens: nodeTokens, costUsd: nodeCost });
    } catch (e) {
      emit("node_end", { nodeId: node.id, ok: false, error: e.message, durationMs: Date.now() - start });
    }
  }
  emit("done", { outputs });
  return outputs;
}

// Песочница всего отдела: цепочка агентов (output одного → input следующего).
const DEFAULT_AGENT_ORDER = ["researcher", "marketer", "copywriter", "designer", "analyst"];

// ── Транскрипты созвонов ────────────────────────────────
function loadTranscripts() {
  try { return JSON.parse(fs.readFileSync(TRANSCRIPTS_FILE, "utf8")); } catch { return { items: [] }; }
}
function saveTranscripts(data) {
  fs.mkdirSync(path.dirname(TRANSCRIPTS_FILE), { recursive: true });
  fs.writeFileSync(TRANSCRIPTS_FILE, JSON.stringify(data, null, 2), "utf8");
}

// Mock-транскрипт когда нет Whisper-ключа. Реалистичный созвон команды
// с триггерами под workflow (блокер / голосование / решение / задачи).
const MOCK_TRANSCRIPT = `[00:00] Виктория: Окей, начинаем стендап. Что у нас по релизу новой фичи AI-агенты?
[00:18] Александр: Бекенд готов на 80%. Осталось обработка ошибок и тесты. Дедлайн — пятница.
[00:35] Мария: Дизайн готов, передала Александру 2 дня назад. Жду фронт.
[00:58] Александр: Фронт... я застрял на интеграции с auth-сервисом, не могу пройти OAuth. Сижу второй день.
[01:18] Виктория: Это блокер. Когда найдёшь причину — отпиши.
[01:32] Мария: Давайте сдвинем релиз на следующий понедельник? Будет безопаснее, успеем фронт доделать.
[01:48] Александр: Согласен. Лучше сдвинуть.
[01:55] Виктория: Я тоже за. Решено — релиз 26 мая. Александр координирует, ты теперь owner релиза.
[02:14] Виктория: По воркшопу для команды в среду — кто идёт?
[02:26] Александр: Я приду.
[02:30] Мария: Я тоже.
[02:36] Виктория: Окей, едем все. Заодно нужно подготовить демо для воркшопа — Мария, возьмёшь на себя?
[02:50] Мария: Да, до вторника сделаю.
[03:02] Виктория: Хорошо. По метрикам прошлой недели — Александр, обновишь дашборд?
[03:15] Александр: Завтра соберу.
[03:20] Виктория: Спасибо всем. Идём.`;

// Заглушка STT — возвращает mock пока нет ключа. Когда появится — заменить на Whisper API call.
async function transcribeAudioMock(audioBase64, fileName) {
  // Имитируем задержку как у настоящего Whisper (4-7 сек)
  await new Promise(r => setTimeout(r, 1500 + Math.random() * 1500));
  const sizeBytes = Buffer.from(audioBase64 || "", "base64").length;
  const estimatedSec = Math.max(60, Math.floor(sizeBytes / 16000)); // ~16kbps opus
  return {
    transcript: MOCK_TRANSCRIPT,
    durationSec: 200,  // мок 3:20
    fileSize: sizeBytes,
    mock: true,
  };
}

// Endpoint: загрузка аудио → STT (mock) → сохранение
app.post("/webhook/mary/transcripts", async (req, res) => {
  const { audio, fileName = "recording.webm", deptId, conversationId } = req.body || {};
  try {
    const id = "tr-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
    // Сохраняем аудио на диск (для будущего реального Whisper)
    if (audio) {
      fs.mkdirSync(TRANSCRIPTS_DIR, { recursive: true });
      const ext = fileName.split(".").pop() || "webm";
      fs.writeFileSync(path.join(TRANSCRIPTS_DIR, `${id}.${ext}`), Buffer.from(audio, "base64"));
    }
    const stt = await transcribeAudioMock(audio, fileName);
    const item = {
      id, fileName, deptId, conversationId,
      createdAt: new Date().toISOString(),
      transcript: stt.transcript,
      durationSec: stt.durationSec,
      mock: stt.mock,
      processed: false,
      memo: null,
    };
    const all = loadTranscripts();
    all.items.unshift(item);
    saveTranscripts(all);
    res.json({ ok: true, transcript: item });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/webhook/mary/transcripts/:id", (req, res) => {
  const all = loadTranscripts();
  const it = all.items.find(x => x.id === req.params.id);
  if (!it) return res.status(404).json({ error: "not found" });
  res.json(it);
});

// Обработка транскрипта Mary — выносит memo + применяет workflow tools.
// Mary видит транскрипт + контекст threada и сама решает что вызывать.
app.post("/webhook/mary/transcripts/:id/process", async (req, res) => {
  const all = loadTranscripts();
  const it = all.items.find(x => x.id === req.params.id);
  if (!it) return res.status(404).json({ error: "not found" });
  if (!OPENROUTER_API_KEY) return res.status(503).json({ error: "LLM not configured" });
  try {
    const ctx = `[Контекст]\n— Источник: транскрипт созвона${it.deptId ? ` отдела ${it.deptId}` : ""}\n— Длительность: ~${Math.round(it.durationSec/60)} мин\n${it.conversationId ? `— Тред: ${it.conversationId}\n` : ""}\n[Транскрипт]\n${it.transcript}`;
    const userMsg = `${ctx}\n\n[Задача]\nРазбери этот транскрипт. Сделай ровно следующее:\n1) Выпиши memo в markdown: ## Решения / ## Блокеры / ## Задачи / ## Owner-ы\n2) Применяй workflow-tools если уместно: flag_blocker для каждого блокера, record_vote+add_decision для принятых решений, create_task для action items с owner.\n3) После всех tool-calls в финальном тексте — только короткое memo, не повторяй tool args в тексте.`;
    const result = await runAgent({ message: userMsg, history: [] });
    it.processed = true;
    it.memo = result.text;
    it.appliedTools = result.trace.map(t => ({ name: t.name, ok: t.ok, args: t.args, result: t.result }));
    saveTranscripts(all);
    res.json({ ok: true, memo: it.memo, applied: it.appliedTools, transcript: it });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Tasks ─────────────────────────────────────────────
function loadTasks() {
  try { return JSON.parse(fs.readFileSync(TASKS_FILE, "utf8")); } catch { return { tasks: [] }; }
}
function saveTasks(data) {
  fs.mkdirSync(path.dirname(TASKS_FILE), { recursive: true });
  fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2), "utf8");
}
function taskCreate({ title, description = "", deptId = "general", ownerId = null, status = "backlog", dueDate = null, priority = "normal", source = { type: "manual" } }) {
  if (!title) throw new Error("title required");
  const data = loadTasks();
  const task = {
    id: "task-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6),
    title, description, deptId, ownerId, status,
    dueDate, priority, source,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    comments: [], history: [{ action: "created", ts: new Date().toISOString() }],
  };
  data.tasks.unshift(task);
  saveTasks(data);
  return task;
}
function taskUpdate(id, patch) {
  const data = loadTasks();
  const t = data.tasks.find(x => x.id === id);
  if (!t) throw new Error(`task '${id}' не найден`);
  const oldStatus = t.status;
  Object.assign(t, patch, { updatedAt: new Date().toISOString() });
  if (patch.status && patch.status !== oldStatus) {
    t.history.push({ action: `status: ${oldStatus} → ${patch.status}`, ts: new Date().toISOString() });
  }
  saveTasks(data);
  return t;
}
function taskDelete(id) {
  const data = loadTasks();
  data.tasks = data.tasks.filter(t => t.id !== id);
  saveTasks(data);
  return true;
}
function taskAddComment(id, text, author = "user") {
  const data = loadTasks();
  const t = data.tasks.find(x => x.id === id);
  if (!t) throw new Error("not found");
  t.comments.push({ author, text, ts: new Date().toISOString() });
  t.updatedAt = new Date().toISOString();
  saveTasks(data);
  return t;
}

// REST endpoints
app.get("/webhook/mary/tasks", (req, res) => {
  const { deptId, status, ownerId, source, q } = req.query;
  let tasks = loadTasks().tasks;
  if (deptId)  tasks = tasks.filter(t => t.deptId === deptId);
  if (status)  tasks = tasks.filter(t => t.status === status);
  if (ownerId) tasks = tasks.filter(t => t.ownerId === ownerId);
  if (source)  tasks = tasks.filter(t => t.source?.type === source);
  if (q) {
    const qq = String(q).toLowerCase();
    tasks = tasks.filter(t => (t.title || "").toLowerCase().includes(qq) || (t.description || "").toLowerCase().includes(qq));
  }
  res.json({ tasks });
});
app.get("/webhook/mary/tasks/:id", (req, res) => {
  const t = loadTasks().tasks.find(x => x.id === req.params.id);
  if (!t) return res.status(404).json({ error: "not found" });
  res.json(t);
});
app.post("/webhook/mary/tasks", (req, res) => {
  try { res.json(taskCreate(req.body || {})); }
  catch (e) { res.status(400).json({ error: e.message }); }
});
app.patch("/webhook/mary/tasks/:id", (req, res) => {
  try { res.json(taskUpdate(req.params.id, req.body || {})); }
  catch (e) { res.status(400).json({ error: e.message }); }
});
app.delete("/webhook/mary/tasks/:id", (req, res) => {
  taskDelete(req.params.id);
  res.json({ ok: true });
});
app.post("/webhook/mary/tasks/:id/comment", (req, res) => {
  try { res.json(taskAddComment(req.params.id, req.body?.text || "", req.body?.author || "user")); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

// Утренний дайджест: Mary смотрит задачи, возвращает топ-3 что сегодня + блокеры + что у других
app.post("/webhook/mary/tasks/morning-digest", async (req, res) => {
  const { deptId } = req.body || {};
  if (!OPENROUTER_API_KEY) return res.status(503).json({ error: "LLM not configured" });
  try {
    let tasks = loadTasks().tasks;
    if (deptId) tasks = tasks.filter(t => t.deptId === deptId);
    const open = tasks.filter(t => t.status !== "done").slice(0, 50);
    if (open.length === 0) return res.json({ digest: "Нет открытых задач — день начинается с чистого листа.", topPicks: [], blockers: [] });
    const tasksText = open.map(t => `- [${t.id}] ${t.title} | owner: ${t.ownerId || "—"} | status: ${t.status} | due: ${t.dueDate || "—"} | priority: ${t.priority}${t.description ? " | " + t.description.slice(0, 100) : ""}`).join("\n");
    const sys = `Ты — Mary, ассистент по утреннему дайджесту задач. Возьми список задач и верни СТРОГО JSON:
{
  "topPicks":[{"id":"task-...", "why":"коротко 1 предложение почему важно сегодня"}],
  "blockers":[{"id":"task-...", "reason":"что блокирует"}],
  "digest": "короткое summary 2-3 предложения для юзера"
}
Правила: topPicks ровно 3 (или меньше если задач меньше); blockers — только реально блокированные; digest на русском, в стиле «коротко и по делу».`;
    const content = await callLLM({ system: sys, user: `Сегодня ${new Date().toLocaleDateString("ru")}\nЗадачи:\n${tasksText}`, jsonMode: true, maxTokens: 800, label: "morning-digest" });
    let parsed; try { parsed = JSON.parse(content); } catch { parsed = { digest: content, topPicks: [], blockers: [] }; }
    res.json(parsed);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Smart batching: группировка задач по теме через LLM
app.post("/webhook/mary/tasks/batched", async (req, res) => {
  const { deptId } = req.body || {};
  if (!OPENROUTER_API_KEY) return res.status(503).json({ error: "LLM not configured" });
  try {
    let tasks = loadTasks().tasks.filter(t => t.status !== "done");
    if (deptId) tasks = tasks.filter(t => t.deptId === deptId);
    if (tasks.length < 3) return res.json({ groups: [] });
    const text = tasks.map(t => `[${t.id}] ${t.title}${t.description ? " — " + t.description.slice(0, 80) : ""}`).join("\n");
    const sys = `Ты группируешь задачи по темам/проектам. Верни СТРОГО JSON:
{"groups":[{"theme":"короткое название темы 1-3 слова","taskIds":["task-..","task-.."]}]}
Правила: 2-5 групп, минимум 2 задачи в группе. Несгруппированные не возвращай.`;
    const content = await callLLM({ system: sys, user: `Задачи:\n${text}`, jsonMode: true, maxTokens: 600, label: "batching" });
    let parsed; try { parsed = JSON.parse(content); } catch { parsed = { groups: [] }; }
    res.json(parsed);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Inbox: агрегатор из всех существующих источников ──
function loadInboxState() {
  try { return JSON.parse(fs.readFileSync(INBOX_STATE_FILE, "utf8")); } catch { return { items: {} }; }
}
function saveInboxState(d) {
  fs.mkdirSync(path.dirname(INBOX_STATE_FILE), { recursive: true });
  fs.writeFileSync(INBOX_STATE_FILE, JSON.stringify(d, null, 2), "utf8");
}

// Собирает все 7 категорий из существующих БД в unified inbox-список
function buildInbox(currentUser = "Виктория") {
  const items = [];
  const state = loadInboxState();
  const convs = loadConversations().conversations || [];
  const tasks = loadTasks().tasks || [];
  const transcripts = loadTranscripts().items || [];

  // 🚨 БЛОКЕРЫ — из conversations[*].workflow.blockers
  for (const c of convs) {
    for (const b of (c.workflow?.blockers || [])) {
      const id = `blk-${c.id}-${b.ts}`;
      items.push({
        id, kind: "blocker",
        title: `Блокер: ${b.reason}`,
        preview: `В треде «${c.title}»`,
        ts: b.ts, deptId: (c.scope || "").split("/")[0],
        source: { type: "conversation", refId: c.id, navTo: `chat:${c.id}` },
        meta: { reason: b.reason, threadTitle: c.title, public: !!b.public },
      });
    }
  }

  // ✅ ЗАДАЧИ — где ownerId = currentUser и status ≠ done
  for (const t of tasks) {
    if (t.ownerId === currentUser && t.status !== "done") {
      items.push({
        id: `task-${t.id}`, kind: "task",
        title: t.title,
        preview: `Задача · ${t.status === "blocked" ? "блокер" : t.status === "doing" ? "в работе" : "в бэклоге"}${t.dueDate ? " · до " + t.dueDate : ""}`,
        ts: t.updatedAt || t.createdAt,
        deptId: t.deptId,
        source: { type: "task", refId: t.id, navTo: `task:${t.id}` },
        meta: { status: t.status, priority: t.priority, dueDate: t.dueDate, description: t.description },
      });
    }
  }

  // 📼 ТРАНСКРИПТЫ — необработанные
  for (const tr of transcripts) {
    if (!tr.processed) {
      items.push({
        id: `tr-${tr.id}`, kind: "transcript",
        title: `Транскрипт: ${tr.fileName}`,
        preview: `Длительность ~${Math.round((tr.durationSec || 0) / 60)} мин · не разобран`,
        ts: tr.createdAt, deptId: tr.deptId,
        source: { type: "transcript", refId: tr.id, navTo: `transcript:${tr.id}` },
        meta: { fileName: tr.fileName, durationSec: tr.durationSec, transcript: tr.transcript?.slice(0, 500) },
      });
    }
  }

  // 🗳 ГОЛОСОВАНИЯ — есть votes но closed=false
  for (const c of convs) {
    const w = c.workflow;
    if (!w || w.closed) continue;
    if ((w.votes || []).length > 0) {
      items.push({
        id: `vote-${c.id}`, kind: "vote",
        title: `Голосование: ${c.title}`,
        preview: `${w.votes.length}/2 голосов`,
        ts: w.votes[w.votes.length - 1]?.ts || c.updatedAt,
        deptId: (c.scope || "").split("/")[0],
        source: { type: "conversation", refId: c.id, navTo: `chat:${c.id}` },
        meta: { votes: w.votes, owner: w.ownerId, threadTitle: c.title },
      });
    }
  }

  // 💬 УПОМИНАНИЯ — последние сообщения от Mary с "Виктория" (только реальные обращения, не самопредставление)
  for (const c of convs) {
    const msgs = c.messages || [];
    for (let i = Math.max(0, msgs.length - 10); i < msgs.length; i++) {
      const m = msgs[i];
      if (m.role === "user") continue;
      if (m.agentId === "mary" || !m.agentId) continue; // самопредставления Mary — не упоминание
      if (!new RegExp(currentUser, "i").test(m.text || "")) continue;
      const id = `mn-${c.id}-${i}`;
      items.push({
        id, kind: "mention",
        title: `Упоминание в «${c.title}»`,
        preview: (m.text || "").slice(0, 140),
        ts: m.ts, deptId: (c.scope || "").split("/")[0],
        source: { type: "conversation", refId: c.id, navTo: `chat:${c.id}` },
        meta: { fullText: m.text, threadTitle: c.title },
      });
      break;
    }
  }

  // 👥 ЧАТЫ С СОТРУДНИКАМИ — новые сообщения в team/* и tg/* (где автор не текущий юзер)
  for (const c of convs) {
    if (!c.scope?.startsWith("team/") && !c.scope?.startsWith("tg/")) continue;
    const msgs = c.messages || [];
    // Последнее сообщение НЕ от vika
    const lastFromOther = [...msgs].reverse().find(m => m.agentId && m.agentId !== "vika");
    if (!lastFromOther) continue;
    const id = `tc-${c.id}`;
    const isTg = c.scope.startsWith("tg/");
    items.push({
      id, kind: "team_chat",
      title: c.title,
      preview: `${lastFromOther.agentId}: ${(lastFromOther.text || "").slice(0, 120)}`,
      ts: lastFromOther.ts,
      source: { type: "team", refId: c.id, navTo: "page://team" },
      meta: { isTg, lastAuthor: lastFromOther.agentId, lastText: lastFromOther.text, threadTitle: c.title },
    });
  }

  // Сортируем новые сверху, добавляем read/archived состояние
  items.sort((a, b) => new Date(b.ts) - new Date(a.ts));
  for (const it of items) {
    const s = state.items[it.id] || {};
    it.read = !!s.read;
    it.archived = !!s.archived;
  }
  return items;
}

app.get("/webhook/mary/inbox", (req, res) => {
  const { kind, unread, archived, q } = req.query;
  let items = buildInbox(req.query.user || "Виктория");
  if (kind && kind !== "all") items = items.filter(x => x.kind === kind);
  if (unread === "1") items = items.filter(x => !x.read && !x.archived);
  if (archived === "1") items = items.filter(x => x.archived);
  else if (!archived) items = items.filter(x => !x.archived);
  if (q) {
    const qq = String(q).toLowerCase();
    items = items.filter(x => (x.title + " " + x.preview).toLowerCase().includes(qq));
  }
  // counts по kind для табов
  const all = buildInbox(req.query.user || "Виктория").filter(x => !x.archived);
  const counts = { all: all.length, unread: all.filter(x => !x.read).length };
  for (const k of ["blocker", "task", "transcript", "vote", "mention", "team_chat"]) {
    counts[k] = all.filter(x => x.kind === k).length;
  }
  res.json({ items, counts });
});

app.post("/webhook/mary/inbox/read", (req, res) => {
  const { id, read, archived } = req.body || {};
  if (!id) return res.status(400).json({ error: "id required" });
  const state = loadInboxState();
  state.items[id] = { ...(state.items[id] || {}), ...(read !== undefined ? { read } : {}), ...(archived !== undefined ? { archived } : {}) };
  saveInboxState(state);
  res.json({ ok: true });
});

function loadSandboxRuns() {
  try { return JSON.parse(fs.readFileSync(SANDBOX_FILE, "utf8")); } catch { return { runs: [] }; }
}
function saveSandboxRuns(data) {
  fs.mkdirSync(path.dirname(SANDBOX_FILE), { recursive: true });
  fs.writeFileSync(SANDBOX_FILE, JSON.stringify(data, null, 2), "utf8");
}
function loadGoldenTests() {
  try { return JSON.parse(fs.readFileSync(GOLDEN_FILE, "utf8")); } catch {
    // Defaults — 5 предустановленных тем под СММ
    return { tests: [
      { id: "smm-morning",  deptId: "smm", name: "5 привычек продуктивного утра", input: "5 привычек продуктивного утра, дружелюбный тон, Instagram", expected: { minWords: 80, hasCta: true, hasHook: true } },
      { id: "smm-product",  deptId: "smm", name: "Анонс новой фичи продукта",     input: "Анонс новой фичи: AI-агенты для СММ, информативный тон, Telegram", expected: { minWords: 100, hasCta: true } },
      { id: "smm-case",     deptId: "smm", name: "Кейс клиента (B2B)",            input: "Кейс: как стартап вырос с 0 до 10K подписчиков за месяц, экспертный тон, Telegram", expected: { minWords: 120, hasNumbers: true } },
      { id: "smm-tip",      deptId: "smm", name: "Короткий совет",                input: "Короткий совет по копирайтингу для маркетологов, неформальный тон, Instagram", expected: { minWords: 40, maxWords: 120 } },
      { id: "smm-question", deptId: "smm", name: "Вовлекающий вопрос",            input: "Открытый вопрос аудитории про их главные SMM-проблемы, дружелюбный тон, Telegram", expected: { hasQuestion: true, maxWords: 100 } },
    ]};
  }
}
function saveGoldenTests(data) {
  fs.mkdirSync(path.dirname(GOLDEN_FILE), { recursive: true });
  fs.writeFileSync(GOLDEN_FILE, JSON.stringify(data, null, 2), "utf8");
}

// Базовые assertions на финальный output отдела
function runAssertions(text, expected = {}) {
  const t = String(text || "");
  const words = t.trim().split(/\s+/).filter(Boolean).length;
  const results = [];
  if (expected.minWords)  results.push({ id: "minWords",  ok: words >= expected.minWords,  details: `${words} слов (≥${expected.minWords})` });
  if (expected.maxWords)  results.push({ id: "maxWords",  ok: words <= expected.maxWords,  details: `${words} слов (≤${expected.maxWords})` });
  if (expected.hasHook)   results.push({ id: "hasHook",   ok: t.split("\n")[0]?.length > 10, details: "первая строка не пустая" });
  if (expected.hasCta)    results.push({ id: "hasCta",    ok: /(подпиш|перейди|посмотри|узнай|комменти|поделись|расскажи|жми|читай|пиши|ставь|сохрани|ставьте)/i.test(t), details: "есть CTA-глагол" });
  if (expected.hasQuestion) results.push({ id: "hasQuestion", ok: /\?/.test(t), details: "есть знак ?" });
  if (expected.hasNumbers)  results.push({ id: "hasNumbers",  ok: /\d/.test(t), details: "есть цифры" });
  return results;
}

// LLM-judge — оценка качества output (1-10 + комментарий)
async function llmJudge({ output, task, criteria = "релевантность, тон, ясность, наличие CTA" }) {
  if (!OPENROUTER_API_KEY) return null;
  try {
    const r = await callLLM({
      system: "Ты — придирчивый редактор-судья. Оценишь текст по критериям. Верни строго JSON: {\"score\":1-10, \"verdict\":\"коротко 1 предложение\", \"strengths\":[],\"issues\":[]}",
      user: `Задача: ${task}\n\nТекст:\n${output}\n\nКритерии: ${criteria}`,
      jsonMode: true, maxTokens: 400, label: "judge", returnUsage: true,
    });
    return { ...JSON.parse(r.content), tokens: r.usage?.total_tokens || 0, costUsd: estimateCostUsd(r.usage, r.model) };
  } catch (e) {
    return { score: null, verdict: "не удалось оценить: " + e.message, strengths: [], issues: [] };
  }
}

async function runDepartmentSandbox({ deptId, input = "", dryRun = false, judge = false, expected = {}, emit }) {
  const data = loadDepartments();
  const dept = data.departments.find(d => d.id === deptId);
  if (!dept) throw new Error(`отдел '${deptId}' не найден`);
  const agents = dept.agents || [];
  if (!agents.length) throw new Error("в отделе нет агентов");
  const orderIds = dept.agentOrder || DEFAULT_AGENT_ORDER;
  const ordered = orderIds.map(id => agents.find(a => a.id === id)).filter(Boolean);
  for (const a of agents) if (!ordered.includes(a)) ordered.push(a);

  const startTs = Date.now();
  const costAcc = { tokens: 0, usd: 0 };
  let prevSummary = input;
  const results = {};
  const agentMeta = {}; // agentId → {durationMs, tokens, costUsd}

  for (const agent of ordered) {
    const aStart = Date.now();
    const aCostBefore = costAcc.usd, aTokensBefore = costAcc.tokens;
    emit("agent_start", { agentId: agent.id, role: agent.role });
    const triggers = (agent.pipeline?.nodes || []).filter(n => n.type === "trigger");
    const agentInputs = {};
    if (triggers[0]) agentInputs[triggers[0].id] = prevSummary;
    try {
      const outputs = await runSandbox({
        deptId, agentId: agent.id, inputs: agentInputs, dryRun, costAcc,
        emit: (event, data) => emit(event, { ...data, agentId: agent.id }),
      });
      const outputNodes = (agent.pipeline?.nodes || []).filter(n => n.type === "output");
      const finalNode = outputNodes[outputNodes.length - 1] || (agent.pipeline?.nodes || []).slice(-1)[0];
      prevSummary = outputs[finalNode?.id] || prevSummary;
      results[agent.id] = prevSummary;
      const meta = {
        durationMs: Date.now() - aStart,
        tokens: costAcc.tokens - aTokensBefore,
        costUsd: costAcc.usd - aCostBefore,
      };
      agentMeta[agent.id] = meta;
      emit("agent_end", { agentId: agent.id, output: prevSummary, ...meta });
    } catch (e) {
      emit("agent_end", { agentId: agent.id, error: e.message });
      break;
    }
  }

  // Assertions + LLM-judge на финальный output
  const assertions = expected ? runAssertions(prevSummary, expected) : [];
  let judgeResult = null;
  if (judge && !dryRun) {
    emit("judge_start", {});
    judgeResult = await llmJudge({ output: prevSummary, task: input });
    if (judgeResult?.costUsd) { costAcc.tokens += judgeResult.tokens || 0; costAcc.usd += judgeResult.costUsd; }
    emit("judge_end", judgeResult || {});
  }

  // Сохраняем run в БД
  const runId = "run-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
  const run = {
    id: runId, deptId, input, dryRun,
    startedAt: new Date(startTs).toISOString(),
    durationMs: Date.now() - startTs,
    finalOutput: prevSummary,
    agents: ordered.map(a => ({ id: a.id, role: a.role, output: results[a.id], ...agentMeta[a.id] })),
    totalTokens: costAcc.tokens, totalCostUsd: costAcc.usd,
    assertions, judge: judgeResult,
  };
  const all = loadSandboxRuns();
  all.runs.unshift(run); // новые сверху
  if (all.runs.length > 500) all.runs.length = 500;
  saveSandboxRuns(all);

  emit("done", { runId, run });
  return run;
}

// Endpoints для runs / golden
app.get("/webhook/mary/sandbox/runs", (req, res) => {
  const { deptId, limit = 50 } = req.query;
  const all = loadSandboxRuns();
  let runs = all.runs;
  if (deptId) runs = runs.filter(r => r.deptId === deptId);
  res.json({ runs: runs.slice(0, +limit) });
});
app.get("/webhook/mary/sandbox/runs/:id", (req, res) => {
  const all = loadSandboxRuns();
  const r = all.runs.find(x => x.id === req.params.id);
  if (!r) return res.status(404).json({ error: "not found" });
  res.json(r);
});
app.delete("/webhook/mary/sandbox/runs/:id", (req, res) => {
  const all = loadSandboxRuns();
  all.runs = all.runs.filter(x => x.id !== req.params.id);
  saveSandboxRuns(all);
  res.json({ ok: true });
});
app.get("/webhook/mary/sandbox/golden", (req, res) => {
  const { deptId } = req.query;
  const all = loadGoldenTests();
  let tests = all.tests || [];
  if (deptId) tests = tests.filter(t => t.deptId === deptId);
  res.json({ tests });
});

app.post("/webhook/mary/departments/:deptId/sandbox/stream", async (req, res) => {
  const { deptId } = req.params;
  const { input = "", dryRun = false, judge = false, expected = {} } = req.body || {};
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();
  const emit = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };
  try {
    await runDepartmentSandbox({ deptId, input, dryRun, judge, expected, emit });
  } catch (e) {
    emit("error", { message: e.message });
  } finally {
    res.end();
  }
});

app.post("/webhook/mary/agents/:deptId/:agentId/sandbox/stream", async (req, res) => {
  const { deptId, agentId } = req.params;
  const { inputs = {}, dryRun = false } = req.body || {};
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();
  const emit = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };
  try {
    await runSandbox({ deptId, agentId, inputs, dryRun, emit });
  } catch (e) {
    emit("error", { message: e.message });
  } finally {
    res.end();
  }
});

app.post("/webhook/mary/agent", async (req, res) => {
  const { message = "", history = [] } = req.body || {};
  const start = Date.now();
  if (!OPENROUTER_API_KEY) return res.status(503).json({ error: "LLM not configured" });
  try {
    const result = await runAgent({ message, history });
    console.log(`[agent] DONE ${Date.now() - start}ms steps=${result.steps} tools=${result.trace.length}`);
    res.json({
      agentId: "mary",
      text: result.text,
      trace: result.trace,
      steps: result.steps,
      timestamp: new Date().toISOString(),
      backend: "mary-express",
      source: "agent-loop",
      model: result.model,
      durationMs: Date.now() - start,
    });
  } catch (e) {
    console.error("[agent] error:", e.message);
    tgAlert(`agent endpoint error: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
});

app.post("/webhook/mary/chat", async (req, res) => {
  const { message = "", history = [] } = req.body || {};
  const start = Date.now();

  // Пробуем LLM, если ключ есть
  if (OPENROUTER_API_KEY) {
    try {
      const r = await askOpenRouter(message, history);
      console.log(`[chat] LLM ${Date.now() - start}ms model=${r._model} tokens=${r._usage?.total_tokens || "?"}`);
      return res.json({
        agentId: "mary",
        text: r.text,
        delegateTo: r.delegateTo,
        timestamp: new Date().toISOString(),
        backend: "mary-express",
        source: "openrouter",
        model: r._model,
      });
    } catch (e) {
      console.error("[chat] OpenRouter error:", e.message);
      // ↓ Падаем на keyword-router
    }
  }

  const r = routeByKeywords(message);
  console.log(`[chat] FALLBACK keyword-router ${Date.now() - start}ms`);
  res.json({
    agentId: "mary",
    text: r.text,
    delegateTo: r.delegateTo,
    timestamp: new Date().toISOString(),
    backend: "mary-express",
    source: "keyword-fallback",
  });
});

// ── Marketer: генерит идеи постов ─────────────────────────
app.post("/webhook/mary/marketer/ideate", async (req, res) => {
  const start = Date.now();
  const count = Math.min(Math.max(Number(req.body?.count) || 4, 1), 8);
  const userBrief = (req.body?.brief || "").trim();
  const insights = await getInsightsCached();
  if (!insights) {
    return res.status(503).json({ error: "researcher insights unavailable" });
  }
  const themes  = (insights.themes  || []).map(t => `${t.label} [${t.direction}] · ${t.note}`).join("\n");
  const formats = (insights.formats || []).map(f => `- ${f}`).join("\n");
  const obs     = (insights.observations || []).map(o => `- ${o}`).join("\n");

  const sys = `Ты — Маркетолог AI-агент платформы Mary.app. Тебе нужно придумать ${count} идей постов для Telegram-канала Mary на следующую неделю.

БРЕНД:
${loadBrand()}

КАК ОТВЕЧАТЬ:
- Идеи — РАЗНЫЕ по углу (не повторять одно и то же)
- Каждая идея использует один из РАБОЧИХ ФОРМАТОВ из ресёрча
- В angleNote указывай конкретный паттерн из ресёрча (с цифрой если есть)
- Hook = первая строка поста, как написал бы Копирайтер; должен соответствовать ToV
- Title = короткое название идеи 5-10 слов

Формат ОТВЕТА — строго JSON:
{
  "items": [
    {"id":"i1","angle":"<жанр · приём>","title":"<5-10 слов>","hook":"<первая строка поста>","angleNote":"<обоснование с цифрой из ресёрча>"}
  ]
}`;

  const usr = `ТЕМЫ НЕДЕЛИ ИЗ РЕСЁРЧА (что сейчас работает в нише):
${themes || "(нет)"}

ФОРМАТЫ ЧТО ЗАХОДЯТ:
${formats || "(нет)"}

OBSERVATIONS (с цифрами):
${obs || "(нет)"}

${userBrief ? `БРИФ ОТ ЮЗЕРА: ${userBrief}\n\n` : ""}Сгенерируй ${count} идей постов.`;

  try {
    let raw = await callLLM({ system: sys, user: usr, temperature: 0.8, maxTokens: 4000, label: "marketer" });
    let parsed; try { parsed = JSON.parse(raw); } catch { parsed = { items: [] }; }
    let items = (parsed.items || []).slice(0, count);

    // Retry если LLM вернула пусто или меньше count (часто из-за JSON-truncation)
    if (items.length === 0) {
      console.log("[marketer] retry with simpler prompt");
      const simplerSys = `Ты Маркетолог Mary. Верни СТРОГО JSON: {"items":[{"id":"i1","angle":"...","title":"...","hook":"...","angleNote":"..."}]}. Каждое поле — 1 короткая фраза, не более 80 символов. ${count} идей.

БРЕНД: ${loadBrand().slice(0, 800)}`;
      const simplerUsr = `Темы которые работают: ${(insights.themes || []).slice(0, 4).map(t => t.label).join(", ")}\nФорматы: ${(insights.formats || []).slice(0, 3).join(" | ")}\n\nДай ${count} идей.`;
      raw = await callLLM({ system: simplerSys, user: simplerUsr, temperature: 0.8, maxTokens: 2500, label: "marketer-retry" });
      try { parsed = JSON.parse(raw); items = (parsed.items || []).slice(0, count); } catch {}
    }

    items = items.map((it, i) => ({
      id: it.id || `i${i + 1}`,
      angle: it.angle || "",
      title: it.title || "",
      hook: it.hook || "",
      angleNote: it.angleNote || "",
    }));
    res.json({
      agentId: "marketer",
      items,
      basedOn: { themes: insights.themes?.length || 0, formats: insights.formats?.length || 0 },
      durationMs: Date.now() - start,
    });
  } catch (e) {
    console.error("[marketer] error:", e.message);
    tgAlert(`marketer endpoint error: ${e.message}`);
    res.status(500).json({ error: e.message });
  }
});

// ── Copywriter: пишет текст под одну идею ────────────────
app.post("/webhook/mary/copywriter/write", async (req, res) => {
  const start = Date.now();
  const idea = req.body?.idea;
  if (!idea || !idea.title) return res.status(400).json({ error: "idea required" });
  const insights = await getInsightsCached();
  const formats  = ((insights?.formats || [])).map(f => `- ${f}`).join("\n");
  const obs      = ((insights?.observations || [])).map(o => `- ${o}`).join("\n");

  const sys = `Ты — Копирайтер AI-агент платформы Mary.app. Тебе нужно написать готовый Telegram-пост под идею.

БРЕНД И ToV:
${loadBrand()}

КАК ПИСАТЬ:
- Длина 300–700 знаков (НЕ больше 800)
- Первая строка — хук с цифрой ИЛИ конкретной деталью
- Структура: хук → тело (2-4 коротких абзаца) → призыв (1 строка)
- 0-1 эмодзи на весь пост, никогда для красоты
- Не использовать «AI-стартап», «революционное», «мы рады», «синергию»
- Личная история ВСЕГДА сильнее экспертизы
- Если идея — чек-лист, делай нумерованный список 5-7 пунктов

Формат ОТВЕТА — строго JSON:
{ "body": "<готовый текст поста, переносы строк через \\n\\n>" }`;

  const usr = `ИДЕЯ:
- Заголовок: ${idea.title}
- Угол: ${idea.angle || "—"}
- Хук-черновик: ${idea.hook || "—"}
- Обоснование: ${idea.angleNote || "—"}

КОНТЕКСТ ИЗ РЕСЁРЧА:
${formats ? `Форматы что работают:\n${formats}\n` : ""}
${obs ? `Observations:\n${obs}\n` : ""}

Напиши готовый пост.`;

  try {
    const raw = await callLLM({ system: sys, user: usr, temperature: 0.75, maxTokens: 1500, label: "copywriter" });
    let parsed; try { parsed = JSON.parse(raw); } catch { parsed = { body: raw }; }
    res.json({
      agentId: "copywriter",
      idea: { id: idea.id, title: idea.title },
      body: parsed.body || "",
      length: (parsed.body || "").length,
      durationMs: Date.now() - start,
    });
  } catch (e) {
    console.error("[copywriter] error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// Миграция: заполняем должностные инструкции у существующих агентов где пусто
function migrateAgentProfiles() {
  try {
    const data = loadDepartments();
    let touched = 0;
    for (const d of (data.departments || [])) {
      for (const a of (d.agents || [])) {
        if (!a.systemPrompt || !a.model || !a.tools) {
          const profile = defaultProfileFor(a.role || a.id);
          if (!a.model)          a.model = profile.model;
          if (!a.systemPrompt)   a.systemPrompt = profile.systemPrompt;
          if (!a.tools)          a.tools = profile.tools;
          if (!a.memory)         a.memory = profile.memory;
          if (!a.responseFormat) a.responseFormat = profile.responseFormat;
          touched++;
        }
      }
    }
    if (touched > 0) {
      saveDepartments(data);
      console.log(`📋 Migrated ${touched} agent profiles (default systemPrompt/model/tools)`);
    }
  } catch (e) { console.log("⚠️  migrateAgentProfiles failed:", e.message); }
}
migrateAgentProfiles();

app.listen(PORT, () => {
  console.log(`🐶 Mary backend on http://localhost:${PORT}`);
  console.log(`   POST http://localhost:${PORT}/webhook/mary/chat`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   LLM: ${OPENROUTER_API_KEY ? `enabled (${OPENROUTER_MODEL})` : "disabled (keyword fallback)"}`);
});

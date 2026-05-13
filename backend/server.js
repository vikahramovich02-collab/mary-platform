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
  dept.agents.push(agent);
  saveDepartments(data);
  return agent;
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
app.use(express.json({ limit: "5mb" }));

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
async function callLLM({ system, user, temperature = 0.7, maxTokens = 1200, jsonMode = true, label = "llm" }) {
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
  return content;
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
      description: "Поставить задачу человеку в команде или агенту. Появится в Drawer Tasks в статусе 'Ожидает принятия'.",
      parameters: {
        type: "object",
        properties: {
          assignee:    { type: "string", description: "Имя сотрудника или ID агента (researcher/marketer/copywriter/designer/analyst)" },
          description: { type: "string", description: "Что нужно сделать" },
          deadline:    { type: "string", description: "Дедлайн в формате ISO date или текст ('завтра в 18:00')" },
        },
        required: ["assignee", "description"],
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
      description: "Добавить AI-агента в отдел. Агент = специализированная роль (Ресерчер, Маркетолог, Копирайтер, Дизайнер, Аналитик, Менеджер, Аккаунт, Лид-квалификатор и т.д.). Цвет hex выбери уместный.",
      parameters: {
        type: "object",
        properties: {
          deptId: { type: "string", description: "ID отдела" },
          role:   { type: "string", description: "Роль агента (по-русски: 'Ресерчер', 'Лид-квалификатор', 'Аккаунт-менеджер')" },
          color:  { type: "string", description: "Цвет аватара hex (#3F95FF, #FF8B3D, #7A86FF, #FF6FB3, #34C759)" },
          tasks:  { type: "string", description: "Что агент делает (1-2 предложения)" },
        },
        required: ["deptId", "role"],
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
- list_departments — посмотри какие отделы уже есть прежде чем создавать новый
- create_department — ТОЛЬКО когда юзер прямо просит создать отдел («создай отдел продаж»). Не создавай по своей инициативе.
- add_channel / add_agent / set_department_integrations — для разворачивания отдела (см. ONBOARDING ниже)
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
2. Под вопросом — 3-5 вариантов ответа НУМЕРОВАННЫМ списком (1. 2. 3.). Юзер может выбрать номер или написать своё.
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

ПРИМЕР:
«Окей, отдел Поддержки. Начнём с основного.

**Что у вас за продукт и масштаб?**

1. SaaS B2B, до 100 клиентов
2. SaaS B2B, 100-1000 клиентов
3. SaaS B2C, тысячи юзеров
4. Маркетплейс / e-commerce
5. Другое — расскажи»

Адаптируй варианты под контекст из предыдущих ответов. Когда собрала 4+ ответа → Фаза 2.

ФАЗА 2: ПОСТЕПЕННАЯ СБОРКА — КАРТОЧКИ САМИ ГОВОРЯТ, ТЕКСТ КОРОТКИЙ

⚠️ В фазе сборки фронт показывает каждый канал/агент как ВИЗУАЛЬНУЮ КАРТОЧКУ с цветом, иконкой, названием и описанием из tasks/description. Юзеру не нужно читать длинные параграфы — он видит карточки. Поэтому твой ТЕКСТ в фазе сборки = МИНИМАЛЬНЫЙ.

⚠️ КРИТИЧНО: ОДИН TOOL НА ОДИН ТЁРН. Никаких 5-7 tool calls в одном response. Это даёт юзеру читать ритмично + карточки появляются по очереди.

ПРАВИЛЬНЫЙ ФОРМАТ ТЁРНА в фазе сборки:

Тёрн = 0-1 короткое предложение (≤10 слов) + ОДИН tool call.

Примеры:
✅ «Подключаю 1С.» → add_channel(1C, type=other)
✅ «Telegram для алертов.» → add_channel(Telegram, type=telegram)
✅ «Reconcile-агент — матчит банк с 1С.» → add_agent(role=Reconcile, tasks="ежедневный матчинг банк-выписки с 1С, подсветка расхождений")
✅ «Отчётный — месячный отчёт по бюджету.» → add_agent(role=Отчётный, tasks="ежемесячный отчёт: бюджет, налоги, cash flow")
✅ «Добавила интеграции — нужно подключить кнопкой ниже.» → set_department_integrations(...)

⚠️ ВАЖНО про интеграции: НЕ говори «подключила AmoCRM», «AmoCRM подключена», «готово, всё работает». Это ЛОЖЬ — реального OAuth/подключения нет, ты только записала названия в БД. Юзер должен сам нажать кнопку «Подключить» на каждой интеграции в карточке. Правильная формулировка: «Добавила интеграции в шаблон отдела — каждую нужно подключить отдельно через кнопку рядом» или «Готово. Интеграции — каждую подключи кнопкой ниже, нужны OAuth/API ключи.»

📦 ФИНАЛЬНЫЙ ОТЧЁТ ПОСЛЕ СБОРКИ ОТДЕЛА (важно!):

Когда отдел собран (set_department_integrations выполнен), пиши последнее сообщение СТРУКТУРИРОВАННО через markdown — НЕ одним абзацем где точки слипаются. Шаблон:

# ✅ [Имя отдела] собран

[Имя отдела] — [короткое описание из чего состоит, 1 предложение].

## 🏗 Архитектура

\`\`\`
📥 Вход (что приходит)
   ↓
🤖 Агент 1 — что делает
   ↓
🤖 Агент 2 — что делает
   ↓
✅ Выход (что получается)
\`\`\`

## 👥 Команда

| Агент | Задача |
|---|---|
| Имя 1 | Что делает |
| Имя 2 | Что делает |

## 📦 На выходе

- Артефакт 1
- Артефакт 2
- Артефакт 3

Заходи в сайдбар → **[Имя отдела]** чтобы настроить.

1. Прогнать тестовый кейс
2. Подключить интеграции
3. Настроить шаблоны
4. Что-то ещё специфическое

КРИТИЧНО:
- Используй РЕАЛЬНЫЕ имена агентов которые ты добавила (из add_agent calls), не выдумывай
- Code block с ASCII-схемой workflow обязательно — fenced ```...```
- Таблица с | col | col | + | --- | --- | разделителем
- В конце ВСЕГДА 3-5 нумерованных вариантов «что дальше» (юзер кликнет один)
- НЕ слипай предложения — каждая мысль отдельным абзацем (двойной перевод строки)

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
    // TODO: настоящая запись в БД. Пока mock — фронт всё равно покажет в Tasks drawer.
    return {
      taskId: `t-${Date.now()}`,
      status: "Ожидает принятия",
      assignee: args.assignee,
      description: args.description,
      deadline: args.deadline || null,
      created: new Date().toISOString(),
    };
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
      const agent = deptAddAgent(args.deptId, { role: args.role, color: args.color || "#7A86FF", tasks: args.tasks || "" });
      const data = loadDepartments();
      const department = data.departments.find(d => d.id === args.deptId);
      return { ok: true, agent, department };
    } catch (e) { return { error: e.message }; }
  },
  async set_department_integrations(args = {}) {
    try { return { ok: true, department: deptSetIntegrations(args.deptId, args.integrations || []) }; }
    catch (e) { return { error: e.message }; }
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

app.listen(PORT, () => {
  console.log(`🐶 Mary backend on http://localhost:${PORT}`);
  console.log(`   POST http://localhost:${PORT}/webhook/mary/chat`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   LLM: ${OPENROUTER_API_KEY ? `enabled (${OPENROUTER_MODEL})` : "disabled (keyword fallback)"}`);
});

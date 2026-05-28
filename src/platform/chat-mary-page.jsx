import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { color, transition } from "../ui/tokens.js";
import { ic } from "./icons.jsx";
import { MaryInputBox, useTypewriterPlaceholder } from "./chat-input.jsx";
import { zoomBtn } from "./chat-panel.jsx";
import { ActivityPanel, ArtifactView, ActivityLog, BuildCanvas } from "./chat-mary-activity.jsx";
import { ChatWelcome, ChatItem } from "./chat-mary-sidebar.jsx";
import { OptionsBlock, AgentChatBubble, ChatBubble, ActionBar, FloatingOptionsPanel } from "./chat-mary-bubbles.jsx";
import { parseNumberedOptions, parseChecklistOptions } from "./markdown.jsx";

// ─── Demo flow script ────────────────────────────────────────────────────────
const DEMO_SCRIPT = [
  // 0 — каналы
  {
    id: "intro",
    _highlights: [0], // Telegram
    text: "Автоматизируем СММ-отдел. Бренд я знаю — учту нишу и tone of voice. Пара вопросов, чтобы собрать команду.\n\nВ каких каналах работаем?\n\n1. Telegram\n2. VK\n3. Instagram\n4. YouTube\n5. Свой вариант",
  },
  // 1 — подключить Telegram
  {
    id: "tg-connect",
    _highlights: [1], // Настрою позже
    text: "🔌 Подключим твой Telegram-канал, чтобы агенты могли публиковать посты и читать комментарии.\n\n1. Подключить сейчас\n2. Настрою позже",
  },
  // 2 — живые сотрудники (+ подтверждение отложенного Telegram)
  {
    id: "q-team",
    _highlights: [0], // Да, есть команда
    text: "Окей, отложу. В графе команды будет серая плашка — допишешь доступ в один клик. Пока продолжаем настройку.\n\nВ отделе сейчас работают живые сотрудники?\n\n1. Да, есть команда — агенты будут помогать\n2. Да, но хочу заменить агентами\n3. Нет, собираем с нуля на агентах",
  },
  // 3 — кто в команде
  {
    id: "q-members",
    _highlights: [0, 1], // Анна и Игорь
    text: "Кто в команде?\n\n1. 👤 Анна Петрова — Контент\n2. 👤 Игорь Сидоров — Дизайн\n3. Добавить ещё человека",
  },
  // 4 — инструменты
  {
    id: "q-tools",
    _highlights: [0, 3, 4], // Google Таблицы, Figma, Google Drive
    text: "Какими инструментами пользуется команда сейчас?\n\n1. 📊 Google Таблицы\n2. 📝 Notion\n3. 📋 Trello / задачник\n4. 🎨 Figma\n5. 📁 Google Drive\n6. 💬 Telegram-чат команды\n7. Ничего из этого",
  },
  // 5 — что в Google Таблицах
  {
    id: "q-sheets-content",
    _highlights: [0, 1], // Контент-план + База идей
    text: "🔌 Подключим всё, чтобы агенты работали с вашими данными. Начнём с Google Таблиц — что там лежит?\n\n1. Контент-план\n2. База идей и тем\n3. Метрики\n4. Список каналов-источников",
  },
  // 6 — как подключить Sheets
  {
    id: "q-sheets-connect",
    _highlights: [0], // Кину ссылку
    text: "Как удобнее подключить?\n\n1. 🔗 Кину ссылку на таблицу\n2. 🔒 Подключить через Google-аккаунт\n3. Настрою позже",
  },
  // 7 — просим ссылку (пользователь вставляет URL)
  {
    id: "q-sheets-link-prompt",
    text: "Окей, давай ссылку. Если таблиц несколько — кидай по одной, я обработаю каждую.",
  },
  // 8 — проверяем доступ (нет доступа → просим открыть)
  {
    id: "q-sheets-access-denied",
    _highlights: [0], // Я открыла доступ, проверь
    _buildLogTitle: "Проверяю доступ",
    _buildLog: [
      "Проверяю доступ к таблице...",
      "Ссылка корректная",
      "Таблица закрыта — нет доступа",
    ],
    text: "⚠️ Таблица найдена, но доступа нет. Открой её для моего аккаунта:\nmary-bot@anthropic-mary.iam.gserviceaccount.com\n\nИли сделай таблицу доступной по ссылке для просмотра.\n\n1. Я открыла доступ, проверь\n2. Дам ссылку с открытым доступом\n3. Настрою позже",
  },
  // 9 — читаем таблицу + результат
  {
    id: "q-sheets-result",
    _highlights: [0], // Да, всё верно
    _buildLogTitle: "Читаю таблицу",
    _buildLog: [
      "Доступ получен",
      "Анализирую структуру",
      "Понимаю содержимое",
    ],
    text: "✅ Подключилась к таблице «Контент-план Q2 2026».\n\nСтруктура:\n— Лист 1: «План на месяц» — 47 строк, колонки: дата, тема, формат, статус, ответственный\n— Лист 2: «Архив» — 312 строк опубликованных постов\n— Лист 3: «Идеи» — 128 тем\n\nМаркетолог будет дополнять «План на месяц», Ресерчер — добавлять темы в «Идеи».\n\n1. Да, всё верно\n2. Подскажу, где что\n3. Использовать только часть листов",
  },
  // 10 — что в Figma
  {
    id: "q-figma-content",
    _highlights: [3], // Всё перечисленное
    text: "🔌 Что в Figma?\n\n1. Шаблоны постов\n2. Бренд-гайд: цвета, шрифты, логотип\n3. Готовые макеты для переиспользования\n4. Всё перечисленное",
  },
  // 11 — как подключить Figma
  {
    id: "q-figma-connect",
    _highlights: [2], // Настрою позже
    text: "Подключаюсь к Figma.\n\n1. Открыть доступ моему аккаунту\n2. Вставить ссылку\n3. Настрою позже",
  },
  // 12 — задачи агентов (Figma отложена)
  {
    id: "q-tasks",
    _highlights: [0, 1, 2, 3, 5], // Ресерч, написание, визуал, публикация, аналитика
    text: "Окей, отложу. Пока Дизайнер будет генерить визуал по описанию бренда из онбординга.\n\nКакие задачи отдаём агентам?\n\n1. Ресерч тем и трендов\n2. Написание постов\n3. Создание визуала\n4. Публикация по расписанию\n5. Ответы на комментарии\n6. Аналитика и отчёты",
  },
  // 12 — кто согласует
  {
    id: "q-approval",
    _highlights: [3], // Согласует другой сотрудник
    text: "Кто решает, что идёт в публикацию?\n\n1. Я согласую каждый пост\n2. Я согласую контент-план на неделю, дальше автопаблиш\n3. Автопаблиш всего, смотрю постфактум\n4. Согласует другой сотрудник",
  },
  // 13 — кто именно согласует
  {
    id: "q-approver",
    _highlights: [0], // Анна Петрова
    text: "Кто будет согласовывать?\n\n1. 👤 Анна Петрова — Контент\n2. 👤 Игорь Сидоров — Дизайн\n3. Пригласить нового человека",
  },
  // 14 — что именно согласует Анна
  {
    id: "q-approve-scope",
    _highlights: [1], // Контент-план на неделю
    text: "Что именно Анна согласует?\n\n1. Каждый пост отдельно\n2. Контент-план на неделю, дальше автопаблиш\n3. Только спорные / чувствительные посты",
  },
  // 15 — комментарии
  {
    id: "q-comments",
    _highlights: [2], // Только мониторит
    text: "Что делаем с комментариями под постами?\n\n1. Агент отвечает на типовые, сложное — мне\n2. Агент отвечает на всё\n3. Только мониторит, отвечаю я\n4. Не трогаем",
  },
  // 16 — расписание
  {
    id: "q-schedule",
    _highlights: [1], // По расписанию + вручную
    text: "Когда команда агентов работает?\n\n1. Каждый день по расписанию\n2. По расписанию + могу запускать вручную\n3. Только когда я попрошу",
  },
  // 17 — метрики для отчёта
  {
    id: "q-reports",
    _highlights: [0, 1, 3, 4], // Охваты, вовлечённость, лучшие посты, рекомендации
    text: "Что важно отслеживать в отчётах?\n\n1. Охваты и просмотры\n2. Вовлечённость — реакции, комменты\n3. Рост подписчиков\n4. Лучшие / худшие посты\n5. Рекомендации на следующую неделю",
  },
  // 18 — кому слать отчёт
  {
    id: "q-report-recipient",
    _highlights: [3], // Мне и Анне — раз в неделю
    text: "Кому и как часто показывать отчёт?\n\n1. Мне — раз в день утром\n2. Мне — раз в неделю\n3. Мне — раз в месяц\n4. Мне и Анне — раз в неделю\n5. Другой сотрудник",
  },
  // 19 — предложение
  {
    id: "proposal",
    isProposal: true,
    _highlights: [0], // ТОЛЬКО «Да, разворачивай»
    text: "Всё собрала. Вот что получается:\n\nОтдел СММ · 5 агентов\nКанал: Telegram (подключить позже)\nКоманда: Анна Петрова (согласует контент-план), Игорь Сидоров\n\nАгенты:\n— Ресерчер — ищет темы, мониторит конкурентов и тренды\n— Маркетолог — ставит угол подачи и ЦА под каждый пост\n— Копирайтер — пишет по брифу, держит tone of voice бренда\n— Дизайнер — генерит визуал, стили из Figma-онбординга\n— Аналитик — готовит еженедельный отчёт для тебя и Анны\n\nИсточники: «Контент-план Q2 2026», «База идей» (Sheets), Drive (3 папки)\nСогласование: Анна, контент-план раз в неделю\nКомментарии: мониторинг, отвечаешь ты\nЗапуск: по расписанию + вручную\n\nЗапускаем?\n\n1. Да, разворачивай\n2. Нет, хочу скорректировать",
  },
];

const DEMO_BUILD_STEPS = [
  { text: "Создаю отдел «СММ»", delay: 700 },
  { text: "Добавляю Telegram-канал (ожидает подключения)", delay: 650 },
  { text: "Связываю Анну Петрову — согласует контент-план раз в неделю", delay: 800 },
  { text: "Связываю Игоря Сидорова — Дизайн", delay: 650 },
  { text: "Подключаю Ресерчера — ищет темы, мониторит конкурентов", delay: 800 },
  { text: "Подключаю Маркетолога — ставит угол и ЦА под каждый пост", delay: 780 },
  { text: "Подключаю Копирайтера — пишет по брифу, держит tone of voice", delay: 780 },
  { text: "Подключаю Дизайнера — генерит визуал, стили из Figma-онбординга", delay: 780 },
  { text: "Подключаю Аналитика — еженедельный отчёт для тебя и Анны", delay: 780 },
  { text: "Импортирую «Контент-план Q2 2026» и «База идей» из Google Таблиц", delay: 700 },
  { text: "Индексирую Drive: «СММ → Материалы 2026», «Кейсы клиентов», «Медиа»", delay: 680 },
  { text: "Настраиваю флоу согласования и расписание запуска", delay: 600 },
];

const DEMO_QUICK_RESPONSES = {
  "Подключить Telegram-канал": "Нужен токен бота из @BotFather.\n\n1. Открыть @BotFather → /newbot\n2. Скопировать токен и вставить сюда\n3. Назначить бота администратором канала\n\nЕсли канал уже есть — просто вставь токен.",
  "Открыть доступ к Figma": "Чтобы Дизайнер читал бренд-гайд и шаблоны:\n\n1. Открыть файл в Figma → Share\n2. Добавить mary-agent@getmary.ai с правами «can view»\n3. Вернуться сюда — подхвачу автоматически",
  "Построить контент-план на неделю": "На какой период строим план?\n\n1. Эта неделя — 7 постов\n2. Ближайшие 2 недели\n3. Месяц — 20–25 постов\n4. Другой период — расскажи",
  "Добавить ещё человека": "Кого добавляем?\n\n1. Отправить ссылку-приглашение на email\n2. Добавить сразу по email\n3. Пропустить — добавлю позже",
};
// ─────────────────────────────────────────────────────────────────────────────

export function ChatMaryPage() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);     // сообщения активного чата
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);    // отправка
  const [draftId, setDraftId] = useState(null);     // id draft-сообщения Mary в стриме
  // Live-визуализатор того что Mary сейчас собирает — персистентный через localStorage
  const [build, setBuildRaw] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mary_build_ctx") || "null"); } catch { return null; }
  });
  const setBuild = useCallback((val) => {
    setBuildRaw(val);
    try {
      if (val) localStorage.setItem("mary_build_ctx", JSON.stringify(val));
      else localStorage.removeItem("mary_build_ctx");
    } catch {}
  }, []);
  // Demo mode — scripted onboarding prototype
  const [demoMode, setDemoMode] = useState(false);
  const [demoStep, setDemoStep] = useState(-1);
  const demoTimersRef = useRef([]);
  const [dismissedPanelIds, setDismissedPanelIds] = useState(() => new Set());

  const [activeAgentIds, setActiveAgentIds] = useState(new Set()); // агенты которые сейчас работают (ask_agent running)
  const [artifacts, setArtifacts] = useState([]); // [{ id, agentId, agentRole, agentColor, title, content, ts }]
  // Публикуем activeAgentIds глобально чтобы dept-page GraphCanvas мог подсветить ноды
  useEffect(() => {
    window.__maryActiveAgents = activeAgentIds;
    window.dispatchEvent(new CustomEvent("mary-active-agents", { detail: { ids: [...activeAgentIds] } }));
  }, [activeAgentIds]);
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

  // На маунте: синхронизируем build с актуальными данными API
  useEffect(() => {
    fetch("/api/mary/departments")
      .then(r => r.json())
      .then(d => {
        const depts = (d.departments || []).filter(x => x.agents?.length || x.channels?.length);
        if (!depts.length) return;
        // Берём самый свежий (или тот что уже в build)
        const cached = (() => { try { return JSON.parse(localStorage.getItem("mary_build_ctx") || "null"); } catch { return null; } })();
        const match = cached?.deptId ? depts.find(x => x.id === cached.deptId) : null;
        const latest = match || depts.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))[0];
        setBuild({
          type: "department",
          deptId: latest.id, name: latest.name,
          color: latest.color || "#7A86FF",
          channels: latest.channels || [],
          agents: latest.agents || [],
          integrations: latest.integrations || [],
        });
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Загрузка сообщений активного чата
  useEffect(() => {
    if (!activeId) return;
    fetch(`/api/mary/conversations/${activeId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setMessages(d.messages || []); })
      .catch(() => {});
  }, [activeId]);

  async function newChat(scope = "general") {
    stopDemoTimers();
    setDemoMode(false);
    setDemoStep(-1);
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

  async function runPipelineInChat(topic, deptId = "smm") {
    const runId = "pipeline-" + Date.now();
    setMessages(prev => [...prev, {
      role: "pipeline_run", _id: runId,
      topic, deptId, agents: [], running: true, judge: null,
      ts: new Date().toISOString(),
    }]);
    try {
      const res = await fetch(`/api/mary/departments/${deptId}/sandbox/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: topic, dryRun: false, judge: false }),
      });
      if (!res.body) throw new Error("no stream");
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
          let event = "message", dataStr = "";
          for (const line of block.split("\n")) {
            if (line.startsWith("event:")) event = line.slice(6).trim();
            else if (line.startsWith("data:")) dataStr += line.slice(5).trim();
          }
          if (!dataStr) continue;
          let data; try { data = JSON.parse(dataStr); } catch { continue; }
          if (event === "agent_start") {
            setMessages(prev => prev.map(m => m._id === runId
              ? { ...m, agents: [...m.agents, { id: data.agentId, role: data.role, status: "running" }] }
              : m));
          } else if (event === "agent_end") {
            setMessages(prev => prev.map(m => m._id === runId
              ? { ...m, agents: m.agents.map(a => a.id === data.agentId
                  ? { ...a, status: data.error ? "error" : "done", output: data.output, error: data.error, durationMs: data.durationMs, tokens: data.tokens, costUsd: data.costUsd }
                  : a) }
              : m));
          } else if (event === "judge_end") {
            setMessages(prev => prev.map(m => m._id === runId ? { ...m, judge: data } : m));
          } else if (event === "done") {
            setMessages(prev => prev.map(m => m._id === runId ? { ...m, running: false } : m));
          }
        }
      }
    } catch {
      setMessages(prev => prev.map(m => m._id === runId ? { ...m, running: false } : m));
    }
  }

  function stopDemoTimers() {
    demoTimersRef.current.forEach(t => clearTimeout(t));
    demoTimersRef.current = [];
  }

  function demoTypeThen(id, text, delay = 700, extraProps = {}) {
    const tId = id + "-typing";
    setMessages(prev => [...prev, {
      role: "mary", text: "", _streaming: true, _id: tId, ts: new Date().toISOString(),
    }]);
    const t = setTimeout(() => {
      setMessages(prev => prev.map(m => m._id === tId
        ? { ...m, text, _streaming: false, ...extraProps }
        : m
      ));
    }, delay);
    demoTimersRef.current.push(t);
  }

  function startDemo() {
    stopDemoTimers();
    setDemoMode(true);
    setDemoStep(0);
    setMessages([]);
    const step0 = DEMO_SCRIPT[0];
    const t = setTimeout(() => {
      demoTypeThen("demo-init", step0.text, 650, step0._highlights ? { _highlights: step0._highlights } : {});
    }, 200);
    demoTimersRef.current.push(t);
  }

  function startDemoBuild() {
    setDemoStep(21);
    const buildId = "demo-build-" + Date.now();
    setMessages(prev => [...prev, {
      role: "mary", text: "", _streaming: true, _buildLog: [], _id: buildId, ts: new Date().toISOString(),
    }]);
    let cumDelay = 300;
    DEMO_BUILD_STEPS.forEach((step, idx) => {
      cumDelay += step.delay;
      const d = cumDelay;
      const isLast = idx === DEMO_BUILD_STEPS.length - 1;
      const t = setTimeout(() => {
        setMessages(prev => prev.map(m => m._id === buildId
          ? { ...m, _buildLog: [...(m._buildLog || []), step.text], _streaming: !isLast }
          : m
        ));
      }, d);
      demoTimersRef.current.push(t);
    });
    cumDelay += 900;
    const finalT = setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "mary",
        text: "Отдел СММ готов — 5 агентов, Google Таблицы подключены, Drive проиндексирован. Как только добавишь Telegram и Figma — можно запускать.",
        _quickActions: [
          { label: "Подключить Telegram-канал", icon: "connect" },
          { label: "Открыть доступ к Figma", icon: "connect" },
          { label: "Построить контент-план на неделю", icon: "calendar" },
          { label: "Добавить ещё человека", icon: "person" },
        ],
        _id: "demo-done-" + Date.now(),
        ts: new Date().toISOString(),
      }]);
      setDemoStep(22);
    }, cumDelay);
    demoTimersRef.current.push(finalT);
  }

  function handleDemoInput(userText) {
    setMessages(prev => [...prev, {
      role: "user", text: userText, ts: new Date().toISOString(),
    }]);

    // Quick action chips response (step 22+)
    if (demoStep >= 22) {
      const key = Object.keys(DEMO_QUICK_RESPONSES).find(k => userText.trim() === k || userText.includes(k));
      if (key) {
        demoTypeThen("demo-qa-" + Date.now(), DEMO_QUICK_RESPONSES[key], 700);
      }
      return;
    }

    // Proposal step — branch on да/нет
    if (demoStep === 20) {
      const isYes = /^1[\s.]|^да\b|^го\b/i.test(userText.trim());
      if (isYes) {
        startDemoBuild();
      } else {
        demoTypeThen(
          "demo-no-" + Date.now(),
          "Конечно, расскажи что скорректировать.\n\n1. Добавить агента\n2. Убрать агента\n3. Изменить каналы\n4. Другое — расскажи",
          700
        );
      }
      return;
    }

    const nextStep = demoStep + 1;
    setDemoStep(nextStep);
    const nextMsg = DEMO_SCRIPT[nextStep];
    if (nextMsg) {
      const extra = {};
      if (nextMsg._highlights) extra._highlights = nextMsg._highlights;
      if (nextMsg._buildLog)   extra._buildLog = nextMsg._buildLog;
      if (nextMsg._buildLogTitle) extra._buildLogTitle = nextMsg._buildLogTitle;
      demoTypeThen("demo-" + nextStep + "-" + Date.now(), nextMsg.text, 700, extra);
    }
  }

  async function send(overrideText, opts = {}) {
    const msg = (overrideText ?? text).trim();
    if (!msg || loading) return;
    if (overrideText === undefined) setText("");
    if (floatingMsg) setDismissedPanelIds(prev => new Set([...prev, floatingMsg._id]));

    // Demo mode: run scripted flow, skip real API
    if (demoMode) {
      handleDemoInput(msg);
      return;
    }

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

    // Pipeline intent: "запусти агентов [тема]", "запустить пайплайн [тема]"
    const pipelineMatch = msg.match(/^запусти(?:ть)?\s+(?:агентов|пайплайн)(?:\s+(.+))?$/i);
    if (pipelineMatch) {
      const topic = pipelineMatch[1]?.trim() || "без темы";
      setMessages(prev => [...prev, { role: "user", text: msg, ts: new Date().toISOString() }]);
      runPipelineInChat(topic, "smm");
      return;
    }

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
            // Делегация задачи агенту — подсвечиваем ноду
            if (data.name === "ask_agent" && data.args?.agentId) {
              setActiveAgentIds(prev => new Set([...prev, data.args.agentId]));
            }
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
              // Немедленный refresh сайдбара после любого dept-mutating tool
              window.dispatchEvent(new CustomEvent("mary-dept-updated"));
            }
            // Автонавигация после создания отдела
            if (data.name === "create_department" && data.ok && data.result?.department) {
              const d = data.result.department;
              setTimeout(() => window.__maryNavigate?.(`dept://${d.id}`), 1800);
            }
            // Автонавигация после добавления канала
            if (data.name === "add_channel" && data.ok && data.result?.channel) {
              setTimeout(() => window.__maryNavigate?.(`page://${data.result.channel.page}`), 2200);
            }
            // ── Делегация: ask_agent вернул output → отдельное сообщение от агента + артефакт ──
            if (data.name === "ask_agent" && data.ok && data.result?.output) {
              const r = data.result;
              setMessages(prev => [...prev, {
                _id: "agent-" + Date.now() + "-" + Math.random().toString(36).slice(2,6),
                role: "assistant",
                agentId: r.agentId,
                agentRole: r.agentRole,
                agentColor: r.agentColor || "#7A86FF",
                deptId: r.deptId,
                fromMary: true,  // флаг: «передала <agent>»
                text: r.output,
                ts: new Date().toISOString(),
              }]);
              // Артефакт-таб в правой панели — открываем автоматически
              const artId = "art-" + Date.now() + "-" + Math.random().toString(36).slice(2, 5);
              const taskShort = (data.args?.task || "").slice(0, 40).replace(/\n.*/, "");
              setArtifacts(prev => {
                // chainId = draftId — все артефакты одного тёрна Mary в одной цепочке
                const chainArtifacts = prev.filter(a => a.chainId === newDraftId);
                const seq = chainArtifacts.length + 1;
                const prevInChain = chainArtifacts[chainArtifacts.length - 1] || null;
                return [...prev, {
                  id: artId,
                  chainId: newDraftId,
                  chainSeq: seq,
                  chainBasedOn: prevInChain ? { agentRole: prevInChain.agentRole, agentColor: prevInChain.agentColor, id: prevInChain.id } : null,
                  agentId: r.agentId,
                  agentRole: r.agentRole,
                  agentColor: r.agentColor || "#7A86FF",
                  title: taskShort || r.agentRole || "Документ",
                  content: r.output,
                  ts: new Date().toISOString(),
                }].slice(-10);
              });
              // Снимаем подсветку с этого агента
              setActiveAgentIds(prev => {
                const next = new Set(prev);
                next.delete(r.agentId);
                return next;
              });
            } else if (data.name === "ask_agent") {
              // Tool упал — всё равно снимаем подсветку
              setActiveAgentIds(prev => {
                const next = new Set(prev);
                if (data.args?.agentId) next.delete(data.args.agentId);
                return next;
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

  // Floating options panel: find last settled mary message with parseable options
  const floatingMsg = useMemo(() => {
    const msg = [...messages].reverse().find(
      m => m.role === "mary" && !m._streaming && !m._quickActions && !m._toolStatus
    );
    if (!msg || dismissedPanelIds.has(msg._id)) return null;
    const checklist = parseChecklistOptions(msg.text || "");
    const numbered = !checklist.options ? parseNumberedOptions(msg.text || "") : null;
    const opts = checklist.options || numbered?.options;
    if (!opts || opts.length < 2) return null;
    return msg;
  }, [messages, dismissedPanelIds]);
  const [chatsCollapsed, setChatsCollapsed] = useState(false);
  // Транскриб аудио: загрузка / запись с микрофона
  const [audioUploading, setAudioUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordChunksRef = useRef([]);
  const uploadAudio = async (blob, fileName) => {
    setAudioUploading(true);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result.split(",")[1]);
        r.onerror = reject;
        r.readAsDataURL(blob);
      });
      const res = await fetch("/api/mary/transcripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: base64, fileName, conversationId: activeId }),
      });
      const d = await res.json();
      if (d.error) throw new Error(d.error);
      const tr = d.transcript;
      const mins = Math.floor(tr.durationSec / 60), secs = tr.durationSec % 60;
      const prompt = `📼 Транскрипт звонка · ${fileName} · ${mins}:${String(secs).padStart(2, "0")}${tr.mock ? " · mock-STT" : ""}\n\n${tr.transcript}\n\n— Разбери: выпиши memo (Решения / Блокеры / Задачи / Owner-ы) и сразу применяй workflow-tools (flag_blocker / record_vote+add_decision / create_task / assign_thread_owner).`;
      setText(prompt);
    } catch (e) {
      alert("Не удалось расшифровать: " + e.message);
    } finally {
      setAudioUploading(false);
    }
  };
  const onPickAudio = (e) => {
    const f = e.target.files?.[0];
    if (f) uploadAudio(f, f.name);
    e.target.value = "";
  };
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      recordChunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) recordChunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(recordChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach(t => t.stop());
        uploadAudio(blob, `recording-${new Date().toISOString().slice(0, 19)}.webm`);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch (e) {
      alert("Микрофон недоступен: " + e.message);
    }
  };
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setRecording(false);
  };
  const [chatsQuery, setChatsQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  const [pinnedChats, setPinnedChats] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mary_pinned_chats") || "[]"); } catch { return []; }
  });
  useEffect(() => {
    try { localStorage.setItem("mary_pinned_chats", JSON.stringify(pinnedChats)); } catch {}
  }, [pinnedChats]);
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
        width: 226, minWidth: 226,
        display: "flex", flexDirection: "column",
        background: "transparent",
        padding: "10px 10px 10px 10px",
      }}>
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          background: "rgba(247,247,247,0.5)",
          border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: 16,
          overflow: "hidden",
        }}>
        {/* Шапка: 3 иконки, либо search-input (когда юзер кликнул на лупу) */}
        <div style={{ padding: "14px 14px 8px" }}>
          {searchOpen ? (
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              height: 24,
              background: "rgba(38,38,51,0.06)",
              borderRadius: 7, padding: "0 8px",
              border: "1.5px solid #3F95FF",
            }}>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="rgba(38,38,51,0.55)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                autoFocus
                value={chatsQuery}
                onChange={e => setChatsQuery(e.target.value)}
                onKeyDown={e => { if (e.key === "Escape") { setChatsQuery(""); setSearchOpen(false); } }}
                placeholder="Поиск чатов"
                style={{
                  flex: 1, border: "none", outline: "none",
                  background: "transparent", fontSize: 12, color: "#262633",
                  fontFamily: "inherit", padding: 0,
                }}
              />
              <button
                onClick={() => { setChatsQuery(""); setSearchOpen(false); }}
                title="Закрыть"
                style={{
                  background: "transparent", border: "none", padding: 0,
                  display: "inline-flex", color: "rgba(38,38,51,0.5)",
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <button
                onClick={() => setChatsCollapsed(true)}
                title="Скрыть список чатов"
                style={{
                  width: 24, height: 24, padding: 0,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: "transparent", border: "none", borderRadius: 6,
                  color: "rgba(38,38,51,0.55)", cursor: "pointer", fontFamily: "inherit",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(38,38,51,0.05)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >{ic.collapse}</button>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  onClick={() => setSearchOpen(true)}
                  title="Поиск чатов (⌘F)"
                  style={{
                    width: 24, height: 24, padding: 0,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    background: "transparent", border: "none", borderRadius: 6,
                    color: "rgba(38,38,51,0.55)", cursor: "pointer", fontFamily: "inherit",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(38,38,51,0.05)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                </button>
                <button
                  data-testid="new-chat-btn"
                  onClick={() => newChat("general")}
                  title="Новый чат"
                  style={{
                    width: 24, height: 24, padding: 0,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    background: "transparent", border: "none", borderRadius: 6,
                    color: "rgba(38,38,51,0.7)", cursor: "pointer", fontFamily: "inherit",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(38,38,51,0.05)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </div>
            </div>
          )}
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
            const renameChat = async (id, title) => {
              await fetch(`/api/mary/conversations/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title }),
              });
              setConversations(prev => prev.map(x => x.id === id ? { ...x, title } : x));
            };
            const renderItem = (c) => (
              <ChatItem
                key={c.id}
                c={c}
                active={c.id === activeId}
                onClick={() => setActiveId(c.id)}
                onDelete={() => deleteChat(c.id)}
                onRename={(t) => renameChat(c.id, t)}
                onTogglePin={() => setPinnedChats(p => p.includes(c.id) ? p.filter(x => x !== c.id) : [...p, c.id])}
                pinned={pinnedChats.includes(c.id)}
              />
            );

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

            // Раздел «Отделы» сверху — закрепы, открывают синхронизированный чат отдела
            const deptPins = [
              { id: "smm-pin", title: "СММ", color: "#FF8B3D", convScope: "smm/tg-kanal" },
              { id: "sales-pin", title: "Продажи", color: "#3F95FF", convScope: "sales/tg-kanal" },
            ];
            const teamChats = []; // Команда живёт во Входящих, не тут
            // Закреплённые юзером чаты — отдельной секцией, удаляем их из date-buckets
            const pinnedItems = sorted.filter(c => pinnedChats.includes(c.id));
            const pinnedSet = new Set(pinnedItems.map(c => c.id));
            const teamSet = new Set(teamChats.map(c => c.id));
            const excludeSet = new Set([...pinnedSet, ...teamSet]);
            for (const k of Object.keys(buckets)) {
              buckets[k] = buckets[k].filter(c => !excludeSet.has(c.id) && !c.scope?.startsWith("team/") && !c.scope?.startsWith("tg/"));
            }
            const groupsClean = groups.map(g => ({ ...g, items: g.items.filter(c => !excludeSet.has(c.id) && !c.scope?.startsWith("team/") && !c.scope?.startsWith("tg/")) })).filter(g => g.items.length > 0);

            return (
              <>
                {deptPins.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{
                      fontSize: 11, color: "rgba(38,38,51,0.5)", fontWeight: 510,
                      padding: "4px 10px 4px",
                    }}>Отделы</div>
                    {deptPins.map(d => {
                      const deptConv = conversations.find(c => c.scope === d.convScope);
                      const isActive = deptConv && deptConv.id === activeId;
                      return (
                        <div key={d.id}
                          onClick={async () => {
                            if (deptConv) {
                              setActiveId(deptConv.id);
                            } else {
                              // Создаём чат отдела если не существует
                              const r = await fetch("/api/mary/conversations", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ title: d.title + " · Отдел", scope: d.convScope }),
                              });
                              const c = await r.json();
                              setConversations(prev => [c, ...prev]);
                              setActiveId(c.id);
                              setMessages([]);
                            }
                          }}
                          style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "5px 10px", fontSize: 12, color: "#262633",
                            cursor: "pointer", borderRadius: 6,
                            background: isActive ? "rgba(38,38,51,0.06)" : "transparent",
                          }}
                          onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(38,38,51,0.04)"; }}
                          onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{d.title}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                {pinnedItems.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{
                      fontSize: 11, color: "rgba(38,38,51,0.5)", fontWeight: 510,
                      padding: "4px 10px 4px",
                    }}>Закреплённые</div>
                    {pinnedItems.map(renderItem)}
                  </div>
                )}
                {groupsClean.map(g => (
                  <div key={g.id} style={{ marginBottom: 10 }}>
                    <div style={{
                      fontSize: 11, color: "rgba(38,38,51,0.5)", fontWeight: 510,
                      padding: "4px 10px 4px",
                    }}>{g.label}</div>
                    {g.items.map(renderItem)}
                  </div>
                ))}
              </>
            );
          })()}
        </div>
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
            {/* Шапка — только когда чат начат */}
            {messages.length > 0 && (
              <div style={{
                padding: "14px 24px",
                borderBottom: "1px solid rgba(38,38,51,0.06)",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                {demoMode ? (
                  <>
                    <span style={{ fontSize: 14, fontWeight: 510, color: "#262633" }}>Пример онбординга СММ</span>
                    <span style={{
                      fontSize: 11, color: "#FF8B3D",
                      padding: "2px 8px", background: "rgba(255,139,61,0.1)", borderRadius: 999,
                    }}>Демо</span>
                    <div style={{ flex: 1 }} />
                    <button
                      onClick={() => { stopDemoTimers(); setDemoMode(false); setDemoStep(-1); setMessages([]); }}
                      style={{
                        fontSize: 12, color: "rgba(38,38,51,0.5)", background: "transparent",
                        border: "1px solid rgba(38,38,51,0.12)", borderRadius: 7,
                        padding: "3px 10px", cursor: "pointer", fontFamily: "inherit",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(38,38,51,0.05)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >Выйти из примера</button>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 14, fontWeight: 510, color: "#262633" }}>
                      {conversations.find(c => c.id === activeId)?.title || "Чат"}
                    </span>
                    <span style={{
                      fontSize: 11, color: "rgba(38,38,51,0.5)",
                      padding: "2px 8px", background: "rgba(38,38,51,0.06)", borderRadius: 999,
                    }}>{SCOPE_LABEL[conversations.find(c => c.id === activeId)?.scope] || ""}</span>
                  </>
                )}
              </div>
            )}

            {/* Сообщения */}
            <div style={{
              flex: 1, overflowY: "auto", padding: "20px 0",
              display: "flex", flexDirection: "column",
            }}>
              {messages.length === 0 ? (
                <ChatWelcome
                  onSuggest={(s) => send(s)}
                  onDemo={startDemo}
                  onPickAudio={onPickAudio}
                  onRecord={recording ? stopRecording : startRecording}
                  recording={recording}
                  audioUploading={audioUploading}
                >
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
                      suppressInteract={!!floatingMsg}
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
                {floatingMsg ? (
                  <FloatingOptionsPanel
                    message={floatingMsg}
                    onPick={(opt) => send(opt)}
                    onDismiss={() => setDismissedPanelIds(prev => new Set([...prev, floatingMsg._id]))}
                  />
                ) : (
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
                    <input ref={fileInputRef} type="file" accept="audio/*,video/*" onChange={onPickAudio} style={{ display: "none" }} />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      title={audioUploading ? "Расшифровываю..." : "Прикрепить аудио/видео"}
                      disabled={audioUploading || recording}
                      style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 28, height: 28,
                        background: "transparent", border: "none", borderRadius: 7,
                        color: audioUploading ? "#FF8B3D" : "rgba(38,38,51,0.55)",
                        cursor: audioUploading || recording ? "wait" : "pointer", fontFamily: "inherit",
                      }}>{ic.attach}</button>
                    <div style={{ flex: 1 }} />
                    <button
                      onClick={recording ? stopRecording : startRecording}
                      title={recording ? "Остановить запись" : "Начать запись (микрофон)"}
                      disabled={audioUploading}
                      style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 28, height: 28,
                        background: recording ? "rgba(255,59,48,0.15)" : "transparent", border: "none", borderRadius: 7,
                        color: recording ? "#FF3B30" : "rgba(38,38,51,0.55)",
                        cursor: audioUploading ? "wait" : "pointer", fontFamily: "inherit",
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
                )}
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
          activeAgentIds={activeAgentIds}
          artifacts={artifacts}
          onCloseArtifact={(id) => setArtifacts(prev => prev.filter(a => a.id !== id))}
          currentTool={(() => {
            // Если есть streaming message с активным tool — показываем его
            const lastStreaming = [...messages].reverse().find(m => m._streaming && m._tools?.length);
            if (!lastStreaming) return null;
            const runningTool = [...(lastStreaming._tools || [])].reverse().find(t => t.status === "running");
            return runningTool ? { name: runningTool.name, args: runningTool.args } : null;
          })()}
          onClose={() => setShowActivity(false)}
        />
      )}
      {!showActivity && messages.length > 0 && (
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


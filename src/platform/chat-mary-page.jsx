import { useState, useRef, useEffect, useMemo } from "react";
import { color, transition } from "../ui/tokens.js";
import { ic } from "./icons.jsx";
import { renderMarkdown, parseNumberedOptions, parseChecklistOptions } from "./markdown.jsx";
import { BuildNode, AgentNodeExpanded } from "./build-nodes.jsx";
import { MaryInputBox, useTypewriterPlaceholder } from "./chat-input.jsx";

export function ChatMaryPage() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);     // сообщения активного чата
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);    // отправка
  const [draftId, setDraftId] = useState(null);     // id draft-сообщения Mary в стриме
  // Live-визуализатор того что Mary сейчас собирает
  const [build, setBuild] = useState(null); // { type: "department", deptId, name, channels:[], agents:[], integrations:[] }
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

            // Раздел «Отделы» сверху — закрепы СММ, Продажи, HR (статически)
            const deptPins = [
              { id: "smm-pin", title: "СММ", scope: "smm", color: "#FF8B3D" },
              { id: "sales-pin", title: "Продажи", scope: "smm", color: "#3F95FF" },
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
                    {deptPins.map(d => (
                      <div key={d.id} style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "5px 10px", fontSize: 12, color: "#262633",
                        cursor: "pointer", borderRadius: 6,
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(38,38,51,0.04)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.title}</span>
                      </div>
                    ))}
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
                <span style={{ fontSize: 14, fontWeight: 510, color: "#262633" }}>
                  {conversations.find(c => c.id === activeId)?.title || "Чат"}
                </span>
                <span style={{
                  fontSize: 11, color: "rgba(38,38,51,0.5)",
                  padding: "2px 8px", background: "rgba(38,38,51,0.06)", borderRadius: 999,
                }}>{SCOPE_LABEL[conversations.find(c => c.id === activeId)?.scope] || ""}</span>
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

// ── Activity Panel: workflow + log ──────────────────────
export function ActivityPanel({ build, activity, currentTool, activeAgentIds, artifacts = [], onCloseArtifact, onClose }) {
  const [tab, setTab] = useState(build ? "build" : "log");
  // Если build впервые появляется во время работы — автоматически переключаемся на него.
  useEffect(() => { if (build && tab === "log" && activity.length <= 2) setTab("build"); }, [build]);
  // При появлении нового артефакта — авто-открыть его
  const lastArtId = artifacts[artifacts.length - 1]?.id;
  useEffect(() => {
    if (lastArtId) setTab(`art:${lastArtId}`);
  }, [lastArtId]);
  // Ширина растёт: 540 → 620 для большого отдела → 720 для открытого артефакта (документ)
  const isArtifactTab = tab.startsWith("art:");
  const width = isArtifactTab ? 720 : ((build?.agents?.length || 0) >= 3 ? 620 : 540);
  const TOOL_LABELS = {
    create_department: (a) => `создаёт отдел «${a?.name || "…"}»`,
    add_channel:       (a) => `добавляет канал «${a?.name || "…"}»`,
    add_agent:         (a) => `добавляет агента «${a?.role || "…"}»`,
    set_department_integrations: () => "подключает интеграции",
    add_pipeline_node: (a) => `добавляет шаг «${a?.title || "…"}»`,
  };
  const toolLabel = currentTool ? (TOOL_LABELS[currentTool.name]?.(currentTool.args) || `выполняет ${currentTool.name}`) : null;
  return (
    <aside style={{
      width: width, minWidth: width,
      borderLeft: "1px solid rgba(38,38,51,0.06)",
      display: "flex", flexDirection: "column",
      background: color.white,
      transition: "width 0.2s ease",
    }}>
      {/* Индикатор текущего tool: «Mary добавляет агента…» */}
      {toolLabel && (
        <div style={{
          padding: "8px 14px",
          background: "linear-gradient(90deg, rgba(63,149,255,0.06), rgba(122,134,255,0.06))",
          borderBottom: "1px solid rgba(38,38,51,0.04)",
          display: "flex", alignItems: "center", gap: 8,
          fontSize: 12, color: "#262633",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%", background: "#FF8B3D",
            animation: "marypulse 1.2s ease-in-out infinite",
          }} />
          <span style={{ fontWeight: 500 }}>Mary</span>
          <span style={{ color: "rgba(38,38,51,0.6)" }}>{toolLabel}…</span>
        </div>
      )}

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
        {/* Артефакты-табы — каждый файл агента */}
        {artifacts.map(a => {
          const active = tab === `art:${a.id}`;
          return (
            <div key={a.id} style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "5px 4px 5px 10px",
              background: active ? "rgba(38,38,51,0.05)" : "transparent",
              borderRadius: 8,
            }}>
              <button onClick={() => setTab(`art:${a.id}`)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "transparent", border: "none",
                  fontSize: 12.5, color: "#262633", fontWeight: 500,
                  cursor: "pointer", fontFamily: "inherit", padding: 0,
                  maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: a.agentColor }} />
                <span>{a.title}</span>
              </button>
              <button onClick={() => {
                onCloseArtifact?.(a.id);
                if (active) setTab(build ? "build" : "log");
              }} title="Закрыть"
                style={{
                  width: 16, height: 16, padding: 0,
                  background: "transparent", border: "none", borderRadius: 4,
                  color: "rgba(38,38,51,0.45)", cursor: "pointer", fontFamily: "inherit",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                }}>
                <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
        <div style={{ flex: 1 }} />
        <button onClick={onClose} title="Свернуть" style={{
          ...zoomBtn, color: "rgba(38,38,51,0.5)", padding: 6,
        }}>{ic.close}</button>
      </div>

      {tab.startsWith("art:") ? (
        <ArtifactView artifact={artifacts.find(a => `art:${a.id}` === tab)} />
      ) : tab === "build" && build ? (
        <BuildCanvas build={build} activeAgentIds={activeAgentIds} />
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

// Артефакт-таб: «документ» который создал агент (output ask_agent)
export function ArtifactView({ artifact }) {
  const [copied, setCopied] = useState(false);
  if (!artifact) {
    return <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(38,38,51,0.4)", fontSize: 13 }}>Артефакт не найден</div>;
  }
  const onCopy = () => {
    navigator.clipboard?.writeText(artifact.content || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const onSaveKb = async () => {
    const name = `${artifact.agentRole} · ${new Date(artifact.ts).toLocaleDateString("ru")}.md`;
    try {
      await fetch("/api/mary/kb/file", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, content: artifact.content }),
      });
      alert(`Сохранено в Базу знаний: «${name}»`);
    } catch (e) { alert("Не удалось сохранить: " + e.message); }
  };
  const initial = (artifact.agentRole || "?").trim().slice(0, 2).toUpperCase();
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: color.white }}>
      {/* Header */}
      <div style={{
        padding: "14px 18px",
        borderBottom: "1px solid rgba(38,38,51,0.06)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: artifact.agentColor, color: color.white,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 600, flexShrink: 0,
        }}>{initial}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "#262633", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {artifact.title}
          </div>
          <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 1, display: "flex", alignItems: "center", gap: 5 }}>
            <span>{artifact.agentRole}</span>
            <span>·</span>
            <span>{new Date(artifact.ts).toLocaleString("ru", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
            {artifact.chainBasedOn && (
              <>
                <span style={{ color: "rgba(38,38,51,0.35)" }}>· основано на:</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: artifact.chainBasedOn.agentColor }} />
                  <span style={{ color: "#262633", fontWeight: 500 }}>{artifact.chainBasedOn.agentRole}</span>
                </span>
              </>
            )}
            {artifact.chainSeq > 1 && (
              <span style={{
                padding: "0 6px", marginLeft: 4, borderRadius: 999,
                background: artifact.agentColor + "22", color: artifact.agentColor,
                fontSize: 10, fontWeight: 600,
              }}>шаг {artifact.chainSeq}</span>
            )}
          </div>
        </div>
        <button onClick={onCopy} title="Копировать"
          style={{ padding: "5px 11px", fontSize: 12, fontWeight: 500,
            background: copied ? "rgba(52,199,89,0.12)" : "transparent",
            color: copied ? "#34C759" : "#262633",
            border: "1px solid rgba(38,38,51,0.18)", borderRadius: 7,
            cursor: "pointer", fontFamily: "inherit" }}>
          {copied ? "✓ Скопировано" : "Копировать"}
        </button>
        <button onClick={onSaveKb} title="Сохранить в Базу знаний"
          style={{ padding: "5px 11px", fontSize: 12, fontWeight: 500,
            background: "#262633", color: color.white,
            border: "none", borderRadius: 7,
            cursor: "pointer", fontFamily: "inherit" }}>
          В БЗ
        </button>
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: "18px 22px" }}>
        <div style={{ fontSize: 14, color: "#262633", lineHeight: 1.6 }}>
          {renderMarkdown(artifact.content || "")}
        </div>
      </div>
    </div>
  );
}

export function ActivityLog({ activity }) {
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
export function BuildCanvas({ build, activeAgentIds }) {
  const accent = build.color || "#7A86FF";
  const [expandedAgentIdx, setExpandedAgentIdx] = useState(null);
  const activeSet = activeAgentIds instanceof Set ? activeAgentIds : new Set();

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
  const totalW = COL_X.agents + NODE_W + 30 + (expandedAgentIdx !== null ? 310 : 0);

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

          {/* Агенты (справа) — кликабельные, подсветка если работает */}
          {build.agents.map((a, i) => (
            <BuildNode key={a.id || i}
              x={COL_X.agents} y={yFor(agentsCount, i) + 36}
              w={NODE_W} h={NODE_H}
              icon="agent" iconBg={(a.color || "#7A86FF") + "26"} iconColor={a.color || "#7A86FF"}
              title={a.role} sub={a.tasks || "AI-агент"}
              animate={i === agentsCount - 1}
              expanded={expandedAgentIdx === i}
              active={activeSet.has(a.id)}
              onClick={() => setExpandedAgentIdx(expandedAgentIdx === i ? null : i)}
            />
          ))}

          {/* Раскрытая карточка агента — поверх графа справа */}
          {expandedAgentIdx !== null && build.agents[expandedAgentIdx] && (
            <AgentNodeExpanded
              agent={build.agents[expandedAgentIdx]}
              x={COL_X.agents + NODE_W + 16}
              y={yFor(agentsCount, expandedAgentIdx) + 36}
              w={280}
              onClose={() => setExpandedAgentIdx(null)}
            />
          )}
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
            {/* Кнопка «Открыть отдел» — появляется когда отдел собран (есть интеграции) */}
            <button
              onClick={() => window.__maryNavigate?.(`dept://${build.deptId}`)}
              style={{
                marginTop: 10,
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 14px",
                background: "#262633", color: color.white,
                border: "none", borderRadius: 8,
                fontSize: 12.5, fontWeight: 500, fontFamily: "inherit",
                cursor: "pointer",
              }}>
              Открыть {build.name} в полном виде
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
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


export function ChatWelcome({ onSuggest, children, onPickAudio, onRecord, recording, audioUploading }) {
  const [callMenuOpen, setCallMenuOpen] = useState(false);
  const callBtnRef = useRef(null);
  const localFileRef = useRef(null);
  useEffect(() => {
    if (!callMenuOpen) return;
    const onDoc = (e) => { if (!callBtnRef.current?.contains(e.target)) setCallMenuOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [callMenuOpen]);
  const quickActions = [
    { label: "Автоматизировать отдел", prompt: "Помоги автоматизировать отдел" },
    { label: "Поставить задачу",       prompt: "Помоги поставить задачу" },
    { label: "Подключить созвон",      isCall: true },
    { label: "Найти документ",         prompt: "Найди документ в базе знаний" },
    { label: "Метрики и отчёты",       prompt: "Покажи метрики за последнюю неделю" },
    { label: "Идеи постов",            prompt: "Предложи идеи постов на основе свежего ресёрча" },
    { label: "Подключить интеграцию",  prompt: "Помоги подключить новую интеграцию" },
  ];
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 18,
      width: "100%", maxWidth: 760, margin: "0 auto",
      padding: "20px 24px",
    }}>
      {/* Аватар Mary — щенок */}
      <img
        src="/icons/mary-puppy.png"
        alt="Mary"
        style={{ width: 130, height: 130, objectFit: "contain", flexShrink: 0 }}
      />
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
      {/* Hidden file input для опции «загрузить» в меню созвонов */}
      <input ref={localFileRef} type="file" accept="audio/*,video/*"
        onChange={e => { const f = e.target.files?.[0]; if (f && onPickAudio) onPickAudio({ target: { files: [f], value: "" } }); e.target.value = ""; setCallMenuOpen(false); }}
        style={{ display: "none" }} />

      {/* Чипы быстрых действий — внизу под input */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 8,
        justifyContent: "center", marginTop: 4,
      }}>
        {quickActions.map((a, i) => {
          if (a.isCall) {
            const busy = recording || audioUploading;
            return (
              <div key={i} style={{ position: "relative" }} ref={callBtnRef}>
                <button
                  onClick={() => setCallMenuOpen(o => !o)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    height: 34, padding: "0 10px",
                    background: callMenuOpen || busy ? "rgba(38,38,51,0.08)" : "rgba(244,244,244,0.8)",
                    border: "none", borderRadius: 8,
                    fontSize: 12, fontWeight: 510, color: busy ? "#FF8B3D" : "#262633",
                    cursor: "pointer", fontFamily: "inherit", transition: transition.fast,
                  }}
                  onMouseEnter={e => { if (!callMenuOpen && !busy) e.currentTarget.style.background = "rgba(38,38,51,0.08)"; }}
                  onMouseLeave={e => { if (!callMenuOpen && !busy) e.currentTarget.style.background = "rgba(244,244,244,0.8)"; }}
                >
                  <span style={{ fontSize: 14, display: "inline-flex" }}>
                    {recording ? "🔴" : audioUploading ? "⏳" : "📞"}
                  </span>
                  <span>
                    {recording ? "Запись… (клик чтобы стоп)" : audioUploading ? "Расшифровка…" : a.label}
                  </span>
                </button>
                {callMenuOpen && !busy && (
                  <div style={{
                    position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)",
                    background: color.white, border: "1px solid rgba(38,38,51,0.1)",
                    borderRadius: 12, boxShadow: "0 8px 24px rgba(38,38,51,0.12)",
                    padding: 4, minWidth: 240, zIndex: 20,
                    display: "flex", flexDirection: "column", gap: 1,
                  }}>
                    {[
                      { id: "rec",   icon: "🎤", label: "Записать сейчас (микрофон)", onClick: () => { setCallMenuOpen(false); onRecord?.(); } },
                      { id: "file",  icon: "📎", label: "Загрузить запись из файла",   onClick: () => { localFileRef.current?.click(); } },
                      { id: "div",   divider: true },
                      { id: "zoom",  icon: "🎥", label: "Подключить Zoom",         disabled: true, hint: "OAuth скоро" },
                      { id: "meet",  icon: "📹", label: "Подключить Google Meet",  disabled: true, hint: "OAuth скоро" },
                      { id: "tlmst", icon: "🅰️", label: "Подключить Яндекс.Телемост", disabled: true, hint: "API скоро" },
                    ].map(item => item.divider ? (
                      <div key={item.id} style={{ height: 1, background: "rgba(38,38,51,0.08)", margin: "3px 4px" }} />
                    ) : (
                      <button
                        key={item.id}
                        onClick={item.disabled ? undefined : item.onClick}
                        disabled={item.disabled}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "8px 10px", background: "transparent",
                          border: "none", borderRadius: 7,
                          fontSize: 12.5, color: item.disabled ? "rgba(38,38,51,0.4)" : "#262633",
                          cursor: item.disabled ? "not-allowed" : "pointer",
                          fontFamily: "inherit", textAlign: "left",
                        }}
                        onMouseEnter={e => { if (!item.disabled) e.currentTarget.style.background = "rgba(38,38,51,0.05)"; }}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <span style={{ fontSize: 14 }}>{item.icon}</span>
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {item.hint && <span style={{ fontSize: 10.5, color: "rgba(38,38,51,0.4)" }}>{item.hint}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return (
            <button
              key={i}
              onClick={() => onSuggest(a.prompt)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                height: 34, padding: "0 10px",
                background: "rgba(244,244,244,0.8)",
                border: "none", borderRadius: 8,
                fontSize: 12, fontWeight: 510, color: "#262633",
                cursor: "pointer", fontFamily: "inherit", transition: transition.fast,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(38,38,51,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(244,244,244,0.8)"; }}
            >
              <img src="/icons/mary-puppy.png" alt="" style={{ width: 20, height: 20, objectFit: "contain" }} />
              <span>{a.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}



export function ChatItem({ c, active, onClick, onDelete, onTogglePin, onRename, pinned }) {
  const [hover, setHover] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(c.title || "");
  const menuRef = useRef(null);
  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);
  const commitRename = () => {
    const t = draft.trim();
    if (t && t !== c.title) onRename(t);
    setRenaming(false);
  };
  return (
    <div
      onClick={renaming ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        display: "flex", alignItems: "center", gap: 6,
        height: 30, padding: "0 32px 0 10px",
        background: active ? "rgba(38,38,51,0.06)" : (hover ? "rgba(38,38,51,0.03)" : "transparent"),
        borderRadius: 8, cursor: renaming ? "text" : "pointer",
      }}
    >
      {pinned && !renaming && (
        <svg width={10} height={10} viewBox="0 0 24 24" fill="rgba(38,38,51,0.4)" style={{ flexShrink: 0 }}>
          <path d="M16 3l5 5-2 2-1-1-4 4 1 4-2 2-5-5-5 5v-2l5-5-5-5 2-2 4 1 4-4-1-1z" />
        </svg>
      )}
      {renaming ? (
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commitRename}
          onClick={e => e.stopPropagation()}
          onKeyDown={e => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") { setDraft(c.title || ""); setRenaming(false); }
          }}
          style={{
            flex: 1, minWidth: 0,
            border: "1px solid rgba(63,149,255,0.4)", borderRadius: 5,
            background: color.white, outline: "none",
            fontSize: 12, fontWeight: 510, color: "#262633",
            fontFamily: "inherit", padding: "2px 6px",
          }}
        />
      ) : (
        <span style={{
          flex: 1, minWidth: 0,
          fontSize: 12, color: "#262633", fontWeight: 510,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{c.title}</span>
      )}
      {(hover || menuOpen || active) && !renaming && (
        <button
          ref={menuRef}
          onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}
          title="Действия"
          style={{
            position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
            width: 22, height: 22, padding: 0,
            background: menuOpen ? "rgba(38,38,51,0.08)" : color.white,
            border: "1px solid rgba(38,38,51,0.12)",
            borderRadius: 6,
            color: "rgba(38,38,51,0.55)", cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontFamily: "inherit",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(38,38,51,0.06)"; }}
          onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.background = color.white; }}
        >
          <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor">
            <circle cx="6" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="18" cy="12" r="1.5" />
          </svg>
        </button>
      )}
      {menuOpen && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: "absolute", right: 0, top: "100%", marginTop: 4,
            background: color.white, borderRadius: 10,
            border: "1px solid rgba(38,38,51,0.08)",
            boxShadow: "0 6px 20px rgba(38,38,51,0.1)",
            padding: 4, zIndex: 10, minWidth: 160,
            display: "flex", flexDirection: "column", gap: 1,
          }}>
          {[
            { id: "pin", label: pinned ? "Открепить" : "Закрепить", onClick: () => { onTogglePin(); setMenuOpen(false); } },
            { id: "rename", label: "Переименовать", onClick: () => { setMenuOpen(false); setDraft(c.title || ""); setRenaming(true); } },
            { id: "delete", label: "Удалить", danger: true, onClick: () => { onDelete(); setMenuOpen(false); } },
          ].map(item => (
            <button key={item.id} onClick={item.onClick}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "7px 10px", background: "transparent",
                border: "none", borderRadius: 6,
                fontSize: 12.5, color: item.danger ? "#FF3B30" : "#262633",
                cursor: "pointer", fontFamily: "inherit", textAlign: "left",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(38,38,51,0.05)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >{item.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export function OptionsBlock({ options, multi, onPick }) {
  const [selected, setSelected] = useState(() => new Set());
  const toggle = (idx) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };
  const submit = () => {
    const picked = options.filter((_, i) => selected.has(i));
    if (picked.length === 0) return;
    onPick(picked.join(", "));
  };

  if (!multi) {
    return (
      <div style={{
        marginTop: 14,
        borderTop: "1px solid rgba(38,38,51,0.08)",
        borderBottom: "1px solid rgba(38,38,51,0.08)",
      }}>
        {options.map((opt, idx) => (
          <button key={idx} onClick={() => onPick(opt)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
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
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
            <span style={{
              flexShrink: 0, width: 18, textAlign: "right",
              color: "rgba(38,38,51,0.45)", fontWeight: 500,
              fontVariantNumeric: "tabular-nums",
            }}>{idx + 1}.</span>
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
    );
  }

  // multi-select UI
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 11, color: "rgba(38,38,51,0.5)", marginBottom: 6, fontWeight: 500 }}>
        Можно выбрать несколько
      </div>
      <div style={{
        borderTop: "1px solid rgba(38,38,51,0.08)",
        borderBottom: "1px solid rgba(38,38,51,0.08)",
      }}>
        {options.map((opt, idx) => {
          const checked = selected.has(idx);
          return (
            <button key={idx} onClick={() => toggle(idx)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%",
                padding: "10px 4px",
                background: checked ? "rgba(38,38,51,0.04)" : "transparent",
                border: "none",
                borderTop: idx > 0 ? "1px solid rgba(38,38,51,0.08)" : "none",
                fontSize: 13, fontWeight: 400, color: "#262633",
                lineHeight: 1.3,
                textAlign: "left", fontFamily: "inherit",
                cursor: "pointer", transition: transition.fast,
              }}
              onMouseEnter={e => { if (!checked) e.currentTarget.style.background = "rgba(38,38,51,0.03)"; }}
              onMouseLeave={e => { if (!checked) e.currentTarget.style.background = "transparent"; }}>
              <span style={{
                flexShrink: 0,
                width: 16, height: 16, borderRadius: 4,
                border: checked ? "1.5px solid #262633" : "1.5px solid rgba(38,38,51,0.25)",
                background: checked ? "#262633" : "transparent",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                marginLeft: 4,
              }}>
                {checked && (
                  <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke={color.white} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                )}
              </span>
              <span style={{ flex: 1 }}>{opt}</span>
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
        <button onClick={submit} disabled={selected.size === 0}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "7px 14px",
            background: selected.size > 0 ? "#262633" : "rgba(38,38,51,0.15)",
            color: color.white, border: "none", borderRadius: 8,
            fontSize: 12.5, fontWeight: 500, fontFamily: "inherit",
            cursor: selected.size > 0 ? "pointer" : "not-allowed",
          }}>
          Отправить{selected.size > 0 && ` · ${selected.size}`}
        </button>
      </div>
    </div>
  );
}

// Сообщение от агента (через ask_agent) — другой аватар, плажка «Mary → [Role]»
export function AgentChatBubble({ m }) {
  const initial = (m.agentRole || "?").trim().slice(0, 2).toUpperCase();
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 22 }}>
      {/* Аватар агента — кружок с инициалами в цвете агента */}
      <div style={{
        width: 28, height: 28, borderRadius: 7,
        background: m.agentColor || "#7A86FF", color: color.white,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, fontSize: 11, fontWeight: 600,
      }}>{initial}</div>
      <div style={{ flex: 1, minWidth: 0, maxWidth: 640, paddingTop: 2 }}>
        {/* Плажка делегации: Mary → [Role] */}
        {m.fromMary && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "3px 10px", marginBottom: 8,
            background: "rgba(38,38,51,0.05)", borderRadius: 999,
            fontSize: 11, color: "rgba(38,38,51,0.65)", fontWeight: 500,
          }}>
            <svg width={10} height={10} viewBox="0 0 24 24">
              <rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor"/>
              <rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor"/>
              <circle cx="9.3" cy="13" r="1.4" fill="white"/>
              <circle cx="14.7" cy="13" r="1.4" fill="white"/>
            </svg>
            <span>Mary</span>
            <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: m.agentColor || "#7A86FF" }} />
            <span style={{ color: "#262633", fontWeight: 600 }}>{m.agentRole}</span>
          </div>
        )}
        <div style={{
          fontSize: 14, color: "#262633", lineHeight: 1.55,
        }}>
          {renderMarkdown(m.text || "")}
        </div>
        <ActionBar text={m.text || ""} />
      </div>
    </div>
  );
}

export function ChatBubble({ m, isLast, onPickOption, index, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  // Сообщение от агента (делегирован через ask_agent)
  if (m.agentId && m.agentRole) {
    return <AgentChatBubble m={m} />;
  }
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
  // Сначала пробуем чек-лист (multi-select), потом нумерованный (single-select)
  const checklist = showOptions ? parseChecklistOptions(m.text) : { body: m.text, options: null };
  const numbered  = showOptions && !checklist.options ? parseNumberedOptions(m.text) : { body: m.text, options: null };
  const body = checklist.options ? checklist.body : (numbered.options ? numbered.body : m.text);
  const options = checklist.options || numbered.options;
  const multi   = !!checklist.options;
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
          <OptionsBlock options={options} multi={multi} onPick={onPickOption} />
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
        {/* Action-bar: только для законченных сообщений с текстом */}
        {!m._streaming && body && body.trim().length > 0 && (
          <ActionBar text={body} />
        )}
      </div>
    </div>
  );
}

export function ActionBar({ text }) {
  const [copied, setCopied] = useState(false);
  const [reaction, setReaction] = useState(null); // null | "up" | "down"
  const onCopy = () => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const btn = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 26, height: 26, padding: 0,
    background: "transparent", border: "none", borderRadius: 6,
    color: "rgba(38,38,51,0.45)", cursor: "pointer", fontFamily: "inherit",
    transition: "color 0.15s, background 0.15s",
  };
  const hover = (e) => { e.currentTarget.style.background = "rgba(38,38,51,0.06)"; e.currentTarget.style.color = "#262633"; };
  const leave = (e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(38,38,51,0.45)"; };
  return (
    <div style={{ display: "flex", gap: 2, marginTop: 8 }}>
      <button title={copied ? "Скопировано" : "Копировать"} onClick={onCopy}
              style={{ ...btn, color: copied ? "#34C759" : btn.color }}
              onMouseEnter={!copied ? hover : undefined}
              onMouseLeave={!copied ? leave : undefined}>
        {copied ? (
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
        ) : (
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
      <button title="Хороший ответ" onClick={() => setReaction(reaction === "up" ? null : "up")}
              style={{ ...btn, color: reaction === "up" ? "#34C759" : btn.color }}
              onMouseEnter={hover} onMouseLeave={leave}>
        <svg width={13} height={13} viewBox="0 0 24 24" fill={reaction === "up" ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
      </button>
      <button title="Плохой ответ" onClick={() => setReaction(reaction === "down" ? null : "down")}
              style={{ ...btn, color: reaction === "down" ? "#FF3B30" : btn.color }}
              onMouseEnter={hover} onMouseLeave={leave}>
        <svg width={13} height={13} viewBox="0 0 24 24" fill={reaction === "down" ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zM17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
        </svg>
      </button>
    </div>
  );
}

import { useState, useRef, useEffect, useMemo } from "react";
import { color, transition } from "../ui/tokens.js";
import { ic } from "./icons.jsx";
import { MaryInputBox, useTypewriterPlaceholder } from "./chat-input.jsx";
import { zoomBtn } from "./chat-panel.jsx";
import { ActivityPanel, ArtifactView, ActivityLog, BuildCanvas } from "./chat-mary-activity.jsx";
import { ChatWelcome, ChatItem } from "./chat-mary-sidebar.jsx";
import { OptionsBlock, AgentChatBubble, ChatBubble, ActionBar } from "./chat-mary-bubbles.jsx";

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
              { id: "smm-pin", title: "СММ", scope: "smm", color: "#FF8B3D", deptId: "smm" },
              { id: "sales-pin", title: "Продажи", scope: "smm", color: "#3F95FF", deptId: "sales" },
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
                      <div key={d.id}
                        onClick={() => window.__maryNavigate?.("dept://" + d.deptId)}
                        style={{
                          display: "flex", alignItems: "center", gap: 8,
                          padding: "5px 10px", fontSize: 12, color: "#262633",
                          cursor: "pointer", borderRadius: 6,
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(38,38,51,0.04)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.title}</span>
                        <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="rgba(38,38,51,0.3)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginLeft: "auto" }}>
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
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


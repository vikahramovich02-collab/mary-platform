import { useState, useRef, useEffect } from "react";
import { color } from "../../ui/tokens.js";
import { ic } from "../icons.jsx";
import { usePeople, MOCK_PEOPLE } from "../people.js";
import { ChatPanel, zoomBtn } from "../chat-panel.jsx";
import { PageShell, StatCard } from "./home-inbox-pages.jsx";

export function TeamPage() {
  const [people, setPeople] = useState([]);
  const [chats, setChats] = useState([]);
  const [filter, setFilter] = useState("all"); // all | internal | tg
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [text, setText] = useState("");
  const [seeded, setSeeded] = useState(false);
  const threadRef = useRef(null);

  const reloadChats = () => fetch("/api/mary/conversations").then(r => r.json()).then(d => {
    const items = (d.conversations || []).filter(c => c.scope?.startsWith("team/") || c.scope?.startsWith("tg/"));
    setChats(items);
  });
  useEffect(() => {
    fetch("/api/mary/team/people").then(r => r.json()).then(d => setPeople(d.people || []));
    reloadChats();
  }, []);
  // Если ничего нет — сеяним
  useEffect(() => {
    if (!seeded && chats.length === 0) {
      fetch("/api/mary/team/seed", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })
        .then(() => { setSeeded(true); reloadChats(); });
    }
  }, [chats.length, seeded]);
  // Авто-рефреш активного чата
  useEffect(() => {
    if (!activeId) return;
    const fetchOne = () => fetch(`/api/mary/conversations/${activeId}`).then(r => r.json()).then(d => setActiveChat(d));
    fetchOne();
    const id = setInterval(() => { fetchOne(); reloadChats(); }, 4000);
    return () => clearInterval(id);
  }, [activeId]);
  // Скролл вниз при новом сообщении
  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [activeChat?.messages?.length]);

  const filtered = chats
    .filter(c => filter === "all" || (filter === "internal" ? c.scope?.startsWith("team/") : c.scope?.startsWith("tg/")))
    .filter(c => !query.trim() || (c.title || "").toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const sendMessage = async () => {
    if (!text.trim() || !activeId) return;
    const msg = text.trim();
    setText("");
    // Оптимистично
    setActiveChat(c => c ? { ...c, messages: [...(c.messages||[]), { role: "user", agentId: "vika", text: msg, ts: new Date().toISOString() }] } : c);
    await fetch(`/api/mary/team/send`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: activeId, text: msg }),
    });
    reloadChats();
  };

  const peopleById = Object.fromEntries(people.map(p => [p.id, p]));
  const initialOf = (name) => name.split(/\s+/).filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0, background: color.white }}>
      {/* Sidebar: чаты */}
      <aside style={{
        width: 320, minWidth: 320,
        borderRight: "1px solid rgba(38,38,51,0.06)",
        display: "flex", flexDirection: "column", background: color.white,
      }}>
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
                <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
              </svg>
              <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === "Escape") { setQuery(""); setSearchOpen(false); } }}
                placeholder="Поиск чата"
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 12, color: "#262633", fontFamily: "inherit", padding: 0 }} />
              <button onClick={() => { setQuery(""); setSearchOpen(false); }} title="Закрыть"
                style={{ background: "transparent", border: "none", padding: 0, display: "inline-flex", color: "rgba(38,38,51,0.5)", cursor: "pointer", fontFamily: "inherit" }}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ display: "inline-flex", width: 24, height: 24, alignItems: "center", justifyContent: "center", color: "rgba(38,38,51,0.55)" }}>
                {ic.collapse}
              </span>
              <button onClick={() => setSearchOpen(true)} title="Поиск"
                style={{
                  width: 24, height: 24, padding: 0,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: "transparent", border: "none", borderRadius: 6,
                  color: "rgba(38,38,51,0.55)", cursor: "pointer", fontFamily: "inherit",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(38,38,51,0.05)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
                </svg>
              </button>
            </div>
          )}
          <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
            {[
              { id: "all", label: "Все" },
              { id: "internal", label: "В платформе" },
              { id: "tg", label: "Telegram" },
            ].map(t => (
              <button key={t.id} onClick={() => setFilter(t.id)}
                style={{
                  padding: "3px 9px",
                  background: filter === t.id ? "#262633" : "transparent",
                  color: filter === t.id ? color.white : "rgba(38,38,51,0.7)",
                  border: filter === t.id ? "none" : "1px solid rgba(38,38,51,0.1)",
                  borderRadius: 999,
                  fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                }}>{t.label}</button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 16px" }}>
          {filtered.length === 0 && (
            <div style={{ padding: 30, fontSize: 12.5, color: "rgba(38,38,51,0.5)", textAlign: "center" }}>
              Нет чатов
            </div>
          )}
          {filtered.map(c => {
            const last = c.messages?.[c.messages.length - 1];
            const isTg = c.scope?.startsWith("tg/");
            const isGroup = c.meta?.kind === "group" || c.meta?.kind === "tg_group";
            const isActive = c.id === activeId;
            return (
              <button key={c.id} onClick={() => setActiveId(c.id)}
                style={{
                  width: "100%", display: "flex", gap: 10,
                  padding: "10px 10px",
                  background: isActive ? "rgba(38,38,51,0.06)" : "transparent",
                  border: "none", borderRadius: 8,
                  cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(38,38,51,0.03)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: isGroup ? "rgba(63,149,255,0.15)" : "rgba(122,134,255,0.15)",
                  color: isGroup ? "#3F95FF" : "#7A86FF",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 600, flexShrink: 0,
                }}>
                  {isGroup ? "👥" : initialOf(c.title)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{
                      fontSize: 13, fontWeight: 500, color: "#262633",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
                    }}>{c.title}</span>
                    {isTg && (
                      <span style={{
                        fontSize: 9.5, color: "#3F95FF", background: "rgba(63,149,255,0.1)",
                        padding: "1px 5px", borderRadius: 4, fontWeight: 600, letterSpacing: "0.04em",
                      }}>TG</span>
                    )}
                  </div>
                  {last && (
                    <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <span style={{ color: "rgba(38,38,51,0.75)", fontWeight: 500 }}>
                        {last.agentId === "vika" ? "Ты: " : (peopleById[last.agentId]?.name.split(" ")[0] || last.agentId) + ": "}
                      </span>
                      {last.text}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 10.5, color: "rgba(38,38,51,0.4)", flexShrink: 0, marginTop: 4 }}>
                  {last && new Date(last.ts).toLocaleString("ru", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Thread — стиль как в Чате Mary */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: color.white }}>
        {!activeChat ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(38,38,51,0.4)", fontSize: 13 }}>
            Выбери чат слева
          </div>
        ) : (
          <>
            {/* Header — минималистично */}
            <div style={{ padding: "20px 28px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "#262633", margin: 0 }}>{activeChat.title}</h2>
              <span style={{
                fontSize: 11.5, color: "rgba(38,38,51,0.55)",
                background: "rgba(38,38,51,0.05)",
                padding: "3px 9px", borderRadius: 999, fontWeight: 500,
              }}>
                {activeChat.scope?.startsWith("tg/")
                  ? "Telegram"
                  : ((activeChat.meta?.kind === "group" || activeChat.meta?.kind === "tg_group") ? "Группа" : "1-на-1")}
              </span>
            </div>

            {/* Messages */}
            <div ref={threadRef} style={{ flex: 1, overflowY: "auto", padding: "8px 0 16px" }}>
              <div style={{ maxWidth: 760, width: "100%", margin: "0 auto", padding: "0 28px" }}>
                {(activeChat.messages || []).map((m, i) => {
                  const isMe = m.agentId === "vika";
                  const author = isMe ? null : (peopleById[m.agentId] || { id: m.agentId, name: m.agentId, color: "#7A86FF" });
                  const prev = (activeChat.messages || [])[i - 1];
                  const sameAuthor = prev && prev.agentId === m.agentId;

                  if (isMe) {
                    return (
                      <div key={i} style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
                        <div style={{
                          background: "rgba(38,38,51,0.06)", color: "#262633",
                          padding: "10px 14px", borderRadius: 16,
                          maxWidth: "80%", fontSize: 14, lineHeight: 1.45, whiteSpace: "pre-wrap",
                        }}>{m.text}</div>
                      </div>
                    );
                  }
                  return (
                    <div key={i} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
                      <div style={{ width: 28, flexShrink: 0 }}>
                        {!sameAuthor && (
                          <div style={{
                            width: 28, height: 28, borderRadius: "50%",
                            background: author.color, color: color.white,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 600,
                          }}>{initialOf(author.name)}</div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0, maxWidth: 640, paddingTop: 2 }}>
                        {!sameAuthor && (
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#262633", marginBottom: 3 }}>
                            {author.name}
                            <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 400, color: "rgba(38,38,51,0.45)" }}>
                              {new Date(m.ts).toLocaleString("ru", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        )}
                        <div style={{ fontSize: 14, color: "#262633", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                          {m.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Input — двухрядный как в Чате Mary */}
            <div style={{ padding: "12px 24px 18px" }}>
              <div style={{ maxWidth: 760, margin: "0 auto" }}>
                <div style={{
                  background: color.white,
                  border: "1px solid rgba(38,38,51,0.12)",
                  borderRadius: 16,
                  padding: "12px 14px",
                  display: "flex", flexDirection: "column", gap: 10,
                }}>
                  <input value={text} onChange={e => setText(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder={activeChat.scope?.startsWith("tg/") ? "Написать в Telegram-группу" : "Написать сообщение"}
                    style={{
                      width: "100%", border: "none", outline: "none",
                      fontSize: 14, color: "#262633",
                      background: "transparent", fontFamily: "inherit",
                      padding: 0, minHeight: 22,
                    }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button title="Добавить"
                      style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 28, height: 28,
                        background: "transparent",
                        border: "1px solid rgba(38,38,51,0.18)",
                        borderRadius: "50%",
                        color: "rgba(38,38,51,0.7)",
                        cursor: "pointer", fontFamily: "inherit",
                      }}>{ic.plus}</button>
                    <button title="Прикрепить"
                      style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 28, height: 28,
                        background: "transparent", border: "none", borderRadius: 7,
                        color: "rgba(38,38,51,0.55)",
                        cursor: "pointer", fontFamily: "inherit",
                      }}>{ic.attach}</button>
                    <div style={{ flex: 1 }} />
                    <button onClick={sendMessage} disabled={!text.trim()} title="Отправить"
                      style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 30, height: 30,
                        background: text.trim() ? "#262633" : "rgba(38,38,51,0.35)",
                        border: "none", borderRadius: "50%",
                        color: color.white,
                        cursor: text.trim() ? "pointer" : "not-allowed",
                        fontFamily: "inherit",
                      }}>
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 19V5" />
                        <path d="M5 12l7-7 7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Бизнес-процесс ──────────────────────────────────────
export function BizprocPage({ onNavigate }) {
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
export function SettingsPage() {
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

export function HelpPage() {
  return (
    <PageShell title="Помощь" sub="Гайды и FAQ">
      <div style={{ background: "rgba(38,38,51,0.025)", borderRadius: 12, padding: 24, fontSize: 14, color: "rgba(38,38,51,0.7)", lineHeight: 1.6 }}>
        Раздел в разработке. Если что-то не работает — спроси Mary в общем чате.
      </div>
    </PageShell>
  );
}

// ── Generic-страница для динамического канала отдела (созданного Mary) ──
export function DepartmentChannelPage({ deptId, channelPage, onNavigate }) {
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

export function SupportPage() {
  return (
    <PageShell title="Поддержка" sub="Связаться с командой Mary">
      <div style={{ background: "rgba(38,38,51,0.025)", borderRadius: 12, padding: 24, fontSize: 14, color: "rgba(38,38,51,0.7)", lineHeight: 1.6 }}>
        Напиши на support@mary.app или в Telegram <a href="https://t.me/viksaaaaaa_a" target="_blank" rel="noreferrer" style={{ color: "#3F95FF" }}>@viksaaaaaa_a</a>.
      </div>
    </PageShell>
  );
}

// ── Корневой компонент ──────────────────────────────────────

import { useState, useRef, useEffect } from "react";
import { color, transition } from "../../ui/tokens.js";
import { ic } from "../icons.jsx";
import { usePeople, MOCK_PEOPLE } from "../people.js";
import { renderMarkdown } from "../markdown.jsx";

export function PageShell({ title, sub, children, action }) {
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

export function StatCard({ label, value, hint, color: tintColor = "#262633" }) {
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

export function NavCard({ icon, title, sub, onClick, accent = "#262633" }) {
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
export function HomePage({ onNavigate }) {
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
// ── Inbox: TG-стиль (list слева + detail справа + фильтры) ──
const INBOX_KIND = {
  team_chat:  { icon: "👤", label: "Сообщение",    color: "#3F95FF" },
  blocker:    { icon: "🚨", label: "Блокер",       color: "#FF3B30" },
  task:       { icon: "✅", label: "Задача",       color: "#3F95FF" },
  transcript: { icon: "📼", label: "Транскрипт",   color: "#7A86FF" },
  vote:       { icon: "🗳", label: "Голосование",  color: "#FF8B3D" },
  mention:    { icon: "💬", label: "Упоминание",   color: "#34C759" },
  approval:   { icon: "📝", label: "На апрув",     color: "#FF8B3D" },
  digest:     { icon: "☀️", label: "Дайджест",     color: "#FFD60A" },
};

export function InboxPage({ onNavigate }) {
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({});
  const [filter, setFilter] = useState("all"); // all | unread | blocker | task | transcript | vote | mention | archived
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const reload = () => {
    const params = new URLSearchParams();
    if (filter === "unread")    params.set("unread", "1");
    else if (filter === "archived") params.set("archived", "1");
    else if (filter !== "all")  params.set("kind", filter);
    if (query.trim())           params.set("q", query.trim());
    fetch(`/api/mary/inbox?${params}`).then(r => r.json()).then(d => {
      setItems(d.items || []);
      setCounts(d.counts || {});
    });
  };
  useEffect(() => { reload(); }, [filter, query]);
  // Авто-рефреш каждые 30с
  useEffect(() => {
    const id = setInterval(reload, 30000);
    return () => clearInterval(id);
  }, [filter, query]);

  const active = items.find(i => i.id === activeId);
  // Auto mark as read когда открыл
  useEffect(() => {
    if (active && !active.read) {
      fetch("/api/mary/inbox/read", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: active.id, read: true }),
      }).then(reload);
    }
  }, [activeId]);

  const archive = async (id) => {
    await fetch("/api/mary/inbox/read", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, archived: true }),
    });
    setActiveId(null);
    reload();
  };
  const goSource = (it) => {
    const nav = it.source?.navTo || "";
    if (nav.startsWith("task:")) onNavigate("tasks");
    else if (nav.startsWith("transcript:")) onNavigate("chat-mary");
    else if (nav.startsWith("page://team")) onNavigate("team");
    else if (nav.startsWith("chat:")) onNavigate("chat-mary");
  };

  // Группировка списка по дате
  const groupByDate = (arr) => {
    const today = new Date();
    const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const startYesterday = startToday - 86400000;
    const buckets = { today: [], yesterday: [], earlier: [] };
    for (const it of arr) {
      const t = new Date(it.ts).getTime();
      if (t >= startToday) buckets.today.push(it);
      else if (t >= startYesterday) buckets.yesterday.push(it);
      else buckets.earlier.push(it);
    }
    return [
      { label: "Сегодня", items: buckets.today },
      { label: "Вчера",   items: buckets.yesterday },
      { label: "Раньше",  items: buckets.earlier },
    ].filter(g => g.items.length > 0);
  };
  const groups = groupByDate(items);

  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0, background: color.white }}>
      {/* Sidebar — list */}
      <aside style={{
        width: 360, minWidth: 360,
        borderRight: "1px solid rgba(38,38,51,0.06)",
        display: "flex", flexDirection: "column", background: color.white,
      }}>
        {/* Header — компактный ряд иконок как в Чате Mary */}
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
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === "Escape") { setQuery(""); setSearchOpen(false); } }}
                placeholder="Поиск во входящих"
                style={{
                  flex: 1, border: "none", outline: "none",
                  background: "transparent", fontSize: 12, color: "#262633",
                  fontFamily: "inherit", padding: 0,
                }}
              />
              <button onClick={() => { setQuery(""); setSearchOpen(false); }} title="Закрыть"
                style={{ background: "transparent", border: "none", padding: 0,
                  display: "inline-flex", color: "rgba(38,38,51,0.5)", cursor: "pointer", fontFamily: "inherit" }}>
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
                  marginLeft: "auto",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(38,38,51,0.05)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
                </svg>
              </button>
            </div>
          )}
          {/* Filter chips — компактные */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 10 }}>
            {[
              { id: "all",       label: "Все",         count: counts.all },
              { id: "unread",    label: "Новые",       count: counts.unread },
              { id: "team_chat", label: "Сообщения",   count: counts.team_chat },
              { id: "blocker",   label: "Блокеры",     count: counts.blocker },
              { id: "task",      label: "Задачи",      count: counts.task },
              { id: "vote",      label: "Голосования", count: counts.vote },
              { id: "mention",   label: "Упоминания",  count: counts.mention },
              { id: "transcript",label: "Транскрипты", count: counts.transcript },
              { id: "archived",  label: "Архив",       count: null },
            ].filter(t => t.count !== 0 || t.id === "all" || t.id === "archived").map(t => (
              <button key={t.id} onClick={() => setFilter(t.id)}
                style={{
                  padding: "3px 9px",
                  background: filter === t.id ? "#262633" : "transparent",
                  color: filter === t.id ? color.white : "rgba(38,38,51,0.7)",
                  border: filter === t.id ? "none" : "1px solid rgba(38,38,51,0.1)",
                  borderRadius: 999,
                  fontSize: 11, fontWeight: 500,
                  cursor: "pointer", fontFamily: "inherit",
                  display: "inline-flex", alignItems: "center", gap: 4,
                }}>
                {t.label}{t.count != null && t.count > 0 && (
                  <span style={{ opacity: 0.7 }}>{t.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px 16px" }}>
          {items.length === 0 && (
            <div style={{ padding: 30, fontSize: 12.5, color: "rgba(38,38,51,0.5)", textAlign: "center" }}>
              Пусто. Ни блокеров, ни задач, ни упоминаний.
            </div>
          )}
          {groups.map(g => (
            <div key={g.label} style={{ marginBottom: 8 }}>
              <div style={{
                fontSize: 10.5, fontWeight: 600, color: "rgba(38,38,51,0.5)",
                textTransform: "uppercase", letterSpacing: "0.06em",
                padding: "6px 8px",
              }}>{g.label}</div>
              {g.items.map(it => {
                const k = INBOX_KIND[it.kind] || { icon: "•", color: "#262633", label: it.kind };
                const isActive = it.id === activeId;
                return (
                  <button key={it.id}
                    onClick={() => setActiveId(it.id)}
                    style={{
                      width: "100%", display: "flex", gap: 10,
                      padding: "10px 10px",
                      background: isActive ? "rgba(38,38,51,0.06)" : "transparent",
                      border: "none", borderRadius: 8,
                      cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                      position: "relative",
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(38,38,51,0.03)"; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: k.color + "1A", color: k.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, flexShrink: 0,
                    }}>{k.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 12.5, fontWeight: it.read ? 400 : 600, color: "#262633",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>{it.title}</div>
                      <div style={{
                        fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>{it.preview}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                      <span style={{ fontSize: 10.5, color: "rgba(38,38,51,0.4)" }}>
                        {new Date(it.ts).toLocaleString("ru", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {!it.read && !it.archived && (
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF8B3D" }} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* Detail */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "rgba(247,247,247,0.4)" }}>
        {!active ? (
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(38,38,51,0.4)", fontSize: 13,
          }}>
            Выбери элемент слева
          </div>
        ) : (
          <InboxDetail item={active} onArchive={() => archive(active.id)} onGoSource={() => goSource(active)} onNavigate={onNavigate} />
        )}
      </div>
    </div>
  );
}

// Полноценный TG-диалог внутри Inbox detail для team_chat
export function InboxTeamThread({ conversationId, isTg, onGoSource, onArchive, archived }) {
  const [chat, setChat] = useState(null);
  const [people, setPeople] = useState([]);
  const [text, setText] = useState("");
  const threadRef = useRef(null);

  const reload = () => fetch(`/api/mary/conversations/${conversationId}`).then(r => r.json()).then(setChat).catch(() => {});
  useEffect(() => {
    fetch("/api/mary/team/people").then(r => r.json()).then(d => setPeople(d.people || [])).catch(() => {});
    reload();
    const id = setInterval(reload, 4000);
    return () => clearInterval(id);
  }, [conversationId]);
  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [chat?.messages?.length]);

  const peopleById = Object.fromEntries(people.map(p => [p.id, p]));
  const initialOf = (name) => (name || "").split(/\s+/).filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const send = async () => {
    if (!text.trim() || !conversationId) return;
    const msg = text.trim();
    setText("");
    setChat(c => c ? { ...c, messages: [...(c.messages||[]), { role: "user", agentId: "vika", text: msg, ts: new Date().toISOString() }] } : c);
    await fetch(`/api/mary/team/send`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, text: msg }),
    });
    reload();
  };

  if (!chat) {
    return <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(38,38,51,0.4)", fontSize: 13 }}>Загрузка…</div>;
  }

  const isGroup = chat.meta?.kind === "group" || chat.meta?.kind === "tg_group";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: color.white }}>
      {/* Header — минималистично, как в Чате Mary */}
      <div style={{
        padding: "20px 28px 14px", display: "flex", alignItems: "center", gap: 10,
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: "#262633", margin: 0 }}>
          {chat.title}
        </h2>
        <span style={{
          fontSize: 11.5, color: "rgba(38,38,51,0.55)",
          background: "rgba(38,38,51,0.05)",
          padding: "3px 9px", borderRadius: 999, fontWeight: 500,
        }}>
          {isTg ? "Telegram" : (isGroup ? "Группа" : "1-на-1")}
        </span>
        <div style={{ flex: 1 }} />
        <button onClick={onGoSource} title="Открыть в «Команде»"
          style={{ padding: "6px 12px", background: "transparent", border: "1px solid rgba(38,38,51,0.18)",
            borderRadius: 8, fontSize: 12, color: "#262633", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
          Открыть в «Команде»
        </button>
        {!archived && (
          <button onClick={onArchive}
            style={{ padding: "6px 12px", background: "transparent", border: "1px solid rgba(38,38,51,0.18)",
              borderRadius: 8, fontSize: 12, color: "rgba(38,38,51,0.7)", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
            Архив
          </button>
        )}
      </div>

      {/* Messages — стиль как в Чате Mary */}
      <div ref={threadRef} style={{ flex: 1, overflowY: "auto", padding: "8px 0 16px" }}>
        <div style={{ maxWidth: 760, width: "100%", margin: "0 auto", padding: "0 28px" }}>
          {(chat.messages || []).map((m, i) => {
            const isMe = m.agentId === "vika";
            const author = isMe ? null : (peopleById[m.agentId] || { id: m.agentId, name: m.agentId, color: "#7A86FF" });
            const prev = (chat.messages || [])[i - 1];
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

      {/* Input — как в Чате Mary */}
      <div style={{ padding: "12px 24px 18px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{
            background: color.white,
            border: "1px solid rgba(38,38,51,0.12)",
            borderRadius: 16,
            padding: "12px 14px",
            display: "flex", flexDirection: "column", gap: 10,
          }}>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={isTg ? "Написать в Telegram" : "Написать сообщение"}
              style={{
                width: "100%", border: "none", outline: "none",
                fontSize: 14, color: "#262633",
                background: "transparent", fontFamily: "inherit",
                padding: 0, minHeight: 22,
              }}
            />
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
              <button onClick={send} disabled={!text.trim()} title="Отправить"
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
    </div>
  );
}

export function InboxDetail({ item, onArchive, onGoSource, onNavigate }) {
  const k = INBOX_KIND[item.kind] || { icon: "•", color: "#262633", label: item.kind };

  // Для чатов с коллегами — полноценный TG-style диалог
  if (item.kind === "team_chat" && item.source?.refId) {
    return <InboxTeamThread
      conversationId={item.source.refId}
      isTg={!!item.meta?.isTg}
      archived={!!item.archived}
      onGoSource={onGoSource}
      onArchive={onArchive}
    />;
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "26px 32px" }}>
      <div style={{ maxWidth: 740 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: k.color + "1A", color: k.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, flexShrink: 0,
          }}>{k.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: k.color, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {k.label}
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#262633", margin: "2px 0 0", lineHeight: 1.3 }}>
              {item.title}
            </h2>
          </div>
          <span style={{ fontSize: 12, color: "rgba(38,38,51,0.5)", flexShrink: 0 }}>
            {new Date(item.ts).toLocaleString("ru", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {/* Content */}
        <div style={{
          background: color.white, border: "1px solid rgba(38,38,51,0.06)",
          borderRadius: 12, padding: "16px 18px", marginBottom: 16,
        }}>
          <div style={{ fontSize: 13.5, color: "#262633", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
            {item.preview}
            {item.meta?.description && <div style={{ marginTop: 8, color: "rgba(38,38,51,0.7)" }}>{item.meta.description}</div>}
            {item.meta?.fullText && <div style={{ marginTop: 8, color: "rgba(38,38,51,0.7)" }}>{item.meta.fullText}</div>}
            {item.meta?.transcript && (
              <details style={{ marginTop: 12 }}>
                <summary style={{ cursor: "pointer", fontSize: 12, color: "rgba(38,38,51,0.55)" }}>Показать транскрипт</summary>
                <div style={{
                  marginTop: 8, padding: "10px 12px", background: "rgba(38,38,51,0.03)",
                  borderRadius: 8, fontSize: 12, color: "rgba(38,38,51,0.75)",
                  whiteSpace: "pre-wrap", maxHeight: 300, overflowY: "auto",
                }}>{item.meta.transcript}</div>
              </details>
            )}
          </div>
        </div>

        {/* Meta */}
        {item.meta && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {item.meta.priority === "high" && (
              <span style={{ padding: "3px 9px", background: "rgba(255,59,48,0.1)", color: "#FF3B30", borderRadius: 999, fontSize: 11.5, fontWeight: 500 }}>↑ важно</span>
            )}
            {item.meta.dueDate && (
              <span style={{ padding: "3px 9px", background: "rgba(38,38,51,0.05)", color: "rgba(38,38,51,0.7)", borderRadius: 999, fontSize: 11.5, fontWeight: 500 }}>до {item.meta.dueDate}</span>
            )}
            {item.meta.status && (
              <span style={{ padding: "3px 9px", background: "rgba(38,38,51,0.05)", color: "rgba(38,38,51,0.7)", borderRadius: 999, fontSize: 11.5, fontWeight: 500 }}>{item.meta.status}</span>
            )}
            {item.meta.owner && (
              <span style={{ padding: "3px 9px", background: "rgba(38,38,51,0.05)", color: "rgba(38,38,51,0.7)", borderRadius: 999, fontSize: 11.5, fontWeight: 500 }}>owner: {item.meta.owner}</span>
            )}
            {item.meta.votes && (
              <span style={{ padding: "3px 9px", background: "rgba(255,139,61,0.1)", color: "#FF8B3D", borderRadius: 999, fontSize: 11.5, fontWeight: 500 }}>{item.meta.votes.length}/2 голосов</span>
            )}
            {item.deptId && (
              <span style={{ padding: "3px 9px", background: "rgba(38,38,51,0.05)", color: "rgba(38,38,51,0.7)", borderRadius: 999, fontSize: 11.5, fontWeight: 500 }}>отдел: {item.deptId}</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onGoSource}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 14px", background: "#262633", color: color.white,
              border: "none", borderRadius: 8,
              fontSize: 12.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
            }}>
            Перейти к источнику
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
          <button onClick={() => onNavigate("chat-mary")}
            style={{
              padding: "8px 14px", background: "transparent",
              border: "1px solid rgba(38,38,51,0.18)", borderRadius: 8,
              fontSize: 12.5, color: "#262633", fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
            }}>Спросить Mary</button>
          <div style={{ flex: 1 }} />
          {!item.archived && (
            <button onClick={onArchive}
              style={{
                padding: "8px 14px", background: "transparent",
                border: "1px solid rgba(38,38,51,0.18)", borderRadius: 8,
                fontSize: 12.5, color: "rgba(38,38,51,0.7)", fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
              }}>Архив</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Команда: чаты с коллегами + TG-интеграции (TG-стиль) ──

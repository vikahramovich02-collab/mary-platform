import { useState, useRef, useEffect } from "react";
import { color, transition } from "../ui/tokens.js";
import { ic } from "./icons.jsx";
import { AGENTS } from "./agents-config.js";

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

export function ApproveActions({ onApprove, onRefine, label = "Апрув" }) {
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

export function ResearchCard({ msg, onOpenKb }) {
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
        onClick={() => onOpenKb?.({ title: "Свежие посты", agent: researcher })}
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
    </div>
  );
}

export function InsightsCard({ msg, onOpenKb }) {
  const heading = { fontSize: 16, fontWeight: 500, color: "#262633", letterSpacing: "-0.01em" };
  const researcher = AGENTS.find(a => a.id === "researcher");
  return (
    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 18, maxWidth: 550 }}>
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
                  onClick={() => onOpenKb?.({ title: "Свежие посты", agent: researcher })}
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

export function IdeasCard({ msg, onAction }) {
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
export function toolLabel(name) { return TOOL_LABELS[name] || name; }

const BUILD_TOOLS = new Set(["create_department", "add_channel", "add_agent", "set_department_integrations"]);

function IntegrationsCard({ t }) {
  const items = t.args?.integrations || t.result?.department?.integrations || [];
  const [connected, setConnected] = useState({});
  const onConnect = (name) => {
    alert(`Подключение «${name}» — скоро добавим OAuth/API ключи. Пока это заглушка.`);
    setConnected(c => ({ ...c, [name]: true }));
  };
  if (items.length === 0) return null;
  return (
    <div style={{
      background: color.white,
      border: "1px solid rgba(38,38,51,0.1)",
      borderLeft: "3px solid #34C759",
      borderRadius: 8,
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 12px",
        borderBottom: items.length ? "1px solid rgba(38,38,51,0.06)" : "none",
      }}>
        <span style={{ fontSize: 14 }}>🔌</span>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#262633", flex: 1 }}>
          Интеграции <span style={{ color: "rgba(38,38,51,0.4)", fontWeight: 400 }}>· {items.length}</span>
        </div>
      </div>
      <div>
        {items.map((name, i) => {
          const isConnected = connected[name];
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 12px",
              borderTop: i > 0 ? "1px solid rgba(38,38,51,0.05)" : "none",
            }}>
              <span style={{ flex: 1, fontSize: 13, color: "#262633" }}>{name}</span>
              {isConnected ? (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: 12, color: "#34C759", fontWeight: 500,
                }}>
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                  Подключено
                </span>
              ) : (
                <button
                  onClick={() => onConnect(name)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "5px 10px",
                    background: "#262633", color: color.white,
                    border: "none", borderRadius: 7,
                    fontSize: 12, fontWeight: 500, cursor: "pointer",
                    fontFamily: "inherit",
                  }}>
                  Подключить
                  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BuildCard({ t }) {
  const a = t.args || {};
  const r = t.result || {};
  let icon, bColor, title, sub;
  if (t.name === "create_department") {
    icon = "🏢"; bColor = r.department?.color || "#7A86FF";
    title = "Отдел " + (a.name || r.department?.name || "");
    sub = a.description || "";
  } else if (t.name === "add_channel") {
    icon = "📡"; bColor = "#3F95FF";
    title = a.name || r.channel?.name || "Канал";
    sub = a.type || r.channel?.type || "";
  } else if (t.name === "add_agent") {
    icon = "🤖"; bColor = a.color || r.agent?.color || "#7A86FF";
    title = a.role || r.agent?.role || "Агент";
    sub = a.tasks || "";
  } else if (t.name === "set_department_integrations") {
    return <IntegrationsCard t={t} />;
  }
  const running = t.status === "running";
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      padding: "9px 12px",
      background: color.white,
      border: `1px solid rgba(38,38,51,0.1)`,
      borderLeft: `3px solid ${bColor}`,
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

const DISCOVERY_TOOLS = new Set(["kb_list", "kb_read", "search_kb", "list_departments", "read_chat", "list_posts", "get_research_insights"]);

function CollapsibleToolGroup({ label, tools }) {
  const [open, setOpen] = useState(false);
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

export function ToolsTrail({ tools }) {
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
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 6 }}>
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

export function ToolStatusChip({ status, startedAt }) {
  const [, setTick] = useState(0);
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

export function FileActionRow({ icon = "write", file, sub }) {
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

export function PublishedRow({ url, channel }) {
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

export function TextCard({ msg }) {
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

export function VisualCard({ msg }) {
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

export function FinalPostCard({ msg, onAction }) {
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
        <div style={{
          height: 130, position: "relative",
          background: `linear-gradient(135deg, ${palette[0]}, ${palette[1]} 60%, ${palette[2]})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: color.white, padding: "0 20px",
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em",
              opacity: 0.85, fontWeight: 600,
            }}>placeholder обложки</div>
            <div style={{
              fontSize: 14, fontWeight: 600, marginTop: 4, lineHeight: 1.3,
            }}>{msg.idea?.title}</div>
            <div style={{
              fontSize: 10.5, opacity: 0.7, marginTop: 6,
            }}>сгенерирует Дизайнер когда подключим image-generation</div>
          </div>
        </div>
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
        <div style={{
          padding: "0 14px 12px",
          fontSize: 13.5, lineHeight: 1.5, color: "#262633",
          whiteSpace: "pre-wrap",
          maxHeight: 220, overflow: "auto",
        }}>{msg.body}</div>
        <div style={{
          padding: "8px 14px 12px",
          borderTop: "1px solid rgba(38,38,51,0.06)",
          fontSize: 11.5, color: "rgba(38,38,51,0.45)",
          fontStyle: "italic",
        }}>
          Метрики появятся после публикации
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

export function ToolTrace({ agentLabel, steps }) {
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

export function ChatMessage({ msg, onPick, onAction, onOpenKb }) {
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
        {msg.type === "research"  && <ResearchCard  msg={msg} onOpenKb={onOpenKb} />}
        {msg.type === "insights"  && <InsightsCard  msg={msg} onOpenKb={onOpenKb} />}
        {msg.type === "ideas"     && <IdeasCard     msg={msg} onAction={onAction} />}
        {msg.type === "text"      && <TextCard      msg={msg} onAction={onAction} />}
        {msg.type === "visual"    && <VisualCard    msg={msg} onAction={onAction} />}
        {msg.type === "finalPost" && <FinalPostCard msg={msg} onAction={onAction} />}
        {msg.type === "fileWrite" && <FileActionRow icon="write" file={msg.file} sub={msg.existed ? `обновила · ${msg.size} б` : `создала · ${msg.size} б`} />}
        {msg.type === "fileRead"  && <FileActionRow icon="read"  file={msg.file} sub={`прочитала · ${msg.length} симв.`} />}
        {msg.type === "fileList"  && <FileActionRow icon="list"  file={`файлов в БЗ: ${msg.count}`} />}
        {msg.type === "published" && <PublishedRow url={msg.url} channel={msg.channel} />}
        {msg.options       && <QuestionOptions items={msg.options}       onPick={onPick} />}
        {msg.peopleOptions && <PeopleOptions   items={msg.peopleOptions} onPick={onPick} />}
        {msg.followUps     && <FollowUps       items={msg.followUps}     onPick={onPick} />}
      </div>
    </div>
  );
}

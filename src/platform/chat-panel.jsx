import { useState, useRef, useEffect } from "react";
import { color, transition } from "../ui/tokens.js";
import { ic } from "./icons.jsx";
import { AGENTS } from "./agents-config.js";
import { usePeople, MOCK_PEOPLE } from "./people.js";
import { DeptChatWelcome } from "./dept-chat-welcome.jsx";

// ── Shared style constants ───────────────────────────────────
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
export const zoomBtn = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  padding: 0,
  background: "transparent", border: "none",
  cursor: "pointer", color: "#262633",
};

// ── TypingIndicator ──────────────────────────────────────────
export function TypingIndicator({ agents }) {
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

// ── ChatHeader ───────────────────────────────────────────────
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

export function ChatHeader({ activeFilter, onFilter, onClose, startDrag, mode, onToggleMode, typingAgents }) {
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

// ── FilterBar ────────────────────────────────────────────────
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

export function FilterBar({ activeFilter, onFilter }) {
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

// ── ApproveActions ───────────────────────────────────────────
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

// ── ResearchCard ─────────────────────────────────────────────
// onOpenKb(item) — колбэк для открытия KbPopup (остаётся в TgKanalPage)
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

// ── InsightsCard ─────────────────────────────────────────────
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

// ── IdeasCard ────────────────────────────────────────────────
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

// ── Tool status / trail ──────────────────────────────────────
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

// ── ChatPanel ────────────────────────────────────────────────
export function ChatPanel({ onClose, activeFilter, onFilter, mode: modeProp, onModeChange, dockedHeight = 420, onDockedHeightChange, pendingMaryMessage, onPendingConsumed, taskFlow, onTaskFlowChange, onAddTask, onOpenTasks, onOpenKb }) {
  const peopleList = usePeople();
  const taskDraftRef = useRef({});
  const [localMode, setLocalMode] = useState("docked");
  const mode = modeProp ?? localMode;
  const setMode = onModeChange ?? setLocalMode;
  const [pos, setPos] = useState({ x: 60, y: 80 });
  const [size, setSize] = useState({ w: 640, h: 460 });
  const [text, setText] = useState("");
  const [attached, setAttached] = useState([]);
  const [kbOpen, setKbOpen] = useState(false);
  const [allMessages, setAllMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);

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
        const full = await fetch(`/api/mary/conversations/${conv.id}`).then(r => r.json());
        if (!cancelled && full.messages?.length > 0) {
          const converted = full.messages.map((m, i) => ({
            id: "h" + i + "-" + (m.ts || ""),
            agentId: m.role === "user" ? "user" : "mary",
            time: (m.ts || "").slice(11, 16),
            text: m.text || "",
          }));
          setAllMessages(converted);
        }
      } catch {}
    }
    ensureConv();
    return () => { cancelled = true; };
  }, []);

  const [typingIds, setTypingIds] = useState(["mary", "copywriter"]);
  const fileRef = useRef(null);

  useEffect(() => {
    if (allMessages.length === 0) { setTypingIds([]); return; }
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
  }, [allMessages.length === 0]);

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
  function paletteForIdea(idea) {
    if (idea.angle.includes("AI"))    return ["#3F95FF", "#7A86FF", "#262633"];
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
    Promise.all(ideas.map(idea => callCopywriterWrite(idea))).then(results => {
      const validResults = results.filter(r => r && r.body);
      if (validResults.length === 0) {
        appendAgent("copywriter", {
          text: "Копирайтер не ответил — backend недоступен. Попробуй ещё раз или воспользуйся Чатом Mary (там делегация через ask_agent(copywriter)).",
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
      const finalText = await callCopywriterWrite(ideas[0]);
      if (!finalText || !finalText.body) {
        appendMary({ text: "Не удалось собрать финальный пост — Копирайтер не отвечает." });
        return;
      }
      appendMary({
        text: `Текст и обложки готовы по всем ${ideas.length} ${ideas.length === 1 ? "идее" : "идеям"}. Собрала превью первого поста — глянь и жми «Опубликовать», если ок:`,
        type: "finalPost",
        idea: ideas[0],
        body: finalText.body,
        palette: paletteForIdea(ideas[0]),
        channel: "@mary_smm",
        scheduledFor: "сегодня в 12:00",
        rest: ideas.slice(1).map(i => ({ id: i.id, title: i.title })),
      });
    }, 8000);
  }
  function handleAction(action) {
    if (!action) return;
    if (action.kind === "approveIdeas") { handleIdeasApproved(action.ideas); return; }
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
  function rankPeople(desc) {
    const d = (desc || "").toLowerCase();
    const source = peopleList.length > 0 ? peopleList : MOCK_PEOPLE;
    return source.map(p => {
      const title = p.title.toLowerCase();
      let rel = 25;
      if (/(пост|текст|копи)/.test(d) && /копирайтер/.test(title)) rel = 92;
      else if (/(дизайн|обложк|визуал|макет)/.test(d) && /дизайнер/.test(title)) rel = 90;
      else if (/(стратег|план|концепт)/.test(d) && /стратег/.test(title)) rel = 85;
      else if (/(smm|канал|пост|охват)/.test(d) && /smm/.test(title)) rel = 78;
      else if (/head/.test(title)) rel = 70;
      const hash = String(p.id).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      const load = 20 + (hash * 13) % 70;
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
    if (conversationId) {
      fetch(`/api/mary/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "user", text: content }),
      }).catch(() => {});
    }
    setTimeout(() => {
      if (taskFlow === "desc") {
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
      if (content === "Открыть задачи") { onOpenTasks?.(); return; }
      if (content === "Поставить ещё одну") {
        onTaskFlowChange?.("desc");
        appendMary({ type: "question", text: "Окей. Опиши следующую задачу." });
        return;
      }
      streamMaryAgent(content).catch(() => handleFreeMessage(content));
    }, 350);
  }

  async function streamMaryAgent(message) {
    const draftId = "m-stream-" + Date.now() + Math.random();
    let draftCreated = false;

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

    const STREAM_TOOL_LABELS = {
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
        conversationId,
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
        setDraftStatus(STREAM_TOOL_LABELS[data.name] || data.name);
      } else if (event === "tool_end") {
        renderAgentTrace([{ name: data.name, ok: data.ok, result: data.result }]);
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
            trends: r.themes.map(th => ({ label: th.label, direction: th.direction || "stable", note: th.note || "" })),
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
          onAddTask?.({
            title: r.description || "Новая задача",
            assignee: r.assignee,
            kind: ["researcher","marketer","copywriter","designer","analyst"].includes(r.assignee) ? "agent" : "person",
          });
        }
      } else if (t.name === "kb_write") {
        const r = t.result;
        if (r.ok) appendAgent("mary", { type: "fileWrite", file: r.path, existed: r.existed, size: r.size });
      } else if (t.name === "kb_read") {
        const r = t.result;
        if (r.content) appendAgent("mary", { type: "fileRead", file: r.name, length: r.length });
      } else if (t.name === "kb_list") {
        const r = t.result;
        appendAgent("mary", { type: "fileList", count: r.files?.length || 0 });
      } else if (t.name === "publish_post") {
        const r = t.result;
        if (r.ok) appendAgent("mary", { type: "published", url: r.url, channel: r.channel });
      }
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
    } catch { return null; }
  }

  function triggerAgentMock(agentId) {
    if (agentId === "marketer") {
      callMarketerIdeate({ count: 4 }).then(data => {
        if (data && data.items?.length) {
          appendAgent("marketer", {
            type: "ideas",
            text: `Подобрал ${data.items.length} идей на основе свежего ресёрча. Отметь те, что берём в работу:`,
            items: data.items,
          });
        } else {
          appendAgent("marketer", { text: "Не получилось получить идеи — backend не отвечает. Попробуй через минуту или используй Чат Mary (там делегация через ask_agent)." });
        }
      });
    } else if (agentId === "copywriter") {
      appendAgent("copywriter", { text: "Чтобы Копирайтер написал текст — нужна конкретная идея. Выбери идею у Маркетолога или попроси в Чате Mary: «напиши пост про X»." });
    } else if (agentId === "designer") {
      appendAgent("designer", { text: "Дизайнер пока не подключён через backend. Воспользуйся Чатом Mary: «нарисуй обложку для X»." });
    } else if (agentId === "researcher") {
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
          appendAgent("researcher", { text: "Не получилось собрать инсайты — backend не отвечает или нет свежих постов в БД. Попробуй позже." });
        }
      });
    } else if (agentId === "analyst") {
      appendAgent("analyst", { text: "Аналитик пока не подключён — нужны реальные метрики из канала. Подключи Telegram-канал в Настройках, тогда дам сводку." });
    }
  }

  function handleFreeMessage(content) {
    const d = (content || "").toLowerCase();
    if (/(контент.?план|план.{0,10}пост|идеи|темы постов)/.test(d)) {
      appendMary({ text: "Окей, ставлю задачу Маркетологу — соберёт контент-план на основе свежего ресёрча." });
      callMarketerIdeate({ count: 4, brief: content }).then(data => {
        if (data && data.items?.length) {
          appendAgent("marketer", { type: "ideas", text: `Подобрал ${data.items.length} идей. Отметь те, что берём в работу:`, items: data.items });
        } else {
          appendAgent("marketer", { text: "Не получилось получить идеи — попробуй ещё раз или используй Чат Mary." });
        }
      });
      return;
    }
    if (/(напиши пост|напиши текст|текст поста|пост на тему)/.test(d)) {
      appendMary({ text: "Чтобы Копирайтер написал — нужна конкретная идея. Сначала Маркетолог даст 4 варианта, выберешь, потом текст." });
      return;
    }
    if (/(обложк|визуал|картинк|дизайн|оформлен)/.test(d)) {
      appendMary({ text: "Дизайнер пока не подключён через backend. Воспользуйся Чатом Mary: там делегация идёт через ask_agent (designer)." });
      return;
    }
    if (/(ресёрч|ресерч|конкурент|спарси|посты конкурентов|тренд|инсайт)/.test(d)) {
      appendMary({ text: "Ресерчер — на связи. Сейчас принесёт темы и форматы." });
      callResearcherInsights().then(data => {
        if (data && data.themes?.length) {
          appendAgent("researcher", {
            type: "insights",
            text: `Проанализировал ${data.sampleSize} постов за ${data.lookbackDays} дней. Темы и форматы:`,
            trends: data.themes.map(t => ({ label: t.label, direction: t.direction || "stable", note: t.note || "" })),
            formats: data.formats || [],
            notes: data.observations || [],
          });
        } else {
          appendAgent("researcher", { text: "Не получилось собрать инсайты — backend не отвечает или нет свежих постов в БД." });
        }
      });
      return;
    }
    if (/(аналитик|метрик|охват|er|отчёт|статистик)/.test(d)) {
      appendMary({ text: "Аналитик пока не подключён — нужны реальные метрики из канала. Подключи Telegram-канал в Настройках." });
      return;
    }
    if (/(опубликуй|постни|выкатывай|published)/.test(d)) {
      appendMary({ text: "Какой пост публикуем? Дай номер или название из последних, или попроси новый." });
      return;
    }
    appendMary({
      text: "Понял. Опиши задачу подробнее — я передам нужному агенту. Для сложных задач (мульти-агент / контекст) удобнее в Чате Mary: там реальная делегация через ask_agent.",
    });
  }

  useEffect(() => {
    if (pendingMaryMessage) {
      setAllMessages(prev => [...prev, pendingMaryMessage]);
      onPendingConsumed?.();
    }
  }, [pendingMaryMessage, onPendingConsumed]);

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
    if (mode === "mini")        setMode("docked");
    else if (mode === "docked") setMode("side");
    else if (mode === "side")   setMode("floating");
    else                        setMode("mini");
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

  // suppress unused warning — triggerAgentMock may be used by parent via ref or future extension
  void triggerAgentMock;

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
      <ChatHeader
        activeFilter={activeFilter}
        onFilter={onFilter}
        onClose={onClose}
        startDrag={startDrag}
        mode={mode}
        onToggleMode={toggleMode}
        typingAgents={typingAgents}
      />
      <div style={{
        flex: 1, minHeight: 0, overflowY: "auto",
        padding: "16px 18px",
      }}>
        {messages.map(m => <ChatMessage key={m.id} msg={m} onPick={appendUser} onAction={handleAction} onOpenKb={onOpenKb} />)}
        {messages.length === 0 && (
          <DeptChatWelcome onPick={appendUser} />
        )}
      </div>
      <div style={{ padding: "0 14px 14px", position: "relative" }}>
        <div style={{
          background: color.white,
          border: "1px solid rgba(38,38,51,0.12)",
          borderRadius: 16,
          padding: "12px 14px",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
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
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.name}</span>
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
            <input ref={fileRef} type="file" multiple onChange={handlePickFile} style={{ display: "none" }} />
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
              <div style={{ padding: 12, fontSize: 13, color: "rgba(38,38,51,0.5)", textAlign: "center" }}>Пусто</div>
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

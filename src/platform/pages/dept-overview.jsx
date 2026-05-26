import { useState, useEffect, useRef } from "react";
import { color } from "../../ui/tokens.js";

const CARD_W = 180, CARD_H = 64, GAP_X = 80, GAP_Y = 90;
const MAX_PER_ROW = 4;

const CHAN_ICONS = {
  tg: <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor"><path d="M21.8 2.2a1 1 0 0 0-1-.2L2.3 9.3a1 1 0 0 0 .1 1.9l4.6 1.5 1.8 5.6a1 1 0 0 0 1.7.4l2.6-2.6 4.5 3.3a1 1 0 0 0 1.5-.7l2.7-15a1 1 0 0 0-.3-.8z"/></svg>,
  inst: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/></svg>,
  vk: <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 15.5h1.9c.4 0 .5-.3.5-.5 0 0 0-2 .9-2.3.9-.3 2 1.8 3.2 2.6.9.6 1.6.5 1.6.5l3.2-.1s1.7-.1.9-1.4c-.1-.2-.6-.9-2.2-2.5C21.3 10 20.9 10 21.2 9.5c.7-1 1.8-2.5 2.3-3.4.3-.6.1-.9-.5-.9h-2c-.5 0-.7.3-.9.6 0 0-1 2.3-2.5 3.8-.7.6-1 .3-1 0V6.3c0-.5-.1-.8-.7-.8h-3.2c-.4 0-.7.3-.7.6 0 .7.9.9.9 2.7v4.1c0 .6-.1.7-.4.7-.6 0-2.1-2.3-3-5C9.3 7.7 9 7.5 8.4 7.5H6.5c-.6 0-.7.3-.7.6 0 .7.7 4 3.3 8.3C11 19 13 20 14.9 20c1 0 1.2-.3 1.2-.7v-2.1c0-.6.1-.7.5-.7z"/></svg>,
  analytics: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  email: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  support: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  other: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
};

const CHAN_COLORS = {
  tg:        { icon: "#2AABEE", bg: "#E8F7FE" },
  inst:      { icon: "#E1306C", bg: "#FDE8F0" },
  vk:        { icon: "#2787F5", bg: "#E6F1FE" },
  analytics: { icon: "#34C759", bg: "#E8F8EE" },
  email:     { icon: "#FF9500", bg: "#FFF3E0" },
  support:   { icon: "#7A86FF", bg: "#EEF0FF" },
  other:     { icon: "#8E8EA0", bg: "#F0F0F4" },
};

function chanIcon(ch) {
  const s = ((ch.id || "") + (ch.name || "") + (ch.type || "")).toLowerCase();
  if (s.includes("аналит") || s.includes("analytics")) return "analytics";
  if (s.includes("inst") || s.includes("инст")) return "inst";
  if (s.includes("vk") || s.includes("вк")) return "vk";
  if (s.includes("email") || s.includes("почт")) return "email";
  if (s.includes("support") || s.includes("поддерж")) return "support";
  if (s.includes("tg") || s.includes("telegram") || s.includes("телег")) return "tg";
  return "other";
}

function layoutCards(n) {
  if (n === 0) return [];
  const cols = Math.min(n, MAX_PER_ROW);
  return Array.from({ length: n }, (_, i) => ({
    x: (i % cols) * (CARD_W + GAP_X),
    y: Math.floor(i / cols) * (CARD_H + GAP_Y),
  }));
}

// ── Workflow card — same style as AgentCard ──────────────────
function WorkflowCard({ ch, pos, deptCol, onClick }) {
  const [hov, setHov] = useState(false);
  const type = chanIcon(ch);
  const chanCol = CHAN_COLORS[type] || CHAN_COLORS.other;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "absolute",
        left: pos.x, top: pos.y,
        width: CARD_W, height: CARD_H,
        background: color.white,
        borderRadius: 24,
        boxShadow: hov
          ? `0 0 0 2px ${deptCol}, 0 4px 16px ${deptCol}22`
          : "0 1px 2px rgba(38,38,51,0.04)",
        display: "flex", alignItems: "center", gap: 12,
        padding: "0 16px",
        cursor: "pointer",
        transition: "box-shadow 0.15s",
        userSelect: "none",
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 12,
        background: chanCol.bg, color: chanCol.icon,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        {CHAN_ICONS[type]}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 510, color: "#262633", lineHeight: 1.2,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {ch.name}
        </div>
        <div style={{ fontSize: 12, color: "rgba(38,38,51,0.5)", marginTop: 3 }}>Воркфлоу</div>
      </div>
      {/* Connection dots — as in AgentCard */}
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

// ── Icons for toolbar ────────────────────────────────────────
const ic = {
  pointer: (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.5 3l13 7-5.6 1.6 1.6 5.6-2 1-3-7-4 4z" />
    </svg>
  ),
  fit: (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6" />
    </svg>
  ),
};

// ── Main export ──────────────────────────────────────────────
export function DepartmentOverviewPage({ dept, onNavigate, onOpenChat }) {
  const panRef = useRef(null);
  const canvasRef = useRef(null);
  const [view, setView] = useState({ x: 0, y: 0 });

  function onMouseDown(e) {
    if (e.button !== 0) return;
    if (e.target !== e.currentTarget && !e.target.dataset?.pan) return;
    panRef.current = { sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y };
  }

  useEffect(() => {
    const onMove = (e) => {
      if (!panRef.current) return;
      const p = panRef.current;
      setView({ x: p.vx + e.clientX - p.sx, y: p.vy + e.clientY - p.sy });
    };
    const onUp = () => { panRef.current = null; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  function fitToView() {
    setView({ x: 0, y: 0 });
  }

  const channels = dept?.channels || [];
  const positions = layoutCards(channels.length);
  const col = dept?.color || "#FF8B3D";

  const cols = Math.min(channels.length || 1, MAX_PER_ROW);
  const rows = Math.ceil((channels.length || 1) / cols);
  const gridW = cols * CARD_W + (cols - 1) * GAP_X;
  const gridH = rows * CARD_H + (rows - 1) * GAP_Y;

  return (
    <div
      ref={canvasRef}
      onMouseDown={onMouseDown}
      data-pan="true"
      style={{
        position: "relative",
        flex: 1, minHeight: 0,
        background: "#F7F7F7",
        backgroundImage: "radial-gradient(circle, #ffffff 1.4px, transparent 1.4px)",
        backgroundSize: "20px 20px",
        backgroundPosition: "10px 10px",
        borderRadius: 16,
        overflow: "hidden",
        cursor: "default",
        userSelect: "none",
      }}
    >
      {/* Breadcrumb */}
      <div style={{
        position: "absolute", top: 18, left: 24,
        display: "flex", alignItems: "center", gap: 8,
        fontSize: 13.5, color: "rgba(38,38,51,0.55)", zIndex: 5,
        pointerEvents: "auto",
      }}>
        <span style={{ cursor: "pointer" }} onClick={() => onNavigate?.("home")}>Отделы</span>
        <span style={{ opacity: 0.6 }}>›</span>
        <span style={{ color: "#262633", fontWeight: 500 }}>{dept?.name}</span>
      </div>

      {/* "Тестировать" button */}
      <button
        onClick={() => onNavigate?.("sandbox")}
        style={{
          position: "absolute", top: 14, right: 16, zIndex: 6,
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: "7px 14px",
          background: "#262633", color: color.white,
          border: "none", borderRadius: 8,
          fontSize: 12.5, fontWeight: 500,
          cursor: "pointer", fontFamily: "inherit",
          boxShadow: "0 1px 3px rgba(38,38,51,0.12)",
        }}
      >
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
        Тестировать
      </button>

      {/* Centered grid */}
      <div
        data-pan="true"
        style={{
          position: "absolute",
          left: `calc(50% + ${view.x}px)`,
          top: `calc(50% + ${view.y}px)`,
          transform: "translate(-50%, -50%)",
          width: gridW, height: gridH,
        }}
      >
        {channels.map((ch, i) => (
          <WorkflowCard
            key={ch.id}
            ch={ch}
            pos={positions[i] || { x: 0, y: 0 }}
            deptCol={col}
            onClick={() => onNavigate?.(ch.page)}
          />
        ))}
        {channels.length === 0 && (
          <div style={{
            width: 220, fontSize: 13, color: "rgba(38,38,51,0.4)",
            textAlign: "center", padding: "40px 0",
          }}>
            Воркфлоу пока нет
          </div>
        )}
      </div>

      {/* Toolbar bottom-left — same as ToolBar in TgKanalPage */}
      <div style={{
        position: "absolute", left: 16, bottom: 16,
        display: "flex", alignItems: "center",
        height: 40, background: color.white,
        border: "1px solid rgba(38,38,51,0.08)",
        borderRadius: 12, padding: "0 10px",
        boxShadow: "0 1px 2px rgba(38,38,51,0.04)",
        gap: 6, zIndex: 11,
      }}>
        <span style={{ color: "rgba(38,38,51,0.5)", display: "flex", alignItems: "center" }}>
          {ic.pointer}
        </span>
        <div style={{ width: 1, height: 18, background: "rgba(38,38,51,0.1)" }} />
        <span style={{
          fontSize: 12, color: "#262633",
          minWidth: 38, textAlign: "center", fontVariantNumeric: "tabular-nums",
        }}>100%</span>
        <div style={{ width: 1, height: 18, background: "rgba(38,38,51,0.1)" }} />
        <button
          onClick={fitToView}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 26, height: 26, borderRadius: 7,
            background: "transparent", border: "none",
            cursor: "pointer", color: "rgba(38,38,51,0.5)",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(38,38,51,0.06)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          {ic.fit}
        </button>
        <div style={{ width: 1, height: 18, background: "rgba(38,38,51,0.1)" }} />
        <span style={{ fontSize: 12, color: "rgba(38,38,51,0.45)", fontWeight: 500 }}>
          {dept?.name}
        </span>
        {channels.length > 0 && (
          <span style={{ fontSize: 12, color: "rgba(38,38,51,0.3)" }}>
            · {channels.length} воркфлоу
          </span>
        )}
      </div>

      {/* "Спросить у Mary" */}
      <button
        onClick={() => onOpenChat ? onOpenChat() : onNavigate?.(channels[0]?.page || "tg-kanal")}
        style={{
          position: "absolute", left: "50%", bottom: 16, transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: 10,
          background: color.white,
          border: "1px solid rgba(38,38,51,0.08)",
          borderRadius: 999,
          padding: "9px 16px 9px 18px",
          boxShadow: "0 2px 8px rgba(38,38,51,0.06)",
          fontSize: 14, color: "#262633", fontWeight: 500,
          cursor: "pointer", fontFamily: "inherit",
        }}
      >
        <span>Спросить у Mary</span>
        <span style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 22, height: 22, borderRadius: 7,
          background: "rgba(255,139,61,0.12)", color: "#FF8B3D",
        }}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"/>
          </svg>
        </span>
      </button>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { color } from "../../ui/tokens.js";

const CHAN_ICONS = {
  tg: <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor"><path d="M21.8 2.2a1 1 0 0 0-1-.2L2.3 9.3a1 1 0 0 0 .1 1.9l4.6 1.5 1.8 5.6a1 1 0 0 0 1.7.4l2.6-2.6 4.5 3.3a1 1 0 0 0 1.5-.7l2.7-15a1 1 0 0 0-.3-.8z"/></svg>,
  inst: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/></svg>,
  vk: <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 15.5h1.9c.4 0 .5-.3.5-.5 0 0 0-2 .9-2.3.9-.3 2 1.8 3.2 2.6.9.6 1.6.5 1.6.5l3.2-.1s1.7-.1.9-1.4c-.1-.2-.6-.9-2.2-2.5C21.3 10 20.9 10 21.2 9.5c.7-1 1.8-2.5 2.3-3.4.3-.6.1-.9-.5-.9h-2c-.5 0-.7.3-.9.6 0 0-1 2.3-2.5 3.8-.7.6-1 .3-1 0V6.3c0-.5-.1-.8-.7-.8h-3.2c-.4 0-.7.3-.7.6 0 .7.9.9.9 2.7v4.1c0 .6-.1.7-.4.7-.6 0-2.1-2.3-3-5C9.3 7.7 9 7.5 8.4 7.5H6.5c-.6 0-.7.3-.7.6 0 .7.7 4 3.3 8.3C11 19 13 20 14.9 20c1 0 1.2-.3 1.2-.7v-2.1c0-.6.1-.7.5-.7z"/></svg>,
  analytics: <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
};

function chanIcon(ch) {
  const s = ((ch.id || "") + (ch.name || "")).toLowerCase();
  if (s.includes("аналит") || s.includes("дайдж") || s.includes("analytics")) return "analytics";
  if (s.includes("inst") || s.includes("инст")) return "inst";
  if (s.includes("vk") || s.includes("вк") || s.includes("вконтакте")) return "vk";
  return "tg";
}

const CARD_W = 164, CARD_H = 176, GAP = 24;

// ── Single workflow card (dashed-border tile) ────────────────────
function WorkflowCard({ ch, x, y, deptColor, onClick }) {
  const [hov, setHov] = useState(false);
  const type = chanIcon(ch);
  const col  = deptColor || "#FF8B3D";
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "absolute", left: x, top: y,
        width: CARD_W, height: CARD_H,
        background: hov ? color.white : "rgba(255,255,255,0.85)",
        borderRadius: 20,
        border: `1.5px dashed ${hov ? col : "rgba(38,38,51,0.2)"}`,
        cursor: "pointer",
        display: "flex", flexDirection: "column",
        padding: "18px 16px 14px",
        transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
        boxShadow: hov ? `0 6px 24px ${col}22` : "none",
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 13,
        background: col + "18",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: col, marginBottom: 10, flexShrink: 0,
      }}>
        {CHAN_ICONS[type]}
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#262633", lineHeight: 1.2, flex: 1, overflow: "hidden" }}>
        {ch.name}
      </div>
      <div style={{
        padding: "7px 12px",
        background: hov ? col + "14" : "rgba(38,38,51,0.05)",
        borderRadius: 9,
        fontSize: 12.5, color: hov ? col : "rgba(38,38,51,0.45)",
        textAlign: "center", fontWeight: 500,
        transition: "background 0.15s, color 0.15s",
        marginTop: 12,
      }}>
        Открыть →
      </div>
    </div>
  );
}

// ── Layout: arrange N cards in a compact grid ────────────────────
function layoutCards(n) {
  if (n === 0) return [];
  const cols = n <= 3 ? n : Math.ceil(Math.sqrt(n));
  return Array.from({ length: n }, (_, i) => ({
    col: i % cols,
    row: Math.floor(i / cols),
  })).map(({ col, row }) => ({
    x: col * (CARD_W + GAP),
    y: row * (CARD_H + GAP),
  }));
}

// ── Main export ──────────────────────────────────────────────────
export function DepartmentOverviewPage({ dept, onNavigate, onOpenChat }) {
  const panRef = useRef(null);
  const [view, setView]     = useState({ x: 0, y: 0 });

  function onMouseDown(e) {
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

  const channels = dept?.channels || [];
  const positions = layoutCards(channels.length);

  // Compute total grid size to center it
  if (channels.length === 0) positions.push({ x: 0, y: 0 }); // avoid crash
  const cols = channels.length <= 3 ? channels.length : Math.ceil(Math.sqrt(channels.length));
  const rows = Math.ceil(channels.length / cols);
  const gridW = cols * CARD_W + (cols - 1) * GAP;
  const gridH = rows * CARD_H + (rows - 1) * GAP;

  return (
    <div
      onMouseDown={onMouseDown}
      data-pan="true"
      style={{
        position: "relative",
        flex: 1, minHeight: 0,
        background: "#F0F0F2",
        backgroundImage: "radial-gradient(circle, rgba(38,38,51,0.13) 1.2px, transparent 1.2px)",
        backgroundSize: "22px 22px",
        backgroundPosition: "11px 11px",
        borderRadius: 16,
        overflow: "hidden",
        cursor: panRef.current ? "grabbing" : "default",
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

      {/* Centered grid of workflow cards */}
      <div
        data-pan="true"
        style={{
          position: "absolute",
          left: `calc(50% + ${view.x}px)`,
          top: `calc(50% + ${view.y}px)`,
          transform: `translate(-50%, -50%)`,
          width: gridW, height: gridH,
        }}
      >
        {channels.map((ch, i) => (
          <WorkflowCard
            key={ch.id}
            ch={ch}
            x={positions[i]?.x ?? 0}
            y={positions[i]?.y ?? 0}
            deptColor={dept?.color}
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

      {/* Toolbar bottom-left */}
      <div style={{
        position: "absolute", left: 16, bottom: 16,
        display: "flex", alignItems: "center",
        height: 40, background: color.white,
        border: "1px solid rgba(38,38,51,0.08)",
        borderRadius: 12, padding: "0 14px",
        boxShadow: "0 1px 2px rgba(38,38,51,0.04)",
        gap: 8, zIndex: 11,
        fontSize: 12.5, color: "rgba(38,38,51,0.5)", fontWeight: 500,
        pointerEvents: "none",
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%",
          background: dept?.color || "#FF8B3D",
          display: "inline-block",
        }} />
        {dept?.name}
        {channels.length > 0 && (
          <span style={{ color: "rgba(38,38,51,0.3)", marginLeft: 4 }}>· {channels.length} воркфлоу</span>
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
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 7, background: "rgba(255,139,61,0.12)", color: "#FF8B3D" }}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"/>
          </svg>
        </span>
      </button>
    </div>
  );
}

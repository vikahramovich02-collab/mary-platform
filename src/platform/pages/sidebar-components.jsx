import { useState, useEffect } from "react";
import { color, transition, cv } from "../../ui/tokens.js";
import { ic } from "../icons.jsx";
import { AGENTS, CARD_W, CARD_H } from "../agents-config.js";
import { zoomBtn } from "../chat-panel.jsx";

// ── Mary логотип (PNG из брендбука) ─────────────────────────
export function MaryLogo({ height = 22 }) {
  return <img src="/brand_logo.png" alt="mary" style={{ height, width: "auto", display: "block" }} />;
}


// ── Сайдбар-айтемы ──────────────────────────────────────────
export function SideRow({ icon, label, active, indent = 0, trailing, onClick, weight = 450 }) {
  const [h, setH] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        height: 40,
        padding: `0 10px 0 ${10 + indent}px`,
        margin: "1px 8px",
        borderRadius: 8,
        background: active ? cv.userBubble : h ? cv.hover : "transparent",
        color: cv.text,
        cursor: "pointer",
        transition: transition.fast,
        userSelect: "none",
      }}
    >
      {icon && <span style={{ display: "flex", width: 14, height: 14, color: cv.text, flexShrink: 0 }}>{icon}</span>}
      <span style={{ fontSize: 13.5, fontWeight: weight, lineHeight: 1.1, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {label}
      </span>
      {trailing}
    </div>
  );
}

export function SectionHeader({ label, action }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 18px 4px", color: "rgba(38,38,51,0.45)",
      fontSize: 11, fontWeight: 500,
    }}>
      <span>{label}</span>
      {action}
    </div>
  );
}

// ── Граф агентов ─────────────────────────────────────────────
export function PipelineItem({ p, onOpenKb, blocked }) {
  const [h, setH] = useState(false);
  const clickable = !blocked && p.status === "ready" && p.kb;
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (clickable) onOpenKb(p.kb);
      }}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 10px",
        borderRadius: 9,
        background: h && clickable ? "rgba(38,38,51,0.06)" : "transparent",
        cursor: clickable ? "pointer" : "default",
        transition: transition.fast,
      }}
    >
      <span style={{
        fontSize: 13, fontWeight: 500,
        color: blocked ? "rgba(38,38,51,0.4)" : "#262633",
        flex: 1, minWidth: 0,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>{p.title}</span>
      {p.unread && (
        <span style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "#FF8B3D", flexShrink: 0,
        }} />
      )}
    </div>
  );
}

export function AgentCard({ a, expanded, selected, active, dragging, onMouseDown, onToggle, onOpenKb, onOpenChat, onOpenSettings, onOpenFlow }) {
  const [h, setH] = useState(false);
  const [running, setRunning] = useState(true);
  const hasPipeline = (a.pipeline?.length || 0) > 0;
  const showToolbar = h || expanded || selected;
  const dot = {
    position: "absolute", top: 32, transform: "translateY(-50%)",
    width: 9, height: 9, borderRadius: "50%",
    background: color.white, border: "1px solid rgba(38,38,51,0.18)",
  };
  return (
    <div
      onMouseDown={onMouseDown}
      onClick={onToggle}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        position: "absolute", left: a.x, top: a.y,
        width: CARD_W,
        background: color.white,
        borderRadius: 24,
        border: active ? `2px solid ${a.color}` : "none",
        boxShadow: active
          ? `0 0 0 4px ${a.color}22, 0 6px 20px ${a.color}55`
          : dragging
            ? "0 12px 32px rgba(38,38,51,0.18)"
            : (selected || expanded || h)
              ? "0 2px 6px rgba(38,38,51,0.05)"
              : "0 1px 2px rgba(38,38,51,0.03)",
        display: "flex", flexDirection: "column",
        cursor: dragging ? "grabbing" : "grab",
        transition: dragging ? "none" : transition.fast,
        zIndex: active ? 8 : dragging ? 10 : (expanded || selected) ? 4 : 1,
        userSelect: "none",
      }}
    >
      {active && (
        <span style={{
          position: "absolute", top: -10, left: 18,
          padding: "2px 9px",
          background: a.color, color: color.white,
          fontSize: 10, fontWeight: 600,
          borderRadius: 999, letterSpacing: "0.04em", textTransform: "uppercase",
          display: "inline-flex", alignItems: "center", gap: 5,
          boxShadow: `0 2px 6px ${a.color}66`, zIndex: 1,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%", background: color.white,
            animation: "marypulse 1.2s ease-in-out infinite",
          }} />
          работает
        </span>
      )}
      {/* Header (всегда виден) */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "0 16px", height: CARD_H,
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: a.color + "26",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <span style={{ color: a.color, display: "flex" }}>{ic.agentBot}</span>
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 510, color: "#262633", lineHeight: 1.1 }}>{a.label}</div>
          <div style={{ fontSize: 12, color: "rgba(38,38,51,0.5)", marginTop: 3 }}>Агент</div>
        </div>
      </div>

      {/* Pipeline (только в expanded) */}
      {expanded && hasPipeline && (
        <div style={{
          padding: "4px 8px 10px",
          borderTop: "1px solid rgba(38,38,51,0.06)",
          display: "flex", flexDirection: "column", gap: 2,
        }}>
          {a.pipeline.map((p, i) => (
            <PipelineItem
              key={i}
              p={p}
              onOpenKb={onOpenKb}
            />
          ))}
          {a.flow && onOpenFlow && (
            <button
              onClick={(e) => { e.stopPropagation(); onOpenFlow(); }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 8, padding: "8px 10px", marginTop: 6,
                background: "rgba(122,134,255,0.08)",
                color: "#7A86FF",
                border: "none", borderRadius: 9,
                fontSize: 12.5, fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit",
                width: "100%", textAlign: "left",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(122,134,255,0.14)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(122,134,255,0.08)"}
            >
              <span>Раскрыть workflow</span>
              <span>{ic.arrowRight}</span>
            </button>
          )}
        </div>
      )}

      {/* Точка «есть что-то на тебя» */}
      {a.hasUpdate && (
        <span style={{
          position: "absolute", top: 8, right: 10,
          width: 8, height: 8, borderRadius: "50%",
          background: "#FF8B3D",
          boxShadow: "0 0 0 2px " + color.white,
        }} />
      )}

      {/* Hover toolbar — действия над агентом */}
      {showToolbar && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: -42, right: 0,
            display: "flex", gap: 4,
            background: color.white,
            border: "1px solid rgba(38,38,51,0.08)",
            borderRadius: 999,
            padding: "4px 6px",
            boxShadow: "0 4px 12px rgba(38,38,51,0.08)",
            zIndex: 5,
          }}
        >
          <CardToolBtn icon={ic.chatSm} title="Открыть чат" onClick={() => onOpenChat?.(a.id)} />
          <CardToolBtn icon={ic.gear}   title="Настройки"    onClick={() => onOpenSettings?.(a.id)} />
          <CardToolBtn
            icon={running ? ic.stopSm : ic.play}
            title={running ? "Остановить" : "Запустить"}
            onClick={() => setRunning(v => !v)}
            color={running ? "#FF3407" : "#34C759"}
          />
        </div>
      )}

      {/* Connection dots */}
      <span style={{ ...dot, left: -4 }} />
      <span style={{ ...dot, right: -4 }} />
    </div>
  );
}

export function CardToolBtn({ icon, title, onClick, color: c }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      title={title}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 28, height: 28,
        background: h ? "rgba(38,38,51,0.06)" : "transparent",
        border: "none", borderRadius: 999,
        cursor: "pointer", color: c || "#262633",
        fontFamily: "inherit",
        transition: transition.fast,
      }}
    >{icon}</button>
  );
}

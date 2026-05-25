import { useState, useEffect, useRef } from "react";
import { color, transition } from "../../ui/tokens.js";
import { AGENTS } from "../agents-config.js";

const NODE_W = 220, NODE_H = 56, NODE_GAP = 14, COL_GAP = 160, LABEL_H = 36;

const ROBOT_ICON = (
  <svg width={16} height={16} viewBox="0 0 24 24">
    <rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor"/>
    <rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor"/>
    <circle cx="9.3" cy="13" r="1.4" fill="white"/>
    <circle cx="14.7" cy="13" r="1.4" fill="white"/>
  </svg>
);

const CHAN_ICONS = {
  tg: <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor"><path d="M21.8 2.2a1 1 0 0 0-1-.2L2.3 9.3a1 1 0 0 0 .1 1.9l4.6 1.5 1.8 5.6a1 1 0 0 0 1.7.4l2.6-2.6 4.5 3.3a1 1 0 0 0 1.5-.7l2.7-15a1 1 0 0 0-.3-.8z"/></svg>,
  inst: <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r=".5" fill="currentColor"/></svg>,
  vk: <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 15.5h1.9c.4 0 .5-.3.5-.5 0 0 0-2 .9-2.3.9-.3 2 1.8 3.2 2.6.9.6 1.6.5 1.6.5l3.2-.1s1.7-.1.9-1.4c-.1-.2-.6-.9-2.2-2.5C21.3 10 20.9 10 21.2 9.5c.7-1 1.8-2.5 2.3-3.4.3-.6.1-.9-.5-.9h-2c-.5 0-.7.3-.9.6 0 0-1 2.3-2.5 3.8-.7.6-1 .3-1 0V6.3c0-.5-.1-.8-.7-.8h-3.2c-.4 0-.7.3-.7.6 0 .7.9.9.9 2.7v4.1c0 .6-.1.7-.4.7-.6 0-2.1-2.3-3-5C9.3 7.7 9 7.5 8.4 7.5H6.5c-.6 0-.7.3-.7.6 0 .7.7 4 3.3 8.3C11 19 13 20 14.9 20c1 0 1.2-.3 1.2-.7v-2.1c0-.6.1-.7.5-.7z"/></svg>,
};

function chanType(ch) {
  const s = ((ch.id || "") + (ch.name || "")).toLowerCase();
  if (s.includes("inst") || s.includes("инст")) return "inst";
  if (s.includes("vk") || s.includes("вк") || s.includes("вконтакте")) return "vk";
  return "tg";
}

// ── Absolutely-positioned agent node ────────────────────────────
function AgentNode({ agent, x, y, hover, onHover }) {
  const iconBg    = (agent.color || "#7A86FF") + "22";
  const iconColor = agent.color || "#7A86FF";
  return (
    <div
      style={{
        position: "absolute", left: x, top: y,
        width: NODE_W, height: NODE_H,
        display: "flex", alignItems: "center", gap: 10,
        padding: "0 14px",
        background: color.white,
        borderRadius: 24,
        boxShadow: "0 1px 4px rgba(38,38,51,0.07), 0 0 0 1px rgba(38,38,51,0.06)",
      }}
    >
      {/* left port */}
      <span style={{ position: "absolute", left: -4, top: "50%", transform: "translateY(-50%)", width: 8, height: 8, borderRadius: "50%", background: color.white, border: "1px solid rgba(38,38,51,0.18)" }} />
      <div style={{ width: 36, height: 36, borderRadius: 11, background: iconBg, color: iconColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {ROBOT_ICON}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 510, color: "#262633", lineHeight: 1.15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{agent.label}</div>
        <div style={{ fontSize: 11, color: "rgba(38,38,51,0.5)", marginTop: 2 }}>Агент</div>
      </div>
      {/* right port */}
      <span style={{ position: "absolute", right: -4, top: "50%", transform: "translateY(-50%)", width: 8, height: 8, borderRadius: "50%", background: color.white, border: "1px solid rgba(38,38,51,0.18)" }} />
    </div>
  );
}

// ── Absolutely-positioned channel node ──────────────────────────
function ChannelNode({ ch, x, y, deptColor, onClick }) {
  const [hov, setHov] = useState(false);
  const type = chanType(ch);
  const col  = deptColor || "#FF8B3D";
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "absolute", left: x, top: y,
        width: NODE_W, height: NODE_H,
        display: "flex", alignItems: "center", gap: 10,
        padding: "0 14px",
        background: color.white,
        borderRadius: 24,
        boxShadow: hov
          ? `0 4px 16px ${col}35, 0 0 0 1.5px ${col}`
          : "0 1px 4px rgba(38,38,51,0.07), 0 0 0 1px rgba(38,38,51,0.06)",
        cursor: "pointer",
        transition: "box-shadow 0.15s",
      }}
    >
      {/* left port */}
      <span style={{ position: "absolute", left: -4, top: "50%", transform: "translateY(-50%)", width: 8, height: 8, borderRadius: "50%", background: color.white, border: "1px solid rgba(38,38,51,0.18)" }} />
      <div style={{ width: 36, height: 36, borderRadius: 11, background: col + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: col }}>
        {CHAN_ICONS[type]}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 510, color: "#262633", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ch.name}</div>
        <div style={{ fontSize: 11, color: "rgba(38,38,51,0.5)", marginTop: 2 }}>Воркфлоу</div>
      </div>
      <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="rgba(38,38,51,0.35)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <path d="M5 12h14M13 6l6 6-6 6"/>
      </svg>
      {/* right port */}
      <span style={{ position: "absolute", right: -4, top: "50%", transform: "translateY(-50%)", width: 8, height: 8, borderRadius: "50%", background: color.white, border: "1px solid rgba(38,38,51,0.18)" }} />
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────
export function DepartmentOverviewPage({ dept, onNavigate }) {
  const canvasRef = useRef(null);
  const panRef    = useRef(null);
  const [view, setView] = useState({ x: 0, y: 0 });

  // Pan
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

  // Normalize agents
  const rawAgents = dept?.agents?.length > 0 ? dept.agents : AGENTS;
  const agents = rawAgents.map(a => ({
    id:    a.id,
    label: a.label || a.role || a.name || "Агент",
    color: a.color,
  }));
  const channels = dept?.channels || [];

  // Layout math — agents left, channels right, both vertically centered
  const leftH  = agents.length  * NODE_H + Math.max(0, agents.length  - 1) * NODE_GAP;
  const rightH = channels.length * NODE_H + Math.max(0, channels.length - 1) * NODE_GAP;
  const totalH = Math.max(leftH, rightH);
  const leftOff  = (totalH - leftH)  / 2;
  const rightOff = (totalH - rightH) / 2;

  const CANVAS_W = NODE_W * 2 + COL_GAP;
  const CANVAS_H = LABEL_H + totalH + 20;

  const agentNodes = agents.map((a, i) => ({
    ...a,
    x: 0,
    y: LABEL_H + leftOff + i * (NODE_H + NODE_GAP),
  }));
  const channelNodes = channels.map((ch, i) => ({
    ...ch,
    x: NODE_W + COL_GAP,
    y: LABEL_H + rightOff + i * (NODE_H + NODE_GAP),
  }));

  // Edges: every agent → every channel
  const edges = [];
  for (const a of agentNodes) {
    const x1 = a.x + NODE_W, y1 = a.y + NODE_H / 2;
    for (const ch of channelNodes) {
      const x2 = ch.x, y2 = ch.y + NODE_H / 2;
      const mx = (x1 + x2) / 2;
      edges.push({ x1, y1, x2, y2, mx });
    }
  }

  return (
    <div
      ref={canvasRef}
      onMouseDown={onMouseDown}
      data-pan="true"
      style={{
        position: "relative",
        flex: 1, minHeight: 0,
        background: "#F7F7F7",
        backgroundImage: "radial-gradient(circle, #FFFFFF 1.4px, transparent 1.4px)",
        backgroundSize: "20px 20px",
        backgroundPosition: "10px 10px",
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
      }}>
        <span style={{ cursor: "pointer" }} onClick={() => onNavigate?.("home")}>Отделы</span>
        <span style={{ opacity: 0.6 }}>›</span>
        <span style={{ color: "#262633", fontWeight: 500 }}>{dept?.name}</span>
      </div>

      {/* Action button */}
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
          boxShadow: "0 1px 3px rgba(38,38,51,0.08)",
        }}
      >
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
        Тестировать
      </button>

      {/* Pannable graph centered in canvas */}
      <div
        data-pan="true"
        style={{
          position: "absolute",
          left: "50%", top: "50%",
          transform: `translate(calc(-50% + ${view.x}px), calc(-50% + ${view.y}px))`,
          width: CANVAS_W, height: CANVAS_H,
        }}
      >
        {/* Column labels */}
        <div style={{ position: "absolute", left: 0, top: 0, fontSize: 11, fontWeight: 600, color: "rgba(38,38,51,0.4)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
          Общие агенты
        </div>
        <div style={{ position: "absolute", left: NODE_W + COL_GAP, top: 0, fontSize: 11, fontWeight: 600, color: "rgba(38,38,51,0.4)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
          Воркфлоу / Каналы
        </div>

        {/* SVG edges */}
        <svg style={{ position: "absolute", inset: 0, width: CANVAS_W, height: CANVAS_H, pointerEvents: "none", overflow: "visible" }}>
          {edges.map((e, i) => (
            <path key={i}
              d={`M ${e.x1} ${e.y1} C ${e.mx} ${e.y1}, ${e.mx} ${e.y2}, ${e.x2} ${e.y2}`}
              fill="none" stroke="rgba(38,38,51,0.14)" strokeWidth={1.5}
            />
          ))}
        </svg>

        {/* Agent nodes */}
        {agentNodes.map(a => (
          <AgentNode key={a.id} agent={a} x={a.x} y={a.y} />
        ))}

        {/* Channel nodes */}
        {channelNodes.map(ch => (
          <ChannelNode
            key={ch.id} ch={ch} x={ch.x} y={ch.y}
            deptColor={dept?.color}
            onClick={() => onNavigate?.(ch.page)}
          />
        ))}

        {/* No channels fallback */}
        {channels.length === 0 && (
          <div style={{ position: "absolute", left: NODE_W + COL_GAP + 20, top: LABEL_H + totalH / 2 - 10, fontSize: 13, color: "rgba(38,38,51,0.4)" }}>
            Каналов пока нет
          </div>
        )}
      </div>

      {/* Toolbar bottom-left */}
      <div style={{
        position: "absolute", left: 16, bottom: 16,
        display: "flex", alignItems: "center",
        height: 40, background: color.white,
        border: "1px solid rgba(38,38,51,0.08)",
        borderRadius: 12, padding: "0 10px",
        boxShadow: "0 1px 2px rgba(38,38,51,0.04)",
        gap: 6, zIndex: 11,
        fontSize: 12, color: "rgba(38,38,51,0.5)", fontWeight: 500,
      }}>
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        </svg>
        <span>{dept?.name}</span>
      </div>

      {/* "Спросить у Mary" */}
      <button
        onClick={() => onNavigate?.(channels[0]?.page || "tg-kanal")}
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

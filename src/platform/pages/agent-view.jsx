import { useState, useRef, useEffect } from "react";
import { color, transition } from "../../ui/tokens.js";
import { ic } from "../icons.jsx";
import { zoomBtn } from "../chat-panel.jsx";
import { AGENTS } from "../agents-config.js";
import { AgentLogsView, AgentOutputView } from "../bottom-panel.jsx";
import { BuildNode, AgentNodeExpanded } from "../build-nodes.jsx";

const iconSquareBtn = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  width: 28, height: 28,
  background: "rgba(38,38,51,0.04)",
  border: "1px solid rgba(38,38,51,0.06)",
  borderRadius: 7,
  cursor: "pointer", color: "rgba(38,38,51,0.6)",
  fontFamily: "inherit",
};

const drawerRow = {
  display: "flex", alignItems: "center", gap: 10,
  padding: "10px 12px",
  borderRadius: 10,
  background: "rgba(38,38,51,0.025)",
};

// ── Узел внутреннего workflow (drill-in) ───────────────────
export function FlowNode({ n, pos, w, h, accent = "#7A86FF", visible = true }) {
  const style = (kind) => {
    switch (kind) {
      case "input":      return { iconBg: "#FFF4D1", iconColor: "#FFB800",
        icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg> };
      case "subagent":   return { iconBg: "#EEF0FF", iconColor: "#7A86FF",
        icon: <svg width={18} height={18} viewBox="0 0 24 24"><rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor"/><rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor"/><circle cx="9.3" cy="13" r="1.4" fill="white"/><circle cx="14.7" cy="13" r="1.4" fill="white"/></svg> };
      case "llm-step":   return { iconBg: "#FFE7F5", iconColor: "#D946A8",
        icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 L14.5 9 L22 12 L14.5 15 L12 22 L9.5 15 L2 12 L9.5 9 Z"/></svg> };
      case "output-kb":  return { iconBg: "#E8F8EE", iconColor: "#34C759",
        icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> };
      case "next-agent": return { iconBg: accent + "26", iconColor: accent,
        icon: <svg width={18} height={18} viewBox="0 0 24 24"><rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor"/><rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor"/><circle cx="9.3" cy="13" r="1.4" fill="white"/><circle cx="14.7" cy="13" r="1.4" fill="white"/></svg> };
      default:           return { iconBg: "#EEF0FF", iconColor: "#7A86FF", icon: null };
    }
  };
  const s = style(n.kind);
  return (
    <div
      style={{
        position: "absolute",
        left: pos.x, top: pos.y,
        width: w, height: h,
        background: color.white,
        borderRadius: 24,
        boxShadow: "0 1px 2px rgba(38,38,51,0.04)",
        display: "flex", alignItems: "center", gap: 10,
        padding: "0 14px",
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.92)",
        transition: "opacity 0.4s ease 0.2s, transform 0.4s ease 0.2s",
        userSelect: "none",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 11,
        background: s.iconBg, color: s.iconColor,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>{s.icon}</div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{
          fontSize: 13, fontWeight: 510, color: "#262633", lineHeight: 1.15,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{n.title}</div>
        <div style={{
          fontSize: 11, color: "rgba(38,38,51,0.5)", marginTop: 2,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{n.sub}</div>
      </div>
      {/* Connector dots */}
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

// ── Sub-graph workflow одного агента (LEGACY — overlay, не используется) ───
export function AgentFlowCanvas({ agent, onClose }) {
  const FLOW_NODE_W = 240;
  const FLOW_NODE_H = 64;
  const FLOW_PAD_X = 40;
  const FLOW_PAD_Y = 80; // снизу шапки
  const LANE_LABEL_H = 28;

  if (!agent?.flow) return null;
  const { nodes, edges, lanes = [] } = agent.flow;
  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));

  function pathBetween(a, b) {
    if (!a || !b) return "";
    const ax = a.x + FLOW_NODE_W;
    const ay = a.y + FLOW_NODE_H / 2;
    const bx = b.x;
    const by = b.y + FLOW_NODE_H / 2;
    const dx = Math.max(40, (bx - ax) / 2);
    return `M ${ax} ${ay} C ${ax + dx} ${ay}, ${bx - dx} ${by}, ${bx} ${by}`;
  }

  // Цвета и иконки в нашем стиле
  const nodeStyle = (kind) => {
    switch (kind) {
      case "trigger-cron":   return { iconBg: "#FFF4D1", iconColor: "#FFB800", labelKind: "Триггер · cron" };
      case "trigger-manual": return { iconBg: "#FFF4D1", iconColor: "#FFB800", labelKind: "Триггер · вручную" };
      case "integration":    return { iconBg: "#E6F1FF", iconColor: "#3F95FF", labelKind: "Источник" };
      case "subagent":       return { iconBg: "#EEF0FF", iconColor: "#7A86FF", labelKind: "Агент" };
      case "next-agent":     return { iconBg: agent.color + "26", iconColor: agent.color, labelKind: "Следующий агент" };
      case "output-kb":      return { iconBg: "#E8F8EE", iconColor: "#34C759", labelKind: "Артефакт" };
      default:               return { iconBg: "#EEF0FF", iconColor: "#7A86FF", labelKind: "" };
    }
  };

  const nodeIcon = (kind) => {
    if (kind === "trigger-cron") {
      return (
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    }
    if (kind === "trigger-manual") {
      return (
        <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 2 L4 14 h7 v8 l9 -12 h-7 z" />
        </svg>
      );
    }
    if (kind === "integration") {
      return (
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M3 9h18M9 3v18" />
        </svg>
      );
    }
    if (kind === "output-kb") {
      return (
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
      );
    }
    // subagent / next-agent — мини-робот как у AgentCard
    return (
      <svg width={18} height={18} viewBox="0 0 24 24">
        <rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor" />
        <rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor" />
        <circle cx="9.3" cy="13" r="1.4" fill="white" />
        <circle cx="14.7" cy="13" r="1.4" fill="white" />
      </svg>
    );
  };

  // Подсчёт canvas-bounds
  const maxX = Math.max(...nodes.map(n => n.x)) + FLOW_NODE_W + FLOW_PAD_X * 2;
  const maxY = Math.max(...nodes.map(n => n.y)) + FLOW_NODE_H + FLOW_PAD_Y + 80;

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: color.white,
      borderRadius: 18,
      zIndex: 6,
      display: "flex", flexDirection: "column",
    }}>
      {/* Шапка drill-in */}
      <div style={{
        position: "sticky", top: 0, zIndex: 3,
        display: "flex", alignItems: "center", gap: 14,
        padding: "14px 20px",
        background: "linear-gradient(to bottom, rgba(255,255,255,0.97), rgba(255,255,255,0.88))",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(38,38,51,0.06)",
      }}>
        <button
          onClick={onClose}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 12px 6px 8px",
            background: "rgba(38,38,51,0.05)",
            color: "#262633",
            border: "none", borderRadius: 999,
            fontSize: 13, fontWeight: 500,
            cursor: "pointer", fontFamily: "inherit",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(38,38,51,0.09)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(38,38,51,0.05)"}
        >
          <span style={{ transform: "rotate(180deg)", display: "inline-flex", color: "rgba(38,38,51,0.6)" }}>{ic.arrowRight}</span>
          <span>Назад к графу</span>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: agent.color + "26",
            color: agent.color,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width={22} height={22} viewBox="0 0 24 24">
              <rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor" />
              <rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor" />
              <circle cx="9.3" cy="13" r="1.4" fill="white" />
              <circle cx="14.7" cy="13" r="1.4" fill="white" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#262633" }}>{agent.label}</div>
            <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.5)", marginTop: 1 }}>{agent.role}</div>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(38,38,51,0.5)" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34C759" }} />
          <span>workflow активен</span>
        </div>
      </div>

      {/* Канвас workflow — растянут на оставшуюся высоту со scroll */}
      <div style={{
        flex: 1, minHeight: 0, overflow: "auto",
        backgroundImage: "radial-gradient(rgba(38,38,51,0.12) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        backgroundPosition: "10px 10px",
      }}>
      <div style={{
        position: "relative",
        width: maxX,
        minHeight: maxY,
        padding: 0,
      }}>
        {/* Lane-заголовки */}
        {lanes.map(lane => (
          <div
            key={lane.id}
            style={{
              position: "absolute",
              left: lane.x + FLOW_PAD_X,
              top: FLOW_PAD_Y - LANE_LABEL_H,
              width: FLOW_NODE_W,
              fontSize: 11, fontWeight: 600,
              color: "rgba(38,38,51,0.45)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >{lane.label}</div>
        ))}

        {/* SVG-связи */}
        <svg
          width={maxX} height={maxY}
          style={{ position: "absolute", left: FLOW_PAD_X, top: FLOW_PAD_Y, pointerEvents: "none", overflow: "visible" }}
        >
          {edges.map(([f, t]) => (
            <path
              key={`${f}-${t}`}
              d={pathBetween(byId[f], byId[t])}
              stroke="rgba(38,38,51,0.18)"
              strokeWidth="1.4"
              fill="none"
            />
          ))}
        </svg>

        {/* Узлы */}
        {nodes.map(n => {
          const ns = nodeStyle(n.kind);
          return (
            <div
              key={n.id}
              style={{
                position: "absolute",
                left: n.x + FLOW_PAD_X,
                top: n.y + FLOW_PAD_Y,
                width: FLOW_NODE_W, height: FLOW_NODE_H,
                background: color.white,
                borderRadius: 24,
                display: "flex", alignItems: "center", gap: 12,
                padding: "0 16px",
                boxShadow: "0 1px 2px rgba(38,38,51,0.04)",
              }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: ns.iconBg, color: ns.iconColor,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>{nodeIcon(n.kind)}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontSize: 13.5, fontWeight: 510, color: "#262633",
                  lineHeight: 1.15,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{n.title}</div>
                <div style={{
                  fontSize: 11.5, color: "rgba(38,38,51,0.5)", marginTop: 3,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{n.sub}</div>
              </div>
              {/* Connector dots — как в основном графе */}
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
        })}
      </div>
      </div>
    </div>
  );
}

// ── pipelineToFlow: бэк-pipeline (type/edges[[from,to]]) → frontend-flow с auto-layout ──
export function pipelineToFlow(pipeline, agentColor = "#7A86FF") {
  if (!pipeline?.nodes?.length) return null;
  const { nodes, edges } = pipeline;
  // 1) Считаем in-degree
  const inDeg = Object.fromEntries(nodes.map(n => [n.id, 0]));
  for (const [_, to] of edges) if (inDeg[to] !== undefined) inDeg[to]++;
  // 2) Layered layout (BFS по уровням)
  const level = Object.fromEntries(nodes.map(n => [n.id, 0]));
  const queue = nodes.filter(n => inDeg[n.id] === 0).map(n => n.id);
  const seen = new Set(queue);
  const adj = {};
  for (const [from, to] of edges) (adj[from] = adj[from] || []).push(to);
  while (queue.length) {
    const id = queue.shift();
    for (const nxt of adj[id] || []) {
      level[nxt] = Math.max(level[nxt], level[id] + 1);
      if (!seen.has(nxt)) { seen.add(nxt); queue.push(nxt); }
    }
  }
  // 3) Группировка по уровням
  const levels = {};
  for (const n of nodes) {
    const L = level[n.id] || 0;
    (levels[L] = levels[L] || []).push(n);
  }
  // 4) Координаты: ox = (level - centerLevel) * 280, oy = (rowIdx - midRow) * 110
  const maxLevel = Math.max(...Object.keys(levels).map(Number));
  const centerLevel = maxLevel / 2;
  // type → kind для frontend стилей
  const kindMap = (type, settings = {}) => {
    if (type === "trigger") return /cron|расписан/i.test(settings.cron || "") || settings.cron ? "trigger-cron" : "input";
    if (type === "step") return "subagent";
    if (type === "llm") return "llm-step";
    if (type === "output") return (settings.target || "").startsWith("agent:") ? "next-agent" : "output-kb";
    return "subagent";
  };
  const flowNodes = [];
  for (const L of Object.keys(levels).sort((a, b) => +a - +b)) {
    const items = levels[L];
    const midRow = (items.length - 1) / 2;
    items.forEach((n, idx) => {
      flowNodes.push({
        id: n.id,
        kind: kindMap(n.type, n.settings),
        title: n.title,
        sub: n.sub || "",
        ox: (Number(L) - centerLevel) * 280,
        oy: (idx - midRow) * 110,
      });
    });
  }
  return { nodes: flowNodes, edges };
}

export function DepartmentSandbox({ deptId, onClose }) {
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [agents, setAgents] = useState([]); // [{id, role, status, output, error}]
  const abortRef = useRef(null);

  const run = async (dryRun) => {
    if (!input.trim() || running) return;
    setRunning(true);
    setAgents([]);
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const res = await fetch(`/api/mary/departments/${deptId}/sandbox/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, dryRun }),
        signal: ac.signal,
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
            setAgents(prev => [...prev, { id: data.agentId, role: data.role, status: "running" }]);
          } else if (event === "agent_end") {
            setAgents(prev => prev.map(a => a.id === data.agentId
              ? { ...a, status: data.error ? "error" : "done", output: data.output, error: data.error }
              : a));
          }
        }
      }
    } catch (e) {
      if (e.name !== "AbortError") console.error(e);
    } finally {
      setRunning(false);
      abortRef.current = null;
    }
  };

  return (
    <div style={{
      position: "absolute", inset: 16, zIndex: 50,
      background: color.white, borderRadius: 16,
      border: "1px solid rgba(38,38,51,0.08)",
      boxShadow: "0 8px 32px rgba(38,38,51,0.12)",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      {/* Шапка */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid rgba(38,38,51,0.06)",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#262633" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 2v7.31" /><path d="M14 9.3V2" />
          <path d="M8.5 2h7" /><path d="M14 9.3a6.5 6.5 0 1 1-4 0" />
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#262633" }}>Песочница отдела СММ</div>
          <div style={{ fontSize: 12, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>
            Прогон через всех агентов последовательно — output одного → input следующего
          </div>
        </div>
        <button onClick={onClose} title="Закрыть"
          style={{
            background: "transparent", border: "none", padding: 6, borderRadius: 6,
            color: "rgba(38,38,51,0.55)", cursor: "pointer", fontFamily: "inherit",
            display: "inline-flex",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(38,38,51,0.05)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Body — input + run + log */}
      <div style={{
        flex: 1, overflowY: "auto", padding: 20,
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        {/* Input */}
        <div>
          <label style={{ fontSize: 12, color: "rgba(38,38,51,0.6)", display: "block", marginBottom: 6 }}>
            Тема / задача для прогона
          </label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder='Например: "5 привычек продуктивного утра", дружелюбный тон, Instagram'
            rows={2}
            disabled={running}
            style={{
              width: "100%", boxSizing: "border-box",
              border: "1px solid rgba(38,38,51,0.12)", borderRadius: 8,
              padding: "10px 12px", fontSize: 13, color: "#262633",
              fontFamily: "inherit", resize: "vertical", outline: "none",
            }}
          />
        </div>

        {/* Кнопки запуска */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => run(true)} disabled={running || !input.trim()}
            style={{
              padding: "9px 16px",
              background: "transparent", border: "1px solid rgba(38,38,51,0.18)", borderRadius: 8,
              fontSize: 13, color: "#262633", fontWeight: 500,
              cursor: running || !input.trim() ? "not-allowed" : "pointer", fontFamily: "inherit",
            }}>Dry-run (mock)</button>
          <button
            onClick={() => run(false)} disabled={running || !input.trim()}
            style={{
              padding: "9px 16px",
              background: running || !input.trim() ? "rgba(38,38,51,0.3)" : "#262633",
              border: "none", borderRadius: 8,
              fontSize: 13, color: color.white, fontWeight: 500,
              cursor: running || !input.trim() ? "not-allowed" : "pointer", fontFamily: "inherit",
            }}>{running ? "Бежит…" : "Запустить вживую"}</button>
          {running && abortRef.current && (
            <button
              onClick={() => abortRef.current?.abort()}
              style={{
                padding: "9px 14px",
                background: "transparent", border: "1px solid rgba(255,59,48,0.3)", borderRadius: 8,
                fontSize: 13, color: "#FF3B30", fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit",
              }}>Остановить</button>
          )}
        </div>

        {/* Лог по агентам */}
        {agents.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 11, color: "rgba(38,38,51,0.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Прогон
            </div>
            {agents.map((a, i) => (
              <div key={a.id} style={{
                border: "1px solid rgba(38,38,51,0.08)", borderRadius: 10,
                background: a.status === "running" ? "rgba(255,139,61,0.04)" : color.white,
                padding: "10px 14px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: "rgba(38,38,51,0.06)",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 600, color: "rgba(38,38,51,0.7)",
                    flexShrink: 0,
                  }}>{i + 1}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#262633", flex: 1 }}>{a.role}</span>
                  {a.status === "running" && (
                    <span style={{
                      fontSize: 11, color: "#FF8B3D", fontWeight: 500,
                      display: "inline-flex", alignItems: "center", gap: 5,
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: "50%", background: "#FF8B3D",
                        animation: "marypulse 1.2s ease-in-out infinite",
                      }} />Работает
                    </span>
                  )}
                  {a.status === "done" && (
                    <span style={{
                      fontSize: 11, color: "#34C759", fontWeight: 500,
                      display: "inline-flex", alignItems: "center", gap: 5,
                    }}>
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12l5 5L20 7" />
                      </svg>Готово
                    </span>
                  )}
                  {a.status === "error" && (
                    <span style={{ fontSize: 11, color: "#FF3B30", fontWeight: 500 }}>Ошибка</span>
                  )}
                </div>
                {a.output && (
                  <details style={{ marginTop: 8 }}>
                    <summary style={{ cursor: "pointer", fontSize: 11.5, color: "rgba(38,38,51,0.55)" }}>
                      Output
                    </summary>
                    <div style={{
                      marginTop: 6, padding: "8px 10px",
                      background: "rgba(38,38,51,0.04)", borderRadius: 6,
                      fontSize: 12, color: "rgba(38,38,51,0.8)",
                      whiteSpace: "pre-wrap", maxHeight: 200, overflowY: "auto",
                    }}>{a.output}</div>
                  </details>
                )}
                {a.error && (
                  <div style={{ marginTop: 6, fontSize: 12, color: "#FF3B30" }}>{a.error}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Bottom panel в drill-down: Settings / Logs / Output (Sim-style)
export function AgentBottomPanel({ agent, profile, sandboxStatus = {}, sandboxOutputs = {}, sandboxRunning = false, onRun }) {
  const [tab, setTab] = useState("settings");
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  // Преобразуем sandboxStatus в runs[] для AgentLogsView
  const nodes = agent?.flow?.nodes || [];
  const runs = nodes
    .filter(n => sandboxStatus[n.id])
    .map(n => ({
      nodeId: n.id,
      label: n.title || n.id,
      durationMs: sandboxStatus[n.id]?.durationMs || 0,
      status: sandboxStatus[n.id] === "running" ? "running"
            : sandboxStatus[n.id] === "error" ? "error" : "done",
      output: sandboxOutputs[n.id] || "",
    }));
  const selectedRun = runs.find(r => r.nodeId === selectedNodeId) || runs[runs.length - 1];

  // Авто-открыть Logs когда начался прогон
  useEffect(() => {
    if (sandboxRunning && tab === "settings") setTab("logs");
  }, [sandboxRunning]);

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)} style={{
      padding: "8px 16px",
      background: tab === id ? color.white : "transparent",
      color: tab === id ? "#262633" : "rgba(38,38,51,0.55)",
      border: "none", borderBottom: tab === id ? "2px solid #262633" : "2px solid transparent",
      fontSize: 12.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
      transition: "all 0.15s",
    }}>{label}</button>
  );

  return (
    <div style={{
      flexShrink: 0,
      height: 320,
      borderTop: "1px solid rgba(38,38,51,0.1)",
      background: "rgba(247,247,247,0.6)",
      display: "flex", flexDirection: "column",
    }}>
      {/* Tab bar */}
      <div style={{
        display: "flex", gap: 0, padding: "0 16px",
        borderBottom: "1px solid rgba(38,38,51,0.06)",
        background: color.white,
      }}>
        {tabBtn("settings", "⚙️ Settings")}
        {tabBtn("logs", "📋 Logs")}
        {tabBtn("output", "📤 Output")}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        {tab === "settings" && <AgentSettingsView profile={profile} agent={agent} />}
        {tab === "logs" && <AgentLogsView runs={runs} selectedNodeId={selectedNodeId} onSelect={setSelectedNodeId} />}
        {tab === "output" && <AgentOutputView run={selectedRun} />}
      </div>
    </div>
  );
}

export function AgentSettingsView({ profile, agent }) {
  const TOOL_LABELS = {
    "web-search": "Web Search", "knowledge-base": "База знаний", "telegram-parser": "TG-парсер",
    "image-generation": "Image Generation", "crm": "CRM", "email": "Email", "google-sheets": "Google Sheets", "calendar": "Calendar",
  };
  const ALL_TOOLS = Object.keys(TOOL_LABELS);
  const MEMORY_LABELS = { none: "Без памяти", short: "Сессия", long: "Долгосрочная (KB)" };
  const FORMAT_LABELS = { text: "Текст", json: "JSON" };
  const MODELS = [
    "claude-sonnet-4-6", "claude-haiku-4-5", "gpt-4.1", "gpt-4.1-mini", "z-ai/glm-5.1",
  ];

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => ({ ...profile }));
  const [saving, setSaving] = useState(false);

  // Если профиль из props обновляется снаружи (например после reload) — синхронизируем draft когда НЕ в edit-режиме
  useEffect(() => { if (!editing) setDraft({ ...profile }); }, [profile, editing]);

  const startEdit = () => { setDraft({ ...profile }); setEditing(true); };
  const cancelEdit = () => { setDraft({ ...profile }); setEditing(false); };
  const save = async () => {
    setSaving(true);
    try {
      // deptId: пока хардкод smm (drilledAgent живёт в smm-канвасе)
      const deptId = "smm";
      const r = await fetch(`/api/mary/agents/${deptId}/${agent.id}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: draft.model,
          systemPrompt: draft.systemPrompt,
          tools: draft.tools,
          memory: draft.memory,
          responseFormat: draft.responseFormat,
          tasks: draft.tasks,
        }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setEditing(false);
    } catch (e) {
      alert("Не удалось сохранить: " + e.message);
    } finally { setSaving(false); }
  };

  const toggleTool = (t) => {
    setDraft(d => {
      const cur = d.tools || [];
      const next = cur.includes(t) ? cur.filter(x => x !== t) : [...cur, t];
      return { ...d, tools: next };
    });
  };

  return (
    <div style={{ padding: "12px 20px" }}>
      {/* Edit toggle */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: "rgba(38,38,51,0.55)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Должностная инструкция
        </div>
        <div style={{ flex: 1 }} />
        {editing ? (
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={cancelEdit} disabled={saving} style={{
              padding: "5px 12px", fontSize: 12, fontWeight: 500,
              background: "transparent", color: "rgba(38,38,51,0.7)",
              border: "1px solid rgba(38,38,51,0.18)", borderRadius: 7,
              cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit",
            }}>Отмена</button>
            <button onClick={save} disabled={saving} style={{
              padding: "5px 14px", fontSize: 12, fontWeight: 500,
              background: saving ? "rgba(38,38,51,0.3)" : "#262633",
              color: color.white,
              border: "none", borderRadius: 7,
              cursor: saving ? "wait" : "pointer", fontFamily: "inherit",
            }}>{saving ? "Сохраняю…" : "Сохранить"}</button>
          </div>
        ) : (
          <button onClick={startEdit} style={{
            padding: "5px 12px", fontSize: 12, fontWeight: 500,
            background: "transparent", color: "#262633",
            border: "1px solid rgba(38,38,51,0.18)", borderRadius: 7,
            cursor: "pointer", fontFamily: "inherit",
            display: "inline-flex", alignItems: "center", gap: 5,
          }}>
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Изменить
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
        {/* Левая колонка */}
        <div>
          {/* Tasks */}
          {editing ? (
            <textarea
              value={draft.tasks || ""}
              onChange={e => setDraft(d => ({ ...d, tasks: e.target.value }))}
              placeholder="Что агент делает (1-2 предложения)"
              rows={2}
              style={{
                width: "100%", marginBottom: 10,
                padding: "8px 10px",
                background: color.white, border: "1px solid rgba(38,38,51,0.18)", borderRadius: 8,
                fontSize: 12.5, color: "#262633", lineHeight: 1.5,
                resize: "vertical", outline: "none", fontFamily: "inherit",
              }}
            />
          ) : (profile.tasks && (
            <div style={{
              padding: "10px 12px", marginBottom: 10,
              background: color.white, border: "1px solid rgba(38,38,51,0.06)", borderRadius: 8,
              fontSize: 12.5, color: "rgba(38,38,51,0.85)", lineHeight: 1.5,
            }}>{profile.tasks}</div>
          ))}

          <SettingRow label="Model">
            {editing ? (
              <select value={draft.model || ""} onChange={e => setDraft(d => ({ ...d, model: e.target.value }))}
                style={{
                  padding: "3px 8px", borderRadius: 6,
                  background: color.white, border: "1px solid rgba(38,38,51,0.18)",
                  fontSize: 11.5, color: "#262633", fontFamily: "ui-monospace, SF Mono, monospace",
                  cursor: "pointer", outline: "none",
                }}>
                {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            ) : (
              <span style={{
                padding: "2px 8px", borderRadius: 6,
                background: "rgba(122,134,255,0.12)", color: "#5B68E0",
                fontSize: 11.5, fontWeight: 500, fontFamily: "ui-monospace, SF Mono, monospace",
              }}>{profile.model || "—"}</span>
            )}
          </SettingRow>

          <SettingRow label="Memory">
            {editing ? (
              <select value={draft.memory || "short"} onChange={e => setDraft(d => ({ ...d, memory: e.target.value }))}
                style={{
                  padding: "3px 8px", borderRadius: 6,
                  background: color.white, border: "1px solid rgba(38,38,51,0.18)",
                  fontSize: 11.5, color: "#262633", cursor: "pointer", outline: "none", fontFamily: "inherit",
                }}>
                {Object.entries(MEMORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            ) : (
              <span style={{
                padding: "2px 8px", borderRadius: 6,
                background: "rgba(38,38,51,0.05)", color: "rgba(38,38,51,0.75)",
                fontSize: 11.5,
              }}>{MEMORY_LABELS[profile.memory] || profile.memory}</span>
            )}
          </SettingRow>

          <SettingRow label="Response">
            {editing ? (
              <select value={draft.responseFormat || "text"} onChange={e => setDraft(d => ({ ...d, responseFormat: e.target.value }))}
                style={{
                  padding: "3px 8px", borderRadius: 6,
                  background: color.white, border: "1px solid rgba(38,38,51,0.18)",
                  fontSize: 11.5, color: "#262633", cursor: "pointer", outline: "none", fontFamily: "inherit",
                }}>
                {Object.entries(FORMAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            ) : (
              <span style={{
                padding: "2px 8px", borderRadius: 6,
                background: profile.responseFormat === "json" ? "rgba(255,139,61,0.12)" : "rgba(38,38,51,0.05)",
                color: profile.responseFormat === "json" ? "#D97500" : "rgba(38,38,51,0.75)",
                fontSize: 11.5, fontWeight: 500,
              }}>{FORMAT_LABELS[profile.responseFormat] || profile.responseFormat}</span>
            )}
          </SettingRow>

          <SettingRow label="Tools">
            {editing ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {ALL_TOOLS.map(t => {
                  const checked = (draft.tools || []).includes(t);
                  return (
                    <button key={t} onClick={() => toggleTool(t)}
                      style={{
                        padding: "2px 8px", borderRadius: 999,
                        background: checked ? "#262633" : "transparent",
                        color: checked ? color.white : "rgba(38,38,51,0.7)",
                        border: checked ? "none" : "1px solid rgba(38,38,51,0.18)",
                        fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                      }}>{TOOL_LABELS[t]}</button>
                  );
                })}
              </div>
            ) : (
              (profile.tools && profile.tools.length > 0) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {profile.tools.map(t => (
                    <span key={t} style={{
                      padding: "2px 8px", borderRadius: 999,
                      background: "rgba(38,38,51,0.06)", color: "#262633",
                      fontSize: 11, fontWeight: 500,
                    }}>{TOOL_LABELS[t] || t}</span>
                  ))}
                </div>
              ) : <span style={{ color: "rgba(38,38,51,0.4)", fontSize: 11.5 }}>—</span>
            )}
          </SettingRow>
        </div>

        {/* Правая колонка — system prompt */}
        <div>
          <div style={{ fontSize: 11, color: "rgba(38,38,51,0.5)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            System Prompt
          </div>
          {editing ? (
            <textarea
              value={draft.systemPrompt || ""}
              onChange={e => setDraft(d => ({ ...d, systemPrompt: e.target.value }))}
              placeholder="Кто агент, что делает, в каком формате на выходе…"
              style={{
                width: "100%", height: 200,
                padding: "10px 12px",
                background: color.white, border: "1px solid rgba(38,38,51,0.18)", borderRadius: 8,
                fontSize: 12.5, color: "#262633", lineHeight: 1.55,
                resize: "vertical", outline: "none", fontFamily: "inherit",
              }}
            />
          ) : (
            <div style={{
              padding: "10px 12px",
              background: color.white, border: "1px solid rgba(38,38,51,0.06)", borderRadius: 8,
              fontSize: 12.5, color: "#262633", lineHeight: 1.55,
              maxHeight: 220, overflowY: "auto", whiteSpace: "pre-wrap",
            }}>
              {profile.systemPrompt || <span style={{ color: "rgba(38,38,51,0.4)" }}>не указан</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SettingRow({ label, children }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "baseline", padding: "6px 0", borderTop: "1px solid rgba(38,38,51,0.04)" }}>
      <div style={{ width: 80, flexShrink: 0, fontSize: 11.5, color: "rgba(38,38,51,0.5)", fontWeight: 500 }}>{label}</div>
      <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: "#262633" }}>{children}</div>
    </div>
  );
}


// «Должностная инструкция» агента — карточка под шапкой drill-in
export function AgentJobDescription({ agent, profile }) {
  const [expanded, setExpanded] = useState(true);
  const TOOL_LABELS = {
    "web-search": "Web Search",
    "knowledge-base": "База знаний",
    "telegram-parser": "TG-парсер",
    "image-generation": "Image Generation",
    "crm": "CRM",
    "email": "Email",
    "google-sheets": "Google Sheets",
    "calendar": "Calendar",
  };
  const MEMORY_LABELS = { none: "Без памяти", short: "Сессия", long: "Долгосрочная (KB)" };
  const FORMAT_LABELS = { text: "Текст", json: "JSON" };
  const field = (label, value) => (
    <div style={{ display: "flex", gap: 14, alignItems: "baseline", padding: "8px 0", borderTop: "1px solid rgba(38,38,51,0.05)" }}>
      <div style={{ width: 130, flexShrink: 0, fontSize: 11.5, color: "rgba(38,38,51,0.5)", fontWeight: 500 }}>{label}</div>
      <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: "#262633" }}>{value}</div>
    </div>
  );
  return (
    <div style={{
      margin: "14px 20px 0",
      background: color.white,
      border: "1px solid rgba(38,38,51,0.08)",
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(38,38,51,0.03)",
    }}>
      <button onClick={() => setExpanded(e => !e)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px",
          background: "transparent", border: "none", cursor: "pointer",
          fontFamily: "inherit", textAlign: "left",
        }}>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={agent.color || "#262633"} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="13" y2="17" />
        </svg>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: "#262633" }}>Должностная инструкция</span>
        <span style={{ fontSize: 11.5, color: "rgba(38,38,51,0.45)" }}>· {profile.role || agent.role}</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: "rgba(38,38,51,0.5)" }}>{expanded ? "Свернуть" : "Развернуть"}</span>
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="rgba(38,38,51,0.5)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {expanded && (
        <div style={{ padding: "0 16px 14px" }}>
          {profile.tasks && (
            <div style={{
              padding: "10px 12px", marginBottom: 8,
              background: "rgba(38,38,51,0.03)", borderRadius: 8,
              fontSize: 12.5, color: "rgba(38,38,51,0.85)", lineHeight: 1.5,
            }}>{profile.tasks}</div>
          )}

          {field("Model",
            <span style={{
              display: "inline-block",
              padding: "2px 8px", borderRadius: 6,
              background: "rgba(122,134,255,0.12)", color: "#5B68E0",
              fontSize: 11.5, fontWeight: 500, fontFamily: "ui-monospace, SF Mono, monospace",
            }}>{profile.model}</span>
          )}

          {field("System Prompt",
            profile.systemPrompt
              ? (
                <details style={{ fontSize: 12.5, color: "rgba(38,38,51,0.85)" }}>
                  <summary style={{ cursor: "pointer", color: "#262633" }}>
                    {profile.systemPrompt.slice(0, 90)}{profile.systemPrompt.length > 90 ? "…" : ""}
                  </summary>
                  <div style={{
                    marginTop: 8, padding: "10px 12px",
                    background: "rgba(38,38,51,0.03)", borderRadius: 8,
                    fontSize: 12.5, lineHeight: 1.55, whiteSpace: "pre-wrap",
                  }}>{profile.systemPrompt}</div>
                </details>
              )
              : <span style={{ color: "rgba(38,38,51,0.4)" }}>не указан</span>
          )}

          {field("Tools",
            (profile.tools && profile.tools.length > 0)
              ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {profile.tools.map(t => (
                    <span key={t} style={{
                      padding: "2px 8px", borderRadius: 999,
                      background: "rgba(38,38,51,0.06)", color: "#262633",
                      fontSize: 11, fontWeight: 500,
                    }}>{TOOL_LABELS[t] || t}</span>
                  ))}
                </div>
              )
              : <span style={{ color: "rgba(38,38,51,0.4)" }}>—</span>
          )}

          {field("Memory",
            <span style={{
              padding: "2px 8px", borderRadius: 6,
              background: "rgba(38,38,51,0.05)", color: "rgba(38,38,51,0.75)",
              fontSize: 11.5,
            }}>{MEMORY_LABELS[profile.memory] || profile.memory}</span>
          )}

          {field("Response Format",
            <span style={{
              padding: "2px 8px", borderRadius: 6,
              background: profile.responseFormat === "json" ? "rgba(255,139,61,0.12)" : "rgba(38,38,51,0.05)",
              color: profile.responseFormat === "json" ? "#D97500" : "rgba(38,38,51,0.75)",
              fontSize: 11.5, fontWeight: 500,
            }}>{FORMAT_LABELS[profile.responseFormat] || profile.responseFormat}</span>
          )}
        </div>
      )}
    </div>
  );
}

export function SandboxPanel({ agent, status, outputs, running, onRun }) {
  const triggers = (agent.flow?.nodes || []).filter(n => n.kind === "input" || n.kind === "trigger-cron" || n.kind === "trigger-manual");
  const [inputs, setInputs] = useState({});
  const [showResults, setShowResults] = useState(false);
  const completedNodes = Object.entries(status).filter(([_, s]) => s === "done" || s === "error");
  return (
    <div style={{
      position: "absolute", right: 16, top: 80, width: 340,
      maxHeight: "calc(100vh - 200px)", overflowY: "auto",
      background: color.white, border: "1px solid rgba(38,38,51,0.1)", borderRadius: 12,
      boxShadow: "0 4px 16px rgba(38,38,51,0.06)",
      padding: 14, fontFamily: "inherit", zIndex: 5,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#262633" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 2v7.31" /><path d="M14 9.3V2" />
          <path d="M8.5 2h7" /><path d="M14 9.3a6.5 6.5 0 1 1-4 0" />
        </svg>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#262633" }}>Песочница</div>
        <div style={{ flex: 1 }} />
        {running && <span style={{
          width: 6, height: 6, borderRadius: "50%", background: "#FF8B3D",
          animation: "marypulse 1.2s ease-in-out infinite",
        }} />}
      </div>

      {/* Поля для триггеров */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
        {triggers.length === 0 && (
          <div style={{ fontSize: 12, color: "rgba(38,38,51,0.5)" }}>У агента нет trigger-узлов</div>
        )}
        {triggers.map(t => (
          <div key={t.id}>
            <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.6)", marginBottom: 3 }}>{t.title}</div>
            <textarea
              value={inputs[t.id] || ""}
              onChange={e => setInputs(p => ({ ...p, [t.id]: e.target.value }))}
              placeholder={t.sub || "пробное значение"}
              rows={2}
              style={{
                width: "100%", border: "1px solid rgba(38,38,51,0.12)", borderRadius: 8,
                padding: "6px 9px", fontSize: 12.5, color: "#262633",
                fontFamily: "inherit", resize: "vertical", outline: "none",
              }}
            />
          </div>
        ))}
      </div>

      {/* Кнопки запуска */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => { onRun(inputs, true); setShowResults(true); }}
          disabled={running}
          style={{
            flex: 1, padding: "8px 12px",
            background: "transparent", border: "1px solid rgba(38,38,51,0.18)", borderRadius: 8,
            fontSize: 12.5, color: "#262633", fontWeight: 500,
            cursor: running ? "not-allowed" : "pointer", fontFamily: "inherit",
          }}
        >Dry-run (mock)</button>
        <button
          onClick={() => { onRun(inputs, false); setShowResults(true); }}
          disabled={running}
          style={{
            flex: 1, padding: "8px 12px",
            background: running ? "rgba(38,38,51,0.3)" : "#262633",
            border: "none", borderRadius: 8,
            fontSize: 12.5, color: color.white, fontWeight: 500,
            cursor: running ? "not-allowed" : "pointer", fontFamily: "inherit",
          }}
        >{running ? "Бежит…" : "Запустить вживую"}</button>
      </div>

      {/* Лог результатов */}
      {showResults && completedNodes.length > 0 && (
        <div style={{
          borderTop: "1px solid rgba(38,38,51,0.06)",
          paddingTop: 10, display: "flex", flexDirection: "column", gap: 6,
        }}>
          <div style={{ fontSize: 11, color: "rgba(38,38,51,0.5)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Результаты
          </div>
          {completedNodes.map(([nodeId, s]) => {
            const node = agent.flow?.nodes.find(n => n.id === nodeId);
            const out = outputs[nodeId] || "";
            return (
              <details key={nodeId} style={{ fontSize: 12 }}>
                <summary style={{
                  cursor: "pointer", padding: "4px 0",
                  color: s === "error" ? "#FF3B30" : "#262633",
                }}>
                  {s === "error" ? "✗" : "✓"} {node?.title || nodeId}
                </summary>
                <div style={{
                  padding: "6px 8px", marginTop: 4,
                  background: "rgba(38,38,51,0.04)", borderRadius: 6,
                  fontSize: 11.5, color: "rgba(38,38,51,0.75)",
                  whiteSpace: "pre-wrap", maxHeight: 120, overflowY: "auto",
                }}>{out}</div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}

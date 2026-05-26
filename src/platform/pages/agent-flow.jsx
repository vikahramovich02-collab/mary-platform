import { useState } from "react";
import { color } from "../../ui/tokens.js";
import { ic } from "../icons.jsx";

// ── Shared: icon + color per kind ─────────────────────────
function kindStyle(kind, accent = "#7A86FF") {
  switch (kind) {
    case "input":
    case "trigger-cron":
    case "trigger-manual":
      return { iconBg: "#FFF4D1", iconColor: "#FFB800",
        icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg> };
    case "subagent":
      return { iconBg: "#EEF0FF", iconColor: "#7A86FF",
        icon: <svg width={18} height={18} viewBox="0 0 24 24"><rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor"/><rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor"/><circle cx="9.3" cy="13" r="1.4" fill="white"/><circle cx="14.7" cy="13" r="1.4" fill="white"/></svg> };
    case "llm-step":
    case "llm":
      return { iconBg: "#FFE7F5", iconColor: "#D946A8",
        icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 L14.5 9 L22 12 L14.5 15 L12 22 L9.5 15 L2 12 L9.5 9 Z"/></svg> };
    case "output-kb":
    case "output":
      return { iconBg: "#E8F8EE", iconColor: "#34C759",
        icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> };
    case "next-agent":
      return { iconBg: accent + "26", iconColor: accent,
        icon: <svg width={18} height={18} viewBox="0 0 24 24"><rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor"/><rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor"/><circle cx="9.3" cy="13" r="1.4" fill="white"/><circle cx="14.7" cy="13" r="1.4" fill="white"/></svg> };
    default:
      return { iconBg: "#EEF0FF", iconColor: "#7A86FF", icon: null };
  }
}

const KIND_LABEL = {
  "input":          "Входные данные",
  "trigger-cron":   "Триггер · расписание",
  "trigger-manual": "Триггер · вручную",
  "integration":    "Источник данных",
  "subagent":       "Вызов агента",
  "llm-step":       "LLM-шаг",
  "llm":            "LLM-шаг",
  "output-kb":      "Артефакт · КБ",
  "output":         "Выход",
  "next-agent":     "Следующий агент",
  "step":           "Шаг пайплайна",
};

// ── Inline rows for each node kind ─────────────────────────
function getNodeRows(kind, settings = {}, sub = "") {
  const rows = [];
  switch (kind) {
    case "trigger-cron":
    case "input":
      if (settings.cron) rows.push({ label: "Расписание", value: settings.cron });
      if (settings.sources?.length) rows.push({ label: "Источники", value: settings.sources.join(", ") });
      else if (sub) rows.push({ label: "Описание", value: sub });
      break;
    case "trigger-manual":
      rows.push({ label: "Запуск", value: "по запросу" });
      if (sub) rows.push({ label: "Описание", value: sub });
      break;
    case "subagent":
      if (settings.agentId) rows.push({ label: "Агент", value: settings.agentId });
      if (sub) rows.push({ label: "Задача", value: sub });
      break;
    case "llm-step":
    case "llm":
      if (settings.model) rows.push({ label: "Модель", value: settings.model });
      if (settings.prompt) rows.push({ label: "Промпт", value: settings.prompt.slice(0, 36) + (settings.prompt.length > 36 ? "…" : "") });
      else if (sub) rows.push({ label: "Описание", value: sub });
      break;
    case "output-kb":
      rows.push({ label: "Тип", value: "база знаний" });
      if (settings.target) rows.push({ label: "Хранилище", value: settings.target });
      break;
    case "next-agent":
      rows.push({ label: "Передаёт в", value: settings.target ? settings.target.replace("agent:", "") : (sub || "следующий агент") });
      break;
    case "output":
      rows.push({ label: settings.target ? "Цель" : "Тип", value: settings.target || "финальный вывод" });
      if (sub) rows.push({ label: "Описание", value: sub });
      break;
    default:
      if (sub) rows.push({ label: "Описание", value: sub });
  }
  return rows.slice(0, 2);
}

// ── Узел внутреннего workflow (drill-in) — expanded card ───
export function FlowNode({ n, pos, w, h, accent = "#7A86FF", visible = true, selected = false, onClick }) {
  const [hov, setHov] = useState(false);
  const s = kindStyle(n.kind, accent);
  const rows = getNodeRows(n.kind, n.settings, n.sub);
  const isStart = !!n.isStart;

  return (
    <div
      style={{
        position: "absolute",
        left: pos.x, top: pos.y,
        width: w,
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.92)",
        transition: "opacity 0.4s ease 0.2s, transform 0.4s ease 0.2s",
        userSelect: "none",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {/* "Start" label above first trigger node */}
      {isStart && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 7px)", left: 14,
          fontSize: 11.5, fontWeight: 600, color: "rgba(38,38,51,0.38)",
          letterSpacing: "0.03em",
        }}>Start</div>
      )}

      <div
        onClick={onClick}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: color.white,
          borderRadius: 14,
          boxShadow: selected
            ? `0 0 0 2px ${accent}, 0 6px 20px ${accent}28`
            : hov
            ? `0 0 0 1.5px ${accent}60, 0 4px 14px rgba(38,38,51,0.1)`
            : "0 2px 8px rgba(38,38,51,0.08), 0 0 0 1px rgba(38,38,51,0.07)",
          transition: "box-shadow 0.14s",
          cursor: onClick ? "pointer" : "default",
          overflow: "hidden",
        }}
      >
        {/* Card header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 14px 10px",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: s.iconBg, color: s.iconColor,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>{s.icon}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontSize: 13, fontWeight: 600, color: "#262633", lineHeight: 1.2,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{n.title}</div>
          </div>
          <div style={{ display: "flex", gap: 2.5, flexShrink: 0 }}>
            {[0,1,2].map(i => <span key={i} style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(38,38,51,0.22)" }} />)}
          </div>
        </div>

        {/* Divider + rows */}
        {rows.length > 0 && (
          <>
            <div style={{ height: 1, background: "rgba(38,38,51,0.06)" }} />
            {rows.map((row, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "6px 14px",
                borderBottom: i < rows.length - 1 ? "1px solid rgba(38,38,51,0.045)" : "none",
                minHeight: 30,
              }}>
                <span style={{ fontSize: 11.5, color: "rgba(38,38,51,0.48)", flexShrink: 0 }}>{row.label}</span>
                <span style={{
                  fontSize: 11.5, color: "#262633", fontWeight: 500,
                  maxWidth: "58%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  textAlign: "right",
                }}>{row.value}</span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Connector dots — positioned at card center height */}
      <span style={{
        position: "absolute", left: -5, top: h / 2 - 4.5,
        width: 9, height: 9, borderRadius: "50%",
        background: color.white, border: "1px solid rgba(38,38,51,0.22)",
      }} />
      <span style={{
        position: "absolute", right: -5, top: h / 2 - 4.5,
        width: 9, height: 9, borderRadius: "50%",
        background: color.white, border: "1px solid rgba(38,38,51,0.22)",
      }} />
    </div>
  );
}

// ── Detail panel: появляется при клике на FlowNode ──────────
function DetailRow({ label, value }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(38,38,51,0.4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, color: "#262633", lineHeight: 1.4, wordBreak: "break-word" }}>{value}</div>
    </div>
  );
}

function kindDescription(kind, settings = {}) {
  switch (kind) {
    case "input":          return "Принимает входные данные, которые запускают пайплайн этого агента.";
    case "trigger-cron":   return `Запускается автоматически по расписанию${settings.cron ? `: ${settings.cron}` : "."}.`;
    case "trigger-manual": return "Запускается вручную — по команде оператора или из другого агента.";
    case "integration":    return "Получает данные из внешнего источника или сервиса.";
    case "subagent":       return "Делегирует задачу другому агенту и ждёт его ответа.";
    case "llm-step":
    case "llm":            return `Обрабатывает вход через языковую модель${settings.model ? ` (${settings.model})` : ""} и генерирует структурированный вывод.`;
    case "output-kb":      return `Сохраняет результат в базу знаний${settings.target ? ` → ${settings.target}` : ""}.`;
    case "output":         return settings.target?.startsWith("agent:") ? `Передаёт результат следующему агенту: ${settings.target.replace("agent:", "")}.` : "Сохраняет финальный результат.";
    case "next-agent":     return `Передаёт управление следующему агенту в пайплайне${settings.target ? `: ${settings.target}` : ""}.`;
    default:               return "Шаг пайплайна.";
  }
}

export function FlowNodeDetailPanel({ node, accent = "#7A86FF", onClose }) {
  if (!node) return null;
  const s = kindStyle(node.kind, accent);
  const label = KIND_LABEL[node.kind] || node.kind;
  const settings = node.settings || {};

  return (
    <div
      style={{
        position: "absolute",
        right: 16, top: 56, bottom: 90,
        width: 268,
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0 8px 32px rgba(38,38,51,0.13), 0 0 0 1px rgba(38,38,51,0.06)",
        zIndex: 20,
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        animation: "fadeSlideIn 0.18s ease",
      }}
    >
      <style>{`@keyframes fadeSlideIn { from { opacity: 0; transform: translateX(8px); } to { opacity: 1; transform: translateX(0); } }`}</style>

      {/* Header */}
      <div style={{
        padding: "15px 15px 12px",
        borderBottom: "1px solid rgba(38,38,51,0.06)",
        display: "flex", alignItems: "flex-start", gap: 10,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: s.iconBg, color: s.iconColor,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>{s.icon && <span style={{ transform: "scale(1.1)", display: "flex" }}>{s.icon}</span>}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "#262633", lineHeight: 1.2, wordBreak: "break-word" }}>{node.title}</div>
          <div style={{
            display: "inline-flex", alignItems: "center", marginTop: 5,
            padding: "2px 8px", borderRadius: 999,
            background: s.iconColor + "14", color: s.iconColor,
            fontSize: 10.5, fontWeight: 600,
          }}>{label}</div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 26, height: 26, borderRadius: 7,
            background: "rgba(38,38,51,0.05)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, color: "rgba(38,38,51,0.45)",
          }}
        >
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18"/>
          </svg>
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: "auto", padding: "14px 15px" }}>
        <div style={{ fontSize: 12.5, color: "rgba(38,38,51,0.6)", lineHeight: 1.55, marginBottom: 14 }}>
          {kindDescription(node.kind, settings)}
        </div>

        {node.sub && node.sub !== kindDescription(node.kind, settings) && (
          <DetailRow label="Описание" value={node.sub} />
        )}

        {settings.model && <DetailRow label="Модель" value={settings.model} />}
        {settings.agentId && node.kind === "subagent" && <DetailRow label="Агент" value={settings.agentId} />}
        {settings.target && node.kind !== "llm-step" && node.kind !== "llm" && (
          <DetailRow label="Цель" value={settings.target} />
        )}
        {settings.cron && <DetailRow label="Расписание" value={settings.cron} />}
        {settings.source && <DetailRow label="Источник" value={settings.source} />}
        {settings.prompt && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(38,38,51,0.4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Промпт</div>
            <div style={{
              fontSize: 11.5, color: "#262633", lineHeight: 1.5,
              background: "rgba(38,38,51,0.04)", borderRadius: 8,
              padding: "8px 10px", fontFamily: "monospace",
              maxHeight: 120, overflow: "auto",
            }}>{settings.prompt}</div>
          </div>
        )}
      </div>
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
        settings: n.settings || {},
        isStart: inDeg[n.id] === 0,
        ox: (Number(L) - centerLevel) * 320,
        oy: (idx - midRow) * 150,
      });
    });
  }
  return { nodes: flowNodes, edges };
}

// Ноды live-build канваса в ActivityPanel: BuildNode (карточка с пульсом «работает»)
// и AgentNodeExpanded (раскрытая должностная инструкция).
// Извлечено из TgKanalPage.jsx (Phase 2).
import { color } from "../ui/tokens.js";

export function BuildNode({ x, y, w, h, icon, iconBg, iconColor, title, sub, animate, isMain, onClick, expanded, active }) {
  const ICONS = {
    agent: <svg width={16} height={16} viewBox="0 0 24 24"><rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor"/><rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor"/><circle cx="9.3" cy="13" r="1.4" fill="white"/><circle cx="14.7" cy="13" r="1.4" fill="white"/></svg>,
    dept:  <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8c0-1.5-.4-2.9-1.2-4.1-.5.4-1.2.6-1.9.6-1.7 0-3-1.3-3-3 0-.6.2-1.2.4-1.7C13.6 3.3 12.8 3 12 3z"/><circle cx="17" cy="6.5" r="2"/></svg>,
    ch:    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 L4 14 h7 v8 l9 -12 h-7 z"/></svg>,
  };
  const Tag = onClick ? "button" : "div";
  return (
    <Tag onClick={onClick}
      style={{
        position: "absolute", left: x, top: y,
        width: w, height: h,
        background: color.white,
        borderRadius: 24,
        border: active ? `2px solid ${iconColor}` : expanded ? `1.5px solid ${iconColor}` : "none",
        boxShadow: active
          ? `0 0 0 4px ${iconColor}22, 0 6px 18px ${iconColor}55`
          : isMain
            ? `0 4px 16px ${iconColor}33`
            : expanded
              ? `0 4px 12px ${iconColor}40`
              : "0 1px 2px rgba(38,38,51,0.04)",
        display: "flex", alignItems: "center", gap: 10,
        padding: "0 12px",
        animation: animate ? "build-pop 0.45s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
        cursor: onClick ? "pointer" : "default",
        fontFamily: "inherit", textAlign: "left",
        transition: "box-shadow 0.2s, border 0.2s",
      }}>
      {active && (
        <span style={{
          position: "absolute", top: -8, left: 12,
          padding: "1px 7px",
          background: iconColor, color: color.white,
          fontSize: 9.5, fontWeight: 600,
          borderRadius: 999, letterSpacing: "0.04em", textTransform: "uppercase",
          display: "inline-flex", alignItems: "center", gap: 4,
          boxShadow: `0 2px 6px ${iconColor}66`,
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: "50%", background: color.white,
            animation: "marypulse 1.2s ease-in-out infinite",
          }} />
          работает
        </span>
      )}
      <div style={{
        width: 36, height: 36, borderRadius: 11,
        background: iconBg, color: iconColor,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>{ICONS[icon] || ICONS.agent}</div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 510, color: "#262633", lineHeight: 1.15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
        <div style={{ fontSize: 11, color: "rgba(38,38,51,0.5)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</div>
      </div>
      {onClick && (
        <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="rgba(38,38,51,0.4)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.18s", flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      )}
      <span style={{
        position: "absolute", left: -4, top: "50%", transform: "translateY(-50%)",
        width: 8, height: 8, borderRadius: "50%",
        background: color.white, border: "1px solid rgba(38,38,51,0.18)",
      }} />
      <span style={{
        position: "absolute", right: -4, top: "50%", transform: "translateY(-50%)",
        width: 8, height: 8, borderRadius: "50%",
        background: color.white, border: "1px solid rgba(38,38,51,0.18)",
      }} />
    </Tag>
  );
}

// Раскрытая карточка агента в BuildCanvas — компактная должностная инструкция
export function AgentNodeExpanded({ agent, x, y, w, onClose }) {
  const TOOL_LABELS = {
    "web-search": "Web Search", "knowledge-base": "База знаний", "telegram-parser": "TG-парсер",
    "image-generation": "Image Gen", "crm": "CRM", "email": "Email", "google-sheets": "Sheets", "calendar": "Calendar",
  };
  const MEM_LABELS = { none: "—", short: "сессия", long: "долгая" };
  return (
    <div style={{
      position: "absolute", left: x, top: y, width: w,
      background: color.white,
      border: "1px solid rgba(38,38,51,0.1)",
      borderRadius: 14,
      padding: "12px 14px",
      boxShadow: "0 6px 24px rgba(38,38,51,0.1)",
      zIndex: 3,
      animation: "build-pop 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      fontFamily: "inherit",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: agent.color || "#7A86FF", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Должностная инструкция
        </span>
        <div style={{ flex: 1 }} />
        <button onClick={onClose} title="Свернуть"
          style={{ width: 20, height: 20, padding: 0, background: "transparent", border: "none", borderRadius: 4, color: "rgba(38,38,51,0.5)", cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      {agent.tasks && (
        <div style={{
          padding: "8px 10px", marginBottom: 8,
          background: "rgba(38,38,51,0.03)", borderRadius: 7,
          fontSize: 12, color: "rgba(38,38,51,0.85)", lineHeight: 1.5,
        }}>{agent.tasks}</div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
          <span style={{ width: 80, fontSize: 11, color: "rgba(38,38,51,0.5)", fontWeight: 500 }}>Model</span>
          <span style={{
            padding: "2px 8px", borderRadius: 5,
            background: "rgba(122,134,255,0.12)", color: "#5B68E0",
            fontSize: 11, fontWeight: 500, fontFamily: "ui-monospace, SF Mono, monospace",
          }}>{agent.model || "—"}</span>
        </div>
        {agent.systemPrompt && (
          <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
            <span style={{ width: 80, fontSize: 11, color: "rgba(38,38,51,0.5)", fontWeight: 500, flexShrink: 0 }}>Промпт</span>
            <details style={{ fontSize: 12, color: "rgba(38,38,51,0.85)", flex: 1, minWidth: 0 }}>
              <summary style={{ cursor: "pointer", color: "#262633", lineHeight: 1.4 }}>
                {agent.systemPrompt.slice(0, 75)}{agent.systemPrompt.length > 75 ? "…" : ""}
              </summary>
              <div style={{
                marginTop: 6, padding: "8px 10px",
                background: "rgba(38,38,51,0.03)", borderRadius: 7,
                fontSize: 12, lineHeight: 1.5, whiteSpace: "pre-wrap",
              }}>{agent.systemPrompt}</div>
            </details>
          </div>
        )}
        {agent.tools && agent.tools.length > 0 && (
          <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
            <span style={{ width: 80, fontSize: 11, color: "rgba(38,38,51,0.5)", fontWeight: 500 }}>Tools</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {agent.tools.map(t => (
                <span key={t} style={{
                  padding: "1px 7px", borderRadius: 999,
                  background: "rgba(38,38,51,0.06)", color: "#262633",
                  fontSize: 10.5, fontWeight: 500,
                }}>{TOOL_LABELS[t] || t}</span>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ fontSize: 11, color: "rgba(38,38,51,0.65)" }}>
            <span style={{ color: "rgba(38,38,51,0.5)" }}>Memory:</span> {MEM_LABELS[agent.memory] || agent.memory || "—"}
          </div>
          <div style={{ fontSize: 11, color: "rgba(38,38,51,0.65)" }}>
            <span style={{ color: "rgba(38,38,51,0.5)" }}>Output:</span> {(agent.responseFormat || "text").toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}

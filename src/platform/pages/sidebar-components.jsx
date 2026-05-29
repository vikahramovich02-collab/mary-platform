import { useState, useEffect } from "react";
import { color, transition, cv } from "../../ui/tokens.js";
import { ic } from "../icons.jsx";
import { AGENTS, CARD_W, CARD_H } from "../agents-config.js";
import { zoomBtn } from "../chat-panel.jsx";

// ── Mary логотип (inline vector из брендбука — чёткий на любом DPI) ─────────
export function MaryLogo({ height = 22 }) {
  return (
    <svg height={height} width={height * (70 / 28)} viewBox="0 0 70 28" fill="currentColor"
      style={{ display: "block", color: cv.text, flexShrink: 0 }} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="3.02113" cy="13.8376" rx="3.02113" ry="8.78873" />
      <ellipse cx="7.96497" cy="13.837" rx="3.02113" ry="10.4366" />
      <ellipse cx="13.4441" cy="15.3738" rx="3.02113" ry="9.06338" transform="rotate(3.41655 13.4441 15.3738)" />
      <path d="M22.3767 19.7959V9.25284H24.7963V10.9048H24.9323C25.1591 10.3217 25.5251 9.86502 26.0304 9.53464C26.5421 9.20425 27.1446 9.03906 27.8377 9.03906C28.3171 9.03906 28.7479 9.12004 29.1301 9.28199C29.5188 9.43747 29.8492 9.66096 30.1213 9.95247C30.3998 10.244 30.6104 10.5938 30.7529 11.0019H30.8986C31.0671 10.6068 31.31 10.2634 31.6274 9.97191C31.9449 9.67392 32.3141 9.44394 32.7352 9.28199C33.1627 9.12004 33.6227 9.03906 34.115 9.03906C34.8211 9.03906 35.4268 9.18158 35.9321 9.46662C36.4374 9.75165 36.8261 10.1565 37.0982 10.6813C37.3767 11.1995 37.516 11.8214 37.516 12.547V19.7959H35.0965V13.1397C35.0965 12.6862 35.0252 12.3073 34.8827 12.0028C34.7466 11.6983 34.5361 11.4684 34.2511 11.3129C33.9725 11.1574 33.6195 11.0797 33.1919 11.0797C32.7838 11.0797 32.4242 11.1736 32.1133 11.3615C31.8088 11.5493 31.5691 11.8052 31.3942 12.1291C31.2258 12.4465 31.1416 12.8126 31.1416 13.2272V19.7959H28.7414V12.9745C28.7414 12.5793 28.6637 12.2425 28.5082 11.9639C28.3592 11.6789 28.1422 11.4619 27.8572 11.3129C27.5786 11.1574 27.2418 11.0797 26.8466 11.0797C26.4514 11.0797 26.0984 11.1801 25.7874 11.3809C25.4765 11.5817 25.2336 11.8538 25.0586 12.1971C24.8837 12.5405 24.7963 12.9292 24.7963 13.3632V19.7959H22.3767Z" />
      <path d="M43.0937 19.9709C42.4199 19.9709 41.8207 19.8413 41.296 19.5822C40.7713 19.323 40.3599 18.957 40.0619 18.4841C39.7639 18.0048 39.6149 17.4476 39.6149 16.8128V16.7933C39.6149 16.165 39.7704 15.6273 40.0814 15.1803C40.3923 14.7268 40.8458 14.3705 41.4418 14.1114C42.0377 13.8523 42.76 13.6968 43.6087 13.645L47.5441 13.4118V15.0054L43.9585 15.2386C43.2977 15.271 42.8054 15.4135 42.4815 15.6662C42.1641 15.9123 42.0054 16.2492 42.0054 16.6767V16.6962C42.0054 17.1432 42.1738 17.493 42.5106 17.7456C42.854 17.9983 43.2913 18.1246 43.8225 18.1246C44.3083 18.1246 44.7391 18.0274 45.1148 17.8331C45.4906 17.6387 45.7886 17.3764 46.0088 17.046C46.2291 16.7091 46.3392 16.3334 46.3392 15.9188V12.6247C46.3392 12.0935 46.1708 11.6854 45.8339 11.4003C45.497 11.1088 45.008 10.9631 44.3666 10.9631C43.803 10.9631 43.3463 11.0667 42.9965 11.274C42.6532 11.4748 42.4232 11.7534 42.3066 12.1097L42.2969 12.1583H40.0231L40.0328 12.0708C40.1105 11.4684 40.3372 10.9404 40.713 10.4869C41.0952 10.0335 41.6037 9.68039 42.2386 9.42775C42.8799 9.16862 43.6249 9.03906 44.4735 9.03906C45.374 9.03906 46.1416 9.18158 46.7765 9.46662C47.4113 9.75165 47.8972 10.1598 48.234 10.691C48.5709 11.2157 48.7393 11.8473 48.7393 12.5858V19.7959H46.3392V18.3092H46.1934C45.9991 18.6526 45.7465 18.9506 45.4355 19.2032C45.131 19.4494 44.7812 19.6405 44.3861 19.7765C43.9909 19.9061 43.5601 19.9709 43.0937 19.9709Z" />
      <path d="M51.4116 19.7959V9.25284H53.8311V10.9145H53.9672C54.1421 10.3314 54.4595 9.87798 54.9194 9.55407C55.3794 9.23017 55.943 9.06821 56.6102 9.06821C56.7916 9.06821 56.9633 9.08117 57.1252 9.10708C57.2937 9.12652 57.4329 9.14919 57.5431 9.1751V11.3517C57.3682 11.3064 57.1835 11.274 56.9892 11.2546C56.8013 11.2287 56.6037 11.2157 56.3964 11.2157C55.8782 11.2157 55.4247 11.3161 55.036 11.5169C54.6538 11.7113 54.3558 11.9931 54.1421 12.3623C53.9348 12.7251 53.8311 13.1624 53.8311 13.6741V19.7959H51.4116Z" />
      <path d="M60.7303 23.4593C60.5619 23.4593 60.3902 23.4528 60.2153 23.4399C60.0404 23.4269 59.8784 23.414 59.7294 23.401V21.545C59.8266 21.558 59.94 21.5677 60.0695 21.5742C60.1991 21.5871 60.3319 21.5936 60.4679 21.5936C60.9603 21.5936 61.3522 21.49 61.6437 21.2827C61.9417 21.0819 62.1587 20.745 62.2948 20.2721L62.4308 19.8057L58.6508 9.25284H61.2842L64.0341 18.4939L63.4414 17.5416H64.1993L63.626 18.4939L66.3662 9.25284H68.9121L65.1322 20.0583C64.8342 20.9069 64.4908 21.5807 64.1021 22.0795C63.7135 22.5783 63.247 22.9313 62.7029 23.1386C62.1587 23.3524 61.5012 23.4593 60.7303 23.4593Z" />
    </svg>
  );
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

import { useState } from "react";
import { color, transition, cv } from "../ui/tokens.js";
import { renderMarkdown } from "./markdown.jsx";
import { parseNumberedOptions, parseChecklistOptions } from "./markdown.jsx";
import { ToolsTrail } from "./chat-cards.jsx";
import { AgentsLog, RunResultPanel, JudgeCard } from "./pages/sandbox-page.jsx";

function buildStepIcon(line) {
  if (/канал|channel/i.test(line)) return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
  if (/отдел|dept|создаю/i.test(line)) return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  );
  if (/подключаю|агент/i.test(line)) return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  );
  if (/апруф|настраив/i.test(line)) return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  );
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  );
}

function DemoBuildLog({ lines, streaming, title }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div style={{ marginTop: 8 }}>
      {/* Collapsible header — стиль "Обдумывая это" */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "transparent", border: "none", padding: "2px 0",
          cursor: "pointer", fontFamily: "inherit",
        }}
      >
        {/* speech-bubble icon */}
        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="rgba(38,38,51,0.45)" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span style={{ fontSize: 12.5, color: "rgba(38,38,51,0.55)", fontWeight: 500 }}>
          {title || "Разворачиваю отдел"}
        </span>
        {streaming && (
          <span style={{ display: "inline-flex", gap: 3, marginLeft: 2 }}>
            {[0,1,2].map(i => (
              <span key={i} style={{
                width: 4, height: 4, borderRadius: "50%",
                background: "rgba(38,38,51,0.35)",
                animation: `marypulse 1.4s ease-in-out infinite ${i * 0.18}s`,
                display: "inline-block",
              }} />
            ))}
          </span>
        )}
        {/* chevron */}
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="rgba(38,38,51,0.4)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: expanded ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s" }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {/* Steps list with L-indent */}
      {expanded && lines.length > 0 && (
        <div style={{
          marginLeft: 7,
          borderLeft: "1.5px solid rgba(38,38,51,0.1)",
          paddingLeft: 14,
          marginTop: 4,
          display: "flex", flexDirection: "column", gap: 0,
        }}>
          {lines.map((line, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "4px 0",
              animation: "maryFadeIn 0.25s ease both",
              animationDelay: `${i * 0.07}s`,
            }}>
              <span style={{ color: "rgba(38,38,51,0.4)", display: "inline-flex", flexShrink: 0 }}>
                {buildStepIcon(line)}
              </span>
              <span style={{ fontSize: 13, color: "rgba(38,38,51,0.8)", lineHeight: 1.4 }}>{line}</span>
            </div>
          ))}
          <style>{`@keyframes maryFadeIn { from { opacity:0; transform:translateY(3px) } to { opacity:1; transform:translateY(0) } }`}</style>
        </div>
      )}
    </div>
  );
}

function DemoChips({ actions, onPick }) {
  const iconMap = {
    connect: (
      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    ),
    person: (
      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M19 8v6M22 11h-6"/>
      </svg>
    ),
    calendar: (
      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <path d="M16 2v4M8 2v4M3 10h18"/>
      </svg>
    ),
    sheets: (
      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M3 9h18M9 3v18"/>
      </svg>
    ),
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
      {actions.map((a, i) => (
        <button key={i} onClick={() => onPick?.(a.label)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            height: 32, padding: "0 12px",
            background: "rgba(38,38,51,0.04)",
            border: "1px solid rgba(38,38,51,0.12)",
            borderRadius: 8,
            fontSize: 12.5, fontWeight: 500, color: "#262633",
            cursor: "pointer", fontFamily: "inherit",
            transition: "background 0.12s, border-color 0.12s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(38,38,51,0.09)"; e.currentTarget.style.borderColor = "rgba(38,38,51,0.22)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(38,38,51,0.04)"; e.currentTarget.style.borderColor = "rgba(38,38,51,0.12)"; }}
        >
          <span style={{ color: "rgba(38,38,51,0.5)", display: "inline-flex" }}>
            {iconMap[a.icon] || iconMap.connect}
          </span>
          <span>{a.label}</span>
        </button>
      ))}
    </div>
  );
}

export function OptionsBlock({ options, multi, onPick, highlights, disabled, noTopMargin }) {
  const [selected, setSelected] = useState(() => new Set());
  const [freeText, setFreeText] = useState("");
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const hlSet = new Set(highlights || []);

  const toggle = (idx) => {
    if (disabled) return;
    if (!multi) { onPick(options[idx]); return; }
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };
  const submit = () => {
    if (disabled) return;
    const picked = options.filter((_, i) => selected.has(i));
    const parts = [...picked];
    if (freeText.trim()) parts.push(freeText.trim());
    if (parts.length === 0) return;
    onPick(parts.join(", "));
  };
  const canSubmit = selected.size > 0 || freeText.trim().length > 0;

  return (
    <div style={{ marginTop: noTopMargin ? 0 : 12, opacity: disabled ? 0.55 : 1 }}>
      {options.map((opt, idx) => {
        const checked = selected.has(idx);
        const hovered = hoveredIdx === idx;
        const hl = hlSet.has(idx);
        return (
          <div key={idx}
            onClick={() => toggle(idx)}
            onMouseEnter={() => { if (!disabled) setHoveredIdx(idx); }}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "11px 12px", borderRadius: 10,
              cursor: disabled ? "default" : "pointer",
              background: checked ? "rgba(38,38,51,0.05)" : hovered ? "rgba(38,38,51,0.035)" : "transparent",
              transition: "background 0.1s",
            }}>
            <span style={{ display: "inline-flex", flexShrink: 0 }}>
              {checked
                ? <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="rgba(38,38,51,0.45)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                : <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="rgba(38,38,51,0.3)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>}
            </span>
            {hl && !checked && (
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#262633", flexShrink: 0, marginLeft: -8 }} />
            )}
            <span style={{ flex: 1, fontSize: 15, fontWeight: 450, color: "#262633", lineHeight: 1.4 }}>{opt}</span>
          </div>
        );
      })}

      {/* Свой вариант */}
      {!disabled && (
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "11px 12px", borderRadius: 10,
        }}>
          <svg
            onClick={!multi && freeText.trim() ? () => onPick(freeText.trim()) : undefined}
            width={16} height={16} viewBox="0 0 24 24" fill="none"
            stroke={freeText.trim() ? "#262633" : "rgba(38,38,51,0.25)"}
            strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
            style={{ flexShrink: 0, cursor: !multi && freeText.trim() ? "pointer" : "default", transition: "stroke 0.1s" }}
          >
            <path d="M5 12h14M13 6l6 6-6 6"/>
          </svg>
          <input
            value={freeText}
            onChange={e => setFreeText(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && freeText.trim()) { e.preventDefault(); onPick(freeText.trim()); }
            }}
            placeholder="Свой вариант…"
            style={{
              flex: 1, border: "none", outline: "none",
              fontSize: 15, color: "#262633", background: "transparent",
              fontFamily: "inherit", padding: 0,
            }}
          />
        </div>
      )}

      {/* Footer для multi */}
      {multi && !disabled && canSubmit && (
        <div style={{
          display: "flex", justifyContent: "flex-end", alignItems: "center",
          gap: 8, paddingTop: 10,
        }}>
          <span style={{ fontSize: 12, color: "rgba(38,38,51,0.4)" }}>
            {selected.size + (freeText.trim() ? 1 : 0)} выбрано
          </span>
          <button onClick={submit}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 28, height: 28, borderRadius: 8,
              background: "#262633", border: "none",
              color: "#fff", cursor: "pointer",
            }}>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

function PipelineRunBubble({ m }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
        fontSize: 11, color: "rgba(38,38,51,0.5)",
        textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600,
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: "50%",
          background: m.running ? "#FF8B3D" : "#34C759",
          animation: m.running ? "marypulse 1.2s ease-in-out infinite" : "none",
        }} />
        Пайплайн агентов{m.topic ? ` · ${m.topic.slice(0, 50)}` : ""}
      </div>
      {m.agents?.length > 0 ? (
        <AgentsLog agents={m.agents} running={m.running} />
      ) : m.running ? (
        <div style={{ display: "inline-flex", gap: 4, padding: "4px 0" }}>
          {[0,1,2].map(i => (
            <span key={i} style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "rgba(38,38,51,0.4)",
              animation: `marypulse 1.4s ease-in-out infinite ${i * 0.2}s`,
            }} />
          ))}
        </div>
      ) : null}
      {m.judge && <JudgeCard judge={m.judge} />}
      {!m.running && m.agents?.length > 0 && (
        <RunResultPanel
          postText={m.agents.find(a => a.id === "copywriter" || a.role?.match(/копи/i))?.output || m.agents.at(-1)?.output}
          insights={m.agents.find(a => a.id === "researcher" || a.role?.match(/ресёрч|исслед/i))?.output}
          topic={m.topic}
          deptId={m.deptId || "smm"}
        />
      )}
    </div>
  );
}

export function AgentChatBubble({ m }) {
  const initial = (m.agentRole || "?").trim().slice(0, 2).toUpperCase();
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 22 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 7,
        background: m.agentColor || "#7A86FF", color: color.white,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, fontSize: 11, fontWeight: 600,
      }}>{initial}</div>
      <div style={{ flex: 1, minWidth: 0, maxWidth: 640, paddingTop: 2 }}>
        {m.fromMary && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "3px 10px", marginBottom: 8,
            background: "rgba(38,38,51,0.05)", borderRadius: 999,
            fontSize: 11, color: "rgba(38,38,51,0.65)", fontWeight: 500,
          }}>
            <svg width={10} height={10} viewBox="0 0 24 24">
              <rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor"/>
              <rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor"/>
              <circle cx="9.3" cy="13" r="1.4" fill="white"/>
              <circle cx="14.7" cy="13" r="1.4" fill="white"/>
            </svg>
            <span>Mary</span>
            <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: m.agentColor || "#7A86FF" }} />
            <span style={{ color: "#262633", fontWeight: 600 }}>{m.agentRole}</span>
          </div>
        )}
        <div style={{
          fontSize: 14, color: "#262633", lineHeight: 1.55,
        }}>
          {renderMarkdown(m.text || "")}
        </div>
        <ActionBar text={m.text || ""} />
      </div>
    </div>
  );
}

export function ChatBubble({ m, isLast, onPickOption, index, onEdit, suppressInteract }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [hover, setHover] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userTip, setUserTip] = useState(null);
  if (m.role === "pipeline_run") {
    return <PipelineRunBubble m={m} />;
  }
  if (m.agentId && m.agentRole) {
    return <AgentChatBubble m={m} />;
  }
  if (m.role === "user") {
    const handleCopy = () => {
      navigator.clipboard?.writeText(m.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    };
    if (editing) {
      return (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
          <div style={{
            border: "1.5px solid #3F95FF", borderRadius: 14,
            padding: 10, width: "min(80%, 520px)",
            display: "flex", flexDirection: "column", gap: 10,
            background: cv.bg,
          }}>
            <textarea
              autoFocus
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey && draft.trim()) {
                  e.preventDefault();
                  setEditing(false);
                  onEdit?.(draft.trim(), index);
                }
                if (e.key === "Escape") setEditing(false);
              }}
              rows={Math.max(2, draft.split("\n").length)}
              style={{
                width: "100%", border: "none", outline: "none",
                resize: "none", fontFamily: "inherit",
                fontSize: 14, color: cv.text,
                background: "transparent", padding: 0,
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
              <button
                onClick={() => setEditing(false)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(38,38,51,0.18)", borderRadius: 8,
                  padding: "5px 14px", fontSize: 13, color: "#262633",
                  fontFamily: "inherit", cursor: "pointer",
                }}
              >Отмена</button>
              <button
                disabled={!draft.trim()}
                onClick={() => { setEditing(false); onEdit?.(draft.trim(), index); }}
                style={{
                  background: draft.trim() ? "#262633" : "rgba(38,38,51,0.25)",
                  border: "none", borderRadius: 8,
                  padding: "5px 14px", fontSize: 13, color: color.white,
                  fontFamily: "inherit", cursor: draft.trim() ? "pointer" : "not-allowed",
                }}
              >Сохранить</button>
            </div>
          </div>
        </div>
      );
    }
    const uBtn = {
      position: "relative",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 26, height: 26, padding: 0,
      background: "transparent", border: "none", borderRadius: 6,
      color: "rgba(38,38,51,0.45)", cursor: "pointer", fontFamily: "inherit",
      transition: "color 0.15s, background 0.15s",
    };
    const uHov = (e) => { e.currentTarget.style.background = "rgba(38,38,51,0.06)"; e.currentTarget.style.color = "#262633"; };
    const uLev = (e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(38,38,51,0.45)"; };
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginBottom: 18 }}>
        <div style={{
          background: cv.hover, color: cv.text,
          padding: "10px 14px", borderRadius: 16,
          maxWidth: "80%", fontSize: 15, lineHeight: 1.45, whiteSpace: "pre-wrap",
        }}>{m.text}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 2, marginTop: 8 }}>
          {onEdit && index !== undefined && (
            <button style={uBtn}
              onMouseEnter={e => { uHov(e); setUserTip("edit"); }}
              onMouseLeave={e => { uLev(e); setUserTip(null); }}
              onClick={() => { setDraft(m.text); setEditing(true); setUserTip(null); }}
            >
              {userTip === "edit" && <Tip label="Редактировать" align="right" />}
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </button>
          )}
          <button style={{ ...uBtn, color: copied ? "#262633" : uBtn.color }}
            onMouseEnter={e => { if (!copied) { uHov(e); setUserTip("copy"); } }}
            onMouseLeave={e => { if (!copied) uLev(e); setUserTip(null); }}
            onClick={() => { handleCopy(); setUserTip(null); }}
          >
            {userTip === "copy" && <Tip label="Скопировать" align="right" />}
            {copied
              ? <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
              : <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            }
          </button>
        </div>
      </div>
    );
  }
  const canInteract = isLast && !suppressInteract && !m._streaming && !m._toolStatus && onPickOption && !m._quickActions;
  const showOptions = !m._streaming && !m._toolStatus && onPickOption && !m._quickActions;
  const checklist = showOptions ? parseChecklistOptions(m.text) : { body: m.text, options: null };
  const numbered  = showOptions && !checklist.options ? parseNumberedOptions(m.text) : { body: m.text, options: null };
  const body = checklist.options ? checklist.body : (numbered.options ? numbered.body : m.text);
  const options = checklist.options || numbered.options;
  const multi   = !!checklist.options || (m._highlights?.length > 1);
  const maryActBtn = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 26, height: 26, padding: 0,
    background: "transparent", border: "none", borderRadius: 6,
    color: "rgba(38,38,51,0.45)", cursor: "pointer", fontFamily: "inherit",
    transition: "color 0.12s, background 0.12s",
  };
  return (
    <div style={{ marginBottom: 22, width: "100%", overflowX: "hidden" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <video
            src="/mary-typing.mp4"
            autoPlay loop muted playsInline
            style={{ width: 34, height: 34, objectFit: "contain", flexShrink: 0, mixBlendMode: "multiply" }}
          />
          <span style={{ fontSize: 12, color: "rgba(38,38,51,0.5)", fontWeight: 500 }}>
            {m._streaming ? "Mary печатает.." : "Mary"}
          </span>
        </div>
        {m._tools && m._tools.length > 0 && (
          <ToolsTrail tools={m._tools} />
        )}
        {m._buildLog !== undefined && (
          <DemoBuildLog lines={m._buildLog} streaming={!!m._streaming} title={m._buildLogTitle} />
        )}
        {(body || (m._streaming && m.text)) && (
          <div style={{
            fontSize: 15, color: cv.text, lineHeight: 1.55,
            marginTop: (m._tools && m._tools.length > 0) ? 10 : (m._buildLog !== undefined && body ? 10 : 0),
          }}>
            {renderMarkdown(body)}
            {m._streaming && m.text && (
              <span style={{
                display: "inline-block", width: 7, height: 14,
                background: "#262633", marginLeft: 2, verticalAlign: "text-bottom",
                animation: "maryblink 1s steps(2) infinite",
              }} />
            )}
          </div>
        )}
        {options && options.length >= 2 && (
          <OptionsBlock options={options} multi={multi} onPick={onPickOption} highlights={m._highlights} disabled={!canInteract} />
        )}
        {m._quickActions && isLast && (
          <DemoChips actions={m._quickActions} onPick={onPickOption} />
        )}
        {!m._streaming && body && body.trim().length > 0 && (
          <ActionBar text={body} />
        )}
      </div>
    </div>
  );
}

export function FloatingOptionsPanel({ message, onPick, onDismiss }) {
  const [selected, setSelected] = useState(() => new Set());
  const [freeText, setFreeText] = useState("");

  const checklist = parseChecklistOptions(message.text || "");
  const numbered = !checklist.options ? parseNumberedOptions(message.text || "") : null;
  const body = checklist.options ? checklist.body : (numbered?.options ? numbered.body : message.text);
  const options = checklist.options || numbered?.options;
  const multi = !!checklist.options || (message._highlights?.length > 1);
  const hlSet = new Set(message._highlights || []);

  if (!options || options.length < 2) return null;

  const bodyLines = (body || "").trim().split("\n").filter(l => l.trim());
  const questionText = bodyLines[bodyLines.length - 1] || "";

  const toggle = (idx) => {
    if (!multi) { onPick(options[idx]); return; }
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const submit = () => {
    if (multi) {
      const picked = options.filter((_, i) => selected.has(i));
      const parts = [...picked];
      if (freeText.trim()) parts.push(freeText.trim());
      if (parts.length === 0) return;
      onPick(parts.join(", "));
    } else {
      if (freeText.trim()) onPick(freeText.trim());
    }
  };

  const canSubmit = multi
    ? (selected.size > 0 || freeText.trim().length > 0)
    : freeText.trim().length > 0;

  const rowStyle = {
    display: "flex", alignItems: "center", gap: 10,
    padding: "9px 14px",
    borderTop: "1px solid rgba(38,38,51,0.07)",
    cursor: "pointer",
    transition: "background 0.1s",
  };

  return (
    <div style={{
      background: color.white,
      border: "1px solid rgba(38,38,51,0.12)",
      borderRadius: 16,
      overflow: "hidden",
    }}>
      {/* Question header */}
      <div style={{ padding: "12px 14px 4px", fontSize: 13, color: "rgba(38,38,51,0.55)", fontWeight: 500, lineHeight: 1.4 }}>
        {questionText}
      </div>

      {/* Options */}
      {options.map((opt, idx) => {
        const checked = selected.has(idx);
        const hl = hlSet.has(idx);
        return (
          <div key={idx}
            onClick={() => toggle(idx)}
            style={{ ...rowStyle, background: checked ? "rgba(63,149,255,0.04)" : "transparent" }}
            onMouseEnter={e => { if (!checked) e.currentTarget.style.background = "rgba(38,38,51,0.03)"; }}
            onMouseLeave={e => { if (!checked) e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{
              flexShrink: 0, width: 17, height: 17,
              borderRadius: multi ? 4 : "50%",
              border: checked ? "none" : "1.5px solid rgba(38,38,51,0.2)",
              background: checked ? "#3F95FF" : "transparent",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}>
              {checked && (
                <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              )}
            </span>
            {hl && !checked && (
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#262633", flexShrink: 0, marginLeft: -4 }} />
            )}
            <span style={{ flex: 1, fontSize: 13.5, color: "#262633", lineHeight: 1.4 }}>{opt}</span>
          </div>
        );
      })}

      {/* Free text row */}
      <div style={{ ...rowStyle, cursor: "default" }}>
        <span style={{
          flexShrink: 0, width: 17, height: 17,
          borderRadius: multi ? 4 : "50%",
          border: "1.5px solid rgba(38,38,51,0.15)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}>
          {freeText.trim() && (
            <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="rgba(38,38,51,0.4)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5L20 7" />
            </svg>
          )}
        </span>
        <input
          value={freeText}
          onChange={e => setFreeText(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (!multi && freeText.trim()) { onPick(freeText.trim()); return; }
              if (canSubmit) submit();
            }
          }}
          placeholder="Свой вариант…"
          style={{
            flex: 1, border: "none", outline: "none",
            fontSize: 13.5, color: "#262633", background: "transparent",
            fontFamily: "inherit", padding: 0,
          }}
        />
      </div>

      {/* Toolbar footer */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "9px 14px",
        borderTop: "1px solid rgba(38,38,51,0.07)",
      }}>
        <button style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 28, height: 28, background: "transparent",
          border: "1px solid rgba(38,38,51,0.18)", borderRadius: "50%",
          color: "rgba(38,38,51,0.7)", cursor: "pointer", fontFamily: "inherit",
        }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <button style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 28, height: 28, background: "transparent", border: "none", borderRadius: 7,
          color: "rgba(38,38,51,0.55)", cursor: "pointer", fontFamily: "inherit",
        }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </svg>
        </button>
        <div style={{ flex: 1 }} />
        {!canSubmit && (
          <button onClick={() => onPick("")}
            style={{
              padding: "5px 10px", borderRadius: 7,
              border: "none", background: "transparent",
              fontSize: 12, color: "rgba(38,38,51,0.45)",
              cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
            }}>Skip</button>
        )}
        <button
          onClick={canSubmit ? submit : undefined}
          disabled={!canSubmit}
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 30, height: 30,
            background: canSubmit ? "#262633" : "rgba(38,38,51,0.35)",
            border: "none", borderRadius: "50%",
            color: color.white,
            cursor: canSubmit ? "pointer" : "not-allowed",
          }}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5" /><path d="M5 12l7-7 7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function Tip({ label, align = "center" }) {
  const pos = align === "left"
    ? { left: 0 }
    : align === "right"
    ? { right: 0 }
    : { left: "50%", transform: "translateX(-50%)" };
  return (
    <div style={{
      position: "absolute", bottom: "calc(100% + 7px)",
      ...pos,
      background: "rgba(30,30,35,0.88)", color: "#fff", fontSize: 11, fontWeight: 400,
      padding: "3px 7px", borderRadius: 5, whiteSpace: "nowrap",
      pointerEvents: "none", zIndex: 20,
    }}>{label}</div>
  );
}

export function ActionBar({ text }) {
  const [copied, setCopied] = useState(false);
  const [reaction, setReaction] = useState(null);
  const [tip, setTip] = useState(null);
  const onCopy = () => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTip(null);
    setTimeout(() => setCopied(false), 1500);
  };
  const btn = {
    position: "relative",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 26, height: 26, padding: 0,
    background: "transparent", border: "none", borderRadius: 6,
    color: "rgba(38,38,51,0.45)", cursor: "pointer", fontFamily: "inherit",
    transition: "color 0.15s, background 0.15s",
  };
  const hov = (e) => { e.currentTarget.style.background = "rgba(38,38,51,0.06)"; e.currentTarget.style.color = "#262633"; };
  const lev = (e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(38,38,51,0.45)"; };
  return (
    <div style={{ display: "flex", gap: 2, marginTop: 8 }}>
      <button onClick={onCopy}
              style={{ ...btn, color: copied ? "#262633" : btn.color }}
              onMouseEnter={e => { if (!copied) { hov(e); setTip("copy"); } }}
              onMouseLeave={e => { if (!copied) lev(e); setTip(null); }}>
        {tip === "copy" && <Tip label="Скопировать" align="left" />}
        {copied
          ? <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
          : <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
        }
      </button>
      <button onClick={() => { setReaction(r => r === "up" ? null : "up"); setTip(null); }}
              style={{ ...btn, color: reaction === "up" ? "#34C759" : btn.color }}
              onMouseEnter={e => { hov(e); setTip("up"); }}
              onMouseLeave={e => { lev(e); setTip(null); }}>
        {tip === "up" && <Tip label="Полезно" />}
        <svg width={13} height={13} viewBox="0 0 24 24" fill={reaction === "up" ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
      </button>
      <button onClick={() => { setReaction(r => r === "down" ? null : "down"); setTip(null); }}
              style={{ ...btn, color: reaction === "down" ? "#FF3B30" : btn.color }}
              onMouseEnter={e => { hov(e); setTip("down"); }}
              onMouseLeave={e => { lev(e); setTip(null); }}>
        {tip === "down" && <Tip label="Не то" />}
        <svg width={13} height={13} viewBox="0 0 24 24" fill={reaction === "down" ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zM17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
        </svg>
      </button>
    </div>
  );
}

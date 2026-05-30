import { useState, useEffect, useRef } from "react";
import { color, cv } from "../ui/tokens.js";
import { renderMarkdown } from "./markdown.jsx";
import { BuildNode, AgentNodeExpanded } from "./build-nodes.jsx";

export function ActivityPanel({ build, activity, currentTool, activeAgentIds, artifacts = [], onCloseArtifact, onClose }) {
  const [tab, setTab] = useState(build ? "build" : "log");
  useEffect(() => { if (build && tab === "log" && activity.length <= 2) setTab("build"); }, [build]);
  const lastArtId = artifacts[artifacts.length - 1]?.id;
  useEffect(() => {
    if (lastArtId) setTab(`art:${lastArtId}`);
  }, [lastArtId]);
  const isArtifactTab = tab.startsWith("art:");
  const width = isArtifactTab ? 720 : ((build?.agents?.length || 0) >= 3 ? 620 : 540);
  const TOOL_LABELS = {
    create_department: (a) => `создаёт отдел «${a?.name || "…"}»`,
    add_channel:       (a) => `добавляет канал «${a?.name || "…"}»`,
    add_agent:         (a) => `добавляет агента «${a?.role || "…"}»`,
    set_department_integrations: () => "подключает интеграции",
    add_pipeline_node: (a) => `добавляет шаг «${a?.title || "…"}»`,
  };
  const toolLabel = currentTool ? (TOOL_LABELS[currentTool.name]?.(currentTool.args) || `выполняет ${currentTool.name}`) : null;

  // "+" — добавить файл или воркфлоу из базы знаний
  const [addOpen, setAddOpen] = useState(false);
  const [addView, setAddView] = useState(null); // null | "wf" | "kb"
  const [addSearch, setAddSearch] = useState("");
  const [addKb, setAddKb] = useState([]);
  const [addDepts, setAddDepts] = useState([]);
  const addRef = useRef(null);
  useEffect(() => {
    if (!addOpen) return;
    const onDoc = (e) => { if (!addRef.current?.contains(e.target)) { setAddOpen(false); setAddView(null); setAddSearch(""); } };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [addOpen]);
  const toggleAdd = async () => {
    const next = !addOpen;
    setAddOpen(next); setAddView(null); setAddSearch("");
    if (next) {
      const [kb, depts] = await Promise.all([
        fetch("/api/mary/kb/files").then(r => r.json()).catch(() => ({ files: [] })),
        fetch("/api/mary/departments").then(r => r.json()).catch(() => []),
      ]);
      setAddKb(kb.files || []);
      setAddDepts(Array.isArray(depts) ? depts : []);
    }
  };
  const pickAdd = (kind, item) => {
    setAddOpen(false); setAddView(null); setAddSearch("");
    if (kind === "wf") window.__maryNavigate?.(`dept://${item.id}`);
    else window.__maryNavigate?.(`page://kb`);
  };
  const railBtn = {
    width: 28, height: 28, padding: 0, flexShrink: 0,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    background: "transparent", border: "none", borderRadius: 7,
    color: "rgba(38,38,51,0.55)", cursor: "pointer", fontFamily: "inherit",
  };

  return (
    <aside style={{
      width: width + 20, minWidth: width + 20,
      display: "flex", flexDirection: "column",
      padding: "10px",
      transition: "width 0.2s ease",
    }}>
      <div style={{
        flex: 1, minHeight: 0, display: "flex", flexDirection: "column",
        background: cv.bgCard,
        border: `1px solid ${cv.border}`,
        borderRadius: 16,
        overflow: "hidden",
      }}>
      {toolLabel && (
        <div style={{
          padding: "8px 14px",
          background: "linear-gradient(90deg, rgba(63,149,255,0.06), rgba(122,134,255,0.06))",
          borderBottom: "1px solid rgba(38,38,51,0.04)",
          display: "flex", alignItems: "center", gap: 8,
          fontSize: 12, color: "#262633",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%", background: "#FF8B3D",
            animation: "marypulse 1.2s ease-in-out infinite",
          }} />
          <span style={{ fontWeight: 500 }}>Mary</span>
          <span style={{ color: "rgba(38,38,51,0.6)" }}>{toolLabel}…</span>
        </div>
      )}

      <div style={{
        display: "flex", alignItems: "center", gap: 3,
        padding: "8px 10px",
      }}>
        {/* свернуть панель */}
        <button onClick={onClose} title="Свернуть панель" style={railBtn}
          onMouseEnter={e => e.currentTarget.style.background = cv.hover}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M15 4v16" /><path d="m10 10-2 2 2 2" />
          </svg>
        </button>
        {/* + добавить файл/воркфлоу из базы знаний */}
        <div style={{ position: "relative" }} ref={addRef}>
          <button onClick={toggleAdd} title="Добавить файл или воркфлоу из базы знаний"
            style={{ ...railBtn, background: addOpen ? cv.hover : "transparent" }}
            onMouseEnter={e => e.currentTarget.style.background = cv.hover}
            onMouseLeave={e => { if (!addOpen) e.currentTarget.style.background = "transparent"; }}>
            <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          {addOpen && (
            <div onClick={e => e.stopPropagation()}
              style={{
                position: "absolute", left: 0, top: "calc(100% + 6px)",
                width: 256, zIndex: 50,
                background: color.white, border: "1px solid rgba(38,38,51,0.1)",
                borderRadius: 14, boxShadow: "0 12px 32px rgba(38,38,51,0.14)",
                padding: 6, display: "flex", flexDirection: "column", gap: 2,
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 8px", marginBottom: 2 }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="rgba(38,38,51,0.4)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
                </svg>
                <input autoFocus value={addSearch} onChange={e => setAddSearch(e.target.value)} placeholder="Поиск ресурсов..."
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 12.5, color: "#262633", fontFamily: "inherit", padding: 0 }} />
              </div>
              {(() => {
                const q = addSearch.trim().toLowerCase();
                const wf = (addDepts || []).filter(d => !q || (d.name || d.id || "").toLowerCase().includes(q));
                const kb = (addKb || []).filter(f => !q || (f || "").toLowerCase().includes(q));
                const Section = ({ id, label, count, children }) => (
                  <>
                    <button onClick={() => setAddView(v => v === id ? null : id)}
                      style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 8px", background: "transparent", border: "none", borderRadius: 8, fontSize: 12.5, fontWeight: 550, color: "#262633", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(38,38,51,0.04)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="rgba(38,38,51,0.5)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"
                        style={{ transform: addView === id ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}>
                        <path d="m9 6 6 6-6 6" />
                      </svg>
                      <span style={{ flex: 1 }}>{label}</span>
                      <span style={{ fontSize: 11, color: "rgba(38,38,51,0.4)", fontWeight: 500 }}>{count}</span>
                    </button>
                    {addView === id && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 1, paddingBottom: 2 }}>{children}</div>
                    )}
                  </>
                );
                const Item = ({ icon, label, onClick }) => (
                  <button onClick={onClick}
                    style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "7px 8px 7px 26px", background: "transparent", border: "none", borderRadius: 8, fontSize: 12.5, color: "#262633", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(38,38,51,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <span style={{ display: "inline-flex", color: "rgba(38,38,51,0.45)", flexShrink: 0 }}>{icon}</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
                  </button>
                );
                return (
                  <>
                    <Section id="wf" label="Воркфлоу" count={wf.length}>
                      {wf.length === 0
                        ? <div style={{ padding: "6px 8px 6px 26px", fontSize: 12, color: "rgba(38,38,51,0.4)" }}>Пусто</div>
                        : wf.map(d => (
                          <Item key={d.id}
                            icon={<svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><path d="M6.5 10v4M6.5 14h7.5" /></svg>}
                            label={d.name || d.id} onClick={() => pickAdd("wf", d)} />
                        ))}
                    </Section>
                    <Section id="kb" label="База знаний" count={kb.length}>
                      {kb.length === 0
                        ? <div style={{ padding: "6px 8px 6px 26px", fontSize: 12, color: "rgba(38,38,51,0.4)" }}>Пусто</div>
                        : kb.map((f, i) => (
                          <Item key={i}
                            icon={<svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>}
                            label={f} onClick={() => pickAdd("kb", f)} />
                        ))}
                    </Section>
                  </>
                );
              })()}
            </div>
          )}
        </div>
        {build && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "5px 6px 5px 10px", borderRadius: 8,
            background: "transparent",
          }}>
            <button onClick={() => setTab("build")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: "transparent", border: "none", padding: 0,
                fontSize: 12.5, color: tab === "build" ? "#262633" : "rgba(38,38,51,0.5)", fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit",
                maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: build.color || "#7A86FF", flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{build.name}</span>
            </button>
            <button onClick={() => setTab("log")} title="Закрыть воркфлоу"
              style={{
                width: 16, height: 16, padding: 0, flexShrink: 0,
                background: "transparent", border: "none", borderRadius: 4,
                color: "rgba(38,38,51,0.45)", cursor: "pointer", fontFamily: "inherit",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
              }}>
              <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <button
          onClick={() => setTab("log")}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 10px",
            background: "transparent",
            border: "none", borderRadius: 8,
            fontSize: 12.5, color: tab === "log" ? "#262633" : "rgba(38,38,51,0.5)", fontWeight: 500,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Активность <span style={{ color: "rgba(38,38,51,0.4)", marginLeft: 4 }}>{activity.length}</span>
        </button>
        {artifacts.map(a => {
          const active = tab === `art:${a.id}`;
          return (
            <div key={a.id} style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "5px 4px 5px 10px",
              background: active ? "rgba(38,38,51,0.05)" : "transparent",
              borderRadius: 8,
            }}>
              <button onClick={() => setTab(`art:${a.id}`)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "transparent", border: "none",
                  fontSize: 12.5, color: "#262633", fontWeight: 500,
                  cursor: "pointer", fontFamily: "inherit", padding: 0,
                  maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: a.agentColor }} />
                <span>{a.title}</span>
              </button>
              <button onClick={() => {
                onCloseArtifact?.(a.id);
                if (active) setTab(build ? "build" : "log");
              }} title="Закрыть"
                style={{
                  width: 16, height: 16, padding: 0,
                  background: "transparent", border: "none", borderRadius: 4,
                  color: "rgba(38,38,51,0.45)", cursor: "pointer", fontFamily: "inherit",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                }}>
                <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
        <div style={{ flex: 1 }} />
        {build && (
          <button onClick={() => window.__maryNavigate?.(`dept://${build.deptId}`)} title="Развернуть воркфлоу в полном виде"
            style={railBtn}
            onMouseEnter={e => e.currentTarget.style.background = cv.hover}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </button>
        )}
      </div>

      {tab.startsWith("art:") ? (
        <ArtifactView artifact={artifacts.find(a => `art:${a.id}` === tab)} />
      ) : tab === "build" && build ? (
        <BuildCanvas build={build} activeAgentIds={activeAgentIds} />
      ) : (
        <ActivityLog activity={activity} />
      )}

      </div>
    </aside>
  );
}

export function ArtifactView({ artifact }) {
  const [copied, setCopied] = useState(false);
  if (!artifact) {
    return <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(38,38,51,0.4)", fontSize: 13 }}>Артефакт не найден</div>;
  }
  const onCopy = () => {
    navigator.clipboard?.writeText(artifact.content || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const onSaveKb = async () => {
    const name = `${artifact.agentRole} · ${new Date(artifact.ts).toLocaleDateString("ru")}.md`;
    try {
      await fetch("/api/mary/kb/file", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, content: artifact.content }),
      });
      alert(`Сохранено в Базу знаний: «${name}»`);
    } catch (e) { alert("Не удалось сохранить: " + e.message); }
  };
  const initial = (artifact.agentRole || "?").trim().slice(0, 2).toUpperCase();
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: cv.bgCard }}>
      <div style={{
        padding: "14px 18px",
        borderBottom: "1px solid rgba(38,38,51,0.06)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: artifact.agentColor, color: color.white,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 600, flexShrink: 0,
        }}>{initial}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "#262633", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {artifact.title}
          </div>
          <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 1, display: "flex", alignItems: "center", gap: 5 }}>
            <span>{artifact.agentRole}</span>
            <span>·</span>
            <span>{new Date(artifact.ts).toLocaleString("ru", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
            {artifact.chainBasedOn && (
              <>
                <span style={{ color: "rgba(38,38,51,0.35)" }}>· основано на:</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: artifact.chainBasedOn.agentColor }} />
                  <span style={{ color: "#262633", fontWeight: 500 }}>{artifact.chainBasedOn.agentRole}</span>
                </span>
              </>
            )}
            {artifact.chainSeq > 1 && (
              <span style={{
                padding: "0 6px", marginLeft: 4, borderRadius: 999,
                background: artifact.agentColor + "22", color: artifact.agentColor,
                fontSize: 10, fontWeight: 600,
              }}>шаг {artifact.chainSeq}</span>
            )}
          </div>
        </div>
        <button onClick={onCopy} title="Копировать"
          style={{ padding: "5px 11px", fontSize: 12, fontWeight: 500,
            background: copied ? "rgba(52,199,89,0.12)" : "transparent",
            color: copied ? "#34C759" : "#262633",
            border: "1px solid rgba(38,38,51,0.18)", borderRadius: 7,
            cursor: "pointer", fontFamily: "inherit" }}>
          {copied ? "✓ Скопировано" : "Копировать"}
        </button>
        <button onClick={onSaveKb} title="Сохранить в Базу знаний"
          style={{ padding: "5px 11px", fontSize: 12, fontWeight: 500,
            background: "#262633", color: color.white,
            border: "none", borderRadius: 7,
            cursor: "pointer", fontFamily: "inherit" }}>
          В БЗ
        </button>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "18px 22px" }}>
        <div style={{ fontSize: 14, color: "#262633", lineHeight: 1.6 }}>
          {renderMarkdown(artifact.content || "")}
        </div>
      </div>
    </div>
  );
}

export function ActivityLog({ activity }) {
  if (activity.length === 0) {
    return (
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        color: "rgba(38,38,51,0.45)", fontSize: 13, padding: 20, textAlign: "center",
      }}>
        Здесь появится всё что Mary делает: вызовы агентов, чтения базы знаний, создание файлов.
      </div>
    );
  }
  const TOOL_LABEL = {
    get_research_insights: { label: "Свежий ресёрч от Ресерчера", icon: "🔍" },
    generate_ideas:        { label: "Идеи постов от Маркетолога", icon: "💡" },
    write_post:            { label: "Текст поста от Копирайтера",  icon: "✍️" },
    search_kb:             { label: "Поиск в базе знаний",         icon: "📚" },
    create_task:           { label: "Создание задачи",              icon: "📋" },
    publish_post:          { label: "Публикация в Telegram",        icon: "🚀" },
    kb_list:               { label: "Список файлов в БЗ",           icon: "📁" },
    kb_read:               { label: "Чтение файла из БЗ",           icon: "📄" },
    kb_write:              { label: "Сохранение файла в БЗ",        icon: "💾" },
    read_chat:             { label: "Чтение чата отдела",           icon: "💬" },
    list_departments:      { label: "Список отделов",               icon: "🏢" },
    create_department:     { label: "Создание отдела",              icon: "✨" },
    add_channel:           { label: "Добавление канала",            icon: "📡" },
    add_agent:             { label: "Добавление агента",            icon: "🤖" },
    set_department_integrations: { label: "Настройка интеграций",   icon: "🔌" },
  };
  const fmtTime = (ts) => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return `${diff}с назад`;
    if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
    return new Date(ts).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  };
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {activity.map((a, i) => {
          const t = TOOL_LABEL[a.name] || { label: a.name, icon: "⚙" };
          return (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "10px 12px",
              background: color.white,
              border: `1px solid ${cv.border}`,
              borderRadius: 10,
              animation: i === 0 ? "build-pop 0.4s ease" : "none",
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: 8,
                background: a.ok ? "rgba(52,199,89,0.14)" : "rgba(255,77,46,0.14)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, fontSize: 13,
              }}>{a.ok ? t.icon : "❌"}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: "#262633" }}>{t.label}</div>
                <div style={{ fontSize: 11, color: "rgba(38,38,51,0.55)", marginTop: 2, display: "flex", gap: 8 }}>
                  <span>{fmtTime(a.ts)}</span>
                  {a.durationMs != null && <span>· {a.durationMs < 1000 ? `${a.durationMs}ms` : `${Math.round(a.durationMs / 1000)}с`}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BuildCanvas({ build, activeAgentIds }) {
  const accent = build.color || "#7A86FF";
  const [expandedAgentIdx, setExpandedAgentIdx] = useState(null);
  const activeSet = activeAgentIds instanceof Set ? activeAgentIds : new Set();

  const NODE_W = 200, NODE_H = 56, GAP_Y = 14, COL_GAP = 110;
  const channelsCount = build.channels.length;
  const agentsCount   = build.agents.length;
  const maxCount = Math.max(channelsCount, agentsCount, 1);
  const colHeight = maxCount * (NODE_H + GAP_Y) - GAP_Y;
  const canvasH = Math.max(colHeight, NODE_H) + 80;

  const COL_X = {
    channels: 30,
    dept:     30 + NODE_W + COL_GAP,
    agents:   30 + NODE_W + COL_GAP + NODE_W + COL_GAP,
  };
  const totalW = COL_X.agents + NODE_W + 30 + (expandedAgentIdx !== null ? 310 : 0);

  const yFor = (count, idx) => {
    const colH = count * (NODE_H + GAP_Y) - GAP_Y;
    const offset = (canvasH - colH) / 2;
    return offset + idx * (NODE_H + GAP_Y);
  };
  const deptY = (canvasH - NODE_H) / 2;

  const path = (x1, y1, x2, y2) => {
    const dx = Math.max(40, (x2 - x1) * 0.5);
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  };

  return (
    <div style={{
      flex: 1, position: "relative", overflow: "auto",
      background: cv.bgCard,
      backgroundImage: "radial-gradient(rgba(38,38,51,0.12) 1px, transparent 1px)",
      backgroundSize: "20px 20px",
      backgroundPosition: "10px 10px",
    }}>
        <div style={{ position: "relative", width: totalW, minHeight: canvasH, padding: "0 0" }}>
          {channelsCount > 0 && (
            <div style={{
              position: "absolute", left: COL_X.channels, top: 12, width: NODE_W,
              fontSize: 10.5, color: "rgba(38,38,51,0.5)", fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "0.05em",
            }}>Каналы · {channelsCount}</div>
          )}
          {agentsCount > 0 && (
            <div style={{
              position: "absolute", left: COL_X.agents, top: 12, width: NODE_W,
              fontSize: 10.5, color: "rgba(38,38,51,0.5)", fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "0.05em",
            }}>Агенты · {agentsCount}</div>
          )}

          <svg width={totalW} height={canvasH} style={{
            position: "absolute", left: 0, top: 36, pointerEvents: "none", overflow: "visible",
          }}>
            {build.channels.map((_, i) => path && (
              <path key={`ch-${i}`}
                d={path(
                  COL_X.channels + NODE_W,
                  yFor(channelsCount, i) + NODE_H / 2,
                  COL_X.dept,
                  deptY + NODE_H / 2,
                )}
                stroke="rgba(38,38,51,0.18)" strokeWidth="1.4" fill="none"
              />
            ))}
            {build.agents.map((_, i) => (
              <path key={`ag-${i}`}
                d={path(
                  COL_X.dept + NODE_W,
                  deptY + NODE_H / 2,
                  COL_X.agents,
                  yFor(agentsCount, i) + NODE_H / 2,
                )}
                stroke="rgba(38,38,51,0.18)" strokeWidth="1.4" fill="none"
              />
            ))}
          </svg>

          {build.channels.map((c, i) => (
            <BuildNode key={c.id || i}
              x={COL_X.channels} y={yFor(channelsCount, i) + 36}
              w={NODE_W} h={NODE_H}
              icon="ch" iconBg="#FFF4D1" iconColor="#FFB800"
              title={c.name} sub={c.type || "канал"}
              animate={i === channelsCount - 1}
            />
          ))}

          <BuildNode
            x={COL_X.dept} y={deptY + 36}
            w={NODE_W} h={NODE_H}
            icon="dept" iconBg={accent + "26"} iconColor={accent}
            title={build.name} sub="отдел"
            isMain
          />

          {build.agents.map((a, i) => (
            <BuildNode key={a.id || i}
              x={COL_X.agents} y={yFor(agentsCount, i) + 36}
              w={NODE_W} h={NODE_H}
              icon="agent" iconBg={(a.color || "#7A86FF") + "26"} iconColor={a.color || "#7A86FF"}
              title={a.role} sub={a.tasks || "AI-агент"}
              animate={i === agentsCount - 1}
              expanded={expandedAgentIdx === i}
              active={activeSet.has(a.id)}
              onClick={() => setExpandedAgentIdx(expandedAgentIdx === i ? null : i)}
            />
          ))}

          {expandedAgentIdx !== null && build.agents[expandedAgentIdx] && (
            <AgentNodeExpanded
              agent={build.agents[expandedAgentIdx]}
              x={COL_X.agents + NODE_W + 16}
              y={yFor(agentsCount, expandedAgentIdx) + 36}
              w={280}
              onClose={() => setExpandedAgentIdx(null)}
            />
          )}
        </div>

      <style>{`
        @keyframes build-pop {
          0%   { opacity: 0; transform: scale(0.85); }
          70%  { transform: scale(1.04); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

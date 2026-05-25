import { useState, useEffect } from "react";
import { color } from "../ui/tokens.js";
import { ic } from "./icons.jsx";
import { renderMarkdown } from "./markdown.jsx";
import { BuildNode, AgentNodeExpanded } from "./build-nodes.jsx";
import { zoomBtn } from "./chat-panel.jsx";

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
  return (
    <aside style={{
      width: width, minWidth: width,
      borderLeft: "1px solid rgba(38,38,51,0.06)",
      display: "flex", flexDirection: "column",
      background: color.white,
      transition: "width 0.2s ease",
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
        display: "flex", alignItems: "center", gap: 4,
        padding: "10px 12px",
        borderBottom: "1px solid rgba(38,38,51,0.06)",
        background: color.white,
      }}>
        {build && (
          <button
            onClick={() => setTab("build")}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "5px 12px",
              background: tab === "build" ? "rgba(38,38,51,0.05)" : "transparent",
              border: "none", borderRadius: 8,
              fontSize: 12.5, color: "#262633", fontWeight: 500,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: 2, background: build.color || "#7A86FF" }} />
            Workflow: {build.name}
          </button>
        )}
        <button
          onClick={() => setTab("log")}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 12px",
            background: tab === "log" ? "rgba(38,38,51,0.05)" : "transparent",
            border: "none", borderRadius: 8,
            fontSize: 12.5, color: "#262633", fontWeight: 500,
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
        <button onClick={onClose} title="Свернуть" style={{
          ...zoomBtn, color: "rgba(38,38,51,0.5)", padding: 6,
        }}>{ic.close}</button>
      </div>

      {tab.startsWith("art:") ? (
        <ArtifactView artifact={artifacts.find(a => `art:${a.id}` === tab)} />
      ) : tab === "build" && build ? (
        <BuildCanvas build={build} activeAgentIds={activeAgentIds} />
      ) : (
        <ActivityLog activity={activity} />
      )}

      <div style={{
        padding: "10px 14px",
        borderTop: "1px solid rgba(38,38,51,0.06)",
        background: color.white,
        fontSize: 11.5, color: "rgba(38,38,51,0.55)",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34C759" }} />
        <span>Mary онлайн</span>
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
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: color.white }}>
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
              background: "rgba(38,38,51,0.025)",
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
      background: color.white,
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

        {build.integrations.length > 0 && (
          <div style={{
            position: "absolute", left: 0, right: 0, bottom: 0,
            padding: "12px 18px",
            background: "linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0.8))",
            borderTop: "1px solid rgba(38,38,51,0.06)",
            zIndex: 1,
          }}>
            <div style={{ fontSize: 10.5, color: "rgba(38,38,51,0.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
              Интеграции · {build.integrations.length}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {build.integrations.map((it, i) => (
                <span key={i} style={{
                  padding: "5px 12px",
                  background: "rgba(63,149,255,0.1)",
                  color: "#3F95FF",
                  fontSize: 12, fontWeight: 500,
                  borderRadius: 999,
                  animation: i === build.integrations.length - 1 ? "build-pop 0.4s ease" : "none",
                }}>{it}</span>
              ))}
            </div>
            <button
              onClick={() => window.__maryNavigate?.(`dept://${build.deptId}`)}
              style={{
                marginTop: 10,
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 14px",
                background: "#262633", color: color.white,
                border: "none", borderRadius: 8,
                fontSize: 12.5, fontWeight: 500, fontFamily: "inherit",
                cursor: "pointer",
              }}>
              Открыть {build.name} в полном виде
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        )}

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

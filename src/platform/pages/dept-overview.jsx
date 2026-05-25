import { useState, useEffect, useRef } from "react";
import { color } from "../../ui/tokens.js";
import { AGENTS } from "../agents-config.js";

const SHARED_IDS = ["researcher", "marketer"];

function agentInitials(label = "") {
  return label.trim().slice(0, 2).toUpperCase();
}

// ── Metric chip ──────────────────────────────────────────────────
function MetricChip({ label, value, sub, chipColor }) {
  return (
    <div style={{
      padding: "12px 20px",
      background: color.white,
      border: "1px solid rgba(38,38,51,0.07)",
      borderRadius: 14,
      display: "flex", flexDirection: "column", gap: 2,
      minWidth: 90,
    }}>
      <span style={{ fontSize: 22, fontWeight: 700, color: chipColor || "#262633", lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 11.5, color: "rgba(38,38,51,0.5)", fontWeight: 500 }}>{label}</span>
      {sub && <span style={{ fontSize: 10.5, color: "rgba(38,38,51,0.35)" }}>{sub}</span>}
    </div>
  );
}

// ── Agent node (left side) ───────────────────────────────────────
function AgentNode({ agent, nodeRef }) {
  const bgColor = (agent.color || "#7A86FF") + "22";
  const fgColor = agent.color || "#7A86FF";
  return (
    <div ref={nodeRef} style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 14px",
      background: color.white,
      border: "1px solid rgba(38,38,51,0.08)",
      borderRadius: 14,
      width: 190,
      boxShadow: "0 1px 4px rgba(38,38,51,0.04)",
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 9,
        background: bgColor,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        fontSize: 12, fontWeight: 700, color: fgColor,
      }}>{agentInitials(agent.label)}</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#262633" }}>{agent.label}</div>
        <div style={{ fontSize: 11, color: "rgba(38,38,51,0.45)" }}>Агент</div>
      </div>
    </div>
  );
}

// ── Channel node (right side, clickable) ────────────────────────
function ChannelNode({ ch, deptColor, onClick, nodeRef }) {
  const [hover, setHover] = useState(false);
  const CHAN_ICONS = {
    tg: (
      <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.8 2.2a1 1 0 0 0-1-.2L2.3 9.3a1 1 0 0 0 .1 1.9l4.6 1.5 1.8 5.6a1 1 0 0 0 1.7.4l2.6-2.6 4.5 3.3a1 1 0 0 0 1.5-.7l2.7-15a1 1 0 0 0-.3-.8z" />
      </svg>
    ),
    inst: (
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r=".5" fill="currentColor" />
      </svg>
    ),
    vk: (
      <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.5 15.5h1.9c.4 0 .5-.3.5-.5 0 0 0-2 .9-2.3.9-.3 2 1.8 3.2 2.6.9.6 1.6.5 1.6.5l3.2-.1s1.7-.1.9-1.4c-.1-.2-.6-.9-2.2-2.5C21.3 10 20.9 10 21.2 9.5c.7-1 1.8-2.5 2.3-3.4.3-.6.1-.9-.5-.9h-2c-.5 0-.7.3-.9.6 0 0-1 2.3-2.5 3.8-.7.6-1 .3-1 0V6.3c0-.5-.1-.8-.7-.8h-3.2c-.4 0-.7.3-.7.6 0 .7.9.9.9 2.7v4.1c0 .6-.1.7-.4.7-.6 0-2.1-2.3-3-5C9.3 7.7 9 7.5 8.4 7.5H6.5c-.6 0-.7.3-.7.6 0 .7.7 4 3.3 8.3C11 19 13 20 14.9 20c1 0 1.2-.3 1.2-.7v-2.1c0-.6.1-.7.5-.7z"/>
      </svg>
    ),
  };
  const chanType = ch.id?.toLowerCase().includes("inst") || ch.name?.toLowerCase().includes("инст") ? "inst"
    : ch.id?.toLowerCase().includes("vk") || ch.name?.toLowerCase().includes("вк") ? "vk"
    : "tg";

  return (
    <div ref={nodeRef}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 16px",
        background: hover ? "rgba(38,38,51,0.02)" : color.white,
        border: `1.5px solid ${hover ? (deptColor || "#FF8B3D") : "rgba(38,38,51,0.1)"}`,
        borderRadius: 14,
        width: 190,
        cursor: "pointer",
        boxShadow: hover ? "0 2px 10px rgba(38,38,51,0.06)" : "0 1px 4px rgba(38,38,51,0.04)",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}>
      <div style={{
        width: 32, height: 32, borderRadius: 9,
        background: (deptColor || "#FF8B3D") + "18",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, color: deptColor || "#FF8B3D",
      }}>{CHAN_ICONS[chanType]}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#262633" }}>{ch.name}</div>
        <div style={{ fontSize: 11, color: "rgba(38,38,51,0.45)" }}>Воркфлоу</div>
      </div>
      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="rgba(38,38,51,0.35)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </div>
  );
}

// ── Graph canvas with SVG edges ──────────────────────────────────
function DeptGraph({ agents, channels, deptColor, onNavigate }) {
  const sharedAgents = agents.filter(a => SHARED_IDS.includes(a.id) || SHARED_IDS.includes(a.role));
  const otherAgents  = agents.filter(a => !SHARED_IDS.includes(a.id) && !SHARED_IDS.includes(a.role));
  const allLeftAgents = [...sharedAgents, ...otherAgents];

  const leftRefs  = useRef([]);
  const rightRefs = useRef([]);
  const containerRef = useRef(null);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    const compute = () => {
      if (!containerRef.current) return;
      const box = containerRef.current.getBoundingClientRect();
      const newEdges = [];
      // Connect last shared agent (marketer) to each channel, or all if no channels
      const sourceRefs = sharedAgents.length > 0
        ? leftRefs.current.slice(0, sharedAgents.length)
        : leftRefs.current;
      for (const lRef of sourceRefs) {
        if (!lRef) continue;
        const lr = lRef.getBoundingClientRect();
        const lx = lr.right - box.left;
        const ly = lr.top + lr.height / 2 - box.top;
        for (let ri = 0; ri < rightRefs.current.length; ri++) {
          const rRef = rightRefs.current[ri];
          if (!rRef) continue;
          const rr = rRef.getBoundingClientRect();
          const rx = rr.left - box.left;
          const ry = rr.top + rr.height / 2 - box.top;
          const mx = (lx + rx) / 2;
          newEdges.push({ x1: lx, y1: ly, x2: rx, y2: ry, mx });
        }
      }
      setEdges(newEdges);
    };
    const t = setTimeout(compute, 60);
    window.addEventListener("resize", compute);
    return () => { clearTimeout(t); window.removeEventListener("resize", compute); };
  }, [agents.length, channels.length]);

  if (channels.length === 0) {
    return (
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        {allLeftAgents.map((a, i) => (
          <AgentNode key={a.id || i} agent={a} nodeRef={el => { leftRefs.current[i] = el; }} />
        ))}
        <div style={{ fontSize: 13, color: "rgba(38,38,51,0.4)", marginTop: 16, alignSelf: "center" }}>
          Каналов пока нет — добавь в настройках отдела
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {/* SVG edges */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}>
        {edges.map((e, i) => (
          <path key={i}
            d={`M ${e.x1} ${e.y1} C ${e.mx} ${e.y1}, ${e.mx} ${e.y2}, ${e.x2} ${e.y2}`}
            fill="none" stroke="rgba(38,38,51,0.1)" strokeWidth={1.5}
          />
        ))}
      </svg>

      <div style={{ display: "flex", gap: 80, alignItems: "center" }}>
        {/* Left — agents */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(38,38,51,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
            Общие агенты
          </div>
          {allLeftAgents.map((a, i) => (
            <AgentNode key={a.id || i} agent={a} nodeRef={el => { leftRefs.current[i] = el; }} />
          ))}
        </div>

        {/* Right — channels */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(38,38,51,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
            Воркфлоу / Каналы
          </div>
          {channels.map((ch, i) => (
            <ChannelNode
              key={ch.id}
              ch={ch}
              deptColor={deptColor}
              onClick={() => onNavigate?.(ch.page)}
              nodeRef={el => { rightRefs.current[i] = el; }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────
export function DepartmentOverviewPage({ dept, onNavigate }) {
  const [tasks, setTasks] = useState([]);
  const [runs, setRuns] = useState([]);

  useEffect(() => {
    if (!dept?.id) return;
    fetch(`/api/mary/tasks?deptId=${dept.id}`).then(r => r.json()).then(d => setTasks(d.tasks || [])).catch(() => {});
    fetch(`/api/mary/sandbox/runs?deptId=${dept.id}`).then(r => r.json()).then(d => setRuns(d.runs || [])).catch(() => {});
  }, [dept?.id]);

  const channels = dept?.channels || [];
  const agents   = (dept?.agents?.length > 0 ? dept.agents : AGENTS).map(a => ({
    id: a.id, label: a.label, color: a.color, role: a.role,
  }));

  const activeTasks = tasks.filter(t => t.status !== "done").length;
  const doneTasks   = tasks.filter(t => t.status === "done").length;
  const runsThisWeek = runs.filter(r => {
    const d = new Date(r.startedAt || r.createdAt || r.ts);
    return Date.now() - d.getTime() < 7 * 86400000;
  }).length;

  const metrics = [
    { label: "Каналов", value: channels.length || "—", chipColor: dept?.color || "#FF8B3D" },
    { label: "Агентов", value: agents.length || "—", chipColor: "#7A86FF" },
    { label: "Активных задач", value: activeTasks, chipColor: "#FF8B3D" },
    { label: "Готово задач", value: doneTasks, chipColor: "#34C759" },
    { label: "Прогонов за неделю", value: runsThisWeek, chipColor: "#3F95FF" },
    { label: "Интеграций", value: (dept?.integrations || []).length, chipColor: "#FF6FB3" },
  ];

  return (
    <div style={{ flex: 1, overflowY: "auto", background: color.white }}>
      <div style={{ padding: "32px 40px", maxWidth: 960 }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: 12.5, color: "rgba(38,38,51,0.45)", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
          <span>Отделы</span>
          <span>›</span>
          <span style={{ color: "#262633", fontWeight: 500 }}>{dept?.name}</span>
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 13,
            background: (dept?.color || "#FF8B3D") + "20",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: dept?.color || "#FF8B3D", flexShrink: 0,
          }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor">
              <rect x="2" y="7" width="20" height="14" rx="3" opacity=".3"/>
              <rect x="7" y="3" width="10" height="6" rx="2"/>
              <circle cx="12" cy="14" r="2.5"/>
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#262633", margin: 0, letterSpacing: "-0.01em" }}>{dept?.name}</h1>
            {dept?.description && (
              <p style={{ fontSize: 13, color: "rgba(38,38,51,0.5)", margin: "3px 0 0" }}>{dept.description}</p>
            )}
          </div>
        </div>

        {/* Metric chips */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 40 }}>
          {metrics.map(m => (
            <MetricChip key={m.label} label={m.label} value={m.value} chipColor={m.chipColor} />
          ))}
        </div>

        {/* Graph */}
        <div style={{ marginBottom: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#262633", margin: "0 0 20px" }}>
            Структура отдела
          </h2>
          <DeptGraph
            agents={agents}
            channels={channels}
            deptColor={dept?.color}
            onNavigate={onNavigate}
          />
        </div>

        {/* If no channels — hint */}
        {channels.length === 0 && (
          <div style={{
            marginTop: 32, padding: "18px 22px",
            background: "rgba(38,38,51,0.03)", borderRadius: 14,
            border: "1px dashed rgba(38,38,51,0.12)",
            fontSize: 13, color: "rgba(38,38,51,0.55)",
          }}>
            Каналов нет. Попроси Mary добавить воркфлоу — например: <em>«добавь ТГ-канал в отдел СММ»</em>
          </div>
        )}

        {/* Recent runs */}
        {runs.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "#262633", margin: "0 0 14px" }}>Последние прогоны</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {runs.slice(0, 5).map(r => {
                const ok = r.assertions?.length ? r.assertions.every(a => a.ok) : null;
                return (
                  <div key={r.id} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px",
                    background: color.white,
                    border: "1px solid rgba(38,38,51,0.07)",
                    borderRadius: 10,
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: ok === true ? "#34C759" : ok === false ? "#FF3B30" : "rgba(38,38,51,0.3)" }} />
                    <span style={{ fontSize: 12.5, color: "#262633", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {(r.input || "").slice(0, 60) || "—"}
                    </span>
                    <span style={{ fontSize: 11, color: "rgba(38,38,51,0.4)", flexShrink: 0 }}>
                      {new Date(r.startedAt || r.createdAt).toLocaleDateString("ru", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {r.judge?.score && (
                      <span style={{ fontSize: 11, color: r.judge.score >= 7 ? "#34C759" : "#FF8B3D", fontWeight: 600 }}>{r.judge.score}/10</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

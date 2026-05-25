import { useState, useEffect, useRef } from "react";
import { color } from "../../ui/tokens.js";
import { AGENTS } from "../agents-config.js";

const SHARED_IDS = ["researcher", "marketer"];

const ROBOT_ICON = (
  <svg width={16} height={16} viewBox="0 0 24 24">
    <rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor"/>
    <rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor"/>
    <circle cx="9.3" cy="13" r="1.4" fill="white"/>
    <circle cx="14.7" cy="13" r="1.4" fill="white"/>
  </svg>
);

// ── Metric chip ──────────────────────────────────────────────────
function MetricChip({ label, value, chipColor }) {
  return (
    <div style={{
      padding: "12px 20px",
      background: color.white,
      border: "1px solid rgba(38,38,51,0.07)",
      borderRadius: 14,
      display: "flex", flexDirection: "column", gap: 2,
      minWidth: 100,
    }}>
      <span style={{ fontSize: 22, fontWeight: 700, color: chipColor || "#262633", lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 11.5, color: "rgba(38,38,51,0.5)", fontWeight: 500 }}>{label}</span>
    </div>
  );
}

// ── Agent node — same visual style as BuildNode in TG-kanal ────
function AgentNode({ agent, nodeRef }) {
  const iconBg  = (agent.color || "#7A86FF") + "22";
  const iconColor = agent.color || "#7A86FF";
  return (
    <div ref={nodeRef} style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "0 14px",
      height: 56,
      background: color.white,
      borderRadius: 24,
      boxShadow: "0 1px 4px rgba(38,38,51,0.07), 0 0 0 1px rgba(38,38,51,0.06)",
      width: 200,
      position: "relative",
    }}>
      {/* left port */}
      <span style={{
        position: "absolute", left: -4, top: "50%", transform: "translateY(-50%)",
        width: 8, height: 8, borderRadius: "50%",
        background: color.white, border: "1px solid rgba(38,38,51,0.18)",
      }} />
      <div style={{
        width: 36, height: 36, borderRadius: 11,
        background: iconBg, color: iconColor,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>{ROBOT_ICON}</div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 510, color: "#262633", lineHeight: 1.15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {agent.label}
        </div>
        <div style={{ fontSize: 11, color: "rgba(38,38,51,0.5)", marginTop: 2 }}>Агент</div>
      </div>
      {/* right port */}
      <span style={{
        position: "absolute", right: -4, top: "50%", transform: "translateY(-50%)",
        width: 8, height: 8, borderRadius: "50%",
        background: color.white, border: "1px solid rgba(38,38,51,0.18)",
      }} />
    </div>
  );
}

// ── Channel node (right side, clickable) ────────────────────────
const CHAN_ICONS = {
  tg: (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.8 2.2a1 1 0 0 0-1-.2L2.3 9.3a1 1 0 0 0 .1 1.9l4.6 1.5 1.8 5.6a1 1 0 0 0 1.7.4l2.6-2.6 4.5 3.3a1 1 0 0 0 1.5-.7l2.7-15a1 1 0 0 0-.3-.8z" />
    </svg>
  ),
  inst: (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r=".5" fill="currentColor" />
    </svg>
  ),
  vk: (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.5 15.5h1.9c.4 0 .5-.3.5-.5 0 0 0-2 .9-2.3.9-.3 2 1.8 3.2 2.6.9.6 1.6.5 1.6.5l3.2-.1s1.7-.1.9-1.4c-.1-.2-.6-.9-2.2-2.5C21.3 10 20.9 10 21.2 9.5c.7-1 1.8-2.5 2.3-3.4.3-.6.1-.9-.5-.9h-2c-.5 0-.7.3-.9.6 0 0-1 2.3-2.5 3.8-.7.6-1 .3-1 0V6.3c0-.5-.1-.8-.7-.8h-3.2c-.4 0-.7.3-.7.6 0 .7.9.9.9 2.7v4.1c0 .6-.1.7-.4.7-.6 0-2.1-2.3-3-5C9.3 7.7 9 7.5 8.4 7.5H6.5c-.6 0-.7.3-.7.6 0 .7.7 4 3.3 8.3C11 19 13 20 14.9 20c1 0 1.2-.3 1.2-.7v-2.1c0-.6.1-.7.5-.7z"/>
    </svg>
  ),
};

function chanType(ch) {
  const s = ((ch.id || "") + (ch.name || "")).toLowerCase();
  if (s.includes("inst") || s.includes("инст")) return "inst";
  if (s.includes("vk") || s.includes("вк") || s.includes("вконтакте")) return "vk";
  return "tg";
}

function ChannelNode({ ch, deptColor, onClick, nodeRef }) {
  const [hover, setHover] = useState(false);
  const type = chanType(ch);
  const col = deptColor || "#FF8B3D";
  return (
    <div ref={nodeRef}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "0 14px",
        height: 56,
        background: color.white,
        borderRadius: 24,
        boxShadow: hover
          ? `0 4px 14px ${col}30, 0 0 0 1.5px ${col}`
          : "0 1px 4px rgba(38,38,51,0.07), 0 0 0 1px rgba(38,38,51,0.06)",
        width: 200,
        cursor: "pointer",
        transition: "box-shadow 0.15s",
        position: "relative",
      }}>
      {/* left port */}
      <span style={{
        position: "absolute", left: -4, top: "50%", transform: "translateY(-50%)",
        width: 8, height: 8, borderRadius: "50%",
        background: color.white, border: "1px solid rgba(38,38,51,0.18)",
      }} />
      <div style={{
        width: 36, height: 36, borderRadius: 11,
        background: col + "18",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, color: col,
      }}>{CHAN_ICONS[type]}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 510, color: "#262633", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ch.name}</div>
        <div style={{ fontSize: 11, color: "rgba(38,38,51,0.5)", marginTop: 2 }}>Воркфлоу</div>
      </div>
      <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="rgba(38,38,51,0.35)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </div>
  );
}

// ── Graph canvas with SVG bezier edges ───────────────────────────
function DeptGraph({ agents, channels, deptColor, onNavigate }) {
  const leftRefs  = useRef([]);
  const rightRefs = useRef([]);
  const containerRef = useRef(null);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    const compute = () => {
      if (!containerRef.current) return;
      const box = containerRef.current.getBoundingClientRect();
      const newEdges = [];
      for (const lRef of leftRefs.current) {
        if (!lRef) continue;
        const lr = lRef.getBoundingClientRect();
        const lx = lr.right - box.left;
        const ly = lr.top + lr.height / 2 - box.top;
        for (const rRef of rightRefs.current) {
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
    const t = setTimeout(compute, 80);
    window.addEventListener("resize", compute);
    return () => { clearTimeout(t); window.removeEventListener("resize", compute); };
  }, [agents.length, channels.length]);

  if (channels.length === 0) {
    return (
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {agents.map((a, i) => (
          <AgentNode key={a.id || i} agent={a} nodeRef={el => { leftRefs.current[i] = el; }} />
        ))}
        <div style={{ fontSize: 13, color: "rgba(38,38,51,0.4)", alignSelf: "center", marginLeft: 8 }}>
          Каналов пока нет
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ position: "relative", minHeight: Math.max(agents.length, channels.length) * 66 }}>
      {/* SVG edges */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}>
        {edges.map((e, i) => (
          <path key={i}
            d={`M ${e.x1} ${e.y1} C ${e.mx} ${e.y1}, ${e.mx} ${e.y2}, ${e.x2} ${e.y2}`}
            fill="none" stroke="rgba(38,38,51,0.12)" strokeWidth={1.5}
          />
        ))}
      </svg>

      <div style={{ display: "flex", gap: 100, alignItems: "center" }}>
        {/* Left — agents */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(38,38,51,0.4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
            Общие агенты
          </div>
          {agents.map((a, i) => (
            <AgentNode key={a.id || i} agent={a} nodeRef={el => { leftRefs.current[i] = el; }} />
          ))}
        </div>

        {/* Right — channels */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(38,38,51,0.4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
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
  const [runs,  setRuns]  = useState([]);

  useEffect(() => {
    if (!dept?.id) return;
    fetch(`/api/mary/tasks?deptId=${dept.id}`).then(r => r.json()).then(d => setTasks(d.tasks || [])).catch(() => {});
    fetch(`/api/mary/sandbox/runs?deptId=${dept.id}`).then(r => r.json()).then(d => setRuns(d.runs || [])).catch(() => {});
  }, [dept?.id]);

  const channels = dept?.channels || [];

  // Normalize agent shape: API uses `role` instead of `label`
  const rawAgents = dept?.agents?.length > 0 ? dept.agents : AGENTS;
  const agents = rawAgents.map(a => ({
    id:    a.id,
    label: a.label || a.role || a.name || "Агент",
    color: a.color,
  }));

  const activeTasks   = tasks.filter(t => t.status !== "done").length;
  const doneTasks     = tasks.filter(t => t.status === "done").length;
  const runsThisWeek  = runs.filter(r => {
    const d = new Date(r.startedAt || r.createdAt || r.ts);
    return Date.now() - d.getTime() < 7 * 86400000;
  }).length;

  const metrics = [
    { label: "Каналов",          value: channels.length || "—", chipColor: dept?.color || "#FF8B3D" },
    { label: "Агентов",          value: agents.length || "—",   chipColor: "#7A86FF" },
    { label: "Активных задач",   value: activeTasks,            chipColor: "#FF8B3D" },
    { label: "Готово задач",     value: doneTasks,              chipColor: "#34C759" },
    { label: "Прогонов за неделю", value: runsThisWeek,        chipColor: "#3F95FF" },
    { label: "Интеграций",       value: (dept?.integrations || []).length, chipColor: "#FF6FB3" },
  ];

  return (
    <div style={{ flex: 1, overflowY: "auto", background: "#f7f7f9" }}>
      <div style={{ padding: "32px 40px", maxWidth: 960 }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: 12.5, color: "rgba(38,38,51,0.45)", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ cursor: "pointer" }} onClick={() => onNavigate?.("home")}>Отделы</span>
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
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 36 }}>
          {metrics.map(m => (
            <MetricChip key={m.label} label={m.label} value={m.value} chipColor={m.chipColor} />
          ))}
        </div>

        {/* Graph section */}
        <div style={{
          background: color.white,
          borderRadius: 20,
          border: "1px solid rgba(38,38,51,0.06)",
          padding: "24px 28px",
          marginBottom: 20,
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#262633", margin: "0 0 22px" }}>
            Структура отдела
          </h2>
          <DeptGraph
            agents={agents}
            channels={channels}
            deptColor={dept?.color}
            onNavigate={onNavigate}
          />
        </div>

        {/* Recent runs */}
        {runs.length > 0 && (
          <div style={{
            background: color.white,
            borderRadius: 20,
            border: "1px solid rgba(38,38,51,0.06)",
            padding: "24px 28px",
          }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "#262633", margin: "0 0 14px" }}>Последние прогоны</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {runs.slice(0, 5).map(r => {
                const ok = r.assertions?.length ? r.assertions.every(a => a.ok) : null;
                return (
                  <div key={r.id} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px",
                    background: "rgba(38,38,51,0.02)",
                    borderRadius: 10,
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: ok === true ? "#34C759" : ok === false ? "#FF3B30" : "rgba(38,38,51,0.25)" }} />
                    <span style={{ fontSize: 12.5, color: "#262633", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {(r.input || "").slice(0, 70) || "—"}
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

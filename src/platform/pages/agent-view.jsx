import { useState, useRef, useEffect } from "react";
import { color, transition } from "../../ui/tokens.js";
import { ic } from "../icons.jsx";
import { zoomBtn } from "../chat-panel.jsx";
import { AGENTS } from "../agents-config.js";
import { AgentLogsView, AgentOutputView } from "../bottom-panel.jsx";
import { BuildNode, AgentNodeExpanded } from "../build-nodes.jsx";
import { FlowNode, AgentFlowCanvas, pipelineToFlow } from "./agent-flow.jsx";
import { AgentSettingsView, SettingRow, AgentJobDescription } from "./agent-settings.jsx";

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
      background: color.white,
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

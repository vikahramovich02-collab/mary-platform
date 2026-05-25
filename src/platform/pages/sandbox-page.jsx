import { useState, useRef, useEffect } from "react";
import { color } from "../../ui/tokens.js";
import { AgentLogsView, AgentOutputView } from "../bottom-panel.jsx";
import { BuildNode } from "../build-nodes.jsx";
import { AGENTS } from "../agents-config.js";

export function SandboxPage() {
  const [deptId, setDeptId] = useState("smm");
  const [departments, setDepartments] = useState([]);
  const [runs, setRuns] = useState([]);
  const [activeRunId, setActiveRunId] = useState(null);
  const [activeRun, setActiveRun] = useState(null); // деталь
  const [goldenTests, setGoldenTests] = useState([]);
  // Текущий прогон (live)
  const [input, setInput] = useState("");
  const [selectedGoldenId, setSelectedGoldenId] = useState("");
  const [judgeOn, setJudgeOn] = useState(true);
  const [running, setRunning] = useState(false);
  const [liveAgents, setLiveAgents] = useState([]);
  const [judge, setJudge] = useState(null);
  const [judgeRunning, setJudgeRunning] = useState(false);
  const abortRef = useRef(null);

  // Загружаем отделы, runs, golden tests
  useEffect(() => {
    fetch("/api/mary/departments").then(r => r.json()).then(d => setDepartments(d.departments || []));
  }, []);
  const reloadRuns = () => fetch(`/api/mary/sandbox/runs?deptId=${deptId}`).then(r => r.json()).then(d => setRuns(d.runs || []));
  useEffect(() => {
    reloadRuns();
    fetch(`/api/mary/sandbox/golden?deptId=${deptId}`).then(r => r.json()).then(d => setGoldenTests(d.tests || []));
    setActiveRunId(null); setActiveRun(null);
    setLiveAgents([]); setJudge(null);
  }, [deptId]);
  // При выборе run — фетчим детали
  useEffect(() => {
    if (!activeRunId) { setActiveRun(null); return; }
    fetch(`/api/mary/sandbox/runs/${activeRunId}`).then(r => r.json()).then(setActiveRun);
  }, [activeRunId]);

  const onPickGolden = (id) => {
    setSelectedGoldenId(id);
    const t = goldenTests.find(x => x.id === id);
    if (t) setInput(t.input);
  };

  const run = async (dryRun) => {
    if (!input.trim() || running) return;
    setRunning(true);
    setLiveAgents([]);
    setJudge(null);
    setJudgeRunning(false);
    setActiveRunId(null); setActiveRun(null);
    const expected = goldenTests.find(t => t.id === selectedGoldenId)?.expected || {};
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const res = await fetch(`/api/mary/departments/${deptId}/sandbox/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, dryRun, judge: judgeOn && !dryRun, expected }),
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
            setLiveAgents(prev => [...prev, { id: data.agentId, role: data.role, status: "running" }]);
          } else if (event === "agent_end") {
            setLiveAgents(prev => prev.map(a => a.id === data.agentId
              ? { ...a, status: data.error ? "error" : "done", output: data.output, error: data.error, durationMs: data.durationMs, tokens: data.tokens, costUsd: data.costUsd }
              : a));
          } else if (event === "judge_start") {
            setJudgeRunning(true);
          } else if (event === "judge_end") {
            setJudge(data);
            setJudgeRunning(false);
          } else if (event === "done") {
            // Сохранённый run — открываем его (тогда assertions + judge подтянутся из БД)
            if (data.runId) {
              setActiveRunId(data.runId);
              reloadRuns();
            }
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

  // Если activeRun выбран — показываем его, иначе live
  const view = activeRun || (liveAgents.length ? { agents: liveAgents, assertions: [], judge } : null);
  // Найти предыдущий run для diff (тот же deptId, не текущий)
  const prevRun = activeRun ? runs.find(r => r.id !== activeRun.id) : null;

  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0, background: color.white }}>
      {/* Sidebar runs */}
      <aside style={{
        width: 240, minWidth: 240,
        borderRight: "1px solid rgba(38,38,51,0.06)",
        display: "flex", flexDirection: "column",
        background: color.white,
      }}>
        <div style={{ padding: "14px 14px 10px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(38,38,51,0.5)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
            Отдел
          </div>
          <select
            value={deptId} onChange={e => setDeptId(e.target.value)}
            style={{
              width: "100%", padding: "7px 10px",
              border: "1px solid rgba(38,38,51,0.12)", borderRadius: 7,
              fontSize: 13, color: "#262633", background: color.white,
              fontFamily: "inherit", outline: "none", cursor: "pointer",
            }}>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div style={{ padding: "4px 10px 8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(38,38,51,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Прогоны · {runs.length}
          </span>
          <button onClick={() => { setActiveRunId(null); setActiveRun(null); setLiveAgents([]); setJudge(null); setInput(""); }}
            title="Новый прогон"
            style={{
              background: "transparent", border: "none", padding: 2, borderRadius: 5,
              color: "rgba(38,38,51,0.55)", cursor: "pointer", display: "inline-flex",
            }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 16px", display: "flex", flexDirection: "column", gap: 2 }}>
          {runs.length === 0 && (
            <div style={{ padding: 14, fontSize: 12, color: "rgba(38,38,51,0.5)", textAlign: "center" }}>
              Прогонов ещё нет
            </div>
          )}
          {runs.map(r => {
            const ok = r.assertions?.length ? r.assertions.every(a => a.ok) : null;
            return (
              <div key={r.id}
                onClick={() => setActiveRunId(r.id)}
                style={{
                  display: "flex", flexDirection: "column", gap: 2,
                  padding: "8px 10px",
                  background: activeRunId === r.id ? "rgba(38,38,51,0.06)" : "transparent",
                  borderRadius: 8, cursor: "pointer",
                }}
                onMouseEnter={e => { if (activeRunId !== r.id) e.currentTarget.style.background = "rgba(38,38,51,0.03)"; }}
                onMouseLeave={e => { if (activeRunId !== r.id) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: ok === false ? "#FF3B30" : (ok === true ? "#34C759" : "rgba(38,38,51,0.3)"),
                  }} />
                  <span style={{ fontSize: 12, fontWeight: 510, color: "#262633", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                    {(r.input || "").slice(0, 32) || "—"}
                  </span>
                </div>
                <div style={{ fontSize: 10.5, color: "rgba(38,38,51,0.45)", display: "flex", gap: 6 }}>
                  <span>{new Date(r.startedAt).toLocaleString("ru", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}</span>
                  {r.totalCostUsd > 0 && <span>· ${r.totalCostUsd.toFixed(3)}</span>}
                  {r.judge?.score && <span>· {r.judge.score}/10</span>}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Center — текущий run или новый прогон */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowY: "auto" }}>
        <div style={{ padding: "20px 28px", maxWidth: 800, width: "100%" }}>
          {activeRun ? (
            <RunDetail run={activeRun} prevRun={prevRun} onDelete={async () => {
              await fetch(`/api/mary/sandbox/runs/${activeRun.id}`, { method: "DELETE" });
              setActiveRunId(null); setActiveRun(null); reloadRuns();
            }} />
          ) : (
            <NewRunForm
              input={input} setInput={setInput}
              goldenTests={goldenTests} selectedGoldenId={selectedGoldenId} onPickGolden={onPickGolden}
              judgeOn={judgeOn} setJudgeOn={setJudgeOn}
              running={running} run={run}
              onStop={() => abortRef.current?.abort()}
              liveAgents={liveAgents} judge={judge} judgeRunning={judgeRunning}
            />
          )}
        </div>
      </div>

      {/* Right — чат с Mary */}
      <aside style={{
        width: 360, minWidth: 360,
        borderLeft: "1px solid rgba(38,38,51,0.06)",
        background: color.white,
        display: "flex", flexDirection: "column",
      }}>
        <div style={{
          padding: "14px 18px",
          borderBottom: "1px solid rgba(38,38,51,0.06)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <img src="/icons/mary-puppy.png" alt="" style={{ width: 24, height: 24, objectFit: "contain" }} />
          <span style={{ fontSize: 13.5, fontWeight: 510, color: "#262633" }}>Спроси Mary про прогон</span>
        </div>
        <SandboxChat run={activeRun} liveAgents={liveAgents} deptId={deptId} />
      </aside>
    </div>
  );
}

export function NewRunForm({ input, setInput, goldenTests, selectedGoldenId, onPickGolden, judgeOn, setJudgeOn, running, run, onStop, liveAgents, judge, judgeRunning }) {
  return (
    <>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: "#262633", margin: "0 0 6px" }}>Новый прогон</h2>
      <p style={{ fontSize: 13, color: "rgba(38,38,51,0.6)", margin: "0 0 18px" }}>
        Прогон всех агентов отдела по цепочке. Можно выбрать готовую тему или ввести свою.
      </p>

      {/* Golden tests */}
      {goldenTests.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: "rgba(38,38,51,0.6)", display: "block", marginBottom: 6 }}>
            Готовые тест-кейсы
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {goldenTests.map(t => (
              <button key={t.id}
                onClick={() => onPickGolden(t.id)}
                style={{
                  padding: "6px 11px",
                  background: selectedGoldenId === t.id ? "#262633" : "rgba(38,38,51,0.05)",
                  color: selectedGoldenId === t.id ? color.white : "#262633",
                  border: "none", borderRadius: 7,
                  fontSize: 12, fontWeight: 500,
                  cursor: "pointer", fontFamily: "inherit",
                }}>{t.name}</button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: "rgba(38,38,51,0.6)", display: "block", marginBottom: 6 }}>
          Тема / задача
        </label>
        <textarea
          value={input} onChange={e => setInput(e.target.value)}
          placeholder='Например: "5 привычек продуктивного утра", дружелюбный тон, Instagram'
          rows={3} disabled={running}
          style={{
            width: "100%", boxSizing: "border-box",
            border: "1px solid rgba(38,38,51,0.12)", borderRadius: 8,
            padding: "10px 12px", fontSize: 13, color: "#262633",
            fontFamily: "inherit", resize: "vertical", outline: "none",
          }}
        />
      </div>

      {/* Judge checkbox */}
      <label style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 14, fontSize: 12.5, color: "#262633", cursor: "pointer" }}>
        <input type="checkbox" checked={judgeOn} onChange={e => setJudgeOn(e.target.checked)}
          style={{ width: 14, height: 14, cursor: "pointer" }} />
        Оценить качество через LLM-judge (+токены)
      </label>

      {/* Кнопки */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <button onClick={() => run(true)} disabled={running || !input.trim()}
          style={{
            padding: "9px 16px",
            background: "transparent", border: "1px solid rgba(38,38,51,0.18)", borderRadius: 8,
            fontSize: 13, color: "#262633", fontWeight: 500,
            cursor: running || !input.trim() ? "not-allowed" : "pointer", fontFamily: "inherit",
          }}>Dry-run (mock)</button>
        <button onClick={() => run(false)} disabled={running || !input.trim()}
          style={{
            padding: "9px 16px",
            background: running || !input.trim() ? "rgba(38,38,51,0.3)" : "#262633",
            border: "none", borderRadius: 8,
            fontSize: 13, color: color.white, fontWeight: 500,
            cursor: running || !input.trim() ? "not-allowed" : "pointer", fontFamily: "inherit",
          }}>{running ? "Бежит…" : "Запустить вживую"}</button>
        {running && (
          <button onClick={onStop}
            style={{
              padding: "9px 14px",
              background: "transparent", border: "1px solid rgba(255,59,48,0.3)", borderRadius: 8,
              fontSize: 13, color: "#FF3B30", fontWeight: 500,
              cursor: "pointer", fontFamily: "inherit",
            }}>Остановить</button>
        )}
      </div>

      {/* Live агенты */}
      {liveAgents.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <AgentsLog agents={liveAgents} />
          {judgeRunning && (
            <div style={{ fontSize: 12, color: "rgba(38,38,51,0.6)", padding: "8px 12px", background: "rgba(255,139,61,0.04)", borderRadius: 8, display: "inline-flex", gap: 8, alignItems: "center", width: "fit-content" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF8B3D", animation: "marypulse 1.2s ease-in-out infinite" }} />
              LLM-judge оценивает…
            </div>
          )}
          {judge && <JudgeCard judge={judge} />}
        </div>
      )}
    </>
  );
}

export function AgentsLog({ agents }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
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
              fontSize: 11, fontWeight: 600, color: "rgba(38,38,51,0.7)", flexShrink: 0,
            }}>{i + 1}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#262633", flex: 1 }}>{a.role}</span>
            {a.status === "running" && (
              <span style={{ fontSize: 11, color: "#FF8B3D", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF8B3D", animation: "marypulse 1.2s ease-in-out infinite" }} />
                Работает
              </span>
            )}
            {a.status === "done" && (
              <span style={{ fontSize: 11, color: "rgba(38,38,51,0.55)", display: "inline-flex", alignItems: "center", gap: 8 }}>
                {a.durationMs > 0 && <span>{Math.round(a.durationMs / 100) / 10}с</span>}
                {a.costUsd > 0 && <span>${a.costUsd.toFixed(4)}</span>}
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              </span>
            )}
            {a.status === "error" && <span style={{ fontSize: 11, color: "#FF3B30" }}>Ошибка</span>}
          </div>
          {a.output && (
            <details style={{ marginTop: 8 }}>
              <summary style={{ cursor: "pointer", fontSize: 11.5, color: "rgba(38,38,51,0.55)" }}>Output</summary>
              <div style={{
                marginTop: 6, padding: "8px 10px",
                background: "rgba(38,38,51,0.04)", borderRadius: 6,
                fontSize: 12, color: "rgba(38,38,51,0.8)",
                whiteSpace: "pre-wrap", maxHeight: 200, overflowY: "auto",
              }}>{a.output}</div>
            </details>
          )}
          {a.error && <div style={{ marginTop: 6, fontSize: 12, color: "#FF3B30" }}>{a.error}</div>}
        </div>
      ))}
    </div>
  );
}

export function JudgeCard({ judge }) {
  if (!judge || judge.score === null) return null;
  const goodScore = judge.score >= 7;
  return (
    <div style={{
      border: `1px solid ${goodScore ? "rgba(52,199,89,0.3)" : "rgba(255,139,61,0.3)"}`,
      background: goodScore ? "rgba(52,199,89,0.05)" : "rgba(255,139,61,0.05)",
      borderRadius: 10, padding: "12px 14px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 18, fontWeight: 600, color: goodScore ? "#34C759" : "#FF8B3D" }}>{judge.score}/10</span>
        <span style={{ fontSize: 13, color: "#262633", flex: 1 }}>{judge.verdict}</span>
      </div>
      {judge.strengths?.length > 0 && (
        <div style={{ fontSize: 12, color: "rgba(38,38,51,0.7)", marginTop: 4 }}>
          ✓ {judge.strengths.join(" · ")}
        </div>
      )}
      {judge.issues?.length > 0 && (
        <div style={{ fontSize: 12, color: "#FF3B30", marginTop: 4 }}>
          ⚠ {judge.issues.join(" · ")}
        </div>
      )}
    </div>
  );
}

export function RunDetail({ run, prevRun, onDelete }) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 18 }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#262633", margin: "0 0 4px" }}>
            {run.input?.slice(0, 80) || "Прогон"}
          </h2>
          <div style={{ fontSize: 12, color: "rgba(38,38,51,0.55)", display: "flex", gap: 10 }}>
            <span>{new Date(run.startedAt).toLocaleString("ru")}</span>
            <span>· {Math.round(run.durationMs / 100) / 10}с</span>
            {run.totalTokens > 0 && <span>· {run.totalTokens} токенов</span>}
            {run.totalCostUsd > 0 && <span>· ${run.totalCostUsd.toFixed(4)}</span>}
            {run.dryRun && <span style={{ background: "rgba(38,38,51,0.06)", padding: "1px 6px", borderRadius: 4 }}>dry-run</span>}
          </div>
        </div>
        <button onClick={onDelete} title="Удалить прогон"
          style={{
            background: "transparent", border: "1px solid rgba(38,38,51,0.12)", borderRadius: 7,
            color: "rgba(38,38,51,0.55)", padding: "5px 10px",
            fontSize: 12, cursor: "pointer", fontFamily: "inherit",
          }}>Удалить</button>
      </div>

      {/* Assertions */}
      {run.assertions?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "rgba(38,38,51,0.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
            Проверки
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {run.assertions.map(a => (
              <div key={a.id} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 10px",
                background: a.ok ? "rgba(52,199,89,0.1)" : "rgba(255,59,48,0.1)",
                color: a.ok ? "#34C759" : "#FF3B30",
                borderRadius: 7, fontSize: 12, fontWeight: 500,
              }}>
                {a.ok ? "✓" : "✗"} {a.id} · {a.details}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Judge */}
      {run.judge && <div style={{ marginBottom: 16 }}><JudgeCard judge={run.judge} /></div>}

      {/* Agents */}
      <AgentsLog agents={run.agents || []} />

      {/* Diff vs prev */}
      {prevRun && (
        <details style={{ marginTop: 18, padding: "12px 14px", background: "rgba(38,38,51,0.03)", borderRadius: 10 }}>
          <summary style={{ cursor: "pointer", fontSize: 12.5, color: "#262633", fontWeight: 500 }}>
            Сравнить с предыдущим прогоном ({new Date(prevRun.startedAt).toLocaleString("ru", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })})
          </summary>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8, fontSize: 12, color: "rgba(38,38,51,0.75)" }}>
            <div>Токенов: <b>{run.totalTokens}</b> vs {prevRun.totalTokens} ({run.totalTokens - prevRun.totalTokens > 0 ? "+" : ""}{run.totalTokens - prevRun.totalTokens})</div>
            <div>Цена: <b>${run.totalCostUsd?.toFixed(4)}</b> vs ${prevRun.totalCostUsd?.toFixed(4)}</div>
            {run.judge?.score && prevRun.judge?.score && (
              <div>Judge: <b>{run.judge.score}/10</b> vs {prevRun.judge.score}/10
                {run.judge.score > prevRun.judge.score && <span style={{ color: "#34C759" }}> ↑ лучше</span>}
                {run.judge.score < prevRun.judge.score && <span style={{ color: "#FF3B30" }}> ↓ хуже</span>}
              </div>
            )}
          </div>
        </details>
      )}
    </>
  );
}

export function SandboxChat({ run, liveAgents, deptId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    const msg = text.trim();
    if (!msg || loading) return;
    setText("");
    setMessages(prev => [...prev, { role: "user", text: msg }]);
    setLoading(true);
    // Контекст: текущий run или liveAgents
    const ctx = run
      ? `Текущий sandbox-run отдела ${deptId}:\nВход: ${run.input}\nФинальный output: ${run.finalOutput}\nАгенты: ${(run.agents||[]).map(a => `${a.role}: ${a.output?.slice(0, 200)}`).join("\n")}${run.assertions?.length ? "\nПроверки: " + run.assertions.map(a => `${a.id}=${a.ok?"OK":"FAIL"}`).join(", ") : ""}${run.judge?.score ? `\nJudge: ${run.judge.score}/10 — ${run.judge.verdict}` : ""}`
      : liveAgents.length
        ? `Sandbox идёт прямо сейчас. Агенты: ${liveAgents.map(a => `${a.role} (${a.status})`).join(", ")}`
        : "Sandbox ещё не запускали в этой сессии";
    try {
      const r = await fetch("/api/mary/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `Контекст:\n${ctx}\n\nЮзер спрашивает: ${msg}`, history: [] }),
      });
      const d = await r.json();
      setMessages(prev => [...prev, { role: "mary", text: d.text || "(пусто)" }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "mary", text: "Ошибка: " + e.message }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px" }}>
        {messages.length === 0 && (
          <div style={{ fontSize: 12.5, color: "rgba(38,38,51,0.5)", lineHeight: 1.5 }}>
            Спроси Mary про этот прогон. Например:
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
              {["Почему Копирайтер так написал?", "Сравни с предыдущим прогоном", "Что улучшить в Маркетологе?"].map(s => (
                <button key={s} onClick={() => setText(s)}
                  style={{
                    textAlign: "left", padding: "5px 8px",
                    background: "rgba(38,38,51,0.04)", border: "none", borderRadius: 6,
                    fontSize: 12, color: "#262633", cursor: "pointer", fontFamily: "inherit",
                  }}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{
            marginBottom: 12,
            display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start",
          }}>
            <div style={{
              background: m.role === "user" ? "rgba(38,38,51,0.06)" : "transparent",
              padding: m.role === "user" ? "8px 12px" : 0,
              borderRadius: 12, maxWidth: "85%",
              fontSize: 13, color: "#262633", lineHeight: 1.5, whiteSpace: "pre-wrap",
            }}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ fontSize: 12, color: "rgba(38,38,51,0.5)" }}>Mary думает…</div>
        )}
      </div>
      <div style={{ padding: "10px 14px", borderTop: "1px solid rgba(38,38,51,0.06)" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          border: "1px solid rgba(38,38,51,0.12)", borderRadius: 12, padding: "8px 10px",
        }}>
          <input
            value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") send(); }}
            placeholder="Спросить про прогон"
            disabled={loading}
            style={{
              flex: 1, border: "none", outline: "none",
              background: "transparent", fontSize: 13, color: "#262633",
              fontFamily: "inherit", padding: 0,
            }}
          />
          <button onClick={send} disabled={!text.trim() || loading}
            style={{
              width: 26, height: 26, padding: 0,
              background: text.trim() && !loading ? "#262633" : "rgba(38,38,51,0.3)",
              border: "none", borderRadius: "50%",
              color: color.white, cursor: text.trim() && !loading ? "pointer" : "not-allowed",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontFamily: "inherit",
            }}>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

// ── Общий wrapper для простых страниц ───────────────────

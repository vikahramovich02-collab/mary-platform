import { useState, useEffect } from "react";
import { color } from "../../ui/tokens.js";

export function AgentSettingsView({ profile, agent }) {
  const TOOL_LABELS = {
    "web-search": "Web Search", "knowledge-base": "База знаний", "telegram-parser": "TG-парсер",
    "image-generation": "Image Generation", "crm": "CRM", "email": "Email", "google-sheets": "Google Sheets", "calendar": "Calendar",
  };
  const ALL_TOOLS = Object.keys(TOOL_LABELS);
  const MEMORY_LABELS = { none: "Без памяти", short: "Сессия", long: "Долгосрочная (KB)" };
  const FORMAT_LABELS = { text: "Текст", json: "JSON" };
  const MODELS = [
    "claude-sonnet-4-6", "claude-haiku-4-5", "gpt-4.1", "gpt-4.1-mini", "z-ai/glm-5.1",
  ];

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => ({ ...profile }));
  const [saving, setSaving] = useState(false);

  // Если профиль из props обновляется снаружи (например после reload) — синхронизируем draft когда НЕ в edit-режиме
  useEffect(() => { if (!editing) setDraft({ ...profile }); }, [profile, editing]);

  const startEdit = () => { setDraft({ ...profile }); setEditing(true); };
  const cancelEdit = () => { setDraft({ ...profile }); setEditing(false); };
  const save = async () => {
    setSaving(true);
    try {
      // deptId: пока хардкод smm (drilledAgent живёт в smm-канвасе)
      const deptId = "smm";
      const r = await fetch(`/api/mary/agents/${deptId}/${agent.id}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: draft.model,
          systemPrompt: draft.systemPrompt,
          tools: draft.tools,
          memory: draft.memory,
          responseFormat: draft.responseFormat,
          tasks: draft.tasks,
        }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setEditing(false);
    } catch (e) {
      alert("Не удалось сохранить: " + e.message);
    } finally { setSaving(false); }
  };

  const toggleTool = (t) => {
    setDraft(d => {
      const cur = d.tools || [];
      const next = cur.includes(t) ? cur.filter(x => x !== t) : [...cur, t];
      return { ...d, tools: next };
    });
  };

  return (
    <div style={{ padding: "12px 20px" }}>
      {/* Edit toggle */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: "rgba(38,38,51,0.55)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Должностная инструкция
        </div>
        <div style={{ flex: 1 }} />
        {editing ? (
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={cancelEdit} disabled={saving} style={{
              padding: "5px 12px", fontSize: 12, fontWeight: 500,
              background: "transparent", color: "rgba(38,38,51,0.7)",
              border: "1px solid rgba(38,38,51,0.18)", borderRadius: 7,
              cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit",
            }}>Отмена</button>
            <button onClick={save} disabled={saving} style={{
              padding: "5px 14px", fontSize: 12, fontWeight: 500,
              background: saving ? "rgba(38,38,51,0.3)" : "#262633",
              color: color.white,
              border: "none", borderRadius: 7,
              cursor: saving ? "wait" : "pointer", fontFamily: "inherit",
            }}>{saving ? "Сохраняю…" : "Сохранить"}</button>
          </div>
        ) : (
          <button onClick={startEdit} style={{
            padding: "5px 12px", fontSize: 12, fontWeight: 500,
            background: "transparent", color: "#262633",
            border: "1px solid rgba(38,38,51,0.18)", borderRadius: 7,
            cursor: "pointer", fontFamily: "inherit",
            display: "inline-flex", alignItems: "center", gap: 5,
          }}>
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Изменить
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
        {/* Левая колонка */}
        <div>
          {/* Tasks */}
          {editing ? (
            <textarea
              value={draft.tasks || ""}
              onChange={e => setDraft(d => ({ ...d, tasks: e.target.value }))}
              placeholder="Что агент делает (1-2 предложения)"
              rows={2}
              style={{
                width: "100%", marginBottom: 10,
                padding: "8px 10px",
                background: color.white, border: "1px solid rgba(38,38,51,0.18)", borderRadius: 8,
                fontSize: 12.5, color: "#262633", lineHeight: 1.5,
                resize: "vertical", outline: "none", fontFamily: "inherit",
              }}
            />
          ) : (profile.tasks && (
            <div style={{
              padding: "10px 12px", marginBottom: 10,
              background: color.white, border: "1px solid rgba(38,38,51,0.06)", borderRadius: 8,
              fontSize: 12.5, color: "rgba(38,38,51,0.85)", lineHeight: 1.5,
            }}>{profile.tasks}</div>
          ))}

          <SettingRow label="Model">
            {editing ? (
              <select value={draft.model || ""} onChange={e => setDraft(d => ({ ...d, model: e.target.value }))}
                style={{
                  padding: "3px 8px", borderRadius: 6,
                  background: color.white, border: "1px solid rgba(38,38,51,0.18)",
                  fontSize: 11.5, color: "#262633", fontFamily: "ui-monospace, SF Mono, monospace",
                  cursor: "pointer", outline: "none",
                }}>
                {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            ) : (
              <span style={{
                padding: "2px 8px", borderRadius: 6,
                background: "rgba(122,134,255,0.12)", color: "#5B68E0",
                fontSize: 11.5, fontWeight: 500, fontFamily: "ui-monospace, SF Mono, monospace",
              }}>{profile.model || "—"}</span>
            )}
          </SettingRow>

          <SettingRow label="Memory">
            {editing ? (
              <select value={draft.memory || "short"} onChange={e => setDraft(d => ({ ...d, memory: e.target.value }))}
                style={{
                  padding: "3px 8px", borderRadius: 6,
                  background: color.white, border: "1px solid rgba(38,38,51,0.18)",
                  fontSize: 11.5, color: "#262633", cursor: "pointer", outline: "none", fontFamily: "inherit",
                }}>
                {Object.entries(MEMORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            ) : (
              <span style={{
                padding: "2px 8px", borderRadius: 6,
                background: "rgba(38,38,51,0.05)", color: "rgba(38,38,51,0.75)",
                fontSize: 11.5,
              }}>{MEMORY_LABELS[profile.memory] || profile.memory}</span>
            )}
          </SettingRow>

          <SettingRow label="Response">
            {editing ? (
              <select value={draft.responseFormat || "text"} onChange={e => setDraft(d => ({ ...d, responseFormat: e.target.value }))}
                style={{
                  padding: "3px 8px", borderRadius: 6,
                  background: color.white, border: "1px solid rgba(38,38,51,0.18)",
                  fontSize: 11.5, color: "#262633", cursor: "pointer", outline: "none", fontFamily: "inherit",
                }}>
                {Object.entries(FORMAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            ) : (
              <span style={{
                padding: "2px 8px", borderRadius: 6,
                background: profile.responseFormat === "json" ? "rgba(255,139,61,0.12)" : "rgba(38,38,51,0.05)",
                color: profile.responseFormat === "json" ? "#D97500" : "rgba(38,38,51,0.75)",
                fontSize: 11.5, fontWeight: 500,
              }}>{FORMAT_LABELS[profile.responseFormat] || profile.responseFormat}</span>
            )}
          </SettingRow>

          <SettingRow label="Tools">
            {editing ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {ALL_TOOLS.map(t => {
                  const checked = (draft.tools || []).includes(t);
                  return (
                    <button key={t} onClick={() => toggleTool(t)}
                      style={{
                        padding: "2px 8px", borderRadius: 999,
                        background: checked ? "#262633" : "transparent",
                        color: checked ? color.white : "rgba(38,38,51,0.7)",
                        border: checked ? "none" : "1px solid rgba(38,38,51,0.18)",
                        fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                      }}>{TOOL_LABELS[t]}</button>
                  );
                })}
              </div>
            ) : (
              (profile.tools && profile.tools.length > 0) ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {profile.tools.map(t => (
                    <span key={t} style={{
                      padding: "2px 8px", borderRadius: 999,
                      background: "rgba(38,38,51,0.06)", color: "#262633",
                      fontSize: 11, fontWeight: 500,
                    }}>{TOOL_LABELS[t] || t}</span>
                  ))}
                </div>
              ) : <span style={{ color: "rgba(38,38,51,0.4)", fontSize: 11.5 }}>—</span>
            )}
          </SettingRow>
        </div>

        {/* Правая колонка — system prompt */}
        <div>
          <div style={{ fontSize: 11, color: "rgba(38,38,51,0.5)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            System Prompt
          </div>
          {editing ? (
            <textarea
              value={draft.systemPrompt || ""}
              onChange={e => setDraft(d => ({ ...d, systemPrompt: e.target.value }))}
              placeholder="Кто агент, что делает, в каком формате на выходе…"
              style={{
                width: "100%", height: 200,
                padding: "10px 12px",
                background: color.white, border: "1px solid rgba(38,38,51,0.18)", borderRadius: 8,
                fontSize: 12.5, color: "#262633", lineHeight: 1.55,
                resize: "vertical", outline: "none", fontFamily: "inherit",
              }}
            />
          ) : (
            <div style={{
              padding: "10px 12px",
              background: color.white, border: "1px solid rgba(38,38,51,0.06)", borderRadius: 8,
              fontSize: 12.5, color: "#262633", lineHeight: 1.55,
              maxHeight: 220, overflowY: "auto", whiteSpace: "pre-wrap",
            }}>
              {profile.systemPrompt || <span style={{ color: "rgba(38,38,51,0.4)" }}>не указан</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SettingRow({ label, children }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "baseline", padding: "6px 0", borderTop: "1px solid rgba(38,38,51,0.04)" }}>
      <div style={{ width: 80, flexShrink: 0, fontSize: 11.5, color: "rgba(38,38,51,0.5)", fontWeight: 500 }}>{label}</div>
      <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: "#262633" }}>{children}</div>
    </div>
  );
}


// «Должностная инструкция» агента — карточка под шапкой drill-in
export function AgentJobDescription({ agent, profile }) {
  const [expanded, setExpanded] = useState(true);
  const TOOL_LABELS = {
    "web-search": "Web Search",
    "knowledge-base": "База знаний",
    "telegram-parser": "TG-парсер",
    "image-generation": "Image Generation",
    "crm": "CRM",
    "email": "Email",
    "google-sheets": "Google Sheets",
    "calendar": "Calendar",
  };
  const MEMORY_LABELS = { none: "Без памяти", short: "Сессия", long: "Долгосрочная (KB)" };
  const FORMAT_LABELS = { text: "Текст", json: "JSON" };
  const field = (label, value) => (
    <div style={{ display: "flex", gap: 14, alignItems: "baseline", padding: "8px 0", borderTop: "1px solid rgba(38,38,51,0.05)" }}>
      <div style={{ width: 130, flexShrink: 0, fontSize: 11.5, color: "rgba(38,38,51,0.5)", fontWeight: 500 }}>{label}</div>
      <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: "#262633" }}>{value}</div>
    </div>
  );
  return (
    <div style={{
      margin: "14px 20px 0",
      background: color.white,
      border: "1px solid rgba(38,38,51,0.08)",
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(38,38,51,0.03)",
    }}>
      <button onClick={() => setExpanded(e => !e)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px",
          background: "transparent", border: "none", cursor: "pointer",
          fontFamily: "inherit", textAlign: "left",
        }}>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={agent.color || "#262633"} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="13" y2="17" />
        </svg>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: "#262633" }}>Должностная инструкция</span>
        <span style={{ fontSize: 11.5, color: "rgba(38,38,51,0.45)" }}>· {profile.role || agent.role}</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: "rgba(38,38,51,0.5)" }}>{expanded ? "Свернуть" : "Развернуть"}</span>
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="rgba(38,38,51,0.5)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {expanded && (
        <div style={{ padding: "0 16px 14px" }}>
          {profile.tasks && (
            <div style={{
              padding: "10px 12px", marginBottom: 8,
              background: "rgba(38,38,51,0.03)", borderRadius: 8,
              fontSize: 12.5, color: "rgba(38,38,51,0.85)", lineHeight: 1.5,
            }}>{profile.tasks}</div>
          )}

          {field("Model",
            <span style={{
              display: "inline-block",
              padding: "2px 8px", borderRadius: 6,
              background: "rgba(122,134,255,0.12)", color: "#5B68E0",
              fontSize: 11.5, fontWeight: 500, fontFamily: "ui-monospace, SF Mono, monospace",
            }}>{profile.model}</span>
          )}

          {field("System Prompt",
            profile.systemPrompt
              ? (
                <details style={{ fontSize: 12.5, color: "rgba(38,38,51,0.85)" }}>
                  <summary style={{ cursor: "pointer", color: "#262633" }}>
                    {profile.systemPrompt.slice(0, 90)}{profile.systemPrompt.length > 90 ? "…" : ""}
                  </summary>
                  <div style={{
                    marginTop: 8, padding: "10px 12px",
                    background: "rgba(38,38,51,0.03)", borderRadius: 8,
                    fontSize: 12.5, lineHeight: 1.55, whiteSpace: "pre-wrap",
                  }}>{profile.systemPrompt}</div>
                </details>
              )
              : <span style={{ color: "rgba(38,38,51,0.4)" }}>не указан</span>
          )}

          {field("Tools",
            (profile.tools && profile.tools.length > 0)
              ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {profile.tools.map(t => (
                    <span key={t} style={{
                      padding: "2px 8px", borderRadius: 999,
                      background: "rgba(38,38,51,0.06)", color: "#262633",
                      fontSize: 11, fontWeight: 500,
                    }}>{TOOL_LABELS[t] || t}</span>
                  ))}
                </div>
              )
              : <span style={{ color: "rgba(38,38,51,0.4)" }}>—</span>
          )}

          {field("Memory",
            <span style={{
              padding: "2px 8px", borderRadius: 6,
              background: "rgba(38,38,51,0.05)", color: "rgba(38,38,51,0.75)",
              fontSize: 11.5,
            }}>{MEMORY_LABELS[profile.memory] || profile.memory}</span>
          )}

          {field("Response Format",
            <span style={{
              padding: "2px 8px", borderRadius: 6,
              background: profile.responseFormat === "json" ? "rgba(255,139,61,0.12)" : "rgba(38,38,51,0.05)",
              color: profile.responseFormat === "json" ? "#D97500" : "rgba(38,38,51,0.75)",
              fontSize: 11.5, fontWeight: 500,
            }}>{FORMAT_LABELS[profile.responseFormat] || profile.responseFormat}</span>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { color, transition } from "../../ui/tokens.js";
import { ic } from "../icons.jsx";
import { zoomBtn } from "../chat-panel.jsx";
import { AGENTS } from "../agents-config.js";
import { usePeople, MOCK_PEOPLE } from "../people.js";
import { KbPopup, AddKbPopup, TextViewerPopup, UserItemThumb, UserItemKindBadge, KIND_META } from "./kb-content.jsx";
import { DocView } from "../chat-mary-activity.jsx";

// Расширение файла из общего хранилища БЗ → категория-папка
function kbFileKind(name = "") {
  const ext = (name.split(".").pop() || "").toLowerCase();
  if (/^(png|jpe?g|gif|webp|svg|heic)$/.test(ext)) return "image";
  if (/^(mp4|mov|webm|mkv)$/.test(ext))            return "video";
  if (/^(mp3|wav|m4a|ogg)$/.test(ext))             return "audio";
  if (/^(md|txt)$/.test(ext))                      return "text";
  return "file"; // pdf, doc(x), xls(x), csv и пр.
}

const drawerRow = {
  display: "flex", alignItems: "center", gap: 10,
  padding: "10px 12px",
  borderRadius: 10,
  background: "rgba(38,38,51,0.025)",
};

const iconSquareBtn = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  width: 28, height: 28,
  background: "rgba(38,38,51,0.04)",
  border: "1px solid rgba(38,38,51,0.06)",
  borderRadius: 7,
  cursor: "pointer", color: "rgba(38,38,51,0.6)",
  fontFamily: "inherit",
};

const statBox = {
  background: "rgba(38,38,51,0.04)",
  borderRadius: 10,
  padding: "10px 12px",
};

export function AgentsContent({ selected, onSelect }) {
  const setSelected = onSelect;
  const agent = selected ? AGENTS.find(a => a.id === selected) : null;

  if (agent) return <AgentDetail a={agent} onBack={() => setSelected(null)} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {AGENTS.map(a => (
        <div key={a.id} style={{ ...drawerRow, cursor: "pointer" }} onClick={() => setSelected(a.id)}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: a.color + "26",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: a.color, flexShrink: 0,
          }}>
            <svg width={20} height={20} viewBox="0 0 24 24">
              <rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor" />
              <rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor" />
              <circle cx="9.3" cy="13" r="1.4" fill="white" />
              <circle cx="14.7" cy="13" r="1.4" fill="white" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 510, color: "#262633" }}>{a.label}</div>
            <div style={{ fontSize: 12, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>Агент</div>
          </div>
          {a.hasUpdate && (
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#FF8B3D", flexShrink: 0,
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

export function AgentDetail({ a, onBack }) {
  const [chatHistory, setChatHistory] = useState(true);
  const [showInChat, setShowInChat] = useState(true);
  const [showSources, setShowSources] = useState(true);
  const [continueOnError, setContinueOnError] = useState(false);
  const [writeHistory, setWriteHistory] = useState(true);

  const [profile, setProfile] = useState({
    model: a.model || "claude-sonnet-4-6",
    systemPrompt: "",
    tools: a.tools || [],
    responseFormat: "text",
    memory: "short",
  });
  const [savedAt, setSavedAt] = useState(null);
  const [reasoning, setReasoning] = useState(() => localStorage.getItem(`agent-${a.id}-reasoning`) || "medium");
  const [verbosity, setVerbosity] = useState(() => localStorage.getItem(`agent-${a.id}-verbosity`) || "medium");
  const [summary, setSummary] = useState(() => localStorage.getItem(`agent-${a.id}-summary`) || "auto");

  useEffect(() => {
    fetch("/api/mary/departments").then(r => r.json()).then(d => {
      const smm = (d.departments || []).find(x => x.id === "smm");
      const found = smm?.agents?.find(x => x.id === a.id);
      if (!found) return;
      setProfile({
        model: found.model || "claude-sonnet-4-6",
        systemPrompt: found.systemPrompt || "",
        tools: found.tools || [],
        responseFormat: found.responseFormat || "text",
        memory: found.memory || "short",
      });
    }).catch(() => {});
  }, [a.id]);

  const saveTimer = useRef(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await fetch(`/api/mary/agents/smm/${a.id}/profile`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile),
        });
        setSavedAt(Date.now());
      } catch {}
    }, 400);
    return () => clearTimeout(saveTimer.current);
  }, [profile, a.id]);

  useEffect(() => { localStorage.setItem(`agent-${a.id}-reasoning`, reasoning); }, [reasoning, a.id]);
  useEffect(() => { localStorage.setItem(`agent-${a.id}-verbosity`, verbosity); }, [verbosity, a.id]);
  useEffect(() => { localStorage.setItem(`agent-${a.id}-summary`, summary); }, [summary, a.id]);

  const MODELS = ["claude-sonnet-4-6", "claude-haiku-4-5", "gpt-4.1", "gpt-4.1-mini", "z-ai/glm-5.1"];
  const ALL_TOOLS = ["web-search", "knowledge-base", "telegram-parser", "image-generation", "crm", "email", "google-sheets", "calendar"];
  const TOOL_LABELS = {
    "web-search": "Web Search", "knowledge-base": "База знаний", "telegram-parser": "TG-парсер",
    "image-generation": "Image Gen", "crm": "CRM", "email": "Email", "google-sheets": "Sheets", "calendar": "Calendar",
  };
  const toggleTool = (t) => setProfile(p => ({
    ...p, tools: p.tools.includes(t) ? p.tools.filter(x => x !== t) : [...p.tools, t],
  }));

  return (
    <div style={{ margin: -16 }}>
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 12,
        padding: "16px 18px",
        borderBottom: "1px solid rgba(38,38,51,0.06)",
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: a.color + "26",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: a.color, flexShrink: 0,
        }}>
          <svg width={26} height={26} viewBox="0 0 24 24">
            <rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor" />
            <rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor" />
            <circle cx="9.3" cy="13" r="1.4" fill="white" />
            <circle cx="14.7" cy="13" r="1.4" fill="white" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#262633" }}>{a.label} Mary</div>
          <div style={{ fontSize: 11.5, color: a.color, fontWeight: 500, marginTop: 1 }}>AI Агент</div>
        </div>
        <button onClick={onBack} style={iconSquareBtn}>{ic.close}</button>
      </div>

      <div style={{
        padding: "12px 18px",
        fontSize: 12, color: "rgba(38,38,51,0.6)",
        lineHeight: 1.4,
        borderBottom: "1px solid rgba(38,38,51,0.06)",
      }}>
        {a.role}
      </div>

      <div style={{ padding: "14px 18px 96px", display: "flex", flexDirection: "column", gap: 12 }}>
        <FormField label="Имя">
          <FormInput value={a.label + " Mary"} />
        </FormField>

        <FormField
          label="Скиллы"
          actions={[<button key="p" style={iconSquareBtn}>{ic.plus}</button>]}
        >
          <div style={{
            background: color.white,
            border: "1px solid rgba(38,38,51,0.1)",
            borderRadius: 10,
            padding: "10px 12px",
            display: "flex", flexDirection: "column", gap: 6,
          }}>
            {a.skills.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{
                  display: "inline-block", width: 4, height: 4, borderRadius: "50%",
                  background: "#262633", marginTop: 6, flexShrink: 0,
                }} />
                <span style={{ fontSize: 12, color: "#262633", lineHeight: 1.4 }}>{s}</span>
              </div>
            ))}
          </div>
        </FormField>

        <FormRow label="История чата">
          <Toggle on={chatHistory} onClick={() => setChatHistory(v => !v)} />
        </FormRow>

        <FormRow label="Модель">
          <RealSelect value={profile.model} onChange={v => setProfile(p => ({ ...p, model: v }))} options={MODELS} />
        </FormRow>

        <FormRow label="Уровень рассуждений">
          <RealSelect value={reasoning} onChange={setReasoning}
            options={["low", "medium", "high"]} labels={{ low: "Низкий", medium: "Средний", high: "Высокий" }} />
        </FormRow>

        <FormField label="Системный промпт">
          <textarea
            value={profile.systemPrompt}
            onChange={e => setProfile(p => ({ ...p, systemPrompt: e.target.value }))}
            placeholder="Кто агент, что делает, в каком формате на выходе…"
            style={{
              width: "100%", minHeight: 80, maxHeight: 240,
              padding: "10px 12px",
              background: color.white, border: "1px solid rgba(38,38,51,0.12)", borderRadius: 10,
              fontSize: 12.5, color: "#262633", lineHeight: 1.5,
              resize: "vertical", outline: "none", fontFamily: "inherit",
            }}
          />
        </FormField>

        <FormField label="Инструменты">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {ALL_TOOLS.map(t => {
              const on = profile.tools.includes(t);
              return (
                <button key={t} onClick={() => toggleTool(t)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: on ? "none" : "1px solid rgba(38,38,51,0.1)",
                    background: on ? "#262633" : color.white,
                    color: on ? color.white : "#262633",
                    fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                  }}>{TOOL_LABELS[t]}</button>
              );
            })}
          </div>
        </FormField>

        <FormRow label="Формат ответа">
          <RealSelect value={profile.responseFormat} onChange={v => setProfile(p => ({ ...p, responseFormat: v }))}
            options={["text", "json"]} labels={{ text: "Текст", json: "JSON" }} />
        </FormRow>

        <FormRow label="Память">
          <RealSelect value={profile.memory} onChange={v => setProfile(p => ({ ...p, memory: v }))}
            options={["none", "short", "long"]} labels={{ none: "Без памяти", short: "Сессия", long: "Долгосрочная" }} />
        </FormRow>

        <SectionDivider label="Параметры модели" />
        <FormRow label="Подробность">
          <RealSelect value={verbosity} onChange={setVerbosity}
            options={["short", "medium", "detailed"]} labels={{ short: "Кратко", medium: "Средне", detailed: "Подробно" }} />
        </FormRow>
        <FormRow label="Резюме">
          <RealSelect value={summary} onChange={setSummary}
            options={["off", "auto", "always"]} labels={{ off: "Выкл", auto: "Авто", always: "Всегда" }} />
        </FormRow>

        <SectionDivider label="Чат" />
        <FormRow label="Показывать ответ в чате">
          <Toggle on={showInChat} onClick={() => setShowInChat(v => !v)} />
        </FormRow>
        <FormRow label="Показывать источники">
          <Toggle on={showSources} onClick={() => setShowSources(v => !v)} />
        </FormRow>

        <SectionDivider label="Дополнительно" />
        <FormRow label="Продолжать при ошибке">
          <Toggle on={continueOnError} onClick={() => setContinueOnError(v => !v)} />
        </FormRow>
        <FormRow label="Писать в историю чата">
          <Toggle on={writeHistory} onClick={() => setWriteHistory(v => !v)} />
        </FormRow>

        <SectionDivider label="Сегодня" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div style={statBox}>
            <div style={{ fontSize: 10.5, color: "rgba(38,38,51,0.55)" }}>Запусков</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#262633", marginTop: 2 }}>{a.runs}</div>
          </div>
          <div style={statBox}>
            <div style={{ fontSize: 10.5, color: "rgba(38,38,51,0.55)" }}>Стоимость</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#262633", marginTop: 2 }}>{a.cost}</div>
          </div>
        </div>
      </div>

      <div style={{
        position: "sticky", bottom: 0,
        background: color.white,
        borderTop: "1px solid rgba(38,38,51,0.08)",
        padding: "10px 14px",
        display: "flex", alignItems: "center", gap: 8,
        boxShadow: "0 -4px 12px rgba(38,38,51,0.04)",
      }}>
        {savedAt && (Date.now() - savedAt < 3000) && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 11, color: "#34C759", fontWeight: 500,
          }}>
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5L20 7" />
            </svg>
            Сохранено
          </span>
        )}
        <button style={{
          flex: 1, height: 36,
          background: "#262633", color: color.white,
          border: "none", borderRadius: 9,
          fontSize: 13, fontWeight: 500,
          cursor: "pointer", fontFamily: "inherit",
        }}>
          Открыть в чате
        </button>
        <button style={{
          height: 36, padding: "0 14px",
          background: color.white, color: "#262633",
          border: "1px solid rgba(38,38,51,0.12)",
          borderRadius: 9,
          fontSize: 13, fontWeight: 500,
          cursor: "pointer", fontFamily: "inherit",
        }}>
          Запустить
        </button>
        <button title="Удалить агента" style={{
          height: 36, width: 36,
          background: color.white, color: "#FF3407",
          border: "1px solid rgba(255,52,7,0.2)",
          borderRadius: 9,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", fontFamily: "inherit",
        }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function TabSectionLabel({ icon, children }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "0 4px 10px",
      fontSize: 11, fontWeight: 600, color: "rgba(38,38,51,0.55)",
      textTransform: "uppercase", letterSpacing: "0.04em",
    }}>
      {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
      <span>{children}</span>
    </div>
  );
}

function KBTab({ a }) {
  const inputs  = a.kb?.inputs  || [];
  const outputs = a.kb?.outputs || [];
  return (
    <div style={{ padding: "16px 18px 96px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <TabSectionLabel icon="📥">Что мы скормили</TabSectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {inputs.map((it, i) => (
            <div key={i} style={drawerRow}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 450, color: "#262633" }}>{it.title}</div>
                <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>{it.count} элементов</div>
              </div>
              <button style={iconSquareBtn}>{ic.plus}</button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <TabSectionLabel icon="📤">Что нам выдали</TabSectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {outputs.map((it, i) => (
            <div key={i} style={{ ...drawerRow, background: "rgba(122,134,255,0.06)" }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "rgba(122,134,255,0.18)", color: "#7A86FF",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, fontSize: 16,
              }}>📦</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 450, color: "#262633" }}>{it.title}</div>
                <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>{it.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TasksTab({ a }) {
  const tasks = a.tasks || [];
  return (
    <div style={{ padding: "16px 18px 96px", display: "flex", flexDirection: "column", gap: 8 }}>
      {tasks.map((t, i) => (
        <div key={i} style={{
          background: color.white,
          border: "1px solid rgba(38,38,51,0.08)",
          borderRadius: 12,
          padding: "12px 14px",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#34C759", marginTop: 5, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#262633" }}>{t.title}</div>
              <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>{t.desc}</div>
            </div>
            {t.cron && (
              <span style={{
                fontSize: 10.5, color: "rgba(38,38,51,0.55)",
                fontFamily: "ui-monospace, SF Mono, monospace",
                whiteSpace: "nowrap",
              }}>{t.cron}</span>
            )}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, marginLeft: 15 }}>
            <span style={pillTool}><PillIcon color="#3F95FF" kind="bot" />{t.tool}</span>
            <span style={pillKb}><PillIcon color="#7A86FF" kind="kb" />{t.out} →</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function AgentIntegrationsTab({ a }) {
  const ints = a.integrations || [];
  return (
    <div style={{ padding: "16px 18px 96px", display: "flex", flexDirection: "column", gap: 6 }}>
      {ints.map((it, i) => (
        <div key={i} style={drawerRow}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "rgba(38,38,51,0.04)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(38,38,51,0.6)", flexShrink: 0,
          }}>
            {ic.integrations}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 510, color: "#262633" }}>{it.name}</div>
            <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>{it.desc}</div>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 500,
            color: it.on ? "#34C759" : "rgba(38,38,51,0.45)",
            background: it.on ? "rgba(52,199,89,0.1)" : "rgba(38,38,51,0.05)",
            padding: "3px 8px", borderRadius: 999,
          }}>{it.on ? "Активна" : "Выкл"}</span>
        </div>
      ))}
    </div>
  );
}

function AgentChatTab({ a }) {
  return (
    <div style={{ padding: "24px 18px 96px", textAlign: "center" }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: a.color + "26", color: a.color,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        marginBottom: 14,
      }}>
        <svg width={32} height={32} viewBox="0 0 24 24">
          <rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor" />
          <rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor" />
          <circle cx="9.3" cy="13" r="1.4" fill="white" />
          <circle cx="14.7" cy="13" r="1.4" fill="white" />
        </svg>
      </div>
      <div style={{ fontSize: 14, fontWeight: 510, color: "#262633" }}>
        Открыть чат с агентом
      </div>
      <div style={{ fontSize: 12, color: "rgba(38,38,51,0.55)", marginTop: 4, lineHeight: 1.4 }}>
        Откроется общий чат отдела с автофильтром на «{a.label}»
      </div>
    </div>
  );
}

const pillTool = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "3px 9px 3px 3px", borderRadius: 999,
  background: "rgba(63,149,255,0.1)", color: "#3F95FF",
  fontSize: 11.5, fontWeight: 500,
};
const pillKb = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "3px 9px 3px 3px", borderRadius: 999,
  background: "rgba(122,134,255,0.1)", color: "#7A86FF",
  fontSize: 11.5, fontWeight: 500,
};
function PillIcon({ color, kind }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 18, height: 18, borderRadius: 5,
      background: color + "26",
      color,
      flexShrink: 0,
    }}>
      {kind === "bot" ? (
        <svg width={11} height={11} viewBox="0 0 24 24">
          <rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor" />
          <rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor" />
          <circle cx="9.3" cy="13" r="1.4" fill="white" />
          <circle cx="14.7" cy="13" r="1.4" fill="white" />
        </svg>
      ) : (
        <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      )}
    </span>
  );
}

function FormField({ label, actions, children }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "#262633", flex: 1 }}>{label}</span>
        {actions}
      </div>
      {children}
    </div>
  );
}
function FormRow({ label, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: "#262633", flex: 1 }}>{label}</span>
      {children}
    </div>
  );
}
function FormInput({ value }) {
  return (
    <input
      defaultValue={value}
      style={{
        width: "100%",
        height: 32,
        padding: "0 10px",
        background: color.white,
        border: "1px solid rgba(38,38,51,0.1)",
        borderRadius: 8,
        fontSize: 12, color: "#262633",
        fontFamily: "inherit", outline: "none",
      }}
    />
  );
}
function RealSelect({ value, onChange, options, labels }) {
  return (
    <select value={value} onChange={e => onChange?.(e.target.value)}
      style={{
        height: 28, padding: "0 24px 0 10px",
        background: color.white,
        border: "1px solid rgba(38,38,51,0.1)",
        borderRadius: 7,
        fontSize: 12, color: "#262633",
        fontFamily: "inherit", cursor: "pointer",
        outline: "none",
        appearance: "none",
        backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='rgba(38,38,51,0.5)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 8px center",
      }}>
      {(options || []).map(o => <option key={o} value={o}>{labels?.[o] || o}</option>)}
    </select>
  );
}
function Toggle({ on, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 32, height: 19, borderRadius: 999, border: "none",
        background: on ? "#262633" : "rgba(38,38,51,0.2)",
        cursor: "pointer", padding: 0,
        position: "relative", transition: transition.fast,
        flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute", top: 2, left: on ? 15 : 2,
        width: 15, height: 15, borderRadius: "50%",
        background: color.white,
        transition: transition.fast,
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
      }} />
    </button>
  );
}
function SectionDivider({ label }) {
  return (
    <div style={{
      borderTop: "1px solid rgba(38,38,51,0.08)",
      paddingTop: 10,
      fontSize: 11, color: "rgba(38,38,51,0.5)", fontWeight: 500,
    }}>
      {label}
    </div>
  );
}

export function KbPage({ kbUserItems = [], setKbUserItems, onOpenChat }) {
  const [scope, setScope] = useState("smm/tg-kanal");
  const [smmOpen, setSmmOpen] = useState(true);
  const [hrOpen, setHrOpen] = useState(false);
  const [folder, setFolder] = useState("all");
  const [source, setSource] = useState("all");
  const [search, setSearch] = useState("");
  const [opened, setOpened] = useState(null);
  const [textView, setTextView] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [storeFiles, setStoreFiles] = useState([]); // общий бэкенд-стор БЗ (/api/mary/kb/files)
  const [storeDoc, setStoreDoc] = useState(null);    // открытый файл из стора { name, content, loading }

  useEffect(() => {
    fetch("/api/mary/kb/files")
      .then(r => r.json())
      .then(d => setStoreFiles(Array.isArray(d.files) ? d.files : []))
      .catch(() => setStoreFiles([]));
  }, []);

  const openStoreFile = async (name) => {
    setStoreDoc({ name, content: "", loading: true });
    const d = await fetch(`/api/mary/kb/file?name=${encodeURIComponent(name)}`).then(r => r.json()).catch(() => ({}));
    setStoreDoc({ name, content: d.content || "", loading: false });
  };

  const agentItems = AGENTS.flatMap(a => {
    const inputs  = (a.kb?.inputs  || []).map(it => ({ ...it, agent: a, source: "input"  }));
    const outputs = (a.kb?.outputs || []).map(it => ({ ...it, agent: a, source: "output" }));
    return [...inputs, ...outputs];
  });
  const userItems = kbUserItems.map(it => ({ ...it, source: "user" }));
  const storeItems = storeFiles.map(f => ({
    name: f.name,
    kind: kbFileKind(f.name),
    source: "user",
    store: true,
    meta: (f.name.split(".").pop() || "файл").toUpperCase(),
  }));
  const all = [...storeItems, ...userItems, ...agentItems];

  function matchScope(it) {
    if (it.store)                 return true; // общий стор БЗ виден в любом отделе
    if (scope === "company")      return true;
    if (scope === "smm")          return true;
    if (scope === "smm/tg-kanal") return true;
    if (scope === "smm/inst")     return false;
    if (scope === "hr")           return false;
    return true;
  }
  function matchSource(it) {
    if (source === "all")    return true;
    if (source === "user")   return it.source === "user";
    if (source === "agents") return it.source !== "user";
    return true;
  }
  function matchFolder(it) {
    if (folder === "all")     return true;
    if (folder === "image")   return it.kind === "image";
    if (folder === "file")    return it.kind === "file" || (!it.kind && /\.(pdf|docx?|xlsx?|csv)$/i.test(it.name || ""));
    if (folder === "link")    return it.kind === "link";
    if (folder === "text")    return it.kind === "text";
    if (folder === "video")   return it.kind === "video";
    if (folder === "audio")   return it.kind === "audio";
    return true;
  }

  const filtered = all.filter(it => {
    if (!matchScope(it)) return false;
    if (!matchSource(it)) return false;
    if (!matchFolder(it)) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const name = (it.name || it.title || "").toLowerCase();
      if (!name.includes(q)) return false;
    }
    return true;
  });

  const scoped = all.filter(matchScope);
  const counts = {
    all:    scoped.length,
    user:   scoped.filter(it => it.source === "user").length,
    agents: scoped.filter(it => it.source !== "user").length,
  };
  const scopedAndSourced = scoped.filter(matchSource);
  const folderCounts = {
    all:    scopedAndSourced.length,
    image:  scopedAndSourced.filter(it => it.kind === "image").length,
    file:   scopedAndSourced.filter(it => it.kind === "file").length,
    link:   scopedAndSourced.filter(it => it.kind === "link").length,
    text:   scopedAndSourced.filter(it => it.kind === "text").length,
    video:  scopedAndSourced.filter(it => it.kind === "video").length,
    audio:  scopedAndSourced.filter(it => it.kind === "audio").length,
  };
  const folderRows = [
    { id: "all",   label: "Все материалы", icon: ic.kb,       count: folderCounts.all },
    { id: "image", label: "Фото",          icon: ic.image,    count: folderCounts.image },
    { id: "file",  label: "Файлы",         icon: ic.file,     count: folderCounts.file },
    { id: "link",  label: "Ссылки",        icon: ic.link,     count: folderCounts.link },
    { id: "text",  label: "Тексты",        icon: ic.text,     count: folderCounts.text },
    { id: "video", label: "Видео",         icon: ic.mediaPic, count: folderCounts.video, dim: folderCounts.video === 0 },
    { id: "audio", label: "Аудио",         icon: ic.mic,      count: folderCounts.audio, dim: folderCounts.audio === 0 },
  ];

  function addUserItem(it) {
    setKbUserItems(prev => [it, ...prev]);
  }

  const scopeLabel =
    scope === "company"      ? "Все материалы компании" :
    scope === "smm"          ? "СММ-отдел" :
    scope === "smm/tg-kanal" ? "Тг-канал" :
    scope === "smm/inst"     ? "Инст" :
    scope === "hr"           ? "HR-отдел" :
    "Материалы";

  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
      <aside style={{
        width: 240, minWidth: 240,
        borderRight: "1px solid rgba(38,38,51,0.06)",
        background: color.white,
        padding: "20px 12px",
        display: "flex", flexDirection: "column",
        gap: 2,
      }}>
        <div style={{ padding: "0 8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#262633" }}>База знаний</span>
          <button
            onClick={() => setAddOpen(true)}
            title="Добавить"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 26, height: 26,
              background: "rgba(38,38,51,0.05)",
              color: "rgba(38,38,51,0.6)",
              border: "none", borderRadius: 8,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >{ic.plus}</button>
        </div>
        <KbTreeRow
          icon={ic.kb}
          label="Компания"
          active={scope === "company"}
          onClick={() => setScope("company")}
          weight={500}
        />
        <KbTreeRow
          icon={<span style={{ display: "flex", color: "#262633" }}>{ic.dept}</span>}
          label="СММ-отдел"
          indent={14}
          active={scope === "smm"}
          onClick={() => setScope("smm")}
          trailing={
            <button
              onClick={(e) => { e.stopPropagation(); setSmmOpen(v => !v); }}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 18, height: 18, background: "transparent", border: "none",
                cursor: "pointer", color: "rgba(38,38,51,0.55)",
              }}
            >{smmOpen ? ic.chevronUp : ic.chevron}</button>
          }
        />
        {smmOpen && (
          <>
            <KbTreeRow
              label="Тг-канал"
              indent={36}
              active={scope === "smm/tg-kanal"}
              onClick={() => setScope("smm/tg-kanal")}
            />
            <KbTreeRow
              label="Инстаграм"
              indent={36}
              dim
              active={scope === "smm/inst"}
              onClick={() => setScope("smm/inst")}
            />
          </>
        )}
        <KbTreeRow
          icon={<span style={{ display: "flex", color: "#262633" }}>{ic.hr}</span>}
          label="HR-отдел"
          indent={14}
          active={scope === "hr"}
          onClick={() => setScope("hr")}
          trailing={
            <button
              onClick={(e) => { e.stopPropagation(); setHrOpen(v => !v); }}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 18, height: 18, background: "transparent", border: "none",
                cursor: "pointer", color: "rgba(38,38,51,0.55)",
              }}
            >{hrOpen ? ic.chevronUp : ic.chevron}</button>
          }
        />
        {hrOpen && (
          <KbTreeRow label="(пусто)" indent={36} dim />
        )}

        <div style={{ height: 1, background: "rgba(38,38,51,0.06)", margin: "12px 8px 8px" }} />
        {folderRows.map(f => (
          <KbTreeRow
            key={f.id}
            icon={f.icon}
            label={f.label}
            active={folder === f.id}
            dim={f.dim}
            onClick={() => setFolder(f.id)}
            trailing={
              <span style={{ fontSize: 11.5, color: "rgba(38,38,51,0.45)" }}>{f.count}</span>
            }
          />
        ))}
      </aside>

      <div style={{ flex: 1, minWidth: 0, padding: "20px 24px", overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 22, fontWeight: 600, color: "#262633" }}>
            {scopeLabel}
          </div>
          <span style={{ fontSize: 13, color: "rgba(38,38,51,0.5)" }}>· {filtered.length}</span>
          <div style={{ flex: 1 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по материалам…"
            style={{
              width: 280,
              padding: "8px 12px",
              background: "rgba(38,38,51,0.04)",
              border: "none",
              borderRadius: 999,
              fontSize: 13, color: "#262633",
              fontFamily: "inherit", outline: "none",
            }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 18 }}>
          {[
            { id: "all",    label: "Все",        n: counts.all },
            { id: "user",   label: "От меня",    n: counts.user },
            { id: "agents", label: "От агентов", n: counts.agents },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setSource(s.id)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 12px",
                background: source === s.id ? "#262633" : "rgba(38,38,51,0.05)",
                color: source === s.id ? color.white : "#262633",
                border: "none", borderRadius: 999,
                fontSize: 12.5, fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <span>{s.label}</span>
              <span style={{
                fontSize: 11,
                color: source === s.id ? "rgba(255,255,255,0.6)" : "rgba(38,38,51,0.45)",
              }}>{s.n}</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{
            padding: "60px 20px", textAlign: "center",
            color: "rgba(38,38,51,0.5)", fontSize: 14,
          }}>
            В этой папке пока пусто
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 8,
          }}>
            {filtered.map((it, i) => (
              <KbCard
                key={`${it.source}-${i}`}
                it={it}
                onOpen={() => {
                  if (it.store) { openStoreFile(it.name); return; }
                  if (it.source === "user") {
                    if (it.kind === "link") { window.open(it.name, "_blank"); return; }
                    if (it.kind === "image" && it.data) { window.open(it.data, "_blank"); return; }
                    if (it.kind === "file"  && it.data) { window.open(it.data, "_blank"); return; }
                    if (it.kind === "text") { setTextView(it); return; }
                    return;
                  }
                  setOpened(it);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onOpenChat}
        style={{
          position: "fixed",
          left: "50%", bottom: 24,
          transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: 10,
          background: color.white,
          border: "1px solid rgba(38,38,51,0.08)",
          borderRadius: 999,
          padding: "10px 18px",
          boxShadow: "0 4px 14px rgba(38,38,51,0.08)",
          fontSize: 14, color: "#262633", fontWeight: 500,
          cursor: "pointer", fontFamily: "inherit",
          zIndex: 5,
        }}
      >
        <span>Спросить у Mary</span>
        <span style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 22, height: 22, borderRadius: 7,
          background: "rgba(255,139,61,0.12)", color: "#FF8B3D",
        }}>{ic.spark}</span>
      </button>

      {opened && <KbPopup item={opened} onClose={() => setOpened(null)} />}
      {textView && <TextViewerPopup item={textView} onClose={() => setTextView(null)} />}
      {addOpen && <AddKbPopup onAdd={addUserItem} onClose={() => setAddOpen(false)} />}
      {storeDoc && (
        <div
          onClick={() => setStoreDoc(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(38,38,51,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100, padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: 760, maxWidth: "100%", height: "82vh",
              background: color.white, borderRadius: 18,
              boxShadow: "0 20px 60px rgba(38,38,51,0.25)",
              display: "flex", flexDirection: "column", overflow: "hidden",
            }}
          >
            <DocView doc={storeDoc} onClose={() => setStoreDoc(null)} />
          </div>
        </div>
      )}
    </div>
  );
}

export function KbTreeRow({ icon, label, indent = 0, active, dim, onClick, trailing, weight = 450 }) {
  const [h, setH] = useState(false);
  const clickable = !!onClick;
  return (
    <div
      onClick={clickable ? onClick : undefined}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: `8px 10px 8px ${10 + indent}px`,
        background: active ? "rgba(38,38,51,0.06)" : h && clickable ? "rgba(38,38,51,0.035)" : "transparent",
        borderRadius: 8,
        cursor: clickable ? "pointer" : "default",
        color: dim ? "rgba(38,38,51,0.4)" : "#262633",
        userSelect: "none",
      }}
    >
      {icon && <span style={{ display: "flex", width: 14, color: "currentColor", flexShrink: 0 }}>{icon}</span>}
      <span style={{ fontSize: 13, fontWeight: weight, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      {trailing}
    </div>
  );
}

export function KbCard({ it, onOpen }) {
  const isUser = it.source === "user";
  const meta = isUser ? (KIND_META[it.kind] || KIND_META.file) : null;
  return (
    <button
      onClick={onOpen}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        width: "100%",
        padding: "12px 14px",
        background: "rgba(38,38,51,0.03)",
        border: "none", borderRadius: 12,
        cursor: "pointer", fontFamily: "inherit", textAlign: "left",
        transition: transition.fast,
      }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(38,38,51,0.05)"}
      onMouseLeave={e => e.currentTarget.style.background = "rgba(38,38,51,0.03)"}
    >
      {isUser ? (
        <UserItemThumb it={it} />
      ) : (
        <div style={{
          width: 36, height: 36, borderRadius: 9,
          background: it.agent.color + "1A",
          color: it.agent.color,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          {it.source === "input" ? ic.inboxArrow : ic.package}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: "#262633", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {it.name || it.title}
        </div>
        <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 3, display: "flex", alignItems: "center", gap: 6 }}>
          {isUser ? (
            <>
              <UserItemKindBadge kind={it.kind} />
              <span>{it.meta}</span>
            </>
          ) : (
            <>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: it.agent.color }} />
              <span>{it.agent.label}</span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}

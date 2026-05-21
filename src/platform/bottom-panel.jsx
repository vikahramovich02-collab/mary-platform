// Логи прогона + Output (JSON-tree) для bottom-panel drill-down агента.
// Извлечено из TgKanalPage.jsx (Phase 2).
import { useState } from "react";
import { color } from "../ui/tokens.js";

export function AgentLogsView({ runs, selectedNodeId, onSelect }) {
  if (!runs || runs.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "rgba(38,38,51,0.5)", fontSize: 12.5 }}>
        Логи появятся после первого запуска. Запусти агента из канваса выше.
      </div>
    );
  }
  return (
    <div style={{ padding: "10px 16px" }}>
      {runs.map(r => (
        <button key={r.nodeId} onClick={() => onSelect(r.nodeId)}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "8px 12px",
            background: selectedNodeId === r.nodeId ? "rgba(38,38,51,0.06)" : "transparent",
            border: "none", borderRadius: 6,
            fontSize: 12.5, color: "#262633", fontFamily: "inherit",
            cursor: "pointer", textAlign: "left",
          }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%",
            background: r.status === "error" ? "#FF3B30" : r.status === "running" ? "#FF8B3D" : "#34C759" }} />
          <span style={{ flex: 1 }}>{r.label}</span>
          <span style={{ fontSize: 11, color: "rgba(38,38,51,0.5)", fontVariantNumeric: "tabular-nums" }}>
            {r.durationMs >= 1000 ? `${(r.durationMs / 1000).toFixed(2)}s` : `${r.durationMs}ms`}
          </span>
        </button>
      ))}
    </div>
  );
}

export function AgentOutputView({ run }) {
  if (!run) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "rgba(38,38,51,0.5)", fontSize: 12.5 }}>
        Выбери строку в Logs чтобы увидеть Output.
      </div>
    );
  }
  return (
    <div style={{ padding: "12px 16px" }}>
      <JsonTreeOrText value={run.output} />
    </div>
  );
}

export function JsonTreeOrText({ value }) {
  let parsed = value;
  if (typeof value === "string") {
    try {
      const t = value.trim();
      if (t.startsWith("{") || t.startsWith("[")) parsed = JSON.parse(t);
    } catch {}
  }
  if (typeof parsed === "object" && parsed !== null) {
    return <JsonTree value={parsed} />;
  }
  return (
    <pre style={{
      margin: 0, padding: "10px 12px",
      background: color.white, border: "1px solid rgba(38,38,51,0.06)", borderRadius: 8,
      fontSize: 12.5, color: "#262633", lineHeight: 1.5,
      whiteSpace: "pre-wrap", fontFamily: "ui-monospace, SF Mono, Menlo, monospace",
    }}>{String(value || "")}</pre>
  );
}

export function JsonTree({ value, name, level = 0 }) {
  const [open, setOpen] = useState(level < 2);
  if (value === null) return <TypedSpan type="null">null</TypedSpan>;
  if (value === undefined) return <TypedSpan type="null">undefined</TypedSpan>;
  if (typeof value === "string") return <TypedSpan type="string">"{value}"</TypedSpan>;
  if (typeof value === "number") return <TypedSpan type="number">{value}</TypedSpan>;
  if (typeof value === "boolean") return <TypedSpan type="boolean">{String(value)}</TypedSpan>;
  if (Array.isArray(value)) {
    return (
      <div style={{ marginLeft: level === 0 ? 0 : 12 }}>
        <button onClick={() => setOpen(!open)} style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "#262633" }}>
          <span style={{ fontSize: 10, color: "rgba(38,38,51,0.5)" }}>{open ? "▾" : "▸"}</span>
          {name && <span style={{ fontWeight: 500 }}>{name}</span>}
          <span style={{ padding: "1px 6px", borderRadius: 4, background: "rgba(122,134,255,0.15)", color: "#5B68E0", fontSize: 10, fontWeight: 500 }}>array</span>
          <span style={{ fontSize: 11, color: "rgba(38,38,51,0.5)" }}>{value.length}</span>
        </button>
        {open && (
          <div>
            {value.map((v, i) => (
              <div key={i} style={{ marginTop: 4, display: "flex", gap: 8, marginLeft: 14 }}>
                <span style={{ color: "rgba(38,38,51,0.4)", fontSize: 11.5, fontVariantNumeric: "tabular-nums" }}>{i}</span>
                <div style={{ flex: 1, minWidth: 0 }}><JsonTree value={v} level={level + 1} /></div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  const keys = Object.keys(value);
  return (
    <div style={{ marginLeft: level === 0 ? 0 : 12 }}>
      <button onClick={() => setOpen(!open)} style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "#262633" }}>
        <span style={{ fontSize: 10, color: "rgba(38,38,51,0.5)" }}>{open ? "▾" : "▸"}</span>
        {name && <span style={{ fontWeight: 500 }}>{name}</span>}
        <span style={{ padding: "1px 6px", borderRadius: 4, background: "rgba(255,139,61,0.15)", color: "#D97500", fontSize: 10, fontWeight: 500 }}>object</span>
        <span style={{ fontSize: 11, color: "rgba(38,38,51,0.5)" }}>{keys.length} keys</span>
      </button>
      {open && (
        <div>
          {keys.map(k => (
            <div key={k} style={{ marginTop: 4, marginLeft: 14 }}>
              <JsonTree value={value[k]} name={k} level={level + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TypedSpan({ type, children }) {
  const colors = {
    string: "#1B883B",
    number: "#1E5EBE",
    boolean: "#9A3DC2",
    null: "#999",
  };
  return (
    <span style={{
      fontSize: 12.5, color: colors[type] || "#262633",
      fontFamily: "ui-monospace, SF Mono, Menlo, monospace",
    }}>{children}</span>
  );
}

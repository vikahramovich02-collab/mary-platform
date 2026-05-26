// Welcome-карточка для пустого чата отдела СММ (вместо «Сообщений нет»).
// Извлечено из TgKanalPage.jsx (Phase 2).
import { color } from "../ui/tokens.js";

const CHANNEL_ACTIONS = [
  { label: "Сделай ресёрч по нише за неделю" },
  { label: "Придумай 5 идей постов для канала" },
  { label: "Напиши пост по горячей теме" },
  { label: "Прогон всего отдела: ресёрч → идеи → текст", isPipeline: true },
];

const DEPT_ACTIONS = [
  { label: "Дай контент-план на эту неделю", isPipeline: true },
  { label: "Что готово к публикации сегодня?" },
  { label: "Как работают агенты отдела?" },
  { label: "Запусти пайплайн по всем каналам", isPipeline: true },
];

export function DeptChatWelcome({ onPick, channelName, deptMode = false, deptName, deptAgents }) {
  const quickActions = deptMode ? DEPT_ACTIONS : CHANNEL_ACTIONS;

  const displayName = deptName || "СММ";

  const title = deptMode
    ? `Чат отдела ${displayName}`
    : `Чат отдела ${displayName}${channelName ? ` · ${channelName}` : ""}`;

  let subtitle;
  if (deptMode) {
    if (deptAgents?.length > 0) {
      const count = deptAgents.length;
      const ending = count === 1 ? "" : count < 5 ? "а" : "ов";
      const names = deptAgents.slice(0, 3).map(a => a.name || a.role).filter(Boolean).join(", ");
      subtitle = `В отделе ${count} агент${ending}${names ? `: ${names}${count > 3 ? "…" : ""}` : ""}`;
    } else {
      subtitle = "Управляй всем отделом из одного места — TG, Instagram, агенты";
    }
  } else {
    subtitle = "Здесь работают агенты: Ресерчер, Маркетолог, Копирайтер, Дизайнер, Аналитик";
  }

  const description = deptMode
    ? "Спроси про любой канал или весь отдел сразу. Mary видит все воркфлоу и может агрегировать данные по TG-каналу и Instagram в одном ответе."
    : "Это рабочий чат отдела. Пиши задачу — Mary раскинет её на нужного агента, результат появится здесь и отдельным артефактом в правой панели. Можно сразу попробовать:";

  return (
    <div style={{
      maxWidth: 560, margin: "30px auto 0",
      padding: "26px 28px",
      background: color.white,
      border: "1px solid rgba(38,38,51,0.06)",
      borderRadius: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: deptMode ? "rgba(122,134,255,0.15)" : "rgba(255,139,61,0.18)",
          color: deptMode ? "#7A86FF" : "#FF8B3D",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {deptMode ? (
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5"/>
              <rect x="14" y="3" width="7" height="7" rx="1.5"/>
              <rect x="3" y="14" width="7" height="7" rx="1.5"/>
              <rect x="14" y="14" width="7" height="7" rx="1.5"/>
            </svg>
          ) : (
            <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8c0-1.5-.4-2.9-1.2-4.1-.5.4-1.2.6-1.9.6-1.7 0-3-1.3-3-3 0-.6.2-1.2.4-1.7C13.6 3.3 12.8 3 12 3z"/>
              <circle cx="17" cy="6.5" r="2"/>
            </svg>
          )}
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#262633" }}>{title}</div>
          <div style={{ fontSize: 12, color: "rgba(38,38,51,0.55)", marginTop: 1 }}>{subtitle}</div>
        </div>
      </div>
      <div style={{ fontSize: 13, color: "rgba(38,38,51,0.7)", lineHeight: 1.55, marginBottom: 14 }}>
        {description}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {quickActions.map((a, i) => (
          <button key={i} onClick={() => onPick?.({ kind: "free-text", content: a.label })}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px",
              background: a.isPipeline ? "rgba(63,149,255,0.05)" : "rgba(38,38,51,0.03)",
              border: a.isPipeline ? "1px solid rgba(63,149,255,0.18)" : "1px solid transparent",
              borderRadius: 9,
              fontSize: 13, color: "#262633", textAlign: "left",
              cursor: "pointer", fontFamily: "inherit",
              transition: "background 0.15s, border 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = a.isPipeline ? "rgba(63,149,255,0.1)" : "rgba(38,38,51,0.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = a.isPipeline ? "rgba(63,149,255,0.05)" : "rgba(38,38,51,0.03)"; }}>
            {a.isPipeline ? (
              <svg width={12} height={12} viewBox="0 0 24 24" fill="#3F95FF" style={{ flexShrink: 0 }}>
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <span style={{
                fontSize: 11, color: "rgba(38,38,51,0.4)", width: 14, textAlign: "right",
                fontVariantNumeric: "tabular-nums",
              }}>{i + 1}.</span>
            )}
            <span style={{ flex: 1, color: a.isPipeline ? "#3F95FF" : "#262633", fontWeight: a.isPipeline ? 510 : 400 }}>{a.label}</span>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={a.isPipeline ? "#3F95FF" : "rgba(38,38,51,0.4)"} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

// Welcome-карточка для пустого чата отдела СММ (вместо «Сообщений нет»).
// Извлечено из TgKanalPage.jsx (Phase 2).
import { color } from "../ui/tokens.js";

export function DeptChatWelcome({ onPick }) {
  const quickActions = [
    "Сделай ресёрч по нише за неделю",
    "Придумай 5 идей постов для канала",
    "Напиши пост по горячей теме",
    "Прогон всего отдела: ресёрч → идеи → текст",
  ];
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
          background: "rgba(255,139,61,0.18)", color: "#FF8B3D",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8c0-1.5-.4-2.9-1.2-4.1-.5.4-1.2.6-1.9.6-1.7 0-3-1.3-3-3 0-.6.2-1.2.4-1.7C13.6 3.3 12.8 3 12 3z"/>
            <circle cx="17" cy="6.5" r="2"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#262633" }}>Чат отдела СММ · Тг-канал</div>
          <div style={{ fontSize: 12, color: "rgba(38,38,51,0.55)", marginTop: 1 }}>
            Здесь работают агенты: Ресерчер, Маркетолог, Копирайтер, Дизайнер, Аналитик
          </div>
        </div>
      </div>
      <div style={{ fontSize: 13, color: "rgba(38,38,51,0.7)", lineHeight: 1.55, marginBottom: 14 }}>
        Это рабочий чат отдела. Пиши задачу — Mary раскинет её на нужного агента,
        результат появится здесь и отдельным <b>артефактом</b> в правой панели.
        Можно сразу попробовать:
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {quickActions.map((a, i) => (
          <button key={i} onClick={() => onPick?.({ kind: "free-text", content: a })}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px",
              background: "rgba(38,38,51,0.03)",
              border: "1px solid transparent", borderRadius: 9,
              fontSize: 13, color: "#262633", textAlign: "left",
              cursor: "pointer", fontFamily: "inherit",
              transition: "background 0.15s, border 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(38,38,51,0.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(38,38,51,0.03)"; }}>
            <span style={{
              fontSize: 11, color: "rgba(38,38,51,0.4)", width: 14, textAlign: "right",
              fontVariantNumeric: "tabular-nums",
            }}>{i + 1}.</span>
            <span style={{ flex: 1 }}>{a}</span>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="rgba(38,38,51,0.4)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

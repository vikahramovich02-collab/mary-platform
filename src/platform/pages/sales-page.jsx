import { useState, useEffect } from "react";
import { color, transition } from "../../ui/tokens.js";
import { I } from "../icons.jsx";

// ─────────────────────────────────────────────────────────────
//  Продажи / CRM — воронка-канбан со сделками.
//  Концепция «нейробитрикс»: сделку ведёт агент-менеджер ИЛИ человек.
//  То, что в обычном Битриксе делается руками (first-touch, реактивация,
//  автозакрытие) — здесь делает агент сам. Мок-данные + localStorage.
// ─────────────────────────────────────────────────────────────

const STAGES = [
  { id: "new",     label: "Новые лиды",  color: "#0794FF" },
  { id: "touch",   label: "First-touch", color: "#FF8B3D" },
  { id: "work",    label: "В работе",    color: "#262633" },
  { id: "waiting", label: "Ждуны",       color: "#FFD60A" },
  { id: "won",     label: "Готово",      color: "#34C759" },
];

// Каналы (через WAZZUP, как в аудите Фабрики) + e-mail
const CHANNEL = {
  tg:    { label: "Telegram",  color: "#0794FF" },
  wa:    { label: "WhatsApp",  color: "#34C759" },
  ig:    { label: "Instagram", color: "#262633" },
  email: { label: "E-mail",    color: "rgba(38,38,51,0.45)" },
};

const botIcon = (
  <I d={<><rect x="4" y="8" width="16" height="11" rx="3" /><path d="M12 4.5v3" /><circle cx="12" cy="3.5" r="1.1" /><path d="M9 13h.01M15 13h.01M9.5 16.5h5" /></>} size={12} stroke={1.6} />
);
const sparkIcon = (
  <I d={<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3" />} size={11} stroke={1.5} />
);
const clockIcon = (
  <I d={<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>} size={11} stroke={1.6} />
);

const SEED = [
  { id: "d1",  name: "Анна Ковалёва",   channel: "tg",    stage: "new",     handler: { type: "agent", name: "Классификатор" }, amount: 240, note: "лид определён: фотокнига, новый клиент", auto: "first-touch через 5 мин", idle: 0 },
  { id: "d2",  name: "Иван Петров",     channel: "wa",    stage: "new",     handler: { type: "agent", name: "Классификатор" }, amount: 0,   note: "категория: повторный заказ", auto: "first-touch через 5 мин", idle: 0 },
  { id: "d3",  name: "Регина Смирнова", channel: "ig",    stage: "touch",   handler: { type: "agent", name: "First-touch" },    amount: 180, note: "приветствие отправлено", auto: "нудж через 1ч если молчит", idle: 0 },
  { id: "d4",  name: "Сергей Новиков",  channel: "tg",    stage: "touch",   handler: { type: "agent", name: "First-touch" },    amount: 0,   note: "приветствие отправлено", auto: "нудж через 1ч", idle: 0 },
  { id: "d5",  name: "Мария Лис",       channel: "email", stage: "touch",   handler: { type: "agent", name: "First-touch" },    amount: 320, note: "нет ответа 40 мин", auto: "переход на e-mail через 24ч", idle: 1 },
  { id: "d6",  name: "Ольга Дронова",   channel: "tg",    stage: "work",    handler: { type: "human", name: "Алина" },          amount: 540, hot: true, note: "просит счёт — горячий", auto: "—", idle: 0 },
  { id: "d7",  name: "Дмитрий Ким",     channel: "wa",    stage: "work",    handler: { type: "human", name: "Елизавета" },      amount: 410, note: "согласует макет портфеля", auto: "—", idle: 2 },
  { id: "d8",  name: "Фотостудия «Кадр»", channel: "ig",  stage: "work",    handler: { type: "human", name: "Виктория" },       amount: 1250, hot: true, note: "B2B, опт портфелей", auto: "—", idle: 1 },
  { id: "d9",  name: "Павел Ершов",     channel: "tg",    stage: "waiting", handler: { type: "agent", name: "Реактивация" },    amount: 0,   note: "молчит 12 дней", auto: "реактивация на 30-й день", idle: 12 },
  { id: "d10", name: "Юлия Тарасюк",    channel: "wa",    stage: "waiting", handler: { type: "agent", name: "Реактивация" },    amount: 0,   note: "акция закончилась", auto: "автозакрытие через 9 дней", idle: 21 },
  { id: "d11", name: "Никита Болдин",   channel: "email", stage: "waiting", handler: { type: "agent", name: "Реактивация" },    amount: 0,   note: "висит 34 дня", auto: "последний контакт + закрытие", idle: 34 },
  { id: "d12", name: "Светлана Грей",   channel: "tg",    stage: "won",     handler: { type: "human", name: "Алина" },          amount: 290, note: "фотокнига оплачена", auto: "—", idle: 0 },
  { id: "d13", name: "Артём Волк",      channel: "ig",    stage: "won",     handler: { type: "human", name: "Елизавета" },      amount: 760, note: "2 портфеля, оплачено", auto: "—", idle: 0 },
  { id: "d14", name: "Елена Зорина",    channel: "wa",    stage: "won",     handler: { type: "agent", name: "First-touch" },    amount: 150, note: "довела до оплаты сама", auto: "—", idle: 0 },
];

const AGENT_MANAGERS = [
  { name: "Классификатор", sub: "тип лида · категория", active: 2 },
  { name: "First-touch",   sub: "приветствие · нудж",   active: 3 },
  { name: "Реактивация",   sub: "ждуны · автозакрытие", active: 3 },
  { name: "Детектор",      sub: "горячие сделки",        active: 2 },
];

function HandlerBadge({ handler }) {
  const isAgent = handler.type === "agent";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      maxWidth: "100%",
    }}>
      {isAgent ? (
        <span style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 18, height: 18, borderRadius: 5,
          background: "rgba(38,38,51,0.06)", color: "#262633", flexShrink: 0,
        }}>{botIcon}</span>
      ) : (
        <span style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg,#A0A4AE,#82858F)",
          color: "#fff", fontSize: 8.5, fontWeight: 600,
        }}>{handler.name.slice(0, 2)}</span>
      )}
      <span style={{ fontSize: 11.5, color: isAgent ? "#262633" : "rgba(38,38,51,0.6)", fontWeight: isAgent ? 500 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {handler.name}
      </span>
    </span>
  );
}

function DealCard({ d, onClick, draggable, onDragStart, onDragEnd, isDragging }) {
  const ch = CHANNEL[d.channel];
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      style={{
        background: color.white,
        border: "1px solid rgba(38,38,51,0.10)",
        borderLeft: `3px solid ${ch.color}`,
        borderRadius: 10, padding: "11px 12px",
        cursor: "pointer", opacity: isDragging ? 0.4 : 1,
        transition: "border-color 0.15s, box-shadow 0.15s",
        display: "flex", flexDirection: "column", gap: 8,
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 2px 10px rgba(38,38,51,0.06)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Top: name + amount/hot */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: "#262633", lineHeight: 1.3, flex: 1 }}>{d.name}</span>
        {d.hot && (
          <span style={{
            fontSize: 10, fontWeight: 600, color: "#FF4D00",
            background: "rgba(255,77,0,0.10)", borderRadius: 5, padding: "2px 6px", flexShrink: 0,
          }}>горячий</span>
        )}
      </div>

      {/* Channel + amount */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: "rgba(38,38,51,0.55)" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: ch.color }} />
          {ch.label}
        </span>
        {d.amount > 0 && (
          <>
            <span style={{ opacity: 0.4 }}>·</span>
            <span style={{ fontWeight: 500, color: "#262633" }}>{d.amount} BYN</span>
          </>
        )}
      </div>

      {/* Automation note */}
      {d.note && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "rgba(38,38,51,0.6)" }}>
          <span style={{ color: "#262633", display: "inline-flex", flexShrink: 0 }}>{sparkIcon}</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.note}</span>
        </div>
      )}

      {/* Footer: handler + next auto */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between", borderTop: "1px solid rgba(38,38,51,0.06)", paddingTop: 8 }}>
        <HandlerBadge handler={d.handler} />
        {d.auto && d.auto !== "—" && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, color: "rgba(38,38,51,0.45)", flexShrink: 0 }}>
            {clockIcon}
            <span style={{ whiteSpace: "nowrap" }}>{d.auto}</span>
          </span>
        )}
      </div>
    </div>
  );
}

function DealDrawer({ d, onClose }) {
  if (!d) return null;
  const ch = CHANNEL[d.channel];
  const timeline = [
    { who: "agent", t: "Классификатор", text: `Лид размечен · канал ${ch.label}`, time: "сегодня" },
    { who: "agent", t: "First-touch", text: "Отправлено приветствие с именем менеджера", time: "сегодня" },
    ...(d.handler.type === "human" ? [{ who: "human", t: d.handler.name, text: "Подключился человек — ведёт сделку", time: "сегодня" }] : []),
    ...(d.stage === "won" ? [{ who: "system", t: "Сделка", text: "Закрыта успешно", time: "сегодня" }] : []),
  ];
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.18)", zIndex: 40 }} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 400, maxWidth: "90vw",
        background: color.white, zIndex: 41, boxShadow: "-8px 0 30px rgba(0,0,0,0.10)",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid rgba(38,38,51,0.08)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <h2 style={{ fontSize: 19, fontWeight: 600, color: "#262633", margin: 0, flex: 1, letterSpacing: "-0.01em" }}>{d.name}</h2>
            <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(38,38,51,0.5)", padding: 4 }}>
              <I d={<path d="M6 6l12 12M18 6L6 18" />} size={18} stroke={1.7} />
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 12.5, color: "rgba(38,38,51,0.6)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: ch.color }} /> {ch.label}
            </span>
            {d.amount > 0 && <><span style={{ opacity: 0.4 }}>·</span><span style={{ fontWeight: 600, color: "#262633" }}>{d.amount} BYN</span></>}
            {d.hot && <span style={{ fontSize: 10.5, fontWeight: 600, color: "#FF4D00", background: "rgba(255,77,0,0.10)", borderRadius: 5, padding: "2px 7px" }}>горячий</span>}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px" }}>
          {/* Кто ведёт */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "rgba(38,38,51,0.45)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Кто ведёт</div>
            <HandlerBadge handler={d.handler} />
          </div>

          {/* Следующее автодействие */}
          {d.auto && d.auto !== "—" && (
            <div style={{ marginBottom: 20, background: "rgba(38,38,51,0.03)", border: "1px solid rgba(38,38,51,0.10)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 600, color: "#262633", marginBottom: 4 }}>
                {sparkIcon} Следующее автодействие
              </div>
              <div style={{ fontSize: 13, color: "#262633" }}>{d.auto}</div>
            </div>
          )}

          {/* Лента */}
          <div style={{ fontSize: 11.5, fontWeight: 600, color: "rgba(38,38,51,0.45)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>История</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {timeline.map((ev, i) => (
              <div key={i} style={{ display: "flex", gap: 10 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%", marginTop: 4,
                    background: ev.who === "agent" ? "#262633" : ev.who === "human" ? "#82858F" : "#34C759",
                  }} />
                  {i < timeline.length - 1 && <span style={{ width: 1, flex: 1, background: "rgba(38,38,51,0.12)", marginTop: 3 }} />}
                </div>
                <div style={{ paddingBottom: 2 }}>
                  <div style={{ fontSize: 13, color: "#262633" }}><b style={{ fontWeight: 600 }}>{ev.t}</b> — {ev.text}</div>
                  <div style={{ fontSize: 11, color: "rgba(38,38,51,0.4)", marginTop: 2 }}>{ev.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// CRM-таблица продаж (основной вид). Общая структура данных по сделкам.
function DealsTable({ deals, onRow }) {
  const th = { padding: "10px 14px", fontSize: 12, textAlign: "left", color: "rgba(38,38,51,0.5)", fontWeight: 500, whiteSpace: "nowrap" };
  const td = { padding: "11px 14px", verticalAlign: "middle" };
  return (
    <div style={{ border: "1px solid rgba(38,38,51,0.10)", borderRadius: 12, overflow: "hidden", marginBottom: 40 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "rgba(38,38,51,0.025)", borderBottom: "1px solid rgba(38,38,51,0.08)" }}>
            <th style={th}>Клиент</th>
            <th style={th}>Канал</th>
            <th style={th}>Этап</th>
            <th style={{ ...th, textAlign: "right" }}>Сумма</th>
            <th style={th}>Ведёт</th>
            <th style={th}>Следующее действие</th>
          </tr>
        </thead>
        <tbody>
          {deals.map(d => {
            const ch = CHANNEL[d.channel];
            const stage = STAGES.find(s => s.id === d.stage) || {};
            return (
              <tr key={d.id} onClick={() => onRow(d.id)}
                style={{ borderBottom: "1px solid rgba(38,38,51,0.06)", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(38,38,51,0.02)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={td}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 500, color: "#262633" }}>{d.name}</span>
                    {d.hot && <span style={{ fontSize: 10, fontWeight: 600, color: "#FF4D00", background: "rgba(255,77,0,0.10)", borderRadius: 5, padding: "2px 6px" }}>горячий</span>}
                  </span>
                </td>
                <td style={{ ...td, color: "rgba(38,38,51,0.65)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: ch.color }} />{ch.label}
                  </span>
                </td>
                <td style={td}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#262633", background: (stage.color || "#999") + "14", borderRadius: 999, padding: "3px 10px" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: stage.color }} />{stage.label}
                  </span>
                </td>
                <td style={{ ...td, textAlign: "right", fontWeight: 500, color: d.amount > 0 ? "#262633" : "rgba(38,38,51,0.3)" }}>{d.amount > 0 ? d.amount + " BYN" : "—"}</td>
                <td style={td}><HandlerBadge handler={d.handler} /></td>
                <td style={{ ...td, color: "rgba(38,38,51,0.55)", fontSize: 12.5 }}>{d.auto && d.auto !== "—" ? d.auto : <span style={{ opacity: 0.35 }}>—</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function SalesPage() {
  const [deals, setDeals] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [view, setView] = useState("table"); // table | funnel
  const [channelFilter, setChannelFilter] = useState("all");
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("mary_sales_deals");
      setDeals(raw ? JSON.parse(raw) : SEED);
    } catch { setDeals(SEED); }
  }, []);

  const persist = (next) => {
    setDeals(next);
    try { localStorage.setItem("mary_sales_deals", JSON.stringify(next)); } catch {}
  };

  const moveDeal = (id, stage) => {
    persist(deals.map(d => d.id === id ? { ...d, stage } : d));
  };

  const visible = channelFilter === "all" ? deals : deals.filter(d => d.channel === channelFilter);
  const byStage = (s) => visible.filter(d => d.stage === s);

  const total = deals.length;
  const onAutopilot = deals.filter(d => d.handler.type === "agent").length;
  const won = deals.filter(d => d.stage === "won").length;
  const conversion = total ? Math.round((won / total) * 100) : 0;
  const activeDeal = deals.find(d => d.id === activeId);

  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0, background: color.white, overflow: "hidden" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowY: "auto" }}>
        <div style={{ padding: "26px 40px 18px", maxWidth: 1500 }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 12.5, color: "rgba(38,38,51,0.55)" }}>
            <span>Компания</span><span>›</span>
            <span style={{ padding: "2px 8px", background: "rgba(38,38,51,0.06)", borderRadius: 5, color: "#262633", fontWeight: 500 }}>Клиенты</span>
          </div>

          {/* H1 */}
          <h1 style={{ fontSize: 26, fontWeight: 600, color: "#262633", margin: "0 0 4px", letterSpacing: "-0.01em" }}>Клиенты</h1>
          <p style={{ fontSize: 13.5, color: "rgba(38,38,51,0.55)", margin: "0 0 20px" }}>Самоведущая воронка — сделки ведут агенты-менеджеры, человек подключается на ключевых точках.</p>

          {/* Stats */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
            {[
              { label: "Всего сделок", value: total },
              { label: "На автопилоте", value: onAutopilot, accent: "#262633" },
              { label: "Выиграно", value: won, accent: "#34C759" },
              { label: "Конверсия", value: conversion + "%" },
            ].map(s => (
              <div key={s.label} style={{ border: "1px solid rgba(38,38,51,0.10)", borderRadius: 12, padding: "12px 16px", minWidth: 130 }}>
                <div style={{ fontSize: 22, fontWeight: 600, color: s.accent || "#262633", letterSpacing: "-0.01em" }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "rgba(38,38,51,0.5)", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Агенты-менеджеры */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap", padding: "12px 16px", background: "rgba(38,38,51,0.03)", border: "1px solid rgba(38,38,51,0.08)", borderRadius: 12 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "#262633" }}>
              <span style={{ display: "inline-flex", width: 22, height: 22, borderRadius: 6, background: "rgba(38,38,51,0.08)", alignItems: "center", justifyContent: "center" }}>{botIcon}</span>
              Агенты-менеджеры
            </span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1 }}>
              {AGENT_MANAGERS.map(a => (
                <span key={a.name} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#262633", background: color.white, border: "1px solid rgba(38,38,51,0.10)", borderRadius: 999, padding: "5px 11px" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34C759" }} />
                  {a.name}
                  <span style={{ color: "rgba(38,38,51,0.4)" }}>· {a.active}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Toolbar: вид + каналы */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 6 }}>
              {[{ id: "table", label: "Таблица" }, { id: "funnel", label: "Воронка" }].map(t => (
                <button key={t.id} onClick={() => setView(t.id)}
                  style={{
                    padding: "7px 14px",
                    background: view === t.id ? "#262633" : "transparent",
                    color: view === t.id ? color.white : "#262633",
                    border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500,
                    cursor: "pointer", fontFamily: "inherit", transition: transition.fast,
                  }}>{t.label}</button>
              ))}
            </div>
            <div style={{ width: 1, height: 20, background: "rgba(38,38,51,0.12)" }} />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[{ id: "all", label: "Все каналы" }, ...Object.entries(CHANNEL).map(([id, c]) => ({ id, label: c.label }))].map(t => (
                <button key={t.id} onClick={() => setChannelFilter(t.id)}
                  style={{
                    padding: "6px 12px",
                    background: channelFilter === t.id ? "rgba(38,38,51,0.06)" : "transparent",
                    color: "#262633",
                    border: "1px solid rgba(38,38,51,0.12)",
                    borderRadius: 8, fontSize: 12.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                  }}>{t.label}</button>
              ))}
            </div>
          </div>

          {/* Таблица продаж (CRM) */}
          {view === "table" && <DealsTable deals={visible} onRow={setActiveId} />}

          {/* Воронка */}
          {view === "funnel" && (
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start", paddingBottom: 40 }}>
            {STAGES.map(stage => {
              const items = byStage(stage.id);
              const isOver = dragOverStage === stage.id;
              const sum = items.reduce((a, d) => a + (d.amount || 0), 0);
              return (
                <div key={stage.id}
                  onDragOver={e => { e.preventDefault(); setDragOverStage(stage.id); }}
                  onDragLeave={() => setDragOverStage(null)}
                  onDrop={e => {
                    e.preventDefault();
                    const id = e.dataTransfer.getData("text/plain");
                    if (id) moveDeal(id, stage.id);
                    setDragOverStage(null); setDraggingId(null);
                  }}
                  style={{
                    width: 268, minWidth: 268,
                    background: isOver ? "rgba(38,38,51,0.03)" : "transparent",
                    borderRadius: 12, padding: 4, transition: "background 0.15s",
                  }}>
                  {/* Stage header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 8px 12px" }}>
                    <span style={{ width: 3, height: 14, background: stage.color, borderRadius: 2 }} />
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "#262633" }}>{stage.label}</span>
                    <span style={{ fontSize: 12, color: "rgba(38,38,51,0.5)" }}>{items.length}</span>
                    <div style={{ flex: 1 }} />
                    {sum > 0 && <span style={{ fontSize: 11, color: "rgba(38,38,51,0.4)" }}>{sum} BYN</span>}
                  </div>
                  {/* Cards */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {items.map(d => (
                      <DealCard key={d.id} d={d}
                        onClick={() => setActiveId(d.id)}
                        draggable
                        onDragStart={e => { e.dataTransfer.setData("text/plain", d.id); setDraggingId(d.id); }}
                        onDragEnd={() => setDraggingId(null)}
                        isDragging={draggingId === d.id}
                      />
                    ))}
                    {items.length === 0 && (
                      <div style={{ fontSize: 12, color: "rgba(38,38,51,0.3)", textAlign: "center", padding: "16px 0" }}>пусто</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </div>

      <DealDrawer d={activeDeal} onClose={() => setActiveId(null)} />
    </div>
  );
}

import { useState } from "react";
import { color, transition, cv } from "../../ui/tokens.js";

// ─────────────────────────────────────────
//  CRM — воронка сделок + контакты (mock)
//  Стиль Bitrix24, но со скорингом от Mary
// ─────────────────────────────────────────

const STAGES = [
  { id: "lead",        label: "Новые лиды",   color: "#3F95FF" },
  { id: "work",        label: "В работе",     color: "#7A86FF" },
  { id: "proposal",    label: "КП отправлено", color: "#FF8B3D" },
  { id: "negotiation", label: "Переговоры",   color: "#FFB020" },
  { id: "won",         label: "Успешно",      color: "#34C759" },
];

const PEOPLE = {
  vika:  { name: "Виктория", color: "#8A38F5" },
  alex:  { name: "Александр", color: "#3F95FF" },
  ivan:  { name: "Иван",     color: "#FF8B3D" },
  katya: { name: "Катя",     color: "#7A86FF" },
};

const TEMP = {
  hot:  { label: "Горячий", color: "#FF3B30" },
  warm: { label: "Тёплый",  color: "#FF8B3D" },
  cold: { label: "Холодный", color: "#3F95FF" },
};

const MOCK_DEALS = [
  { id: "d1",  company: "ООО «Ромашка»",       amount: 450000,  contact: "Иван Петров",     phone: "+7 916 200-11-22", stage: "lead",        owner: "vika",  days: 1,  score: 74, temp: "warm", source: "Сайт",     channel: "Заявка с лендинга" },
  { id: "d2",  company: "Студия «Север»",       amount: 1200000, contact: "Мария Соколова",  phone: "+7 903 555-08-90", stage: "lead",        owner: "ivan",  days: 2,  score: 88, temp: "hot",  source: "Telegram", channel: "Написали в бота" },
  { id: "d3",  company: "ИП Кузнецов",          amount: 180000,  contact: "Олег Кузнецов",   phone: "+7 925 119-44-30", stage: "lead",        owner: "katya", days: 4,  score: 41, temp: "cold", source: "Реклама",  channel: "VK Ads" },
  { id: "d4",  company: "Кофейня «Зерно»",      amount: 320000,  contact: "Анна Лебедева",   phone: "+7 901 777-12-12", stage: "work",        owner: "vika",  days: 3,  score: 69, temp: "warm", source: "Сайт",     channel: "Форма обратной связи" },
  { id: "d5",  company: "Сеть «ФитЛайн»",       amount: 2400000, contact: "Дмитрий Орлов",   phone: "+7 916 340-77-01", stage: "work",        owner: "alex",  days: 5,  score: 91, temp: "hot",  source: "Рекомендация", channel: "Партнёр" },
  { id: "d6",  company: "Бар «Гранат»",         amount: 540000,  contact: "Никита Волков",   phone: "+7 909 220-65-44", stage: "proposal",    owner: "ivan",  days: 2,  score: 77, temp: "warm", source: "Telegram", channel: "Бот поддержки" },
  { id: "d7",  company: "Клиника «Здоровье+»",  amount: 3100000, contact: "Елена Жукова",    phone: "+7 985 410-30-30", stage: "proposal",    owner: "vika",  days: 6,  score: 84, temp: "hot",  source: "Сайт",     channel: "Заявка на демо" },
  { id: "d8",  company: "Автосервис «Драйв»",   amount: 760000,  contact: "Павел Громов",    phone: "+7 917 888-19-02", stage: "negotiation", owner: "alex",  days: 8,  score: 80, temp: "warm", source: "Реклама",  channel: "Яндекс Директ" },
  { id: "d9",  company: "Школа «Логос»",        amount: 980000,  contact: "Ольга Зайцева",   phone: "+7 906 501-23-67", stage: "negotiation", owner: "katya", days: 11, score: 63, temp: "warm", source: "Рекомендация", channel: "Партнёр" },
  { id: "d10", company: "Бренд «Атлас»",        amount: 1850000, contact: "Сергей Белов",    phone: "+7 916 720-00-90", stage: "won",         owner: "vika",  days: 14, score: 95, temp: "hot",  source: "Сайт",     channel: "Заявка с лендинга" },
  { id: "d11", company: "Маркет «Свежо»",       amount: 670000,  contact: "Игорь Сухов",     phone: "+7 903 612-45-78", stage: "won",         owner: "ivan",  days: 9,  score: 90, temp: "hot",  source: "Telegram", channel: "Написали в бота" },
];

const fmt = (n) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";

const initials = (name) => name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

// ── Аватар ответственного ──────────────────
function Avatar({ ownerId, size = 22 }) {
  const p = PEOPLE[ownerId] || { name: "—", color: "#999" };
  return (
    <span title={p.name} style={{
      width: size, height: size, borderRadius: "50%",
      background: p.color + "26", color: p.color,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontSize: size < 24 ? 9.5 : 11, fontWeight: 600, flexShrink: 0,
    }}>{initials(p.name)}</span>
  );
}

// ── Карточка сделки ────────────────────────
function DealCard({ d, onClick, draggable, onDragStart, onDragEnd, isDragging }) {
  const t = TEMP[d.temp];
  return (
    <div
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{
        background: cv.bg, border: `1px solid ${cv.border}`, borderRadius: 10,
        padding: "11px 12px", cursor: "pointer",
        opacity: isDragging ? 0.4 : 1,
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
        transition: transition.fast,
        display: "flex", flexDirection: "column", gap: 7,
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = cv.borderStrong}
      onMouseLeave={e => e.currentTarget.style.borderColor = cv.border}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: cv.text, lineHeight: 1.2 }}>{d.company}</span>
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: cv.text, letterSpacing: "-0.01em" }}>{fmt(d.amount)}</div>
      <div style={{ fontSize: 12, color: cv.muted }}>{d.contact}</div>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        paddingTop: 8, borderTop: `1px solid ${cv.border}`,
      }}>
        <Avatar ownerId={d.owner} />
        <span style={{ fontSize: 11.5, color: cv.muted }}>{d.days} дн. в стадии</span>
        <div style={{ flex: 1 }} />
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          fontSize: 11, fontWeight: 600, color: scoreColor(d.score),
        }} title="AI-скоринг Mary">
          <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7.4-6.3-4.6L5.7 21l2.3-7.4-6-4.6h7.6z" />
          </svg>
          {d.score}
        </span>
      </div>
    </div>
  );
}

function scoreColor(s) {
  if (s >= 80) return "#34C759";
  if (s >= 55) return "#FF8B3D";
  return "#FF3B30";
}

// ── Drawer сделки ──────────────────────────
function DealDrawer({ deal, onClose }) {
  if (!deal) return null;
  const t = TEMP[deal.temp];
  const p = PEOPLE[deal.owner] || {};
  const stage = STAGES.find(s => s.id === deal.stage);
  const timeline = [
    { icon: "phone", text: "Звонок — обсудили объём работ", who: p.name, ago: "2 ч назад" },
    { icon: "mail",  text: "Отправлено КП на " + fmt(deal.amount), who: p.name, ago: "вчера" },
    { icon: "bot",   text: "Mary: лид квалифицирован, скоринг " + deal.score, who: "Mary", ago: deal.days + " дн назад" },
    { icon: "plus",  text: "Сделка создана из источника «" + deal.source + "»", who: "Система", ago: deal.days + " дн назад" },
  ];
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.2)", zIndex: 60 }} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 420, maxWidth: "90vw",
        background: cv.bg, borderLeft: `1px solid ${cv.border}`, zIndex: 61,
        display: "flex", flexDirection: "column", boxShadow: "-8px 0 24px rgba(0,0,0,0.08)",
      }}>
        {/* header */}
        <div style={{ padding: "18px 22px", borderBottom: `1px solid ${cv.border}`, display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: t.color }} />
              <span style={{ fontSize: 11.5, fontWeight: 600, color: t.color }}>{t.label}</span>
              <span style={{ fontSize: 11.5, color: cv.muted }}>· {stage?.label}</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: cv.text, marginBottom: 4 }}>{deal.company}</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: cv.text, letterSpacing: "-0.01em" }}>{fmt(deal.amount)}</div>
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, border: "none", background: "transparent", cursor: "pointer",
            color: cv.muted, borderRadius: 6, fontSize: 18, lineHeight: 1, fontFamily: "inherit",
          }}>×</button>
        </div>

        {/* AI score */}
        <div style={{ margin: "16px 22px 0", padding: "12px 14px", borderRadius: 10, background: cv.bgCard, border: `1px solid ${cv.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: cv.text }}>AI-скоринг Mary</span>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: scoreColor(deal.score) }}>{deal.score}/100</span>
          </div>
          <div style={{ height: 6, borderRadius: 4, background: cv.hover, overflow: "hidden" }}>
            <div style={{ width: deal.score + "%", height: "100%", background: scoreColor(deal.score) }} />
          </div>
          <div style={{ fontSize: 11.5, color: cv.muted, marginTop: 8 }}>
            BANT: бюджет подтверждён, ЛПР на связи. Рекомендация — назначить демо на этой неделе.
          </div>
        </div>

        {/* fields */}
        <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 0 }}>
          <Field label="Контакт" value={deal.contact} />
          <Field label="Телефон" value={deal.phone} />
          <Field label="Ответственный" value={p.name} avatar={deal.owner} />
          <Field label="Источник" value={deal.source + " · " + deal.channel} />
        </div>

        {/* timeline */}
        <div style={{ padding: "0 22px 22px", flex: 1, overflowY: "auto" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: cv.muted, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>История</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {timeline.map((ev, i) => (
              <div key={i} style={{ display: "flex", gap: 10 }}>
                <span style={{
                  width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                  background: cv.bgCard, border: `1px solid ${cv.border}`,
                  display: "inline-flex", alignItems: "center", justifyContent: "center", color: cv.muted,
                }}>{evIcon(ev.icon)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: cv.text, lineHeight: 1.35 }}>{ev.text}</div>
                  <div style={{ fontSize: 11, color: cv.muted, marginTop: 2 }}>{ev.who} · {ev.ago}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Field({ label, value, avatar }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: `1px solid ${cv.border}` }}>
      <span style={{ fontSize: 12.5, color: cv.muted, width: 110, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: cv.text, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 8 }}>
        {avatar && <Avatar ownerId={avatar} size={20} />}
        {value}
      </span>
    </div>
  );
}

function evIcon(kind) {
  const props = { width: 13, height: 13, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  if (kind === "phone") return <svg {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>;
  if (kind === "mail") return <svg {...props}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 5L2 7" /></svg>;
  if (kind === "bot") return <svg {...props}><rect x="3" y="8" width="18" height="12" rx="2" /><path d="M12 2v4M8 14h.01M16 14h.01" /></svg>;
  return <svg {...props}><path d="M12 5v14M5 12h14" /></svg>;
}

// ── Контакты (вкладка) ─────────────────────
function ContactsView({ deals, onPick }) {
  return (
    <div style={{ border: `1px solid ${cv.border}`, borderRadius: 12, overflow: "hidden" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "1.4fr 1.2fr 1fr 0.8fr 0.8fr",
        padding: "11px 16px", background: cv.bgCard,
        fontSize: 11.5, fontWeight: 600, color: cv.muted, textTransform: "uppercase", letterSpacing: "0.03em",
      }}>
        <span>Компания</span><span>Контакт</span><span>Телефон</span><span>Ответственный</span><span>Сумма</span>
      </div>
      {deals.map((d, i) => (
        <div key={d.id} onClick={() => onPick(d.id)}
          style={{
            display: "grid", gridTemplateColumns: "1.4fr 1.2fr 1fr 0.8fr 0.8fr",
            padding: "13px 16px", alignItems: "center", cursor: "pointer",
            borderTop: i === 0 ? "none" : `1px solid ${cv.border}`,
            transition: transition.fast,
          }}
          onMouseEnter={e => e.currentTarget.style.background = cv.hover}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <span style={{ fontSize: 13.5, fontWeight: 500, color: cv.text }}>{d.company}</span>
          <span style={{ fontSize: 13, color: cv.text }}>{d.contact}</span>
          <span style={{ fontSize: 13, color: cv.muted }}>{d.phone}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, color: cv.text }}>
            <Avatar ownerId={d.owner} size={20} />{PEOPLE[d.owner]?.name}
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: cv.text }}>{fmt(d.amount)}</span>
        </div>
      ))}
    </div>
  );
}

// ── Главная страница CRM ───────────────────
export function CrmPage() {
  const [deals, setDeals] = useState(MOCK_DEALS);
  const [view, setView] = useState("board"); // board | contacts
  const [activeId, setActiveId] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const byStage = (id) => deals.filter(d => d.stage === id);
  const stageSum = (id) => byStage(id).reduce((s, d) => s + d.amount, 0);
  const totalSum = deals.reduce((s, d) => s + d.amount, 0);
  const active = deals.find(d => d.id === activeId);

  const move = (id, stage) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, stage, days: 0 } : d));
  };

  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0, background: cv.bg, overflow: "hidden" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowY: "auto" }}>
        <div style={{ padding: "26px 40px 18px", maxWidth: 1500 }}>
          {/* breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 12.5, color: cv.muted }}>
            <span>CRM</span><span>›</span>
            <span style={{ padding: "2px 8px", background: cv.bgCard, borderRadius: 5, color: cv.text, fontWeight: 500 }}>Воронка продаж</span>
          </div>

          {/* H1 + totals */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 18 }}>
            <h1 style={{ fontSize: 26, fontWeight: 600, color: cv.text, margin: 0, letterSpacing: "-0.01em" }}>Сделки</h1>
            <span style={{ fontSize: 14, color: cv.muted, paddingBottom: 2 }}>
              {deals.length} сделок · <span style={{ color: cv.text, fontWeight: 600 }}>{fmt(totalSum)}</span>
            </span>
          </div>

          {/* tabs + actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {[{ id: "board", label: "Воронка" }, { id: "contacts", label: "Контакты" }].map(tb => (
                <button key={tb.id} onClick={() => setView(tb.id)}
                  style={{
                    padding: "7px 14px",
                    background: view === tb.id ? "#262633" : "transparent",
                    color: view === tb.id ? color.white : cv.text,
                    border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500,
                    cursor: "pointer", fontFamily: "inherit", transition: transition.fast,
                  }}>{tb.label}</button>
              ))}
            </div>
            <div style={{ flex: 1 }} />
            <button style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "7px 14px", background: "#262633", color: color.white,
              border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500,
              cursor: "pointer", fontFamily: "inherit",
            }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
              Новая сделка
            </button>
          </div>

          {/* board */}
          {view === "board" && (
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", paddingBottom: 40 }}>
              {STAGES.map(st => {
                const items = byStage(st.id);
                const isOver = dragOver === st.id;
                return (
                  <div key={st.id}
                    onDragOver={e => { e.preventDefault(); setDragOver(st.id); }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={e => { e.preventDefault(); const id = e.dataTransfer.getData("text/plain"); if (id) move(id, st.id); setDragOver(null); setDraggingId(null); }}
                    style={{
                      width: 280, minWidth: 280,
                      background: isOver ? cv.hover : "transparent",
                      borderRadius: 12, padding: 4, transition: "background 0.15s",
                    }}>
                    {/* column header */}
                    <div style={{ padding: "6px 8px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
                        <span style={{ width: 3, height: 14, background: st.color, borderRadius: 2 }} />
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: cv.text }}>{st.label}</span>
                        <span style={{ fontSize: 12, color: cv.muted }}>{items.length}</span>
                      </div>
                      <div style={{ fontSize: 12, color: cv.muted, paddingLeft: 12 }}>{fmt(stageSum(st.id))}</div>
                    </div>
                    {/* cards */}
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
                        <div style={{ fontSize: 12, color: cv.ghost, padding: "16px 8px", textAlign: "center" }}>Перетащите сюда</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {view === "contacts" && <ContactsView deals={deals} onPick={id => setActiveId(id)} />}
        </div>
      </div>

      {active && <DealDrawer deal={active} onClose={() => setActiveId(null)} />}
    </div>
  );
}

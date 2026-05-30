import { useState } from "react";
import { color, transition, cv } from "../../ui/tokens.js";

// ─────────────────────────────────────────
//  Сотрудники — оргструктура + нагрузка (mock)
//  Люди и AI-агенты в одной команде
// ─────────────────────────────────────────

const DEPTS = [
  { id: "smm",       name: "СММ",        color: "#FF8B3D" },
  { id: "sales",     name: "Продажи",    color: "#34C759" },
  { id: "finance",   name: "Отчётность", color: "#7A86FF" },
  { id: "logistics", name: "Логистика",  color: "#3F95FF" },
  { id: "hr",        name: "HR и найм",  color: "#FF6FB3" },
];

const STATUS = {
  online:  { label: "В сети",     color: "#34C759" },
  away:    { label: "Отошёл",     color: "#FF8B3D" },
  offline: { label: "Не в сети",  color: "#9AA0A6" },
  ai:      { label: "Активен",    color: "#8A38F5" },
};

const STAFF = [
  // СММ
  { id: "vika",   name: "Виктория Ахрамович", role: "Head of SMM",        dept: "smm",   kind: "human", status: "online",  lead: true,  active: 4,  overdue: 0, done: 28, load: 68, due: "Сегодня",  color: "#8A38F5" },
  { id: "katya",  name: "Катя Сафина",        role: "Контент-менеджер",   dept: "smm",   kind: "human", status: "away",    active: 6,  overdue: 2, done: 41, load: 88, due: "Завтра",   color: "#7A86FF" },
  { id: "ag_cont", name: "Контент-агент",     role: "Генерация постов",   dept: "smm",   kind: "ai",    status: "ai",      active: 9,  overdue: 1, done: 312, load: 92, due: "—",        boss: "vika" },
  { id: "ag_write", name: "Райтер-агент",     role: "Тексты и заголовки", dept: "smm",   kind: "ai",    status: "ai",      active: 5,  overdue: 0, done: 188, load: 54, due: "—",        boss: "vika" },

  // Продажи
  { id: "ivan",   name: "Иван Соколов",       role: "Руководитель продаж", dept: "sales", kind: "human", status: "online",  lead: true,  active: 5,  overdue: 0, done: 33, load: 60, due: "Пт, 30.05", color: "#FF8B3D" },
  { id: "alex",   name: "Александр Орлов",    role: "Менеджер по продажам", dept: "sales", kind: "human", status: "offline", active: 7,  overdue: 1, done: 52, load: 80, due: "Сегодня",  color: "#3F95FF" },
  { id: "ag_lead", name: "Лид-скоринг агент", role: "Квалификация лидов",  dept: "sales", kind: "ai",    status: "ai",      active: 12, overdue: 0, done: 540, load: 76, due: "—",        boss: "ivan" },

  // Отчётность
  { id: "maria",  name: "Мария Дудник",       role: "Аналитик",           dept: "finance", kind: "human", status: "online", active: 3,  overdue: 0, done: 19, load: 44, due: "Пн, 02.06", color: "#FF6FB3" },
  { id: "ag_anl", name: "Аналитик-агент",     role: "Сводки и дашборды",  dept: "finance", kind: "ai",    status: "ai",      active: 4,  overdue: 0, done: 96,  load: 38, due: "—",        boss: "maria" },

  // Логистика
  { id: "ag_log", name: "Логист-агент",       role: "Маршруты и заказы",  dept: "logistics", kind: "ai",  status: "ai",      active: 6,  overdue: 1, done: 144, load: 66, due: "—" },

  // HR
  { id: "ag_hr",  name: "Рекрутер-агент",     role: "Скрининг кандидатов", dept: "hr",   kind: "ai",    status: "ai",      active: 9,  overdue: 0, done: 73,  load: 70, due: "—" },
];

const initials = (n) => n.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
const deptOf = (id) => DEPTS.find(d => d.id === id);
const loadColor = (l) => l >= 85 ? "#FF3B30" : l >= 60 ? "#FF8B3D" : "#34C759";

// ── Аватар (человек = инициалы, AI = робот) ─
function Avatar({ p, size = 36 }) {
  const isAi = p.kind === "ai";
  const c = isAi ? "#8A38F5" : (p.color || "#9AA0A6");
  return (
    <span style={{
      width: size, height: size, borderRadius: isAi ? 10 : "50%",
      background: c + "22", color: c, flexShrink: 0,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontSize: size < 28 ? 10 : 13, fontWeight: 600,
    }}>
      {isAi ? (
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="8" width="16" height="11" rx="3" /><path d="M12 4v4M9 13h.01M15 13h.01" />
        </svg>
      ) : initials(p.name)}
    </span>
  );
}

// ── Точка статуса ──────────────────────────
function StatusDot({ status, withLabel }) {
  const s = STATUS[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
      {withLabel && <span style={{ fontSize: 12, color: cv.muted }}>{s.label}</span>}
    </span>
  );
}

function LoadBar({ load }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 90 }}>
      <div style={{ flex: 1, height: 5, borderRadius: 3, background: cv.hover, overflow: "hidden" }}>
        <div style={{ width: load + "%", height: "100%", background: loadColor(load) }} />
      </div>
      <span style={{ fontSize: 11.5, fontWeight: 600, color: loadColor(load), width: 30, textAlign: "right" }}>{load}%</span>
    </div>
  );
}

function AiBadge() {
  return (
    <span style={{
      fontSize: 9.5, fontWeight: 700, letterSpacing: "0.04em",
      color: "#8A38F5", background: "rgba(138,56,245,0.1)",
      padding: "1px 5px", borderRadius: 4,
    }}>AI</span>
  );
}

// ── Карточка сотрудника (оргструктура) ──────
function PersonCard({ p, onClick }) {
  return (
    <div onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 11,
      padding: "10px 12px", background: cv.bg,
      border: `1px solid ${cv.border}`, borderRadius: 10, cursor: "pointer",
      transition: transition.fast,
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = cv.borderStrong}
      onMouseLeave={e => e.currentTarget.style.borderColor = cv.border}
    >
      <div style={{ position: "relative" }}>
        <Avatar p={p} size={38} />
        {p.kind !== "ai" && (
          <span style={{
            position: "absolute", right: -1, bottom: -1,
            width: 11, height: 11, borderRadius: "50%",
            background: STATUS[p.status].color, border: `2px solid ${cv.bg}`,
          }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: cv.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
          {p.kind === "ai" && <AiBadge />}
          {p.lead && <span style={{ fontSize: 9.5, fontWeight: 700, color: "#FF8B3D", background: "rgba(255,139,61,0.12)", padding: "1px 5px", borderRadius: 4 }}>РУК</span>}
        </div>
        <div style={{ fontSize: 12, color: cv.muted, marginTop: 1 }}>{p.role}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: cv.text }}>{p.active}</div>
        <div style={{ fontSize: 10.5, color: cv.muted }}>задач</div>
      </div>
    </div>
  );
}

// ── Оргструктура (по отделам) ──────────────
function OrgView({ onPick }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26, paddingBottom: 40 }}>
      {DEPTS.map(d => {
        const members = STAFF.filter(p => p.dept === d.id);
        if (!members.length) return null;
        const lead = members.find(m => m.lead);
        const rest = members.filter(m => !m.lead);
        return (
          <div key={d.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: d.color }} />
              <span style={{ fontSize: 15, fontWeight: 600, color: cv.text }}>{d.name}</span>
              <span style={{ fontSize: 12.5, color: cv.muted }}>{members.length} чел. · {members.filter(m => m.kind === "ai").length} AI</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
              {[...(lead ? [lead] : []), ...rest].map(p => (
                <PersonCard key={p.id} p={p} onClick={() => onPick(p.id)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Нагрузка (таблица-дашборд) ─────────────
function LoadView({ onPick }) {
  const sorted = [...STAFF].sort((a, b) => b.load - a.load);
  return (
    <div style={{ border: `1px solid ${cv.border}`, borderRadius: 12, overflow: "hidden", paddingBottom: 0 }}>
      <div style={{
        display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 0.7fr 0.7fr 1.3fr 1fr",
        padding: "11px 16px", background: cv.bgCard,
        fontSize: 11, fontWeight: 600, color: cv.muted, textTransform: "uppercase", letterSpacing: "0.03em",
      }}>
        <span>Сотрудник</span><span>Отдел</span><span>Статус</span><span>Задачи</span><span>Просроч.</span><span>Загрузка</span><span>Дедлайн</span>
      </div>
      {sorted.map((p, i) => {
        const d = deptOf(p.dept);
        return (
          <div key={p.id} onClick={() => onPick(p.id)}
            style={{
              display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 0.7fr 0.7fr 1.3fr 1fr",
              padding: "12px 16px", alignItems: "center", cursor: "pointer",
              borderTop: i === 0 ? "none" : `1px solid ${cv.border}`,
              transition: transition.fast,
            }}
            onMouseEnter={e => e.currentTarget.style.background = cv.hover}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <Avatar p={p} size={28} />
              <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: cv.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
                  {p.kind === "ai" && <AiBadge />}
                </span>
                <span style={{ fontSize: 11, color: cv.muted }}>{p.role}</span>
              </span>
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, color: cv.text }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: d.color }} />{d.name}
            </span>
            <StatusDot status={p.status} withLabel />
            <span style={{ fontSize: 13, fontWeight: 600, color: cv.text }}>{p.active}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: p.overdue ? "#FF3B30" : cv.ghost }}>{p.overdue || "—"}</span>
            <LoadBar load={p.load} />
            <span style={{ fontSize: 12.5, color: cv.muted }}>{p.due}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Таблица (Twenty-style data grid) ───────
const sv = (paths, props = {}) => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" {...props}>{paths}</svg>
);
const COL_ICON = {
  name:   sv(<><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>),
  dept:   sv(<><path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" /></>),
  role:   sv(<><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>),
  status: sv(<circle cx="12" cy="12" r="9" />),
  load:   sv(<><path d="M3 3v18h18" /><path d="M7 16l4-4 3 3 5-6" /></>),
  kind:   sv(<><rect x="4" y="8" width="16" height="11" rx="3" /><path d="M12 4v4M9 13h.01M15 13h.01" /></>),
  tasks:  sv(<><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>),
  due:    sv(<><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>),
};

const GRID = "1.7fr 1.1fr 1.2fr 0.9fr 1.2fr 0.8fr 0.7fr 0.9fr";

function Chip({ dot, children }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      maxWidth: "100%", padding: "2px 9px 2px 8px",
      background: cv.bgCard, border: `1px solid ${cv.border}`, borderRadius: 6,
      fontSize: 12.5, color: cv.text, whiteSpace: "nowrap",
      overflow: "hidden", textOverflow: "ellipsis",
    }}>
      {dot && <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot, flexShrink: 0 }} />}
      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{children}</span>
    </span>
  );
}

const COLS = [
  { id: "name",   label: "Имя" },
  { id: "dept",   label: "Отдел" },
  { id: "role",   label: "Должность" },
  { id: "kind",   label: "Тип" },
  { id: "status", label: "Статус" },
  { id: "tasks",  label: "Задач" },
  { id: "overdue",label: "Просроч.", iconId: "tasks" },
  { id: "load",   label: "Загрузка" },
];

function TableView({ onPick }) {
  const [sort, setSort] = useState({ col: "load", dir: "desc" });
  const toggleSort = (col) => setSort(s =>
    s.col === col ? { col, dir: s.dir === "asc" ? "desc" : "asc" } : { col, dir: "asc" });

  const val = (p, col) => {
    if (col === "name") return p.name;
    if (col === "dept") return deptOf(p.dept).name;
    if (col === "role") return p.role;
    if (col === "kind") return p.kind;
    if (col === "status") return p.status;
    if (col === "tasks") return p.active;
    if (col === "overdue") return p.overdue;
    if (col === "load") return p.load;
    return "";
  };
  const rows = [...STAFF].sort((a, b) => {
    const av = val(a, sort.col), bv = val(b, sort.col);
    const cmp = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv), "ru");
    return sort.dir === "asc" ? cmp : -cmp;
  });

  const avgLoad = Math.round(STAFF.reduce((s, p) => s + p.load, 0) / STAFF.length);
  const totalActive = STAFF.reduce((s, p) => s + p.active, 0);
  const totalOverdue = STAFF.reduce((s, p) => s + (p.overdue || 0), 0);
  const aiCount = STAFF.filter(p => p.kind === "ai").length;

  return (
    <div style={{ border: `1px solid ${cv.border}`, borderRadius: 12, overflow: "hidden", background: cv.bg }}>
      {/* Бар вида */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "9px 14px", borderBottom: `1px solid ${cv.border}`,
      }}>
        <span style={{ display: "inline-flex", color: cv.muted }}>
          {sv(<><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></>)}
        </span>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: cv.text }}>Все сотрудники</span>
        <span style={{ fontSize: 12.5, color: cv.muted }}>· {STAFF.length}</span>
        <div style={{ flex: 1 }} />
        {[
          { id: "filter", label: "Фильтр", icon: <><path d="M3 4h18l-7 9v6l-4 2v-8z" /></> },
          { id: "sort",   label: "Сортировка", icon: <><path d="M3 6h12M3 12h9M3 18h6M17 4v16M17 20l3-3M17 20l-3-3" /></> },
          { id: "opts",   label: "Опции", icon: <><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></> },
        ].map(b => (
          <button key={b.id}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "5px 10px", background: "transparent", border: "none",
              borderRadius: 7, fontSize: 12.5, fontWeight: 500, color: cv.muted,
              cursor: "pointer", fontFamily: "inherit", transition: transition.fast,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = cv.hover; e.currentTarget.style.color = cv.text; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = cv.muted; }}
          >
            <span style={{ display: "inline-flex" }}>{sv(b.icon, { width: 13, height: 13 })}</span>
            {b.label}
          </button>
        ))}
      </div>

      <div style={{ overflowX: "auto" }}>
      <div style={{ minWidth: 880 }}>
      {/* Шапка колонок */}
      <div style={{
        display: "grid", gridTemplateColumns: GRID,
        padding: "0 16px", background: cv.bgCard, borderBottom: `1px solid ${cv.border}`,
      }}>
        {COLS.map(c => {
          const sorted = sort.col === c.id;
          return (
            <button key={c.id} onClick={() => toggleSort(c.id)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "9px 0", background: "transparent", border: "none",
                fontSize: 12, fontWeight: 600, color: sorted ? cv.text : cv.muted,
                cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                minWidth: 0,
              }}
            >
              <span style={{ display: "inline-flex", color: cv.muted }}>{COL_ICON[c.iconId || c.id]}</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.label}</span>
              {sorted && (
                <span style={{ fontSize: 9, color: cv.muted }}>{sort.dir === "asc" ? "▲" : "▼"}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Строки */}
      {rows.map((p, i) => {
        const d = deptOf(p.dept);
        return (
          <div key={p.id} onClick={() => onPick(p.id)}
            style={{
              display: "grid", gridTemplateColumns: GRID,
              padding: "8px 16px", alignItems: "center", cursor: "pointer",
              borderTop: i === 0 ? "none" : `1px solid ${cv.border}`,
              transition: transition.fast,
            }}
            onMouseEnter={e => e.currentTarget.style.background = cv.hover}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <Avatar p={p} size={26} />
              <span style={{ fontSize: 13, fontWeight: 500, color: cv.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
            </span>
            <span style={{ minWidth: 0 }}><Chip dot={d.color}>{d.name}</Chip></span>
            <span style={{ fontSize: 12.5, color: cv.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.role}</span>
            <span style={{ minWidth: 0 }}>
              {p.kind === "ai"
                ? <Chip dot="#8A38F5">AI-агент</Chip>
                : <Chip dot={p.color}>Сотрудник</Chip>}
            </span>
            <span><StatusDot status={p.status} withLabel /></span>
            <span style={{ fontSize: 13, fontWeight: 600, color: cv.text }}>{p.active}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: p.overdue ? "#FF3B30" : cv.ghost }}>{p.overdue || "—"}</span>
            <LoadBar load={p.load} />
          </div>
        );
      })}

      {/* Calculate-футер */}
      <div style={{
        display: "grid", gridTemplateColumns: GRID,
        padding: "10px 16px", borderTop: `1px solid ${cv.border}`,
        background: cv.bgCard, fontSize: 12, color: cv.muted,
      }}>
        <span>Всего <b style={{ color: cv.text }}>{STAFF.length}</b></span>
        <span />
        <span />
        <span>AI <b style={{ color: cv.text }}>{aiCount}</b></span>
        <span />
        <span>Σ <b style={{ color: cv.text }}>{totalActive}</b></span>
        <span style={{ color: totalOverdue ? "#FF3B30" : cv.muted }}>Σ <b>{totalOverdue}</b></span>
        <span>Сред. <b style={{ color: cv.text }}>{avgLoad}%</b></span>
      </div>
      </div>
      </div>
    </div>
  );
}

// ── Drawer профиля ─────────────────────────
function PersonDrawer({ p, onClose }) {
  if (!p) return null;
  const d = deptOf(p.dept);
  const boss = p.boss ? STAFF.find(x => x.id === p.boss) : null;
  const tasks = [
    { t: "Контент-план на июнь", due: "Сегодня", st: "doing" },
    { t: "Согласовать 3 поста с " + (boss?.name?.split(" ")[0] || "руководителем"), due: "Завтра", st: "wait" },
    { t: "Разобрать входящие заявки", due: "Пт", st: "doing" },
  ].slice(0, Math.min(3, p.active));
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.2)", zIndex: 60 }} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 400, maxWidth: "90vw",
        background: cv.bg, borderLeft: `1px solid ${cv.border}`, zIndex: 61,
        display: "flex", flexDirection: "column", boxShadow: "-8px 0 24px rgba(0,0,0,0.08)",
        overflowY: "auto",
      }}>
        <div style={{ padding: "20px 22px", borderBottom: `1px solid ${cv.border}`, display: "flex", gap: 14 }}>
          <Avatar p={p} size={52} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 17, fontWeight: 600, color: cv.text }}>{p.name}</span>
              {p.kind === "ai" && <AiBadge />}
            </div>
            <div style={{ fontSize: 13, color: cv.muted, marginTop: 2 }}>{p.role}</div>
            <div style={{ marginTop: 8 }}><StatusDot status={p.status} withLabel /></div>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, border: "none", background: "transparent", cursor: "pointer", color: cv.muted, fontSize: 18, fontFamily: "inherit" }}>×</button>
        </div>

        <div style={{ padding: "16px 22px", display: "flex", gap: 10 }}>
          {[
            { n: p.active, l: "Активных", c: cv.text },
            { n: p.overdue, l: "Просрочено", c: p.overdue ? "#FF3B30" : cv.text },
            { n: p.done, l: "Выполнено", c: "#34C759" },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, padding: "12px", borderRadius: 10, background: cv.bgCard, border: `1px solid ${cv.border}`, textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.c }}>{s.n}</div>
              <div style={{ fontSize: 11, color: cv.muted, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: "0 22px 8px" }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: cv.muted, marginBottom: 8 }}>Загрузка</div>
          <LoadBar load={p.load} />
        </div>

        <div style={{ padding: "12px 22px 0", display: "flex", flexDirection: "column" }}>
          <Field label="Отдел" value={<span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />{d.name}</span>} />
          <Field label="Тип" value={p.kind === "ai" ? "AI-агент" : "Сотрудник"} />
          {boss && <Field label="Руководитель" value={boss.name} />}
          {p.lead && <Field label="Роль" value="Руководитель отдела" />}
        </div>

        <div style={{ padding: "16px 22px 22px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: cv.muted, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>Текущие задачи</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tasks.length ? tasks.map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9, border: `1px solid ${cv.border}` }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: t.st === "doing" ? "#FF8B3D" : "#9AA0A6", flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, color: cv.text }}>{t.t}</span>
                <span style={{ fontSize: 11.5, color: cv.muted }}>{t.due}</span>
              </div>
            )) : <div style={{ fontSize: 13, color: cv.ghost }}>Нет активных задач</div>}
          </div>
        </div>
      </div>
    </>
  );
}

function Field({ label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: `1px solid ${cv.border}` }}>
      <span style={{ fontSize: 12.5, color: cv.muted, width: 110, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: cv.text, fontWeight: 500 }}>{value}</span>
    </div>
  );
}

// ── Главная страница ───────────────────────
export function StaffPage() {
  const [view, setView] = useState("org"); // org | load
  const [activeId, setActiveId] = useState(null);
  const active = STAFF.find(p => p.id === activeId);

  const total = STAFF.length;
  const online = STAFF.filter(p => p.status === "online").length;
  const ai = STAFF.filter(p => p.kind === "ai").length;
  const overdue = STAFF.reduce((s, p) => s + (p.overdue || 0), 0);

  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0, background: cv.bg, overflow: "hidden" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowY: "auto" }}>
        <div style={{ padding: "26px 40px 18px", maxWidth: 1300 }}>
          {/* breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 12.5, color: cv.muted }}>
            <span>Компания</span><span>›</span>
            <span style={{ padding: "2px 8px", background: cv.bgCard, borderRadius: 5, color: cv.text, fontWeight: 500 }}>Сотрудники</span>
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 600, color: cv.text, margin: "0 0 18px", letterSpacing: "-0.01em" }}>Сотрудники</h1>

          {/* summary */}
          <div style={{ display: "flex", gap: 12, marginBottom: 22 }}>
            {[
              { n: total,   l: "Всего в команде", c: cv.text },
              { n: online,  l: "В сети сейчас",    c: "#34C759" },
              { n: ai,      l: "AI-агентов",       c: "#8A38F5" },
              { n: overdue, l: "Просроч. задач",   c: overdue ? "#FF3B30" : cv.text },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, padding: "14px 16px", borderRadius: 12, background: cv.bgCard, border: `1px solid ${cv.border}` }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: s.c, letterSpacing: "-0.02em" }}>{s.n}</div>
                <div style={{ fontSize: 12.5, color: cv.muted, marginTop: 3 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 22 }}>
            {[{ id: "org", label: "Оргструктура" }, { id: "table", label: "Таблица" }, { id: "load", label: "Нагрузка" }].map(tb => (
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

          {view === "org" ? <OrgView onPick={setActiveId} />
            : view === "table" ? <TableView onPick={setActiveId} />
            : <LoadView onPick={setActiveId} />}
        </div>
      </div>

      {active && <PersonDrawer p={active} onClose={() => setActiveId(null)} />}
    </div>
  );
}

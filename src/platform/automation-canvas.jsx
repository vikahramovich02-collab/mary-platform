// AutomationCanvas — визуальный workflow одной автоматизации (n8n-style):
// Триггер (Start) → таски с исполнителем (@агент / человек) → ветки/циклы → End.
// Pan (drag) + zoom (wheel), SVG-безье связи с подписями (хорошо/плохо/возврат).
// Дизайн в языке прототипа: белые скруглённые карточки, порты, мягкие тени.
import { useState, useRef, useEffect, useCallback } from "react";
import { color } from "../ui/tokens.js";

const NODE_W = 196;
const NODE_H = 66;

// ── иконки блоков ─────────────────────────────────────────────────────────
const I = {
  bolt: <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 L4 14 h7 v8 l9 -12 h-7 z" /></svg>,
  agent: <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor"><rect x="11.25" y="2" width="1.5" height="3" rx=".75" /><rect x="4.5" y="5.5" width="15" height="15" rx="4.5" /><circle cx="9.3" cy="13" r="1.4" fill="#fff" /><circle cx="14.7" cy="13" r="1.4" fill="#fff" /></svg>,
  human: <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><circle cx="12" cy="8" r="3.2" /><path d="M5 20v-1a7 7 0 0 1 14 0v1" /></svg>,
  flag: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 22V4h13l-2 4 2 4H5" /></svg>,
  timer: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><circle cx="12" cy="13" r="7" /><path d="M12 13V9M9 2h6" /></svg>,
  chat: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-11.7 7.7L3 21l1.8-6.3A8.4 8.4 0 1 1 21 11.5z" /></svg>,
  inbox: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h5l2 3h4l2-3h5" /><path d="M5 7l-2 5v6h18v-6l-2-5z" /></svg>,
};

const TRIGGER_ICON = { event: I.bolt, timer: I.timer, chat: I.chat, delegation: I.bolt, incoming: I.inbox };
const TRIGGER_KIND_LABEL = { event: "Событие", timer: "Таймер · крон", chat: "Запрос в чате", delegation: "Делегирование", incoming: "Входящее" };

const EDGE_COLOR = { good: color.green, bad: color.red, loop: color.orange, default: "rgba(38,38,51,0.28)" };
const END_STYLE = {
  success: { c: color.green, bg: "rgba(52,199,89,0.10)" },
  reject:  { c: color.red,   bg: "rgba(255,52,7,0.08)" },
  return:  { c: color.orange,bg: "rgba(255,77,0,0.08)" },
};

// ── связь между нодами ──────────────────────────────────────────────────────
function edgePath(a, b, kind) {
  const ax = a.x + NODE_W, ay = a.y + NODE_H / 2;
  const bx = b.x, by = b.y + NODE_H / 2;
  if (kind === "loop" || bx < ax - 20) {
    // петля назад: выходим снизу из a, дугой вниз и обратно ко дну b
    const aDown = a.y + NODE_H, bDown = b.y + NODE_H;
    const dip = Math.max(aDown, bDown) + 64;
    const sx = a.x + NODE_W / 2, tx = b.x + NODE_W / 2;
    return `M ${sx} ${aDown} C ${sx} ${dip}, ${tx} ${dip}, ${tx} ${bDown}`;
  }
  const dx = Math.max(40, (bx - ax) * 0.5);
  return `M ${ax} ${ay} C ${ax + dx} ${ay}, ${bx - dx} ${by}, ${bx} ${by}`;
}
function edgeMid(a, b, kind) {
  if (kind === "loop" || b.x < a.x - 20) {
    return { x: (a.x + b.x) / 2 + NODE_W / 2, y: Math.max(a.y, b.y) + NODE_H + 64 };
  }
  return { x: (a.x + NODE_W + b.x) / 2, y: (a.y + b.y) / 2 + NODE_H / 2 };
}

// ── узлы ────────────────────────────────────────────────────────────────────
function Port({ side }) {
  return <span style={{
    position: "absolute", [side]: -4, top: "50%", transform: "translateY(-50%)",
    width: 8, height: 8, borderRadius: "50%", background: color.white,
    border: "1px solid rgba(38,38,51,0.18)",
  }} />;
}

function TriggerNode({ n, onClick, active }) {
  return (
    <button onClick={onClick} style={{
      position: "absolute", left: n.x, top: n.y, width: NODE_W, height: NODE_H,
      background: color.white, border: `1.5px solid ${active ? color.purple : color.blue}`, borderRadius: 16,
      boxShadow: active ? `0 0 0 4px ${color.purpleBg}, 0 4px 14px ${color.purple}33` : `0 4px 14px ${color.blue}22`, display: "flex", alignItems: "center", gap: 10,
      padding: "0 13px", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
    }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(7,148,255,0.10)", color: color.blue, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {TRIGGER_ICON[n.kind] || I.bolt}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: color.blue, textTransform: "uppercase", letterSpacing: "0.04em" }}>{TRIGGER_KIND_LABEL[n.kind] || "Старт"}</div>
        <div style={{ fontSize: 12.5, fontWeight: 510, color: "#262633", lineHeight: 1.2, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</div>
      </div>
      <Port side="right" />
    </button>
  );
}

function TaskNode({ n, onClick, active }) {
  const isHuman = n.agentKind === "human";
  const control = {
    condition: { label: "Условие", c: color.orange, bg: "rgba(255,77,0,.09)" },
    wait: { label: "Ожидание", c: color.blue, bg: color.blueBg },
    approval: { label: "Апрув человека", c: color.purple, bg: color.purpleBg },
    escalation: { label: "Эскалация", c: color.red, bg: color.redBg },
    delegation: { label: "Делегирование", c: color.green, bg: color.greenBg },
    read: { label: "Чтение · r", c: color.blue, bg: color.blueBg },
    write: { label: "Запись · w", c: color.green, bg: color.greenBg },
  }[n.type];
  const chipC = control?.c || (isHuman ? color.purple : "#262633");
  const chipBg = control?.bg || (isHuman ? "rgba(138,56,245,0.10)" : "rgba(38,38,51,0.06)");
  return (
    <button onClick={onClick} style={{
      position: "absolute", left: n.x, top: n.y, width: NODE_W, height: NODE_H,
      background: color.white, border: `1.5px solid ${active ? color.purple : color.border}`, borderRadius: 16,
      boxShadow: active ? `0 0 0 4px ${color.purpleBg}, 0 4px 14px ${color.purple}33` : "0 1px 3px rgba(38,38,51,0.06)", display: "flex", flexDirection: "column",
      justifyContent: "center", gap: 5, padding: "0 13px", cursor: "pointer",
      fontFamily: "inherit", textAlign: "left",
    }}>
      {control && <div style={{ color: control.c, fontSize: 9.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase" }}>{control.label}</div>}
      <div style={{ fontSize: 12.5, fontWeight: 510, color: "#262633", lineHeight: 1.25, display: "-webkit-box", WebkitLineClamp: control ? 1 : 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{n.title}</div>
      {n.agent && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, alignSelf: "flex-start", padding: "2px 7px", borderRadius: 999, background: chipBg, color: chipC, fontSize: 10.5, fontWeight: 500 }}>
          <span style={{ display: "inline-flex" }}>{isHuman ? I.human : I.agent}</span>{n.agent}
        </span>
      )}
      <Port side="left" /><Port side="right" />
    </button>
  );
}

function EndNode({ n, onClick, active }) {
  const st = END_STYLE[n.outcome] || END_STYLE.success;
  return (
    <button onClick={onClick} style={{
      position: "absolute", left: n.x, top: n.y, width: NODE_W, height: NODE_H,
      background: st.bg, border: `1.5px solid ${active ? color.purple : st.c}`, borderRadius: 16,
      boxShadow: active ? `0 0 0 4px ${color.purpleBg}, 0 4px 14px ${color.purple}33` : "none",
      display: "flex", alignItems: "center", gap: 10, padding: "0 13px",
      cursor: "pointer", fontFamily: "inherit", textAlign: "left",
    }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: color.white, color: st.c, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{I.flag}</div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: st.c, textTransform: "uppercase", letterSpacing: "0.04em" }}>Конец</div>
        <div style={{ fontSize: 12.5, fontWeight: 510, color: "#262633", lineHeight: 1.2, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</div>
      </div>
      <Port side="left" />
    </button>
  );
}

// ── канвас ──────────────────────────────────────────────────────────────────
export function AutomationCanvas({ automation, onNodeClick, activeNodeId }) {
  const wrapRef = useRef(null);
  const [view, setView] = useState({ x: 40, y: 40, scale: 1 });
  const drag = useRef(null);

  const byId = useCallback((id) => automation.nodes.find(n => n.id === id), [automation]);

  // fit при монтировании / смене автоматизации
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const xs = automation.nodes.map(n => n.x);
    const ys = automation.nodes.map(n => n.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs) + NODE_W;
    const minY = Math.min(...ys), maxY = Math.max(...ys) + NODE_H + 90;
    const w = maxX - minX + 80, h = maxY - minY + 80;
    const scale = Math.min(r.width / w, r.height / h, 1);
    setView({ x: r.width / 2 - ((minX + maxX) / 2) * scale, y: r.height / 2 - ((minY + maxY) / 2) * scale, scale });
  }, [automation]);

  const onWheel = (e) => {
    e.preventDefault();
    setView(v => {
      const ns = Math.min(1.6, Math.max(0.35, v.scale * (e.deltaY < 0 ? 1.08 : 0.92)));
      const r = wrapRef.current.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      return { scale: ns, x: mx - (mx - v.x) * (ns / v.scale), y: my - (my - v.y) * (ns / v.scale) };
    });
  };
  const onDown = (e) => { drag.current = { sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y }; };
  const onMove = (e) => { if (!drag.current) return; setView(v => ({ ...v, x: drag.current.vx + (e.clientX - drag.current.sx), y: drag.current.vy + (e.clientY - drag.current.sy) })); };
  const onUp = () => { drag.current = null; };

  return (
    <div ref={wrapRef} onWheel={onWheel} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
      style={{
        position: "relative", width: "100%", height: "100%", overflow: "hidden",
        background: color.white,
        backgroundImage: "radial-gradient(rgba(38,38,51,0.07) 1px, transparent 1px)",
        backgroundSize: "22px 22px", cursor: drag.current ? "grabbing" : "grab",
      }}>
      <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`, transformOrigin: "0 0" }}>
        {/* связи */}
        <svg style={{ position: "absolute", overflow: "visible", pointerEvents: "none", left: 0, top: 0 }}>
          {automation.edges.map((e, i) => {
            const a = byId(e.from), b = byId(e.to);
            if (!a || !b) return null;
            const c = EDGE_COLOR[e.kind || "default"];
            return (
              <g key={i}>
                <path d={edgePath(a, b, e.kind)} fill="none" stroke={c} strokeWidth={1.6}
                  markerEnd={`url(#arrow-${e.kind || "default"})`} />
              </g>
            );
          })}
          <defs>
            {Object.entries(EDGE_COLOR).map(([k, c]) => (
              <marker key={k} id={`arrow-${k}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill={c} />
              </marker>
            ))}
          </defs>
        </svg>
        {/* подписи связей */}
        {automation.edges.filter(e => e.label).map((e, i) => {
          const a = byId(e.from), b = byId(e.to);
          if (!a || !b) return null;
          const m = edgeMid(a, b, e.kind);
          const c = EDGE_COLOR[e.kind || "default"];
          return (
            <span key={i} style={{
              position: "absolute", left: m.x, top: m.y, transform: "translate(-50%,-50%)",
              padding: "2px 8px", borderRadius: 999, background: color.white,
              border: `1px solid ${c}`, color: c, fontSize: 10.5, fontWeight: 600, whiteSpace: "nowrap",
            }}>{e.label}</span>
          );
        })}
        {/* ноды */}
        {automation.nodes.map(n => {
          const click = () => onNodeClick && onNodeClick(n);
          if (n.type === "trigger") return <TriggerNode key={n.id} n={n} onClick={click} active={n.id === activeNodeId} />;
          if (n.type === "end") return <EndNode key={n.id} n={n} onClick={click} active={n.id === activeNodeId} />;
          return <TaskNode key={n.id} n={n} onClick={click} active={n.id === activeNodeId} />;
        })}
      </div>
    </div>
  );
}

// ── пример автоматизации (из концепта: Отдел снабжения → «Закупка по заявке») ──
export const SAMPLE_AUTOMATION = {
  id: "procure-by-request",
  title: "Закупка по заявке",
  dept: "Отдел снабжения",
  trigger: "chat",
  nodes: [
    { id: "trg", type: "trigger", kind: "chat", title: "«Сделай закупку»", x: 20, y: 220 },
    { id: "t1", type: "task", title: "Принять и оформить заявку", agent: "Закупщик", agentKind: "agent", x: 280, y: 220 },
    { id: "t2", type: "task", title: "Проверка документов и лимитов", agent: "Закупщик", agentKind: "agent", x: 540, y: 220 },
    { id: "t3", type: "task", title: "Подбор поставщиков, сравнение цен", agent: "Закупщик", agentKind: "agent", x: 800, y: 220 },
    { id: "t4", type: "task", title: "Согласование с руководителем", agent: "Руководитель", agentKind: "human", x: 1060, y: 220 },
    { id: "t5", type: "task", title: "Провести оплату", agent: "Закупщик", agentKind: "agent", x: 1320, y: 120 },
    { id: "endOk", type: "end", outcome: "success", title: "Заявка закрыта", x: 1580, y: 120 },
    { id: "endNo", type: "end", outcome: "reject", title: "Отказ в закупке", x: 1320, y: 330 },
  ],
  edges: [
    { from: "trg", to: "t1" },
    { from: "t1", to: "t2" },
    { from: "t2", to: "t3" },
    { from: "t3", to: "t4", label: "цена ок", kind: "good" },
    { from: "t3", to: "t2", label: "дорого", kind: "loop" },
    { from: "t4", to: "t5", label: "да", kind: "good" },
    { from: "t4", to: "endNo", label: "нет", kind: "bad" },
    { from: "t5", to: "endOk" },
  ],
};

// Первый рабочий сценарий из гайда: агент работает автономно до спорного случая.
export const SALON_BOOKING_AUTOMATION = {
  id: "salon-direct-booking",
  title: "Запись из Direct",
  dept: "Клиенты · салон",
  trigger: "incoming",
  nodes: [
    { id: "direct", type: "trigger", kind: "incoming", title: "Сообщение в Direct", x: 20, y: 220 },
    { id: "intent", type: "task", title: "Распознать услугу и пожелание", agent: "Агент записи", agentKind: "agent", x: 280, y: 220 },
    { id: "read-data", type: "read", title: "Прочитать: прайс, графики, журнал", agent: "Агент записи", agentKind: "agent", x: 540, y: 220 },
    { id: "slots", type: "task", title: "Проверить доступность окон", agent: "Агент записи", agentKind: "agent", x: 800, y: 220 },
    { id: "offer", type: "task", title: "Предложить свободные окна", agent: "Агент записи", agentKind: "agent", x: 1060, y: 220 },
    { id: "wait-choice", type: "wait", title: "Ждать выбор клиента", x: 1320, y: 220 },
    { id: "choice", type: "condition", title: "Выбрано доступное время?", x: 1580, y: 220 },
    { id: "book", type: "write", title: "Записать визит в журнал", agent: "Агент записи", agentKind: "agent", x: 1840, y: 110 },
    { id: "delegate-reminder", type: "delegation", title: "Запустить «Напоминание о визите»", x: 2100, y: 110 },
    { id: "ok", type: "end", outcome: "success", title: "Визит подтверждён", x: 2360, y: 110 },
    { id: "human", type: "escalation", title: "Передать владельцу", agent: "Ирина", agentKind: "human", x: 1840, y: 370 },
    { id: "escalated", type: "end", outcome: "return", title: "Карточка во Входящих", x: 2100, y: 370 },
  ],
  edges: [
    { from: "direct", to: "intent" }, { from: "intent", to: "read-data" }, { from: "read-data", to: "slots" }, { from: "slots", to: "offer" }, { from: "offer", to: "wait-choice" }, { from: "wait-choice", to: "choice" },
    { from: "choice", to: "book", label: "да", kind: "good" }, { from: "book", to: "delegate-reminder" }, { from: "delegate-reminder", to: "ok" },
    { from: "choice", to: "human", label: "нет / спорно", kind: "bad" }, { from: "human", to: "escalated" },
  ],
};

export const SALON_REMINDER_AUTOMATION = {
  id: "salon-visit-reminder",
  title: "Напоминание о визите",
  dept: "Клиенты · салон",
  trigger: "timer",
  nodes: [
    { id: "timer", type: "trigger", kind: "timer", title: "За 48 часов до визита", x: 20, y: 220 },
    { id: "find", type: "task", title: "Собрать визиты на дату", agent: "Агент записи", agentKind: "agent", x: 280, y: 220 },
    { id: "send", type: "task", title: "Отправить «да / перенести»", agent: "Агент записи", agentKind: "agent", x: 540, y: 220 },
    { id: "wait-answer", type: "wait", title: "Ждать ответ клиента 24 часа", x: 800, y: 220 },
    { id: "answer", type: "condition", title: "Какой ответ получен?", x: 1060, y: 220 },
    { id: "confirmed", type: "end", outcome: "success", title: "Подтверждено", x: 1320, y: 100 },
    { id: "reschedule", type: "task", title: "Предложить новые слоты", agent: "Агент записи", agentKind: "agent", x: 1320, y: 260 },
    { id: "moved", type: "end", outcome: "return", title: "Визит перенесён", x: 1580, y: 260 },
    { id: "silent", type: "end", outcome: "reject", title: "Нет ответа: пометка админу", x: 1320, y: 420 },
  ],
  edges: [
    { from: "timer", to: "find" }, { from: "find", to: "send" }, { from: "send", to: "wait-answer" }, { from: "wait-answer", to: "answer" },
    { from: "answer", to: "confirmed", label: "приду", kind: "good" }, { from: "answer", to: "reschedule", label: "перенести", kind: "bad" }, { from: "reschedule", to: "moved" }, { from: "answer", to: "silent", label: "нет ответа", kind: "bad" },
  ],
};

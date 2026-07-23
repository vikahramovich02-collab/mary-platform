import { useState } from "react";
import { color } from "../../ui/tokens.js";
import workflowDsl from "../../../workflows/clients/booking.md?raw";

const NODES = {
  trigger: { title: "Сообщение клиента", sub: "Instagram / WhatsApp", brief: "Получить новое обращение клиента", output: "Новое обращение", icon: "↙", type: "Триггер", text: "Новое входящее сообщение запускает workflow. Его можно подключить к Instagram, WhatsApp, Telegram или другому каналу." },
  task1: { title: "Понять запрос", brief: "Определить услугу, дату и пожелания", output: "Услуга и желаемое время", icon: "⌁", type: "Задача 1", chips: [["agent", "Агент-Администратор"], ["knowledge", "Услуги и цены"], ["memory", "История и предпочтения"]], text: "Агент определяет услугу, желаемую дату и контекст клиента. Он читает прайс, а также видит прошлые визиты и предпочтения клиента: например, любимого мастера." },
  task2: { title: "Найти свободные окна", brief: "Сверить графики мастеров и визиты", output: "Подходящие слоты", icon: "◫", type: "Задача 2", chips: [["agent", "Агент-Администратор"], ["data", "Данные: календарь мастеров"]], text: "Агент читает рабочие данные: графики мастеров и уже созданные визиты. Он не предлагает занятый слот." },
  condition: { title: "Окно есть?", sub: "if / else", type: "Ветка", text: "Это точка принятия решения. Условие направляет кейс по одной из веток, а не заставляет человека выбирать технический шаг." },
  yes: { title: "Записать визит", brief: "Создать визит и подтвердить клиенту", output: "Визит в CRM и подтверждение", icon: "✓", type: "Задача 3", chips: [["agent", "Агент-Администратор"], ["data", "Запись в CRM"], ["integration", "Instagram / WhatsApp"]], text: "Агент записывает визит в CRM и отправляет клиенту подтверждение. Это записывающий шаг w и внешнее действие a." },
  no: { title: "Предложить ближайшее", brief: "Показать альтернативы или лист ожидания", output: "Варианты отправлены клиенту", icon: "↗", type: "Задача 3", chips: [["agent", "Агент-Администратор"], ["data", "Лист ожидания"]], text: "Если окна нет, Mary предлагает альтернативные слоты или добавляет клиента в лист ожидания." },
  approval: { title: "Решение владельца", brief: "Передать спорный случай на решение", output: "Решение владельца", icon: "?", type: "Апрув", chips: [["agent", "Владелец салона"], ["integration", "Входящие Mary"]], text: "Сюда попадают только нестандартные случаи: конфликт записи, особая скидка, неясная услуга или отмена день-в-день. Агент ждёт решения владельца." },
  handoff: { title: "Передано владельцу", sub: "ждёт решения", type: "Конец · передача", text: "Кейс создан во Входящих. После решения владельца Mary продолжит сценарий с учётом выбранного действия." },
  end: { title: "Клиент записан", sub: "успех", type: "Конец", text: "Workflow завершён. Визит есть в CRM, клиент получил ответ, а напоминание будет запущено отдельной автоматизацией." },
};

function ChipIcon({ kind, inverse = false }) {
  const icon = { agent: "♟", knowledge: "▤", memory: "◉", data: "▦", integration: "↗" }[kind] || "•";
  return <span style={{ width: 15, height: 15, display: "inline-grid", placeItems: "center", borderRadius: 5, background: inverse ? "rgba(255,255,255,.18)" : "rgba(38,38,51,.08)", color: inverse ? "#FFFFFF" : "rgba(38,38,51,.62)", fontSize: 10, fontWeight: 800, lineHeight: 1 }}>{icon}</span>;
}

function FlowCard({ id, selected, onClick, className = "" }) {
  const node = NODES[id];
  const actor = node.chips?.find(([kind]) => kind === "agent")?.[1]?.replace(/^Агент-/, "");
  return <button onClick={() => onClick(id)} className={className} style={{ width: 260, minHeight: 94, padding: "16px 18px", textAlign: "left", border: selected ? "2px solid #262633" : "1px solid rgba(38,38,51,.07)", borderRadius: 23, background: "#FFFFFF", color: color.ink, fontFamily: "inherit", cursor: "pointer", boxShadow: selected ? "0 10px 25px rgba(38,38,51,.12)" : "0 2px 8px rgba(38,38,51,.04)", position: "relative", zIndex: 2, transition: "all .16s ease" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}><span style={{ width: 28, height: 28, display: "grid", placeItems: "center", borderRadius: 9, background: "#F0F0F0", color: color.ink, fontSize: 16, fontWeight: 750 }}>{node.icon || "•"}</span><div style={{ minWidth: 0, flex: 1, fontWeight: 700, fontSize: 16, letterSpacing: "-.025em", lineHeight: 1.12 }}>{node.title}</div>{actor ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 12px", background: "#E8E8E8", borderRadius: 999, color: "#3C3C3C", fontSize: 10.5, fontWeight: 700, lineHeight: 1, whiteSpace: "nowrap" }}><ChipIcon kind="agent" />{actor}</span> : <span style={{ color: "rgba(38,38,51,.48)", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>{node.type}</span>}</div>
  </button>;
}

function BookingDiagram({ active, onSelect }) {
  const [zoom, setZoom] = useState(1);
  const changeZoom = delta => setZoom(value => Math.max(0.6, Math.min(1.4, Number((value + delta).toFixed(2)))));
  const card = (id, x, y) => <div key={id} style={{ position: "absolute", left: x, top: y }}><FlowCard id={id} selected={active === id} onClick={onSelect} /></div>;
  return <div style={{ minHeight: 900, position: "relative", background: "#DEDEDE", border: "1px solid #D5D5D5", borderRadius: 28, overflow: "hidden" }}>
    <div style={{ position: "absolute", zIndex: 5, top: 16, right: 16, display: "flex", alignItems: "center", gap: 4, padding: 4, borderRadius: 14, background: "rgba(255,255,255,.92)", boxShadow: "0 3px 12px rgba(38,38,51,.11)" }}><button onClick={() => changeZoom(-0.1)} aria-label="Уменьшить масштаб" style={{ width: 32, height: 32, border: "none", borderRadius: 9, background: "transparent", cursor: "pointer", fontSize: 20, color: color.ink }}>−</button><button onClick={() => setZoom(1)} style={{ minWidth: 53, height: 32, border: "none", borderRadius: 9, background: "#F2F2EF", cursor: "pointer", font: "650 11px inherit", color: color.ink }}>{Math.round(zoom * 100)}%</button><button onClick={() => changeZoom(0.1)} aria-label="Увеличить масштаб" style={{ width: 32, height: 32, border: "none", borderRadius: 9, background: "transparent", cursor: "pointer", fontSize: 20, color: color.ink }}>+</button></div>
    <div style={{ width: "100%", height: 900, overflow: "auto" }}>
      <div style={{ width: 1680 * zoom, height: 880 * zoom, padding: 42 * zoom, boxSizing: "border-box" }}>
        <div style={{ position: "relative", width: 1600, height: 800, transform: `scale(${zoom})`, transformOrigin: "top left" }}>
          <svg aria-hidden="true" width="1600" height="800" style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}><defs><marker id="workflow-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#262633" fillOpacity=".58" /></marker></defs><g fill="none" stroke="rgba(38,38,51,.58)" strokeWidth="2" markerEnd="url(#workflow-arrow)"><path d="M290 276 C296 276 296 276 302 276" /><path d="M562 276 C568 276 568 276 574 276" /><path d="M834 276 C844 276 844 276 854 276" /><path d="M970 276 C1000 276 1000 163 1030 163" /><path d="M970 276 C1000 276 1000 408 1030 408" /><path d="M1290 163 C1299 163 1299 276 1308 276" /><path d="M1290 408 C1299 408 1299 276 1308 276" /><path d="M1160 456 C1160 478 1160 478 1160 500" /><path d="M1290 548 C1299 548 1299 548 1308 548" /></g></svg>
          {card("trigger", 30, 228)}{card("task1", 302, 228)}{card("task2", 574, 228)}
          <button onClick={() => onSelect("condition")} style={{ position: "absolute", left: 854, top: 218, width: 116, height: 116, transform: "rotate(45deg)", border: active === "condition" ? "2px solid #262633" : "1px solid rgba(38,38,51,.05)", borderRadius: 22, background: active === "condition" ? "#FFFFFF" : "linear-gradient(135deg, #F7F7F5, #EFEFED)", cursor: "pointer", zIndex: 2, boxShadow: active === "condition" ? "0 8px 22px rgba(38,38,51,.12)" : "0 2px 7px rgba(38,38,51,.04)" }}><span style={{ display: "block", transform: "rotate(-45deg)", font: "700 14px inherit", letterSpacing: "-.02em", color: color.ink }}>Окно<br />есть?</span></button>
          <span style={{ position: "absolute", top: 140, left: 982, color: "#368C4B", fontSize: 11, fontWeight: 750 }}>окно есть</span><span style={{ position: "absolute", top: 386, left: 975, color: "#C45245", fontSize: 11, fontWeight: 750 }}>свободных окон нет</span>
          <span style={{ position: "absolute", top: 472, left: 1152, color: "rgba(38,38,51,.66)", fontSize: 11, fontWeight: 750 }}>нестандартный случай → владелец</span>
          {card("yes", 1030, 115)}{card("no", 1030, 360)}{card("end", 1308, 228)}{card("approval", 1030, 500)}{card("handoff", 1308, 500)}
        </div>
      </div>
    </div>
    <div style={{ position: "absolute", zIndex: 5, left: 18, bottom: 18, padding: "9px 12px", borderRadius: 12, background: "rgba(255,255,255,.88)", color: "rgba(38,38,51,.6)", fontSize: 11.5, boxShadow: "0 3px 12px rgba(38,38,51,.07)" }}>Нажмите на шаг, чтобы посмотреть детали</div>
  </div>;
}

export function WorkflowPage() {
  const [active, setActive] = useState("trigger");
  const [ran, setRan] = useState(false);
  const [view, setView] = useState("schema");
  const [detailId, setDetailId] = useState(null);
  const node = NODES[active];
  const selectNode = id => { setActive(id); setDetailId(id); };
  const run = () => { setRan(false); ["trigger", "task1", "task2", "condition", "yes", "end"].forEach((id, index) => window.setTimeout(() => { setActive(id); if (index === 5) setRan(true); }, index * 600)); };

  return <div style={{ minHeight: "100%", background: "#FCFCFA", padding: "32px 38px", fontFamily: "inherit" }}>
    <div style={{ maxWidth: 1180, margin: "0 auto" }}>
      <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, marginBottom: 24 }}>
        <div><div style={{ fontSize: 26, fontWeight: 650, letterSpacing: "-.03em", color: color.ink }}>Приём записи</div><div style={{ marginTop: 6, fontSize: 13, color: color.muted }}>Клиенты · автоматизация из гайда Mary</div></div>
        <div style={{ display: "flex", gap: 9 }}><div style={{ display: "flex", padding: 3, background: color.white, border: `1px solid ${color.border}`, borderRadius: 10 }}><button onClick={() => setView("schema")} style={{ border: "none", borderRadius: 7, padding: "7px 10px", cursor: "pointer", background: view === "schema" ? color.bgSurface : "transparent", color: color.ink, font: "600 12px inherit" }}>Схема</button><button onClick={() => setView("file")} style={{ border: "none", borderRadius: 7, padding: "7px 10px", cursor: "pointer", background: view === "file" ? color.bgSurface : "transparent", color: color.ink, font: "600 12px inherit" }}>workflow.md</button></div><button onClick={run} style={{ background: color.ink, color: color.white, border: "none", borderRadius: 10, padding: "10px 15px", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 650 }}>▷ Прогнать пример</button></div>
      </header>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 278px", gap: 18, alignItems: "start" }}>
        {view === "schema" ? <BookingDiagram active={active} onSelect={selectNode} /> : <pre style={{ margin: 0, minHeight: 730, padding: 28, overflow: "auto", boxSizing: "border-box", borderRadius: 18, background: "#101217", color: "#F4F5FA", fontSize: 13, lineHeight: 1.58, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", whiteSpace: "pre-wrap" }}>{workflowDsl}</pre>}
        <aside style={{ display: "grid", gap: 14 }}>
          <div style={{ background: "#FFFFFF", border: "1px solid #ECECE9", borderRadius: 24, padding: 18 }}><div style={{ color: "#FF8752", fontSize: 10.5, letterSpacing: ".06em", fontWeight: 750, textTransform: "uppercase" }}>{node.type}</div><div style={{ marginTop: 7, color: color.ink, fontWeight: 650, fontSize: 15 }}>{node.title}</div><div style={{ marginTop: 9, color: color.muted, fontSize: 12.5, lineHeight: 1.5 }}>{node.text}</div><div style={{ marginTop: 15, borderTop: "1px solid #ECECE9", paddingTop: 11, color: color.muted, fontSize: 11.5 }}>Нажмите на блок в схеме, чтобы понять его роль.</div></div>
          <div style={{ background: "#FFFFFF", border: "1px solid #ECECE9", borderRadius: 24, padding: 18 }}><div style={{ fontWeight: 650, fontSize: 13, color: color.ink }}>{ran ? "Клиент записан" : "Проверка сценария"}</div><div style={{ marginTop: 7, color: color.muted, fontSize: 12, lineHeight: 1.45 }}>{ran ? "Ольга записана на маникюр в 19:00. В CRM создан визит, клиент получил подтверждение." : "Нажмите «Прогнать пример», чтобы пройти путь клиента по основной ветке."}</div></div>
          <div style={{ padding: "2px 8px", color: color.muted, fontSize: 11.5, lineHeight: 1.5 }}>Структура: триггер → задачи → ветка → концы. Ресурсы агента указаны внутри задач как r/a/w.</div>
        </aside>
      </div>
      {detailId && <div onMouseDown={() => setDetailId(null)} style={{ position: "fixed", inset: 0, zIndex: 50, display: "grid", placeItems: "center", padding: 20, background: "rgba(20,20,22,.32)", backdropFilter: "blur(4px)" }}><div onMouseDown={event => event.stopPropagation()} style={{ width: "min(440px, 100%)", borderRadius: 28, background: "#F5F5F3", padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}><div><div style={{ color: "rgba(38,38,51,.45)", fontWeight: 750, fontSize: 10.5, letterSpacing: ".07em", textTransform: "uppercase" }}>{NODES[detailId].type}</div><div style={{ marginTop: 7, color: color.ink, fontSize: 21, fontWeight: 700, letterSpacing: "-.03em" }}>{NODES[detailId].title}</div></div><button onClick={() => setDetailId(null)} style={{ width: 32, height: 32, border: "none", borderRadius: 10, background: "rgba(38,38,51,.07)", cursor: "pointer", color: color.ink, fontSize: 20 }}>×</button></div><div style={{ marginTop: 15, color: color.muted, fontSize: 13, lineHeight: 1.55 }}>{NODES[detailId].text}</div>{NODES[detailId].chips?.length ? <div style={{ marginTop: 20, display: "grid", gap: 7 }}>{NODES[detailId].chips.map(([kind, label]) => <div key={label} style={{ display: "inline-flex", alignItems: "center", width: "fit-content", gap: 7, padding: "7px 10px 7px 7px", background: "#FFFFFF", borderRadius: 999, color: "rgba(38,38,51,.7)", fontSize: 12, fontWeight: 650 }}><ChipIcon kind={kind} />{label}</div>)}</div> : null}</div></div>}
    </div>
  </div>;
}

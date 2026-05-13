import { useState, useEffect, useRef } from "react";

var T = {
  white: "#FFFFFF",
  bg: "#F5F5F5",
  surface: "#F7F8FA",
  ink: "#18181B",
  soft: "rgba(42,40,48,0.3)",
  muted: "#818181",
  border: "#E8E8E8",
  red: "#FF3407",
  blue: "#0794FF",
  orange: "#FF4D00",
  green: "#34C759",
  yellow: "#FFD60A",
  purple: "#8A38F5",
  font: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', system-ui, sans-serif",
};

var AGENTS = [
  { id: "mary", name: "Mary", letter: "", color: "#262633", sys: [
    "Ты — Mary, главный ИИ-директор. Команда: Маркетолог (marketer), Дизайнер (designer), Разработчик (developer), Копирайтер (copywriter).",
    "",
    "ОПРЕДЕЛИ ТИП ЗАДАЧИ:",
    "",
    "ТИП 1 — БЫСТРЫЙ ВОПРОС (без глаголов сделай/подготовь/настрой):",
    "Ответь коротко сама ИЛИ делегируй одному агенту без плана. Последняя строка: [DELEGATE:agent_id]",
    "",
    "ТИП 2 — ЗАДАЧА ДЛЯ ОДНОГО АГЕНТА:",
    "Покажи что поняла (1 предложение). Делегируй. Последняя строка: [DELEGATE:agent_id]",
    "",
    "ТИП 3 — КРОСС-ФУНКЦИОНАЛЬНЫЙ ПРОЕКТ (нужны 2+ агента):",
    "Покажи что поняла. Затем план:",
    "[PLAN_START]",
    "1|agent_id|Описание шага",
    "2|agent_id|Описание шага",
    "[PLAN_END]",
    "Для параллельных шагов — одинаковый номер. Последняя строка: [DELEGATE:agent_id] или [PARALLEL:id1,id2]",
    "",
    "ТИП 4 — СОЗДАНИЕ ЗАДАЧИ-МОНИТОРИНГА:",
    "Если просят следить/мониторить — создай задачу: [TASK:название|описание|agent_id|HIGH/MEDIUM/LOW]",
    "",
    "ПРАВИЛА: по-русски, без звёздочек, макс 100 слов. НЕ решай сама — делегируй.",
  ].join("\n") },
  { id: "marketer", name: "Маркетолог", letter: "М", color: "#262633", sys: [
    "Ты — ИИ-Маркетолог. Экспертиза: воронки, трафик, реклама, конверсии, SEO, SMM.",
    "",
    "РЕЖИМ УТОЧНЕНИЯ: задай ОДИН вопрос с вариантами 1. 2. 3. 4.",
    "РЕЖИМ ВЫПОЛНЕНИЯ (после 3-4 вопросов): дай конкретные рекомендации с цифрами.",
    "",
    "АРТЕФАКТЫ — когда создаёшь конкретный результат:",
    "[ARTIFACT:table|col1,col2,col3|val1,val2,val3;val4,val5,val6|Название]",
    "[ARTIFACT:checklist|Пункт 1;Пункт 2;Пункт 3|Название]",
    "",
    "СОЗДАНИЕ ЗАДАЧИ: [TASK:название|описание|marketer|HIGH/MEDIUM/LOW]",
    "ПЕРЕДАЧА: [HANDOFF:agent_id|что передаёшь и зачем]",
    "По-русски. Без звёздочек. Макс 120 слов.",
  ].join("\n") },
  { id: "designer", name: "Дизайнер", letter: "Д", color: "#262633", sys: [
    "Ты — ИИ-Дизайнер. Экспертиза: UI/UX, макеты, визуал, палитры, баннеры, брендинг.",
    "",
    "РЕЖИМ УТОЧНЕНИЯ: один вопрос с вариантами 1. 2. 3. 4.",
    "РЕЖИМ ВЫПОЛНЕНИЯ: конкретное решение с размерами, цветами, шрифтами.",
    "",
    "АРТЕФАКТЫ:",
    "[ARTIFACT:palette|#hex1,#hex2,#hex3,#hex4,#hex5|Название палитры]",
    "[ARTIFACT:checklist|Пункт 1;Пункт 2;Пункт 3|Название]",
    "",
    "СОЗДАНИЕ ЗАДАЧИ: [TASK:название|описание|designer|HIGH/MEDIUM/LOW]",
    "ПЕРЕДАЧА: [HANDOFF:agent_id|что передаёшь]",
    "По-русски. Без звёздочек. Макс 120 слов.",
  ].join("\n") },
  { id: "developer", name: "Разработчик", letter: "Р", color: "#262633", sys: [
    "Ты — ИИ-Разработчик. Экспертиза: код, сайты, API, деплой, автоматизация.",
    "",
    "РЕЖИМ УТОЧНЕНИЯ: один вопрос с вариантами 1. 2. 3. 4.",
    "РЕЖИМ ВЫПОЛНЕНИЯ: конкретное техрешение со стеком и этапами.",
    "",
    "АРТЕФАКТЫ:",
    "[ARTIFACT:checklist|Этап 1;Этап 2;Этап 3|Название]",
    "[ARTIFACT:table|col1,col2|val1,val2;val3,val4|Название]",
    "",
    "СОЗДАНИЕ ЗАДАЧИ: [TASK:название|описание|developer|HIGH/MEDIUM/LOW]",
    "ПЕРЕДАЧА: [HANDOFF:agent_id|что передаёшь]",
    "По-русски. Без звёздочек. Макс 120 слов.",
  ].join("\n") },
  { id: "copywriter", name: "Копирайтер", letter: "К", color: "#262633", sys: [
    "Ты — ИИ-Копирайтер. Экспертиза: тексты, скрипты продаж, контент-планы, email.",
    "",
    "РЕЖИМ УТОЧНЕНИЯ: один вопрос с вариантами 1. 2. 3. 4.",
    "РЕЖИМ ВЫПОЛНЕНИЯ: готовый текст/план.",
    "",
    "АРТЕФАКТЫ:",
    "[ARTIFACT:text|тип|Название]",
    "текст здесь",
    "[/ARTIFACT]",
    "[ARTIFACT:table|col1,col2|val1,val2;val3,val4|Контент-план]",
    "",
    "СОЗДАНИЕ ЗАДАЧИ: [TASK:название|описание|copywriter|HIGH/MEDIUM/LOW]",
    "ПЕРЕДАЧА: [HANDOFF:agent_id|что передаёшь]",
    "По-русски. Без звёздочек. Макс 150 слов.",
  ].join("\n") },
];

function getAgent(id) { return AGENTS.find(function(a) { return a.id === id; }); }

function askAI(system, messages, max) {
  return fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: max || 1500, system: system, messages: messages }),
  }).then(function(r) { return r.json(); }).then(function(d) {
    if (d.error) { console.error("API:", d.error); return ""; }
    return (d.content && d.content[0] && d.content[0].text) || "";
  }).catch(function(e) { console.error("Fetch:", e); return ""; });
}
function cleanMd(t) { return t.replace(/\*\*/g, "").replace(/\*/g, "").replace(/#{1,3}\s/g, ""); }
function fmtTime(ts) { if (!ts) return ""; var d = new Date(ts); return (d.getHours()<10?"0":"")+d.getHours()+":"+(d.getMinutes()<10?"0":"")+d.getMinutes(); }

// ═══ PROTOCOL PARSER ═══
function parseProto(text) {
  var r = { text: text, plan: null, delegate: null, parallel: null, handoff: null, artifacts: [], tasks: [], choices: null };
  // Plan
  var pm = text.match(/\[PLAN_START\]([\s\S]*?)\[PLAN_END\]/);
  if (pm) { var steps = []; pm[1].trim().split("\n").forEach(function(ln) { var m = ln.match(/(\d+)\|(\w+)\|(.+)/); if (m) steps.push({ order: parseInt(m[1]), agentId: m[2], desc: m[3].trim() }); }); if (steps.length) r.plan = steps; r.text = r.text.replace(/\[PLAN_START\][\s\S]*?\[PLAN_END\]/, "").trim(); }
  // Delegate
  var dm = text.match(/\[DELEGATE:(\w+)\]/); if (dm) { r.delegate = dm[1]; r.text = r.text.replace(/\[DELEGATE:\w+\]/g, "").trim(); }
  // Parallel
  var pam = text.match(/\[PARALLEL:([\w,]+)\]/); if (pam) { r.parallel = pam[1].split(","); r.text = r.text.replace(/\[PARALLEL:[\w,]+\]/g, "").trim(); }
  // Handoff
  var hm = text.match(/\[HANDOFF:(\w+)\|([^\]]+)\]/); if (hm) { r.handoff = { agentId: hm[1], ctx: hm[2] }; r.text = r.text.replace(/\[HANDOFF:[^\]]+\]/g, "").trim(); }
  // Tasks
  var taskR = /\[TASK:([^|]+)\|([^|]+)\|(\w+)\|(\w+)\]/g; var tm;
  while ((tm = taskR.exec(text)) !== null) { r.tasks.push({ title: tm[1], desc: tm[2], agent: tm[3], priority: tm[4] }); r.text = r.text.replace(tm[0], "").trim(); }
  // Artifacts: palette
  var palR = /\[ARTIFACT:palette\|([^|]+)\|([^\]]+)\]/g; var plm;
  while ((plm = palR.exec(text)) !== null) { r.artifacts.push({ type: "palette", colors: plm[1].split(",").map(function(c){return c.trim();}), name: plm[2] }); r.text = r.text.replace(plm[0], "").trim(); }
  // Artifacts: checklist
  var chkR = /\[ARTIFACT:checklist\|([^|]+)\|([^\]]+)\]/g; var cm;
  while ((cm = chkR.exec(text)) !== null) { r.artifacts.push({ type: "checklist", items: cm[1].split(";").map(function(s){return s.trim();}), name: cm[2] }); r.text = r.text.replace(cm[0], "").trim(); }
  // Artifacts: table
  var tblR = /\[ARTIFACT:table\|([^|]+)\|([^|]+)\|([^\]]+)\]/g; var tb;
  while ((tb = tblR.exec(text)) !== null) { r.artifacts.push({ type: "table", cols: tb[1].split(",").map(function(s){return s.trim();}), rows: tb[2].split(";").map(function(row){return row.split(",").map(function(s){return s.trim();});}), name: tb[3] }); r.text = r.text.replace(tb[0], "").trim(); }
  // Artifacts: text block
  var txtR = /\[ARTIFACT:text\|([^|]+)\|([^\]]+)\]([\s\S]*?)\[\/ARTIFACT\]/g; var txm;
  while ((txm = txtR.exec(text)) !== null) { r.artifacts.push({ type: "textblock", subtype: txm[1], name: txm[2], content: txm[3].trim() }); r.text = r.text.replace(txm[0], "").trim(); }
  // Choices
  var lines = r.text.split("\n"); var nums = []; var firstN = -1;
  for (var j = 0; j < lines.length; j++) { if (/^\d+[\.\)]\s/.test(lines[j].trim())) { if (firstN < 0) firstN = j; nums.push(lines[j].trim().replace(/^\d+[\.\)]\s*/, "").trim()); } }
  if (nums.length >= 2) { var q = ""; for (var k = firstN - 1; k >= 0; k--) { if (lines[k].trim()) { q = lines[k].trim(); break; } } if (!q || q.length < 3) q = "Выберите:"; r.choices = { question: q, options: nums, beforeText: lines.slice(0, Math.max(0, firstN - (q ? 1 : 0))).join("\n").trim() }; r.text = r.choices.beforeText; }
  return r;
}

// ═══ ARTIFACT RENDERERS ═══
function ArtPalette(props) {
  return (<div style={{ marginLeft: 32, marginTop: 10, marginBottom: 6 }}>
    <div style={{ fontSize: 11, fontWeight: 500, color: T.muted, marginBottom: 6 }}>{props.name}</div>
    <div style={{ display: "flex", gap: 3, borderRadius: 10, overflow: "hidden" }}>
      {props.colors.map(function(c, i) { return <div key={i} style={{ flex: 1, height: 40, background: c, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 4 }}><span style={{ fontSize: 8, fontWeight: 500, color: "rgba(255,255,255,.8)", textShadow: "0 1px 2px rgba(0,0,0,.3)" }}>{c}</span></div>; })}
    </div>
  </div>);
}
function ArtChecklist(props) {
  var _c = useState(props.items.map(function(){return false;})); var checks = _c[0]; var setChecks = _c[1];
  return (<div style={{ marginLeft: 32, marginTop: 10, background: T.surface, borderRadius: 12, padding: 14 }}>
    <div style={{ fontSize: 11, fontWeight: 500, color: T.muted, marginBottom: 8 }}>{props.name}</div>
    {props.items.map(function(item, i) { return (
      <div key={i} onClick={function(){setChecks(function(p){var n=p.slice();n[i]=!n[i];return n;});}} style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 0", cursor: "pointer", borderBottom: i < props.items.length-1 ? "1px solid rgba(0,0,0,.04)" : "none" }}>
        <div style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, border: checks[i] ? "none" : "1.5px solid "+T.border, background: checks[i] ? T.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}>{checks[i] ? <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg> : null}</div>
        <span style={{ fontSize: 13, color: T.ink, textDecoration: checks[i] ? "line-through" : "none", opacity: checks[i] ? .4 : 1, transition: "all .15s" }}>{item}</span>
      </div>); })}
  </div>);
}
function ArtTable(props) {
  return (<div style={{ marginLeft: 32, marginTop: 10, borderRadius: 12, overflow: "hidden", border: "1px solid "+T.border }}>
    <div style={{ fontSize: 11, fontWeight: 500, color: T.muted, padding: "8px 12px", background: T.surface }}>{props.name}</div>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
      <thead><tr>{props.cols.map(function(c, i){return <th key={i} style={{ textAlign: "left", padding: "7px 10px", fontWeight: 500, color: T.ink, borderBottom: "1px solid "+T.border, background: T.surface }}>{c}</th>;})}</tr></thead>
      <tbody>{props.rows.map(function(row, ri){return <tr key={ri}>{row.map(function(cell, ci){return <td key={ci} style={{ padding: "7px 10px", color: T.ink, borderBottom: ri<props.rows.length-1?"1px solid rgba(0,0,0,.04)":"none" }}>{cell}</td>;})}</tr>;})}</tbody>
    </table>
  </div>);
}
function ArtTextBlock(props) {
  var _copied = useState(false); var copied = _copied[0]; var setCopied = _copied[1];
  return (<div style={{ marginLeft: 32, marginTop: 10, borderRadius: 12, border: "1px solid "+T.border, overflow: "hidden" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: T.surface }}>
      <span style={{ fontSize: 11, fontWeight: 500, color: T.muted }}>{props.name}</span>
      <div onClick={function(){navigator.clipboard.writeText(props.content);setCopied(true);setTimeout(function(){setCopied(false);},2000);}} style={{ fontSize: 11, fontWeight: 450, color: copied ? T.green : T.muted, cursor: "pointer", padding: "2px 8px", borderRadius: 6 }}>{copied ? "Скопировано" : "Копировать"}</div>
    </div>
    <div style={{ padding: "12px 14px", fontSize: 14, color: T.ink, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{props.content}</div>
  </div>);
}

// ═══ TASK CARD (clickable → tasks page) ═══
function TaskCard(props) {
  var pc = { HIGH: T.red, MEDIUM: T.orange, LOW: T.muted };
  return (<div onClick={props.onClick} style={{ marginLeft: 32, marginTop: 10, display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 14, background: T.surface, cursor: "pointer", transition: "background .1s" }}
    onMouseEnter={function(e){e.currentTarget.style.background="#EEEFF1";}} onMouseLeave={function(e){e.currentTarget.style.background=T.surface;}}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><rect x="3" y="3" width="18" height="18" rx="3" stroke={T.muted} strokeWidth="1.8"/><path d="M8 12l3 3 5-6" stroke={T.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 14, fontWeight: 450, color: T.ink }}>{props.title}</div>
      <div style={{ fontSize: 12, fontWeight: 450, color: T.muted, marginTop: 2 }}>{props.desc}</div>
    </div>
    <span style={{ fontSize: 10, fontWeight: 500, color: pc[props.priority] || T.muted }}>{props.priority}</span>
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke={T.muted} strokeWidth="1.3" strokeLinecap="round"/></svg>
  </div>);
}

// ═══ PLAN PIPELINE ═══
function PlanView(props) {
  if (!props.plan || !props.plan.length) return null;
  var groups = {}; props.plan.forEach(function(s,i){ if(!groups[s.order])groups[s.order]=[]; groups[s.order].push(s); });
  var gk = Object.keys(groups).sort(function(a,b){return a-b;});
  return (<div style={{ marginLeft: 32, marginTop: 10, marginBottom: 6 }}>
    <div style={{ fontSize: 11, fontWeight: 550, color: T.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>{"План"}</div>
    {gk.map(function(k,gi){var items=groups[k]; return (<div key={k}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {items.map(function(s,si){ var ag=getAgent(s.agentId); return (
          <div key={si} style={{ flex: 1, minWidth: 160, display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10, background: T.surface }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: T.border, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 9, fontWeight: 550, color: "#fff" }}>{k}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {ag ? <span style={{ fontSize: 12, fontWeight: 500, color: T.ink }}>{ag.name}</span> : null}
              <div style={{ fontSize: 11, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.desc}</div>
            </div>
            {items.length > 1 ? <span style={{ fontSize: 8, fontWeight: 600, color: T.muted, background: "rgba(0,0,0,.04)", borderRadius: 3, padding: "1px 4px" }}>{"∥"}</span> : null}
          </div>
        );})}
      </div>
      {gi < gk.length-1 ? <div style={{ display: "flex", justifyContent: "center", padding: "2px 0" }}><div style={{ width: 1.5, height: 10, background: T.border }} /></div> : null}
    </div>);})}
  </div>);
}

// ═══ SIDEBAR ═══
function Sidebar(props) {
  var active = props.active; var onSelect = props.onSelect; var onHome = props.onHome; var isHome = props.isHome;
  var onIntegrations = props.onIntegrations; var isIntegrations = props.isIntegrations;
  var onData = props.onData; var isData = props.isData;
  var onSettings = props.onSettings; var isSettings = props.isSettings;
  var onTasks = props.onTasks; var isTasks = props.isTasks;
  var onFilter = props.onFilter; var activeFilter = props.activeFilter;
  var _open = useState(true); var open = _open[0]; var setOpen = _open[1];
  var _collapsed = useState(false); var collapsed = _collapsed[0]; var setCollapsed = _collapsed[1];
  var _dragAgent = useState(null); var dragAgent = _dragAgent[0]; var setDragAgent = _dragAgent[1];
  var _dragOverAgent = useState(null); var dragOverAgent = _dragOverAgent[0]; var setDragOverAgent = _dragOverAgent[1];
  var _agentMenu = useState(null); var agentMenu = _agentMenu[0]; var setAgentMenu = _agentMenu[1];

  var bottomNav = [
    { label: "Интеграции", action: onIntegrations, isActive: isIntegrations, icon: function(c) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M13.5 2L7 8.5M10.5 22L17 15.5M2 10.5l6-6M22 13.5l-6 6M8.5 7L4 11.5M15.5 17l4.5-4.5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>; } },
    { label: "Данные", action: onData, isActive: isData, icon: function(c) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke={c} strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke={c} strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke={c} strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke={c} strokeWidth="1.8"/></svg>; } },
    { label: "Поддержка", action: function(){}, icon: function(c) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.8"/><path d="M9 9.5a3 3 0 015.12 2.12c0 2-3 2.5-3 2.5M12 17h.01" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>; } },
    { label: "Настройки", action: onSettings, isActive: isSettings, icon: function(c) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke={c} strokeWidth="1.8"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>; } },
  ];

  var sideW = collapsed ? 64 : 200;

  // Icon for sidebar items
  var chatIcon = function(c) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4.53 10.93c0-4.71 3.82-8.53 8.54-8.53 4.71 0 8.53 3.82 8.53 8.53 0 1.23-.26 2.39-.72 3.45l.73 5.09-4.36-1.09c-1.23.69-2.66 1.09-4.17 1.09M2.4 16.27c0 .77.16 1.5.45 2.15l-.45 3.18 2.72-.68c.77.43 1.66.68 2.61.68 2.95 0 5.33-2.39 5.33-5.33 0-2.95-2.39-5.33-5.33-5.33-2.95 0-5.33 2.39-5.33 5.33z" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>; };
  var homeIcon = function(c) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke={c} strokeWidth="1.8"/><path d="M9 21V12h6v9" stroke={c} strokeWidth="1.8"/></svg>; };
  var taskIcon = function(c) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke={c} strokeWidth="1.8"/><path d="M8 12l3 3 5-6" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>; };

  return (
    <div style={{ width: sideW, flexShrink: 0, background: T.white, display: "flex", flexDirection: "column", fontFamily: T.font, height: "100vh", transition: "width .2s" }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? "24px 0 28px" : "24px 20px 28px", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", cursor: "pointer" }} onClick={function() { setCollapsed(!collapsed); }}>
        {collapsed ? (
          <svg width="28" height="30" viewBox="0 0 28 30" fill="none"><ellipse cx="5.4" cy="15" rx="2.2" ry="7.2" fill="#262633"/><ellipse cx="10.5" cy="15" rx="2.6" ry="10" fill="#262633"/><ellipse cx="15.9" cy="15" rx="2.8" ry="11.5" fill="#262633"/></svg>
        ) : (
          <svg width="80" height="33" viewBox="0 0 94 39" fill="none"><ellipse cx="7.43" cy="19.5" rx="2.88" ry="9.35" fill="#262633"/><ellipse cx="13.66" cy="19.5" rx="3.36" ry="12.94" fill="#262633"/><ellipse cx="20.61" cy="19.5" rx="3.6" ry="14.86" fill="#262633"/><path d="M34.14 25.54V11.58h3.14v2.37h.16c.29-.8.77-1.42 1.45-1.87.67-.45 1.47-.68 2.41-.68.94 0 1.74.23 2.39.69.65.45 1.11 1.07 1.38 1.86h.15c.31-.78.83-1.39 1.56-1.85.74-.47 1.62-.7 2.63-.7 1.28 0 2.33.41 3.14 1.22.81.81 1.22 2 1.22 3.55v9.37h-3.3v-8.86c0-.87-.23-1.5-.69-1.9-.46-.41-1.02-.61-1.69-.61-.79 0-1.41.25-1.86.75-.44.49-.66 1.13-.66 1.92v8.7h-3.23v-9h0c0-.72-.22-1.3-.65-1.73-.43-.43-1-.64-1.69-.64-.47 0-.9.12-1.29.36-.39.24-.69.57-.92 1.01-.23.43-.35.93-.35 1.51v8.49h-3.29z" fill="#262633"/><path d="M60.61 25.82c-.88 0-1.68-.16-2.39-.47-.7-.32-1.26-.8-1.67-1.42-.41-.62-.61-1.39-.61-2.31 0-.79.15-1.44.44-1.95.29-.52.69-.93 1.19-1.24.5-.31 1.07-.54 1.7-.7.64-.16 1.3-.28 1.97-.35.82-.08 1.48-.16 1.99-.23.51-.07.88-.18 1.11-.33.23-.15.35-.39.35-.7v-.05c0-.69-.2-1.22-.61-1.59-.41-.38-.99-.57-1.75-.57-.81 0-1.45.18-1.92.53-.47.35-.78.77-.95 1.24l-3.07-.44c.24-.85.64-1.56 1.2-2.13.56-.58 1.24-1.01 2.05-1.29.81-.29 1.7-.44 2.67-.44.67 0 1.34.08 2.01.24.67.16 1.28.42 1.83.78.55.36.99.85 1.33 1.46.34.62.51 1.39.51 2.32v9.34h-3.16v-1.92h-.11c-.2.39-.48.75-.85 1.09-.36.33-.81.6-1.36.81-.54.2-1.17.3-1.9.3zm.85-2.42c.66 0 1.24-.13 1.72-.39.48-.27.86-.62 1.12-1.05.27-.44.4-.91.4-1.43v-1.64c-.1.08-.28.16-.53.24-.24.07-.51.13-.82.19-.3.05-.6.1-.9.15-.3.04-.55.08-.77.11-.49.07-.93.18-1.32.33-.39.15-.69.36-.92.64-.22.27-.34.61-.34 1.04 0 .61.22 1.07.66 1.37.44.31 1.01.47 1.69.47z" fill="#262633"/><path d="M70.78 25.54V11.58h3.19v2.33h.15c.25-.81.69-1.43 1.31-1.86.62-.44 1.33-.66 2.14-.66.18 0 .38.01.61.03.23.01.42.03.57.06v3.03c-.14-.05-.36-.09-.66-.13-.3-.04-.59-.06-.87-.06-.6 0-1.14.13-1.62.39-.47.25-.85.61-1.12 1.06-.27.45-.41.98-.41 1.57v8.21h-3.29z" fill="#262633"/><path d="M82.89 30.77c-.45 0-.86-.04-1.25-.11-.37-.07-.67-.15-.9-.24l.77-2.56c.48.14.91.21 1.28.2.38-.01.71-.12.99-.35.29-.22.54-.6.74-1.13l.28-.75-5.06-14.25h3.49l3.22 10.54h.15l3.23-10.54h3.5l-5.59 15.65c-.26.74-.61 1.37-1.04 1.9-.43.53-.96.94-1.58 1.22-.62.28-1.36.43-2.22.43z" fill="#262633"/></svg>
        )}
      </div>

      <div style={{ flex: 1, padding: collapsed ? "0 4px" : "0 8px", overflowY: "auto" }}>
        {/* Главная */}
        <div onClick={onHome} style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 10, padding: collapsed ? "10px" : "10px 12px", borderRadius: 10, cursor: "pointer", background: isHome ? T.surface : "transparent", marginBottom: 4 }}>
          {homeIcon(isHome ? "#262633" : "#818181")}
          {!collapsed ? <span style={{ fontSize: 14, fontWeight: 450, color: T.ink }}>{"Главная"}</span> : null}
        </div>

        {/* Чат Mary */}
        <div onClick={function(){onSelect();}} style={{ display: "flex", alignItems: "center", justifyContent: collapsed?"center":"flex-start", gap: 10, padding: collapsed?"10px":"10px 12px", borderRadius: 10, cursor: "pointer", background: active==="chat"&&!isHome?T.surface:"transparent", marginBottom: 4 }}>
          {chatIcon(active==="chat"?"#262633":"#818181")}
          {!collapsed?<span style={{ flex: 1, fontSize: 14, fontWeight: 450, color: T.ink }}>{"Чат Mary"}</span>:null}
        </div>
        {/* Задачи */}
        <div onClick={onTasks} style={{ display: "flex", alignItems: "center", justifyContent: collapsed?"center":"flex-start", gap: 10, padding: collapsed?"10px":"10px 12px", borderRadius: 10, cursor: "pointer", background: isTasks?T.surface:"transparent", marginBottom: 4 }}>
          {taskIcon(isTasks?"#262633":"#818181")}
          {!collapsed?<span style={{ fontSize: 14, fontWeight: 450, color: isTasks?T.ink:T.muted }}>{"Задачи"}</span>:null}
        </div>
        {/* Агенты */}
        <div onClick={props.onAgents} style={{ display: "flex", alignItems: "center", justifyContent: collapsed?"center":"flex-start", gap: 10, padding: collapsed?"10px":"10px 12px", borderRadius: 10, cursor: "pointer", background: props.isAgents?T.surface:"transparent", marginBottom: 4 }}>
          {(function(c){return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7" r="3.5" stroke={c} strokeWidth="1.8"/><path d="M2 20v-1c0-3.3 2.7-6 6-6h2c3.3 0 6 2.7 6 6v1" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><circle cx="18" cy="9" r="2.5" stroke={c} strokeWidth="1.8"/><path d="M18 14c2.2 0 4 1.8 4 4v1" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>;})(props.isAgents?"#262633":"#818181")}
          {!collapsed?<span style={{ fontSize: 14, fontWeight: 450, color: props.isAgents?T.ink:T.muted }}>{"Агенты"}</span>:null}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ padding: collapsed ? "0 4px 8px" : "0 8px 8px" }}>
        {bottomNav.map(function(item, i) {
          var c = item.isActive ? "#262633" : "#818181";
          return (
            <div key={i} onClick={item.action} style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 10, padding: collapsed ? "9px" : "9px 12px", borderRadius: 8, cursor: "pointer", background: item.isActive ? T.surface : "transparent" }}>
              {item.icon(c)}
              {!collapsed ? <span style={{ fontSize: 14, fontWeight: 450, color: item.isActive ? T.ink : T.muted }}>{item.label}</span> : null}
            </div>
          );
        })}
      </div>

      {/* User */}
      <div style={{ padding: collapsed ? "12px 0" : "12px 20px", borderTop: "1px solid " + T.border, display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.surface, flexShrink: 0 }} />
        {!collapsed ? <span style={{ fontSize: 13, fontWeight: 450, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{"Виктория Ахрамов.."}</span> : null}
      </div>
    </div>
  );
}

// ═══ AGENT AVATARS COLUMN ═══
function AvatarColumn(props) {
  var active = props.active; var onSelect = props.onSelect;
  return (
    <div style={{ width: 64, flexShrink: 0, background: T.white, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 16, gap: 12, borderRight: "none" }}>
      {AGENTS.map(function(ag) {
        var isActive = active === ag.id;
        return (
          <div key={ag.id} onClick={function() { onSelect(ag.id); }} style={{
            width: 40, height: 40, borderRadius: "50%",
            background: isActive ? T.surface : "#F0F0F0",
            border: isActive ? "2px solid " + T.ink : "2px solid transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all .15s",
            fontSize: ag.id === "mary" ? 20 : 16, fontWeight: 450, color: T.ink,
          }}>
            {ag.id === "mary" ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2C9.8 2 8 3.8 8 6c0 1.5.8 2.7 2 3.4V11H8c-2.2 0-4 1.8-4 4v5h16v-5c0-2.2-1.8-4-4-4h-2V9.4c1.2-.7 2-1.9 2-3.4 0-2.2-1.8-4-4-4z" fill="#000"/></svg>
            ) : ag.letter}
          </div>
        );
      })}
    </div>
  );
}

// ═══ CHAT — full multi-mode engine ═══
function Chat(props) {
  var onSwitchAgent = props.onSwitchAgent;
  var filter = props.filter || "all";
  var autoMessage = props.autoMessage;
  var onFilter = props.onFilter;
  var _m = useState([]); var messages = _m[0]; var setMessages = _m[1];
  var _i = useState(""); var input = _i[0]; var setInput = _i[1];
  var _l = useState(false); var loading = _l[0]; var setLoading = _l[1];
  var _s = useState(false); var streaming = _s[0]; var setStreaming = _s[1];
  var _agent = useState("mary"); var currentAgent = _agent[0]; var setCurrentAgent = _agent[1];
  var _autoSent = useState(false); var autoSent = _autoSent[0]; var setAutoSent = _autoSent[1];
  var endRef = useRef(null);
  var _choiceCard = useState(null); var choiceCard = _choiceCard[0]; var setChoiceCard = _choiceCard[1];
  var _chain = useState([]); var chain = _chain[0]; var setChain = _chain[1];

  useEffect(function() { if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" }); }, [messages, loading, streaming, choiceCard]);
  useEffect(function() { if (autoMessage && !autoSent && messages.length === 0 && !loading) { setAutoSent(true); setTimeout(function() { send(autoMessage); }, 300); } }, [autoMessage, autoSent]);

  function parseChoices(text) {
    var lines = text.split("\n"); var nums = []; var firstN = -1;
    for (var j = 0; j < lines.length; j++) { if (/^\d+[\.\)]\s/.test(lines[j].trim())) { if (firstN < 0) firstN = j; nums.push(lines[j].trim().replace(/^\d+[\.\)]\s*/, "").trim()); } }
    if (nums.length < 2) return null;
    var q = ""; for (var k = firstN - 1; k >= 0; k--) { if (lines[k].trim()) { q = lines[k].trim(); break; } }
    if (!q || q.length < 3) q = "Выберите:";
    return { question: q, options: nums, beforeText: lines.slice(0, firstN).join("\n").trim() };
  }

  function chainCtx() { return chain.map(function(c){return "["+c.name+"]: "+c.summary;}).join("\n\n"); }

  function callAgent(agentId, contextMessages, depth) {
    if (depth > 5) return;
    var ag = getAgent(agentId); if (!ag) return;
    setCurrentAgent(agentId); if (onSwitchAgent) onSwitchAgent(agentId); setLoading(true);

    // Build API messages — filter + alternate + start/end with user
    var sys = ag.sys; var cc = chainCtx(); if (cc) sys += "\n\nКОНТЕКСТ ОТ ПРЕДЫДУЩИХ АГЕНТОВ:\n" + cc;
    var apiMsgs = [];
    contextMessages.forEach(function(m) {
      if (m.role === "system" || m.role === "handoff") return;
      if (!m.text || !m.text.trim()) return;
      var r = m.role === "user" ? "user" : "assistant";
      var c = m.role === "user" ? m.text : (m.agentName ? "[" + m.agentName + "]: " : "") + m.text;
      if (apiMsgs.length > 0 && apiMsgs[apiMsgs.length - 1].role === r) { apiMsgs[apiMsgs.length - 1].content += "\n\n" + c; }
      else { apiMsgs.push({ role: r, content: c }); }
    });
    if (apiMsgs.length === 0 || apiMsgs[0].role !== "user") apiMsgs.unshift({ role: "user", content: "Продолжай работу по задаче." });
    if (apiMsgs[apiMsgs.length - 1].role !== "user") apiMsgs.push({ role: "user", content: "Продолжай." });

    askAI(sys, apiMsgs, 2000).then(function(reply) {
      if (!reply) reply = "Произошла ошибка."; var cleaned = cleanMd(reply);
      var proto = parseProto(cleaned);
      setLoading(false);

      var sid = Date.now();
      var newMsg = { role: "assistant", text: "", agentId: agentId, agentName: ag.name, _sid: sid, ts: Date.now(),
        plan: proto.plan, artifacts: proto.artifacts, tasks: proto.tasks };
      setMessages(function(p) { return p.concat([newMsg]); }); setStreaming(true);

      var displayText = proto.text;
      var ci = 0;
      function tick() {
        if (ci >= displayText.length) {
          // Also check for old-style choices in the text
          var choices = proto.choices || parseChoices(displayText);
          var finalText = choices ? choices.beforeText : displayText;
          setMessages(function(p) { return p.map(function(m) { return m._sid === sid ? Object.assign({}, m, { text: finalText }) : m; }); }); setStreaming(false);

          if (choices && !proto.delegate && !proto.handoff && !proto.parallel) { setTimeout(function() { setChoiceCard(choices); }, 400); }

          // Delegate
          if (proto.delegate && getAgent(proto.delegate)) {
            setTimeout(function() { var toAg = getAgent(proto.delegate);
              setMessages(function(p) { var u = p.concat([{ role: "handoff", fromId: agentId, fromName: ag.name, fromLetter: ag.letter, toId: toAg.id, toName: toAg.name, toLetter: toAg.letter, ts: Date.now() }]);
                callAgent(proto.delegate, u, (depth||0)+1); return u; });
            }, 800);
          }
          // Parallel
          if (proto.parallel && proto.parallel.length > 0) {
            proto.parallel.forEach(function(pId, idx) {
              setTimeout(function() { if (getAgent(pId)) { var toAg = getAgent(pId);
                setMessages(function(p) { return p.concat([{ role: "handoff", fromId: agentId, fromName: ag.name, fromLetter: ag.letter, toId: toAg.id, toName: toAg.name, toLetter: toAg.letter, ts: Date.now() }]); });
                setTimeout(function() { callAgent(pId, contextMessages, (depth||0)+1); }, 200);
              }}, idx * 700);
            });
          }
          // Handoff (agent → agent with context)
          if (proto.handoff && getAgent(proto.handoff.agentId)) {
            var newChain = chain.slice(); newChain.push({ id: ag.id, name: ag.name, summary: proto.handoff.ctx }); setChain(newChain);
            setTimeout(function() { var toAg = getAgent(proto.handoff.agentId);
              setMessages(function(p) { var u = p.concat([{ role: "handoff", fromId: agentId, fromName: ag.name, fromLetter: ag.letter, toId: toAg.id, toName: toAg.name, toLetter: toAg.letter, context: proto.handoff.ctx, ts: Date.now() }]);
                callAgent(proto.handoff.agentId, u, (depth||0)+1); return u; });
            }, 800);
          }
          return;
        }
        ci = Math.min(ci + 3, displayText.length);
        setMessages(function(p) { return p.map(function(m) { return m._sid === sid ? Object.assign({}, m, { text: displayText.slice(0, ci) }) : m; }); });
        requestAnimationFrame(tick);
      } requestAnimationFrame(tick);
    });
  }

  function send(text) {
    if (!text || !text.trim() || loading || streaming) return; setInput(""); setChoiceCard(null); setChain([]);
    setMessages(function(p) { var u = p.concat([{ role: "user", text: text, ts: Date.now() }]); callAgent("mary", u, 0); return u; });
  }
  function sendChoice(opt) { setChoiceCard(null); send(opt); }

  var activeAg = getAgent(currentAgent) || AGENTS[0];

  // Mock files generated by agents
  var _files = useState([
    { id: "f1", name: "Анализ воронки.pdf", type: "PDF", agent: "marketer", pinned: false },
    { id: "f2", name: "Скрипт продаж v2.docx", type: "DOCX", agent: "copywriter", pinned: false },
    { id: "f3", name: "Макет лендинга.fig", type: "FIG", agent: "designer", pinned: true },
    { id: "f4", name: "Контент-план март.xlsx", type: "XLSX", agent: "copywriter", pinned: false },
    { id: "f5", name: "ТЗ на интеграцию CRM.md", type: "MD", agent: "developer", pinned: false },
    { id: "f6", name: "Отчёт по трафику.pdf", type: "PDF", agent: "marketer", pinned: true },
  ]);
  var files = _files[0]; var setFiles = _files[1];
  var _menuOpen = useState(null); var menuOpen = _menuOpen[0]; var setMenuOpen = _menuOpen[1];

  var _filesOpen = useState(true); var filesOpen = _filesOpen[0]; var setFilesOpen = _filesOpen[1];

  var filteredFiles = filter === "all" ? files : files.filter(function(f) { return f.agent === filter; });
  var pinnedFiles = filteredFiles.filter(function(f) { return f.pinned; });
  var otherFiles = filteredFiles.filter(function(f) { return !f.pinned; });

  function togglePin(id) {
    setFiles(function(prev) { return prev.map(function(f) { return f.id === id ? Object.assign({}, f, { pinned: !f.pinned }) : f; }); });
    setMenuOpen(null);
  }
  function removeFile(id) {
    setFiles(function(prev) { return prev.filter(function(f) { return f.id !== id; }); });
    setMenuOpen(null);
  }

  return (
    <div style={{ flex: 1, display: "flex", height: "100vh", fontFamily: T.font }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Agent tabs */}
        <div style={{ padding: "12px 24px 0", display: "flex", alignItems: "center", borderBottom: "1px solid "+T.border }}>
          <div style={{ display: "flex", alignItems: "center", flex: 1, overflowX: "auto" }}>
            {(function(){var a=filter==="all"; return <div onClick={function(){if(onFilter)onFilter("all");}} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 16px", cursor: "pointer", borderBottom: a?"2px solid "+T.ink:"2px solid transparent", marginBottom: -1, flexShrink: 0 }}><div style={{ width: 24, height: 24, borderRadius: 7, background: "#262633", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 2C9.8 2 8 3.8 8 6c0 1.5.8 2.7 2 3.4V11H8c-2.2 0-4 1.8-4 4v5h16v-5c0-2.2-1.8-4-4-4h-2V9.4c1.2-.7 2-1.9 2-3.4 0-2.2-1.8-4-4-4z" fill="#fff"/></svg></div><span style={{ fontSize: 14, fontWeight: 450, color: a?T.ink:T.muted }}>{"Общий чат"}</span></div>;})()}
            {AGENTS.filter(function(x){return x.id!=="mary";}).map(function(ag){var a=filter===ag.id; return <div key={ag.id} onClick={function(){if(onFilter)onFilter(ag.id);}} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 16px", cursor: "pointer", borderBottom: a?"2px solid "+T.ink:"2px solid transparent", marginBottom: -1, flexShrink: 0 }}><div style={{ width: 24, height: 24, borderRadius: 7, background: "#262633", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 12, fontWeight: 450, color: "#fff" }}>{ag.letter}</span></div><span style={{ fontSize: 14, fontWeight: 450, color: a?T.ink:T.muted }}>{ag.name}</span></div>;})}
            <div onClick={function(){if(props.onAddAgent)props.onAddAgent();}} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, cursor: "pointer", flexShrink: 0, marginLeft: 4 }} onMouseEnter={function(e){e.currentTarget.style.background=T.surface;}} onMouseLeave={function(e){e.currentTarget.style.background="transparent";}}><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke={T.muted} strokeWidth="1.5" strokeLinecap="round"/></svg></div>
          </div>
        </div>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 32px" }}>
          {messages.length === 0 && !loading ? (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", minHeight: "calc(100vh - 200px)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["Упала конверсия из заявки в оплату — помоги разобраться","Нужен лендинг с нуля: тексты, дизайн, код","Подготовь контент-план на месяц для Instagram","Настрой воронку: реклама → лид → оплата"].map(function(pain, pi) {
                  return <div key={pi} onClick={function(){send(pain);}} style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", cursor: "pointer", borderRadius: 12, border: "1px solid rgba(38,38,51,0.05)", transition: "border-color .15s" }} onMouseEnter={function(e){e.currentTarget.style.borderColor=T.border;}} onMouseLeave={function(e){e.currentTarget.style.borderColor="rgba(38,38,51,0.05)";}}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><path d="M2 14l4-4M6 10l-4 0M6 10l0-4" stroke={T.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span style={{ fontSize: 15, fontWeight: 450, color: T.ink }}>{pain}</span></div>;
                })}
              </div>
            </div>
          ) : null}
          {(filter === "all" ? messages : messages.filter(function(m) {
            return m.role === "user" || m.role === "system" || m.role === "handoff" || m.agentId === filter || m.agentId === "mary";
          })).map(function(m, i) {
            var ag = m.agentId ? getAgent(m.agentId) : null;
            return (
              <div key={i} style={{ marginBottom: 20 }}>
                {/* User */}
                {m.role === "user" ? (
                  <div><div style={{ display: "flex", justifyContent: "flex-end" }}><div style={{ background: T.ink, color: T.white, borderRadius: 16, padding: 16, fontSize: 16, fontWeight: 400, maxWidth: "65%", lineHeight: 1.3 }}>{m.text}</div></div>{m.ts?<div style={{textAlign:"right",marginTop:4}}><span style={{fontSize:11,fontWeight:450,color:T.muted}}>{fmtTime(m.ts)}</span></div>:null}</div>
                ) : m.role === "system" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 0" }}><div style={{height:1,flex:1,background:T.border}}/><span style={{fontSize:13,fontWeight:450,color:T.muted,whiteSpace:"nowrap"}}>{m.text}</span><div style={{height:1,flex:1,background:T.border}}/></div>
                ) : m.role === "handoff" ? (
                  /* Handoff */
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", margin: "4px 0" }}>
                    <div style={{height:1,flex:1,background:"linear-gradient(to right, transparent, "+T.border+")"}}/>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 20, background: T.surface }}>
                      <div style={{width:18,height:18,borderRadius:5,background:"#262633",display:"flex",alignItems:"center",justifyContent:"center"}}>{m.fromId==="mary"?<svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M12 2C9.8 2 8 3.8 8 6c0 1.5.8 2.7 2 3.4V11H8c-2.2 0-4 1.8-4 4v5h16v-5c0-2.2-1.8-4-4-4h-2V9.4c1.2-.7 2-1.9 2-3.4 0-2.2-1.8-4-4-4z" fill="#fff"/></svg>:<span style={{fontSize:9,fontWeight:500,color:"#fff"}}>{m.fromLetter||"?"}</span>}</div>
                      <span style={{fontSize:12,fontWeight:450,color:T.muted}}>{m.fromName}</span>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{opacity:.35}}><path d="M2 6h8M7 3l3 3-3 3" stroke={T.ink} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <div style={{width:18,height:18,borderRadius:5,background:"#262633",display:"flex",alignItems:"center",justifyContent:"center"}}>{m.toId==="mary"?<svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M12 2C9.8 2 8 3.8 8 6c0 1.5.8 2.7 2 3.4V11H8c-2.2 0-4 1.8-4 4v5h16v-5c0-2.2-1.8-4-4-4h-2V9.4c1.2-.7 2-1.9 2-3.4 0-2.2-1.8-4-4-4z" fill="#fff"/></svg>:<span style={{fontSize:9,fontWeight:500,color:"#fff"}}>{m.toLetter||"?"}</span>}</div>
                      <span style={{fontSize:12,fontWeight:450,color:T.muted}}>{m.toName}</span>
                      {m.context?<span style={{fontSize:11,fontWeight:450,color:T.muted,opacity:.6,marginLeft:2}}>{"· "+m.context}</span>:null}
                      {m.ts?<span style={{fontSize:10,fontWeight:450,color:"rgba(0,0,0,0.15)",marginLeft:4}}>{fmtTime(m.ts)}</span>:null}
                    </div>
                    <div style={{height:1,flex:1,background:"linear-gradient(to left, transparent, "+T.border+")"}}/>
                  </div>
                ) : (
                  /* Agent response */
                  <div>
                    {ag ? (<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{width:24,height:24,borderRadius:6,background:"#262633",display:"flex",alignItems:"center",justifyContent:"center"}}>{ag.id==="mary"?<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2C9.8 2 8 3.8 8 6c0 1.5.8 2.7 2 3.4V11H8c-2.2 0-4 1.8-4 4v5h16v-5c0-2.2-1.8-4-4-4h-2V9.4c1.2-.7 2-1.9 2-3.4 0-2.2-1.8-4-4-4z" fill="#fff"/></svg>:<span style={{fontSize:12,fontWeight:450,color:"#fff"}}>{ag.letter}</span>}</div>
                      <span style={{fontSize:14,fontWeight:450,color:T.ink}}>{ag.name}</span>
                      {m.ts?<span style={{fontSize:11,fontWeight:450,color:T.muted,marginLeft:"auto"}}>{fmtTime(m.ts)}</span>:null}
                    </div>) : null}
                    <div style={{ maxWidth: "85%", paddingLeft: 32 }}>
                      {(m.text||"").split("\n").map(function(line,li) {
                        if (!line.trim()) return <div key={li} style={{height:8}}/>;
                        if (line.trim().charAt(0)==="-"||line.trim().charAt(0)==="•") return <div key={li} style={{fontSize:16,fontWeight:450,color:T.ink,lineHeight:1.3,paddingLeft:20,position:"relative"}}><span style={{position:"absolute",left:0}}>{"•"}</span>{line.trim().replace(/^[-•·]\s*/,"")}</div>;
                        if ((line.trim().slice(-1)===":"||line.trim().indexOf("Вот что")===0)&&line.trim().length<50) return <div key={li} style={{fontSize:17,fontWeight:450,color:T.ink,lineHeight:1.3,marginTop:12,marginBottom:6}}>{line}</div>;
                        return <div key={li} style={{fontSize:16,fontWeight:450,color:T.ink,lineHeight:1.3}}>{line}</div>;
                      })}
                    </div>
                    {/* Plan */}
                    {m.plan ? <PlanView plan={m.plan} /> : null}
                    {/* Artifacts */}
                    {m.artifacts && m.artifacts.length > 0 ? m.artifacts.map(function(art,ai) {
                      if (art.type==="palette") return <ArtPalette key={ai} colors={art.colors} name={art.name}/>;
                      if (art.type==="checklist") return <ArtChecklist key={ai} items={art.items} name={art.name}/>;
                      if (art.type==="table") return <ArtTable key={ai} cols={art.cols} rows={art.rows} name={art.name}/>;
                      if (art.type==="textblock") return <ArtTextBlock key={ai} name={art.name} content={art.content}/>;
                      return null;
                    }) : null}
                    {/* Task cards */}
                    {m.tasks && m.tasks.length > 0 ? m.tasks.map(function(task,ti) {
                      return <TaskCard key={ti} title={task.title} desc={task.desc} priority={task.priority} onClick={function(){if(props.onOpenTasks)props.onOpenTasks();}}/>;
                    }) : null}
                  </div>
                )}
              </div>
            );
          })}
          {loading ? (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <style>{"@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}} div:hover > .agent-dots{opacity:1!important}"}</style>
              <div style={{width:24,height:24,borderRadius:6,background:"#262633",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{activeAg.id==="mary"?<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2C9.8 2 8 3.8 8 6c0 1.5.8 2.7 2 3.4V11H8c-2.2 0-4 1.8-4 4v5h16v-5c0-2.2-1.8-4-4-4h-2V9.4c1.2-.7 2-1.9 2-3.4 0-2.2-1.8-4-4-4z" fill="#fff"/></svg>:<span style={{fontSize:12,fontWeight:450,color:"#fff"}}>{activeAg.letter}</span>}</div>
              <div style={{paddingLeft:8}}>
                <div style={{fontSize:14,fontWeight:450,color:T.ink,marginBottom:6}}>{activeAg.name}</div>
                <div style={{display:"flex",gap:4}}><div style={{width:6,height:6,borderRadius:"50%",background:T.ink,animation:"pulse 1.2s infinite"}}/><div style={{width:6,height:6,borderRadius:"50%",background:T.ink,animation:"pulse 1.2s infinite",animationDelay:".2s"}}/><div style={{width:6,height:6,borderRadius:"50%",background:T.ink,animation:"pulse 1.2s infinite",animationDelay:".4s"}}/></div>
              </div>
            </div>
          ) : null}
          {/* Choice card */}
          {choiceCard && !loading && !streaming ? (
            <div style={{ background: "#F7F8FA", borderRadius: 20, padding: 20, marginTop: 12, marginLeft: 32 }}>
              <div style={{ fontSize: 16, fontWeight: 450, color: T.ink, marginBottom: 20 }}>{choiceCard.question}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {choiceCard.options.map(function(opt, oi) {
                  var isLast = oi === choiceCard.options.length - 1;
                  var isWrite = opt.indexOf("Напишите") >= 0 || opt.indexOf("напишите") >= 0 || opt.indexOf("свой вариант") >= 0;
                  return (
                    <div key={oi} onClick={function() { if (!isWrite) sendChoice(opt); }}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 12px", borderRadius: 12, background: "#FFFFFF", cursor: isWrite ? "default" : "pointer" }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: isWrite ? "#262633" : "#E0E0E0", color: isWrite ? "#fff" : "#262633", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 450, flexShrink: 0 }}>{oi + 1}</div>
                      <span style={{ flex: 1, fontSize: 15, fontWeight: 450, color: isWrite ? T.muted : "#1F1F24" }}>{opt}</span>
                      {isLast ? (
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: T.orange, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }} onClick={function(e) { e.stopPropagation(); if (input.trim()) sendChoice(input); }}>
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 12V4M8 4l-3 3M8 4l3 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
          <div ref={endRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{ padding: "12px 32px 28px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", background: T.surface, borderRadius: 16, padding: "4px 8px 4px 4px" }}>
            <span style={{ padding: "8px 12px", fontSize: 20, color: T.muted, lineHeight: 1 }}>{"+"}</span>
            <input type="text" value={input} onChange={function(e) { setInput(e.target.value); }} onKeyDown={function(e) { if (e.key === "Enter") send(input); }} placeholder="Напишите задачу.." disabled={loading || streaming}
              style={{ flex: 1, padding: "12px 8px", border: "none", fontSize: 15, fontFamily: T.font, fontWeight: 450, outline: "none", background: "transparent", color: T.ink }} />
            {input.trim() ? (
              <button onClick={function() { send(input); }} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: T.orange, color: T.white, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{"↑"}</button>
            ) : null}
          </div>
        </div>
      </div>
      </div>

      {/* Files toggle button — when panel is closed */}
      {!filesOpen ? (
        <div onClick={function() { setFilesOpen(true); }} style={{ width: 44, flexShrink: 0, borderLeft: "none", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 20, cursor: "pointer", background: T.white }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 8v8M8 12h8"/></svg>
        </div>
      ) : null}

      {/* Files panel — right side */}
      {filesOpen ? (
      <div style={{ width: 260, flexShrink: 0, borderLeft: "none", background: T.white, display: "flex", flexDirection: "column", height: "100vh", overflowY: "auto" }}>
        <div style={{ padding: "20px 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, fontWeight: 450, color: T.ink }}>{"Файлы"}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 450, color: T.muted }}>{filteredFiles.length + " файл."}</span>
            <div onClick={function() { setFilesOpen(false); }} style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: 4 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4 4l6 6M10 4l-6 6" stroke={T.muted} strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
          </div>
        </div>

        {/* All files — single list, pinned get a pin icon */}
        <div style={{ padding: "0 12px", flex: 1 }}>
          {filteredFiles.length === 0 ? (
            <div style={{ padding: "40px 8px", textAlign: "center", color: T.muted, fontSize: 13, fontWeight: 450 }}>{"Нет файлов"}</div>
          ) : null}
          {filteredFiles.map(function(f) {
            var ag = getAgent(f.agent);
            return (
              <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 8px", borderRadius: 10, marginBottom: 2, cursor: "pointer", position: "relative" }}
                onMouseEnter={function(e) { e.currentTarget.style.background = T.surface; }}
                onMouseLeave={function(e) { e.currentTarget.style.background = "transparent"; }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: T.surface, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
                  <span style={{ fontSize: 14 }}>{"📄"}</span>
                  {f.pinned ? (
                    <div style={{ position: "absolute", top: -3, right: -3, width: 14, height: 14, borderRadius: "50%", background: T.white, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><path d="M9.5 1.5L14.5 6.5L10 11L8.5 12.5L3.5 12.5L3.5 7.5L5 6L9.5 1.5Z" fill={T.muted}/></svg>
                    </div>
                  ) : null}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 450, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                  <div style={{ fontSize: 11, fontWeight: 450, color: T.muted }}>{f.type + " · " + (ag ? ag.name : "")}</div>
                </div>
                <div onClick={function(e) { e.stopPropagation(); setMenuOpen(menuOpen === f.id ? null : f.id); }} style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 14, color: T.muted, lineHeight: 1 }}>{"⋯"}</span>
                </div>
                {menuOpen === f.id ? (
                  <div style={{ position: "absolute", right: 8, top: 36, background: T.white, borderRadius: 10, boxShadow: "0 4px 20px rgba(0,0,0,.1)", padding: "6px 0", zIndex: 10, minWidth: 160 }}>
                    {[
                      { label: f.pinned ? "Открепить" : "Закрепить", action: function() { togglePin(f.id); } },
                      { label: "На главную", action: function() { setMenuOpen(null); } },
                      { label: "Скачать", action: function() { setMenuOpen(null); } },
                      { label: "Удалить", action: function() { removeFile(f.id); }, red: true },
                    ].map(function(item, ii) {
                      return (
                        <div key={ii} onClick={item.action} style={{ padding: "8px 16px", fontSize: 13, fontWeight: 450, color: item.red ? T.red : T.ink, cursor: "pointer" }}
                          onMouseEnter={function(e) { e.currentTarget.style.background = T.surface; }}
                          onMouseLeave={function(e) { e.currentTarget.style.background = "transparent"; }}>{item.label}</div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      ) : null}
    </div>
  );
}
var INTEGRATIONS = {
  "CRM и продажи": [
    { name: "AmoCRM", desc: "Управление лидами и сделками", logo: "amocrm.ru", account: "vikahramovich02@gmail.com" },
    { name: "Битрикс24", desc: "CRM, задачи, коммуникации", logo: "bitrix24.ru", account: "vikahramovich02@gmail.com" },
    { name: "HubSpot", desc: "Маркетинг и продажи", logo: "hubspot.com", account: "vika@marygroup.io" },
    { name: "Pipedrive", desc: "Воронка продаж", logo: "pipedrive.com", account: "vika@marygroup.io" },
    { name: "RetailCRM", desc: "CRM для e-commerce", logo: "retailcrm.ru", account: "admin@shop.by" },
    { name: "Planfix", desc: "Управление проектами и CRM", logo: "planfix.com", account: "vikahramovich02" },
  ],
  "Мессенджеры": [
    { name: "Telegram", desc: "Боты и каналы", logo: "telegram.org", account: "@viksaaaaaa_a" },
    { name: "WhatsApp", desc: "Business API", logo: "whatsapp.com", account: "+375 29 ***-**-67" },
    { name: "Instagram", desc: "Direct и комментарии", logo: "instagram.com", account: "@viksaaaaaa_a" },
    { name: "VK", desc: "Сообщения сообщества", logo: "vk.com", account: "vk.com/viksaaaaaa" },
  ],
  "Аналитика": [
    { name: "Google Analytics", desc: "Трафик и конверсии", logo: "analytics.google.com", account: "vikahramovich02@gmail.com" },
    { name: "Яндекс.Метрика", desc: "Вебвизор и цели", logo: "metrika.yandex.ru", account: "vikahramovich02" },
    { name: "Amplitude", desc: "Продуктовая аналитика", logo: "amplitude.com", account: "vika@marygroup.io" },
    { name: "Mixpanel", desc: "Поведение пользователей", logo: "mixpanel.com", account: "vika@marygroup.io" },
  ],
  "Реклама": [
    { name: "Google Ads", desc: "Контекстная реклама", logo: "ads.google.com", account: "vikahramovich02@gmail.com" },
    { name: "Яндекс.Директ", desc: "Поиск и РСЯ", logo: "direct.yandex.ru", account: "vikahramovich02" },
    { name: "Facebook Ads", desc: "Таргетированная реклама", logo: "facebook.com", account: "vikahramovich02@gmail.com" },
    { name: "TikTok Ads", desc: "Видеореклама", logo: "tiktok.com", account: "@viksaaaaaa_a" },
  ],
  "Таблицы и данные": [
    { name: "Google Sheets", desc: "Таблицы и отчёты", logo: "sheets.google.com", account: "vikahramovich02@gmail.com" },
    { name: "Notion", desc: "Базы данных и заметки", logo: "notion.so", account: "vikahramovich02@gmail.com" },
    { name: "Airtable", desc: "Гибкие таблицы", logo: "airtable.com", account: "vika@marygroup.io" },
    { name: "Excel / OneDrive", desc: "Таблицы Microsoft", logo: "onedrive.live.com", account: "vikahramovich02@gmail.com" },
  ],
  "Платежи": [
    { name: "Stripe", desc: "Приём платежей", logo: "stripe.com", account: "vika@marygroup.io" },
    { name: "ЮKassa", desc: "Платежи для России", logo: "yookassa.ru", account: "vikahramovich02@gmail.com" },
    { name: "Tinkoff", desc: "Эквайринг", logo: "tinkoff.ru", account: "+375 29 ***-**-67" },
  ],
  "Email": [
    { name: "Gmail", desc: "Почта и рассылки", logo: "gmail.com", account: "vikahramovich02@gmail.com" },
    { name: "Mailchimp", desc: "Email-маркетинг", logo: "mailchimp.com", account: "vika@marygroup.io" },
    { name: "SendPulse", desc: "Рассылки и автоматизация", logo: "sendpulse.com", account: "vika@marygroup.io" },
    { name: "Unisender", desc: "Email и SMS", logo: "unisender.com", account: "vikahramovich02@gmail.com" },
  ],
  "Сайты и магазины": [
    { name: "Tilda", desc: "Конструктор сайтов", logo: "tilda.cc", account: "vikahramovich02@gmail.com" },
    { name: "Shopify", desc: "Интернет-магазин", logo: "shopify.com", account: "vika@marygroup.io" },
    { name: "WordPress", desc: "CMS и блог", logo: "wordpress.com", account: "admin@marygroup.io" },
    { name: "InSales", desc: "E-commerce платформа", logo: "insales.ru", account: "vika@marygroup.io" },
  ],
};

var BRAND_COLORS = {
  "amocrm.ru": "#339DC7",
  "bitrix24.ru": "#00AEEF",
  "hubspot.com": "#FF7A59",
  "pipedrive.com": "#1B1B1B",
  "retailcrm.ru": "#E31C5B",
  "planfix.com": "#4A90D9",
  "telegram.org": "#26A5E4",
  "whatsapp.com": "#25D366",
  "instagram.com": "#E4405F",
  "vk.com": "#0077FF",
  "analytics.google.com": "#F9AB00",
  "metrika.yandex.ru": "#FC3F1D",
  "amplitude.com": "#1B0E3D",
  "mixpanel.com": "#7856FF",
  "ads.google.com": "#4285F4",
  "direct.yandex.ru": "#FFCC00",
  "facebook.com": "#1877F2",
  "tiktok.com": "#000000",
  "sheets.google.com": "#0F9D58",
  "notion.so": "#000000",
  "airtable.com": "#18BFFF",
  "onedrive.live.com": "#0078D4",
  "stripe.com": "#635BFF",
  "yookassa.ru": "#0044FF",
  "tinkoff.ru": "#FFDD2D",
  "gmail.com": "#EA4335",
  "mailchimp.com": "#FFE01B",
  "sendpulse.com": "#2088FF",
  "unisender.com": "#00C1B5",
  "tilda.cc": "#000000",
  "shopify.com": "#96BF48",
  "wordpress.com": "#21759B",
  "insales.ru": "#FF6600",
};

// SVG icons for ALL brands
var BRAND_SVG = {
  "telegram.org": function() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.37.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" fill="white"/></svg>; },
  "whatsapp.com": function() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M17.47 14.38c-.28-.14-1.65-.81-1.9-.9-.26-.1-.44-.14-.63.14-.19.28-.73.9-.89 1.09-.16.19-.33.21-.61.07-.28-.14-1.18-.44-2.25-1.39-.83-.74-1.39-1.66-1.56-1.94-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.5.14-.16.19-.28.28-.47.1-.19.05-.35-.02-.5-.07-.14-.63-1.52-.86-2.08-.23-.55-.46-.47-.63-.48-.16-.01-.35-.01-.54-.01-.19 0-.5.07-.76.35-.26.28-1 .98-1 2.38s1.02 2.76 1.17 2.95c.14.19 2.01 3.07 4.88 4.3.68.3 1.21.47 1.63.6.68.22 1.31.19 1.8.11.55-.08 1.65-.67 1.89-1.32.23-.65.23-1.2.16-1.32-.07-.12-.26-.19-.54-.33zM12.05 21.75h-.03a9.65 9.65 0 01-4.92-1.35l-.35-.21-3.67.96.98-3.58-.23-.37a9.65 9.65 0 01-1.48-5.14c0-5.33 4.34-9.67 9.68-9.67a9.61 9.61 0 016.84 2.84 9.61 9.61 0 012.83 6.84c0 5.33-4.34 9.68-9.67 9.68z" fill="white"/></svg>; },
  "instagram.com": function() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85 0 3.2-.01 3.58-.07 4.85-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07-3.2 0-3.58-.01-4.85-.07-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85 0-3.2.01-3.58.07-4.85C2.38 3.86 3.9 2.31 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 7a5 5 0 100 10 5 5 0 000-10zm0 8.25a3.25 3.25 0 110-6.5 3.25 3.25 0 010 6.5zM17.37 6.81a1.17 1.17 0 100-2.34 1.17 1.17 0 000 2.34z" fill="white"/></svg>; },
  "vk.com": function() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12.77 17.29s.27-.03.41-.18c.13-.14.12-.4.12-.4s-.02-1.22.55-1.4c.56-.18 1.28 1.18 2.04 1.7.58.39 1.02.3 1.02.3l2.05-.03s1.07-.07.56-.91c-.04-.07-.3-.63-1.54-1.78-1.3-1.2-1.12-.99.44-3.06.95-1.26 1.33-2.03 1.21-2.36-.11-.31-.81-.23-.81-.23l-2.31.01s-.17-.02-.3.05c-.13.08-.21.25-.21.25s-.38 1.01-.89 1.87c-1.07 1.81-1.5 1.91-1.67 1.79-.41-.27-.3-1.1-.3-1.69 0-1.84.28-2.6-.54-2.8-.27-.07-.47-.11-1.17-.12-.9-.01-1.66 0-2.09.21-.29.14-.51.47-.37.49.17.02.55.1.75.38.26.36.25 1.16.25 1.16s.15 2.16-.35 2.43c-.34.18-.81-.19-1.82-1.86-.52-.86-.91-1.81-.91-1.81s-.08-.18-.21-.28c-.16-.12-.39-.16-.39-.16l-2.19.01s-.33.01-.45.15c-.11.13-.01.39-.01.39s1.78 4.17 3.8 6.27c1.85 1.93 3.95 1.8 3.95 1.8h.95z" fill="white"/></svg>; },
  "notion.so": function() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4.46 4.77l9.54-.7c1.17-.1 1.47-.04 2.21.5l3.04 2.12c.5.36.66.46.66.86v11.53c0 .73-.27 1.15-1.21 1.22l-11.07.65c-.7.04-1.04-.07-1.41-.55L3.88 17.4c-.4-.55-.56-.97-.56-1.44V5.92c0-.6.27-1.08 1.14-1.15z" stroke="white" strokeWidth="1.5" fill="none"/><path d="M9 8l6-.4M9 11.5l6-.4" stroke="white" strokeWidth="1.3" strokeLinecap="round"/></svg>; },
  "amocrm.ru": function() { return <svg width="28" height="12" viewBox="0 0 56 16" fill="none"><text x="2" y="13" fontFamily="system-ui" fontSize="13" fontWeight="600" fontStyle="italic" fill="white">amoCRM.</text></svg>; },
  "bitrix24.ru": function() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 8l3.5 4L5 16" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M11 8l3.5 4L11 16" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 8l2 4-2 4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5"/></svg>; },
  "hubspot.com": function() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="16.5" cy="6" r="2" stroke="white" strokeWidth="1.5"/><path d="M14.5 8v4a3 3 0 11-6 0V8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><circle cx="7" cy="17" r="1.5" fill="white"/><path d="M17 12a5 5 0 01-5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>; },
  "pipedrive.com": function() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="white" strokeWidth="2"/><path d="M12 12v8" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>; },
  "retailcrm.ru": function() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 7h16l-2 10H6L4 7z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/><path d="M4 7l1-3h14l1 3" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/><circle cx="9" cy="20" r="1" fill="white"/><circle cx="15" cy="20" r="1" fill="white"/></svg>; },
  "planfix.com": function() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="3" stroke="white" strokeWidth="1.8"/><path d="M8 12h8M12 8v8" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>; },
  "gmail.com": function() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="2" stroke="white" strokeWidth="1.8"/><path d="M2 5l10 8 10-8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>; },
  "stripe.com": function() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 8.6c0-.87-.6-1.2-1.6-1.2-1.4 0-3 .5-4.4 1.3V5.2c1.5-.6 3-1 4.4-1 3 0 4.6 1.4 4.6 4v.8c0 4.2-5.5 3.6-5.5 5.4 0 .6.5.9 1.4.9 1.5 0 3.3-.7 4.8-1.6v3.4c-1.5.7-3.2 1.1-4.8 1.1-3 0-4.9-1.3-4.9-4 0-4.6 6-3.8 6-5.6z" fill="white"/></svg>; },
  "sheets.google.com": function() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" stroke="white" strokeWidth="1.8"/><path d="M8 8h8M8 12h8M8 16h5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>; },
  "ads.google.com": function() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 17l6-10 6 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="19" cy="17" r="3" fill="white"/></svg>; },
  "facebook.com": function() { return <svg width="12" height="20" viewBox="0 0 12 22" fill="none"><path d="M7.5 12.5h3l.5-3h-3.5V7.8c0-1.1.3-2.1 1.6-2.1H11V3.1C10.6 3.1 9.6 3 8.3 3 5.7 3 4 4.5 4 7.5v2H1v3h3V22h3.5V12.5z" fill="white"/></svg>; },
  "tiktok.com": function() { return <svg width="18" height="20" viewBox="0 0 18 22" fill="none"><path d="M9 1v14a3 3 0 11-3-3" stroke="white" strokeWidth="2" strokeLinecap="round"/><path d="M9 1c0 2.5 2.5 4 5 4" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>; },
  "tilda.cc": function() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 8h16M4 8v2c0 3-2.5 6-2.5 6h5S9 13 9 10V8M20 8v2c0 3 2.5 6 2.5 6h-5s2.5-3 2.5-6V8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>; },
  "shopify.com": function() { return <svg width="18" height="20" viewBox="0 0 24 24" fill="none"><path d="M15.5 4s-.5-.5-1.5-.5-2 .5-2.5 2L8 6.5s-.5.1-.5.5L6.5 17l7 1.5 4.5-1V5s-2-.5-2.5-1z" stroke="white" strokeWidth="1.5" fill="none"/><path d="M11 7v7l2-1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>; },
  "wordpress.com": function() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.8"/><path d="M3.5 12l5.5 8M12 3.5l3 10.5-3.5 1.5L8 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M15.5 5.5l2.5 9-3.5 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>; },
  "analytics.google.com": function() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="4" y="14" width="4" height="6" rx="1" fill="white"/><rect x="10" y="10" width="4" height="10" rx="1" fill="white"/><rect x="16" y="4" width="4" height="16" rx="1" fill="white"/></svg>; },
  "metrika.yandex.ru": function() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 20L10 8l4 6 6-10" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>; },
  "amplitude.com": function() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M2 16l5-8 3 4 4-8 3 6 5-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>; },
  "mixpanel.com": function() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="7" cy="12" r="3" fill="white"/><circle cx="17" cy="12" r="3" stroke="white" strokeWidth="2"/><path d="M10 12h4" stroke="white" strokeWidth="2"/></svg>; },
  "direct.yandex.ru": function() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M10 4h4v16h-4V4z" fill="#000" fillOpacity="0.7"/><path d="M10 4c-3.3 0-6 2.7-6 6s2.7 6 6 6V4z" fill="#000" fillOpacity="0.7"/></svg>; },
  "airtable.com": function() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 8l9-4 9 4v2l-9 4-9-4V8z" fill="white" fillOpacity="0.9"/><path d="M3 12l9 4 9-4v2l-9 4-9-4v-2z" fill="white" fillOpacity="0.6"/></svg>; },
  "onedrive.live.com": function() { return <svg width="20" height="16" viewBox="0 0 24 18" fill="none"><path d="M8 14c-2.8 0-5-2.2-5-5s2.2-5 5-5c.7 0 1.4.2 2 .4C11.2 2.6 13 1.5 15 1.5c3 0 5.5 2.3 5.8 5.2C22.6 7.5 24 9.5 24 12c0 3-2.5 5.5-5.5 5.5H8z" fill="white" fillOpacity="0.9"/></svg>; },
  "yookassa.ru": function() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="white" strokeWidth="2"/><path d="M10 9l4 3-4 3V9z" fill="white"/></svg>; },
  "tinkoff.ru": function() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 8h16M6 8v8a2 2 0 002 2h8a2 2 0 002-2V8M8 4h8l2 4H6l2-4z" stroke="#000" strokeWidth="1.8" strokeLinejoin="round" strokeOpacity="0.7"/></svg>; },
  "mailchimp.com": function() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M16 8c0-2.2-1.8-4-4-4S8 5.8 8 8c-2.2 0-4 1.8-4 4s1.8 4 4 4h8c2.2 0 4-1.8 4-4s-1.8-4-4-4z" stroke="#000" strokeWidth="1.8" strokeOpacity="0.7"/><circle cx="10" cy="10" r="1" fill="#000" fillOpacity="0.7"/><circle cx="14" cy="10" r="1" fill="#000" fillOpacity="0.7"/></svg>; },
  "sendpulse.com": function() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 4L4 12l8 8 8-8-8-8z" stroke="white" strokeWidth="2" strokeLinejoin="round"/><path d="M12 8v4l3 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>; },
  "unisender.com": function() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 4v10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/><path d="M7 9v5a5 5 0 0010 0V9" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>; },
  "insales.ru": function() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="12" rx="2" stroke="white" strokeWidth="1.8"/><path d="M8 12h8M12 9v6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>; },
};

function ServiceIcon(props) {
  var domain = props.domain || "";
  var bg = BRAND_COLORS[domain] || T.muted;
  var SvgIcon = BRAND_SVG[domain];
  var letter = props.name ? props.name.charAt(0) : domain.charAt(0).toUpperCase();
  var isLight = bg === "#FFCC00" || bg === "#FFE01B" || bg === "#FFDD2D" || bg === "#F9AB00";
  return (
    <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {SvgIcon ? SvgIcon() : <span style={{ fontSize: 16, fontWeight: 450, color: isLight ? "#000" : "#fff" }}>{letter}</span>}
    </div>
  );
}

function Integrations() {
  var _q = useState(""); var query = _q[0]; var setQuery = _q[1];
  var _connected = useState({}); var connected = _connected[0]; var setConnected = _connected[1];
  var brd = "rgba(38,38,51,0.05)";

  function toggle(name) {
    var next = {};
    for (var k in connected) next[k] = connected[k];
    if (next[name]) { delete next[name]; } else { next[name] = true; }
    setConnected(next);
  }

  var allServices = [];
  Object.keys(INTEGRATIONS).forEach(function(cat) {
    INTEGRATIONS[cat].forEach(function(s) { allServices.push(Object.assign({}, s, { cat: cat })); });
  });
  var connectedList = allServices.filter(function(s) { return !!connected[s.name]; });

  var filtered = {};
  Object.keys(INTEGRATIONS).forEach(function(cat) {
    var items = INTEGRATIONS[cat].filter(function(s) {
      if (connected[s.name]) return false;
      if (!query.trim()) return true;
      return s.name.toLowerCase().indexOf(query.toLowerCase()) >= 0;
    });
    if (items.length > 0) filtered[cat] = items;
  });

  return (
    <div style={{ flex: 1, height: "100vh", overflowY: "auto", fontFamily: T.font, background: T.white }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 40px 80px" }}>
        <div style={{ fontSize: 24, fontWeight: 450, color: T.ink, marginBottom: 8 }}>{"Интеграции"}</div>
        <div style={{ fontSize: 15, fontWeight: 450, color: T.muted, marginBottom: 32 }}>{"Подключите сервисы, чтобы агенты работали с вашими данными"}</div>

        {/* Search */}
        <div style={{ marginBottom: 32 }}>
          {(function() {
            var _f = useState(false); var focused = _f[0]; var setFocused = _f[1];
            var _h = useState(false); var hovered = _h[0]; var setHovered = _h[1];
            var bdr = focused ? "#262633" : hovered ? "#C0C0C8" : "rgba(38,38,51,0.12)";
            return (
              <div onMouseEnter={function() { setHovered(true); }} onMouseLeave={function() { setHovered(false); }}
                style={{ display: "flex", alignItems: "center", background: "transparent", borderRadius: 14, padding: "4px 20px 4px 4px", border: "1.5px solid " + bdr, transition: "all .15s" }}>
                <input type="text" value={query} onChange={function(e) { setQuery(e.target.value); }} onFocus={function() { setFocused(true); }} onBlur={function() { setFocused(false); }}
                  placeholder="Поиск" style={{ flex: 1, padding: "12px 16px", border: "none", fontSize: 15, fontFamily: T.font, fontWeight: 450, outline: "none", background: "transparent", color: T.ink }} />
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={focused ? "#262633" : "#9090A0"} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
              </div>
            );
          })()}
        </div>

        {/* Connected */}
        {connectedList.length > 0 ? (
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 18, fontWeight: 450, color: T.ink, marginBottom: 16 }}>{"Подключенные"}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {connectedList.map(function(s) {
                return (
                  <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 14, background: T.surface }}>
                    <ServiceIcon domain={s.logo} name={s.name} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 450, color: T.ink }}>{s.name}</div>
                      <div style={{ fontSize: 13, fontWeight: 450, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.account || s.desc}</div>
                    </div>
                    <span onClick={function() { toggle(s.name); }} style={{ fontSize: 13, fontWeight: 450, color: T.red, cursor: "pointer", padding: "6px 14px", borderRadius: 8, border: "1px solid " + brd, flexShrink: 0 }}>{"Отключить"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Доступные */}
        {Object.keys(filtered).length > 0 ? (
          <div style={{ fontSize: 18, fontWeight: 450, color: T.ink, marginBottom: 24 }}>{"Доступные"}</div>
        ) : null}
        {Object.keys(filtered).map(function(cat) {
          return (
            <div key={cat} style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 14, fontWeight: 450, color: T.muted, marginBottom: 20, paddingBottom: 8, borderBottom: "1px solid rgba(38,38,51,0.05)" }}>{cat}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, justifyItems: "center" }}>
                {filtered[cat].map(function(s) {
                  return (
                    <div key={s.name} onClick={function() { toggle(s.name); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, cursor: "pointer", padding: 8 }}>
                      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#F0F0F3", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .15s" }}
                        onMouseEnter={function(e) { e.currentTarget.style.background = "#E6E6EA"; }}
                        onMouseLeave={function(e) { e.currentTarget.style.background = "#F0F0F3"; }}>
                        <ServiceIcon domain={s.logo} name={s.name} />
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 450, color: T.ink, textAlign: "center" }}>{s.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══ HOME ═══
function Home() {
  var PRESET_WIDGETS = [
    { id: "tasks", title: "Задачи", w: 2, h: 1, content: function() {
      return (
        <div>
          <div style={{ fontSize: 32, fontWeight: 450, color: T.ink }}>{"0"}</div>
          <div style={{ fontSize: 13, fontWeight: 450, color: T.muted, marginTop: 4 }}>{"активных задач"}</div>
        </div>
      );
    }},
    { id: "agents", title: "Агенты", w: 1, h: 1, content: function() {
      return (
        <div>
          <div style={{ fontSize: 32, fontWeight: 450, color: T.ink }}>{"5"}</div>
          <div style={{ fontSize: 13, fontWeight: 450, color: T.muted, marginTop: 4 }}>{"подключено"}</div>
        </div>
      );
    }},
    { id: "messages", title: "Сообщения", w: 1, h: 1, content: function() {
      return (
        <div>
          <div style={{ fontSize: 32, fontWeight: 450, color: T.ink }}>{"24"}</div>
          <div style={{ fontSize: 13, fontWeight: 450, color: T.muted, marginTop: 4 }}>{"за сегодня"}</div>
        </div>
      );
    }},
    { id: "integrations", title: "Интеграции", w: 1, h: 1, content: function() {
      return (
        <div>
          <div style={{ fontSize: 32, fontWeight: 450, color: T.ink }}>{"3"}</div>
          <div style={{ fontSize: 13, fontWeight: 450, color: T.muted, marginTop: 4 }}>{"подключено"}</div>
        </div>
      );
    }},
    { id: "calendar", title: "Календарь", w: 1, h: 1, content: function() {
      var d = new Date();
      var days = ["ВС","ПН","ВТ","СР","ЧТ","ПТ","СБ"];
      return (
        <div>
          <div style={{ fontSize: 13, fontWeight: 450, color: T.red, textTransform: "uppercase" }}>{days[d.getDay()]}</div>
          <div style={{ fontSize: 36, fontWeight: 450, color: T.ink, lineHeight: 1 }}>{d.getDate()}</div>
        </div>
      );
    }},
  ];

  var _widgets = useState(["tasks", "agents", "messages", "calendar"]);
  var widgets = _widgets[0]; var setWidgets = _widgets[1];
  var _dragging = useState(null); var dragging = _dragging[0]; var setDragging = _dragging[1];
  var _dragOver = useState(null); var dragOver = _dragOver[0]; var setDragOver = _dragOver[1];
  var _showPicker = useState(false); var showPicker = _showPicker[0]; var setShowPicker = _showPicker[1];

  function removeWidget(id) {
    setWidgets(function(prev) { return prev.filter(function(w) { return w !== id; }); });
  }

  function addWidget(id) {
    if (widgets.indexOf(id) < 0) {
      setWidgets(function(prev) { return prev.concat([id]); });
    }
    setShowPicker(false);
  }

  function handleDragStart(id) { setDragging(id); }
  function handleDragOver(e, id) { e.preventDefault(); setDragOver(id); }
  function handleDrop(targetId) {
    if (!dragging || dragging === targetId) { setDragging(null); setDragOver(null); return; }
    setWidgets(function(prev) {
      var arr = prev.slice();
      var fromIdx = arr.indexOf(dragging);
      var toIdx = arr.indexOf(targetId);
      if (fromIdx < 0 || toIdx < 0) return prev;
      arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, dragging);
      return arr;
    });
    setDragging(null); setDragOver(null);
  }

  var cellSize = 180;
  var gap = 16;

  return (
    <div style={{ flex: 1, height: "100vh", overflowY: "auto", fontFamily: T.font, background: T.white }}>
      <div style={{ padding: "32px 40px 80px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div style={{ fontSize: 24, fontWeight: 450, color: T.ink }}>{"Главная"}</div>
          <div onClick={function() { setShowPicker(!showPicker); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, background: T.ink, color: T.white, fontSize: 14, fontWeight: 450, cursor: "pointer" }}>
            {"Создать виджет"}
            <span style={{ fontSize: 16 }}>{"→"}</span>
          </div>
        </div>

        {/* Widget picker */}
        {showPicker ? (
          <div style={{ marginBottom: 24, padding: "20px", borderRadius: 16, background: T.surface }}>
            <div style={{ fontSize: 14, fontWeight: 450, color: T.ink, marginBottom: 12 }}>{"Добавить виджет"}</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {PRESET_WIDGETS.filter(function(p) { return widgets.indexOf(p.id) < 0; }).map(function(p) {
                return (
                  <div key={p.id} onClick={function() { addWidget(p.id); }} style={{ padding: "8px 16px", borderRadius: 8, background: T.white, fontSize: 13, fontWeight: 450, color: T.ink, cursor: "pointer" }}>
                    {p.title}
                  </div>
                );
              })}
              {PRESET_WIDGETS.filter(function(p) { return widgets.indexOf(p.id) < 0; }).length === 0 ? (
                <div style={{ fontSize: 13, fontWeight: 450, color: T.muted }}>{"Все виджеты добавлены"}</div>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Widgets grid — drag & drop */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: gap }}>
          {widgets.map(function(wid) {
            var preset = PRESET_WIDGETS.find(function(p) { return p.id === wid; });
            if (!preset) return null;
            var width = preset.w * cellSize + (preset.w - 1) * gap;
            var height = preset.h * cellSize;
            var isDragging = dragging === wid;
            var isDragOver = dragOver === wid;

            return (
              <div key={wid}
                draggable="true"
                onDragStart={function() { handleDragStart(wid); }}
                onDragOver={function(e) { handleDragOver(e, wid); }}
                onDrop={function() { handleDrop(wid); }}
                onDragEnd={function() { setDragging(null); setDragOver(null); }}
                style={{
                  width: width, height: height, borderRadius: 20,
                  background: T.surface, padding: 20,
                  display: "flex", flexDirection: "column",
                  position: "relative", cursor: "grab",
                  opacity: isDragging ? 0.4 : 1,
                  outline: isDragOver ? "2px solid " + T.ink : "none",
                  outlineOffset: 2,
                  transition: "opacity .15s, outline .15s",
                }}>
                <div style={{ fontSize: 13, fontWeight: 450, color: T.muted, marginBottom: 12 }}>{preset.title}</div>
                <div style={{ flex: 1, display: "flex", alignItems: "flex-end" }}>
                  {preset.content()}
                </div>
                <div onClick={function() { removeWidget(wid); }} style={{ position: "absolute", top: 12, right: 12, width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, color: T.muted, opacity: 0.5 }}
                  onMouseEnter={function(e) { e.currentTarget.style.opacity = "1"; }}
                  onMouseLeave={function(e) { e.currentTarget.style.opacity = "0.5"; }}>{"×"}</div>
              </div>
            );
          })}

          {/* Add placeholder */}
          <div onClick={function() { setShowPicker(true); }} style={{
            width: cellSize, height: cellSize, borderRadius: 20,
            border: "2px dashed rgba(38,38,51,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "border-color .15s",
          }}
          onMouseEnter={function(e) { e.currentTarget.style.borderColor = "rgba(38,38,51,0.25)"; }}
          onMouseLeave={function(e) { e.currentTarget.style.borderColor = "rgba(38,38,51,0.1)"; }}>
            <span style={{ fontSize: 28, color: T.muted, fontWeight: 300 }}>{"+"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══ DATA PAGE ═══
function DataPage() {
  var _tab = useState("all"); var tab = _tab[0]; var setTab = _tab[1];

  // ── Files ──
  var _files = useState([
    { id: "d1", type: "file", name: "Идеи для контент-плана", time: "14:33", format: "PDF", size: "2.4 MB", agent: "Маркетолог", date: "2026-03-16", fav: false },
    { id: "d2", type: "file", name: "Идеи для контент-плана", time: "14:33", format: "PDF", size: "2.4 MB", agent: null, date: "2026-03-16", fav: true },
    { id: "d3", type: "file", name: "Идеи для контент-плана", time: "14:33", format: "PDF", size: "2.4 MB", agent: "Маркетолог", date: "2026-03-16", fav: false },
    { id: "d4", type: "file", name: "Идеи для контент-плана", time: "14:33", format: "PDF", size: "2.4 MB", agent: "Маркетолог", date: "2026-03-10", fav: false },
    { id: "d5", type: "file", name: "Идеи для контент-плана", time: "14:33", format: "PDF", size: "2.4 MB", agent: "Маркетолог", date: "2026-03-10", fav: false },
    { id: "d6", type: "file", name: "Идеи для контент-плана", time: "14:33", format: "PDF", size: "2.4 MB", agent: "Маркетолог", date: "2026-03-10", fav: false },
  ]);
  var files = _files[0]; var setFiles = _files[1];

  // ── Links ──
  var _links = useState([
    { id: "l1", name: "Ссылка на статью по Дизайну", url: "https://skillbox.ru/media/design/kak-vybrat-cvet-sh...", date: "2026-03-16" },
    { id: "l2", name: "Ссылка на статью по Дизайну", url: "https://skillbox.ru/media/design/kak-vybrat-cvet-sh...", date: "2026-03-10" },
    { id: "l3", name: "Ссылка на статью по Дизайну", url: "https://skillbox.ru/media/design/kak-vybrat-cvet-sh...", date: "2026-03-10" },
  ]);
  var links = _links[0]; var setLinks = _links[1];

  // ── Contacts ──
  var _contacts = useState([
    { id: "c1", name: "Андрей Петров", role: "Менеджер" },
    { id: "c2", name: "Юлия Викторовна Захарчук", role: "Директор Коммунарки" },
  ]);
  var contacts = _contacts[0]; var setContacts = _contacts[1];

  // ── Meetings ──
  var _meetings = useState([
    { id: "m1", name: "Планёрка — SEO для репетиторов", time: "15:30", duration: "5 ч 22 мин", agent: null, date: "2026-03-16", isMeeting: true,
      fullDate: "07.02.2026 15:30",
      participants: [{ letter: "В", color: "#5C6AC1" }, { letter: "A", color: "#FF4D00" }],
      summary: "Обсудили стратегию продвижения платформы репетиторов через SEO. Сейчас 80% трафика — платная реклама, органики почти нет. Сайт не оптимизирован: нет посадочных под ключевые запросы, мета-теги пустые, скорость загрузки 4.2 сек. Решили создать 30 SEO-страниц под топ-запросы, запустить блог с 8 статьями в месяц, исправить техническую часть. Цель — через 3 месяца получать 500+ органических визитов в день. Бюджет на контент — $300/мес.",
      insights: [
        { title: "Технические и системные инсайты", items: [
          "82% трафика — платная реклама. Без неё бизнес встаёт.",
          "Понимание того, что текущее решение должно работать не только для одной категории товаров, но и для десяти других в будущем. 11:55",
          "Понимание того, что текущее решение должно работать не только для одной категории товаров, но и для десяти других в будущем. 11:55",
        ]},
        { title: "Контентные инсайты", items: [] },
      ],
      transcript: [
        { speaker: "Спикер 1", color: "#0794FF", time: "00:00", texts: ["Мы слишком зависим от рекламы, надо выходить в органику"] },
        { speaker: "Спикер 2", color: "#FF4107", time: "00:04", texts: ["82% трафика — Директ и Ads. По коммерческим запросам типа \"репетитор по математике\" мы не в топ-50", "Три проблемы: нет посадочных, мета-теги пустые на 90% страниц, скорость 4.2 сек"] },
        { speaker: "Спикер 1", color: "#0794FF", time: "00:10", texts: ["Какие запросы самые жирные?"] },
        { speaker: "Спикер 2", color: "#FF4107", time: "00:14", texts: ["\"Репетитор по математике\" — 12к/мес, \"по английскому\" — 9к, \"подготовка к ЦТ\" — 7к, \"онлайн\" — 5к"] },
      ],
      tasks: [
        { text: "Собрать семантическое ядро — топ-100 запросов", time: "01:22-01:48", agent: "Маркетолог", sent: true },
        { text: "Настроить sitemap, robots.txt, Schema.org", time: "01:22-01:48", agent: "Разработчику", sent: false },
        { text: "Написать 15 SEO-страниц (математика, физика,", time: "01:22-01:48", agent: "Копирайтера", sent: false },
        { text: "Написать первые 2 статьи для блога", time: "01:22-01:48", agent: "Копирайтера", sent: false },
        { text: "Собрать семантическое ядро — топ-100 запросов", time: "01:22-01:48", agent: "Маркетологу", sent: false },
      ],
    },
    { id: "m2", name: "Идеи для контент-плана", time: "14:33", duration: "", agent: "Маркетолог", date: "2026-03-10", format: "PDF", size: "2.4 MB", isMeeting: false },
    { id: "m3", name: "Идеи для контент-плана", time: "14:33", duration: "", agent: "Маркетолог", date: "2026-03-10", format: "PDF", size: "2.4 MB", isMeeting: false },
    { id: "m4", name: "Идеи для контент-плана", time: "14:33", duration: "", agent: "Маркетолог", date: "2026-03-10", format: "PDF", size: "2.4 MB", isMeeting: false },
  ]);
  var meetings = _meetings[0]; var setMeetings = _meetings[1];


  // ── UI state ──
  var _addMenu = useState(false); var addMenu = _addMenu[0]; var setAddMenu = _addMenu[1];
  var _addType = useState(null); var addType = _addType[0]; var setAddType = _addType[1];
  var _linkUrl = useState(""); var linkUrl = _linkUrl[0]; var setLinkUrl = _linkUrl[1];
  var _linkName = useState(""); var linkName = _linkName[0]; var setLinkName = _linkName[1];
  var _contactNameInput = useState(""); var contactNameInput = _contactNameInput[0]; var setContactNameInput = _contactNameInput[1];
  var _contactRoleInput = useState(""); var contactRoleInput = _contactRoleInput[0]; var setContactRoleInput = _contactRoleInput[1];
  var fileInputRef = useRef(null);
  var _openDots = useState(null); var openDots = _openDots[0]; var setOpenDots = _openDots[1];
  var _previewItem = useState(null); var previewItem = _previewItem[0]; var setPreviewItem = _previewItem[1];
  var _openMeeting = useState(null); var openMeeting = _openMeeting[0]; var setOpenMeeting = _openMeeting[1];
  var _mTab = useState("summary"); var mTab = _mTab[0]; var setMTab = _mTab[1];
  var _openInsight = useState(0); var openInsight = _openInsight[0]; var setOpenInsight = _openInsight[1];
  var _showMaryChat = useState(false); var showMaryChat = _showMaryChat[0]; var setShowMaryChat = _showMaryChat[1];
  var _maryChatInput = useState(""); var maryChatInput = _maryChatInput[0]; var setMaryChatInput = _maryChatInput[1];
  var _maryChatMessages = useState([
    { type: "quick", items: ["Какие главные решения были приняты?", "Какие задачи распределили?", "Какие риски обсуждались?"] },
    { type: "assistant", text: "Отлично. Чтобы я подключилась к Битрикс и вытянула историю поездок — нужно подключить Mary к вашему бизнесу.", actions: ["В CRM"] },
  ]); var maryChatMessages = _maryChatMessages[0]; var setMaryChatMessages = _maryChatMessages[1];

  var tabs = [
    { id: "all", label: "Все" },
    { id: "fav", label: "Избранные" },
    { id: "file", label: "Файлы" },
    { id: "link", label: "Ссылки" },
    { id: "contact", label: "Контакты" },
    { id: "meeting", label: "Встречи" },
  ];

  // ── Helpers ──
  function removeFile(id) { setFiles(function(p) { return p.filter(function(f) { return f.id !== id; }); }); setOpenDots(null); }
  function removeLink(id) { setLinks(function(p) { return p.filter(function(f) { return f.id !== id; }); }); setOpenDots(null); }
  function removeMeeting(id) { setMeetings(function(p) { return p.filter(function(f) { return f.id !== id; }); }); setOpenDots(null); }
  function toggleFav(id) { setFiles(function(p) { return p.map(function(f) { return f.id === id ? Object.assign({}, f, { fav: !f.fav }) : f; }); }); }



  function addLink() {
    if (!linkName.trim()) return;
    setLinks(function(p) { return [{ id: "l" + Date.now(), name: linkName, url: linkUrl, date: new Date().toISOString().slice(0, 10) }].concat(p); });
    setLinkName(""); setLinkUrl(""); setAddType(null);
  }

  function addContact() {
    if (!contactNameInput.trim()) return;
    setContacts(function(p) { return p.concat([{ id: "c" + Date.now(), name: contactNameInput, role: contactRoleInput || "" }]); });
    setContactNameInput(""); setContactRoleInput(""); setAddType(null);
  }

  function handleFileInput(e) {
    var inputFiles = e.target.files;
    var now = new Date(); var dateStr = now.toISOString().slice(0, 10); var timeStr = now.toTimeString().slice(0, 5);
    for (var i = 0; i < inputFiles.length; i++) {
      var f = inputFiles[i]; var ext = f.name.split(".").pop().toUpperCase();
      setFiles(function(p) { return [{ id: "d" + Date.now() + i, type: "file", name: f.name.replace(/\.[^.]+$/, ""), time: timeStr, format: ext, size: (f.size / 1024 / 1024).toFixed(1) + " MB", agent: null, date: dateStr, fav: false }].concat(p); });
    }
    setAddMenu(false);
  }

  // ── Date grouping ──
  function formatDateGroup(dateStr) {
    var today = new Date(); var d = new Date(dateStr + "T00:00:00");
    var todayStr = today.toISOString().slice(0, 10);
    var days = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
    var months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
    if (dateStr === todayStr) return "Сегодня, " + d.getDate() + " " + months[d.getMonth()];
    var yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    if (dateStr === yesterday.toISOString().slice(0, 10)) return "Вчера, " + d.getDate() + " " + months[d.getMonth()];
    return days[d.getDay()] + ", " + d.getDate() + " " + months[d.getMonth()];
  }
  function groupByDate(items) {
    var groups = []; var seen = {};
    items.forEach(function(f) { if (!seen[f.date]) { seen[f.date] = true; groups.push(f.date); } });
    return groups;
  }

  // ── Filtered items for "Все" / "Избранные" ──
  var allItems = [];
  if (tab === "all" || tab === "fav") {
    files.forEach(function(f) { if (tab === "all" || f.fav) allItems.push(Object.assign({}, f, { _kind: "file" })); });
  }

  var sectionTitle = tab === "all" ? "Все" : tab === "fav" ? "Избранные" : tab === "file" ? "Файлы" : tab === "link" ? "Ссылки" : tab === "contact" ? "Контакты" : "Встречи";

  // ── File thumbnail (54x54, r16, 3D icon) ──
  var FILE_ICON = "data:image/png;base64,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";
  function FileThumbnail() {
    return (
      <div style={{ width: 54, height: 54, borderRadius: 16, background: "#F7F8FA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
        <img src={FILE_ICON} alt="" style={{ width: 40, height: 40, objectFit: "contain" }} />
      </div>
    );
  }

  // ── Link thumbnail ──
  function LinkThumbnail() {
    return (
      <div style={{ width: 54, height: 54, borderRadius: 16, background: "#F7F8FA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="#C0C0C0" strokeWidth="2" strokeLinecap="round"/>
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="#C0C0C0" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
    );
  }

  // ── Contact thumbnail (3D icon) ──
  var CONTACT_ICON = "data:image/png;base64,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";
  function ContactThumbnail() {
    return (
      <div style={{ width: 54, height: 54, borderRadius: 16, background: "#F7F8FA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
        <img src={CONTACT_ICON} alt="" style={{ width: 54, height: 54, objectFit: "cover" }} />
      </div>
    );
  }

  // ── Meeting thumbnail ──
  function MeetingThumbnail() {
    return (
      <div style={{ width: 54, height: 54, borderRadius: 16, background: "#F7F8FA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="4" width="20" height="14" rx="3" stroke="#C0C0C0" strokeWidth="1.8"/>
          <circle cx="12" cy="11" r="3" stroke="#C0C0C0" strokeWidth="1.5"/>
          <circle cx="12" cy="11" r="1" fill="#C0C0C0"/>
        </svg>
      </div>
    );
  }

  // ── Kebab menu (3 dots vertical) ──
  function KebabMenu(props) {
    var isOpen = openDots === props.id;
    return (
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div onClick={function(e) { e.stopPropagation(); setOpenDots(isOpen ? null : props.id); }}
          style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background .15s" }}
          onMouseEnter={function(e) { e.currentTarget.style.background = "#F7F8FA"; }}
          onMouseLeave={function(e) { e.currentTarget.style.background = "transparent"; }}>
          <svg width="3" height="14" viewBox="0 0 3 14" fill="none">
            <circle cx="1.5" cy="1.5" r="1" stroke="#262633" strokeWidth="1"/>
            <circle cx="1.5" cy="7" r="1" stroke="#262633" strokeWidth="1"/>
            <circle cx="1.5" cy="12.5" r="1" stroke="#262633" strokeWidth="1"/>
          </svg>
        </div>
        {isOpen ? (
          <div style={{ position: "absolute", right: 0, top: 42, background: T.white, borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,.12)", padding: "6px 0", zIndex: 30, minWidth: 160 }}>
            {(props.actions || []).map(function(item, ii) {
              return (
                <div key={ii} onClick={function(e) { e.stopPropagation(); item.action(); }} style={{ padding: "10px 16px", fontSize: 14, fontWeight: 450, color: item.color || "#262633", cursor: "pointer", transition: "background .1s" }}
                  onMouseEnter={function(e) { e.currentTarget.style.background = "#F7F8FA"; }}
                  onMouseLeave={function(e) { e.currentTarget.style.background = "transparent"; }}>
                  {item.label}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  }

  // ── Agent badge (r46, bg #F7F8FA, 20x20 circle + text) ──
  function AgentBadge(props) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 46, background: "#FFFFFF", fontSize: 14, fontWeight: 450, color: "#262633", opacity: 0.5, flexShrink: 0 }}>
        <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#E7E7E7" }} />
        <span>{props.agent}</span>
      </div>
    );
  }

  // ── "Загружено мной" badge ──
  function UploadedBadge() {
    return (
      <div style={{ display: "flex", alignItems: "center", padding: "6px 10px", borderRadius: 46, background: "#FFFFFF", fontSize: 14, fontWeight: 450, color: "#262633", opacity: 0.5, flexShrink: 0 }}>
        {"Загруженно мной"}
      </div>
    );
  }

  // ── File row ──
  function FileRow(props) {
    var item = props.item;
    return (
      <div onClick={function() { setPreviewItem(item); }} style={{ display: "flex", alignItems: "center", gap: 16, padding: 12, borderRadius: 20, cursor: "pointer", transition: "background .1s" }}
        onMouseEnter={function(e) { e.currentTarget.style.background = "#F5F5F8"; }}
        onMouseLeave={function(e) { e.currentTarget.style.background = "transparent"; }}>
        <FileThumbnail />
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 86, minWidth: 0 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 20, minWidth: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 450, color: "#262633", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 450, color: "#262633", opacity: 0.5 }}>
                <span>{item.time}</span><span>{"\u00B7"}</span><span>{item.format}</span><span>{"\u00B7"}</span><span>{item.size}</span>
              </div>
            </div>
            {item.agent ? <AgentBadge agent={item.agent} /> : <UploadedBadge />}
          </div>
          <KebabMenu id={item.id} actions={[
            { label: item.fav ? "Убрать из избранного" : "В избранное", action: function() { toggleFav(item.id); setOpenDots(null); } },
            { label: "Скачать", action: function() { setOpenDots(null); } },
            { label: "Удалить", action: function() { removeFile(item.id); }, color: T.red },
          ]} />
        </div>
      </div>
    );
  }

  // ── Link row ──
  function LinkRow(props) {
    var item = props.item;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: 12, borderRadius: 20, cursor: "pointer", transition: "background .1s" }}
        onMouseEnter={function(e) { e.currentTarget.style.background = "#F5F5F8"; }}
        onMouseLeave={function(e) { e.currentTarget.style.background = "transparent"; }}>
        <LinkThumbnail />
        <div style={{ flex: 1, display: "flex", alignItems: "center", minWidth: 0 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 450, color: "#262633", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
            <div style={{ fontSize: 14, fontWeight: 450, color: "#262633", opacity: 0.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.url}</div>
          </div>
          <KebabMenu id={item.id} actions={[
            { label: "Открыть", action: function() { setOpenDots(null); } },
            { label: "Удалить", action: function() { removeLink(item.id); }, color: T.red },
          ]} />
        </div>
      </div>
    );
  }

  // ── Meeting row ──
  function MeetingRow(props) {
    var item = props.item;
    return (
      <div onClick={function() { if (item.summary) { setOpenMeeting(item); setMTab("summary"); setOpenInsight(0); } }} style={{ display: "flex", alignItems: "center", gap: 16, padding: 12, borderRadius: 20, cursor: "pointer", transition: "background .1s" }}
        onMouseEnter={function(e) { e.currentTarget.style.background = "#F5F5F8"; }}
        onMouseLeave={function(e) { e.currentTarget.style.background = "transparent"; }}>
        {item.isMeeting ? <MeetingThumbnail /> : <FileThumbnail />}
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 86, minWidth: 0 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 20, minWidth: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 450, color: "#262633", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 450, color: "#262633" }}>
                <span>{item.time}</span>
                {item.duration ? <><span style={{ opacity: 0.4 }}>{"\u00B7"}</span><span>{item.duration}</span></> : null}
                {item.format ? <><span style={{ opacity: 0.4 }}>{"\u00B7"}</span><span>{item.format}</span></> : null}
                {item.size ? <><span style={{ opacity: 0.4 }}>{"\u00B7"}</span><span>{item.size}</span></> : null}
              </div>
            </div>
            {item.agent ? <AgentBadge agent={item.agent} /> : null}
          </div>
          <KebabMenu id={item.id} actions={[
            { label: "Удалить", action: function() { removeMeeting(item.id); }, color: T.red },
          ]} />
        </div>
      </div>
    );
  }

  // ── Grouped list renderer ──
  function GroupedList(props) {
    var items = props.items;
    var dates = groupByDate(items);
    if (items.length === 0) return <div style={{ textAlign: "center", padding: "40px 0", color: T.muted, fontSize: 14, fontWeight: 450 }}>{"Пока пусто"}</div>;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {dates.map(function(dateKey) {
          var dayItems = items.filter(function(f) { return f.date === dateKey; });
          return (
            <div key={dateKey} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, height: 34 }}>
                <span style={{ fontSize: 14, fontWeight: 450, color: "rgba(38,38,51,0.5)" }}>{formatDateGroup(dateKey)}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {dayItems.map(function(item) { return props.renderRow(item); })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ flex: 1, height: "100vh", overflowY: "auto", fontFamily: T.font, background: T.white, position: "relative" }} onClick={function() { if (openDots) setOpenDots(null); if (addMenu) setAddMenu(false); }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 40px 80px" }}>

        {!openMeeting ? <div>
        {/* ── Header: "Данные" + "+" button ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
          <div style={{ fontSize: 28, fontWeight: 500, color: "#262633" }}>{"Данные"}</div>
          <div style={{ position: "relative" }}>
            <div onClick={function(e) { e.stopPropagation(); setAddMenu(!addMenu); }} style={{
              width: 36, height: 36, borderRadius: 10, background: "#1D1D1F", color: T.white,
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            {addMenu ? (
              <div style={{ position: "absolute", right: 0, top: 44, background: T.white, borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,.12)", padding: "6px 0", zIndex: 20, minWidth: 180 }}>
                {[
                  { icon: "📄", label: "Файл", action: function() { if (fileInputRef.current) fileInputRef.current.click(); setAddMenu(false); } },
                  { icon: "🔗", label: "Ссылка", action: function() { setAddType("link"); setAddMenu(false); } },
                  { icon: "👤", label: "Контакт", action: function() { setAddType("contact"); setAddMenu(false); } },
                ].map(function(item, ii) {
                  return (
                    <div key={ii} onClick={function(e) { e.stopPropagation(); item.action(); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", fontSize: 14, fontWeight: 450, color: "#262633", cursor: "pointer" }}
                      onMouseEnter={function(e) { e.currentTarget.style.background = "#F7F8FA"; }}
                      onMouseLeave={function(e) { e.currentTarget.style.background = "transparent"; }}>
                      <span style={{ fontSize: 16 }}>{item.icon}</span><span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            ) : null}
            <input ref={fileInputRef} type="file" multiple style={{ display: "none" }} onChange={handleFileInput} />
          </div>
        </div>

        {/* ── Add link form ── */}
        {addType === "link" ? (
          <div style={{ marginBottom: 24, padding: 24, borderRadius: 16, background: "#F7F8FA" }}>
            <div style={{ fontSize: 16, fontWeight: 450, color: "#262633", marginBottom: 16 }}>{"Добавить ссылку"}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input type="text" value={linkName} onChange={function(e) { setLinkName(e.target.value); }} placeholder="Название" style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #E7E7E7", fontSize: 14, fontFamily: T.font, fontWeight: 450, outline: "none" }} />
              <input type="text" value={linkUrl} onChange={function(e) { setLinkUrl(e.target.value); }} placeholder="https://..." style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #E7E7E7", fontSize: 14, fontFamily: T.font, fontWeight: 450, outline: "none" }} />
              <div style={{ display: "flex", gap: 8 }}>
                <div onClick={addLink} style={{ padding: "8px 20px", borderRadius: 10, background: "#1D1D1F", color: T.white, fontSize: 14, fontWeight: 450, cursor: "pointer" }}>{"Добавить"}</div>
                <div onClick={function() { setAddType(null); }} style={{ padding: "8px 20px", borderRadius: 10, fontSize: 14, fontWeight: 450, color: T.muted, cursor: "pointer" }}>{"Отмена"}</div>
              </div>
            </div>
          </div>
        ) : null}

        {/* ── Add contact form ── */}
        {addType === "contact" ? (
          <div style={{ marginBottom: 24, padding: 24, borderRadius: 16, background: "#F7F8FA" }}>
            <div style={{ fontSize: 16, fontWeight: 450, color: "#262633", marginBottom: 16 }}>{"Добавить контакт"}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input type="text" value={contactNameInput} onChange={function(e) { setContactNameInput(e.target.value); }} placeholder="Имя" style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #E7E7E7", fontSize: 14, fontFamily: T.font, fontWeight: 450, outline: "none" }} />
              <input type="text" value={contactRoleInput} onChange={function(e) { setContactRoleInput(e.target.value); }} placeholder="Должность" style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #E7E7E7", fontSize: 14, fontFamily: T.font, fontWeight: 450, outline: "none" }} />
              <div style={{ display: "flex", gap: 8 }}>
                <div onClick={addContact} style={{ padding: "8px 20px", borderRadius: 10, background: "#1D1D1F", color: T.white, fontSize: 14, fontWeight: 450, cursor: "pointer" }}>{"Добавить"}</div>
                <div onClick={function() { setAddType(null); }} style={{ padding: "8px 20px", borderRadius: 10, fontSize: 14, fontWeight: 450, color: T.muted, cursor: "pointer" }}>{"Отмена"}</div>
              </div>
            </div>
          </div>
        ) : null}

        {/* ── Tabs (r12, fontSize 16, fontWeight 510, gap 16) ── */}
        <div style={{ display: "flex", gap: 10, marginBottom: 40, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {tabs.map(function(t) {
              var active = tab === t.id;
              return (
                <div key={t.id} onClick={function() { setTab(t.id); }} style={{
                  padding: "9px 16px", borderRadius: 12,
                  background: active ? "#1D1D1F" : "#F5F5F8",
                  color: active ? "#FFFFFF" : "#262633",
                  fontSize: 14, fontWeight: 450, cursor: "pointer",
                  transition: "all .15s",
                }}>{t.label}</div>
              );
            })}
          </div>


        </div>

        {/* ── Section title + filter icon ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <div style={{ fontSize: 22, fontWeight: 500, color: "#262633" }}>{sectionTitle}</div>
          {tab !== "contact" ? (
            <div style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              onMouseEnter={function(e) { e.currentTarget.style.background = "#F7F8FA"; }}
              onMouseLeave={function(e) { e.currentTarget.style.background = "transparent"; }}>
              <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
                <path d="M2 4h12M4 9h8M6 14h4" stroke="#262633" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
          ) : null}
        </div>

        </div> : null}
        {/* ═══ TAB: Все / Избранные ═══ */}
        {(tab === "all" || tab === "fav") ? (
          allItems.length === 0 ? <div style={{ textAlign: "center", padding: "40px 0", color: T.muted, fontSize: 14, fontWeight: 450 }}>{"Пока пусто"}</div> :
          <GroupedList items={allItems} renderRow={function(item) { return <FileRow key={item.id} item={item} />; }} />
        ) : null}

        {/* ═══ TAB: Файлы ═══ */}
        {tab === "file" ? <GroupedList items={files} renderRow={function(item) { return <FileRow key={item.id} item={item} />; }} /> : null}

        {/* ═══ TAB: Ссылки ═══ */}
        {tab === "link" ? <GroupedList items={links} renderRow={function(item) { return <LinkRow key={item.id} item={item} />; }} /> : null}

        {/* ═══ TAB: Контакты ═══ */}
        {tab === "contact" ? (
          contacts.length === 0 ? <div style={{ textAlign: "center", padding: "40px 0", color: T.muted, fontSize: 14, fontWeight: 450 }}>{"Пока пусто"}</div> :
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {contacts.map(function(c) {
              return (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: 12, borderRadius: 20, cursor: "pointer", transition: "background .1s" }}
                  onMouseEnter={function(e) { e.currentTarget.style.background = "#F5F5F8"; }}
                  onMouseLeave={function(e) { e.currentTarget.style.background = "transparent"; }}>
                  <ContactThumbnail />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 450, color: "#262633" }}>{c.name}</div>
                    {c.role ? <div style={{ fontSize: 14, fontWeight: 450, color: "#262633", opacity: 0.5 }}>{c.role}</div> : null}
                  </div>
                  <svg width="8" height="14" viewBox="0 0 8 14" fill="none" style={{ flexShrink: 0 }}><path d="M1 1l6 6-6 6" stroke="#C0C0C0" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* ═══ TAB: Встречи ═══ */}
        {tab === "meeting" && !openMeeting ? <GroupedList items={meetings} renderRow={function(item) { return <MeetingRow key={item.id} item={item} />; }} /> : null}

        {/* ═══ Meeting detail view ═══ */}
        {tab === "meeting" && openMeeting ? (function() {
          var m = openMeeting;
          return (
            <div style={{ display: "flex", gap: 40 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Back button */}
              <div onClick={function() { setOpenMeeting(null); }} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", marginBottom: 32, opacity: 0.5, transition: "opacity .15s" }}
                onMouseEnter={function(e) { e.currentTarget.style.opacity = "0.8"; }}
                onMouseLeave={function(e) { e.currentTarget.style.opacity = "0.5"; }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                <span style={{ fontSize: 16, fontWeight: 450, color: "inherit" }}>{"Встречи"}</span>
              </div>

              {/* Title + participants */}
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
                <div style={{ fontSize: 28, fontWeight: 500, color: "#262633", flex: 1 }}>{m.name}</div>
                {m.participants ? (
                  <div style={{ display: "flex", flexShrink: 0 }}>
                    {m.participants.map(function(p, pi) {
                      return <div key={pi} style={{ width: 26, height: 26, borderRadius: 800, background: p.color, border: pi > 0 ? "none" : "none", marginLeft: pi > 0 ? -4 : 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, color: "white" }}>{p.letter}</div>;
                    })}
                  </div>
                ) : null}
              </div>

              {/* Meta chips */}
              <div style={{ display: "flex", gap: 10, marginBottom: 60 }}>
                {[
                  { icon: "📅", text: m.fullDate || m.date },
                  { icon: "🕐", text: m.duration },
                  { icon: "📥", text: "Загруженно" },
                ].map(function(chip, ci) {
                  return chip.text ? (
                    <div key={ci} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 10px", borderRadius: 8, background: "#F5F5F8", fontSize: 14, fontWeight: 450, color: "#262633" }}>
                      <span style={{ fontSize: 13 }}>{chip.icon}</span><span>{chip.text}</span>
                    </div>
                  ) : null;
                })}
              </div>

              {/* Tabs: Саммари / Транскрипт / Задачи + Спросить у Mary */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 }}>
                <div style={{ display: "flex", borderRadius: 14, background: "#F5F5F8", padding: 2 }}>
                  {["summary", "transcript", "tasks"].map(function(tid) {
                    var labels = { summary: "Саммари", transcript: "Транскрипт", tasks: "Задачи" };
                    var active = mTab === tid;
                    return <div key={tid} onClick={function() { setMTab(tid); }} style={{ padding: 12, borderRadius: 12, fontSize: 14, fontWeight: 450, cursor: "pointer", background: active ? "#FFFFFF" : "transparent", color: active ? "#1B1B1B" : "#262633", width: 110, textAlign: "center", transition: "background .15s" }}>{labels[tid]}</div>;
                  })}
                </div>
                <div onClick={function() { setShowMaryChat(!showMaryChat); }} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 14, fontWeight: 450, color: "#262633", cursor: "pointer", padding: 10, borderRadius: 10, background: showMaryChat ? "#F5F5F8" : "transparent", transition: "background .15s" }}>
                  {"Спросить у Mary"}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="#262633" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
              </div>

              {/* Tab content: Summary */}
              {mTab === "summary" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
                  {/* Super brief summary */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                      <div style={{ fontSize: 22, fontWeight: 500, color: "#262633" }}>{"Супер краткое содержание"}</div>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ cursor: "pointer", opacity: 0.5 }}><rect x="7" y="1" width="11" height="13" rx="2" stroke="#262633" strokeWidth="1.5"/><path d="M4 6H3a2 2 0 00-2 2v9a2 2 0 002 2h8a2 2 0 002-2v-1" stroke="#262633" strokeWidth="1.5"/></svg>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 450, color: "#262633", lineHeight: 1.6 }}>{m.summary}</div>
                  </div>

                  {/* Key insights */}
                  {m.insights && m.insights.length > 0 ? (
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 500, color: "#262633", marginBottom: 30 }}>{"Ключевые инсайты"}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {m.insights.map(function(ins, ii) {
                          var isOpen = openInsight === ii;
                          return (
                            <div key={ii} style={{ borderRadius: 22, background: "#F5F5F8", overflow: "hidden" }}>
                              {/* Accordion header */}
                              <div onClick={function() { setOpenInsight(isOpen ? null : ii); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 20, cursor: "pointer" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2a4 4 0 00-4 4c0 2 1.5 3.5 3 4.5V12h2v-1.5c1.5-1 3-2.5 3-4.5a4 4 0 00-4-4z" stroke="#262633" strokeWidth="1.3" fill="none"/><path d="M7.5 14h5M8 16h4" stroke="#262633" strokeWidth="1.3" strokeLinecap="round"/></svg>
                                  <span style={{ fontSize: 18, fontWeight: 450, color: "#262633" }}>{ins.title}</span>
                                </div>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s", flexShrink: 0 }}><path d="M6 8l4 4 4-4" stroke="#262633" strokeWidth="1.5" strokeLinecap="round"/></svg>
                              </div>
                              {/* Accordion content */}
                              {isOpen && ins.items.length > 0 ? (
                                <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 24 }}>
                                  {ins.items.map(function(item, iii) {
                                    return (
                                      <div key={iii} style={{ display: "flex", gap: 16 }}>
                                        <div style={{ flex: 1, fontSize: 16, fontWeight: 450, color: "#262633", lineHeight: 1.5 }}>{item}</div>
                                        <svg width="16" height="16" viewBox="0 0 4 16" fill="none" style={{ flexShrink: 0, cursor: "pointer", opacity: 0.3, marginTop: 4 }}>
                                          <circle cx="2" cy="2" r="1.5" fill="#262633"/><circle cx="2" cy="8" r="1.5" fill="#262633"/><circle cx="2" cy="14" r="1.5" fill="#262633"/>
                                        </svg>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* Tab content: Transcript */}
              {mTab === "transcript" ? (
                <div>
                  {/* Transcript header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 }}>
                    <div style={{ fontSize: 22, fontWeight: 500, color: "#262633" }}>{"Транскрипт"}</div>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ cursor: "pointer", opacity: 0.5 }}>
                      <path d="M10 3v10M6 9l4 4 4-4" stroke="#262633" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M3 15h14" stroke="#262633" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>

                  {/* Transcript entries */}
                  {m.transcript && m.transcript.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
                      {m.transcript.map(function(entry, ei) {
                        return (
                          <div key={ei} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                              <span style={{ fontSize: 16, fontWeight: 450, color: entry.color }}>{entry.speaker}</span>
                              <span style={{ fontSize: 14, fontWeight: 450, color: "#262633", opacity: 0.4 }}>{entry.time}</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 520 }}>
                              {entry.texts.map(function(txt, ti) {
                                return <div key={ti} style={{ fontSize: 16, fontWeight: 450, color: "#262633", lineHeight: 1.5 }}>{txt}</div>;
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "#262633", opacity: 0.3, fontSize: 15, fontWeight: 450 }}>{"Транскрипт пока недоступен"}</div>
                  )}
                </div>
              ) : null}

              {/* Tab content: Tasks */}
              {mTab === "tasks" ? (
                <div>
                  {/* Tasks header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ fontSize: 22, fontWeight: 500, color: "#262633" }}>{"Задачи"}</div>
                    <div style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: 0.5 }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke="#262633" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </div>
                  </div>

                  {/* Task cards */}
                  {m.tasks && m.tasks.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {m.tasks.map(function(task, ti) {
                        return (
                          <div key={ti} style={{ background: "#F5F5F8", borderRadius: 22, padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>
                            {/* Task title row */}
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                                  <rect x="3" y="2" width="14" height="16" rx="2" stroke="#262633" strokeWidth="1.3" fill="none"/>
                                  <path d="M7 6h6M7 9h6M7 12h4" stroke="#262633" strokeWidth="1" strokeLinecap="round"/>
                                </svg>
                                <span style={{ fontSize: 16, fontWeight: 450, color: "#262633" }}>{task.text}</span>
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 450, color: "#262633", opacity: 0.4, flexShrink: 0 }}>{task.time}</span>
                            </div>
                            {/* Task action row */}
                            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                              {task.sent ? (
                                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 14, fontWeight: 450, color: "#262633" }}>
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 4" stroke="#262633" strokeWidth="1.5" strokeLinecap="round"/></svg>
                                  <span>{"Переданно " + task.agent}</span>
                                </div>
                              ) : (
                                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 14, fontWeight: 450, color: "#262633", cursor: "pointer" }}>
                                  <span>{"Передать " + task.agent}</span>
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="#262633" strokeWidth="1.3" strokeLinecap="round"/></svg>
                                </div>
                              )}
                              <div style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: "auto" }}>
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ cursor: "pointer", opacity: 0.4 }}><path d="M2 3h10M5 3V2a1 1 0 011-1h2a1 1 0 011 1v1M4 3v8a1 1 0 001 1h4a1 1 0 001-1V3" stroke="#262633" strokeWidth="1.2" strokeLinecap="round"/></svg>
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ cursor: "pointer", opacity: 0.4 }}><rect x="4" y="1" width="9" height="9" rx="1.5" stroke="#262633" strokeWidth="1.2" fill="none"/><path d="M3 5H2a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1v-1" stroke="#262633" strokeWidth="1.2"/></svg>
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ cursor: "pointer", opacity: 0.4 }}><path d="M1 13L8 6M6 2h4v4" stroke="#262633" strokeWidth="1.2" strokeLinecap="round"/></svg>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "#262633", opacity: 0.3, fontSize: 15, fontWeight: 450 }}>{"Задачи пока не добавлены"}</div>
                  )}
                </div>
              ) : null}
            </div>

            {/* ── Mary chat panel (inline right column) ── */}
            {showMaryChat ? (
              <div style={{ width: 380, flexShrink: 0, background: T.white, borderRadius: 24, border: "1px solid #F0F0F0", display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", position: "sticky", top: 40 }}>
                <div style={{ padding: "20px 20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F0F0F0" }}>
                  <div style={{ fontSize: 20, fontWeight: 500, color: "#262633" }}>{"Чат"}</div>
                  <div onClick={function() { setShowMaryChat(false); }} style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    onMouseEnter={function(e) { e.currentTarget.style.background = "#F5F5F8"; }}
                    onMouseLeave={function(e) { e.currentTarget.style.background = "transparent"; }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="#262633" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                  {maryChatMessages.map(function(msg, mi) {
                    if (msg.type === "quick") {
                      return (
                        <div key={mi} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {msg.items.map(function(q, qi) {
                            return (
                              <div key={qi} onClick={function() {
                                setMaryChatMessages(function(prev) { return prev.concat([{ type: "user", text: q }, { type: "assistant", text: "На встрече обсуждалась SEO-стратегия. Основные решения: создать 30 посадочных страниц, запустить блог, оптимизировать скорость сайта.", actions: [] }]); });
                              }} style={{ display: "flex", alignItems: "center", gap: 8, padding: 12, borderRadius: 14, border: "1px solid #EDEDF0", cursor: "pointer", transition: "background .1s" }}
                                onMouseEnter={function(e) { e.currentTarget.style.background = "#FAFAFA"; }}
                                onMouseLeave={function(e) { e.currentTarget.style.background = "transparent"; }}>
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0 }}><path d="M3 1l4 4-4 4" stroke="#262633" strokeWidth="1.3" strokeLinecap="round"/></svg>
                                <span style={{ fontSize: 15, fontWeight: 450, color: "#262633" }}>{q}</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }
                    if (msg.type === "user") {
                      return <div key={mi} style={{ alignSelf: "flex-end", maxWidth: "85%", padding: "10px 14px", borderRadius: "14px 14px 4px 14px", background: "#F5F5F8", fontSize: 15, fontWeight: 450, color: "#262633", lineHeight: 1.4 }}>{msg.text}</div>;
                    }
                    if (msg.type === "assistant") {
                      return (
                        <div key={mi} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <div style={{ fontSize: 15, fontWeight: 450, color: "#262633", opacity: 0.35 }}>{"Mary"}</div>
                          <div style={{ fontSize: 15, fontWeight: 450, color: "#262633", lineHeight: 1.5 }}>{msg.text}</div>
                          {msg.actions && msg.actions.length > 0 ? (
                            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                              {msg.actions.map(function(a, ai) {
                                return <div key={ai} style={{ padding: "12px 16px", borderRadius: 14, background: "#262633", color: T.white, fontSize: 15, fontWeight: 450, cursor: "pointer" }}>{a}</div>;
                              })}
                            </div>
                          ) : null}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
                <div style={{ padding: "12px 16px 16px", borderTop: "1px solid #F0F0F0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 16, background: "#F5F5F8" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 0v12M0 6h12" stroke="#262633" strokeWidth="1.8" strokeLinecap="round"/></svg>
                    </div>
                    <input type="text" value={maryChatInput} onChange={function(e) { setMaryChatInput(e.target.value); }} placeholder="Напишите.." style={{ flex: 1, border: "none", background: "transparent", fontSize: 15, fontFamily: T.font, fontWeight: 450, outline: "none", color: "#262633" }}
                      onKeyDown={function(e) {
                        if (e.key === "Enter" && maryChatInput.trim()) {
                          var txt = maryChatInput; setMaryChatInput("");
                          setMaryChatMessages(function(prev) { return prev.concat([{ type: "user", text: txt }, { type: "assistant", text: "Анализирую данные встречи...", actions: [] }]); });
                        }
                      }} />
                    <div onClick={function() {
                      if (maryChatInput.trim()) {
                        var txt = maryChatInput; setMaryChatInput("");
                        setMaryChatMessages(function(prev) { return prev.concat([{ type: "user", text: txt }, { type: "assistant", text: "Анализирую данные встречи...", actions: [] }]); });
                      }
                    }} style={{ width: 32, height: 32, borderRadius: 8, background: "#FF3407", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 8V2M2.5 4.5L5 2l2.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            </div>
          );
        })() : null}

      </div>

            {/* ── File preview drawer (slide from right) ── */}
      {previewItem ? (
        <div onClick={function() { setPreviewItem(null); }} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)",
          zIndex: 200, transition: "background .2s",
        }}>
          <div onClick={function(e) { e.stopPropagation(); }} style={{
            position: "absolute", top: 0, right: 0, bottom: 0, width: 420,
            background: T.white, boxShadow: "-8px 0 40px rgba(0,0,0,.1)",
            display: "flex", flexDirection: "column",
            animation: "slideIn .25s ease",
          }}>
            {/* Drawer header */}
            <div style={{ padding: "24px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 18, fontWeight: 500, color: "#262633" }}>{"Файл"}</div>
              <div onClick={function() { setPreviewItem(null); }} style={{
                width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
              onMouseEnter={function(e) { e.currentTarget.style.background = "#F5F5F8"; }}
              onMouseLeave={function(e) { e.currentTarget.style.background = "transparent"; }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="#262633" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
            </div>

            {/* Preview area */}
            <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
              {/* Large icon */}
              <div style={{ height: 220, borderRadius: 20, background: "#F7F8FA", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                <div style={{ width: 96, height: 96, borderRadius: 24, overflow: "hidden" }}>
                  <img src={FILE_ICON} alt="" style={{ width: 96, height: 96, objectFit: "cover" }} />
                </div>
              </div>

              {/* File info */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 20, fontWeight: 500, color: "#262633", marginBottom: 10 }}>{previewItem.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 450, color: "#262633", opacity: 0.5, marginBottom: 16 }}>
                  <span>{previewItem.format}</span><span>{"\u00B7"}</span><span>{previewItem.size}</span><span>{"\u00B7"}</span><span>{previewItem.time}</span>
                </div>
                {previewItem.agent ? (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 46, background: "#F5F5F8", fontSize: 14, fontWeight: 450, color: "#262633", opacity: 0.5 }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#E0E0E0" }} />
                    <span>{previewItem.agent}</span>
                  </div>
                ) : (
                  <div style={{ display: "inline-flex", alignItems: "center", padding: "8px 14px", borderRadius: 46, background: "#F5F5F8", fontSize: 14, fontWeight: 450, color: "#262633", opacity: 0.5 }}>
                    {"Загруженно мной"}
                  </div>
                )}
              </div>

              {/* Details */}
              <div style={{ borderTop: "1px solid #F0F0F0", paddingTop: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 450, color: "#262633", opacity: 0.4, marginBottom: 14 }}>{"Детали"}</div>
                {[
                  { label: "Формат", value: previewItem.format },
                  { label: "Размер", value: previewItem.size },
                  { label: "Дата", value: previewItem.date },
                  { label: "Время", value: previewItem.time },
                ].map(function(row, ri) {
                  return (
                    <div key={ri} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: ri < 3 ? "1px solid #F8F8F8" : "none" }}>
                      <span style={{ fontSize: 14, fontWeight: 450, color: "#262633", opacity: 0.5 }}>{row.label}</span>
                      <span style={{ fontSize: 14, fontWeight: 450, color: "#262633" }}>{row.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Drawer actions */}
            <div style={{ padding: "16px 24px 24px", borderTop: "1px solid #F0F0F0", display: "flex", gap: 10 }}>
              <div style={{
                flex: 1, padding: "14px", borderRadius: 14, background: "#1D1D1F", color: T.white,
                fontSize: 15, fontWeight: 450, textAlign: "center", cursor: "pointer",
              }}
              onMouseEnter={function(e) { e.currentTarget.style.opacity = "0.85"; }}
              onMouseLeave={function(e) { e.currentTarget.style.opacity = "1"; }}>
                {"Открыть"}
              </div>
              <div style={{
                flex: 1, padding: "14px", borderRadius: 14, background: "#F5F5F8",
                fontSize: 15, fontWeight: 450, color: "#262633", textAlign: "center", cursor: "pointer",
              }}
              onMouseEnter={function(e) { e.currentTarget.style.background = "#EDEDF0"; }}
              onMouseLeave={function(e) { e.currentTarget.style.background = "#F5F5F8"; }}>
                {"Скачать"}
              </div>
              <div onClick={function() { removeFile(previewItem.id); setPreviewItem(null); }} style={{
                padding: "14px 20px", borderRadius: 14, background: "#F5F5F8",
                fontSize: 15, fontWeight: 450, color: T.red, textAlign: "center", cursor: "pointer",
              }}
              onMouseEnter={function(e) { e.currentTarget.style.background = "#FFF0EE"; }}
              onMouseLeave={function(e) { e.currentTarget.style.background = "#F5F5F8"; }}>
                {"Удалить"}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── FAB for contacts ── */}
      {tab === "contact" ? (
        <div onClick={function() { setAddType("contact"); }} style={{
          position: "fixed", bottom: 32, right: 32,
          width: 52, height: 52, borderRadius: 16, background: "#1D1D1F",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,.2)", zIndex: 10,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="1.8"/>
            <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
      ) : null}


    </div>
  );
}

// ═══ SETTINGS ═══
function Settings() {
  var brd = "rgba(38,38,51,0.05)";

  function Row(props) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 0", borderBottom: "1px solid " + brd, cursor: "pointer" }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: T.surface, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 20 }}>{props.icon}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 450, color: T.ink }}>{props.title}</div>
          {props.desc ? <div style={{ fontSize: 13, fontWeight: 450, color: T.muted, marginTop: 2 }}>{props.desc}</div> : null}
        </div>
        {props.action ? (
          <span style={{ fontSize: 13, fontWeight: 450, color: T.ink, padding: "8px 16px", borderRadius: 10, border: "1px solid " + brd, cursor: "pointer" }}>{props.action}</span>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke={T.border} strokeWidth="1.5" strokeLinecap="round"/></svg>
        )}
      </div>
    );
  }

  return (
    <div style={{ flex: 1, height: "100vh", overflowY: "auto", fontFamily: T.font, background: T.white }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 40px 80px" }}>

        {/* Аккаунт */}
        <div style={{ fontSize: 22, fontWeight: 450, color: T.ink, marginBottom: 24 }}>{"Аккаунт"}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 0", borderBottom: "1px solid " + brd, marginBottom: 8 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: T.surface }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 450, color: T.ink }}>{"Виктория Ахрамович"}</div>
            <div style={{ fontSize: 13, fontWeight: 450, color: T.muted }}>{"vikahramovich02@gmail.com"}</div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 450, color: T.ink, padding: "8px 16px", borderRadius: 10, border: "1px solid " + brd }}>{"Изменить аватар"}</span>
        </div>
        <Row icon="👤" title="Полное имя" desc="Виктория Ахрамович" action="Изменить" />
        <Row icon="✉️" title="Email" desc="vikahramovich02@gmail.com" />
        <Row icon="📱" title="Телефон" desc="Не добавлен" action="Добавить" />

        {/* Подписка */}
        <div style={{ fontSize: 22, fontWeight: 450, color: T.ink, marginTop: 48, marginBottom: 24 }}>{"Ваша подписка"}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 0", borderBottom: "1px solid " + brd }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 450, color: T.ink }}>{"Free план"}</div>
            <div style={{ fontSize: 13, fontWeight: 450, color: T.muted }}>{"5 агентов • 100 сообщений/день"}</div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 450, color: T.white, padding: "8px 16px", borderRadius: 10, background: T.ink, cursor: "pointer" }}>{"Обновить тариф"}</span>
        </div>
        <Row icon="💳" title="Способ оплаты" desc="Не добавлен" action="Добавить" />
        <Row icon="📋" title="История платежей" />

        {/* Безопасность */}
        <div style={{ fontSize: 22, fontWeight: 450, color: T.ink, marginTop: 48, marginBottom: 24 }}>{"Безопасность"}</div>
        <Row icon="🔒" title="Изменить пароль" />
        <Row icon="📱" title="Двухфакторная аутентификация" desc="Не включена" />
        <Row icon="🖥" title="Активные сессии" desc="Устройства, где вы вошли" />
        <Row icon="🔑" title="Внешние аккаунты" desc="Google подключён" />

        {/* Контроль доступа */}
        <div style={{ fontSize: 22, fontWeight: 450, color: T.ink, marginTop: 48, marginBottom: 8 }}>{"Контроль доступа"}</div>
        <div style={{ fontSize: 14, fontWeight: 450, color: T.muted, marginBottom: 24 }}>{"Как используется ваш аккаунт"}</div>
        <Row icon="📊" title="События" desc="Вся активность за 180 дней" />
        <Row icon="🔗" title="Управлять доступами" desc="Приложения с доступом к данным" />
        <Row icon="🔐" title="API-ключи" desc="Для разработчиков" />

        {/* Система */}
        <div style={{ fontSize: 22, fontWeight: 450, color: T.ink, marginTop: 48, marginBottom: 24 }}>{"Система"}</div>
        <Row icon="🌐" title="Язык" desc="Русский" />
        <Row icon="🎨" title="Тема" desc="Светлая" />
        <Row icon="🔔" title="Уведомления" desc="Email и push" />
        <Row icon="💬" title="Поддержка" action="Контакты" />

        {/* Danger zone */}
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid " + brd }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", cursor: "pointer" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 450, color: T.ink }}>{"Выйти"}</div>
            </div>
            <span style={{ fontSize: 13, fontWeight: 450, color: T.ink, padding: "8px 16px", borderRadius: 10, border: "1px solid " + brd }}>{"Выйти"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 450, color: T.red }}>{"Удалить аккаунт"}</div>
              <div style={{ fontSize: 13, fontWeight: 450, color: T.muted }}>{"Удалить аккаунт и данные навсегда"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══ TASKS — Kanban Board ═══
function Tasks() {
  var STATUSES = [
    { id: "inbox", name: "Входящие", color: "#818181" },
    { id: "progress", name: "В работе", color: T.blue },
    { id: "review", name: "Ревью", color: T.orange },
    { id: "done", name: "Готово", color: T.green },
  ];

  var _tasks = useState([
    { id: "t1", title: "Анализ воронки продаж", desc: "Найти где теряются клиенты", agent: "marketer", status: "progress", priority: "HIGH", deps: [], x: 40, y: 40 },
    { id: "t2", title: "Редизайн лендинга", desc: "Новый hero-блок + отзывы", agent: "designer", status: "progress", priority: "HIGH", deps: ["t1"], x: 400, y: 40 },
    { id: "t3", title: "Скрипт продаж v3", desc: "Обновить скрипт для менеджеров", agent: "copywriter", status: "review", priority: "MEDIUM", deps: ["t1"], x: 400, y: 240 },
    { id: "t4", title: "Интеграция AmoCRM → Telegram", desc: "Уведомления о новых сделках", agent: "developer", status: "progress", priority: "HIGH", deps: [], x: 40, y: 240 },
    { id: "t5", title: "Контент-план на апрель", desc: "12 постов + 4 reels", agent: "copywriter", status: "inbox", priority: "MEDIUM", deps: ["t3"], x: 760, y: 240 },
    { id: "t6", title: "Настроить ретаргетинг VK", desc: "Аудитории look-alike", agent: "marketer", status: "inbox", priority: "MEDIUM", deps: ["t1"], x: 760, y: 40 },
    { id: "t7", title: "Баннеры для Google Ads", desc: "6 размеров, 2 варианта", agent: "designer", status: "inbox", priority: "LOW", deps: ["t2"], x: 760, y: 440 },
    { id: "t8", title: "A/B тест заголовков", desc: "3 варианта + отчёт", agent: "marketer", status: "review", priority: "HIGH", deps: ["t6", "t3"], x: 1120, y: 140 },
    { id: "t9", title: "Email-рассылка: возврат", desc: "Серия из 3 писем", agent: "copywriter", status: "done", priority: "MEDIUM", deps: ["t5"], x: 1120, y: 340 },
    { id: "t10", title: "Деплой новой версии", desc: "v2.1 с новым лендингом", agent: "developer", status: "done", priority: "HIGH", deps: ["t2", "t4"], x: 400, y: 440 },
    { id: "t11", title: "SEO-аудит конкурентов", desc: "Топ-5, ключевые слова", agent: "marketer", status: "done", priority: "LOW", deps: [], x: 40, y: 440 },
    { id: "t12", title: "API для мобильного", desc: "REST endpoints", agent: "developer", status: "review", priority: "HIGH", deps: ["t10"], x: 760, y: 640 },
  ]);
  var tasks = _tasks[0]; var setTasks = _tasks[1];
  var _dragging = useState(null); var dragging = _dragging[0]; var setDragging = _dragging[1];
  var _mode = useState("board"); var mode = _mode[0]; var setMode = _mode[1];
  var _mapDrag = useState(null); var mapDrag = _mapDrag[0]; var setMapDrag = _mapDrag[1];
  var _mapOffset = useState({ x: 0, y: 0 }); var mapOffset = _mapOffset[0]; var setMapOffset = _mapOffset[1];
  var mapRef = useRef(null);

  var priorityColors = { HIGH: "#FF3407", MEDIUM: "#FF9500", LOW: "#818181" };
  var statusColors = {}; STATUSES.forEach(function(s) { statusColors[s.id] = s.color; });
  var cardW = 260; var cardH = 120;

  function handleDrop(statusId) {
    if (!dragging) return;
    setTasks(function(prev) { return prev.map(function(t) { return t.id === dragging ? Object.assign({}, t, { status: statusId }) : t; }); });
    setDragging(null);
  }

  // Map drag
  function handleMapMouseDown(e, taskId) {
    var rect = mapRef.current.getBoundingClientRect();
    var task = tasks.find(function(t) { return t.id === taskId; });
    setMapDrag({ id: taskId, ox: e.clientX - rect.left - task.x, oy: e.clientY - rect.top - task.y });
    e.preventDefault();
  }

  useEffect(function() {
    if (!mapDrag) return;
    function move(e) {
      if (!mapRef.current) return;
      var rect = mapRef.current.getBoundingClientRect();
      var nx = e.clientX - rect.left - mapDrag.ox;
      var ny = e.clientY - rect.top - mapDrag.oy;
      setTasks(function(prev) { return prev.map(function(t) { return t.id === mapDrag.id ? Object.assign({}, t, { x: Math.max(0, nx), y: Math.max(0, ny) }) : t; }); });
    }
    function up() { setMapDrag(null); }
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return function() { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, [mapDrag]);

  return (
    <div style={{ flex: 1, height: "100vh", display: "flex", flexDirection: "column", fontFamily: T.font, background: T.white, minWidth: 0, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "32px 32px 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 24, fontWeight: 450, color: T.ink }}>{"Задачи"}</div>
            <span style={{ fontSize: 13, fontWeight: 450, color: T.muted, background: T.surface, borderRadius: 10, padding: "2px 10px" }}>{tasks.length}</span>
          </div>
          <div style={{ display: "flex", borderRadius: 10, background: "#EEEFF1", padding: 3, flexShrink: 0 }}>
            <div onClick={function() { setMode("board"); }} style={{ padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 450, cursor: "pointer", background: mode === "board" ? T.white : "transparent", color: mode === "board" ? T.ink : T.muted, boxShadow: mode === "board" ? "0 1px 3px rgba(0,0,0,.1)" : "none" }}>{"Доска"}</div>
            <div onClick={function() { setMode("map"); }} style={{ padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 450, cursor: "pointer", background: mode === "map" ? T.white : "transparent", color: mode === "map" ? T.ink : T.muted, boxShadow: mode === "map" ? "0 1px 3px rgba(0,0,0,.1)" : "none" }}>{"Карта"}</div>
          </div>
        </div>
      </div>

      {/* Board view */}
      {mode === "board" ? (
        <div style={{ flex: 1, display: "flex", gap: 12, padding: "0 32px 40px", overflowX: "auto" }}>
          {STATUSES.map(function(status) {
            var statusTasks = tasks.filter(function(t) { return t.status === status.id; });
            return (
              <div key={status.id} onDragOver={function(e) { e.preventDefault(); }} onDrop={function() { handleDrop(status.id); }}
                style={{ minWidth: 260, flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 8px 12px" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: status.color }} />
                  <span style={{ fontSize: 14, fontWeight: 450, color: T.ink }}>{status.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 450, color: T.muted, background: T.surface, borderRadius: 10, padding: "2px 8px" }}>{statusTasks.length}</span>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  {statusTasks.map(function(task) {
                    var ag = getAgent(task.agent);
                    return (
                      <div key={task.id} draggable="true" onDragStart={function() { setDragging(task.id); }} onDragEnd={function() { setDragging(null); }}
                        style={{ padding: "14px 16px", borderRadius: 12, background: T.surface, cursor: "grab", opacity: dragging === task.id ? 0.4 : 1 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                          <div style={{ fontSize: 14, fontWeight: 450, color: T.ink, lineHeight: 1.3 }}>{task.title}</div>
                          <span style={{ fontSize: 11, fontWeight: 450, color: priorityColors[task.priority], flexShrink: 0 }}>{task.priority}</span>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 450, color: T.muted, marginBottom: 10, lineHeight: 1.3 }}>{task.desc}</div>
                        {ag ? <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#262633" }} /><span style={{ fontSize: 12, fontWeight: 450, color: T.muted }}>{ag.name}</span></div> : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Map view */}
      {mode === "map" ? (
        <div ref={mapRef} style={{ flex: 1, position: "relative", overflow: "auto", background: T.bg, cursor: mapDrag ? "grabbing" : "default" }}>
          {/* Grid dots */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, " + T.border + " 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />

          {/* SVG connections */}
          <svg style={{ position: "absolute", inset: 0, width: 2000, height: 1200, pointerEvents: "none" }}>
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="rgba(38,38,51,0.3)" />
              </marker>
            </defs>
            {tasks.map(function(task) {
              return task.deps.map(function(depId) {
                var dep = tasks.find(function(t) { return t.id === depId; });
                if (!dep) return null;
                var x1 = dep.x + cardW;
                var y1 = dep.y + cardH / 2;
                var x2 = task.x;
                var y2 = task.y + cardH / 2;
                var dx = Math.abs(x2 - x1);
                var cpx = dx * 0.5;
                return (
                  <path key={depId + "-" + task.id}
                    d={"M" + x1 + "," + y1 + " C" + (x1 + cpx) + "," + y1 + " " + (x2 - cpx) + "," + y2 + " " + x2 + "," + y2}
                    fill="none" stroke="rgba(38,38,51,0.2)" strokeWidth="2" markerEnd="url(#arrowhead)" />
                );
              });
            })}
          </svg>

          {/* Task cards */}
          {tasks.map(function(task) {
            var ag = getAgent(task.agent);
            var sc = statusColors[task.status] || T.muted;
            return (
              <div key={task.id}
                onMouseDown={function(e) { handleMapMouseDown(e, task.id); }}
                style={{
                  position: "absolute", left: task.x, top: task.y,
                  width: cardW, padding: "14px 16px", borderRadius: 14,
                  background: T.white, cursor: mapDrag && mapDrag.id === task.id ? "grabbing" : "grab",
                  boxShadow: mapDrag && mapDrag.id === task.id ? "0 8px 30px rgba(0,0,0,.12)" : "0 1px 4px rgba(0,0,0,.06)",
                  borderLeft: "3px solid " + sc,
                  userSelect: "none", transition: mapDrag && mapDrag.id === task.id ? "none" : "box-shadow .15s",
                }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 450, color: T.ink, lineHeight: 1.3 }}>{task.title}</div>
                  <span style={{ fontSize: 10, fontWeight: 450, color: priorityColors[task.priority], flexShrink: 0 }}>{task.priority}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 450, color: T.muted, marginBottom: 8 }}>{task.desc}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  {ag ? <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 5, height: 5, borderRadius: "50%", background: "#262633" }} /><span style={{ fontSize: 11, fontWeight: 450, color: T.muted }}>{ag.name}</span></div> : null}
                  <span style={{ fontSize: 10, fontWeight: 450, color: sc }}>{STATUSES.find(function(s) { return s.id === task.status; }).name}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

// ═══ AGENTS PAGE ═══
var AGENT_TASKS = [
  { id:"t1",title:"Анализ воронки продаж",desc:"Найти где теряются клиенты",agent:"marketer",status:"progress",priority:"HIGH" },
  { id:"t2",title:"Редизайн лендинга",desc:"Новый hero-блок + отзывы",agent:"designer",status:"progress",priority:"HIGH" },
  { id:"t3",title:"Скрипт продаж v3",desc:"Обновить скрипт",agent:"copywriter",status:"review",priority:"MEDIUM" },
  { id:"t4",title:"Интеграция AmoCRM",desc:"Уведомления о сделках",agent:"developer",status:"progress",priority:"HIGH" },
  { id:"t5",title:"Контент-план апрель",desc:"12 постов + 4 reels",agent:"copywriter",status:"inbox",priority:"MEDIUM" },
  { id:"t6",title:"Ретаргетинг VK",desc:"Look-alike аудитории",agent:"marketer",status:"inbox",priority:"MEDIUM" },
  { id:"t7",title:"Баннеры Google Ads",desc:"6 размеров",agent:"designer",status:"inbox",priority:"LOW" },
  { id:"t8",title:"A/B тест заголовков",desc:"3 варианта",agent:"marketer",status:"review",priority:"HIGH" },
];
var AGENT_FILES = [
  {id:"f1",name:"Анализ воронки.pdf",type:"PDF",agent:"marketer"},{id:"f2",name:"Скрипт продаж v2.docx",type:"DOCX",agent:"copywriter"},
  {id:"f3",name:"Макет лендинга.fig",type:"FIG",agent:"designer"},{id:"f4",name:"Контент-план.xlsx",type:"XLSX",agent:"copywriter"},
  {id:"f5",name:"ТЗ интеграция CRM.md",type:"MD",agent:"developer"},{id:"f6",name:"Отчёт трафик.pdf",type:"PDF",agent:"marketer"},
];

function AgentsPage(props) {
  var agents = AGENTS.filter(function(a){return a.id!=="mary";});
  var _sel = useState(null); var sel = _sel[0]; var setSel = _sel[1];
  var SC = {inbox:T.muted,progress:T.blue,review:T.orange,done:T.green};
  var SL = {inbox:"Входящие",progress:"В работе",review:"Ревью",done:"Готово"};
  var PC = {HIGH:T.red,MEDIUM:T.orange,LOW:T.muted};

  if (sel) { var ag = getAgent(sel); if (!ag) { setSel(null); return null; }
    var at = AGENT_TASKS.filter(function(t){return t.agent===sel;}); var af = AGENT_FILES.filter(function(f){return f.agent===sel;});
    return (<div style={{flex:1,height:"100vh",overflowY:"auto",fontFamily:T.font,background:T.white}}>
      <div style={{maxWidth:720,margin:"0 auto",padding:"32px 40px 80px"}}>
        <div onClick={function(){setSel(null);}} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",marginBottom:28}}><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4l-4 4 4 4" stroke={T.muted} strokeWidth="1.5" strokeLinecap="round"/></svg><span style={{fontSize:14,fontWeight:450,color:T.muted}}>{"Все агенты"}</span></div>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:32}}>
          <div style={{width:56,height:56,borderRadius:14,background:"#262633",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:26,fontWeight:450,color:"#fff"}}>{ag.letter}</span></div>
          <div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:22,fontWeight:450,color:T.ink}}>{ag.name}</span><div style={{width:8,height:8,borderRadius:"50%",background:T.green}}/></div><div style={{fontSize:14,fontWeight:450,color:T.muted,marginTop:2}}>{(ag.sys||"").split("\n")[0]}</div></div>
          <div onClick={function(){if(props.onOpenChat)props.onOpenChat(sel);}} style={{padding:"10px 20px",borderRadius:10,background:T.ink,color:T.white,fontSize:14,fontWeight:450,cursor:"pointer"}}>{"Открыть чат"}</div>
        </div>
        <div style={{display:"flex",gap:12,marginBottom:32}}>
          {[{v:at.length,l:"задач"},{v:at.filter(function(t){return t.status==="progress";}).length,l:"в работе",c:T.blue},{v:at.filter(function(t){return t.status==="done";}).length,l:"готово",c:T.green},{v:af.length,l:"файлов"}].map(function(s,i){return <div key={i} style={{flex:1,padding:"16px 20px",borderRadius:16,background:T.surface}}><div style={{fontSize:24,fontWeight:450,color:s.c||T.ink}}>{s.v}</div><div style={{fontSize:12,fontWeight:450,color:T.muted,marginTop:2}}>{s.l}</div></div>;})}
        </div>
        <div style={{marginBottom:32}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}><span style={{fontSize:18,fontWeight:450,color:T.ink}}>{"Задачи"}</span><div onClick={function(){if(props.onOpenTasks)props.onOpenTasks();}} style={{display:"flex",alignItems:"center",gap:4,cursor:"pointer"}}><span style={{fontSize:13,fontWeight:450,color:T.muted}}>{"Все задачи"}</span><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke={T.muted} strokeWidth="1.3" strokeLinecap="round"/></svg></div></div>
          {at.map(function(task){return <div key={task.id} onClick={function(){if(props.onOpenTasks)props.onOpenTasks();}} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderRadius:14,background:T.surface,marginBottom:6,cursor:"pointer"}} onMouseEnter={function(e){e.currentTarget.style.background="#EEEFF1";}} onMouseLeave={function(e){e.currentTarget.style.background=T.surface;}}><div style={{width:8,height:8,borderRadius:"50%",background:SC[task.status],flexShrink:0}}/><div style={{flex:1}}><div style={{fontSize:14,fontWeight:450,color:T.ink}}>{task.title}</div><div style={{fontSize:12,fontWeight:450,color:T.muted,marginTop:2}}>{task.desc}</div></div><span style={{fontSize:11,fontWeight:450,color:SC[task.status],background:"rgba(0,0,0,.03)",borderRadius:6,padding:"3px 8px"}}>{SL[task.status]}</span><span style={{fontSize:10,fontWeight:500,color:PC[task.priority]}}>{task.priority}</span></div>;})}
        </div>
        <div><div style={{fontSize:18,fontWeight:450,color:T.ink,marginBottom:16}}>{"Файлы"}</div>
          {af.map(function(f){return <div key={f.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:12}} onMouseEnter={function(e){e.currentTarget.style.background=T.surface;}} onMouseLeave={function(e){e.currentTarget.style.background="transparent";}}><div style={{width:36,height:36,borderRadius:10,background:T.surface,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:16}}>{"📄"}</span></div><div style={{flex:1}}><div style={{fontSize:14,fontWeight:450,color:T.ink}}>{f.name}</div></div><span style={{fontSize:12,fontWeight:450,color:T.muted}}>{f.type}</span></div>;})}
        </div>
      </div>
    </div>);
  }

  return (<div style={{flex:1,height:"100vh",overflowY:"auto",fontFamily:T.font,background:T.white}}>
    <div style={{maxWidth:720,margin:"0 auto",padding:"40px 40px 80px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}><div style={{fontSize:24,fontWeight:450,color:T.ink}}>{"Агенты"}</div><div onClick={props.onAddAgent} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:10,background:T.ink,color:T.white,fontSize:14,fontWeight:450,cursor:"pointer"}}><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>{"Создать"}</div></div>
      <div style={{fontSize:15,fontWeight:450,color:T.muted,marginBottom:32}}>{agents.length+" агент"+(agents.length>1?"а":"")+" в команде"}</div>
      <div style={{padding:"20px 24px",borderRadius:20,background:T.surface,marginBottom:12,display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:44,height:44,borderRadius:11,background:"#262633",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C9.8 2 8 3.8 8 6c0 1.5.8 2.7 2 3.4V11H8c-2.2 0-4 1.8-4 4v5h16v-5c0-2.2-1.8-4-4-4h-2V9.4c1.2-.7 2-1.9 2-3.4 0-2.2-1.8-4-4-4z" fill="#fff"/></svg></div>
        <div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16,fontWeight:450,color:T.ink}}>{"Mary"}</span><span style={{fontSize:10,fontWeight:500,color:T.muted,background:T.white,borderRadius:5,padding:"2px 7px"}}>{"DIRECTOR"}</span></div><div style={{fontSize:13,fontWeight:450,color:T.muted,marginTop:2}}>{"Оркестрация · Планирование · Делегирование"}</div></div>
        <div style={{width:8,height:8,borderRadius:"50%",background:T.green}}/>
      </div>
      {agents.map(function(ag){var tasks=AGENT_TASKS.filter(function(t){return t.agent===ag.id;});var files=AGENT_FILES.filter(function(f){return f.agent===ag.id;});var ip=tasks.filter(function(t){return t.status==="progress"||t.status==="review";}).length;var dn=tasks.filter(function(t){return t.status==="done";}).length;
        return <div key={ag.id} onClick={function(){setSel(ag.id);}} style={{padding:"20px 24px",borderRadius:20,background:T.surface,marginBottom:10,cursor:"pointer",transition:"background .1s"}} onMouseEnter={function(e){e.currentTarget.style.background="#EEEFF1";}} onMouseLeave={function(e){e.currentTarget.style.background=T.surface;}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:11,background:"#262633",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:20,fontWeight:450,color:"#fff"}}>{ag.letter}</span></div>
            <div style={{flex:1}}><div style={{fontSize:16,fontWeight:450,color:T.ink}}>{ag.name}</div><div style={{fontSize:13,fontWeight:450,color:T.muted,marginTop:2}}>{tasks.length+" задач · "+files.length+" файлов"}</div></div>
            {ip>0?<span style={{fontSize:12,fontWeight:450,color:T.blue,background:"rgba(7,148,255,.08)",borderRadius:6,padding:"3px 8px"}}>{ip+" в работе"}</span>:null}
            {dn>0?<span style={{fontSize:12,fontWeight:450,color:T.green,background:"rgba(52,199,89,.08)",borderRadius:6,padding:"3px 8px"}}>{dn+" готово"}</span>:null}
            <div style={{width:8,height:8,borderRadius:"50%",background:T.green,flexShrink:0}}/>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke={T.muted} strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
        </div>;
      })}
    </div>
  </div>);
}

// ═══ APP ═══
export default function App() {
  var _v = useState("chat"); var view = _v[0]; var setView = _v[1];
  var _activeAgent = useState("mary"); var activeAgent = _activeAgent[0]; var setActiveAgent = _activeAgent[1];
  var _filter = useState("all"); var filter = _filter[0]; var setFilter = _filter[1];
  var _autoMsg = useState(null); var autoMsg = _autoMsg[0]; var setAutoMsg = _autoMsg[1];
  var _customAgents = useState([]); var customAgents = _customAgents[0]; var setCustomAgents = _customAgents[1];
  var _agentOrder = useState(["marketer", "designer", "developer", "copywriter"]);
  var agentOrder = _agentOrder[0]; var setAgentOrder = _agentOrder[1];
  var isChat = view === "chat";

  function handleAddAgent() {
    setAutoMsg("Хочу добавить нового ИИ-агента в команду");
    setFilter("all");
    setView("chat");
  }

  function addNewAgent(name) {
    var id = "agent_" + Date.now();
    var newAgent = { id: id, name: name, letter: name.charAt(0), color: "#262633", sys: "Ты — ИИ-" + name + " в команде Mary. По-русски. Без звёздочек. Задавай ОДИН вопрос за раз с вариантами." };
    AGENTS.push(newAgent);
    setCustomAgents(function(p) { return p.concat([id]); });
    setAgentOrder(function(p) { return p.concat([id]); });
  }

  function removeAgent(id) {
    setAgentOrder(function(p) { return p.filter(function(a) { return a !== id; }); });
    if (filter === id) setFilter("all");
  }

  function reorderAgents(fromId, toId) {
    setAgentOrder(function(prev) {
      var arr = prev.slice();
      var fromIdx = arr.indexOf(fromId);
      var toIdx = arr.indexOf(toId);
      if (fromIdx < 0 || toIdx < 0) return prev;
      arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, fromId);
      return arr;
    });
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar active={isChat ? "chat" : view} isHome={view === "home"} onHome={function() { setView("home"); setAutoMsg(null); }} onSelect={function() { setView("chat"); setFilter("all"); setAutoMsg(null); }} onIntegrations={function() { setView("integrations"); }} isIntegrations={view === "integrations"} onData={function() { setView("data"); }} isData={view === "data"} onSettings={function() { setView("settings"); }} isSettings={view === "settings"} onTasks={function() { setView("tasks"); }} isTasks={view === "tasks"} onAgents={function() { setView("agents"); }} isAgents={view === "agents"} onFilter={function(id) { setView("chat"); setFilter(id); setAutoMsg(null); }} activeFilter={filter} onAddAgent={handleAddAgent} agentOrder={agentOrder} onReorderAgents={reorderAgents} onRemoveAgent={removeAgent} />
      {view === "home" ? <Home /> : null}
      {view === "integrations" ? <Integrations /> : null}
      {view === "data" ? <DataPage /> : null}
      {view === "settings" ? <Settings /> : null}
      {view === "tasks" ? <Tasks /> : null}
      {view === "agents" ? <AgentsPage onAddAgent={handleAddAgent} onOpenChat={function(id){setView("chat");setFilter(id);}} onOpenTasks={function(){setView("tasks");}} /> : null}
      {isChat ? <Chat key={autoMsg || "chat"} filter={filter} autoMessage={autoMsg} onSwitchAgent={function(id) { setActiveAgent(id); }} onFilter={function(id){setFilter(id);}} onAddAgent={handleAddAgent} onOpenTasks={function(){setView("tasks");}} /> : null}
    </div>
  );
}

import { useState, useRef, useEffect, useMemo } from "react";
import { color, transition, font } from "../../ui/tokens.js";
import { I, P } from "../icons.jsx";
import { usePeople, MOCK_PEOPLE } from "../people.js";
import { renderMarkdown, parseNumberedOptions, parseChecklistOptions } from "../markdown.jsx";
import { AGENTS, EDGES, CARD_W, CARD_H } from "../agents-config.js";
import { AgentLogsView, AgentOutputView } from "../bottom-panel.jsx";
import { BuildNode, AgentNodeExpanded } from "../build-nodes.jsx";
import { DeptChatWelcome } from "../dept-chat-welcome.jsx";
import { MaryInputBox, useTypewriterPlaceholder } from "../chat-input.jsx";
import { ChatPanel, ChatHeader, FilterBar, ChatMessage, TypingIndicator, BuildCard, ToolsTrail, ToolStatusChip, FileActionRow, PublishedRow, TextCard, VisualCard, FinalPostCard, ToolTrace, ApproveActions, ResearchCard, InsightsCard, IdeasCard, toolLabel, zoomBtn } from "../chat-panel.jsx";
import { ChatMaryPage, ActivityPanel, ArtifactView, ActivityLog, BuildCanvas, ChatWelcome, ChatItem, OptionsBlock, AgentChatBubble, ChatBubble, ActionBar } from "../chat-mary-page.jsx";
import { TasksKanbanPage, TaskCard, TasksListView, TasksWeekView, TaskDrawer, DrawerRow, TasksPage, TaskKanbanCard } from "./tasks-page.jsx";
import { SandboxPage, NewRunForm, AgentsLog, JudgeCard, RunDetail, SandboxChat } from "./sandbox-page.jsx";
import { PageShell, StatCard, NavCard, HomePage, InboxPage, InboxTeamThread, InboxDetail } from "./home-inbox-pages.jsx";
import { TeamPage, BizprocPage, SettingsPage, HelpPage, DepartmentChannelPage, SupportPage } from "./misc-pages.jsx";
import { FlowNode, AgentFlowCanvas, pipelineToFlow, DepartmentSandbox, AgentBottomPanel, AgentSettingsView, SettingRow, AgentJobDescription, SandboxPanel } from "./agent-view.jsx";
import { IntegrationsPage, IntegrationCard } from "./integrations-page.jsx";
import { MaryLogo, SideRow, SectionHeader, PipelineItem, AgentCard, CardToolBtn } from "./sidebar-components.jsx";

// Реплика экрана Figma node 5522:2547 (file: o1syNp93H3v2dyA3JHp4em — Mary)
// Сабпейдж "Тг-канал" в отделе "СММ".

const SIDEBAR_W = 220;
const RIGHT_W = 64;

// ── Иконки (14px по умолчанию для меню) ─────────────────────
const ic = {
  home: <I d={<path d="M3.5 10.8 12 3.5l8.5 7.3V20a1 1 0 0 1-1 1h-4v-6h-7v6h-4a1 1 0 0 1-1-1v-9.2z" />} />,
  chat:         <P src="/icons/icon_main-2.png" />,
  inbox:        <P src="/icons/icon_main-3.png" />,
  bizproc:      <P src="/icons/icon_main-4.png" />,
  depts:        <P src="/icons/icon_main-5.png" />,
  people:       <P src="/icons/icon_main-6.png" />,
  tasks:        <P src="/icons/icon_main-7.png" />,
  kb:           <P src="/icons/icon_main-8.png" />,
  integrations: <P src="/icons/icon_main-9.png" />,
  hr:           <P src="/icons/icon_main-3.png" />,
  help:         <P src="/icons/icon_main-9.png" />,
  support:      <P src="/icons/icon_main.png" />,
  settings:     <P src="/icons/icon_main-1.png" />,
  smm: <I d={<path d="M12 3c-.6 2.5.4 3.5-.5 5C10 6.7 8.7 7 8.4 8.5 8 10.4 6 11.7 6 14.2A6 6 0 0 0 18 14c0-3.4-2.7-4.6-3.6-7.5C13.7 4.6 13 3.6 12 3z" />} />,
  // Тёмный силуэт-голова с маленьким хвостиком справа (для отделов)
  dept: (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8c0-1.5-.4-2.9-1.2-4.1-.5.4-1.2.6-1.9.6-1.7 0-3-1.3-3-3 0-.6.2-1.2.4-1.7C13.6 3.3 12.8 3 12 3z" />
      <circle cx="17" cy="6.5" r="2" />
    </svg>
  ),
  chevron: <I d={<path d="M6 9l6 6 6-6" />} size={14} stroke={1.8} />,
  chevronUp: <I d={<path d="M6 15l6-6 6 6" />} size={14} stroke={1.8} />,
  plus: <I d={<path d="M12 5v14M5 12h14" />} size={14} stroke={1.9} />,
  collapse: <P src="/icons/streamline-flex_layout-right-sidebar-remix.png" size={18} />,
  // Робот для карточек агентов (цвет наследуется → меняется per-агент)
  agentBot: (
    <svg width={26} height={26} viewBox="0 0 24 24">
      <rect x="11.25" y="2" width="1.5" height="3" rx=".75" fill="currentColor" />
      <rect x="4.5" y="5.5" width="15" height="15" rx="4.5" fill="currentColor" />
      <circle cx="9.3"  cy="13" r="1.4" fill="white" />
      <circle cx="14.7" cy="13" r="1.4" fill="white" />
    </svg>
  ),
  hand: <I d={<><path d="M18 11V6a2 2 0 1 0-4 0v5" /><path d="M14 10V4a2 2 0 1 0-4 0v6" /><path d="M10 10.5V6a2 2 0 0 0-4 0v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-1-5.5-2.5L2 15c-.6-.9-.4-2 .5-2.5.9-.6 2-.4 2.5.5L7 15" /></>} size={16} />,
  zoomIn: <I d={<path d="M12 5v14M5 12h14" />} size={16} stroke={1.9} />,
  zoomOut: <I d={<path d="M5 12h14" />} size={16} stroke={1.9} />,
  expand: <I d={<><path d="M3 9V3h6" /><path d="M21 9V3h-6" /><path d="M3 15v6h6" /><path d="M21 15v6h-6" /></>} size={16} />,
  close: <I d={<path d="M6 6l12 12M18 6L6 18" />} size={16} stroke={1.7} />,
  arrowUpRight: <I d={<><path d="M7 17L17 7" /><path d="M8 7h9v9" /></>} size={16} stroke={1.7} />,
  mic: <I d={<><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><path d="M12 18v3" /></>} size={16} stroke={1.7} />,
  plusBig: <I d={<path d="M12 5v14M5 12h14" />} size={18} stroke={1.7} />,
  // Icons для КБ
  file: <I d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></>} size={16} stroke={1.6} />,
  image: <I d={<><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></>} size={16} stroke={1.6} />,
  link: <I d={<><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" /><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" /></>} size={16} stroke={1.6} />,
  inboxArrow: <I d={<><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6L5.5 5z" /></>} size={16} stroke={1.6} />,
  package: <I d={<><path d="M16.5 9.4l-9-5.19" /><path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><path d="M3.27 6.96L12 12l8.73-5.04" /><path d="M12 22.08V12" /></>} size={16} stroke={1.6} />,
  attach: <I d={<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />} size={16} stroke={1.7} />,
  uploadCloud: <I d={<><path d="M16 16l-4-4-4 4" /><path d="M12 12v9" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /><path d="M16 16l-4-4-4 4" /></>} size={22} stroke={1.6} />,
  book: <I d={<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>} size={16} stroke={1.6} />,
  paperPlane: <I d={<><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></>} size={14} stroke={1.6} />,
  // Метрики постов
  eye: <I d={<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>} size={13} stroke={1.6} />,
  heart: <I d={<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />} size={13} stroke={1.6} />,
  bubbleSm: <I d={<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />} size={13} stroke={1.6} />,
  mediaPic: <I d={<><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></>} size={13} stroke={1.6} />,
  externalLink: <I d={<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><path d="M15 3h6v6" /><path d="M10 14L21 3" /></>} size={13} stroke={1.6} />,
  text: <I d={<><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h10" /></>} size={16} stroke={1.7} />,
  pointer: (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.5 3l13 7-5.6 1.6 1.6 5.6-2 1-3-7-4 4z" />
    </svg>
  ),
  undo: <I d={<><path d="M9 14L4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-2" /></>} size={14} stroke={1.7} />,
  redo: <I d={<><path d="M15 14l5-5-5-5" /><path d="M20 9H9a5 5 0 0 0 0 10h2" /></>} size={14} stroke={1.7} />,
  arrowRight: <I d={<><path d="M5 12h14" /><path d="M13 5l7 7-7 7" /></>} size={14} stroke={1.7} />,
  trendUp:   <I d={<><path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" /></>} size={13} stroke={1.7} />,
  trendDown: <I d={<><path d="M3 7l6 6 4-4 8 8" /><path d="M14 17h7v-7" /></>} size={13} stroke={1.7} />,
  searching: <I d={<><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></>} size={13} stroke={1.7} />,
  checkSm: <I d={<path d="M5 12.5l4.5 4.5L19 7.5" />} size={13} stroke={2} />,
  fileSm: <I d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></>} size={13} stroke={1.7} />,
  spinnerSm: <I d={<><path d="M21 12a9 9 0 1 1-6.2-8.55" /></>} size={13} stroke={1.7} />,
  // Status (для pipeline items) — минималистично, без зелёных ячеек
  statusDone: (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#262633" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  statusCurrent: (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" fill="#FF8B3D" />
    </svg>
  ),
  statusPending: (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" stroke="rgba(38,38,51,0.25)" strokeWidth="1.5" fill="none" />
    </svg>
  ),
  // Hover-toolbar над карточкой агента
  play:    <I d={<path d="M6 4l14 8-14 8V4z" />} size={14} stroke={1.7} fill="currentColor" />,
  stopSm:  <I d={<rect x="6" y="6" width="12" height="12" rx="2" />} size={14} stroke={1.7} fill="currentColor" />,
  gear:    <I d={<><circle cx="12" cy="12" r="3" /><path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></>} size={14} stroke={1.6} />,
  chatSm:  <I d={<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />} size={14} stroke={1.6} />,
  // Lucide-style 4-конечный sparkle
  spark: (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c.4 0 .8.3.9.7l1 4 4 1c.4.1.7.5.7.9s-.3.8-.7.9l-4 1-1 4c-.1.4-.5.7-.9.7s-.8-.3-.9-.7l-1-4-4-1c-.4-.1-.7-.5-.7-.9s.3-.8.7-.9l4-1 1-4c.1-.4.5-.7.9-.7z" />
      <path d="M19 14c.3 0 .6.2.7.5l.5 1.6 1.6.5c.3.1.5.4.5.7s-.2.6-.5.7l-1.6.5-.5 1.6c-.1.3-.4.5-.7.5s-.6-.2-.7-.5l-.5-1.6-1.6-.5c-.3-.1-.5-.4-.5-.7s.2-.6.5-.7l1.6-.5.5-1.6c.1-.3.4-.5.7-.5z" />
    </svg>
  ),
};

function GraphCanvas({ chatOpen, chatMode, onChatModeChange, dockedHeight, onDockedHeightChange, onOpenChat, onCloseChat, activeFilter, onFilter, onAgentChat, onAgentSettings, selectedAgentId, pendingMaryMessage, onPendingConsumed, taskFlow, onTaskFlowChange, onAddTask, onOpenTasks }) {
  const [positions, setPositions] = useState(() =>
    Object.fromEntries(AGENTS.map(a => [a.id, { x: a.x, y: a.y }]))
  );
  const [expandedId, setExpandedId] = useState(null);
  const [drilledAgentId, setDrilledAgentId] = useState(null);
  // pipelineByAgentId: { agentId → flow } — приходит с бэка, оверрайдит хардкод AGENTS.flow
  const [pipelineByAgentId, setPipelineByAgentId] = useState({});
  // profileByAgentId: { agentId → { model, systemPrompt, tools, memory, responseFormat, tasks } } — должностная инструкция
  const [profileByAgentId, setProfileByAgentId] = useState({});
  // activeAgentIds — слушаем глобальный event из ChatMaryPage чтобы подсветить ноды
  const [activeAgentIds, setActiveAgentIds] = useState(() => window.__maryActiveAgents || new Set());
  useEffect(() => {
    const onAgents = (e) => setActiveAgentIds(new Set(e.detail?.ids || []));
    window.addEventListener("mary-active-agents", onAgents);
    return () => window.removeEventListener("mary-active-agents", onAgents);
  }, []);
  // Sandbox: статус узлов при прогоне, outputs, inputs формы
  const [sandboxStatus, setSandboxStatus] = useState({});  // nodeId → "running"|"done"|"error"
  const [sandboxOutputs, setSandboxOutputs] = useState({});  // nodeId → text
  const [sandboxRunning, setSandboxRunning] = useState(false);
  const [deptSandboxOpen, setDeptSandboxOpen] = useState(false);
  useEffect(() => {
    let stop = false;
    const load = () => fetch("/api/mary/departments").then(r => r.json()).then(d => {
      if (stop) return;
      const smm = (d.departments || []).find(x => x.id === "smm");
      if (!smm) return;
      const map = {};
      const profMap = {};
      for (const a of (smm.agents || [])) {
        if (a.pipeline?.nodes?.length) {
          const flow = pipelineToFlow(a.pipeline, a.color);
          if (flow) map[a.id] = flow;
        }
        profMap[a.id] = {
          role: a.role,
          tasks: a.tasks || "",
          model: a.model || "claude-sonnet-4-6",
          systemPrompt: a.systemPrompt || "",
          tools: a.tools || [],
          memory: a.memory || "short",
          responseFormat: a.responseFormat || "text",
        };
      }
      setPipelineByAgentId(map);
      setProfileByAgentId(profMap);
    }).catch(() => {});
    load();
    const t = setInterval(load, 5000); // подхватывать изменения от Mary раз в 5с
    return () => { stop = true; clearInterval(t); };
  }, []);
  const [pipelineKb, setPipelineKb] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const dragRef = useRef(null);
  const wasDraggedRef = useRef(false);
  const panRef = useRef(null);
  const canvasRef = useRef(null);

  function zoomBy(delta) {
    setView(v => {
      const next = Math.max(0.3, Math.min(2, +(v.scale + delta).toFixed(2)));
      return { ...v, scale: next };
    });
  }
  function fitToView() {
    const padding = 60;
    const xs = Object.values(positions).map(p => p.x);
    const ys = Object.values(positions).map(p => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs) + CARD_W;
    const minY = Math.min(...ys), maxY = Math.max(...ys) + CARD_H;
    const cw = canvasRef.current?.clientWidth || 1000;
    const fullH = canvasRef.current?.clientHeight || 600;
    // Если чат докнут — учитываем что нижняя половина закрыта
    const chatBottom = chatOpen && chatMode === "docked" ? Math.round(fullH * 0.55) + 28 : 0;
    const ch = fullH - chatBottom;
    const sx = (cw - padding * 2) / (maxX - minX);
    const sy = (ch - padding * 2) / (maxY - minY);
    const scale = Math.min(1, Math.max(0.3, Math.min(sx, sy)));
    const x = (cw - (maxX - minX) * scale) / 2 - minX * scale;
    const y = (ch - (maxY - minY) * scale) / 2 - minY * scale;
    setView({ x, y, scale });
  }

  // Агент с актуальной позицией
  const agentsWithPos = AGENTS.map(a => ({ ...a, ...positions[a.id] }));
  const byId = Object.fromEntries(agentsWithPos.map(a => [a.id, a]));

  function pathBetween(from, to) {
    const x1 = from.x + CARD_W;
    const y1 = from.y + CARD_H / 2;
    const x2 = to.x;
    const y2 = to.y + CARD_H / 2;
    const dx = (x2 - x1) * 0.5;
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  }

  // ── DRILL-IN: zoom-в-агента + рендер внутренних нод ──────
  // drilledAgent — ищем в AGENTS, и если есть свежий flow с бэка — заменяем им хардкод
  const drilledAgent = drilledAgentId ? (() => {
    const base = byId[drilledAgentId];
    if (!base) return null;
    const fromBackend = pipelineByAgentId[drilledAgentId];
    const profile = profileByAgentId[drilledAgentId];
    const merged = fromBackend ? { ...base, flow: fromBackend } : { ...base };
    if (profile) merged.profile = profile;
    return merged;
  })() : null;

  // Запуск sandbox — стримит статусы узлов и outputs
  async function runSandbox(inputs, dryRun) {
    if (!drilledAgent) return;
    setSandboxRunning(true);
    setSandboxStatus({});
    setSandboxOutputs({});
    try {
      const res = await fetch(`/api/mary/agents/smm/${drilledAgent.id}/sandbox/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs, dryRun }),
      });
      if (!res.body) throw new Error("no stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() || "";
        for (const block of blocks) {
          let event = "message", dataStr = "";
          for (const line of block.split("\n")) {
            if (line.startsWith("event:")) event = line.slice(6).trim();
            else if (line.startsWith("data:")) dataStr += line.slice(5).trim();
          }
          if (!dataStr) continue;
          let data; try { data = JSON.parse(dataStr); } catch { continue; }
          if (event === "node_start") {
            setSandboxStatus(s => ({ ...s, [data.nodeId]: "running" }));
          } else if (event === "node_end") {
            setSandboxStatus(s => ({ ...s, [data.nodeId]: data.ok ? "done" : "error" }));
            setSandboxOutputs(o => ({ ...o, [data.nodeId]: data.output || data.error || "" }));
          }
        }
      }
    } catch (e) {
      console.error("sandbox error", e);
    } finally {
      setSandboxRunning(false);
    }
  }
  const FLOW_NODE_W = 220;
  const FLOW_NODE_H = 64;
  const prevViewRef = useRef(null);

  // Вычисляем абсолютные координаты внутренних нод (offset от центра агента)
  function flowNodeAbsPos(agent, n) {
    const cx = agent.x + CARD_W / 2;
    const cy = agent.y + CARD_H / 2;
    return {
      x: cx + n.ox - FLOW_NODE_W / 2,
      y: cy + n.oy - FLOW_NODE_H / 2,
    };
  }
  function flowPathBetween(a, b) {
    const ax = a.x + FLOW_NODE_W;
    const ay = a.y + FLOW_NODE_H / 2;
    const bx = b.x;
    const by = b.y + FLOW_NODE_H / 2;
    const dx = Math.max(40, (bx - ax) * 0.5);
    return `M ${ax} ${ay} C ${ax + dx} ${ay}, ${bx - dx} ${by}, ${bx} ${by}`;
  }

  // Анимация: при входе в drill — летим в агента и фит inner-flow
  useEffect(() => {
    if (drilledAgent && drilledAgent.flow) {
      if (!prevViewRef.current) prevViewRef.current = { ...view };
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      // Bounding box внутренних нод
      const positions = drilledAgent.flow.nodes.map(n => flowNodeAbsPos(drilledAgent, n));
      const minX = Math.min(...positions.map(p => p.x));
      const minY = Math.min(...positions.map(p => p.y));
      const maxX = Math.max(...positions.map(p => p.x + FLOW_NODE_W));
      const maxY = Math.max(...positions.map(p => p.y + FLOW_NODE_H));
      const w = maxX - minX + 100;
      const h = maxY - minY + 100;
      const targetScale = Math.min(rect.width / w, rect.height / h, 1.0);
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      setView({
        x: rect.width / 2 - cx * targetScale,
        y: rect.height / 2 - cy * targetScale,
        scale: targetScale,
      });
    } else if (prevViewRef.current) {
      setView(prevViewRef.current);
      prevViewRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drilledAgentId]);

  useEffect(() => {
    function onMove(e) {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      if (!d.dragging && Math.hypot(dx, dy) > 4) {
        d.dragging = true;
        setDraggingId(d.id);
      }
      if (d.dragging) {
        setPositions(prev => ({
          ...prev,
          [d.id]: { x: Math.max(0, d.origX + dx), y: Math.max(0, d.origY + dy) },
        }));
      }
    }
    function onUp() {
      if (dragRef.current) {
        wasDraggedRef.current = dragRef.current.dragging;
        dragRef.current = null;
        setDraggingId(null);
      }
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  function handleAgentMouseDown(id, e) {
    const pos = positions[id];
    dragRef.current = {
      id,
      startX: e.clientX, startY: e.clientY,
      origX: pos.x, origY: pos.y,
      dragging: false,
    };
  }
  function handleAgentToggle(id) {
    if (wasDraggedRef.current) {
      wasDraggedRef.current = false;
      return;
    }
    // Если у агента есть workflow — сразу раскрываем его флоу.
    // Если нет — fallback на старый раскрывающийся pipeline на карточке.
    const a = AGENTS.find(x => x.id === id);
    if (a?.flow) {
      setDrilledAgentId(id);
      return;
    }
    setExpandedId(prev => prev === id ? null : id);
  }
  function handleOpenKb(title, agent) {
    setPipelineKb({ title, agent });
  }

  function handleCanvasMouseDown(e) {
    // Pan только если кликнули по пустому полю (не по карточке/контролам)
    if (e.target !== e.currentTarget && !e.target.dataset?.panSurface) return;
    panRef.current = { startX: e.clientX, startY: e.clientY, vx: view.x, vy: view.y };
  }
  useEffect(() => {
    function onMove(e) {
      if (!panRef.current) return;
      const p = panRef.current;
      setView(v => ({ ...v, x: p.vx + (e.clientX - p.startX), y: p.vy + (e.clientY - p.startY) }));
    }
    function onUp() { panRef.current = null; }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  return (
    <div
      ref={canvasRef}
      onMouseDown={handleCanvasMouseDown}
      style={{
        position: "relative",
        flex: 1,
        minHeight: 0,
        background: "#F7F7F7",
        backgroundImage: "radial-gradient(circle, #FFFFFF 1.4px, transparent 1.4px)",
        backgroundSize: "20px 20px",
        backgroundPosition: "10px 10px",
        borderRadius: 16,
        overflow: "hidden",
        cursor: panRef.current ? "grabbing" : "default",
      }}
    >
      {/* Breadcrumb внутри прямоугольника, сверху-слева */}
      <div style={{
        position: "absolute", top: 18, left: 24,
        display: "flex", alignItems: "center", gap: 8,
        fontSize: 13.5, color: "rgba(38,38,51,0.55)",
        zIndex: 5,
      }}>
        <span style={{ cursor: drilledAgentId ? "pointer" : "default" }}
          onClick={() => drilledAgentId && setDrilledAgentId(null)}
        >СММ-Отдел</span>
        <span style={{ opacity: 0.6 }}>›</span>
        <span
          style={{
            color: drilledAgentId ? "rgba(38,38,51,0.55)" : "#262633",
            cursor: drilledAgentId ? "pointer" : "default",
          }}
          onClick={() => drilledAgentId && setDrilledAgentId(null)}
        >Тг-канал</span>
        {drilledAgentId && drilledAgent && (
          <>
            <span style={{ opacity: 0.6 }}>›</span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 10px",
              background: drilledAgent.color + "1A",
              color: drilledAgent.color,
              borderRadius: 999,
              fontSize: 12.5, fontWeight: 500,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: drilledAgent.color }} />
              {drilledAgent.label}
            </span>
          </>
        )}
      </div>

      {/* Кнопка «Тестировать» — справа сверху, переходит на страницу песочницы */}
      {!drilledAgentId && (
        <button
          onClick={() => window.__maryNavigate?.("page://sandbox")}
          title="Открыть песочницу"
          style={{
            position: "absolute", top: 14, right: 16, zIndex: 6,
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "7px 14px",
            background: "#262633", color: color.white,
            border: "none", borderRadius: 8,
            fontSize: 12.5, fontWeight: 500,
            cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 1px 3px rgba(38,38,51,0.08)",
          }}
        >
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Тестировать
        </button>
      )}


      {/* Pan/zoom-обёртка для графа */}
      <div
        data-pan-surface="true"
        style={{
          position: "absolute", inset: 0,
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
          transformOrigin: "0 0",
          transition: panRef.current || dragRef.current
            ? "none"
            : drilledAgentId ? "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)" : "transform 0.18s ease",
        }}
      >
        {/* Главные ребра между агентами — гаснут при drill-in */}
        <svg
          width="100%" height="100%"
          style={{
            position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible",
            opacity: drilledAgentId ? 0 : 1,
            transition: "opacity 0.3s ease",
          }}
        >
          {EDGES.map(([f, t]) => (
            <path
              key={`${f}-${t}`}
              d={pathBetween(byId[f], byId[t])}
              stroke="rgba(38,38,51,0.18)"
              strokeWidth="1.4"
              fill="none"
            />
          ))}
        </svg>

        {/* Inner-flow ребра — появляются при drill-in */}
        {drilledAgent?.flow && (
          <svg
            width="100%" height="100%"
            style={{
              position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible",
              opacity: drilledAgentId ? 1 : 0,
              transition: "opacity 0.4s ease 0.2s",
            }}
          >
            {drilledAgent.flow.edges.map(([fid, tid]) => {
              const fn = drilledAgent.flow.nodes.find(n => n.id === fid);
              const tn = drilledAgent.flow.nodes.find(n => n.id === tid);
              if (!fn || !tn) return null;
              const a = flowNodeAbsPos(drilledAgent, fn);
              const b = flowNodeAbsPos(drilledAgent, tn);
              return (
                <path
                  key={`${fid}-${tid}`}
                  d={flowPathBetween(a, b)}
                  stroke="rgba(38,38,51,0.18)"
                  strokeWidth="1.4"
                  fill="none"
                />
              );
            })}
          </svg>
        )}

        {/* Карточки агентов */}
        {agentsWithPos.map(a => {
          const isDrilled = drilledAgentId === a.id;
          const hide      = !!drilledAgentId; // при drill-in прячем все агенты — видна только внутрянка
          return (
            <div
              key={a.id}
              style={{
                position: "absolute", inset: 0,
                opacity: hide ? 0 : 1,
                pointerEvents: hide ? "none" : "auto",
                transition: "opacity 0.35s ease",
              }}
            >
              <AgentCard
                a={a}
                expanded={expandedId === a.id}
                selected={selectedAgentId === a.id}
                active={activeAgentIds.has(a.id)}
                dragging={draggingId === a.id}
                onMouseDown={(e) => handleAgentMouseDown(a.id, e)}
                onToggle={() => handleAgentToggle(a.id)}
                onOpenKb={(title) => handleOpenKb(title, a)}
                onOpenChat={onAgentChat}
                onOpenSettings={onAgentSettings}
                onOpenFlow={() => setDrilledAgentId(a.id)}
              />
            </div>
          );
        })}

        {/* Inner-flow ноды — появляются при drill-in */}
        {drilledAgent?.flow && drilledAgent.flow.nodes.map(n => {
          const pos = flowNodeAbsPos(drilledAgent, n);
          return (
            <FlowNode
              key={n.id}
              n={n}
              pos={pos}
              w={FLOW_NODE_W}
              h={FLOW_NODE_H}
              accent={drilledAgent.color}
              visible={!!drilledAgentId}
            />
          );
        })}
      </div>

      {pipelineKb && (
        <KbPopup item={pipelineKb} onClose={() => setPipelineKb(null)} />
      )}

      {/* Bottom panel: Settings / Logs / Output — Sim-style */}
      {drilledAgent && drilledAgent.profile && (
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          zIndex: 7,
        }}>
          <AgentBottomPanel
            agent={drilledAgent}
            profile={drilledAgent.profile}
            sandboxStatus={sandboxStatus}
            sandboxOutputs={sandboxOutputs}
            sandboxRunning={sandboxRunning}
            onRun={runSandbox}
          />
        </div>
      )}

      {/* Tool/zoom bar — поднимается над докнутым чатом */}
      <ToolBar
        chatOpen={chatOpen}
        chatMode={chatMode}
        dockedHeight={dockedHeight}
        scale={view.scale}
        onZoomIn={() => zoomBy(0.1)}
        onZoomOut={() => zoomBy(-0.1)}
        onFit={fitToView}
      />

      {/* Чип «Спросить у Mary» — всегда виден, открывает чат */}
      {!chatOpen && (
        <button
          onClick={onOpenChat}
          style={{
            position: "absolute", left: "50%", bottom: 16, transform: "translateX(-50%)",
            display: "flex", alignItems: "center", gap: 10,
            background: color.white,
            border: "1px solid rgba(38,38,51,0.08)",
            borderRadius: 999,
            padding: "9px 16px 9px 18px",
            boxShadow: "0 2px 8px rgba(38,38,51,0.06)",
            fontSize: 14, color: "#262633", fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <span>Спросить у Mary</span>
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 22, height: 22, borderRadius: 7,
            background: "rgba(255,139,61,0.12)", color: "#FF8B3D",
          }}>{ic.spark}</span>
        </button>
      )}

      {/* Плавающее или докнутое окно чата (side рендерится снаружи, в layout) */}
      {chatOpen && chatMode !== "side" && (
        <ChatPanel
          onClose={onCloseChat}
          activeFilter={activeFilter}
          onFilter={onFilter}
          mode={chatMode}
          onModeChange={onChatModeChange}
          dockedHeight={dockedHeight}
          onDockedHeightChange={onDockedHeightChange}
          pendingMaryMessage={pendingMaryMessage}
          onPendingConsumed={onPendingConsumed}
          taskFlow={taskFlow}
          onTaskFlowChange={onTaskFlowChange}
          onAddTask={onAddTask}
          onOpenTasks={onOpenTasks}
          onOpenKb={(item) => setPipelineKb(item)}
        />
      )}
    </div>
  );
}

function ToolBar({ chatOpen, chatMode, dockedHeight, scale, onZoomIn, onZoomOut, onFit }) {
  const [tool, setTool] = useState("pointer"); // "pointer" | "hand"
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      position: "absolute", left: 16,
      bottom: chatOpen && chatMode === "docked" ? (dockedHeight ?? 420) + 28 : 16,
      display: "flex", alignItems: "center",
      height: 40,
      background: color.white,
      border: "1px solid rgba(38,38,51,0.08)",
      borderRadius: 12,
      padding: "0 10px",
      boxShadow: "0 1px 2px rgba(38,38,51,0.04)",
      gap: 6,
      zIndex: 11,
      transition: transition.base,
    }}>
      {/* Tool selector */}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <button style={zoomBtn} onClick={() => setOpen(v => !v)}>
          {tool === "pointer" ? ic.pointer : ic.hand}
        </button>
        <button style={{ ...zoomBtn, color: "rgba(38,38,51,0.5)" }} onClick={() => setOpen(v => !v)}>
          {ic.chevron}
        </button>
        {open && (
          <div style={{
            position: "absolute", bottom: "calc(100% + 6px)", left: 0,
            background: color.white,
            border: "1px solid rgba(38,38,51,0.1)",
            borderRadius: 10,
            boxShadow: "0 6px 18px rgba(38,38,51,0.1)",
            padding: 4, minWidth: 130,
            zIndex: 5,
          }}>
            <ToolOpt icon={ic.pointer} label="Указатель" active={tool === "pointer"} onClick={() => { setTool("pointer"); setOpen(false); }} />
            <ToolOpt icon={ic.hand}    label="Рука"      active={tool === "hand"}    onClick={() => { setTool("hand"); setOpen(false); }} />
          </div>
        )}
      </div>
      <div style={{ width: 1, height: 18, background: "rgba(38,38,51,0.1)" }} />
      <button style={zoomBtn} title="Уменьшить" onClick={onZoomOut}>{ic.zoomOut}</button>
      <span style={{ fontSize: 13, color: "#262633", minWidth: 40, textAlign: "center", fontFamily: "inherit" }}>{Math.round((scale ?? 1) * 100)}%</span>
      <button style={zoomBtn} title="Увеличить" onClick={onZoomIn}>{ic.zoomIn}</button>
      <div style={{ width: 1, height: 18, background: "rgba(38,38,51,0.1)" }} />
      <button style={zoomBtn} title="Уместить весь флоу" onClick={onFit}>{ic.expand}</button>
    </div>
  );
}

function ToolOpt({ icon, label, active, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        width: "100%", padding: "7px 10px",
        background: active ? "rgba(38,38,51,0.06)" : h ? "rgba(38,38,51,0.03)" : "transparent",
        color: "#262633",
        border: "none", borderRadius: 7,
        cursor: "pointer", fontFamily: "inherit", textAlign: "left",
        fontSize: 13, fontWeight: 500,
      }}
    >
      <span style={{ display: "flex" }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// ── Правая узкая панель ─────────────────────────────────────
function RightRail({ activeRail, onSelect, chatSideActive, onToggleChatSide }) {
  // Маленькая иконка-агент 16px для правого рейла
  const agentMini = (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="#262633">
      <rect x="11.25" y="2" width="1.5" height="3" rx=".75" />
      <rect x="4.5" y="5.5" width="15" height="15" rx="4.5" />
      <circle cx="9.3" cy="13" r="1.4" fill="white" />
      <circle cx="14.7" cy="13" r="1.4" fill="white" />
    </svg>
  );
  const chatIcon = (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#262633" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />
    </svg>
  );
  const items = [
    { id: "tasks",        icon: ic.tasks,        label: "Задачи" },
    { id: "kb",           icon: ic.kb,           label: "База" },
    { id: "integrations", icon: ic.integrations, label: "Интеграции" },
    { id: "agents",       icon: agentMini,       label: "Агенты" },
    { id: "people",       icon: ic.people,       label: "Люди" },
  ];
  return (
    <aside style={{
      width: RIGHT_W, minWidth: RIGHT_W,
      background: color.white,
      borderLeft: "1px solid rgba(38,38,51,0.06)",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "16px 0",
      gap: 6,
    }}>
      {items.map(it => (
        <RailItem
          key={it.id}
          icon={it.icon}
          label={it.label}
          active={activeRail === it.id}
          onClick={() => onSelect(activeRail === it.id ? null : it.id)}
        />
      ))}
      <div style={{ width: 28, height: 1, background: "rgba(38,38,51,0.08)", margin: "4px 0" }} />
      <RailItem
        icon={chatIcon}
        label="Чат"
        active={chatSideActive}
        onClick={onToggleChatSide}
      />
    </aside>
  );
}
function RailItem({ icon, label, active, onClick }) {
  const [h, setH] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
        padding: "8px 6px", width: 50, borderRadius: 10,
        background: active ? "rgba(38,38,51,0.05)" : h ? "rgba(38,38,51,0.03)" : "transparent",
        cursor: "pointer", transition: transition.fast,
      }}
    >
      <span style={{ display: "flex", color: "#262633" }}>{icon}</span>
      <span style={{ fontSize: 11, color: "#262633", lineHeight: 1.1 }}>{label}</span>
    </div>
  );
}

// ── Drawer для правого рейла ────────────────────────────────
const RAIL_DRAWER_TITLE = {
  tasks: "Задачи отдела",
  kb: "База знаний",
  integrations: "Интеграции",
  agents: "Агенты",
  people: "Люди",
};

// ── usePeople, MOCK_PEOPLE вынесены в src/platform/people.js (import выше) ──


function RailDrawer({ kind, onClose, agentsSelected, setAgentsSelected, kbUserItems, setKbUserItems, onCreateTask, pendingTasks }) {
  const [addOpen, setAddOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  return (
    <aside style={{
      width: 360, minWidth: 360,
      background: color.white,
      borderLeft: "1px solid rgba(38,38,51,0.06)",
      display: "flex", flexDirection: "column",
    }}>
      {/* Header (скрыт в режиме agent detail — там собственный header) */}
      {!(kind === "agents" && agentsSelected) && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "16px 18px",
          borderBottom: "1px solid rgba(38,38,51,0.06)",
        }}>
          <span style={{ fontSize: 15, fontWeight: 510, color: "#262633", flex: 1 }}>
            {RAIL_DRAWER_TITLE[kind]}
          </span>
          {kind === "kb" && (
            <button
              onClick={() => setAddOpen(true)}
              title="Добавить материал"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 28, height: 28,
                background: "rgba(38,38,51,0.05)",
                color: "rgba(38,38,51,0.6)",
                border: "none", borderRadius: 8,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >{ic.plus}</button>
          )}
          {kind === "people" && (
            <button
              onClick={() => setInviteOpen(true)}
              title="Пригласить"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 28, height: 28,
                background: "rgba(38,38,51,0.05)",
                color: "rgba(38,38,51,0.6)",
                border: "none", borderRadius: 8,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >{ic.plus}</button>
          )}
          {kind === "tasks" && (
            <button
              onClick={onCreateTask}
              title="Поставить задачу через чат с Mary"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 28, height: 28,
                background: "rgba(38,38,51,0.05)",
                color: "rgba(38,38,51,0.6)",
                border: "none", borderRadius: 8,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >{ic.plus}</button>
          )}
          <button onClick={onClose} style={{ ...zoomBtn, color: "rgba(38,38,51,0.55)", padding: 6 }}>
            {ic.close}
          </button>
        </div>
      )}
      {/* Body per kind */}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px" }}>
        {kind === "tasks"        && <TasksContent pendingTasks={pendingTasks} />}
        {kind === "kb"           && <FilesContent addOpen={addOpen} onCloseAdd={() => setAddOpen(false)} userItems={kbUserItems} setUserItems={setKbUserItems} />}
        {kind === "integrations" && <IntegrationsContent />}
        {kind === "agents"       && (
          <AgentsContent selected={agentsSelected} onSelect={setAgentsSelected} />
        )}
        {kind === "people"       && <PeopleContent />}
      </div>
    </aside>
  );
}

function TasksContent({ pendingTasks = [] }) {
  const [collapsed, setCollapsed] = useState({});
  const toggle = key => setCollapsed(c => ({ ...c, [key]: !c[key] }));

  // Собираем все cron-задачи из всех агентов в одну группу сверху
  const cronTasks = AGENTS.flatMap(a =>
    (a.tasks || []).filter(t => t.cron).map(t => ({ ...t, agent: a }))
  );

  function TaskCard({ t, agentBadge }) {
    const isCron = !!t.cron;
    const iconColor = isCron ? "#7A86FF" : "#3F95FF";
    return (
      <div style={{
        ...drawerRow,
        cursor: "pointer",
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: iconColor + "1F",
          color: iconColor,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          {isCron ? (
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          ) : (
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#262633", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
          {agentBadge && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: agentBadge.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)" }}>{agentBadge.label}</span>
            </div>
          )}
        </div>
        {isCron && (
          <span style={{
            fontSize: 11, color: "rgba(38,38,51,0.5)",
            fontFamily: "ui-monospace, SF Mono, monospace",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}>{t.cron.replace(/^cron\s*/, "")}</span>
        )}
        <button
          title={`Открыть «${t.out}» в базе знаний`}
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 28, height: 28, borderRadius: 8,
            background: "transparent",
            color: "rgba(38,38,51,0.55)",
            border: "none",
            cursor: "pointer", fontFamily: "inherit",
            flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(38,38,51,0.05)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          {ic.arrowRight}
        </button>
      </div>
    );
  }

  function GroupHeader({ dotColor, label, icon, isCollapsed, onToggle }) {
    return (
      <button
        onClick={onToggle}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 4px",
          width: "100%",
          background: "transparent", border: "none",
          cursor: "pointer", fontFamily: "inherit", textAlign: "left",
        }}
      >
        {icon ? icon : (
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
        )}
        <span style={{
          fontSize: 14, fontWeight: 500, color: "#262633",
        }}>{label}</span>
        <span style={{ flex: 1 }} />
        <span style={{
          display: "inline-flex",
          color: "rgba(38,38,51,0.45)",
          transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
          transition: "transform 0.15s ease",
        }}>{ic.chevron}</span>
      </button>
    );
  }

  const clockIcon = (
    <span style={{ display: "inline-flex", color: "rgba(38,38,51,0.55)" }}>
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    </span>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* 1. Крон-задачи (закреплены вверху) */}
      {cronTasks.length > 0 && (
        <div>
          <GroupHeader
            label={`Крон-задачи · ${cronTasks.length}`} count=""
            icon={clockIcon}
            isCollapsed={!!collapsed.cron}
            onToggle={() => toggle("cron")}
          />
          {!collapsed.cron && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {cronTasks.map((t, i) => (
                <TaskCard key={`cron-${i}`} t={t} dotColor="#34C759" agentBadge={t.agent} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Ожидающие принятия (под крон) */}
      {pendingTasks.length > 0 && (
        <div>
          <GroupHeader
            dotColor="#FFD60A"
            label={`Ожидает принятия · ${pendingTasks.length}`}
            isCollapsed={!!collapsed.pending}
            onToggle={() => toggle("pending")}
          />
          {!collapsed.pending && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {pendingTasks.map(t => (
                <div key={t.id} style={{
                  background: color.white,
                  border: "1px solid rgba(38,38,51,0.08)",
                  borderRadius: 10,
                  padding: "10px 12px",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FFD60A", marginTop: 5, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: "#262633" }}>{t.title}</div>
                      <div style={{ fontSize: 11, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>
                        {t.kind === "agent" ? `${t.assignee}-агенту` : t.assignee} · {t.status} · поставлено в {t.createdAt}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Все остальные задачи (без cron, не pending) — один список */}
      {(() => {
        const otherTasks = AGENTS.flatMap(a =>
          (a.tasks || []).filter(t => !t.cron).map(t => ({ ...t, agent: a }))
        );
        if (otherTasks.length === 0) return null;
        return (
          <div>
            <GroupHeader
              dotColor="#34C759"
              label={`В работе · ${otherTasks.length}`}
              isCollapsed={!!collapsed.work}
              onToggle={() => toggle("work")}
            />
            {!collapsed.work && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {otherTasks.map((t, i) => (
                  <TaskCard key={`other-${i}`} t={t} dotColor="#34C759" agentBadge={t.agent} />
                ))}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

function FilesContent({ addOpen, onCloseAdd, userItems = [], setUserItems }) {
  const [tab, setTab] = useState("in");
  const [opened, setOpened] = useState(null);
  const [textView, setTextView] = useState(null);
  const [serverFiles, setServerFiles] = useState([]);

  // Подтягиваем файлы созданные Mary через File Agent
  useEffect(() => {
    let active = true;
    const load = () =>
      fetch("/api/mary/kb/files")
        .then(r => r.ok ? r.json() : { files: [] })
        .then(d => { if (active) setServerFiles(d.files || []); })
        .catch(() => {});
    load();
    const id = setInterval(load, 5000); // обновляем каждые 5 сек на случай новых
    return () => { active = false; clearInterval(id); };
  }, []);

  const items = AGENTS.flatMap(a => {
    const list = tab === "in" ? (a.kb?.inputs || []) : (a.kb?.outputs || []);
    return list.map(it => ({ ...it, agent: a }));
  });

  function addUserItem(it) {
    setUserItems(prev => [it, ...prev]);
  }
  async function openServerFile(name) {
    const r = await fetch("/api/mary/kb/file?name=" + encodeURIComponent(name));
    if (!r.ok) return;
    const d = await r.json();
    setTextView({ name: d.name, body: d.content, kind: "text", meta: `${d.length} симв. · от Mary` });
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 0 12px" }}>
        <FilterChip label="Получено" active={tab === "in"}  onClick={() => setTab("in")} />
        <FilterChip label="Сделано"  active={tab === "out"} onClick={() => setTab("out")} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {/* Файлы созданные Mary через File Agent */}
        {tab === "in" && serverFiles.map((f, i) => (
          <div
            key={`srv-${i}`}
            onClick={() => openServerFile(f.name)}
            style={{ ...drawerRow, cursor: "pointer" }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "rgba(52,199,89,0.14)", color: "#34C759",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>{ic.fileSm || ic.file}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 450, color: "#262633", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
              <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>
                {fmtBytes(f.size)} · от Mary · {new Date(f.modified).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 600, color: "#34C759",
              background: "rgba(52,199,89,0.12)",
              padding: "2px 7px", borderRadius: 999,
            }}>MARY</span>
          </div>
        ))}
        {/* Сначала загруженные пользователем */}
        {tab === "in" && userItems.map((it, i) => {
          const canOpenFile = (it.kind === "file" || it.kind === "image") && it.data;
          const isLink = it.kind === "link";
          const isText = it.kind === "text" && it.body;
          function open() {
            if (isLink) { window.open(it.name, "_blank"); return; }
            if (canOpenFile) { window.open(it.data, "_blank"); return; }
            if (isText) { setTextView(it); return; }
          }
          const clickable = canOpenFile || isLink || isText;
          return (
          <div
            key={`u-${i}`}
            onClick={clickable ? open : undefined}
            title={clickable ? "Открыть" : ""}
            style={{ ...drawerRow, cursor: clickable ? "pointer" : "default" }}
          >
            <UserItemThumb it={it} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 450, color: "#262633", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.name}</div>
              <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                <UserItemKindBadge kind={it.kind} />
                <span>{it.meta}</span>
              </div>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 600, color: "#7A86FF",
              background: "rgba(122,134,255,0.12)",
              padding: "2px 7px", borderRadius: 999,
            }}>NEW</span>
          </div>
          );
        })}

        {/* Потом — авто-источники от агентов */}
        {items.map((it, i) => (
          <div
            key={i}
            onClick={() => setOpened(it)}
            style={{ ...drawerRow, cursor: "pointer" }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: it.agent.color + "1A",
              color: it.agent.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              {tab === "in" ? ic.inboxArrow : ic.package}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 450, color: "#262633" }}>{it.title}</div>
              <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: it.agent.color }} />
                <span>{it.agent.label}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {opened && <KbPopup item={opened} onClose={() => setOpened(null)} />}
      {addOpen && <AddKbPopup onAdd={addUserItem} onClose={onCloseAdd} />}
      {textView && <TextViewerPopup item={textView} onClose={() => setTextView(null)} />}
    </>
  );
}

function userItemIcon(kind) {
  if (kind === "image") return ic.image;
  if (kind === "link")  return ic.link;
  if (kind === "text")  return ic.text;
  return ic.file;
}
const KIND_META = {
  image: { color: "#3F95FF", label: "Фото" },
  link:  { color: "#34C759", label: "Ссылка" },
  text:  { color: "#FF8B3D", label: "Текст" },
  file:  { color: "#7A86FF", label: "Файл" },
};
function UserItemThumb({ it }) {
  // Картинка с превью — рисуем сам файл миниатюрой
  if (it.kind === "image" && it.data) {
    return (
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: "rgba(38,38,51,0.05)",
        flexShrink: 0,
        overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <img src={it.data} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    );
  }
  const meta = KIND_META[it.kind] || KIND_META.file;
  return (
    <div style={{
      width: 32, height: 32, borderRadius: 8,
      background: meta.color + "22",
      color: meta.color,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>{userItemIcon(it.kind)}</div>
  );
}
function UserItemKindBadge({ kind }) {
  const meta = KIND_META[kind] || KIND_META.file;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "1px 7px",
      background: meta.color + "1F",
      color: meta.color,
      borderRadius: 999,
      fontSize: 10, fontWeight: 500,
    }}>{meta.label}</span>
  );
}
function fmtBytes(b) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(1) + " MB";
}

// ── Просмотр спарсенных постов ──────────────────────────────
function parseViews(v) {
  if (!v) return 0;
  const n = parseFloat(String(v).replace(",", "."));
  return /k$/i.test(v) ? n * 1000 : n;
}

function PostCard({ p }) {
  const [open, setOpen] = useState(false);
  const url = `https://t.me/${p.ch}/${p.id}`;
  return (
    <div style={{
      background: color.white,
      border: "1px solid rgba(38,38,51,0.08)",
      borderRadius: 12,
      padding: "12px 14px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <a
          href={`https://t.me/${p.ch}`}
          target="_blank" rel="noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 12, fontWeight: 600, color: "#3F95FF",
            textDecoration: "none",
          }}
        >
          <span style={{ display: "flex" }}>{ic.paperPlane}</span>
          @{p.ch}
        </a>
        <span style={{ fontSize: 11.5, color: "rgba(38,38,51,0.5)" }}>· {p.time}</span>
        {p.hasMedia && (
          <span title="Есть медиа" style={{
            display: "inline-flex", alignItems: "center", gap: 3,
            fontSize: 11, color: "rgba(38,38,51,0.5)",
            marginLeft: "auto",
          }}>
            {ic.mediaPic}
          </span>
        )}
      </div>

      {/* Text */}
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          fontSize: 13, color: "#262633", lineHeight: 1.5,
          marginTop: 8,
          cursor: "pointer",
          display: open ? "block" : "-webkit-box",
          WebkitLineClamp: open ? "unset" : 2,
          WebkitBoxOrient: "vertical",
          overflow: open ? "visible" : "hidden",
        }}
      >{p.text}</div>

      {/* Footer: metrics + link */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        marginTop: 10,
        fontSize: 11.5, color: "rgba(38,38,51,0.6)",
      }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          {ic.eye} {p.views || p.view || "—"}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          {ic.heart} {p.reactions}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          {ic.bubbleSm} {p.comments}
        </span>
        <a
          href={url}
          target="_blank" rel="noreferrer"
          style={{
            marginLeft: "auto",
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 11.5, color: "#262633", fontWeight: 500,
            textDecoration: "none",
            padding: "4px 8px",
            border: "1px solid rgba(38,38,51,0.12)",
            borderRadius: 7,
          }}
        >
          Открыть в ТГ {ic.externalLink}
        </a>
      </div>
    </div>
  );
}

const PERIOD_DAYS = { today: 0, week: 7, month: 30, all: Infinity };
const PERIOD_LABEL = {
  today: "За сегодня",
  week:  "За неделю",
  month: "За месяц",
  all:   "За всё время",
};
const MODE_LABEL = {
  feed:  "По постам",
  group: "По каналам",
};
const SORT_FN = {
  views:     (a, b) => parseViews(b.views || b.view) - parseViews(a.views || a.view),
  reactions: (a, b) => (b.reactions || 0) - (a.reactions || 0),
  comments:  (a, b) => (b.comments  || 0) - (a.comments  || 0),
  newest:    (a, b) => (a.daysAgo   || 0) - (b.daysAgo   || 0),
};
const SORT_LABEL = {
  views:     "По охвату",
  reactions: "По реакциям",
  comments:  "По комментам",
  newest:    "По времени",
};

function DropdownChip({ value, options, onChange, openId, setOpenId, id }) {
  const open = openId === id;
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpenId(open ? null : id)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          height: 32, padding: "0 12px",
          background: color.white,
          border: "1px solid rgba(38,38,51,0.1)",
          borderRadius: 999,
          fontSize: 13, color: "#262633", fontWeight: 500,
          cursor: "pointer", fontFamily: "inherit",
        }}
      >
        <span>{options[value]}</span>
        <span style={{ display: "flex", color: "rgba(38,38,51,0.5)" }}>{ic.chevron}</span>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, marginTop: 4,
          background: color.white,
          border: "1px solid rgba(38,38,51,0.1)",
          borderRadius: 10,
          boxShadow: "0 6px 18px rgba(38,38,51,0.1)",
          zIndex: 5, minWidth: 160, padding: 4,
        }}>
          {Object.entries(options).map(([k, label]) => (
            <button
              key={k}
              onClick={() => { onChange(k); setOpenId(null); }}
              style={{
                display: "block", width: "100%",
                textAlign: "left",
                padding: "8px 10px",
                background: value === k ? "rgba(38,38,51,0.05)" : "transparent",
                border: "none", borderRadius: 7,
                fontSize: 13, color: "#262633",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >{label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function PostsViewer({ rows }) {
  const [mode, setMode] = useState("feed");
  const [period, setPeriod] = useState("today");
  const [sort, setSort] = useState("views");
  const [openId, setOpenId] = useState(null);

  const maxDays = PERIOD_DAYS[period];
  const filtered = rows.filter(r => (r.daysAgo ?? 0) <= maxDays);
  const sorted = [...filtered].sort(SORT_FN[sort]);

  const grouped = {};
  filtered.forEach(r => { (grouped[r.ch] ||= []).push(r); });
  Object.keys(grouped).forEach(ch => grouped[ch].sort(SORT_FN[sort]));
  const channels = Object.keys(grouped);

  return (
    <div>
      {/* 3 dropdown chips */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <DropdownChip id="period" value={period} options={PERIOD_LABEL} onChange={setPeriod} openId={openId} setOpenId={setOpenId} />
        <DropdownChip id="mode"   value={mode}   options={MODE_LABEL}   onChange={setMode}   openId={openId} setOpenId={setOpenId} />
        <DropdownChip id="sort"   value={sort}   options={SORT_LABEL}   onChange={setSort}   openId={openId} setOpenId={setOpenId} />
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11.5, color: "rgba(38,38,51,0.5)", alignSelf: "center" }}>
          {filtered.length} {mode === "group" ? `· ${channels.length} каналов` : "постов"}
        </span>
      </div>

      {filtered.length === 0 && (
        <div style={{
          fontSize: 13, color: "rgba(38,38,51,0.5)", textAlign: "center",
          padding: 32,
        }}>За этот период постов нет</div>
      )}

      {mode === "feed" && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sorted.map((p, i) => <PostCard key={i} p={p} />)}
        </div>
      )}
      {mode === "group" && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {channels.map(ch => (
            <ChannelGroup key={ch} ch={ch} posts={grouped[ch]} />
          ))}
        </div>
      )}
    </div>
  );
}

function ChannelGroup({ ch, posts }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "0 4px 8px",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <span style={{ display: "flex", color: "rgba(38,38,51,0.5)", transform: open ? "" : "rotate(-90deg)", transition: transition.fast }}>
          {ic.chevron}
        </span>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "#262633" }}>@{ch}</span>
        <span style={{ fontSize: 11.5, color: "rgba(38,38,51,0.5)" }}>· {posts.length}</span>
      </div>
      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {posts.map((p, i) => <PostCard key={i} p={p} />)}
        </div>
      )}
    </div>
  );
}

function TextViewerPopup({ item, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(38,38,51,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 560, maxWidth: "100%", maxHeight: "80vh",
          background: color.white,
          borderRadius: 18,
          boxShadow: "0 20px 60px rgba(38,38,51,0.25)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "14px 18px",
          borderBottom: "1px solid rgba(38,38,51,0.06)",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "rgba(122,134,255,0.14)", color: "#7A86FF",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>{ic.text}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 510, color: "#262633", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
            <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>{item.meta} · загрузил(а) ты</div>
          </div>
          <button onClick={onClose} style={{ ...zoomBtn, padding: 6, color: "rgba(38,38,51,0.55)" }}>{ic.close}</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 18 }}>
          <div style={{
            background: "rgba(38,38,51,0.03)",
            borderRadius: 10,
            padding: "14px 16px",
            fontSize: 13.5, color: "#262633", lineHeight: 1.55,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}>{item.body}</div>
        </div>
      </div>
    </div>
  );
}

function AddKbPopup({ onAdd, onClose }) {
  const [over, setOver] = useState(false);
  const [askLink, setAskLink] = useState(false);
  const [askText, setAskText] = useState(false);
  const [linkVal, setLinkVal] = useState("");
  const [textVal, setTextVal] = useState("");
  const [pasteFlash, setPasteFlash] = useState(false);
  const fileRef = useRef(null);

  // Поддержка Cmd/Ctrl+V — вставка картинки или текста из буфера
  useEffect(() => {
    function onPaste(e) {
      // Если открыто текстовое поле — пусть вставка идёт туда обычным образом
      const tag = (e.target?.tagName || "").toLowerCase();
      if ((tag === "input" || tag === "textarea") && askText) return;
      const items = e.clipboardData?.items || [];
      // Картинка из буфера
      for (const it of items) {
        if (it.type?.startsWith("image/")) {
          const file = it.getAsFile();
          if (file) {
            e.preventDefault();
            const named = new File([file], file.name && file.name !== "image.png" ? file.name : `clipboard_${Date.now()}.${(file.type.split("/")[1] || "png")}`, { type: file.type });
            setPasteFlash(true);
            setTimeout(() => setPasteFlash(false), 250);
            handleFiles([named]);
            return;
          }
        }
      }
      // Текст / URL из буфера
      const txt = e.clipboardData?.getData("text")?.trim();
      if (txt) {
        e.preventDefault();
        setPasteFlash(true);
        setTimeout(() => setPasteFlash(false), 250);
        if (/^https?:\/\//i.test(txt) && !/\s/.test(txt)) {
          onAdd({ kind: "link", name: txt, meta: "ссылка" });
        } else {
          const firstLine = txt.split("\n")[0].slice(0, 60) || "Заметка";
          onAdd({ kind: "text", name: firstLine, meta: `${txt.length} симв.`, body: txt });
        }
        onClose();
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [askText]);

  function handleFiles(fileList) {
    Array.from(fileList).forEach(f => {
      const isImg = f.type.startsWith("image/");
      const reader = new FileReader();
      reader.onload = () => {
        onAdd({
          kind: isImg ? "image" : "file",
          name: f.name,
          meta: fmtBytes(f.size),
          mime: f.type,
          data: reader.result,
        });
      };
      reader.readAsDataURL(f);
    });
    onClose();
  }
  function handleDrop(e) {
    e.preventDefault();
    setOver(false);
    if (e.dataTransfer.files?.length) {
      handleFiles(e.dataTransfer.files);
      return;
    }
    const url = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");
    if (url && /^https?:\/\//i.test(url.trim())) {
      onAdd({ kind: "link", name: url.trim(), meta: "ссылка" });
      onClose();
    }
  }
  function addLink() {
    const v = linkVal.trim();
    if (!v) return;
    const url = /^https?:\/\//i.test(v) ? v : "https://" + v;
    onAdd({ kind: "link", name: url, meta: "ссылка" });
    setLinkVal("");
    setAskLink(false);
    onClose();
  }
  function addText() {
    const v = textVal.trim();
    if (!v) return;
    const firstLine = v.split("\n")[0].slice(0, 60) || "Заметка";
    onAdd({ kind: "text", name: firstLine, meta: `${v.length} симв.`, body: v });
    setTextVal("");
    setAskText(false);
    onClose();
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(38,38,51,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 440, maxWidth: "100%",
          background: color.white,
          borderRadius: 18,
          boxShadow: "0 20px 60px rgba(38,38,51,0.25)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center",
          padding: "14px 16px",
          borderBottom: "1px solid rgba(38,38,51,0.06)",
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#262633", flex: 1 }}>
            Добавить в базу знаний
          </span>
          <button onClick={onClose} style={{ ...zoomBtn, padding: 6, color: "rgba(38,38,51,0.55)" }}>
            {ic.close}
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 18 }}>
          <div
            onDragOver={e => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `1.5px dashed ${over || pasteFlash ? "#7A86FF" : "rgba(38,38,51,0.18)"}`,
              background: pasteFlash ? "rgba(122,134,255,0.16)" : over ? "rgba(122,134,255,0.06)" : "rgba(38,38,51,0.02)",
              borderRadius: 12,
              padding: "28px 18px",
              textAlign: "center",
              cursor: "pointer",
              transition: transition.fast,
            }}
          >
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              color: over || pasteFlash ? "#7A86FF" : "rgba(38,38,51,0.55)",
              marginBottom: 10,
            }}>{ic.uploadCloud}</div>
            <div style={{ fontSize: 14, fontWeight: 510, color: "#262633" }}>
              Перетащи файл, картинку или ссылку
            </div>
            <div style={{ fontSize: 12, color: "rgba(38,38,51,0.55)", marginTop: 4 }}>
              кликни, чтобы выбрать с компьютера, или вставь Cmd+V
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            multiple
            onChange={e => { handleFiles(e.target.files); e.target.value = ""; }}
            style={{ display: "none" }}
          />

          {askLink && (
            <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
              <input
                autoFocus
                value={linkVal}
                onChange={e => setLinkVal(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addLink(); if (e.key === "Escape") setAskLink(false); }}
                placeholder="https://..."
                style={{
                  flex: 1, height: 36, padding: "0 12px",
                  background: color.white,
                  border: "1px solid rgba(38,38,51,0.1)",
                  borderRadius: 9,
                  fontSize: 13, color: "#262633",
                  fontFamily: "inherit", outline: "none",
                }}
              />
              <button onClick={addLink} style={{
                height: 36, padding: "0 14px",
                background: "#262633", color: color.white,
                border: "none", borderRadius: 9,
                fontSize: 13, fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit",
              }}>Добавить</button>
            </div>
          )}
          {askText && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
              <textarea
                autoFocus
                value={textVal}
                onChange={e => setTextVal(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addText();
                  if (e.key === "Escape") setAskText(false);
                }}
                placeholder="Вставь или напиши текст…"
                style={{
                  width: "100%", minHeight: 120, padding: "10px 12px",
                  background: color.white,
                  border: "1px solid rgba(38,38,51,0.1)",
                  borderRadius: 9,
                  fontSize: 13, color: "#262633", lineHeight: 1.5,
                  fontFamily: "inherit", outline: "none",
                  resize: "vertical",
                }}
              />
              <button onClick={addText} style={{
                alignSelf: "flex-end",
                height: 36, padding: "0 14px",
                background: "#262633", color: color.white,
                border: "none", borderRadius: 9,
                fontSize: 13, fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit",
              }}>Добавить</button>
            </div>
          )}
          {!askLink && !askText && (
            <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
              <button onClick={() => setAskText(true)} style={smallActionBtn}>
                <span style={{ display: "flex" }}>{ic.text}</span>
                <span>Текст</span>
              </button>
              <button onClick={() => setAskLink(true)} style={smallActionBtn}>
                <span style={{ display: "flex" }}>{ic.link}</span>
                <span>Ссылка</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const smallActionBtn = {
  flex: 1,
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
  height: 36,
  background: color.white,
  border: "1px solid rgba(38,38,51,0.1)",
  borderRadius: 9,
  fontSize: 13, color: "#262633", fontWeight: 500,
  cursor: "pointer", fontFamily: "inherit",
};

// ── Контент КБ (моки по типу) ───────────────────────────────
const KB_CONTENT = {
  "Каналы для парсинга": {
    type: "list",
    editable: "tg",
    rows: [
      { name: "@YakovPartners",            meta: "канал" },
      { name: "@ai_product",               meta: "канал" },
      { name: "@app_growth",               meta: "канал" },
      { name: "@bogdanisssimo",            meta: "канал" },
      { name: "@business_by",              meta: "канал" },
      { name: "@cryptoEssay",              meta: "канал" },
      { name: "@danokhlopkov",             meta: "канал" },
      { name: "@dashalovesstartups",       meta: "канал" },
      { name: "@dimabeseda",               meta: "канал" },
      { name: "@gleb_pro_ai",              meta: "канал" },
      { name: "@gordeyai",                 meta: "канал" },
      { name: "@ict_moscow_ai",            meta: "канал" },
      { name: "@ikspertnaya",              meta: "канал" },
      { name: "@ilya_krasinsky",           meta: "канал" },
      { name: "@its_capitan",              meta: "канал" },
      { name: "@kgrbnv",                   meta: "канал" },
      { name: "@linkedinhero",             meta: "канал" },
      { name: "@machinelearning_interview",meta: "канал" },
      { name: "@marketpsy",                meta: "канал" },
      { name: "@microfounders",            meta: "канал" },
      { name: "@mnk_stories",              meta: "канал" },
      { name: "@neural_prosecco",          meta: "канал" },
      { name: "@pervmarketing",            meta: "канал" },
      { name: "@pohodu_media",             meta: "канал" },
      { name: "@salikov_i",                meta: "канал" },
      { name: "@showstartup",              meta: "канал" },
      { name: "@telega_Rinata",            meta: "канал" },
      { name: "@tvoi_memolog",             meta: "канал" },
      { name: "@vladimir_merkushev",       meta: "канал" },
      { name: "@your_pet_project",         meta: "канал" },
      { name: "@zheleznyak_gi",            meta: "канал" },
    ],
  },
  "Ручные материалы": {
    type: "files",
    rows: [
      { name: "brief_smm_q2.pdf",        meta: "1.2 MB · 2 дня назад" },
      { name: "competitor_audit.xlsx",   meta: "320 KB · 1 неделя"   },
      { name: "voice_examples.md",       meta: "8 KB · 5 дней назад"  },
      { name: "swipe_file_2026.pdf",     meta: "4.5 MB · 2 недели"    },
    ],
  },
  "Tone of voice Mary": {
    type: "text",
    body: "Mary говорит:\n• Просто и без воды — никаких «синергий» и «таргетов»\n• С эмпатией к индихакеру и no-code-разработчику\n• С лёгкой иронией, но без сарказма\n• Конкретные примеры > общие советы\n• Эмодзи редко, только смыслово\n• Длина — 300–800 знаков для ТГ-постов",
  },
  "Контент-план (шаблон)": {
    type: "list",
    rows: [
      { name: "Понедельник",    meta: "Кейс / разбор" },
      { name: "Среда",          meta: "Чек-лист / гайд" },
      { name: "Пятница",        meta: "Тренд / новость с разбором" },
      { name: "Воскресенье",    meta: "Опрос / обсуждение" },
    ],
  },
  "Инсайт-карточки от Ресерчера": {
    type: "cards",
    rows: [
      { title: "Тренд: AI-агенты для SMM", meta: "12 постов конкурентов · хайп" },
      { title: "Boom: no-code запуски",    meta: "8 постов · растущий" },
      { title: "Дискуссия: рилсы vs посты", meta: "15 постов · затухание"  },
      { title: "+ ещё 9 карточек",         meta: "не показаны" },
    ],
  },
  "Утверждённые идеи": {
    type: "cards",
    rows: [
      { title: "Чек-лист: что проверить в SMM-стратегии до запуска", meta: "практика" },
      { title: "Кейс: как мы подняли вовлечённость в ТГ на 40%",     meta: "кейс с цифрами" },
      { title: "Разбор: почему рилсы заходят, а посты нет",          meta: "разбор тренда" },
    ],
  },
  "Примеры лучших постов": {
    type: "cards",
    rows: [
      { title: "5 ошибок в SMM, которые убивают охват", meta: "12.4k охват · 324 реакции" },
      { title: "Как мы выросли с 0 до 50k за 3 месяца", meta: "8.7k охват · 201 реакция"  },
      { title: "+ ещё 22 поста",                        meta: "не показаны"               },
    ],
  },
  "Опубликованные посты": {
    type: "cards",
    rows: [
      { title: "Пост #38 · Чек-лист SMM",   meta: "5 мая · 4.2k охват · ER 6.8%" },
      { title: "Пост #37 · Кейс роста",     meta: "3 мая · 5.8k охват · ER 8.1%" },
      { title: "Пост #36 · Разбор рилсов",  meta: "1 мая · 3.1k охват · ER 4.2%" },
      { title: "+ ещё 35 постов",           meta: "не показаны" },
    ],
  },
  "История метрик": {
    type: "text",
    body: "Средние показатели за квартал:\n• Охват: 4.6k (+18% к предыдущему кварталу)\n• ER: 6.2% (+0.8 п.п.)\n• Подписчиков: +1.2k\n• Лучший пост: #37 (ER 8.1%)\n• Худший пост: #29 (ER 2.3%)",
  },
  "Конкуренты для бенчмарка": {
    type: "list",
    editable: "tg",
    rows: [
      { name: "@marketing_pro",   meta: "12.4k · ER 5.4%" },
      { name: "@growth_hacks",    meta: "8.7k · ER 7.8%"  },
      { name: "@content_kitchen", meta: "6.2k · ER 6.1%"  },
    ],
  },
  // Outputs
  "Идеи постов": {
    type: "cards",
    rows: [
      { title: "Чек-лист SMM",     meta: "практика · апрувнуто" },
      { title: "Кейс роста +40%",  meta: "кейс · апрувнуто" },
      { title: "Разбор рилсов",    meta: "разбор · апрувнуто" },
    ],
  },
  "Концепты": {
    type: "cards",
    rows: [
      { title: "#1 Чек-лист", meta: "хук → 7 пунктов → CTA на гайд" },
      { title: "#2 Кейс",     meta: "крюк → цифры → метод → вывод"   },
      { title: "#3 Разбор",   meta: "тренд → почему → антитренд → mary" },
    ],
  },
  "Готовые тексты": {
    type: "cards",
    rows: [
      { title: "Текст #1 (Чек-лист)",  meta: "638 знаков · готов" },
      { title: "Текст #2 (Кейс)",      meta: "742 знака · в работе" },
      { title: "Текст #3 (Разбор)",    meta: "не начат" },
    ],
  },
  "A/B варианты": {
    type: "cards",
    rows: [
      { title: "Чек-лист · вариант A", meta: "хук про ошибки" },
      { title: "Чек-лист · вариант B", meta: "хук про экономию" },
    ],
  },
  "Обложки постов": {
    type: "list",
    rows: [
      { name: "cover_v1.png", meta: "1080×1080 · оранжевая" },
      { name: "cover_v2.png", meta: "1080×1080 · синяя"     },
      { name: "cover_v3.png", meta: "1080×1080 · фиолетовая" },
    ],
  },
  "Финал": {
    type: "list",
    rows: [
      { name: "post_38_final.png", meta: "1080×1080 · ready to publish" },
    ],
  },
  "Аналитика поста": {
    type: "text",
    body: "Пост #37 «Кейс роста +40%»\n\n• Охват: 5.8k (+12% от среднего)\n• Реакции: 412\n• Комментариев: 28\n• ER: 8.1%\n• Поделились: 47\n• Подписки после: +18\n\nЗашло благодаря конкретным цифрам в первой строке.",
  },
  "Рекомендации на след.": {
    type: "text",
    body: "Что улучшить в следующих постах:\n• Цифры в хук — работает\n• Длинные посты (>700 знаков) теряют 30% охвата\n• Картинки с лицами вовлекают на 22% сильнее\n• Опросы в комментах поднимают ER на 1.5 п.п.\n• Лучшее время паблиша — 10:00–11:00 в будние",
  },
  "Дайджест трендов": {
    type: "text",
    body: "Топ-3 тренда за неделю:\n• AI-агенты для SMM — 12 постов, растёт\n• No-code запуски — 8 постов, растёт\n• Рилсы vs посты — 15 постов, затухает\n\nЧто отбросили:\n• Споры про ИИ-этику (не наша ниша)\n• Истории про увольнения (offtopic)",
  },
  "Свежие посты": {
    type: "posts",
    rows: [
      // Сегодня (0)
      { ch: "neural_prosecco",           id: 4821, daysAgo: 0, time: "сегодня 08:42", text: "OpenAI выкатили новый Realtime API — теперь GPT-4o умеет слушать, говорить и видеть в одной сессии. Latency упала до 320 мс — это уже почти как живой собеседник. Цена 5$/1M токенов ввода.", views: "18.2k", reactions: 412, comments: 67, hasMedia: true  },
      { ch: "ilya_krasinsky",            id: 1208, daysAgo: 0, time: "сегодня 07:15", text: "Маркетинг 2026 — это не «делай рилсы». Это: личный бренд + комьюнити + автоматизация на агентах. Кто залип в 2018-м — будет догонять.", views: "9.4k", reactions: 287, comments: 43, hasMedia: false },
      // Вчера (1)
      { ch: "ai_product",                id: 991,  daysAgo: 1, time: "вчера 19:30", text: "Anthropic запустили Computer Use — Claude может сам кликать по экрану и работать с браузером. Демо: бронирование столика за 4 минуты.", views: "12.8k", reactions: 356, comments: 89, hasMedia: true  },
      { ch: "bogdanisssimo",             id: 433,  daysAgo: 1, time: "вчера 16:42", text: "Indie hackers, которые сделали MRR $10k за полгода в 2026 — почти все на одном паттерне: нишевый AI-tool под конкретную профессию. Не «AI для всех», а «AI для дантистов».", views: "6.2k", reactions: 198, comments: 34, hasMedia: false },
      { ch: "microfounders",             id: 287,  daysAgo: 1, time: "вчера 14:18", text: "Запустил MVP за выходные — лендинг + Stripe + один Claude prompt в бэке. Первая продажа на 3-й день. Стоимость разработки: 0$, только время.", views: "4.7k", reactions: 142, comments: 28, hasMedia: false },
      { ch: "gleb_pro_ai",               id: 612,  daysAgo: 1, time: "вчера 12:05", text: "Сравнил Sonnet 4.6 и GPT-4o на 100 задачах из реальной работы (саммари митингов, кодинг, аналитика данных). Sonnet выигрывает в 73% случаев. Полный отчёт в комментах.", views: "8.1k", reactions: 245, comments: 91, hasMedia: true  },
      { ch: "marketpsy",                 id: 1547, daysAgo: 1, time: "вчера 10:30", text: "Психология ЦА в 2026: люди устали от «продающих» постов. Работает только то, что выглядит как личный опыт. Кейс: переписали 5 постов из «эксперт» в «я попробовал» — ER вырос в 2.4 раза.", views: "5.6k", reactions: 178, comments: 22, hasMedia: false },
      // Позавчера (2)
      { ch: "dashalovesstartups",        id: 821,  daysAgo: 2, time: "2 дня назад", text: "Сходила на питч-сессию 30 AI-стартапов. 27 из 30 — обёртки над Claude/GPT. 3 — реально интересные. Делюсь шорт-листом.", views: "4.3k", reactions: 156, comments: 41, hasMedia: false },
      { ch: "machinelearning_interview", id: 2103, daysAgo: 2, time: "2 дня назад", text: "Большой разбор: как готовиться к ML-собесам в 2026, когда LLM знают всё. Ключ — не зубрить алгоритмы, а уметь объяснять решения и считать unit-economics модели.", views: "11.4k", reactions: 312, comments: 56, hasMedia: true  },
      { ch: "danokhlopkov",              id: 678,  daysAgo: 2, time: "2 дня назад", text: "За 3 года в продукте я видел 100+ growth-экспериментов. Работают 3 из 100. И это нормально. Главное — научиться быстро убивать неработающее.", views: "7.2k", reactions: 224, comments: 38, hasMedia: false },
      // 3-7 (Неделя)
      { ch: "app_growth",                id: 1832, daysAgo: 3, time: "3 дня назад", text: "Топ-5 ASO-фишек 2026: 1) видеообложка обязательна, 2) субтитры в первые 3 сек, 3) локализация на 5 языков минимум, 4) A/B иконки каждые 2 недели, 5) ответы на ВСЕ ревью.", views: "5.8k", reactions: 167, comments: 29, hasMedia: false },
      { ch: "vladimir_merkushev",        id: 412,  daysAgo: 4, time: "4 дня назад", text: "Менеджмент, который реально работает — это меньше митингов и больше письменного контекста. Линеры, ноушены, лупы — всё это инструменты. Главное — культура «писать, не созваниваться».", views: "3.9k", reactions: 134, comments: 24, hasMedia: false },
      { ch: "zheleznyak_gi",             id: 905,  daysAgo: 5, time: "5 дней назад", text: "Как я набрал 50k подписчиков в ТГ за год без рекламы: 1) пишу каждый день, 2) пишу про ниша, в которой топ-5 в стране, 3) комменты под каждым постом, 4) мемы по теме раз в неделю.", views: "13.7k", reactions: 398, comments: 78, hasMedia: true  },
      { ch: "showstartup",               id: 564,  daysAgo: 6, time: "6 дней назад", text: "Проанализировал 200 pitch-deck-ов за 2026 год. Слайд №2 (Problem) убивает 60% инвесторов на старте. Если проблема не понятна за 5 секунд — pitch проигран.", views: "6.5k", reactions: 189, comments: 32, hasMedia: false },
      { ch: "kgrbnv",                    id: 1109, daysAgo: 7, time: "1 неделя",    text: "Сделал side-проект на Cursor + Claude за 2 вечера. Запустил, получил 23 платных юзера за неделю. Цена — 9$/мес. Maintenance — 1 час в неделю.", views: "4.8k", reactions: 156, comments: 47, hasMedia: false },
      // 8-30 (Месяц)
      { ch: "YakovPartners",             id: 778,  daysAgo: 10, time: "10 дней назад", text: "VC-рынок 2026: чек инвестиций сократился на 18%, но количество сделок выросло на 22%. Тренд — ранние раунды и микро-фонды.", views: "9.1k", reactions: 268, comments: 45, hasMedia: false },
      { ch: "tvoi_memolog",              id: 3201, daysAgo: 12, time: "12 дней назад", text: "Когда твой агент впервые сам апрувнул задачу без тебя 🤖", views: "22.4k", reactions: 1240, comments: 134, hasMedia: true },
      { ch: "salikov_i",                 id: 654,  daysAgo: 14, time: "2 недели назад", text: "За 7 лет в дизайне я понял одно: лучшие интерфейсы — это те, которые ты не замечаешь. Если юзеру нужен онбординг — ты проиграл.", views: "7.8k", reactions: 234, comments: 41, hasMedia: false },
      { ch: "your_pet_project",          id: 187,  daysAgo: 18, time: "18 дней назад", text: "Запустил pet-project в декабре, забыл про него на 4 месяца, зашёл — 312 платных подписок $5/мес. Урок: иногда лучшее, что можешь сделать со своим продуктом — оставить его в покое.", views: "16.3k", reactions: 521, comments: 87, hasMedia: false },
      { ch: "pohodu_media",              id: 928,  daysAgo: 22, time: "3 недели назад", text: "Контент-маркетинг 2026: TG-каналы заменили блоги, рилсы заменили YouTube, Substack заменил рассылки. А podcasts всё там же — 5% аудитории, 0.5% дохода.", views: "5.4k", reactions: 178, comments: 33, hasMedia: false },
      { ch: "linkedinhero",              id: 1455, daysAgo: 28, time: "месяц назад",   text: "LinkedIn algorithm change: посты с 1-3 хэштегами получают +40% impressions vs 5+. Качество > количество. Запостил, дождался первых 10 комментов — алгоритм даёт +120% reach.", views: "8.6k", reactions: 298, comments: 52, hasMedia: false },
      // Архив 30+
      { ch: "ict_moscow_ai",             id: 412,  daysAgo: 45, time: "1.5 месяца назад", text: "Москва запустила пилот: 50 школ — учителя используют AI-агентов для проверки сочинений. Время проверки сократилось в 4 раза, качество (по двойному аудиту) — выше человеческого.", views: "11.2k", reactions: 387, comments: 96, hasMedia: true  },
      { ch: "gordeyai",                  id: 209,  daysAgo: 65, time: "2 месяца назад",   text: "Думал собрать AI-фреймворк сам — оказалось проще написать обёртку над Claude SDK на 200 строк. 90% сложности AI-проектов это не модель, а данные и UX.", views: "6.8k", reactions: 187, comments: 28, hasMedia: false },

      // Дополнительно — Сегодня
      { ch: "ai_product",                id: 1002, daysAgo: 0, time: "сегодня 10:18", text: "Apple Intelligence добавили нативный API для агентов в iOS 19. Можно запускать действия в любом приложении голосом — Calendar, Notes, Mail и любые third-party. Анонс с WWDC.", views: "24.6k", reactions: 587, comments: 142, hasMedia: true  },
      { ch: "telega_Rinata",             id: 711,  daysAgo: 0, time: "сегодня 09:55", text: "Опросил 50 фаундеров: какой инструмент сильнее всего изменил их работу в 2026? Топ-3: 1) Cursor (28), 2) Claude Sonnet (22), 3) Linear AI (19).", views: "5.7k", reactions: 178, comments: 31, hasMedia: false },
      { ch: "cryptoEssay",               id: 489,  daysAgo: 0, time: "сегодня 09:12", text: "Crypto + AI = новый narrative. Tokens of agent platforms за неделю выросли в среднем на 38%. Самые активные: Bittensor, Fetch, Render.", views: "8.3k", reactions: 234, comments: 56, hasMedia: false },
      { ch: "pervmarketing",             id: 1841, daysAgo: 0, time: "сегодня 08:30", text: "Реклама в ТГ 2026: средний CPM в нишевых каналах — 480₽, в массовых — 240₽. Но конверсия в нишевых в 4-5 раз выше. Считайте CAC, а не клики.", views: "4.2k", reactions: 145, comments: 28, hasMedia: false },

      // Дополнительно — Вчера
      { ch: "dimabeseda",                id: 624,  daysAgo: 1, time: "вчера 22:10", text: "Год работы remote: 320 митингов, 1200 PR-ов, 8 продуктов. Главный инсайт — деление команды на «делает» и «решает» убивает skill-set обоих.", views: "6.9k", reactions: 215, comments: 47, hasMedia: false },
      { ch: "its_capitan",               id: 388,  daysAgo: 1, time: "вчера 18:42", text: "Капитанский совет: если ты Product Owner и не можешь объяснить новому стажёру свой роадмап за 5 минут — у тебя не роадмап, а wishlist.", views: "5.1k", reactions: 167, comments: 34, hasMedia: false },
      { ch: "ikspertnaya",               id: 1156, daysAgo: 1, time: "вчера 15:18", text: "Эксперт-маркетинг сдох в 2024-м. То, что работает в 2026: «делюсь, потому что сама пробую». Обзоры > советы.", views: "4.6k", reactions: 156, comments: 22, hasMedia: false },
      { ch: "linkedinhero",              id: 1502, daysAgo: 1, time: "вчера 13:30", text: "LinkedIn: новая фича Comment Boost — посты с >50 комментов в первые 30 минут получают +400% reach. Попросите комьюнити поддержать в первые часы.", views: "9.8k", reactions: 312, comments: 78, hasMedia: false },
      { ch: "mnk_stories",               id: 822,  daysAgo: 1, time: "вчера 11:00", text: "История от подписчика: 2 года работал в найме на 250к, ушёл в свой проект на $500/мес. Через год — $14k MRR. Главный страх — съехать с ипотеки — оказался необоснованным.", views: "12.1k", reactions: 423, comments: 89, hasMedia: true  },

      // Дополнительно — 2 дня
      { ch: "salikov_i",                 id: 712,  daysAgo: 2, time: "2 дня назад", text: "Дизайн-системы 2026: variables в Figma + Tokens Studio + автоматическая синхронизация в Tailwind. Время от изменения цвета в Figma до прода — 30 минут.", views: "5.3k", reactions: 189, comments: 36, hasMedia: false },
      { ch: "your_pet_project",          id: 195,  daysAgo: 2, time: "2 дня назад", text: "Запустил pet ровно неделю назад. Метрики: 1.2k посещений, 87 регистраций, 14 платных подписок ($5/мес). CAC = 0₽ (только TG), MRR = $70. Доволен.", views: "7.8k", reactions: 256, comments: 45, hasMedia: false },
      { ch: "machinelearning_interview", id: 2118, daysAgo: 2, time: "2 дня назад", text: "Топ-10 ошибок в ML-инфраструктуре, которые видели на собесах в 2026: 1) пайплайн без версионирования данных, 2) нет мониторинга drift, 3) фичи на боевом контуре считаются по-другому. Полный список — в комментах.", views: "10.5k", reactions: 287, comments: 92, hasMedia: false },

      // Дополнительно — 3-7 дней (Неделя)
      { ch: "marketpsy",                 id: 1561, daysAgo: 3, time: "3 дня назад", text: "Когнитивная дешёвая ловушка: «я подпишусь, потом разберусь». 80% подписок на каналы > 6 месяцев — это просто шум в подписках. Делайте регулярную чистку.", views: "4.9k", reactions: 167, comments: 28, hasMedia: false },
      { ch: "bogdanisssimo",             id: 451,  daysAgo: 4, time: "4 дня назад", text: "Запустил No-Code MVP на Cursor — построил, развернул, нашёл первого юзера за 6 часов. Раньше на это уходили недели. Главный навык 2026 — не программирование, а постановка задач.", views: "6.7k", reactions: 224, comments: 41, hasMedia: false },
      { ch: "ai_product",                id: 1015, daysAgo: 5, time: "5 дней назад", text: "Тренд: AI Personality Layer — компании добавляют «характер» к своим LLM-ассистентам. Notion AI стал «друг», Linear AI — «строгий менеджер». UX через personality.", views: "8.4k", reactions: 256, comments: 53, hasMedia: true  },
      { ch: "showstartup",               id: 578,  daysAgo: 6, time: "6 дней назад", text: "Что отличает успешный pitch от провального: не идея, не команда, не traction. А способность фаундера за 30 секунд объяснить, почему именно сейчас, именно эта команда, именно эта проблема.", views: "5.6k", reactions: 178, comments: 32, hasMedia: false },
      { ch: "pohodu_media",              id: 941,  daysAgo: 7, time: "1 неделя",     text: "Контент-маркетинг 2026: один длинный лонгрид > 10 коротких постов. Глубокие материалы цитируют, в них возвращаются, на них ссылаются. Короткие — пролистывают.", views: "4.3k", reactions: 145, comments: 24, hasMedia: false },

      // Дополнительно — 8-30 дней (Месяц)
      { ch: "neural_prosecco",           id: 4795, daysAgo: 11, time: "11 дней назад", text: "Anthropic выкатили Claude Memory — модель помнит контекст между сессиями. Можно построить персонального помощника, который реально знает историю общения. Цена памяти — отдельный пул токенов.", views: "16.8k", reactions: 489, comments: 102, hasMedia: true  },
      { ch: "tvoi_memolog",              id: 3245, daysAgo: 15, time: "2 недели",     text: "Ребрендинг 2026: «AI стартап» теперь звучит как «дотком стартап» в 2002. Все они есть. Ищите тех, кто говорит «agentic platform» или «autonomous workflow».", views: "18.2k", reactions: 712, comments: 124, hasMedia: false },
      { ch: "vladimir_merkushev",        id: 442,  daysAgo: 19, time: "19 дней назад", text: "Корпоративная этика 2026: использование AI для работы — норма. Но скрывать это перед заказчиком — токсично. Открытость = доверие. Прозрачность = премиум-цена.", views: "4.7k", reactions: 156, comments: 31, hasMedia: false },
      { ch: "kgrbnv",                    id: 1145, daysAgo: 24, time: "3.5 недели",   text: "Запустил агентскую систему, заменил 3 человека из команды. Освободил $18k/мес. Заработал $0 — всё ушло на токены и мониторинг. Реальная экономия — внимание, а не деньги.", views: "7.2k", reactions: 234, comments: 48, hasMedia: false },
      { ch: "danokhlopkov",              id: 695,  daysAgo: 27, time: "месяц назад",  text: "Лучший Growth-эксперимент 2025-го у нас: убрали онбординг полностью. Конверсия в paid выросла на 23%. Иногда меньше — больше.", views: "8.6k", reactions: 287, comments: 56, hasMedia: false },

      // Дополнительно — Архив 30+
      { ch: "YakovPartners",             id: 821,  daysAgo: 38, time: "1.3 месяца",  text: "Q1 2026 в venture: $42B, deals 2840. AI/agents забрали 38% всего объёма. SaaS classic упал до 12%. Видеть в физическом b2b — реально новая ниша.", views: "13.4k", reactions: 412, comments: 87, hasMedia: true  },
      { ch: "ilya_krasinsky",            id: 1188, daysAgo: 52, time: "1.7 месяца",  text: "Маркетинг как когнитивная архитектура: что в голове клиента, когда он видит твой бренд? Это не «awareness», это слой смыслов. И он строится годами.", views: "7.9k", reactions: 245, comments: 38, hasMedia: false },
      { ch: "microfounders",             id: 312,  daysAgo: 78, time: "2.5 месяца",  text: "Микробизнес 2026: 1 человек, $5-30k MRR, 0-1 сотрудников. Это новая золотая середина. Не unicorn, не лайфстайл — просто умная экономия скейла.", views: "11.7k", reactions: 356, comments: 67, hasMedia: false },
    ],
  },
  "Инсайт-карточки тем": {
    type: "cards",
    rows: [
      { title: "AI-агенты для SMM",      meta: "хайп · 12 постов" },
      { title: "No-code запуски",        meta: "растёт · 8 постов" },
      { title: "Рилсы vs посты",         meta: "затухает · 15 постов" },
      { title: "+ ещё 9 карточек",       meta: "не показаны" },
    ],
  },
};

function normalizeTgUsername(input) {
  let s = (input || "").trim();
  s = s.replace(/^https?:\/\//, "").replace(/^t\.me\//, "").replace(/^@/, "");
  s = s.replace(/[^a-zA-Z0-9_]/g, "");
  return s ? "@" + s : "";
}

function EditableTgList({ initialRows }) {
  const [rows, setRows] = useState(initialRows);
  const [draft, setDraft] = useState("");
  const [hoverIdx, setHoverIdx] = useState(-1);

  function add() {
    const u = normalizeTgUsername(draft);
    if (!u) return;
    if (rows.some(r => r.name === u)) { setDraft(""); return; }
    setRows([...rows, { name: u, meta: "новый" }]);
    setDraft("");
  }
  function remove(i) {
    setRows(rows.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      {/* Add input */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
          placeholder="@username или t.me/username"
          style={{
            flex: 1, height: 36,
            padding: "0 12px",
            background: color.white,
            border: "1px solid rgba(38,38,51,0.1)",
            borderRadius: 9,
            fontSize: 13, color: "#262633",
            fontFamily: "inherit", outline: "none",
          }}
        />
        <button
          onClick={add}
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            height: 36, padding: "0 14px",
            background: "#262633", color: color.white,
            border: "none", borderRadius: 9,
            fontSize: 13, fontWeight: 500,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >+ Добавить</button>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {rows.length === 0 && (
          <div style={{ fontSize: 13, color: "rgba(38,38,51,0.5)", textAlign: "center", padding: "24px 0" }}>
            Список пуст. Добавь первый канал.
          </div>
        )}
        {rows.map((r, i) => {
          const u = r.name.replace(/^@/, "");
          return (
            <div
              key={i}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(-1)}
              style={drawerRow}
            >
              <a
                href={`https://t.me/${u}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  flex: 1, minWidth: 0,
                  textDecoration: "none", color: "inherit",
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "rgba(63,149,255,0.12)", color: "#3F95FF",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>{ic.paperPlane}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 510, color: "#262633" }}>{r.name}</div>
                  {r.meta && <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>{r.meta}</div>}
                </div>
              </a>
              <button
                onClick={() => remove(i)}
                title="Удалить"
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 28, height: 28,
                  background: "transparent", border: "none", borderRadius: 7,
                  cursor: "pointer", color: "#FF3407",
                  opacity: hoverIdx === i ? 1 : 0,
                  transition: transition.fast,
                  fontFamily: "inherit",
                }}
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KbPopup({ item, onClose }) {
  const data = KB_CONTENT[item.title];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(38,38,51,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100,
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 520, maxWidth: "100%", maxHeight: "80vh",
          background: color.white,
          borderRadius: 18,
          boxShadow: "0 20px 60px rgba(38,38,51,0.25)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "16px 18px",
          borderBottom: "1px solid rgba(38,38,51,0.06)",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: item.agent.color + "1A", color: item.agent.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>{ic.book}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#262633" }}>{item.title}</div>
            <div style={{ fontSize: 12, color: "rgba(38,38,51,0.55)", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: item.agent.color }} />
              <span>{item.agent.label}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ ...zoomBtn, padding: 6, color: "rgba(38,38,51,0.55)" }}>
            {ic.close}
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 18 }}>
          {!data && (
            <div style={{ fontSize: 13, color: "rgba(38,38,51,0.55)", textAlign: "center", padding: "24px 0" }}>
              Содержимое ещё не подгружено
            </div>
          )}
          {data?.type === "text" && (
            <div style={{
              fontSize: 13.5, color: "#262633", lineHeight: 1.55,
              whiteSpace: "pre-wrap",
              padding: "12px 14px",
              background: "rgba(38,38,51,0.03)",
              borderRadius: 10,
            }}>{data.body}</div>
          )}
          {data?.type === "list" && data?.editable === "tg" && (
            <EditableTgList initialRows={data.rows} />
          )}
          {(data?.type === "list" || data?.type === "files") && !data?.editable && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {data.rows.map((r, i) => (
                <div key={i} style={drawerRow}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: "rgba(38,38,51,0.04)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "rgba(38,38,51,0.5)", flexShrink: 0,
                  }}>{data.type === "files" ? ic.file : (
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: "currentColor" }} />
                  )}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 510, color: "#262633" }}>{r.name}</div>
                    {r.meta && <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>{r.meta}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {data?.type === "posts" && <PostsViewer rows={data.rows} />}
          {data?.type === "cards" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.rows.map((r, i) => (
                <div key={i} style={{
                  background: color.white,
                  border: "1px solid rgba(38,38,51,0.08)",
                  borderRadius: 10,
                  padding: "10px 12px",
                }}>
                  <div style={{ fontSize: 13, fontWeight: 510, color: "#262633" }}>{r.title}</div>
                  {r.meta && <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 3 }}>{r.meta}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 18px",
          borderTop: "1px solid rgba(38,38,51,0.06)",
          display: "flex", gap: 8,
        }}>
          <button style={{
            flex: 1, height: 36,
            background: "#262633", color: color.white,
            border: "none", borderRadius: 9,
            fontSize: 13, fontWeight: 500,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            Открыть в чате с {item.agent.label}
          </button>
          <button style={{
            height: 36, padding: "0 14px",
            background: color.white, color: "#262633",
            border: "1px solid rgba(38,38,51,0.12)",
            borderRadius: 9,
            fontSize: 13, fontWeight: 500,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            Редактировать
          </button>
        </div>
      </div>
    </div>
  );
}

function PeopleContent() {
  const [tab, setTab] = useState("all");
  const [profile, setProfile] = useState(null);
  const people = usePeople();
  const source = people.length > 0 ? people : MOCK_PEOPLE;
  const list = tab === "approvers" ? source.filter(p => p.role === "approver") : source;
  return (
    <>
      <div style={{ display: "flex", gap: 4, padding: "0 0 12px" }}>
        <FilterChip label="Все"      active={tab === "all"}       onClick={() => setTab("all")} />
        <FilterChip label="Апруверы" active={tab === "approvers"} onClick={() => setTab("approvers")} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {list.map(p => (
          <div
            key={p.id}
            onClick={() => setProfile(p)}
            style={{ ...drawerRow, cursor: "pointer" }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: p.color + "26", color: p.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              fontSize: 13, fontWeight: 600,
              overflow: "hidden",
            }}>
              {p.avatar
                ? <img src={p.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : p.name.split(" ").map(s => s[0]).join("").slice(0, 2)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 450, color: "#262633" }}>{p.name}</span>
                {p.role === "approver" && (
                  <span style={{
                    fontSize: 10, fontWeight: 500,
                    color: "#FF8B3D",
                    background: "rgba(255,139,61,0.12)",
                    padding: "1px 6px", borderRadius: 999,
                  }}>Апрувер</span>
                )}
              </div>
              <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>
                {p.title} · {p.handle}
              </div>
            </div>
          </div>
        ))}
      </div>
      {profile && <ProfilePopup person={profile} onClose={() => setProfile(null)} />}
    </>
  );
}

function ProfilePopup({ person, onClose }) {
  const [mode, setMode] = useState("view"); // "view" | "message"
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  function send() {
    if (!text.trim()) return;
    setSent(true);
    setTimeout(onClose, 1200);
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(38,38,51,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 440, maxWidth: "100%",
          background: color.white,
          borderRadius: 18,
          boxShadow: "0 20px 60px rgba(38,38,51,0.25)",
          overflow: "hidden",
        }}
      >
        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center",
          padding: "10px 12px",
          borderBottom: "1px solid rgba(38,38,51,0.06)",
        }}>
          {mode === "message" ? (
            <button
              onClick={() => { setMode("view"); setText(""); setSent(false); }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                background: "transparent", border: "none", padding: "6px 8px",
                fontSize: 13, color: "rgba(38,38,51,0.6)",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Профиль
            </button>
          ) : <span />}
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={{ ...zoomBtn, padding: 6, color: "rgba(38,38,51,0.55)" }}>{ic.close}</button>
        </div>

        {mode === "view" && (
          <>
            {/* Profile head */}
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "16px 18px 18px",
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: person.color + "26", color: person.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, fontWeight: 600,
                overflow: "hidden",
                marginBottom: 12,
              }}>
                {person.avatar
                  ? <img src={person.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : person.name.split(" ").map(s => s[0]).join("").slice(0, 2)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 510, color: "#262633" }}>{person.name}</span>
                {person.role === "approver" && (
                  <span style={{
                    fontSize: 10.5, fontWeight: 500,
                    color: "#FF8B3D",
                    background: "rgba(255,139,61,0.12)",
                    padding: "2px 7px", borderRadius: 999,
                  }}>Апрувер</span>
                )}
              </div>
              <div style={{ fontSize: 13, color: "rgba(38,38,51,0.6)", marginTop: 4 }}>{person.title}</div>
              <div style={{ fontSize: 12.5, color: "rgba(38,38,51,0.5)", marginTop: 2 }}>{person.handle}</div>
            </div>

            {/* Meta rows */}
            <div style={{
              padding: "0 18px 14px",
              display: "flex", flexDirection: "column", gap: 6,
            }}>
              <div style={profileMetaRow}>
                <span style={profileMetaLabel}>В команде</span>
                <span style={profileMetaValue}>с {person.joined}</span>
              </div>
              <div style={profileMetaRow}>
                <span style={profileMetaLabel}>Активность</span>
                <span style={profileMetaValue}>{person.lastActive}</span>
              </div>
              <div style={profileMetaRow}>
                <span style={profileMetaLabel}>Роль</span>
                <span style={profileMetaValue}>{person.role === "approver" ? "Апрувер" : "Сотрудник"}</span>
              </div>
            </div>

            {/* Actions */}
            {!person.isMe && (
              <div style={{
                padding: "12px 18px 18px",
                borderTop: "1px solid rgba(38,38,51,0.06)",
                display: "flex", gap: 8,
              }}>
                <button
                  onClick={() => setMode("message")}
                  style={{
                    flex: 1, height: 38,
                    background: "#262633", color: color.white,
                    border: "none", borderRadius: 10,
                    fontSize: 13.5, fontWeight: 500,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >Написать сообщение</button>
                <button
                  style={{
                    height: 38, padding: "0 14px",
                    background: color.white, color: "#262633",
                    border: "1px solid rgba(38,38,51,0.12)",
                    borderRadius: 10,
                    fontSize: 13.5, fontWeight: 500,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >{person.role === "approver" ? "Снять апрувера" : "Сделать апрувером"}</button>
                <button
                  title="Удалить из команды"
                  style={{
                    height: 38, width: 38,
                    background: color.white, color: "#FF3407",
                    border: "1px solid rgba(255,52,7,0.2)",
                    borderRadius: 10,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}

        {mode === "message" && (
          <>
            {/* Compact recipient */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px 14px" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: person.color + "26", color: person.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 600, overflow: "hidden", flexShrink: 0,
              }}>
                {person.avatar
                  ? <img src={person.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : person.name.split(" ").map(s => s[0]).join("").slice(0, 2)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 510, color: "#262633" }}>{person.name}</div>
                <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)" }}>уйдёт во Входящие</div>
              </div>
            </div>

            <div style={{ padding: "0 18px" }}>
              {sent ? (
                <div style={{ padding: "32px 0", textAlign: "center", fontSize: 14, color: "#262633" }}>
                  Сообщение отправлено в Входящие <b>{person.name.split(" ")[0]}</b>
                </div>
              ) : (
                <textarea
                  autoFocus
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(); }}
                  placeholder={`Сообщение для ${person.name.split(" ")[0]}…`}
                  style={{
                    width: "100%", minHeight: 140, padding: "12px 14px",
                    background: color.white,
                    border: "1px solid rgba(38,38,51,0.1)",
                    borderRadius: 12,
                    fontSize: 14, color: "#262633", lineHeight: 1.5,
                    fontFamily: "inherit", outline: "none", resize: "vertical",
                  }}
                />
              )}
            </div>

            {!sent && (
              <div style={{
                display: "flex", justifyContent: "flex-end", gap: 8,
                padding: "14px 18px 18px",
              }}>
                <button onClick={() => setMode("view")} style={{
                  height: 36, padding: "0 14px",
                  background: color.white, color: "#262633",
                  border: "1px solid rgba(38,38,51,0.12)",
                  borderRadius: 9,
                  fontSize: 13, fontWeight: 500,
                  cursor: "pointer", fontFamily: "inherit",
                }}>Отмена</button>
                <button onClick={send} disabled={!text.trim()} style={{
                  height: 36, padding: "0 16px",
                  background: text.trim() ? "#262633" : "rgba(38,38,51,0.3)",
                  color: color.white,
                  border: "none", borderRadius: 9,
                  fontSize: 13, fontWeight: 500,
                  cursor: text.trim() ? "pointer" : "not-allowed",
                  fontFamily: "inherit",
                }}>Отправить</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const profileMetaRow = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "8px 12px",
  background: "rgba(38,38,51,0.03)",
  borderRadius: 9,
  fontSize: 12.5,
};
const profileMetaLabel = { color: "rgba(38,38,51,0.5)" };
const profileMetaValue = { color: "#262633", fontWeight: 450 };

function SendMessagePopup({ person, onClose }) {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  function send() {
    if (!text.trim()) return;
    setSent(true);
    setTimeout(onClose, 1200);
  }
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(38,38,51,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 480, maxWidth: "100%",
          background: color.white,
          borderRadius: 18,
          boxShadow: "0 20px 60px rgba(38,38,51,0.25)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "16px 18px",
          borderBottom: "1px solid rgba(38,38,51,0.06)",
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: person.color + "26", color: person.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, fontSize: 14, fontWeight: 600,
            overflow: "hidden",
          }}>
            {person.avatar
              ? <img src={person.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : person.name.split(" ").map(s => s[0]).join("").slice(0, 2)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 510, color: "#262633" }}>{person.name}</div>
            <div style={{ fontSize: 12, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>
              {person.title} · {person.handle}
            </div>
          </div>
          <button onClick={onClose} style={{ ...zoomBtn, padding: 6, color: "rgba(38,38,51,0.55)" }}>{ic.close}</button>
        </div>

        {/* Body */}
        <div style={{ padding: 18 }}>
          {sent ? (
            <div style={{
              padding: "32px 12px", textAlign: "center",
              fontSize: 14, color: "#262633",
            }}>
              Сообщение отправлено в Входящие <b>{person.name.split(" ")[0]}</b>
            </div>
          ) : (
            <textarea
              autoFocus
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(); }}
              placeholder={`Сообщение для ${person.name.split(" ")[0]}…`}
              style={{
                width: "100%", minHeight: 140, padding: "12px 14px",
                background: color.white,
                border: "1px solid rgba(38,38,51,0.1)",
                borderRadius: 12,
                fontSize: 14, color: "#262633", lineHeight: 1.5,
                fontFamily: "inherit", outline: "none", resize: "vertical",
              }}
            />
          )}
        </div>

        {/* Footer */}
        {!sent && (
          <div style={{
            display: "flex", justifyContent: "flex-end", gap: 8,
            padding: "0 18px 18px",
          }}>
            <button onClick={onClose} style={{
              height: 36, padding: "0 14px",
              background: color.white, color: "#262633",
              border: "1px solid rgba(38,38,51,0.12)",
              borderRadius: 9,
              fontSize: 13, fontWeight: 500,
              cursor: "pointer", fontFamily: "inherit",
            }}>Отмена</button>
            <button onClick={send} disabled={!text.trim()} style={{
              height: 36, padding: "0 16px",
              background: text.trim() ? "#262633" : "rgba(38,38,51,0.3)",
              color: color.white,
              border: "none", borderRadius: 9,
              fontSize: 13, fontWeight: 500,
              cursor: text.trim() ? "pointer" : "not-allowed",
              fontFamily: "inherit",
            }}>Отправить</button>
          </div>
        )}
      </div>
    </div>
  );
}

function IntegrationsContent() {
  // Агрегируем уникальные интеграции из всех агентов
  const map = new Map();
  AGENTS.forEach(a => {
    (a.integrations || []).forEach(it => {
      if (!map.has(it.name)) {
        map.set(it.name, { ...it, agents: [a] });
      } else {
        const ex = map.get(it.name);
        ex.agents.push(a);
        if (it.on) ex.on = true;
      }
    });
  });
  const list = Array.from(map.values());
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {list.map((it, i) => {
        const logo = INTEGRATION_LOGOS[it.name];
        return (
        <div key={i} style={drawerRow}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: "rgba(38,38,51,0.04)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(38,38,51,0.6)", flexShrink: 0,
            overflow: "hidden",
            padding: 4,
          }}>
            {logo
              ? <img src={logo} alt={it.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              : ic.integrations}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 450, color: "#262633" }}>{it.name}</div>
            <div style={{ fontSize: 11.5, color: "rgba(38,38,51,0.55)", marginTop: 2 }}>{it.desc}</div>
          </div>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 11.5, fontWeight: 400,
            color: it.on ? "rgba(38,38,51,0.55)" : "rgba(38,38,51,0.4)",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: it.on ? "#34C759" : "rgba(38,38,51,0.25)",
            }} />
            {it.on ? "Активна" : "Выкл"}
          </span>
        </div>
        );
      })}
    </div>
  );
}

const INTEGRATION_LOGOS = {
  "Telegram":      "/integrations/telegram.jpg",
  "Figma":         "/integrations/figma.webp",
  "Google Sheets": "/integrations/sheets.png",
};

function AgentsContent({ selected, onSelect }) {
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

function AgentDetail({ a, onBack }) {
  const [chatHistory, setChatHistory] = useState(true);
  const [showInChat, setShowInChat] = useState(true);
  const [showSources, setShowSources] = useState(true);
  const [continueOnError, setContinueOnError] = useState(false);
  const [writeHistory, setWriteHistory] = useState(true);

  // ── Реальный профиль агента с бэка + autosave (заменяет FakeSelect) ──
  const [profile, setProfile] = useState({
    model: a.model || "claude-sonnet-4-6",
    systemPrompt: "",
    tools: a.tools || [],
    responseFormat: "text",
    memory: "short",
  });
  const [savedAt, setSavedAt] = useState(null);
  // UI-only поля (нет в backend) — сохраняем в localStorage
  const [reasoning, setReasoning] = useState(() => localStorage.getItem(`agent-${a.id}-reasoning`) || "medium");
  const [verbosity, setVerbosity] = useState(() => localStorage.getItem(`agent-${a.id}-verbosity`) || "medium");
  const [summary, setSummary] = useState(() => localStorage.getItem(`agent-${a.id}-summary`) || "auto");

  // Загрузить актуальный профиль с бэка
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

  // Debounced PATCH при изменениях profile (кроме первого монтирования)
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

  // Сохраняем reasoning/verbosity/summary в localStorage
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
      {/* Header */}
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

      {/* Description */}
      <div style={{
        padding: "12px 18px",
        fontSize: 12, color: "rgba(38,38,51,0.6)",
        lineHeight: 1.4,
        borderBottom: "1px solid rgba(38,38,51,0.06)",
      }}>
        {a.role}
      </div>

      {/* Form */}
      <div style={{ padding: "14px 18px 96px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Имя */}
        <FormField label="Имя">
          <FormInput value={a.label + " Mary"} />
        </FormField>

        {/* Скиллы */}
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

        {/* История чата */}
        <FormRow label="История чата">
          <Toggle on={chatHistory} onClick={() => setChatHistory(v => !v)} />
        </FormRow>

        {/* Модель */}
        <FormRow label="Модель">
          <RealSelect value={profile.model} onChange={v => setProfile(p => ({ ...p, model: v }))} options={MODELS} />
        </FormRow>

        {/* Уровень рассуждений (UI-only, localStorage) */}
        <FormRow label="Уровень рассуждений">
          <RealSelect value={reasoning} onChange={setReasoning}
            options={["low", "medium", "high"]} labels={{ low: "Низкий", medium: "Средний", high: "Высокий" }} />
        </FormRow>

        {/* Системный промпт */}
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

        {/* Инструменты — реальный multi-toggle */}
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

        {/* Формат ответа */}
        <FormRow label="Формат ответа">
          <RealSelect value={profile.responseFormat} onChange={v => setProfile(p => ({ ...p, responseFormat: v }))}
            options={["text", "json"]} labels={{ text: "Текст", json: "JSON" }} />
        </FormRow>

        {/* Память (реальное поле) */}
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

      {/* Sticky action bar */}
      <div style={{
        position: "sticky", bottom: 0,
        background: color.white,
        borderTop: "1px solid rgba(38,38,51,0.08)",
        padding: "10px 14px",
        display: "flex", alignItems: "center", gap: 8,
        boxShadow: "0 -4px 12px rgba(38,38,51,0.04)",
      }}>
        {/* Save status */}
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

// ── Tabs контента для AgentDetail ──────────────────────────
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
      {/* Inputs */}
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

      {/* Outputs */}
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

// ── Form atoms ──────────────────────────────────────────────
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

const drawerRow = {
  display: "flex", alignItems: "center", gap: 10,
  padding: "10px 12px",
  borderRadius: 10,
  background: "rgba(38,38,51,0.025)",
};

// ── Страница «База знаний» ──────────────────────────────────
function KbPage({ kbUserItems = [], setKbUserItems, onOpenChat }) {
  // Активный раздел дерева: "company" | "smm" | "smm/tg-kanal" | "smm/inst" | "hr"
  const [scope, setScope] = useState("smm/tg-kanal");
  const [smmOpen, setSmmOpen] = useState(true);
  const [hrOpen, setHrOpen] = useState(false);
  const [folder, setFolder] = useState("all"); // тип материала
  const [source, setSource] = useState("all"); // "all" | "user" | "agents"
  const [search, setSearch] = useState("");
  const [opened, setOpened] = useState(null);
  const [textView, setTextView] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

  // Все агентские материалы (плоско)
  const agentItems = AGENTS.flatMap(a => {
    const inputs  = (a.kb?.inputs  || []).map(it => ({ ...it, agent: a, source: "input"  }));
    const outputs = (a.kb?.outputs || []).map(it => ({ ...it, agent: a, source: "output" }));
    return [...inputs, ...outputs];
  });
  const userItems = kbUserItems.map(it => ({ ...it, source: "user" }));
  const all = [...userItems, ...agentItems];

  // Фильтр по разделу — пока всё, что есть, относится к smm/tg-kanal.
  // hr и smm/inst — пустые placeholder'ы.
  function matchScope(it) {
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

  // Подсчёты для шапки фильтра (по текущему scope)
  const scoped = all.filter(matchScope);
  const counts = {
    all:    scoped.length,
    user:   scoped.filter(it => it.source === "user").length,
    agents: scoped.filter(it => it.source !== "user").length,
  };
  // Подсчёты для типов (по scope + source)
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
    { id: "all",   label: "Все материалы", icon: ic.kb,    count: folderCounts.all },
    { id: "image", label: "Фото",          icon: ic.image, count: folderCounts.image },
    { id: "file",  label: "Файлы",         icon: ic.file,  count: folderCounts.file },
    { id: "link",  label: "Ссылки",        icon: ic.link,  count: folderCounts.link },
    { id: "text",  label: "Тексты",        icon: ic.text,  count: folderCounts.text },
    { id: "video", label: "Видео",         icon: ic.mediaPic, count: folderCounts.video, dim: folderCounts.video === 0 },
    { id: "audio", label: "Аудио",         icon: ic.mic,   count: folderCounts.audio, dim: folderCounts.audio === 0 },
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
      {/* Вторичный сайдбар: папки/отделы */}
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
        {/* Раздел: Компания */}
        <KbTreeRow
          icon={ic.kb}
          label="Компания"
          active={scope === "company"}
          onClick={() => setScope("company")}
          weight={500}
        />
        {/* СММ-отдел (раскрываемый) */}
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
        {/* HR-отдел (раскрываемый, пока пусто) */}
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

        {/* Разделитель + типы материалов (фильтр поверх scope) */}
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

      {/* Main: список материалов */}
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
        {/* Фильтр по источнику */}
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

      {/* Мини-чат «Спросить у Mary» по центру снизу */}
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
    </div>
  );
}

function KbTreeRow({ icon, label, indent = 0, active, dim, onClick, trailing, weight = 450 }) {
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

function KbCard({ it, onOpen }) {
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

// ── Корневой компонент ──────────────────────────────────────
export default function TgKanalPage() {
  const [smmOpen, setSmmOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("page") || "tg-kanal"
  ); // "tg-kanal" | "kb" | "integrations" | "tasks" | "chat-mary" | "home" | "inbox" | "team" | "bizproc" | "settings"
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Бэдж непрочитанных Входящих
  const [inboxUnreadCount, setInboxUnreadCount] = useState(0);
  useEffect(() => {
    const fetchUnread = () => fetch("/api/mary/inbox?unread=1").then(r => r.json()).then(d => setInboxUnreadCount(d.counts?.unread || 0)).catch(() => {});
    fetchUnread();
    const id = setInterval(fetchUnread, 30000);
    return () => clearInterval(id);
  }, [currentPage]);
  const [departments, setDepartments] = useState([]);
  const [openDepts, setOpenDepts] = useState({ smm: true });
  // Глобальный navigate для dept://X / page://Y ссылок из чата Mary
  useEffect(() => {
    window.__maryNavigate = (target) => {
      if (target.startsWith("dept://")) {
        const id = target.slice(7);
        setCurrentPage("tg-kanal");
        setOpenDepts(prev => ({ ...prev, [id]: true }));
      } else if (target.startsWith("page://")) {
        setCurrentPage(target.slice(7));
      }
    };
    return () => { delete window.__maryNavigate; };
  }, []);
  // Подгружаем список отделов с бэка (Mary через create_department их добавляет)
  useEffect(() => {
    const load = () => fetch("/api/mary/departments")
      .then(r => r.ok ? r.json() : { departments: [] })
      .then(d => setDepartments(d.departments || []))
      .catch(() => {});
    load();
    const id = setInterval(load, 5000); // авто-апдейт когда Mary создаёт новый
    return () => clearInterval(id);
  }, []);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMode, setChatMode] = useState("docked"); // "docked" | "floating" | "side" | "mini"
  const [dockedHeight, setDockedHeight] = useState(420);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeRail, setActiveRail] = useState(null);
  const [agentsSelected, setAgentsSelected] = useState(null);
  const [kbUserItems, setKbUserItems] = useState(() => {
    try {
      const raw = localStorage.getItem("mary_kb_user_items");
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  });
  useEffect(() => {
    try {
      // Сохраняем в localStorage только метаданные + dataURL для маленьких файлов (<2MB)
      const lite = kbUserItems.map(it => {
        if (it.data && it.data.length > 2_000_000) {
          const { data, ...rest } = it;
          return rest;
        }
        return it;
      });
      localStorage.setItem("mary_kb_user_items", JSON.stringify(lite));
    } catch (e) {
      // QuotaExceededError — сохраняем без data
      try {
        const stripped = kbUserItems.map(({ data, ...rest }) => rest);
        localStorage.setItem("mary_kb_user_items", JSON.stringify(stripped));
      } catch (e2) {}
    }
  }, [kbUserItems]);

  function handleAgentClick(agentId) {
    setChatOpen(true);
    setActiveFilter(agentId);
  }
  function nowTime() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  function startTaskCreation() {
    setActiveRail(null);
    setChatOpen(true);
    setActiveFilter("all");
    setTaskFlow("desc");
    setPendingMaryMessage({
      id: "task-" + Date.now(),
      agentId: "mary",
      time: nowTime(),
      type: "question",
      text: "Опиши задачу — что нужно сделать? Любым текстом снизу, я сама придумаю кому передать или предложу варианты.",
    });
  }
  function openTasksDrawer() {
    setActiveRail("tasks");
  }
  const [pendingMaryMessage, setPendingMaryMessage] = useState(null);
  const [taskFlow, setTaskFlow] = useState(null); // null | "desc" | "who" | "person" | "agent" | "team"
  const [pendingTasks, setPendingTasks] = useState([]);
  const [chatKbItem, setChatKbItem] = useState(null);
  function addPendingTask(t) {
    setPendingTasks(prev => [{ id: "pt-" + Date.now(), createdAt: nowTime(), status: "Ожидает принятия", color: "#FFD60A", ...t }, ...prev]);
  }

  return (
    <div style={{
      display: "flex",
      width: "100vw",
      height: "100vh",
      background: color.white,
      fontFamily: font,
      color: "#262633",
    }}>
      {/* ── Sidebar ────────────────────────────────────── */}
      {sidebarCollapsed ? (
        <div style={{
          width: 44, minWidth: 44,
          background: color.white,
          borderRight: "1px solid rgba(38,38,51,0.06)",
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "16px 0",
        }}>
          <button
            onClick={() => setSidebarCollapsed(false)}
            title="Раскрыть сайдбар"
            style={{
              width: 32, height: 32,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: "transparent", border: "none", borderRadius: 7,
              color: "rgba(38,38,51,0.55)", cursor: "pointer", fontFamily: "inherit",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(38,38,51,0.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >{ic.collapse}</button>
        </div>
      ) : (
      <aside style={{
        width: SIDEBAR_W,
        minWidth: SIDEBAR_W,
        background: color.white,
        borderRight: "1px solid rgba(38,38,51,0.06)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}>
        {/* Logo + collapse */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 18px 16px",
        }}>
          <MaryLogo height={22} />
          <button
            onClick={() => setSidebarCollapsed(true)}
            title="Скрыть сайдбар"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 24, height: 24, padding: 0,
              background: "transparent", border: "none", borderRadius: 6,
              color: "rgba(38,38,51,0.55)", cursor: "pointer", fontFamily: "inherit",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(38,38,51,0.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >{ic.collapse}</button>
        </div>

        <SideRow icon={ic.home}  label="Главная" active={currentPage === "home"} onClick={() => setCurrentPage("home")} />
        <SideRow
          icon={ic.chat}
          label="Чат Mary"
          active={currentPage === "chat-mary"}
          onClick={() => setCurrentPage("chat-mary")}
        />
        <SideRow icon={ic.inbox} label="Входящие" active={currentPage === "inbox"} onClick={() => setCurrentPage("inbox")}
          trailing={inboxUnreadCount > 0 ? (
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              minWidth: 18, height: 18, padding: "0 5px",
              background: "#FF3B30", color: color.white, borderRadius: 999,
              fontSize: 10.5, fontWeight: 600,
            }}>{inboxUnreadCount}</span>
          ) : null} />

        <SectionHeader label="Компания" />
        <SideRow icon={ic.people}       label="Команда" active={currentPage === "team"} onClick={() => setCurrentPage("team")} />
        <SideRow
          icon={ic.tasks}
          label="Задачи"
          active={currentPage === "tasks"}
          onClick={() => setCurrentPage("tasks")}
        />
        <SideRow
          icon={ic.kb}
          label="База знаний"
          active={currentPage === "kb"}
          onClick={() => setCurrentPage("kb")}
        />
        <SideRow
          icon={ic.integrations}
          label="Интеграции"
          active={currentPage === "integrations"}
          onClick={() => setCurrentPage("integrations")}
        />

        <SectionHeader
          label="Отделы"
          action={
            <span
              onClick={() => setCurrentPage("chat-mary")}
              title="Создать отдел через Mary"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 18, height: 18, borderRadius: 4,
                cursor: "pointer", color: "rgba(38,38,51,0.5)",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(38,38,51,0.06)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >{ic.plus}</span>
          }
        />
        {/* Динамический список отделов — скроллится внутри своей зоны,
            чтобы футер (Помощь/Настройки) оставался видимым снизу */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>
          {departments.map(d => {
            const isOpen = openDepts[d.id] !== false; // по умолчанию открыты
            const hasChannels = (d.channels || []).length > 0;
            return (
              <div key={d.id}>
                <SideRow
                  icon={
                    <span style={{ display: "flex", color: d.color }}>
                      {d.icon === "hr" ? ic.hr : d.icon === "people" ? ic.people : ic.dept}
                    </span>
                  }
                  label={d.name}
                  trailing={hasChannels && (
                    <span style={{ display: "flex", color: "#262633" }}>{isOpen ? ic.chevronUp : ic.chevron}</span>
                  )}
                  onClick={() => hasChannels ? setOpenDepts(o => ({ ...o, [d.id]: !isOpen })) : null}
                />
                {isOpen && (d.channels || []).map(ch => (
                  <SideRow
                    key={ch.id}
                    label={ch.name}
                    indent={28}
                    active={currentPage === ch.page}
                    onClick={() => setCurrentPage(ch.page)}
                  />
                ))}
              </div>
            );
          })}
        </div>

        <div style={{ paddingBottom: 14, borderTop: "1px solid rgba(38,38,51,0.04)", paddingTop: 6 }}>
          <SideRow icon={ic.help}     label="Помощь" active={currentPage === "help"} onClick={() => setCurrentPage("help")} />
          <SideRow icon={ic.support}  label="Поддержка" active={currentPage === "support"} onClick={() => setCurrentPage("support")} />
          <SideRow icon={ic.settings} label="Настройки" active={currentPage === "settings"} onClick={() => setCurrentPage("settings")} />
        </div>
      </aside>
      )}

      {/* ── Main: канвас / БЗ / Интеграции ────────────── */}
      <main style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        background: color.white,
        padding: currentPage === "tg-kanal" ? 16 : 0,
      }}>
        {currentPage === "tg-kanal" ? (
          <GraphCanvas
            chatOpen={chatOpen}
            chatMode={chatMode}
            onChatModeChange={(m) => {
              if (m === "side") setActiveRail(null);
              setChatMode(m);
            }}
            pendingMaryMessage={pendingMaryMessage}
            onPendingConsumed={() => setPendingMaryMessage(null)}
            dockedHeight={dockedHeight}
            onDockedHeightChange={setDockedHeight}
            taskFlow={taskFlow}
            onTaskFlowChange={setTaskFlow}
            onAddTask={addPendingTask}
            onOpenTasks={openTasksDrawer}
            onOpenChat={() => { setChatOpen(true); setActiveFilter("all"); }}
            onCloseChat={() => setChatOpen(false)}
            activeFilter={activeFilter}
            onFilter={setActiveFilter}
            onAgentChat={(agentId) => {
              setActiveFilter(agentId);
              setChatOpen(true);
            }}
            onAgentSettings={(agentId) => {
              setActiveRail("agents");
              setAgentsSelected(agentId);
            }}
            selectedAgentId={activeRail === "agents" ? agentsSelected : null}
          />
        ) : currentPage === "kb" ? (
          <KbPage
            kbUserItems={kbUserItems}
            setKbUserItems={setKbUserItems}
            onOpenChat={() => { setChatOpen(true); setChatMode("mini"); setActiveFilter("all"); }}
          />
        ) : currentPage === "integrations" ? (
          <IntegrationsPage
            onOpenChat={() => { setChatOpen(true); setChatMode("mini"); setActiveFilter("all"); }}
          />
        ) : currentPage === "chat-mary" ? (
          <ChatMaryPage />
        ) : currentPage === "sandbox" ? (
          <SandboxPage />
        ) : currentPage === "home" ? (
          <HomePage onNavigate={setCurrentPage} />
        ) : currentPage === "inbox" ? (
          <InboxPage onNavigate={setCurrentPage} />
        ) : currentPage === "team" ? (
          <TeamPage />
        ) : currentPage === "bizproc" ? (
          <BizprocPage onNavigate={setCurrentPage} />
        ) : currentPage === "settings" ? (
          <SettingsPage />
        ) : currentPage === "help" ? (
          <HelpPage />
        ) : currentPage === "support" ? (
          <SupportPage />
        ) : (() => {
          // Если currentPage — динамический канал отдела (тип "deptId-channelId")
          for (const dept of departments) {
            const ch = (dept.channels || []).find(c => c.page === currentPage);
            if (ch) {
              return <DepartmentChannelPage deptId={dept.id} channelPage={currentPage} onNavigate={setCurrentPage} />;
            }
          }
          // Fallback — Tasks (Taskk-style Kanban)
          return <TasksKanbanPage />;
        })()}
      </main>

      {/* ── Drawer (выдвигается слева от рейла) ──────── */}
      {activeRail && (
        <RailDrawer
          kind={activeRail}
          onClose={() => setActiveRail(null)}
          agentsSelected={agentsSelected}
          setAgentsSelected={setAgentsSelected}
          kbUserItems={kbUserItems}
          setKbUserItems={setKbUserItems}
          onCreateTask={startTaskCreation}
          pendingTasks={pendingTasks}
        />
      )}

      {/* ── Чат как боковая панель / мини-окно ─────────── */}
      {chatOpen && (chatMode === "side" || chatMode === "mini") && (
        <ChatPanel
          onClose={() => setChatOpen(false)}
          activeFilter={activeFilter}
          onFilter={setActiveFilter}
          mode={chatMode}
          onModeChange={(m) => {
            if (m === "side") setActiveRail(null);
            setChatMode(m);
          }}
          dockedHeight={dockedHeight}
          onDockedHeightChange={setDockedHeight}
          pendingMaryMessage={pendingMaryMessage}
          onPendingConsumed={() => setPendingMaryMessage(null)}
          taskFlow={taskFlow}
          onTaskFlowChange={setTaskFlow}
          onAddTask={addPendingTask}
          onOpenTasks={openTasksDrawer}
          onOpenKb={(item) => setChatKbItem(item)}
        />
      )}
      {chatKbItem && <KbPopup item={chatKbItem} onClose={() => setChatKbItem(null)} />}

      {/* ── Right rail (скрыт на страницах БЗ/Интеграции) ── */}
      {currentPage === "tg-kanal" && <RightRail
        activeRail={activeRail}
        onSelect={(id) => {
          // При выборе любого drawer'а — закрываем чат-side, если он был открыт
          if (chatOpen && chatMode === "side") setChatOpen(false);
          setActiveRail(id);
        }}
        chatSideActive={chatOpen && chatMode === "side"}
        onToggleChatSide={() => {
          if (chatOpen && chatMode === "side") {
            setChatOpen(false);
          } else {
            // Открываем чат-side и закрываем любой другой drawer
            setActiveRail(null);
            setChatOpen(true);
            setChatMode("side");
          }
        }}
      />}
    </div>
  );
}

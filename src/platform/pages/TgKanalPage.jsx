import { useState, useRef, useEffect, useMemo } from "react";
import { color, transition, font, cv } from "../../ui/tokens.js";
import { useTheme } from "../../ui/theme.js";
import { I, P, deptIcon } from "../icons.jsx";
import { usePeople, MOCK_PEOPLE } from "../people.js";
import { renderMarkdown, parseNumberedOptions, parseChecklistOptions } from "../markdown.jsx";
import { AGENTS, EDGES, CARD_W, CARD_H, INSTAGRAM_AGENTS, INSTAGRAM_EDGES } from "../agents-config.js";
import { AgentLogsView, AgentOutputView } from "../bottom-panel.jsx";
import { BuildNode, AgentNodeExpanded } from "../build-nodes.jsx";
import { DeptChatWelcome } from "../dept-chat-welcome.jsx";
import { MaryInputBox, useTypewriterPlaceholder } from "../chat-input.jsx";
import { ChatPanel, ChatHeader, FilterBar, TypingIndicator, zoomBtn } from "../chat-panel.jsx";
import { ChatMessage, BuildCard, ToolsTrail, ToolStatusChip, FileActionRow, PublishedRow, TextCard, VisualCard, FinalPostCard, ToolTrace, ApproveActions, ResearchCard, InsightsCard, IdeasCard, toolLabel } from "../chat-cards.jsx";
import { ChatMaryPage } from "../chat-mary-page.jsx";
import { ActivityPanel, ArtifactView, ActivityLog, BuildCanvas } from "../chat-mary-activity.jsx";
import { ChatWelcome, ChatItem } from "../chat-mary-sidebar.jsx";
import { OptionsBlock, AgentChatBubble, ChatBubble, ActionBar } from "../chat-mary-bubbles.jsx";
import { TasksKanbanPage } from "./tasks-kanban.jsx";
import { TaskCard, TasksListView, TasksWeekView, TaskDrawer, DrawerRow, TasksPage, TaskKanbanCard } from "./tasks-page.jsx";
import { SandboxPage, NewRunForm, AgentsLog, JudgeCard, RunDetail, SandboxChat } from "./sandbox-page.jsx";
import { PageShell, StatCard, NavCard, HomePage, InboxPage, InboxTeamThread, InboxDetail } from "./home-inbox-pages.jsx";
import { TeamPage, BizprocPage, SettingsPage, HelpPage, DepartmentChannelPage, SupportPage } from "./misc-pages.jsx";
import { FlowNode, AgentFlowCanvas, FlowNodeEditor, pipelineToFlow } from "./agent-flow.jsx";
import { AgentSettingsView, SettingRow, AgentJobDescription } from "./agent-settings.jsx";
import { DepartmentSandbox, AgentBottomPanel, SandboxPanel } from "./agent-view.jsx";
import { IntegrationsPage, IntegrationCard } from "./integrations-page.jsx";
import { MaryLogo, SideRow, SectionHeader, PipelineItem, AgentCard, CardToolBtn, ProfileMenu } from "./sidebar-components.jsx";
import { KbPopup, AddKbPopup, TextViewerPopup } from "./kb-content.jsx";
import { PeopleContent, ProfilePopup, SendMessagePopup, IntegrationsContent } from "./people-content.jsx";
import { AgentsContent, AgentDetail, KbPage, KbTreeRow, KbCard } from "./agents-content.jsx";
import { RightRail, RailItem, RailDrawer, TasksContent, FilesContent } from "./rail-drawer.jsx";
import { DepartmentOverviewPage } from "./dept-overview.jsx";
import { StaffPage } from "./staff-page.jsx";

// Реплика экрана Figma node 5522:2547 (file: o1syNp93H3v2dyA3JHp4em — Mary)
// Сабпейдж "Тг-канал" в отделе "СММ".

const SIDEBAR_W = 196;
const RIGHT_W = 64;

// ── Иконки (14px по умолчанию для меню) ─────────────────────
const ic = {
  home:         <I d={<><path d="M3 10.5L12 3l9 7.5" /><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" /><path d="M9.5 21v-6h5v6" /></>} />,
  chat:         <I d={<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />} />,
  inbox:        <I d={<><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6L5.5 5z" /></>} />,
  bizproc:      <I d={<><rect x="3" y="3" width="7" height="7" rx="2.5" /><rect x="14" y="3" width="7" height="7" rx="2.5" /><rect x="14" y="14" width="7" height="7" rx="2.5" /><path d="M6.5 10v4a2 2 0 0 0 2 2h2" /></>} />,
  depts:        <I d={<><rect x="3" y="3" width="7" height="7" rx="2.5" /><rect x="14" y="3" width="7" height="7" rx="2.5" /><rect x="3" y="14" width="7" height="7" rx="2.5" /><rect x="14" y="14" width="7" height="7" rx="2.5" /></>} />,
  people:       <I d={<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>} />,
  tasks:        <I d={<><rect x="3" y="5" width="6" height="6" rx="2" /><path d="M3 17l2 2 4-4" /><path d="M13 6h8" /><path d="M13 12h8" /><path d="M13 18h8" /></>} />,
  staff:        <I d={<><rect x="9" y="2" width="6" height="5" rx="2" /><rect x="2" y="16" width="6" height="5" rx="2" /><rect x="16" y="16" width="6" height="5" rx="2" /><path d="M12 7v4M5 16v-2h14v2M12 14v-3" /></>} />,
  kb:           <I d={<><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></>} />,
  integrations: <I d={<><path d="M12 22v-5" /><path d="M9 8V2" /><path d="M15 8V2" /><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8z" /></>} />,
  hr:           <I d={<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" /></>} />,
  help:         <I d={<><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></>} />,
  support:      <I d={<><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /><path d="M4.93 4.93l4.24 4.24" /><path d="M14.83 9.17l4.24-4.24" /><path d="M14.83 14.83l4.24 4.24" /><path d="M9.17 14.83l-4.24 4.24" /></>} />,
  settings:     <I d={<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>} />,
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
  arrowsLeft:  <I d={<><path d="M11 17l-5-5 5-5" /><path d="M18 17l-5-5 5-5" /></>} size={17} stroke={1.8} />,
  arrowsRight: <I d={<><path d="M13 17l5-5-5-5" /><path d="M6 17l5-5-5-5" /></>} size={17} stroke={1.8} />,
  paw: (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
      <ellipse cx="12" cy="15.7" rx="4.6" ry="3.8" />
      <ellipse cx="5.7" cy="10.5" rx="1.9" ry="2.3" />
      <ellipse cx="9.9" cy="6.8" rx="1.9" ry="2.3" />
      <ellipse cx="14.1" cy="6.8" rx="1.9" ry="2.3" />
      <ellipse cx="18.3" cy="10.5" rx="1.9" ry="2.3" />
    </svg>
  ),
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

// Кнопка свёрнутого сайдбара (icon-rail)
function RailBtn({ icon, label, active, onClick, badge }) {
  const [tip, setTip] = useState(null);
  const ref = useRef(null);
  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setTip({ top: r.top + r.height / 2, left: r.right + 10 });
  };
  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseEnter={show}
      onMouseLeave={() => setTip(null)}
      style={{
        position: "relative",
        width: 36, height: 36, flexShrink: 0,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "inherit",
        color: cv.text,
        background: active ? cv.userBubble : tip ? cv.hover : "transparent",
        transition: transition.fast,
      }}
    >
      <span style={{ display: "flex" }}>{icon}</span>
      {badge && (
        <span style={{
          position: "absolute", top: 7, right: 7,
          width: 7, height: 7, borderRadius: "50%", background: "#FF3B30",
          border: `1.5px solid ${cv.bg}`,
        }} />
      )}
      {tip && label && (
        <span style={{
          position: "fixed", top: tip.top, left: tip.left, transform: "translateY(-50%)",
          background: "#8A8A94", color: "#fff",
          fontSize: 11, fontWeight: 500, lineHeight: 1, whiteSpace: "nowrap",
          padding: "4px 8px", borderRadius: 6,
          pointerEvents: "none", zIndex: 1000,
        }}>{label}</span>
      )}
    </button>
  );
}

function GraphCanvas({ chatOpen, chatMode, onChatModeChange, dockedHeight, onDockedHeightChange, onOpenChat, onCloseChat, activeFilter, onFilter, onAgentChat, onAgentSettings, selectedAgentId, pendingMaryMessage, onPendingConsumed, taskFlow, onTaskFlowChange, onAddTask, onOpenTasks, deptName, channelName, deptId, dept, onDrillChange }) {
  const [dynamicAgents, setDynamicAgents] = useState([]);
  const activeAgents = useMemo(() => {
    if (channelName === "Instagram") return INSTAGRAM_AGENTS;
    if (deptId === "smm") return dynamicAgents.length > 0 ? dynamicAgents : AGENTS;
    if (dynamicAgents.length > 0) return dynamicAgents;
    return AGENTS;
  }, [channelName, deptId, dynamicAgents]);
  const activeEdges = useMemo(() => {
    if (channelName === "Instagram") return INSTAGRAM_EDGES;
    if (deptId === "smm" && dynamicAgents.length === 0) return EDGES;
    return [];
  }, [channelName, deptId, dynamicAgents]);
  const [positions, setPositions] = useState(() =>
    Object.fromEntries(activeAgents.map(a => [a.id, { x: a.x, y: a.y }]))
  );
  const [expandedId, setExpandedId] = useState(null);
  const [drilledAgentId, setDrilledAgentId] = useState(null);
  const [selectedFlowNode, setSelectedFlowNode] = useState(null);
  useEffect(() => { onDrillChange?.(!!drilledAgentId); }, [drilledAgentId]);
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

      // Динамические агенты для текущего канала (не хардкод)
      if (deptId && channelName !== "Тг-канал" && channelName !== "Instagram") {
        const dept = (d.departments || []).find(x => x.id === deptId);
        const backendAgents = dept?.agents || [];
        if (backendAgents.length > 0) {
          setDynamicAgents(prev => {
            const prevPositions = Object.fromEntries(prev.map(a => [a.id, { x: a.x, y: a.y }]));
            return backendAgents.map((a, i) => ({
              id: a.id,
              label: a.name || a.role,
              color: a.color || "#7A86FF",
              role: a.role,
              x: prevPositions[a.id]?.x ?? a.x ?? (60 + (i % 3) * 260),
              y: prevPositions[a.id]?.y ?? a.y ?? (200 + Math.floor(i / 3) * 200),
              hasUpdate: false, unread: 0,
              skills: [],
              tools: a.tools || [],
              pipeline: [],
              flow: (map[a.id]) || pipelineToFlow(a.pipeline, a.color) || { nodes: [], edges: [] },
            }));
          });
        }
      }
    }).catch(() => {});
    load();
    const t = setInterval(load, 5000); // подхватывать изменения от Mary раз в 5с
    return () => { stop = true; clearInterval(t); };
  }, [deptId, channelName]); // eslint-disable-line react-hooks/exhaustive-deps
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
  // Auto-fit on first mount
  useEffect(() => {
    const t = setTimeout(() => fitToView(), 60);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Агент с актуальной позицией
  const agentsWithPos = activeAgents.map(a => ({ ...a, ...positions[a.id] }));
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
  const FLOW_NODE_W = 240;
  const FLOW_NODE_H = 112;
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
      const BOTTOM_PANEL_H = 280; // AgentBottomPanel height + padding
      const availH = rect.height - BOTTOM_PANEL_H;
      const targetScale = Math.min(rect.width / w, availH / h, 0.9);
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      setView({
        x: rect.width / 2 - cx * targetScale,
        y: availH / 2 - cy * targetScale,
        scale: targetScale,
      });
    } else if (prevViewRef.current) {
      setView(prevViewRef.current);
      prevViewRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drilledAgentId]);

  // Sync positions when new dynamic agents arrive
  useEffect(() => {
    setPositions(prev => {
      let changed = false;
      const next = { ...prev };
      for (const a of activeAgents) {
        if (!next[a.id]) { next[a.id] = { x: a.x, y: a.y }; changed = true; }
      }
      return changed ? next : prev;
    });
  }, [activeAgents]);

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
        d.lastX = Math.max(0, d.origX + dx);
        d.lastY = Math.max(0, d.origY + dy);
        setPositions(prev => ({
          ...prev,
          [d.id]: { x: d.lastX, y: d.lastY },
        }));
      }
    }
    function onUp() {
      if (dragRef.current) {
        const d = dragRef.current;
        wasDraggedRef.current = d.dragging;
        if (d.dragging && deptId && d.lastX !== undefined) {
          fetch(`/api/mary/agents/${deptId}/${d.id}/position`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ x: d.lastX, y: d.lastY }),
          }).catch(() => {});
        }
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
  }, [deptId]); // eslint-disable-line react-hooks/exhaustive-deps

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
    const a = activeAgents.find(x => x.id === id);
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
          onClick={() => { if (drilledAgentId) { setDrilledAgentId(null); setSelectedFlowNode(null); } }}
        >{deptName || "СММ-Отдел"}</span>
        <span style={{ opacity: 0.6 }}>›</span>
        <span
          style={{
            color: drilledAgentId ? "rgba(38,38,51,0.55)" : "#262633",
            cursor: drilledAgentId ? "pointer" : "default",
          }}
          onClick={() => { if (drilledAgentId) { setDrilledAgentId(null); setSelectedFlowNode(null); } }}
        >{channelName || "Тг-канал"}</span>
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

      {/* «Запустить» — только в drill-in режиме */}
      {drilledAgentId && (
        <button
          onClick={() => runSandbox()}
          disabled={sandboxRunning}
          style={{
            position: "absolute", top: 14, right: 316, zIndex: 6,
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "7px 14px",
            background: sandboxRunning ? "rgba(52,199,89,0.15)" : "#34C759",
            color: sandboxRunning ? "#34C759" : color.white,
            border: sandboxRunning ? "1px solid #34C759" : "none",
            borderRadius: 8, fontSize: 12.5, fontWeight: 500,
            cursor: sandboxRunning ? "default" : "pointer", fontFamily: "inherit",
            boxShadow: "0 1px 3px rgba(38,38,51,0.08)",
            transition: "all 0.14s",
          }}
        >
          {sandboxRunning ? (
            <>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34C759", animation: "maryPulse 1.2s infinite" }} />
              Выполняется…
            </>
          ) : (
            <>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Запустить
            </>
          )}
        </button>
      )}
      <style>{`@keyframes maryPulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(1.3); } }`}</style>


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
          {activeEdges.map(([f, t]) => (
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
              selected={selectedFlowNode?.id === n.id}
              onClick={() => setSelectedFlowNode(prev => prev?.id === n.id ? null : n)}
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

      {/* Tool/zoom bar — поднимается над докнутым чатом и над нижней панелью drill-in */}
      <ToolBar
        chatOpen={chatOpen}
        chatMode={chatMode}
        dockedHeight={dockedHeight}
        scale={view.scale}
        onZoomIn={() => zoomBy(0.1)}
        onZoomOut={() => zoomBy(-0.1)}
        onFit={fitToView}
        bottomOffset={drilledAgent?.profile ? 270 : 0}
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

      {/* FlowNode Editor panel — shown during drill-in, replaces RightRail */}
      {drilledAgentId && (
        <FlowNodeEditor
          node={selectedFlowNode}
          agent={drilledAgent}
          accent={drilledAgent?.color || "#7A86FF"}
        />
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
          agents={activeAgents}
          channelName={channelName}
          deptId={deptId}
          dept={dept}
        />
      )}
    </div>
  );
}

function ToolBar({ chatOpen, chatMode, dockedHeight, scale, onZoomIn, onZoomOut, onFit, bottomOffset = 0 }) {
  const [tool, setTool] = useState("pointer"); // "pointer" | "hand"
  const [open, setOpen] = useState(false);
  const baseBottom = chatOpen && chatMode === "docked" ? (dockedHeight ?? 420) + 28 : 16;
  return (
    <div style={{
      position: "absolute", left: 16,
      bottom: Math.max(baseBottom, bottomOffset + 16),
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

// ── Корневой компонент ──────────────────────────────────────
export default function TgKanalPage() {
  const { dark, toggle: toggleDark } = useTheme();
  const [smmOpen, setSmmOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState("chat-mary"); // "tg-kanal" | "kb" | "integrations" | "tasks" | "chat-mary" | "home" | "inbox" | "team" | "bizproc" | "settings"
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const [notif, setNotif] = useState(true);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const navigate = (page) => { setCurrentPage(page); setMobileSidebarOpen(false); };
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
  const currentChannelName = (() => {
    if (currentPage === "tg-kanal") return "Тг-канал";
    for (const d of departments) {
      const ch = (d.channels || []).find(c => c.page === currentPage);
      if (ch) return ch.name;
    }
    return null;
  })();
  const currentAgents = currentChannelName === "Instagram" ? INSTAGRAM_AGENTS : AGENTS;
  const currentDeptId = (() => {
    if (currentPage === "tg-kanal") return "smm";
    for (const d of departments) {
      if (currentPage === "dept:" + d.id) return d.id;
      if ((d.channels || []).some(c => c.page === currentPage)) return d.id;
    }
    return null;
  })();
  const currentDept = departments.find(d => d.id === currentDeptId) || null;
  // Глобальный navigate для dept://X / page://Y ссылок из чата Mary
  useEffect(() => {
    window.__maryNavigate = (target) => {
      if (target.startsWith("dept://")) {
        const id = target.slice(7);
        setCurrentPage("dept:" + id);
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
    window.addEventListener("mary-dept-updated", load); // немедленный refresh после tool call
    return () => { clearInterval(id); window.removeEventListener("mary-dept-updated", load); };
  }, []);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMode, setChatMode] = useState("docked"); // "docked" | "floating" | "side" | "mini"
  const [dockedHeight, setDockedHeight] = useState(420);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeRail, setActiveRail] = useState(null);
  const [isDrilledInCanvas, setIsDrilledInCanvas] = useState(false);
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
      background: cv.bg,
      fontFamily: font,
      color: cv.text,
      gap: isMobile ? 0 : 8,
      padding: isMobile ? 0 : 8,
      boxSizing: "border-box",
    }}>
      {/* Mobile bottom nav */}
      {isMobile && (() => {
        const mobileNavItems = [
          { id: "chat-mary", label: "Чат", icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
          { id: "inbox",     label: "Входящие", icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6L5.5 5z"/></svg> },
          { id: "tasks",     label: "Задачи",   icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> },
          { id: "home",      label: "Главная",  icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.8L12 3.5l9 7.3V20a1 1 0 0 1-1 1h-4v-6h-8v6H4a1 1 0 0 1-1-1v-9.2z"/></svg> },
          { id: "settings",  label: "Настройки",icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg> },
        ];
        return (
          <nav style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
            height: 56, background: cv.bgPage,
            borderTop: `1px solid ${cv.border}`,
            display: "flex", alignItems: "stretch",
          }}>
            {mobileNavItems.map(item => {
              const active = currentPage === item.id;
              return (
                <button key={item.id} onClick={() => navigate(item.id)}
                  style={{
                    flex: 1, display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 3,
                    background: "transparent", border: "none",
                    color: active ? cv.text : cv.muted,
                    cursor: "pointer", fontFamily: "inherit",
                    fontSize: 10, fontWeight: active ? 600 : 400,
                    paddingBottom: "env(safe-area-inset-bottom)",
                  }}
                >{item.icon}{item.label}</button>
              );
            })}
          </nav>
        );
      })()}

      {/* ── Sidebar (desktop only) ────────────────────── */}
      {!isMobile && sidebarCollapsed ? (
        <div style={{
          width: 52, minWidth: 52,
          background: cv.bg,
          display: "flex", flexDirection: "column", alignItems: "center",
          height: "100%", overflow: "hidden",
        }}>
          {/* Раскрыть */}
          <div style={{ padding: "16px 0 8px" }}>
            <RailBtn icon={ic.arrowsRight} label="Раскрыть сайдбар" onClick={() => setSidebarCollapsed(false)} />
          </div>

          {/* Главное меню */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <RailBtn icon={ic.home}  label="Главная"     active={currentPage === "home"}      onClick={() => navigate("home")} />
            <RailBtn icon={ic.chat}  label="Чат Mary"    active={currentPage === "chat-mary"} onClick={() => navigate("chat-mary")} />
            <RailBtn icon={ic.inbox} label="Входящие"    active={currentPage === "inbox"}     onClick={() => navigate("inbox")} badge={inboxUnreadCount > 0} />
            <RailBtn icon={ic.staff} label="Сотрудники"  active={currentPage === "staff"}     onClick={() => navigate("staff")} />
            <RailBtn icon={ic.tasks} label="Задачи"      active={currentPage === "tasks"}     onClick={() => navigate("tasks")} />
            <RailBtn icon={ic.kb}    label="База знаний"  active={currentPage === "kb"}        onClick={() => navigate("kb")} />
            <RailBtn icon={ic.integrations} label="Интеграции" active={currentPage === "integrations"} onClick={() => navigate("integrations")} />
          </div>

          {/* Отделы (скролл) */}
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", gap: 2, padding: "8px 0", marginTop: 4, borderTop: `1px solid ${cv.border}` }}>
            {departments.map(d => (
              <RailBtn key={d.id} icon={deptIcon(d)} label={d.name} active={currentPage === "dept:" + d.id} onClick={() => navigate("dept:" + d.id)} />
            ))}
          </div>

          {/* Низ */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "8px 0 14px", borderTop: `1px solid ${cv.border}`, width: "100%" }}>
            <RailBtn icon={ic.settings} label="Настройки" active={currentPage === "settings"} onClick={() => navigate("settings")} />
            <div
              onClick={() => setSidebarCollapsed(false)}
              title="Виктория Ахрамович"
              style={{
                width: 26, height: 26, borderRadius: "50%", flexShrink: 0, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "linear-gradient(135deg,#A0A4AE,#82858F)",
                color: "#fff", fontSize: 10.5, fontWeight: 600, letterSpacing: 0.2,
              }}
            >ВА</div>
          </div>
        </div>
      ) : !isMobile ? (
      <aside style={{
        width: SIDEBAR_W, minWidth: SIDEBAR_W,
        background: cv.bg,
        display: "flex",
        flexDirection: "column",
        height: "100%",
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
          >{ic.arrowsLeft}</button>
        </div>

        <SideRow icon={ic.home}  label="Главная" active={currentPage === "home"} onClick={() => navigate("home")} />
        <SideRow
          icon={ic.chat}
          label="Чат Mary"
          active={currentPage === "chat-mary"}
          onClick={() => navigate("chat-mary")}
        />
        <SideRow icon={ic.inbox} label="Входящие" active={currentPage === "inbox"} onClick={() => navigate("inbox")}
          trailing={inboxUnreadCount > 0 ? (
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              minWidth: 18, height: 18, padding: "0 5px",
              background: "#FF3B30", color: color.white, borderRadius: 999,
              fontSize: 10.5, fontWeight: 600,
            }}>{inboxUnreadCount}</span>
          ) : null} />

        <SectionHeader label="Компания" />
        <SideRow icon={ic.staff}        label="Сотрудники" active={currentPage === "staff"} onClick={() => navigate("staff")} />
        <SideRow
          icon={ic.tasks}
          label="Задачи"
          active={currentPage === "tasks"}
          onClick={() => navigate("tasks")}
        />
        <SideRow
          icon={ic.kb}
          label="База знаний"
          active={currentPage === "kb"}
          onClick={() => navigate("kb")}
        />
        <SideRow
          icon={ic.integrations}
          label="Интеграции"
          active={currentPage === "integrations"}
          onClick={() => navigate("integrations")}
        />

        <SectionHeader
          label="Отделы"
          action={
            <span
              onClick={() => navigate("chat-mary")}
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
                    <span style={{ display: "flex", color: cv.text }}>
                      {deptIcon(d)}
                    </span>
                  }
                  label={d.name}
                  active={currentPage === "dept:" + d.id}
                  trailing={hasChannels && (
                    <span
                      style={{ display: "flex", color: "#262633", padding: "4px 2px", borderRadius: 4 }}
                      onClick={e => { e.stopPropagation(); setOpenDepts(o => ({ ...o, [d.id]: !isOpen })); }}
                    >{isOpen ? ic.chevronUp : ic.chevron}</span>
                  )}
                  onClick={() => navigate("dept:" + d.id)}
                />
                {isOpen && (d.channels || []).map(ch => {
                  const chActive = currentPage === ch.page;
                  return (
                    <div
                      key={ch.id}
                      onClick={() => navigate(ch.page)}
                      style={{
                        display: "flex", alignItems: "center", gap: 9,
                        height: 30,
                        padding: "0 10px 0 10px",
                        margin: "1px 8px",
                        borderRadius: 8,
                        background: chActive ? cv.userBubble : "transparent",
                        color: cv.muted,
                        cursor: "pointer",
                        transition: transition.fast,
                        userSelect: "none",
                      }}
                      onMouseEnter={e => { if (!chActive) e.currentTarget.style.background = cv.hover; }}
                      onMouseLeave={e => { if (!chActive) e.currentTarget.style.background = "transparent"; }}
                    >
                      <span style={{ display: "flex", color: cv.muted, flexShrink: 0 }}>{ic.bizproc}</span>
                      <span style={{ fontSize: 12.5, lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ch.name}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div style={{ paddingBottom: 4, paddingTop: 6 }}>
          <SideRow icon={ic.help}     label="Помощь" active={currentPage === "help"} onClick={() => navigate("help")} />
          <SideRow icon={ic.support}  label="Поддержка" active={currentPage === "support"} onClick={() => navigate("support")} />
          <SideRow icon={ic.settings} label="Настройки" active={currentPage === "settings"} onClick={() => navigate("settings")} />
        </div>

        {/* Профиль пользователя + меню */}
        <div style={{ position: "relative" }}>
          {profileMenu && (
            <>
              <div onClick={() => setProfileMenu(false)}
                style={{ position: "fixed", inset: 0, zIndex: 40 }} />
              <ProfileMenu
                dark={dark} toggleDark={toggleDark}
                notif={notif} setNotif={setNotif}
                onSettings={() => { setProfileMenu(false); navigate("settings"); }}
                onHelp={() => { setProfileMenu(false); navigate("help"); }}
                onClose={() => setProfileMenu(false)}
              />
            </>
          )}
          <div
            onClick={() => setProfileMenu(v => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "5px 8px",
              margin: "2px 8px 18px",
              borderRadius: 10,
              cursor: "pointer",
              transition: transition.fast,
              background: profileMenu ? cv.hover : "transparent",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = cv.hover; }}
            onMouseLeave={e => { if (!profileMenu) e.currentTarget.style.background = "transparent"; }}
          >
            <div style={{
              width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "linear-gradient(135deg,#A0A4AE,#82858F)",
              color: "#fff", fontSize: 10.5, fontWeight: 600, letterSpacing: 0.2,
            }}>ВА</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontSize: 12, fontWeight: 550, color: cv.text, lineHeight: 1.2,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>Виктория Ахрамович</div>
              <div style={{
                fontSize: 10, color: cv.muted, lineHeight: 1.2, marginTop: 1,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>Администратор</div>
            </div>
          </div>
        </div>
      </aside>
      ) : null}

      {/* ── Main: канвас / БЗ / Интеграции ────────────── */}
      <main style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        background: cv.bg,
        border: isMobile ? "none" : `1px solid ${cv.border}`,
        borderRadius: isMobile ? 0 : 20,
        overflow: "hidden",
        ...((() => {
          const isCanvas = currentPage === "tg-kanal" || departments.some(d => (d.channels||[]).some(c=>c.page===currentPage));
          return isCanvas ? { padding: 16, paddingBottom: isMobile ? 56 : 16 } : { paddingBottom: isMobile ? 56 : 0 };
        })()),
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
            deptId="smm"
            dept={departments.find(d => d.id === "smm") || null}
            onDrillChange={setIsDrilledInCanvas}
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
          <ChatMaryPage dark={dark} toggleDark={toggleDark} />
        ) : currentPage === "sandbox" ? (
          <SandboxPage />
        ) : currentPage === "home" ? (
          <HomePage onNavigate={setCurrentPage} />
        ) : currentPage === "inbox" ? (
          <InboxPage onNavigate={setCurrentPage} />
        ) : currentPage === "staff" ? (
          <StaffPage />
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
        ) : currentPage.startsWith("dept:") ? (
          <DepartmentOverviewPage
            dept={departments.find(d => "dept:" + d.id === currentPage)}
            onNavigate={setCurrentPage}
            onOpenChat={(msg) => {
              if (msg) setPendingMaryMessage(msg);
              setChatOpen(true);
              setChatMode("side");
              setActiveFilter("all");
            }}
          />
        ) : (() => {
          // Динамический канал отдела — рендерим тот же GraphCanvas, меняем только breadcrumb
          for (const deptItem of departments) {
            const ch = (deptItem.channels || []).find(c => c.page === currentPage);
            if (ch) {
              return (
                <GraphCanvas
                  chatOpen={chatOpen}
                  chatMode={chatMode}
                  onChatModeChange={(m) => { if (m === "side") setActiveRail(null); setChatMode(m); }}
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
                  onAgentChat={(agentId) => { setActiveFilter(agentId); setChatOpen(true); }}
                  onAgentSettings={(agentId) => { setActiveRail("agents"); setAgentsSelected(agentId); }}
                  selectedAgentId={activeRail === "agents" ? agentsSelected : null}
                  deptName={deptItem.name + "-Отдел"}
                  channelName={ch.name}
                  deptId={deptItem.id}
                  dept={deptItem}
                  onDrillChange={setIsDrilledInCanvas}
                />
              );
            }
          }
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
          agents={currentAgents}
          channelName={currentChannelName}
          deptId={currentDeptId}
          dept={currentDept}
        />
      )}
      {chatKbItem && <KbPopup item={chatKbItem} onClose={() => setChatKbItem(null)} />}

      {/* ── Right rail (скрыт на страницах БЗ/Интеграции и при drill-in) ── */}
      {(currentPage === "tg-kanal" || currentPage.startsWith("dept:")) && !isDrilledInCanvas && <RightRail
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

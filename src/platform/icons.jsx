// Все SVG/PNG иконки платформы Mary. Извлечено из TgKanalPage.jsx (Phase 1 refactor).
// Использование: import { I, P, ic } from "../icons.jsx";

// SVG-иконка с stroke по currentColor
export function I({ d, size = 14, stroke = 2.3, fill = "none" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
         strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {d}
    </svg>
  );
}

// PNG-иконка из брендбука
export function P({ src, size = 14 }) {
  return <img src={src} alt="" style={{ width: size, height: size, objectFit: "contain", display: "block" }} />;
}

// Иконка отдела по смыслу (по названию/id), вместо лапки. Line-style.
export function deptIcon(d, size = 14) {
  const n = ((d?.name || "") + " " + (d?.id || "")).toLowerCase();
  const has = (...ks) => ks.some(k => n.includes(k));
  if (has("смм", "smm", "контент", "маркет", "social", "соц"))
    return <I size={size} d={<><path d="M3 11l18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></>} />;
  if (has("продаж", "sales", "сбыт", "клиент"))
    return <I size={size} d={<><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></>} />;
  if (has("отч", "report", "аналит", "метр", "data", "данны"))
    return <I size={size} d={<><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></>} />;
  if (has("поддерж", "support", "помощ", "забот"))
    return <I size={size} d={<><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /><path d="M4.93 4.93l4.24 4.24" /><path d="M14.83 9.17l4.24-4.24" /><path d="M14.83 14.83l4.24 4.24" /><path d="M9.17 14.83l-4.24 4.24" /></>} />;
  if (has("hr", "кадр", "персонал", "найм", "рекрут"))
    return <I size={size} d={<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>} />;
  if (has("финанс", "бухгалт", "finance", "затрат", "деньг"))
    return <I size={size} d={<><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4z" /></>} />;
  if (has("дизайн", "design", "креатив", "бренд"))
    return <I size={size} d={<><circle cx="13.5" cy="6.5" r="1" /><circle cx="17.5" cy="10.5" r="1" /><circle cx="6.5" cy="12.5" r="1" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.7 1.6-1.7 0-.4-.2-.8-.4-1.1-.3-.3-.4-.6-.4-1.1 0-.9.7-1.6 1.6-1.6H18c2.2 0 4-1.8 4-4C22 6 17.5 2 12 2z" /></>} />;
  if (has("разраб", "dev", "it", "продукт", "tech", "технич"))
    return <I size={size} d={<><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>} />;
  // fallback — портфель
  return <I size={size} d={<><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>} />;
}

// Словарь иконок — используется везде в платформе
export const ic = {
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
  panel: <I d={<><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /></>} size={15} stroke={2} />,
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
  file: <I d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></>} size={16} stroke={1.6} />,
  image: <I d={<><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></>} size={16} stroke={1.6} />,
  link: <I d={<><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" /><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" /></>} size={16} stroke={1.6} />,
  inboxArrow: <I d={<><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6L5.5 5z" /></>} size={16} stroke={1.6} />,
  package: <I d={<><path d="M16.5 9.4l-9-5.19" /><path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><path d="M3.27 6.96L12 12l8.73-5.04" /><path d="M12 22.08V12" /></>} size={16} stroke={1.6} />,
  attach: <I d={<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />} size={16} stroke={1.7} />,
  uploadCloud: <I d={<><path d="M16 16l-4-4-4 4" /><path d="M12 12v9" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /><path d="M16 16l-4-4-4 4" /></>} size={22} stroke={1.6} />,
  book: <I d={<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>} size={16} stroke={1.6} />,
  paperPlane: <I d={<><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></>} size={14} stroke={1.6} />,
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
  play:    <I d={<path d="M6 4l14 8-14 8V4z" />} size={14} stroke={1.7} fill="currentColor" />,
  stopSm:  <I d={<rect x="6" y="6" width="12" height="12" rx="2" />} size={14} stroke={1.7} fill="currentColor" />,
  gear:    <I d={<><circle cx="12" cy="12" r="3" /><path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></>} size={14} stroke={1.6} />,
  chatSm:  <I d={<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />} size={14} stroke={1.6} />,
  spark: (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c.4 0 .8.3.9.7l1 4 4 1c.4.1.7.5.7.9s-.3.8-.7.9l-4 1-1 4c-.1.4-.5.7-.9.7s-.8-.3-.9-.7l-1-4-4-1c-.4-.1-.7-.5-.7-.9s.3-.8.7-.9l4-1 1-4c.1-.4.5-.7.9-.7z" />
      <path d="M19 14c.3 0 .6.2.7.5l.5 1.6 1.6.5c.3.1.5.4.5.7s-.2.6-.5.7l-1.6.5-.5 1.6c-.1.3-.4.5-.7.5s-.6-.2-.7-.5l-.5-1.6-1.6-.5c-.3-.1-.5-.4-.5-.7s.2-.6.5-.7l1.6-.5.5-1.6c.1-.3.4-.5.7-.5z" />
    </svg>
  ),
};

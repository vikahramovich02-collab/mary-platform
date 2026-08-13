import fs from "node:fs";
import path from "node:path";

const file = "/tmp/index-CLW7J7YJ.js";
const base = path.resolve("scripts/mary8080-fragments");
let src = fs.readFileSync(file, "utf8");

// Normalize labels from earlier prototype revisions before matching the current
// sidebar and mobile-navigation fragments.
src = src
  .replace('[te,le]=g.useState("chat")', '[te,le]=g.useState("home")')
  .replace('const Oc=237,', 'const Oc=300,')
  .replace('label:"Обращения",active:te==="inbox"', 'label:"Входящие",active:te==="inbox"')
  .replace('["inbox","Обращения"]', '["inbox","Входящие"]');

function read(name) {
  return fs.readFileSync(path.join(base, name), "utf8");
}

function replaceBetween(start, end, replacementFile) {
  const replacement = read(replacementFile);
  if (src.includes(replacement)) {
    return;
  }
  const from = src.indexOf(start);
  const to = src.indexOf(end, from);
  if (from === -1 || to === -1) {
    throw new Error(`Pattern not found: ${start} -> ${end}`);
  }
  src = src.slice(0, from) + replacement + src.slice(to);
}

function replaceBetweenAny(starts, end, replacementFile) {
  const replacement = read(replacementFile);
  if (src.includes(replacement)) {
    return;
  }
  const start = starts.find((candidate) => src.includes(candidate));
  if (!start) {
    throw new Error(`Pattern not found: ${starts.join(" | ")} -> ${end}`);
  }
  const from = src.indexOf(start);
  const to = src.indexOf(end, from);
  if (from === -1 || to === -1) {
    throw new Error(`Pattern not found: ${start} -> ${end}`);
  }
  src = src.slice(0, from) + replacement + src.slice(to);
}

function replaceBetweenAnyEnd(start, ends, replacementFile) {
  const replacement = read(replacementFile);
  if (src.includes(replacement)) {
    return;
  }
  const from = src.indexOf(start);
  const end = ends.find((candidate) => src.indexOf(candidate, from) !== -1);
  if (from === -1 || !end) {
    throw new Error(`Pattern not found: ${start} -> ${ends.join(" | ")}`);
  }
  const to = src.indexOf(end, from);
  src = src.slice(0, from) + replacement + src.slice(to);
}

function replaceExact(search, replacement, label) {
  if (src.includes(replacement)) {
    return;
  }
  if (!src.includes(search)) {
    throw new Error(`Exact pattern not found${label ? `: ${label}` : ""}`);
  }
  src = src.replace(search, replacement);
}

function replaceRegex(pattern, replacement, label) {
  if (src.includes(replacement)) {
    return;
  }
  if (!pattern.test(src)) {
    throw new Error(`Regex pattern not found${label ? `: ${label}` : ""}`);
  }
  src = src.replace(pattern, replacement);
}

if (src.includes('function homePage({onNavigate:s,onAskMary:d}){')) {
  const homeStart=src.indexOf('function homePage({onNavigate:s,onAskMary:d}){');
  const inboxStart=src.indexOf('function hm({items:s,onResolve:d}){',homeStart);
  if(inboxStart===-1)throw new Error("Inbox component not found after home page");
  src=src.slice(0,homeStart)+read("home.jsfrag")+src.slice(inboxStart);
} else {
  replaceExact(
    'function hm({items:s,onResolve:d}){',
    `${read("home.jsfrag")}function hm({items:s,onResolve:d}){`,
    "home page component"
  );
}

replaceBetween(
  'function om({depts:s,onOpenDept:d,spotDept:c}){',
  'function dm({depts:s,onConnect:d}){',
  "om.jsfrag"
);

replaceBetweenAnyEnd(
  'function dm({depts:s,onConnect:d}){',
  [
    'function cm({depts:s}){',
    'function cm({depts:s,onOpenCRM:d,onOpenInbox:l}){',
  ],
  "dm.jsfrag"
);

replaceBetween(
  'function c1({dept:s,onBack:d,reveal:c,onConnect:o,initialTab:u,channel:f,pendingChannel:y,onExpand:b,highlight:x}){',
  'function ur({icon:s,title:d,sub:c}){',
  "c1.jsfrag"
);

replaceBetweenAny(
  ['function cm({depts:s}){','function cm({depts:s,onOpenCRM:d,onOpenInbox:l}){'],
  'function um({deptName:s="Записи",inboxCount:d=0,onOpenInbox:c}){',
  "cm.jsfrag"
);

if (!src.includes('function crmPage({depts:s,onOpenDept:d,initialTab:l}){')) {
  replaceBetween(
    'function hm({items:s,onResolve:d}){',
    'const Oc=196,',
    "hm.jsfrag"
  );
}

replaceBetween(
  'function hm({items:s,onResolve:d}){',
  'function crmPage({depts:s,onOpenDept:d,initialTab:l}){',
  "inbox.jsfrag"
);

replaceExact(
  'const Oc=196,',
  'const Oc=300,',
  "Figma sidebar width"
);

replaceBetween(
  'function us({icon:s,label:d,active:c,isNew:o,trailing:u,onClick:f,spot:y}){',
  'function jm({channel:s,onConfirm:d,onCancel:c}){',
  "us.jsfrag"
);

if (!src.includes('[ve,Re]=g.useState({home:!0,automations:!0,crm:!0,kb:!0,integrations:!0})')) {
  replaceRegex(
    /\[te,le\]=g\.useState\("home"\),(?:\[crmExpanded,setCrmExpanded\]=g\.useState\(!0\),)?\[ve,Re\]=g\.useState\(\{automations:!0(?:,crm:!0)?(?:,kb:!0)?\}\),/,
    '[te,le]=g.useState("home"),[crmExpanded,setCrmExpanded]=g.useState(!0),[ve,Re]=g.useState({home:!0,automations:!0,crm:!0,kb:!0,integrations:!0}),',
    "crm/kb state"
  );
}

if (
  !src.includes(read("sidebar-menu.jsfrag")) &&
  !src.includes("crmExpanded&&e.jsxs") &&
  !src.includes('active:te==="crm:clients"') &&
  !src.includes('label:"Чат с Mary"')
) {
  replaceExact(
    've.automations&&e.jsx(us,{icon:e.jsx(fe,{d:e.jsx("polygon",{points:"13 2 3 14 12 14 11 22 21 10 12 10 13 2"}),size:16}),label:"Автоматизации",isNew:ve.automations==="new",spot:H&&H.spot==="Автоматизации",active:te==="automations",onClick:()=>{le("automations"),Re(q=>({...q,automations:!0}))}}),ve.integrations&&e.jsx(us,{icon:e.jsx(fe,{d:e.jsxs(e.Fragment,{children:[e.jsx("path",{d:"M9 2v6"}),e.jsx("path",{d:"M15 2v6"}),e.jsx("path",{d:"M7 8h10v3a5 5 0 0 1-10 0V8z"}),e.jsx("path",{d:"M12 16v6"})]}),size:16}),label:"Интеграции",isNew:ve.integrations==="new",spot:H&&H.spot==="Интеграции",active:te==="integrations",onClick:()=>{le("integrations"),Re(q=>({...q,integrations:!0}))}}),',
    've.automations&&e.jsx(us,{icon:e.jsx(fe,{d:e.jsx("polygon",{points:"13 2 3 14 12 14 11 22 21 10 12 10 13 2"}),size:16}),label:"Автоматизации",isNew:ve.automations==="new",spot:H&&H.spot==="Автоматизации",active:te==="automations",onClick:()=>{le("automations"),Re(q=>({...q,automations:!0}))}}),ve.crm&&e.jsx(us,{icon:e.jsx(fe,{d:e.jsxs(e.Fragment,{children:[e.jsx("rect",{x:"4",y:"4",width:"7",height:"7",rx:"1.5"}),e.jsx("rect",{x:"13",y:"4",width:"7",height:"7",rx:"1.5"}),e.jsx("rect",{x:"4",y:"13",width:"7",height:"7",rx:"1.5"}),e.jsx("rect",{x:"13",y:"13",width:"7",height:"7",rx:"1.5"})]}),size:16}),label:"CRM",active:te==="crm",onClick:()=>{le("crm"),Re(q=>({...q,crm:!0}))}}),ve.integrations&&e.jsx(us,{icon:e.jsx(fe,{d:e.jsxs(e.Fragment,{children:[e.jsx("path",{d:"M9 2v6"}),e.jsx("path",{d:"M15 2v6"}),e.jsx("path",{d:"M7 8h10v3a5 5 0 0 1-10 0V8z"}),e.jsx("path",{d:"M12 16v6"})]}),size:16}),label:"Интеграции",isNew:ve.integrations==="new",spot:H&&H.spot==="Интеграции",active:te==="integrations",onClick:()=>{le("integrations"),Re(q=>({...q,integrations:!0}))}}),ve.kb&&e.jsx(us,{icon:e.jsx(fe,{d:e.jsxs(e.Fragment,{children:[e.jsx("path",{d:"M4 19.5A2.5 2.5 0 0 1 6.5 17H20"}),e.jsx("path",{d:"M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"})]}),size:16}),label:"База знаний",isNew:ve.kb==="new",spot:H&&H.spot==="База знаний",active:te==="kb",onClick:()=>{le("kb"),Re(q=>({...q,kb:!0}))}}),',
    "crm/kb menu item"
  );
}

if (!src.includes('te.startsWith("crm:")&&e.jsx(crmPage')) {
  replaceExact(
    'te==="automations"&&e.jsx(om,{depts:M,spotDept:H&&H.spot,onOpenDept:q=>{le("dept"),me(q),ee(null)}}),te==="integrations"&&e.jsx(dm,{depts:M,onConnect:(q,_)=>it(q,_)}),',
    'te==="automations"&&e.jsx(om,{depts:M,spotDept:H&&H.spot,onOpenDept:q=>{le("dept"),me(q),ee(null)}}),te.startsWith("crm:")&&e.jsx(crmPage,{depts:M,initialTab:te.slice(4),onOpenDept:q=>{le("dept"),me(q),ee(null)}},te),te==="tasks"&&e.jsx(menuPage,{title:"Задачи",description:"Рабочие задачи команды и действия, которые Mary передала человеку."}),te==="calendar"&&e.jsx(menuPage,{title:"Календарь",description:"Расписание команды, записи клиентов и доступные рабочие окна."}),te==="analytics"&&e.jsx(menuPage,{title:"Аналитика",description:"Результаты автоматизаций, нагрузка команды и вклад Mary в процессы."}),te==="settings"&&e.jsx(menuPage,{title:"Настройки",description:"Параметры компании, уведомлений, доступа и поведения Mary."}),te==="integrations"&&e.jsx(dm,{depts:M,onConnect:(q,_)=>it(q,_)}),',
    "crm page route"
  );
}

replaceExact(
  'te==="kb"&&e.jsx(cm,{depts:M}),',
  'te==="kb"&&e.jsx(cm,{depts:M,onOpenCRM:()=>{le("crm:overview"),Re(q=>({...q,crm:!0}))},onOpenInbox:()=>{le("inbox"),Re(q=>({...q,inbox:!0}))}}),',
  "kb actions route"
);

if (!src.includes('[ve,Re]=g.useState({home:!0,automations:!0,crm:!0,kb:!0,integrations:!0})')) {
  replaceExact(
    '[te,le]=g.useState("home"),[ve,Re]=g.useState({automations:!0,crm:!0,kb:!0}),',
    '[te,le]=g.useState("home"),[crmExpanded,setCrmExpanded]=g.useState(!0),[ve,Re]=g.useState({home:!0,automations:!0,crm:!0,kb:!0,integrations:!0}),',
    "expanded CRM navigation state"
  );
}

replaceExact(
  '[te,le]=g.useState("home"),[crmExpanded,setCrmExpanded]=g.useState(!0),',
  '[te,le]=g.useState("home"),[mobileNavOpen,setMobileNavOpen]=g.useState(!1),[crmExpanded,setCrmExpanded]=g.useState(!0),',
  "mobile navigation state"
);

if (!src.includes(read("sidebar-menu.jsfrag"))) {
  const currentMenuStart='e.jsx(us,{icon:e.jsx("img",{src:"/icons/figma-menu/chat.svg",alt:"",width:16,height:16,style:{display:"block"}}),label:"Чат с Mary"';
  const originalMenuStart='ve.home&&e.jsx(us,{icon:e.jsx(fe,{d:e.jsx("path",{d:"M3 10.8L12 3.5l9 7.3V20a1 1 0 0 1-1 1h-4v-6h-8v6H4a1 1 0 0 1-1-1v-9.2z"}),size:17}),label:"Главная"';
  replaceBetweenAnyEnd(
    src.includes(currentMenuStart)?currentMenuStart:originalMenuStart,
    [
      ']}),e.jsxs("div",{className:"mary-content-shell"',
      ']}),e.jsxs("div",{style:{flex:1,minWidth:0,background:"#fff"',
    ],
    "sidebar-menu.jsfrag"
  );
}

replaceExact(
  'display:"flex",width:"100vw",height:"100vh",background:"#FCFCFC",fontFamily:p1,color:k.text,gap:8,padding:8,boxSizing:"border-box"',
  'display:"flex",width:"100vw",height:"100vh",background:"#F9F9F9",fontFamily:p1,color:k.text,gap:8,padding:"16px 16px 16px 8px",boxSizing:"border-box"',
  "Figma application shell"
);

if (!src.includes('className:"mary-app-shell"')) {
  replaceExact(
    'e.jsxs("div",{style:{display:"flex",width:"100vw",height:"100vh",background:"#F9F9F9",fontFamily:p1,color:k.text,gap:8,padding:"16px 16px 16px 8px",boxSizing:"border-box"},children:[e.jsxs("aside",{style:{width:Oc',
    `e.jsxs("div",{className:"mary-app-shell",style:{display:"flex",width:"100vw",height:"100vh",background:"#F9F9F9",fontFamily:p1,color:k.text,gap:8,padding:"16px 16px 16px 8px",boxSizing:"border-box"},children:[${read("mobile-nav.jsfrag")}e.jsxs("aside",{className:"mary-sidebar",style:{width:Oc`,
    "responsive application shell"
  );
} else if (!src.includes(read("mobile-nav.jsfrag"))) {
  replaceBetween(
    'e.jsx("style",{children:"@media (max-width:720px){.mary-app-shell',
    'e.jsxs("aside",{className:"mary-sidebar"',
    "mobile-nav.jsfrag"
  );
}

replaceExact(
  'width:Oc,minWidth:Oc,background:"#FCFCFC",display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"',
  'width:Oc,minWidth:Oc,background:"#F9F9F9",display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"',
  "Figma sidebar surface"
);

replaceExact(
  'display:"flex",alignItems:"center",padding:"20px 18px 16px"',
  'display:"flex",alignItems:"center",padding:"20px 12px 16px"',
  "Figma logo alignment"
);

replaceExact(
  'background:"#fff",border:"1px solid rgba(38,38,51,0.025)",borderRadius:30,overflow:"hidden",display:"flex"',
  'background:"#fff",border:"1px solid rgba(33,32,37,0.05)",borderRadius:20,overflow:"hidden",display:"flex"',
  "Figma content panel"
);

replaceExact(
  'e.jsxs("div",{style:{flex:1,minWidth:0,background:"#fff",border:"1px solid rgba(33,32,37,0.05)",borderRadius:20,overflow:"hidden",display:"flex"}',
  'e.jsxs("div",{className:"mary-content-shell",style:{flex:1,minWidth:0,background:"#fff",border:"1px solid rgba(33,32,37,0.05)",borderRadius:20,overflow:"hidden",display:"flex"}',
  "responsive content shell"
);

if (!src.includes('te.startsWith("crm:")&&e.jsx(crmPage')) {
  replaceExact(
    'te==="automations"&&e.jsx(om,{depts:M,spotDept:H&&H.spot,onOpenDept:q=>{le("dept"),me(q),ee(null)}}),te==="crm"&&e.jsx(crmPage,{depts:M,onOpenDept:q=>{le("dept"),me(q),ee(null)}}),te==="integrations"&&e.jsx(dm,{depts:M,onConnect:(q,_)=>it(q,_)}),',
    'te==="automations"&&e.jsx(om,{depts:M,spotDept:H&&H.spot,onOpenDept:q=>{le("dept"),me(q),ee(null)}}),te.startsWith("crm:")&&e.jsx(crmPage,{depts:M,initialTab:te.slice(4),onOpenDept:q=>{le("dept"),me(q),ee(null)}},te),te==="tasks"&&e.jsx(menuPage,{title:"Задачи",description:"Рабочие задачи команды и действия, которые Mary передала человеку."}),te==="calendar"&&e.jsx(menuPage,{title:"Календарь",description:"Расписание команды, записи клиентов и доступные рабочие окна."}),te==="analytics"&&e.jsx(menuPage,{title:"Аналитика",description:"Результаты автоматизаций, нагрузка команды и вклад Mary в процессы."}),te==="settings"&&e.jsx(menuPage,{title:"Настройки",description:"Параметры компании, уведомлений, доступа и поведения Mary."}),te==="integrations"&&e.jsx(dm,{depts:M,onConnect:(q,_)=>it(q,_)}),',
    "nested CRM and utility routes"
  );
}

replaceExact(
  'te==="kb"&&e.jsx(cm,{depts:M,onOpenCRM:()=>{le("crm"),Re(q=>({...q,crm:!0}))},onOpenInbox:()=>{le("inbox"),Re(q=>({...q,inbox:!0}))}}),',
  'te==="kb"&&e.jsx(cm,{depts:M,onOpenCRM:()=>{le("crm:overview"),Re(q=>({...q,crm:!0}))},onOpenInbox:()=>{le("inbox"),Re(q=>({...q,inbox:!0}))}}),',
  "knowledge base CRM route"
);

replaceExact(
  'te==="home"&&e.jsx(um,{deptName:M[0]?M[0].name:"Записи",inboxCount:se.length,onOpenInbox:()=>{le("inbox"),Re(q=>({...q,inbox:!0}))}}),',
  'te==="home"&&e.jsx(homePage,{onNavigate:q=>le(q),onAskMary:()=>le("chat")}),',
  "home page route"
);

replaceExact(
  'te==="settings"&&e.jsx(menuPage,{title:"Настройки",description:"Параметры компании, уведомлений, доступа и поведения Mary."}),te==="integrations"',
  'te==="settings"&&e.jsx(menuPage,{title:"Настройки",description:"Параметры компании, уведомлений, доступа и поведения Mary."}),te==="support"&&e.jsx(menuPage,{title:"Поддержка",description:"Помощь по работе Mary и связь с командой поддержки."}),te==="integrations"',
  "support route"
);

fs.writeFileSync(file, src);
console.log("Patched", file);

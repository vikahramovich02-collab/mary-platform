import fs from "node:fs";
import path from "node:path";

const file = "/tmp/index-CLW7J7YJ.js";
const base = path.resolve("scripts/mary8080-fragments");
let src = fs.readFileSync(file, "utf8");

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

replaceBetween(
  'function om({depts:s,onOpenDept:d,spotDept:c}){',
  'function dm({depts:s,onConnect:d}){',
  "om.jsfrag"
);

replaceBetween(
  'function dm({depts:s,onConnect:d}){',
  'function cm({depts:s}){',
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

replaceBetween(
  'function hm({items:s,onResolve:d}){',
  'const Oc=196,',
  "hm.jsfrag"
);

replaceRegex(
  /\[te,le\]=g\.useState\("chat"\),\[ve,Re\]=g\.useState\(\{automations:!0(?:,crm:!0)?(?:,kb:!0)?\}\),/,
  '[te,le]=g.useState("chat"),[ve,Re]=g.useState({automations:!0,crm:!0,kb:!0}),',
  "crm/kb state"
);

replaceExact(
  've.automations&&e.jsx(us,{icon:e.jsx(fe,{d:e.jsx("polygon",{points:"13 2 3 14 12 14 11 22 21 10 12 10 13 2"}),size:16}),label:"Автоматизации",isNew:ve.automations==="new",spot:H&&H.spot==="Автоматизации",active:te==="automations",onClick:()=>{le("automations"),Re(q=>({...q,automations:!0}))}}),ve.integrations&&e.jsx(us,{icon:e.jsx(fe,{d:e.jsxs(e.Fragment,{children:[e.jsx("path",{d:"M9 2v6"}),e.jsx("path",{d:"M15 2v6"}),e.jsx("path",{d:"M7 8h10v3a5 5 0 0 1-10 0V8z"}),e.jsx("path",{d:"M12 16v6"})]}),size:16}),label:"Интеграции",isNew:ve.integrations==="new",spot:H&&H.spot==="Интеграции",active:te==="integrations",onClick:()=>{le("integrations"),Re(q=>({...q,integrations:!0}))}}),',
  've.automations&&e.jsx(us,{icon:e.jsx(fe,{d:e.jsx("polygon",{points:"13 2 3 14 12 14 11 22 21 10 12 10 13 2"}),size:16}),label:"Автоматизации",isNew:ve.automations==="new",spot:H&&H.spot==="Автоматизации",active:te==="automations",onClick:()=>{le("automations"),Re(q=>({...q,automations:!0}))}}),ve.crm&&e.jsx(us,{icon:e.jsx(fe,{d:e.jsxs(e.Fragment,{children:[e.jsx("rect",{x:"4",y:"4",width:"7",height:"7",rx:"1.5"}),e.jsx("rect",{x:"13",y:"4",width:"7",height:"7",rx:"1.5"}),e.jsx("rect",{x:"4",y:"13",width:"7",height:"7",rx:"1.5"}),e.jsx("rect",{x:"13",y:"13",width:"7",height:"7",rx:"1.5"})]}),size:16}),label:"CRM",active:te==="crm",onClick:()=>{le("crm"),Re(q=>({...q,crm:!0}))}}),ve.integrations&&e.jsx(us,{icon:e.jsx(fe,{d:e.jsxs(e.Fragment,{children:[e.jsx("path",{d:"M9 2v6"}),e.jsx("path",{d:"M15 2v6"}),e.jsx("path",{d:"M7 8h10v3a5 5 0 0 1-10 0V8z"}),e.jsx("path",{d:"M12 16v6"})]}),size:16}),label:"Интеграции",isNew:ve.integrations==="new",spot:H&&H.spot==="Интеграции",active:te==="integrations",onClick:()=>{le("integrations"),Re(q=>({...q,integrations:!0}))}}),ve.kb&&e.jsx(us,{icon:e.jsx(fe,{d:e.jsxs(e.Fragment,{children:[e.jsx("path",{d:"M4 19.5A2.5 2.5 0 0 1 6.5 17H20"}),e.jsx("path",{d:"M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"})]}),size:16}),label:"База знаний",isNew:ve.kb==="new",spot:H&&H.spot==="База знаний",active:te==="kb",onClick:()=>{le("kb"),Re(q=>({...q,kb:!0}))}}),',
  "crm/kb menu item"
);

replaceExact(
  'te==="automations"&&e.jsx(om,{depts:M,spotDept:H&&H.spot,onOpenDept:q=>{le("dept"),me(q),ee(null)}}),te==="integrations"&&e.jsx(dm,{depts:M,onConnect:(q,_)=>it(q,_)}),',
  'te==="automations"&&e.jsx(om,{depts:M,spotDept:H&&H.spot,onOpenDept:q=>{le("dept"),me(q),ee(null)}}),te==="crm"&&e.jsx(crmPage,{depts:M,onOpenDept:q=>{le("dept"),me(q),ee(null)}}),te==="integrations"&&e.jsx(dm,{depts:M,onConnect:(q,_)=>it(q,_)}),',
  "crm page route"
);

replaceExact(
  'te==="kb"&&e.jsx(cm,{depts:M}),',
  'te==="kb"&&e.jsx(cm,{depts:M,onOpenCRM:()=>{le("crm"),Re(q=>({...q,crm:!0}))},onOpenInbox:()=>{le("inbox"),Re(q=>({...q,inbox:!0}))}}),',
  "kb actions route"
);

fs.writeFileSync(file, src);
console.log("Patched", file);

import fs from "node:fs";

const sourceFile = "/tmp/index-CLW7J7YJ.js";
const outputFile = "/tmp/index-CLW7J7YJ.demo.js";
let source = fs.readFileSync(sourceFile, "utf8");

function replaceExact(search, replacement, label) {
  if (!source.includes(search)) {
    throw new Error(`Demo pattern not found: ${label}`);
  }
  source = source.replace(search, replacement);
}

replaceExact(
  '[ve,Re]=g.useState({home:!0,automations:!0,crm:!0,kb:!0,integrations:!0})',
  '[ve,Re]=g.useState({})',
  "initial progressive navigation",
);

replaceExact(
  'function _e(){Re(q=>({...q,home:q.home||"new",inbox:q.inbox||"new"}))',
  'function _e(){Re(q=>({...q,home:q.home||"new",inbox:q.inbox||"new",crm:q.crm||"new"}))',
  "final operational navigation reveal",
);

replaceExact(
  'if(j(""),d(K=>K.map(ge=>ge.id===y.current&&ge.title==="Новый чат"?{...ge,title:_.length>40?_.slice(0,40)+"…":_}:ge)),X.current.active){',
  'j(""),d(K=>K.map(ge=>ge.id===y.current&&ge.title==="Новый чат"?{...ge,title:_.length>40?_.slice(0,40)+"…":_}:ge));if(/покажи на примере моего бизнеса|демо салона/i.test(_)){p(K=>[...K,{role:"user",text:_}]),setTimeout(()=>_t("Записи","Instagram"),350);return}if(X.current.active){',
  "deterministic demo entry",
);

fs.writeFileSync(outputFile, source);
console.log(`Built ${outputFile}`);

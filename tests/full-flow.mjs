// E2E full-flow: типичный путь юзера на Mary платформе.
// 8 шагов. Если хоть один валится — где-то регрессия.
import assert from "node:assert/strict";

const BASE = process.env.BASE_URL || "http://77.237.241.242";

const issues = [];
const t = (label, fn) => fn().then(
  () => console.log(`  ✓ ${label}`),
  e => { console.log(`  ✗ ${label}: ${e.message}`); issues.push(`${label}: ${e.message}`); }
);
async function ask(message, history = []) {
  const r = await fetch(`${BASE}/api/mary/agent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

console.log(`\n══════════════ full-flow E2E ${BASE} ══════════════\n`);

// ── ШАГ 1: предусловие — отдел СММ существует ──
console.log("[1] Предусловие: СММ-отдел существует");
const dept = await fetch(`${BASE}/api/mary/departments`).then(r => r.json());
const smm = dept.departments.find(d => d.id === "smm");
await t("отдел smm найден", async () => assert.ok(smm, "no smm"));
await t("в smm >= 3 агентов", async () => assert.ok((smm?.agents || []).length >= 3));
await t("у агентов заполнены model+systemPrompt", async () => {
  const missing = (smm.agents || []).filter(a => !a.model || !a.systemPrompt);
  assert.equal(missing.length, 0, `${missing.length} агентов без профиля`);
});

// ── ШАГ 2: делегация Копирайтеру ──
console.log("\n[2] «напиши пост про AI в SMM» → ask_agent(copywriter)");
const r2 = await ask("напиши короткий пост в @neural_papka про AI в SMM, экспертный тон, 3 строки");
const tools2 = r2.trace.map(x => x.name);
await t("trace содержит ask_agent", async () => assert.ok(tools2.includes("ask_agent"), `tools=${tools2}`));
await t("agentId = copywriter", async () => {
  const a = r2.trace.find(x => x.name === "ask_agent");
  assert.equal(a?.args?.agentId, "copywriter");
});
await t("output копирайтера длинный (>100)", async () => {
  const a = r2.trace.find(x => x.name === "ask_agent");
  assert.ok((a?.result?.output || "").length > 100, `len=${(a?.result?.output||'').length}`);
});
await t("Mary НЕ вызвала write_post после ask_agent", async () => {
  assert.ok(!tools2.includes("write_post"), `tools=${tools2}`);
});
await t("Mary НЕ цитирует output (финал < 400 chars)", async () => {
  assert.ok((r2.text || "").length < 400, `len=${(r2.text||'').length}`);
});

// ── ШАГ 3: ресёрч через ресерчера ──
console.log("\n[3] «сделай ресёрч свежих трендов» → ask_agent(researcher)");
const r3 = await ask("сделай ресёрч свежих трендов в нише AI-tools для маркетологов");
const tools3 = r3.trace.map(x => x.name);
await t("trace содержит ask_agent", async () => assert.ok(tools3.includes("ask_agent")));
await t("agentId = researcher", async () => {
  const a = r3.trace.find(x => x.name === "ask_agent");
  assert.equal(a?.args?.agentId, "researcher");
});

// ── ШАГ 4: multi-agent цепочка ──
console.log("\n[4] Multi-agent: «контент-план на неделю»");
const r4 = await ask("придумай контент-план на неделю: сначала ресёрч горячих тем, потом 3 идеи, потом текст для первой");
const tools4 = r4.trace.map(x => x.name);
const askCalls = r4.trace.filter(x => x.name === "ask_agent");
console.log(`     trace: ${tools4.join(", ")}`);
console.log(`     ask_agent calls: ${askCalls.length} (${askCalls.map(a => a.args?.agentId).join(" → ")})`);
await t("≥2 ask_agent вызова (цепочка)", async () => assert.ok(askCalls.length >= 2, `только ${askCalls.length}`));
await t("в цепочке есть разные агенты", async () => {
  const uniq = new Set(askCalls.map(a => a.args?.agentId));
  assert.ok(uniq.size >= 2, `все ${[...uniq]}`);
});

// ── ШАГ 5: Team chat ──
console.log("\n[5] Team-чат: отправить + AI-reply");
const convs = await fetch(`${BASE}/api/mary/conversations`).then(r => r.json());
const team = (convs.conversations || []).find(c => c.scope?.startsWith("team/") || c.scope?.startsWith("tg/"));
if (!team) {
  await t("есть team/tg чат", async () => { throw new Error("нет — запусти POST /team/seed"); });
} else {
  const beforeLen = (team.messages || []).length;
  const sendR = await fetch(`${BASE}/api/mary/team/send`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId: team.id, text: "[E2E] " + Date.now() }),
  });
  await t("POST /team/send → ok", async () => assert.equal(sendR.status, 200));
  await new Promise(r => setTimeout(r, 300));
  const after = await fetch(`${BASE}/api/mary/conversations/${team.id}`).then(r => r.json());
  await t("сообщение в БД", async () => assert.ok((after.messages?.length || 0) > beforeLen));
}

// ── ШАГ 6: Pipeline edit ──
console.log("\n[6] Mary редактирует pipeline: добавляет узел Маркетологу");
const r6 = await ask("у Маркетолога в СММ-отделе добавь узел 'A/B-тестировщик' типа step после Скорера идей");
const tools6 = r6.trace.map(x => x.name);
await t("Mary вызвала add_pipeline_node", async () => assert.ok(tools6.includes("add_pipeline_node"), `tools=${tools6}`));
const deptAfter = await fetch(`${BASE}/api/mary/departments`).then(r => r.json());
const marketer = deptAfter.departments.find(d => d.id === "smm")?.agents?.find(a => a.id === "marketer");
const addedNode = (marketer?.pipeline?.nodes || []).find(n => /a.b|тест/i.test(n.title));
await t("узел появился в БД", async () => assert.ok(addedNode, `nodes=${(marketer?.pipeline?.nodes||[]).map(n=>n.title).join(", ")}`));

// ── ШАГ 7: Cleanup — удалить добавленный узел ──
if (addedNode) {
  console.log("\n[7] Cleanup: удалить добавленный узел");
  const r7 = await ask(`у Маркетолога в СММ убери узел '${addedNode.title}' (id ${addedNode.id}) и восстанови старые связи`);
  await t("Mary вызвала remove_pipeline_node", async () => {
    assert.ok(r7.trace.some(x => x.name === "remove_pipeline_node"));
  });
  const deptFin = await fetch(`${BASE}/api/mary/departments`).then(r => r.json());
  const marketerFin = deptFin.departments.find(d => d.id === "smm")?.agents?.find(a => a.id === "marketer");
  await t("узел действительно удалён", async () => {
    assert.ok(!marketerFin?.pipeline?.nodes?.find(n => n.id === addedNode.id));
  });
}

// ── ШАГ 8: Health ──
console.log("\n[8] Health");
// /health живёт на корне backend (без префикса /api/mary)
const healthBase = BASE.includes(":5678") ? BASE : BASE.replace(/(:\d+)?$/, ":5678");
const h = await fetch(`${healthBase}/health`).then(r => r.json()).catch(() => null);
await t("backend здоров", async () => assert.ok(h && (h.status === "ok" || h.uptime > 0), `health=${JSON.stringify(h)}`));

// ── ИТОГ ──
console.log("\n══════ ИТОГ ══════");
if (issues.length === 0) console.log("✓ Все проверки прошли");
else { console.log(`✗ Проблем: ${issues.length}`); issues.forEach(i => console.log(`  · ${i}`)); }
process.exit(issues.length > 0 ? 1 : 0);

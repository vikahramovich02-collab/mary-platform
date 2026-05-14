// E2E тест pipeline-редактирования через Mary chat.
// Серия команд → проверка state в БД через GET /departments.
import assert from "node:assert/strict";

const BASE = process.env.BASE_URL || "http://77.237.241.242";

async function ask(message) {
  const r = await fetch(`${BASE}/api/mary/agent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history: [] }),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

async function getResearcherPipeline() {
  const r = await fetch(`${BASE}/api/mary/departments`);
  const d = await r.json();
  const smm = d.departments.find(x => x.id === "smm");
  if (!smm) throw new Error("СММ-отдел не найден");
  const researcher = (smm.agents || []).find(a => a.id === "researcher");
  if (!researcher) throw new Error("Ресерчер в СММ не найден");
  return researcher.pipeline || { nodes: [], edges: [] };
}

const issues = [];
const t = (label, fn) => fn().then(
  () => console.log(`  ✓ ${label}`),
  e => { console.log(`  ✗ ${label}: ${e.message}`); issues.push(`${label}: ${e.message}`); }
);

console.log("\n══════ pipeline-edit E2E ══════\n");

// ── 1. Базовая проверка: у Ресерчера есть pipeline ──
console.log("[1] Базовая инфраструктура");
const initial = await getResearcherPipeline();
await t("у Ресерчера есть nodes",  async () => assert.ok(initial.nodes.length > 0, `nodes=${initial.nodes.length}`));
await t("у Ресерчера есть edges",  async () => assert.ok(initial.edges.length > 0, `edges=${initial.edges.length}`));
await t("есть узел fetcher",       async () => assert.ok(initial.nodes.find(n => n.id === "fetcher")));
await t("есть узел dedup",         async () => assert.ok(initial.nodes.find(n => n.id === "dedup")));
await t("edge dedup→filter есть", async () => {
  const has = initial.edges.some(([f, to]) => f === "dedup" && to === "filter");
  assert.ok(has, "edge dedup→filter не найден");
});

// ── 2. Mary добавляет узел через чат ──
console.log("\n[2] Mary добавляет узел «Спам-фильтр»");
const r1 = await ask('добавь Ресерчеру в СММ-отделе узел "Спам-фильтр" типа step между Дедупликатором (dedup) и Фильтром релевантности (filter)');
console.log(`     Mary: ${(r1.text||"").slice(0, 150)}`);
console.log(`     Tools: ${r1.trace.map(x => x.name).join(", ")}`);
await t("Mary дёрнула add_pipeline_node", async () => {
  assert.ok(r1.trace.some(x => x.name === "add_pipeline_node"), "не было add_pipeline_node");
});
const after1 = await getResearcherPipeline();
const spamNode = after1.nodes.find(n => /спам|spam/i.test(n.title));
await t("узел «Спам-фильтр» появился в БД", async () => assert.ok(spamNode, "узел не найден в pipeline"));

// ── 3. Mary меняет настройки узла ──
if (spamNode) {
  console.log("\n[3] Mary меняет sub-описание Спам-фильтра");
  const r2 = await ask(`у Ресерчера в СММ есть узел "${spamNode.title}" (id ${spamNode.id}). Поменяй ему подзаголовок (sub) на "детектит ботов и реферальный спам"`);
  console.log(`     Mary: ${(r2.text||"").slice(0, 150)}`);
  console.log(`     Tools: ${r2.trace.map(x => x.name).join(", ")}`);
  const after2 = await getResearcherPipeline();
  const spam2 = after2.nodes.find(n => n.id === spamNode.id);
  await t("sub изменился", async () => assert.match(spam2?.sub || "", /бот|спам|реферал/i));
}

// ── 4. Mary удаляет узел ──
if (spamNode) {
  console.log("\n[4] Mary удаляет «Спам-фильтр»");
  const r3 = await ask(`убери у Ресерчера в СММ узел "${spamNode.title}" (id ${spamNode.id}) и восстанови прямую связь dedup → filter`);
  console.log(`     Mary: ${(r3.text||"").slice(0, 150)}`);
  console.log(`     Tools: ${r3.trace.map(x => x.name).join(", ")}`);
  await t("Mary дёрнула remove_pipeline_node", async () => {
    assert.ok(r3.trace.some(x => x.name === "remove_pipeline_node"), "не было remove_pipeline_node");
  });
  const after3 = await getResearcherPipeline();
  await t("узла больше нет", async () => assert.ok(!after3.nodes.find(n => n.id === spamNode.id)));
  await t("edges с ним тоже удалены", async () => {
    const remains = after3.edges.some(([f, to]) => f === spamNode.id || to === spamNode.id);
    assert.ok(!remains, "остались edges на удалённый узел");
  });
}

// ── 5. Проверка что pipeline вернулся к исходному состоянию ──
console.log("\n[5] Sanity: pipeline вернулся к ~начальному");
const final = await getResearcherPipeline();
await t("количество узлов как в начале", async () => {
  assert.equal(final.nodes.length, initial.nodes.length, `before=${initial.nodes.length}, after=${final.nodes.length}`);
});

// ── ИТОГ ──
console.log("\n══════ ИТОГ ══════");
if (issues.length === 0) {
  console.log("✓ Все проверки прошли");
} else {
  console.log(`✗ Проблем: ${issues.length}`);
  issues.forEach(i => console.log(`  · ${i}`));
}
process.exit(issues.length > 0 ? 1 : 0);

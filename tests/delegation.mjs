// E2E тест: Mary правильно делегирует контент-задачу Копирайтеру через ask_agent
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

const issues = [];
const t = (label, fn) => fn().then(
  () => console.log(`  ✓ ${label}`),
  e => { console.log(`  ✗ ${label}: ${e.message}`); issues.push(`${label}: ${e.message}`); }
);

console.log("\n══════ delegation E2E ══════\n");

console.log("[1] «Напиши пост» → должен дёрнуть ask_agent(copywriter)");
const r1 = await ask("напиши короткий пост в @neural_papka про AI в SMM, 3 строки, экспертный тон");
const tools = r1.trace.map(x => x.name);
console.log(`     Tools: ${tools.join(", ") || "(нет)"}`);
console.log(`     Mary text: ${(r1.text || "").slice(0, 100)}`);

await t("ask_agent был вызван", async () => {
  assert.ok(tools.includes("ask_agent"), `ожидали ask_agent, получили: ${tools.join(", ")}`);
});
await t("ask_agent зашёл к copywriter", async () => {
  const ask = r1.trace.find(x => x.name === "ask_agent");
  assert.equal(ask?.args?.agentId, "copywriter", `agentId=${ask?.args?.agentId}`);
});
await t("ask_agent вернул не-пустой output", async () => {
  const ask = r1.trace.find(x => x.name === "ask_agent");
  const out = ask?.result?.output || "";
  assert.ok(out.length > 50, `output слишком короткий: ${out.length} chars`);
});
await t("Mary НЕ вызвала write_post после ask_agent", async () => {
  assert.ok(!tools.includes("write_post"), `Mary дублировала: ${tools.join(", ")}`);
});
await t("Mary НЕ вызвала publish_post после ask_agent", async () => {
  assert.ok(!tools.includes("publish_post"), `Mary самовольно опубликовала: ${tools.join(", ")}`);
});
await t("Финальный текст Mary короткий (подводка)", async () => {
  const txt = r1.text || "";
  assert.ok(txt.length < 400, `Mary говорит слишком много (${txt.length} chars), должна одну строку подводки`);
});

console.log("\n[2] «Придумай идеи» → должен дёрнуть ask_agent(marketer)");
const r2 = await ask("придумай 5 идей постов на ноябрь по теме AI-инструменты для маркетологов");
const tools2 = r2.trace.map(x => x.name);
console.log(`     Tools: ${tools2.join(", ") || "(нет)"}`);
await t("ask_agent зашёл к marketer", async () => {
  const ask = r2.trace.find(x => x.name === "ask_agent");
  assert.equal(ask?.args?.agentId, "marketer", `agentId=${ask?.args?.agentId}`);
});
await t("НЕ вызвала generate_ideas (это работа Маркетолога — он сам)", async () => {
  assert.ok(!tools2.includes("generate_ideas"), `Mary дублировала: ${tools2.join(", ")}`);
});

console.log("\n══════ ИТОГ ══════");
if (issues.length === 0) console.log("✓ Все проверки прошли");
else { console.log(`✗ Проблем: ${issues.length}`); issues.forEach(i => console.log(`  · ${i}`)); }
process.exit(issues.length > 0 ? 1 : 0);

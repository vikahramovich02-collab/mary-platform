// E2E тест: /team/send body endpoint работает с conversationId со слэшами
import assert from "node:assert/strict";

const BASE = process.env.BASE_URL || "http://77.237.241.242";

const issues = [];
const t = (label, fn) => fn().then(
  () => console.log(`  ✓ ${label}`),
  e => { console.log(`  ✗ ${label}: ${e.message}`); issues.push(`${label}: ${e.message}`); }
);

console.log("\n══════ team-send E2E ══════\n");

// 1. Найти команду или TG чат
const convs = await fetch(`${BASE}/api/mary/conversations`).then(r => r.json());
const team = (convs.conversations || []).find(c => c.scope?.startsWith("team/") || c.scope?.startsWith("tg/"));
console.log(`[1] Чат для теста: ${team?.id} (${team?.title}, scope=${team?.scope})`);

if (!team) {
  console.log("✗ Нет team/tg чатов — сначала /api/mary/team/seed");
  process.exit(1);
}

// 2. Отправить через новый body-endpoint
console.log("[2] POST /team/send с body { conversationId, text }");
const beforeLen = (team.messages || []).length;
const sendRes = await fetch(`${BASE}/api/mary/team/send`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ conversationId: team.id, text: "тест от E2E " + Date.now() }),
});
const sendData = await sendRes.json();
console.log(`     status=${sendRes.status} body=${JSON.stringify(sendData)}`);
await t("status 200", async () => assert.equal(sendRes.status, 200));
await t("ok: true", async () => assert.equal(sendData.ok, true));

// 3. Проверить что сообщение реально появилось в БД
await new Promise(r => setTimeout(r, 300));
const after = await fetch(`${BASE}/api/mary/conversations/${team.id}`).then(r => r.json());
console.log(`[3] Сообщений до: ${beforeLen}, после: ${after.messages?.length}`);
await t("сообщение добавилось в БД", async () => {
  assert.ok((after.messages?.length || 0) > beforeLen, `messages.length=${after.messages?.length}`);
});
await t("последнее сообщение содержит E2E текст", async () => {
  const last = after.messages?.[after.messages.length - 1];
  assert.ok(last?.text?.includes("тест от E2E"), `last.text=${last?.text}`);
});

// 4. Проверить что 404 для несуществующего id
console.log("[4] 404 для несуществующего conversationId");
const r404 = await fetch(`${BASE}/api/mary/team/send`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ conversationId: "team/nonexistent-" + Date.now(), text: "hi" }),
});
await t("404 для несуществующего", async () => assert.equal(r404.status, 404));

console.log("\n══════ ИТОГ ══════");
if (issues.length === 0) console.log("✓ Все проверки прошли");
else { console.log(`✗ Проблем: ${issues.length}`); issues.forEach(i => console.log(`  · ${i}`)); }
process.exit(issues.length > 0 ? 1 : 0);

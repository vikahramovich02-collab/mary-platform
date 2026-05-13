// Тест self-onboarding flow для нового отдела.
// Имитирует диалог: юзер пишет → Mary спрашивает контекст → юзер отвечает → Mary собирает.
import assert from "node:assert/strict";

const BASE = process.env.BASE_URL || "http://77.237.241.242";
const fetchJson = async (url, opts) => {
  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
};

// Создаём conversation для теста
const conv = await fetchJson(`${BASE}/api/mary/conversations`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ scope: "general", title: "Test onboarding " + Date.now() }),
});
console.log(`✓ Conversation: ${conv.id}\n`);

async function ask(message) {
  const start = Date.now();
  const r = await fetchJson(`${BASE}/api/mary/agent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      history: [],   // history будет подтянута через conversationId — но /agent его не использует.
                     // Для чистоты использую /agent напрямую и веду историю сам:
    }),
  });
  const dur = Math.round((Date.now() - start) / 1000);
  console.log(`👤: ${message}`);
  console.log(`🐶 (${dur}s, ${r.trace.length} tools): ${r.text?.slice(0, 250)}`);
  if (r.trace.length) {
    for (const t of r.trace) {
      const args = JSON.stringify(t.args, null, 0).slice(0, 70);
      console.log(`    ⚙ ${t.name}(${args}) → ${t.durationMs}ms`);
    }
  }
  console.log();
  return r;
}

// /agent endpoint не использует conversationId, нужен /agent/stream + ручной history.
// Для теста проще — упростим: дёргаем /agent с собственной историей в body.
async function askWithHistory(history, message) {
  const r = await fetchJson(`${BASE}/api/mary/agent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  return r;
}

console.log("══════════════ ОНБОРДИНГ ОТДЕЛА: Mary должна сначала расспросить ══════════════\n");

let history = [];
async function step(userText) {
  history.push({ agentId: "user", text: userText });
  const r = await askWithHistory(history.slice(0, -1), userText);
  history.push({ agentId: "mary", text: r.text || "" });
  console.log(`👤: ${userText}`);
  console.log(`🐶 (${r.trace.length} tools, ${r.durationMs}ms):`);
  console.log(`   ${(r.text || "").slice(0, 400).replace(/\n/g, "\n   ")}`);
  if (r.trace.length) {
    for (const t of r.trace) {
      console.log(`   ⚙ ${t.name}(${JSON.stringify(t.args).slice(0, 80)}) → ${t.durationMs}ms`);
    }
  }
  console.log();
  return r;
}

// Сценарий: создаём отдел Поддержки
await step("создай мне отдел Поддержки");
await step("у нас SaaS для управления командами, ~200 клиентов, поддержка пишет в Intercom + email. Сейчас 1 человек на поддержке, тонет в простых вопросах");
await step("главная боль — повторяющиеся вопросы 'где найти X', 'как сделать Y'. Хочу чтоб AI отвечал на это, эскалировал только сложные");
await step("каналы: Intercom (главный), email support@, по необходимости Telegram-бот для VIP. Решения по эскалации принимает Виктория");

console.log("══════════════ ИТОГ ══════════════\n");
const departments = await fetchJson(`${BASE}/api/mary/departments`);
const support = departments.departments.find(d => d.id.includes("поддержк") || d.id.includes("support"));
if (support) {
  console.log(`✓ Отдел создан: ${support.name}`);
  console.log(`  Каналы (${support.channels.length}): ${support.channels.map(c => c.name).join(", ")}`);
  console.log(`  Агенты (${support.agents.length}): ${support.agents.map(a => a.role).join(", ")}`);
  console.log(`  Интеграции (${support.integrations.length}): ${support.integrations.join(", ")}`);
  console.log(`  Status: ${support.status}`);
} else {
  console.log("✗ Отдел Поддержки не найден в БД");
}

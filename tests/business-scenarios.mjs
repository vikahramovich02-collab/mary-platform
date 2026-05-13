// Бизнес-сценарии — проверяем Mary как полноценный инструмент.
// Цель: понять где она «дотягивает», где врёт, где медленная, где ломается.
// Каждый сценарий — multi-turn разговор имитирующий реального юзера.

const BASE = process.env.BASE_URL || "http://77.237.241.242";
const issues = [];
const stats = [];

async function ask(history, message, label) {
  const start = Date.now();
  try {
    const r = await fetch(`${BASE}/api/mary/agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    });
    if (!r.ok) {
      issues.push({ label, problem: `HTTP ${r.status}` });
      return { text: "", trace: [], durationMs: Date.now() - start };
    }
    const d = await r.json();
    return { ...d, durationMs: Date.now() - start };
  } catch (e) {
    issues.push({ label, problem: "fetch failed: " + e.message });
    return { text: "", trace: [], durationMs: Date.now() - start };
  }
}

async function scenario(id, name, fn) {
  console.log(`\n══════ [${id}] ${name} ══════`);
  const start = Date.now();
  try { await fn(); } catch (e) { issues.push({ label: id, problem: "FATAL: " + e.message }); }
  console.log(`   ⏱ ${Math.round((Date.now() - start) / 1000)}s`);
}

// ── B1: Поиск в БЗ ────────────────────────────────────────
await scenario("B1", "Поиск в БЗ — есть ли вообще файлы и видит ли Mary их", async () => {
  const r = await ask([], "что у меня есть в базе знаний?", "B1");
  console.log(`   Mary: ${(r.text||"").slice(0, 250)}`);
  const usedKb = r.trace.some(t => t.name === "kb_list");
  if (!usedKb) issues.push({ label: "B1", problem: "Mary НЕ дёрнула kb_list — отвечает наугад" });
  if (r.durationMs > 30000) issues.push({ label: "B1", problem: `медленно: ${r.durationMs}ms` });
  stats.push({ id: "B1", duration: r.durationMs, tools: r.trace.length });
});

// ── B2: Делегирование задачи СММ-агенту ───────────────────
await scenario("B2", "Делегирование — поставить задачу маркетологу", async () => {
  const r = await ask([], "поставь задачу маркетологу: придумать 3 идеи постов на эту неделю", "B2");
  console.log(`   Mary: ${(r.text||"").slice(0, 250)}`);
  console.log(`   Tools: ${r.trace.map(t=>t.name).join(", ")}`);
  // Должна либо сама дёрнуть get_research_insights / read_chat / agent-tool, либо явно сказать «передам маркетологу через X»
  if (r.trace.length === 0 && !/передам|маркетол|задач/i.test(r.text||"")) {
    issues.push({ label: "B2", problem: "Mary проигнорила запрос или ответила generic" });
  }
  stats.push({ id: "B2", duration: r.durationMs, tools: r.trace.length });
});

// ── B3: Чтение чата отдела ───────────────────────────────
await scenario("B3", "Multi-source — глянь что в чате СММ и что в БЗ, и сделай вывод", async () => {
  const r = await ask([], "почитай чат СММ-отдела — какие задачи в работе, и что свежего в базе знаний?", "B3");
  console.log(`   Mary: ${(r.text||"").slice(0, 300)}`);
  console.log(`   Tools: ${r.trace.map(t=>t.name).join(", ")}`);
  const usedRead = r.trace.some(t => t.name === "read_chat");
  const usedKb = r.trace.some(t => t.name === "kb_list" || t.name === "kb_read");
  if (!usedRead) issues.push({ label: "B3", problem: "Mary не прочитала чат СММ" });
  if (!usedKb) issues.push({ label: "B3", problem: "Mary не глянула БЗ" });
  stats.push({ id: "B3", duration: r.durationMs, tools: r.trace.length });
});

// ── B4: Метрики ──────────────────────────────────────────
await scenario("B4", "Метрики — покажи топ постов за неделю", async () => {
  const r = await ask([], "какие у меня самые удачные посты в ТГ-канале за последние 7 дней?", "B4");
  console.log(`   Mary: ${(r.text||"").slice(0, 300)}`);
  console.log(`   Tools: ${r.trace.map(t=>t.name).join(", ")}`);
  const usedInsights = r.trace.some(t => t.name === "get_research_insights" || t.name === "list_posts");
  if (!usedInsights) issues.push({ label: "B4", problem: "Mary не дёрнула get_research_insights/list_posts" });
  stats.push({ id: "B4", duration: r.durationMs, tools: r.trace.length });
});

// ── B5: Multi-turn память ────────────────────────────────
await scenario("B5", "Память контекста — Mary запоминает что я ей сказала ранее", async () => {
  let history = [];
  const r1 = await ask(history, "у меня бренд называется Mary и я Head of SMM в IT-стартапе", "B5.1");
  history.push({ agentId: "user", text: "у меня бренд называется Mary и я Head of SMM в IT-стартапе" });
  history.push({ agentId: "mary", text: r1.text });
  const r2 = await ask(history, "напомни как меня зовут и где работаю?", "B5.2");
  console.log(`   Mary: ${(r2.text||"").slice(0, 250)}`);
  if (!/Mary|стартап|SMM|Head/i.test(r2.text)) {
    issues.push({ label: "B5", problem: "Mary забыла что я ей сказала: " + (r2.text || "").slice(0, 80) });
  }
  stats.push({ id: "B5", duration: r2.durationMs, tools: r2.trace.length });
});

// ── B6: Восстановление от смены темы ─────────────────────
await scenario("B6", "Смена темы — без потери контекста, с возвратом", async () => {
  let history = [];
  const r1 = await ask(history, "помоги собрать контент-план на ноябрь", "B6.1");
  history.push({ agentId: "user", text: "помоги собрать контент-план на ноябрь" });
  history.push({ agentId: "mary", text: r1.text });
  const r2 = await ask(history, "погоди, сначала покажи метрики прошлого месяца", "B6.2");
  history.push({ agentId: "user", text: "погоди, сначала покажи метрики прошлого месяца" });
  history.push({ agentId: "mary", text: r2.text });
  const r3 = await ask(history, "ок, теперь продолжим про контент-план — на чём мы остановились?", "B6.3");
  console.log(`   Mary: ${(r3.text||"").slice(0, 250)}`);
  if (!/контент|план|ноябр/i.test(r3.text)) {
    issues.push({ label: "B6", problem: "Mary забыла про контент-план после смены темы" });
  }
});

// ── B7: Auto-approve работает (юзер явно отказался от подтверждений)
await scenario("B7", "Auto-approve — Mary публикует когда сказано, не спрашивает", async () => {
  const r = await ask([], "опубликуй любой пост в ТГ-канал прямо сейчас", "B7");
  console.log(`   Mary: ${(r.text||"").slice(0, 250)}`);
  console.log(`   Tools: ${r.trace.map(t=>t.name).join(", ")}`);
  // Должна либо опубликовать (auto-approve), либо честно сказать «нет канала/контента»
  // НЕ должна спрашивать «уверена?», «согласна?», «публикуем?»
  const asksApproval = /уверен|согласн|публикуем\?|готова\?|подтверд/i.test(r.text || "");
  if (asksApproval) issues.push({ label: "B7", problem: "Mary спрашивает апрув — auto-approve не работает" });
});

// ── B8: Длинный ответ — не разваливается ─────────────────
await scenario("B8", "Длинный ответ — Mary не обрывает на полу-фразе", async () => {
  const r = await ask([], "напиши очень развёрнутый план как собрать SMM-отдел с нуля для IT-стартапа: команда, процессы, инструменты, метрики, KPI — каждый пункт по 3-4 предложения", "B8");
  const text = r.text || "";
  console.log(`   Длина: ${text.length} симв., занимает ${r.durationMs}ms`);
  // Признаки обрыва: текст обрывается на середине, без точки в конце, упоминание max_tokens
  const lastChar = text.trim().slice(-1);
  if (text.length < 200) issues.push({ label: "B8", problem: `подозрительно короткий: ${text.length} симв.` });
  if (![".", "!", "?", ":", ")"].includes(lastChar)) {
    issues.push({ label: "B8", problem: `обрыв в конце: ...${text.slice(-50)}` });
  }
  stats.push({ id: "B8", duration: r.durationMs, tools: r.trace.length, length: text.length });
});

// ── B9: Идентичность — Mary знает что она Mary ──────────
await scenario("B9", "Идентичность — Mary не путает себя с GPT/Claude", async () => {
  const r = await ask([], "ты кто? кто тебя сделал?", "B9");
  console.log(`   Mary: ${(r.text||"").slice(0, 250)}`);
  if (/я (chatgpt|gpt-|claude|anthropic|openai|llama|google)/i.test(r.text||"")) {
    issues.push({ label: "B9", problem: "Mary назвала себя моделью провайдера: " + (r.text||"").slice(0, 80) });
  }
  if (!/mary/i.test(r.text||"")) {
    issues.push({ label: "B9", problem: "Mary не назвала себя Mary" });
  }
});

// ── B10: Параллельность tools ────────────────────────────
await scenario("B10", "Composability — Mary дёргает несколько инструментов в одном запросе", async () => {
  const r = await ask([], "дай свежий ресёрч ТГ-канала и заодно напомни что лежит в БЗ", "B10");
  console.log(`   Mary: ${(r.text||"").slice(0, 250)}`);
  console.log(`   Tools: ${r.trace.map(t=>t.name).join(", ")}`);
  if (r.trace.length < 2) {
    issues.push({ label: "B10", problem: `всего ${r.trace.length} tool вызвано, ожидалось ≥2` });
  }
});

// ── ИТОГ ────────────────────────────────────────────────
console.log("\n\n══════════════════ ИТОГ ══════════════════\n");
console.log("Производительность:");
stats.forEach(s => console.log(`  [${s.id}] ${s.duration}ms · ${s.tools} tools${s.length ? " · "+s.length+" chars" : ""}`));

console.log(`\n📊 Среднее время: ${Math.round(stats.reduce((a,s)=>a+s.duration,0)/stats.length)}ms`);
console.log(`📊 Макс время: ${Math.max(...stats.map(s=>s.duration))}ms`);

if (issues.length === 0) {
  console.log("\n✓ Все сценарии прошли без проблем");
} else {
  console.log(`\n⚠ Найдено ${issues.length} проблем(ы):`);
  issues.forEach(i => console.log(`  · [${i.label}] ${i.problem}`));
}
process.exit(issues.length > 0 ? 1 : 0);

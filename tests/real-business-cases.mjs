// Прогон Mary на реальных бизнес-запросах из ресёрча /Users/vika/Downloads/01-03_*.html
// Цель: найти где Mary ломается / не понимает / врёт / медленная.
// Каждый кейс — реалистичный one-shot запрос типичного клиента.

const BASE = process.env.BASE_URL || "http://77.237.241.242";
const issues = [];
const stats = [];

async function ask(message, label) {
  const start = Date.now();
  try {
    const r = await fetch(`${BASE}/api/mary/agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history: [] }),
    });
    if (!r.ok) {
      issues.push({ label, problem: `HTTP ${r.status}` });
      return { text: "", trace: [], durationMs: Date.now() - start };
    }
    const d = await r.json();
    return { ...d, durationMs: Date.now() - start };
  } catch (e) {
    issues.push({ label, problem: "fetch: " + e.message });
    return { text: "", trace: [], durationMs: Date.now() - start };
  }
}

const cases = [
  // ── Топ-12 базовых ──
  ["1С",          "подключи нас к 1С: проводки, документы, остатки, отчёты"],
  ["Битрикс",     "нам нужна интеграция с Битрикс24 — сделки, задачи, телефония"],
  ["Аналитика",   "загружу свой Excel и Postgres — собери дашборды и алёрты"],
  ["AI-продажник","настрой AI-продажника в Telegram, WA, Авито — за живых менеджеров"],
  ["Контент-АП",  "генерируй посты под TG, IG, VK и автопостинг по расписанию"],
  ["МКТ-аналитика","сквозная воронка от показа до выручки: ROAS, CAC, LTV, дашборды"],
  ["Конкуренты",  "регулярный конкурент-ресёрч: кто на рынке, что делают, чем отличаются"],
  ["Дайджест",    "каждое утро дайджест из TG-каналов, X, YouTube — западные источники"],
  ["Автозаполн",  "автозаполнение КП, счетов, актов, договоров, табелей по нашим шаблонам"],
  ["HR",          "HR-агент: поиск, скрининг, интервью, онбординг"],
  ["IoT",         "подключи к станкам через OPC UA, MTConnect — телеметрия и OEE"],
  ["NPS",         "автосбор NPS / CSAT и реакций на фичи — еженедельно"],
  // ── Расширенные ──
  ["Первичка",    "распознай pdf-счёта и закидывай в 1С"],
  ["Дебиторка",   "кто из клиентов нам должен — напиши им и эскалируй юристу через 14 дней"],
  ["Контрагенты", "проверь нового контрагента через СПАРК / rusprofile"],
  ["WB",          "управление ценами на WB: мониторинг, авто-пересчёт"],
  ["Травел",      "забукай мне командировку: билеты, отель, такси, виза"],
  ["Маршруты",    "маршрутизация курьеров через Яндекс — VRP, трекинг"],
];

console.log(`Прогоняю ${cases.length} реальных бизнес-кейсов...\n`);

for (const [id, msg] of cases) {
  console.log(`── ${id} ──`);
  const r = await ask(msg, id);
  const text = (r.text || "").trim();
  const tools = r.trace.map(t => t.name);
  console.log(`👤 ${msg.slice(0, 70)}`);
  console.log(`🐶 ${text.slice(0, 200)}${text.length > 200 ? "…" : ""}`);
  console.log(`   ⚙ tools: [${tools.join(", ") || "—"}] · ${r.durationMs}ms · ${text.length} chars`);

  // Диагностика
  if (!text) issues.push({ label: id, problem: "пустой ответ" });
  if (text.length < 50) issues.push({ label: id, problem: `слишком короткий: ${text.length} chars` });
  if (/прервалась на полпути|слишком много шагов|запутывалась/i.test(text)) {
    issues.push({ label: id, problem: "graceful-fallback (зацикливание)" });
  }
  if (r.durationMs > 30000) issues.push({ label: id, problem: `медленно: ${Math.round(r.durationMs/1000)}с` });
  // «Я не умею / нет такого функционала» — для топовых сценариев это плохо
  if (/не могу|не умею|пока нет|у меня нет такой возможности|не реализовано/i.test(text)) {
    issues.push({ label: id, problem: `Mary говорит «не умею»: ${text.slice(0, 120)}` });
  }
  // Разрыв ожидания — клиент просит конкретное действие, а Mary только болтает
  const hasAction = tools.length > 0 || /создаю|настраиваю|подключ|собираю|готов(о|и)|сделал/i.test(text);
  if (!hasAction && !/уточн|вопрос|расскажи/i.test(text)) {
    issues.push({ label: id, problem: "без действия и без вопросов — пустая болтовня" });
  }

  stats.push({ id, ms: r.durationMs, tools: tools.length, len: text.length });
  console.log();
}

// ── ИТОГ ──
console.log("\n══════════ ИТОГ ══════════\n");
console.log("Производительность:");
stats.forEach(s => console.log(`  ${s.id.padEnd(14)} ${String(s.ms).padStart(6)}ms · ${s.tools} tools · ${s.len} chars`));
console.log(`\n📊 Среднее: ${Math.round(stats.reduce((a,s)=>a+s.ms,0)/stats.length)}ms · макс: ${Math.max(...stats.map(s=>s.ms))}ms`);
console.log(`📊 Без tools: ${stats.filter(s=>s.tools===0).length}/${stats.length} кейсов (Mary просто отвечает текстом)`);

if (issues.length === 0) {
  console.log("\n✓ Все кейсы отработаны без явных проблем");
} else {
  // Группируем по типу проблемы
  const byProblem = {};
  for (const i of issues) {
    const key = i.problem.split(":")[0].split(" ").slice(0, 4).join(" ");
    (byProblem[key] = byProblem[key] || []).push(i);
  }
  console.log(`\n⚠ Проблемы (${issues.length} штук):`);
  Object.entries(byProblem).forEach(([k, arr]) => {
    console.log(`\n  ${k} × ${arr.length}:`);
    arr.slice(0, 6).forEach(i => console.log(`    · [${i.label}] ${i.problem.slice(0, 100)}`));
  });
}

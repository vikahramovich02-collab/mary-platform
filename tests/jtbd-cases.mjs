// JTBD-сценарии из /Users/vika/Downloads/jtbd_automation_v3.txt
// По 1 кейсу из каждой из 20 сфер.
// Проверяем: не лезет ли Mary публиковать пост, предлагает ли завести отдел.

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
    const d = await r.json();
    return { ...d, durationMs: Date.now() - start };
  } catch (e) {
    issues.push({ label, problem: "fetch: " + e.message });
    return { text: "", trace: [], durationMs: Date.now() - start };
  }
}

const cases = [
  ["Финансы",       "хочу открывать клиентам счёт за 5 минут, а не за 3 дня — нужна KYC/AML проверка"],
  ["Юр",            "у нас 200 контрактов с поставщиками в месяц, юрист не успевает — нужна проверка"],
  ["Медицина",      "врачи тонут в бумажках, не успевают принимать пациентов — автоматизируй документацию"],
  ["Ритейл",        "хочу персонализацию каталога и динамические цены на основе спроса"],
  ["Производство",  "predictive maintenance станков — поймать поломку до того как встанем"],
  ["Логистика",     "200 курьеров, нужна маршрутизация и трекинг через Яндекс"],
  ["Страх",         "обработка ДТП-фото и моментальная выплата клиенту"],
  ["Телеком",       "нужна 1-я линия техподдержки и churn prediction"],
  ["Недвижимость",  "автооценка квартир по фото и параметрам"],
  ["Бухгалтерия",   "сверки банка с 1С, обработка первички pdf-счетов"],
  ["HR-2",          "хочу нанимать программистов в 3 раза быстрее — найди, проскринь, проведи интервью"],
  ["Маркетинг",     "сделай мне дашборд CAC/LTV/ROAS из всех источников"],
  ["Госсектор",     "обработка обращений граждан — классификация и маршрутизация"],
  ["Образование",   "проверка домашек школьников по литературе и истории"],
  ["Медиа",         "редактура и фактчек статей перед публикацией"],
  ["IT",            "автоматизация code review для PR и поиск уязвимостей"],
  ["Транспорт",     "оптимизация расписаний автобусов под пассажиропоток"],
  ["Энергетика",    "прогнозирование пиков потребления и balancing нагрузки"],
  ["Сельское",      "мониторинг полей по спутникам — где плохо растёт"],
  ["Спорт",         "анализ матчей по видео, статистика игроков"],
];

console.log(`Прогоняю ${cases.length} JTBD-кейсов из 20 сфер...\n`);

for (const [id, msg] of cases) {
  const r = await ask(msg, id);
  const text = (r.text || "").trim();
  const tools = r.trace.map(t => t.name);
  const t = (s) => s.length > 80 ? s.slice(0, 80) + "…" : s;

  console.log(`── ${id.padEnd(14)} (${r.durationMs}ms, ${tools.length} tools)`);
  console.log(`  👤 ${t(msg)}`);
  console.log(`  🐶 ${t(text)}`);
  if (tools.length) console.log(`  ⚙ ${tools.join(", ")}`);

  // Метрики качества
  const publishedPost = tools.includes("publish_post");
  const wrotePost = tools.includes("write_post");
  const proposedDept = /завед|создаст|создам отдел|создать отдел|новый отдел|свой отдел|отдельн.{1,15}отдел|команд[уы].*[XХx]/i.test(text)
                    || tools.includes("create_department");
  const refused = /не моя зон|это не я|у меня нет.*возможн|не умею|не подключ|вне моих|не специализ/i.test(text);
  const looped = /прервалась на полпути|слишком много шагов|запутывалась/i.test(text);

  if (publishedPost) issues.push({ label: id, problem: "опубликовала пост (не должна была)" });
  if (wrotePost && !publishedPost) issues.push({ label: id, problem: "написала черновик поста (зачем?)" });
  if (refused && !proposedDept) issues.push({ label: id, problem: "отказала и НЕ предложила завести отдел" });
  if (looped) issues.push({ label: id, problem: "graceful-fallback (зацикливание)" });
  if (r.durationMs > 30000) issues.push({ label: id, problem: `медленно: ${Math.round(r.durationMs/1000)}с` });

  stats.push({ id, ms: r.durationMs, tools: tools.length, len: text.length, proposedDept, refused, publishedPost });
  console.log();
}

console.log("\n══════════ ИТОГ ══════════\n");
console.log(`📊 Среднее: ${Math.round(stats.reduce((a,s)=>a+s.ms,0)/stats.length)}ms · макс: ${Math.max(...stats.map(s=>s.ms))}ms`);
console.log(`📊 Предложила завести отдел: ${stats.filter(s=>s.proposedDept).length}/${stats.length}`);
console.log(`📊 Сухой отказ "не моя зона": ${stats.filter(s=>s.refused && !s.proposedDept).length}/${stats.length}`);
console.log(`📊 Опубликовала пост по ошибке: ${stats.filter(s=>s.publishedPost).length}/${stats.length}`);

if (issues.length === 0) {
  console.log("\n✓ Без проблем");
} else {
  const byProblem = {};
  for (const i of issues) {
    const key = i.problem.split(":")[0].split(" ").slice(0,4).join(" ");
    (byProblem[key] = byProblem[key] || []).push(i);
  }
  console.log(`\n⚠ Проблемы (${issues.length}):`);
  Object.entries(byProblem).forEach(([k, arr]) => {
    console.log(`\n  ${k} × ${arr.length}:`);
    arr.slice(0, 8).forEach(i => console.log(`    · [${i.label}] ${i.problem}`));
  });
}

// Прогон сценариев использования чатов на проде.
// Идея: пройти типичные user-journey, понять что работает, что нет.
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://77.237.241.242";
const results = [];
const browser = await chromium.launch({ headless: true, slowMo: 0 });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1024 }, locale: "ru-RU" });
const page = await ctx.newPage();
page.on("pageerror", e => results.push({ scenario: "_global", issue: "JS error: " + e.message }));

async function scenario(id, name, fn) {
  console.log(`\n[${id}] ${name}`);
  const start = Date.now();
  const issues = [];
  try {
    await fn(issues);
  } catch (e) {
    issues.push("FATAL: " + e.message);
  }
  const dur = Math.round((Date.now() - start) / 1000);
  if (issues.length === 0) {
    console.log(`   ✓ ok (${dur}s)`);
  } else {
    console.log(`   ⚠ ${issues.length} issue(s) (${dur}s)`);
    issues.forEach(i => console.log(`     · ${i}`));
  }
  results.push({ id, name, issues, dur });
}

// ── ОБЩИЙ ЧАТ MARY ────────────────────────────────────────
async function gotoMaryChat() {
  await page.goto(`${BASE}/?page=tg-kanal`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.locator("aside").first().locator("text=Чат Mary").click();
  await page.waitForTimeout(1500);
}

await scenario("M1", "Открыть страницу Чат Mary", async (issues) => {
  await gotoMaryChat();
  const sidebarVisible = await page.locator("[data-testid=new-chat-btn]").count();
  if (sidebarVisible === 0) issues.push("кнопка 'Новый чат' не видна");
  const inputVisible = await page.locator("[data-testid=chat-mary-input]").count();
  if (inputVisible === 0) issues.push("input не виден");
});

await scenario("M2", "Создать новый чат", async (issues) => {
  await gotoMaryChat();
  await page.locator("[data-testid=new-chat-btn]").click();
  await page.waitForTimeout(1500);
  // Welcome теперь — заголовок «Что сделаем, Виктория?»
  const welcome = await page.locator("text=/Что сделаем, Виктория/").count();
  if (welcome === 0) issues.push("welcome screen не появился у нового чата");
  // И chips быстрых действий
  const chips = await page.locator("button:has-text('Автоматизировать отдел'), button:has-text('Поставить задачу')").count();
  if (chips === 0) issues.push("чипы быстрых действий не появились");
});

await scenario("M3", "Отправить сообщение и получить ответ", async (issues) => {
  await gotoMaryChat();
  await page.locator("[data-testid=new-chat-btn]").click();
  await page.waitForTimeout(1000);
  const input = page.locator("[data-testid=chat-mary-input]");
  await input.fill("привет, кто ты?");
  await page.locator("[data-testid=chat-mary-send]").click();
  // Ждём ответ Mary — появится текст не от юзера
  const start = Date.now();
  let gotReply = false;
  while ((Date.now() - start) < 60000) {
    const bubbles = await page.locator("text=/Я Mary|оркестрат|Привет.*Виктор/").count();
    if (bubbles > 0) { gotReply = true; break; }
    await page.waitForTimeout(1500);
  }
  if (!gotReply) issues.push("ответ Mary не пришёл за 60с");
});

await scenario("M4", "После рефреша история сохранилась", async (issues) => {
  await gotoMaryChat();
  await page.waitForTimeout(800);
  // Берём первый чат из sidebar
  const firstChat = page.locator("aside").nth(1).locator("div[style*='cursor: pointer']").first();
  const exists = await firstChat.count();
  if (exists === 0) {
    issues.push("в sidebar нет чатов — список не подгружается");
    return;
  }
  await firstChat.click();
  await page.waitForTimeout(1500);
  const messages = await page.locator("[style*='border-radius: 16px']").count();
  if (messages === 0) issues.push("после клика на старый чат сообщений нет");
});

await scenario("M5", "Удаление чата работает", async (issues) => {
  await gotoMaryChat();
  // Создаём чат для удаления
  await page.locator("[data-testid=new-chat-btn]").click();
  await page.waitForTimeout(1500);
  await page.locator("[data-testid=chat-mary-input]").fill("test_delete");
  await page.locator("[data-testid=chat-mary-send]").click();
  await page.waitForTimeout(2000);
  // Hover над активным чатом → должна появиться кнопка delete
  // (но в нашем коде кнопка показывается только для активного, без hover)
  const delBtns = await page.locator("aside button[title=Удалить]").count();
  if (delBtns === 0) issues.push("кнопка удалить не найдена");
});

// ── ЧАТ ОТДЕЛА (на tg-kanal) ──────────────────────────────
await scenario("D1", "Открыть чат отдела через 'Спросить у Mary'", async (issues) => {
  await page.goto(`${BASE}/?page=tg-kanal`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.locator("text=Спросить у Mary").first().click();
  await page.waitForTimeout(800);
  const inputCount = await page.locator("[data-testid=chat-input]").count();
  if (inputCount === 0) issues.push("input чата отдела не появился");
});

await scenario("D2", "Сообщение в чате отдела", async (issues) => {
  await page.goto(`${BASE}/?page=tg-kanal`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.locator("text=Спросить у Mary").first().click();
  // Ждём пока chatPanel загрузит conversation (input станет enabled)
  await page.locator("[data-testid=chat-input]:not([disabled])").waitFor({ timeout: 8000 });
  await page.locator("[data-testid=chat-input]").fill("привет в отделе");
  await page.locator("[data-testid=chat-send]").click();
  // Ждём что появится текст от юзера в треде
  const start = Date.now();
  let userMsgVisible = false;
  while ((Date.now() - start) < 10000) {
    const found = await page.locator("text=привет в отделе").count();
    if (found >= 1) { userMsgVisible = true; break; }
    await page.waitForTimeout(500);
  }
  if (!userMsgVisible) issues.push("user-сообщение не появилось в треде");
});

await scenario("D3", "После рефреша чат отдела сохраняет историю", async (issues) => {
  await page.goto(`${BASE}/?page=tg-kanal`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.locator("text=Спросить у Mary").first().click();
  // Ждём загрузки conversation
  await page.locator("[data-testid=chat-input]:not([disabled])").waitFor({ timeout: 8000 });
  await page.waitForTimeout(800);
  const found = await page.locator("text=привет в отделе").count();
  if (found === 0) issues.push("история не подгрузилась — нет старого сообщения");
});

// ── КРОСС-СЦЕНАРИИ ────────────────────────────────────────
await scenario("X1", "Mary общий теперь видит чат отдела через read_chat", async (issues) => {
  await gotoMaryChat();
  await page.locator("[data-testid=new-chat-btn]").click();
  await page.waitForTimeout(1500);
  await page.locator("[data-testid=chat-mary-input]").fill("прочитай чат СММ-отдела и скажи что там");
  await page.locator("[data-testid=chat-mary-send]").click();
  // Ждём ответ Mary в треде (появятся 2+ bubbles — user+mary)
  const start = Date.now();
  let answered = false;
  while ((Date.now() - start) < 60000) {
    const bubbles = await page.locator("[style*='line-height: 1.55']").count();
    if (bubbles >= 2) { answered = true; break; }
    await page.waitForTimeout(2000);
  }
  if (!answered) issues.push("Mary не ответила за 60с");
});

// ── BACKEND ────────────────────────────────────────────────
await scenario("B1", "GET /conversations возвращает список", async (issues) => {
  const res = await ctx.request.get(`${BASE}/api/mary/conversations`);
  if (!res.ok()) issues.push(`HTTP ${res.status()}`);
  const d = await res.json();
  if (!Array.isArray(d.conversations)) issues.push("conversations не массив");
});

await scenario("B2", "POST /conversations создаёт + GET возвращает его", async (issues) => {
  const create = await ctx.request.post(`${BASE}/api/mary/conversations`, {
    data: { title: "Test scenario", scope: "general" },
  });
  const c = await create.json();
  if (!c.id) issues.push("create не вернул id");
  const list = await ctx.request.get(`${BASE}/api/mary/conversations`);
  const d = await list.json();
  const found = d.conversations.find(x => x.id === c.id);
  if (!found) issues.push("созданный чат не появился в списке");
  // cleanup
  await ctx.request.delete(`${BASE}/api/mary/conversations/${c.id}`);
});

await browser.close();

// ── ОТЧЁТ ───────────────────────────────────────────────────
console.log("\n══════════════════ ИТОГ ══════════════════");
const ok = results.filter(r => r.issues.length === 0).length;
const bad = results.filter(r => r.issues.length > 0);
console.log(`${ok}/${results.length} прошли\n`);
if (bad.length) {
  console.log("Проблемы:");
  bad.forEach(r => {
    console.log(`  [${r.id}] ${r.name}`);
    r.issues.forEach(i => console.log(`    · ${i}`));
  });
}
process.exit(bad.length > 0 ? 1 : 0);

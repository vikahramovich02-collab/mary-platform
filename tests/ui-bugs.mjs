// Расширенный UI-прогон: ищем визуальные баги в чате.
// Запуск: node tests/ui-bugs.mjs
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://77.237.241.242";

const browser = await chromium.launch({ headless: false, slowMo: 100 });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1024 }, locale: "ru-RU" });
const page = await ctx.newPage();

const errors = [];
page.on("pageerror", e => errors.push("page error: " + e.message));
page.on("console", msg => {
  if (msg.type() === "error") errors.push("console error: " + msg.text());
});

console.log(`→ ${BASE}/?page=tg-kanal`);
await page.goto(`${BASE}/?page=tg-kanal`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

// Сценарий: открыть чат, отправить сообщение, наблюдать
console.log("\n[T1] Click 'Спросить у Mary'");
await page.locator("text=Спросить у Mary").first().click();
await page.waitForTimeout(800);

console.log("[T2] Send a message");
const ta = page.locator("[data-testid=chat-input]");
await ta.waitFor({ timeout: 5000 });
await ta.fill("дай 2 идеи постов");
await page.screenshot({ path: "tests/snap-before-send.png" });

const sendBtn = page.locator("[data-testid=chat-send]");
await sendBtn.click();
console.log("   sent");

// Ждать пока typing-индикатор появится
await page.waitForTimeout(2000);
await page.screenshot({ path: "tests/snap-typing.png" });

// Дать Mary поработать — ждём появления карточки идей
console.log("[T3] Waiting for ideas card (max 180s)");
const start = Date.now();
let cardSeen = false;
while ((Date.now() - start) < 180000) {
  const ideas = await page.locator("text=/Подобрал|Идеи на след|Берём в работу/").count();
  if (ideas > 0) { cardSeen = true; break; }
  await page.waitForTimeout(3000);
}
const elapsed = Math.round((Date.now() - start) / 1000);
console.log(`   waited ${elapsed}s, ideas card seen: ${cardSeen}`);
await page.screenshot({ path: "tests/snap-after.png", fullPage: true });

// Проверки на баги
console.log("\n=== ПРОВЕРКИ ===");

// 1. Карточка идей появилась?
const ideasCardCount = await page.locator("text=/Идеи на след|Подобрал/").count();
console.log(`  ideas card visible: ${ideasCardCount > 0 ? "✓" : "✗ НЕТ КАРТОЧКИ"}`);

// 2. Tool-status исчез?
const toolStatusActive = await page.locator("text=/Передаю|Запрашиваю|Ищу|Создаю|Публикую/").count();
console.log(`  tool status cleaned: ${toolStatusActive === 0 ? "✓" : `✗ ${toolStatusActive} active`}`);

// 3. Курсор пропал?
const cursors = await page.evaluate(() => document.querySelectorAll('[style*="maryblink"]').length);
console.log(`  blinking cursors: ${cursors === 0 ? "✓" : `✗ ${cursors} still blinking`}`);

// 4. JS errors?
console.log(`  JS errors: ${errors.length === 0 ? "✓" : `✗ ${errors.length}`}`);
if (errors.length) errors.slice(0, 5).forEach(e => console.log(`    ! ${e}`));

await page.waitForTimeout(2000);
await browser.close();
console.log("\nскриншоты в tests/snap-*.png");

// Проверяет что в UI чата Mary онбординг-вопросы рендерятся как кликабельные опции.
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://77.237.241.242";
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1024 }, locale: "ru-RU" });
const page = await ctx.newPage();
page.on("pageerror", e => console.log("JS ERROR:", e.message));

await page.goto(`${BASE}/?page=tg-kanal`);
await page.waitForTimeout(800);
await page.locator("aside").first().locator("text=Чат Mary").click();
await page.waitForTimeout(1500);

// Создаём свежий чат для онбординга
await page.locator("[data-testid=new-chat-btn]").click();
await page.waitForTimeout(1000);

// Шлём триггер на онбординг
await page.locator("[data-testid=chat-mary-input]").fill("создай мне отдел Аналитики");
await page.locator("[data-testid=chat-mary-send]").click();

// Ждём пока Mary ответит (≥30 сек на reasoning)
console.log("⏳ Жду ответ Mary с опциями...");
const start = Date.now();
let optionButtonsCount = 0;
while ((Date.now() - start) < 60000) {
  // Ищем button с текстом, начинающимся на цифру (наш chip опций)
  optionButtonsCount = await page.locator("button:has-text('SaaS'), button:has-text('Маркетплейс'), button:has-text('Другое')").count();
  if (optionButtonsCount >= 2) break;
  await page.waitForTimeout(1500);
}

console.log(`\n📊 Найдено кнопок-опций: ${optionButtonsCount}`);

// Скриншот для верификации
await page.screenshot({ path: "/tmp/onboarding-options.png", fullPage: false });
console.log("📸 Скриншот: /tmp/onboarding-options.png");

// Тест клика по первой опции
if (optionButtonsCount > 0) {
  console.log("\n🖱  Клик по первой опции...");
  const firstOpt = page.locator("button:has-text('SaaS')").first();
  const optText = await firstOpt.textContent();
  console.log(`   Кликаю: "${optText.slice(0, 50)}"`);
  await firstOpt.click();
  await page.waitForTimeout(2000);
  // Проверяем что user-сообщение появилось в треде
  const userBubbles = await page.locator("text=" + optText.replace(/\d+/g, "").trim().slice(0, 20)).count();
  console.log(`   User-bubble с этим текстом: ${userBubbles >= 2 ? "✓ есть (echo + клик)" : "⚠ только Mary написала"}`);

  // Ждём следующий ответ
  console.log("⏳ Жду следующий вопрос Mary...");
  const start2 = Date.now();
  let nextOpts = 0;
  while ((Date.now() - start2) < 60000) {
    nextOpts = await page.locator("button:has-text('%'), button:has-text('Меньше'), button:has-text('Большинство'), button:has-text('Другое')").count();
    if (nextOpts >= 2) break;
    await page.waitForTimeout(1500);
  }
  console.log(`📊 Опций после клика: ${nextOpts}`);
  await page.screenshot({ path: "/tmp/onboarding-options-2.png", fullPage: false });
  console.log("📸 Скриншот после клика: /tmp/onboarding-options-2.png");
}

await browser.close();
process.exit(optionButtonsCount >= 2 ? 0 : 1);

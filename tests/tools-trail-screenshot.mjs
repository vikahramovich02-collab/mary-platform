import { chromium } from "playwright";
const BASE = "http://77.237.241.242";
const browser = await chromium.launch({ headless: true });
const page = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "ru-RU" }).then(c => c.newPage());
page.on("pageerror", e => console.log("JS:", e.message));
await page.goto(`${BASE}/?page=tg-kanal`);
await page.waitForTimeout(800);
await page.locator("aside").first().locator("text=Чат Mary").click();
await page.waitForTimeout(800);
await page.locator("[data-testid=new-chat-btn]").click();
await page.waitForTimeout(1500);
await page.locator("[data-testid=chat-mary-input]").fill("посмотри что в базе знаний и какие задачи в чате СММ — сделай сводку");
await page.locator("[data-testid=chat-mary-send]").click();
console.log("⏳ Жду ответ...");
// Жду пока появятся как минимум 2 tool строки в трейле
const start = Date.now();
while ((Date.now() - start) < 60000) {
  const trailItems = await page.locator("text=/Смотрю|Открываю|Читаю|Ищу/").count();
  if (trailItems >= 2) break;
  await page.waitForTimeout(1000);
}
await page.waitForTimeout(3000);
await page.screenshot({ path: "/tmp/tools-trail.png" });
console.log("📸 /tmp/tools-trail.png");
await browser.close();

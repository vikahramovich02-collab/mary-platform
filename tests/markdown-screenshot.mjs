import { chromium } from "playwright";
const BASE = "http://77.237.241.242";
const browser = await chromium.launch({ headless: true });
const page = await browser.newContext({ viewport: { width: 1440, height: 900 } }).then(c => c.newPage());
page.on("pageerror", e => console.log("JS:", e.message));
await page.goto(`${BASE}/?page=chat-mary`);
await page.waitForTimeout(800);
await page.locator("[data-testid=new-chat-btn]").click();
await page.waitForTimeout(1500);
await page.locator("[data-testid=chat-mary-input]").fill("дай мне развёрнутый план SMM-стратегии для IT-стартапа: цели, аудитория, форматы, метрики — с заголовками, списками и примерами. Используй markdown.");
await page.locator("[data-testid=chat-mary-send]").click();
console.log("⏳ Жду полный ответ Mary...");
const start = Date.now();
while ((Date.now() - start) < 90000) {
  const stopBtn = await page.locator("[data-testid=chat-mary-stop]").count();
  if (stopBtn === 0) break; // Stop пропал = ответ закончен
  await page.waitForTimeout(2000);
}
await page.waitForTimeout(2000);
await page.screenshot({ path: "/tmp/markdown.png", fullPage: false });
console.log("📸 /tmp/markdown.png");
await browser.close();

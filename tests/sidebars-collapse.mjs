import { chromium } from "playwright";
const BASE = process.env.BASE_URL || "http://77.237.241.242";
const browser = await chromium.launch({ headless: true });
const page = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "ru-RU" }).then(c => c.newPage());
page.on("pageerror", e => console.log("JS:", e.message));
await page.goto(`${BASE}/?page=tg-kanal`);
await page.waitForTimeout(800);
await page.locator("aside").first().locator("text=Чат Mary").click();
await page.waitForTimeout(800);
await page.screenshot({ path: "/tmp/sb-1-default.png" });
console.log("📸 1 — default");

// Скрыть сайдбар чатов
await page.locator("button[title='Скрыть список чатов']").click();
await page.waitForTimeout(400);
await page.screenshot({ path: "/tmp/sb-2-chats-collapsed.png" });
console.log("📸 2 — список чатов скрыт");

// Скрыть главный сайдбар
await page.locator("button[title='Скрыть сайдбар']").click();
await page.waitForTimeout(400);
await page.screenshot({ path: "/tmp/sb-3-both-collapsed.png" });
console.log("📸 3 — оба скрыты");

// Раскрыть обратно
await page.locator("button[title='Раскрыть сайдбар']").click();
await page.waitForTimeout(300);
await page.locator("button[title='Раскрыть список чатов']").click();
await page.waitForTimeout(400);
await page.screenshot({ path: "/tmp/sb-4-restored.png" });
console.log("📸 4 — обратно раскрыто");

await browser.close();

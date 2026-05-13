import { chromium } from "playwright";
const BASE = process.env.BASE_URL || "http://77.237.241.242";
const browser = await chromium.launch({ headless: true });
const page = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "ru-RU" }).then(c => c.newPage());
page.on("pageerror", e => console.log("JS:", e.message));
await page.goto(`${BASE}/?page=tg-kanal`);
await page.waitForTimeout(800);
await page.locator("aside").first().locator("text=Чат Mary").click();
await page.waitForTimeout(800);
await page.locator("[data-testid=new-chat-btn]").click();
await page.waitForTimeout(1500);
await page.screenshot({ path: "/tmp/welcome-1.png" });
console.log("📸 /tmp/welcome-1.png — сразу после открытия");
// Подождём немного чтобы typewriter напечатал
await page.waitForTimeout(3000);
await page.screenshot({ path: "/tmp/welcome-2.png" });
console.log("📸 /tmp/welcome-2.png — после typewriter");
await browser.close();

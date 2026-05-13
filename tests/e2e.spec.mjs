// E2E smoke-тесты для frontend Mary платформы.
// Реальный browser ходит на прод и проверяет UI.
// Запуск: node tests/e2e.spec.mjs
import { chromium } from "playwright";
import assert from "node:assert/strict";

const BASE = process.env.BASE_URL || "http://77.237.241.242";
const VIEWPORT = { width: 1440, height: 900 };

let browser, ctx, page;
let passed = 0, failed = 0;

async function test(name, fn) {
  process.stdout.write(`  · ${name} ... `);
  try {
    await fn();
    passed++;
    console.log("✓");
  } catch (e) {
    failed++;
    console.log(`✗ ${e.message}`);
  }
}

console.log(`\n🐶 E2E tests on ${BASE}`);

browser = await chromium.launch({ headless: true });
ctx = await browser.newContext({ viewport: VIEWPORT, locale: "ru-RU" });
page = await ctx.newPage();

// 1. Главная грузится без 500
await test("home page returns 200 and has Mary brand", async () => {
  const res = await page.goto(`${BASE}/?page=tg-kanal`);
  assert.equal(res.status(), 200, `HTTP ${res.status()}`);
  const html = await page.content();
  assert.ok(html.includes("mary") || html.includes("Mary"), "не нашёл слово Mary");
  await page.waitForTimeout(1500);
});

// 2. Видны 5 агентов
await test("graph shows 5 agents", async () => {
  for (const name of ["Ресерчер", "Маркетолог", "Копирайтер", "Дизайнер", "Аналитик"]) {
    const found = await page.locator(`text=${name}`).count();
    assert.ok(found >= 1, `не нашёл агента "${name}" на странице`);
  }
});

// 3. Drawer Tasks открывается через правый рейл
await test("rail Tasks drawer opens", async () => {
  await page.locator("text=Задачи").first().click({ timeout: 3000 });
  await page.waitForTimeout(800);
  // После открытия drawer'а должно быть видно "Задачи отдела"
  const found = await page.locator("text=/Задачи отдела|Крон-задачи|В работе/").count();
  assert.ok(found >= 1, "drawer Tasks не открылся / нет ожидаемого контента");
});

// 4. Чип «Спросить у Mary» виден
await test("chat chip is visible", async () => {
  await page.goto(`${BASE}/?page=tg-kanal`);
  await page.waitForTimeout(1000);
  const found = await page.locator("text=Спросить у Mary").count();
  assert.ok(found >= 1, "не нашёл чип 'Спросить у Mary'");
});

// 5. Backend health через прокси /api/mary
await test("backend reachable via /api/mary proxy", async () => {
  const res = await page.evaluate(async () => {
    const r = await fetch("/api/mary/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "test" }),
    });
    return { status: r.status, body: await r.json() };
  });
  assert.equal(res.status, 200, `proxy → backend HTTP ${res.status}`);
  assert.ok(res.body.text || res.body.agentId, "ответ от backend некорректный");
});

await browser.close();

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

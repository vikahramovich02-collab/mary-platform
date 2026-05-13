// Снимает скриншоты всех ключевых состояний платформы Mary.
// Складывает в /Users/vika/Desktop/mary/mary/snapshots/
//
// Usage:
//   node scripts/snap-screens.mjs                  # с прода
//   BASE=http://localhost:3000 node scripts/snap-screens.mjs   # с локалки

import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE || "http://77.237.241.242";
const OUT_DIR = path.join(process.cwd(), "snapshots");
const VIEWPORT = { width: 1440, height: 1024 };

fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: VIEWPORT,
  deviceScaleFactor: 2, // ретина для красивых картинок
  locale: "ru-RU",
});
const page = await context.newPage();

let count = 0;
async function snap(slug, prep) {
  console.log(`📸 ${slug}...`);
  await page.goto(`${BASE}/?page=tg-kanal`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700); // дать UI устаканиться
  if (prep) await prep(page);
  await page.waitForTimeout(500);
  const file = path.join(OUT_DIR, `${String(++count).padStart(2, "0")}-${slug}.png`);
  await page.screenshot({ path: file, fullPage: false });
}

// Helpers
const click = async (sel) => { try { await page.click(sel, { timeout: 3000 }); } catch (e) { console.warn(`  ! не кликнулось ${sel}: ${e.message}`); } };
const clickByText = async (text) => {
  try {
    await page.locator(`text=${text}`).first().click({ timeout: 3000 });
  } catch (e) {
    console.warn(`  ! не кликнулось "${text}"`);
  }
};

// ── Сценарии ──
await snap("home-default");

await snap("rail-tasks", async () => {
  await clickByText("Задачи");
});
await snap("rail-kb", async () => {
  await clickByText("База");
});
await snap("rail-integrations", async () => {
  await clickByText("Интеграции");
});
await snap("rail-agents", async () => {
  await clickByText("Агенты");
});
await snap("rail-people", async () => {
  await clickByText("Люди");
});

// Чат варианты — сначала dock, потом раскрыть в side
await snap("chat-docked", async () => {
  await clickByText("Спросить у Mary");
});

await snap("agent-drilled", async () => {
  // Кликаем на Ресерчера
  await page.locator("text=Ресерчер").first().click({ timeout: 3000 });
});

// Страница БЗ
await snap("page-kb", async () => {
  await page.locator(".sidebar, aside").first().waitFor({ timeout: 2000 }).catch(() => {});
  await clickByText("База знаний");
});

// Страница Интеграции
await snap("page-integrations", async () => {
  await clickByText("Интеграции");
});

// Страница Задачи
await snap("page-tasks", async () => {
  // Это тот пункт «Задачи» в основном сайдбаре, а не в правом рейле
  const sidebar = page.locator("aside").first();
  await sidebar.locator("text=Задачи").click({ timeout: 3000 });
});

await browser.close();

const files = fs.readdirSync(OUT_DIR).filter(f => f.endsWith(".png")).sort();
console.log(`\n✓ Готово: ${files.length} скриншотов в ${OUT_DIR}`);
files.forEach(f => console.log(`  · ${f}`));

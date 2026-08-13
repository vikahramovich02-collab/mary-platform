import { chromium } from "playwright";
import assert from "node:assert/strict";

const base = process.env.BASE_URL || "http://127.0.0.1:4178";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1050 }, deviceScaleFactor: 1 });
const errors = [];
page.on("pageerror", (error) => errors.push(error.stack || error.message));

await page.goto(base, { waitUntil: "networkidle" });
await page.getByRole("button", { name: "База знаний" }).click();
await page.getByRole("heading", { name: "База знаний" }).waitFor();
await page.screenshot({ path: "/private/tmp/mary-kb-list.png", fullPage: true });

await page.getByText("Услуги и цены", { exact: true }).click();
await page.getByRole("dialog", { name: "Источник Услуги и цены" }).waitFor();
await page.screenshot({ path: "/private/tmp/mary-kb-drawer.png", fullPage: true });
await page.getByRole("button", { name: "Закрыть карточку" }).click();

await page.getByRole("button", { name: "Добавить знания с Mary" }).click();
await page.getByRole("dialog", { name: "Добавить знания" }).waitFor();
await page.screenshot({ path: "/private/tmp/mary-kb-add.png", fullPage: true });
await page.getByRole("button", { name: "Закрыть", exact: true }).click();

await page.setViewportSize({ width: 390, height: 844 });
await page.reload({ waitUntil: "networkidle" });
await page.getByRole("button", { name: "Открыть меню" }).click();
await page.getByRole("dialog", { name: "Навигация Mary" }).getByRole("button", { name: "База знаний" }).click();
await page.getByRole("heading", { name: "База знаний" }).waitFor();
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
assert.ok(overflow <= 1, `Горизонтальное переполнение: ${overflow}px`);
await page.screenshot({ path: "/private/tmp/mary-kb-mobile.png", fullPage: true });

assert.deepEqual(errors, []);
await browser.close();

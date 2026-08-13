import { chromium } from "playwright";
import assert from "node:assert/strict";

const base = process.env.BASE_URL || "http://127.0.0.1:4178";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 2068, height: 1462 },
  deviceScaleFactor: 1,
});
const errors = [];
page.on("pageerror", (error) => errors.push(error.stack || error.message));

await page.goto(base, { waitUntil: "networkidle" });
await page.getByRole("heading", { name: "Главная" }).waitFor();
await page.screenshot({ path: "/private/tmp/mary-home-desktop.png", fullPage: true });

await page.getByLabel("Период").selectOption("Неделя");
assert.equal(await page.getByLabel("Период").inputValue(), "Неделя");

await page.getByRole("button", { name: "Спросить Mary" }).click();
await page.getByRole("dialog", { name: "Спросить Mary" }).waitFor();
await page.getByRole("button", { name: "Закрыть" }).click();

await page.getByRole("button", { name: /Подтвердить перенос записи/ }).click();
await page.getByText("Контекст обращения", { exact: true }).waitFor();
await page.getByRole("button", { name: "Главная" }).click();

await page.setViewportSize({ width: 390, height: 844 });
await page.reload({ waitUntil: "networkidle" });
await page.getByRole("heading", { name: "Главная" }).waitFor();
const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
);
assert.ok(overflow <= 1, `Горизонтальное переполнение: ${overflow}px`);
await page.screenshot({ path: "/private/tmp/mary-home-mobile.png", fullPage: true });

assert.deepEqual(errors, []);
await browser.close();

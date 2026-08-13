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
await page.getByRole("button", { name: "Входящие" }).click();
await page.getByText("Контекст обращения", { exact: true }).waitFor();
await page.screenshot({
  path: "/private/tmp/mary-inbox-desktop.png",
  fullPage: true,
});

await page.getByRole("button", { name: "Новые 12" }).click();
await page.getByText("Оксана Дранеевич", { exact: true }).waitFor();
await page.getByRole("button", { name: /Оксана Дранеевич/ }).click();
await page.getByLabel("Переписка с Оксана Дранеевич").waitFor();

await page.getByRole("button", { name: "Настроить с Mary" }).click();
await page
  .getByRole("dialog", { name: "Настроить входящие с Mary" })
  .waitFor();
await page.getByRole("button", { name: "Закрыть" }).click();

await page.reload({ waitUntil: "networkidle" });
await page.getByRole("button", { name: "Входящие" }).click();
await page.getByRole("button", { name: "Подтвердить перенос" }).click();
await page.getByText("Запись перенесена на пятницу, 18:00. Клиенту отправлено подтверждение.").waitFor();

await page.setViewportSize({ width: 390, height: 844 });
await page.reload({ waitUntil: "networkidle" });
await page.getByRole("button", { name: "Открыть меню" }).click();
await page
  .getByRole("dialog", { name: "Навигация Mary" })
  .getByRole("button", { name: "Входящие" })
  .click();
await page.getByRole("navigation", { name: "Очередь обращений" }).waitFor();
await page.getByRole("button", { name: /Даниела/ }).click();
await page.getByLabel("Переписка с Даниела").waitFor();
const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
);
assert.ok(overflow <= 1, `Горизонтальное переполнение: ${overflow}px`);
await page.screenshot({
  path: "/private/tmp/mary-inbox-mobile.png",
  fullPage: true,
});

assert.deepEqual(errors, []);
await browser.close();

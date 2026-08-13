import { chromium } from "playwright";
import assert from "node:assert/strict";

const base = process.env.BASE_URL || "http://127.0.0.1:4178";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));

try {
  await page.goto(base, { waitUntil: "networkidle" });
  await page.getByText("Процессы", { exact: true }).first().click();
  await page.getByText("Запись клиентов", { exact: true }).first().click();

  await page.getByText("Отдел работает", { exact: true }).waitFor();
  await page.getByRole("button", { name: /Подключения/ }).click();
  await page.getByText("Google Calendar", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Настроить с Mary" }).click();
  await page.getByText("Mary · Отдел «Запись клиентов»", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Закрыть панель Mary" }).click();
  await page.screenshot({ path: "/private/tmp/mary-department-active.png", fullPage: true });

  const more = page.getByRole("button", { name: "Дополнительные действия" });
  await more.click();
  await page.getByRole("menu", { name: "Дополнительные действия процесса" }).waitFor();
  assert.equal(await more.getAttribute("aria-expanded"), "true");

  await page.getByRole("menuitem", { name: "История запусков" }).click();
  await page.getByText("Кем запущено", { exact: true }).waitFor();
  await page.getByRole("button", { name: "← К сценарию" }).click();

  await more.click();
  await page.getByRole("menuitem", { name: "Дублировать процесс" }).click();
  await page.getByRole("status").waitFor();
  assert.match(await page.getByRole("status").innerText(), /Создана копия/);

  await more.click();
  await page.keyboard.press("Escape");
  assert.equal(await more.getAttribute("aria-expanded"), "false");

  await more.click();
  await page.getByRole("menuitem", { name: "Поставить на паузу" }).click();
  const dialog = page.getByRole("dialog", { name: "Поставить процесс на паузу?" });
  await dialog.waitFor();
  assert.match(await dialog.innerText(), /Влияние изменения/);
  await dialog.getByRole("button", { name: "Поставить на паузу" }).click();
  await page.getByText("Отдел на паузе", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Возобновить с Mary" }).waitFor();

  await page.screenshot({ path: "/private/tmp/mary-department-paused.png", fullPage: true });

  await page.getByText("Автоматизации", { exact: true }).click();
  await page.getByText("Возврат клиентов", { exact: true }).first().click();
  await page.getByText("Требуется завершить настройку", { exact: true }).waitFor();
  await page.getByText("Назначить подтверждающего", { exact: true }).waitFor();
  await page.screenshot({ path: "/private/tmp/mary-department-setup.png", fullPage: true });

  await page.getByText("Автоматизации", { exact: true }).click();
  await page.getByText("Поддержка клиентов", { exact: true }).first().click();
  await page.getByText("Telegram не отвечает", { exact: true }).waitFor();
  await page.screenshot({ path: "/private/tmp/mary-department-error.png", fullPage: true });
  await page.getByRole("button", { name: "Проверить подключение" }).click();
  await page.getByText("Отдел работает", { exact: true }).waitFor();

  assert.deepEqual(pageErrors, []);
} finally {
  await browser.close();
}

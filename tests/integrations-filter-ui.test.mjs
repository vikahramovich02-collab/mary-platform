import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";

const source = await readFile(
  new URL("../scripts/mary8080-fragments/dm.jsfrag", import.meta.url),
  "utf8",
);

test("фильтры интеграций используют компактный клиентский pill-паттерн", () => {
  assert.match(source, /height:36,padding:"0 14px"/);
  assert.match(source, /gap:8,flexWrap:"wrap"/);
  assert.match(
    source,
    /border:u===m\.id\?"1px solid transparent":"1px solid rgba\(38,38,51,0\.1\)"/,
  );
  assert.match(
    source,
    /background:u===m\.id\?"rgba\(38,38,51,0\.075\)":"#fff"/,
  );
  assert.match(source, /fontSize:13\.5/);
});

test("счётчик подключённых отделён от подписи", () => {
  assert.match(
    source,
    /\{id:"connected",label:"Подключённые",count:connectedCount\}/,
  );
  assert.match(source, /m\.count!=null/);
  assert.match(source, /fontSize:12\.5/);
});

test("сервисы используют узнаваемые локальные бренд-иконки", () => {
  for (const icon of ["instagram", "telegram", "whatsapp", "google-calendar", "google-sheets"]) {
    assert.match(source, new RegExp(`/icons/integrations/${icon}\\.svg`));
  }
  assert.match(source, /crm:e\.jsx\("span"/);
  assert.match(source, /children:icons\[m\.id\]/);
  assert.doesNotMatch(source, /children:wc/);
  assert.match(source, /children:"Подключения"/);
  assert.match(source, /placeholder:"Искать подключения"/);
});

test("бренд-иконки оформлены как современные app-плитки", () => {
  assert.match(source, /const BrandIcon=/);
  assert.match(source, /borderRadius:9/);
  assert.match(source, /filter:"brightness\(0\) invert\(1\)"/);
  assert.match(source, /linear-gradient\(145deg,#7C3AED 0%,#E1306C 52%,#FCAF45 100%\)/);
  assert.match(source, /boxShadow:"inset 0 1px rgba\(255,255,255,0\.28\), 0 1px 2px rgba\(20,20,28,0\.1\)"/);
});

test("каждая интеграция объясняет данные, действия, авторизацию и результат", () => {
  for (const id of ["instagram", "telegram", "whatsapp", "calendar", "sheets", "crm"]) {
    assert.match(source, new RegExp(`id:"${id}"`));
  }
  assert.match(source, /auth:"Вход через Meta Business"/);
  assert.match(source, /auth:"Подключение бота через BotFather"/);
  assert.match(source, /auth:"Вход через Google"/);
  assert.match(source, /permissions:\[/);
  assert.match(source, /uses:\[/);
  assert.match(source, /result:"База остаётся в CRM/);
});

test("подключение проходит три понятных шага и завершается карточкой состояния", () => {
  assert.match(source, /Подключение · шаг \$\{step\} из 3/);
  assert.match(source, /Mary получит/);
  assert.match(source, /Mary сможет/);
  assert.match(source, /Разрешения/);
  assert.match(source, /Проверим перед запуском/);
  assert.match(source, /Тестовое подключение готово/);
  assert.match(source, /Подключение работает/);
  assert.match(source, /Последняя синхронизация/);
});

test("CRM поддерживает YCLIENTS без полного переноса базы", () => {
  assert.match(source, /name:"YCLIENTS \/ CRM"/);
  assert.match(source, /\["YCLIENTS","amoCRM","Битрикс24","Другая CRM"\]/);
  assert.match(source, /Полная база не копируется/);
  assert.match(source, /Не выгружать всю базу в Mary/);
  assert.match(source, /Mary хранит внешний ID/);
});

test("отключение показывает влияние и сохраняет историю", () => {
  assert.match(source, /role:"alertdialog"/);
  assert.match(source, /Новые данные перестанут поступать/);
  assert.match(source, /Уже полученная история сохранится/);
  assert.match(source, /confirmDisconnect/);
});

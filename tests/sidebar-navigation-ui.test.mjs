import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";

const source = await readFile(
  new URL("../scripts/mary8080-fragments/sidebar-menu.jsfrag", import.meta.url),
  "utf8",
);
const itemSource = await readFile(
  new URL("../scripts/mary8080-fragments/us.jsfrag", import.meta.url),
  "utf8",
);
const mobileSource = await readFile(
  new URL("../scripts/mary8080-fragments/mobile-nav.jsfrag", import.meta.url),
  "utf8",
);

test("сайдбар использует композицию меню главной без группы CRM", () => {
  assert.doesNotMatch(source, /label:"CRM"/);
  assert.doesNotMatch(source, /crmExpanded&&/);
  assert.doesNotMatch(source, /paddingLeft:18/);
  assert.doesNotMatch(source, /children:"Компания"/);
});

test("показывает разделы Figma в правильном порядке", () => {
  const labels = [...source.matchAll(/label:"([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(labels, [
    "Главная",
    "Чат",
    "Процессы",
    "Входящие",
    "Клиенты",
    "Задачи",
    "Календарь",
    "Аналитика",
    "База знаний",
    "Команда",
    "Интеграции",
    "Настройки",
  ]);
  assert.match(source, /onClick:\(\)=>le\("crm:team"\)/);
  assert.match(source, /children:"Виктория Ахрамова"/);
  assert.doesNotMatch(source, /label:"Контакты"/);
});

test("пункты используют точные Figma-иконки и компактный list-паттерн", () => {
  assert.match(itemSource, /e\.jsxs\("button"/);
  assert.match(itemSource, /"aria-current":c\?"page"/);
  assert.match(itemSource, /height:44/);
  assert.match(itemSource, /fontSize:17/);
  assert.match(itemSource, /borderRadius:10/);
  assert.match(itemSource, /width:20,height:20/);
  for (const icon of ["chat", "requests", "processes", "knowledge", "team", "connections", "settings"]) {
    assert.match(source, new RegExp(`/icons/figma-menu/${icon}\\.svg`));
  }
});

test("на мобильном меню открывается отдельным доступным слоем", () => {
  assert.match(mobileSource, /@media \(max-width:720px\)/);
  assert.match(mobileSource, /role:"dialog","aria-modal":!0,"aria-label":"Навигация Mary"/);
  assert.match(mobileSource, /"aria-label":"Открыть меню"/);
  assert.match(mobileSource, /\["automations","Процессы"\]/);
  assert.match(mobileSource, /\["inbox","Входящие"\]/);
  assert.match(mobileSource, /\["home","Главная"\]/);
  assert.match(mobileSource, /setMobileNavOpen\(!1\)/);
});

import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";

const source = await readFile(
  new URL("../scripts/mary8080-fragments/om.jsfrag", import.meta.url),
  "utf8",
);

test("страница процессов повторяет list-first композицию референса", () => {
  assert.match(source, /children:"Процессы"/);
  assert.match(source, /Mary ведёт повторяющиеся процессы/);
  assert.match(source, /title:"Подключено"/);
  assert.match(source, /title:"Можно подключить"/);
  assert.match(source, /gridTemplateColumns:narrow\?"48px minmax\(0,1fr\) 52px":"52px minmax\(0,1\.5fr\) minmax\(210px,\.8fr\) 64px"/);
  assert.match(source, /borderBottom:"1px solid rgba\(38,38,51,0\.075\)"/);
  assert.match(source, /children:e\.jsx\(ProcessIcon,\{type:m\.icon\}\)/);
  assert.match(source, /maxWidth:1140/);
  assert.match(source, /fontSize:narrow\?30:32/);
  assert.match(source, /Собрать процесс с Mary/);
});

test("фильтры, поиск и счётчик подключённых работают от общего состояния", () => {
  assert.match(source, /\["all","Все",rows\.length\]/);
  assert.match(source, /\["connected","Подключённые",activeCount\]/);
  assert.match(source, /\["recommended","Рекомендуемые",rows\.length-activeCount\]/);
  assert.match(source, /placeholder:"Искать процесс"/);
  assert.match(source, /Object\.values\(processState\)\.filter\(Boolean\)\.length/);
});

test("список содержит процессы из выбранного референса", () => {
  for (const title of [
    "Запись клиентов",
    "Напоминание о визите",
    "Поддержка клиентов",
    "Возврат клиентов",
    "Контроль оплаты",
    "Сбор отзывов",
  ]) {
    assert.ok(source.includes(`title:"${title}"`), `нет процесса ${title}`);
  }
});

test("переключатель показывает preview последствий до изменения", () => {
  assert.match(source, /role:"switch"/);
  assert.match(source, /"aria-checked":!!processState\[m\.id\]/);
  assert.match(source, /setPending\(\{id:m\.id,next:!processState\[m\.id\]/);
  assert.match(source, /role:"dialog","aria-modal":!0/);
  assert.match(source, /Перед первым реальным действием будет проверка/);
  assert.match(source, /Текущая история и результаты сохранятся/);
});

test("клик по названию открывает существующий процесс", () => {
  assert.match(source, /onClick:\(\)=>d\(m\.openName\)/);
});

test("каждый процесс показывает одну семантическую цветную иконку и рабочий контекст", () => {
  for (const icon of ["calendar", "bell", "chat", "return", "card", "star"]) {
    assert.match(source, new RegExp(`icon:"${icon}"`));
  }
  assert.match(source, /owner:"Mary"/);
  assert.match(source, /owner:"Агент поддержки"/);
  assert.match(source, /result:"38 записей за неделю"/);
  assert.match(source, /last:"Сегодня, 11:32"/);
});

test("создание процесса начинается с контекстного диалога Mary", () => {
  assert.match(source, /role:"dialog","aria-modal":!0,"aria-label":"Собрать процесс с Mary"/);
  assert.match(source, /Черновик процесса/);
  assert.match(source, /Реальные данные пока не изменятся/);
  assert.match(source, /children:"Собрать черновик"/);
});

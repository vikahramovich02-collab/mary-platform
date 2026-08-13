import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("scripts/mary8080-fragments/cm.jsfrag", "utf8");

test("база знаний построена вокруг проверяемых источников", () => {
  assert.match(source, /children:"База знаний"/);
  assert.match(source, /Правила, ответы и документы, на которых работают Mary/);
  assert.match(source, /sources=\[/);
  assert.match(source, /Mary использует знания в процессах/);
  assert.match(source, /Что знает Mary/);
  assert.match(source, /Mary рекомендует добавить/);
});

test("состояния источника понятны и не передаются только цветом", () => {
  for (const status of ["Актуально", "Нужно обновить"]) {
    assert.match(source, new RegExp(`statusLabel:"${status}"`));
  }
  assert.match(source, /children:x\.statusLabel/);
});

test("поиск, категории и фильтры работают от общего состояния", () => {
  assert.match(source, /setQuery/);
  assert.match(source, /setTab/);
  assert.match(source, /shown=sources\.filter/);
  assert.match(source, /Подключённые/);
  assert.match(source, /Рекомендации/);
  assert.match(source, /Ничего не найдено/);
});

test("источник открывается в правой панели без отдельной страницы", () => {
  assert.match(source, /selected&&e\.jsxs\("aside"/);
  assert.match(source, /role:"dialog"/);
  assert.match(source, /boxShadow:"none"/);
  assert.match(source, /Изменить с Mary/);
  assert.match(source, /Обновить сейчас/);
});

test("новый источник добавляется через Mary после проверки", () => {
  assert.match(source, /Добавить знания с Mary/);
  assert.match(source, /Загрузить файл/);
  assert.match(source, /Подключить Google Drive/);
  assert.match(source, /Рассказать своими словами/);
  assert.match(source, /Перед использованием Mary покажет/);
  assert.match(source, /Продолжить с Mary/);
});

test("страница имеет mobile и reduced-motion состояния", () => {
  assert.match(source, /@media\(max-width:1000px\)/);
  assert.match(source, /@media\(max-width:700px\)/);
  assert.match(source, /prefers-reduced-motion:reduce/);
  assert.match(source, /onKeyDown/);
  assert.match(source, /tabIndex:0/);
  assert.doesNotMatch(source, /e\.jsx\("[^"]+"\)/);
});

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(
  new URL("../scripts/mary8080-fragments/home.jsfrag", import.meta.url),
  "utf8",
);
const patcher = fs.readFileSync(
  new URL("../scripts/patch-mary8080-bundle.mjs", import.meta.url),
  "utf8",
);

test("главная становится первым экраном основного прототипа", () => {
  assert.match(patcher, /useState\(\"home\"\)/);
  assert.match(patcher, /e\.jsx\(homePage/);
});

test("главная показывает решения, результат Mary и состояние сервисов", () => {
  assert.match(source, /Требует вашего решения/);
  assert.match(source, /Подтвердить перенос записи/);
  assert.match(source, /Результат работы Mary/);
  assert.match(source, /Mary работает нормально/);
});

test("главная ведёт в связанные разделы", () => {
  assert.match(source, /go\(\"inbox\"\)/);
  assert.match(source, /go\(\"analytics\"\)/);
  assert.match(source, /go\(\"integrations\"\)/);
  assert.match(source, /onAskMary/);
});

test("главная адаптируется и уважает reduced motion", () => {
  assert.match(source, /@media\(max-width:720px\)/);
  assert.match(source, /prefers-reduced-motion/);
  assert.match(source, /\"aria-label\":\"Краткая сводка\"/);
});

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(
  new URL("../scripts/mary8080-fragments/inbox.jsfrag", import.meta.url),
  "utf8",
);
const patcher = fs.readFileSync(
  new URL("../scripts/patch-mary8080-bundle.mjs", import.meta.url),
  "utf8",
);

test("основной прототип подключает отдельный экран входящих", () => {
  assert.match(patcher, /"inbox\.jsfrag"/);
  assert.match(source, /function hm\(\{items:s,onResolve:d\}\)/);
});

test("входящие используют общие сущности и три рабочие зоны", () => {
  assert.match(source, /id:"conversation-daniela"/);
  assert.match(source, /clientId:"client-daniela"/);
  assert.match(source, /className:"mary-queue"/);
  assert.match(source, /className:"mary-thread"/);
  assert.match(source, /className:"mary-context"/);
});

test("фильтры, поиск и выбор обращения интерактивны", () => {
  assert.match(source, /\[filter,setFilter\]=g\.useState\("all"\)/);
  assert.match(source, /\[query,setQuery\]=g\.useState\(""\)/);
  assert.match(source, /onClick:\(\)=>setFilter\(m\[0\]\)/);
  assert.match(source, /onChange:m=>setQuery\(m\.target\.value\)/);
  assert.match(source, /onClick:\(\)=>choose\(m\)/);
});

test("подтверждение YCLIENTS не применяется до явного действия", () => {
  assert.match(source, /Изменение ещё не применено/);
  assert.match(source, /Подтвердить перенос/);
  assert.match(source, /onClick:\(\)=>setSent\(!0\)/);
  assert.match(source, /Запись перенесена на пятницу, 18:00/);
});

test("экран поддерживает передачу сотруднику, composer и Mary", () => {
  assert.match(source, /Передать сотруднику/);
  assert.match(source, /sendMessage=\(\)=>/);
  assert.match(source, /Настроить входящие с Mary/);
  assert.match(source, /Продолжить с Mary/);
});

test("адаптивность сохраняет очередь и full-screen переписку", () => {
  assert.match(source, /@media\(max-width:820px\)/);
  assert.match(source, /mary-inbox\.mobile-thread \.mary-queue/);
  assert.match(source, /mary-inbox\.mobile-thread \.mary-thread/);
  assert.match(source, /prefers-reduced-motion/);
});

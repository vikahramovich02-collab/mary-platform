import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";

const source = await readFile(
  new URL("../scripts/build-mary8080-demo-bundle.mjs", import.meta.url),
  "utf8",
);

test("демо начинается без разделов компании и раскрывает их по сценарию", () => {
  assert.match(source, /\[ve,Re\]=g\.useState\(\{\}\)/);
});

test("рабочие разделы появляются после завершения демонстрации", () => {
  assert.match(source, /home:q\.home\|\|"new"/);
  assert.match(source, /inbox:q\.inbox\|\|"new"/);
  assert.match(source, /crm:q\.crm\|\|"new"/);
});

test("демо собирается в отдельный bundle и не меняет основную версию", () => {
  assert.match(source, /sourceFile = "\/tmp\/index-CLW7J7YJ\.js"/);
  assert.match(source, /outputFile = "\/tmp\/index-CLW7J7YJ\.demo\.js"/);
});

test("готовый пример запускает демонстрацию без зависимости от ответа API", () => {
  assert.match(source, /покажи на примере моего бизнеса\|демо салона/);
  assert.match(source, /_t\("Записи","Instagram"\)/);
});

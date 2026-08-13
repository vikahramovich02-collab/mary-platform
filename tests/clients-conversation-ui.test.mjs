import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";

const source = await readFile(
  new URL("../scripts/mary8080-fragments/hm.jsfrag", import.meta.url),
  "utf8",
);

test("переписка использует общие clientId и conversationId", () => {
  assert.match(source, /clientId:"client-58625"/);
  assert.match(source, /conversationId:"conversation-58625"/);
  assert.match(source, /"data-client-id":clientDialog\.clientId/);
  assert.match(
    source,
    /"data-conversation-id":clientDialog\.conversationId/,
  );
});

test("переписка открывается отдельным слоем поверх карточки", () => {
  assert.match(source, /clientOverlay==="conversation"/);
  assert.match(source, /role:"dialog","aria-modal":"true"/);
  assert.match(source, /openClientConversation\(clientDialog\)/);
  assert.match(source, /setClientDialog\(m\);setClientOverlay\("conversation"\)/);
});

test("отправка требует явного подтверждения", () => {
  assert.match(source, /role:"alertdialog"/);
  assert.match(source, /Подтвердить и отправить/);
  assert.match(source, /Сообщение уйдёт в/);
  assert.match(source, /setClientSent\(!0\)/);
});

test("модальное окно поддерживает Escape, focus trap и mobile layout", () => {
  assert.match(source, /m\.key==="Escape"/);
  assert.match(source, /m\.key==="Tab"/);
  assert.match(source, /clientNarrow\?"100vw"/);
  assert.match(source, /clientNarrow\?"100dvh"/);
});

test("контекстная Mary остаётся плавающим окном рядом с карточкой", () => {
  assert.match(source, /clientOverlay==="add"\|\|clientOverlay==="mary"/);
  assert.match(source, /"aria-modal":"false"/);
  assert.match(
    source,
    /right:clientNarrow\?0:clientDialog&&typeof clientDialog==="object"\?404:12/,
  );
  assert.match(source, /Спросить Mary о клиенте…/);
  assert.match(source, /Создать задачу Ярославе/);
});

test("добавление клиента происходит через Mary и открывает карточку", () => {
  assert.match(source, /Клиенты · Новый клиент/);
  assert.match(source, /createDemoClient=/);
  assert.match(source, /setClientCreated\(m\);setClientDialog\(m\)/);
  assert.match(source, /После добавления откроется карточка клиента/);
});

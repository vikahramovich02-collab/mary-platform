import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";

const source = await readFile(
  new URL("../src/App.jsx", import.meta.url),
  "utf8",
);

test("после выбора времени пользователь сразу переходит к оплате", () => {
  assert.match(source, /onConfirm=\{b => \{ setBooking\(b\); setScreen\("payment"\); \}\}/);
  assert.doesNotMatch(source, /screen === "checkout"/);
});

test("экран оплаты содержит обычные поля карты и email для чека", () => {
  assert.match(source, />Номер карты</);
  assert.match(source, />Срок действия</);
  assert.match(source, />CVC</);
  assert.match(source, />Email для чека</);
  assert.match(source, /Оплатить \{booking\.person\.price\.toLocaleString/);
});

test("фокус на пустом номере карты заполняет безопасные демо-данные", () => {
  assert.match(source, /onFocus=\{fillDemoPaymentData\}/);
  assert.match(source, /setCardNumber\("4242 4242 4242 4242"\)/);
  assert.match(source, /setExpiry\("12 \/ 30"\)/);
  assert.match(source, /setCvc\("123"\)/);
  assert.match(source, /setEmail\("demo@intreatment\.ru"\)/);
});

test("после оплаты доступна регистрация через провайдеров из PRD", () => {
  assert.match(source, />Создайте аккаунт</);
  assert.match(source, /Продолжить с Яндекс ID/);
  assert.match(source, /Продолжить с VK ID/);
  assert.match(source, /onNext\("yandex"\)/);
  assert.match(source, /onNext\("vk"\)/);
});

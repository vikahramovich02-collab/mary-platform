// Backend smoke + integration tests для Mary платформы.
// Используют node:test (встроенный, без зависимостей).
// Запуск:  node --test tests/backend.test.mjs
// Цель:    проверить что прод-бэкенд жив и tools работают.
import { test } from "node:test";
import assert from "node:assert/strict";

const BASE = process.env.BASE_URL || "http://77.237.241.242:5678";
const TIMEOUT = 90000; // 90с на LLM-вызов

const fetchJson = async (path, opts = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
};

test("1. /health returns ok + LLM enabled", { timeout: 5000 }, async () => {
  const d = await fetchJson("/health");
  assert.equal(d.ok, true, "health.ok должен быть true");
  assert.equal(d.llmEnabled, true, "LLM должна быть подключена");
  assert.ok(d.llmModel, "должна быть указана модель");
  assert.ok(d.posts > 0, "должны быть загружены посты");
});

test("2. researcher: posts endpoint возвращает массив", { timeout: 10000 }, async () => {
  const d = await fetchJson("/webhook/mary/researcher/posts?limit=3");
  assert.ok(Array.isArray(d.posts), "posts должен быть массив");
  assert.ok(d.posts.length > 0 && d.posts.length <= 3, "должны вернуться 1-3 поста");
  for (const p of d.posts) {
    assert.ok(p.channel, "у поста должен быть channel");
    assert.ok(p.text != null, "у поста должен быть text");
  }
});

test("3. KB tools: write → read → delete cycle", { timeout: 10000 }, async () => {
  const name = `__test_${Date.now()}.md`;
  const content = "# Test\n\nЭто тестовый файл который должен удалиться.";

  const w = await fetchJson("/webhook/mary/kb/file", {
    method: "POST",
    body: JSON.stringify({ name, content }),
  });
  assert.equal(w.ok, true, "kb_write должен вернуть ok");
  assert.equal(w.existed, false, "файл новый, existed=false");

  const r = await fetchJson(`/webhook/mary/kb/file?name=${encodeURIComponent(name)}`);
  assert.equal(r.content, content, "kb_read должен вернуть тот же контент");

  const d = await fetchJson(`/webhook/mary/kb/file?name=${encodeURIComponent(name)}`, {
    method: "DELETE",
  });
  assert.equal(d.ok, true, "kb_delete должен вернуть ok");
});

test("4. KB write защищается от path traversal", { timeout: 5000 }, async () => {
  const w = await fetchJson("/webhook/mary/kb/file", {
    method: "POST",
    body: JSON.stringify({ name: "../etc/passwd_evil.md", content: "evil" }),
  });
  // Файл должен сохраниться с очищенным именем (без ../)
  assert.equal(w.ok, true);
  assert.ok(!w.path.includes(".."), `path не должен содержать ../, получили: ${w.path}`);
  // Cleanup
  await fetch(`${BASE}/webhook/mary/kb/file?name=${encodeURIComponent(w.path)}`, { method: "DELETE" });
});

test("5. agent endpoint отвечает на простой вопрос (с tool routing)", { timeout: TIMEOUT }, async () => {
  const d = await fetchJson("/webhook/mary/agent", {
    method: "POST",
    body: JSON.stringify({ message: "привет, кто ты?" }),
  });
  assert.equal(d.agentId, "mary");
  assert.ok(d.text && d.text.length > 10, "Mary должна вернуть текстовый ответ");
  assert.ok(Array.isArray(d.trace), "trace должен быть массив");
  // На простой вопрос tools НЕ должны вызываться
  assert.equal(d.trace.length, 0, "на 'привет' tools вызываться не должны");
});

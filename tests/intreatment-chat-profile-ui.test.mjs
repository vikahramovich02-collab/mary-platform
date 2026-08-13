import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";

const appSource = await readFile(
  new URL("../src/App.jsx", import.meta.url),
  "utf8",
);
const styles = await readFile(
  new URL("../src/figma-nav.css", import.meta.url),
  "utf8",
);

test("быстрые ответы визуально отделены от белого поля ввода", () => {
  assert.match(styles, /\.journey-page \.journey-answers button[\s\S]*background: #f3f3f1/);
  assert.match(styles, /\.journey-page \.journey-input[\s\S]*background: #fff/);
});

test("карточка рекомендации показывает цену и запись без рейтинга и стажа", () => {
  const recommendationCard = appSource.match(/function JourneyRecommendationCard[\s\S]*?function ProfileModal/)?.[0] || "";
  assert.doesNotMatch(recommendationCard, /person\.fit|person\.experience|MetaBadge/);
  assert.match(recommendationCard, /person\.price\.toLocaleString/);
  assert.match(recommendationCard, /Ближайшая запись: сегодня, 18:30/);
  assert.match(styles, /\.journey-recommendation-card__meta span[\s\S]*border: 1px solid rgba\(18,16,16,\.2\)/);
});

test("календарь переключает недели и показывает только семь дней", () => {
  assert.match(appSource, /const \[weekIndex, setWeekIndex\] = useState\(0\)/);
  assert.match(appSource, /const visibleDays = days\.slice\(weekIndex \* 7, weekIndex \* 7 \+ 7\)/);
  assert.match(appSource, /onClick=\{\(\) => moveWeek\(-1\)\}/);
  assert.match(appSource, /onClick=\{\(\) => moveWeek\(1\)\}/);
});

test("дни отпуска недоступны, а отсутствие слотов показано текстовым состоянием", () => {
  assert.match(appSource, /status: "Отпуск"/);
  assert.match(appSource, /disabled=\{day\.muted\}/);
  assert.match(appSource, /На этот день нет свободного времени\./);
});

test("попап удерживает фокус и закрывается по Escape", () => {
  assert.match(appSource, /event\.key === "Escape"/);
  assert.match(appSource, /event\.key !== "Tab"/);
  assert.match(appSource, /closeButtonRef\.current\?\.focus\(\)/);
});

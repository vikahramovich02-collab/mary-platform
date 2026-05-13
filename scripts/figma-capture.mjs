// Запускает Figma capture через Playwright (для external URL).
// Использование: node scripts/figma-capture.mjs <captureId> <endpoint> <url>
import { chromium } from "playwright";

const [, , captureId, endpoint, url] = process.argv;
if (!captureId || !endpoint || !url) {
  console.error("usage: node figma-capture.mjs <captureId> <endpoint> <url>");
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1024 },
  deviceScaleFactor: 2,
  locale: "ru-RU",
});
const page = await context.newPage();

await page.route("**/*", async (route) => {
  const response = await route.fetch();
  const headers = { ...response.headers() };
  delete headers["content-security-policy"];
  delete headers["content-security-policy-report-only"];
  await route.fulfill({ response, headers });
});

console.log(`→ ${url}`);
await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(800);

// PREP — список действий через ";". Каждое: text:NAME (по тексту), css:SELECTOR, sel:SCOPE>>text:NAME (в скоупе по тексту)
const prep = process.env.PREP;
if (prep) {
  for (const step of prep.split(";").map(s => s.trim()).filter(Boolean)) {
    try {
      let locator;
      if (step.startsWith("css:")) {
        locator = page.locator(step.slice(4));
      } else if (step.includes(">>text:")) {
        const [scope, txt] = step.split(">>text:");
        locator = page.locator(scope.replace(/^sel:/, "")).locator(`text=${txt}`);
      } else {
        const txt = step.replace(/^text:/, "");
        locator = page.locator(`text=${txt}`);
      }
      console.log(`  prep step: ${step}`);
      await locator.first().click({ timeout: 4000 });
      await page.waitForTimeout(1200);
    } catch (e) {
      console.warn(`  ! prep failed (${step}): ${e.message}`);
    }
  }
}

const r = await page.context().request.get("https://mcp.figma.com/mcp/html-to-design/capture.js");
const captureJs = await r.text();
await page.evaluate((s) => {
  const el = document.createElement("script");
  el.textContent = s;
  document.head.appendChild(el);
}, captureJs);
await page.waitForTimeout(500);

// Fire-and-forget: вызываем capture и сразу выходим (capture сам пушит в endpoint).
// Если ждать promise — может зависнуть навсегда (capture script делает работу но не resolve'ит).
await page.evaluate(({ id, ep }) => {
  window.figma.captureForDesign({ captureId: id, endpoint: ep, selector: "body" })
    .catch(e => console.error("capture err:", e?.message));
  return "fired";
}, { id: captureId, ep: endpoint });

// Даём 8 секунд capture script отработать и отправить данные на endpoint
console.log("✓ capture fired, ждём 8с...");
await page.waitForTimeout(8000);
console.log("✓ done");
await browser.close();

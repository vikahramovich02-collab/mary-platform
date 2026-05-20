// Единый runner всех тестов Mary платформы.
// Запуск: node tests/all.mjs                  → быстрые тесты (delegation/team-send/pipeline-edit/full-flow)
//        node tests/all.mjs --all             → ВСЕ тесты включая длинные (onboarding/chat-scenarios/jtbd/etc)
//        BASE_URL=... node tests/all.mjs      → против конкретного env
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE_URL || "http://77.237.241.242";
const ALL = process.argv.includes("--all");

// Категории тестов
const QUICK = ["delegation.mjs", "team-send.mjs", "pipeline-edit.mjs", "full-flow.mjs"];
const LONG  = ["onboarding-flow.mjs", "chat-scenarios.mjs", "business-scenarios.mjs", "jtbd-cases.mjs", "real-business-cases.mjs", "backend.test.mjs"];
const tests = ALL ? [...QUICK, ...LONG] : QUICK;

console.log(`\n══════ ALL TESTS ${ALL ? "(quick + long)" : "(quick only — добавь --all для всех)"} ══════\n`);
console.log(`BASE_URL=${BASE}\n`);

const results = [];
const overallStart = Date.now();

for (const file of tests) {
  const start = Date.now();
  const out = await runOne(file);
  const dur = ((Date.now() - start) / 1000).toFixed(1);
  results.push({ file, ...out, dur });
}

const totalDur = ((Date.now() - overallStart) / 1000).toFixed(1);

console.log("\n══════ ИТОГ ══════\n");
let pass = 0, fail = 0;
for (const r of results) {
  const mark = r.ok ? "✓" : "✗";
  const checks = r.ok ? `${r.checks} проверок` : "FAILED";
  console.log(`  ${mark} ${r.file.padEnd(28)} ${r.dur.padStart(5)}s   ${checks}${r.error ? "  — " + r.error : ""}`);
  r.ok ? pass++ : fail++;
}
console.log(`\n${pass}/${results.length} зелёных (${totalDur}s суммарно)`);
process.exit(fail > 0 ? 1 : 0);

// ─────────────────────────────────────────────
async function runOne(file) {
  return new Promise(resolve => {
    const proc = spawn("node", [path.join(__dirname, file)], {
      env: { ...process.env, BASE_URL: BASE },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "", stderr = "";
    proc.stdout.on("data", b => { stdout += b; });
    proc.stderr.on("data", b => { stderr += b; });
    proc.on("close", code => {
      // Считаем ✓ и ✗ в stdout как proxy для checks/failures
      const checks = (stdout.match(/^ *✓ /gm) || []).length;
      const fails  = (stdout.match(/^ *✗ /gm) || []).length;
      const ok = code === 0 && fails === 0;
      let error = "";
      if (!ok) {
        // Ищем первую строку ✗ или последнюю строку stderr
        const m = stdout.match(/^ *✗ .+$/m);
        if (m) error = m[0].trim().slice(2, 100);
        else if (stderr) error = stderr.split("\n").filter(l => l.trim()).pop()?.slice(0, 100) || `exit ${code}`;
        else error = `exit ${code}`;
      }
      // Краткий live-output
      process.stdout.write(ok
        ? `  ✓ ${file.padEnd(28)} (${checks} checks)\n`
        : `  ✗ ${file.padEnd(28)} ${error.slice(0, 80)}\n`);
      resolve({ ok, checks, fails, error });
    });
  });
}

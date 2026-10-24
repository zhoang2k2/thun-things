// Runs Lighthouse (mobile preset, default throttling) against the production build and checks the
// P4 performance budgets. Usage: `pnpm perf` (builds first).
// Output: docs/reports/lighthouse-p6-<date>/<page>.report.html (the median run) plus summary.json.
// Exits non-zero when any page misses a budget.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { chromium } from '@playwright/test';
import lighthouse from 'lighthouse';

const PORT = 3102;
const DEBUG_PORT = 9223;
const BASE_URL = `http://localhost:${PORT}`;
// Local calendar date (YYYY-MM-DD), so a late-night run is not filed under the UTC date.
const DATE = new Date().toLocaleDateString('sv-SE');
// Simulated throttling still varies run to run on a local server (which requests start before the
// observed paint shifts the estimate by whole round trips), so each page runs RUNS times and the
// run with the median LCP is reported, as Lighthouse's variability guide recommends.
const RUNS = 3;
const OUT_DIR = join('docs', 'reports', `lighthouse-p6-${DATE}`);

const PAGES = [
  { name: 'home-vi', path: '/vi' },
  { name: 'home-en', path: '/en' },
  { name: 'product-hoang-hon-01', path: '/vi/products/hoang-hon-01' },
  { name: 'contact', path: '/en/contact' },
];

// Budgets [USER, P4 spec criterion 14]: LCP < 2.5 s, CLS < 0.1, TBT < 200 ms.
const BUDGETS = { lcpMs: 2500, cls: 0.1, tbtMs: 200 };

const startServer = async () => {
  // Dedicated port and process group so we never reuse or leave behind another server.
  const server = spawn('pnpm', ['start', '--port', String(PORT)], {
    stdio: 'ignore',
    detached: true,
  });
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(BASE_URL);
      if (response.ok) return server;
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  process.kill(-server.pid);
  throw new Error(`Server did not start on ${BASE_URL}`);
};

const score = (lhr, category) => Math.round((lhr.categories[category]?.score ?? 0) * 100);

const metricsOf = (lhr) => ({
  lcpMs: Math.round(lhr.audits['largest-contentful-paint'].numericValue),
  cls: Number(lhr.audits['cumulative-layout-shift'].numericValue.toFixed(3)),
  tbtMs: Math.round(lhr.audits['total-blocking-time'].numericValue),
});

const runLighthouse = async (page) => {
  const result = await lighthouse(`${BASE_URL}${page.path}`, {
    port: DEBUG_PORT,
    output: 'html',
    logLevel: 'error',
  });
  if (!result) throw new Error(`Lighthouse returned no result for ${page.path}`);
  if (result.lhr.runtimeError) {
    throw new Error(`${page.path}: ${result.lhr.runtimeError.message}`);
  }
  return result;
};

const summarize = (page, lhr, runs) => {
  const { lcpMs, cls, tbtMs } = metricsOf(lhr);
  const failures = [];
  if (!(lcpMs < BUDGETS.lcpMs)) failures.push('LCP');
  if (!(cls < BUDGETS.cls)) failures.push('CLS');
  if (!(tbtMs < BUDGETS.tbtMs)) failures.push('TBT');
  return {
    page: page.path,
    report: `${page.name}.report.html`,
    performance: score(lhr, 'performance'),
    lcpMs,
    cls,
    tbtMs,
    accessibility: score(lhr, 'accessibility'),
    bestPractices: score(lhr, 'best-practices'),
    seo: score(lhr, 'seo'),
    runs: runs.map(({ lhr: run }) => metricsOf(run)),
    runWarnings: lhr.runWarnings,
    passed: failures.length === 0,
    failures,
  };
};

const printTable = (rows) => {
  const header = ['Page', 'Perf', 'LCP', 'CLS', 'TBT', 'A11y', 'BP', 'SEO', 'Budget'];
  const lines = rows.map((row) => [
    row.page,
    String(row.performance),
    `${(row.lcpMs / 1000).toFixed(2)} s`,
    row.cls.toFixed(3),
    `${row.tbtMs} ms`,
    String(row.accessibility),
    String(row.bestPractices),
    String(row.seo),
    row.passed ? 'pass' : `FAIL (${row.failures.join(', ')})`,
  ]);
  const widths = header.map((cell, index) =>
    Math.max(cell.length, ...lines.map((line) => line[index].length)),
  );
  const format = (cells) => cells.map((cell, index) => cell.padEnd(widths[index])).join('  ');
  console.log(format(header));
  console.log(format(widths.map((width) => '-'.repeat(width))));
  for (const line of lines) console.log(format(line));
};

const main = async () => {
  mkdirSync(OUT_DIR, { recursive: true });
  const server = await startServer();
  let browser;
  const rows = [];
  let version;
  try {
    browser = await chromium.launch({ args: [`--remote-debugging-port=${DEBUG_PORT}`] });
    // Sequential on purpose: parallel runs skew the simulated throttling.
    for (const page of PAGES) {
      await fetch(`${BASE_URL}${page.path}`); // warm the server so run 1 is not a cold start
      const runs = [];
      for (let run = 0; run < RUNS; run += 1) runs.push(await runLighthouse(page));
      const byLcp = [...runs].sort((a, b) => metricsOf(a.lhr).lcpMs - metricsOf(b.lhr).lcpMs);
      const { lhr, report } = byLcp[Math.floor(RUNS / 2)];
      writeFileSync(join(OUT_DIR, `${page.name}.report.html`), report);
      version = lhr.lighthouseVersion;
      rows.push(summarize(page, lhr, runs));
      console.log(`  ${page.path} done`);
    }
  } finally {
    await browser?.close();
    process.kill(-server.pid);
  }
  const summary = {
    date: DATE,
    lighthouse: version,
    preset: 'mobile (default throttling)',
    method: `median-LCP run of ${RUNS} per page`,
    budgets: BUDGETS,
    pages: rows,
  };
  writeFileSync(join(OUT_DIR, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  printTable(rows);
  console.log(`Reports written to ${OUT_DIR}/.`);
  if (rows.some((row) => !row.passed)) {
    console.error('Performance budget failed.');
    process.exitCode = 1;
  }
};

await main();

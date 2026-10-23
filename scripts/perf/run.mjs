// Runs Lighthouse (mobile preset, default throttling) against the production build and checks the
// P4 performance budgets. Usage: `pnpm perf` (builds first).
// Output: docs/reports/lighthouse-p4-<date>/<page>.report.html plus summary.json.
// Exits non-zero when any page misses a budget.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { chromium } from '@playwright/test';
import lighthouse from 'lighthouse';

const PORT = 3102;
const DEBUG_PORT = 9223;
const BASE_URL = `http://localhost:${PORT}`;
const DATE = new Date().toISOString().slice(0, 10);
const OUT_DIR = join('docs', 'reports', `lighthouse-p4-${DATE}`);

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'product-hoang-hon-01', path: '/products/hoang-hon-01' },
  { name: 'contact', path: '/contact' },
  { name: 'policy-privacy', path: '/policy/privacy' },
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

const summarize = (page, lhr) => {
  const lcpMs = lhr.audits['largest-contentful-paint'].numericValue;
  const cls = lhr.audits['cumulative-layout-shift'].numericValue;
  const tbtMs = lhr.audits['total-blocking-time'].numericValue;
  const failures = [];
  if (!(lcpMs < BUDGETS.lcpMs)) failures.push('LCP');
  if (!(cls < BUDGETS.cls)) failures.push('CLS');
  if (!(tbtMs < BUDGETS.tbtMs)) failures.push('TBT');
  return {
    page: page.path,
    report: `${page.name}.report.html`,
    performance: score(lhr, 'performance'),
    lcpMs: Math.round(lcpMs),
    cls: Number(cls.toFixed(3)),
    tbtMs: Math.round(tbtMs),
    accessibility: score(lhr, 'accessibility'),
    bestPractices: score(lhr, 'best-practices'),
    seo: score(lhr, 'seo'),
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
      const result = await lighthouse(`${BASE_URL}${page.path}`, {
        port: DEBUG_PORT,
        output: 'html',
        logLevel: 'error',
      });
      if (!result) throw new Error(`Lighthouse returned no result for ${page.path}`);
      const { lhr, report } = result;
      if (lhr.runtimeError) throw new Error(`${page.path}: ${lhr.runtimeError.message}`);
      writeFileSync(join(OUT_DIR, `${page.name}.report.html`), report);
      version = lhr.lighthouseVersion;
      rows.push(summarize(page, lhr));
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

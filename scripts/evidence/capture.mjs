// Captures PR evidence: GIFs (≤ 15 s) and PNG screenshots from scripted Playwright scenarios.
// Usage: `pnpm evidence` (builds first). Output: evidence-out/ (git-ignored).
// Scenarios with a `set` (e.g. 'disabled') only run when EVIDENCE_SET matches; such runs add to
// evidence-out/ instead of clearing it, so states that need a different server environment can be
// captured from a second build.
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { chromium } from '@playwright/test';
import gifenc from 'gifenc';
import { PNG } from 'pngjs';

import scenarios from './scenarios.mjs';

/**
 * @typedef {{ page: import('@playwright/test').Page, snap: (hold?: number) => Promise<void> }} RunContext
 * @typedef {{ name: string, kind: 'gif' | 'png', viewport: { width: number, height: number },
 *   mobile?: boolean, path?: string, set?: string, run?: (context: RunContext) => Promise<void> }} Scenario
 */

const { GIFEncoder, quantize, applyPalette } = gifenc;

const PORT = 3101;
const BASE_URL = `http://localhost:${PORT}`;
const OUT_DIR = 'evidence-out';
const FRAME_MS = 140;
const MAX_GIF_MS = 15_000;
const MAX_GIF_WIDTH = 960;

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

// Box-filter downscale by an integer factor so GIFs stay small and sharp enough.
const downscale = (png) => {
  const factor = Math.ceil(png.width / MAX_GIF_WIDTH);
  if (factor <= 1) return png;
  const width = Math.floor(png.width / factor);
  const height = Math.floor(png.height / factor);
  const out = new PNG({ width, height });
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const sum = [0, 0, 0, 0];
      for (let dy = 0; dy < factor; dy += 1) {
        for (let dx = 0; dx < factor; dx += 1) {
          const index = ((y * factor + dy) * png.width + (x * factor + dx)) * 4;
          for (let channel = 0; channel < 4; channel += 1)
            sum[channel] += png.data[index + channel];
        }
      }
      const target = (y * width + x) * 4;
      for (let channel = 0; channel < 4; channel += 1) {
        out.data[target + channel] = Math.round(sum[channel] / (factor * factor));
      }
    }
  }
  return out;
};

const writeGif = (frames, file) => {
  const maxFrames = Math.floor(MAX_GIF_MS / FRAME_MS);
  if (frames.length > maxFrames) {
    console.warn(`  ${file}: ${frames.length} frames exceed 15 s, truncating to ${maxFrames}`);
  }
  const kept = frames.slice(0, maxFrames);
  const gif = GIFEncoder();
  for (const frame of kept) {
    const palette = quantize(frame.data, 128);
    gif.writeFrame(applyPalette(frame.data, palette), frame.width, frame.height, {
      palette,
      delay: FRAME_MS,
    });
  }
  gif.finish();
  writeFileSync(file, gif.bytes());
  return (kept.length * FRAME_MS) / 1000;
};

const runScenario = async (browser, scenario) => {
  const context = await browser.newContext({
    baseURL: BASE_URL,
    viewport: scenario.viewport,
    deviceScaleFactor: 1,
    hasTouch: Boolean(scenario.mobile),
    isMobile: Boolean(scenario.mobile),
  });
  const page = await context.newPage();
  try {
    if (scenario.kind === 'png') {
      await page.goto(scenario.path);
      await page.waitForLoadState('networkidle');
      const file = join(OUT_DIR, `${scenario.name}.png`);
      // A full-page capture of a bare SVG document never settles in Chromium.
      await page.screenshot({ path: file, fullPage: !scenario.path.endsWith('.svg') });
      console.log(`  ${file}`);
      return;
    }
    const frames = [];
    const snap = async (hold = 1) => {
      const frame = downscale(PNG.sync.read(await page.screenshot()));
      for (let copy = 0; copy < hold; copy += 1) frames.push(frame);
    };
    await scenario.run({ page, snap });
    const file = join(OUT_DIR, `${scenario.name}.gif`);
    const seconds = writeGif(frames, file);
    console.log(`  ${file} (${seconds.toFixed(1)} s)`);
  } finally {
    await context.close();
  }
};

const EVIDENCE_SET = process.env.EVIDENCE_SET;

const main = async () => {
  if (!EVIDENCE_SET) rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });
  const selected = scenarios.filter((scenario) => scenario.set === EVIDENCE_SET);
  const server = await startServer();
  const browser = await chromium.launch();
  try {
    for (const scenario of selected) await runScenario(browser, scenario);
  } finally {
    await browser.close();
    process.kill(-server.pid);
  }
  console.log(`Evidence written to ${OUT_DIR}/. Review every file before publishing.`);
};

await main();

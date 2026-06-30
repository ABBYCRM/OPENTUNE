/**
 * OPENTUNE — QA crawl
 * Inspects the live web service (https://opentune-2tec.onrender.com) for UI,
 * interaction, accessibility, responsiveness, console, and network issues.
 *
 * Run:
 *   npx tsx qa/run.ts
 *
 * Output:
 *   qa-report.md   (structured QA report)
 *   qa-screenshots/*.png   (one per route × viewport)
 */

import { chromium, Browser, BrowserContext, Page, ConsoleMessage, Request, Response } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://opentune-2tec.onrender.com';
const OUT_DIR = '/workspace/OPENTUNE/qa';
const SHOTS_DIR = path.join(OUT_DIR, 'screenshots');
const REPORT_PATH = path.join(OUT_DIR, 'qa-report.md');

fs.mkdirSync(SHOTS_DIR, { recursive: true });

interface Finding {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  page: string;
  message: string;
  details?: string;
}

const findings: Finding[] = [];
const consoleLog: Array<{ page: string; type: string; text: string }> = [];
const networkLog: Array<{ page: string; url: string; status: number; method: string; failed: boolean }> = [];
const stackAtCrash: string[] = [];

function record(f: Omit<Finding, 'category'> & { category?: string }) {
  findings.push({ category: f.category ?? 'bug', ...f });
}

async function captureShot(page: Page, label: string) {
  const file = path.join(SHOTS_DIR, `${label}.png`);
  await page.screenshot({ path: file, fullPage: true });
}

function attachListeners(page: Page, label: string) {
  page.on('console', (msg: ConsoleMessage) => {
    consoleLog.push({ page: label, type: msg.type(), text: msg.text() });
    if (msg.type() === 'error') record({
      category: 'console', severity: 'medium', page: label,
      message: `Console error: ${msg.text()}`,
    });
  });
  page.on('pageerror', (err: Error) => {
    stackAtCrash.push(`[${label}] ${err.name}: ${err.message}\n${err.stack ?? ''}`);
    record({
      category: 'console', severity: 'high', page: label,
      message: `Uncaught exception: ${err.message}`,
    });
  });
  page.on('requestfailed', (req: Request) => {
    networkLog.push({ page: label, url: req.url(), status: 0, method: req.method(), failed: true });
    record({
      category: 'network', severity: 'high', page: label,
      message: `Network request failed: ${req.method()} ${req.url()}`,
      details: req.failure()?.errorText,
    });
  });
  page.on('response', (resp: Response) => {
    const status = resp.status();
    networkLog.push({ page: label, url: resp.url(), status, method: resp.request().method(), failed: false });
    if (status >= 400) {
      record({
        category: 'network', severity: status >= 500 ? 'high' : 'medium', page: label,
        message: `HTTP ${status} on ${resp.request().method()} ${resp.url()}`,
      });
    }
  });
}

async function visit(browser: Browser, label: string, viewport: { width: number; height: number }) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  attachListeners(page, `${label} @${viewport.width}x${viewport.height}`);

  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    // wait for the React app to mount
    await page.waitForSelector('.nav-item', { timeout: 15_000 });
  } catch (err: any) {
    record({ category: 'navigation', severity: 'critical', page: label,
      message: `Failed to load homepage: ${err.message}` });
  }

  // Capture initial render
  await page.waitForTimeout(500);
  await captureShot(page, `${label}-home`);

  // Sidebar links — discover by querying the DOM, not by hardcoding names.
  const navLabels: string[] = await page.locator('.nav-item').allInnerTexts();
  // Strip group headers (no .nav-item class) — already filtered.

  for (const name of navLabels.map(s => s.trim()).filter(Boolean)) {
    try {
      await page.locator('.nav-item', { hasText: name }).first().click({ timeout: 5000 });
      await page.waitForTimeout(400);
      await captureShot(page, `${label}-${name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`);
    } catch (err: any) {
      record({ category: 'navigation', severity: 'medium', page: label,
        message: `Could not click nav "${name}": ${err.message}` });
    }
  }

  // === INTERACTIONS per known view ===
  // The app has no real auth, no forms that submit to a server. We test
  // only what's actually interactive in the renderer.

  // CONNECT — transport selector
  await page.locator('.nav-item', { hasText: 'Connect' }).click();
  await page.waitForTimeout(300);
  const select = page.locator('select').first();
  if (await select.count() > 0) {
    for (const opt of ['simulator', 'elm327', 'elm327-bt', 'opentune-hw', 'j2534']) {
      try {
        await select.selectOption(opt);
        await page.waitForTimeout(150);
      } catch (err: any) {
        record({ category: 'interaction', severity: 'low', page: label,
          message: `Transport option ${opt} not selectable: ${err.message}` });
      }
    }
    // Reset to simulator, click Connect
    await select.selectOption('simulator');
    const connectBtn = page.locator('button:has-text("Connect")').first();
    if (await connectBtn.count() > 0) {
      try {
        await connectBtn.click({ timeout: 3000 });
        await page.waitForTimeout(400);
        await captureShot(page, `${label}-connect-after-click`);
      } catch (err: any) {
        record({ category: 'interaction', severity: 'medium', page: label,
          message: `Connect click failed: ${err.message}` });
      }
    }
  } else {
    record({ category: 'ui', severity: 'high', page: label,
      message: 'Transport <select> not present on Connect view' });
  }

  // MAP EDITOR — open, click first map row (auto-select), edit a cell, save
  await page.locator('.nav-item', { hasText: 'Map Editor' }).click();
  await page.waitForTimeout(500);
  // First click the first row in the catalog table to ensure a map is selected
  const firstMapRow = page.locator('table tbody tr').first();
  if (await firstMapRow.count() > 0) {
    try { await firstMapRow.click({ timeout: 2000 }); } catch {}
    await page.waitForTimeout(300);
  }
  const firstCell = page.locator('input.map-cell').first();
  if (await firstCell.count() > 0) {
    try {
      const original = await firstCell.inputValue();
      const num = parseFloat(original);
      await firstCell.fill(String(num + 1));
      await firstCell.evaluate(el => (el as HTMLInputElement).blur());
      await page.waitForTimeout(200);
      await captureShot(page, `${label}-map-after-edit`);
    } catch (err: any) {
      record({ category: 'interaction', severity: 'low', page: label,
        message: `Map cell edit failed: ${err.message}` });
    }
  } else {
    record({ category: 'ui', severity: 'medium', page: label,
      message: 'Map editor: no input.map-cell found (no maps loaded?)' });
  }

  // DATALOG — start/stop
  await page.locator('.nav-item', { hasText: 'Datalog' }).click();
  await page.waitForTimeout(300);
  const startBtn = page.locator('button:has-text("Start")').first();
  if (await startBtn.count() > 0) {
    try {
      await startBtn.click({ timeout: 3000 });
      await page.waitForTimeout(800);
      await captureShot(page, `${label}-datalog-after-start`);
      const stopBtn = page.locator('button:has-text("Stop")').first();
      if (await stopBtn.count() > 0) {
        await stopBtn.click({ timeout: 3000 });
      } else {
        record({ category: 'interaction', severity: 'low', page: label,
          message: 'Datalog Stop button did not appear after Start (data may not be flowing)' });
      }
    } catch (err: any) {
      record({ category: 'interaction', severity: 'medium', page: label,
        message: `Datalog Start failed: ${err.message}` });
    }
  }

  // DIAGNOSTICS — read DTCs, read VIN
  await page.locator('.nav-item', { hasText: 'Diagnostics' }).click();
  await page.waitForTimeout(300);
  const readDtcBtn = page.locator('button:has-text("Read DTCs")').first();
  if (await readDtcBtn.count() > 0) {
    try {
      await readDtcBtn.click({ timeout: 3000 });
      await page.waitForTimeout(600);
      await captureShot(page, `${label}-dtcs-after-read`);
    } catch (err: any) {
      record({ category: 'interaction', severity: 'medium', page: label,
        message: `Read DTCs click failed: ${err.message}` });
    }
  }
  const readVinBtn = page.locator('button:has-text("Read VIN")').first();
  if (await readVinBtn.count() > 0) {
    try {
      await readVinBtn.click({ timeout: 3000 });
      await page.waitForTimeout(500);
    } catch (err: any) {
      record({ category: 'interaction', severity: 'low', page: label,
        message: `Read VIN click failed: ${err.message}` });
    }
  }

  // === RAPID CLICK STRESS on Map Editor ===
  await page.locator('.nav-item', { hasText: 'Map Editor' }).click();
  await page.waitForTimeout(300);
  const saveBtn = page.locator('button:has-text("Save")').first();
  if (await saveBtn.count() > 0) {
    for (let i = 0; i < 8; i++) {
      try { await saveBtn.click({ timeout: 1500 }); } catch {}
      await page.waitForTimeout(60);
    }
  }

  // === ACCESSIBILITY quick scan ===
  // Missing aria-label on transport select?
  const selectAria = await page.locator('select').first().getAttribute('aria-label').catch(() => null);
  if (!selectAria) {
    record({ category: 'accessibility', severity: 'medium', page: label,
      message: 'Transport <select> has no aria-label' });
  }
  // Topbar brand: visible to screen readers?
  const brand = await page.locator('.brand').first().innerText().catch(() => '');
  if (!brand) {
    record({ category: 'accessibility', severity: 'medium', page: label,
      message: 'Brand text missing or empty' });
  }

  await context.close();
}

async function main() {
  console.log(`[QA] Launching browser against ${BASE_URL}`);
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--disable-gpu',
    ],
  });

  // Three viewports per the spec
  try {
    await visit(browser, 'desktop', { width: 1280, height: 800 });
  } catch (err: any) {
    record({ category: 'crash', severity: 'critical', page: 'desktop',
      message: `Desktop crawl crashed: ${err.message}` });
  }

  try {
    await visit(browser, 'tablet', { width: 768, height: 1024 });
  } catch (err: any) {
    record({ category: 'crash', severity: 'critical', page: 'tablet',
      message: `Tablet crawl crashed: ${err.message}` });
  }

  try {
    await visit(browser, 'mobile', { width: 375, height: 812 });
  } catch (err: any) {
    record({ category: 'crash', severity: 'critical', page: 'mobile',
      message: `Mobile crawl crashed: ${err.message}` });
  }

  await browser.close();

  // ============ REPORT ============
  const pages = ['Connect', 'Hardware', 'Dashboard', 'Diagnostics', 'Datalog', 'Map Editor'];
  const viewports = ['1280x800', '768x1024', '375x812'];
  const counts = findings.reduce((acc, f) => {
    acc[f.severity] = (acc[f.severity] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const lines: string[] = [];
  lines.push(`# OPENTUNE — QA Inspection Report`);
  lines.push('');
  lines.push(`**Target:** ${BASE_URL}`);
  lines.push(`**Date:** ${new Date().toISOString()}`);
  lines.push(`**Viewports:** ${viewports.join(', ')}`);
  lines.push(`**Pages crawled:** ${pages.length} × ${viewports.length} = ${pages.length * viewports.length}`);
  lines.push('');
  lines.push(`## 📊 Summary`);
  lines.push('');
  lines.push(`| Severity | Count |`);
  lines.push(`|---|---|`);
  lines.push(`| 🔴 Critical | ${counts.critical ?? 0} |`);
  lines.push(`| 🟠 High     | ${counts.high ?? 0} |`);
  lines.push(`| 🟡 Medium   | ${counts.medium ?? 0} |`);
  lines.push(`| 🟢 Low      | ${counts.low ?? 0} |`);
  lines.push(`| **Total**   | **${findings.length}** |`);
  lines.push('');

  // Per-page sections
  for (const vp of ['desktop', 'tablet', 'mobile']) {
    lines.push(`## 📐 Viewport: ${vp}`);
    lines.push('');
    const vpFindings = findings.filter(f => f.page.startsWith(vp));
    if (vpFindings.length === 0) {
      lines.push(`✅ No issues detected.`);
    } else {
      lines.push(`| Severity | Category | Message |`);
      lines.push(`|---|---|---|`);
      for (const f of vpFindings) {
        const icon = { low: '🟢', medium: '🟡', high: '🟠', critical: '🔴' }[f.severity];
        lines.push(`| ${icon} ${f.severity} | ${f.category} | ${f.message.replace(/\|/g, '\\|')} |`);
      }
    }
    lines.push('');
  }

  // Console output
  lines.push(`## 💻 Console Output (full)`);
  lines.push('');
  if (consoleLog.length === 0) lines.push('No console messages captured.');
  for (const c of consoleLog) {
    lines.push(`- [${c.type}] [${c.page}] ${c.text}`);
  }
  lines.push('');

  // Network
  lines.push(`## 🌐 Network (full)`);
  lines.push('');
  if (networkLog.length === 0) lines.push('No requests captured.');
  for (const n of networkLog) {
    lines.push(`- ${n.method} ${n.url} → ${n.status}${n.failed ? ' (failed)' : ''} [${n.page}]`);
  }
  lines.push('');

  // Crashes
  if (stackAtCrash.length > 0) {
    lines.push(`## 💥 Page exceptions captured`);
    lines.push('');
    for (const s of stackAtCrash) lines.push('```\n' + s + '\n```');
    lines.push('');
  }

  // Recommendations
  lines.push(`## 🔧 Recommended fixes (ranked by severity)`);
  lines.push('');
  const ranked = [...findings].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 } as const;
    return order[a.severity] - order[b.severity];
  });
  for (const f of ranked.slice(0, 20)) {
    lines.push(`1. **${f.severity.toUpperCase()}** [${f.category}] ${f.message}`);
  }
  if (ranked.length > 20) lines.push(`\n_…and ${ranked.length - 20} more._`);
  lines.push('');

  fs.writeFileSync(REPORT_PATH, lines.join('\n'));
  console.log(`[QA] Report: ${REPORT_PATH}`);
  console.log(`[QA] Screenshots: ${SHOTS_DIR}`);
  console.log(`[QA] Findings: ${findings.length} (c:${counts.critical ?? 0} h:${counts.high ?? 0} m:${counts.medium ?? 0} l:${counts.low ?? 0})`);
}

main().catch(err => {
  console.error('[QA] FATAL', err);
  process.exit(1);
});

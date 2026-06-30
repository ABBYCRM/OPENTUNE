import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  page.on('console', m => console.log(`[${m.type()}]`, m.text().slice(0, 400)));
  page.on('pageerror', e => console.log(`[PAGEERROR]`, e.message));
  page.on('response', r => {
    if (r.status() >= 400) console.log(`[HTTP ${r.status()}]`, r.url());
  });
  await page.goto('https://opentune-2tec.onrender.com/', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(2000);
  const html = await page.content();
  console.log('---html length:', html.length);
  console.log('---root contents (first 500 chars):');
  const root = await page.locator('#root').innerHTML().catch(e => `(error: ${e.message})`);
  console.log(root.slice(0, 500));
  await page.screenshot({ path: '/workspace/OPENTUNE/qa/screenshots/probe.png' });
  await browser.close();
}
main();

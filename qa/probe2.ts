import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--disable-gpu'],
  });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  // Attach EVERY listener like the QA script does
  page.on('console', m => console.log(`[${m.type()}]`, m.text().slice(0, 200)));
  page.on('pageerror', e => console.log(`[PAGEERROR]`, e.message, '\n', e.stack?.slice(0, 500)));
  page.on('requestfailed', req => console.log(`[REQFAIL]`, req.url(), '-', req.failure()?.errorText));
  page.on('response', r => {
    if (r.status() >= 400) console.log(`[HTTP ${r.status()}]`, r.url());
  });

  console.log('--- goto ---');
  try {
    await page.goto('https://opentune-2tec.onrender.com/', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('--- goto OK ---');
  } catch (err) {
    console.log('--- goto FAILED ---', err.message);
  }

  await page.waitForTimeout(2000);
  console.log('--- after wait ---');
  console.log('nav count:', await page.locator('.nav-item').count());
  console.log('first nav text:', await page.locator('.nav-item').first().innerText().catch(e => `err: ${e.message}`));

  // Try the click
  console.log('--- clicking Connect nav ---');
  try {
    await page.locator('.nav-item', { hasText: 'Connect' }).first().click({ timeout: 5000 });
    console.log('--- click OK ---');
  } catch (err) {
    console.log('--- click FAILED ---', err.message);
  }

  await browser.close();
}
main();

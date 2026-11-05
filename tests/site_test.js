// npm run test:site (serve the repository first with npm run serve)
const { chromium } = require('playwright');
const assert = require('assert');
const base = (process.env.SITE_URL || 'http://127.0.0.1:8000/').replace(/\/?$/, '/');
(async () => {
  const browser = await chromium.launch({
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  try {
    for (const [width, height] of [[1440, 1000], [768, 1024], [390, 844], [320, 740]]) {
      const page = await browser.newPage({ viewport: { width, height }, isMobile: width < 500, hasTouch: width < 500 });
      // Isolate page-layout tests from the expensive voxel world generation.
      await page.route('**/blocraft.html', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Game frame test</title>' }));
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
      await page.goto(base, { waitUntil: 'networkidle' });
      assert(await page.title() === 'BLOCRAFT — Ton monde. Tes règles.');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Horizontal overflow at ${width}px`);
      assert(await page.locator('a[href="jeu/"]').count() >= 3);
      await page.locator('.hero-actions .primary').click({ noWaitAfter: true });
      await page.waitForURL(new URL('jeu/', base).href, { waitUntil: 'domcontentloaded' });
      assert.equal(await page.locator('#game').getAttribute('src'), '../blocraft.html');
      assert(await page.locator('.game-nav').isVisible());
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Game overflow at ${width}px`);
      // Navigation back should return to the project path, not the domain root.
      await page.locator('.home').click();
      await page.waitForURL(base);
      assert.deepEqual(errors, []);
      console.log(`OK: ${width} × ${height}, landing, assets, game link, frame, back navigation`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

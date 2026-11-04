const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  await p.addInitScript(() => {
    HTMLElement.prototype.requestPointerLock = function () {
      document.dispatchEvent(new Event('pointerlockerror'));
      return Promise.reject(new Error('sandbox'));
    };
  });
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });
  await p.evaluate(() => { document.querySelector('#btnPlay').click(); document.querySelector('#ngStart').click(); });
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(1500);

  await p.evaluate(() => {
    window._log = [];
    for (const f of ['breakBlock', 'tryAttack']) {
      const o = window[f];
      window[f] = function () { window._log.push([f, Math.round(performance.now())]); return o.apply(this, arguments); };
    }
    window.addEventListener('mousedown', e => window._log.push(['down', e.button, Math.round(performance.now()), FB.drag, FB.mining, Game.state]), true);
    window.addEventListener('mouseup', e => window._log.push(['up', e.button, Math.round(performance.now()), FB.down, FB.drag, FB.mining]), true);
  });

  await p.mouse.move(640, 400);
  await p.mouse.down();
  await p.waitForTimeout(60);
  await p.mouse.up();
  await p.waitForTimeout(300);
  console.log('click', JSON.stringify(await p.evaluate(() => window._log)));

  await p.evaluate(() => { window._log = []; });
  await p.mouse.move(500, 400);
  await p.mouse.down();
  for (let i = 1; i <= 10; i++) { await p.mouse.move(500 + i * 25, 400); }
  await p.waitForTimeout(300);
  await p.mouse.up();
  await p.waitForTimeout(200);
  console.log('drag', JSON.stringify(await p.evaluate(() => window._log)));
  await b.close();
})();

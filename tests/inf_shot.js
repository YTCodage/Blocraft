const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });
  await p.evaluate(() => document.querySelector('.worldBtn[data-world="flat"]').click());
  await p.evaluate(() => { document.querySelector('#btnPlay').click(); document.querySelector('#ngStart').click(); });
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(1500);
  await p.evaluate(() => {
    const s = document.querySelector('#setDist'); s.value = '0'; s.dispatchEvent(new Event('change'));
    View.min = 18; View.radius = 18; View.growAt = performance.now() + 60000;
    Player.pos = [0.5, 66.5, 0.5]; Player.pitch = 0.0; Player.yaw = 0.6; Player.flying = true;
  });
  await p.waitForTimeout(14000);
  const st = await p.evaluate(() => ({ chunks: Game.manager.chunks.size, meshQ: Game.manager.meshQueue.size, fps: Math.round(fpsAvg), radius: View.radius, draw: View.draw }));
  console.log('infinite', JSON.stringify(st));
  await p.screenshot({ path: '/tmp/t/shots/infinite2.png' });
  console.log('errs', errs.slice(0, 3));
  await b.close();
})();

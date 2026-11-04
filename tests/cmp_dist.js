const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1100, height: 700 } });
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });
  await p.evaluate(() => document.querySelector('.worldBtn[data-world="flat"]').click());
  await p.evaluate(() => { document.querySelector('#btnPlay').click(); document.querySelector('#ngStart').click(); });
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(1500);
  await p.evaluate(() => { Player.pos = [0.5, 66.5, 0.5]; Player.pitch = -0.05; Player.yaw = 0.6; Player.flying = true; });
  await p.waitForTimeout(4000);
  await p.screenshot({ path: '/tmp/t/shots/dist_normale.png' });
  await p.evaluate(() => {
    const s = document.querySelector('#setDist'); s.value = '0'; s.dispatchEvent(new Event('change'));
    View.min = 18; View.radius = 18; View.growAt = performance.now() + 60000;
  });
  await p.waitForTimeout(16000);
  await p.screenshot({ path: '/tmp/t/shots/dist_infinie.png' });
  console.log('ok', await p.evaluate(() => ({ draw: View.draw, chunks: Game.manager.chunks.size })));
  await b.close();
})();

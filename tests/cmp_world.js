const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1100, height: 700 } });
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });
  await p.evaluate(() => { document.querySelector('#btnPlay').click(); document.querySelector('#ngStart').click(); });
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(2000);
  await p.evaluate(() => { Player.pos = [Game.spawn[0], Game.spawn[1] + 26, Game.spawn[2]]; Player.flying = true; Player.pitch = -0.12; Player.yaw = 2.2; });
  await p.waitForTimeout(3500);
  await p.screenshot({ path: '/tmp/t/shots/w_normale.png' });
  await p.evaluate(() => {
    const s = document.querySelector('#setDist'); s.value = '0'; s.dispatchEvent(new Event('change'));
    View.min = 18; View.radius = 18; View.growAt = performance.now() + 60000;
  });
  await p.waitForTimeout(18000);
  await p.screenshot({ path: '/tmp/t/shots/w_infinie.png' });
  console.log('ok', await p.evaluate(() => ({ draw: View.draw, chunks: Game.manager.chunks.size, fps: Math.round(fpsAvg) })));
  await b.close();
})();

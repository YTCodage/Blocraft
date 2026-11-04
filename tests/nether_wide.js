const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1400, height: 820 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });
  await p.evaluate(() => { Game.mode = 'creative'; document.querySelector('#btnPlay').click(); document.querySelector('#ngStart').click(); });
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.evaluate(() => Dimensions.go('nether', { x: 0.5, y: 66.1, z: 6.5, yaw: -1.57 }));
  await p.waitForFunction(() => Dimensions.current === 'nether' && !Dimensions.busy, null, { timeout: 180000 });
  await p.waitForTimeout(1200);
  // portée infinie pour juger l'immensité
  await p.evaluate(() => { const s = document.querySelector('#setDist'); s.value = '0'; s.dispatchEvent(new Event('change'));
    View.min = 14; View.radius = 14; View.growAt = performance.now() + 60000; });
  // on se place haut dans une caverne, au-dessus du hall, pour voir la voûte
  await p.evaluate(() => { Player.flying = true; Player.pos = [38.5, 92, -14.5]; Player.yaw = 2.4; Player.pitch = -0.32; });
  await p.waitForTimeout(16000);
  await p.screenshot({ path: '/tmp/t/shots/nether9.png' });
  const st = await p.evaluate(() => ({ chunks: Game.manager.chunks.size, draw: View.draw, fps: Math.round(fpsAvg) }));
  console.log(JSON.stringify(st), 'errs', errs.slice(0, 3));
  await b.close();
})();

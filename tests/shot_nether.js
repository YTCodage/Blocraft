const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1360, height: 860 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });
  await p.evaluate(() => { document.querySelector('#btnPlay').click(); document.querySelector('#ngStart').click(); });
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(2000);
  await p.evaluate(() => { Game.mode = 'survival'; Dimensions.go('nether', { x: 0.5, y: 66.1, z: 6.5, yaw: -Math.PI / 2 }); });
  await p.waitForFunction(() => Dimensions.current === 'nether' && !Dimensions.busy, null, { timeout: 120000 });
  await p.waitForTimeout(6000);
  await p.evaluate(() => { Mobs.spawnT = 0; });
  await p.waitForTimeout(4000);
  await p.screenshot({ path: '/tmp/t/shots/nether3.png' });
  // vue plongeante sur le lac
  await p.evaluate(() => { Player.pos = [2.5, 74.1, 8.5]; Player.yaw = -1.1; Player.pitch = -0.55; Game.mode = 'creative'; Player.flying = true; Player.vel=[0,0,0]; });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: '/tmp/t/shots/nether4.png' });
  console.log('mobs', JSON.stringify(await p.evaluate(() => Mobs.list.map(m => [m.type, Math.round(m.pos[0]), Math.round(m.pos[1]), Math.round(m.pos[2])]))));
  console.log('ERR', JSON.stringify(errs));
  await b.close();
})();

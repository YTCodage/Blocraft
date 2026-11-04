const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 780 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });
  await p.evaluate(() => { Game.mode = 'creative'; document.querySelector('#btnPlay').click(); document.querySelector('#ngStart').click(); });
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.evaluate(() => Dimensions.go('nether', { x: 0.5, y: 66.1, z: 6.5, yaw: -1.57 }));
  await p.waitForFunction(() => Dimensions.current === 'nether' && !Dimensions.busy, null, { timeout: 180000 });
  await p.waitForTimeout(1500);
  // traverse une galerie vers l'extérieur
  await p.evaluate(() => {
    const ang = 0.55, d = 46;
    Player.flying = true;
    Player.pos = [Math.round(Math.cos(ang) * d) + 0.5, 67.5, Math.round(Math.sin(ang) * d) + 0.5];
    Player.yaw = -ang - Math.PI / 2; Player.pitch = -0.08;
  });
  await p.waitForTimeout(3500);
  await p.screenshot({ path: '/tmp/t/shots/nether7.png' });
  // au fond d'une caverne, vers le haut
  await p.evaluate(() => { Player.pitch = 0.42; });
  await p.waitForTimeout(1600);
  await p.screenshot({ path: '/tmp/t/shots/nether8.png' });
  const st = await p.evaluate(() => ({ y: Math.round(Player.pos[1]), roof: (() => { let y = Math.floor(Player.pos[1]); while (y < 127 && Game.manager.getBlock(Math.floor(Player.pos[0]), y, Math.floor(Player.pos[2])) === 0) y++; return y; })() }));
  console.log('au-dessus', JSON.stringify(st), 'errs', errs.slice(0, 3));
  await b.close();
})();

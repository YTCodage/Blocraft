const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1366, height: 860 } });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGE ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });
  await p.screenshot({ path: '/tmp/t/shots/menu_flat.png' });

  await p.evaluate(() => document.querySelector('.worldBtn[data-world="flat"]').click());
  await p.waitForTimeout(400);
  const mode = await p.evaluate(() => Game.mode);
  await p.evaluate(() => { document.querySelector('#btnPlay').click(); document.querySelector('#ngStart').click(); });
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(3000);

  const info = await p.evaluate(() => ({
    dim: Game.manager.dim,
    mode: Game.mode,
    pos: Player.pos.map(v => Math.round(v * 100) / 100),
    around: [Game.manager.getBlock(0, 64, 0), Game.manager.getBlock(0, 63, 0), Game.manager.getBlock(3, 64, -7)],
    chunks: Game.manager.chunks.size,
  }));
  console.log('flat', mode, JSON.stringify(info));
  await p.screenshot({ path: '/tmp/t/shots/flat1.png' });

  // loin de l'origine : le monde continue à l'infini
  await p.evaluate(() => { Player.pos = [12000.5, 66, -9000.5]; Player.vel = [0, 0, 0]; });
  await p.waitForTimeout(3000);
  const far = await p.evaluate(() => ({
    y: Math.round(Player.pos[1] * 10) / 10,
    ground: Game.manager.getBlock(12000, 64, -9000),
    chunks: Game.manager.chunks.size,
  }));
  console.log('far', JSON.stringify(far));
  await p.screenshot({ path: '/tmp/t/shots/flat2.png' });

  console.log('errors', JSON.stringify(errs.slice(0, 6)));
  await b.close();
})();

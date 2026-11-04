const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 900, height: 600 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });
  await p.evaluate(() => { document.querySelector('#btnPlay').click(); document.querySelector('#ngStart').click(); });
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(1500);
  await p.evaluate(() => Dimensions.go('nether', { x: 6.5, y: 66.1, z: 15.5 }));
  await p.waitForFunction(() => Dimensions.current === 'nether' && !Dimensions.busy, null, { timeout: 120000 });
  await p.waitForTimeout(1500);
  const info = await p.evaluate(() => {
    const m = Game.manager;
    const col = [];
    for (let y = 55; y <= 85; y++) col.push([y, m.getBlock(6, y, 15)]);
    const row = [];
    for (let z = 0; z <= 26; z += 2) row.push([z, m.getBlock(6, 66, z)]);
    const px = [];
    for (let x = -10; x <= 30; x += 4) px.push([x, m.getBlock(x, 65, 15)]);
    return { dim: m.dim, chunks: m.chunks.size, col, row, px,
      lobby: typeof Nether !== 'undefined' ? Nether.built : 'n/a',
      mobs: Mobs.list.length, state: Game.state, mode: Game.mode,
      trySpawn: (() => { Mobs.spawnT = 0; Mobs.spawnTick(2); return Mobs.list.map(m2 => m2.type); })() };
  });
  console.log(JSON.stringify(info, null, 1));
  console.log('ERR', JSON.stringify(errs));
  await b.close();
})();

const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 900, height: 600 } });
  p.setDefaultTimeout(180000);
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  p.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text().slice(0, 200)); });
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 180000 });
  await p.click('#btnPlay'); await p.click('#ngStart');
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(1200);

  console.log('drops debug', JSON.stringify(await p.evaluate(() => {
    const px = Math.floor(Player.pos[0]), py = Math.floor(Player.pos[1]), pz = Math.floor(Player.pos[2]);
    const far = { x: px + 8, y: py + 2, z: pz, nx: 0, ny: 0, nz: 1, dist: 8, block: B.DIRT };
    const placed = Game.manager.setBlock(far.x, far.y, far.z, B.DIRT, true);
    const info = {
      mode: Game.mode, placed,
      blk: Game.manager.getBlock(far.x, far.y, far.z),
      drops: blockDrops(B.DIRT),
      hard: BLOCKS[B.DIRT].hard,
      dist: Math.hypot(far.x + 0.5 - Player.pos[0], far.y + 0.5 - (Player.pos[1] + 1.55), far.z + 0.5 - Player.pos[2]),
    };
    Drops.clear();
    finishBreak(far);
    info.afterDrops = Drops.list.length;
    info.afterInv = Game.inv.count(B.DIRT);
    info.blockNow = Game.manager.getBlock(far.x, far.y, far.z);
    return info;
  })));

  console.log('eye debug', JSON.stringify(await p.evaluate(async () => {
    Game.inv.slots = new Array(36).fill(null);
    Game.inv.add(I.ENDER_EYE, 3);
    Game.slot = 0;
    const ok = EnderEye.throwEye();
    const t0 = performance.now();
    for (let i = 0; i < 80 && EnderEye.live; i++) EnderEye.update(0.05);
    await new Promise(r => setTimeout(r, 300));
    return { ok, live: !!EnderEye.live, t: EnderEye.live ? EnderEye.live.t : null, state: Game.state,
      busy: Dimensions.busy, eyes: Game.inv.count(I.ENDER_EYE), ms: Math.round(performance.now() - t0) };
  })));
  await b.close();
})();

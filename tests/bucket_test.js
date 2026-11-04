const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1100, height: 720 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGE ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });
  await p.evaluate(() => { document.querySelector('#btnPlay').click(); document.querySelector('#ngStart').click(); });
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(2000);
  const res = await p.evaluate(() => {
    Game.mode = 'survival';
    const x0 = Math.floor(Player.pos[0]), y0 = Math.floor(Player.pos[1]), z0 = Math.floor(Player.pos[2]);
    // plateforme propre autour du joueur
    for (let dx = -2; dx <= 6; dx++) for (let dz = -2; dz <= 2; dz++) {
      Game.manager.setBlock(x0 + dx, y0 - 1, z0 + dz, B.STONEBRICK, true);
      Game.manager.setBlock(x0 + dx, y0, z0 + dz, B.AIR, true);
      Game.manager.setBlock(x0 + dx, y0 + 1, z0 + dz, B.AIR, true);
      Game.manager.setBlock(x0 + dx, y0 + 2, z0 + dz, B.AIR, true);
    }
    Player.pos = [x0 + 0.5, y0, z0 + 0.5];
    Player.vel = [0, 0, 0];
    Player.yaw = -Math.PI / 2; Player.pitch = 0;
    Game.manager.setBlock(x0 + 3, y0 + 1, z0, B.WATER, true);
    Game.inv.slots[0] = { id: I.BUCKET, n: 1 }; Game.slot = 0;
    const hit = raycastVoxel(eyePos(), lookDir(), 6, Game.manager, true);
    const ok1 = useBucket();
    const afterFill = { ok1, water: Game.inv.count(I.BUCKET_WATER), empty: Game.manager.getBlock(x0 + 3, y0 + 1, z0), src: Game.inv.count(I.BUCKET) };
    // vider le seau sur le sol devant
    Game.slot = 0;
    const slotIdx = Game.inv.slots.findIndex(s => s && s.id === I.BUCKET_WATER);
    Game.slot = slotIdx;
    Game.manager.setBlock(x0 + 2, y0 + 1, z0, B.STONEBRICK, true);   // cible pleine
    const tx = x0 + 2, ty = y0 + 1, tz = z0;
    Game.target = { x: tx, y: ty, z: tz, block: B.STONEBRICK, nx: -1, ny: 0, nz: 0, dist: 1.5 };
    const ok2 = useBucket();
    const placed = [];
    for (let dx = 0; dx <= 4; dx++) placed.push(Game.manager.getBlock(x0 + dx, y0 + 1, z0));
    return { hit, afterFill, ok2, placed, back: Game.inv.count(I.BUCKET) };
  });
  console.log(JSON.stringify(res, null, 1));
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();

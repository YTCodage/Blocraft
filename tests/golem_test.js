const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });
  await p.evaluate(() => { Game.mode = 'creative'; document.querySelector('#btnPlay').click(); document.querySelector('#ngStart').click(); });
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(1500);

  const r = await p.evaluate(async () => {
    const m = Game.manager;
    const bx = Math.floor(Player.pos[0]), bz = Math.floor(Player.pos[2]) - 6;
    const gy = Math.floor(m.heightAt(bx, bz));
    const clear = (x, y, z) => m.setBlock(x, y, z, B.AIR, true);
    // plateforme
    for (let dx = -3; dx <= 3; dx++) for (let dz = -3; dz <= 3; dz++) {
      m.setBlock(bx + dx, gy, bz + dz, B.STONE, true);
      for (let dy = 1; dy <= 5; dy++) clear(bx + dx, gy + dy, bz + dz);
    }
    // golem de fer : bas y+1, corps+bras y+2, citrouille y+3
    m.setBlock(bx, gy + 1, bz, B.IRON_BLOCK, true);
    m.setBlock(bx, gy + 2, bz, B.IRON_BLOCK, true);
    m.setBlock(bx - 1, gy + 2, bz, B.IRON_BLOCK, true);
    m.setBlock(bx + 1, gy + 2, bz, B.IRON_BLOCK, true);

    // golem de neige : 2 neiges + citrouille
    const sx = bx + 8, sz = bz;
    for (let dx = -3; dx <= 3; dx++) for (let dz = -3; dz <= 3; dz++) {
      m.setBlock(sx + dx, gy, sz + dz, B.STONE, true);
      for (let dy = 1; dy <= 5; dy++) clear(sx + dx, gy + dy, sz + dz);
    }
    m.setBlock(sx, gy + 1, sz, B.SNOW, true);
    m.setBlock(sx, gy + 2, sz, B.SNOW, true);

    // on pose la citrouille « à la main » : Game.target + placeBlock
    const before = Mobs.list.length;
    const place = (x, y, z, id) => {
      Game.inv.slots[Game.slot] = { id, n: 64 };
      Game.target = { x, y: y - 1, z, nx: 0, ny: 1, nz: 0, block: m.getBlock(x, y - 1, z), dist: 3 };
      placeBlock();
    };
    place(bx, gy + 3, bz, B.PUMPKIN_CARVED);
    await new Promise(r => setTimeout(r, 300));
    const afterIron = Mobs.list.filter(x => x.type === 'iron_golem').length;
    const ironBlocksLeft = m.getBlock(bx, gy + 1, bz) !== B.AIR || m.getBlock(bx, gy + 2, bz) !== B.AIR;

    place(sx, gy + 3, sz, B.PUMPKIN);
    await new Promise(r => setTimeout(r, 300));
    const afterSnow = Mobs.list.filter(x => x.type === 'snow_golem').length;

    // pas de golem sans la forme : une citrouille seule
    place(bx, gy + 1, bz + 3, B.PUMPKIN);
    await new Promise(r => setTimeout(r, 200));
    const afterAlone = Mobs.list.length;

    return { before, afterIron, afterSnow, afterAlone,
      pumpkinLeft: m.getBlock(bx, gy + 3, bz),
      ironLeft: m.getBlock(bx, gy + 1, bz),
      types: Mobs.list.map(x => x.type) };
  });
  console.log(JSON.stringify(r));
  // capture
  await p.evaluate(() => { Player.pitch = -0.1; Player.yaw = 3.14; });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: '/tmp/t/shots/golems.png' });
  console.log('errs', errs.slice(0, 5));
  await b.close();
})();

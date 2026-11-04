const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 760 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });
  await p.evaluate(() => { Game.mode = 'creative'; document.querySelector('#btnPlay').click(); document.querySelector('#ngStart').click(); });
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(1200);
  const pos = await p.evaluate(async () => {
    const m = Game.manager;
    // grande plateforme bien plate, dans le monde plat ? non : on aplatit ici
    const bx = Math.floor(Player.pos[0]), bz = Math.floor(Player.pos[2]) - 8;
    const gy = Math.floor(m.heightAt(bx, bz)) + 1;
    for (let dx = -8; dx <= 8; dx++) for (let dz = -8; dz <= 8; dz++) {
      m.setBlock(bx + dx, gy, bz + dz, B.GRASS, true);
      for (let dy = 1; dy <= 6; dy++) m.setBlock(bx + dx, gy + dy, bz + dz, B.AIR, true);
    }
    // golem de fer
    m.setBlock(bx - 2, gy + 1, bz, B.IRON_BLOCK, true);
    m.setBlock(bx - 2, gy + 2, bz, B.IRON_BLOCK, true);
    m.setBlock(bx - 3, gy + 2, bz, B.IRON_BLOCK, true);
    m.setBlock(bx - 1, gy + 2, bz, B.IRON_BLOCK, true);
    // golem de neige
    m.setBlock(bx + 2, gy + 1, bz, B.SNOW, true);
    m.setBlock(bx + 2, gy + 2, bz, B.SNOW, true);
    // on pose les citrouilles avec la vraie fonction de pose
    const place = (x, y, z) => {
      Game.inv.slots[Game.slot] = { id: B.PUMPKIN_CARVED, n: 64 };
      Game.target = { x, y: y - 1, z, nx: 0, ny: 1, nz: 0, block: m.getBlock(x, y - 1, z), dist: 3 };
      placeBlock();
    };
    place(bx - 2, gy + 3, bz);
    place(bx + 2, gy + 3, bz);
    await new Promise(r => setTimeout(r, 400));
    // caméra devant
    Player.flying = true;
    Player.pos = [bx + 0.5, gy + 2.6, bz + 8.5];
    Player.yaw = 0; Player.pitch = -0.06;
    return { types: Mobs.list.map(x => x.type), gy };
  });
  await p.waitForTimeout(3500);
  await p.screenshot({ path: '/tmp/t/shots/golems2.png' });
  console.log(JSON.stringify(pos), 'errs', errs.slice(0, 3));
  await b.close();
})();

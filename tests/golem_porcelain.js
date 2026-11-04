const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 900, height: 600 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });
  await p.evaluate(() => { Game.mode = 'creative'; document.querySelector('#btnPlay').click(); document.querySelector('#ngStart').click(); });
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(1000);
  const r = await p.evaluate(async () => {
    const m = Game.manager;
    const bx = Math.floor(Player.pos[0]) + 20, bz = Math.floor(Player.pos[2]);
    const gy = Math.floor(m.heightAt(bx, bz)) + 1;
    for (let dx = -6; dx <= 6; dx++) for (let dz = -6; dz <= 6; dz++) {
      m.setBlock(bx + dx, gy, bz + dz, B.STONE, true);
      for (let dy = 1; dy <= 6; dy++) m.setBlock(bx + dx, gy + dy, bz + dz, B.AIR, true);
    }
    const place = (x, y, z, id) => {
      Game.inv.slots[Game.slot] = { id, n: 64 };
      Game.target = { x, y: y - 1, z, nx: 0, ny: 1, nz: 0, block: m.getBlock(x, y - 1, z), dist: 3 };
      placeBlock();
    };
    const out = {};
    // variante torche/autre : citrouille sur 2 blocs de fer mais sans bras -> rien
    m.setBlock(bx, gy + 1, bz, B.IRON_BLOCK, true);
    m.setBlock(bx, gy + 2, bz, B.IRON_BLOCK, true);
    place(bx, gy + 3, bz, B.PUMPKIN);
    await new Promise(r => setTimeout(r, 150));
    out.sansBras = Mobs.list.filter(x => x.type === 'iron_golem').length;

    // avec bras en croix dans l'autre sens (axe z)
    m.setBlock(bx, gy + 3, bz, B.AIR, true);   // on retire la citrouille de l'essai précédent
    m.setBlock(bx, gy + 1, bz, B.IRON_BLOCK, true);
    m.setBlock(bx, gy + 2, bz, B.IRON_BLOCK, true);
    m.setBlock(bx, gy + 2, bz - 1, B.IRON_BLOCK, true);
    m.setBlock(bx, gy + 2, bz + 1, B.IRON_BLOCK, true);
    place(bx, gy + 3, bz, B.PUMPKIN_LANTERN);
    await new Promise(r => setTimeout(r, 150));
    out.brasZ = Mobs.list.filter(x => x.type === 'iron_golem').length;

    // golem de neige avec citrouille sculptée
    const sx = bx + 4;
    m.setBlock(sx, gy + 1, bz, B.SNOW, true);
    m.setBlock(sx, gy + 2, bz, B.SNOW, true);
    place(sx, gy + 3, bz, B.PUMPKIN_CARVED);
    await new Promise(r => setTimeout(r, 150));
    out.neige = Mobs.list.filter(x => x.type === 'snow_golem').length;

    out.types = Mobs.list.map(x => x.type);
    return out;
  });
  console.log(JSON.stringify(r), 'errs', errs.slice(0, 3));
  await b.close();
})();

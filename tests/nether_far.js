const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 700 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });
  await p.evaluate(() => { Game.mode = 'creative'; document.querySelector('#btnPlay').click(); document.querySelector('#ngStart').click(); });
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.evaluate(() => Dimensions.go('nether', { x: 0.5, y: 66.1, z: 6.5, yaw: -1.57 }));
  await p.waitForFunction(() => Dimensions.current === 'nether' && !Dimensions.busy, null, { timeout: 180000 });
  const far = await p.evaluate(async () => {
    const out = [];
    for (const [x, z] of [[2000, 2000], [-8000, 3000], [30000, -12000]]) {
      Player.pos = [x, 70, z]; Player.vel = [0,0,0]; Player.flying = true;
      await new Promise(r => setTimeout(r, 2600));
      const cx = Math.floor(Player.pos[0] / 16), cz = Math.floor(Player.pos[2] / 16);
      let solid = 0, air = 0;
      for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) {
        const c = Game.manager.getChunk(cx + dx, cz + dz);
        if (!c) continue;
        for (let i = 0; i < c.data.length; i += 97) { if (c.data[i] === 0) air++; else solid++; }
      }
      out.push({ x, z, chunks: Game.manager.chunks.size, solid, air,
        ground: Game.manager.getBlock(x, 66, z), dim: Game.manager.dim });
    }
    return out;
  });
  console.log(JSON.stringify(far));
  console.log('errs', errs.slice(0, 3));
  await b.close();
})();

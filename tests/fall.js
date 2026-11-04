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
  const res = await p.evaluate(async () => {
    Game.mode = 'survival';
    const x = Math.floor(Player.pos[0]) + 6, z = Math.floor(Player.pos[2]) + 6;
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      Game.manager.setBlock(x + dx, 90, z + dz, B.STONEBRICK, true);
      for (let yy = 91; yy <= 105; yy++) Game.manager.setBlock(x + dx, yy, z + dz, B.AIR, true);
    }
    const out = [];
    for (const drop of [4, 6, 9]) {
      Survival.hp = 20; Survival.dead = false; Survival.invuln = 0;
      Player.pos = [x + 0.5, 91 + drop, z + 0.5];
      Player.vel = [0, 0, 0]; Player.fallDist = 0; Player.onGround = false; Player.flying = false;
      const samples = [];
      for (let k = 0; k < 22; k++) {
        await new Promise(r => setTimeout(r, 100));
        samples.push([Math.round(Player.pos[1] * 10) / 10, Math.round(Player.fallDist * 10) / 10, Math.round(Survival.hp * 10) / 10]);
      }
      out.push({ drop, hpAfter: Math.round(Survival.hp * 10) / 10, fall: Math.round(Player.fallDist * 10) / 10, samples: samples.filter((s, i) => i % 4 === 0) });
    }
    Survival.hp = 20;
    return out;
  });
  console.log(JSON.stringify(res, null, 1));
  console.log('ERR', JSON.stringify(errs));
  await b.close();
})();

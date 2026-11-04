const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 700 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });
  await p.evaluate(() => { Game.mode = 'creative'; document.querySelector('#btnPlay').click(); document.querySelector('#ngStart').click(); });
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(1200);
  const info = await p.evaluate(async () => {
    const m = Game.manager;
    const bx = Math.floor(Player.pos[0]), bz = Math.floor(Player.pos[2]) - 8;
    const gy = Math.floor(m.heightAt(bx, bz)) + 1;
    for (let dx = -8; dx <= 8; dx++) for (let dz = -8; dz <= 8; dz++) {
      m.setBlock(bx + dx, gy, bz + dz, B.GRASS, true);
      for (let dy = 1; dy <= 6; dy++) m.setBlock(bx + dx, gy + dy, bz + dz, B.AIR, true);
    }
    const s = Mobs.add('snow_golem', bx + 0.5, gy + 1, bz + 0.5); s.yaw = 0;
    const i = Mobs.add('iron_golem', bx + 3.5, gy + 1, bz + 0.5); i.yaw = 0.3;
    Player.flying = true;
    Player.pos = [bx + 1.8, gy + 1.7, bz + 4.6];
    Player.yaw = 0.25; Player.pitch = -0.15;
    return { snow: !!s, iron: !!i, model: s && s.def.model };
  });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: '/tmp/t/shots/golems3.png' });
  console.log(JSON.stringify(info), 'errs', errs.slice(0, 3));
  await b.close();
})();

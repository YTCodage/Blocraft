const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 800, height: 600 } });
  p.setDefaultTimeout(180000);
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 180000 });
  await p.click('#btnPlay'); await p.click('#ngStart');
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(1200);
  const res = await p.evaluate(async () => {
    const out = [];
    for (const h of [3, 5, 6, 8, 12]) {
      Survival.reset(); Survival.invuln = 0;
      const x = Math.floor(Player.pos[0]) + h, z = Math.floor(Player.pos[2]);
      const ground = Game.manager.heightAt(x, z);
      for (let yy = ground + 1; yy < ground + 30; yy++) Game.manager.setBlock(x, yy, z, B.AIR, true);
      Player.pos = [x + 0.5, ground + 1 + h, z + 0.5];
      Player.vel = [0, 0, 0]; Player.fallDist = 0; Player.onGround = false;
      const t0 = performance.now();
      while (performance.now() - t0 < 5000) {
        await new Promise(r => requestAnimationFrame(r));
        if (Player.onGround && Player.fallDist === 0 && performance.now() - t0 > 600) break;
      }
      out.push({ h, health: Math.round(Survival.health * 10) / 10, fallDist: Math.round(Player.fallDist * 10) / 10 });
    }
    return out;
  });
  console.log(JSON.stringify(res));
  await b.close();
})();

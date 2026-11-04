const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 750 } });
  p.setDefaultTimeout(180000);
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 180000 });
  await p.evaluate(() => { document.querySelector('#btnPlay').click(); document.querySelector('#ngStart').click(); });
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(2000);
  console.log(JSON.stringify(await p.evaluate(() => {
    Game.time = 0.25;  // midi
    const m = Game.manager, px = Math.floor(Player.pos[0]), pz = Math.floor(Player.pos[2]);
    const cnt = {};
    for (let x = px - 30; x <= px + 30; x++) for (let z = pz - 30; z <= pz + 30; z++) {
      const h = m.heightAt(x, z);
      const t = m.getBlock(x, h, z);
      const nm = (BLOCKS[t] && BLOCKS[t].name) || ('#' + t);
      cnt[nm] = (cnt[nm] || 0) + 1;
    }
    return Object.entries(cnt).sort((a, b2) => b2[1] - a[1]).slice(0, 12);
  })));
  await p.evaluate(() => { document.querySelector('#hud') && 0; });
  await p.waitForTimeout(1200);
  await p.screenshot({ path: '/tmp/t/shots/day_surface.png' });
  await b.close();
})();

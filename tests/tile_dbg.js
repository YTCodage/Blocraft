const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });
  const r = await p.evaluate(() => {
    const at = window.GAME_ATLAS, g = at.getContext('2d');
    const out = {};
    for (const [n, id] of [['lapis', B.LAPIS_ORE], ['copper', B.COPPER_ORE], ['redstone', B.REDSTONE_ORE], ['coal', B.COAL]]) {
      const t = BLOCKS[id].tex[1];
      const d = g.getImageData(t * 16, 0, 16, 16).data;
      const set = new Set();
      for (let i = 0; i < d.length; i += 4) set.add(d[i] + ',' + d[i+1] + ',' + d[i+2]);
      out[n] = { tile: t, colors: set.size, sample: [...set].slice(0, 6) };
    }
    return out;
  });
  console.log(JSON.stringify(r));
  await b.close();
})();

const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 800 } });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGE ' + e.message));
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });

  const out = await p.evaluate(() => {
    const t0 = performance.now();
    const m = new ChunkManager('nether');
    for (let cz = 0; cz < 3; cz++) for (let cx = 0; cx < 3; cx++) m.ensureChunk(cx, cz);
    const ms = Math.round(performance.now() - t0);
    const names = [['AIR', 0], ['NETHERRACK', 32], ['LAVA', 36], ['QUARTZ', 34], ['REDSTONE', 39],
      ['GOLD', 16], ['IRON', 15], ['COAL', 14], ['DIAMOND', 17], ['EMERALD', 23], ['NETHERITE', 94], ['SOULSAND', 33]];
    const count = {};
    let total = 0, air = 0;
    for (const c of m.chunks.values()) {
      const d = c.data;
      for (let i = 0; i < d.length; i++) { count[d[i]] = (count[d[i]] || 0) + 1; total++; if (d[i] === 0) air++; }
    }
    const res = {};
    for (const [n, id] of names) res[n] = +((100 * (count[id] || 0)) / total).toFixed(2);
    return { ms, chunks: m.chunks.size, total, airPct: +(100 * air / total).toFixed(1), res };
  });
  console.log(JSON.stringify(out));
  console.log('errors', JSON.stringify(errs.slice(0, 4)));
  await b.close();
})();

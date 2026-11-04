// Mesure la densité de « trous » en surface (caves qui percent la terre).
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve('blocraft.html');

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 640, height: 480 } });
  p.setDefaultTimeout(120000);
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 180000 });
  const res = await p.evaluate(() => {
    WorldGen.init(12345);
    const mgr = new ChunkManager('overworld');
    const R = 7;               // 15 × 15 chunks
    let cols = 0, holes = 0, deep = 0, water = 0;
    const R2 = [];
    for (let cz = -R; cz <= R; cz++) for (let cx = -R; cx <= R; cx++) mgr.ensureChunk(cx, cz);
    for (let cz = -R; cz <= R; cz++) {
      for (let cx = -R; cx <= R; cx++) {
        const c = mgr.chunks.get(cx + ',' + cz);
        if (!c) continue;
        for (let z = 0; z < 16; z++) for (let x = 0; x < 16; x++) {
          const wx = cx * 16 + x, wz = cz * 16 + z;
          const base = WorldGen.heightAt(wx, wz);
          if (base <= SEA) { water++; continue; }
          const top = c.heights[x + z * 16];
          const t = c.data[x + 16 * (z + 16 * top)] || 0;
          cols++;
          if (base - top >= 3) { holes++; if (base - top >= 8) deep++; }
        }
      }
    }
    return { cols, holes, deep, water, pct: +(100 * holes / Math.max(1, cols)).toFixed(2), deepPct: +(100 * deep / Math.max(1, cols)).toFixed(2) };
  });
  console.log(JSON.stringify(res), 'errors', errs.slice(0, 3));
  await b.close();
})();

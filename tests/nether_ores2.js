const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1400, height: 820 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });
  const r = await p.evaluate(() => {
    const ids = { coal: B.NETHER_COAL_ORE, iron: B.NETHER_IRON_ORE, gold: B.NETHER_GOLD_ORE,
      diamond: B.NETHER_DIAMOND_ORE, emerald: B.NETHER_EMERALD_ORE, quartz: B.QUARTZ_ORE,
      redstone: B.REDSTONE_ORE, netherite: B.NETHERITE_ORE, shroom: B.SHROOMLIGHT };
    const m = new ChunkManager('nether');
    const t0 = performance.now();
    for (let cz = 0; cz < 4; cz++) for (let cx = 0; cx < 4; cx++) m.ensureChunk(cx, cz);
    const ms = Math.round(performance.now() - t0);
    const cnt = {};
    let total = 0;
    for (const c of m.chunks.values()) { for (let i = 0; i < c.data.length; i++) { cnt[c.data[i]] = (cnt[c.data[i]] || 0) + 1; total++; } }
    const res = {};
    for (const [k, id] of Object.entries(ids)) res[k] = cnt[id] || 0;
    return { ms, total, ids, res, names: Object.fromEntries(Object.entries(ids).map(([k, id]) => [k, itemName(id)])) };
  });
  console.log(JSON.stringify({ ms: r.ms, res: r.res }));
  console.log('noms', JSON.stringify(r.names));
  console.log('errs', errs.slice(0, 3));
  await b.close();
})();

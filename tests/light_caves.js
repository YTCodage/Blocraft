const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1360, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });
  const counts = await p.evaluate(() => {
    const m = new ChunkManager('nether');
    const t0 = performance.now();
    for (let cz = 0; cz < 4; cz++) for (let cx = 0; cx < 4; cx++) m.ensureChunk(cx, cz);
    const ms = Math.round(performance.now() - t0);
    let glow = 0, shroom = 0, lava = 0;
    for (const c of m.chunks.values()) for (let i = 0; i < c.data.length; i++) {
      const t = c.data[i]; if (t === B.GLOWSTONE) glow++; else if (t === B.SHROOMLIGHT) shroom++; else if (t === B.LAVA) lava++;
    }
    return { ms, glow, shroom, lava };
  });
  console.log('nether lights', JSON.stringify(counts));

  await p.evaluate(() => { Game.mode = 'creative'; document.querySelector('#btnPlay').click(); document.querySelector('#ngStart').click(); });
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  // citrouilles sauvages dans le monde normal
  const pk = await p.evaluate(() => {
    let n = 0, carved = 0;
    for (let cz = -8; cz <= 8 && n < 12; cz++) for (let cx = -8; cx <= 8; cx++) {
      const c = Game.manager.getChunk(cx, cz); if (!c) continue;
      for (let i = 0; i < c.data.length; i++) { if (c.data[i] === B.PUMPKIN) n++; else if (c.data[i] === B.PUMPKIN_CARVED) carved++; }
    }
    return { pumpkin: n, carved };
  });
  console.log('citrouilles sauvages', JSON.stringify(pk));
  console.log('errs', errs.slice(0, 3));
  await b.close();
})();

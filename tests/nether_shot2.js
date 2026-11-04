const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1360, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });
  await p.evaluate(() => { Game.mode = 'creative'; document.querySelector('#btnPlay').click(); document.querySelector('#ngStart').click(); });
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.evaluate(() => Dimensions.go('nether', { x: 0.5, y: 66.1, z: 6.5, yaw: -1.57 }));
  await p.waitForFunction(() => Dimensions.current === 'nether' && !Dimensions.busy, null, { timeout: 180000 });
  await p.evaluate(() => { const s = document.querySelector('#setDist'); s.value = '0'; s.dispatchEvent(new Event('change'));
    View.min = 12; View.radius = 12; View.growAt = performance.now() + 60000; });
  await p.waitForTimeout(9000);

  // 1) vue d'ensemble depuis le haut du hall
  await p.evaluate(() => { Player.flying = true; Player.pos = [-6.5, 75, -8.5]; Player.yaw = 0.85; Player.pitch = -0.42; });
  await p.waitForTimeout(6000);
  await p.screenshot({ path: '/tmp/t/shots/nether10.png' });

  // 2) au fond d'une caverne : on cherche une poche d'air haute
  const spot = await p.evaluate(() => {
    const m = Game.manager;
    for (let cx = -3; cx <= 3; cx++) for (let cz = -3; cz <= 3; cz++) {
      const c = m.getChunk(cx, cz); if (!c) continue;
      for (let y = 72; y < 96; y++) for (let lz = 4; lz < 12; lz++) for (let lx = 4; lx < 12; lx++) {
        const t = m.getBlock(cx * 16 + lx, y, cz * 16 + lz);
        if (t !== 0) continue;
        let open = 0;
        for (let d = 1; d < 12; d++) if (m.getBlock(cx * 16 + lx, y, cz * 16 + lz + d) === 0) open++;
        if (open > 10) return [cx * 16 + lx + 0.5, y + 0.2, cz * 16 + lz + 0.5];
      }
    }
    return null;
  });
  console.log('spot', JSON.stringify(spot));
  if (spot) {
    await p.evaluate((s) => { Player.pos = [s[0], s[1], s[2]]; Player.yaw = 0; Player.pitch = -0.05; Player.flying = true; }, spot);
    await p.waitForTimeout(7000);
    await p.screenshot({ path: '/tmp/t/shots/nether11.png' });
  }
  console.log('errs', errs.slice(0, 3));
  await b.close();
})();

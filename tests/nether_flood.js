const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 900, height: 600 } });
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });
  await p.evaluate(() => { Game.mode = 'creative'; document.querySelector('#btnPlay').click(); document.querySelector('#ngStart').click(); });
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.evaluate(() => Dimensions.go('nether', { x: 0.5, y: 66.1, z: 6.5, yaw: -1.57 }));
  await p.waitForFunction(() => Dimensions.current === 'nether' && !Dimensions.busy, null, { timeout: 180000 });
  const r = await p.evaluate(() => {
    // charge une couronne de chunks autour du hall
    for (let cz = -4; cz <= 4; cz++) for (let cx = -4; cx <= 4; cx++) Game.manager.ensureChunk(cx, cz);
    const mgr = Game.manager;
    const solid = (x, y, z) => { const t = mgr.getBlock(x, y, z); return t !== 0 && t !== 36; };
    const start = [Math.floor(Player.pos[0]), 66, Math.floor(Player.pos[2])];
    const seen = new Set(); const q = [start]; seen.add(start.join(','));
    let maxD = 0;
    while (q.length) {
      const [x, y, z] = q.pop();
      const d = Math.hypot(x - start[0], z - start[2]);
      if (d > maxD) maxD = d;
      for (const [dx, dy, dz] of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]) {
        const nx = x + dx, ny = y + dy, nz = z + dz;
        if (Math.abs(nx - start[0]) > 56 || Math.abs(nz - start[2]) > 56 || ny < 4 || ny > 100) continue;
        const k = nx + ',' + ny + ',' + nz;
        if (seen.has(k) || solid(nx, ny, nz)) continue;
        seen.add(k); q.push([nx, ny, nz]);
      }
    }
    return { reachable: seen.size, maxDist: Math.round(maxD) };
  });
  console.log(JSON.stringify(r));
  await b.close();
})();

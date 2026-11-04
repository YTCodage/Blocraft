const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGE ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });
  await p.evaluate(() => { Game.mode = 'creative'; document.querySelector('#btnPlay').click(); document.querySelector('#ngStart').click(); });
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(1500);

  const t0 = Date.now();
  await p.evaluate(() => Dimensions.go('nether', { x: 0.5, y: 66.1, z: 6.5, yaw: Math.PI }));
  await p.waitForFunction(() => Dimensions.current === 'nether' && !Dimensions.busy, null, { timeout: 180000 });
  const ms = Date.now() - t0;
  await p.waitForTimeout(1200);

  const tunnel = await p.evaluate(() => {
    const m = Game.manager;
    const out = [];
    for (const ang of [0.55, 1.85, 3.15, 4.45, 5.55]) {
      let air = 0, solid = 0;
      for (let d = 24; d < 70; d += 4) {
        const gx = Math.round(Math.cos(ang) * d), gz = Math.round(Math.sin(ang) * d);
        for (let y = 65; y <= 69; y++) {
          if (m.getBlock(gx, y, gz) === 0) air++;
          else solid++;
        }
      }
      out.push([ang, air, solid]);
    }
    return out;
  });
  console.log('nether load ms', ms, 'tunnels', JSON.stringify(tunnel));

  // vue plongeante
  await p.evaluate(() => {
    Player.flying = true;
    Player.pos = [0.5, 96, 0.5];
    Player.vel = [0, 0, 0];
    Player.yaw = 0.9; Player.pitch = -0.62;
  });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: '/tmp/t/shots/nether5.png' });

  // vue depuis une galerie
  await p.evaluate(() => {
    const d = 40, ang = 0.55;
    Player.pos = [Math.round(Math.cos(ang) * d) + 0.5, 66.2, Math.round(Math.sin(ang) * d) + 0.5];
    Player.yaw = -ang - Math.PI / 2; Player.pitch = -0.05;
  });
  await p.waitForTimeout(2200);
  await p.screenshot({ path: '/tmp/t/shots/nether6.png' });

  // les minerais sont-ils visibles dans les parois ?
  const ores = await p.evaluate(() => {
    const m = Game.manager, cnt = {};
    for (const c of m.chunks.values()) {
      for (let i = 0; i < c.data.length; i++) { const t = c.data[i]; if (t >= 14 && t <= 94) cnt[t] = (cnt[t] || 0) + 1; }
    }
    return cnt;
  });
  console.log('ores', JSON.stringify(ores));
  console.log('errors', JSON.stringify(errs.slice(0, 4)));
  await b.close();
})();

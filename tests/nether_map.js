const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1000, height: 700 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });
  await p.evaluate(() => { document.querySelector('#btnPlay').click(); document.querySelector('#ngStart').click(); });
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.evaluate(() => Dimensions.go('nether', { x: 0.5, y: 66.1, z: 6.5, yaw: -Math.PI/2 }));
  await p.waitForFunction(() => Dimensions.current === 'nether' && !Dimensions.busy, null, { timeout: 180000 });
  await p.waitForTimeout(1500);
  const m = await p.evaluate(() => {
    const g = (x,y,z) => Game.manager.getBlock(x,y,z);
    const rows = [];
    for (let z = 14; z >= -2; z--) {
      let line = '';
      for (let x = -2; x <= 14; x++) {
        const t = g(x, 66, z);
        line += t === 0 ? '.' : (t === 36 ? '~' : (t === 32 ? '#' : String.fromCharCode(65 + (t % 26))));
      }
      rows.push(line);
    }
    return { rows, y65: g(6,65,6), y67: g(6,67,6), pos: Player.pos.map(v=>Math.round(v*10)/10), mobs: Mobs.list.length };
  });
  console.log(JSON.stringify(m));
  console.log('errs', errs.slice(0,3));
  await b.close();
})();

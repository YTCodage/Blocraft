const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1000, height: 700 } });
  p.setDefaultTimeout(180000);
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 180000 });
  await p.click('#btnPlay'); await p.click('#ngStart');
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(1000);
  console.log(JSON.stringify(await p.evaluate(() => {
    Game.inv.slots = new Array(36).fill(null);
    Game.inv.slots[0] = { id: I.SPICK, n: 1, d: 60 };
    Game.inv.slots[1] = { id: I.SPICK, n: 1, d: 120 };
    buildHotbar();
    const slots = document.querySelectorAll('#hotbar .slot');
    const s0 = slots[0];
    const bar = s0.querySelector('.durb');
    const cs = bar ? getComputedStyle(bar) : null;
    const r = bar ? bar.getBoundingClientRect() : null;
    const sr = s0.getBoundingClientRect();
    return {
      count: document.querySelectorAll('#hotbar .durb').length,
      barBox: r && { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      slotBox: { x: Math.round(sr.x), y: Math.round(sr.y), w: Math.round(sr.width), h: Math.round(sr.height) },
      display: cs && cs.display, pos: cs && cs.position, bg: cs && cs.backgroundColor,
      inner: s0.innerHTML.slice(0, 220),
      slotPos: getComputedStyle(s0).position,
    };
  })));
  await p.screenshot({ path: '/tmp/t/shots/dur_zoom.png', clip: { x: 300, y: 560, width: 500, height: 140 } });
  await b.close();
})();

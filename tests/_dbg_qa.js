const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 900, height: 600 } });
  p.setDefaultTimeout(180000);
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 180000 });
  await p.click('#btnPlay'); await p.click('#ngStart');
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(800);
  await p.evaluate(() => {
    window.__log = [];
    const orig = window.selectSlot;
    window.selectSlot = (i) => { window.__log.push(['sel', i, 'qa.slot0=' + QA.slot0, 'state=' + Game.state]); return orig(i); };
    Game.slot = 0;
  });
  for (const k of ['2', '0', '2', '6']) { await p.keyboard.press(k); await p.waitForTimeout(150); }
  await p.waitForTimeout(400);
  console.log(JSON.stringify(await p.evaluate(() => ({ log: window.__log, slot: Game.slot, slot0: QA.slot0, qa: QA.on }))));
  await b.close();
})();

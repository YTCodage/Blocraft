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
  console.log(JSON.stringify(await p.evaluate(() => {
    const trace = [];
    const origUnlock = QA.unlock.bind(QA);
    QA.unlock = (q) => { trace.push(['unlock', Game.slot, QA.slot0]); const r = origUnlock(q); trace.push(['afterUnlock', Game.slot]); return r; };
    const origSel = window.selectSlot || selectSlot;
    Game.slot = 0;
    for (const d of ['2','0','2','6']) {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit' + d, key: d, bubbles: true }));
      trace.push(['after' + d, Game.slot, JSON.stringify(QA.seq)]);
    }
    return { trace, slot: Game.slot, on: QA.on };
  })));
  await b.close();
})();

const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1100, height: 700 } });
  p.setDefaultTimeout(180000);
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 180000 });
  await p.click('#btnPlay'); await p.click('#ngStart');
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(800);
  await p.evaluate(() => { Game.slot = 0; selectSlot(0); });
  const before = await p.evaluate(() => Game.slot);
  for (const k of ['2', '0', '2', '6']) { await p.keyboard.press(k); await p.waitForTimeout(120); }
  await p.waitForTimeout(500);
  const after = await p.evaluate(() => ({ slot: Game.slot, qa: QA.on, panel: !document.getElementById('qa').classList.contains('hidden') }));
  await p.screenshot({ path: '/tmp/t/shots/qa_slot.png' });
  // touches : rebind + alias + unicité
  const keys = await p.evaluate(() => {
    Keys.set('forward', 'KeyI');
    const fwd = Keys.map.forward.slice();
    const usedElsewhere = Object.keys(Keys.map).filter(k => k !== 'forward' && Keys.map[k].includes('KeyI'));
    const inv = Keys.map.inventory.slice();
    Keys.reset();
    return { fwd, usedElsewhere, inv, afterReset: Keys.map.forward.slice() };
  });
  console.log(JSON.stringify({ before, after, keys, errs }));
  await b.close();
})();

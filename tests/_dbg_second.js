const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 900, height: 600 } });
  p.setDefaultTimeout(180000);
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  p.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text().slice(0, 300)); });
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 180000 });
  await p.click('#btnPlay'); await p.fill('#ngName', 'Alpha'); await p.click('#ngStart');
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(1000);
  console.log('A ok', await p.evaluate(() => Saves.currentName));
  await p.evaluate(() => { openPause(); });
  await p.waitForTimeout(500);
  await p.click('#btnNew2');
  await p.waitForTimeout(500);
  console.log('dialog', await p.evaluate(() => !document.getElementById('newgame').classList.contains('hidden')));
  await p.fill('#ngName', 'Bravo');
  await p.click('#ngStart');
  for (let i = 0; i < 10; i++) {
    await p.waitForTimeout(3000);
    const st = await p.evaluate(() => ({ s: Game.state, busy: busyLoading, name: Saves.currentName, prog: (document.getElementById('lsPct')||{}).textContent }));
    console.log(i, JSON.stringify(st));
    if (st.s === 'playing') break;
  }
  await b.close();
})();

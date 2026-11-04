const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  p.setDefaultTimeout(180000);
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  p.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text().slice(0,200)); });
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 180000 });
  await p.evaluate(() => { Game.mode = 'creative'; document.querySelector('#btnPlay').click(); document.querySelector('#ngStart').click(); });
  for (let i = 0; i < 12; i++) {
    await p.waitForTimeout(3000);
    const st = await p.evaluate(() => ({ s: Game.state, busy: typeof busyLoading !== 'undefined' ? busyLoading : '?', overlay: [...document.querySelectorAll('.overlay')].filter(o => !o.classList.contains('hidden')).map(o => o.id) }));
    console.log(i, JSON.stringify(st));
    if (st.s === 'playing') break;
  }
  await b.close();
})();

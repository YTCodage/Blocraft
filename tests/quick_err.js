const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGE ' + e.message + ' @' + (e.stack || '').split('\n')[1]));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForTimeout(12000);
  console.log('state', await p.evaluate(() => (typeof Game === 'undefined') ? 'noGame' : Game.state));
  console.log('errs', JSON.stringify(errs.slice(0, 5)));
  await b.close();
})();

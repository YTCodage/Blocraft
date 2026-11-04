const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 900, height: 760 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });
  await p.evaluate(() => {
    const ids = [100,101,102,152,145,147,103,104,158,159,105,106,160,161,107,108,153,144,146,121,155,156,157,117,140,141,162,109,154];
    const box = document.createElement('div');
    box.id = 'icontest';
    box.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#c6c6c6;display:flex;flex-wrap:wrap;gap:6px;padding:10px;align-content:flex-start';
    for (const id of ids) {
      const cell = document.createElement('div');
      cell.style.cssText = 'width:76px;height:76px;background:#8b8b8b;border:2px solid #6f6f6f;display:flex;align-items:center;justify-content:center';
      cell.appendChild(drawItemIcon(id, 128));
      box.appendChild(cell);
    }
    document.body.appendChild(box);
  });
  await p.waitForTimeout(800);
  await p.screenshot({ path: '/tmp/t/shots/icons.png' });
  console.log('ERR', JSON.stringify(errs));
  await b.close();
})();

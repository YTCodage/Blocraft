const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });
  const data = await p.evaluate(() => {
    const ids = [];
    for (let i = 1; i < BLOCKS.length; i++) if (BLOCKS[i] && BLOCKS[i].name) ids.push(i);
    const c = document.createElement('canvas');
    const n = 14, S = 86;
    c.width = n * S; c.height = Math.ceil(ids.length / n) * S;
    const g = c.getContext('2d');
    g.fillStyle = '#101720'; g.fillRect(0, 0, c.width, c.height);
    ids.forEach((id, i) => {
      const icon = drawBlockIcon(id, 76);
      g.drawImage(icon, (i % n) * S + 5, Math.floor(i / n) * S + 5);
    });
    return c.toDataURL('image/png');
  });
  fs.writeFileSync('/tmp/t/shots/tex_all.png', Buffer.from(data.split(',')[1], 'base64'));
  console.log('errs', errs.slice(0, 3));
  await b.close();
})();

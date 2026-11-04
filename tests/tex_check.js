const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });
  const data = await p.evaluate(() => {
    const list = [B.COAL, B.IRON, B.GOLD, B.DIAMOND, B.EMERALD, B.LAPIS_ORE, B.REDSTONE_ORE, B.COPPER_ORE,
      B.IRON_BLOCK, B.GOLD_BLOCK, B.DIAMOND_BLOCK, B.EMERALD_BLOCK, B.COPPER_BLOCK, B.COAL_BLOCK, B.NETHERITE_BLOCK,
      B.PUMPKIN, B.PUMPKIN_CARVED, B.PUMPKIN_LANTERN];
    const c = document.createElement('canvas');
    const n = 6, S = 110;
    c.width = n * S; c.height = Math.ceil(list.length / n) * (S + 14);
    const g = c.getContext('2d');
    g.fillStyle = '#141b24'; g.fillRect(0, 0, c.width, c.height);
    g.font = '11px sans-serif'; g.fillStyle = '#cfe8d2'; g.textAlign = 'center';
    list.forEach((id, i) => {
      const icon = drawBlockIcon(id, 96);
      const x = (i % n) * S, y = Math.floor(i / n) * (S + 14);
      g.drawImage(icon, x + 7, y + 4);
      g.fillText(itemName(id), x + S / 2, y + S + 6);
    });
    return c.toDataURL('image/png');
  });
  fs.writeFileSync('/tmp/t/shots/tex_ores.png', Buffer.from(data.split(',')[1], 'base64'));
  console.log('craft', await p.evaluate(() => Crafting.recipes.filter(r => /Citrouille|Lanterne/.test(itemName(r.out[0]))).map(r => [itemName(r.out[0]), r.in.map(i => itemName(i[0]) + '×' + i[1]).join(' + ')])));
  console.log('errs', errs.slice(0, 3));
  await b.close();
})();

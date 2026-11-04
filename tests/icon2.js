const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGE ' + e.message));
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });

  // planche d'icônes : blocs + objets, avec les nouveaux blocs
  const data = await p.evaluate(() => {
    const list = [B.GRASS, B.STONE, B.LOG, B.PLANKS, B.WOOL_RED, B.WOOL_BLUE, B.CONCRETE_CYAN,
      B.CONCRETE_YELLOW, B.DEEPSLATE_DIAMOND, B.DEEPSLATE_GOLD, B.AMETHYST, B.HONEYCOMB,
      B.NETHER_BRICK_RED, B.WARPED_PLANKS, B.OXIDIZED_COPPER, I.WPICK, I.SPICK, I.IRON_INGOT,
      I.DIAMONDGEM, I.EMERALDGEM, I.BREAD, I.ENDER_EYE];
    const c = document.createElement('canvas');
    const n = 8, S = 96;
    c.width = n * S; c.height = Math.ceil(list.length / n) * S;
    const g = c.getContext('2d');
    g.fillStyle = '#1b2430'; g.fillRect(0, 0, c.width, c.height);
    list.forEach((id, i) => {
      const icon = id >= 100 && !isExtraBlock(id) ? drawItemIcon(id, 84) : drawBlockIcon(id, 84);
      g.drawImage(icon, (i % n) * S + 6, Math.floor(i / n) * S + 6);
    });
    return c.toDataURL('image/png');
  });
  require('fs').writeFileSync('/tmp/t/shots/icons_sheet.png', Buffer.from(data.split(',')[1], 'base64'));

  await p.evaluate(() => { Game.mode = 'creative'; document.querySelector('#btnPlay').click(); document.querySelector('#ngStart').click(); });
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(1200);
  await p.evaluate(() => openInventory('blocks'));
  await p.waitForTimeout(1000);
  await p.screenshot({ path: '/tmp/t/shots/blocks1.png' });
  console.log('errors', JSON.stringify(errs.slice(0, 4)));
  await b.close();
})();

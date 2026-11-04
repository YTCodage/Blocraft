const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1360, height: 860 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGE ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file:///home/user/blocraft.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => typeof Game !== 'undefined' && Game.state === 'menu', null, { timeout: 120000 });
  await p.waitForTimeout(1200);
  await p.screenshot({ path: '/tmp/t/shots/menu_final.png' });
  console.log('menu', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.worldBtn')].map(b => [b.dataset.world, b.disabled]))));
  await p.evaluate(() => { document.querySelector('#btnPlay').click(); document.querySelector('#ngStart').click(); });
  await p.waitForFunction(() => Game.state === 'playing', null, { timeout: 180000 });
  await p.waitForTimeout(3000);
  // pause
  await p.keyboard.press('Escape');
  await p.waitForTimeout(900);
  await p.screenshot({ path: '/tmp/t/shots/pause2.png' });
  console.log('pause kb', await p.evaluate(() => document.querySelectorAll('#kbList .kbRow').length));
  await p.evaluate(() => document.querySelector('#btnResume').click());
  await p.waitForTimeout(600);
  // inventaire + établi + four
  await p.evaluate(() => { Game.mode='survival'; Game.inv.add(B.PLANKS, 32); Game.inv.add(B.COBBLE, 64); Game.inv.add(I.IRON_INGOT, 12); Game.inv.add(I.COAL, 8); Game.inv.add(B.LOG, 8); });
  await p.evaluate(() => openInventory());
  await p.waitForTimeout(500);
  await p.screenshot({ path: '/tmp/t/shots/inv2.png' });
  await p.evaluate(() => document.querySelector('.mcTab[data-tab="furnace"]').click());
  await p.waitForTimeout(400);
  await p.screenshot({ path: '/tmp/t/shots/furnace2.png' });
  const smelt = await p.evaluate(() => {
    const before = Game.inv.count(B.GLASS);
    const rows = [...document.querySelectorAll('#furnaceList .craftRow')];
    const r = rows.find(x => x.textContent.includes('Sable'));
    const btn = r.querySelector('button');
    const dis = btn.disabled;
    btn.click();
    return [dis, before, Game.inv.count(B.GLASS)];
  });
  console.log('smelt sand', JSON.stringify(smelt));
  await p.evaluate(() => closeInventory(true));
  await p.waitForTimeout(400);
  // nether
  await p.evaluate(() => Dimensions.go('nether', { x: 6.5, y: 66.1, z: 15.5 }));
  await p.waitForFunction(() => Dimensions.current === 'nether' && !Dimensions.busy, null, { timeout: 120000 });
  await p.waitForTimeout(5000);
  await p.evaluate(() => { Game.mode = 'survival'; Mobs.spawnT = 0; });
  await p.waitForTimeout(6000);
  await p.screenshot({ path: '/tmp/t/shots/nether2.png' });
  console.log('nether', JSON.stringify(await p.evaluate(() => ({ mobs: Mobs.list.map(m => m.type), pos: Player.pos.map(v => Math.round(v)), hp: Survival.hp }))));
  // forteresse proche ?
  console.log('strongholds', JSON.stringify(await p.evaluate(() => nearbySites(0, 0, 500, 'overworld').filter(s => s.type === 'stronghold').map(s => [s.x, s.z, s.dist]))));
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
